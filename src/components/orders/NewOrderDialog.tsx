"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createOrder } from "@/lib/actions/orders"
import { toast } from "sonner"

export function NewOrderDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Converte os valores pt-BR (ex: 150,00) para número float
    const amountStr = formData.get("amount") as string
    const commissionStr = formData.get("commission") as string
    
    const amount = parseFloat(amountStr.replace(/\./g, "").replace(",", "."))
    const commission = parseFloat(commissionStr.replace(/\./g, "").replace(",", "."))

    if (isNaN(amount) || isNaN(commission)) {
      toast.error("Valores inválidos. Use o formato 0,00")
      setIsSubmitting(false)
      return
    }

    const res = await createOrder({
      client_name: formData.get("client_name") as string,
      external_order_id: formData.get("external_order_id") as string,
      amount,
      commission,
      status: formData.get("status") as "pending" | "completed",
      withdrawal_status: "available"
    })

    setIsSubmitting(false)

    if (res.success) {
      toast.success("Venda registrada com sucesso!")
      setIsOpen(false)
    } else {
      toast.error(res.error || "Erro ao registrar venda.")
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 font-bold tracking-wide shadow-lg shadow-primary/20"
      >
        <Plus className="w-5 h-5 mr-2" /> Registrar Venda
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-6"
            >
              <div className="bg-card border border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-primary/5 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Nova Venda</h2>
                    <p className="text-sm text-muted-foreground mt-1">Insira os dados da transação manualmente.</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">Nome/Referência da Cliente</label>
                    <Input 
                      name="client_name" 
                      required 
                      placeholder="Ex: Maria Clara" 
                      className="h-12 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">ID da Transação (Opcional)</label>
                    <Input 
                      name="external_order_id" 
                      placeholder="Ex: HOTMART-1234" 
                      className="h-12 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">Valor Total (R$)</label>
                      <Input 
                        name="amount" 
                        required 
                        placeholder="0,00" 
                        className="h-12 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">Comissão (R$)</label>
                      <Input 
                        name="commission" 
                        required 
                        placeholder="0,00" 
                        className="h-12 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">Status do Pagamento</label>
                    <select 
                      name="status"
                      aria-label="Status do Pagamento"
                      title="Status do Pagamento" 
                      className="w-full h-12 px-3 bg-background/50 border border-primary/10 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm text-foreground appearance-none"
                    >
                      <option value="pending">Processando (Ainda a receber)</option>
                      <option value="completed">Concluído (Valor já recebido/disponível)</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-12 rounded-2xl hover:bg-primary/5">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Venda"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
