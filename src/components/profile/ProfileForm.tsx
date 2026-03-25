"use client"

import { useActionState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { User, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/profile"
import { toast } from "sonner"

interface ProfileFormProps {
  initialData: {
    full_name: string | null
    email: string | null
    bio: string | null
    avatar_url: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
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
    <form action={formAction} className="space-y-8">
      <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm shadow-primary/5">
        <h3 className="text-2xl font-serif text-foreground mb-8 border-b border-border/50 pb-4 flex items-center gap-3">
          <User className="w-6 h-6 text-primary" /> Informações do Perfil
        </h3>
        <div className="space-y-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 ring-4 ring-white overflow-hidden relative">
              {initialData.avatar_url ? (
                <Image 
                  src={initialData.avatar_url} 
                  alt="Avatar" 
                  fill
                  className="object-cover" 
                />
              ) : (
                <User className="w-12 h-12 text-primary-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="border-primary/20 text-primary hover:bg-primary/5 rounded-2xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
              >
                Alterar Avatar
              </Button>
              <p className="text-[10px] text-muted-foreground italic font-light">Sugestão: 400x400px, máx 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Nome Profissional</Label>
              <Input 
                name="fullName" 
                className="bg-white/80 border-border/50 text-foreground rounded-2xl h-12 focus:ring-primary/20 font-medium" 
                defaultValue={initialData.full_name || ""} 
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">E-mail</Label>
              <Input 
                name="email" 
                className="bg-secondary/40 border-transparent text-foreground/60 rounded-2xl h-12 font-medium" 
                defaultValue={initialData.email || ""} 
                disabled 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Bio Profissional</Label>
            <textarea 
              name="bio" 
              className="w-full bg-white/80 border border-border/50 text-foreground rounded-2xl p-5 min-h-[120px] text-sm focus:ring-primary/20 font-medium leading-relaxed" 
              defaultValue={initialData.bio || ""} 
              placeholder="Conte um pouco sobre sua trajetória..."
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-10 h-14 font-bold uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" /> Salvando...
            </span>
          ) : (
            <>
              <Save className="w-5 h-5" /> Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
