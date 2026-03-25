'use server'

import { createClient } from '@/lib/supabase/server'
import { QuizType } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getQuizzes(clientId?: string) {
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
  } catch (e) {
    console.error('Connection error in getQuizzes:', e)
    return []
  }
}

export async function saveQuizResult(quizType: QuizType, answers: Record<string, unknown>, resultText: string) {
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
  } catch (e) {
    console.error('Connection error in saveQuizResult:', e)
    return { success: false, error: 'Falha na conexão com o servidor' }
  }
}
