begin;
create table if not exists public.social_bookmarks (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 post_id uuid not null references public.social_posts(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,post_id)
);
alter table public.social_bookmarks enable row level security;
drop policy if exists bookmarks_read on public.social_bookmarks;
create policy bookmarks_read on public.social_bookmarks for select to authenticated using(user_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id));
drop policy if exists bookmarks_insert on public.social_bookmarks;
create policy bookmarks_insert on public.social_bookmarks for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id));
drop policy if exists bookmarks_delete on public.social_bookmarks;
create policy bookmarks_delete on public.social_bookmarks for delete to authenticated using(user_id=auth.uid());
revoke all on public.social_bookmarks from anon,authenticated;
grant select,delete on public.social_bookmarks to authenticated;
grant insert(post_id) on public.social_bookmarks to authenticated;
alter table public.social_posts add column if not exists edited_at timestamptz;
create or replace function public.edit_social_post(post uuid,new_body text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or new_body is null or char_length(btrim(new_body)) not between 1 and 2000 then raise exception 'Invalid post'; end if;
 update public.social_posts set body=btrim(new_body),edited_at=now() where id=post and user_id=auth.uid();
 if not found then raise exception 'Post unavailable'; end if;
end $$;
create or replace function public.pin_social_post(post uuid,pin boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or pin is null then raise exception 'Invalid request'; end if;
 perform 1 from public.profiles where user_id=auth.uid() for update;
 if not exists(select 1 from public.social_posts where id=post and user_id=auth.uid()) then raise exception 'Post unavailable'; end if;
 if pin then update public.social_posts set pinned=false where user_id=auth.uid() and pinned; end if;
 update public.social_posts set pinned=pin where id=post and user_id=auth.uid();
end $$;
revoke all on function public.edit_social_post(uuid,text),public.pin_social_post(uuid,boolean) from public,anon;
grant execute on function public.edit_social_post(uuid,text),public.pin_social_post(uuid,boolean) to authenticated;
notify pgrst,'reload schema';
commit;
