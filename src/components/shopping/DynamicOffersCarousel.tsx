"use client"

import { PromotionCoupon } from "@/lib/actions/promotions"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Flame } from "lucide-react"
import Link from "next/link"

export function DynamicOffersCarousel({ offers }: { offers: PromotionCoupon[] }) {
  if (!offers || offers.length === 0) return null

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 mb-6 px-1">
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
        <h2 className="text-2xl font-bold text-foreground">Ofertas em Destaque</h2>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {offers.map((offer) => {
          const targetUrl = offer.store?.store_link || "#"
          const trackUrl = targetUrl !== "#" ? `/api/track?url=${encodeURIComponent(targetUrl)}&type=highlight_offer&id=${offer.id}` : "#"
          
          return (
            <Link 
              key={offer.id} 
              href={trackUrl}
              target={targetUrl !== "#" ? "_blank" : undefined}
              className="snap-center shrink-0 w-[85vw] md:w-[400px] h-64 rounded-[2.5rem] bg-stone-900 border border-stone-800 p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-xl shadow-stone-200/50"
            >
              {/* Visual background gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-700" />
              
              <div className="relative z-10 flex justify-between items-start">
                 <Badge className="bg-white/10 hover:bg-white/20 text-white border-none font-bold uppercase tracking-wider text-[10px] backdrop-blur-md">
                    Oferta Especial
                 </Badge>
                 {offer.store?.logo_url && (
                   <img src={offer.store.logo_url} alt={offer.store.name} className="w-10 h-10 rounded-full border-2 border-white/10 shadow-sm" />
                 )}
              </div>

              <div className="relative z-10 space-y-4">
                 <div>
                    <h3 className="text-2xl font-bold text-white leading-tight mb-2 group-hover:underline decoration-primary/50 underline-offset-4">{offer.title}</h3>
                    <p className="text-stone-400 text-sm line-clamp-2">{offer.description || `Aproveite as melhores ofertas da ${offer.store?.name}.`}</p>
                 </div>
                 <div className="flex items-center justify-between pt-2">
                    <span className="text-3xl font-black text-primary">{offer.discount_amount}</span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md group-hover:bg-white group-hover:text-stone-900 transition-all">
                       <ExternalLink className="w-4 h-4" />
                    </div>
                 </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

