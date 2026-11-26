begin;
create index if not exists profiles_public_username_search_idx on public.profiles(lower(username) text_pattern_ops) where is_public and username is not null;
create or replace function public.discover_players(search_term text default '')
returns table(user_id uuid,username text,display_name text,bio text,avatar_url text,is_following boolean)
language sql stable security invoker set search_path='' as $$
select p.user_id,p.username,p.display_name,p.bio,p.avatar_url,exists(select 1 from public.social_follows f where f.follower_id=auth.uid() and f.following_id=p.user_id)
from public.profiles p
where p.is_public and p.username is not null and p.user_id is distinct from auth.uid()
and (btrim(search_term)='' or strpos(lower(p.username),lower(left(btrim(search_term),80)))>0 or strpos(lower(coalesce(p.display_name,'')),lower(left(btrim(search_term),80)))>0)
order by case when lower(p.username)=lower(btrim(search_term)) then 0 else 1 end,lower(p.username),p.user_id limit 40;
$$;
revoke all on function public.discover_players(text) from public;
grant execute on function public.discover_players(text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
