'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Layers,
  ShoppingBag,
  Tag, 
  Heart,
  ExternalLink,
  Ticket,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { CreateShoppingListModal } from "@/components/shopping/CreateShoppingListModal"
import { getClients } from "@/lib/actions/clients"
import { getPartnerStores } from "@/lib/actions/partner-stores"
import { Profile, PartnerStore } from "@/types/database"

const COLOR_PALETTES = ['Inverno Frio', 'Verão Suave', 'Primavera Quente', 'Outono Escuro', 'Inverno Escuro']
const STYLE_ARCHETYPES = ['Elegante', 'Criativo', 'Moderno', 'Romântico', 'Dramático', 'Esportivo', 'Clássico']

export default function ShoppingAssistantPage() {
  const [clients, setClients] = useState<Profile[]>([])
  const [stores, setStores] = useState<PartnerStore[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  
  // Interactive Filter States
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [activeStyles, setActiveStyles] = useState<string[]>([])
  const [showOffersOnly, setShowOffersOnly] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [clientsData, storesData] = await Promise.all([
        getClients(),
        getPartnerStores()
      ])
      setClients(clientsData)
      setStores(storesData)
    }
    loadData()

    // Restore filters from LocalStorage
    try {
      const savedSearch = localStorage.getItem('marry:assistantSearch')
      const savedCategory = localStorage.getItem('marry:assistantCategory')
      const savedColor = localStorage.getItem('marry:assistantColor')
      const savedStyles = localStorage.getItem('marry:assistantStyles')
      const savedOffers = localStorage.getItem('marry:assistantOffers')

      if (savedSearch) setSearch(savedSearch)
      if (savedCategory) setActiveCategory(savedCategory)
      if (savedColor) setActiveColor(savedColor)
      if (savedStyles) setActiveStyles(JSON.parse(savedStyles))
      if (savedOffers) setShowOffersOnly(JSON.parse(savedOffers))
    } catch (e) {
      console.warn("Failed to load filters from localStorage", e)
    }
  }, [])

  // Save filters to LocalStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('marry:assistantSearch', search)
      localStorage.setItem('marry:assistantCategory', activeCategory)
      if (activeColor) {
        localStorage.setItem('marry:assistantColor', activeColor)
      } else {
        localStorage.removeItem('marry:assistantColor')
      }
      localStorage.setItem('marry:assistantStyles', JSON.stringify(activeStyles))
      localStorage.setItem('marry:assistantOffers', JSON.stringify(showOffersOnly))
    } catch (e) {
      console.warn("Failed to save filters to localStorage", e)
    }
  }, [search, activeCategory, activeColor, activeStyles, showOffersOnly])

  // Extrair categorias únicas das lojas parceiras
  const allCategories = ['Todos', ...Array.from(new Set(stores.map(s => s.category).filter(Boolean))) as string[]]

  const toggleStyle = (style: string) => {
    setActiveStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "Todos" || store.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Dados Mockados para Ofertas/Cupons para manter a interface rica
  const activeOffers = [
    { store: 'Zara', discount: '20% OFF', code: 'MARRY20', expiry: 'Hoje' },
    { store: 'Amaro', discount: 'Frete Grátis', code: 'AMAROMARRY', expiry: '3 dias' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs px-1">
            <Sparkles className="w-4 h-4" />
            Curadoria Inteligente
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Assistente de Compras</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Encontre itens perfeitos baseando-se em cartelas e estilos.</p>
        </div>
        <CreateShoppingListModal clients={clients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8">
            <h3 className="text-foreground font-bold mb-6 flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" /> Filtros Ativos
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold px-1">Cartela de Cores</label>
                <div className="grid grid-cols-1 gap-2">
                  {COLOR_PALETTES.map(color => (
                    <Button 
                      key={color}
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveColor(activeColor === color ? null : color)}
                      className={`h-10 rounded-xl justify-start px-4 transition-all ${
                        activeColor === color 
                          ? 'border-primary/50 text-primary bg-primary/10 font-bold' 
                          : 'border-primary/5 text-muted-foreground/60 font-medium hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold px-1">Estilo Predominante</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_ARCHETYPES.map(style => (
                    <Badge 
                      key={style} 
                      onClick={() => toggleStyle(style)}
                      className={`font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        activeStyles.includes(style)
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-primary/5 text-muted-foreground border-transparent hover:bg-primary/20 hover:text-primary'
                      }`}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-primary/5">
                 <Button 
                   variant="outline"
                   onClick={() => setShowOffersOnly(!showOffersOnly)}
                   className={`w-full h-12 rounded-xl justify-between px-4 transition-all font-bold ${
                     showOffersOnly ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-primary/10 text-muted-foreground hover:bg-primary/5 hover:text-primary'
                   }`}
                 >
                   <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Apenas Ofertas</span>
                   {showOffersOnly && <span className="w-2 h-2 rounded-full bg-primary" />}
                 </Button>
              </div>
            </div>
          </Card>

          {/* Seção de Cupons Ativos (Mock) */}
          <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2rem] p-8 space-y-4">
            <h4 className="text-foreground font-bold text-sm tracking-tight flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" /> Cupons Ativos
            </h4>
            <div className="space-y-3">
              {activeOffers.map((offer, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/40 shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-foreground">{offer.store}</p>
                    <p className="text-[10px] font-medium text-primary">{offer.discount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider mb-1">{offer.code}</p>
                    <p className="text-[9px] text-muted-foreground flex items-center justify-end gap-1"><Clock className="w-2.5 h-2.5" /> {offer.expiry}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Search & Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              className="pl-14 bg-card/60 border-none text-foreground rounded-[1.5rem] h-16 focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm font-sans" 
              placeholder="Buscar por loja ou parceiro..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {allCategories.map((cat, i) => (
              <Button 
                key={cat} 
                variant="ghost" 
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-xl border border-primary/5 px-6 font-bold text-xs uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground border-none shadow-md' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}
              >
                {cat || 'Sem Categoria'}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filteredStores.length === 0 ? (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-card/60 backdrop-blur-md rounded-[2.5rem] p-12 text-center shadow-sm"
               >
                 <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-foreground">Nenhum parceiro encontrado</h3>
                 <p className="text-muted-foreground mt-2">Tente ajustar seus filtros ou cadastre novas lojas parceiras.</p>
               </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {filteredStores.map((store, i) => {
                  // Simular se tem oferta baseada no mock
                  const hasOffer = activeOffers.some(offer => offer.store.toLowerCase() === store.name.toLowerCase())
                  if (showOffersOnly && !hasOffer) return null;

                  return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={store.id}
                  >
                    <Card className="border-none bg-card/60 backdrop-blur-md group hover:shadow-md transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row h-full">
                      <div className="sm:w-2/5 aspect-[4/5] bg-primary/5 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                         <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold text-[10px] uppercase border-none rounded-lg px-2.5 py-1 w-fit shadow-sm">
                              <Tag className="w-3 h-3 mr-1" /> Parceiro
                            </Badge>
                            {hasOffer && (
                              <Badge className="bg-rose-500 text-white font-bold text-[10px] uppercase border-none rounded-lg px-2.5 py-1 w-fit shadow-sm">
                                <Ticket className="w-3 h-3 mr-1" /> Cupom
                              </Badge>
                            )}
                         </div>
                         {store.logo_url ? (
                           <div className="absolute inset-0 p-6 flex items-center justify-center">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img 
                               src={store.logo_url} 
                               alt={`Logo ${store.name}`} 
                               className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition-transform duration-700"
                             />
                           </div>
                         ) : (
                           <ShoppingBag className="w-16 h-16 text-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-700" />
                         )}
                      </div>
                      <div className="sm:w-3/5 p-8 flex flex-col justify-between h-full bg-white/40">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-foreground text-xl tracking-tight leading-tight pr-2">{store.name}</h4>
                            <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-rose-500 rounded-xl h-8 w-8 transition-colors shrink-0"><Heart className="w-5 h-5 shadow-none" /></Button>
                          </div>
                          <p className="text-muted-foreground text-xs font-medium line-clamp-2 leading-relaxed italic mb-4">
                            {store.category ? `Categoria: ${store.category}` : "Diversos"}
                          </p>
                          {(activeColor || activeStyles.length > 0) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {activeColor && <span className="text-[9px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">{activeColor}</span>}
                              {activeStyles.slice(0,2).map(s => <span key={s} className="text-[9px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-8">
                          {store.store_link ? (
                            <Button asChild variant="ghost" className="text-primary font-bold gap-2 hover:bg-primary/10 group/btn rounded-2xl h-11 px-6 transition-all w-full">
                              <a href={store.store_link} target="_blank" rel="noopener noreferrer">
                                Acessar Loja <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium w-full text-center py-2">Link indisponível</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )})}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
