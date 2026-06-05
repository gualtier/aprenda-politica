import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { PoliticianNode } from '@/components/organogram/nodes/PoliticianNode'
import type { Politician } from '@/types'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
}))

const mockPolitician: Politician = {
  id: 1,
  name: 'Lorenzo Pazolini',
  slug: 'lorenzo-pazolini',
  photo_url: null,
  party_id: 1,
  position_id: 6,
  mandate_start: '2025-01-01',
  mandate_end: '2028-12-31',
  state_id: 32,
  municipality_id: 1,
  external_id: null,
  source: null,
  party: { id: 1, name: 'Republicanos', abbr: 'REP', color_hex: '#ff6600' },
  position: {
    id: 6,
    name: 'Prefeito',
    slug: 'prefeito',
    level: 'municipal',
    branch: 'executive',
    description: null,
  },
}

describe('PoliticianNode', () => {
  it('renders politician name', () => {
    const props = { data: { politician: mockPolitician, onSelect: vi.fn() } } as any
    render(<PoliticianNode {...props} />)
    expect(screen.getByText('Lorenzo Pazolini')).toBeInTheDocument()
  })

  it('renders party abbreviation', () => {
    const props = { data: { politician: mockPolitician, onSelect: vi.fn() } } as any
    render(<PoliticianNode {...props} />)
    expect(screen.getByText(/REP/)).toBeInTheDocument()
  })
})
