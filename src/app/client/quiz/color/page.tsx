"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

const colorQuestions = [
  {
    id: 1,
    question: "Como a sua pele reage quando exposta ao sol (sem protetor)?",
    options: [
      { id: "1a", text: "Fico vermelha e queimo com muita facilidade." },
      { id: "1b", text: "Fico dourada/bronzeada facilmente, raramente queimo." },
      { id: "1c", text: "Queimo um pouco primeiro, mas logo bronzeio." },
    ]
  },
  {
    id: 2,
    question: "Acostume-se a olhar para as veias do seu pulso sob luz natural. Qual a cor que mais predomina?",
    options: [
      { id: "2a", text: "Azuladas ou arroxeadas." },
      { id: "2b", text: "Esverdeadas." },
      { id: "2c", text: "Uma mistura de azul e verde (difícil de definir)." },
    ]
  },
  {
    id: 3,
    question: "Com quais metais você sente que sua pele ganha mais 'vida' e brilho?",
    options: [
      { id: "3a", text: "Prata, Ouro Branco ou Platina." },
      { id: "3b", text: "Ouro Amarelo, Cobre ou Bronze." },
      { id: "3c", text: "Fico bem tanto com prata quanto com ouro amarelo." },
    ]
  }
]

export default function ColorQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isFinished, setIsFinished] = useState(false)

  const progress = ((currentStep) / colorQuestions.length) * 100
  const currentQ = colorQuestions[currentStep]

  const handleNext = () => {
    if (currentStep < colorQuestions.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">Análise Sazonal Concluída!</h2>
        <p className="text-neutral-500 text-lg mb-8">
          Descobrimos a sua temperatura de pele e contraste. Seu Dossiê de Coloração Pessoal foi gerado.
        </p>
        <Button className="bg-amber-600 hover:bg-amber-700 w-full md:w-auto h-12 px-8 text-base shadow-lg text-white" onClick={() => window.location.href = '/client/dashboard'}>
          Ver Paleta Ideal
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Button variant="ghost" className="mb-6 -ml-4 text-neutral-500 hover:text-neutral-900" onClick={() => window.location.href = '/client/quiz'}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Jornadas
        </Button>
        <div className="flex justify-between text-sm font-medium text-neutral-500 mb-3">
          <span>Temperatura e Subtom: Passo {currentStep + 1} de {colorQuestions.length}</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <Progress value={progress} className="h-2.5 bg-neutral-100" />
      </div>

      <Card className="border-neutral-200/60 shadow-xl bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-8 pt-10 px-8 bg-amber-50/30">
          <CardTitle className="text-2xl md:text-3xl font-serif leading-snug text-neutral-800">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pt-6">
          <RadioGroup 
            value={answers[currentQ.id]} 
            onValueChange={(val) => setAnswers({...answers, [currentQ.id]: val})}
            className="space-y-4"
          >
            {currentQ.options.map((opt) => (
              <div key={opt.id} className="relative flex items-center space-x-3 border border-neutral-200 p-5 rounded-xl hover:border-amber-300 hover:bg-amber-50/40 transition-all has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:shadow-sm">
                <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="text-amber-600 absolute right-4 block w-5 h-5 ml-auto" />
                <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer pr-8 text-lg font-medium text-neutral-700 leading-relaxed">
                  {opt.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="px-8 pb-8 pt-6 flex justify-between border-t border-neutral-100 mt-6">
          <Button variant="outline" size="lg" onClick={handleBack} disabled={currentStep === 0} className="border-neutral-200">
            Anterior
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={!answers[currentQ.id]}
            className="bg-neutral-900 text-white hover:bg-amber-600 transition-colors shadow-md px-8"
          >
            {currentStep === colorQuestions.length - 1 ? 'Analisar Contraste' : 'Próxima'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
