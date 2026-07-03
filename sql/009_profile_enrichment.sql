-- ============================================================
-- Profil Rencontre enrichi (talents/reves/buts) + statuts avec photo
-- ============================================================

alter table dating.profiles
add column talents text,
add column dreams text,
add column goals text;

alter table dating.statuses
add column media_url text;

-- Decouverte : renvoie aussi les nouveaux champs et la photo de statut
drop function if exists dating.discover_profiles(int);

create or replace function dating.discover_profiles(limit_count int default 20)
returns table (
  user_id uuid, bio text, photos jsonb, age int, public_key bytea,
  status_text text, status_media_url text, status_expires_at timestamptz,
  talents text, dreams text, goals text
)
language plpgsql security definer as $$
begin
  return query
    select p.user_id, p.bio, p.photos, p.age, p.public_key,
           s.content, s.media_url, s.expires_at,
           p.talents, p.dreams, p.goals
    from dating.profiles p
    left join lateral (
      select st.content, st.media_url, st.expires_at from dating.statuses st
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
