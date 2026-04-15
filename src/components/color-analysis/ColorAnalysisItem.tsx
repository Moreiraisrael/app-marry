"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Sparkles, BrainCircuit, Activity, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ColorAnalysisRequest } from "@/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { approveColorAnalysis, analyzeColorWithAI, AIColorAnalysisResult } from "@/lib/actions/color-analysis"
import { useRouter } from "next/navigation"

interface ColorAnalysisItemProps {
  request: ColorAnalysisRequest & {
    profiles: { full_name: string | null; email: string | null } | null
  }
  index: number
}

const SEASONS = [
  "Inverno Frio", "Inverno Escuro", "Inverno Brilhante",
  "Verão Frio", "Verão Claro", "Verão Suave",
  "Outono Quente", "Outono Escuro", "Outono Suave",
  "Primavera Quente", "Primavera Clara", "Primavera Brilhante"
]

export function ColorAnalysisItem({ request, index }: ColorAnalysisItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(request.consultant_season || request.ai_suggested_season || "")
  const [isApproving, setIsApproving] = useState(false)
  const [isPendingAI, startAITransition] = useTransition()
  const router = useRouter()
  
  const formattedDate = format(new Date(request.created_at), "dd MMM, yyyy", { locale: ptBR })
  const isPending = request.status === 'pending'
  const aiData = request.ai_analysis_data as AIColorAnalysisResult | null

  const handleApprove = async () => {
    if (!selectedSeason) return
    setIsApproving(true)
    await approveColorAnalysis(request.id, selectedSeason, "Analisado pela consultoria.")
    setIsApproving(false)
    setIsExpanded(false)
    router.refresh()
  }

  const handleRunAI = () => {
    startAITransition(async () => {
      await analyzeColorWithAI(request.id)
      router.refresh()
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2rem] p-6 group hover:shadow-md transition-all border border-primary/5">
        <div 
          className="flex justify-between items-start mb-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
              {request.profiles?.full_name || 'Cliente'}
            </h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{formattedDate}</p>
          </div>
          <Badge 
            variant="outline" 
            className={`border-none text-[10px] font-bold px-3 py-1 rounded-lg ${
              isPending 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {isPending ? 'Pendente' : 'Finalizada'}
          </Badge>
        </div>
        
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
            <span className="text-xs font-semibold text-foreground/70">
              {request.consultant_season || request.ai_suggested_season || 'Cartela não definida'}
            </span>
            <ArrowRight className={`w-4 h-4 text-primary transition-all ${isExpanded ? 'rotate-90' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-primary/10 animate-in slide-in-from-top-2">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna da Imagem */}
              <div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">Foto para Análise</p>
                {request.client_photo ? (
                  <div className="w-full h-64 rounded-2xl overflow-hidden bg-stone-100 mb-6 border border-stone-200 shadow-sm relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={request.client_photo} alt="Foto Cliente" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic mb-6">Nenhuma foto enviada.</p>
                )}
                
                {isPending && !request.ai_suggested_season && (
                  <Button 
                    onClick={handleRunAI} 
                    disabled={isPendingAI || !request.client_photo}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {isPendingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                    {isPendingAI ? "Analisando Contrastes..." : "Rodar Motor de IA"}
                  </Button>
                )}
              </div>

              {/* Coluna da Inteligência */}
              <div>
                {aiData ? (
                  <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10 mb-6">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                      <Sparkles className="w-4 h-4" /> Diagnóstico IA
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                         <Activity className="w-4 h-4 mt-0.5 text-primary/60" />
                         <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Temperatura</span>
                            <span className="text-sm font-medium">{aiData.temperature_analysis}</span>
                         </div>
                      </div>
                      <div className="flex gap-3 items-start">
                         <Eye className="w-4 h-4 mt-0.5 text-primary/60" />
                         <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Nível de Contraste</span>
                            <span className="text-sm font-medium capitalize">{aiData.contrast_level} - {aiData.depth_analysis}</span>
                         </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/60 rounded-xl">
                       <span className="text-[10px] font-bold uppercase text-primary mb-1 block">Aparecimento Sazonal Sugerido</span>
                       <span className="text-lg font-serif">{aiData.season}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
                      <BrainCircuit className="w-8 h-8 text-stone-300 mb-3" />
                      <p className="text-sm text-stone-500 font-medium">Aguardando análise da Inteligência Visual</p>
                  </div>
                )}
              </div>
            </div>

            {isPending && (
              <div className="mt-8 space-y-4 pt-6 border-t border-primary/10">
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2">Resultado Final: Selecione a Cartela</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {SEASONS.map(s => (
                    <div 
                      key={s} 
                      onClick={() => setSelectedSeason(s)}
                      className={`text-xs p-3 text-center rounded-xl cursor-pointer transition-all border ${selectedSeason === s ? 'bg-primary text-white border-primary shadow-md' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleApprove}
                    disabled={!selectedSeason || isApproving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] font-bold h-12 px-8 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {isApproving ? 'Aprovando...' : 'Aprovar e Liberar Dossiê'} <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
