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
    upsert: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as Mock).mockResolvedValue(mockSupabase)
  })

  it('fails if email is missing', async () => {
    const formData = new FormData()
    formData.append('password', 'secretpassword')

    const result = await signIn(formData)

    expect(result).toEqual({ error: 'E-mail e senha são obrigatórios' })
  })

  it('fails if password is missing', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const result = await signIn(formData)

    expect(result).toEqual({ error: 'E-mail e senha são obrigatórios' })
  })

  it('fails if both email and password are missing', async () => {
    const formData = new FormData()

    const result = await signIn(formData)

    expect(result).toEqual({ error: 'E-mail e senha são obrigatórios' })
  })

  it('succeeds with valid credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } }) // Simplified for this test

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'secretpassword')

    await signIn(formData)

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secretpassword',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/consultant/dashboard')
  })
})
