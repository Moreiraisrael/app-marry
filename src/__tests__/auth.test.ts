import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { signUp } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js Cache & Navigation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Auth Actions - signUp', () => {
  const mockSupabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockResolvedValue(mockSupabase)
  })

  it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    // Missing password, fullName, userType

    const result = await signUp(formData)

    expect(result.error).toBe('Todos os campos são obrigatórios')
  })

  it('deve tratar erro de e-mail já cadastrado', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' }
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('fullName', 'Test User')
    formData.append('userType', 'client')

    const result = await signUp(formData)

    expect(result.error).toBe('Este e-mail já está cadastrado')
  })

  it('deve tratar erro genérico de cadastro', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Some generic error' }
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('fullName', 'Test User')
    formData.append('userType', 'client')

    const result = await signUp(formData)

    expect(result.error).toBe('Ocorreu um erro ao criar sua conta. Tente novamente.')
  })

  it('deve retornar sucesso quando o cadastro funciona', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })

    mockSupabase.insert.mockResolvedValue({
      error: null
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('fullName', 'Test User')
    formData.append('userType', 'client')

    const result = await signUp(formData)

    expect(result.success).toBe('Cadastro realizado! Verifique seu e-mail para confirmar.')
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          user_type: 'client',
        }
      }
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com',
        user_type: 'client',
    })
  })
})
