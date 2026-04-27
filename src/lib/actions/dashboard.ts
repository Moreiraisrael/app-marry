"use server"

import { createClient } from "@/lib/supabase/server"
import { Profile, ColorAnalysisRequest, Appointment } from "@/types/database"

export type DashboardActivity = {
  id: string;
  type: 'color' | 'quiz' | 'appointment' | 'biotype' | 'visagism';
  title: string;
  clientName: string;
  clientId: string;
  date: string;
  status: string;
  href: string;
}

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
      
    // Obter clientes da consultora para filtrar pendências com segurança
    const { data: clients } = await supabase.from('profiles').select('id').eq('consultant_id', user.id)
    const clientIds = clients ? clients.map(c => c.id) : []

    let pendingCount = 0;
    if (clientIds.length > 0) {
      const { count: quizzesPending } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).in('client_id', clientIds).eq('status', 'pending')
      const { count: colorsPending } = await supabase.from('color_analysis_requests').select('*', { count: 'exact', head: true }).in('client_id', clientIds).eq('status', 'pending')
      pendingCount = (quizzesPending || 0) + (colorsPending || 0);
    }

    return {
      clientsCount: clientsCount || 0,
      appointmentsCount: appointmentsCount || 0,
      goalsPercentage: 0,
      messagesCount: pendingCount // Agora reflete Ações Pendentes
    }
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error in getDashboardStats:', e)
    return { 
      clientsCount: 0, 
      appointmentsCount: 0, 
      goalsPercentage: 0, 
      messagesCount: 0 
    }
  }
}

export async function getRecentActivity(limit = 10): Promise<DashboardActivity[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: clients } = await supabase.from('profiles').select('id, full_name').eq('consultant_id', user.id)
    if (!clients || clients.length === 0) return []
    
    const clientIds = clients.map(c => c.id)
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c.full_name || 'Cliente']))

    const activities: DashboardActivity[] = []

    const { data: colors } = await supabase.from('color_analysis_requests')
      .select('id, client_id, created_at, status')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: quizzes } = await supabase.from('quizzes')
      .select('id, client_id, created_at, status, quiz_type')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data: appointments } = await supabase.from('appointments')
      .select('id, client_id, start_time, status, title')
      .eq('consultant_id', user.id)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (colors) {
      colors.forEach(c => activities.push({
        id: `color-${c.id}`,
        type: 'color',
        title: 'Análise de Coloração',
        clientName: clientMap[c.client_id] || 'Cliente',
        clientId: c.client_id,
        date: c.created_at,
        status: c.status,
        href: `/consultant/color-analysis`
      }))
    }

    if (quizzes) {
      quizzes.forEach(q => activities.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        title: `Diagnóstico: ${q.quiz_type}`,
        clientName: clientMap[q.client_id] || 'Cliente',
        clientId: q.client_id,
        date: q.created_at,
        status: q.status,
        href: `/consultant/quizzes`
      }))
    }

    if (appointments) {
      appointments.forEach(a => activities.push({
        id: `app-${a.id}`,
        type: 'appointment',
        title: a.title || 'Sessão Agendada',
        clientName: clientMap[a.client_id] || 'Cliente',
        clientId: a.client_id,
        date: a.start_time,
        status: a.status,
        href: `/consultant/appointments`
      }))
    }

    // Sort globally and pick top 'limit'
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error fetching recent activity:', e)
    return []
  }
}

export async function getClientDashboard(): Promise<{
  profile: Profile | null;
  wardrobeCount: number;
  colorAnalysis: ColorAnalysisRequest | null;
  nextAppointment: Appointment | null;
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
      .maybeSingle()

    // Próximo agendamento
    const { data: nextAppointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', user.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()

    return {
      profile,
      wardrobeCount: wardrobeCount || 0,
      colorAnalysis: colorAnalysis || null,
      nextAppointment: nextAppointment || null,
      level: 'Elegância em Construção',
      styleProgress: 45
    }
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Error in getClientDashboard:', e)
    return null
  }
}
