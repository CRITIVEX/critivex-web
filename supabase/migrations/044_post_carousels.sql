begin;
alter table public.social_posts add column image_paths text[] not null default '{}';
create function public.valid_post_images(paths text[],owner uuid) returns boolean language sql immutable set search_path='' as $$
 select cardinality(paths)<=4 and not exists(select 1 from unnest(paths) p where p is null or split_part(p,'/',1)<>owner::text or p !~ '^[0-9a-f-]+/[0-9a-f-]+\.(jpg|png|webp)$') and cardinality(paths)=(select count(distinct p) from unnest(paths) p);
$$;
alter table public.social_posts add constraint social_carousel_paths check(public.valid_post_images(image_paths,user_id));
grant insert(image_paths) on public.social_posts to authenticated;
create index social_posts_image_paths_idx on public.social_posts using gin(image_paths);
drop policy social_image_read on storage.objects;
create policy social_image_read on storage.objects for select using(bucket_id='social-images' and ((storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.social_posts p where p.image_path=storage.objects.name or p.image_paths @> array[storage.objects.name])));
notify pgrst,'reload schema';
commit;
