-- ============================================================
-- Module Agenda — permissions du schema (jamais faites jusqu'ici)
-- ============================================================

grant usage on schema events to anon, authenticated, service_role;
grant all on all tables in schema events to anon, authenticated, service_role;
grant all on all sequences in schema events to anon, authenticated, service_role;
grant all on all routines in schema events to anon, authenticated, service_role;
alter default privileges in schema events grant all on tables to anon, authenticated, service_role;
alter default privileges in schema events grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema events grant all on routines to anon, authenticated, service_role;
