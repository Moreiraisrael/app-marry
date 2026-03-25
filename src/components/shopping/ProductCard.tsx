"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingBag, Heart, Star } from "lucide-react"
import Link from "next/link"

interface ProductCardProps {
  id: string
  name: string
  price: number
  storeName: string
  imageUrl: string
  affiliateUrl: string
  category?: string
  rating?: number
}

export function ProductCard({
  name,
  price,
  storeName,
  imageUrl,
  affiliateUrl,
  category,
  rating = 4.8
}: ProductCardProps) {
  return (
    <Card className="group relative bg-neutral-900/40 border-amber-500/10 hover:border-amber-500/30 transition-all duration-500 overflow-hidden rounded-3xl backdrop-blur-sm">
      <div className="absolute top-4 right-4 z-10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-black/60 border-white/10 text-white hover:bg-amber-500 hover:text-black">
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {category && (
          <Badge className="absolute top-4 left-4 bg-amber-500 text-black font-bold uppercase text-[10px] tracking-widest px-3 py-1">
            {category}
          </Badge>
        )}
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] text-amber-200/60 font-bold uppercase tracking-widest">{rating} | Verificado</span>
          </div>
          <p className="text-white font-serif italic text-lg truncate mb-1">{name}</p>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
             <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em]">{storeName}</p>
             <p className="text-2xl font-mono text-white">
                <span className="text-sm align-top mr-1">R$</span>
                {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </p>
          </div>
          <Badge variant="outline" className="border-amber-500/20 text-amber-200/40 text-[9px] font-bold h-6">
            Curadoria Premium
          </Badge>
        </div>

        <Link href={affiliateUrl} target="_blank">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 rounded-xl group/btn shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <ShoppingBag className="w-4 h-4 mr-2" /> Comprar Agora
            <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
