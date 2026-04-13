import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { getDashboardStats } from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('getDashboardStats Server Action', () => {
  const mockEq = vi.fn().mockReturnThis()
  const mockGte = vi.fn().mockReturnThis()

  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: mockEq,
    gte: mockGte,
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Re-setup the chain methods correctly for each test
    mockEq.mockReturnThis()
    mockGte.mockReturnThis()

    ;(createClient as Mock).mockResolvedValue(mockSupabase)

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'consultant-123' } },
      error: null,
    })
  })

  it('deve retornar contagens corretas para o consultor', async () => {
    // We need to handle the chain properly.
    // getDashboardStats does:
    // .from('profiles').select(...).eq('user_type', 'client').eq('consultant_id', user.id) -> this is two eq calls
    // .from('appointments').select(...).eq('consultant_id', user.id).gte('start_time', ...) -> this is an eq then gte

    // So the last eq in the first chain needs to resolve to clientsCount
    // The gte in the second chain needs to resolve to appointmentsCount

    mockEq.mockImplementation((field, value) => {
      if (field === 'consultant_id') {
        // Assume this is the end of the profiles chain (second eq)
        // BUT wait, it's also called in the appointments chain
        // A better approach is to mock based on the return order or mock it directly.
        // Actually, returning a resolved promise from a chain method means that method can't be chained further if we return data directly.
        // Let's use `mockResolvedValueOnce` carefully.
      }
      return mockSupabase
    })

    // Mock clients count (last method in the chain for profiles is eq('consultant_id', user.id))
    mockEq.mockReturnValueOnce(mockSupabase) // .eq('user_type', 'client')
    mockEq.mockResolvedValueOnce({ count: 5, error: null }) // .eq('consultant_id', user.id)

    // Mock appointments count (last method in the chain for appointments is gte('start_time', ...))
    mockEq.mockReturnValueOnce(mockSupabase) // .eq('consultant_id', user.id)
    mockGte.mockResolvedValueOnce({ count: 3, error: null }) // .gte('start_time', ...)

    const result = await getDashboardStats()

    expect(result).toEqual({
      clientsCount: 5,
      appointmentsCount: 3,
      goalsPercentage: 0,
      messagesCount: 0
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase.from).toHaveBeenCalledWith('appointments')
  })

  it('deve retornar zeros quando não houver usuário na sessão', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await getDashboardStats()

    expect(result).toEqual({
      clientsCount: 0,
      appointmentsCount: 0,
      goalsPercentage: 0,
      messagesCount: 0
    })

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('deve retornar zeros quando houver um erro de banco de dados', async () => {
    // Force an error in the first chain
    mockEq.mockReturnValueOnce(mockSupabase)
    mockEq.mockRejectedValueOnce(new Error('Database error'))

    const result = await getDashboardStats()

    expect(result).toEqual({
      clientsCount: 0,
      appointmentsCount: 0,
      goalsPercentage: 0,
      messagesCount: 0
    })
  })
})
