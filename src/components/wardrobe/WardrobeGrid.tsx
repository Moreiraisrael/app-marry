"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { WardrobeItem } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface WardrobeGridProps {
  items: WardrobeItem[]
}

export function WardrobeGrid({ items }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-32 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="w-28 h-28 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/10 relative group">
             <ShoppingBag className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-background shadow-lg" />
          </div>
          <div className="space-y-3">
            <h4 className="text-foreground font-bold text-3xl tracking-tight">Acervo Digital Vazio</h4>
            <p className="text-muted-foreground max-w-sm mx-auto font-light text-lg">
              Clique em &quot;Escanear Peça&quot; para começar a digitalizar o guarda-roupa da sua cliente.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl gap-3 font-bold px-10 h-14 shadow-xl shadow-primary/20 transition-all">
             Digitalizar Primeira Peça
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item, i) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-700 rounded-[2.5rem] overflow-hidden group border border-primary/5">
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
               <Image 
                 src={item.photo_url} 
                 alt={item.category || "Roupa"} 
                 fill
                 className="object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-white font-bold uppercase tracking-widest">{item.category}</span>
                     <div className="flex gap-2">
                        <Button size="icon" className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-primary hover:border-primary transition-all">
                           <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="icon" className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-stone-900 transition-all">
                           <MoreHorizontal className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground line-clamp-1 text-sm tracking-tight">{item.subcategory || 'Sem Categoria'}</h4>
                  { }
                  <div className={`w-3 h-3 rounded-full border border-white/50 shadow-sm`} style={{ backgroundColor: item.color || '#ccc' }} />
               </div>
               <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] font-bold border-none px-2 py-0.5 rounded-md ${
                    item.status === 'keep' ? 'bg-emerald-100 text-emerald-600' :
                    item.status === 'donate' ? 'bg-rose-100 text-rose-600' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {item.status?.toUpperCase()}
                  </Badge>
               </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
