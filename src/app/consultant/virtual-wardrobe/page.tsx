import { getWardrobeItems } from "@/lib/actions/wardrobe"
import { getClients } from "@/lib/actions/clients"
import { VirtualWardrobeClient } from "@/components/wardrobe/VirtualWardrobeClient"

export const dynamic = 'force-dynamic'

export default async function VirtualWardrobePage() {
  const items = await getWardrobeItems()
  const clients = await getClients()

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <VirtualWardrobeClient initialItems={items} clients={clients} />
    </div>
  )
}
