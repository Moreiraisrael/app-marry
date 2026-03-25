import { ClientSidebar } from "@/components/layout/ClientSidebar"
import { Header } from "@/components/layout/Header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#fcfbf9]">
        <ClientSidebar />
        <div className="flex flex-col flex-1 w-full relative">
          <Header title="Plataforma E.S.T.I.L.O." />
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
