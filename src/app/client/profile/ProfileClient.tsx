"use client"

import { useActionState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { User, Save, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/profile"
import { toast } from "sonner"

export function ProfileClient({ profile }: { profile: any }) {
  const [_state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success(result.success)
      } else if (result.error) {
        toast.error(result.error)
      }
      return result
    },
    null
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <div className="flex items-center gap-2 mb-2 text-primary font-bold tracking-[0.2em] uppercase text-[10px]">
          <User className="w-4 h-4" /> Área da Cliente
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2 text-white">Meu Perfil</h1>
        <p className="text-neutral-400 font-light text-lg">Gerencie suas informações pessoais e preferências de estilo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border-none shadow-sm shadow-primary/5 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 ring-4 ring-white overflow-hidden relative">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary-foreground" />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{profile?.full_name || 'Cliente'}</h2>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{profile?.user_type === 'consultant' ? 'Consultora VIP' : 'Membro Premium'}</p>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border-none shadow-sm shadow-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Resumo de Estilo</h3>
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Cartela', value: profile?.season || 'Não Definida' },
                 { label: 'Arquétipo', value: profile?.style_archetypes?.[0] || 'Não Definido' },
                 { label: 'Estilo', value: 'Elegante' },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter">{item.label}</span>
                    <span className="text-foreground font-bold">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form action={formAction}>
            <Card className="border-none bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm shadow-primary/5">
              <h3 className="text-2xl font-serif text-foreground mb-8 border-b border-border/50 pb-4 flex items-center gap-3">
                 <Heart className="w-6 h-6 text-primary" /> Dados Pessoais
              </h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Nome Completo</Label>
                    <Input name="fullName" className="bg-white/80 border-border/50 text-foreground rounded-2xl h-12" defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">E-mail</Label>
                    <Input name="email" className="bg-secondary/40 border-transparent text-foreground/60 rounded-2xl h-12" defaultValue={profile?.email || ''} disabled />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Sobre meu Estilo (Bio)</Label>
                  <textarea name="bio" className="w-full bg-white/80 border border-border/50 text-foreground rounded-2xl p-5 min-h-[120px] text-sm focus:ring-primary/20 transition-all outline-none font-medium leading-relaxed" placeholder="Conte um pouco sobre suas preferências de cores e estilo..." defaultValue={profile?.bio || ''} />
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 h-14 gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98 font-bold uppercase tracking-widest text-xs"
                  >
                    {isPending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
