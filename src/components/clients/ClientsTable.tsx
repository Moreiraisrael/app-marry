"use client"

import { useState } from "react"
import { 
  Search, UserPlus, Settings2, 
  MoreVertical, Sparkles, Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { createClientProfile, deleteClientProfile } from "@/lib/actions/clients"
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
    
    // Tenta trigger de feedback háptico (browser support limited but good for progressive enhancement)
    if ("vibrate" in navigator) {
      navigator.vibrate(10)
    }

    const result = await createClientProfile(formData)
    
    if (result.success) {
      toast.success("Cliente adicionada!", {
        description: "O dossiê de estilo já pode ser iniciado.",
        icon: <Check className="w-4 h-4 text-emerald-500" />
      })
      if ("vibrate" in navigator) navigator.vibrate([10, 30, 10])
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || "Erro ao adicionar cliente")
      if ("vibrate" in navigator) navigator.vibrate(100)
    }
    setIsPending(false)
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">
            <Sparkles className="w-4 h-4" />
            Gestão de Portfólio
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">CRM de Clientes</h1>
          <p className="text-muted-foreground font-light text-lg max-w-2xl leading-relaxed">
            Gerencie o progresso, dossiês e descobertas de estilo de todas as suas clientes em um só lugar.
          </p>
        </div>

        {/* Desktop Nova Cliente Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="add-client-desktop" 
              onClick={() => setIsOpen(true)}
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground gap-3 h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] font-bold uppercase tracking-widest text-xs"
            >
              <UserPlus className="w-5 h-5" /> Nova Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-none md:rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl md:text-3xl font-serif text-foreground flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-primary" /> Cadastrar Cliente
                </span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold ml-1">Nome Completo</Label>
                <Input 
                  id="full_name"
                  name="fullName" 
                  required 
                  placeholder="Ex: Maria Carolina" 
                  className="bg-secondary/30 border-transparent h-14 md:h-12 rounded-xl focus:ring-primary/20 text-base md:text-sm" 
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold ml-1">E-mail</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  required 
                  placeholder="maria@exemplo.com" 
                  className="bg-secondary/30 border-transparent h-14 md:h-12 rounded-xl focus:ring-primary/20 text-base md:text-sm" 
                />
              </div>
              <div className="pt-6 flex flex-col md:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)} 
                  className="order-2 md:order-1 flex-1 h-14 md:h-12 rounded-xl text-muted-foreground font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button 
                  data-testid="confirm-client-creation"
                  type="submit" 
                  disabled={isPending} 
                  className="order-1 md:order-2 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-14 md:h-12 rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px] gap-2 active:scale-95 transition-transform"
                >
                  {isPending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirmar Cadastro
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Floating Action Button (FAB) for Mobile - Thumb Zone! */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-8 right-6 z-50 md:hidden"
          >
            <Button
              data-testid="add-client-mobile"
              onClick={() => setIsOpen(true)}
              className="size-16 rounded-full bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center p-0 active:scale-90 transition-transform"
            >
              <UserPlus className="size-7 text-primary-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm shadow-primary/5">
        <div className="p-6 md:p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between">
             <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
               <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente..." 
                className="pl-12 h-14 border-border/50 bg-white/40 text-foreground placeholder:text-muted-foreground/40 focus:ring-primary/20 rounded-2xl text-base" 
               />
             </div>
             <Button variant="outline" className="w-full md:w-auto border-primary/20 text-primary hover:bg-primary/5 gap-3 h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                <Settings2 className="w-5 h-5" /> Filtros
             </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="min-w-[250px] md:w-[350px] font-bold text-muted-foreground py-6 pl-6 md:pl-8 uppercase tracking-[0.2em] text-[10px]">Cliente</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Tipo</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Progresso</TableHead>
                <TableHead className="hidden sm:table-cell font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-muted-foreground pr-6 md:pr-8 uppercase tracking-[0.2em] text-[10px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 px-6">
                      <div className="p-4 bg-primary/5 rounded-full">
                        <UserPlus className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground font-light text-lg italic">Nenhuma cliente encontrada.</p>
                      <Button variant="link" onClick={() => setIsOpen(true)} className="text-primary font-bold decoration-2 whitespace-normal h-auto">
                        Comece adicionando sua primeira consultoria
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border-border/10 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer"
                  >
                    <TableCell className="py-6 pl-6 md:pl-8">
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="size-10 md:size-12 shrink-0 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base md:text-lg shadow-sm">
                          {client.full_name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight text-base md:text-lg leading-none mb-1 truncate">{client.full_name}</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground font-light truncate">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="bg-white border-primary/10 text-primary font-bold tracking-widest text-[9px] uppercase px-3 py-1 rounded-lg">
                        Premium VIP
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 md:w-24 bg-secondary/50 rounded-full h-1.5 overflow-hidden hidden xs:block">
                          <div className="h-full bg-primary rounded-full shadow-sm w-[65%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-primary italic">65%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                         <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                         <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Em Análise</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 md:pr-8">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-10 md:size-10 text-muted-foreground hover:text-primary rounded-xl transition-all active:scale-90"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-xl border-stone-100">
                            <DropdownMenuItem className="text-stone-600 font-medium cursor-pointer rounded-lg hover:bg-stone-50 hover:text-stone-900">
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 font-medium cursor-pointer rounded-lg hover:bg-red-50 hover:text-red-700"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const res = await deleteClientProfile(client.id);
                                if (res.success) {
                                  toast.success("Cliente removido com sucesso!");
                                  router.refresh();
                                } else {
                                  toast.error(res.error || "Erro ao remover cliente");
                                }
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/consultant/clients/${client.id}`);
                          }}
                          className="hidden xs:flex bg-secondary hover:bg-primary/10 text-primary hover:text-primary rounded-xl h-10 px-4 font-bold tracking-tight text-[10px] md:text-xs transition-all group-hover:scale-105 active:scale-95"
                        >
                           Ver Perfil
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
