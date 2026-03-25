import { getClients } from "@/lib/actions/clients"
import { ClientsTable } from "@/components/clients/ClientsTable"

export default async function ClientsCRM() {
  const clients = await getClients()

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ClientsTable initialClients={clients} />
    </div>
  )
}
