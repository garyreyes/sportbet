-- Phase 6 bugfix: createGroup does insert().select().single(), which
-- PostgREST turns into INSERT ... RETURNING *. Returning a row requires it
-- to also pass a SELECT policy, and groups_select_member only allowed
-- members in — but the owner isn't added to group_members until the
-- on_group_created AFTER INSERT trigger runs, whose effect isn't visible to
-- the RETURNING check for that same statement. Result: every group creation
-- failed with "new row violates row-level security policy for table
-- groups", even though the INSERT itself was valid. See
-- .impeccable-notes or ARCHITECTURE.md-adjacent docs for the full writeup.
--
-- Fix: let an owner see their own group directly, without depending on the
-- trigger's timing. Purely additive — widens visibility to something that
-- was already supposed to be true.

ALTER POLICY groups_select_member ON public.groups
  USING (public.is_group_member(id) OR owner_id = auth.uid());
