-- ============================================================
-- Permissions du schema notifications (jamais faites jusqu'ici)
-- + activation du temps reel pour la cloche de notifications
-- (les groupes utilisent le schema social, deja accorde)
-- ============================================================

grant usage on schema notifications to anon, authenticated, service_role;
grant all on all tables in schema notifications to anon, authenticated, service_role;
grant all on all sequences in schema notifications to anon, authenticated, service_role;
grant all on all routines in schema notifications to anon, authenticated, service_role;
alter default privileges in schema notifications grant all on tables to anon, authenticated, service_role;
alter default privileges in schema notifications grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema notifications grant all on routines to anon, authenticated, service_role;

alter publication supabase_realtime add table notifications.items;
