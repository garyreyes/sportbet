-- Phase 7a: display-format preferences. Pure display-layer settings —
-- odds stay decimal in bets.odds regardless of odds_format; this just
-- records how the user wants them (and dates) rendered client-side.

ALTER TABLE public.profiles
  ADD COLUMN odds_format text DEFAULT 'decimal'::text NOT NULL,
  ADD COLUMN date_format text DEFAULT 'YYYY-MM-DD'::text NOT NULL;
