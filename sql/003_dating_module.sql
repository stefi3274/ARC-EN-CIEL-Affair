-- ============================================================
-- Module Rencontre — statuts ephemeres + permissions du schema
-- ============================================================

-- Permissions (jamais faites pour ce schema jusqu'ici)
grant usage on schema dating to anon, authenticated, service_role;
grant all on all tables in schema dating to anon, authenticated, service_role;
grant all on all sequences in schema dating to anon, authenticated, service_role;
grant all on all routines in schema dating to anon, authenticated, service_role;
alter default privileges in schema dating grant all on tables to anon, authenticated, service_role;
alter default privileges in schema dating grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema dating grant all on routines to anon, authenticated, service_role;

-- Statuts ephemeres (24h), optionnels
create table dating.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table dating.statuses enable row level security;

create policy "statuses_owner_write" on dating.statuses
  for insert with check (auth.uid() = user_id);
create policy "statuses_owner_delete" on dating.statuses
  for delete using (auth.uid() = user_id);
create policy "statuses_readable_active" on dating.statuses
  for select using (expires_at > now());

-- Decouverte enrichie : inclut le statut actif (s'il y en a un)
drop function if exists dating.discover_profiles(int);

create or replace function dating.discover_profiles(limit_count int default 20)
returns table (
  user_id uuid, bio text, photos jsonb, age int, public_key bytea,
  status_text text, status_expires_at timestamptz
)
language plpgsql security definer as $$
begin
  return query
    select p.user_id, p.bio, p.photos, p.age, p.public_key, s.content, s.expires_at
    from dating.profiles p
    left join lateral (
      select st.content, st.expires_at from dating.statuses st
      where st.user_id = p.user_id and st.expires_at > now()
      order by st.created_at desc limit 1
    ) s on true
    where p.visible = true
      and p.public_key is not null
      and p.user_id <> auth.uid()
      and not exists (select 1 from dating.swipes sw where sw.swiper_id = auth.uid() and sw.swiped_id = p.user_id)
      and not exists (select 1 from moderation.blocks b where b.blocker_id = auth.uid() and b.blocked_id = p.user_id)
      and not exists (select 1 from moderation.blocks b where b.blocker_id = p.user_id and b.blocked_id = auth.uid())
    limit limit_count;
end; $$;

-- Les photos sont visibles pendant la decouverte (avant match), comme
-- attendu dans une app de rencontre. Les messages, eux, restent
-- strictement reserves aux matchs (deja en place, inchange).
drop policy if exists "dating_photos_owner_read" on storage.objects;

create policy "dating_photos_discoverable_read" on storage.objects
  for select using (
    bucket_id = 'dating-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from dating.profiles p
        where p.user_id::text = (storage.foldername(name))[1]
        and p.visible = true
      )
    )
  );
