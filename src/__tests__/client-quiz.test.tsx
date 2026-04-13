/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientQuizPage from '@/app/client/quiz/page'
import { getQuizzes } from '@/lib/actions/quizzes'
import { createClient } from '@/lib/supabase/server'

// Mocks
vi.mock('lucide-react', () => ({
  ClipboardList: () => <div data-testid="icon-clipboard" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  Circle: () => <div data-testid="icon-circle" />,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/actions/quizzes', () => ({
  getQuizzes: vi.fn(),
}))

describe('ClientQuizPage Server Component', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  it('deve retornar null se o usuário não estiver logado', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    const ui = await ClientQuizPage()
    expect(ui).toBeNull()
  })

  it('deve renderizar os quizzes disponíveis com status pendente usando fallbacks', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client1' } } })
    vi.mocked(getQuizzes).mockResolvedValueOnce([]) // Nenhum respondido

    const ui = await ClientQuizPage()
    render(ui as React.ReactElement)

    expect(screen.getByText(/Seus/i)).toBeInTheDocument()
    expect(screen.getByText('Descoberta de Estilo')).toBeInTheDocument()
    expect(screen.getByText('Arquétipos de Imagem')).toBeInTheDocument()
    expect(screen.getByText('Análise de Coloração')).toBeInTheDocument()
    
    // Todos devem ter botão "Começar Agora"
    const startButtons = screen.getAllByText('Começar Agora')
    expect(startButtons).toHaveLength(3)
  })

  it('deve exibir "Concluído" e "Refazer Teste" se o usuário já tiver respondido ao quiz', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client1' } } })
    // Mockando apenas o quiz de "style" como respondido
    vi.mocked(getQuizzes).mockResolvedValueOnce([
      { quiz_type: 'style', status: 'completed' } as any
    ])

    const ui = await ClientQuizPage()
    render(ui as React.ReactElement)

    // O status Concluído devia aparecer, e o botão "Refazer Teste"
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByText('Refazer Teste')).toBeInTheDocument()
    
    // Ainda devíamos ter 2 botões de 'Começar Agora'
    const startButtons = screen.getAllByText('Começar Agora')
    expect(startButtons).toHaveLength(2)
  })
})
