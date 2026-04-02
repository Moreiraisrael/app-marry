"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, User, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { approveQuiz } from "@/lib/actions/quizzes"

interface Quiz {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  profiles?: {
    full_name?: string | null;
  } | null;
  created_at: string;
  quiz_type: string;
  result_text?: string;
}

interface QuizListItemProps {
  quiz: Quiz;
  index: number;
  isPending?: boolean;
}

export function QuizListItem({ quiz, index, isPending }: QuizListItemProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    await approveQuiz(quiz.id, quiz.result_text || 'Aprovado')
    setIsApproving(false)
  }

  return (
    <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.1 }}
    >
      <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2rem] p-8 group relative overflow-hidden border border-primary/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-foreground font-bold text-base tracking-tight">
                {quiz.profiles?.full_name || 'Cliente'}
              </h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {new Date(quiz.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          {isPending && (
            <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-3 py-1 rounded-lg">Novo</Badge>
          )}
        </div>
        
        <div className="bg-background/40 p-5 rounded-2xl mb-6 text-sm text-foreground/80 border border-primary/5 relative z-10">
          <span className="text-primary block mb-2 font-bold text-[10px] uppercase tracking-[0.2em]">Diagnóstico:</span>
          <span className="font-semibold">{quiz.quiz_type}</span>
          
          {showDetails && quiz.result_text && (
            <div className="mt-4 pt-4 border-t border-primary/10">
              <span className="text-primary block mb-2 font-bold text-[10px] uppercase tracking-[0.2em]">Resultado Calculado:</span>
              <span className="font-semibold text-[#B48D6C]">{quiz.result_text}</span>
            </div>
          )}
        </div>
        
        {isPending ? (
          <div className="flex gap-4 relative z-10 flex-col sm:flex-row">
            <Button 
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-white hover:bg-stone-50 text-stone-900 rounded-[1.25rem] font-bold h-12 border-stone-200 transition-all"
            >
              {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
            </Button>
            {showDetails && (
              <Button 
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] gap-2 font-bold h-12 shadow-lg border-none transition-all"
              >
                {isApproving ? 'Salvando...' : 'Aprovar'} <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-[1.25rem] gap-2 font-bold h-12 border-none relative z-10 transition-all">
            Ver Dossiê <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </Card>
    </motion.div>
  )
}
