begin;
set local statement_timeout = '300s';
create index if not exists games_release_ascending_idx on public.games (release_date asc, slug asc) where release_date is not null;
create index if not exists games_release_cover_desc_idx on public.games (release_date desc, slug asc) where release_date is not null and cover_image_id is not null;
analyze public.games;
commit;
