-- ============================================================
-- Preferences de personnalisation (couleur d'accent, police)
-- ============================================================

alter table core.profiles
add column theme_accent text,
add column theme_font text;
