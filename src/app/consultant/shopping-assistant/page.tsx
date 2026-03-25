'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, Sparkles, Search, Plus, 
  Layers, Palette, Tag, Heart, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function ShoppingAssistantPage() {
  const categories = ['Blazers', 'Camisas', 'Vestidos', 'Acessórios', 'Sapatos']
  
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs px-1">
            <Sparkles className="w-4 h-4" />
            Curadoria Inteligente
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Assistente de Compras</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Encontre itens perfeitos baseando-se em cartelas e estilos.</p>
        </div>
        <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2 px-8">
          <Plus className="w-5 h-5" /> Nova Recomendação
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8">
            <h3 className="text-foreground font-bold mb-6 flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" /> Filtros por Cliente
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold px-1">Cartela de Cores</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="border-primary/20 text-primary bg-primary/5 font-bold h-10 rounded-xl justify-start px-4">Inverno Frio</Button>
                  <Button variant="outline" size="sm" className="border-primary/5 text-muted-foreground/40 font-medium h-10 rounded-xl justify-start px-4">Verão Suave</Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold px-1">Estilo Predominante</label>
                <div className="flex flex-wrap gap-2">
                  {['Elegante', 'Criativo', 'Moderno'].map(style => (
                    <Badge key={style} className="bg-primary/10 text-primary border-none font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/20 transition-all">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none bg-primary/5 rounded-[2rem] p-8 space-y-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="text-primary w-5 h-5" />
            </div>
            <h4 className="text-foreground font-bold text-sm tracking-tight">Dica de Especialista</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Clientes de <strong>Inverno Frio</strong> respondem melhor a peças com alto contraste e metais prateados.
            </p>
          </Card>
        </div>

        {/* Main Search & Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              className="pl-14 bg-card/60 border-none text-foreground rounded-[1.5rem] h-16 focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm font-sans" 
              placeholder="Buscar por marca, categoria ou SKU..." 
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, i) => (
              <Button key={cat} variant="ghost" className={`whitespace-nowrap rounded-xl border border-primary/5 px-6 font-bold text-xs uppercase tracking-widest ${i === 0 ? 'bg-primary text-primary-foreground border-none' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}>
                {cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
              >
                <Card className="border-none bg-card/60 backdrop-blur-md group hover:shadow-md transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row h-full">
                  <div className="sm:w-2/5 aspect-[4/5] bg-primary/5 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                     <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold text-[10px] uppercase border-none rounded-lg px-2.5 py-1">
                          <Tag className="w-3 h-3 mr-1" /> Premium
                        </Badge>
                     </div>
                     <ShoppingBag className="w-16 h-16 text-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-700" />
                  </div>
                  <div className="sm:w-3/5 p-8 flex flex-col justify-between h-full bg-white/40">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-foreground text-xl tracking-tight leading-tight">Blazer Alfaiataria</h4>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-rose-500 rounded-xl h-8 w-8 transition-colors"><Heart className="w-5 h-5 shadow-none" /></Button>
                      </div>
                      <div className="flex gap-2.5 mb-6">
                        <div className="w-5 h-5 rounded-full bg-zinc-900 ring-2 ring-primary/10 ring-offset-2" title="Preto" />
                        <div className="w-5 h-5 rounded-full bg-neutral-200 ring-1 ring-primary/5" title="Off White" />
                      </div>
                      <p className="text-muted-foreground text-xs font-medium line-clamp-2 leading-relaxed italic">
                        "Elegância atemporal para o arquétipo Governante."
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-8">
                      <span className="text-2xl font-bold text-foreground">R$ 899</span>
                      <Button variant="ghost" className="text-primary font-bold gap-2 hover:bg-primary/10 group/btn rounded-2xl h-11 px-6 transition-all">
                        Ver Mais <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
