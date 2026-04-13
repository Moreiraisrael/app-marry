"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Home, Sparkles, Shirt, FileUser, ShoppingBag, User, LogOut, LayoutGrid, Crown } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const clientLinks = [
  { name: "Painel Principal", url: "/client/dashboard", icon: Home },
  { name: "Hub de Testes", url: "/client/quiz", icon: Sparkles },
  { name: "Guarda-Roupa Virtual", url: "/client/wardrobe", icon: Shirt },
  { name: "Meus Looks", url: "/client/looks", icon: LayoutGrid },
  { name: "Vitrine Curada", url: "/client/shop", icon: ShoppingBag },
  { name: "Meu Dossiê", url: "/client/dossier", icon: FileUser },
  { name: "Ferramentas Exclusivas", url: "/client/tools", icon: Crown },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-rose-100 bg-white shadow-sm">
      <SidebarHeader className="p-6 border-b border-rose-50 flex justify-center">
        <h2 className="text-xl font-serif font-bold text-rose-600 tracking-wide mt-2">
          E.S.T.I.L.O.
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-rose-400 text-[10px] tracking-widest uppercase mb-4 px-6 pt-4 font-semibold">
            Sua Jornada
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-1.5">
              {clientLinks.map((link) => {
                const isActive = pathname === link.url || pathname.startsWith(link.url + "/");
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton 
                      asChild 
                      className={`transition-all duration-200 rounded-xl px-3 py-5 ${
                        isActive 
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <Link href={link.url} className="flex items-center" prefetch={false}>
                        <link.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-rose-600' : 'text-neutral-500'}`} />
                        <span className="font-medium text-[15px]">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t border-rose-50 space-y-1">
        <Link
          href="/client/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            pathname === "/client/profile" 
              ? "bg-rose-50 text-rose-700" 
              : "text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <User className="h-5 w-5" />
          <span className="font-medium text-sm">Meu Perfil</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </Sidebar>
  )
}
