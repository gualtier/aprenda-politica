const IDEOLOGY_POSITION: Record<string, number> = {
  'Esquerda':        -80,
  'Centro-Esquerda': -40,
  'Centro':            0,
  'Centro-Direita':   40,
  'Direita':          80,
}

const IDEOLOGY_COLOR: Record<string, string> = {
  'Esquerda':        'bg-red-50 text-red-700 border-red-200',
  'Centro-Esquerda': 'bg-orange-50 text-orange-700 border-orange-200',
  'Centro':          'bg-gray-50 text-gray-600 border-gray-200',
  'Centro-Direita':  'bg-blue-50 text-blue-700 border-blue-200',
  'Direita':         'bg-indigo-50 text-indigo-700 border-indigo-200',
}

function markerBorderColor(pos: number): string {
  if (pos <= -50) return '#dc2626'
  if (pos <= -15) return '#ea580c'
  if (pos < 15)  return '#6b7280'
  if (pos <= 50) return '#3b82f6'
  return '#1d4ed8'
}

interface Props {
  position?: number | null
  ideology?: string | null
  showIdeologyBadge?: boolean
}

export function SpectrumBar({ position, ideology, showIdeologyBadge = true }: Props) {
  const pos = position ?? (ideology ? (IDEOLOGY_POSITION[ideology] ?? null) : null)
  if (pos === null || pos === undefined) return null

  const pct = ((pos + 100) / 200) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium select-none">
        <span>← Esquerda</span>
        <span>Centro</span>
        <span>Direita →</span>
      </div>
      <div className="relative py-1">
        <div
          className="h-3 rounded-full"
          style={{ background: 'linear-gradient(to right, #dc2626, #fb923c, #e5e7eb, #60a5fa, #1d4ed8)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-md border-2 z-10"
          style={{ left: `${pct}%`, borderColor: markerBorderColor(pos) }}
        />
      </div>
      {showIdeologyBadge && ideology && (
        <div className="mt-2 flex justify-center">
          <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${IDEOLOGY_COLOR[ideology] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {ideology}
          </span>
        </div>
      )}
    </div>
  )
}
