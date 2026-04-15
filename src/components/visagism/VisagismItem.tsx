'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Camera, Sparkles, Edit3 } from 'lucide-react'
import { analyzeVisagismWithAI, approveVisagism } from '@/lib/actions/visagism'
import { toast } from 'sonner'
import Image from 'next/image'

interface VisagismItemProps {
  request: any
  onUpdate: () => void
}

const FACE_SHAPES = ['Oval', 'Redondo', 'Quadrado', 'Coração', 'Diamante', 'Longo', 'Triangular']

export default function VisagismItem({ request, onUpdate }: VisagismItemProps) {
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  
  const [selectedShape, setSelectedShape] = useState<string>(
    request.consultant_shape || request.ai_suggested_shape || ''
  )
  const [upperThird, setUpperThird] = useState(request.ai_analysis_data?.facial_measurements?.upperThird || '')
  const [middleThird, setMiddleThird] = useState(request.ai_analysis_data?.facial_measurements?.middleThird || '')
  const [lowerThird, setLowerThird] = useState(request.ai_analysis_data?.facial_measurements?.lowerThird || '')
  const [notes, setNotes] = useState(request.consultant_notes || '')

  const handleRunAI = async () => {
    setIsProcessingAI(true)
    const toastId = toast.loading('Motor de IA mapeando terços faciais...')
    
    try {
      const result = await analyzeVisagismWithAI(request.id)
      
      if (result) {
        toast.success('Mapeamento facial concluído com sucesso!', { id: toastId })
        setSelectedShape(result.shape)
        // @ts-ignore
        setUpperThird(result.data.facial_measurements.upperThird)
        // @ts-ignore
        setMiddleThird(result.data.facial_measurements.middleThird)
        // @ts-ignore
        setLowerThird(result.data.facial_measurements.lowerThird)
        setNotes(result.data.observations || '')
        onUpdate()
      } else {
        toast.error('Não foi possível realizar a análise. Tente novamente.', { id: toastId })
      }
    } catch (error) {
      toast.error('Erro de conexão ao rodar IA.', { id: toastId })
    } finally {
      setIsProcessingAI(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedShape) {
      toast.error('Selecione um Formato de Rosto para aprovar.')
      return
    }

    setIsApproving(true)
    const toastId = toast.loading('Aprovando simetria facial no perfil...')

    try {
      const measurements = { 
        upperThird: Number(upperThird), 
        middleThird: Number(middleThird), 
        lowerThird: Number(lowerThird) 
      }
      
      const res = await approveVisagism(request.id, selectedShape, measurements, notes)
      
      if (res.success) {
        toast.success(`Dossiê Visagista de ${request.profiles?.full_name} aprovado!`, { id: toastId })
        onUpdate()
      } else {
        toast.error('Erro ao aprovar visagismo.', { id: toastId })
      }
    } catch (error) {
      toast.error('Erro de sistema.', { id: toastId })
    } finally {
      setIsApproving(false)
    }
  }

  const isApproved = request.status === 'approved'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border p-6 rounded-xl transition-all duration-300 ${
        isApproved ? 'bg-zinc-900 border-zinc-800' : 'bg-black border-zinc-800 shadow-xl'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Col - Photos */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit text-xl font-medium tracking-wide text-white">
                {request.profiles?.full_name || 'Cliente'}
              </h3>
              <p className="text-sm text-zinc-500 font-inter">{request.profiles?.email}</p>
            </div>
            {isApproved && (
              <span className="px-3 py-1 bg-green-950/40 text-green-400 text-xs rounded-full border border-green-900/50 font-medium">
                Sincronizado
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="relative aspect-square w-1/2 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
              {request.front_face_photo ? (
                <Image src={request.front_face_photo} alt="Rosto Frente" fill className="object-cover object-top" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                  <Camera size={24} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">Frente</div>
            </div>
            
            <div className="relative aspect-square w-1/2 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
              {request.side_face_photo ? (
                <Image src={request.side_face_photo} alt="Rosto Perfil" fill className="object-cover object-top" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                  <Camera size={24} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">Perfil</div>
            </div>
          </div>
        </div>

        {/* Right Col - Data & Actions */}
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          
          <div className="space-y-6">
            {!request.ai_suggested_shape && !isApproved ? (
              <div className="flex flex-col items-center justify-center h-40 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/50">
                <Sparkles className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-inter text-sm mb-4">Aguardando mapeamento métrico da face</p>
                <button
                  onClick={handleRunAI}
                  disabled={isProcessingAI}
                  className="px-6 py-2 bg-white text-black font-medium text-sm rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 font-inter"
                >
                  {isProcessingAI ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {isProcessingAI ? 'Gerando pontos...' : 'Rodar Scanner IA'}
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Motor de IA sugeriu:</label>
                      <div className="text-white font-medium bg-zinc-900 px-4 py-2 rounded border border-zinc-800 font-inter flex items-center gap-2">
                         <Sparkles size={14} className="text-brand-beige"/> {request.ai_suggested_shape || 'Não rodado'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-brand-beige uppercase tracking-wider mb-2 block">Formato Aprovado:</label>
                      <select 
                        disabled={isApproved}
                        className="w-full bg-zinc-900 text-white font-medium px-4 py-2 rounded border border-zinc-700 outline-none focus:border-brand-beige transition-colors disabled:opacity-50"
                        value={selectedShape}
                        onChange={(e) => setSelectedShape(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {FACE_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Terços Faciais (%) <Edit3 size={12} />
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block mb-1">SUPERIOR</span>
                        <input 
                          type="number" 
                          disabled={isApproved}
                          className="bg-transparent text-white w-full outline-none font-medium text-lg placeholder-zinc-700 disabled:opacity-50" 
                          placeholder="33"
                          value={upperThird}
                          onChange={(e) => setUpperThird(e.target.value)}
                        />
                      </div>
                      <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block mb-1">MÉDIO</span>
                        <input 
                          type="number" 
                          disabled={isApproved}
                          className="bg-transparent text-white w-full outline-none font-medium text-lg placeholder-zinc-700 disabled:opacity-50" 
                          placeholder="33"
                          value={middleThird}
                          onChange={(e) => setMiddleThird(e.target.value)}
                        />
                      </div>
                      <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block mb-1">INFERIOR</span>
                        <input 
                          type="number" 
                          disabled={isApproved}
                          className="bg-transparent text-white w-full outline-none font-medium text-lg placeholder-zinc-700 disabled:opacity-50" 
                          placeholder="33"
                          value={lowerThird}
                          onChange={(e) => setLowerThird(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Dicas Constritivas de Corte e Acessório</label>
                    <textarea 
                      disabled={isApproved}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Franja lateral indicada para suavizar ângulos do maxilar..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-300 outline-none focus:border-brand-beige transition-colors disabled:opacity-50 h-20 resize-none font-inter"
                    />
                  </div>
                </div>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            {!isApproved ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || !request.ai_suggested_shape}
                className="px-8 py-3 bg-brand-beige text-black uppercase tracking-widest font-semibold text-xs rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isApproving ? 'Salvando...' : 'Aprovar e Enviar p/ Cliente'}
                {!isApproving && <Check size={16} />}
              </button>
            ) : (
              <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Disponível no Dossiê da Conta
              </p>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
