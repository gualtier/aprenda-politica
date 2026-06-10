-- Agregação de emendas por função (PostgREST não permite aggregate functions direto).
-- Read-only; respeita os mesmos dados públicos da tabela emendas.
CREATE OR REPLACE FUNCTION emendas_por_funcao()
RETURNS TABLE(funcao text, total_pago numeric, n bigint)
LANGUAGE sql STABLE
AS $$
  SELECT e.funcao, COALESCE(SUM(e.valor_pago), 0)::numeric AS total_pago, COUNT(*)::bigint AS n
  FROM emendas e
  WHERE e.funcao IS NOT NULL
  GROUP BY e.funcao;
$$;

GRANT EXECUTE ON FUNCTION emendas_por_funcao() TO anon, authenticated;
