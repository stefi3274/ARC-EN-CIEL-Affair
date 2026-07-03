-- ============================================================
-- Messagerie — recuperation securisee de la cle publique d'un
-- match (impossible autrement, dating.profiles est verrouille
-- au proprietaire uniquement) + activation du temps reel.
-- ============================================================

create or replace function dating.get_match_public_key(other_user_id uuid)
returns bytea
language plpgsql security definer as $$
declare
  result bytea;
begin
  if not exists (
    select 1 from dating.matches m
    where (m.user_a = auth.uid() and m.user_b = other_user_id)
       or (m.user_a = other_user_id and m.user_b = auth.uid())
  ) then
    return null;
  end if;

  select public_key into result from dating.profiles where user_id = other_user_id;
  return result;
end; $$;

-- Temps reel sur les nouveaux messages (respecte deja les RLS existantes :
-- seuls les participants d'un match recoivent les evenements de ce match)
alter publication supabase_realtime add table dating.messages;
