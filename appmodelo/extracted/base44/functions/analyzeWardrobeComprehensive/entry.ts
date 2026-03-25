import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, wardrobeItems, colorAnalysis, bodyType, stylePreferences } = await req.json();

    if (!clientId || !wardrobeItems || wardrobeItems.length === 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Prepare wardrobe summary
    const wardrobeSummary = wardrobeItems.map(item => 
      `${item.category || 'other'}: ${item.color || 'unknown'} ${item.subcategory || ''} (${item.status || 'keep'})`
    ).join('\n');

    const prompt = `Você é um consultor de moda especialista em análise de guarda-roupa e estratégia de compra.

CLIENTE:
Tipo de Corpo: ${bodyType || 'não especificado'}
Estação de Cores: ${colorAnalysis?.recommended_season || 'não especificado'}
Preferências: ${stylePreferences?.join(', ') || 'não especificadas'}

GUARDA-ROUPA ATUAL (${wardrobeItems.length} peças):
${wardrobeSummary}

ANÁLISE COMPLETA NECESSÁRIA:

1. **CATEGORIZAÇÃO DE PEÇAS**
   - Classifique cada peça em: Clássico, Moderno, Casual, Formal, ou Misto
   - Identifique peças versáteis vs. específicas de ocasião
   - Avalie qualidade e durabilidade percebida

2. **PEÇAS CORINGA**
   - Identifique 3-5 peças que combinam com tudo
   - Por que são versáteis?
   - Como maximizar seu uso?

3. **LACUNAS E DEFICIÊNCIAS**
   - Categorias faltando ou fracas
   - Ocasiões não cobertas
   - Transições de estação inadequadas
   - Proporções de looks desbalanceadas

4. **SUGESTÕES DE LOOKS** (5-7 looks)
   - Usando peças existentes
   - Especificando ocasião e clima
   - Alternativas com peças do guarda-roupa

5. **RECOMENDAÇÕES DE COMPRA ESTRATÉGICA**
   - 5-7 peças essenciais para complementar
   - Prioridade (alta/média/baixa)
   - Cores recomendadas
   - Como cada peça aumenta versatilidade
   - Onde procurar (faixa de preço)

6. **ANÁLISE DE SAÚDE DO GUARDA-ROUPA**
   - Score de versatilidade (0-100)
   - Score de completude (0-100)
   - Score de alinhamento com estilo (0-100)
   - Recomendação geral

RESPONDA EM JSON ESTRUTURADO:
{
  "piece_categorization": [
    {
      "category": "Clássico|Moderno|Casual|Formal|Misto",
      "pieces_in_category": ["peça1", "peça2"],
      "versatility_score": 85,
      "versatile_pieces": ["peça mais versátil"],
      "specific_occasion_pieces": ["peça específica"]
    }
  ],
  "versatile_pieces": {
    "total_found": 3,
    "pieces": [
      {
        "name": "calça jeans azul",
        "reason": "combina com tudo",
        "max_combinations": 15,
        "styling_tips": ["com blazer", "com tenis", "casual ou formal"]
      }
    ],
    "versatility_percentage": 40
  },
  "wardrobe_gaps": {
    "missing_categories": [
      {
        "category": "blazer",
        "reason": "nenhum blazer estruturado",
        "impact": "limita looks formais"
      }
    ],
    "missing_occasions": ["eventos formais", "clima frio"],
    "color_gaps": ["cinza", "branco básico"],
    "style_alignment_issues": ["faltam peças modernas"]
  },
  "outfit_suggestions": [
    {
      "name": "look casual trabalho",
      "occasion": "trabalho dia a dia",
      "weather": "primavera/verão",
      "pieces": ["peça1", "peça2", "acessório"],
      "styling": "descrição do look",
      "variations": ["alternativa 1"]
    }
  ],
  "shopping_recommendations": [
    {
      "piece_type": "blazer estruturado",
      "priority": "alta",
      "ideal_colors": ["cinza chumbo", "preto", "azul marinho"],
      "why_needed": "expande looks formais",
      "versatility_increase": "pode criar 12+ looks novos",
      "price_range": "R$200-400",
      "where_to_buy": "lojas de marca, boutiques"
    }
  ],
  "wardrobe_health": {
    "versatility_score": 72,
    "completeness_score": 65,
    "style_alignment_score": 78,
    "overall_recommendation": "guarda-roupa bom, mas com lacunas em peças formais",
    "priority_action": "adicionar peças estruturadas para ocasiões especiais"
  }
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          piece_categorization: { type: "array", items: { type: "object" } },
          versatile_pieces: { type: "object" },
          wardrobe_gaps: { type: "object" },
          outfit_suggestions: { type: "array", items: { type: "object" } },
          shopping_recommendations: { type: "array", items: { type: "object" } },
          wardrobe_health: { type: "object" }
        }
      }
    });

    return Response.json({ data: analysis });
  } catch (error) {
    console.error('Error analyzing wardrobe:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});