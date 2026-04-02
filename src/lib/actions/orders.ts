"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Order {
  id: string
  external_order_id: string
  client_name: string | null
  amount: number
  commission: number
  status: 'pending' | 'completed' | 'cancelled'
  withdrawal_status: 'available' | 'requested' | 'withdrawn'
  created_at: string
}

export async function getOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('consultant_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return data as Order[]
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getOrders:', e)
    return []
  }
}

export async function getOrdersSummary(): Promise<{
  availableBalance: number;
  totalOrders: number;
  pendingOrders: number;
  conversionRate: string;
}> {
  try {
    const orders = await getOrders()
    
    const availableBalance = orders
      .filter(o => o.status === 'completed' && o.withdrawal_status === 'available')
      .reduce((acc, o) => acc + Number(o.commission), 0)

    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    
    // Média de conversão fictícia ou baseada em cliques (se tivéssemos a tabela de cliques)
    // Para agora, vamos usar um valor fixo ou calculado proporcionalmente
    const conversionRate = totalOrders > 0 ? ((orders.filter(o => o.status === 'completed').length / totalOrders) * 100).toFixed(1) : "0.0"

    return {
      availableBalance,
      totalOrders,
      pendingOrders,
      conversionRate
    }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error calculating orders summary:', e)
    return {
      availableBalance: 0,
      totalOrders: 0,
      pendingOrders: 0,
      conversionRate: "0.0"
    }
  }
}

export async function requestWithdrawal(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Usuário não autenticado." }

    // Atualiza todos os pedidos com comissão 'available' para 'requested'
    const { error } = await supabase
      .from('orders')
      .update({ withdrawal_status: 'requested' })
      .eq('consultant_id', user.id)
      .eq('status', 'completed')
      .eq('withdrawal_status', 'available')

    if (error) {
      console.error('Error requesting withdrawal:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/consultant/orders')
    return { success: true }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in requestWithdrawal:', e)
    return { success: false, error: "Falha na conexão com o servidor." }
  }
}
