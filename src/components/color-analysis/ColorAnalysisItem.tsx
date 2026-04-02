"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ColorAnalysisRequest } from "@/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { approveColorAnalysis } from "@/lib/actions/quizzes"

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
  const [selectedSeason, setSelectedSeason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  
  const formattedDate = format(new Date(request.created_at), "dd MMM, yyyy", { locale: ptBR })
  const isPending = request.status === 'pending'

  const handleApprove = async () => {
    if (!selectedSeason) return
    setIsApproving(true)
    await approveColorAnalysis(request.id, selectedSeason, "Analisado pela consultoria.")
    setIsApproving(false)
    setIsExpanded(false)
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
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">Foto para Análise</p>
            
            {request.client_photo ? (
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-stone-100 mb-6 border border-stone-200 shadow-sm relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={request.client_photo} alt="Foto Cliente" className="object-cover w-full h-full" />
              </div>
            ) : (
              <p className="text-sm text-stone-500 italic mb-6">Nenhuma foto enviada.</p>
            )}

            {isPending && (
              <div className="space-y-4">
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2">Selecione a Cartela Identificada:</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] font-bold h-12 px-8 transition-all"
                  >
                    {isApproving ? 'Aprovando...' : 'Aprovar Análise'} <CheckCircle2 className="w-4 h-4 ml-2" />
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
