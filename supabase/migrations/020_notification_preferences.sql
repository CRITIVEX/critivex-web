begin;
create table public.notification_preferences (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 review_updates boolean not null default true,
 release_alerts boolean not null default false,
 wishlist_alerts boolean not null default false,
 gaming_news boolean not null default false,
 community_activity boolean not null default false,
 marketing_email boolean not null default false
);
alter table public.notification_preferences enable row level security;
create policy notification_preferences_owner on public.notification_preferences
 for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
revoke all on public.notification_preferences from anon;
grant select,insert,update on public.notification_preferences to authenticated;
notify pgrst,'reload schema';
commit;
