'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getVisagismRequests } from '@/lib/actions/visagism'
import VisagismItem from '@/components/visagism/VisagismItem'
import { Loader2, RefreshCcw, Sparkles } from 'lucide-react'

export default function VisagismoPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await getVisagismRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load visagism requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-5xl font-outfit font-light tracking-tight text-white flex items-center gap-3">
            Métricas de Visagismo <Sparkles className="text-brand-beige" />
          </h1>
          <button 
            onClick={fetchRequests}
            className="p-2 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
        <p className="text-zinc-400 font-inter max-w-2xl text-lg">
          Transforme os pontos centrais do rosto da cliente em guias precisos de óculos, cortes de cabelo e maquiagem por meio de IA.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-brand-beige">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <AnimatePresence>
          {requests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-2xl"
            >
              <Sparkles size={48} className="text-zinc-800 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2 font-outfit">Nenhum scan pendente</h3>
              <p className="text-zinc-500 max-w-md">As métricas de simetria facial aparecerão aqui quando suas clientes enviarem suas fotos.</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              
              {/* Pendentes */}
              <section>
                <h2 className="text-xl font-outfit text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-beige"></span>
                  Rostos Aguardando Scan ({pendingRequests.length})
                </h2>
                <div className="space-y-6">
                  {pendingRequests.length === 0 && (
                    <p className="text-sm text-zinc-600">Nenhum pedido pendente na fila.</p>
                  )}
                  {pendingRequests.map(req => (
                    <VisagismItem key={req.id} request={req} onUpdate={fetchRequests} />
                  ))}
                </div>
              </section>

              {/* Aprovados */}
              {approvedRequests.length > 0 && (
                <section>
                  <h2 className="text-xl font-outfit text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Mapeamentos Concluídos ({approvedRequests.length})
                  </h2>
                  <div className="space-y-6 opacity-75 hover:opacity-100 transition-opacity">
                    {approvedRequests.map(req => (
                      <VisagismItem key={req.id} request={req} onUpdate={fetchRequests} />
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </AnimatePresence>
      )}

    </div>
  )
}
