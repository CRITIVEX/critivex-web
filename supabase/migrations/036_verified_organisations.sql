begin;
create table public.verified_organisations(user_id uuid primary key references public.player_distinctions(user_id) on delete cascade, name text not null check(char_length(btrim(name)) between 1 and 80),logo_url text not null check(logo_url ~ '^https://' and char_length(logo_url)<=500));
create table public.organisation_affiliations(member_id uuid not null references auth.users(id) on delete cascade,organisation_id uuid not null references public.verified_organisations(user_id) on delete cascade,primary key(member_id,organisation_id),check(member_id<>organisation_id));
alter table public.verified_organisations enable row level security;
alter table public.organisation_affiliations enable row level security;
create policy organisation_public on public.verified_organisations for select using(exists(select 1 from public.profiles p where p.user_id=verified_organisations.user_id and p.is_public));
create policy affiliation_public on public.organisation_affiliations for select using(exists(select 1 from public.profiles p where p.user_id=organisation_affiliations.member_id and p.is_public) and exists(select 1 from public.verified_organisations o where o.user_id=organisation_affiliations.organisation_id));
revoke all on public.verified_organisations,public.organisation_affiliations from anon,authenticated;
grant select on public.verified_organisations,public.organisation_affiliations to anon,authenticated;
create function public.player_affiliations(player uuid) returns table(name text,logo_url text,username text) language sql stable security invoker set search_path='' as $$
select o.name,o.logo_url,p.username from public.organisation_affiliations a join public.verified_organisations o on o.user_id=a.organisation_id join public.profiles p on p.user_id=o.user_id where a.member_id=player and p.is_public and p.username is not null order by o.name limit 10;
$$;
revoke all on function public.player_affiliations(uuid) from public;
grant execute on function public.player_affiliations(uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
