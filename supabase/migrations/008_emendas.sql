-- Emendas parlamentares (nível de linha de execução: emenda × localidade × função).
CREATE TABLE IF NOT EXISTS emendas (
  id              BIGSERIAL PRIMARY KEY,
  codigo          TEXT NOT NULL,
  ano             INTEGER,
  numero          TEXT,
  tipo            TEXT,
  tipo_grupo      TEXT,          -- 'individual'|'bancada'|'comissao'|'relator'
  autor_nome      TEXT,
  politician_id   BIGINT REFERENCES politicians(id),
  funcao          TEXT,
  subfuncao       TEXT,
  localidade_raw  TEXT,
  municipality_id BIGINT REFERENCES municipalities(id),
  uf              TEXT,
  valor_empenhado NUMERIC DEFAULT 0,
  valor_liquidado NUMERIC DEFAULT 0,
  valor_pago      NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(codigo, localidade_raw, funcao, ano)
);

CREATE INDEX IF NOT EXISTS idx_emendas_politician   ON emendas (politician_id);
CREATE INDEX IF NOT EXISTS idx_emendas_municipality ON emendas (municipality_id);
CREATE INDEX IF NOT EXISTS idx_emendas_ano          ON emendas (ano);
CREATE INDEX IF NOT EXISTS idx_emendas_uf           ON emendas (uf);
CREATE INDEX IF NOT EXISTS idx_emendas_funcao       ON emendas (funcao);
CREATE INDEX IF NOT EXISTS idx_emendas_tipo_grupo   ON emendas (tipo_grupo);

ALTER TABLE emendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON emendas;
CREATE POLICY public_read ON emendas FOR SELECT USING (true);
