import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { PoliticianPanel } from '@/components/organogram/PoliticianPanel'

const p = {
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
    level: 'municipal' as const,
    branch: 'executive' as const,
    description: null,
  },
}

describe('PoliticianPanel', () => {
  it('shows politician name when open', () => {
    render(<PoliticianPanel politician={p} onClose={vi.fn()} />)
    expect(screen.getByText('Lorenzo Pazolini')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<PoliticianPanel politician={p} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
