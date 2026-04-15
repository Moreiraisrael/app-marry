import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getColorAnalysisRequests,
  createColorAnalysisRequest,
  analyzeColorWithAI,
  approveColorAnalysis
} from '@/lib/actions/color-analysis'
import { createClient } from '@/lib/supabase/server'

// Módulo mockado no setup.tsx, pegamos a ref instanciada dele:
vi.mock('@/lib/supabase/server')

describe('Color Analysis Server Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Reseta o comportamento padrão (Sucesso)
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'consultant-id-123' } },
          error: null,
        }),
      },
    }

    // Faz o eq retornar a corrente e ser thenable para simular await supabase...eq()
    mockSupabase.eq = vi.fn().mockImplementation(() => {
      const chain = { ...mockSupabase }
      chain.then = (resolve: any) => resolve({ data: null, error: null })
      return chain
    })

    // Aplica o mock local ao createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getColorAnalysisRequests', () => {
    it('deve retornar requisições de análise de cor formatadas quando existe sucesso na consulta', async () => {
      const mockData = [
        { id: '1', client_id: 'client-1', status: 'pending', profiles: { full_name: 'Cliente Um', email: 'cli@u.com' } }
      ]
      
      mockSupabase.order.mockResolvedValue({ data: mockData, error: null })

      const result = await getColorAnalysisRequests()

      expect(mockSupabase.from).toHaveBeenCalledWith('color_analysis_requests')
      expect(mockSupabase.select).toHaveBeenCalledWith('*, profiles!client_id(full_name, email)')
      expect(result).toEqual(mockData)
      expect(result.length).toBe(1)
    })

    it('deve retornar um array vazio e registrar erro em caso de falha da query', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabase.order.mockResolvedValue({ data: null, error: new Error('DB Down') })

      const result = await getColorAnalysisRequests()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching color analysis requests:', expect.any(Error))
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('createColorAnalysisRequest', () => {
    const formData = {
      client_id: 'client-2',
      client_photo: 'data:image/png;base64,aabbcc',
      additional_photos: []
    }

    it('deve criar um novo pedido com os dados corretos atrelando com base na sessão atual', async () => {
      const mockInsertedData = { id: 'new-id', status: 'pending' }
      mockSupabase.single.mockResolvedValue({ data: mockInsertedData, error: null })

      const result = await createColorAnalysisRequest(formData)

      expect(mockSupabase.from).toHaveBeenCalledWith('color_analysis_requests')
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        client_id: 'client-2',
        consultant_id: 'consultant-id-123',
        client_photo: 'data:image/png;base64,aabbcc',
        status: 'pending'
      }))
      expect(result).toEqual(mockInsertedData)
    })

    it('deve retornar null se o usuário não estiver autenticado (Unauthorized)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await createColorAnalysisRequest(formData)

      expect(consoleSpy).toHaveBeenCalled()
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  describe('analyzeColorWithAI', () => {
    it('deve gerar a cartela recomendada e salvar as métricas no banco de dados', async () => {
      const result = await analyzeColorWithAI('test-request-id')

      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        ai_suggested_season: 'inverno_frio',
        ai_analysis_data: expect.objectContaining({
           contrast_level: 'alto',
           temperature_analysis: expect.any(String)
        })
      }))
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-request-id')
      expect(result).toBeDefined()
      expect(result?.season).toBe('inverno_frio')
    })
  })

  describe('approveColorAnalysis', () => {
    it('deve transacionar aprovação substituindo o status e atualizando a tabela profiles da cliente', async () => {
      // Configuramos a corrente para o primeiro fetch que termina em .single()
      mockSupabase.single.mockResolvedValueOnce({ data: { client_id: 'target-client' }, error: null })

      const result = await approveColorAnalysis('req-1', 'Verão Frio', 'Requer tecidos sutis')

      expect(mockSupabase.from).toHaveBeenCalledWith('color_analysis_requests')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'approved',
        consultant_season: 'Verão Frio',
        consultant_notes: 'Requer tecidos sutis'
      })
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith({ season: 'Verão Frio' })
      
      expect(result).toEqual({ success: true })
    })

    it('deve retornar success false e não atualizar perfil caso o pedido base da consulta não exista ou dê erro', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Request completely missing') })

      const result = await approveColorAnalysis('req-void', 'Outono', '')

      expect(mockSupabase.update).not.toHaveBeenCalled()
      expect(result).toEqual({ success: false })
    })
  })
})
