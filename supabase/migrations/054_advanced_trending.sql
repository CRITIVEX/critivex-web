begin;
create function public.trending_topics_window(hours integer default 168) returns table(topic text,posts bigint,contributors bigint)
language sql stable security invoker set search_path='' as $$
 select h.tag,count(*),count(distinct recent.user_id)
 from (select s.hashtags,s.user_id from public.social_posts s join public.profiles p on p.user_id=s.user_id
 where hours in (24,168,720) and p.is_public and p.username is not null and not public.social_blocked(s.user_id)
 and s.created_at>=now()-make_interval(hours=>hours)
 order by s.created_at desc,s.id desc limit 5000) recent
 cross join lateral unnest(recent.hashtags) h(tag)
 group by h.tag order by count(distinct recent.user_id) desc,count(*) desc,h.tag limit 20;
$$;
revoke all on function public.trending_topics_window(integer) from public;
grant execute on function public.trending_topics_window(integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
