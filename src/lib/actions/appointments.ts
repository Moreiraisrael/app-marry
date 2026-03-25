"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAppointment(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Usuário não autenticado." }

    const clientId = formData.get("clientId") as string
    const title = formData.get("title") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          consultant_id: user.id,
          client_id: clientId,
          notes: title, // Usando a coluna 'notes' existente para o título
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/consultant/appointments')
    return { success: true, appointment: data }
  } catch (e) {
    console.error('Connection error in createAppointment:', e)
    return { success: false, error: "Falha na conexão com o servidor." }
  }
}

export async function getAppointments() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('appointments')
      .select('*, client:profiles!client_id(full_name, email)')
      .eq('consultant_id', user.id)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('Connection error in getAppointments:', e)
    return []
  }
}
