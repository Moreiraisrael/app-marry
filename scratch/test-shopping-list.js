require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Faltam variáveis de ambiente!");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("Verificando perfis existentes para pegar UUIDs válidos...");
  const { data: profiles } = await supabase.from('profiles').select('id, user_type').limit(5);
  
  const client = profiles?.find(p => p.user_type === 'client') || profiles?.[0];
  const consultant = profiles?.find(p => p.user_type === 'consultant') || profiles?.[1] || profiles?.[0];

  if (!client || !consultant) {
    console.log("Não há perfis suficientes para testar as foreign keys. Tentando com mock...");
  }

  console.log("Tentando inserir na tabela shopping_lists...");

  const mockData = {
    client_id: client ? client.id : "00000000-0000-0000-0000-000000000000",
    consultant_id: consultant ? consultant.id : "00000000-0000-0000-0000-000000000000",
    title: "Lista Teste Script",
    items: [{ name: "Teste", price: 100 }],
    status: 'active'
    // Não estou passando total_amount
  };

  const { data, error } = await supabase
    .from('shopping_lists')
    .insert(mockData)
    .select();

  if (error) {
    console.error("ERRO AO INSERIR:", error);
  } else {
    console.log("SUCESSO AO INSERIR:", data);
    
    console.log("Limpando a lista de teste...");
    await supabase.from('shopping_lists').delete().eq('id', data[0].id);
  }
}

testInsert();
