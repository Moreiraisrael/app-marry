import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getBiotypeRequests,
  createBiotypeRequest,
  analyzeBiotypeWithAI,
  approveBiotype
} from '@/lib/actions/biotype'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('Biotype Server Actions', () => {
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
          data: { user: { id: 'consultant-id-999' } },
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

  describe('getBiotypeRequests', () => {
    it('deve retornar requisições de biotipo agrupadas e tipadas', async () => {
      const mockData = [
        { id: 'req-bio-1', client_id: 'c-1', status: 'pending', profiles: { full_name: 'Ana' } }
      ]
      mockSupabase.order.mockResolvedValue({ data: mockData, error: null })

      const result = await getBiotypeRequests()

      expect(mockSupabase.from).toHaveBeenCalledWith('biotype_requests')
      expect(mockSupabase.select).toHaveBeenCalledWith('*, profiles!client_id(full_name, email)')
      expect(result).toEqual(mockData)
      expect(result.length).toBe(1)
    })

    it('deve retornar array vazio se falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabase.order.mockResolvedValue({ data: null, error: new Error('DB error') })

      const result = await getBiotypeRequests()
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('createBiotypeRequest', () => {
    const formData = {
      client_id: 'client-88',
      front_photo: 'base64-front',
      side_photo: 'base64-side'
    }

    it('deve criar corretamente com o consultant_id da sessão', async () => {
      mockSupabase.single.mockResolvedValue({ data: { id: 'new-bio-req' }, error: null })

      const result = await createBiotypeRequest(formData)

      expect(mockSupabase.from).toHaveBeenCalledWith('biotype_requests')
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        client_id: 'client-88',
        consultant_id: 'consultant-id-999',
        front_photo: 'base64-front',
        side_photo: 'base64-side',
        status: 'pending'
      }))
      expect(result.id).toBe('new-bio-req')
    })
  })

  describe('analyzeBiotypeWithAI', () => {
    it('deve gerar body_shape sugerido pela IA e atualizar BD', async () => {
      const result = await analyzeBiotypeWithAI('bio-id-1')

      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        ai_suggested_shape: 'Ampulheta', // MOCK DUMMY DEFAULT
        ai_analysis_data: expect.objectContaining({
          measurements: expect.any(Object)
        })
      }))
      expect(result?.shape).toBe('Ampulheta')
    })
  })

  describe('approveBiotype', () => {
    it('deve transacionar a aprovação nas tabelas biotype_requests e profiles', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { client_id: 'c-100' }, error: null })

      const measures = { shoulder: 40, waist: 30, hip: 40 }
      const result = await approveBiotype('req-id', 'Ampulheta', measures, 'Belo corpo')

      // Check request status update
      expect(mockSupabase.from).toHaveBeenCalledWith('biotype_requests')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'approved',
        consultant_shape: 'Ampulheta',
        consultant_notes: 'Belo corpo'
      })

      // Check profile update
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        body_shape: 'Ampulheta',
        body_measurements: measures
      })
      expect(result.success).toBe(true)
    })
  })
})
