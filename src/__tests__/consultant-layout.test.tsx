/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConsultantLayout from '@/app/consultant/layout'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/components/layout/ConsultantSidebar', () => ({
  ConsultantSidebar: () => <div data-testid="consultant-sidebar">Sidebar Mock</div>
}))

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: any) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Trigger</button>
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('ConsultantLayout Server Component', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  it('deve renderizar o layout base para um usuário sem perfil preenchido', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'consultant1' } } })
    mockSupabase.single.mockResolvedValueOnce({ data: null })

    const ui = await ConsultantLayout({ children: <div data-testid="child">Child Content</div> })
    render(ui as React.ReactElement)

    // Sidebars and Triggers
    expect(screen.getByTestId('consultant-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
    
    // Child content
    expect(screen.getByTestId('child')).toBeInTheDocument()

    // Header default (Usuário e Initial 'U')
    expect(screen.getByText('Usuário')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('deve renderizar o layout recebendo dados do perfil da consultora (nome)', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'consultant2' } } })
    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Drielly Miele' } })

    const ui = await ConsultantLayout({ children: <div>Main Data</div> })
    render(ui as React.ReactElement)

    expect(screen.getByText('Drielly Miele')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument() // Initial D
  })
})
