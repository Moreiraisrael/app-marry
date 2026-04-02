import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus, Search, Filter, Camera, FolderOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getWardrobeItems } from "@/lib/actions/wardrobe"
import { getClients } from "@/lib/actions/clients"
import { WardrobeGrid } from "@/components/wardrobe/WardrobeGrid"

export const dynamic = 'force-dynamic'

export default async function VirtualWardrobePage() {
  const items = await getWardrobeItems()
  const clients = await getClients()
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
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Gerencie o acervo digital de suas clientes e crie combinações estratégicas com suporte de IA.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2 transition-all">
            <Camera className="w-4 h-4" /> Escanear Peça
          </Button>
          <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2 transition-all">
            <Plus className="w-5 h-5" /> Adicionar Manual
          </Button>
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
                  aria-label="Selecionar Cliente"
                  className="w-full bg-background/50 border border-primary/10 rounded-xl p-3 text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option>Todas as Clientes</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
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

          <Card className="border-none bg-primary p-10 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20 cursor-pointer">
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
             <h4 className="text-xl font-bold mb-3 relative z-10">IA Stylist</h4>
             <p className="text-xs text-white/80 leading-relaxed mb-8 relative z-10">
               Gerar 5 novos looks baseados nas cores e arquétipos das clientes selecionadas.
             </p>
             <Button className="w-full bg-white text-primary hover:bg-stone-50 font-bold rounded-xl h-12 relative z-10 transition-all">
               Sugestões de Looks
             </Button>
          </Card>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <div className="relative group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
             <Input 
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
              <div className="text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold">{items.length} Peças Encontradas</div>
            </div>

            <TabsContent value="grid" className="mt-0">
               <WardrobeGrid items={items} />
            </TabsContent>
            
            <TabsContent value="capsules" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-dashed border-2 border-primary/20 bg-background/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-primary/[0.02] transition-all min-h-[300px]">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-8 h-8 text-primary/40" />
                     </div>
                     <h4 className="font-bold text-foreground text-xl mb-2">Nova Cápsula</h4>
                     <p className="text-sm text-muted-foreground font-light max-w-[200px]">Agrupe peças para criar coleções temáticas e estratégias.</p>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
