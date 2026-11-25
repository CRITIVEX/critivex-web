begin;
create function public.publish_draft(draft_id uuid, article_slug text) returns uuid language plpgsql security invoker set search_path='' as $$
declare d public.editorial_drafts; result_id uuid; game uuid; rating integer;
begin
if not public.has_staff_role(array['admin','editor']) then raise exception 'Editor access required'; end if;
select * into d from public.editorial_drafts where id=draft_id for update;
if not found or d.status<>'approved' then raise exception 'Approved draft required'; end if;
if article_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Invalid slug'; end if;
if length(trim(d.title))=0 or length(trim(coalesce(d.content->>'body','')))=0 then raise exception 'Title and body required'; end if;
if d.kind='game' then
insert into public.games(slug,title) values(article_slug,d.title) returning id into result_id;
else
if d.kind='review' then
select id into game from public.games where slug=d.content->>'gameSlug';
rating:=(d.content->>'score')::integer;
if game is null or rating is null or rating not between 0 and 100 or length(trim(coalesce(d.content->>'disclosure','')))=0 then raise exception 'Review requires game, score and disclosure'; end if;
end if;
insert into public.articles(slug,title,body,kind,game_id,score,published_at,disclosure,author_id,summary) values(article_slug,d.title,d.content->>'body',d.kind,game,rating,now(),d.content->>'disclosure',d.owner_id,coalesce(d.content->>'summary','')) returning id into result_id;
end if;
delete from public.editorial_drafts where id=draft_id;
return result_id;
end $$;
revoke all on function public.publish_draft(uuid,text) from public;
grant execute on function public.publish_draft(uuid,text) to authenticated;
commit;