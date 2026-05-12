"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
      {stores.map((store) => {
        return (
          <Card key={store.id} className="relative bg-white/5 backdrop-blur-md border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group overflow-hidden rounded-[2rem]">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
              <ExternalLink className="w-5 h-5 text-white/50" />
            </div>
            
            <div className="space-y-5">
              <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-inner overflow-hidden">
                 {store.logoUrl ? (
                   /* eslint-disable-next-line @next/next/no-img-element */
                   <img 
                      src={store.logoUrl} 
                      alt={store.name} 
                      className="max-w-full max-h-full object-contain p-2" 
                    />
                 ) : (
                   <ShoppingBag className="w-7 h-7 text-white/60" />
                 )}
              </div>
              
              <div>
                 <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none font-medium px-3 text-[10px] uppercase tracking-wider mb-3">
                   {store.category}
                 </Badge>
                 <h3 className="text-white font-serif text-xl mb-1">{store.name}</h3>
                 {store.description && (
                   <p className="text-white/60 text-sm font-light line-clamp-2 leading-relaxed">{store.description}</p>
                 )}
              </div>

              <Link 
                href={`/api/track?url=${encodeURIComponent(store.affiliateLink)}&type=store&id=${store.id}`} 
                target="_blank" 
                className="w-full h-12 bg-white/10 hover:bg-white text-white hover:text-stone-900 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center mt-2"
              >
                Explorar Coleção
              </Link>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
