import { sourceLogo } from '@/lib/news'
export function SourceTag({ name, domain, light = false, className = '' }: { name: string | null; domain: string | null; light?: boolean; className?: string }) {
  const logo = sourceLogo(domain)
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      {logo
        ? <img src={logo} alt="" width={16} height={16} className="w-4 h-4 rounded-sm object-contain shrink-0 bg-white/90" loading="lazy" />
        : <span className="w-4 h-4 rounded-sm bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0">{(name ?? '?').slice(0, 1)}</span>}
      <span className={`text-xs font-medium truncate ${light ? 'text-white/90' : 'text-gray-500'}`}>{name ?? 'Fonte'}</span>
    </span>
  )
}
