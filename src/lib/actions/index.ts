'use server'

import { createClient } from '@/lib/supabase/server'
import { Profile, WardrobeItem } from '@/types/database'
import { revalidatePath } from 'next/cache'

import * as clients from './clients'
import * as colorAnalysis from './color-analysis'
import * as shoppingLists from './shopping-lists'
import * as ebooks from './ebooks'
import * as quizzes from './quizzes'

// --- Re-exports using explicit async wrappers for Next.js Server Actions compatibility ---

export async function getClients() { return await clients.getClients() }
export async function getClientById(id: string) { return await clients.getClientById(id) }

export async function getColorAnalysisRequests() { return await colorAnalysis.getColorAnalysisRequests() }
export async function createColorAnalysisRequest(data: { client_id: string; client_photo: string; additional_photos: string[] }) { 
  return await colorAnalysis.createColorAnalysisRequest(data) 
}
export async function analyzeColorWithAI(requestId: string) { return await colorAnalysis.analyzeColorWithAI(requestId) }
export async function approveColorAnalysis(requestId: string, season: string, notes: string) { 
  return await colorAnalysis.approveColorAnalysis(requestId, season, notes) 
}

export async function getShoppingLists(clientId?: string) { return await shoppingLists.getShoppingLists(clientId) }
export async function createShoppingList(data: { client_id: string; title: string; items: Record<string, unknown>[] }) { 
  return await shoppingLists.createShoppingList(data) 
}

export async function getEbooks(clientId?: string) { return await ebooks.getEbooks(clientId) }
export async function generateEbook(data: { client_id: string; title: string; content: Record<string, unknown> }) { 
  return await ebooks.generateEbook(data) 
}

export async function getQuizzes(clientId?: string) { return await quizzes.getQuizzes(clientId) }
export async function saveQuizResult(quizType: string, answers: Record<string, unknown>, resultText: string) { 
  return await quizzes.saveQuizResult(quizType as any, answers, resultText) 
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    console.error('Connection error in updateAppointmentStatus:', e)
    return { success: false }
  }
}
