begin;
create table public.player_presence(user_id uuid primary key references auth.users(id) on delete cascade,mode text not null default 'invisible' check(mode in ('online','away','offline','invisible')),last_seen timestamptz not null default now(),last_active timestamptz not null default now());
alter table public.player_presence enable row level security;
revoke all on public.player_presence from anon,authenticated;
create function public.presence_heartbeat(active boolean,requested_mode text default null) returns text language plpgsql security definer set search_path='' as $$
declare result text;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if requested_mode is not null and requested_mode not in ('online','away','offline','invisible') then raise exception 'Invalid status'; end if;
 insert into public.player_presence(user_id,mode) values(auth.uid(),coalesce(requested_mode,'invisible'))
 on conflict(user_id) do update set mode=coalesce(requested_mode,player_presence.mode),last_seen=now(),last_active=case when active then now() else player_presence.last_active end
 returning mode into result;
 return result;
end $$;
create function public.player_status(player uuid) returns text language sql stable security definer set search_path='' as $$
 select coalesce((select case when s.mode in ('invisible','offline') or s.last_seen<now()-interval '3 minutes' then 'offline' when s.mode='away' or s.last_active<now()-interval '5 minutes' then 'away' else 'online' end from public.player_presence s join public.profiles p on p.user_id=s.user_id where s.user_id=player and p.is_public and not public.social_blocked(player)),'offline');
$$;
revoke all on function public.presence_heartbeat(boolean,text) from public,anon;
grant execute on function public.presence_heartbeat(boolean,text) to authenticated;
revoke all on function public.player_status(uuid) from public,anon;
grant execute on function public.player_status(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
