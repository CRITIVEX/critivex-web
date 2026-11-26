begin;
create table public.social_notifications(
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references auth.users(id) on delete cascade,
 actor_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('follow','like','comment','reply')),
 post_id uuid references public.social_posts(id) on delete cascade,
 created_at timestamptz not null default now(),
 read_at timestamptz
);
create index social_notifications_recipient_idx on public.social_notifications(recipient_id,created_at desc);
create index social_notifications_unread_idx on public.social_notifications(recipient_id) where read_at is null;
alter table public.social_notifications enable row level security;
create policy notifications_read on public.social_notifications for select to authenticated using(recipient_id=auth.uid());
create policy notifications_update on public.social_notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
grant select,update(read_at) on public.social_notifications to authenticated;
create function public.emit_social_notification() returns trigger language plpgsql security definer set search_path='' as $$
declare target uuid; actor uuid; post uuid; event_kind text; reply_target uuid;
begin
 if TG_TABLE_NAME='social_follows' then target:=new.following_id;actor:=new.follower_id;event_kind:='follow';
 else
 actor:=new.user_id;post:=new.post_id;
 select user_id into target from public.social_posts where id=post;
 if TG_TABLE_NAME='social_likes' then event_kind:='like';
 else event_kind:='comment';
 if new.parent_id is not null then
 select user_id into reply_target from public.social_comments where id=new.parent_id and post_id=post;
 if reply_target is not null and reply_target<>actor and reply_target<>target then
 insert into public.social_notifications(recipient_id,actor_id,kind,post_id) values(reply_target,actor,'reply',post);
 elsif reply_target=target then event_kind:='reply';
 end if;
 end if;
 end if;
 end if;
 if target is not null and target<>actor then
 insert into public.social_notifications(recipient_id,actor_id,kind,post_id) values(target,actor,event_kind,post);
 end if;
 return new;
end $$;
revoke all on function public.emit_social_notification() from public,anon,authenticated;
create trigger social_follow_notice after insert on public.social_follows for each row execute function public.emit_social_notification();
create trigger social_like_notice after insert on public.social_likes for each row execute function public.emit_social_notification();
create trigger social_comment_notice after insert on public.social_comments for each row execute function public.emit_social_notification();
notify pgrst,'reload schema';
commit;
