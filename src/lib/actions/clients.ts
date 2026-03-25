"use server"

import { createClient } from "@/lib/supabase/server"

export async function getClients() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'client')
      .eq('consultant_id', user.id)
      .order('full_name')

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('Connection error in getClients:', e)
    return []
  }
}

export async function getClientById(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching client by id:', error)
      return null
    }
    return data
  } catch (e) {
    console.error('Connection error in getClientById:', e)
    return null
  }
}

export async function createClientProfile(formData: FormData) {
  try {
    const supabaseClient = await createClient()
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string

    // Obter o ID do consultor logado
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return { success: false, error: "Usuário não autenticado." }

    const { data, error } = await supabaseClient
      .from('profiles')
      .insert([
        { 
          full_name: fullName, 
          email: email, 
          user_type: 'client',
          consultant_id: user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return { success: false, error: error.message }
    }

    return { success: true, client: data }
  } catch (e) {
    console.error('Connection error in createClientProfile:', e)
    return { success: false, error: "Falha na conexão com o servidor." }
  }
}
