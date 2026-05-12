'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PartnerStore } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getPartnerStores(): Promise<PartnerStore[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('partner_stores')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching partner stores:', error)
      return []
    }
    
    return data || []
  } catch (e: unknown) {
    const isDynamic = e instanceof Error && e.message.includes('Dynamic server usage')
    const hasDigest = typeof e === 'object' && e !== null && 'digest' in e && (e as Record<string, unknown>).digest === 'DYNAMIC_SERVER_USAGE'
    if (isDynamic || hasDigest) throw e
    console.error('Connection error in getPartnerStores:', e)
    return []
  }
}

export async function savePartnerStore(store: Partial<PartnerStore>): Promise<{ success: boolean; error?: string; data?: PartnerStore }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('partner_stores')
      .insert({
        name: store.name,
        store_link: store.store_link,
        category: store.category,
        is_active: store.is_active ?? true,
        logo_url: store.logo_url
      })
      .select()
      .single()

    if (error) {
      console.error(`Error saving partner store:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath('/consultant/partner-stores')
    return { success: true, data }
  } catch (e: unknown) {
    if (e instanceof Error && (e as Error & { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE' || (e instanceof Error && e.message?.includes('Dynamic server usage'))) throw e;
    console.error('Connection error in savePartnerStore:', e)
    return { success: false, error: 'Falha na conexão com o servidor' }
  }
}

export async function batchImportPartnerStores(): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const stores = [
  {
    "name": "Loccitane Au Bresil",
    "store_link": "https://tidd.ly/4li0a48",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/bfc38a53a_17631.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "SCHUTZ",
    "store_link": "https://tidd.ly/4sSpNez",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/e0b805824_80302.png",
    "category": "calcados",
    "is_active": true
  },
  {
    "name": "Renner Favoritos ",
    "store_link": "https://tidd.ly/4lla4lx",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/0cbe603db_70694.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Iplace",
    "store_link": "https://tidd.ly/4ubPRCB",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/0c0650d33_31355.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "Maria Filó",
    "store_link": "https://tidd.ly/3OOm2YO",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/1cc6e11a9_116455.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "INTIMISSI",
    "store_link": "https://tidd.ly/3OxCZqd",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/e29b2a1e6_70965.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "AMOBELEZA",
    "store_link": "https://tidd.ly/4aDXJ8s",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/35599a85f_100869.png",
    "category": "maquiagem",
    "is_active": true
  },
  {
    "name": "ANIMALE",
    "store_link": "https://tidd.ly/4kTulhL",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/992668fe4_104715.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Diesel",
    "store_link": "https://br.diesel.com/",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/c6f99ea12_logo-header-desktop-tranparente___fc5f9dafb59f6b83b74d2a4897a906c1.svg",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Calvin Klein",
    "store_link": "https://tidd.ly/3P0e66y",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/38356f56f_100553.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Jo Malone",
    "store_link": "https://tidd.ly/46nzZ5Y",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/1145cb3e0_22390.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "GOCASE",
    "store_link": "https://tidd.ly/4rBMTFK",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/81efa6cc6_17814.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "Estée Lauder BR",
    "store_link": "https://tidd.ly/4kVriWt",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/cd4b700c5_26877.png",
    "category": "maquiagem",
    "is_active": true
  },
  {
    "name": "ZZMALL",
    "store_link": "https://zzmall.com.br?influ=marrymiele",
    "logo_url": "",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Vivara",
    "store_link": "https://tidd.ly/4rBLLCe",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/6d3e8ebc0_17662.png",
    "category": "joias",
    "is_active": true
  },
  {
    "name": "Beleza na Web",
    "store_link": "https://tidd.ly/4s73l0v",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/e550ce702_29407.png",
    "category": "maquiagem",
    "is_active": true
  },
  {
    "name": "Nike",
    "store_link": "https://tidd.ly/46l6DFb",
    "logo_url": "",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Monte Carlo",
    "store_link": "https://tidd.ly/3ZNT39L",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/e63388a45_100451.png",
    "category": "joias",
    "is_active": true
  },
  {
    "name": "Too Faced",
    "store_link": "https://tidd.ly/46XSZbh",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/4ef0979fa_26875.png",
    "category": "maquiagem",
    "is_active": true
  },
  {
    "name": "Hope",
    "store_link": "https://tidd.ly/3ZOHD5B",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/6078cf9d3_107039.png",
    "category": "outros",
    "is_active": true
  },
  {
    "name": "Lacoste",
    "store_link": "https://tidd.ly/3OoptFp",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/aae146215_imglogo_lacoste_v_c_rvb-1764353507118.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Calzedonia",
    "store_link": "https://tidd.ly/4tQqQwJ",
    "logo_url": "",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "MAC Cosméticos",
    "store_link": "https://tidd.ly/4kO7gwO",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/7e8932520_17780.png",
    "category": "maquiagem",
    "is_active": true
  },
  {
    "name": "C&A",
    "store_link": "https://tidd.ly/4s4kAQ9",
    "logo_url": "https://base44.app/api/apps/6989205392f69694df37d205/files/public/6989205392f69694df37d205/083658008_17648.png",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Renner",
    "store_link": "https://www.lojasrenner.com.br",
    "logo_url": "",
    "category": "roupas",
    "is_active": true
  },
  {
    "name": "Arezzo",
    "store_link": "https://www.arezzo.com.br",
    "logo_url": "",
    "category": "calcados",
    "is_active": true
  },
  {
    "name": "Sephora",
    "store_link": "https://www.sephora.com.br",
    "logo_url": "",
    "category": "maquiagem",
    "is_active": true
  }
]

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('partner_stores')
      .insert(stores)

    if (error) {
      console.error(`Error importing partner stores:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath('/consultant/partner-stores')
    return { success: true, count: stores.length }
  } catch (e: unknown) {
    if (e instanceof Error && (e as Error & { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE' || (e instanceof Error && e.message?.includes('Dynamic server usage'))) throw e;
    console.error('Connection error in batchImportPartnerStores:', e)
    return { success: false, error: 'Falha na conexão com o servidor' }
  }
}
