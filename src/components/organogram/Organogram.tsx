'use client'
import { useState, useCallback } from 'react'
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PoliticianNode } from './nodes/PoliticianNode'
import { GroupNode } from './nodes/GroupNode'
import { PoliticianPanel } from './PoliticianPanel'
import type { OrganogramData, Politician } from '@/types'

const COLORS = {
  federal: '#2255aa',
  estadual: '#007a30',
  municipal: '#cc9900',
}

const NODE_TYPES = { politician: PoliticianNode, group: GroupNode }

interface OrganogramProps {
  data: OrganogramData
}

export function Organogram({ data }: OrganogramProps) {
  const [selected, setSelected] = useState<Politician | null>(null)

  const handleSelect = useCallback((p: Politician) => setSelected(p), [])

  const nodes: Node[] = []
  const edges: Edge[] = []
  let yOffset = 0
  const X_CENTER = 400
  const Y_GAP = 220

  function addLevel(
    levelKey: 'federal' | 'estadual' | 'municipal',
    label: string,
    execPoliticians: Politician[],
    legPoliticians: Politician[],
    legLabel: string,
    extraLeg?: { politicians: Politician[]; label: string }
  ) {
    const color = COLORS[levelKey]
    const labelNodeId = `label-${levelKey}`

    nodes.push({
      id: labelNodeId,
      type: 'default',
      position: { x: 0, y: yOffset },
      data: { label },
      style: { background: color, color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700 },
      draggable: false,
    })

    yOffset += 50

    if (execPoliticians.length === 1) {
      const nodeId = `exec-${levelKey}`
      nodes.push({
        id: nodeId,
        type: 'politician',
        position: { x: X_CENTER - 340, y: yOffset },
        data: { politician: execPoliticians[0], borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    if (legPoliticians.length > 0) {
      const nodeId = `leg-${levelKey}-main`
      nodes.push({
        id: nodeId,
        type: 'group',
        position: { x: X_CENTER - 100, y: yOffset },
        data: { politicians: legPoliticians, label: legLabel, borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    if (extraLeg && extraLeg.politicians.length > 0) {
      const nodeId = `leg-${levelKey}-extra`
      nodes.push({
        id: nodeId,
        type: 'group',
        position: { x: X_CENTER + 300, y: yOffset },
        data: { politicians: extraLeg.politicians, label: extraLeg.label, borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    yOffset += Y_GAP
  }

  addLevel('federal', 'Federal', data.federal.executive, data.federal.legislative.camara, 'Dep. Federais', { politicians: data.federal.legislative.senado, label: 'Senadores' })
  addLevel('estadual', `Estadual · ${data.state.abbr}`, data.estadual.executive, data.estadual.legislative, 'Dep. Estaduais')
  if (data.municipal) {
    addLevel('municipal', `Municipal · ${data.municipality?.name}`, data.municipal.executive, data.municipal.legislative, 'Vereadores')
  }

  return (
    <div className="w-full" style={{ height: yOffset + 100 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-[#f9f9f7]"
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
          <PoliticianPanel politician={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
