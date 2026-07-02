-- ============================================================
-- Module Marketplace — permissions du schema (jamais faites jusqu'ici)
-- ============================================================

grant usage on schema marketplace to anon, authenticated, service_role;
grant all on all tables in schema marketplace to anon, authenticated, service_role;
grant all on all sequences in schema marketplace to anon, authenticated, service_role;
grant all on all routines in schema marketplace to anon, authenticated, service_role;
alter default privileges in schema marketplace grant all on tables to anon, authenticated, service_role;
alter default privileges in schema marketplace grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema marketplace grant all on routines to anon, authenticated, service_role;
