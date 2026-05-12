'use client'

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Plus, 
  ExternalLink, 
  Search,
  Store,
  Ticket,
  Percent,
  Edit,
  Gift,
  Loader2
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { PartnerStore } from "@/types/database"
import { getPartnerStores, savePartnerStore, batchImportPartnerStores } from "@/lib/actions/partner-stores"
import { toast } from "sonner"

const categories = [
  { value: 'roupas', label: 'Roupas' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'calcados', label: 'Calçados' },
  { value: 'maquiagem', label: 'Maquiagem' },
  { value: 'joias', label: 'Joias' },
  { value: 'outros', label: 'Outros' },
]

export default function PartnerStoresPage() {
  const [activeTab, setActiveTab] = useState("lojas")
  const [search, setSearch] = useState("")
  
  const [stores, setStores] = useState<PartnerStore[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [storeName, setStoreName] = useState("")
  const [affiliateLink, setAffiliateLink] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [category, setCategory] = useState("")
  const [isImporting, startImportTransition] = useTransition()

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getPartnerStores()
        setStores(data)
      } catch (error) {
        console.error("Error fetching stores:", error)
        toast.error("Erro ao carregar lojas parceiras")
      }
    }
    
    fetchStores()
  }, [])

  const handleSavePartner = () => {
    if (!storeName || !category) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    startTransition(async () => {
      const result = await savePartnerStore({
        name: storeName,
        store_link: affiliateLink,
        logo_url: logoUrl || null,
        category,
        is_active: true
      })

      if (result.success && result.data) {
        setStores([...stores, result.data])
        toast.success("Loja parceira salva com sucesso")
        
        // Reset form and close dialog
        setStoreName("")
        setAffiliateLink("")
        setLogoUrl("")
        setCategory("")
        setIsDialogOpen(false)
      } else {
        toast.error(result.error || "Erro ao salvar parceiro")
      }
    })
  }

  const handleImportCSV = () => {
    startImportTransition(async () => {
      const result = await batchImportPartnerStores()
      if (result.success) {
        toast.success(`${result.count} lojas importadas com sucesso!`)
        // Refresh stores
        const data = await getPartnerStores()
        setStores(data)
      } else {
        toast.error(result.error || "Erro ao importar lojas")
      }
    })
  }

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(search.toLowerCase()) || 
    (store.category && store.category.toLowerCase().includes(search.toLowerCase()))
  )

  const getCategoryLabel = (value: string | null) => {
    return categories.find(c => c.value === value)?.label || value || "Outros"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Ecossistema de Parceiros</h1>
          <p className="text-muted-foreground text-lg">Gerencie suas lojas afiliadas, cupons e ofertas exclusivas.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleImportCSV} 
            disabled={isImporting}
            className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl px-6 font-bold"
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Importar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2">
                <Plus className="w-5 h-5" /> Nova Loja
              </Button>
            </DialogTrigger>

          <DialogContent className="bg-background border-primary/10 text-foreground rounded-[2.5rem] p-10 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-foreground tracking-tight">Cadastrar Nova Loja</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 font-sans">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest px-1">Nome da Loja</Label>
                <Input 
                  className="bg-primary/[0.02] border-primary/10 h-14 rounded-2xl focus:ring-primary/20" 
                  placeholder="Ex: Zara" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest px-1">Link de Afiliado</Label>
                <Input 
                  className="bg-primary/[0.02] border-primary/10 h-14 rounded-2xl focus:ring-primary/20" 
                  placeholder="https://..." 
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest px-1">Logo da Loja (URL)</Label>
                <Input 
                  className="bg-primary/[0.02] border-primary/10 h-14 rounded-2xl focus:ring-primary/20" 
                  placeholder="https://.../logo.png (Opcional)" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold text-xs uppercase tracking-widest px-1">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-primary/[0.02] border-primary/10 h-14 rounded-2xl focus:ring-primary/20">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary/10 rounded-2xl shadow-xl">
                    {categories.map(c => <SelectItem key={c.value} value={c.value} className="rounded-xl font-medium focus:bg-primary/5">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-2xl shadow-lg border-none text-base mt-4"
                onClick={handleSavePartner}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar Parceiro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="pl-12 bg-card/60 border-none text-foreground rounded-2xl h-12 focus:ring-2 focus:ring-primary/20 shadow-sm" 
          placeholder="Buscar parceiros..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-card/40 border-none p-1 rounded-2xl h-auto flex flex-wrap gap-2 mb-10 overflow-x-auto no-scrollbar max-w-fit">
          <TabsTrigger value="lojas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground py-3 px-8 rounded-xl font-bold transition-all text-xs uppercase tracking-widest border-none">
            <Store className="w-4 h-4 mr-2" /> Lojas Parceiras
          </TabsTrigger>
          <TabsTrigger value="cupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground py-3 px-8 rounded-xl font-bold transition-all text-xs uppercase tracking-widest border-none">
            <Ticket className="w-4 h-4 mr-2" /> Cupons Ativos
          </TabsTrigger>
          <TabsTrigger value="ofertas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground py-3 px-8 rounded-xl font-bold transition-all text-xs uppercase tracking-widest border-none">
            <Percent className="w-4 h-4 mr-2" /> Ofertas Flash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lojas" className="mt-0 outline-none">
          {filteredStores.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card/60 backdrop-blur-md border-none rounded-[3rem] p-16 text-center max-w-2xl mx-auto shadow-sm mt-8"
            >
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                 <Store className="w-12 h-12 text-primary/30" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Nenhuma Loja Encontrada</h2>
              <p className="text-muted-foreground mb-10 leading-relaxed font-medium">Você ainda não adicionou lojas parceiras ou não encontrou nenhuma com o termo buscado.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStores.map((store, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={store.id}
                >
                  <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2.5rem] group overflow-hidden h-full flex flex-col">
                    <div className="h-40 bg-primary/5 flex shrink-0 items-center justify-center relative overflow-hidden group-hover:bg-primary/10 transition-colors duration-500">
                       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-primary"></div>
                       {store.logo_url ? (
                         <div className="relative w-full h-full p-6 flex items-center justify-center">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img 
                             src={store.logo_url} 
                             alt={`Logo ${store.name}`} 
                             className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition-transform duration-700"
                           />
                         </div>
                       ) : (
                         <ShoppingBag className="w-16 h-16 text-primary/10 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-700" />
                       )}
                    </div>
                    <div className="relative -mt-12 mx-8 bg-background rounded-[2rem] border border-primary/5 p-6 shadow-xl shadow-black/[0.02]">
                      <div className="flex justify-between items-center gap-2">
                        <h3 className="text-foreground text-lg font-bold tracking-tight truncate" title={store.name}>{store.name}</h3>
                        <Badge className="bg-primary/5 text-primary border-none rounded-lg px-2 py-1 text-[10px] font-bold shrink-0">{getCategoryLabel(store.category)}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 pt-6 space-y-6 flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm italic font-medium leading-relaxed flex-1">{`Compradores podem usar seu link de afiliado exclusivo para suas peças recomendadas.`}</p>
                      <div className="flex gap-3 mt-auto shrink-0">
                        {store.store_link && (
                          <Button variant="outline" className="flex-1 h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl font-bold text-xs gap-2" asChild>
                            <a href={store.store_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" /> Visitar
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" className="h-12 w-12 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cupons" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="border-none bg-primary/5 border-2 border-dashed border-primary/20 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-primary/[0.08] transition-all h-64 shadow-inner shadow-primary/[0.02]"
             >
                <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:rotate-90 transition-transform duration-500">
                  <Plus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-foreground font-bold text-xl mb-1 tracking-tight">Criar Cupom</h3>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">Descontos exclusivos</p>
             </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="ofertas" className="mt-0 outline-none">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="bg-card/60 backdrop-blur-md border-none rounded-[3rem] p-16 text-center max-w-2xl mx-auto shadow-sm"
           >
             <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Gift className="w-12 h-12 text-primary/30" />
             </div>
             <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Nenhuma Oferta Ativa</h2>
             <p className="text-muted-foreground mb-10 leading-relaxed font-medium">As ofertas flash são promoções com tempo limitado. Crie uma agora para destacar produtos específicos para suas clientes.</p>
             <Button className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 rounded-2xl shadow-lg shadow-primary/20 border-none text-base">Lançar Primeira Oferta</Button>
           </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
