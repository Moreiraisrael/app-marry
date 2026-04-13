"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Profile } from "@/types/database"

export async function getClients(): Promise<Profile[]> {
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
    return (data as Profile[]) || []
  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in getClients:', e)
    return []
  }
}

export async function getClientById(id: string): Promise<Profile | null> {
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
    return data as Profile
  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in getClientById:', e)
    return null
  }
}

export async function createClientProfile(formData: FormData): Promise<{ success: boolean; error?: string; client?: Profile }> {
  try {
    const supabase = await createClient()
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string

    if (!fullName || !email) {
      return { success: false, error: "Nome e e-mail são obrigatórios." }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Sua sessão expirou. Por favor, faça login novamente." }
    }

    // Prioridade: RPC (Shadow Profile)
    // Permite criar o perfil sem exigir que o cliente crie uma conta imediatamente
    const { data: clientId, error: rpcError } = await supabase.rpc('create_client_profile', {
      p_full_name: fullName,
      p_email: email,
      p_consultant_id: user.id,
    })

    if (rpcError) {
      console.error('[Clients] Erro RPC:', rpcError.message, rpcError.details)
      
      // Erro comum se a migration não foi aplicada
      if (rpcError.message?.includes('function public.create_client_profile') || rpcError.message?.includes('does not exist')) {
        return { 
          success: false, 
          error: "Sistema base não configurado. Por favor, execute as migrations SQL no dashboard do Supabase (veja run-migrations.js)." 
        }
      }
      
      return { success: false, error: `Erro ao processar cadastro: ${rpcError.message}` }
    }

    if (clientId) {
      // Busca o profile recém-criado para retornar ao frontend
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single()

      if (selectError) {
        console.error('[Clients] Erro ao buscar perfil criado:', selectError)
        // Mesmo com erro no select, se o ID existe, a criação funcionou
        revalidatePath('/consultant/clients')
        return { success: true }
      }

      revalidatePath('/consultant/clients')
      return { success: true, client: profile as Profile }
    }

    return { success: false, error: "Não foi possível confirmar a criação do perfil." }

  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('[Clients] Erro inesperado em createClientProfile:', e)
    return { success: false, error: "Houve uma falha inesperada. Tente novamente em instantes." }
  }
}

