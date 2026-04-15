import React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, Construction } from 'lucide-react'

export default function VisagismoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-4 text-primary">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif text-foreground">Métricas de Visagismo</h1>
          <p className="text-muted-foreground font-light text-sm tracking-wider uppercase">Diagnóstico por IA</p>
        </div>
      </div>

      <Card className="p-12 border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center text-primary/50 mb-4 animate-pulse">
          <Construction className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Módulo em Desenvolvimento</h2>
        <p className="text-muted-foreground max-w-md font-light leading-relaxed">
          Nossa inteligência artificial está sendo treinada para oferecer os diagnósticos mais precisos de visagismo do mercado. Esta ferramenta exclusiva ficará disponível em breve.
        </p>
      </Card>
    </div>
  )
}
