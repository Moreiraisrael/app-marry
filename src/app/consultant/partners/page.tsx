'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Image from "next/image"

const partnerStores = [
  { id: 1, name: "MAC Cosmetics", category: "Maquiagem", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mac_cosmetics_logo.svg", discount: "15% OFF" },
  { id: 2, name: "Arezzo", category: "Calçados", logo: "https://logodownload.org/wp-content/uploads/2019/08/arezzo-logo-1.png", discount: "Frete Grátis" },
  { id: 3, name: "Sephora", category: "Maquiagem", logo: "https://logodownload.org/wp-content/uploads/2016/09/sephora-logo.png", discount: "10% OFF" },
  { id: 4, name: "Zara", category: "Vestuário", logo: "https://logodownload.org/wp-content/uploads/2014/05/zara-logo-1.png", discount: "Wishlist VIP" },
  { id: 5, name: "Amaro", category: "Vestuário", logo: "https://logodownload.org/wp-content/uploads/2021/03/amaro-logo.png", discount: "20% OFF" },
  { id: 6, name: "Schutz", category: "Calçados", logo: "https://logodownload.org/wp-content/uploads/2019/08/schutz-logo.png", discount: "10% OFF" },
]

export default function PartnerStores() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Lojas Parceiras</h1>
          <p className="text-muted-foreground text-lg">Catálogo curado para indicação com benefícios exclusivos.</p>
        </div>
        <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2">
          <Filter className="w-4 h-4" /> Filtrar Categorias
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <Badge className="bg-primary text-primary-foreground px-6 py-2 cursor-pointer hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest border-none rounded-xl">Todas as Lojas</Badge>
          {['Maquiagem', 'Vestuário', 'Calçados', 'Acessórios'].map((cat, i) => (
            <Badge key={i} variant="outline" className="border-primary/10 text-muted-foreground bg-card/40 px-6 py-2 cursor-pointer hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest rounded-xl whitespace-nowrap">
              {cat}
            </Badge>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-12 bg-card/60 border-none text-foreground rounded-2xl h-11 focus:ring-2 focus:ring-primary/20 shadow-sm" placeholder="Buscar loja..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partnerStores.map((store, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={store.id}
          >
            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2.5rem] overflow-hidden group p-8">
              <div className="h-24 w-full flex items-center justify-center mb-8 bg-background/50 rounded-2xl p-6 border border-primary/5 group-hover:bg-primary/[0.02] transition-colors duration-500 relative">
                 <Image 
                    src={store.logo} 
                    alt={store.name} 
                    fill 
                    className="object-contain p-4 opacity-40 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-110" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
              </div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-bold text-2xl text-foreground tracking-tight">{store.name}</h3>
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1 block">{store.category}</span>
                </div>
                <Badge className="bg-primary text-primary-foreground border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase">
                  {store.discount}
                </Badge>
              </div>
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all font-bold shadow-lg shadow-primary/10 border-none gap-2 text-base">
                Visitar Loja <ExternalLink className="w-5 h-5" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
