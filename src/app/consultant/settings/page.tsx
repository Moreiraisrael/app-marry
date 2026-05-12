import { createClient } from "@/lib/supabase/server"
import { SettingsTabs } from "@/components/profile/SettingsTabs"
import { redirect } from "next/navigation"

export default async function ConsultantSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/consultant")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const initialData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
    email: user.email || "",
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <h2 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">Configurações</h2>
        <p className="text-muted-foreground font-light text-lg">Gerencie sua conta, notificações e preferências do sistema Estilo App.</p>
      </div>

      <SettingsTabs initialData={initialData} />
    </div>
  )
}
