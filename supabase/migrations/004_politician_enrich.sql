-- Enrich politicians with bio, proposals and political spectrum
ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS proposals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS spectrum_position INTEGER;

-- Add spectrum_position to parties and seed from ideology
ALTER TABLE parties
  ADD COLUMN IF NOT EXISTS spectrum_position INTEGER;

UPDATE parties SET spectrum_position = -80 WHERE ideology = 'Esquerda';
UPDATE parties SET spectrum_position = -40 WHERE ideology = 'Centro-Esquerda';
UPDATE parties SET spectrum_position =   0 WHERE ideology = 'Centro';
UPDATE parties SET spectrum_position =  40 WHERE ideology = 'Centro-Direita';
UPDATE parties SET spectrum_position =  80 WHERE ideology = 'Direita';
