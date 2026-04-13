/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientShopPage from '@/app/client/shop/page'
import { getPartnerStores } from '@/lib/actions/partner-stores'
import { getShoppingLists } from '@/lib/actions/shopping-lists'

vi.mock('lucide-react', () => ({
  ShoppingBag: () => <div data-testid="icon-shopping" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Filter: () => <div data-testid="icon-filter" />,
  ChevronRight: () => <div data-testid="icon-chevron" />,
}))

// Mock components
vi.mock('@/components/shopping/ProductCard', () => ({
  ProductCard: ({ name }: any) => <div data-testid="product-card">{name}</div>
}))
vi.mock('@/components/shopping/StoreGrid', () => ({
  StoreGrid: ({ stores }: any) => <div data-testid="store-grid">Stores: {stores.length}</div>
}))

vi.mock('@/lib/actions/partner-stores', () => ({
  getPartnerStores: vi.fn(),
}))

vi.mock('@/lib/actions/shopping-lists', () => ({
  getShoppingLists: vi.fn(),
}))

describe('ClientShopPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPartnerStores).mockResolvedValue([])
    vi.mocked(getShoppingLists).mockResolvedValue([])
  })

  it('deve renderizar o layout principal e o placeholder "Sua vitrine está sendo montada"', async () => {
    const ui = await ClientShopPage()
    render(ui as React.ReactElement)

    expect(screen.getByText(/Peças selecionadas estrategicamente/i)).toBeInTheDocument()
    expect(screen.getByText('Sua vitrine está sendo montada')).toBeInTheDocument()
    expect(screen.getByTestId('store-grid')).toHaveTextContent('Stores: 0')
  })

  it('deve renderizar os produtos sugeridos (listas) e parceiros', async () => {
    vi.mocked(getShoppingLists).mockResolvedValueOnce([
      { items: [{ id: 'p1', name: 'Bolsa de Couro' }] } as any
    ])
    vi.mocked(getPartnerStores).mockResolvedValueOnce([
      { id: '1', name: 'Zara', store_link: 'http://zara.com', category: 'Moda' } as any
    ])

    const ui = await ClientShopPage()
    render(ui as React.ReactElement)

    expect(screen.getByText('Bolsa de Couro')).toBeInTheDocument()
    expect(screen.getByTestId('store-grid')).toHaveTextContent('Stores: 1')
  })
})
