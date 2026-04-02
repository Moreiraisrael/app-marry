"use server"

import { createClient } from "@/lib/supabase/server"
import { Profile, ColorAnalysisRequest } from "@/types/database"

export async function getDashboardStats(): Promise<{
  clientsCount: number;
  appointmentsCount: number;
  goalsPercentage: number;
  messagesCount: number;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { clientsCount: 0, appointmentsCount: 0, goalsPercentage: 0, messagesCount: 0 }

    // Contagem de Clientes
    const { count: clientsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'client')
      .eq('consultant_id', user.id)

    // Contagem de Agendamentos Futuros
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('consultant_id', user.id)
      .gte('start_time', new Date().toISOString())

    return {
      clientsCount: clientsCount || 0,
      appointmentsCount: appointmentsCount || 0,
      goalsPercentage: 0,
      messagesCount: 0
    }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error in getDashboardStats:', e)
    return { 
      clientsCount: 0, 
      appointmentsCount: 0, 
      goalsPercentage: 0, 
      messagesCount: 0 
    }
  }
}

export async function getClientDashboard(): Promise<{
  profile: Profile | null;
  wardrobeCount: number;
  colorAnalysis: ColorAnalysisRequest | null;
  level: string;
  styleProgress: number;
} | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Perfil completo
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Contagem de itens no guarda-roupa
    const { count: wardrobeCount } = await supabase
      .from('wardrobe_items')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)

    // Última análise de cores
    const { data: colorAnalysis } = await supabase
      .from('color_analysis_requests')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      profile,
      wardrobeCount: wardrobeCount || 0,
      colorAnalysis: colorAnalysis || null,
      level: 'Elegância em Construção',
      styleProgress: 45
    }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error in getClientDashboard:', e)
    return null
  }
}
