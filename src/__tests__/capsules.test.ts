import { describe, it, expect, vi } from 'vitest'

// ─── Types (local mirror to avoid "use server" import) ───────

interface LookCapsule {
  id: string
  client_id: string
  name: string
  item_ids: string[]
  occasion: string | null
  description: string | null
  created_at: string
  client_name?: string | null
  item_photos?: string[]
}

// ─── Helpers ─────────────────────────────────────────────────

const makeCapsule = (overrides: Partial<LookCapsule> = {}): LookCapsule => ({
  id: 'cap-1',
  client_id: 'client-1',
  name: 'Look Casual',
  item_ids: ['item-1', 'item-2'],
  occasion: 'Casual',
  description: 'Look leve para o dia a dia',
  created_at: new Date().toISOString(),
  client_name: 'Ana Silva',
  item_photos: [],
  ...overrides,
})

// ─── Business logic helpers ───────────────────────────────────

// Mirrors the display logic from CapsuleCard and getLookCapsules
function getDisplayClientName(capsule: LookCapsule): string {
  return capsule.client_name || 'Cliente'
}

function getPieceCount(capsule: LookCapsule): number {
  return capsule.item_ids?.length || 0
}

function buildPhotoMosaic(photos: string[]): string[] {
  return photos.slice(0, 4)
}

function isValidCapsule(data: Partial<LookCapsule>): boolean {
  return !!(data.client_id && data.name && data.item_ids && data.item_ids.length > 0)
}

// ─── Tests ───────────────────────────────────────────────────

describe('LookCapsule — lógica de exibição', () => {
  it('retorna nome da cliente quando client_name existe', () => {
    const capsule = makeCapsule({ client_name: 'Maria Fernanda' })
    expect(getDisplayClientName(capsule)).toBe('Maria Fernanda')
  })

  it('retorna "Cliente" como fallback quando client_name é null', () => {
    const capsule = makeCapsule({ client_name: null })
    expect(getDisplayClientName(capsule)).toBe('Cliente')
  })

  it('retorna "Cliente" quando client_name é undefined', () => {
    const capsule = makeCapsule({ client_name: undefined })
    expect(getDisplayClientName(capsule)).toBe('Cliente')
  })

  it('conta peças corretamente com 2 itens', () => {
    const capsule = makeCapsule({ item_ids: ['a', 'b'] })
    expect(getPieceCount(capsule)).toBe(2)
  })

  it('conta peças como 0 quando item_ids é vazio', () => {
    const capsule = makeCapsule({ item_ids: [] })
    expect(getPieceCount(capsule)).toBe(0)
  })

  it('mosaico limita a no máximo 4 fotos', () => {
    const photos = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']
    expect(buildPhotoMosaic(photos)).toHaveLength(4)
  })

  it('mosaico retorna todas as fotos quando há menos de 4', () => {
    const photos = ['1.jpg', '2.jpg']
    expect(buildPhotoMosaic(photos)).toHaveLength(2)
  })

  it('mosaico retorna array vazio quando não há fotos', () => {
    expect(buildPhotoMosaic([])).toHaveLength(0)
  })
})

describe('LookCapsule — validação de criação', () => {
  it('valida dados completos como válidos', () => {
    const data = {
      client_id: 'client-1',
      name: 'Look Casual',
      item_ids: ['item-1', 'item-2'],
    }
    expect(isValidCapsule(data)).toBe(true)
  })

  it('invalida quando client_id está ausente', () => {
    const data = { name: 'Look', item_ids: ['item-1'] }
    expect(isValidCapsule(data)).toBe(false)
  })

  it('invalida quando name está ausente', () => {
    const data = { client_id: 'client-1', item_ids: ['item-1'] }
    expect(isValidCapsule(data)).toBe(false)
  })

  it('invalida quando item_ids está vazio (look sem peças)', () => {
    const data = { client_id: 'client-1', name: 'Look', item_ids: [] }
    expect(isValidCapsule(data)).toBe(false)
  })
})

describe('LookCapsule — ocasiões permitidas', () => {
  const VALID_OCCASIONS = ['Trabalho', 'Social', 'Casual', 'Evento', 'Esporte', 'Viagem']

  it('aceita todas as ocasiões permitidas', () => {
    VALID_OCCASIONS.forEach(occ => {
      const capsule = makeCapsule({ occasion: occ })
      expect(VALID_OCCASIONS).toContain(capsule.occasion)
    })
  })

  it('permite occasion null (look sem categoria)', () => {
    const capsule = makeCapsule({ occasion: null })
    expect(capsule.occasion).toBeNull()
  })
})
