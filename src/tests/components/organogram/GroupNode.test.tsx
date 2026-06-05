import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { GroupNode } from '@/components/organogram/nodes/GroupNode'
import type { Politician } from '@/types'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
}))

const mockPoliticians: Politician[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `Vereador ${i + 1}`,
  slug: `vereador-${i + 1}`,
  photo_url: null,
  party_id: null,
  position_id: 7,
  mandate_start: null,
  mandate_end: null,
  state_id: 32,
  municipality_id: 1,
  external_id: null,
  source: null,
}))

describe('GroupNode', () => {
  it('renders all politician avatars', () => {
    const props = {
      data: { politicians: mockPoliticians, label: 'Vereadores', onSelect: vi.fn() },
    } as any
    render(<GroupNode {...props} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3)
  })

  it('renders count label', () => {
    const props = {
      data: { politicians: mockPoliticians, label: 'Vereadores', onSelect: vi.fn() },
    } as any
    render(<GroupNode {...props} />)
    expect(screen.getByText('3 Vereadores')).toBeInTheDocument()
  })
})
