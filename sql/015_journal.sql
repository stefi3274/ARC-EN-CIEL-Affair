-- ============================================================
-- Journal intime — prive par defaut, partage optionnel avec un
-- partenaire (invitation mutuelle, acceptation requise), avec
-- des questions pour renforcer la relation.
-- ============================================================

create schema if not exists journal;

create table journal.prompts (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  category text
);

create table journal.partners (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  initiated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create table journal.entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid references journal.prompts(id),
  content text not null,
  mood text,
  shared_with_partner boolean not null default false,
  created_at timestamptz not null default now()
);

alter table journal.prompts enable row level security;
alter table journal.partners enable row level security;
alter table journal.entries enable row level security;

create policy "journal_prompts_readable" on journal.prompts for select using (true);

create policy "journal_partners_participant_read" on journal.partners
  for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "journal_partners_create" on journal.partners
  for insert with check (auth.uid() = initiated_by and (auth.uid() = user_a or auth.uid() = user_b));
create policy "journal_partners_participant_update" on journal.partners
  for update using (auth.uid() = user_a or auth.uid() = user_b);

create policy "journal_entries_owner_all" on journal.entries
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "journal_entries_partner_read" on journal.entries
  for select using (
    shared_with_partner = true
    and exists (
      select 1 from journal.partners p
      where p.status = 'accepted'
      and ((p.user_a = auth.uid() and p.user_b = author_id) or (p.user_b = auth.uid() and p.user_a = author_id))
    )
  );

grant usage on schema journal to anon, authenticated, service_role;
grant all on all tables in schema journal to anon, authenticated, service_role;
grant all on all sequences in schema journal to anon, authenticated, service_role;
grant all on all routines in schema journal to anon, authenticated, service_role;
alter default privileges in schema journal grant all on tables to anon, authenticated, service_role;
alter default privileges in schema journal grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema journal grant all on routines to anon, authenticated, service_role;

insert into journal.prompts (question, category) values
('Quel moment avec ton/ta partenaire t''a rendu le plus heureux cette semaine ?', 'gratitude'),
('Qu''est-ce que tu apprécies le plus chez l''autre en ce moment ?', 'gratitude'),
('Y a-t-il quelque chose que tu voudrais lui dire mais que tu n''as pas encore dit ?', 'communication'),
('Comment te sens-tu par rapport à la relation aujourd''hui ?', 'ressenti'),
('Quel est un rêve que vous pourriez réaliser ensemble ?', 'avenir'),
('Qu''est-ce qui te ferait sentir plus aimé cette semaine ?', 'intimite'),
('Quelle a été la plus grande difficulté que vous avez traversée ensemble, et qu''en avez-vous appris ?', 'croissance'),
('Qu''est-ce que tu voudrais que l''autre sache sur ce que tu ressens en ce moment ?', 'communication'),
('Quel petit geste du quotidien de l''autre te touche le plus ?', 'gratitude'),
('Où vous voyez-vous, tous les deux, dans un an ?', 'avenir'),
('Qu''est-ce qui t''a fait sourire aujourd''hui ?', 'ressenti'),
('De quoi es-tu fier·ère dans votre relation ?', 'gratitude');
