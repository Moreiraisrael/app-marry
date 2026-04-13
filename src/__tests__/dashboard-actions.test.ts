import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { getDashboardStats } from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Dashboard Actions - getDashboardStats', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockResolvedValue(mockSupabase)
  })

  it('should return correct stats for a valid user', async () => {
    // Setup
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null
    })

    // First chain:
    // .from('profiles')
    // .select('*', { count: 'exact', head: true })
    // .eq('user_type', 'client')
    // .eq('consultant_id', user.id)

    // Second chain:
    // .from('appointments')
    // .select('*', { count: 'exact', head: true })
    // .eq('consultant_id', user.id)
    // .gte('start_time', new Date().toISOString())

    // For the eq() chain for profiles, there are two eq calls. The second eq call should return the value.
    // For the appointments chain, eq is called once, then gte is called once. The gte should return the value.

    // Profiles eq returns itself the first time, then returns the actual data the second time.
    mockSupabase.eq.mockImplementationOnce(() => mockSupabase)
    mockSupabase.eq.mockResolvedValueOnce({ count: 5, error: null })

    // Appointments eq returns itself, gte returns the data
    mockSupabase.eq.mockImplementationOnce(() => mockSupabase)
    mockSupabase.gte.mockResolvedValueOnce({ count: 3, error: null })

    const result = await getDashboardStats()

    expect(result).toEqual({
      clientsCount: 5,
      appointmentsCount: 3,
      goalsPercentage: 0,
      messagesCount: 0
    })
  })

  it('should return zeroes if user is not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    })

    const result = await getDashboardStats()

    expect(result).toEqual({
      clientsCount: 0,
      appointmentsCount: 0,
      goalsPercentage: 0,
      messagesCount: 0
    })
  })

  it('should return zeroes on generic error path', async () => {
    // Silence console.error for this test as the code logs it
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock an error thrown from createClient or getUser
    mockSupabase.auth.getUser.mockRejectedValueOnce(new Error('Generic database error'))

    const result = await getDashboardStats()

    expect(consoleSpy).toHaveBeenCalledWith('Error in getDashboardStats:', expect.any(Error))
    expect(result).toEqual({
      clientsCount: 0,
      appointmentsCount: 0,
      goalsPercentage: 0,
      messagesCount: 0
    })

    consoleSpy.mockRestore()
  })

  it('should re-throw DYNAMIC_SERVER_USAGE error', async () => {
    const dynamicError = new Error('Dynamic server usage')
    ;(dynamicError as any).digest = 'DYNAMIC_SERVER_USAGE'

    mockSupabase.auth.getUser.mockRejectedValueOnce(dynamicError)

    await expect(getDashboardStats()).rejects.toThrow('Dynamic server usage')
  })
})
