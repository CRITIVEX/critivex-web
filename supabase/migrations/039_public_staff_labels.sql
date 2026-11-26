begin;
create or replace function public.player_staff_label(player uuid)
returns text language sql stable security definer set search_path='' as $$
 select case s.role when 'admin' then 'COMMUNITY ADMIN' when 'moderator' then 'COMMUNITY MOD' else null end
 from public.staff_roles s join public.profiles p on p.user_id=s.user_id
 where s.user_id=player and p.is_public and p.username is not null
 and not public.social_blocked(p.user_id);
$$;
revoke all on function public.player_staff_label(uuid) from public;
grant execute on function public.player_staff_label(uuid) to anon, authenticated;
notify pgrst,'reload schema';
commit;
