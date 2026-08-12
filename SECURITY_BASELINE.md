# Security baseline — sportsbet

Walked against the 18-item checklist before any feature code is written.
Stack: React SPA (Vite) talking directly to Supabase (Postgres, Auth,
Storage) with the anon key — no custom backend server. Reusing the live
Supabase project (real user data), per `ARCHITECTURE.md`.

Legend: **Pass** (already true, keep it that way) / **Rule** (no current
violation, but a rule to hold the line as features get built) / **Open**
(a real gap or decision, needs action or an explicit choice).

## 1. Secrets never in code or client-exposed
**Pass.** `.env.example` only lists `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` — both are meant to be public. No service-role
key exists anywhere in this repo, and `CLAUDE.md` already bans introducing
one. Every privileged operation goes through `SECURITY DEFINER` Postgres
functions instead of an admin client.

## 2. Every table has an explicit access rule
**Pass, carried forward.** `bets`, `groups`, `group_members`, `profiles`,
`storage.objects` all have RLS already applied on the live project (see
`MIGRATION_EXTRACTION.md`). The first `supabase db pull` migration must
capture these byte-for-byte, not "clean them up" — especially
`group_members` having **no** client INSERT policy, which is intentional.

## 3. Least privilege by default
**Pass by architecture.** Only the anon key is ever used client-side;
`auth.uid()`-scoped RLS does the rest. No feature in the UI inventory
needs an admin/service-role client.

## 4. No string-built queries
**Rule.** All data access goes through `supabase-js`'s query builder or
`.rpc()` calls to the existing typed SQL functions — never a raw SQL
string built by concatenating user input. There is no current violation
because there's no feature code yet; hold this line in `feature-planner`
review for every new query.

## 5. User-facing errors don't leak internals
**Rule, one pattern to preserve.** `join_group_by_invite_code` already
raises a generic `'Invalid invite code'` regardless of the real reason —
keep that pattern. New features must catch Supabase/Postgres errors and
show a friendly message, logging the raw error to the console (dev) only
— never surface a raw constraint name or Postgres error string in the UI.

## 6. Dependencies checked
**Pass.** `npm audit` reports 0 vulnerabilities across the current
dependency set (React 19, Vite 8, Tailwind 4, `@supabase/supabase-js`,
`react-router-dom`, testing libs, oxlint, husky) — all mainstream,
actively maintained packages. Re-run `npm audit` before adding any new
dependency, not just at setup time.

## 7. Destructive actions get explicit confirmation
**Rule, already scoped in the UI inventory.** Settings → Data Management
"reset all data" is documented as requiring a confirmation dialog — keep
it. Same standard applies to: group deletion (owner), kicking a member,
and (per `CLAUDE.md`) any migration or schema change against the live
database — never a silent side effect of an unrelated action.

## 8. Browser never holds third-party secrets directly
**Pass, currently.** No paid/third-party API is called from this app —
the AI Coach is local rule-based logic (fixed thresholds, no LLM call, per
`MIGRATION_EXTRACTION.md` §8), and PDF/JSON export is client-side
generation from already-fetched data. **Open flag for later:** if the AI
Coach or export features ever grow into an actual LLM call, that call must
be proxied through a server function holding the key — never called
directly from the browser with an embedded key. No action needed today;
revisit if/when that feature is proposed.

