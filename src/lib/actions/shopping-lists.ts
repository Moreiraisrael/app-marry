"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getShoppingLists(clientId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('shopping_lists')
      .select('*, profiles!client_id(full_name)')
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shopping lists:', error)
      return []
    }
    return data || []
  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in getShoppingLists:', e)
    return []
  }
}

export async function createShoppingList(formData: {
  client_id: string
  title: string
  items: Array<Record<string, unknown>>
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('shopping_lists')
      .insert({
        ...formData,
        consultant_id: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shopping list:', error)
      return null
    }
    revalidatePath('/consultant/shopping-lists')
    return data
  } catch (e: unknown) {
    const err = e as { digest?: string; message?: string }
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) throw e
    console.error('Connection error in createShoppingList:', e)
    return null
  }
}
