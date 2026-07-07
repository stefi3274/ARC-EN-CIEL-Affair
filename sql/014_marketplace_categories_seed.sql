-- ============================================================
-- Categories Marketplace — seed complet et elargi
-- (idempotent : peut etre relance sans creer de doublons)
-- ============================================================

insert into marketplace.categories (name, slug) values
  ('Vêtements', 'vetements'),
  ('Mode', 'mode'),
  ('Accessoires', 'accessoires'),
  ('Art & décoration', 'art-decoration'),
  ('Art et artisanat', 'art-artisanat'),
  ('Nourriture', 'nourriture'),
  ('Sport', 'sport'),
  ('Beauté & bien-être', 'beaute-bien-etre'),
  ('Livres & médias', 'livres-medias'),
  ('Services', 'services')
on conflict (slug) do nothing;
