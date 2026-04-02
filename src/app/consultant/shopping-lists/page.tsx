import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListChecks, User, ExternalLink, ChevronRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getShoppingLists } from "@/lib/actions/shopping-lists"
import { getClients } from "@/lib/actions/clients"
import { CreateShoppingListModal } from "@/components/shopping/CreateShoppingListModal"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ShoppingListsPage() {
  const [shoppingLists, clients] = await Promise.all([
    getShoppingLists(),
    getClients(),
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Listas de Compras</h1>
          <p className="text-muted-foreground text-lg">Curadoria personalizada de produtos com links de compra.</p>
        </div>
        <CreateShoppingListModal clients={clients} />
      </div>

      {shoppingLists.length === 0 ? (
        <div className="py-24 text-center space-y-6 bg-card/40 rounded-[3rem] border border-dashed border-primary/20">
          <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-primary/30" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Nenhuma lista criada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-light">
              Crie sua primeira lista de compras curada para uma cliente.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shoppingLists.map((list, i) => {
            const items = (list.items as Array<{ name: string; price?: number; link?: string }>) || []
            const total = items.reduce((sum: number, item) => sum + (item.price || 0), 0)
            const clientProfile = list.profiles as { full_name?: string } | null

            return (
              <Card
                key={list.id}
                className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2.5rem] overflow-hidden group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="sm:w-1/3 bg-primary/5 p-8 flex flex-col items-center justify-center text-center border-r border-primary/5 group-hover:bg-primary/10 transition-colors duration-500">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background shadow-sm border border-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                        <User className="w-8 h-8 text-primary/40" />
                      </div>
                      <h3 className="text-foreground font-bold text-base line-clamp-1">
                        {clientProfile?.full_name || "Cliente"}
                      </h3>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-foreground text-xl font-bold tracking-tight line-clamp-1 pr-4">{list.title}</h4>
                          <Badge
                            variant="outline"
                            className={`border-none text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${
                              list.status === 'active'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {list.status === 'active' ? 'Ativa' : 'Arquivada'}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                            <ListChecks className="w-4 h-4 text-primary" /> {items.length} Itens
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        {/* Item names preview */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {items.slice(0, 3).map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] font-medium bg-stone-100 text-stone-500 border-none">
                              {item.name}
                            </Badge>
                          ))}
                          {items.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] font-medium bg-stone-100 text-stone-400 border-none">
                              +{items.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button className="flex-1 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground font-bold h-11 transition-all rounded-2xl group/btn border-none shadow-none">
                          Detalhes <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        {items[0]?.link && (
                          <Link href={items[0].link} target="_blank">
                            <Button variant="outline" size="icon" className="border-primary/20 text-primary hover:bg-primary/5 h-11 w-11 rounded-2xl">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
