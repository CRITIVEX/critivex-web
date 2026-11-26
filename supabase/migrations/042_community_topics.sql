begin;
create or replace function public.post_hashtags(body text) returns text[] language sql immutable strict set search_path='' as $$
 select coalesce(array_agg(distinct lower(m[1])),array[]::text[]) from regexp_matches(body,'(?:^|[[:space:]])#([A-Za-z0-9_]{1,40})(?![A-Za-z0-9_])','g') as m;
$$;
alter table public.social_posts add column hashtags text[] generated always as (public.post_hashtags(body)) stored;
create index social_posts_hashtags_idx on public.social_posts using gin(hashtags);
create or replace function public.topic_posts(topic text) returns table(id uuid,body text,created_at timestamptz,user_id uuid,username text,display_name text) language sql stable security invoker set search_path='' as $$
 select s.id,s.body,s.created_at,s.user_id,p.username::text,p.display_name::text from public.social_posts s join public.profiles p on p.user_id=s.user_id
 where p.is_public and p.username is not null and s.hashtags @> array[lower(topic)] and topic ~ '^[A-Za-z0-9_]{1,40}$'
 order by s.created_at desc,s.id desc limit 50;
$$;
create or replace function public.trending_topics() returns table(topic text,posts bigint) language sql stable security invoker set search_path='' as $$
 select h.tag,count(*) from (select s.hashtags from public.social_posts s join public.profiles p on p.user_id=s.user_id where p.is_public and s.created_at>=now()-interval '7 days' order by s.created_at desc limit 5000) recent cross join lateral unnest(recent.hashtags) h(tag) group by h.tag order by count(*) desc,h.tag limit 15;
$$;
revoke all on function public.topic_posts(text),public.trending_topics() from public;
grant execute on function public.topic_posts(text),public.trending_topics() to anon,authenticated;
notify pgrst,'reload schema';
commit;
