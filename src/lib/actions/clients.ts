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
      return { success: false, error: "Nome e email são obrigatórios." }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Usuário não autenticado." }

    // Tenta via RPC (requer migration SQL no Supabase)
    const { data: clientId, error: rpcError } = await supabase.rpc('create_client_profile', {
      p_full_name: fullName,
      p_email: email,
      p_consultant_id: user.id,
    })

    // RPC funcionou
    if (!rpcError && clientId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single()

      revalidatePath('/consultant/clients')
      return { success: true, client: profile as Profile }
    }

    // Fallback: RPC não existe ainda → usa signUp do Supabase Auth
    // Cria o usuário auth e depois vincula o profile
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const tempClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const tempPassword = `Miele@${Math.random().toString(36).slice(-8)}!`
    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email,
      password: tempPassword,
      options: { data: { full_name: fullName, user_type: 'client' } }
    })

    if (authError) {
      if (authError.status === 429) {
        return { success: false, error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' }
      }
      if (authError.message?.toLowerCase().includes('already registered')) {
        return { success: false, error: 'Este e-mail já está cadastrado no sistema.' }
      }
      console.error('signUp error:', authError)
      return { success: false, error: `Erro ao criar acesso: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, error: 'Falha ao criar usuário. Tente novamente.' }
    }

    // Insere o profile com o ID do auth user
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        user_type: 'client',
        consultant_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert error:', insertError.code, insertError.message)
      if (insertError.code === '42501') {
        return { success: false, error: 'Permissão negada. Execute as migrations SQL no Supabase (ver run-migrations.js).' }
      }
      return { success: false, error: insertError.message }
    }

    revalidatePath('/consultant/clients')
    return { success: true, client: profile as Profile }

  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in createClientProfile:', e)
    return { success: false, error: "Falha na conexão com o servidor." }
  }
}

