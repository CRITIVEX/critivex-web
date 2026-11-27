begin;
create table public.chat_groups(id uuid primary key default gen_random_uuid(),name text not null check(char_length(trim(name)) between 1 and 80),created_at timestamptz not null default now());
create table public.chat_group_members(group_id uuid references public.chat_groups on delete cascade,user_id uuid references auth.users on delete cascade,role text not null default 'member' check(role in ('admin','member')),primary key(group_id,user_id));
create table public.chat_group_messages(id uuid primary key default gen_random_uuid(),group_id uuid not null references public.chat_groups on delete cascade,sender_id uuid not null default auth.uid() references auth.users on delete cascade,body text not null check(char_length(trim(body)) between 1 and 2000),created_at timestamptz not null default now());
create index on public.chat_group_members(user_id,group_id);
create index on public.chat_group_messages(group_id,created_at desc,id desc);
alter table public.chat_groups enable row level security;
alter table public.chat_group_members enable row level security;
alter table public.chat_group_messages enable row level security;
create function public.is_chat_member(g uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.chat_group_members where group_id=g and user_id=auth.uid())$$;
create policy group_read on public.chat_groups for select to authenticated using(public.is_chat_member(id));
create policy member_read on public.chat_group_members for select to authenticated using(public.is_chat_member(group_id));
create policy group_message_read on public.chat_group_messages for select to authenticated using(public.is_chat_member(group_id) and not public.social_blocked(sender_id));
create policy group_message_send on public.chat_group_messages for insert to authenticated with check(sender_id=auth.uid() and public.is_chat_member(group_id));
revoke all on public.chat_groups,public.chat_group_members,public.chat_group_messages from anon,authenticated;
grant select on public.chat_groups,public.chat_group_members,public.chat_group_messages to authenticated;
grant insert(group_id,body) on public.chat_group_messages to authenticated;
create function public.create_chat_group(title text) returns uuid language plpgsql security definer set search_path='' as $$
declare g uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 insert into public.chat_groups(name) values(trim(title)) returning id into g;
 insert into public.chat_group_members values(g,auth.uid(),'admin');
 return g;
end $$;
create function public.invite_chat_member(g uuid,handle text) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 perform 1 from public.chat_groups where id=g for update;
 if not exists(select 1 from public.chat_group_members where group_id=g and user_id=auth.uid() and role='admin') then raise exception 'Administrator required'; end if;
 select user_id into target from public.profiles where lower(username)=lower(trim(handle)) and is_public;
 if target is null or public.social_blocked(target) or not public.player_privacy_allows(target,'messages') then raise exception 'Player unavailable'; end if;
 if not exists(select 1 from public.social_follows where follower_id=target and following_id=auth.uid()) then raise exception 'Player must follow you'; end if;
 if (select count(*) from public.chat_group_members where group_id=g)>=50 then raise exception 'Group is full'; end if;
 insert into public.chat_group_members values(g,target,'member') on conflict do nothing;
end $$;
create function public.leave_chat_group(g uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.chat_groups where id=g for update;
 if not public.is_chat_member(g) then return; end if;
 delete from public.chat_group_members where group_id=g and user_id=auth.uid();
 if not exists(select 1 from public.chat_group_members where group_id=g) then delete from public.chat_groups where id=g;
 elsif not exists(select 1 from public.chat_group_members where group_id=g and role='admin') then
 update public.chat_group_members set role='admin' where group_id=g and user_id=(select min(user_id::text)::uuid from public.chat_group_members where group_id=g);
 end if;
end $$;
revoke all on function public.is_chat_member(uuid),public.create_chat_group(text),public.invite_chat_member(uuid,text),public.leave_chat_group(uuid) from public;
grant execute on function public.is_chat_member(uuid),public.create_chat_group(text),public.invite_chat_member(uuid,text),public.leave_chat_group(uuid) to authenticated;
alter publication supabase_realtime add table public.chat_group_messages;
notify pgrst,'reload schema';
commit;
