"use client"

import { useState } from "react"
import { 
  User, Bell, Shield, 
  CreditCard, Palette,
  Mail, Smartphone, Lock, 
  CreditCard as CardIcon, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ProfileForm } from "./ProfileForm"

interface SettingsTabsProps {
  initialData: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  }
}

export function SettingsTabs({ initialData }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("perfil")

  const tabs = [
    { id: "perfil", icon: User, label: "Perfil" },
    { id: "notificacoes", icon: Bell, label: "Notificações" },
    { id: "seguranca", icon: Shield, label: "Segurança" },
    { id: "faturamento", icon: CreditCard, label: "Faturamento" },
    { id: "aparencia", icon: Palette, label: "Aparência" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar de Abas */}
      <div className="md:col-span-1 space-y-2">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <Button 
              key={tab.id} 
              variant="ghost" 
              onClick={() => setActiveTab(tab.id)}
              className={`w-full justify-start gap-4 rounded-2xl h-14 text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="md:col-span-2">
        {activeTab === "perfil" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ProfileForm initialData={initialData} />
          </div>
        )}

        {activeTab === "notificacoes" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm shadow-primary/5">
              <h3 className="text-2xl font-serif text-foreground mb-8 border-b border-border/50 pb-4 flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary" /> Preferências de Notificação
              </h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground font-bold text-base flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary opacity-60" /> E-mail
                    </Label>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">Alertas de novos pedidos e atualizações importantes.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground font-bold text-base flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary opacity-60" /> Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">Notificações direto no navegador/smartphone.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "seguranca" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm shadow-primary/5">
              <h3 className="text-2xl font-serif text-foreground mb-8 border-b border-border/50 pb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" /> Segurança da Conta
              </h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Senha Atual</Label>
                  <Input type="password" placeholder="••••••••" className="bg-white/80 border-border/50 text-foreground rounded-2xl h-12" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Nova Senha</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" className="bg-white/80 border-border/50 text-foreground rounded-2xl h-12" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 font-bold uppercase tracking-widest text-xs gap-2">
                  <Lock className="w-4 h-4" /> Atualizar Senha
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "faturamento" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <Card className="border-none bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 shadow-xl shadow-primary/20 text-primary-foreground relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-12">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                     <CardIcon className="w-8 h-8" />
                   </div>
                   <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
                     Plano Elite
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Status do Plano</p>
                   <h4 className="text-3xl font-serif">Marry Miele VIP</h4>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
                   <span className="font-light italic opacity-80">Próxima renovação: 25 Abr, 2026</span>
                   <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl px-6 font-bold tracking-tight">Gerenciar</Button>
                 </div>
               </div>
               {/* Pattern */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-white/40 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Faturas</p>
                  <p className="text-sm font-bold text-foreground">Acessar Histórico</p>
                </div>
              </Card>
              <Card className="border-none bg-white/40 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Método</p>
                  <p className="text-sm font-bold text-foreground">•••• 4242</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "aparencia" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <Card className="border-none bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm shadow-primary/5">
              <h3 className="text-2xl font-serif text-foreground mb-8 border-b border-border/50 pb-4 flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary" /> Aparência e Tema
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <button className="flex flex-col gap-4 group">
                  <div className="aspect-video w-full rounded-2xl bg-amber-50 border-4 border-primary shadow-lg transition-all group-hover:scale-[1.02]" />
                  <span className="text-sm font-bold text-primary flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Modo Light (Atual)
                  </span>
                </button>
                <button className="flex flex-col gap-4 group opacity-50 cursor-not-allowed">
                  <div className="aspect-video w-full rounded-2xl bg-stone-900 border-2 border-border transition-all" />
                  <span className="text-sm font-bold text-muted-foreground">Modo Dark (Em breve)</span>
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
