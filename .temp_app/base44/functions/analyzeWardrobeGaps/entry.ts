import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { clientId } = await req.json();

    if (!clientId) {
      return Response.json({ error: 'clientId required' }, { status: 400 });
    }

    // Buscar dados da cliente
    const clients = await base44.entities.Client.list().then(c => c.find(cl => cl.id === clientId));
    if (!clients) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // Buscar análise de coloração
    const colorAnalyses = await base44.entities.ColorAnalysisRequest.filter({
      client_id: clientId,
      status: 'approved'
    });
    const colorAnalysis = colorAnalyses[0];

    // Buscar estilo
    const styleQuizzes = await base44.entities.StyleQuiz.filter({
      client_id: clientId,
      status: 'approved'
    });
    const styleQuiz = styleQuizzes[0];

    // Buscar itens do guarda-roupa
    const wardrobeItems = await base44.entities.WardrobeItem.filter({
      client_id: clientId
    });

    if (!colorAnalysis || !styleQuiz) {
      return Response.json({
        error: 'Incomplete profile'
      }, { status: 400 });
    }

    // Contar categorias
    const categoryCount = {};
    wardrobeItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    // Gerar análise de lacunas com IA
    const prompt = `Analise o guarda-roupa desta cliente e identifique lacunas estratégicas em PORTUGUÊS:

**Perfil da Cliente:**
- Estação: ${colorAnalysis.consultant_season}
- Estilo: ${styleQuiz.consultant_style}
- Tipo de corpo: ${clients.body_type || 'não definido'}

**Guarda-roupa Atual (${wardrobeItems.length} peças):**
${Object.entries(categoryCount).map(([cat, count]) => `- ${cat}: ${count} peça(s)`).join('\n')}

**ANÁLISE REQUERIDA:**
1. **LACUNAS CRÍTICAS** (3-4): Categorias faltando ou insuficientes
2. **LACUNAS DE VERSATILIDADE**: Peças que expandem combinações
3. **LACUNAS DE OCASIÃO**: Para diferentes contextos (formal, casual, esportivo)
4. **PEÇAS-CHAVE FALTANDO**: Essenciais para o estilo dela
5. **SUGESTÕES DE COMPRA PRIORITÁRIAS**: Top 5 peças com:
   - Descrição
   - Cores ideais (baseadas na estação)
   - Por que é importante
   - Onde procurar (tipo de loja)

Seja ESPECÍFICA e PRÁTICA.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          critical_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap: { type: "string" },
                impact: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium"] }
              }
            }
          },
          versatility_gaps: {
            type: "array",
            items: { type: "string" }
          },
          occasion_gaps: {
            type: "object",
            properties: {
              formal: { type: "array", items: { type: "string" } },
              business: { type: "array", items: { type: "string" } },
              casual: { type: "array", items: { type: "string" } },
              special_events: { type: "array", items: { type: "string" } }
            }
          },
          key_missing_pieces: {
            type: "array",
            items: { type: "string" }
          },
          priority_shopping_list: {
            type: "array",
            items: {
              type: "object",
              properties: {
                piece: { type: "string" },
                why_important: { type: "string" },
                ideal_colors: { type: "array", items: { type: "string" } },
                styling_versatility: { type: "string" },
                where_to_find: { type: "string" },
                estimated_price_range: { type: "string" }
              }
            }
          },
          wardrobe_summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: {
        currentWardrobe: {
          totalItems: wardrobeItems.length,
          byCategory: categoryCount
        },
        gapAnalysis: analysis,
        clientProfile: {
          season: colorAnalysis.consultant_season,
          style: styleQuiz.consultant_style,
          bodyType: clients.body_type
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});