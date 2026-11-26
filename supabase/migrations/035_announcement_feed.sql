begin;
drop function public.social_feed(boolean,timestamptz,uuid);
create function public.social_feed(following_only boolean default false,before_time timestamptz default null,before_id uuid default null)
returns table(id uuid,user_id uuid,body text,created_at timestamptz,username text,display_name text,avatar_url text,image_path text,announcement boolean)
language sql stable security invoker set search_path='' as $$
select s.id,s.user_id,s.body,s.created_at,p.username,p.display_name,p.avatar_url,s.image_path,s.announcement from public.social_posts s join public.profiles p on p.user_id=s.user_id
where p.username is not null and (p.is_public or p.user_id=auth.uid()) and (not following_only or s.user_id=auth.uid() or exists(select 1 from public.social_follows f where f.follower_id=auth.uid() and f.following_id=s.user_id)) and (before_time is null or (s.created_at,s.id)<(before_time,before_id)) order by s.created_at desc,s.id desc limit 21;
$$;
revoke all on function public.social_feed(boolean,timestamptz,uuid) from public;
grant execute on function public.social_feed(boolean,timestamptz,uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
