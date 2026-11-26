begin;
alter table public.social_posts add column game_id uuid references public.games(id) on delete set null, add column spoiler boolean not null default false;
create index social_posts_game_idx on public.social_posts(game_id,created_at desc) where game_id is not null;
create function public.set_post_metadata(post uuid,game uuid,contains_spoilers boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or contains_spoilers is null then raise exception 'Invalid request'; end if;
 update public.social_posts set game_id=game,spoiler=contains_spoilers where id=post and user_id=auth.uid();
 if not found then raise exception 'Post unavailable'; end if;
end $$;
revoke all on function public.set_post_metadata(uuid,uuid,boolean) from public,anon;
grant execute on function public.set_post_metadata(uuid,uuid,boolean) to authenticated;
notify pgrst,'reload schema';
commit;
