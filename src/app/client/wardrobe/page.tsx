import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Camera, Shirt, Wand2 } from "lucide-react"

// Mock data for the wardrobe
const wardrobeItems = [
  { id: 1, name: "Blazer Alongado Off-White", category: "Terceira Peça", color: "Off-White", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Calça Pantalona Alfaiataria", category: "Parte de Baixo", color: "Preto", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Camisa de Seda Pura", category: "Parte de Cima", color: "Esmeralda", image: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Scarpin Couro Bico Fino", category: "Calçados", color: "Nude", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60" },
  { id: 5, name: "Vestido Midi Fluido", category: "Peça Única", color: "Azul Marinho", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60" },
  { id: 6, name: "Bolsa Estruturada Couro", category: "Acessórios", color: "Caramelo", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&auto=format&fit=crop&q=60" },
]

export default function VirtualWardrobe() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2">Guarda-Roupa Digital</h1>
          <p className="text-neutral-500 text-lg">Suas peças digitalizadas para multiplicações inteligentes.</p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm">
          <Camera className="w-4 h-4" /> Adicionar Peça
        </Button>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 bg-neutral-100/80 p-1">
          <TabsTrigger value="todas" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Peças</TabsTrigger>
          <TabsTrigger value="looks" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Meus Looks</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:text-rose-600">Descobertas IA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas" className="space-y-6">
          <div className="flex gap-2 pb-4 overflow-x-auto print:hidden">
            <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 px-4 py-1.5 cursor-pointer">Todas as Peças</Badge>
            <Badge variant="outline" className="text-neutral-600 hover:bg-neutral-50 px-4 py-1.5 cursor-pointer">Partes de Cima</Badge>
            <Badge variant="outline" className="text-neutral-600 hover:bg-neutral-50 px-4 py-1.5 cursor-pointer">Partes de Baixo</Badge>
            <Badge variant="outline" className="text-neutral-600 hover:bg-neutral-50 px-4 py-1.5 cursor-pointer">Terceira Peça</Badge>
            <Badge variant="outline" className="text-neutral-600 hover:bg-neutral-50 px-4 py-1.5 cursor-pointer">Calçados</Badge>
            <Badge variant="outline" className="text-neutral-600 hover:bg-neutral-50 px-4 py-1.5 cursor-pointer">Acessórios</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wardrobeItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group border-neutral-200/60 hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative overflow-hidden bg-neutral-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <Button variant="secondary" size="sm" className="bg-white text-neutral-900 border-none">Ver Detalhes</Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-rose-600">{item.category}</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 leading-tight truncate" title={item.name}>{item.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{item.color}</p>
                </CardContent>
              </Card>
            ))}
            
            <Card className="overflow-hidden group border-dashed border-2 border-neutral-300 hover:border-rose-400 hover:bg-rose-50/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-neutral-100 group-hover:bg-rose-100 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-neutral-400 group-hover:text-rose-600" />
              </div>
              <span className="font-medium text-neutral-600 group-hover:text-rose-700">Digitalizar Nova Peça</span>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="looks">
          <Card className="border-dashed border-2 py-16 text-center bg-transparent">
            <Shirt className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900">Nenhum look montado ainda</h3>
            <p className="text-neutral-500 mt-2 max-w-md mx-auto mb-6">Comece a combinar suas peças para criar formulações perfeitas para sua rotina.</p>
            <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">Criar Primeiro Look</Button>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="bg-gradient-to-br from-indigo-50 to-rose-50 border-rose-100 py-16 text-center">
            <Wand2 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-950">Inteligência Artificial E.S.T.I.L.O.</h3>
            <p className="text-indigo-800/70 mt-2 max-w-md mx-auto mb-6">Nossa IA pode analisar o seu guarda-roupa para sugerir novas compras e montar 30 looks automáticos.</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">Gerar Análise de Guarda-Roupa</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
