"use client"

import { ProductCard } from "@/components/shopping/ProductCard"
import { StoreGrid } from "@/components/shopping/StoreGrid"
import { ShoppingBag, Sparkles, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const mockProducts = [
  {
    id: "1",
    name: "Blazer Estruturado Off-White",
    price: 459.90,
    storeName: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    affiliateUrl: "https://zara.com",
    category: "Alfaiataria"
  },
  {
    id: "2",
    name: "Vestido Midi Seda Champagne",
    price: 890.00,
    storeName: "Animale",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    affiliateUrl: "https://animale.com.br",
    category: "Festas"
  },
  {
    id: "3",
    name: "Scarpin Couro legítimo Nude",
    price: 320.00,
    storeName: "Arezo",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    affiliateUrl: "https://arezzo.com.br",
    category: "Acessórios"
  },
  {
    id: "4",
    name: "Calça Pantalona Linho",
    price: 289.00,
    storeName: "Amaro",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    affiliateUrl: "https://amaro.com",
    category: "Casual"
  }
]

const mockStores = [
  {
    id: "s1",
    name: "Zara",
    category: "Fast Fashion Premium",
    affiliateLink: "https://zara.com",
    description: "Peças de tendência com cortes contemporâneos e alfaiataria acessível."
  },
  {
    id: "s2",
    name: "Animale",
    category: "Luxo Nacional",
    affiliateLink: "https://animale.com.br",
    description: "Sofisticação, seda e cortes impecáveis para a mulher moderna."
  },
  {
    id: "s3",
    name: "Arezzo",
    category: "Calçados & Bolsas",
    affiliateLink: "https://arezzo.com.br",
    description: "Design italiano e qualidade em acessórios essenciais."
  },
  {
    id: "s4",
    name: "Amaro",
    category: "Lifestyle",
    affiliateLink: "https://amaro.com",
    description: "Moda digital com foco em versatilidade e curadoria inteligente."
  }
]

export default function ClientShopPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-4">
           <Badge className="bg-rose-50 text-rose-500 border-rose-100 px-4 py-1 text-xs uppercase tracking-widest font-bold">Curadoria Exclusiva</Badge>
           <h1 className="text-5xl font-serif font-bold text-neutral-900 leading-tight">Sua Vitrine <span className="text-rose-500">Personalizada</span></h1>
           <p className="text-neutral-500 text-lg max-w-xl">Peças selecionadas a dedo pela sua consultora para complementar seu guarda-roupa e expressar sua essência.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 border-neutral-200 rounded-xl px-6 hover:bg-neutral-50">
             <Filter className="w-4 h-4 mr-2" /> Filtrar Estilo
           </Button>
           <Button className="h-12 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-8 shadow-xl shadow-neutral-200">
             Ver Todos <ChevronRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
           <h2 className="text-2xl font-serif font-bold text-neutral-800 flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-rose-500" /> Recomendações da Consultora
           </h2>
           <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{mockProducts.length} ITENS</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {mockProducts.map((product) => (
             <ProductCard key={product.id} {...product} />
           ))}
        </div>
      </section>

      <section className="bg-neutral-900 rounded-[3rem] p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-10">
           <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Lojas Parceiras</h2>
              <p className="text-neutral-400">Acesse suas marcas favoritas com benefícios exclusivos da nossa plataforma.</p>
           </div>
           
           <StoreGrid stores={mockStores} />
        </div>
      </section>

      <div className="bg-rose-50/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-rose-100">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
             <ShoppingBag className="text-white w-7 h-7" />
           </div>
           <div>
              <h4 className="font-bold text-neutral-900 text-lg">Precisa de ajuda com uma compra?</h4>
              <p className="text-neutral-500 text-sm italic">Envie uma mensagem direta para sua consultora agora mesmo.</p>
           </div>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 px-8 font-bold">
           Falar com Especialista
        </Button>
      </div>
    </div>
  )
}
