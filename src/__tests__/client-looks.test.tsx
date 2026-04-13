/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientLooksPage from '@/app/client/looks/page'
import { getLookCapsules } from '@/lib/actions/capsules'
import { createClient } from '@/lib/supabase/server'

// Mock Lucide-react
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Shirt: () => <div data-testid="icon-shirt" />,
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock getLookCapsules
vi.mock('@/lib/actions/capsules', () => ({
  getLookCapsules: vi.fn(),
}))

describe('ClientLooksPage Server Component', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  it('deve retornar null se o usuário não estiver autenticado', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    
    const ui = await ClientLooksPage()
    expect(ui).toBeNull()
  })

  it('deve exibir mensagem de "Looks a caminho" se a cliente não tiver nenhum look', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client1' } } })
    vi.mocked(getLookCapsules).mockResolvedValueOnce([])
    
    // Configura mock pra não achar clientes relacionados (path 2)
    mockSupabase.from().select().eq.mockResolvedValueOnce({ data: [] })

    const ui = await ClientLooksPage()
    render(ui as React.ReactElement)

    expect(screen.getByText('Looks a caminho...')).toBeInTheDocument()
  })

  it('deve renderizar os look cards corretamente vindos da busca de getLookCapsules', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client2' } } })
    
    const fakeLooks = [{
      id: 'look1',
      name: 'Look Aeroporto',
      description: 'Conforto Elegante',
      occasion: 'Viagem',
      client_id: 'client2',
      item_ids: ['item1', 'item2'],
      item_photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      created_at: new Date().toISOString()
    }]
    
    vi.mocked(getLookCapsules).mockResolvedValueOnce(fakeLooks as any)
    mockSupabase.from().select().eq.mockResolvedValueOnce({ data: null }) // Sem clients path

    const ui = await ClientLooksPage()
    render(ui as React.ReactElement)

    // Verificações
    expect(screen.getByText('Meus Looks')).toBeInTheDocument()
    expect(screen.getByText('Look Aeroporto')).toBeInTheDocument()
    expect(screen.getByText('Conforto Elegante')).toBeInTheDocument()
    expect(screen.getByText('Viagem')).toBeInTheDocument()
    expect(screen.getByText('2 peças combinadas')).toBeInTheDocument()
  })
})
