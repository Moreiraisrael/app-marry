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

export async function createClientProfile(formData: FormData): Promise<{ success: boolean; error?: string; client?: Profile; action_link?: string; temp_password?: string }> {
  try {
    const supabaseSession = await createClient()
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string

    if (!fullName || !email) {
      return { success: false, error: "Nome e e-mail são obrigatórios." }
    }

    const { data: { user } } = await supabaseSession.auth.getUser()
    if (!user) {
      return { success: false, error: "Sua sessão expirou. Por favor, faça login novamente." }
    }

    // Usar o Service Role Key para criar o usuário e gerar a senha temporária
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Gera uma senha temporária simples (ex: ESTILO + 4 números aleatórios)
    const tempPassword = `ESTILO${Math.floor(1000 + Math.random() * 9000)}`

    let newUserId
    let createUserError

    // Tenta criar o usuário diretamente
    const createResult = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        user_type: 'client',
      }
    })

    newUserId = createResult.data.user?.id
    createUserError = createResult.error

    // Se o usuário já existe, não podemos recriar com senha (a menos que a gente atualize, mas por segurança é melhor avisar ou lidar de outra forma)
    if (createUserError && createUserError.message.includes('already been registered')) {
       // Vamos tentar pegar o usuário existente para vinculá-lo (caso não esteja vinculado ainda)
       // NOTA: Para trocar a senha do usuário existente precisaríamos de updateUserById.
       // Neste cenário de "já existe", poderíamos apenas vincular à consultora ou atualizar a senha.
       // Para manter simples e garantir o acesso, vamos atualizar a senha do usuário existente.
       
       // Buscar o id do usuário existente por email (usando auth.admin.listUsers não é exato, mas podemos fazer algo similar ou tentar gerar link)
       // Em vez disso, como precisamos da senha temporária para o Plano A, vamos tentar atualizar a senha se o usuário existir.
       // Mas precisamos do ID dele. Como createUser não retorna o usuário se ele já existe, vamos pegar a lista de usuários filtrando por email.
       
       const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
       
       if (!listError && users) {
         const existingUser = users.find(u => u.email === email)
         if (existingUser) {
           newUserId = existingUser.id
           // Atualizar a senha do usuário existente
           const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
             existingUser.id,
             { password: tempPassword }
           )
           if (updateError) {
             console.error('[Clients] Erro ao atualizar senha de usuário existente:', updateError)
             return { success: false, error: `Usuário já existe, mas erro ao atualizar acesso: ${updateError.message}` }
           }
           createUserError = null // Sucesso na recuperação/atualização
         } else {
           return { success: false, error: "Usuário já registrado e não pôde ser localizado." }
         }
       } else {
         return { success: false, error: `Erro ao buscar usuário existente: ${createUserError.message}` }
       }
    } else if (createUserError) {
      console.error('[Clients] Erro ao criar usuário:', createUserError)
      return { success: false, error: `Erro ao criar cliente: ${createUserError.message}` }
    }

    if (newUserId) {
      // Agora precisamos garantir que o perfil exista e tenha a consultora vinculada.
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUserId,
          full_name: fullName,
          email: email,
          user_type: 'client',
          consultant_id: user.id,
          updated_at: new Date().toISOString()
        })

      if (upsertError) {
        console.error('[Clients] Erro ao fazer upsert do perfil do cliente:', upsertError)
      }

      // Construir a URL base correta para o painel
      let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl) {
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
          siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else if (process.env.VERCEL_URL) {
          siteUrl = `https://${process.env.VERCEL_URL}`;
        } else {
          siteUrl = 'http://localhost:3000';
        }
      }
      siteUrl = siteUrl.replace(/\/$/, '');
      const loginUrl = `${siteUrl}/auth/client`

      revalidatePath('/consultant/clients')
      return { 
        success: true, 
        temp_password: tempPassword,
        action_link: loginUrl
      }
    }

    return { success: false, error: "Não foi possível confirmar a criação do perfil." }

  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('[Clients] Erro inesperado em createClientProfile:', e)
    return { success: false, error: "Houve uma falha inesperada. Tente novamente em instantes." }
  }
}

export async function deleteClientProfile(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Sessão expirada." }
    }

    // Only allow deleting clients that belong to the consultant
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', clientId)
      .eq('consultant_id', user.id)

    if (error) {
      console.error('Error deleting client:', error)
      return { success: false, error: 'Erro ao excluir o cliente.' }
    }

    revalidatePath('/consultant/clients')
    return { success: true }
  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in deleteClientProfile:', e)
    return { success: false, error: 'Falha inesperada ao tentar excluir.' }
  }
}

