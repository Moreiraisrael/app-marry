import { getAppointments } from "@/lib/actions/appointments"
import { getClients } from "@/lib/actions/clients"
import { CalendarView } from "@/components/appointments/CalendarView"
import { Sparkles } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
  const appointments = await getAppointments()
  const clients = await getClients()

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
      <div>
        <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">
          <Sparkles className="w-4 h-4" />
          Schedule Management
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">Agenda de Consultoria</h1>
        <p className="text-muted-foreground font-light text-lg max-w-2xl">
          Gerencie suas sessões de consultoria, workshops e análises de coloração com precisão e sofisticação.
        </p>
      </div>

      <CalendarView 
        initialAppointments={appointments} 
        clients={clients.map(c => ({ id: c.id, full_name: c.full_name }))} 
      />
    </div>
  )
}
