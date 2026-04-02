"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash2, ShoppingBag, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Profile } from "@/types/database"
import { createShoppingList } from "@/lib/actions/shopping-lists"

interface CreateShoppingListModalProps {
  clients: Profile[]
}

interface ShoppingItem {
  name: string
  link: string
  price: string
  category: string
}

const ITEM_CATEGORIES = ["Roupa", "Calçado", "Acessório", "Bolsa", "Joia", "Outro"]

export function CreateShoppingListModal({ clients }: CreateShoppingListModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState("")
  const [title, setTitle] = useState("")
  const [items, setItems] = useState<ShoppingItem[]>([
    { name: "", link: "", price: "", category: "Roupa" }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    setSelectedClientId("")
    setTitle("")
    setItems([{ name: "", link: "", price: "", category: "Roupa" }])
    setIsDone(false)
  }

  const addItem = () => setItems(prev => [...prev, { name: "", link: "", price: "", category: "Roupa" }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof ShoppingItem, value: string) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))

  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(',', '.').replace(/[^\d.]/g, '')) || 0
    return sum + price
  }, 0)

  const handleSubmit = async () => {
    if (!selectedClientId || !title || items.some(i => !i.name)) return
    setIsSubmitting(true)

    const itemsPayload = items.map(item => ({
      name: item.name,
      link: item.link,
      price: parseFloat(item.price.replace(',', '.').replace(/[^\d.]/g, '')) || 0,
      category: item.category,
    }))

    const result = await createShoppingList({
      client_id: selectedClientId,
      title,
      items: itemsPayload,
    })

    if (result) setIsDone(true)
    setIsSubmitting(false)
  }

  const isValid = selectedClientId && title && items.every(i => i.name)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none gap-2"
      >
        <Plus className="w-5 h-5" /> Criar nova Lista
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
              <Card className="border-stone-100 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                <CardHeader className="p-7 pb-4 border-b border-stone-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl text-stone-900">
                      {isDone ? "Lista Criada!" : "Nova Lista de Compras"}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-stone-400">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-7 overflow-y-auto flex-1 space-y-6">
                  {isDone ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-stone-900">&quot;{title}&quot; enviada!</h3>
                      <p className="text-stone-500">A cliente já pode ver os itens em &quot;Vitrine Curada&quot;.</p>
                      <Button onClick={handleClose} className="bg-stone-900 text-white rounded-xl px-8 h-12 font-bold mt-4">Fechar</Button>
                    </div>
                  ) : (
                    <>
                      {/* Client select */}
                      <div className="space-y-2">
                        <label className="text-stone-600 font-medium text-sm">Cliente *</label>
                        <select
                          aria-label="Selecionar cliente para lista de compras"
                          value={selectedClientId}
                          onChange={e => setSelectedClientId(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:border-primary/50 outline-none"
                        >
                          <option value="">Selecionar cliente...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-stone-600 font-medium text-sm">Título da Lista *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Ex: Cápsula de Inverno 2025"
                          className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
                        />
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-stone-600 font-medium text-sm">Itens da Lista *</label>
                          <span className="text-xs text-stone-400">{items.length} itens · R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        {items.map((item, idx) => (
                          <div key={idx} className="border border-stone-100 rounded-2xl p-4 space-y-3 bg-stone-50/50">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={e => updateItem(idx, 'name', e.target.value)}
                                placeholder="Nome do produto *"
                                className="flex-1 h-10 px-3 rounded-xl border border-stone-200 focus:border-primary/50 outline-none text-sm"
                              />
                              {items.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(idx)}
                                  className="h-10 w-10 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={item.price}
                                onChange={e => updateItem(idx, 'price', e.target.value)}
                                placeholder="Preço (R$)"
                                className="h-10 px-3 rounded-xl border border-stone-200 focus:border-primary/50 outline-none text-sm"
                              />
                              <input
                                type="text"
                                value={item.link}
                                onChange={e => updateItem(idx, 'link', e.target.value)}
                                placeholder="Link do produto"
                                className="h-10 px-3 rounded-xl border border-stone-200 focus:border-primary/50 outline-none text-sm col-span-1"
                              />
                              <select
                                aria-label="Categoria do item"
                                value={item.category}
                                onChange={e => updateItem(idx, 'category', e.target.value)}
                                className="h-10 px-3 rounded-xl border border-stone-200 focus:border-primary/50 outline-none text-sm bg-white"
                              >
                                {ITEM_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          onClick={addItem}
                          className="w-full h-10 rounded-xl border-dashed border-stone-300 text-stone-500 hover:border-primary/40 hover:text-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar item
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>

                {!isDone && (
                  <CardFooter className="p-7 pt-0 flex gap-4 flex-shrink-0 border-t border-stone-100">
                    <Button variant="ghost" onClick={handleClose} className="flex-1 h-12 rounded-xl text-stone-500">Cancelar</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isValid}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-40"
                    >
                      {isSubmitting ? "Salvando..." : <>
                        <ShoppingBag className="w-4 h-4 mr-2" /> Criar Lista
                      </>}
                    </Button>
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
