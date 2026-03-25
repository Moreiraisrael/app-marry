"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Ebook } from "@/types/database"

export async function getEbooks(clientId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('ebooks')
      .select('*, profiles!client_id(full_name)')
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ebooks:', error)
      return []
    }
    return data as (Ebook & { profiles: { full_name: string } })[]
  } catch (e) {
    console.error('Connection error in getEbooks:', e)
    return []
  }
}

export async function generateEbook(formData: {
  client_id: string
  title: string
  content: Record<string, unknown>
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data, error } = await supabase
      .from('ebooks')
      .insert({
        ...formData,
        consultant_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error generating ebook:', error)
      return null
    }
    revalidatePath('/consultant/ebooks')
    return data
  } catch (e) {
    console.error('Connection error in generateEbook:', e)
    return null
  }
}
