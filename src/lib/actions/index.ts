'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile, WardrobeItem, QuizType } from '@/types/database'
import { revalidatePath } from 'next/cache'

import { getClients as getClientsAction, getClientById as getClientByIdAction } from './clients'
import { 
  getColorAnalysisRequests as getColorAnalysisRequestsAction, 
  createColorAnalysisRequest as createColorAnalysisRequestAction, 
  analyzeColorWithAI as analyzeColorWithAIAction, 
  approveColorAnalysis as approveColorAnalysisAction 
} from './color-analysis'
import { getShoppingLists as getShoppingListsAction, createShoppingList as createShoppingListAction } from './shopping-lists'
import { getEbooks as getEbooksAction, generateEbook as generateEbookAction } from './ebooks'
import { getQuizzes as getQuizzesAction, saveQuizResult as saveQuizResultAction } from './quizzes'

// --- Re-exports using explicit async wrappers for Next.js Server Actions compatibility ---

export async function getClients() { return await getClientsAction() }
export async function getClientById(id: string) { return await getClientByIdAction(id) }

export async function getColorAnalysisRequests() { return await getColorAnalysisRequestsAction() }
export async function createColorAnalysisRequest(data: { client_id: string; client_photo: string; additional_photos: string[] }) { 
  return await createColorAnalysisRequestAction(data) 
}
export async function analyzeColorWithAI(requestId: string) { return await analyzeColorWithAIAction(requestId) }
export async function approveColorAnalysis(requestId: string, season: string, notes: string) { 
  return await approveColorAnalysisAction(requestId, season, notes) 
}

export async function getShoppingLists(clientId?: string) { return await getShoppingListsAction(clientId) }
export async function createShoppingList(data: { client_id: string; title: string; items: Record<string, unknown>[] }) { 
  return await createShoppingListAction(data) 
}

export async function getEbooks(clientId?: string) { return await getEbooksAction(clientId) }
export async function generateEbook(data: { client_id: string; title: string; content: Record<string, unknown> }) { 
  return await generateEbookAction(data) 
}

export async function getQuizzes(clientId?: string) { return await getQuizzesAction(clientId) }
export async function saveQuizResult(quizType: QuizType, answers: Record<string, unknown>, resultText: string) { 
  return await saveQuizResultAction(quizType, answers, resultText) 
}

// --- Direct Actions ---

export async function getClientsV2() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('consultant_id', user.id)
      .eq('user_type', 'client')
    if (error) {
      console.error('Error in getClientsV2:', error)
      return []
    }
    return data as Profile[]
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getClientsV2:', e)
    return []
  }
}

export async function getWardrobeItems(clientId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error in getWardrobeItems:', error)
      return []
    }
    return data as WardrobeItem[]
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getWardrobeItems:', e)
    return []
  }
}

export async function updateWardrobeStatus(itemId: string, status: WardrobeItem['status']) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('wardrobe_items')
      .update({ status })
      .eq('id', itemId)
    if (error) {
      console.error('Error in updateWardrobeStatus:', error)
      return { success: false }
    }
    revalidatePath('/consultant/virtual-wardrobe')
    return { success: true }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in updateWardrobeStatus:', e)
    return { success: false }
  }
}

export async function getAppointments() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data, error } = await supabase
      .from('appointments')
      .select('*, client:profiles!client_id(full_name)')
      .eq('consultant_id', user.id)
    if (error) {
      console.error('Error in getAppointments:', error)
      return []
    }
    return data
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getAppointments:', e)
    return []
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)

    if (error) {
      console.error('Error updating appointment:', error)
      return { success: false }
    }

    revalidatePath('/consultant/appointments')
    return { success: true }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in updateAppointmentStatus:', e)
    return { success: false }
  }
}
