"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  Home, Calendar, Palette, Users, Sparkles, BookOpen, ShoppingBag, 
  Camera, Settings, BarChart3, Package, LogOut
} from 'lucide-react';
import { signOut } from "@/lib/actions/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const consultantGroups = [
  {
    label: 'Gestão',
    items: [
      { icon: Home, label: 'Dashboard', path: "/consultant/dashboard" },
      { icon: Users, label: 'Clientes', path: "/consultant/clients" },
      { icon: Calendar, label: 'Agenda', path: "/consultant/appointments" },
      { icon: Package, label: 'Pedidos & Comissões', path: "/consultant/orders" },
    ]
  },
  {
    label: 'Consultoria de Estilo',
    items: [
      { icon: Palette, label: 'Análise de Coloração', path: "/consultant/color-analysis" },
      { icon: Sparkles, label: 'Guarda-Roupa & Provador', path: "/consultant/virtual-wardrobe" },
      { icon: Camera, label: 'Cápsulas de Estilo', path: "/consultant/capsule" },
      { icon: Sparkles, label: 'Diagnósticos (Quizzes)', path: "/consultant/quizzes" },
    ]
  },
  {
    label: 'Shopping & Afiliados',
    items: [
      { icon: BarChart3, label: 'Afiliados & Recompensas', path: "/consultant/affiliates" },
      { icon: ShoppingBag, label: 'Listas de Compras', path: "/consultant/shopping-lists" },
      { icon: ShoppingBag, label: 'Shopping Assistant', path: "/consultant/shopping-assistant" },
      { icon: ShoppingBag, label: 'Lojas Parceiras', path: "/consultant/partner-stores" },
    ]
  },
  {
    label: 'Conteúdo',
    items: [
      { icon: BookOpen, label: 'E-books & Materiais', path: "/consultant/ebooks" },
    ]
  }
];

export function ConsultantSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border/40 bg-card/80 backdrop-blur-xl">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      <SidebarHeader className="p-8 border-b border-border/40 bg-background/50 relative z-10">
        <Link href="/consultant/dashboard" className="flex flex-col gap-1 group">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-8 h-[1px] bg-primary/40 group-hover:w-12 transition-all duration-500" />
             <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">Ateliê Elite</span>
          </div>
          <h1 className="text-xl font-serif text-foreground/90 tracking-tight leading-none">
            MARRY <span className="font-light italic text-primary">MIELE</span>
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-8">
          {consultantGroups.map((group) => (
            <div key={group.label}>
              <div className="px-4 mb-4 text-[10px] font-bold text-primary uppercase tracking-[0.25em]">
                {group.label}
              </div>
              <SidebarMenu className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "group relative flex items-center gap-3 px-4 py-6 rounded-2xl transition-all duration-500",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        <Link href={item.path}>
                          <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-500",
                            !isActive && "group-hover:scale-110"
                          )} />
                          <span className="font-semibold tracking-tight text-sm">{item.label}</span>
                          
                          {isActive && (
                            <motion.div 
                              layoutId="active-pill"
                              className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none"
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border/40 bg-background/80 backdrop-blur-md relative z-20 space-y-3">
        <Link
          href="/consultant/settings"
          className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary transition-all duration-300"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-sm font-semibold tracking-tight">Configurações</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive transition-all duration-300"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-semibold tracking-tight">Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
