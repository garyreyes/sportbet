--
-- PostgreSQL database dump
--

\restrict I2NsuoxuVhWPe2P6lJbafllNkk6qLRQZK0dLSBz7CXc6A4GoiJDEIPS1UwhGX7u

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: calculate_bet_profit(numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_bet_profit(p_odds numeric, p_stake numeric, p_status text) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    AS $$
  select case
    when p_status = 'win' then p_stake * (p_odds - 1)
    when p_status = 'loss' then -p_stake
    else 0
  end;
$$;


--
-- Name: get_group_leaderboard(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_group_leaderboard(p_group_id uuid) RETURNS TABLE(member_id uuid, full_name text, avatar_url text, currency text, overall_profit numeric, week_profit numeric, month_profit numeric, today_profit numeric, win_rate numeric)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_caller uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Manila')::date;
  v_week_start date := v_today - interval '6 days';
  v_month_start date := v_today - interval '29 days';
begin
  if not public.is_group_member(p_group_id) then
    raise exception 'Not a member of this group';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.currency,
    case when p.hide_overall_pnl and p.id <> v_caller then null else
      coalesce(sum(public.calculate_bet_profit(b.odds, b.stake, b.status))
        filter (where b.status <> 'pending'), 0)
    end,
    case when p.hide_week_pnl and p.id <> v_caller then null else
      coalesce(sum(public.calculate_bet_profit(b.odds, b.stake, b.status))
        filter (where b.status <> 'pending' and b.date >= v_week_start), 0)
    end,
    case when p.hide_month_pnl and p.id <> v_caller then null else
      coalesce(sum(public.calculate_bet_profit(b.odds, b.stake, b.status))
        filter (where b.status <> 'pending' and b.date >= v_month_start), 0)
    end,
    case when p.hide_today_pnl and p.id <> v_caller then null else
      coalesce(sum(public.calculate_bet_profit(b.odds, b.stake, b.status))
        filter (where b.status <> 'pending' and b.date = v_today), 0)
    end,
    case when p.hide_win_rate and p.id <> v_caller then null else
      round(
        100.0 * count(*) filter (where b.status = 'win')
          / nullif(count(*) filter (where b.status in ('win', 'loss')), 0),
        1
      )
    end
  from public.group_members gm
  join public.profiles p on p.id = gm.user_id
  left join public.bets b on b.user_id = p.id
  where gm.group_id = p_group_id
  group by
    p.id, p.full_name, p.avatar_url, p.currency,
    p.hide_overall_pnl, p.hide_week_pnl, p.hide_month_pnl,
    p.hide_today_pnl, p.hide_win_rate;
end;
$$;


--
-- Name: handle_new_group(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_group() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.owner_id);
  return new;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'user_name',
      new.email
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


--
-- Name: is_group_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_group_member(p_group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;


--
-- Name: is_group_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_group_owner(p_group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.groups
    where id = p_group_id and owner_id = auth.uid()
  );
$$;


--
-- Name: join_group_by_invite_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.join_group_by_invite_code(p_invite_code text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_group_id uuid;
begin
  select id into v_group_id
  from public.groups
  where invite_code = p_invite_code;

  if v_group_id is null then
    raise exception 'Invalid invite code';
  end if;

  -- Re-joining a group you're already in is a safe no-op, not an error.
  insert into public.group_members (group_id, user_id)
  values (v_group_id, auth.uid())
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;


--
-- Name: shares_group_with(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.shares_group_with(p_other_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.group_members gm1
    join public.group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid() and gm2.user_id = p_other_user_id
  );
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sport text NOT NULL,
    league text DEFAULT ''::text NOT NULL,
    pick text,
    odds numeric NOT NULL,
    stake numeric NOT NULL,
    status text NOT NULL,
    date date NOT NULL,
    legs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bets_odds_check CHECK ((odds > (0)::numeric)),
    CONSTRAINT bets_stake_check CHECK ((stake > (0)::numeric)),
    CONSTRAINT bets_status_check CHECK ((status = ANY (ARRAY['win'::text, 'loss'::text, 'push'::text, 'pending'::text])))
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    invite_code text DEFAULT substr(md5((random())::text), 1, 8) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    email text,
    currency text DEFAULT '$'::text NOT NULL,
    avatar_url text,
    theme_main text DEFAULT '#0f172a'::text NOT NULL,
    theme_accent text DEFAULT '#22c55e'::text NOT NULL,
    hide_overall_pnl boolean DEFAULT false NOT NULL,
    hide_week_pnl boolean DEFAULT false NOT NULL,
    hide_month_pnl boolean DEFAULT false NOT NULL,
    hide_today_pnl boolean DEFAULT false NOT NULL,
    hide_win_rate boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bets bets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: groups groups_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_invite_code_key UNIQUE (invite_code);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: bets_user_id_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bets_user_id_date_idx ON public.bets USING btree (user_id, date DESC, created_at DESC);


--
-- Name: groups on_group_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_group_created AFTER INSERT ON public.groups FOR EACH ROW EXECUTE FUNCTION public.handle_new_group();


--
-- Name: bets bets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

--
-- Name: bets bets_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bets_delete_own ON public.bets FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: bets bets_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bets_insert_own ON public.bets FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: bets bets_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bets_select_own ON public.bets FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: bets bets_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bets_update_own ON public.bets FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members group_members_delete_owner_kick; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY group_members_delete_owner_kick ON public.group_members FOR DELETE USING ((public.is_group_owner(group_id) AND (user_id <> auth.uid())));


--
-- Name: group_members group_members_delete_self_leave; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY group_members_delete_self_leave ON public.group_members FOR DELETE USING (((user_id = auth.uid()) AND (NOT public.is_group_owner(group_id))));


--
-- Name: group_members group_members_select_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY group_members_select_member ON public.group_members FOR SELECT USING (public.is_group_member(group_id));


--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

--
-- Name: groups groups_delete_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY groups_delete_owner ON public.groups FOR DELETE USING (public.is_group_owner(id));


--
-- Name: groups groups_insert_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY groups_insert_owner ON public.groups FOR INSERT WITH CHECK ((owner_id = auth.uid()));


--
-- Name: groups groups_select_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY groups_select_member ON public.groups FOR SELECT USING (public.is_group_member(id));


--
-- Name: groups groups_update_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY groups_update_owner ON public.groups FOR UPDATE USING (public.is_group_owner(id)) WITH CHECK (public.is_group_owner(id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT WITH CHECK ((id = auth.uid()));


--
-- Name: profiles profiles_select_self_or_groupmate; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_self_or_groupmate ON public.profiles FOR SELECT USING (((id = auth.uid()) OR public.shares_group_with(id)));


--
-- Name: profiles profiles_update_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));


--
-- PostgreSQL database dump complete
--

\unrestrict I2NsuoxuVhWPe2P6lJbafllNkk6qLRQZK0dLSBz7CXc6A4GoiJDEIPS1UwhGX7u

