'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Loader2,
  BookOpen,
  Filter,
  CheckCircle2,
  Palette,
  ShoppingBag,
  Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { getEbooks } from "@/lib/actions"
import { Ebook } from "@/types/database"
import { motion } from "framer-motion"

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEbooks()
        setEbooks(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Editor de Dossiês & E-books</h1>
          <p className="text-muted-foreground text-lg">Guia visuais premium de alta fidelidade para suas clientes.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6">
             <Filter className="w-5 h-5 mr-2" /> Filtrar por Cliente
           </Button>
           <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2 px-8">
             <Plus className="w-5 h-5" /> Novo Dossiê
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Guia de Estilo', icon: BookOpen, type: 'Standard' },
           { label: 'Dossiê Platinum', icon: Sparkles, type: 'Recomendado', premium: true },
           { label: 'Cartela de Cores', icon: Palette, type: 'PDF Digital' },
           { label: 'Guia de Compras', icon: ShoppingBag, type: 'Lista Curada' },
         ].map((item, i) => (
           <Card key={i} className={`border-none ${item.premium ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card/60 text-foreground'} backdrop-blur-md shadow-sm p-8 flex flex-col justify-center items-center text-center space-y-4 hover:shadow-md transition-all rounded-[2rem] cursor-pointer group`}>
              <div className={`w-16 h-16 rounded-2xl ${item.premium ? 'bg-white/20' : 'bg-primary/5'} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500`}>
                 <item.icon className={`w-8 h-8 ${item.premium ? 'text-white' : 'text-primary'}`} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{item.label}</h4>
                <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${item.premium ? 'text-white/60' : 'text-primary'}`}>{item.type}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-2xl font-bold text-foreground">E-books Gerados</h2>
           <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="bg-background/50 border-primary/10 pl-12 h-12 rounded-2xl text-sm focus:ring-primary/20" placeholder="Buscar por cliente..." />
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {loading ? (
             <div className="col-span-full h-64 flex items-center justify-center">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
             </div>
           ) : ebooks.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full h-80 border-2 border-dashed border-primary/10 rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground bg-primary/[0.01]"
             >
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-primary/30" />
                </div>
                <p className="font-bold uppercase tracking-[0.2em] text-xs">Nenhum dossiê gerado ainda</p>
                <Button variant="link" className="mt-4 text-primary font-bold">Gerar meu primeiro guia</Button>
             </motion.div>
           ) : (
             ebooks.map((ebook, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={ebook.id}
                >
                  <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm group hover:shadow-md transition-all rounded-[2.5rem] overflow-hidden relative">
                    <div className="h-2 bg-primary/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '100%' }}
                         transition={{ duration: 1.5 }}
                         className="h-full bg-primary/20"
                       />
                    </div>
                    <CardContent className="p-8">
                       <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                             <FileText className="w-8 h-8 text-primary group-hover:text-primary transition-colors" />
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">
                             <CheckCircle2 className="w-3 h-3 mr-1" /> Finalizado
                          </Badge>
                       </div>
                       
                       <h3 className="text-foreground font-bold text-xl mb-1 tracking-tight">{ebook.title}</h3>
                       <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Dossiê de Estilo & Coloração</p>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl text-xs font-bold gap-2">
                             <Eye className="w-4 h-4" /> Prévia
                          </Button>
                          <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-bold gap-2 border-none">
                             <Download className="w-4 h-4" /> Download
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
             ))
           )}
        </div>
      </div>
    </div>
  )
}
