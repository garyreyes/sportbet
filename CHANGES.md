## Unreleased

### 2026-08-12 — Schema migration baseline + drift correction
Captured the live Supabase schema as the first two tracked migrations
(`supabase/migrations/`), working around a missing Docker install by
connecting directly with `pg_dump` through Supabase's IPv4 pooler. This
surfaced real, intentional schema drift since `MIGRATION_EXTRACTION.md`
was written: `bets` no longer has `confidence`/`prep_time_mins`/
`num_legs`; `profiles` was restructured (`full_name`/`email` instead of
`username`/`display_name`, new `theme_main`/`theme_accent` columns,
simplified privacy toggles); `get_group_leaderboard` now uses rolling
7/30-day windows instead of calendar weeks, which resolves the doc's
"three week definitions" problem on its own. `ARCHITECTURE.md` updated to
match the live schema as ground truth. Also found (not fixed): duplicate
avatar storage RLS policies, functionally harmless but redundant.

### 2026-08-12 — App shell + Supabase auth
Wired the real Supabase client to the live project, added the pre-login
screen (Google/GitHub sign-in), the 6-tab bottom nav with routed pages for
Dashboard/Calendar/Log/Analytics/Groups/Settings (placeholders for now),
and a route guard so every tab requires sign-in. Invite links
(`?invite=CODE`, with or without a path) now redirect to `/groups` with
the code preserved for the Groups feature to pick up later. No bet/group
data logic yet — this is pure app-shell infrastructure everything else
plugs into.
