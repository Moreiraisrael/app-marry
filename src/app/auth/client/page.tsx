'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ClientLoginPage() {
  const [state, formAction, isPending] = useActionState(async (_prevState: { error?: string } | null, formData: FormData) => {
    return await signIn(formData) || null
  }, null)

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#c2b291]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-[#c2b291]/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#111] tracking-widest uppercase mb-2">
            Marry <span className="text-[#c2b291]">Miele</span>
          </h1>
          <p className="text-[#6d6d6d] text-sm tracking-wide">PORTAL DA CLIENTE</p>
        </div>

        <Card className="border-[#e0dcd3] bg-white/80 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-[#111] text-center">Acesse seu Dossiê</CardTitle>
            <p className="text-[#6d6d6d] text-center text-sm">Faça login para ver seu guarda-roupa virtual</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {state?.error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#6d6d6d] uppercase tracking-widest font-bold ml-1">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d6d6d] group-focus-within:text-[#c2b291] transition-colors" />
                  <Input 
                    name="email"
                    type="email"
                    required
                    placeholder="cliente@exemplo.com"
                    className="bg-white border-[#e0dcd3] text-[#111] rounded-2xl h-12 pl-12 focus:ring-[#c2b291]/20 focus:border-[#c2b291]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-xs text-[#6d6d6d] uppercase tracking-widest font-bold">Senha</Label>
                  <Link href="#" className="text-[10px] text-[#c2b291] hover:text-[#a49a88] uppercase tracking-tighter">Esqueceu?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d6d6d] group-focus-within:text-[#c2b291] transition-colors" />
                  <Input 
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="bg-white border-[#e0dcd3] text-[#111] rounded-2xl h-12 pl-12 focus:ring-[#c2b291]/20 focus:border-[#c2b291]/50"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#111] hover:bg-[#2d2d2d] text-white rounded-2xl h-12 font-bold transition-all shadow-lg shadow-[#111]/10 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <>
                    ACESSAR DOSSIÊ
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
