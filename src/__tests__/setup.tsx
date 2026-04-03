import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// ─── DOM GLOBAIS (Exigidos pelo Radix e Layouts Responsivos) ────────────────────────

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock

// Mock PointerEvent (Radix UI usa para gestos/cliques)
if (!window.PointerEvent) {
  class PointerEvent extends Event {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
    }
  }
  window.PointerEvent = PointerEvent as unknown as typeof window.PointerEvent
}

// Mock matchMedia para componentes responsivos
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ─── ANIMATION MOCKS ──────────────────────────────────────────

// Mock framer-motion minimalista usando tags de string nativas do React
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    tr: 'tr',
    td: 'td',
    th: 'th',
    tbody: 'tbody',
    thead: 'thead',
    table: 'table',
    span: 'span',
    button: 'button',
    section: 'section',
    nav: 'nav',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    li: 'li',
    ul: 'ul',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollX: { get: () => 0 } }),
  useSpring: (v: unknown) => ({ get: () => v }),
  useTransform: (v: unknown) => v,
}))

// ─── NEXT.JS / SUPABASE MOCKS ─────────────────────────────────

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  })),
}))


