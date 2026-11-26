-- Run separately from deployment. Avoid raising statement_timeout globally.
-- These indexes target the indexed title-prefix queries in admin search.
-- Run each statement separately if your SQL editor has a short timeout.
create index concurrently if not exists games_title_prefix_idx on public.games (title text_pattern_ops);
create index concurrently if not exists games_title_id_idx on public.games (title, id);
create index concurrently if not exists games_igdb_id_idx on public.games (igdb_id);
create index concurrently if not exists editorial_drafts_created_at_idx on public.editorial_drafts (created_at desc);
