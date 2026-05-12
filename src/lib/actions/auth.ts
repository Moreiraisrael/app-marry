'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData): Promise<{ error?: string } | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    // Fornecer mensagens mais amigáveis e específicas
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'E-mail ou senha incorretos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Por favor, confirme seu e-mail antes de acessar' }
    }
    return { error: 'Erro: ' + error.message }
  }

  let redirectUrl = '/consultant/dashboard'

  // Sincronizar perfil e checar user_type após login bem-sucedido
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Obter o perfil para verificar o tipo de usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (profile?.user_type === 'client') {
        redirectUrl = '/client/dashboard'
      }

      // Sincronizar dados básicos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Profile sync warning:', updateError.message)
      }
    }
  } catch (e) {
    console.error('Unexpected profile sync error:', e)
  }

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function signUp(formData: FormData): Promise<{ error?: string; success?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const userType = formData.get('userType') as 'client' | 'consultant'
  
  if (!email || !password || !fullName || !userType) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      }
    }
  })

  if (authError) {
    console.error('Signup error:', authError.message)
    if (authError.message.includes('User already registered')) {
      return { error: 'Este e-mail já está cadastrado' }
    }
    return { error: 'Ocorreu um erro ao criar sua conta. Tente novamente.' }
  }

  if (data.user) {
    // Manually create profile if trigger is not set up
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        user_type: userType,
      })
    
    if (profileError) {
      console.error('Profile creation error:', profileError.message)
    }
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect(userType === 'consultant' ? '/consultant/dashboard' : '/client/dashboard')
  }

  return { success: 'Cadastro realizado com sucesso! Você já pode fazer login.' }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
