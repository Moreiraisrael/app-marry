"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, UploadCloud, Camera, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createWardrobeItem } from "@/lib/actions/wardrobe"
import { createClient } from "@/lib/supabase/client"

interface AddWardrobeItemModalProps {
  clientId: string
  trigger?: React.ReactNode
}

export function AddWardrobeItemModal({ clientId, trigger }: AddWardrobeItemModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [category, setCategory] = useState("Top")
  const [subcategory, setSubcategory] = useState("")
  const [color, setColor] = useState("#000000")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState("")

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoDataUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!photoFile || !photoDataUrl) {
      setErrorText("A foto da peça é obrigatória.")
      return
    }

    setIsSubmitting(true)
    setErrorText("")

    const supabase = createClient()
    
    // Upload image to Supabase Storage
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${clientId}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wardrobe')
      .upload(fileName, photoFile)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      setErrorText("Erro ao fazer upload da imagem.")
      setIsSubmitting(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wardrobe')
      .getPublicUrl(fileName)

    const newItem = {
      client_id: clientId,
      category,
      subcategory,
      color,
      photo_url: publicUrl,
      status: "keep" as const,
      notes: null,
      season_match: false,
      ai_analysis: null
    }

    const result = await createWardrobeItem(newItem)

    if (result) {
      setIsOpen(false)
      // Reset form
      setPhotoDataUrl(null)
      setPhotoFile(null)
      setCategory("Top")
      setSubcategory("")
      setColor("#000000")
    } else {
      setErrorText("Ocorreu um erro ao salvar a peça.")
    }

    setIsSubmitting(false)
  }

  const triggerElement = trigger ? (
    <div 
      onClick={() => {
        console.log("Abrindo modal de Wardrobe Item");
        setIsOpen(true);
      }} 
      className="inline-block cursor-pointer"
    >
      {trigger}
    </div>
  ) : (
    <Button 
      onClick={() => setIsOpen(true)}
      className="h-16 w-16 bg-stone-900 hover:bg-stone-800 text-white rounded-[1.5rem] shadow-2xl shadow-stone-200 transition-all flex items-center justify-center p-0"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {triggerElement}

      {mounted && typeof document !== "undefined" && React.createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg z-10"
              >
              <Card className="border-stone-200 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-stone-100">
                  <CardTitle className="font-serif text-2xl text-stone-900">Cadastrar Peça</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100">
                    <X className="w-5 h-5" />
                  </Button>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                  {/* Photo Upload Area */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {photoDataUrl ? (
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoDataUrl} alt="Preview da peça" className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400">
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Sem foto</span>
                      </div>
                    )}

                    <div className="relative">
                      <label htmlFor="wardrobe-photo-upload" className="sr-only">Selecionar foto da peça</label>
                      <input 
                        id="wardrobe-photo-upload"
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoSelect} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <Button variant="outline" className="h-10 px-6 rounded-xl border-stone-200 text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900 pointer-events-none">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        {photoDataUrl ? 'Trocar Foto' : 'Tirar Foto'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="wardrobe-category" className="text-stone-600 font-medium">Categoria da Peça</Label>
                       <select 
                         id="wardrobe-category"
                         value={category} 
                         onChange={(e) => setCategory(e.target.value)}
                         aria-label="Categoria da peça"
                         className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none transition-all"
                       >
                         <option value="Top">Parte de Cima</option>
                         <option value="Bottom">Parte de Baixo</option>
                         <option value="OnePiece">Peça Única</option>
                         <option value="Shoes">Sapatos</option>
                         <option value="Accessories">Acessórios</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="wardrobe-subcategory" className="text-stone-600 font-medium">Descrição Curta (ex: Camisa de Linho)</Label>
                       <input 
                         id="wardrobe-subcategory"
                         type="text" 
                         value={subcategory}
                         onChange={(e) => setSubcategory(e.target.value)}
                         placeholder="Descreva a peça..."
                         aria-label="Descrição da peça"
                         className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none transition-all"
                       />
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="wardrobe-color" className="text-stone-600 font-medium">Cor Predominante</Label>
                       <div className="flex gap-4 items-center">
                         <input 
                           id="wardrobe-color"
                           type="color" 
                           value={color}
                           onChange={(e) => setColor(e.target.value)}
                           aria-label="Selecionar cor predominante"
                           className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0"
                         />
                         <span className="text-stone-500 font-medium">{color}</span>
                       </div>
                    </div>
                  </div>

                  {errorText && (
                    <p className="text-red-500 text-sm font-medium pt-2">{errorText}</p>
                  )}
                </CardContent>

                <CardFooter className="p-8 pt-0 flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)} 
                    className="flex-1 h-12 rounded-xl text-stone-500 hover:text-stone-900"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !photoDataUrl}
                    className="flex-1 h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-xl shadow-stone-200 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Peça'} 
                    {!isSubmitting && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
