begin;
create table public.verification_applications(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,kind text not null check(kind in ('individual','business','government')),name text not null check(char_length(btrim(name)) between 1 and 80),website text not null default '' check(char_length(website)<=500),details text not null check(char_length(btrim(details)) between 1 and 2000),status text not null default 'pending' check(status in ('pending','approved','rejected')),created_at timestamptz not null default now());
create unique index verification_pending_once on public.verification_applications(user_id) where status='pending';
alter table public.verification_applications enable row level security;
create policy verification_read on public.verification_applications for select to authenticated using(user_id=auth.uid() or public.has_staff_role(array['admin']));
create policy verification_submit on public.verification_applications for insert to authenticated with check(user_id=auth.uid() and status='pending');
revoke all on public.verification_applications from anon,authenticated;
grant select,insert(kind,name,website,details) on public.verification_applications to authenticated;
create table public.organisation_invitations(id uuid primary key default gen_random_uuid(),organisation_id uuid not null references public.verified_organisations(user_id) on delete cascade,member_id uuid not null references auth.users(id) on delete cascade,status text not null default 'pending' check(status in ('pending','accepted','declined','revoked')),created_at timestamptz not null default now(),check(organisation_id<>member_id));
create unique index organisation_pending_invite on public.organisation_invitations(organisation_id,member_id) where status='pending';
alter table public.organisation_invitations enable row level security;
create policy invitation_read on public.organisation_invitations for select to authenticated using(auth.uid() in (organisation_id,member_id));
revoke all on public.organisation_invitations from anon,authenticated;
grant select on public.organisation_invitations to authenticated;
create function public.invite_affiliate(handle text) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if not exists(select 1 from public.verified_organisations where user_id=auth.uid()) then raise exception 'Verified organisation required'; end if;
 select user_id into target from public.profiles where lower(username)=lower(btrim(handle)) and is_public;
 if target is null or target=auth.uid() or public.social_blocked(target) then raise exception 'Player unavailable'; end if;
 if exists(select 1 from public.organisation_affiliations where organisation_id=auth.uid() and member_id=target) then raise exception 'Already affiliated'; end if;
 insert into public.organisation_invitations(organisation_id,member_id) values(auth.uid(),target) on conflict do nothing;
end $$;
create function public.respond_affiliation(invitation uuid,accept boolean) returns void language plpgsql security definer set search_path='' as $$
declare inv public.organisation_invitations%rowtype;
begin
 select * into inv from public.organisation_invitations where id=invitation and member_id=auth.uid() and status='pending' for update;
 if not found then raise exception 'Invitation unavailable'; end if;
 if accept then
 if public.social_blocked(inv.organisation_id) then raise exception 'Organisation unavailable'; end if;
 insert into public.organisation_affiliations(member_id,organisation_id) values(inv.member_id,inv.organisation_id) on conflict do nothing;
 end if;
 update public.organisation_invitations set status=case when accept then 'accepted' else 'declined' end where id=invitation;
end $$;
create function public.remove_affiliation(org uuid,member uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() not in(org,member) then raise exception 'Access denied'; end if;
 delete from public.organisation_affiliations where organisation_id=org and member_id=member;
 update public.organisation_invitations set status='revoked' where organisation_id=org and member_id=member and status in ('pending','accepted');
end $$;
revoke all on function public.invite_affiliate(text),public.respond_affiliation(uuid,boolean),public.remove_affiliation(uuid,uuid) from public,anon;
grant execute on function public.invite_affiliate(text),public.respond_affiliation(uuid,boolean),public.remove_affiliation(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
