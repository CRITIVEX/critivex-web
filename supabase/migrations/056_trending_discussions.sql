begin;
create function public.trending_discussions(hours integer default 24) returns table(id uuid,username text,summary text,likes bigint,comments bigint,participants bigint)
language sql stable security invoker set search_path='' as $$
with candidates as (
 select s.id,s.body,s.spoiler,s.created_at,p.username::text
 from public.social_posts s join public.profiles p on p.user_id=s.user_id
 where hours in (24,168) and p.is_public and p.username is not null and not public.social_blocked(s.user_id)
 and s.created_at>=now()-make_interval(hours=>hours)
 order by s.created_at desc,s.id desc limit 500
), scored as (
 select c.*, (select count(*) from public.social_likes l where l.post_id=c.id) as likes,
 (select count(*) from public.social_comments m where m.post_id=c.id) as comments,
 (select count(distinct m.user_id) from public.social_comments m where m.post_id=c.id) as participants
 from candidates c
)
select s.id,s.username,case when s.spoiler then 'Discussion contains spoilers' else left(s.body,140) end,s.likes,s.comments,s.participants
from scored s where s.likes+s.comments>0
order by (ln(1+s.likes)+2*ln(1+s.comments)+3*ln(1+s.participants))/(1+greatest(0,extract(epoch from now()-s.created_at)/86400)) desc,s.created_at desc,s.id desc limit 10;
$$;
revoke all on function public.trending_discussions(integer) from public;
grant execute on function public.trending_discussions(integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
