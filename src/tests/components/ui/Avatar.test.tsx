import { render, screen } from '@testing-library/react'
import { Avatar } from '@/components/ui/Avatar'

describe('Avatar', () => {
  it('renders image when photoUrl provided', () => {
    render(<Avatar name="Lula" photoUrl="https://example.com/lula.jpg" size={40} />)
    // next/image renders an img tag
    expect(document.querySelector('img')).not.toBeNull()
  })

  it('renders initials when no photo', () => {
    render(<Avatar name="Lorenzo Pazolini" photoUrl={null} size={40} />)
    expect(screen.getByText('LP')).toBeInTheDocument()
  })
})
