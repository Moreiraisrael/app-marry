'use server'

import { createClient } from '@/lib/supabase/server'
import type { VisagismRequest } from '@/types/database'

export async function getVisagismRequests() {
  const supabase = await createClient()

  try {
    const { data: requests, error } = await supabase
      .from('visagism_requests')
      .select('*, profiles!client_id(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching visagism requests:', error)
      return []
    }

    return requests
  } catch (err) {
    console.error('Error fetching visagism requests:', err)
    return []
  }
}

export async function createVisagismRequest(formData: {
  client_id: string
  front_face_photo: string
  side_face_photo: string
}) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error('Unauthorized: No active consultant session.')
    return null
  }

  const payload: Partial<VisagismRequest> = {
    client_id: formData.client_id,
    consultant_id: userData.user.id,
    front_face_photo: formData.front_face_photo,
    side_face_photo: formData.side_face_photo,
    status: 'pending'
  }

  const { data: insertedData, error: insertError } = await supabase
    .from('visagism_requests')
    .insert(payload)
    .single()

  if (insertError) {
    console.error('Error creating visagism request:', insertError)
    return null
  }

  return insertedData
}

export async function analyzeVisagismWithAI(requestId: string) {
  const supabase = await createClient()

  // MOCK de AI (gemini/vision) para pontos focais estéticos.
  const mockSuggestedShape = 'Diamante'

  const aiAnalysisData = {
    facial_measurements: {
      upperThird: 33, // testa até sobrancelha
      middleThird: 33, // sobrancelha até base do nariz
      lowerThird: 34, // base do nariz até queixo
      bizygomaticWidth: 140, // largura maçãs do rosto
      bigonialWidth: 110 // largura mandíbula
    },
    observations: 'Predominância de maçãs do rosto marcadas com queixo afilado. Simetria considerável nos terços faciais (Regra dos Terços).'
  }

  const { error: updateError } = await (supabase
    .from('visagism_requests')
    .update({
      ai_suggested_shape: mockSuggestedShape,
      ai_analysis_data: aiAnalysisData
    })
    .eq('id', requestId) as unknown as Promise<{ error: any }>)

  if (updateError) {
    console.error('Failed to update request with AI facial data:', updateError)
    return null
  }

  return { shape: mockSuggestedShape, data: aiAnalysisData }
}

export async function approveVisagism(
  requestId: string,
  shape: string,
  measurements: Record<string, number>,
  notes: string
) {
  const supabase = await createClient()

  // 1. Fetching the primary key reference
  const { data: request, error: fetchError } = await supabase
    .from('visagism_requests')
    .select('client_id')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    console.error('Error fetching visagism request for approval:', fetchError)
    return { success: false }
  }

  // 2. Transacionando Updates
  const resRequest = await (supabase
    .from('visagism_requests')
    .update({
      status: 'approved',
      consultant_shape: shape,
      consultant_notes: notes
    })
    .eq('id', requestId) as unknown as Promise<{ error: any }>)

  if (resRequest.error) {
    return { success: false, error: resRequest.error }
  }

  const resProfile = await (supabase
    .from('profiles')
    .update({
      face_shape: shape,
      facial_measurements: measurements
    })
    .eq('id', request.client_id) as unknown as Promise<{ error: any }>)

  if (resProfile.error) {
    console.error('Critico: Falhou o Update do Profile com os dados Faciais.', resProfile.error)
    return { success: false, error: resProfile.error }
  }

  return { success: true }
}
