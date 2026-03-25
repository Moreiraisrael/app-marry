import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      clientId,
      clientData,
      wardrobeItems,
      colorAnalysis,
      styleQuiz,
      contentType // 'articles', 'guides', 'trends', 'outfits'
    } = await req.json();

    if (!clientId || !clientData) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const wardrobeSummary = wardrobeItems?.map(item =>
      `${item.category}: ${item.color}`
    ).join(', ') || 'Guarda-roupa vazio';

    let prompt = '';

    if (contentType === 'articles') {
      prompt = `Você é um crítico de moda e jornalista especializado em lifestyle.

PERFIL DA CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season || 'Não especificado'}
Estilo Predominante: ${styleQuiz?.consultant_style || 'Não especificado'}
Preferências: ${styleQuiz?.style_preferences?.join(', ') || 'Variadas'}

GUARDA-ROUPA ATUAL: ${wardrobeSummary}

Crie 3 artigos de moda personalizados para esta cliente. Cada artigo deve ser:
- Relevante ao seu estilo e perfil
- Profundo e educacional
- Com dicas práticas e aplicáveis
- Inspirador e motivador

RESPONDA EM JSON:
{
  "articles": [
    {
      "title": "título atraente",
      "subtitle": "subtítulo",
      "content": "conteúdo do artigo (2-3 parágrafos)",
      "key_tips": ["dica1", "dica2", "dica3"],
      "category": "categoria",
      "reading_time": "tempo de leitura em minutos"
    }
  ]
}`;
    } else if (contentType === 'guides') {
      prompt = `Você é um consultor de moda pessoal especializado em criação de guias estilísticos.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season}
Cores Ideais: ${clientData.recommended_colors?.join(', ')}
Estilo: ${styleQuiz?.consultant_style}

GUARDA-ROUPA: ${wardrobeSummary}

Crie 3 guias de estilo personalizados focados em:
1. Maximizar uso do guarda-roupa atual
2. Técnicas de styling para seu tipo de corpo
3. Seleção de cores e combinações

RESPONDA EM JSON:
{
  "guides": [
    {
      "title": "título do guia",
      "description": "descrição curta",
      "sections": [
        {
          "heading": "seção",
          "content": "conteúdo detalhado",
          "tips": ["dica1", "dica2"]
        }
      ],
      "difficulty": "beginner|intermediate|advanced",
      "target_outcome": "resultado esperado"
    }
  ]
}`;
    } else if (contentType === 'trends') {
      prompt = `Você é um analista de tendências de moda global.

CLIENTE:
Estação: ${colorAnalysis?.recommended_season}
Estilo: ${styleQuiz?.consultant_style}
Tipo de Corpo: ${clientData.body_type}
Preferências: ${styleQuiz?.style_preferences?.join(', ')}

Identifique 4-5 tendências atuais que seriam PERFEITAS para esta cliente especificamente.
Para cada tendência, explique como implementá-la de forma acessível e autêntica.

RESPONDA EM JSON:
{
  "trends": [
    {
      "trend_name": "nome da tendência",
      "description": "o que é",
      "why_for_client": "por que combina com ela",
      "how_to_adopt": "como adotar sem parecer fake",
      "key_pieces": ["peça1", "peça2"],
      "season_relevance": "quando é ideal",
      "accessibility": "easy|moderate|challenging",
      "style_examples": "exemplos práticos"
    }
  ],
  "trend_report": "análise geral das tendências para seu perfil"
}`;
    } else if (contentType === 'outfits') {
      prompt = `Você é um personal stylist especializado em criação de outfits práticos.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season}
Cores Recomendadas: ${clientData.recommended_colors?.join(', ')}
Estilo: ${styleQuiz?.consultant_style}

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

Crie 5 outfits COMPLETOS para diferentes ocasiões/estações usando:
- Items do guarda-roupa existente
- Sugestões de peças novas para complementar

Para cada outfit, inclua:
- Descrição detalhada
- Como estilizar
- Ocasiões de uso
- Dicas de acessórios

RESPONDA EM JSON:
{
  "seasonal_outfits": [
    {
      "season": "primavera|verão|outono|inverno",
      "outfit_name": "nome",
      "occasion": "ocasião",
      "description": "descrição",
      "existing_pieces": ["peça1", "peça2"],
      "new_pieces": ["nova peça1"],
      "styling_tips": ["dica1", "dica2"],
      "accessories": ["acessório1"],
      "color_story": "como as cores funcionam"
    }
  ]
}`;
    }

    const content = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          articles: { type: "array" },
          guides: { type: "array" },
          trends: { type: "array" },
          trend_report: { type: "string" },
          seasonal_outfits: { type: "array" }
        }
      }
    });

    return Response.json({ data: content });
  } catch (error) {
    console.error('Error generating personalized content:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});