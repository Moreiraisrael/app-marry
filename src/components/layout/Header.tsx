import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface HeaderProps {
  title: string
  profile?: { full_name?: string | null; avatar_url?: string | null } | null
}

export function Header({ title, profile }: HeaderProps) {
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-800">{title}</h1>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <label className="text-sm font-medium hidden md:block">{profile?.full_name || 'Usuário'}</label>
        <Avatar className="h-9 w-9 border border-neutral-200">
          <AvatarImage src={profile?.avatar_url || ""} alt="Avatar do Usuário" />
          <AvatarFallback className="bg-rose-100 text-rose-900 font-medium">{initial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
