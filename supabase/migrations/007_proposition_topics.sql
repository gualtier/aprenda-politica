-- Tema curado (taxonomia) por proposição, pré-calculado.
ALTER TABLE propositions ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_propositions_topics ON propositions USING GIN (topics);
