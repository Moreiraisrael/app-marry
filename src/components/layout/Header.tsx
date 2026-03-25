import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-800">{title}</h1>
      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9 border border-neutral-200">
          <AvatarImage src="" alt="Avatar do Usuário" />
          <AvatarFallback className="bg-rose-100 text-rose-900 font-medium">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
