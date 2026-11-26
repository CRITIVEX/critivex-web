begin;
create table public.social_messages(id uuid primary key default gen_random_uuid(),sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,recipient_id uuid not null references auth.users(id) on delete cascade,body text not null check(char_length(btrim(body)) between 1 and 2000),created_at timestamptz not null default now(),read_at timestamptz,check(sender_id<>recipient_id));
alter table public.social_messages enable row level security;
create policy message_read on public.social_messages for select to authenticated using(auth.uid() in(sender_id,recipient_id));
create policy message_send on public.social_messages for insert to authenticated with check(sender_id=auth.uid() and read_at is null and not public.social_blocked(recipient_id) and exists(select 1 from public.profiles p where p.user_id=recipient_id and p.is_public and p.username is not null) and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.username is not null));
create policy message_mark on public.social_messages for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
revoke all on public.social_messages from anon,authenticated;
grant select,insert(recipient_id,body),update(read_at) on public.social_messages to authenticated;
create index social_messages_sender_idx on public.social_messages(sender_id,recipient_id,created_at desc);
create index social_messages_recipient_idx on public.social_messages(recipient_id,sender_id,created_at desc);
create index social_messages_unread_idx on public.social_messages(recipient_id) where read_at is null;
create function public.message_inbox() returns table(peer_id uuid,username text,display_name text,last_body text,last_at timestamptz,unread bigint) language sql stable security invoker set search_path='' as $$
with mine as (select m.*,case when m.sender_id=auth.uid() then m.recipient_id else m.sender_id end as peer from public.social_messages m where auth.uid() in(m.sender_id,m.recipient_id)), latest as (select distinct on(peer) peer,body,created_at from mine order by peer,created_at desc,id desc), counts as (select peer,count(*) as unread from mine where recipient_id=auth.uid() and read_at is null group by peer)
select l.peer,p.username,p.display_name,l.body,l.created_at,coalesce(c.unread,0) from latest l left join public.profiles p on p.user_id=l.peer left join counts c on c.peer=l.peer order by l.created_at desc limit 100;
$$;
revoke all on function public.message_inbox() from public,anon;
grant execute on function public.message_inbox() to authenticated;
notify pgrst,'reload schema';
commit;
