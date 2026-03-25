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
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">Estilo Identificado!</h2>
        <p className="text-neutral-500 text-lg mb-8 italic">
          Suas preferências revelam um radar refinado para a moda. Seus resultados foram enviados para análise da consultora.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            className="bg-neutral-900 hover:bg-black text-white h-14 rounded-2xl font-bold text-lg shadow-xl"
            onClick={() => router.push('/client/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
          <Button variant="ghost" className="text-neutral-400 group" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Refazer Quiz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <Button variant="ghost" className="mb-6 text-neutral-400 hover:text-neutral-900" onClick={() => router.push('/client/quiz')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Encerrar Autoconhecimento
        </Button>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" />
          Análise de Estilo Pessoal
        </div>
        <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-2">Desvende seu Olhar</h1>
        <p className="text-neutral-500">Escolha as opções que mais fazem seu coração vibrar.</p>
      </div>

      <div className="mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          <span>Progresso: {step + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-neutral-100" />
      </div>

      <Card className="border-neutral-200/40 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-b-[6px] border-rose-100">
        <CardHeader className="pb-8 pt-12 px-10 text-center">
          <CardTitle className="text-2xl md:text-3xl font-serif font-bold leading-tight text-neutral-900">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers({...answers, [currentQ.id]: opt.value})}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 group
                  ${answers[currentQ.id] === opt.value 
                    ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-500/10' 
                    : 'border-neutral-100 bg-white hover:border-rose-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${answers[currentQ.id] === opt.value ? 'border-rose-500 bg-rose-500' : 'border-neutral-200'}
                   `}>
                     {answers[currentQ.id] === opt.value && <Check className="w-4 h-4 text-white" />}
                   </div>
                   <span className={`text-left text-lg font-medium transition-colors ${answers[currentQ.id] === opt.value ? 'text-rose-950 font-bold' : 'text-neutral-600'}`}>
                     {opt.label}
                   </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-10 py-8 flex justify-between bg-neutral-50/50 border-t border-neutral-100">
          <Button variant="ghost" size="lg" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} className="text-neutral-400 font-bold text-xs uppercase tracking-widest">
            Anterior
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={!answers[currentQ.id] || isSaving}
            className="bg-neutral-900 text-white hover:bg-black transition-all shadow-xl px-10 rounded-xl font-bold h-14"
          >
            {isSaving ? 'Enviando...' : step === questions.length - 1 ? 'Finalizar Análise' : 'Próxima'} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
