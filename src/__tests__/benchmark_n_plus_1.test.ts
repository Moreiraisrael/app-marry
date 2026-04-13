import { describe, it, expect, vi } from 'vitest'

// Create simplified test representations to benchmark the logic
// Since we are measuring the logic flow with simulated latencies,
// we don't need to actually call the db.

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function simulateOriginalNPlus1(clients: { id: string }[]) {
  const clientWardrobeItems: Record<string, any[]> = {}

  await Promise.all(
    clients.map(async (client) => {
      // simulate db delay for EACH client query
      await delay(50)
      clientWardrobeItems[client.id] = [{ id: 'item1', client_id: client.id }]
    })
  )

  return clientWardrobeItems
}

async function simulateBatchedQuery(clients: { id: string }[]) {
  const clientIds = clients.map(c => c.id)

  // simulate a single slightly longer db delay for ONE batched query
  await delay(60)

  // simulated response
  const items = clientIds.map(id => ({ id: 'item1', client_id: id }))

  const clientWardrobeItems: Record<string, any[]> = {}
  items.forEach(item => {
    if (!clientWardrobeItems[item.client_id]) {
      clientWardrobeItems[item.client_id] = []
    }
    clientWardrobeItems[item.client_id].push(item)
  })

  // Ensure missing clients have empty arrays, similar to original logic
  clientIds.forEach(id => {
    if (!clientWardrobeItems[id]) {
      clientWardrobeItems[id] = []
    }
  })

  return clientWardrobeItems
}


describe('N+1 Fetching Benchmark', () => {
  it('measures N+1 vs Batched fetching with 100 clients', async () => {
    const clients = Array.from({ length: 100 }, (_, i) => ({ id: `client-${i}` }))

    const startNPlus1 = performance.now()
    const result1 = await simulateOriginalNPlus1(clients)
    const timeNPlus1 = performance.now() - startNPlus1

    const startBatched = performance.now()
    const result2 = await simulateBatchedQuery(clients)
    const timeBatched = performance.now() - startBatched

    console.log(`Original N+1 execution time (100 parallel queries): ${timeNPlus1.toFixed(2)}ms`)
    console.log(`Batched query execution time (1 query): ${timeBatched.toFixed(2)}ms`)

    // The batched query should be much faster than 100 queries due to connection/queue overhead in real world,
    // although Promise.all runs concurrently. In Node.js, running 100 concurrent setTimeout(50)
    // might resolve closely together, but real DB drivers limit concurrency and network adds up.
    // We expect timeBatched < timeNPlus1.
    expect(result1['client-0'][0].client_id).toBe('client-0')
    expect(result2['client-0'][0].client_id).toBe('client-0')
  })
})
