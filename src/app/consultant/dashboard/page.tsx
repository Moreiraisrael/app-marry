'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Settings,
  HelpCircle,
  type LucideIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { getDashboardStats } from '@/lib/actions/dashboard'

export default function PremiumDashboard() {
  const [userName, setUserName] = useState('Consultora')
  const [stats, setStats] = useState<{label: string, value: string, icon: LucideIcon}[]>([
    { label: 'Clientes Ativas', value: '0', icon: Users },
    { label: 'Sessões Marcadas', value: '0', icon: Calendar },
    { label: 'Metas Atingidas', value: '0%', icon: TrendingUp },
    { label: 'Mensagens', value: '0', icon: MessageSquare }
  ])
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'Consultora')
      }
      
      const realStats = await getDashboardStats()
      setStats([
        { label: 'Clientes Ativas', value: String(realStats.clientsCount), icon: Users },
        { label: 'Sessões Marcadas', value: String(realStats.appointmentsCount), icon: Calendar },
        { label: 'Metas Atingidas', value: '0%', icon: TrendingUp },
        { label: 'Mensagens', value: '0', icon: MessageSquare }
      ])
    }
    loadDashboardData()
  }, [supabase.auth])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  } as const

  return (
    <div className="space-y-12">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Boas vindas */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-2">
            <Sparkles className="h-3 w-3" />
            Sua jornada estratégica de hoje
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
            Bem-vinda de volta, <span className="font-light italic">{userName}</span>
          </h2>
          <p className="text-foreground max-w-xl text-lg font-light leading-relaxed opacity-90">
            O seu dashboard de luxo está preparado para uma nova sessão de consultoria estratégica.
          </p>
        </motion.div>

        {/* Estatísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="group overflow-hidden border-none bg-card/60 backdrop-blur-md shadow-sm shadow-primary/5 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-2xl bg-secondary/50 p-3 transition-colors group-hover:bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase border-primary/20 text-primary opacity-60">Hoje</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{stat.label}</p>
                  <h3 className="text-4xl font-serif text-foreground">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Seção Principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Gestão de Clientes */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full border-none bg-card/40 backdrop-blur-sm shadow-sm shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-border/20">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-serif text-foreground">Atividade Recente</CardTitle>
                  <CardDescription className="text-sm font-medium italic text-muted-foreground">Seu fluxo estratégico de consultoria</CardDescription>
                </div>
                <Button className="rounded-full bg-primary px-6 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Nova Consultoria
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center mb-2 animate-pulse">
                    <Users className="h-10 w-10 text-primary/30" />
                  </div>
                  <h4 className="text-xl font-serif text-foreground/70 tracking-tight">Pronta para começar</h4>
                  <p className="text-muted-foreground text-sm font-light max-w-xs leading-relaxed">
                    Seu ateliê está limpo e organizado. Inicie uma nova análise de imagem para ver o progresso aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Elite Tools */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-none bg-card/40 backdrop-blur-sm shadow-sm shadow-primary/5">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-serif text-foreground/90">Ferramentas Pro</CardTitle>
                <CardDescription className="font-light">Recursos exclusivos Marry Miele</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                {[
                  { title: 'Dossiê Sazonal', icon: Sparkles, desc: 'Color Analysis 2026' },
                  { title: 'Guia de Biotipo', icon: BookOpen, desc: 'Análise Antropométrica' },
                  { title: 'Métricas de Visagismo', icon: TrendingUp, desc: 'Diagnóstico por IA' },
                  { title: 'Elite Settings', icon: Settings, desc: 'Preferências da conta' }
                ].map((tool, i) => (
                  <button key={i} className="group w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:bg-white/60 border border-transparent hover:border-primary/10">
                    <div className="rounded-xl bg-background p-3 shadow-sm group-hover:scale-110 transition-transform">
                      <tool.icon className="h-5 w-5 text-primary opacity-80" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-foreground">{tool.title}</h5>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{tool.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </button>
                ))}
                
                <div className="mt-8 p-6 rounded-3xl bg-secondary/40 border border-primary/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary opacity-60" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Suporte VIP</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic font-light">
                    Transformando imagens em estratégias de sucesso pessoal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
