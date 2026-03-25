"use client"

import { useState } from "react"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, 
  Clock, Plus, User, Sparkles, Check
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  format, addMonths, subMonths, 
  startOfMonth, endOfMonth, startOfWeek, 
  endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { createAppointment } from "@/lib/actions/appointments"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  client_id: string
  notes: string | null
  start_time: string
  end_time: string
  client?: {
    full_name: string | null
    email: string | null
  }
}

interface Client {
  id: string
  full_name: string | null
}

interface CalendarViewProps {
  initialAppointments: Appointment[]
  clients: Client[]
}

export function CalendarView({ initialAppointments, clients }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const appointments = initialAppointments.filter(appt => 
    isSameDay(new Date(appt.start_time), selectedDate)
  )

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { locale: ptBR })
  const endDate = endOfWeek(monthEnd, { locale: ptBR })

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    // Simplificando data p/ o exemplo: concatenar data selecionada com hora do input
    const time = formData.get("time") as string // HH:mm
    const [hours, minutes] = time.split(':')
    const start = new Date(selectedDate)
    start.setHours(parseInt(hours), parseInt(minutes), 0)
    
    const end = new Date(start)
    end.setHours(start.getHours() + 1) // 1h duracao padrao

    const payload = new FormData()
    payload.append("clientId", formData.get("clientId") as string)
    payload.append("title", formData.get("title") as string)
    payload.append("startTime", start.toISOString())
    payload.append("endTime", end.toISOString())

    const result = await createAppointment(payload)
    
    if (result.success) {
      toast.success("Compromisso agendado com sucesso!")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Erro ao agendar")
    }
    setIsPending(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar View */}
      <Card className="lg:col-span-2 border-none bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-sm shadow-primary/5">
        <CardHeader className="bg-primary/5 border-b border-border/50 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-foreground flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary" /> 
              <span className="capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            </h2>
            <div className="flex gap-2">
              <Button onClick={prevMonth} variant="ghost" size="icon" className="rounded-xl hover:bg-white text-primary">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={nextMonth} variant="ghost" size="icon" className="rounded-xl hover:bg-white text-primary">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              const hasAppt = initialAppointments.some(appt => isSameDay(new Date(appt.start_time), day))
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                    !isSameMonth(day, monthStart) ? 'opacity-20 pointer-events-none' : ''
                  } ${
                    isSameDay(day, selectedDate) 
                    ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                    : 'border-border/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/[0.03]'
                  } ${isToday(day) && !isSameDay(day, selectedDate) ? 'border-primary/60 text-primary font-bold' : ''}`}
                >
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                  {hasAppt && (
                    <div className={`w-1 h-1 rounded-full absolute bottom-2 ${isSameDay(day, selectedDate) ? 'bg-white' : 'bg-primary'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar de Dia Selecionado */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-foreground font-bold text-lg">
            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-xl border-none rounded-[2rem] p-8 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif text-foreground flex items-center gap-3">
                  <Plus className="w-6 h-6 text-primary" /> Novo Agendamento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Título da Sessão</Label>
                  <Input name="title" required placeholder="Ex: Analise de Coloração Pessoal" className="bg-secondary/30 border-transparent h-12 rounded-xl focus:ring-primary/20" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Cliente</Label>
                  <Select name="clientId" required>
                    <SelectTrigger className="bg-secondary/30 border-transparent h-12 rounded-xl focus:ring-primary/20">
                      <SelectValue placeholder="Selecione a cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Horário</Label>
                  <Input name="time" type="time" required className="bg-secondary/30 border-transparent h-12 rounded-xl focus:ring-primary/20" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-12 rounded-xl text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px] gap-2">
                    {isPending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirmar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 border border-dashed border-primary/20 rounded-[2rem] text-center bg-white/40">
            <Clock className="w-10 h-10 text-primary/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light text-sm italic">Nenhum compromisso agendado para este dia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt: Appointment) => (
              <Card key={appt.id} className="border-none bg-white/80 hover:bg-white transition-all rounded-3xl shadow-sm hover:shadow-md border-l-4 border-l-primary group overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-foreground tracking-tight leading-none mb-2">{appt.client?.full_name || 'Cliente'}</h4>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest leading-none mb-1 opacity-80">{appt.notes}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3 text-primary/60" /> 
                        {format(new Date(appt.start_time), "HH:mm")} - {format(new Date(appt.end_time), "HH:mm")}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-all rounded-xl">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-none bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl rounded-[2rem] p-8 shadow-sm">
           <h3 className="text-foreground font-serif text-xl mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Dica de Organização
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Consulte o briefing da cliente antes da sessão. Isso garante uma experiência personalizada e reforça seu posicionamento premium.
          </p>
        </Card>
      </div>
    </div>
  )
}
