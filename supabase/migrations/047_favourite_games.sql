begin;
create table public.player_favourites(user_id uuid not null references auth.users(id) on delete cascade,game_id uuid not null references public.games(id) on delete cascade,position integer not null check(position between 1 and 6),primary key(user_id,position),unique(user_id,game_id));
alter table public.player_favourites enable row level security;
create policy favourites_read on public.player_favourites for select using(user_id=auth.uid() or (exists(select 1 from public.profiles p where p.user_id=player_favourites.user_id and p.is_public) and not public.social_blocked(user_id)));
revoke all on public.player_favourites from anon,authenticated;
grant select on public.player_favourites to anon,authenticated;
create function public.save_player_favourites(games uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or games is null or cardinality(games)>6 or coalesce(array_ndims(games),1)<>1 then raise exception 'Invalid favourites'; end if;
 perform 1 from public.profiles where user_id=auth.uid() for update;
 if not found then raise exception 'Profile required'; end if;
 delete from public.player_favourites where user_id=auth.uid();
 insert into public.player_favourites(user_id,game_id,position) select auth.uid(),g,n::integer from unnest(games) with ordinality as x(g,n);
end $$;
revoke all on function public.save_player_favourites(uuid[]) from public,anon;
grant execute on function public.save_player_favourites(uuid[]) to authenticated;
notify pgrst,'reload schema';
commit;
