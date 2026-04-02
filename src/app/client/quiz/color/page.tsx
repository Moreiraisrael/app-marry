"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud, Camera } from "lucide-react"
import { submitColorAnalysis } from "@/lib/actions/quizzes"

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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [errorText, setErrorText] = useState("")

  const progress = ((currentStep) / colorQuestions.length) * 100
  const currentQ = colorQuestions[currentStep]

  const handleNext = () => {
    if (currentStep < colorQuestions.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      setShowPhotoUpload(true)
    }
  }

  const handleBack = () => {
    if (showPhotoUpload) {
      setShowPhotoUpload(false)
    } else if (currentStep > 0) {
      setCurrentStep(c => c - 1)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoDataUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!photoDataUrl) return
    setIsSubmitting(true)
    setErrorText("")
    
    const result = await submitColorAnalysis(photoDataUrl, answers)
    
    if (result.success) {
      setIsFinished(true)
    } else {
      setErrorText(result.error || "Ocorreu um erro ao enviar a análise.")
    }
    
    setIsSubmitting(false)
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-in zoom-in duration-700">
        <div className="mx-auto w-24 h-24 bg-[#B48D6C]/10 text-[#B48D6C] rounded-full flex items-center justify-center mb-8 shadow-inner border border-[#B48D6C]/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4 tracking-tight">Análise Enviada com Sucesso!</h2>
        <p className="text-stone-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Nossa equipe de consultoria avaliará suas fotos e respostas. Você receberá seu Dossiê de Coloração Pessoal em breve.
        </p>
        <Button 
          className="bg-stone-900 hover:bg-stone-800 text-stone-50 h-16 px-12 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95" 
          onClick={() => window.location.href = '/client/dashboard'}
        >
          Voltar ao Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-10">
        <Button variant="ghost" className="mb-8 -ml-4 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" onClick={() => window.location.href = '/client/quiz'}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Jornadas
        </Button>
        <div className="flex justify-between text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">
          <span>{showPhotoUpload ? 'Envio de Foto' : `Temperatura e Subtom: Passo ${currentStep + 1} de ${colorQuestions.length}`}</span>
          <span>{showPhotoUpload ? '100% Concluído' : `${Math.round(progress)}% Concluído`}</span>
        </div>
        <Progress value={showPhotoUpload ? 100 : progress} className="h-2 bg-stone-100 rounded-full" />
      </div>

      <Card className="border-stone-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden border-b-[8px] border-stone-100/80 transition-all duration-500">
        
        {!showPhotoUpload ? (
          <>
            <CardHeader className="pb-10 pt-16 px-8 md:px-14 bg-stone-50/30">
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold leading-tight text-stone-900 tracking-tight">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 md:px-14 pt-10 pb-16">
              <RadioGroup 
                value={answers[currentQ.id]} 
                onValueChange={(val) => setAnswers({...answers, [currentQ.id]: val})}
                className="space-y-4"
              >
                {currentQ.options.map((opt) => (
                  <div 
                    key={opt.id} 
                    className={`relative flex items-center space-x-4 border-2 p-6 rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden
                      ${answers[currentQ.id] === opt.id 
                        ? 'border-[#B48D6C] bg-[#B48D6C]/5 shadow-lg' 
                        : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-md'
                      }`}
                  >
                    <RadioGroupItem 
                      value={opt.id} 
                      id={`opt-${opt.id}`} 
                      className="text-[#B48D6C] border-[#B48D6C] w-6 h-6 ml-auto order-2" 
                    />
                    <Label 
                      htmlFor={`opt-${opt.id}`} 
                      className={`flex-1 cursor-pointer order-1 text-xl transition-all duration-500 ${answers[currentQ.id] === opt.id ? 'text-stone-900 font-bold tracking-tight transform translate-x-1' : 'text-stone-600 font-medium'}`}
                    >
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="px-8 md:px-14 py-10 flex flex-col md:flex-row gap-4 justify-between bg-stone-50/40 border-t border-stone-100/60 mt-auto">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleBack} 
                disabled={currentStep === 0} 
                className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] h-14 px-8 hover:bg-white hover:text-stone-900 rounded-2xl disabled:opacity-30"
              >
                Anterior
              </Button>
              <Button 
                size="lg"
                onClick={handleNext} 
                disabled={!answers[currentQ.id]}
                className="bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all shadow-2xl px-12 rounded-2xl font-bold h-16 text-lg min-w-[200px] active:scale-95 disabled:bg-stone-200"
              >
                {currentStep === colorQuestions.length - 1 ? 'Analisar Contraste' : 'Próxima'} <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="pb-6 pt-16 px-8 md:px-14 bg-stone-50/30 text-center">
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold leading-tight text-stone-900 tracking-tight mb-4">
                Envie uma Foto Sua
              </CardTitle>
              <p className="text-stone-500">
                Para completar a análise de coloração, precisamos de uma foto sua sem maquiagem, sob luz natural (próxima a uma janela).
              </p>
            </CardHeader>
            <CardContent className="px-8 md:px-14 pt-10 pb-16 flex flex-col items-center">
              {photoDataUrl ? (
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#B48D6C] shadow-xl mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoDataUrl} alt="Sua foto" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center mb-8">
                  <Camera className="w-12 h-12 text-stone-300" />
                </div>
              )}
              
              <div className="relative">
                <label htmlFor="color-quiz-photo" className="sr-only">Selecionar foto para análise de coloração</label>
                <input 
                  id="color-quiz-photo"
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoSelect} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 hover:text-stone-900 pointer-events-none">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  {photoDataUrl ? 'Trocar Foto' : 'Escolher Foto'}
                </Button>
              </div>

              {errorText && (
                <p className="text-red-500 mt-6 text-sm font-medium">{errorText}</p>
              )}
            </CardContent>
            <CardFooter className="px-8 md:px-14 py-10 flex flex-col md:flex-row gap-4 justify-between bg-stone-50/40 border-t border-stone-100/60 mt-auto">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleBack} 
                className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] h-14 px-8 hover:bg-white hover:text-stone-900 rounded-2xl"
              >
                Anterior
              </Button>
              <Button 
                size="lg"
                onClick={handleSubmit} 
                disabled={!photoDataUrl || isSubmitting}
                className="bg-[#B48D6C] text-white hover:bg-[#A37B5C] transition-all shadow-2xl px-12 rounded-2xl font-bold h-16 text-lg min-w-[200px] active:scale-95 disabled:bg-stone-200"
              >
                {isSubmitting ? 'Enviando...' : 'Finalizar Análise'} <CheckCircle2 className="w-5 h-5 ml-3" />
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
