## Unreleased

### 2026-08-12 — App shell + Supabase auth
Wired the real Supabase client to the live project, added the pre-login
screen (Google/GitHub sign-in), the 6-tab bottom nav with routed pages for
Dashboard/Calendar/Log/Analytics/Groups/Settings (placeholders for now),
and a route guard so every tab requires sign-in. Invite links
(`?invite=CODE`, with or without a path) now redirect to `/groups` with
the code preserved for the Groups feature to pick up later. No bet/group
data logic yet — this is pure app-shell infrastructure everything else
plugs into.
