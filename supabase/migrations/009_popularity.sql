begin;
alter table public.player_ratings add column if not exists activity_at timestamptz;
create or replace function public.stamp_rating_activity() returns trigger language plpgsql set search_path='' as $$ begin new.activity_at=now(); return new; end; $$;
drop trigger if exists stamp_rating_activity on public.player_ratings;
create trigger stamp_rating_activity before insert or update on public.player_ratings for each row execute function public.stamp_rating_activity();
create index if not exists player_ratings_activity_idx on public.player_ratings(activity_at);
create index if not exists critic_reviews_verified_game_idx on public.critic_reviews(game_id) where verified;
create or replace function public.popular_games(recent boolean default false) returns table(slug text,title text,cover_image_id text,player_count bigint,critic_count bigint,recent_count bigint) language sql stable security definer set search_path='' as $$
with p as (select game_id,count(*) total,count(*) filter(where activity_at >= now()-interval '7 days') active from public.player_ratings group by game_id),
c as (select game_id,count(*) total from public.critic_reviews where verified group by game_id),
a as (select coalesce(p.game_id,c.game_id) game_id,coalesce(p.total,0) players,coalesce(c.total,0) critics,coalesce(p.active,0) active from p full join c on p.game_id=c.game_id)
select g.slug,g.title,g.cover_image_id,a.players,a.critics,a.active from a join public.games g on g.id=a.game_id
where not recent or a.active>0
order by case when recent then a.active else a.players+a.critics end desc,g.slug limit 24
$$;
revoke all on function public.popular_games(boolean) from public;
grant execute on function public.popular_games(boolean) to anon,authenticated;
commit;
