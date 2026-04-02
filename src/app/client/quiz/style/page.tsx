"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Check, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { saveQuizResult } from "@/lib/actions/quizzes"
import { useRouter } from "next/navigation"

const questions = [
  {
    id: "q1",
    question: "Qual palavra melhor descreve seu estilo ideal?",
    options: [
      { value: "classico", label: "Elegante e Atemporal", style: "classico" },
      { value: "dramatico", label: "Ousado e Marcante", style: "dramatico" },
      { value: "romantico", label: "Delicado e Feminino", style: "romantico" },
      { value: "natural", label: "Confortável e Autêntico", style: "natural" }
    ]
  },
  {
    id: "q2",
    question: "Que tipo de roupa você se sente mais você?",
    options: [
      { value: "estruturado", label: "Peças estruturadas e alfaiataria", style: "classico" },
      { value: "statement", label: "Peças statement e impactantes", style: "dramatico" },
      { value: "fluido", label: "Vestidos fluidos e delicados", style: "romantico" },
      { value: "casual", label: "Looks casuais e relaxados", style: "natural" }
    ]
  },
  {
    id: "q3",
    question: "Seus acessórios favoritos são:",
    options: [
      { value: "discreto", label: "Discretos e refinados", style: "classico" },
      { value: "chamativos", label: "Grandes e chamativos", style: "dramatico" },
      { value: "delicados", label: "Delicados e femininos", style: "romantico" },
      { value: "minimalistas", label: "Minimalistas ou naturais", style: "natural" }
    ]
  },
  {
    id: "q4",
    question: "Como você gosta de usar estampas?",
    options: [
      { value: "classicas", label: "Listras e xadrez clássicos", style: "classico" },
      { value: "ousadas", label: "Estampas grandes e ousadas", style: "dramatico" },
      { value: "florais", label: "Florais e rendas", style: "romantico" },
      { value: "naturais", label: "Texturas e tons terrosos", style: "natural" }
    ]
  },
  {
    id: "q5",
    question: "Seu evento formal ideal seria com:",
    options: [
      { value: "terno", label: "Terno ou vestido clássico", style: "classico" },
      { value: "impactante", label: "Look impactante e memorável", style: "dramatico" },
      { value: "glamouroso", label: "Vestido romântico e glamouroso", style: "romantico" },
      { value: "confortavel", label: "Algo elegante mas confortável", style: "natural" }
    ]
  }
]

export default function StyleQuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const progress = ((step) / questions.length) * 100
  const currentQ = questions[step]

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      // Basic calculation
      const counts: Record<string, number> = {}
      Object.entries(answers).forEach(([qId, val]) => {
        const style = questions.find(q => q.id === qId)?.options.find(o => o.value === val)?.style
        if (style) counts[style] = (counts[style] || 0) + 1
      })
      const result = Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0]

      setIsSaving(true)
      await saveQuizResult('style', answers, result)
      setIsSaving(false)
      setIsFinished(true)
    }
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-in zoom-in duration-700">
        <div className="mx-auto w-24 h-24 bg-[#B48D6C]/10 text-[#B48D6C] rounded-full flex items-center justify-center mb-8 shadow-inner border border-[#B48D6C]/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4 tracking-tight">Estilo Identificado!</h2>
        <p className="text-stone-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Suas preferências revelam um radar refinado e autêntico. Seus resultados foram processados com sucesso.
        </p>
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <Button 
            className="bg-stone-900 hover:bg-stone-800 text-stone-50 h-16 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => router.push('/client/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
          <Button variant="ghost" className="text-stone-400 group h-12 hover:bg-stone-50 hover:text-stone-900" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-700" /> Refazer Quiz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-12 text-center">
        <Button variant="ghost" className="mb-8 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" onClick={() => router.push('/client/quiz')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Encerrar Jornada
        </Button>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B48D6C]/10 text-[#B48D6C] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-[#B48D6C]/10">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Análise de Estilo Pessoal
        </div>
        <h1 className="text-5xl font-serif font-bold text-stone-900 mb-3 tracking-tight">Desvende seu Olhar</h1>
        <p className="text-stone-500 text-lg max-w-lg mx-auto">Sintonize com sua essência e escolha as opções que mais fazem seu coração vibrar.</p>
      </div>

      <div className="mb-10 max-w-md mx-auto w-full">
        <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
          <span>Pergunta {step + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-stone-100 rounded-full overflow-hidden">
          {/* eslint-disable-next-line react/no-inline-styles */}
          <div className="h-full bg-[#B48D6C] transition-all duration-700" style={{ width: `${progress}%` }} />
        </Progress>
      </div>

      <Card className="border-stone-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden border-b-[8px] border-stone-100/80 transition-all duration-500">
        <CardHeader className="pb-8 pt-16 px-8 md:px-14 text-center">
          <CardTitle className="text-3xl md:text-4xl font-serif font-bold leading-tight text-stone-900 tracking-tight">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 md:px-14 pb-16">
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers({...answers, [currentQ.id]: opt.value})}
                className={`flex items-center justify-between p-8 rounded-[2rem] border-2 transition-all duration-500 group relative overflow-hidden
                  ${answers[currentQ.id] === opt.value 
                    ? 'border-[#B48D6C] bg-[#B48D6C]/5 shadow-xl shadow-[#B48D6C]/10' 
                    : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-lg'
                  }`}
              >
                {answers[currentQ.id] === opt.value && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[#B48D6C]/5 to-transparent z-0"
                  />
                )}
                <div className="flex items-center gap-6 relative z-10">
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                    ${answers[currentQ.id] === opt.value ? 'border-[#B48D6C] bg-[#B48D6C]' : 'border-stone-200 group-hover:border-stone-300'}
                   `}>
                     {answers[currentQ.id] === opt.value && <Check className="w-5 h-5 text-white" />}
                   </div>
                   <span className={`text-left text-xl transition-all duration-500 ${answers[currentQ.id] === opt.value ? 'text-stone-900 font-bold tracking-tight transform translate-x-1' : 'text-stone-600 font-medium'}`}>
                     {opt.label}
                   </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-8 md:px-14 py-10 flex flex-col md:flex-row gap-4 justify-between bg-stone-50/40 border-t border-stone-100/60 mt-auto">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={() => step > 0 && setStep(step - 1)} 
            disabled={step === 0} 
            className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] h-14 px-8 hover:bg-white hover:text-stone-900 rounded-2xl disabled:opacity-30"
          >
            Anterior
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={!answers[currentQ.id] || isSaving}
            className="bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all shadow-2xl px-12 rounded-2xl font-bold h-16 text-lg min-w-[200px] active:scale-95 disabled:bg-stone-200"
          >
            {isSaving ? 'Enviando...' : step === questions.length - 1 ? 'Finalizar Análise' : 'Próxima'} <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
