'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Carregando mapa...
    </div>
  ),
})

export function BrazilMap() {
  const router = useRouter()

  function handleStateClick(stateSlug: string) {
    router.push(`/${stateSlug}`)
  }

  return <LeafletMapClient onStateClick={handleStateClick} />
}
