import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getQuizzes, approveQuiz, getPendingQuizzes } from '../lib/actions/quizzes'
import { createClient } from '../lib/supabase/server'

// Mock Supabase
vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn()
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'consultant-123' } },
      error: null
    })
  },
  from: vi.fn()
}

describe('Gerenciamento de Quizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockResolvedValue(mockSupabase)
  })

  it('Verificando segurança do Tenant (getQuizzes global não vaza dados)', async () => {
    const mockData = [
      { id: 'quiz-1', result_text: 'Elegante', profiles: { full_name: 'Cliente Elegante', consultant_id: 'consultant-123' } }
    ]

    const mockOrder = { order: vi.fn().mockResolvedValue({ data: mockData, error: null }) }
    const mockEqAuth = { eq: vi.fn().mockReturnValue(mockOrder) }
    const mockSelect = { select: vi.fn().mockReturnValue(mockEqAuth) }
    
    mockSupabase.from.mockReturnValue(mockSelect as any)

    const result = await getQuizzes()

    expect(mockSupabase.from).toHaveBeenCalledWith('quizzes')
    expect(mockSelect.select).toHaveBeenCalledWith('*, profiles!inner(full_name)')
    // Confirm tenant logic filters out only profiles tied to consultant
    expect(mockEqAuth.eq).toHaveBeenCalledWith('profiles.consultant_id', 'consultant-123')
    
    expect((result as any)[0].result_text).toBe('Elegante')
  })

  it('Aprovando e customizando resultado de Quiz', async () => {
    const mockUpdate = { eq: vi.fn().mockResolvedValue({ error: null }) }
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue(mockUpdate)
    } as any)

    const result = await approveQuiz('quiz-1', 'Ajuste Humano: Extravagante')

    expect(mockSupabase.from).toHaveBeenCalledWith('quizzes')
    expect(mockSupabase.from('quizzes').update).toHaveBeenCalledWith({
      status: 'approved',
      result_text: 'Ajuste Humano: Extravagante'
    })
    
    expect((result as any).success).toBe(true)
  })
})
