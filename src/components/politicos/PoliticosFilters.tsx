'use client'
import { useRouter } from 'next/navigation'

type Opt = { value: string; label: string }

interface Props {
  states: Opt[]
  positions: Opt[]
  parties: Opt[]
  municipalities: Opt[]
  current: { estado: string; cargo: string; partido: string; cidade: string }
}

function Select({
  label, value, onChange, options, placeholder, disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Opt[]
  placeholder: string
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859]/30 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export function PoliticosFilters({ states, positions, parties, municipalities, current }: Props) {
  const router = useRouter()

  function navigate(next: Partial<typeof current>) {
    const merged = { ...current, ...next }
    const params = new URLSearchParams()
    if (merged.estado) params.set('estado', merged.estado)
    if (merged.cargo) params.set('cargo', merged.cargo)
    if (merged.partido) params.set('partido', merged.partido)
    if (merged.cidade) params.set('cidade', merged.cidade)
    const qs = params.toString()
    router.push(qs ? `/politicos?${qs}` : '/politicos')
  }

  const hasFilters = current.estado || current.cargo || current.partido || current.cidade

  return (
    <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Estado"
          value={current.estado}
          placeholder="Todos os estados"
          options={states}
          // trocar estado reseta a cidade
          onChange={v => navigate({ estado: v, cidade: '' })}
        />
        <Select
          label="Cidade"
          value={current.cidade}
          placeholder={current.estado ? 'Todas as cidades' : 'Escolha um estado'}
          options={municipalities}
          disabled={!current.estado}
          onChange={v => navigate({ cidade: v })}
        />
        <Select
          label="Cargo"
          value={current.cargo}
          placeholder="Todos os cargos"
          options={positions}
          onChange={v => navigate({ cargo: v })}
        />
        <Select
          label="Partido"
          value={current.partido}
          placeholder="Todos os partidos"
          options={parties}
          onChange={v => navigate({ partido: v })}
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push('/politicos')}
          className="mt-3 text-xs font-medium text-gray-500 hover:text-[#00A859] transition-colors"
        >
          ✕ Limpar filtros
        </button>
      )}
    </div>
  )
}
