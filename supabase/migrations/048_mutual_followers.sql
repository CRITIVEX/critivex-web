begin;
create function public.mutual_followers(player uuid)
returns table(user_id uuid,username text,display_name text,avatar_url text,total bigint)
language sql stable security invoker set search_path='' as $$
 select p.user_id,p.username::text,p.display_name::text,p.avatar_url::text,count(*) over()
 from public.social_follows mine
 join public.social_follows theirs on theirs.follower_id=mine.following_id
 join public.profiles p on p.user_id=mine.following_id
 where auth.uid() is not null and player<>auth.uid()
 and mine.follower_id=auth.uid() and theirs.following_id=player
 and p.is_public and p.username is not null
 and exists(select 1 from public.profiles target where target.user_id=player and target.is_public)
 and not public.social_blocked(player) and not public.social_blocked(p.user_id)
 order by lower(p.username),p.user_id limit 20;
$$;
revoke all on function public.mutual_followers(uuid) from public,anon;
grant execute on function public.mutual_followers(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
