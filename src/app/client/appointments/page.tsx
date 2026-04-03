import { getClientAppointments } from "@/lib/actions/appointments"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Sparkles } from "lucide-react"
import { format, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function ClientAppointmentsPage() {
  const appointments = await getClientAppointments()

  const upcomingAppts = appointments.filter(appt => !isPast(new Date(appt.start_time)))
  const pastAppts = appointments.filter(appt => isPast(new Date(appt.start_time)))

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
      <div>
        <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">
          <Calendar className="w-4 h-4" />
          Minha Agenda
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">Suas Sessões</h1>
        <p className="text-muted-foreground font-light text-lg">
          Acompanhe todos os seus encontros com sua consultora Marry Miele.
        </p>
      </div>

      <div className="space-y-12">
        {/* Futuros */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
             <Sparkles className="w-5 h-5 text-primary" /> Próximos Encontros
             <div className="h-px flex-1 bg-stone-200" />
          </h2>
          {upcomingAppts.length === 0 ? (
            <Card className="border-none bg-stone-50 border border-stone-100 p-12 rounded-[2rem] text-center">
              <p className="text-muted-foreground text-sm font-light italic">Você não possui encontros agendados no momento.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppts.map(appt => (
                <Card key={appt.id} className="border-none bg-stone-900 text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-stone-200">
                   <div>
                     <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Agendado</span>
                     <h3 className="text-2xl font-serif mb-2">{appt.notes || 'Sessão de Consultoria'}</h3>
                   </div>
                   <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold text-white uppercase tracking-widest text-xs">
                          {format(new Date(appt.start_time), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        <p className="text-stone-400 text-sm">
                          {format(new Date(appt.start_time), "HH:mm")}
                        </p>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        {pastAppts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
               Histórico de Sessões
               <div className="h-px flex-1 bg-stone-200" />
            </h2>
            <div className="grid gap-4">
              {pastAppts.map(appt => (
                <Card key={appt.id} className="border-none bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                     <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Concluído</span>
                     <h3 className="text-xl font-serif text-stone-700">{appt.notes || 'Sessão de Consultoria'}</h3>
                   </div>
                   <div className="flex items-center gap-3 text-stone-500 bg-stone-50 px-6 py-4 rounded-2xl shrink-0">
                      <Clock className="w-5 h-5" />
                      <div>
                        <p className="font-bold uppercase tracking-widest text-xs">
                          {format(new Date(appt.start_time), "dd.MM.yyyy", { locale: ptBR })}
                        </p>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
