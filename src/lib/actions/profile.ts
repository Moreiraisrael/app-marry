'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  const fullName = formData.get('fullName') as string
  const bio = formData.get('bio') as string
  const avatarUrl = formData.get('avatarUrl') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      bio: bio,
      avatar_url: avatarUrl,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update profile error:', error.message)
    return { error: 'Erro ao atualizar perfil' }
  }

  revalidatePath('/consultant/settings')
  revalidatePath('/client/profile')
  
  return { success: 'Perfil atualizado com sucesso!' }
}
