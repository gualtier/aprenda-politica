import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Organogram } from '@/components/organogram/Organogram'
import type { OrganogramData } from '@/types'

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, children }: { nodes?: { id: string; data?: { label?: string } }[]; children?: React.ReactNode }) => (
    <div data-testid="react-flow">
      {nodes?.map((node: any) => (
        <div key={node.id} data-testid={`node-${node.id}`}>
          {node.data?.label}
        </div>
      ))}
      {children}
    </div>
  ),
  Background: () => null,
  Controls: () => null,
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
  useNodesState: () => [[], vi.fn()],
  useEdgesState: () => [[], vi.fn()],
}))

const mockData: OrganogramData = {
  state: { id: 32, name: 'Espírito Santo', slug: 'espirito-santo', abbr: 'ES', ibge_code: 32 },
  municipality: { id: 1, name: 'Vitória', slug: 'vitoria', state_id: 32, ibge_code: 3205309, population: 365855 },
  federal: {
    executive: [{ id: 1, name: 'Lula', slug: 'lula', photo_url: null, party_id: null, position_id: 1, mandate_start: '2023-01-01', mandate_end: '2026-12-31', state_id: null, municipality_id: null, external_id: null, source: null, position: { id: 1, name: 'Presidente', slug: 'presidente', level: 'federal', branch: 'executive', description: null } }],
    legislative: { camara: [], senado: [] },
  },
  estadual: { executive: [], legislative: [] },
  municipal: { executive: [], legislative: [] },
}

describe('Organogram', () => {
  it('renders federal level label', () => {
    render(<Organogram data={mockData} />)
    expect(screen.getByText(/Federal/i)).toBeInTheDocument()
  })
  it('renders estadual level label', () => {
    render(<Organogram data={mockData} />)
    expect(screen.getByText(/Estadual/i)).toBeInTheDocument()
  })
})
