import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { createClientProfile } from '@/lib/actions/clients'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('createClientProfile Server Action', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockResolvedValue(mockSupabase)
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'consultant-123' } },
      error: null,
    })
  })

  it('deve falhar se nome estiver ausente', async () => {
    const formData = new FormData()
    formData.append('email', 'maria@exemplo.com')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('obrigatórios')
  })

  it('deve falhar se e-mail estiver ausente', async () => {
    const formData = new FormData()
    formData.append('fullName', 'Maria Silva')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('obrigatórios')
  })

  it('deve falhar se não houver sessão ativa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const formData = new FormData()
    formData.append('fullName', 'Maria Silva')
    formData.append('email', 'maria@exemplo.com')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('sessão expirou')
  })

  it('deve criar perfil de cliente com sucesso via RPC', async () => {
    const mockClientId = 'new-client-uuid'
    mockSupabase.rpc.mockResolvedValue({ data: mockClientId, error: null })
    mockSupabase.single.mockResolvedValue({ 
      data: { id: mockClientId, full_name: 'Maria Silva', email: 'maria@exemplo.com' }, 
      error: null 
    })

    const formData = new FormData()
    formData.append('fullName', 'Maria Silva')
    formData.append('email', 'maria@exemplo.com')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(true)
    expect(result.client?.id).toBe(mockClientId)
    expect(revalidatePath).toHaveBeenCalledWith('/consultant/clients')
  })

  it('deve tratar erro de RPC "function does not exist" amigavelmente (migration não aplicada)', async () => {
    mockSupabase.rpc.mockResolvedValue({ 
      data: null, 
      error: { message: 'function public.create_client_profile() does not exist' } 
    })

    const formData = new FormData()
    formData.append('fullName', 'Maria Silva')
    formData.append('email', 'maria@exemplo.com')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Sistema base não configurado')
    expect(result.error).toContain('migrations SQL')
  })

  it('deve tratar erro genérico de RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database failure' } 
    })

    const formData = new FormData()
    formData.append('fullName', 'Maria Silva')
    formData.append('email', 'maria@exemplo.com')
    
    const result = await createClientProfile(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Erro ao processar cadastro: Database failure')
  })
})
