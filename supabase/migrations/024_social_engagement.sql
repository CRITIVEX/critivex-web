begin;
create table public.social_likes (
 post_id uuid not null references public.social_posts(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 primary key(post_id,user_id)
);
create table public.social_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.social_posts(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 parent_id uuid,
 body text not null check(char_length(btrim(body)) between 1 and 1000),
 created_at timestamptz not null default now(),
 unique(id,post_id),
 foreign key(parent_id,post_id) references public.social_comments(id,post_id) on delete cascade
);
create index social_comments_post_idx on public.social_comments(post_id,created_at);
alter table public.social_likes enable row level security;
alter table public.social_comments enable row level security;
create policy likes_read on public.social_likes for select using(exists(select 1 from public.social_posts p where p.id=post_id));
create policy likes_insert on public.social_likes for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id) and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null));
create policy likes_delete on public.social_likes for delete to authenticated using(user_id=auth.uid());
create policy comments_read on public.social_comments for select using(exists(select 1 from public.social_posts p where p.id=post_id) and (user_id=auth.uid() or exists(select 1 from public.profiles p where p.user_id=social_comments.user_id and p.is_public)));
create policy comments_insert on public.social_comments for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id) and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null and p.is_public));
create policy comments_delete on public.social_comments for delete to authenticated using(user_id=auth.uid());
grant select on public.social_likes,public.social_comments to anon,authenticated;
grant insert(post_id),delete on public.social_likes to authenticated;
grant insert(post_id,parent_id,body),delete on public.social_comments to authenticated;
notify pgrst,'reload schema';
commit;
