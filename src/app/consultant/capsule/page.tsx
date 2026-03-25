'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Edit3, Plus, MoreHorizontal, User } from "lucide-react"
import { motion } from "framer-motion"

const savedLooks = [
  { id: 1, title: "Look 1 - Casual Sofisticado", client: "Mariana Silva", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60" },
  { id: 2, title: "Look 2 - Reunião Executiva", client: "Juliana Mendes", image: "https://images.unsplash.com/photo-1485230895905-ef224e758e57?w=500&auto=format&fit=crop&q=60" },
  { id: 3, title: "Look 3 - Final de Semana", client: "Mariana Silva", image: "https://images.unsplash.com/photo-1550614000-4b95d4edbb9d?w=500&auto=format&fit=crop&q=60" },
  { id: 4, title: "Look 4 - Evento Noturno", client: "Carolina Alves", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop&q=60" },
]

export default function WardrobeCapsule() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Cápsulas de Estilo</h1>
          <p className="text-muted-foreground text-lg">Monte e organize looks estratégicos para suas clientes.</p>
        </div>
        <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2">
          <Plus className="w-5 h-5" /> Montar Novo Look
        </Button>
      </div>

      <div className="flex items-center justify-between px-2 pt-4">
         <h2 className="text-2xl font-bold text-foreground">Looks Salvos (Recentes)</h2>
         <Button variant="link" className="text-primary font-bold p-0">Ver Todos</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {savedLooks.map((look, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={look.id}
          >
            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
              <div className="relative aspect-[3/4] overflow-hidden bg-primary/5">
                <img 
                  src={look.image} 
                  alt={look.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md text-foreground hover:text-primary shadow-xl border-none">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                   <div className="h-8 w-8 rounded-lg bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <User className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-[10px] text-white font-bold uppercase tracking-widest">{look.client}</span>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="font-bold text-foreground leading-tight mb-6 text-lg tracking-tight line-clamp-1">{look.title}</h3>
                
                <div className="flex gap-3">
                  <Button className="flex-1 h-12 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground font-bold border-none rounded-2xl gap-2 transition-all shadow-none">
                    <Download className="w-4 h-4" /> Baixar
                  </Button>
                  <Button variant="outline" className="h-12 w-12 p-0 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl border-none shadow-sm bg-primary/5">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
