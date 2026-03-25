"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface Store {
  id: string
  name: string
  logoUrl?: string
  category: string
  affiliateLink: string
  description?: string
}

interface StoreGridProps {
  stores: Store[]
}

export function StoreGrid({ stores }: StoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stores.map((store) => (
        <Card key={store.id} className="relative bg-black/40 border-amber-500/10 p-6 hover:border-amber-500/40 transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-amber-500" />
          </div>
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl border border-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
               {store.logoUrl ? (
                 <img src={store.logoUrl} alt={store.name} className="w-10 h-10 object-contain" />
               ) : (
                 <ShoppingBag className="w-8 h-8 text-amber-500/30" />
               )}
            </div>
            
            <div>
               <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold uppercase tracking-widest mb-2">
                 {store.category}
               </Badge>
               <h3 className="text-white font-bold text-lg">{store.name}</h3>
               {store.description && (
                 <p className="text-amber-200/40 text-xs mt-1 line-clamp-2">{store.description}</p>
               )}
            </div>

            <Link href={store.affiliateLink} target="_blank">
               <button className="w-full h-10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-colors">
                 Explorar Coleção
               </button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
