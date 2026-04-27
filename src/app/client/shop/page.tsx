import { ProductCard } from "@/components/shopping/ProductCard"
import { StoreGrid } from "@/components/shopping/StoreGrid"
import { DynamicOffersCarousel } from "@/components/shopping/DynamicOffersCarousel"
import { CouponList } from "@/components/shopping/CouponList"
import { ShoppingBag, Sparkles, Filter, ChevronRight, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPartnerStores } from "@/lib/actions/partner-stores"
import { getShoppingLists } from "@/lib/actions/shopping-lists"
import { getPromotions, PromotionCoupon } from "@/lib/actions/promotions"
import { ShoppingList } from "@/types/database"

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  price: number
  storeName: string
  imageUrl: string
  affiliateUrl: string
  category?: string
}

export default async function ClientShopPage() {
  const [shoppingLists, partnerStores, allPromotions] = await Promise.all([
    getShoppingLists(),
    getPartnerStores(),
    getPromotions()
  ])
  
  // Extract products from all active shopping lists
  const allProducts = (shoppingLists as unknown as ShoppingList[]).flatMap(list => (list.items as unknown as Product[]) || [])

  const mappedStores = partnerStores.map((store: any) => ({
    id: store.id,
    name: store.name,
    category: store.category || "Outros",
    affiliateLink: store.store_link || "#",
    logoUrl: store.logo_url || undefined,
    description: "Curadoria exclusiva Estilo App."
  }))

  const highlightedOffers = (allPromotions as PromotionCoupon[]).filter(p => p.is_highlighted)
  const regularCoupons = (allPromotions as PromotionCoupon[]).filter(p => !p.is_highlighted)

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Benefícios Estilo App
          </div>
           <h1 className="text-5xl font-bold text-foreground leading-tight tracking-tight">Clube de <span className="text-primary italic">Vantagens</span></h1>
           <p className="text-muted-foreground text-xl max-w-xl font-light leading-relaxed">Benefícios exclusivos, cupons de desconto e curadoria estratégica para você.</p>
        </div>
      </div>

      {/* Destaques (Carrossel) */}
      <section>
        <DynamicOffersCarousel offers={highlightedOffers} />
      </section>

      {/* Cupons de Desconto */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-6">
           <Tags className="w-6 h-6 text-primary" />
           <h2 className="text-3xl font-bold text-foreground">Cupons Ativos</h2>
        </div>
        <CouponList coupons={regularCoupons} />
      </section>

      <section className="bg-stone-900 rounded-[3rem] p-16 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse duration-[10s]" />
        <div className="relative z-10 space-y-12">
           <div className="space-y-3">
              <h2 className="text-4xl font-bold text-white tracking-tight">Top Parceiros</h2>
              <p className="text-stone-400 text-lg font-light max-w-2xl">Acesse suas marcas favoritas com retorno garantido no seu estilo.</p>
           </div>
           
           <StoreGrid stores={mappedStores} />
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-6">
           <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
             <ShoppingBag className="w-6 h-6 text-primary" /> Sugestões Recentes
           </h2>
           <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">{allProducts.length} ITENS</span>
        </div>
        
        {allProducts.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-stone-50/50 rounded-[3rem] border border-dashed border-stone-200">
             <div className="w-20 h-20 rounded-[1.5rem] bg-white mx-auto flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-8 h-8 text-stone-300" />
             </div>
             <div className="space-y-2">
                <h3 className="font-bold text-xl text-stone-900">Sua vitrine está sendo montada</h3>
                <p className="text-stone-500 max-w-xs mx-auto text-sm">Em breve sua consultora enviará as melhores recomendações de compra.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             {allProducts.map((product, idx) => (
               <ProductCard key={idx} {...product} />
             ))}
          </div>
        )}
      </section>

      <div className="bg-primary/5 rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center gap-6 relative z-10">
           <div className="w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
             <ShoppingBag className="text-white w-10 h-10" />
           </div>
           <div>
              <h4 className="font-bold text-foreground text-2xl tracking-tight mb-1">Dúvida sobre um item?</h4>
              <p className="text-muted-foreground font-light">Sua consultora está disponível para validar sua escolha.</p>
           </div>
        </div>
        <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-2xl h-14 px-10 font-bold shadow-xl shadow-stone-200 relative z-10 transition-all">
           Falar no WhatsApp
        </Button>
      </div>
    </div>
  )
}
