import { WardrobeGrid } from "@/components/wardrobe/WardrobeGrid"
import { Shirt, Sparkles, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getWardrobeItems } from "@/lib/actions/wardrobe"
import { AddWardrobeItemModal } from "@/components/wardrobe/AddWardrobeItemModal"

import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ClientWardrobePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const searchParamsValue = await searchParams
  const categoryFilter = searchParamsValue?.category

  const allItems = await getWardrobeItems()
  const items = categoryFilter && categoryFilter !== 'Todos' 
    ? allItems.filter(i => i.category === categoryFilter)
    : allItems

  const categories = [
    { label: "Todos", value: "Todos", count: allItems.length },
    { label: "Partes de Cima", value: "Top", count: allItems.filter(i => i.category === 'Top').length },
    { label: "Partes de Baixo", value: "Bottom", count: allItems.filter(i => i.category === 'Bottom').length },
    { label: "Peça Única", value: "OnePiece", count: allItems.filter(i => i.category === 'OnePiece').length },
    { label: "Sapatos", value: "Shoes", count: allItems.filter(i => i.category === 'Shoes').length }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Shirt className="w-4 h-4" />
            Seu Acervo Digital
          </div>
           <h1 className="text-5xl font-bold text-foreground leading-tight tracking-tight">Closet <span className="text-primary italic">Inteligente</span></h1>
           <p className="text-muted-foreground text-xl max-w-xl font-light leading-relaxed">Visualize e gerencie suas peças. Sua consultora utiliza este acervo para criar seus looks.</p>
        </div>
        
        <div className="flex bg-white/50 backdrop-blur-md border border-primary/10 p-2 rounded-2xl shadow-sm overflow-x-auto">
           {categories.map((cat, idx) => {
             const isActive = categoryFilter === cat.value || (!categoryFilter && cat.value === 'Todos');
             return (
               <Link key={idx} href={`/client/wardrobe${cat.value === 'Todos' ? '' : `?category=${cat.value}`}`}>
                 <Button 
                   variant={isActive ? "default" : "ghost"} 
                   className={`h-10 px-6 rounded-xl transition-all whitespace-nowrap ${isActive ? 'bg-stone-900 text-white shadow-lg shadow-stone-200' : 'text-stone-500 hover:text-primary hover:bg-primary/5'}`}
                 >
                   {cat.label}
                   <span className="ml-2 opacity-40 text-[10px] font-bold">{cat.count}</span>
                 </Button>
               </Link>
             )
           })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
         <div className="md:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por cor, tecido ou ocasião..." 
              className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-white border border-stone-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm outline-none text-lg font-light"
            />
         </div>
         <div className="md:col-span-4 flex gap-4">
            <Button variant="outline" className="flex-1 h-16 border-primary/20 bg-white/50 backdrop-blur-md rounded-[1.5rem] px-6 hover:bg-primary/5 transition-all text-stone-600 font-medium">
              <Filter className="w-5 h-5 mr-3 text-primary/60" /> Filtrar
            </Button>
            <AddWardrobeItemModal clientId={user.id} />
         </div>
      </div>

      <section className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/60 shadow-inner">
        <WardrobeGrid items={items} />
      </section>

      <div className="bg-stone-900 rounded-[2.5rem] p-12 text-center space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative z-10 space-y-4">
           <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-10 h-10 text-primary" />
           </div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Transforme seu Estilo</h2>
           <p className="text-stone-400 max-w-lg mx-auto font-light text-lg">
             Adicione novas peças regularmente para que sua consultora possa manter suas combinações sempre atualizadas e estratégicas.
           </p>
           <Button className="mt-6 bg-primary hover:bg-primary/90 text-white h-14 px-12 rounded-2xl font-bold shadow-2xl shadow-primary/20 transition-all border-none">
             Agendar Curadoria de Looks
           </Button>
        </div>
      </div>
    </div>
  )
}
