begin;
alter table public.social_notifications drop constraint social_notifications_kind_check;
alter table public.social_notifications add constraint social_notifications_kind_check check(kind in ('follow','like','comment','reply','mention'));
revoke all on public.social_notifications from anon,authenticated;
grant select,update(read_at) on public.social_notifications to authenticated;
create unique index social_mention_once on public.social_notifications(recipient_id,post_id) where kind='mention';
create function public.emit_post_mentions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' then if old.body=new.body then return new; end if; end if;
 if not exists(select 1 from public.profiles p where p.user_id=new.user_id and p.is_public) then return new; end if;
 insert into public.social_notifications(recipient_id,actor_id,kind,post_id)
 select distinct p.user_id,new.user_id,'mention',new.id from regexp_matches(new.body,'(?:^|[[:space:]])@([A-Za-z0-9_]{3,24})(?![A-Za-z0-9_])','g') m
 join public.profiles p on lower(p.username)=lower(m[1])
 where p.is_public and p.user_id<>new.user_id and not exists(select 1 from public.social_blocks b where (b.blocker_id=p.user_id and b.blocked_id=new.user_id) or (b.blocker_id=new.user_id and b.blocked_id=p.user_id))
 limit 20 on conflict do nothing;
 return new;
end $$;
revoke all on function public.emit_post_mentions() from public,anon,authenticated;
create trigger social_post_mentions after insert or update of body on public.social_posts for each row execute function public.emit_post_mentions();
notify pgrst,'reload schema';
commit;
