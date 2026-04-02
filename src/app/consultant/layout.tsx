import { ConsultantSidebar } from "@/components/layout/ConsultantSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

export default async function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground relative Selection:bg-primary/20">
        <div className="fixed inset-0 opacity-40 pointer-events-none z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary) 0.5px, transparent 0)`,
            backgroundSize: '64px 64px'
          }} />
        </div>
        
        <div className="z-10 relative border-r border-border/40">
          <ConsultantSidebar />
        </div>
        
        <div className="flex-1 flex flex-col relative z-10">
          <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/40 h-20 flex items-center px-6 justify-between">
            <div className="flex items-center gap-4 relative z-10">
              <SidebarTrigger className="text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all rounded-xl w-10 h-10" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
               <div className="flex items-center gap-3 hover:bg-secondary/80 rounded-2xl px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-border/50 cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 ring-2 ring-background overflow-hidden relative">
                      {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-foreground tracking-wide">
                    {profile?.full_name || 'Usuário'}
                  </span>
               </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 md:p-10 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
