begin;
create or replace function public.game_scores(game_slug text) returns table(player_score numeric,player_count bigint,critic_score numeric,critic_count bigint) language sql stable security definer set search_path='' as $$
select (select round(avg(p.score),1) from public.player_ratings p where p.game_id=g.id),(select count(*) from public.player_ratings p where p.game_id=g.id),(select round(avg(c.score),1) from public.critic_reviews c where c.game_id=g.id and c.verified),(select count(*) from public.critic_reviews c where c.game_id=g.id and c.verified) from public.games g where g.slug=game_slug
$$;
revoke all on function public.game_scores(text) from public;
grant execute on function public.game_scores(text) to anon,authenticated;
insert into public.games(slug,title,release_date) values ('hades','Hades','2020-09-17'),('elden-ring','Elden Ring','2022-02-25'),('stardew-valley','Stardew Valley','2016-02-26'),('portal-2','Portal 2','2011-04-19'),('hollow-knight','Hollow Knight','2017-02-24'),('cyberpunk-2077','Cyberpunk 2077','2020-12-10') on conflict(slug) do nothing;
commit;