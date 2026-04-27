"use client"

import { PromotionCoupon } from "@/lib/actions/promotions"
import { CouponCard } from "./CouponCard"
import { TicketPercent } from "lucide-react"

export function CouponList({ coupons }: { coupons: PromotionCoupon[] }) {
  if (!coupons || coupons.length === 0) {
    return (
      <div className="py-12 border border-dashed border-stone-200 rounded-[2rem] bg-stone-50 flex flex-col items-center justify-center text-center space-y-3">
         <TicketPercent className="w-10 h-10 text-stone-300" />
         <div>
            <h4 className="font-bold text-stone-700">Sem cupons no momento</h4>
            <p className="text-stone-500 text-sm">Volte mais tarde para conferir novas ofertas exclusivas.</p>
         </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  )
}
