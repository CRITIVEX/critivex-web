begin;
grant select on public.staff_roles,public.audit_events to authenticated;
grant select,insert,update,delete on public.editorial_drafts to authenticated;
grant select,insert,update on public.content_reports to authenticated;
grant select,insert,update on public.publisher_submissions to authenticated;
grant select on public.games,public.articles,public.critic_reviews to anon,authenticated;
grant insert,update,delete on public.games,public.articles,public.critic_reviews to authenticated;
create trigger drafts_audit after insert or update or delete on public.editorial_drafts for each row execute function public.record_editorial_event();
commit;