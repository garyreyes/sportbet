-- Phase 6a: lets the Join/Create card show a group's name before the user
-- confirms joining. groups_select_member's RLS blocks a plain SELECT for a
-- non-member, so this is a narrow SECURITY DEFINER preview — name only, no
-- membership check, since a group's name isn't sensitive.

CREATE FUNCTION public.get_group_preview_by_invite_code(p_invite_code text)
RETURNS TABLE(id uuid, name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
begin
  return query
  select g.id, g.name from public.groups g where g.invite_code = p_invite_code;
end;
$$;
