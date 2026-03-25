'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  ArrowUpRight, 
  ChevronRight,
  Gift,
  Search,
  Download
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

const mockStats = [
  { label: "Saldo Disponível", value: "R$ 1.250,00", icon: DollarSign, trend: "+12%", color: "text-emerald-600" },
  { label: "Total Ganho", value: "R$ 4.890,00", icon: TrendingUp, trend: "+8%", color: "text-primary" },
  { label: "Cliques em Links", value: "1.240", icon: MousePointer2, trend: "+24%", color: "text-blue-600" },
  { label: "Conversões", value: "85", icon: Users, trend: "+15%", color: "text-rose-600" },
]

const mockConversions = [
  { id: 1, client: "Mariana Silva", product: "Blazer Zara Off-White", date: "2 horas atrás", commission: "R$ 45,90", status: "Confirmado" },
  { id: 2, client: "Paula Oliveira", product: "Vestido Animale", date: "5 horas atrás", commission: "R$ 89,00", status: "Em processamento" },
  { id: 3, client: "Juliana Santos", product: "Scarpin Arezzo", date: "Ontem", commission: "R$ 32,00", status: "Confirmado" },
  { id: 4, client: "Fernanda Lima", product: "Calça Amaro", date: "Ontem", commission: "R$ 28,90", status: "Confirmado" },
]

export default function AffiliatesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Afiliados & Recompensas</h1>
          <p className="text-muted-foreground text-lg">Monitore seu impacto comercial e gerencie suas comissões de curadoria.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6">
             <Download className="w-5 h-5 mr-2" /> Exportar Relatório
           </Button>
           <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none">
             Solicitar Saque
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mockStats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
          >
            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-all rounded-[2rem] group">
              <div className="flex items-center justify-between mb-8">
                 <div className={`p-4 rounded-2xl bg-primary/5 border border-primary/10 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="w-8 h-8" />
                 </div>
                 <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 rounded-lg">
                   {stat.trend}
                 </Badge>
              </div>
              <div>
                 <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                 <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <Card className="lg:col-span-2 border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-10 border-b border-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-2xl font-bold text-foreground">Últimas Conversões</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2 font-medium">Histórico de vendas por curadoria</p>
               </div>
               <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="bg-background/50 border-primary/10 pl-12 h-12 rounded-2xl text-sm focus:ring-primary/20" placeholder="Buscar cliente..." />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left font-sans">
                  <thead className="bg-primary/5">
                     <tr>
                        <th className="px-10 py-6 text-[10px] font-bold text-primary uppercase tracking-widest">Cliente</th>
                        <th className="px-10 py-6 text-[10px] font-bold text-primary uppercase tracking-widest">Produto</th>
                        <th className="px-10 py-6 text-[10px] font-bold text-primary uppercase tracking-widest">Comissão</th>
                        <th className="px-10 py-6 text-[10px] font-bold text-primary uppercase tracking-widest text-right"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                     {mockConversions.map((conv) => (
                        <tr key={conv.id} className="hover:bg-primary/[0.02] transition-colors group">
                           <td className="px-10 py-6">
                              <div className="flex flex-col">
                                 <span className="text-foreground font-bold text-sm tracking-wide">{conv.client}</span>
                                 <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-1">{conv.date}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-foreground/70 text-sm font-medium">{conv.product}</span>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-foreground font-bold">{conv.commission}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                 <ChevronRight className="w-5 h-5" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>

         <div className="space-y-8">
            <Card className="border-none bg-primary p-10 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group shadow-xl shadow-primary/20">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-xl shadow-black/5">
                     <Gift className="text-primary w-8 h-8" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-2xl font-bold">Programa de Fidelidade</h3>
                     <p className="text-sm text-white/70 leading-relaxed font-medium">Você atingiu 85% da meta para o selo <span className="text-white font-bold underline decoration-2 underline-offset-4">Black Diamond</span>. Continue recomendando.</p>
                  </div>
                  <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '85%' }}
                       transition={{ duration: 2, ease: "easeOut" }}
                       className="h-full bg-white"
                     />
                  </div>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold h-14 rounded-2xl shadow-lg border-none text-base">
                     Ver Benefícios
                  </Button>
               </div>
            </Card>

            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm p-10 rounded-[2.5rem] space-y-6">
               <h4 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Suporte ao Afiliado</h4>
               <p className="text-muted-foreground text-sm leading-relaxed font-medium">Algum problema com suas comissões? Nossa equipe técnica está disponível para analisar qualquer divergência.</p>
               <Button variant="link" className="text-primary p-0 h-auto font-bold flex items-center gap-2 group text-base hover:no-underline underline-offset-8 decoration-primary/30">
                  Abrir Ticket de Suporte <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </Button>
            </Card>
         </div>
      </div>
    </div>
  )
}
