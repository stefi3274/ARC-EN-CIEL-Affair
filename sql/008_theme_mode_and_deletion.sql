-- ============================================================
-- Mode clair/sombre (preference utilisateur)
-- ============================================================

alter table core.profiles
add column theme_mode text default 'dark';

-- Rien d'autre a ajouter en SQL pour la suppression de compte :
-- auth.users -> core.profiles est deja "on delete cascade", et la
-- quasi-totalite des tables utilisateur cascadent depuis la aussi.
-- La suppression reelle se fait via une Edge Function (service_role),
-- voir plus bas dans la reponse.
