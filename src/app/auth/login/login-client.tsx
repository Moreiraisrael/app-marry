'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(async (_prevState: { error?: string } | null, formData: FormData) => {
    return await signIn(formData) || null
  }, null)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">
            Marry <span className="text-amber-500">Miele</span>
          </h1>
          <p className="text-neutral-400 text-sm tracking-wide">ESTILO SAZONAL & ESTRATÉGICO</p>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-white text-center">Bem-vinda de volta</CardTitle>
            <p className="text-neutral-500 text-center text-sm">Acesse sua conta para continuar sua jornada</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {state?.error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold ml-1">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                  <Input 
                    name="email"
                    type="email"
                    required
                    placeholder="ex@exemplo.com"
                    className="bg-neutral-900/50 border-white/5 text-white rounded-2xl h-12 pl-12 focus:ring-amber-500/20 focus:border-amber-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Senha</Label>
                  <Link href="#" className="text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-tighter">Esqueceu?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                  <Input 
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="bg-neutral-900/50 border-white/5 text-white rounded-2xl h-12 pl-12 focus:ring-amber-500/20 focus:border-amber-500/30"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-2xl h-12 font-bold transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <>
                    ENTRAR AGORA
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-neutral-500 text-sm">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="text-white hover:text-amber-500 font-bold transition-colors">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
