-- ============================================================
-- Question hebdomadaire (au lieu de quotidienne) + notification
-- de rappel automatique chaque lundi (via pg_cron si disponible).
-- ============================================================

-- Autoriser le nouveau type de notification 'journal_prompt'
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'notifications.items'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%type%';
  if cname is not null then
    execute format('alter table notifications.items drop constraint %I', cname);
  end if;
end $$;

alter table notifications.items add constraint items_type_check
  check (type in (
    'new_match','new_message','application_received','application_status',
    'petition_signature','event_rsvp','group_join','listing_boost_update',
    'journal_prompt'
  ));

-- Fonction qui envoie la notification de la question de la semaine a tout le monde
create or replace function journal.notify_weekly_prompt()
returns void
language plpgsql security definer as $$
declare
  prompt_count int;
  week_index int;
  chosen_question text;
  user_record record;
begin
  select count(*) into prompt_count from journal.prompts;
  if prompt_count = 0 then
    return;
  end if;

  week_index := (extract(week from now())::int) % prompt_count;
  select question into chosen_question from journal.prompts offset week_index limit 1;

  for user_record in select id from core.profiles loop
    insert into notifications.items (user_id, type, title, body)
    values (user_record.id, 'journal_prompt', 'Question de la semaine', chosen_question);
  end loop;
end;
$$;

-- Planification automatique chaque lundi 8h — necessite l'extension pg_cron.
-- Si ton plan Supabase ne la supporte pas, cette ligne renverra une erreur :
-- ignore-la simplement, le rappel restera assure cote client (voir le code).
create extension if not exists pg_cron;

select cron.schedule(
  'weekly-journal-prompt',
  '0 8 * * 1',
  $$select journal.notify_weekly_prompt();$$
);
