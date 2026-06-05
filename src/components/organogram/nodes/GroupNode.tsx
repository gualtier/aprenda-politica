'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Avatar } from '@/components/ui/Avatar'
import type { Politician } from '@/types'

interface GroupNodeData {
  politicians: Politician[]
  label: string
  borderColor: string
  onSelect: (p: Politician) => void
}

export const GroupNode = memo(({ data }: NodeProps) => {
  const { politicians, label, borderColor = '#009c3b', onSelect } = data as GroupNodeData
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-3 min-w-[280px] max-w-[480px]"
      style={{ border: `2px solid ${borderColor}` }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: borderColor }}>
        {politicians.length} {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {politicians.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
            title={p.name}
          >
            <Avatar name={p.name} photoUrl={p.photo_url} size={40} />
            <span className="text-[9px] text-gray-600 text-center leading-tight max-w-[44px] truncate">
              {p.name.split(' ')[0]}
            </span>
            {p.party && (
              <span className="text-[8px] text-gray-400">{p.party.abbr}</span>
            )}
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})

GroupNode.displayName = 'GroupNode'
