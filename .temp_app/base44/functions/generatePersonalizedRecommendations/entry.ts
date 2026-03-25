import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, clientData, colorAnalysis, styleQuiz, wardrobeItems } = await req.json();

    if (!clientId || !clientData) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const wardrobeSummary = wardrobeItems?.map(item =>
      `${item.category}: ${item.color} ${item.subcategory || ''}`
    ).join('\n') || 'Guarda-roupa vazio ou não especificado';

    const prompt = `Você é um consultor de moda especialista em análise de estilo e criação de recomendações personalizadas.

CLIENTE:
Nome: ${clientData.full_name || 'Não especificado'}
Tipo de Corpo: ${clientData.body_type || 'Não especificado'}
Estação de Cores: ${colorAnalysis?.recommended_season || 'Não especificado'}
Cores Recomendadas: ${clientData.recommended_colors?.join(', ') || 'Não especificado'}
Cores a Evitar: ${clientData.colors_to_avoid?.join(', ') || 'Não especificado'}
Tipo de Estilo: ${styleQuiz?.style_type || 'Não especificado'}
Preferências de Estilo: ${styleQuiz?.style_preferences?.join(', ') || 'Não especificado'}
Profissão/Contexto: ${clientData.tags?.join(', ') || 'Não especificado'}

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

TAREFAS:

1. **RECOMENDAÇÕES DE PEÇAS** (10 peças ideais):
   - Para CADA peça: tipo, cores recomendadas, por que combina com o estilo, ocasiões de uso, onde procurar (faixa de preço)

2. **LOOKS COMPLETOS** (5 looks):
   - Crie 5 looks diferentes combinando itens do guarda-roupa com peças recomendadas
   - Para CADA look: nome, descrição, itens necessários, ocasião, dicas de styling

3. **TENDÊNCIAS DE MODA ALINHADAS** (4-5 tendências):
   - Tendências que combinam com o perfil da cliente
   - Como implementar cada tendência
   - Peças específicas a procurar
   - Nível de risco (segura, moderada, ousada)

4. **RECOMENDAÇÕES DE LOJAS/MARCAS** (6-8 marcas):
   - Nome da marca, estilo, faixa de preço
   - Por que é perfeita para esta cliente
   - Tipos de peças onde é mais forte
   - Links/websites

RESPONDA APENAS EM JSON VÁLIDO:
{
  "piece_recommendations": [
    {
      "name": "nome da peça",
      "type": "tipo/categoria",
      "ideal_colors": ["cor1", "cor2"],
      "why_it_works": "razão detalhada",
      "occasions": ["ocasião1", "ocasião2"],
      "price_range": "faixa de preço",
      "styling_tip": "dica de como usar"
    }
  ],
  "complete_looks": [
    {
      "name": "nome do look",
      "occasion": "ocasião",
      "description": "descrição 1-2 frases",
      "required_items": {
        "existing": ["item do guarda-roupa"],
        "new": ["peça nova recomendada"]
      },
      "styling_advice": "dica de styling",
      "color_coordination": "como as cores funcionam juntas"
    }
  ],
  "fashion_trends": [
    {
      "trend_name": "nome da tendência",
      "description": "descrição",
      "why_for_client": "por que combina",
      "how_to_implement": "como usar",
      "key_pieces": ["peça1", "peça2"],
      "risk_level": "safe|moderate|bold"
    }
  ],
  "partner_brands": [
    {
      "brand_name": "nome da marca",
      "style": "descrição do estilo",
      "price_range": "faixa de preço",
      "why_perfect": "por que é perfeita",
      "strength_categories": ["categoria1", "categoria2"],
      "website": "url",
      "special_note": "algo especial sobre a marca"
    }
  ]
}`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          piece_recommendations: {
            type: "array",
            items: { type: "object" }
          },
          complete_looks: {
            type: "array",
            items: { type: "object" }
          },
          fashion_trends: {
            type: "array",
            items: { type: "object" }
          },
          partner_brands: {
            type: "array",
            items: { type: "object" }
          }
        }
      }
    });

    return Response.json({ data: recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});