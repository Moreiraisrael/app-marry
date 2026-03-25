'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Plus, 
  Search,
  ListChecks,
  User,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Calendar
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export default function ShoppingListsPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Listas de Compras</h1>
          <p className="text-muted-foreground text-lg">Curadoria personalizada de produtos com links de afiliado.</p>
        </div>
        <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2">
          <Plus className="w-5 h-5" /> Criar nova Lista
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-12 bg-card/60 border-none text-foreground rounded-2xl h-12 focus:ring-2 focus:ring-primary/20 shadow-sm" 
            placeholder="Buscar por cliente ou lista..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
           <Badge className="bg-primary text-primary-foreground px-5 py-2 rounded-xl cursor-pointer hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest border-none">Ativas</Badge>
           <Badge variant="outline" className="border-primary/10 text-muted-foreground px-5 py-2 rounded-xl cursor-pointer hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest">Arquivadas</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2.5rem] overflow-hidden group">
              <CardContent className="p-0">
                 <div className="flex flex-col sm:flex-row h-full">
                    <div className="sm:w-1/3 bg-primary/5 p-8 flex flex-col items-center justify-center text-center border-r border-primary/5 group-hover:bg-primary/10 transition-colors duration-500">
                       <div className="w-20 h-20 rounded-[2rem] bg-background shadow-sm border border-primary/10 flex items-center justify-center mb-4 overflow-hidden relative group-hover:scale-110 transition-transform duration-700">
                          <User className="w-10 h-10 text-primary/40" />
                       </div>
                       <h3 className="text-foreground font-bold text-lg line-clamp-1">Mariana Costa</h3>
                       <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mt-2">Dramático / Casual</p>
                    </div>
                    
                    <div className="flex-1 p-8 flex flex-col justify-between">
                       <div>
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <h4 className="text-foreground text-2xl font-bold tracking-tight">Cápsula de Inverno</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-2 font-medium">
                                   <Calendar className="w-3.5 h-3.5 text-primary" /> Atualizado em 12 Out, 2025
                                </p>
                             </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl">
                                      <MoreVertical className="w-5 h-5" />
                                   </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background border-primary/10 rounded-2xl p-2 shadow-xl">
                                   <DropdownMenuItem className="rounded-xl font-bold text-xs p-3 focus:bg-primary/5 focus:text-primary">Editar Lista</DropdownMenuItem>
                                   <DropdownMenuItem className="rounded-xl font-bold text-xs p-3 focus:bg-primary/5 focus:text-primary">Compartilhar PDF</DropdownMenuItem>
                                   <DropdownMenuItem className="rounded-xl font-bold text-xs p-3 text-red-500 focus:bg-red-50 focus:text-red-600">Excluir Permanentes</DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                                   <ListChecks className="w-4 h-4 text-primary" /> 8 Itens
                                </span>
                                <span className="text-lg font-bold text-foreground">R$ 1.240,00</span>
                             </div>
                             <div className="w-full h-2 bg-primary/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '75%' }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-primary"
                                />
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-3 mt-8">
                          <Button className="flex-1 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground font-bold h-12 transition-all rounded-2xl group/btn border-none shadow-none">
                             Ver Detalhes <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                          <Button variant="outline" size="icon" className="border-primary/20 text-primary hover:bg-primary/5 h-12 w-12 rounded-2xl">
                             <ExternalLink className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
