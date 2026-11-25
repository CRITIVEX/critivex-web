begin;
alter table public.games add column igdb_id bigint unique, add column description text not null default '', add column developer text not null default '', add column publisher text not null default '', add column genres text[] not null default '{}', add column platforms text[] not null default '{}', add column cover_image_id text, add column screenshot_image_ids text[] not null default '{}', add column trailer_video_ids text[] not null default '{}';
create or replace function public.catalogue_scores() returns table(slug text,player_score numeric,player_count bigint,critic_score numeric,critic_count bigint) language sql stable security definer set search_path='' as $$
select g.slug,p.score,p.total,c.score,c.total from public.games g left join lateral (select round(avg(r.score),1) score,count(*) total from public.player_ratings r where r.game_id=g.id) p on true left join lateral (select round(avg(r.score),1) score,count(*) total from public.critic_reviews r where r.game_id=g.id and r.verified) c on true
$$;
revoke all on function public.catalogue_scores() from public;
grant execute on function public.catalogue_scores() to anon,authenticated;
commit;