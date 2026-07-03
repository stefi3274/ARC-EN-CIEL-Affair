-- ============================================================
-- Photos sur le Fil (nouveau bucket) + permissions du schema
-- moderation (jamais faites jusqu'ici)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

drop policy if exists "posts_bucket_public_read" on storage.objects;
drop policy if exists "posts_bucket_owner_write" on storage.objects;
drop policy if exists "posts_bucket_owner_delete" on storage.objects;

create policy "posts_bucket_public_read" on storage.objects
  for select using (bucket_id = 'posts');
create policy "posts_bucket_owner_write" on storage.objects
  for insert with check (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "posts_bucket_owner_delete" on storage.objects
  for delete using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

grant usage on schema moderation to anon, authenticated, service_role;
grant all on all tables in schema moderation to anon, authenticated, service_role;
grant all on all sequences in schema moderation to anon, authenticated, service_role;
grant all on all routines in schema moderation to anon, authenticated, service_role;
alter default privileges in schema moderation grant all on tables to anon, authenticated, service_role;
alter default privileges in schema moderation grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema moderation grant all on routines to anon, authenticated, service_role;
