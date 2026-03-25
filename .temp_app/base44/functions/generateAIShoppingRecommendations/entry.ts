import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, clientData, wardrobeItems, colorAnalysis, styleQuiz } = await req.json();

    if (!clientId || !clientData) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const wardrobeSummary = wardrobeItems?.map(item =>
      `${item.category}: ${item.color}`
    ).join(', ') || 'Guarda-roupa vazio';

    const prompt = `Você é um especialista em recomendações de shopping personalizadas.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season || 'Não especificado'}
Cores Ideais: ${clientData.recommended_colors?.join(', ') || 'N/A'}
Cores a Evitar: ${clientData.colors_to_avoid?.join(', ') || 'N/A'}
Tipo de Estilo: ${styleQuiz?.style_type || 'N/A'}
Preferências: ${styleQuiz?.style_preferences?.join(', ') || 'N/A'}

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

Analise o guarda-roupa e identifique 8-10 peças essenciais que faltam para criar uma coleção versátil e coerente. Cada peça deve complementar o que já existe.

RESPONDA APENAS EM JSON VÁLIDO:
{
  "recommended_pieces": [
    {
      "name": "nome da peça",
      "category": "categoria",
      "reason": "por que é essencial para esta cliente",
      "ideal_colors": ["cor1", "cor2"],
      "avoid_colors": ["cor1"],
      "occasions": ["ocasião1", "ocasião2"],
      "priority": "high|medium|low",
      "versatility_score": "85%",
      "style_tip": "dica sobre como usar",
      "search_keywords": ["palavra1", "palavra2"]
    }
  ],
  "shopping_strategy": "estratégia recomendada",
  "budget_allocation": "como distribuir orçamento entre as categorias"
}`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_pieces: {
            type: "array",
            items: { type: "object" }
          },
          shopping_strategy: { type: "string" },
          budget_allocation: { type: "string" }
        }
      }
    });

    return Response.json({ data: recommendations });
  } catch (error) {
    console.error('Error generating shopping recommendations:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});