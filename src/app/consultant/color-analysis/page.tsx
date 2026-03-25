'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, Camera, History, Plus, 
  Search, Palette, ArrowRight, Star
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function ColorAnalysisPage() {
  const recentAnalyses = [
    { client: 'Mariana Costa', date: '22 Mar, 2026', palette: 'Inverno Frio', confidence: '98%' },
    { client: 'Beatriz Silva', date: '20 Mar, 2026', palette: 'Outono Quente', confidence: '95%' },
    { client: 'Fernanda Lima', date: '18 Mar, 2026', palette: 'Verão Suave', confidence: '92%' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Color Intelligence AI
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Análise de Coloração</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Identifique a cartela de cores ideal de sua cliente com precisão matemática e auxílio de visão computacional.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-3 border-none group transition-all">
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Nova Análise Digital
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-700">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-4">Inicie uma nova jornada cromática</h3>
                <p className="text-muted-foreground">Arraste uma foto da sua cliente ou use a câmera para capturar o subtom de pele e olhos em tempo real.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm">
                <Button className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold gap-2">
                  <Plus className="w-5 h-5" /> Enviar Foto
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 text-foreground hover:bg-primary/5 gap-2">
                   Manual
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none bg-background/40 backdrop-blur-sm rounded-3xl p-6 flex items-center gap-5 group hover:bg-background/60 transition-all cursor-pointer shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Dossiê de Cores</h4>
                <p className="text-xs text-muted-foreground">Gere PDFs personalizados automaticamente.</p>
              </div>
            </Card>
            <Card className="border-none bg-background/40 backdrop-blur-sm rounded-3xl p-6 flex items-center gap-5 group hover:bg-background/60 transition-all cursor-pointer shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Histórico</h4>
                <p className="text-xs text-muted-foreground">Acesse análises feitas anteriormente.</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Recentes
            </h3>
            <Button variant="link" className="text-primary text-xs font-bold p-0">Ver Tudo</Button>
          </div>

          {recentAnalyses.map((item, i) => (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               key={i}
             >
                <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-3xl p-6 group hover:shadow-md transition-all cursor-pointer border border-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{item.client}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.date}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[10px] bg-primary/5 font-bold">
                      {item.confidence}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-medium text-foreground/70">{item.palette}</span>
                     <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
             </motion.div>
          ))}
          
          <Card className="border-none bg-primary p-8 rounded-[2rem] text-primary-foreground relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/20">
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
             <h4 className="text-xl font-bold mb-2 relative z-10">IA Learning</h4>
             <p className="text-xs text-white/70 mb-6 relative z-10">Sua precisão nas análises subiu 15% este mês graças às novas atualizações de motor visual.</p>
             <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl relative z-10">
               Explorar Insights
             </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
