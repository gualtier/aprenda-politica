-- Proposições legislativas como entidade de primeira classe.
CREATE TABLE IF NOT EXISTS propositions (
  id            BIGSERIAL PRIMARY KEY,
  source        TEXT NOT NULL,            -- 'camara' | 'senado' | 'ales'
  external_id   TEXT NOT NULL,
  type          TEXT NOT NULL,            -- 'PL','PEC','PLP','MP','PDL','PLV',...
  number        INTEGER,
  year          INTEGER,
  title         TEXT,                     -- ementa curta
  summary       TEXT,                     -- ementa completa
  presented_on  DATE,
  status        TEXT,
  themes        TEXT[] DEFAULT '{}',
  url           TEXT,
  party_ids     INTEGER[] DEFAULT '{}',
  slug          TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE TABLE IF NOT EXISTS proposition_authors (
  id                 BIGSERIAL PRIMARY KEY,
  proposition_id     BIGINT NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  politician_id      BIGINT REFERENCES politicians(id),
  author_name        TEXT NOT NULL,
  author_external_id TEXT,
  role               TEXT DEFAULT 'autor',
  ordem              INTEGER,
  UNIQUE(proposition_id, author_name)
);

CREATE INDEX IF NOT EXISTS idx_propositions_party_ids  ON propositions USING GIN (party_ids);
CREATE INDEX IF NOT EXISTS idx_propositions_themes     ON propositions USING GIN (themes);
CREATE INDEX IF NOT EXISTS idx_propositions_type       ON propositions (type);
CREATE INDEX IF NOT EXISTS idx_propositions_year       ON propositions (year);
CREATE INDEX IF NOT EXISTS idx_propositions_source     ON propositions (source);
CREATE INDEX IF NOT EXISTS idx_prop_authors_politician ON proposition_authors (politician_id);
CREATE INDEX IF NOT EXISTS idx_prop_authors_prop       ON proposition_authors (proposition_id);

-- RLS: leitura pública (anon) como nas demais tabelas; escrita só via service_role.
ALTER TABLE propositions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposition_authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON propositions;
CREATE POLICY public_read ON propositions FOR SELECT USING (true);
DROP POLICY IF EXISTS public_read ON proposition_authors;
CREATE POLICY public_read ON proposition_authors FOR SELECT USING (true);
