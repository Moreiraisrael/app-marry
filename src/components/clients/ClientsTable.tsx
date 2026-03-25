"use client"

import { useState } from "react"
import { 
  Search, UserPlus, Settings2, 
  MoreVertical, Sparkles, Check
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClientProfile } from "@/lib/actions/clients"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Client {
  id: string
  full_name: string | null
  email: string | null
  created_at?: string
}

interface ClientsTableProps {
  initialClients: Client[]
}

export function ClientsTable({ initialClients }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const filteredClients = initialClients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await createClientProfile(formData)
    
    if (result.success) {
      toast.success("Cliente adicionada com sucesso!")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Erro ao adicionar cliente")
    }
    setIsPending(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">
            <Sparkles className="w-4 h-4" />
            Gestão de Portfólio
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">CRM de Clientes</h1>
          <p className="text-muted-foreground font-light text-lg max-w-2xl">
            Gerencie o progresso, dossiês e descobertas de estilo de todas as suas clientes em um só lugar.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-3 h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] font-bold uppercase tracking-widest text-xs">
              <UserPlus className="w-5 h-5" /> Nova Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-none rounded-[2rem] p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif text-foreground flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-primary" /> Cadastrar Cliente
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Nome Completo</Label>
                <Input name="fullName" required placeholder="Ex: Maria Carolina" className="bg-secondary/30 border-transparent h-12 rounded-xl focus:ring-primary/20" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">E-mail</Label>
                <Input name="email" type="email" required placeholder="maria@exemplo.com" className="bg-secondary/30 border-transparent h-12 rounded-xl focus:ring-primary/20" />
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

      <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm shadow-primary/5">
        <div className="p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
             <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
               <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, email ou estilo..." 
                className="pl-12 h-14 border-border/50 bg-white/40 text-foreground placeholder:text-muted-foreground/40 focus:ring-primary/20 rounded-2xl" 
               />
             </div>
             <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 gap-3 h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                <Settings2 className="w-5 h-5" /> Filtros Avançados
             </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="w-[350px] font-bold text-muted-foreground py-6 pl-8 uppercase tracking-[0.2em] text-[10px]">Cliente</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Tipo de Plano</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Progresso</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-muted-foreground pr-8 uppercase tracking-[0.2em] text-[10px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-primary/5 rounded-full">
                        <UserPlus className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground font-light text-lg">Nenhuma cliente encontrada.</p>
                      <Button variant="link" onClick={() => setIsOpen(true)} className="text-primary font-bold decoration-2">Comece adicionando sua primeira consultoria</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="group border-border/10 hover:bg-primary/[0.02] transition-all duration-300">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                          {client.full_name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight text-lg leading-none mb-1">{client.full_name}</span>
                          <span className="text-xs text-muted-foreground font-light">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white border-primary/10 text-primary font-bold tracking-widest text-[9px] uppercase px-3 py-1 rounded-lg">
                        Premium VIP
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full shadow-sm w-[65%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-primary italic">65%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                         <span className="text-xs font-bold text-amber-500 uppercase tracking-tight">Em Análise</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                      <Button className="ml-2 bg-secondary hover:bg-primary/10 text-primary hover:text-primary rounded-xl h-10 px-4 font-bold tracking-tight text-xs transition-all group-hover:scale-105">
                         Ver Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
