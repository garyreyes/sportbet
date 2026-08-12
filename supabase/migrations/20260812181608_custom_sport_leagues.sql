-- Phase 2c: lets a user add a custom sport/league not in the built-in
-- list. Per-user, same ownership pattern as bets.

CREATE TABLE public.custom_sport_leagues (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sport text NOT NULL,
    league text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_sport_leagues_unique UNIQUE (user_id, sport, league)
);

ALTER TABLE public.custom_sport_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_sport_leagues_select_own ON public.custom_sport_leagues
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY custom_sport_leagues_insert_own ON public.custom_sport_leagues
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY custom_sport_leagues_delete_own ON public.custom_sport_leagues
    FOR DELETE USING (user_id = auth.uid());
