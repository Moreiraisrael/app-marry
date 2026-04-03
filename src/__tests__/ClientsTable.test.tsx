/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { createClientProfile } from '@/lib/actions/clients'
import { toast } from 'sonner'
import React from 'react'

// Mocks
vi.mock('@/lib/actions/clients', () => ({
  createClientProfile: vi.fn(),
  getClients: vi.fn(() => Promise.resolve([])),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mocks UI Components
vi.mock('@/components/ui/dialog', () => {
  return {
    Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
      <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'} role="dialog">
        {children}
      </div>
    ),
    DialogTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DialogContent: ({ children, ...props }: { children: React.ReactNode }) => (
      <div className="dialog-content" data-testid="dialog-content" {...props}>
        {children}
      </div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  }
})

describe('ClientsTable Component', () => {
  const mockClients = [
    { id: '1', full_name: 'Ana Silva', email: 'ana@teste.com', created_at: new Date().toISOString() },
    { id: '2', full_name: 'Bia Costa', email: 'bia@teste.com', created_at: new Date().toISOString() },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Default window size to desktop
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('renderiza os clientes corretamente na tabela', () => {
    
    render(<ClientsTable initialClients={mockClients} />)
    
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Bia Costa')).toBeInTheDocument()
    expect(screen.getByText('ana@teste.com')).toBeInTheDocument()
  })

  it('abre o diálogo de cadastro ao clicar no botão "Nova Cliente" (Desktop)', async () => {
    render(<ClientsTable initialClients={mockClients} />)
    
    const btn = screen.getByTestId('add-client-desktop')
    fireEvent.click(btn)
    
    // Verifica o estado no root do diálogo (mockado)
    await waitFor(() => {
      expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open')
    })
    
    expect(screen.getByRole('heading', { name: /cadastrar cliente/i })).toBeInTheDocument()
  })

  it('abre o diálogo de cadastro ao clicar no FAB (Mobile)', async () => {
    // Simula viewport mobile
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    
    render(<ClientsTable initialClients={mockClients} />)
    
    const btn = screen.getByTestId('add-client-mobile')
    fireEvent.click(btn)
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open')
    })
    
    expect(screen.getByRole('heading', { name: /cadastrar cliente/i })).toBeInTheDocument()
  })

  it('submete o formulário e chama a server action', async () => {
    ;(createClientProfile as Mock).mockResolvedValue({ success: true })
    render(<ClientsTable initialClients={mockClients} />)
    
    // Abre dialog
    fireEvent.click(screen.getByTestId('add-client-desktop'))
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open')
    })
    
    // Preenche campos
    fireEvent.change(screen.getByPlaceholderText('Ex: Maria Carolina'), { target: { value: 'Maria Joana' } })
    fireEvent.change(screen.getByPlaceholderText('maria@exemplo.com'), { target: { value: 'joana@teste.com' } })
    
    // Confirma
    fireEvent.click(screen.getByTestId('confirm-client-creation'))
    
    await waitFor(() => {
      expect(createClientProfile).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Cliente adicionada!', expect.anything())
    })
  })

  it('exibe erro se a criação falhar', async () => {
    const errorMsg = 'E-mail inválido'
    ;(createClientProfile as Mock).mockResolvedValue({ success: false, error: errorMsg })
    render(<ClientsTable initialClients={mockClients} />)
    
    // Abre dialog
    fireEvent.click(screen.getByTestId('add-client-desktop'))
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open')
    })
    
    // Preenche campos
    fireEvent.change(screen.getByPlaceholderText('Ex: Maria Carolina'), { target: { value: 'Cliente Falha' } })
    fireEvent.change(screen.getByPlaceholderText('maria@exemplo.com'), { target: { value: 'falha@teste.com' } })
    
    // Confirma
    fireEvent.click(screen.getByTestId('confirm-client-creation'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMsg)
    })
  })

  it('filtra clientes corretamente via campo de busca', () => {
    render(<ClientsTable initialClients={mockClients} />)
    
    const input = screen.getByPlaceholderText(/buscar cliente/i)
    fireEvent.change(input, { target: { value: 'Ana' } })
    
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.queryByText('Bia Costa')).not.toBeInTheDocument()
  })
})
