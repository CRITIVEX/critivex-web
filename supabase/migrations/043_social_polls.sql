begin;
create table public.social_polls(post_id uuid primary key references public.social_posts(id) on delete cascade, options text[] not null check(cardinality(options) between 2 and 4), closes_at timestamptz not null);
create table public.social_poll_votes(post_id uuid references public.social_polls(post_id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,choice integer not null check(choice between 1 and 4),primary key(post_id,user_id));
alter table public.social_polls enable row level security;
alter table public.social_poll_votes enable row level security;
create policy poll_read on public.social_polls for select using(exists(select 1 from public.social_posts s where s.id=post_id));
revoke all on public.social_polls,public.social_poll_votes from anon,authenticated;
grant select on public.social_polls to anon,authenticated;
create function public.create_social_poll(question text,answers text[],hours integer) returns uuid language plpgsql security definer set search_path='' as $$
declare new_id uuid; cleaned text[];
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where user_id=auth.uid() and username is not null) then raise exception 'Profile required'; end if;
 if question is null or char_length(btrim(question)) not between 1 and 2000 or hours is null or hours not in (1,24,72,168) or answers is null or array_ndims(answers)<>1 or cardinality(answers) not between 2 and 4 then raise exception 'Invalid poll'; end if;
 select array_agg(btrim(a) order by n) into cleaned from unnest(answers) with ordinality t(a,n);
 if exists(select 1 from unnest(cleaned) a where a is null or char_length(a) not between 1 and 100) or (select count(distinct lower(a)) from unnest(cleaned) a)<>cardinality(cleaned) then raise exception 'Invalid answers'; end if;
 insert into public.social_posts(user_id,body) values(auth.uid(),btrim(question)) returning id into new_id;
 insert into public.social_polls values(new_id,cleaned,now()+make_interval(hours=>hours));
 return new_id;
end $$;
create function public.vote_social_poll(post uuid,answer integer) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where user_id=auth.uid() and username is not null) or not exists(select 1 from public.social_polls q join public.social_posts s on s.id=q.post_id join public.profiles p on p.user_id=s.user_id where q.post_id=post and q.closes_at>clock_timestamp() and answer between 1 and cardinality(q.options) and (p.is_public or p.user_id=auth.uid()) and not public.social_blocked(p.user_id)) then raise exception 'Poll unavailable'; end if;
 insert into public.social_poll_votes values(post,auth.uid(),answer);
end $$;
create function public.social_poll_results(post uuid) returns table(choice integer,votes bigint,selected boolean) language sql stable security definer set search_path='' as $$
 select n,count(v.user_id),coalesce(bool_or(v.user_id=auth.uid()),false)
 from public.social_polls q join public.social_posts s on s.id=q.post_id join public.profiles p on p.user_id=s.user_id cross join lateral generate_subscripts(q.options,1) n left join public.social_poll_votes v on v.post_id=q.post_id and v.choice=n
 where q.post_id=post and (p.is_public or p.user_id=auth.uid()) and not public.social_blocked(p.user_id) group by n order by n;
$$;
revoke all on function public.create_social_poll(text,text[],integer),public.vote_social_poll(uuid,integer),public.social_poll_results(uuid) from public,anon;
grant execute on function public.create_social_poll(text,text[],integer),public.vote_social_poll(uuid,integer) to authenticated;
grant execute on function public.social_poll_results(uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
