"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { requestWithdrawal } from "@/lib/actions/orders"
import { toast } from "sonner"
import { Sparkles, DollarSign } from "lucide-react"

interface WithdrawalButtonProps {
  balance: number
}

export function WithdrawalButton({ balance }: WithdrawalButtonProps) {
  const [isPending, setIsPending] = useState(false)

  const handleWithdrawal = async () => {
    if (balance <= 0) {
      toast.error("Você não possui saldo disponível para saque.")
      return
    }

    setIsPending(true)
    const result = await requestWithdrawal()

    if (result.success) {
      toast.success("Solicitação de saque enviada com sucesso! Em breve o valor estará em sua conta.")
    } else {
      toast.error(result.error || "Erro ao solicitar saque.")
    }
    setIsPending(false)
  }

  return (
    <Button 
      onClick={handleWithdrawal}
      disabled={isPending || balance <= 0}
      className={`h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none font-bold uppercase tracking-[0.2em] text-[10px] gap-2 ${
        balance <= 0 ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isPending ? (
        <Sparkles className="w-4 h-4 animate-spin" />
      ) : (
        <DollarSign className="w-4 h-4" />
      )}
      Solicitar Saque
    </Button>
  )
}
