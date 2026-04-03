/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientDashboard from '@/app/client/dashboard/page'
import { getClientDashboard } from '@/lib/actions/dashboard'

// Mock Lucide-react to avoid SVG syntax errors in test env
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Trophy: () => <div data-testid="icon-trophy" />,
  Palette: () => <div data-testid="icon-palette" />,
  Flame: () => <div data-testid="icon-flame" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  ShoppingBag: () => <div data-testid="icon-shopping-bag" />,
  Heart: () => <div data-testid="icon-heart" />,
}))

vi.mock('@/lib/actions/dashboard', () => ({
  getClientDashboard: vi.fn(),
}))

describe('ClientDashboard Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar null se não houver dados do dashboard', async () => {
    vi.mocked(getClientDashboard).mockResolvedValueOnce(null)
    
    // Para Server Components, chamamos a função assíncrona diretamente
    const ui = await ClientDashboard()
    
    expect(ui).toBeNull()
  })

  it('deve renderizar o dashboard com os dados do cliente e arquétipo', async () => {
    const mockData = {
      profile: {
        id: '123',
        full_name: 'Maria Joaquina',
        style_archetypes: ['A Romântica'],
        season: 'Inverno Frio'
      },
      wardrobeCount: 15,
      colorAnalysis: null,
      level: 'Avançado',
      styleProgress: 80
    } // as any to bypass exact interface for simplicity
    
    vi.mocked(getClientDashboard).mockResolvedValueOnce(mockData as any)

    const ui = await ClientDashboard()
    const { container } = render(ui as React.ReactElement)

    // Verify Welcome message uses first name
    expect(screen.getByText('Olá, Maria!')).toBeInTheDocument()
    
    // Verify Level
    expect(screen.getByText('Avançado')).toBeInTheDocument()
    
    // Verify Progress
    expect(screen.getByText('80%')).toBeInTheDocument()

    // Verify Wardrobe Count
    expect(screen.getByText('15')).toBeInTheDocument()
    
    // Verify season and archetype
    expect(screen.getByText('A Romântica')).toBeInTheDocument()
    expect(screen.getByText('Inverno Frio')).toBeInTheDocument()
  })

  it('deve renderizar placeholders se perfil estiver aguardando análise', async () => {
    const mockData = {
      profile: { full_name: 'Ana Silva' }, // No archetypes or seasons
      wardrobeCount: 0,
      level: 'Iniciante',
      styleProgress: 0,
      colorAnalysis: null
    }
    
    vi.mocked(getClientDashboard).mockResolvedValueOnce(mockData as any)

    const ui = await ClientDashboard()
    render(ui as React.ReactElement)

    expect(screen.getByText('Aguardando Análise')).toBeInTheDocument()
    expect(screen.getByText('Cartela Pendente')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // wardrobe items
  })
})
