"use server"

import { createClient } from "@/lib/supabase/server"
import { ColorAnalysisRequest, Profile } from "@/types/database"
import { GoogleGenAI } from '@google/genai'

type ColorAnalysisWithProfile = ColorAnalysisRequest & {
  profiles: Pick<Profile, 'full_name' | 'email'> | null
}

export interface AIColorAnalysisResult {
  season: string;
  temperature_analysis: string;
  depth_analysis: string;
  intensity_analysis: string;
  contrast_level: string;
  facial_features: {
    face_shape: string;
    facial_traits: string;
  };
  reasoning: string;
  style_recommendations: {
    necklines: string;
    patterns: string;
    accessories: string;
  };
}

export async function getColorAnalysisRequests(): Promise<ColorAnalysisWithProfile[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('color_analysis_requests')
      .select('*, profiles!client_id(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching color analysis requests:', error)
      return []
    }
    return data as ColorAnalysisWithProfile[]
  } catch (e) {
    console.error('Connection error in getColorAnalysisRequests:', e)
    return []
  }
}

export async function createColorAnalysisRequest(formData: {
  client_id: string
  client_photo: string
  additional_photos: string[]
}): Promise<ColorAnalysisRequest | null> {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) throw new Error("Unauthorized")

    const { data, error } = await supabase
      .from('color_analysis_requests')
      .insert({
        client_id: formData.client_id,
        consultant_id: userData.user.id,
        client_photo: formData.client_photo,
        additional_photos: formData.additional_photos,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating color analysis request:', error)
      return null
    }
    return data
  } catch (e) {
    console.error('Connection error in createColorAnalysisRequest:', e)
    return null
  }
}

export async function analyzeColorWithAI(requestId: string): Promise<AIColorAnalysisResult | null> {
  try {
    const supabase = await createClient()
    
    // 1. Fetch the request to get the image URL
    const { data: request, error: fetchError } = await supabase
      .from('color_analysis_requests')
      .select('client_photo')
      .eq('id', requestId)
      .single()

    if (fetchError || !request?.client_photo) {
      console.error('Error fetching request or no photo:', fetchError)
      return null
    }

    // 2. Download the image and convert to base64
    const imageResp = await fetch(request.client_photo)
    if (!imageResp.ok) {
      console.error('Failed to fetch image from URL')
      return null
    }
    const arrayBuffer = await imageResp.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg'

    // 3. Call Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    const prompt = `Você é um consultor de imagem especialista em Coloração Pessoal (Método Sazonal Expandido). Analise esta foto detalhadamente e determine a cartela de cores da pessoa.
    
    Responda ESTRITAMENTE num formato JSON válido seguindo a seguinte estrutura, sem markdown ao redor, apenas o JSON puro:
    {
      "season": "uma das 12 estações em minúsculo com underline (ex: inverno_frio, verao_claro, outono_quente, primavera_brilhante)",
      "temperature_analysis": "Análise detalhada do subtom, temperatura da pele e veias",
      "depth_analysis": "Análise da profundidade de cor (cabelo, pele, olhos)",
      "intensity_analysis": "Análise da intensidade (brilhante ou suave)",
      "contrast_level": "alto, medio ou baixo",
      "facial_features": {
        "face_shape": "Formato do rosto",
        "facial_traits": "Traços faciais"
      },
      "reasoning": "Resumo do raciocínio explicando o porquê da escolha da cartela",
      "style_recommendations": {
        "necklines": "Recomendações de decotes",
        "patterns": "Estampas ideais",
        "accessories": "Acessórios (metais, pedras)"
      }
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
    // Remove markdown code blocks if Gemini includes them despite instructions
    const cleanJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const aiResult: AIColorAnalysisResult = JSON.parse(cleanJsonText)

    // 4. Update the database with the real AI result
    const { error: updateError } = await supabase
      .from('color_analysis_requests')
      .update({
        ai_suggested_season: aiResult.season,
        ai_analysis_data: aiResult as any,
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating AI analysis:', updateError)
      return null
    }
    
    return aiResult
  } catch (e) {
    console.error('Connection error or AI error in analyzeColorWithAI:', e)
    return null
  }
}

export async function approveColorAnalysis(requestId: string, season: string, notes: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    
    const { data: request, error: fetchError } = await supabase
      .from('color_analysis_requests')
      .select('client_id')
      .eq('id', requestId)
      .single()

    if (fetchError) {
      console.error('Error fetching request for approval:', fetchError)
      return { success: false }
    }

    // 1. Update request status
    const { error: updateError } = await supabase
      .from('color_analysis_requests')
      .update({
        status: 'approved',
        consultant_season: season,
        consultant_notes: notes
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request status:', updateError)
      return { success: false }
    }

    // 2. Update client profile with the final season
    await supabase
      .from('profiles')
      .update({
        season: season 
      })
      .eq('id', request.client_id)
    
    return { success: true }
  } catch (e) {
    console.error('Connection error in approveColorAnalysis:', e)
    return { success: false }
  }
}
