"use client"

import React, { useState, useEffect } from "react"
import { Plus, X, Save, Trash2, GripVertical, Settings2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getQuizConfigurations, saveQuizConfiguration, QuizConfiguration } from "@/lib/actions/quizzes"
import { QuizType } from "@/types/database"
import { toast } from "sonner"

interface ConfigureTestsModalProps {
  trigger?: React.ReactNode
}

interface Question {
  id: string
  text: string
  options: string[]
}

export function ConfigureTestsModal({ trigger }: ConfigureTestsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<QuizType>('style')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // State for all 3 quizzes
  const [styleQuestions, setStyleQuestions] = useState<Question[]>([])
  const [archetypeQuestions, setArchetypeQuestions] = useState<Question[]>([])
  const [colorQuestions, setColorQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (isOpen) {
      loadConfigurations()
    }
  }, [isOpen])

  const loadConfigurations = async () => {
    setIsLoading(true)
    const configs = await getQuizConfigurations()
    
    // Reset to defaults
    setStyleQuestions([])
    setArchetypeQuestions([])
    setColorQuestions([])

    // Populate from DB
    configs.forEach(config => {
      if (config.quiz_type === 'style') setStyleQuestions(config.questions || [])
      if (config.quiz_type === 'archetype') setArchetypeQuestions(config.questions || [])
      if (config.quiz_type === 'color') setColorQuestions(config.questions || [])
    })
    
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      let currentQuestions: Question[] = []
      if (activeTab === 'style') currentQuestions = styleQuestions
      if (activeTab === 'archetype') currentQuestions = archetypeQuestions
      if (activeTab === 'color') currentQuestions = colorQuestions

      // Simple validation
      const validQuestions = currentQuestions.filter(q => q.text.trim() !== '' && q.options.some(o => o.trim() !== ''))

      const result = await saveQuizConfiguration(activeTab, validQuestions)
      
      if (result.success) {
        toast.success("Configurações salvas com sucesso!")
        setIsOpen(false)
      } else {
        toast.error(result.error || "Erro ao salvar as configurações.")
      }
    } catch (error) {
      console.error("Error calling saveQuizConfiguration:", error)
      toast.error("Ocorreu um erro inesperado ao salvar.")
    } finally {
      setIsSaving(false)
    }
  }

  const getActiveQuestions = () => {
    if (activeTab === 'style') return styleQuestions
    if (activeTab === 'archetype') return archetypeQuestions
    return colorQuestions
  }

  const setActiveQuestions = (newQuestions: Question[]) => {
    if (activeTab === 'style') setStyleQuestions(newQuestions)
    if (activeTab === 'archetype') setArchetypeQuestions(newQuestions)
    if (activeTab === 'color') setColorQuestions(newQuestions)
  }

  const addQuestion = () => {
    const newQ: Question = { id: crypto.randomUUID(), text: '', options: ['', ''] }
    setActiveQuestions([...getActiveQuestions(), newQ])
  }

  const removeQuestion = (id: string) => {
    setActiveQuestions(getActiveQuestions().filter(q => q.id !== id))
  }

  const updateQuestionText = (id: string, text: string) => {
    setActiveQuestions(getActiveQuestions().map(q => q.id === id ? { ...q, text } : q))
  }

  const addOption = (questionId: string) => {
    setActiveQuestions(getActiveQuestions().map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setActiveQuestions(getActiveQuestions().map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions.splice(optionIndex, 1)
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const updateOptionText = (questionId: string, optionIndex: number, text: string) => {
    setActiveQuestions(getActiveQuestions().map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = text
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2 transition-all">
            <Settings2 className="w-4 h-4" /> Configurar Testes
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 border-none bg-background shadow-2xl rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-8 pb-4 border-b border-border/50 bg-card/50">
          <DialogTitle className="font-serif text-2xl text-foreground flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-primary" />
            Configuração de Quizzes
          </DialogTitle>
          <p className="text-muted-foreground text-sm font-light">
            Crie e personalize as perguntas que suas clientes responderão nos diferentes diagnósticos.
          </p>
        </DialogHeader>

        <Tabs 
          defaultValue="style" 
          value={activeTab} 
          onValueChange={(val) => setActiveTab(val as QuizType)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-8 pt-4">
            <TabsList className="grid grid-cols-3 w-full h-12 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="style" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium">
                Teste de Estilo
              </TabsTrigger>
              <TabsTrigger value="archetype" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium">
                Arquétipos
              </TabsTrigger>
              <TabsTrigger value="color" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium">
                Coloração
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-8 pb-20">
                {getActiveQuestions().length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-border rounded-3xl bg-muted/20">
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma pergunta configurada</h3>
                    <p className="text-muted-foreground mb-6 text-sm">Adicione perguntas para personalizar este diagnóstico.</p>
                    <Button onClick={addQuestion} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Pergunta
                    </Button>
                  </div>
                ) : (
                  getActiveQuestions().map((q, index) => (
                    <Card key={q.id} className="border-border/50 shadow-sm rounded-2xl overflow-hidden group">
                      <div className="bg-muted/30 px-6 py-4 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-move" />
                          <span className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Pergunta {index + 1}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeQuestion(q.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 -mr-2 h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                          <Label className="text-foreground font-medium">Enunciado da Pergunta</Label>
                          <input 
                            value={q.text}
                            onChange={(e) => updateQuestionText(q.id, e.target.value)}
                            placeholder="Ex: Como você prefere se vestir no dia a dia?"
                            className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-foreground font-medium">Opções de Resposta</Label>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <input 
                                value={opt}
                                onChange={(e) => updateOptionText(q.id, optIndex, e.target.value)}
                                placeholder={`Opção ${optIndex + 1}`}
                                className="flex-1 h-10 px-4 rounded-lg border border-input/50 bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeOption(q.id, optIndex)}
                                disabled={q.options.length <= 2}
                                className="h-10 w-10 text-muted-foreground hover:text-red-500 rounded-lg shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addOption(q.id)}
                            className="mt-2 text-xs border-dashed text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar Opção
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {getActiveQuestions().length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={addQuestion} 
                    className="w-full h-14 border-dashed border-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Nova Pergunta
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-border/50 bg-card/50 flex justify-between items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Salvando as configurações apenas para o teste atual ({activeTab === 'style' ? 'Estilo' : activeTab === 'archetype' ? 'Arquétipos' : 'Coloração'}).
            </span>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)} 
                className="h-12 px-6 rounded-xl text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || isLoading}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar Diagnóstico'} 
                {!isSaving && <Save className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
