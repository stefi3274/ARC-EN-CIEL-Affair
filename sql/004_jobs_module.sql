-- ============================================================
-- Module Emploi — permissions du schema (jamais faites jusqu'ici)
-- ============================================================

grant usage on schema jobs to anon, authenticated, service_role;
grant all on all tables in schema jobs to anon, authenticated, service_role;
grant all on all sequences in schema jobs to anon, authenticated, service_role;
grant all on all routines in schema jobs to anon, authenticated, service_role;
alter default privileges in schema jobs grant all on tables to anon, authenticated, service_role;
alter default privileges in schema jobs grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema jobs grant all on routines to anon, authenticated, service_role;
