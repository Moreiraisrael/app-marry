import { Sparkles } from "lucide-react"
import { getLookCapsules } from "@/lib/actions/capsules"
import { getClients } from "@/lib/actions/clients"
import { getWardrobeItemsByClients } from "@/lib/actions/wardrobe"
import { CapsuleCard } from "@/components/capsules/CapsuleCard"
import { CreateLookModal } from "@/components/capsules/CreateLookModal"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { WardrobeItem } from "@/types/database"

export const dynamic = 'force-dynamic'

export default async function CapsulePage() {
  const [capsules, clients] = await Promise.all([
    getLookCapsules(),
    getClients(),
  ])

  // Pre-fetch wardrobe items for all clients in a single batch query
  const clientWardrobeItems: Record<string, WardrobeItem[]> = {}

  if (clients.length > 0) {
    const clientIds = clients.map(c => c.id)
    const allItems = await getWardrobeItemsByClients(clientIds)

    // Group items by client ID
    allItems.forEach(item => {
      if (!clientWardrobeItems[item.client_id]) {
        clientWardrobeItems[item.client_id] = []
      }
      clientWardrobeItems[item.client_id].push(item)
    })

    // Ensure clients without items are initialized
    clients.forEach(client => {
      if (!clientWardrobeItems[client.id]) {
        clientWardrobeItems[client.id] = []
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Style Architect
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Cápsulas de Estilo</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Monte e organize looks estratégicos para suas clientes, criando coleções atemporais e versáteis.
          </p>
        </div>
        <CreateLookModal clients={clients} clientWardrobeItems={clientWardrobeItems} />
      </div>

      <div className="flex items-center justify-between px-2 pt-4">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Looks Salvos ({capsules.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {capsules.length === 0 ? (
          <div className="col-span-full py-20">
            <Card className="border-dashed border-2 border-primary/20 bg-background/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-primary/[0.02] transition-all">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-primary/40" />
              </div>
              <h4 className="font-bold text-foreground text-xl mb-2 tracking-tight">Crie sua primeira cápsula</h4>
              <p className="text-sm text-muted-foreground font-light max-w-[250px]">Comece a combinar peças para criar visuais impactantes para suas clientes.</p>
            </Card>
          </div>
        ) : (
          capsules.map((capsule, i) => (
            <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
