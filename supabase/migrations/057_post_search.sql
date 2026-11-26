begin;
create index if not exists social_posts_search_idx on public.social_posts using gin(to_tsvector('simple'::regconfig,body));
create function public.search_community_posts(q text default '',tag text default '',author text default '',game text default '',since timestamptz default null,until_time timestamptz default null,sort_by text default 'relevance',page_offset integer default 0)
returns table(id uuid,username text,summary text,created_at timestamptz,likes bigint,comments bigint)
language sql stable security invoker set search_path='' as $$
with matches as (
select s.id,p.username::text,s.body,s.spoiler,s.created_at,
ts_rank(to_tsvector('simple'::regconfig,s.body),plainto_tsquery('simple'::regconfig,q)) as relevance,
(select count(*) from public.social_likes l where l.post_id=s.id) as likes,
(select count(*) from public.social_comments m where m.post_id=s.id) as comments
from public.social_posts s join public.profiles p on p.user_id=s.user_id
where p.username is not null and (p.is_public or p.user_id=auth.uid()) and not public.social_blocked(s.user_id)
and length(q)<=200 and length(tag)<=40 and length(author)<=24 and length(game)<=200
and (q='' or to_tsvector('simple'::regconfig,s.body) @@ plainto_tsquery('simple'::regconfig,q))
and (tag='' or s.hashtags @> array[lower(tag)])
and (author='' or lower(p.username)=lower(author))
and (game='' or exists(select 1 from public.games g where g.id=s.game_id and lower(g.slug)=lower(game)))
and (since is null or s.created_at>=since) and (until_time is null or s.created_at<until_time)
)
select m.id,m.username,case when m.spoiler then 'Post contains spoilers' else left(m.body,300) end,m.created_at,m.likes,m.comments
from matches m order by case when sort_by='relevance' then m.relevance end desc nulls last,case when sort_by='popular' then m.likes+2*m.comments end desc nulls last,m.created_at desc,m.id desc
limit 21 offset least(1000,greatest(0,page_offset));
$$;
revoke all on function public.search_community_posts(text,text,text,text,timestamptz,timestamptz,text,integer) from public;
grant execute on function public.search_community_posts(text,text,text,text,timestamptz,timestamptz,text,integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
