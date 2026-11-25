-- Restore restricted server-side catalogue import rights.
-- service_role is privileged; never grant these writes to anon or authenticated.
begin;
grant usage on schema public to service_role;
grant select, insert, update on table public.games to service_role;
commit;
