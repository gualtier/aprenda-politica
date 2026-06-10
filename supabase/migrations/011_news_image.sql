-- Foto da notícia (og:image do veículo, resolvido a partir do link do Google News).
ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;
