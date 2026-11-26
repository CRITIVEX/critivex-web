begin;
create table if not exists public.social_posts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 body text not null check (char_length(btrim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table if not exists public.social_follows (
 follower_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 following_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(follower_id,following_id), check(follower_id<>following_id)
);
alter table public.social_posts enable row level security;
alter table public.social_follows enable row level security;
create index if not exists social_posts_author_idx on public.social_posts(user_id,created_at desc,id);
create index if not exists social_follows_target_idx on public.social_follows(following_id);
create policy social_posts_read on public.social_posts for select using(user_id=auth.uid() or exists(select 1 from public.profiles p where p.user_id=social_posts.user_id and p.is_public));
create policy social_posts_insert on public.social_posts for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null));
create policy social_posts_delete on public.social_posts for delete to authenticated using(user_id=auth.uid());
create policy social_follows_read on public.social_follows for select using(follower_id=auth.uid() or following_id=auth.uid() or (exists(select 1 from public.profiles p where p.user_id=social_follows.follower_id and p.is_public) and exists(select 1 from public.profiles p where p.user_id=social_follows.following_id and p.is_public)));
create policy social_follows_insert on public.social_follows for insert to authenticated with check(follower_id=auth.uid() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null) and exists(select 1 from public.profiles p where p.user_id=social_follows.following_id and p.is_public));
create policy social_follows_delete on public.social_follows for delete to authenticated using(follower_id=auth.uid());
grant select on public.social_posts,public.social_follows to anon,authenticated;
grant insert(body),delete on public.social_posts to authenticated;
grant insert(following_id),delete on public.social_follows to authenticated;
notify pgrst,'reload schema';
commit;
