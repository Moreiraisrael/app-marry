"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface LookCapsule {
  id: string
  client_id: string
  name: string
  item_ids: string[]
  occasion: string | null
  description: string | null
  created_at: string
  // Joined fields
  client_name?: string | null
  item_photos?: string[]
}

export async function getLookCapsules(clientId?: string): Promise<LookCapsule[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('look_capsules')
      .select('*, profiles!client_id(full_name)')

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching look capsules:', error)
      return []
    }

    // Collect all unique item IDs across all capsules
    const allItemIds = Array.from(
      new Set(
        (data || []).flatMap((capsule) => capsule.item_ids || [])
      )
    )

    // Fetch photos for all items in a single query
    const itemPhotosMap: Record<string, string> = {}
    if (allItemIds.length > 0) {
      const { data: items } = await supabase
        .from('wardrobe_items')
        .select('id, photo_url')
        .in('id', allItemIds)

      if (items) {
        items.forEach((item) => {
          if (item.photo_url) {
            itemPhotosMap[item.id] = item.photo_url
          }
        })
      }
    }

    // Map photos back to their respective capsules
    const capsules = (data || []).map((capsule) => {
      const item_photos: string[] = []

      if (capsule.item_ids && capsule.item_ids.length > 0) {
        for (const itemId of capsule.item_ids) {
          if (itemPhotosMap[itemId]) {
            item_photos.push(itemPhotosMap[itemId])
          }
          if (item_photos.length >= 4) break
        }
      }

      return {
        ...capsule,
        client_name: capsule.profiles?.full_name ?? null,
        item_photos,
      }
    })

    return capsules as LookCapsule[]
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getLookCapsules:', e)
    return []
  }
}

export async function createLookCapsule(data: Omit<LookCapsule, 'id' | 'created_at' | 'client_name' | 'item_photos'>): Promise<LookCapsule | null> {
  try {
    const supabase = await createClient()
    const { data: capsule, error } = await supabase
      .from('look_capsules')
      .insert({
        client_id: data.client_id,
        name: data.name,
        item_ids: data.item_ids,
        occasion: data.occasion,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating look capsule:', error)
      return null
    }

    revalidatePath('/consultant/capsule')
    revalidatePath('/client/looks')
    return capsule as LookCapsule
  } catch (e) {
    console.error('Connection error in createLookCapsule:', e)
    return null
  }
}

export async function deleteLookCapsule(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('look_capsules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting look capsule:', error)
      return { success: false }
    }

    revalidatePath('/consultant/capsule')
    revalidatePath('/client/looks')
    return { success: true }
  } catch (e) {
    console.error('Connection error in deleteLookCapsule:', e)
    return { success: false }
  }
}
