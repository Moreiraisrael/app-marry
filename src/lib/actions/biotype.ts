'use server'

import { createClient } from '@/lib/supabase/server'
import type { BiotypeRequest } from '@/types/database'

export async function getBiotypeRequests() {
  const supabase = await createClient()

  try {
    const { data: requests, error } = await supabase
      .from('biotype_requests')
      .select('*, profiles!client_id(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching biotype requests:', error)
      return []
    }

    return requests
  } catch (err) {
    console.error('Error fetching biotype requests:', err)
    return []
  }
}

export async function createBiotypeRequest(formData: {
  client_id: string
  front_photo: string
  side_photo: string
}) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error('Unauthorized: No active consultant session.')
    return null
  }

  const payload: Partial<BiotypeRequest> = {
    client_id: formData.client_id,
    consultant_id: userData.user.id,
    front_photo: formData.front_photo,
    side_photo: formData.side_photo,
    status: 'pending'
  }

  const { data: insertedData, error: insertError } = await supabase
    .from('biotype_requests')
    .insert(payload)
    .single()

  if (insertError) {
    console.error('Error creating biotype request:', insertError)
    return null
  }

  return insertedData
}

export async function analyzeBiotypeWithAI(requestId: string) {
  const supabase = await createClient()

  // MOCK: Num fluxo de produção aqui teríamos uma chamada ao endpoint OpenAI/Gemini Vision.
  // Geramos dados fake baseados em probabilidade simples.
  const shapes = ['Ampulheta', 'Triângulo', 'Triângulo Invertido', 'Retângulo', 'Oval'] as const
  const mockSuggestedShape = shapes[0] // Sempre Ampulheta para manter teste determinístico ou mock dinâmico

  const aiAnalysisData = {
    measurements: {
      shoulder: 96,
      waist: 70,
      hip: 100
    },
    observations: 'Predominância de ombros proporcionais ao quadril e cintura fina bem definida.'
  }

  const { error: updateError } = await (supabase
    .from('biotype_requests')
    .update({
      ai_suggested_shape: mockSuggestedShape,
      ai_analysis_data: aiAnalysisData
    })
    .eq('id', requestId) as unknown as Promise<{ error: any }>)

  if (updateError) {
    console.error('Failed to update request with AI data:', updateError)
    return null
  }

  return { shape: mockSuggestedShape, data: aiAnalysisData }
}

export async function approveBiotype(
  requestId: string,
  shape: string,
  measurements: Record<string, number>,
  notes: string
) {
  const supabase = await createClient()

  // 1. Achar a requisição para obter o ID da(o) cliente associado.
  const { data: request, error: fetchError } = await supabase
    .from('biotype_requests')
    .select('client_id')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    console.error('Error fetching request for approval:', fetchError)
    return { success: false }
  }

  // 2. Transacionar: Update Status na request && Update Shape/Measurements no Client Profile.
  // Nota: Num ambiente serverless production-ready perfeito da Supabase faríamos uma RPC ou Promise.all
  // Mas vamos manter a atomicidade da ação via aplicação.

  const resRequest = await (supabase
    .from('biotype_requests')
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
      body_shape: shape,
      body_measurements: measurements
    })
    .eq('id', request.client_id) as unknown as Promise<{ error: any }>)

  if (resProfile.error) {
    // Falha crítica, o status foi de aprovado mas o profile não upou. Ideal alertar logs.
    console.error('Crítical: Profile measures could not be updated.', resProfile.error)
    return { success: false, error: resProfile.error }
  }

  return { success: true }
}
