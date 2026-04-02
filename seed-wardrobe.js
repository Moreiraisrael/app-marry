/**
 * seed-wardrobe.js
 * Insere peças de guarda-roupa de teste para a cliente Fernanda Elegante
 * Executa: node seed-wardrobe.js
 */
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Imagens de roupas gratuitas do Unsplash
const WARDROBE_SEED = [
  {
    category: 'Top',
    subcategory: 'Blusa de Seda Off-White',
    color: '#F5F0E8',
    photo_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&q=80',
    status: 'keep',
  },
  {
    category: 'Bottom',
    subcategory: 'Calça Pantalona Caramelo',
    color: '#C19A6B',
    photo_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    status: 'keep',
  },
  {
    category: 'OnePiece',
    subcategory: 'Vestido Midi Floral',
    color: '#D4A96A',
    photo_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
    status: 'keep',
  },
  {
    category: 'Shoes',
    subcategory: 'Scarpin Nude Bico Fino',
    color: '#E8D5C0',
    photo_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
    status: 'keep',
  },
  {
    category: 'Accessories',
    subcategory: 'Bolsa Estruturada Dourada',
    color: '#C9A84C',
    photo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    status: 'keep',
  },
  {
    category: 'Top',
    subcategory: 'Blazer Areia Alfaiataria',
    color: '#C2B280',
    photo_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    status: 'keep',
  },
]

async function seedWardrobe() {
  // Login como consultora
  const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'moreiraisrael1997@gmail.com',
    password: '56169715'
  })

  if (loginError || !user) {
    console.error('❌ Login falhou:', loginError?.message)
    return
  }
  console.log('✅ Logado como:', user.email)

  // Buscar a Fernanda Elegante
  const { data: fernanda } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('full_name', 'Fernanda Elegante')
    .single()

  if (!fernanda) {
    console.error('❌ Fernanda Elegante não encontrada. Cadastre ela primeiro em /consultant/clients')
    return
  }
  console.log('✅ Cliente encontrada:', fernanda.full_name, '→', fernanda.id)

  // Inserir peças
  const items = WARDROBE_SEED.map(item => ({
    ...item,
    client_id: fernanda.id,
    notes: 'Peça de teste — seed',
    ai_analysis: null,
    season_match: true,
  }))

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(items)
    .select()

  if (error) {
    console.error('❌ Erro ao inserir peças:', error.code, error.message)
    
    if (error.code === '42501') {
      console.log('\n⚠️  RLS bloqueou o insert. Execute no Supabase SQL Editor:')
      console.log(`
CREATE POLICY "Consultants can insert wardrobe items for clients" ON public.wardrobe_items
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT consultant_id FROM public.profiles WHERE id = client_id)
  );

CREATE POLICY "Consultants can view their clients wardrobe items" ON public.wardrobe_items
  FOR SELECT USING (
    auth.uid() = client_id OR
    auth.uid() IN (SELECT consultant_id FROM public.profiles WHERE id = client_id)
  );
      `)
    }
    return
  }

  console.log(`✅ ${data.length} peças inseridas com sucesso para ${fernanda.full_name}!`)
  data.forEach(item => console.log(`  - ${item.category}: ${item.subcategory}`))
  console.log('\n🎯 Agora vá em Cápsulas de Estilo → Montar Novo Look → selecione Fernanda → verá as peças!')
}

seedWardrobe()
