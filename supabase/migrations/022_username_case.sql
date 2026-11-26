begin;
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$');
create unique index if not exists profiles_username_ci_unique on public.profiles(lower(username)) where username is not null;
notify pgrst,'reload schema';
commit;
