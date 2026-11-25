begin;
grant select on public.profiles to anon,authenticated;
grant insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.player_ratings to authenticated;
commit;
