import { ClientSidebar } from "@/components/layout/ClientSidebar"
import { Header } from "@/components/layout/Header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#fcfbf9]">
        <ClientSidebar />
        <div className="flex flex-col flex-1 w-full relative">
          <Header title="Plataforma E.S.T.I.L.O." profile={profile} />
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
