"use server"

import { createClient } from "@/lib/supabase/server"

export async function trackAffiliateClick(destinationUrl: string, itemType: string, itemId?: string) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert analytics event
    const { error } = await supabase
      .from('analytics_clicks')
      .insert({
        client_id: user?.id || null, // Allow anonymous tracking or null if user not found, though policies might require auth.uid()
        destination_url: destinationUrl,
        item_type: itemType,
        item_id: itemId || null
      })
      
    if (error) {
      if (error.code !== '42P01') { // Ignore missing table error during development before migration
        console.error("Error tracking click:", error)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error("Exception in trackAffiliateClick:", error)
    return { success: false }
  }
}
