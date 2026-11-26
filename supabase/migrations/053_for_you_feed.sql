begin;
create function public.for_you_feed() returns table(id uuid,user_id uuid,body text,created_at timestamptz,username text,display_name text,avatar_url text,image_path text,announcement boolean)
language sql stable security invoker set search_path='' as $$
with candidates as (
 select s.id,s.user_id,s.body,s.created_at,p.username::text,p.display_name::text,p.avatar_url::text,s.image_path,s.announcement,s.game_id
 from public.social_posts s join public.profiles p on p.user_id=s.user_id
 where p.username is not null and (p.is_public or p.user_id=auth.uid()) and not public.social_blocked(s.user_id)
 order by s.created_at desc,s.id desc limit 500
), ranked as (
 select c.*, (case when exists(select 1 from public.social_follows f where f.follower_id=auth.uid() and f.following_id=c.user_id) then 8 else 0 end
 +case when exists(select 1 from public.player_favourites f where f.user_id=auth.uid() and f.game_id=c.game_id) then 12 else 0 end
 +ln(1+(select count(*) from public.social_likes l where l.post_id=c.id))*2
 +ln(1+(select count(*) from public.social_comments m where m.post_id=c.id))*3
 +12/(1+greatest(0,extract(epoch from (now()-c.created_at))/86400))) as score
 from candidates c
)
select r.id,r.user_id,r.body,r.created_at,r.username,r.display_name,r.avatar_url,r.image_path,r.announcement from ranked r order by r.score desc,r.created_at desc,r.id desc limit 100;
$$;
revoke all on function public.for_you_feed() from public;
grant execute on function public.for_you_feed() to anon,authenticated;
notify pgrst,'reload schema';
commit;
