'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus, Search, Filter, Camera, ShoppingBag, FolderOpen, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function VirtualWardrobePage() {
  const categories = ['Todas', 'Blusas', 'Calças', 'Vestidos', 'Sapatos', 'Acessórios']

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Wardrobe Intelligence
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Guarda-Roupa Virtual</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Gerencie o acervo digital de suas clientes e crie combinações estratégicas com IA.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2">
            <Camera className="w-4 h-4" /> Escanear Peça
          </Button>
          <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2">
            <Plus className="w-5 h-5" /> Adicionar Manual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-8">
          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8">
            <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Filtros
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 block">Selecionar Cliente</label>
                <select 
                  aria-label="Selecionar Cliente"
                  className="w-full bg-background/50 border border-primary/10 rounded-xl p-3 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option>Todas as Clientes</option>
                  <option>Mariana Costa</option>
                  <option>Juliana Mendes</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 block">Categorias</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge key={cat} variant="outline" className="border-primary/10 text-muted-foreground hover:border-primary/40 hover:text-primary cursor-pointer px-3 py-1 bg-background/30 transition-all rounded-lg">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none bg-primary p-8 rounded-[2rem] text-primary-foreground relative overflow-hidden group shadow-xl shadow-primary/20">
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
             <h4 className="text-xl font-bold mb-2">IA Stylist</h4>
             <p className="text-xs text-white/70 leading-relaxed mb-6">
               Gerar 5 novos looks baseados na cartela <strong>Outono Suave</strong> da cliente selecionada.
             </p>
             <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl shadow-lg">
               Sugestões de Looks
             </Button>
          </Card>
        </aside>

        {/* Wardrobe Grid */}
        <main className="lg:col-span-3 space-y-8">
          <div className="relative">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
              placeholder="Buscar por tag, cor ou ocasião..." 
              className="pl-14 h-16 border-none bg-card/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 rounded-3xl backdrop-blur-md shadow-sm" 
             />
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-primary/5 border border-primary/10 p-1 rounded-2xl h-12">
                <TabsTrigger value="grid" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs px-6 transition-all">Geral</TabsTrigger>
                <TabsTrigger value="capsules" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs px-6 transition-all">Cápsulas</TabsTrigger>
              </TabsList>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">0 Peças Encontradas</div>
            </div>

            <TabsContent value="grid" className="mt-0">
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                  {/* Empty State */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 relative">
                       <ShoppingBag className="w-10 h-10 text-primary/30" />
                       <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full border-4 border-background" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold text-2xl mb-2">Guarda-Roupa Vazio</h4>
                      <p className="text-muted-foreground max-w-sm mx-auto">Comece escanear as peças da cliente ou crie sua primeira cápsula estratégica.</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 font-bold px-8">
                       Adicionar Primeira Peça
                    </Button>
                  </motion.div>
               </div>
            </TabsContent>
            
            <TabsContent value="capsules" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-dashed border-2 border-primary/20 bg-background/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-primary/[0.02] transition-all">
                     <FolderOpen className="w-12 h-12 text-primary/30 mb-4 group-hover:scale-110 transition-transform" />
                     <h4 className="font-bold text-foreground">Nova Cápsula</h4>
                     <p className="text-xs text-muted-foreground">Agrupe peças para ocasiões específicas.</p>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
