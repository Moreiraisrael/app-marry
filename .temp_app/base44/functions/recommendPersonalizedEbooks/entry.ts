import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, styleQuiz, colorAnalysis, bodyType, availableEbooks } = await req.json();

    if (!clientId || !styleQuiz || !colorAnalysis) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const ebooksData = availableEbooks?.map(eb => 
      `${eb.title}: ${eb.description || ''} (categoria: ${eb.category})`
    ).join('\n') || 'Nenhum ebook disponível';

    const prompt = `Você é um consultor de moda especialista em recomendações personalizadas.

PERFIL DA CLIENTE:
Tipo de Estilo: ${styleQuiz.consultant_style || 'não definido'}
Preferências de Estilo: ${styleQuiz.style_preferences?.join(', ') || 'não definidas'}
Estação de Cores: ${colorAnalysis?.recommended_season || 'não definida'}
Tipo de Corpo: ${bodyType || 'não definido'}
Cores Recomendadas: ${colorAnalysis?.recommended_colors?.join(', ') || 'não definidas'}

EBOOKS DISPONÍVEIS:
${ebooksData}

TAREFA:
1. Recomende 3-5 ebooks mais relevantes para esta cliente
2. Para cada ebook, explique POR QUE é perfeito para ela
3. Indique se é essencial, importante ou complementar

RESPONDA EM JSON:
{
  "personalized_recommendations": [
    {
      "ebook_title": "nome",
      "category": "categoria",
      "relevance_score": 95,
      "why_perfect": "por que é ideal para esta cliente",
      "how_it_helps": "como vai ajudar especificamente",
      "importance_level": "essencial|importante|complementar",
      "key_topics": ["tópico1", "tópico2"],
      "estimated_impact": "impacto esperado no estilo"
    }
  ],
  "reading_order": ["ebook1", "ebook2"],
  "personalization_insights": "insights sobre o perfil",
  "complementary_resources": "outros recursos que complementam"
}`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          personalized_recommendations: { type: "array", items: { type: "object" } },
          reading_order: { type: "array", items: { type: "string" } },
          personalization_insights: { type: "string" },
          complementary_resources: { type: "string" }
        }
      }
    });

    return Response.json({ data: recommendations });
  } catch (error) {
    console.error('Error recommending ebooks:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});