begin;
create or replace function public.player_achievements(player uuid)
returns table(code text,label text,progress bigint,target bigint)
language sql stable security invoker set search_path='' as $$
with eligible as (select user_id from public.profiles where user_id=player and (is_public or user_id=auth.uid()) and not public.social_blocked(user_id)), stats as (select (select count(*) from public.social_posts where user_id=player) as posts,(select count(*) from public.player_reviews where user_id=player and status='approved') as reviews,(select count(*) from public.game_collections where user_id=player and is_public) as collections from eligible)
select v.code,v.label,v.progress,v.target from stats cross join lateral (values ('first_post','First post',posts,1::bigint),('active_player','Community regular',posts,10::bigint),('first_review','Game critic',reviews,1::bigint),('reviewer','Review veteran',reviews,10::bigint),('collector','Curator',collections,1::bigint)) v(code,label,progress,target);
$$;
revoke all on function public.player_achievements(uuid) from public;
grant execute on function public.player_achievements(uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
