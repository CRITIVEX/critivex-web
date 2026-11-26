begin;
create table public.player_links(
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 platform text not null check(platform in ('twitch','youtube','discord','tiktok','instagram','x','steam','website')),
 url text not null check(length(url)<=500 and url ~ '^https://[A-Za-z0-9][^[:space:]]*$'),
 primary key(user_id,platform)
);
alter table public.player_links enable row level security;
create policy player_links_read on public.player_links for select using(user_id=auth.uid() or (exists(select 1 from public.profiles p where p.user_id=player_links.user_id and p.is_public) and not public.social_blocked(user_id)));
create policy player_links_insert on public.player_links for insert to authenticated with check(user_id=auth.uid());
create policy player_links_update on public.player_links for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy player_links_delete on public.player_links for delete to authenticated using(user_id=auth.uid());
revoke all on public.player_links from anon,authenticated;
grant select on public.player_links to anon,authenticated;
grant insert(platform,url),update(url),delete on public.player_links to authenticated;
notify pgrst,'reload schema';
commit;
