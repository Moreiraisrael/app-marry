"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingBag, Heart, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  id,
  name,
  price,
  storeName,
  imageUrl,
  affiliateUrl,
  category,
  rating = 4.8
}: ProductCardProps) {
  return (
    <Card className="group relative bg-white border-none shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden rounded-[2rem] flex flex-col">
      {/* Container da Imagem */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out origin-center" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Gradiente suave no topo e na base (opcional) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Badges do topo */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {category ? (
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-md border-none text-stone-900 font-semibold px-3 py-1 shadow-sm rounded-full text-[10px] uppercase tracking-wider">
              {category}
            </Badge>
          ) : (
            <div />
          )}
          <Button size="icon" className="h-9 w-9 rounded-full bg-white/50 backdrop-blur-md border-none text-stone-700 hover:bg-white hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Avaliação e Curadoria sobre a foto (aparece no hover) */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-stone-700 font-bold tracking-widest">{rating}</span>
          </div>
          <Badge variant="outline" className="border-none bg-stone-900/80 backdrop-blur-sm text-white text-[9px] font-bold h-6 uppercase tracking-widest px-3 rounded-full">
            Curadoria
          </Badge>
        </div>
      </div>

      {/* Área de Conteúdo (Clean Design) */}
      <CardContent className="p-6 flex-1 flex flex-col justify-between bg-white z-20">
        <div className="space-y-2 mb-6">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">{storeName}</p>
          <h3 className="text-stone-800 font-serif text-lg leading-snug line-clamp-2">{name}</h3>
          <p className="text-2xl font-medium text-stone-900 pt-1">
            <span className="text-sm font-sans align-top mr-1 text-stone-500">R$</span>
            {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <Link href={`/api/track?url=${encodeURIComponent(affiliateUrl)}&type=product&id=${id}`} target="_blank" className="block w-full mt-auto">
          <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium h-12 rounded-xl group/btn shadow-lg shadow-stone-200 transition-all">
            <ShoppingBag className="w-4 h-4 mr-2" /> Comprar
            <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
