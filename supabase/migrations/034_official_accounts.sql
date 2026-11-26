begin;
create table public.player_distinctions(user_id uuid primary key references auth.users(id) on delete cascade,kind text not null check(kind in ('founder','official','verified')),featured boolean not null default false);
alter table public.player_distinctions enable row level security;
create policy distinctions_read on public.player_distinctions for select using(exists(select 1 from public.profiles p where p.user_id=player_distinctions.user_id and p.is_public));
revoke all on public.player_distinctions from anon,authenticated;
grant select on public.player_distinctions to anon,authenticated;
insert into public.player_distinctions(user_id,kind,featured) select founder_id,'founder',true from public.founder_follow_config;
alter table public.social_posts add column pinned boolean not null default false,add column announcement boolean not null default false;
create unique index social_one_pin_per_player on public.social_posts(user_id) where pinned;
create function public.set_official_post(post uuid,pin boolean,announce boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.player_distinctions where user_id=auth.uid() and kind in ('founder','official')) then raise exception 'Official account required'; end if;
 if not exists(select 1 from public.social_posts where id=post and user_id=auth.uid()) then raise exception 'Post not found'; end if;
 perform 1 from public.player_distinctions where user_id=auth.uid() for update;
 if pin then update public.social_posts set pinned=false where user_id=auth.uid() and pinned; end if;
 update public.social_posts set pinned=pin,announcement=announce where id=post and user_id=auth.uid();
end $$;
revoke all on function public.set_official_post(uuid,boolean,boolean) from public,anon;
grant execute on function public.set_official_post(uuid,boolean,boolean) to authenticated;
revoke update on public.social_posts from anon,authenticated;
revoke insert on public.social_posts from anon,authenticated;
grant insert(body,image_path) on public.social_posts to authenticated;
notify pgrst,'reload schema';
commit;
