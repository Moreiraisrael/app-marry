import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting fashion trends analysis...');

    // Invocar LLM com contexto da internet para análise de tendências
    const trendsData = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Você é uma especialista em consultoria de imagem e análise de tendências de moda.
        
        Analise as tendências de moda atuais para ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} baseando-se em:
        - Artigos de moda recentes
        - Redes sociais e influenciadores de moda
        - Desfiles de moda e semanas de moda
        - Street style
        - Publicações especializadas em moda
        
        Forneça uma análise completa e atualizada das tendências de estilo.
      `,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          emerging_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nome da tendência" },
                description: { type: "string", description: "Descrição detalhada" },
                popularity_score: { type: "number", description: "Score de popularidade 0-100" },
                key_elements: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Elementos-chave da tendência"
                },
                styling_tips: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Dicas de como usar"
                },
                target_audience: { 
                  type: "string",
                  description: "Público-alvo (jovem, maduro, eclético, etc)"
                }
              }
            },
            description: "Top 5-7 tendências emergentes"
          },
          seasonal_colors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nome da cor" },
                hex_code: { type: "string", description: "Código hexadecimal" },
                description: { type: "string", description: "Como usar esta cor" },
                best_for: { 
                  type: "array",
                  items: { type: "string" },
                  description: "Para quem funciona melhor"
                }
              }
            },
            description: "Cores em alta para a estação atual"
          },
          key_pieces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                piece: { type: "string", description: "Nome da peça" },
                why_trending: { type: "string", description: "Por que está em alta" },
                how_to_wear: { type: "string", description: "Como usar" },
                price_range: { type: "string", description: "Faixa de preço" },
                versatility: { type: "number", description: "Score de versatilidade 0-100" }
              }
            },
            description: "Peças-chave que estão em alta"
          },
          style_insights: {
            type: "object",
            properties: {
              overall_vibe: { type: "string", description: "Vibe geral da estação" },
              dos_and_donts: {
                type: "object",
                properties: {
                  dos: { type: "array", items: { type: "string" } },
                  donts: { type: "array", items: { type: "string" } }
                }
              },
              sustainability_focus: { type: "string", description: "Foco em sustentabilidade" }
            }
          },
          analysis_date: { type: "string", description: "Data da análise" }
        }
      }
    });

    console.log('Trends analysis completed');

    return Response.json({
      success: true,
      data: trendsData,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing fashion trends:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});