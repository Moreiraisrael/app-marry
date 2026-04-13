import { describe, it, expect, vi } from 'vitest'
import { getLookCapsules } from '../lib/actions/capsules'
import * as supabaseServer from '../lib/supabase/server'

// Mock createClient
vi.mock('../lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  }
})

// Delay helper to simulate DB latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('getLookCapsules Performance Baseline', () => {
  it('should fetch capsules efficiently', async () => {
    // Generate 50 mock capsules
    const mockCapsules = Array.from({ length: 50 }).map((_, i) => ({
      id: `cap-${i}`,
      client_id: 'client-1',
      name: `Capsule ${i}`,
      item_ids: [`item-${i}-1`, `item-${i}-2`],
      occasion: 'Casual',
      description: 'Test capsule',
      created_at: new Date().toISOString(),
      profiles: { full_name: 'Test Client' }
    }))

    const mockItems = mockCapsules.flatMap(cap =>
      cap.item_ids.map(id => ({ id, photo_url: `http://example.com/${id}.jpg` }))
    )

    let queryCount = 0

    const mockSupabase = {
      from: vi.fn().mockImplementation((table) => {
        if (table === 'look_capsules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockImplementation(async () => {
              queryCount++
              await delay(10) // Simulate DB latency
              return { data: mockCapsules, error: null }
            })
          }
        } else if (table === 'wardrobe_items') {
          const chainable: any = {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            limit: vi.fn().mockImplementation(async () => {
              queryCount++
              await delay(10)
              return { data: mockItems, error: null }
            })
          }
          // Support awaiting the chain directly (without .limit())
          chainable.then = async (resolve: any, reject: any) => {
             queryCount++
             await delay(10)
             resolve({ data: mockItems, error: null })
          }
          return chainable
        }
      })
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase as any)

    const startTime = performance.now()
    const result = await getLookCapsules()
    const endTime = performance.now()

    console.log(`Execution time: ${endTime - startTime} ms`)
    console.log(`Total queries executed: ${queryCount}`)

    expect(result).toHaveLength(50)
  })
})
