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
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getWardrobeItems:', e)
    return []
  }
}

export async function getWardrobeItemsByClients(clientIds: string[]) {
  try {
    if (!clientIds || clientIds.length === 0) return []

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching batched wardrobe items:', error)
      return []
    }
    return data as WardrobeItem[]
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in getWardrobeItemsByClients:', e)
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
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
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
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
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
  } catch (e: unknown) {
    if ((e as Error & { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || (e as Error)?.message?.includes('Dynamic server usage')) throw e;
    console.error('Connection error in deleteWardrobeItem:', e)
    return { success: false }
  }
}

export interface AIOutfitAnalysisResult {
  rating: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommended_occasions: string[];
  color_harmony: string;
}

export async function analyzeOutfitWithAI(imageUrl: string): Promise<AIOutfitAnalysisResult | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai')
    
    // Download the image and convert to base64
    const imageResp = await fetch(imageUrl)
    if (!imageResp.ok) {
      console.error('Failed to fetch image from URL for look analysis')
      return null
    }
    const arrayBuffer = await imageResp.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg'

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    const prompt = `Você é um personal stylist de elite. Analise este look (outfit) com precisão.
    
    Responda ESTRITAMENTE num formato JSON válido seguindo a seguinte estrutura, sem markdown ao redor, apenas o JSON puro:
    {
      "rating": numero de 1 a 10 avaliando o look geral,
      "summary": "Um parágrafo de resumo sobre a impressão geral do look",
      "strengths": ["Ponto forte 1", "Ponto forte 2", ...],
      "improvements": ["Sugestão de melhoria 1", "Sugestão 2", ...],
      "recommended_occasions": ["Ocasião 1", "Ocasião 2", ...],
      "color_harmony": "Breve análise da harmonia e contraste de cores das peças"
    }`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    })

    const textResponse = response.text || ""
    const cleanJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const aiResult: AIOutfitAnalysisResult = JSON.parse(cleanJsonText)
    return aiResult
  } catch (e) {
    console.error('Connection error or AI error in analyzeOutfitWithAI:', e)
    return null
  }
}
