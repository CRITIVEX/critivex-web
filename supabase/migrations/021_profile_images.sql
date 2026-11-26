begin;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-images','profile-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy profile_images_insert on storage.objects for insert to authenticated
with check (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy profile_images_select on storage.objects for select to authenticated
using (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy profile_images_delete on storage.objects for delete to authenticated
using (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
