const TONE: Record<string, { bg: string; fg: string }> = {
  federal:   { bg: 'bg-esfera-federal',   fg: 'text-white' },
  estadual:  { bg: 'bg-esfera-estadual',  fg: 'text-white' },
  municipal: { bg: 'bg-amarelo-600',      fg: 'text-white' },
}
const EMOJI: Record<string, string> = {
  congresso: '🏛️', cupula: '🏛️', palacio: '🏛️', urna: '🗳️', grafico: '📊', cidade: '🏙️', balanca: '⚖️',
}
export function NewsCover({ motif, sphere, imageUrl, className = '' }: { motif: string | null; sphere: string | null; imageUrl?: string | null; className?: string }) {
  const tone = TONE[sphere ?? 'federal'] ?? TONE.federal
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${tone.bg} ${className}`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,.5) 0, transparent 45%), linear-gradient(135deg, rgba(255,255,255,.15), transparent)' }} />
      <div className={`absolute inset-0 flex items-center justify-center text-5xl ${tone.fg}`}>{EMOJI[motif ?? 'congresso'] ?? '🏛️'}</div>
    </div>
  )
}
