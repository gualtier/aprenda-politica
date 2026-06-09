-- Structured demographic fields (BI/ML-ready) for politicians.
-- Source: TSE consulta_cand (all) + Câmara/Senado (federal).
-- `occupation` already exists from a prior migration.

ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS birth_date     DATE,   -- data de nascimento
  ADD COLUMN IF NOT EXISTS gender         TEXT,   -- 'M' | 'F'
  ADD COLUMN IF NOT EXISTS education      TEXT,   -- escolaridade (rótulo TSE)
  ADD COLUMN IF NOT EXISTS race           TEXT,   -- cor/raça (DS_COR_RACA)
  ADD COLUMN IF NOT EXISTS marital_status TEXT,   -- estado civil
  ADD COLUMN IF NOT EXISTS birth_state    TEXT,   -- UF de nascimento (sigla)
  ADD COLUMN IF NOT EXISTS email          TEXT;

-- Índices para filtros/agregações de BI
CREATE INDEX IF NOT EXISTS idx_politicians_gender     ON politicians (gender);
CREATE INDEX IF NOT EXISTS idx_politicians_education  ON politicians (education);
CREATE INDEX IF NOT EXISTS idx_politicians_race       ON politicians (race);
CREATE INDEX IF NOT EXISTS idx_politicians_birth_date ON politicians (birth_date);
CREATE INDEX IF NOT EXISTS idx_politicians_occupation ON politicians (occupation);
