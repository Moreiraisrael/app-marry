"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, ImagePlus, User, Loader2, Sparkles } from "lucide-react"
import { Profile } from "@/types/database"
import { getClients } from "@/lib/actions/clients"
import { createColorAnalysisRequest } from "@/lib/actions/color-analysis"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewAnalysisDialogProps {
  trigger?: React.ReactNode
}

export function NewAnalysisDialog({ trigger }: NewAnalysisDialogProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Profile[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Arquivo e Imagem em Base64 preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    if (open && clients.length === 0) {
      loadClients()
    }
  }, [open, clients.length])

  async function loadClients() {
    setLoading(true)
    const data = await getClients()
    setClients(data)
    if (data.length > 0) {
      setSelectedClientId(data[0].id)
    }
    setLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedClientId || !selectedFile) return

    setSubmitting(true)
    
    try {
      const supabase = createClient()
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${selectedClientId}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('color-analysis')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('color-analysis')
        .getPublicUrl(fileName)

      const result = await createColorAnalysisRequest({
        client_id: selectedClientId,
        client_photo: publicUrl,
        additional_photos: []
      })

      if (result) {
        setOpen(false)
        setPreviewImage(null)
        setSelectedFile(null)
        setSelectedClientId("")
        router.refresh()
      } else {
        throw new Error("Erro ao salvar a análise no banco.")
      }
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Erro ao criar análise. Verifique sua conexão e tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-[1.5rem] shadow-xl shadow-primary/20 gap-3 border-none group transition-all w-full md:w-auto">
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Nova Análise Digital</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 border-none shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">Nova Análise</DialogTitle>
          <DialogDescription>
            Selecione uma cliente e envie a foto para processamento da Inteligência Visual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-select" className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Cliente
            </Label>
            {loading ? (
              <div className="h-10 border rounded-xl flex items-center px-3 text-sm text-muted-foreground bg-secondary/50">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando...
              </div>
            ) : (
              <select 
                id="client-select"
                value={selectedClientId} 
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-12 rounded-xl border border-stone-200 bg-background px-3 text-sm outline-none focus:border-primary/50"
              >
                {clients.length === 0 && <option disabled value="">Nenhuma cliente encontrada</option>}
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Foto Rosto Frontal
            </Label>
            <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              previewImage ? 'border-primary/50 bg-primary/5' : 'border-stone-200 hover:border-primary/30 hover:bg-stone-50'
            }`}>
              {previewImage ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <Label htmlFor="picture-upload" className="cursor-pointer text-xs font-bold text-primary hover:underline">
                    Trocar Foto
                  </Label>
                </div>
              ) : (
                <Label htmlFor="picture-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full space-y-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">Clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG com boa iluminação natural</p>
                  </div>
                </Label>
              )}
              <input 
                id="picture-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 p-0 border-none bg-transparent">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button 
            disabled={!selectedFile || !selectedClientId || submitting} 
            onClick={handleSubmit}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white min-w-[120px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Processo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
