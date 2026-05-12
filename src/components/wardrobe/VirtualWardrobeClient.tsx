"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus, Search, Filter, Camera, FolderOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { WardrobeGrid } from "@/components/wardrobe/WardrobeGrid"
import { AddWardrobeItemModal } from "@/components/wardrobe/AddWardrobeItemModal"
import { AnalyzeLookModal } from "@/components/wardrobe/AnalyzeLookModal"
import { WardrobeItem } from "@/types/database"

interface VirtualWardrobeClientProps {
  initialItems: WardrobeItem[]
  clients: any[]
}

export function VirtualWardrobeClient({ initialItems, clients }: VirtualWardrobeClientProps) {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const handleDeleteItem = (deletedId: string) => {
    setItems(prev => prev.filter(item => item.id !== deletedId))
  }

  const categories = ['Todas', 'Blusas', 'Calças', 'Vestidos', 'Sapatos', 'Acessórios']

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchClient = selectedClient === "all" || item.client_id === selectedClient
      // For category, map portuguese categories to our english enums if needed, 
      // or just check if it matches. Our modal uses English values like 'Top', 'Bottom', 'Shoes'.
      const mapCategory = (cat: string) => {
        if (cat === "Blusas") return "Top"
        if (cat === "Calças") return "Bottom"
        if (cat === "Sapatos") return "Shoes"
        if (cat === "Acessórios") return "Accessories"
        if (cat === "Vestidos") return "OnePiece"
        return cat
      }
      
      const mappedSelectedCat = mapCategory(selectedCategory)
      const matchCategory = selectedCategory === "Todas" || item.category === mappedSelectedCat

      const searchLower = searchQuery.toLowerCase()
      const matchSearch = !searchQuery || 
        (item.subcategory?.toLowerCase().includes(searchLower)) ||
        (item.category?.toLowerCase().includes(searchLower))

      return matchClient && matchCategory && matchSearch
    })
  }, [items, selectedClient, selectedCategory, searchQuery])

  // Provide a default client id for the modal if none selected
  const activeClientId = selectedClient !== "all" ? selectedClient : (clients[0]?.id || "")

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
             <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
              <Sparkles className="w-4 h-4" />
              Wardrobe Intelligence
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Guarda-Roupa Virtual</h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-light">
              Gerencie o acervo digital de suas clientes e crie combinações estratégicas com suporte de IA.
            </p>
          </div>
          <div className="flex gap-4">
            <AddWardrobeItemModal 
              clientId={activeClientId} 
              trigger={
                <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2 transition-all">
                  <Camera className="w-4 h-4" /> Escanear Peça
                </Button>
              } 
            />
            <AddWardrobeItemModal 
              clientId={activeClientId} 
              trigger={
                <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2 transition-all">
                  <Plus className="w-5 h-5" /> Adicionar Manual
                </Button>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1 space-y-8">
            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8 border border-primary/5">
              <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Filtros
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 block">Selecionar Cliente</label>
                  <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    aria-label="Selecionar Cliente"
                    className="w-full bg-background/50 border border-primary/10 rounded-xl p-3 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="all">Todas as Clientes</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 block">Categorias</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Badge 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        variant={selectedCategory === cat ? "default" : "outline"} 
                        className={`cursor-pointer px-3 py-1 transition-all rounded-lg ${
                          selectedCategory === cat 
                            ? 'bg-primary text-primary-foreground border-transparent' 
                            : 'border-primary/10 text-muted-foreground hover:border-primary/40 hover:text-primary bg-background/30'
                        }`}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-none bg-primary p-10 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20 cursor-pointer">
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
               <h4 className="text-xl font-bold mb-3 relative z-10">IA Stylist</h4>
               <p className="text-xs text-white/80 leading-relaxed mb-8 relative z-10">
                 Faça upload de um look completo e receba uma análise detalhada da nossa Inteligência Artificial sobre harmonia, proporções e ocasiões adequadas.
               </p>
               <AnalyzeLookModal clientId={activeClientId} />
            </Card>
          </aside>

          <main className="lg:col-span-3 space-y-8">
            <div className="relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
               <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tag, cor ou ocasião..." 
                className="pl-14 h-16 border-none bg-card/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 rounded-3xl backdrop-blur-md shadow-sm border border-primary/5" 
               />
            </div>

            <Tabs defaultValue="grid" className="w-full">
              <div className="flex items-center justify-between mb-8">
                <TabsList className="bg-primary/5 border border-primary/10 p-1.5 rounded-2xl h-14">
                  <TabsTrigger value="grid" className="h-11 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs px-8 transition-all">Geral</TabsTrigger>
                  <TabsTrigger value="capsules" className="h-11 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs px-8 transition-all">Cápsulas</TabsTrigger>
                </TabsList>
                <div className="text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold">{filteredItems.length} Peças Encontradas</div>
              </div>

              <TabsContent value="grid" className="mt-0">
                 <WardrobeGrid items={filteredItems} activeClientId={activeClientId} onDelete={handleDeleteItem} />
              </TabsContent>
              
              <TabsContent value="capsules" className="mt-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add New Capsule Card */}
                    <Card onClick={() => alert('Criação de cápsulas em desenvolvimento!')} className="border-dashed border-2 border-stone-200 bg-stone-50/50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[280px] shadow-sm hover:shadow-md">
                       <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-stone-100">
                          <Plus className="w-6 h-6 text-stone-400 group-hover:text-primary transition-colors" />
                       </div>
                       <h4 className="font-serif font-bold text-stone-900 text-xl mb-2">Nova Cápsula</h4>
                       <p className="text-sm text-stone-500 font-light max-w-[200px] leading-relaxed">Crie coleções temáticas e estratégias para facilitar o dia a dia da sua cliente.</p>
                    </Card>

                    {/* Mock Capsule 1 */}
                    <Card className="border-none bg-white rounded-[2rem] p-6 flex flex-col group cursor-pointer hover:shadow-2xl shadow-sm transition-all duration-500 min-h-[280px] relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                       <div className="flex justify-between items-start mb-auto relative z-10">
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">Viagem</Badge>
                          <span className="text-xs font-bold text-stone-400">12 Peças</span>
                       </div>
                       <div className="relative z-10 mt-6">
                          <h4 className="font-serif font-bold text-stone-900 text-2xl mb-2 group-hover:text-primary transition-colors">Paris Fashion Week</h4>
                          <p className="text-sm text-stone-500 font-light line-clamp-2">Uma seleção de looks elegantes com sobreposições para o outono europeu.</p>
                       </div>
                       {/* Mock Image Thumbnails */}
                       <div className="flex -space-x-4 mt-6 relative z-10">
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden"><img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200&auto=format&fit=crop" alt="Peça 1" className="w-full h-full object-cover" /></div>
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden"><img src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=200&auto=format&fit=crop" alt="Peça 2" className="w-full h-full object-cover" /></div>
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden"><img src="https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=200&auto=format&fit=crop" alt="Peça 3" className="w-full h-full object-cover" /></div>
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-100 shadow-sm flex items-center justify-center text-xs font-bold text-stone-600">+9</div>
                       </div>
                    </Card>

                    {/* Mock Capsule 2 */}
                    <Card className="border-none bg-white rounded-[2rem] p-6 flex flex-col group cursor-pointer hover:shadow-2xl shadow-sm transition-all duration-500 min-h-[280px] relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                       <div className="flex justify-between items-start mb-auto relative z-10">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">Trabalho</Badge>
                          <span className="text-xs font-bold text-stone-400">8 Peças</span>
                       </div>
                       <div className="relative z-10 mt-6">
                          <h4 className="font-serif font-bold text-stone-900 text-2xl mb-2 group-hover:text-primary transition-colors">Executive Chic</h4>
                          <p className="text-sm text-stone-500 font-light line-clamp-2">Alfaiataria moderna e peças estruturadas para reuniões importantes.</p>
                       </div>
                       {/* Mock Image Thumbnails */}
                       <div className="flex -space-x-4 mt-6 relative z-10">
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden"><img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=200&auto=format&fit=crop" alt="Peça 1" className="w-full h-full object-cover" /></div>
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-200 shadow-sm overflow-hidden"><img src="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=200&auto=format&fit=crop" alt="Peça 2" className="w-full h-full object-cover" /></div>
                         <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-100 shadow-sm flex items-center justify-center text-xs font-bold text-stone-600">+6</div>
                       </div>
                    </Card>
                 </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
