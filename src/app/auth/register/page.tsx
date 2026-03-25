'use client'

import { useActionState } from 'react'
import { signUp } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Sparkles, GraduationCap, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(async (_prevState: { error?: string, success?: string } | null, formData: FormData) => {
    return await signUp(formData)
  }, null)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-xl z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">
            Junte-se ao <span className="text-amber-500">Estilo Sazonal</span>
          </h1>
          <p className="text-neutral-500 text-sm tracking-wide">ELEVE SUA IMAGEM AO PRÓXIMO NÍVEL</p>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-xl font-bold text-white text-center">Crie sua conta agora</CardTitle>
            <p className="text-neutral-500 text-center text-sm">Preencha os campos abaixo para começar</p>
          </CardHeader>
          <CardContent className="p-8">
            {state?.error && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}
            
            {state?.success && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{state.success}</p>
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold ml-1">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                    <Input 
                      name="fullName"
                      required
                      placeholder="Marry Miele"
                      className="bg-neutral-900/50 border-white/5 text-white rounded-2xl h-11 pl-12 focus:ring-amber-500/20 focus:border-amber-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold ml-1">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                    <Input 
                      name="email"
                      type="email"
                      required
                      placeholder="seu@e-mail.com"
                      className="bg-neutral-900/50 border-white/5 text-white rounded-2xl h-11 pl-12 focus:ring-amber-500/20 focus:border-amber-500/30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold ml-1">Senha de Acesso</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                  <Input 
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Certifique-se que seja forte"
                    className="bg-neutral-900/50 border-white/5 text-white rounded-2xl h-11 pl-12 focus:ring-amber-500/20 focus:border-amber-500/30"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold ml-1 text-center block w-full">Eu sou uma...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative cursor-pointer group">
                    <input type="radio" name="userType" value="client" defaultChecked className="peer sr-only" />
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 text-center transition-all peer-checked:border-amber-500/50 peer-checked:bg-amber-500/5 hover:bg-neutral-800/60">
                      <Sparkles className="w-6 h-6 text-neutral-500 mb-2 mx-auto peer-checked:text-amber-500 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-neutral-400 peer-checked:text-white uppercase tracking-tighter">Cliente</p>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input type="radio" name="userType" value="consultant" className="peer sr-only" />
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 text-center transition-all peer-checked:border-amber-500/50 peer-checked:bg-amber-500/5 hover:bg-neutral-800/60">
                      <GraduationCap className="w-6 h-6 text-neutral-500 mb-2 mx-auto peer-checked:text-amber-500 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-neutral-400 peer-checked:text-white uppercase tracking-tighter">Consultora</p>
                    </div>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-2xl h-12 font-bold transition-all shadow-lg shadow-amber-500/20 group uppercase tracking-widest disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <>
                    Criar Minha Conta
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-neutral-500 text-sm">
                Já possui uma conta?{" "}
                <Link href="/auth/login" className="text-white hover:text-amber-500 font-bold transition-colors">
                  Acesse agora
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
