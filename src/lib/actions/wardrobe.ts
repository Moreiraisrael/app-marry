"use server"

import { createClient } from "@/lib/supabase/server"
import { WardrobeItem } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function getWardrobeItems(clientId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('wardrobe_items').select('*')
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wardrobe items:', error)
      return []
    }
    return data as WardrobeItem[]
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getWardrobeItems:', e)
    return []
  }
}

export async function createWardrobeItem(data: Omit<WardrobeItem, 'id' | 'created_at'>) {
  try {
    const supabase = await createClient()
    const { data: item, error } = await supabase
      .from('wardrobe_items')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating wardrobe item:', error)
      return null
    }

    revalidatePath('/consultant/virtual-wardrobe')
    revalidatePath('/client/wardrobe')
    return item as WardrobeItem
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in createWardrobeItem:', e)
    return null
  }
}

export async function updateWardrobeItem(id: string, data: Partial<WardrobeItem>) {
  try {
    const supabase = await createClient()
    const { data: item, error } = await supabase
      .from('wardrobe_items')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating wardrobe item:', error)
      return null
    }

    revalidatePath('/consultant/virtual-wardrobe')
    revalidatePath('/client/wardrobe')
    return item as WardrobeItem
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in updateWardrobeItem:', e)
    return null
  }
}

export async function deleteWardrobeItem(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting wardrobe item:', error)
      return { success: false }
    }

    revalidatePath('/consultant/virtual-wardrobe')
    revalidatePath('/client/wardrobe')
    return { success: true }
  } catch (e: any) {
    if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in deleteWardrobeItem:', e)
    return { success: false }
  }
}
