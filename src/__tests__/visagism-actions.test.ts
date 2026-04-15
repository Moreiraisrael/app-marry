import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getVisagismRequests,
  createVisagismRequest,
  analyzeVisagismWithAI,
  approveVisagism
} from '@/lib/actions/visagism'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('Visagism Server Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'consultant-id-777' } },
          error: null,
        }),
      },
    }

    mockSupabase.eq = vi.fn().mockImplementation(() => {
      const chain = { ...mockSupabase }
      chain.then = (resolve: any) => resolve({ data: null, error: null })
      return chain
    })

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getVisagismRequests', () => {
    it('deve retornar requisições de visagismo com profiles populados', async () => {
      const mockData = [
        { id: 'v-req-1', client_id: 'c-1', status: 'pending', profiles: { full_name: 'Julia' } }
      ]
      mockSupabase.order.mockResolvedValue({ data: mockData, error: null })

      const result = await getVisagismRequests()

      expect(mockSupabase.from).toHaveBeenCalledWith('visagism_requests')
      expect(mockSupabase.select).toHaveBeenCalledWith('*, profiles!client_id(full_name, email)')
      expect(result).toEqual(mockData)
      expect(result.length).toBe(1)
    })

    it('deve retornar array vazio se query falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabase.order.mockResolvedValue({ data: null, error: new Error('Network error') })

      const result = await getVisagismRequests()
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('createVisagismRequest', () => {
    const formData = {
      client_id: 'c-10',
      front_face_photo: 'base64-front-face',
      side_face_photo: 'base64-side-face'
    }

    it('deve criar corretamente injetando o tenant consultor e com status pending', async () => {
      mockSupabase.single.mockResolvedValue({ data: { id: 'new-v-req' }, error: null })

      const result = await createVisagismRequest(formData)

      expect(mockSupabase.from).toHaveBeenCalledWith('visagism_requests')
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        client_id: 'c-10',
        consultant_id: 'consultant-id-777',
        front_face_photo: 'base64-front-face',
        side_face_photo: 'base64-side-face',
        status: 'pending'
      }))
      expect(result.id).toBe('new-v-req')
    })
  })

  describe('analyzeVisagismWithAI', () => {
    it('deve usar endpoint AI para prever facial shape e persistir', async () => {
      const result = await analyzeVisagismWithAI('req-ai-test')

      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        ai_suggested_shape: 'Diamante', // Dummy fixo p/ teste
        ai_analysis_data: expect.objectContaining({
          facial_measurements: expect.any(Object)
        })
      }))
      expect(result!.shape).toBe('Diamante')
    })
  })

  describe('approveVisagism', () => {
    it('deve validar form e realizar mutação síncrona em 2 tabelas (visagism e profiles)', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { client_id: 'c-target' }, error: null })

      const measures = { upperThird: 33, middleThird: 33, lowerThird: 34 }
      const result = await approveVisagism('req-5', 'Diamante', measures, 'Rosto simétrico e elegante')

      // 1. Check ticket update
      expect(mockSupabase.from).toHaveBeenCalledWith('visagism_requests')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'approved',
        consultant_shape: 'Diamante',
        consultant_notes: 'Rosto simétrico e elegante'
      })

      // 2. Check global profile sync
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        face_shape: 'Diamante',
        facial_measurements: measures
      })
      expect(result.success).toBe(true)
    })
  })
})
