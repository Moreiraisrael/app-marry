/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import PartnerStoresPage from '@/app/consultant/partner-stores/page'
import { getPartnerStores, savePartnerStore } from '@/lib/actions/partner-stores'

// Mock actions
vi.mock('@/lib/actions/partner-stores', () => ({
  getPartnerStores: vi.fn(),
  savePartnerStore: vi.fn(),
  batchImportPartnerStores: vi.fn()
}))

// Mock lucide icons
vi.mock('lucide-react', () => ({
  ShoppingBag: () => <div data-testid="icon-shopping-bag" />,
  Plus: () => <div data-testid="icon-plus" />,
  ExternalLink: () => <div data-testid="icon-external-link" />,
  Search: () => <div data-testid="icon-search" />,
  Store: () => <div data-testid="icon-store" />,
  Ticket: () => <div data-testid="icon-ticket" />,
  Percent: () => <div data-testid="icon-percent" />,
  Edit: () => <div data-testid="icon-edit" />,
  Gift: () => <div data-testid="icon-gift" />,
  Loader2: () => <div data-testid="icon-loader" />,
  X: () => <div data-testid="icon-x" />,
  XIcon: () => <div data-testid="icon-xicon" />,
}))

describe('PartnerStoresPage Client Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPartnerStores).mockResolvedValue([])
  })

  it('deve renderizar a página vazia corretamente quando não há lojas', async () => {
     await act(async () => {
        render(<PartnerStoresPage />)
     })

    expect(screen.getByText('Ecossistema de Parceiros')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma Loja Encontrada')).toBeInTheDocument()
  })

  it('deve buscar lojas no use effect e renderizar na tela', async () => {
    vi.mocked(getPartnerStores).mockResolvedValueOnce([
      { id: '1', name: 'Zara', category: 'roupas', store_link: 'http://zara.com', is_active: true } as any,
      { id: '2', name: 'Sephora', category: 'maquiagem', store_link: 'http://sephora.com', is_active: true } as any
    ])

    await act(async () => {
      render(<PartnerStoresPage />)
    })

    // Deve mostrar as lojas mockadas
    expect(screen.getByText('Zara')).toBeInTheDocument()
    expect(screen.getByText('Sephora')).toBeInTheDocument()
    // A tela de "Vazio" devia não estar mais presente
    expect(screen.queryByText('Nenhuma Loja Encontrada')).toBeNull()
  })
})
