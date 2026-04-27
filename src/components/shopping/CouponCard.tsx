"use client"

import { useState } from "react"
import { Copy, ExternalLink, CheckCircle2, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PromotionCoupon } from "@/lib/actions/promotions"

export function CouponCard({ coupon }: { coupon: PromotionCoupon }) {
  const [copied, setCopied] = useState(false)

  const handleCopyAndRedirect = async () => {
    // 1. Copy to clipboard
    if (coupon.coupon_code) {
      await navigator.clipboard.writeText(coupon.coupon_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    // 2. Open tracking URL
    const targetUrl = coupon.store?.store_link || "#"
    if (targetUrl !== "#") {
      const trackUrl = `/api/track?url=${encodeURIComponent(targetUrl)}&type=coupon&id=${coupon.id}`
      window.open(trackUrl, "_blank", "noopener,noreferrer")
    }
  }

  const isExpiringSoon = coupon.valid_until && new Date(coupon.valid_until).getTime() - new Date().getTime() < 1000 * 60 * 60 * 48 // 48h

  return (
    <Card className="border border-primary/10 bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      {/* Visual background element */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {coupon.store?.logo_url ? (
            <img src={coupon.store.logo_url} alt={coupon.store.name} className="w-12 h-12 rounded-xl object-cover border border-stone-100" />
          ) : (
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
               {coupon.store?.name?.substring(0, 1) || 'L'}
             </div>
          )}
          <div>
            <h4 className="font-bold text-foreground">{coupon.store?.name || 'Loja Parceira'}</h4>
            {isExpiringSoon && (
              <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider mt-1">Expira em breve</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-black text-primary leading-none tracking-tighter">{coupon.discount_amount}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Desconto</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
           <h3 className="text-lg font-bold text-stone-800 leading-tight">{coupon.title}</h3>
           {coupon.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{coupon.description}</p>}
        </div>

        {coupon.coupon_code ? (
          <div className="flex gap-2">
            <div className="flex-1 bg-stone-100 border border-stone-200 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden">
               <span className="font-mono font-bold text-stone-600 tracking-wider z-10">{coupon.coupon_code}</span>
               <Scissors className="absolute left-2 text-stone-300 w-4 h-4 opacity-50" />
            </div>
            <Button 
               onClick={handleCopyAndRedirect}
               className={`rounded-xl px-4 transition-all duration-300 ${copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
               {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        ) : (
          <Button 
             onClick={handleCopyAndRedirect}
             className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold h-11"
          >
             Ativar Oferta <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  )
}
