'use server'

import { createClient } from '@/lib/supabase/server'
import { QuizType, Quiz, QuizWithProfile } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getQuizzes(clientId?: string): Promise<QuizWithProfile[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('quizzes')
      .select('*, profiles!client_id(full_name)')
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quizzes:', error)
      return []
    }
    return data || []
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getQuizzes:', e)
    return []
  }
}

export async function saveQuizResult(quizType: QuizType, answers: Record<string, unknown>, resultText: string): Promise<{ success: boolean; error?: string; data?: Quiz }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Usuário não autenticado' }

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        client_id: user.id,
        quiz_type: quizType,
        answers,
        result_text: resultText,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error(`Error saving ${quizType} quiz:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath('/client/dashboard')
    return { success: true, data }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in saveQuizResult:', e)
    return { success: false, error: 'Falha na conexão com o servidor' }
  }
}

export async function submitColorAnalysis(photoDataUrl: string, answers: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Usuário não autenticado' }

    // Save the physical answers to the quizzes table as well (for temperature analysis text)
    await supabase.from('quizzes').insert({
      client_id: user.id,
      quiz_type: 'color',
      answers,
      result_text: 'Análise pendente de aprovação',
      status: 'pending'
    })

    // Also submit the actual color_analysis_request with the photo
    const { error } = await supabase
      .from('color_analysis_requests')
      .insert({
        client_id: user.id,
        client_photo: photoDataUrl,
        status: 'pending'
      })

    if (error) {
      console.error('Error saving color analysis:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/client/dashboard')
    revalidatePath('/consultant/color-analysis')
    return { success: true }
  } catch (e: any) {
     if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
     console.error('Connection error in submitColorAnalysis:', e)
     return { success: false, error: 'Falha na conexão com o servidor' }
  }
}

export async function getPendingQuizzes(): Promise<QuizWithProfile[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, profiles!client_id(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending quizzes:', error)
      return []
    }
    return data || []
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getPendingQuizzes:', e)
    return []
  }
}

export async function getPendingColorAnalyses(): Promise<any[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('color_analysis_requests')
      .select('*, profiles!client_id(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending color analyses:', error)
      return []
    }
    return data || []
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getPendingColorAnalyses:', e)
    return []
  }
}

export async function approveQuiz(quizId: string, resultText: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // First figure out if this is color, if so we need to update profiles with season too
    const { data: quiz } = await supabase.from('quizzes').select('quiz_type, client_id, answers').eq('id', quizId).single()
    
    const { error } = await supabase
      .from('quizzes')
      .update({ status: 'approved', result_text: resultText })
      .eq('id', quizId)

    if (error) {
       console.error('Error approving quiz:', error)
       return { success: false, error: error.message }
    }
    
    revalidatePath('/consultant/quizzes')
    revalidatePath('/client/dashboard')
    return { success: true }
  } catch (e: any) {
     if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
     console.error('Connection error in approveQuiz:', e)
     return { success: false, error: 'Falha na conexão' }
  }
}

export async function approveColorAnalysis(requestId: string, season: string, notes: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    // Get the request to find the client_id
    const { data: request, error: fetchError } = await supabase
      .from('color_analysis_requests')
      .select('client_id')
      .eq('id', requestId)
      .single()
      
    if (fetchError || !request) {
      return { success: false, error: 'Requisição não encontrada' }
    }

    const { error } = await supabase
      .from('color_analysis_requests')
      .update({ 
        status: 'approved', 
        consultant_season: season,
        consultant_notes: notes,
        consultant_id: user.id
      })
      .eq('id', requestId)

    if (error) {
       console.error('Error approving color analysis:', error)
       return { success: false, error: error.message }
    }
    
    // Update the client profile with the newly found season
    await supabase.from('profiles').update({ season }).eq('id', request.client_id)
    
    // Also try to find a pending color quiz for this client and approve it if exists
    await supabase.from('quizzes')
      .update({ status: 'approved', result_text: `Estação confirmada: ${season}` })
      .eq('client_id', request.client_id)
      .eq('quiz_type', 'color')
      .eq('status', 'pending')

    revalidatePath('/consultant/color-analysis')
    revalidatePath('/client/dashboard')
    return { success: true }
  } catch (e: any) {
     if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
     console.error('Connection error in approveColorAnalysis:', e)
     return { success: false, error: 'Falha na conexão' }
  }
}
