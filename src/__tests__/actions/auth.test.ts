import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { signIn } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('signIn Server Action', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockResolvedValue(mockSupabase)

    // Default success for signInWithPassword
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: null,
    })

    // Default success for getUser
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        }
      },
      error: null,
    })

    // Default success for upsert
    mockSupabase.upsert.mockResolvedValue({ error: null })
  })

  it('deve realizar login com sucesso e redirecionar', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    await signIn(formData)

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase.upsert).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
    }))

    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/consultant/dashboard')
  })

  it('deve continuar o login mesmo se houver erro ao sincronizar perfil', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Força o upsert a retornar um erro
    mockSupabase.upsert.mockResolvedValue({
      error: { message: 'Database error on upsert' }
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    await signIn(formData)

    // Verifica se logou o erro, mas continuou o fluxo
    expect(consoleErrorSpy).toHaveBeenCalledWith('Profile sync warning:', 'Database error on upsert')

    // O login continua normalmente
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/consultant/dashboard')

    consoleErrorSpy.mockRestore()
  })

  it('deve continuar o login mesmo se houver erro inesperado (catch) ao sincronizar perfil', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Força getUser a lançar um erro (cai no catch)
    const errorToThrow = new Error('Unexpected getUser error')
    mockSupabase.auth.getUser.mockRejectedValue(errorToThrow)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    await signIn(formData)

    // Verifica se logou a exceção inesperada
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected profile sync error:', errorToThrow)

    // O login continua normalmente
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/consultant/dashboard')

    consoleErrorSpy.mockRestore()
  })
})
