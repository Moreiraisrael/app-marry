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
import { LucideIcon } from "lucide-react"
import Link from "next/link"

export function AppSidebar({ links, title }: { links: {name: string, url: string, icon: LucideIcon}[], title: string }) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b py-6 px-4">
        <div className="font-serif font-bold text-2xl tracking-tight text-neutral-900">{title}</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-neutral-500 mt-4">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <SidebarMenuButton asChild className="hover:bg-rose-50 hover:text-rose-900 transition-colors">
                    <Link href={link.url}>
                      <link.icon className="mr-3 h-4 w-4" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
