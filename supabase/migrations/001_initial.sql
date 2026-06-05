-- States
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  abbr CHAR(2) NOT NULL UNIQUE,
  ibge_code INT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipalities
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  ibge_code INT NOT NULL UNIQUE,
  population INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, state_id)
);

-- Parties
CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  abbr TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions (Presidente, Governador, Prefeito, Deputado Federal, etc.)
CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('federal', 'state', 'municipal')),
  branch TEXT NOT NULL CHECK (branch IN ('executive', 'legislative', 'judicial')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politicians
CREATE TABLE politicians (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  party_id INT REFERENCES parties(id),
  position_id INT REFERENCES positions(id),
  mandate_start DATE,
  mandate_end DATE,
  state_id INT REFERENCES states(id),
  municipality_id INT REFERENCES municipalities(id),
  external_id TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_politicians_state ON politicians(state_id);
CREATE INDEX idx_politicians_municipality ON politicians(municipality_id);
CREATE INDEX idx_politicians_position ON politicians(position_id);

-- Full-text search index (Portuguese)
ALTER TABLE politicians ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED;
CREATE INDEX idx_politicians_search ON politicians USING GIN(search_vector);

ALTER TABLE municipalities ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED;
CREATE INDEX idx_municipalities_search ON municipalities USING GIN(search_vector);

-- Sync log
CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  error TEXT,
  records_synced INT DEFAULT 0
);

-- Seed positions
INSERT INTO positions (name, slug, level, branch, description) VALUES
  ('Presidente da República', 'presidente', 'federal', 'executive', 'Chefe do Poder Executivo federal'),
  ('Senador', 'senador', 'federal', 'legislative', 'Representa o estado no Senado Federal'),
  ('Deputado Federal', 'deputado-federal', 'federal', 'legislative', 'Representa o estado na Câmara dos Deputados'),
  ('Governador', 'governador', 'state', 'executive', 'Chefe do Poder Executivo estadual'),
  ('Deputado Estadual', 'deputado-estadual', 'state', 'legislative', 'Membro da Assembleia Legislativa estadual'),
  ('Prefeito', 'prefeito', 'municipal', 'executive', 'Chefe do Poder Executivo municipal'),
  ('Vereador', 'vereador', 'municipal', 'legislative', 'Membro da Câmara Municipal');
