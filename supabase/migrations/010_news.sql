-- Notícias cívicas (agregador) + cruzamento com objetos do sistema.
CREATE TABLE IF NOT EXISTS news (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  source_name   TEXT,
  source_domain TEXT,
  source_url    TEXT NOT NULL,
  url_hash      TEXT UNIQUE NOT NULL,
  published_at  TIMESTAMPTZ,
  category      TEXT,
  sphere        TEXT,
  topics        TEXT[] DEFAULT '{}',
  cover_motif   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category  ON news (category);
CREATE INDEX IF NOT EXISTS idx_news_topics    ON news USING GIN (topics);

CREATE TABLE IF NOT EXISTS news_entities (
  id             BIGSERIAL PRIMARY KEY,
  news_id        BIGINT REFERENCES news(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,
  politician_id  BIGINT REFERENCES politicians(id),
  proposition_id BIGINT REFERENCES propositions(id),
  emenda_id      BIGINT REFERENCES emendas(id),
  orgao          TEXT,
  label          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_entities_news        ON news_entities (news_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_politician  ON news_entities (politician_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_proposition ON news_entities (proposition_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_emenda      ON news_entities (emenda_id);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_entities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON news;
CREATE POLICY public_read ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS public_read ON news_entities;
CREATE POLICY public_read ON news_entities FOR SELECT USING (true);
