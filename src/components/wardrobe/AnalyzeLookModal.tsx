"use client"

import React, { useState } from "react"
import { Sparkles, X, UploadCloud, Camera, CheckCircle2, Star, Target, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { analyzeOutfitWithAI, AIOutfitAnalysisResult } from "@/lib/actions/wardrobe"
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"

interface AnalyzeLookModalProps {
  clientId?: string
  trigger?: React.ReactNode
}

export function AnalyzeLookModal({ clientId = "guest", trigger }: AnalyzeLookModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorText, setErrorText] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AIOutfitAnalysisResult | null>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoDataUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      // Reset previous results
      setAnalysisResult(null)
      setErrorText("")
    }
  }

  const handleAnalyze = async () => {
    if (!photoFile || !photoDataUrl) {
      setErrorText("Uma foto do look é obrigatória.")
      return
    }

    setIsAnalyzing(true)
    setErrorText("")

    try {
      const supabase = createClient()
      
      const fileExt = photoFile.name.split('.').pop() || 'jpg'
      const fileName = `look-${clientId}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wardrobe') // reusing wardrobe bucket
        .upload(fileName, photoFile)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        setErrorText("Erro ao fazer upload da imagem.")
        setIsAnalyzing(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(fileName)

      // Pass URL to Gemini
      const result = await analyzeOutfitWithAI(publicUrl)
      
      if (result) {
        setAnalysisResult(result)
      } else {
        setErrorText("A IA não conseguiu analisar o look desta vez. Tente novamente.")
      }
    } catch (e) {
      setErrorText("Erro inesperado durante a análise.")
    }

    setIsAnalyzing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="w-full bg-white text-primary hover:bg-stone-50 font-bold rounded-full h-12 relative z-10 transition-all">
            Analisar Look com IA
          </Button>
        )}
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <Card className="border-stone-200 shadow-2xl bg-[#fcfaf8] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-2xl text-stone-900">Análise de Look (IA)</CardTitle>
                <p className="text-sm text-stone-500">Descubra o potencial da sua combinação</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-all">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Upload Area */}
            {!analysisResult && (
              <div className="flex flex-col items-center justify-center space-y-6">
                {photoDataUrl ? (
                  <div className="relative w-64 h-80 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoDataUrl} alt="Preview do look" className="object-cover w-full h-full" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <Sparkles className="w-8 h-8 animate-pulse mb-3" />
                        <span className="font-medium animate-pulse">A IA está avaliando...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-[2rem] bg-stone-50 border-2 border-dashed border-stone-200 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-stone-400 cursor-pointer relative">
                    <Camera className="w-10 h-10 mb-4 text-stone-300" />
                    <span className="text-sm font-medium text-stone-500">Faça upload de uma foto de corpo inteiro</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoSelect} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                )}

                {photoDataUrl && !isAnalyzing && (
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoSelect} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Button variant="outline" className="h-12 px-8 rounded-full border-stone-200 text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900 pointer-events-none">
                      <UploadCloud className="w-5 h-5 mr-2" /> Trocar Foto
                    </Button>
                  </div>
                )}
              </div>
            )}

            {errorText && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-medium border border-red-100">
                {errorText}
              </div>
            )}

            {/* AI Results Area */}
            {analysisResult && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Miniature Image */}
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoDataUrl!} alt="Look Analisado" className="object-cover w-full h-full" />
                    </div>
                  </div>
                  
                  {/* Rating & Summary */}
                  <div className="w-full md:w-2/3 space-y-6">
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30">
                          {analysisResult.rating}<span className="text-sm opacity-60">/10</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-lg">Avaliação Geral</h3>
                          <div className="flex text-amber-400">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= Math.round(analysisResult.rating / 2) ? "fill-current" : "text-stone-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-stone-600 font-light leading-relaxed italic">
                        "{analysisResult.summary}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
                        <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" /> Pontos Fortes
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.strengths.map((str, i) => (
                            <li key={i} className="text-emerald-700/80 text-sm font-medium flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-3 bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                        <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 uppercase tracking-wider">
                          <Target className="w-4 h-4" /> Oportunidades
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.improvements.map((imp, i) => (
                            <li key={i} className="text-amber-700/80 text-sm font-medium flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-2">
                     <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" /> Harmonia de Cores
                     </h4>
                     <p className="text-sm text-stone-600 leading-relaxed">
                       {analysisResult.color_harmony}
                     </p>
                   </div>
                   <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-3">
                     <h4 className="text-sm font-bold text-stone-900">Ocasiões Recomendadas</h4>
                     <div className="flex flex-wrap gap-2">
                       {analysisResult.recommended_occasions.map((occ, i) => (
                         <span key={i} className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 shadow-sm">
                           {occ}
                         </span>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
            )}
          </CardContent>

          {!analysisResult && (
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !photoDataUrl}
                className="w-full h-14 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xl shadow-stone-200 transition-all disabled:opacity-50 text-lg group"
              >
                {isAnalyzing ? (
                  <>Processando na IA...</>
                ) : (
                  <>
                    Analisar Look <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </Button>
            </CardFooter>
          )}

          {analysisResult && (
             <CardFooter className="p-8 pt-0 flex gap-4 bg-stone-50/50 border-t border-stone-100 mt-4 rounded-b-[2.5rem]">
               <Button variant="outline" onClick={() => setAnalysisResult(null)} className="h-12 flex-1 rounded-full border-stone-200 font-medium">
                 Analisar Outro
               </Button>
               <Button onClick={() => setIsOpen(false)} className="h-12 flex-1 rounded-full bg-primary hover:bg-primary/90 font-bold">
                 Concluir
               </Button>
             </CardFooter>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  )
}
