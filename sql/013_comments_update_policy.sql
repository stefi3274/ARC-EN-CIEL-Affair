-- ============================================================
-- Autoriser la modification de ses propres commentaires
-- (l'insertion et la suppression existaient deja, pas la modification)
-- ============================================================

drop policy if exists "comments_owner_update" on social.comments;
create policy "comments_owner_update" on social.comments
  for update using (auth.uid() = author_id);
