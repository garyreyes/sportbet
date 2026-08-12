# Incident: `createGroup` always failed with an RLS error

**Date:** 2026-08-13
**Symptom:** Every attempt to create a group in the app failed with
"Could not create that group. Please try again." The browser console
showed:

```
POST .../rest/v1/groups?select=* 403 (Forbidden)
{ code: '42501', message: 'new row violates row-level security policy for table "groups"' }
```

## Root cause

`createGroup` (in `src/features/groups/api.ts`) does:

```ts
supabase.from('groups').insert({ name, owner_id: userId }).select().single()
```

PostgREST turns `.insert().select()` into a single `INSERT ... RETURNING *`
statement. For Postgres to return a row from `RETURNING`, that row must
also pass a `SELECT` policy on the table — it's not enough for the `INSERT`
policy to allow the write.

`groups_select_member`'s condition was `is_group_member(id)`. The only
thing that makes the group's owner a member of their own new group is the
`on_group_created` trigger (`AFTER INSERT ON groups`), which inserts a row
into `group_members`. That trigger's effect isn't visible to the
`RETURNING` clause's `SELECT`-policy check for the *same* statement — so
the `INSERT` itself succeeded, but Postgres couldn't legally hand the new
row back to the client, and raised the row-level-security error instead
of silently omitting it (this is documented Postgres behavior for
`INSERT ... RETURNING`, not a bug in Postgres itself).

Every RLS policy involved (`groups_insert_owner`, roles, grants) was
individually correct in isolation. The bug only showed up because two
separately-correct pieces — an `INSERT`-time trigger and a `SELECT`
policy that depended on that trigger's side effect — had an ordering
dependency that RLS's `RETURNING` check doesn't wait for.

## How we found it (the slow way)

We spent a long debugging pass assuming the problem was in
`groups_insert_owner`'s `WITH CHECK (owner_id = auth.uid())`, because that
is the policy PostgREST's error is most naturally associated with, and it
also *looked* like the natural suspect for a `POST .../groups` 403.
Every test — decoding the JWT, confirming the session, checking grants,
even replacing that policy's check with a literal `true` inside a rolled
back transaction — still failed with the identical error, which was the
signal that we were fixing the wrong policy. Only after that did we
check `groups_select_member` specifically.

**Lesson for next time:** when an `INSERT` produces an RLS error but the
`INSERT` policy's condition checks out under direct testing (e.g.
`WITH CHECK (true)` still fails), stop looking at the `INSERT` policy —
check the table's `SELECT` policy next. Client code using
`.insert().select()` (or any ORM's "insert and return the row" helper)
always needs *both* to pass.

## The fix

```sql
ALTER POLICY groups_select_member ON public.groups
  USING (public.is_group_member(id) OR owner_id = auth.uid());
```

(`supabase/migrations/20260813120000_groups_select_owner_fix.sql`)

Lets the owner see their own group directly, without depending on the
trigger's timing. Purely additive — it only widens visibility to
something that was already supposed to be true (an owner can see their
own group), so there's no security regression.

## How to prevent this class of bug going forward

Any time a new table pairs an `AFTER INSERT` trigger that grants access
(adds a membership row, sets an owner flag, etc.) with a `SELECT` policy
that depends on that same access, and client code does
`insert().select()` on that table, check whether the `SELECT` policy can
succeed **without** the trigger having run yet. If not, either:

1. Give the `SELECT` policy a direct fallback condition (e.g. "or you're
   the one who created this row"), as done here, or
2. Have the client `insert()` without `.select()`, and fetch the row in
   a separate follow-up request after the first request's transaction
   has committed (the trigger's effect will be visible by then) — more
   round-trips, only worth it if a direct-fallback `SELECT` condition
   genuinely isn't expressible.

Option 1 is preferred where it's expressible, since it's one migration
and no extra network round-trip.