## 9. Session handling
**Open, by design of the stack — mitigate, don't "fix."** `supabase-js`'s
default browser client stores the session token in `localStorage`, not an
`HttpOnly` cookie — a known tradeoff of using Supabase directly from an
SPA with no custom backend, not a bug introduced here. Given that
tradeoff is accepted (it's what enables the "reuse the existing project,
frontend-only rebuild" decision in `ARCHITECTURE.md`), the mitigation is:
**rigorously avoid XSS**, since a token-stealing script is the main threat
this exposes. Concretely — never render unescaped user input as HTML
(bet `pick` text, group names, display names are all user-authored and
render as plain text, never `dangerouslySetInnerHTML`), and call
`supabase.auth.signOut()` on sign-out so the session is actually
invalidated, not just hidden from the UI.

## 10. CSRF
**Pass, by architecture.** Supabase API calls are authenticated via a
Bearer token in the `Authorization` header, not an ambient cookie —
classic CSRF (a foreign site's form silently submitting a request) doesn't
apply the same way here. No action needed.

## 11. Rate limiting
**Open — worth a decision.** `join_group_by_invite_code` accepts an
8-hex-character invite code (~32 bits of entropy, confirmed from the live
`groups` data) and is callable by any authenticated user. Supabase applies
some platform-level rate limiting to Auth endpoints, but this is a custom
RPC — worth confirming in the Supabase dashboard whether RPC calls get any
throttling, or whether repeated wrong-code guesses against
`join_group_by_invite_code` are effectively unlimited. Two independent
mitigations, either is reasonable: lengthen the invite code, or add a
simple per-user attempt cap. Flagging as a decision for you rather than
picking silently, since it trades off group-join convenience against
brute-force resistance.

## 12. HTTPS + security headers
**Deferred to hosting setup, not skipped.** No hosting config exists yet
(original was deployed on Vercel, which enforces HTTPS by default). When
hosting is set up: add a `Content-Security-Policy`, `X-Frame-Options`, and
`Strict-Transport-Security` via the host's headers config (e.g.
`vercel.json`). Tracked here so it isn't forgotten once deployment is
actually configured — not an action item today.

## 13. SSRF
**N/A.** No feature fetches a user-supplied URL server-side (no link
preview or similar). Revisit only if such a feature is proposed.

## 14. CORS scoping
**N/A at this layer.** No custom API server exists; Supabase manages CORS
on its own endpoints. Revisit if a BFF/server function is ever added.

## 15. Atomic check-then-act
**Pass, already correct.** `join_group_by_invite_code` does the lookup and
`insert ... on conflict do nothing` inside one `SECURITY DEFINER`
function — atomic, not two separate client-side steps. Any future
"claim"-style feature (nothing currently planned) should follow the same
single-function pattern rather than a check-then-insert from the client.

## 16. File uploads verified by content, not filename
**Open — one gap worth closing during the Settings/avatar feature.** The
existing `storage.objects` RLS already restricts avatar writes to the
uploader's own folder (`(storage.foldername(name))[1] = auth.uid()`),
which is the important access-control half. Not yet confirmed: whether
the upload path validates actual file content (not just a `.jpg`/`.png`
extension) and caps file size before upload. Add both when building the
avatar-upload component — Supabase Storage bucket config can enforce a
MIME-type allowlist and size limit server-side, which is stronger than a
client-only check.

## 17. Safe logging + tested backups
**Open — a decision to make now that data is real.** No custom
server-side logging exists (pure SPA + Supabase managed services), so the
concrete rule is: never `console.log` a session/token object or full
auth response in shipped code. Backups: confirm whether Point-in-Time
Recovery / scheduled backups are enabled on the live Supabase project's
plan tier, and if so, do an actual test restore at some point rather than
assuming it works — this project has real bet/group history now, per
`MIGRATION_EXTRACTION.md`'s own note that it's actively used.

## 18. Payment webhook signatures
**N/A.** No payment processing in this app.

---

## Summary — action items carried into `CLAUDE.md` / feature work

1. Never render user-authored text (`pick`, group `name`, `display_name`)
   as raw HTML — plain text only, no `dangerouslySetInnerHTML`.
2. Catch and rewrite Supabase/Postgres errors before showing them to a
   user; never surface raw constraint/column names.
3. Every new Supabase query goes through the query builder or `.rpc()` —
   never a hand-built SQL string.
4. Avatar upload: enforce a MIME-type allowlist + size cap at the Storage
   bucket config, not just client-side filename checking.
5. Decide invite-code length/rate-limiting before the Groups "join by
   code" feature ships (open question above — flagged, not resolved).
6. Confirm Point-in-Time Recovery / backup status on the live Supabase
   project, and schedule an actual test restore.
7. Add CSP/HSTS/X-Frame-Options headers when hosting is configured.
