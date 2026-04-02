import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  title: string
  profile?: any
}

export function Header({ title, profile }: HeaderProps) {
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-800">{title}</h1>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium mr-2">{profile?.full_name || 'Usuário'}</label>
        <Avatar className="h-9 w-9 border border-neutral-200">
          <AvatarImage src={profile?.avatar_url || ""} alt="Avatar do Usuário" />
          <AvatarFallback className="bg-rose-100 text-rose-900 font-medium">{initial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
