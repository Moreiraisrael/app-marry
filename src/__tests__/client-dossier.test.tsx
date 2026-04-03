/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientDossierPage from '@/app/client/dossier/page'
import { getClientDashboard } from '@/lib/actions/dashboard'

// Mock Lucide-react to avoid SVG syntax errors in test env
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Palette: () => <div data-testid="icon-palette" />,
  BookOpen: () => <div data-testid="icon-book-open" />,
  Download: () => <div data-testid="icon-download" />,
  Share2: () => <div data-testid="icon-share" />,
  ClipboardList: () => <div data-testid="icon-clipboard-list" />,
  Star: () => <div data-testid="icon-star" />,
  Shirt: () => <div data-testid="icon-shirt" />,
}))

vi.mock('@/lib/actions/dashboard', () => ({
  getClientDashboard: vi.fn(),
}))

describe('ClientDossierPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar null se os dados do dashboard ou do profile não existirem', async () => {
    // Simulando usuário que falhou no load
    vi.mocked(getClientDashboard).mockResolvedValueOnce(null)
    
    let ui = await ClientDossierPage()
    expect(ui).toBeNull()

    // Simulando dados que voltam sem profile validado
    vi.mocked(getClientDashboard).mockResolvedValueOnce({ profile: null } as any)
    ui = await ClientDossierPage()
    expect(ui).toBeNull()
  })

  it('deve utilizar fallbacks (Inverno Frio e A Governante) caso profile não contenha os dados completos', async () => {
    const mockDataFallback = {
      profile: {
        id: '123',
        // Sem season
        // Sem style_archetypes
      }
    }
    
    vi.mocked(getClientDashboard).mockResolvedValueOnce(mockDataFallback as any)

    const ui = await ClientDossierPage()
    render(ui as React.ReactElement)

    // Fallbacks padrão da Plataforma E.S.T.I.L.O
    expect(screen.getByText('Inverno Frio')).toBeInTheDocument()
    expect(screen.getByText('A Governante')).toBeInTheDocument()
  })

  it('deve renderizar o Dossiê Estratégico com os dados reais do Profile (Verão Claro / A Criadora)', async () => {
    const mockDataReal = {
      profile: {
        id: '456',
        season: 'Verão Claro',
        style_archetypes: ['A Criadora', 'A Exploradora'] // O componente pega o [0]
      }
    }
    
    vi.mocked(getClientDashboard).mockResolvedValueOnce(mockDataReal as any)

    const ui = await ClientDossierPage()
    render(ui as React.ReactElement)

    // Headers
    expect(screen.getByText('Meu Dossiê de Estilo')).toBeInTheDocument()
    
    // Verificações de Season Customizada
    expect(screen.getByText('Verão Claro')).toBeInTheDocument()
    expect(screen.getByText('Baixo Contraste Claro')).toBeInTheDocument() // Contrast do Verão Claro
    
    // Verificações de Arquétipo Customizado
    expect(screen.getByText('A Criadora')).toBeInTheDocument()
    expect(screen.getByText('80% Criativo / 20% Contemporâneo')).toBeInTheDocument() // Proportion da Criadora
  })
})
