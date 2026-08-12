-- Phase 3a: Dashboard's Monthly Goal card needs a per-user target amount.
-- Existing profiles RLS (select self/groupmate, update self) already
-- covers this new column -- no policy changes needed.

ALTER TABLE public.profiles
    ADD COLUMN monthly_goal numeric DEFAULT 0 NOT NULL;
