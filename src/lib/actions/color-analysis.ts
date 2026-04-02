"use server"

import { createClient } from "@/lib/supabase/server"
import { ColorAnalysisRequest, Profile } from "@/types/database"

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
    
    // Simulated AI result based on the legacy logic
    const mockResult = {
      season: "inverno_frio",
      temperature_analysis: "Subtom predominante azulado/rosado. Veias azuis. Contraste nítido entre pele e traços.",
      depth_analysis: "Profundidade média-profunda. Cabelo escuro que emoldura o rosto com clareza.",
      intensity_analysis: "Intensidade brilhante. As cores naturais têm vivacidade.",
      contrast_level: "alto",
      facial_features: {
        face_shape: "oval",
        facial_traits: "suaves"
      },
      reasoning: "A cliente apresenta subtons frios inequívocos e alto contraste pessoal, características clássicas do Inverno Frio.",
      style_recommendations: {
        necklines: "Decote em V profundo para alongar",
        patterns: "Geométricos de alto contraste",
        accessories: "Prata e ouro branco"
      }
    }

    const { error } = await supabase
      .from('color_analysis_requests')
      .update({
        ai_suggested_season: mockResult.season,
        ai_analysis_data: mockResult,
      })
      .eq('id', requestId)

    if (error) {
      console.error('Error updating AI analysis:', error)
      return null
    }
    return mockResult
  } catch (e) {
    console.error('Connection error in analyzeColorWithAI:', e)
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
