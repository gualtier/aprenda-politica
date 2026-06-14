import { Fonte } from '@/components/ui/Fonte'
export function SourceTag({ name, domain, light = false, className = '' }: { name: string | null; domain: string | null; light?: boolean; className?: string }) {
  return (
    <Fonte
      variant="badge"
      light={light}
      className={className}
      sources={[{ fonte: 'veiculo', nome: name ?? 'Fonte', domain: domain ?? undefined }]}
    />
  )
}
