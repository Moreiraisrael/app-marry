import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CapsuleCard } from '@/components/capsules/CapsuleCard'
import { LookCapsule } from '@/lib/actions/capsules'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      <div {...props}>{children}</div>,
  },
}))

// Mock next/image — strip fill to avoid DOM warnings
vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, className }: {
    src: string; alt: string; fill?: boolean; className?: string
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}))

// ─── Fixture ─────────────────────────────────────────────────

const baseCapsule: LookCapsule = {
  id: 'cap-1',
  client_id: 'client-1',
  name: 'Look de Trabalho',
  item_ids: ['item-1', 'item-2'],
  occasion: 'Trabalho',
  description: 'Elegante para reuniões',
  created_at: new Date().toISOString(),
  client_name: 'Maria Fernanda',
  item_photos: [],
}

// ─── Tests ───────────────────────────────────────────────────

describe('CapsuleCard', () => {
  it('exibe o nome do look', () => {
    render(<CapsuleCard capsule={baseCapsule} index={0} />)
    expect(screen.getByText('Look de Trabalho')).toBeInTheDocument()
  })

  it('exibe o nome da cliente', () => {
    render(<CapsuleCard capsule={baseCapsule} index={0} />)
    expect(screen.getByText('Maria Fernanda')).toBeInTheDocument()
  })

  it('exibe a contagem correta de peças (2 peças)', () => {
    render(<CapsuleCard capsule={baseCapsule} index={0} />)
    expect(screen.getByText('2 peças')).toBeInTheDocument()
  })

  it('exibe o badge de ocasião', () => {
    render(<CapsuleCard capsule={baseCapsule} index={0} />)
    expect(screen.getByText('Trabalho')).toBeInTheDocument()
  })

  it('exibe "Cliente" como fallback quando client_name é null', () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, client_name: null }} index={0} />)
    expect(screen.getByText('Cliente')).toBeInTheDocument()
  })

  it('não quebra quando item_ids está vazio (0 peças)', () => {
    render(<CapsuleCard capsule={{ ...baseCapsule, item_ids: [] }} index={0} />)
    expect(screen.getByText('0 peças')).toBeInTheDocument()
  })

  it('renderiza imagem quando há 1 photo', () => {
    const capsuleWithPhoto = {
      ...baseCapsule,
      item_photos: ['https://example.com/photo.jpg'],
    }
    render(<CapsuleCard capsule={capsuleWithPhoto} index={0} />)
    const img = screen.getByRole('img', { name: 'Look de Trabalho' })
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renderiza 4 imagens em mosaico quando há 4 fotos', () => {
    const capsuleWithPhotos = {
      ...baseCapsule,
      item_photos: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
      ],
    }
    render(<CapsuleCard capsule={capsuleWithPhotos} index={0} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })
})
