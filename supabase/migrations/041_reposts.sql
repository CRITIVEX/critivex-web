begin;
create table public.social_reposts (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 post_id uuid not null references public.social_posts(id) on delete cascade,
 quote text not null default '' check(char_length(quote)<=2000),
 created_at timestamptz not null default now(),
 primary key(user_id,post_id)
);
alter table public.social_reposts enable row level security;
create policy repost_read on public.social_reposts for select using (
 (user_id=auth.uid() or exists(select 1 from public.profiles p where p.user_id=social_reposts.user_id and p.is_public))
 and not public.social_blocked(user_id)
 and exists(select 1 from public.social_posts p where p.id=post_id)
);
create policy repost_insert on public.social_reposts for insert to authenticated with check (
 user_id=auth.uid() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null)
 and exists(select 1 from public.social_posts p where p.id=post_id and p.user_id<>auth.uid())
);
create policy repost_delete on public.social_reposts for delete to authenticated using(user_id=auth.uid());
revoke all on public.social_reposts from anon,authenticated;
grant select on public.social_reposts to anon,authenticated;
grant insert(post_id,quote),delete on public.social_reposts to authenticated;
create index social_reposts_post_idx on public.social_reposts(post_id);
create index social_reposts_recent_idx on public.social_reposts(created_at desc);
notify pgrst,'reload schema';
commit;
