import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, wardrobeItems, clientData, colorAnalysis, styleQuiz } = await req.json();

    if (!clientId || !wardrobeItems || wardrobeItems.length === 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Prepare wardrobe summary for AI
    const wardrobeSummary = wardrobeItems.map(item => 
      `${item.category || 'unknown'}: ${item.color || 'unspecified'} ${item.subcategory || ''}`
    ).join('\n');

    const prompt = `Você é um consultor de moda especialista em sustentabilidade e guarda-roupas funcionais. 
    
Cliente: ${clientData?.full_name || 'Not specified'}
Estação de Cores: ${colorAnalysis?.recommended_season || 'Not specified'}
Preferências de Estilo: ${styleQuiz?.style_type || 'Not specified'}
Tipo de Corpo: ${clientData?.body_type || 'Not specified'}

Guarda-Roupa Atual:
${wardrobeSummary}

TAREFAS:

1. **ANÁLISE GERAL** - Forneça um resumo executivo do guarda-roupa em 2-3 frases

2. **PREENCHER LACUNAS**:
   - Identifique 3-4 peças críticas para completar o estilo
   - Identifique 2-3 ocasiões onde faltam looks (formal, casual, esportivo, etc)
   - Para CADA lacuna, inclua: cores ideais, detalhes de estilo, versatilidade, ocasiões de uso
   - Forneça 3-4 dicas gerais de styling

3. **MINI-COLEÇÕES (Capsulas)**:
   - Crie 3-4 mini-coleções temáticas usando ITENS EXISTENTES no guarda-roupa
   - Cada cápsula deve ter: nome, tema, 5-8 peças do guarda-roupa, descrição, ocasiões, destaque de estilo, dica de styling

4. **SUSTENTABILIDADE**:
   - Calcule score geral (0-100)
   - Score de versatilidade (quantas peças combinam com várias outras)
   - Score de durabilidade (qualidade dos materiais/marcas)
   - Score de reuso (tendências atemporais)
   - Identifique 3-4 peças versáteis (sustentáveis) com explicação
   - Identifique 3-4 peças de alta qualidade com tempo de durabilidade
   - Identifique 2-3 peças atemporais (reuso potencial)
   - Forneça 2-3 recomendações específicas
   - Mensagem de impacto sustentável personalizada

RESPONDA APENAS EM JSON VÁLIDO com a seguinte estrutura:
{
  "overview": "resumo executivo aqui",
  "piece_recommendations": {
    "critical_gaps": [
      {
        "piece": "nome da peça",
        "why_needed": "razão",
        "ideal_colors": ["cor1", "cor2"],
        "style_details": "detalhes",
        "versatility": "explicação",
        "occasions": ["ocasião1", "ocasião2"]
      }
    ],
    "occasion_gaps": [
      {
        "occasion": "nome ocasião",
        "description": "descrição",
        "suggested_pieces": ["peça1", "peça2"],
        "color_palette": "descrição da paleta"
      }
    ],
    "styling_tips": ["dica1", "dica2", "dica3", "dica4"]
  },
  "capsule_collections": [
    {
      "id": "capsule_1",
      "name": "Nome da Cápsula",
      "theme": "tema",
      "description": "descrição 2-3 frases",
      "items": ["item1", "item2", "item3", "item4", "item5"],
      "occasions": ["ocasião1", "ocasião2"],
      "key_features": ["destaque1", "destaque2"],
      "styling_tips": "dica de styling"
    }
  ],
  "sustainability_analysis": {
    "overall_score": 75,
    "overall_assessment": "avaliação geral",
    "versatility_score": 70,
    "durability_score": 80,
    "reuse_potential": 75,
    "versatile_pieces": [
      {
        "name": "nome da peça",
        "versatility_score": 85,
        "why_versatile": "explicação",
        "pairing_styles": ["estilo1", "estilo2", "estilo3"]
      }
    ],
    "high_quality_pieces": [
      {
        "name": "nome da peça",
        "durability_years": 5,
        "quality_assessment": "avaliação",
        "care_tips": "cuidados específicos"
      }
    ],
    "timeless_pieces": [
      {
        "name": "nome da peça",
        "timeless_reason": "razão",
        "style_evolution": "como continua relevante"
      }
    ],
    "recommendations": ["recomendação1", "recomendação2", "recomendação3"],
    "impact_message": "mensagem de impacto sustentável personalizada"
  }
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overview: { type: "string" },
          piece_recommendations: {
            type: "object",
            properties: {
              critical_gaps: {
                type: "array",
                items: { type: "object" }
              },
              occasion_gaps: {
                type: "array",
                items: { type: "object" }
              },
              styling_tips: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          capsule_collections: {
            type: "array",
            items: { type: "object" }
          },
          sustainability_analysis: { type: "object" }
        }
      }
    });

    return Response.json({
      data: {
        overview: analysis.overview,
        piece_recommendations: analysis.piece_recommendations,
        capsule_collections: analysis.capsule_collections,
        sustainability_analysis: analysis.sustainability_analysis
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});