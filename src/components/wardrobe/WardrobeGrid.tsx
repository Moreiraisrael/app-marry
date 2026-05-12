"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { motion } from "framer-motion"
import { WardrobeItem } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

import { AddWardrobeItemModal } from "@/components/wardrobe/AddWardrobeItemModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteWardrobeItem } from "@/lib/actions/wardrobe"

interface WardrobeGridProps {
  items: WardrobeItem[]
  activeClientId?: string
  onDelete?: (id: string) => void
}

function getContrastYIQ(hexcolor: string){
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(c => c+c).join('');
    if (hexcolor.length !== 6) return 'black';
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

const colorMap: Record<string, string> = {
  'Preto': '#1a1a1a',
  'Branco': '#ffffff',
  'Off-White': '#fdfbf7',
  'Bege': '#d4bda5',
  'Bordô': '#6b2232',
  'Caramelo': '#b06d3b',
  'Vermelho': '#c21f24',
  'Terracota': '#a85141',
  'Laranja': '#c95f26',
  'Verde Floresta': '#2c4a3b',
  'Rosa Pastel': '#e6baba',
  'Azul Celeste': '#7b9ac2',
  'Verde Escuro': '#1f3d33',
  'Marrom': '#5c3a21',
  'Azul': '#2c5282',
  'Amarelo': '#ecc94b',
  'Rosa': '#ed64a6',
  'Verde': '#48bb78',
  'Roxo': '#9f7aea',
  'Cinza': '#a0aec0',
  'Neutro': '#e5e5e5'
}

function resolveColor(c: string): { hex: string, name: string } {
  const name = c.trim();
  let hex = '#e5e5e5'; 
  
  if (name.startsWith('#')) {
     hex = name;
  } else {
     const foundKey = Object.keys(colorMap).find(k => k.toLowerCase() === name.toLowerCase());
     if (foundKey) {
        hex = colorMap[foundKey];
     }
  }

  return { name, hex };
}

export function WardrobeGrid({ items, activeClientId = "", onDelete }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-32 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="w-28 h-28 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/10 relative group">
             <ShoppingBag className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-background shadow-lg" />
          </div>
          <div className="space-y-3">
            <h4 className="text-stone-900 font-serif text-3xl tracking-tight">Acervo Digital Vazio</h4>
            <p className="text-stone-500 max-w-sm mx-auto font-light text-lg">
              Clique em &quot;Escanear Peça&quot; para começar a digitalizar o guarda-roupa da sua cliente.
            </p>
          </div>
          <AddWardrobeItemModal 
            clientId={activeClientId}
            trigger={
              <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-full gap-3 font-medium px-10 h-14 shadow-xl shadow-stone-900/20 transition-all">
                 Digitalizar Primeira Peça
              </Button>
            }
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {items.map((item, i) => {
        let rawColors = item.color ? item.color.split(',').map(c => c.trim()) : ['Neutro'];
        const colorBlocks = rawColors.map(resolveColor);

        return (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <Card className="border-none bg-stone-100 shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[2rem] overflow-hidden relative flex flex-col aspect-[3/4]">
              
              {/* Main Photo */}
              <div className="absolute inset-0">
                <Image 
                  src={item.photo_url} 
                  alt={item.category || "Roupa"} 
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out origin-center"
                />
              </div>

              {/* Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top Elements: Category Badge & Color Dots */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 opacity-100 transition-all duration-300">
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-md border-none text-stone-900 font-semibold px-3 py-1 shadow-sm rounded-full text-[10px] uppercase tracking-wider">
                  {item.subcategory || item.category || 'Peça'}
                </Badge>

                {/* Color Dots */}
                <div className="flex -space-x-1.5 hover:space-x-1 transition-all duration-300">
                  {colorBlocks.map((block, idx) => (
                    <div 
                      key={idx} 
                      className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white/50"
                      style={{ backgroundColor: block.hex }}
                      title={block.name}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Actions Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                 
                 {/* Meta Info */}
                 <div className="flex flex-col">
                   <span className="text-white/90 text-xs font-medium">Cadastrado em</span>
                   <span className="text-white font-serif text-sm">
                     {new Date(item.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                   </span>
                 </div>

                 {/* Action Menu */}
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-white hover:bg-white hover:text-stone-900 transition-all shadow-lg hover:shadow-xl">
                         <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-white/20 p-2">
                      <DropdownMenuItem className="text-stone-700 font-medium cursor-pointer rounded-xl hover:bg-stone-100 focus:bg-stone-100">
                         <Edit className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500 font-medium cursor-pointer rounded-xl hover:bg-red-50 focus:bg-red-50 focus:text-red-600 mt-1"
                        onClick={async () => {
                          if (onDelete) onDelete(item.id);
                          await deleteWardrobeItem(item.id);
                        }}
                      >
                         <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>

              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
