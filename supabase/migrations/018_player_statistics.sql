begin;
create or replace function public.my_player_statistics()
returns table(library_total bigint,wishlist bigint,playing bigint,completed bigint,backlog bigint,dropped bigint,rating_count bigint,average_rating numeric)
language sql stable security invoker set search_path = ''
as $$
 select l.total,l.wishlist,l.playing,l.completed,l.backlog,l.dropped,r.total,r.average
 from (select count(*) total,count(*) filter(where status='wishlist') wishlist,count(*) filter(where status='playing') playing,count(*) filter(where status='completed') completed,count(*) filter(where status='backlog') backlog,count(*) filter(where status='dropped') dropped from public.game_library where user_id=(select auth.uid())) l
 cross join (select count(*) total,round(avg(score),1) average from public.player_ratings where user_id=(select auth.uid())) r
 where (select auth.uid()) is not null;
$$;
revoke all on function public.my_player_statistics() from public,anon;
grant execute on function public.my_player_statistics() to authenticated;
notify pgrst,'reload schema';
commit;
