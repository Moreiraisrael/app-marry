"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { clientsCount: 0, appointmentsCount: 0 }

    // Contagem de Clientes
    const { count: clientsCount, error: clientsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'client')
      .eq('consultant_id', user.id)

    // Contagem de Agendamentos Futuros
    const { count: appointmentsCount, error: apptsError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('consultant_id', user.id)
      .gte('start_time', new Date().toISOString())

    return {
      clientsCount: clientsCount || 0,
      appointmentsCount: appointmentsCount || 0,
      goalsPercentage: 0, // Mock por enquanto
      messagesCount: 0    // Mock por enquanto
    }
  } catch (e) {
    console.error('Error in getDashboardStats:', e)
    return { clientsCount: 0, appointmentsCount: 0, goalsPercentage: 0, messagesCount: 0 }
  }
}
