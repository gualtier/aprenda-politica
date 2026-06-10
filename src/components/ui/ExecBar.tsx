import { formatMoney } from '@/lib/emendas'

/** Régua de execução orçamentária: empenhado → pago + barra de % executado. */
export function ExecBar({ empenhado, pago, className = '' }: { empenhado: number; pago: number; className?: string }) {
  const pct = empenhado > 0 ? Math.min(100, Math.round((pago / empenhado) * 100)) : null
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] mb-1">
        <span className="text-gray-400">Empenhado <b className="text-gray-700 font-semibold">{formatMoney(empenhado)}</b></span>
        <span className="text-gray-400">Pago <b className="text-verde-600 font-semibold">{formatMoney(pago)}</b></span>
        {pct !== null && <span className="ml-auto text-gray-400 font-medium">{pct}% executado</span>}
      </div>
      {pct !== null && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#009C3B' : '#00A859' }} />
        </div>
      )}
    </div>
  )
}
