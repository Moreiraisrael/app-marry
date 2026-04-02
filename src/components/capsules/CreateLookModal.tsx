"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WardrobeItem, Profile } from "@/types/database"
import { createLookCapsule } from "@/lib/actions/capsules"
import Image from "next/image"

interface CreateLookModalProps {
  clients: Profile[]
  clientWardrobeItems: Record<string, WardrobeItem[]>
}

const OCCASIONS = ["Trabalho", "Social", "Casual", "Evento", "Esporte", "Viagem"]

export function CreateLookModal({ clients, clientWardrobeItems }: CreateLookModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [lookName, setLookName] = useState("")
  const [occasion, setOccasion] = useState("")
  const [description, setDescription] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const selectedClient = clients.find(c => c.id === selectedClientId)
  const availableItems = selectedClientId ? (clientWardrobeItems[selectedClientId] || []) : []

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleClose = () => {
    setIsOpen(false)
    setStep(1)
    setSelectedClientId("")
    setSelectedItemIds([])
    setLookName("")
    setOccasion("")
    setDescription("")
    setIsDone(false)
  }

  const handleSubmit = async () => {
    if (!selectedClientId || selectedItemIds.length === 0 || !lookName) return
    setIsSubmitting(true)

    const result = await createLookCapsule({
      client_id: selectedClientId,
      name: lookName,
      item_ids: selectedItemIds,
      occasion: occasion || null,
      description: description || null,
    })

    if (result) setIsDone(true)
    setIsSubmitting(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.25rem] px-8 shadow-xl shadow-primary/20 border-none gap-3 group transition-all"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        <span className="font-bold">Montar Novo Look</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-2xl z-10 max-h-[90vh] flex flex-col"
            >
              <Card className="border-stone-100 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                <CardHeader className="p-8 pb-4 border-b border-stone-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Style Architect</span>
                      </div>
                      <CardTitle className="font-serif text-2xl text-stone-900">
                        {isDone ? "Look Criado!" : step === 1 ? "Selecionar Cliente" : step === 2 ? "Selecionar Peças" : "Detalhes do Look"}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-stone-400">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {!isDone && (
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-stone-100'}`} />
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-8 overflow-y-auto flex-1">
                  {isDone ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-stone-900">Look &quot;{lookName}&quot; salvo!</h3>
                      <p className="text-stone-500">A cliente já pode visualizar em &quot;Meus Looks&quot;.</p>
                      <Button onClick={handleClose} className="bg-stone-900 text-white rounded-xl px-8 h-12 font-bold mt-4">
                        Fechar
                      </Button>
                    </div>
                  ) : step === 1 ? (
                    <div className="space-y-3">
                      {clients.length === 0 ? (
                        <p className="text-stone-400 text-center py-8">Nenhuma cliente cadastrada.</p>
                      ) : (
                        clients.map(client => (
                          <button
                            key={client.id}
                            onClick={() => { setSelectedClientId(client.id); setSelectedItemIds([]) }}
                            className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                              selectedClientId === client.id
                                ? 'border-primary bg-primary/5'
                                : 'border-stone-100 hover:border-stone-200 bg-white'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-lg">
                              {(client.full_name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">{client.full_name}</p>
                              <p className="text-xs text-stone-400">{client.email}</p>
                            </div>
                            {selectedClientId === client.id && (
                              <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  ) : step === 2 ? (
                    <div className="space-y-4">
                      {availableItems.length === 0 ? (
                        <div className="text-center py-12 text-stone-400">
                          <p className="font-medium">Esta cliente ainda não tem peças no closet.</p>
                          <p className="text-sm mt-2">Peça que ela cadastre itens em &quot;Guarda-Roupa Virtual&quot;.</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-stone-500 mb-4">
                            {selectedItemIds.length} de {availableItems.length} peças selecionadas
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            {availableItems.map(item => {
                              const isSelected = selectedItemIds.includes(item.id)
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleItem(item.id)}
                                  className={`relative aspect-square rounded-2xl overflow-hidden border-3 transition-all ${
                                    isSelected ? 'ring-3 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <Image
                                    src={item.photo_url}
                                    alt={item.subcategory || item.category || "Peça"}
                                    fill
                                    className="object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2">
                                    <p className="text-white text-[10px] font-bold truncate">{item.category}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Preview das peças selecionadas */}
                      {selectedItemIds.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableItems
                            .filter(i => selectedItemIds.includes(i.id))
                            .map(item => (
                              <div key={item.id} className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                                <Image src={item.photo_url} alt={item.category || ""} fill className="object-cover" />
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-stone-600 font-medium text-sm">Nome do Look *</label>
                        <input
                          type="text"
                          value={lookName}
                          onChange={e => setLookName(e.target.value)}
                          placeholder="Ex: Look de Segunda-Feira"
                          className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-stone-600 font-medium text-sm">Ocasião</label>
                        <div className="flex flex-wrap gap-2">
                          {OCCASIONS.map(occ => (
                            <Badge
                              key={occ}
                              onClick={() => setOccasion(occ === occasion ? "" : occ)}
                              className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                occasion === occ
                                  ? 'bg-primary text-white'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {occ}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-stone-600 font-medium text-sm">Orientação da Consultora (opcional)</label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="Diga como combinar este look, quais acessórios usar..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                {!isDone && (
                  <CardFooter className="p-8 pt-0 flex gap-4 flex-shrink-0 border-t border-stone-100">
                    <Button
                      variant="ghost"
                      onClick={step === 1 ? handleClose : () => setStep(s => s - 1)}
                      className="flex-1 h-12 rounded-xl text-stone-500"
                    >
                      {step === 1 ? "Cancelar" : <><ChevronLeft className="w-4 h-4 mr-1" /> Voltar</>}
                    </Button>

                    {step < 3 ? (
                      <Button
                        onClick={() => setStep(s => s + 1)}
                        disabled={
                          (step === 1 && !selectedClientId) ||
                          (step === 2 && selectedItemIds.length === 0)
                        }
                        className="flex-1 h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold disabled:opacity-40"
                      >
                        Próximo <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !lookName}
                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-40"
                      >
                        {isSubmitting ? "Salvando..." : "Salvar Look"} <CheckCircle2 className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
