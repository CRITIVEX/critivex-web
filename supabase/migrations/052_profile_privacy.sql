begin;
create table public.player_privacy(user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,favourites boolean not null default true,links boolean not null default true,connections boolean not null default true,activity boolean not null default true,allow_follows boolean not null default true,allow_messages boolean not null default true);
alter table public.player_privacy enable row level security;
create policy privacy_owner on public.player_privacy for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
revoke all on public.player_privacy from anon,authenticated;
grant select on public.player_privacy to authenticated;
grant insert(favourites,links,connections,activity,allow_follows,allow_messages),update(favourites,links,connections,activity,allow_follows,allow_messages) on public.player_privacy to authenticated;
create function public.player_privacy_allows(player uuid,feature text) returns boolean language sql stable security definer set search_path='' as $$
select case when feature not in ('favourites','links','connections','activity','follows','messages') then false when player=auth.uid() then true else coalesce((select case feature when 'favourites' then favourites when 'links' then links when 'connections' then connections when 'activity' then activity when 'follows' then allow_follows when 'messages' then allow_messages end from public.player_privacy where user_id=player),true) end;
$$;
revoke all on function public.player_privacy_allows(uuid,text) from public;
grant execute on function public.player_privacy_allows(uuid,text) to anon,authenticated;
create policy privacy_favourites on public.player_favourites as restrictive for select using(public.player_privacy_allows(user_id,'favourites'));
create policy privacy_links on public.player_links as restrictive for select using(public.player_privacy_allows(user_id,'links'));
create policy privacy_connections on public.social_follows as restrictive for select using(follower_id=auth.uid() or following_id=auth.uid() or (public.player_privacy_allows(follower_id,'connections') and public.player_privacy_allows(following_id,'connections')));
create policy privacy_follow_insert on public.social_follows as restrictive for insert with check(public.player_privacy_allows(following_id,'follows'));
create policy privacy_message_insert on public.social_messages as restrictive for insert with check(public.player_privacy_allows(recipient_id,'messages'));
create or replace function public.player_status(player uuid) returns text language sql stable security definer set search_path='' as $$
select coalesce((select case when s.mode in ('invisible','offline') or s.last_seen<now()-interval '3 minutes' then 'offline' when s.mode='away' or s.last_active<now()-interval '5 minutes' then 'away' else 'online' end from public.player_presence s join public.profiles p on p.user_id=s.user_id where s.user_id=player and p.is_public and not public.social_blocked(player) and public.player_privacy_allows(player,'activity')),'offline');
$$;
notify pgrst,'reload schema';
commit;
