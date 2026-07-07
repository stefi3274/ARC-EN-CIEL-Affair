-- ============================================================
-- Le journal devient un vrai espace partage entre deux personnes
-- une fois l'invitation acceptee (comme SumOne) : plus de case a
-- cocher par entree, tout devient visible aux deux des l'instant
-- ou le partenariat est accepte.
-- ============================================================

drop policy if exists "journal_entries_partner_read" on journal.entries;

create policy "journal_entries_partner_read" on journal.entries
  for select using (
    exists (
      select 1 from journal.partners p
      where p.status = 'accepted'
      and ((p.user_a = auth.uid() and p.user_b = author_id) or (p.user_b = auth.uid() and p.user_a = author_id))
    )
  );
