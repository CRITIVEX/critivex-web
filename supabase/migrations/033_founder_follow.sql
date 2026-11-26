begin;
create table public.founder_follow_config(singleton boolean primary key default true check(singleton),founder_id uuid not null references auth.users(id) on delete cascade,enabled_at timestamptz not null default now());
alter table public.founder_follow_config enable row level security;
revoke all on public.founder_follow_config from anon,authenticated;
insert into public.founder_follow_config(founder_id)
select p.user_id from public.profiles p join auth.users u on u.id=p.user_id where lower(p.username)='braydenn' and lower(u.email)='critivex@outlook.com' and p.is_public;
do $$begin if not exists(select 1 from public.founder_follow_config) then raise exception 'Founder profile not found: verify BraydenN and Critivex account email'; end if;end$$;
create table public.founder_follow_completed(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.founder_follow_completed enable row level security;
revoke all on public.founder_follow_completed from anon,authenticated;
create function public.follow_founder_once() returns trigger language plpgsql security definer set search_path='' as $$
declare founder uuid; cutoff timestamptz;
begin
 if new.username is null then return new; end if;
 select founder_id,enabled_at into founder,cutoff from public.founder_follow_config where singleton;
 if founder is null or founder=new.user_id or not exists(select 1 from auth.users u where u.id=new.user_id and u.created_at>=cutoff) then return new; end if;
 insert into public.founder_follow_completed(user_id) values(new.user_id) on conflict do nothing;
 if not found then return new; end if;
 if not new.is_public or not exists(select 1 from public.profiles p where p.user_id=founder and p.is_public and p.username is not null) or exists(select 1 from public.social_blocks b where (b.blocker_id=new.user_id and b.blocked_id=founder) or (b.blocker_id=founder and b.blocked_id=new.user_id)) then return new; end if;
 insert into public.social_follows(follower_id,following_id) values(new.user_id,founder) on conflict do nothing;
 return new;
end $$;
revoke all on function public.follow_founder_once() from public,anon,authenticated;
create trigger founder_follow_on_profile after insert or update of username on public.profiles for each row execute function public.follow_founder_once();
commit;
