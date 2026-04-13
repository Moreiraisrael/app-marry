import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { getClientDashboard } from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('getClientDashboard', () => {
  const mockUser = { id: 'user-123' }
  const mockProfile = { id: 'user-123', name: 'Test User' }
  const mockColorAnalysis = { id: 'analysis-1', status: 'completed' }
  const mockAppointment = { id: 'appointment-1', start_time: new Date(Date.now() + 86400000).toISOString() } // Tomorrow

  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks()

    // Restore console.error before each test
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        if (table === 'wardrobe_items') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            // Mock exact count return
            then: vi.fn().mockImplementation((cb) => cb({ count: 15, error: null })),
          }
        }
        if (table === 'color_analysis_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockColorAnalysis, error: null }),
          }
        }
        if (table === 'appointments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
          }
        }
        return {}
      }),
    }

    ;(createClient as Mock).mockResolvedValue(mockSupabase)
  })

  it('should return the complete dashboard data on happy path', async () => {
    const dashboard = await getClientDashboard()

    expect(dashboard).not.toBeNull()
    expect(dashboard).toEqual({
      profile: mockProfile,
      wardrobeCount: 15,
      colorAnalysis: mockColorAnalysis,
      nextAppointment: mockAppointment,
      level: 'Elegância em Construção',
      styleProgress: 45
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase.from).toHaveBeenCalledWith('wardrobe_items')
    expect(mockSupabase.from).toHaveBeenCalledWith('color_analysis_requests')
    expect(mockSupabase.from).toHaveBeenCalledWith('appointments')
  })

  it('should return null if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

    const dashboard = await getClientDashboard()

    expect(dashboard).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should handle partial data correctly (nulls/zeros)', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }
      }
      if (table === 'wardrobe_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          // Mock 0 count
          then: vi.fn().mockImplementation((cb) => cb({ count: 0, error: null })),
        }
      }
      if (table === 'color_analysis_requests') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          // No color analysis
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      if (table === 'appointments') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          // No appointments
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      return {}
    })

    const dashboard = await getClientDashboard()

    expect(dashboard).toEqual({
      profile: mockProfile,
      wardrobeCount: 0,
      colorAnalysis: null,
      nextAppointment: null,
      level: 'Elegância em Construção',
      styleProgress: 45
    })
  })

  it('should return null and log error if a database query throws', async () => {
    const error = new Error('Database connection failed')
    mockSupabase.from.mockImplementation(() => {
      throw error
    })

    const dashboard = await getClientDashboard()

    expect(dashboard).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Error in getClientDashboard:', error)
  })

  it('should rethrow DYNAMIC_SERVER_USAGE errors', async () => {
    const dynamicError = new Error('Dynamic server usage')
    ;(dynamicError as any).digest = 'DYNAMIC_SERVER_USAGE'

    mockSupabase.from.mockImplementation(() => {
      throw dynamicError
    })

    await expect(getClientDashboard()).rejects.toThrow('Dynamic server usage')
    expect(console.error).not.toHaveBeenCalled()
  })

  it('should rethrow errors containing "Dynamic server usage" in message', async () => {
    const dynamicError = new Error('Some Dynamic server usage error')

    mockSupabase.from.mockImplementation(() => {
      throw dynamicError
    })

    await expect(getClientDashboard()).rejects.toThrow('Some Dynamic server usage error')
    expect(console.error).not.toHaveBeenCalled()
  })
})
