begin;
alter table public.verified_organisations add column category text not null default 'business' check(category in ('business','government'));
create function public.decide_verification(application uuid,approve boolean) returns void language plpgsql security definer set search_path='' as $$
declare a public.verification_applications%rowtype; logo text;
begin
 if auth.uid() is null or not public.has_staff_role(array['admin']) then raise exception 'Administrator required'; end if;
 select * into a from public.verification_applications where id=application and status='pending' for update;
 if not found then raise exception 'Application unavailable'; end if;
 if approve then
 if not exists(select 1 from public.profiles where user_id=a.user_id and is_public and username is not null) then raise exception 'Public profile required'; end if;
 if a.kind<>'individual' then
 select avatar_url into logo from public.profiles where user_id=a.user_id;
 if logo is null or logo !~ '^https://' then raise exception 'Organisation logo required'; end if;
 end if;
 insert into public.player_distinctions(user_id,kind) values(a.user_id,'verified') on conflict(user_id) do nothing;
 if a.kind<>'individual' then
 insert into public.verified_organisations(user_id,name,logo_url,category) values(a.user_id,a.name,logo,a.kind) on conflict(user_id) do update set name=excluded.name,logo_url=excluded.logo_url,category=excluded.category;
 end if;
 end if;
 update public.verification_applications set status=case when approve then 'approved' else 'rejected' end where id=application;
end $$;
revoke all on function public.decide_verification(uuid,boolean) from public,anon;
grant execute on function public.decide_verification(uuid,boolean) to authenticated;
notify pgrst,'reload schema';
commit;
