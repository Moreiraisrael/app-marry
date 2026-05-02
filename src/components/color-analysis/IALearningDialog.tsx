"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Sparkles, CheckCircle2, Target } from "lucide-react"

interface IALearningDialogProps {
  trigger?: React.ReactNode
}

export function IALearningDialog({ trigger }: IALearningDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-white text-primary hover:bg-stone-50 font-bold rounded-xl h-12">
            Explorar Insights
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-serif text-foreground mb-2">IA Learning Insights</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground font-light leading-relaxed">
            Nossa Inteligência Visual está em constante aprendizado com as suas análises, melhorando a precisão a cada nova foto processada.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-stone-50 border-stone-100 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-stone-600 uppercase tracking-wider">Precisão Global</span>
            </div>
            <p className="text-4xl font-bold text-foreground">94.8%</p>
            <p className="text-xs text-emerald-600 font-medium mt-2">+15% este mês</p>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm text-primary uppercase tracking-wider">Acertos de Subtom</span>
            </div>
            <p className="text-4xl font-bold text-primary">98.2%</p>
            <p className="text-xs text-primary/70 font-medium mt-2">Em luz natural controlada</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Evolução Recente do Modelo
          </h4>
          
          <div className="space-y-3">
            <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground">Detecção Aprimorada de Contraste</p>
                <p className="text-xs text-muted-foreground mt-1">O motor agora identifica níveis de contraste intermediários com 2x mais precisão.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground">Correção Automática de Iluminação</p>
                <p className="text-xs text-muted-foreground mt-1">Fotos com luz amarelada recebem balanço de branco inteligente antes da análise.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground">Novo Mapeamento de Sardas e Sardas</p>
                <p className="text-xs text-muted-foreground mt-1">A IA não confunde mais sardas com subtons quentes na região das bochechas.</p>
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
