begin;
create or replace function public.ranked_games(mode text, platform_filter text default '', genre_filter text default '') returns table(slug text,title text,developer text,release_date date,score numeric,rating_count bigint) language sql stable security definer set search_path='' as $$
with rated as (
select r.game_id,round(avg(r.score),1) score,count(*) rating_count from public.player_ratings r where mode='player' group by r.game_id
union all
select r.game_id,round(avg(r.score),1),count(*) from public.critic_reviews r where mode='critic' and r.verified group by r.game_id
union all
select e.game_id,e.score::numeric,1::bigint from (select distinct on (a.game_id) a.game_id,a.score from public.articles a where mode='editorial' and a.kind='review' and a.published_at<=now() and a.score is not null order by a.game_id,a.published_at desc,a.id) e
)
select g.slug,g.title,g.developer,g.release_date,r.score,r.rating_count from rated r join public.games g on g.id=r.game_id where (platform_filter='' or g.platforms @> array[platform_filter]) and (genre_filter='' or g.genres @> array[genre_filter]) order by r.score desc,r.rating_count desc,g.title,g.slug limit 100
$$;
revoke all on function public.ranked_games(text,text,text) from public;
grant execute on function public.ranked_games(text,text,text) to anon,authenticated;
commit;
