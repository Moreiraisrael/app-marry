import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { clientId, season, stylePreference } = await req.json();

    if (!clientId) {
      return Response.json({ error: 'clientId required' }, { status: 400 });
    }

    // Buscar informações da cliente
    const client = await base44.entities.Client.list().then(clients =>
      clients.find(c => c.id === clientId)
    );

    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // Buscar lojas parceiras
    const partnerStores = await base44.entities.PartnerStore.filter({ is_active: true });

    // Gerar recomendações com contexto da internet para lojas reais
    const prompt = `Você é um consultor de moda especializado em recomendações personalizadas. 
    
Gere 8 recomendações ESPECÍFICAS de produtos com marcas REAIS e LOJAS PARCEIRAS para esta cliente:

**Perfil da Cliente:**
- Estação de Cores: ${season || 'Não especificada'}
- Preferência de Estilo: ${stylePreference || 'Elegante'}
- Nome: ${client.full_name}

**IMPORTANTE - LOJAS PARCEIRAS DISPONÍVEIS:**
${partnerStores.map(store => `- ${store.name} (${store.category}): ${store.link}`).join('\n')}

Para CADA recomendação, forneça:
1. Nome do Produto (específico)
2. Marca/Loja (de uma das parceiras disponíveis)
3. Categoria
4. Descrição detalhada (por que combina com o perfil)
5. Faixa de Preço
6. Link direto da loja ou instruções para encontrar
7. Dicas de Styling

Responda em JSON com array "products" contendo as 8 recomendações. IMPORTANTE: Responda TUDO em PORTUGUÊS do Brasil.`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nome específico do produto" },
                brand: { type: "string", description: "Marca ou loja parceira" },
                category: { type: "string" },
                description: { type: "string" },
                price_range: { type: "string" },
                store_url: { type: "string", description: "Link da loja" },
                styling_tips: { type: "string" },
                why_perfect: { type: "string" },
                colors_available: { type: "array", items: { type: "string" } },
                priority: {
                  type: "string",
                  enum: ["must_have", "high", "medium"],
                  description: "Prioridade de compra"
                }
              },
              required: ["name", "brand", "category", "description", "price_range", "store_url"]
            }
          }
        }
      }
    });

    // Gerar imagens para alguns dos produtos principais
    const topProducts = recommendations.products?.slice(0, 3) || [];
    
    const productsWithImages = await Promise.all(
      topProducts.map(async (product) => {
        try {
          const { url } = await base44.integrations.Core.GenerateImage({
            prompt: `Professional product photo of ${product.name} by ${product.brand}. ${product.description}. Studio fashion photography, clean aesthetic, high-end quality.`
          });
          return { ...product, image_url: url };
        } catch {
          return { ...product, image_url: null };
        }
      })
    );

    // Retornar recomendações com imagens
    return Response.json({
      success: true,
      recommendations: recommendations.products,
      featured_products: productsWithImages,
      partner_stores: partnerStores,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});