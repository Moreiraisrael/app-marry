"use server"

import { createClient } from "@/lib/supabase/server"

export interface PromotionCoupon {
  id: string
  store_id: string
  title: string
  description?: string
  discount_amount: string
  coupon_code?: string
  valid_until?: string
  is_highlighted: boolean
  store?: {
    name: string
    logo_url?: string
    store_link: string
  }
}

export async function getPromotions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('promotions_coupons')
    .select(`
      *,
      store:partner_stores(name, logo_url, store_link)
    `)
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false })
    
  if (error) {
    if (error.code === '42P01') {
      // Table doesn't exist yet (mocked data fallback)
      return []
    }
    // Use console.warn to avoid Next.js dev overlay catching it as a fatal error
    console.warn("Error fetching promotions:", error.message || error.code || "Unknown error")
    return []
  }
  
  return data || []
}
