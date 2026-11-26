begin;
create table public.game_collections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(char_length(trim(name)) between 1 and 80),
 description text not null default '' check(char_length(description)<=500),
 cover_url text check(cover_url is null or (char_length(cover_url)<=500 and cover_url ~ '^https://')),
 is_public boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.game_collection_items (
 collection_id uuid not null references public.game_collections(id) on delete cascade,
 game_id uuid not null references public.games(id) on delete cascade,
 added_at timestamptz not null default now(),
 primary key(collection_id,game_id)
);
create index game_collections_owner_idx on public.game_collections(user_id,created_at);
alter table public.game_collections enable row level security;
alter table public.game_collection_items enable row level security;
create policy collection_read on public.game_collections for select using(user_id=auth.uid() or is_public);
create policy collection_owner on public.game_collections for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy collection_items_read on public.game_collection_items for select using(exists(select 1 from public.game_collections c where c.id=collection_id and (c.is_public or c.user_id=auth.uid())));
create policy collection_items_owner on public.game_collection_items for all to authenticated using(exists(select 1 from public.game_collections c where c.id=collection_id and c.user_id=auth.uid())) with check(exists(select 1 from public.game_collections c where c.id=collection_id and c.user_id=auth.uid()));
grant select on public.game_collections,public.game_collection_items to anon,authenticated;
grant insert,update,delete on public.game_collections,public.game_collection_items to authenticated;
notify pgrst,'reload schema';
commit;
