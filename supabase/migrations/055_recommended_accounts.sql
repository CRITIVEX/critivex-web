begin;
create function public.recommended_players() returns table(user_id uuid,username text,display_name text,avatar_url text,shared_games bigint,mutual_connections bigint)
language sql stable security invoker set search_path='' as $$
with candidates as (
 select p.user_id,p.username::text,p.display_name::text,p.avatar_url::text
 from public.profiles p where auth.uid() is not null and p.user_id<>auth.uid() and p.is_public and p.username is not null
 and not public.social_blocked(p.user_id) and public.player_privacy_allows(p.user_id,'follows')
 and not exists(select 1 from public.social_follows f where f.follower_id=auth.uid() and f.following_id=p.user_id)
 order by p.user_id limit 1000
), scored as (
 select c.*,
 (select count(*) from public.player_favourites a join public.player_favourites b on a.game_id=b.game_id where a.user_id=auth.uid() and b.user_id=c.user_id) as shared_games,
 (select count(*) from public.social_follows a join public.social_follows b on a.following_id=b.follower_id where a.follower_id=auth.uid() and b.following_id=c.user_id) as mutual_connections,
 (select max(s.created_at) from public.social_posts s where s.user_id=c.user_id) as recent
 from candidates c
)
select s.user_id,s.username,s.display_name,s.avatar_url,s.shared_games,s.mutual_connections from scored s
order by s.shared_games*4+s.mutual_connections*2 desc,s.recent desc nulls last,s.user_id limit 10;
$$;
revoke all on function public.recommended_players() from public,anon;
grant execute on function public.recommended_players() to authenticated;
notify pgrst,'reload schema';
commit;
