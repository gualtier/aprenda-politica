'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Avatar } from '@/components/ui/Avatar'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PoliticianNodeData {
  politician: Politician
  borderColor: string
  onSelect: (p: Politician) => void
}

export const PoliticianNode = memo(({ data }: NodeProps) => {
  const { politician: p, borderColor = '#009c3b', onSelect } = data as unknown as PoliticianNodeData
  return (
    <div
      className="bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow p-3 flex items-center gap-3 min-w-[160px] max-w-[200px]"
      style={{ border: `2px solid ${borderColor}` }}
      onClick={() => onSelect(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(p)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Avatar name={p.name} photoUrl={p.photo_url} size={44} />
      <div className="min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">{p.name}</div>
        <div className="text-xs truncate" style={{ color: borderColor }}>
          {p.party?.abbr ?? '—'} · {p.position?.name ?? ''}
        </div>
        <div className="text-xs text-gray-400">{formatMandate(p.mandate_start, p.mandate_end)}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})

PoliticianNode.displayName = 'PoliticianNode'
