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
      request_type, // 'outfit', 'outfit_feedback', 'new_pieces', 'combination'
      occasion,
      event,
      weather,
      outfit_photo_url,
      outfit_description,
      preferences,
      conversation_history
    } = await req.json();

    if (!clientId || !clientData) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Buscar histórico profundo de interações
    const [chatMessages, appointments, virtualTryOns, photoGallery, styleEvolution] = await Promise.all([
      base44.asServiceRole.entities.ChatMessage.filter({ client_id: clientId }).catch(() => []),
      base44.asServiceRole.entities.Appointment.filter({ client_id: clientId }).catch(() => []),
      base44.asServiceRole.entities.VirtualTryOn.filter({ client_id: clientId }).catch(() => []),
      base44.asServiceRole.entities.ClientPhotoGallery.filter({ client_id: clientId }).catch(() => []),
      base44.asServiceRole.entities.StyleEvolution.filter({ client_id: clientId }).catch(() => []).then(r => r[0])
    ]);

    // Análise de sentimentos dos feedbacks
    let sentimentAnalysis = null;
    const feedbackTexts = [
      ...chatMessages.filter(m => m.sender_type === 'client').map(m => m.message),
      ...photoGallery.filter(p => p.consultant_feedback).map(p => p.consultant_feedback),
      ...appointments.filter(a => a.client_notes).map(a => a.client_notes)
    ];

    if (feedbackTexts.length > 0) {
      try {
        sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analise o sentimento e preferências destas mensagens/feedbacks da cliente:

${feedbackTexts.slice(-10).join('\n\n')}

Identifique:
1. Sentimento geral (positivo/neutro/negativo)
2. Principais insatisfações ou frustrações
3. O que a cliente mais gostou
4. Padrões de preferência
5. Nível de confiança atual com estilo

Responda de forma concisa.`,
          response_json_schema: {
            type: "object",
            properties: {
              overall_sentiment: { type: "string" },
              frustrations: { type: "array", items: { type: "string" } },
              loves: { type: "array", items: { type: "string" } },
              preference_patterns: { type: "array", items: { type: "string" } },
              confidence_level: { type: "string" }
            }
          }
        });
      } catch (e) {
        console.log('Sentiment analysis skipped:', e.message);
      }
    }

    // Buscar tendências atuais de moda
    let currentTrends = null;
    try {
      const trendsResponse = await base44.functions.invoke('analyzeFashionTrends', {});
      currentTrends = trendsResponse.data?.data;
    } catch (e) {
      console.log('Trends integration skipped:', e.message);
    }

    const wardrobeSummary = wardrobeItems?.map(item =>
      `${item.category}: ${item.color} ${item.subcategory || ''} ${item.notes || ''}`
    ).join('\n') || 'Guarda-roupa vazio';

    const conversationContext = conversation_history?.length > 0
      ? `HISTÓRICO DA CONVERSA:\n${conversation_history.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}\n\n`
      : '';

    // Construir contexto de histórico profundo
    const deepHistoryContext = `
HISTÓRICO PROFUNDO DE INTERAÇÕES:
- Total de consultas: ${appointments.length}
- Fotos compartilhadas: ${photoGallery.length}
- Experimentos virtuais: ${virtualTryOns.length}
${styleEvolution ? `- Fase de evolução: ${styleEvolution.evolution_phase}
- Nível de estilo: ${styleEvolution.current_style_level}/10
- Pontos acumulados: ${styleEvolution.points}` : ''}

${sentimentAnalysis ? `ANÁLISE DE SENTIMENTOS:
- Sentimento geral: ${sentimentAnalysis.overall_sentiment}
- Frustrações identificadas: ${sentimentAnalysis.frustrations?.join(', ') || 'Nenhuma'}
- O que mais gosta: ${sentimentAnalysis.loves?.join(', ') || 'N/A'}
- Padrões de preferência: ${sentimentAnalysis.preference_patterns?.join('; ') || 'N/A'}
- Nível de confiança: ${sentimentAnalysis.confidence_level}` : ''}

${currentTrends ? `TENDÊNCIAS ATUAIS DE MODA (${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}):
Vibe da estação: ${currentTrends.style_insights?.overall_vibe || 'N/A'}

Top Tendências Emergentes:
${currentTrends.emerging_trends?.slice(0, 3).map(t => `- ${t.name}: ${t.description} (${t.popularity_score}% popularidade)`).join('\n') || 'N/A'}

Cores em Alta:
${currentTrends.seasonal_colors?.slice(0, 5).map(c => `- ${c.name} (${c.hex_code}): ${c.description}`).join('\n') || 'N/A'}

Peças-Chave Trending:
${currentTrends.key_pieces?.slice(0, 3).map(p => `- ${p.piece}: ${p.why_trending} (Versatilidade: ${p.versatility}%)`).join('\n') || 'N/A'}` : ''}
`;

    // Insights de peças mais usadas/favoritas
    const favoritePieces = virtualTryOns.filter(v => v.is_favorite).length;
    const recentPhotos = photoGallery.filter(p => {
      const photoDate = new Date(p.created_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return photoDate > thirtyDaysAgo;
    }).length;

    let prompt = '';

    if (request_type === 'outfit_feedback' && outfit_photo_url) {
      prompt = `Você é um consultor de moda experiente que fornece feedback construtivo e inspirador sobre outfits.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season || 'Não especificado'}
Estilo: ${styleQuiz?.consultant_style || 'Não especificado'}

Analise a FOTO DO OUTFIT enviada e forneça:

1. **ANÁLISE DO LOOK**: O que você vê? Cores, proporções, estilo geral
2. **O QUE FUNCIONA**: Partes positivas do outfit (seja específico e elogioso)
3. **OPORTUNIDADES**: Áreas de melhoria (de forma construtiva)
4. **SUGESTÕES PRÁTICAS**: 3-4 formas de melhorar este look
5. **COMBOS ALTERNATIVOS**: Como usar essas peças de outras formas
6. **NOTA PESSOAL**: Encorajamento e observação final

RESPONDA EM JSON:
{
  "outfit_analysis": "análise do look",
  "what_works": ["ponto positivo 1", "ponto positivo 2"],
  "opportunities": ["melhoria 1", "melhoria 2"],
  "practical_suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "alternative_combos": ["combo 1", "combo 2"],
  "encouraging_note": "nota motivadora",
  "rating": "score"
}`;
    } else if (request_type === 'outfit') {
      prompt = `Você é um consultor de moda pessoal especialista em styling PERSONALIZADO baseado em dados profundos.

PERFIL DA CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season || 'Não especificado'}
Cores Recomendadas: ${clientData.recommended_colors?.join(', ') || 'N/A'}
Tipo de Estilo: ${styleQuiz?.style_type || 'N/A'}

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

${deepHistoryContext}

${conversationContext}

CONTEXTO:
Ocasião: ${occasion || 'não especificada'}
${event ? `Evento: ${event}` : ''}
${weather ? `Clima: ${weather}` : ''}

Solicitações adicionais: ${preferences || 'Nenhuma'}

INSTRUÇÕES INTELIGENTES:
- Use insights do histórico de interações para personalizar
- Considere as tendências atuais que combinam com ela
- Adapte ao nível de confiança e fase de evolução dela
- Incorpore aprendizados de feedbacks anteriores
- Se houver frustração identificada, aborde isso no look

Crie um look ULTRA-PERSONALIZADO que reflita todo esse conhecimento profundo sobre ela.

RESPONDA EM JSON:
{
  "outfit_name": "nome do look",
  "occasion": "ocasião",
  "complete_outfit": {
    "existing_pieces": [
      {"item": "descrição", "reason": "por que funciona"}
    ],
    "new_pieces": [
      {"item": "descrição", "why_needed": "por que é importante", "color": "cor"}
    ]
  },
  "styling_tips": ["dica1", "dica2", "dica3"],
  "color_harmony": "explicação das cores",
  "confidence_score": "percentage como 85%",
  "personal_note": "mensagem personalizada para a cliente"
}`;
    } else if (request_type === 'feedback') {
      prompt = `Você é um consultor de moda pessoal especialista em feedback construtivo.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season}

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

${conversationContext}

O cliente descreveu este look: "${outfit_description}"

Forneça feedback detalhado e construtivo sobre este outfit, incluindo melhorias sugeridas.

RESPONDA EM JSON:
{
  "overall_assessment": "avaliação geral",
  "what_works": ["aspecto positivo 1", "aspecto positivo 2"],
  "improvements": [
    {"area": "área para melhorar", "suggestion": "como melhorar", "why": "razão"}
  ],
  "alternative_pieces": [
    {"original": "peça original", "suggestion": "alternativa", "reason": "razão"}
  ],
  "score_before": "score% antes",
  "score_after": "score% depois de implementar sugestões",
  "encouraging_note": "mensagem motivadora"
}`;
    } else if (request_type === 'new_pieces' || request_type === 'shopping_suggestions') {
      prompt = `Você é um consultor de moda especialista em recomendações de compra estratégica ULTRA-PERSONALIZADA.

PERFIL COMPLETO DA CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação de Cores: ${colorAnalysis?.recommended_season || 'Não especificado'}
Cores Recomendadas: ${clientData.recommended_colors?.join(', ') || 'N/A'}
Cores a Evitar: ${clientData.colors_to_avoid?.join(', ') || 'N/A'}
Estilo Dominante: ${styleQuiz?.consultant_style || styleQuiz?.style_type || 'Não especificado'}
Preferências de Estilo: ${clientData.style_preferences?.join(', ') || 'N/A'}
Medidas: Busto ${clientData.bust}cm, Cintura ${clientData.waist}cm, Quadril ${clientData.hip}cm

GUARDA-ROUPA ATUAL:
${wardrobeSummary}

${deepHistoryContext}

ENGAJAMENTO RECENTE:
- Peças favoritas (virtual try-on): ${favoritePieces}
- Fotos compartilhadas (últimos 30 dias): ${recentPhotos}
- Badges conquistados: ${styleEvolution?.badges?.length || 0}

${conversationContext}

SOLICITAÇÃO: ${preferences || 'Análise completa do guarda-roupa e sugestões estratégicas'}
${event ? `Evento Específico: ${event}` : ''}
${occasion ? `Ocasião: ${occasion}` : ''}

INSTRUÇÕES AVANÇADAS COM INTEGRAÇÃO DE TENDÊNCIAS:

1. **ANÁLISE DE SENTIMENTOS**: Use os insights emocionais para entender o que realmente funciona para ela e evite repetir frustrações passadas

2. **PRIORIZAÇÃO DE TENDÊNCIAS RELEVANTES**: 
   ${currentTrends ? `- Filtre as tendências emergentes que combinam com a estação de cores dela (${colorAnalysis?.recommended_season})
   - Identifique quais cores em alta são compatíveis com suas cores recomendadas
   - Selecione peças-chave trending que se alinham com seu estilo dominante (${styleQuiz?.consultant_style || styleQuiz?.style_type})
   - CONECTE EXPLICITAMENTE cada sugestão com uma tendência específica quando aplicável` : '- Baseie-se em princípios atemporais de estilo'}

3. **ANÁLISE DE LACUNAS ESTRATÉGICAS**: Identifique o que falta no guarda-roupa atual

4. **PERSONALIZAÇÃO PROFUNDA**: Cada peça deve ser justificada com:
   - Como conecta com tendências atuais relevantes para ela
   - Como resolve suas frustrações identificadas
   - Como se alinha com seu histórico de experimentação
   - Como combina com sua estação de cores E com cores trending compatíveis

5. **VERSATILIDADE INTELIGENTE**: Priorize peças que:
   - Estão trending MAS são atemporais para o estilo dela
   - Combinam com múltiplas peças do guarda-roupa existente
   - Maximizam o retorno do investimento

6. **CONSIDERE O NÍVEL DE CONFIANÇA**: Adapte as sugestões ao nível atual dela

RESPONDA EM JSON:
{
  "wardrobe_analysis": {
    "strengths": ["ponto forte 1", "ponto forte 2"],
    "gaps": ["lacuna 1", "lacuna 2", "lacuna 3"],
    "versatility_score": "score atual 0-100",
    "trend_alignment": "como o guarda-roupa atual se alinha (ou não) com tendências relevantes"
  },
  "recommendations": [
    {
      "name": "nome específico da peça (ex: Blazer estruturado preto)",
      "category": "categoria",
      "priority": "high/medium/low",
      "why_it_fits": "CONECTE EXPLICITAMENTE: (1) Como esta peça se alinha com [tendência específica atual], (2) Como combina com sua estação de cores [estação], (3) Como resolve [frustração/lacuna específica], (4) Como se adequa ao tipo de corpo [tipo de corpo]",
      "versatility_score": 85,
      "ideal_colors": ["cor1 (trending/atemporal)", "cor2", "cor3"],
      "ideal_styles": ["estilo específico 1", "estilo específico 2"],
      "wardrobe_gap": "Qual lacuna específica preenche",
      "occasions": ["ocasião1", "ocasião2", "ocasião3"],
      "combines_with": ["peça do guarda-roupa 1", "peça do guarda-roupa 2"],
      "styling_tips": ["como usar dica 1", "como usar dica 2"],
      "investment_value": "por que vale o investimento considerando tendências + atemporalidade",
      "budget_range": "faixa de preço estimada",
      "trend_connection": "qual tendência específica atual esta peça representa (se aplicável)",
      "confidence_boost": "como esta peça pode aumentar a confiança dela"
    }
  ],
  "shopping_strategy": "estratégia de compra que PRIORIZA peças trending + versáteis + alinhadas com estação de cores",
  "impact_forecast": "impacto esperado no guarda-roupa após compras, incluindo alinhamento com tendências atuais",
  "budget_allocation": "como distribuir o orçamento priorizando peças de alta tendência + versatilidade",
  "styling_unlock": "novos looks que ficarão disponíveis, incluindo looks trending",
  "trend_integration_summary": "resumo de como as sugestões integram tendências atuais ao estilo pessoal dela"
}`;
    } else if (request_type === 'combination') {
      prompt = `Você é um especialista em combinações de roupas criativas.

CLIENTE:
Nome: ${clientData.full_name}
Tipo de Corpo: ${clientData.body_type}
Estação: ${colorAnalysis?.recommended_season}

GUARDA-ROUPA:
${wardrobeSummary}

${conversationContext}

Crie 5 combinações DIFERENTES do guarda-roupa existente, cada uma para uma ocasião diferente.

RESPONDA EM JSON:
{
  "combinations": [
    {
      "outfit_number": 1,
      "name": "nome criativo",
      "occasion": "ocasião",
      "pieces": ["peça1", "peça2", "peça3"],
      "styling_secret": "o que torna especial",
      "versatility_score": "percentage"
    }
  ],
  "general_mixing_tips": ["dica1", "dica2"],
  "maximizing_wardrobe": "como aproveitar melhor o que já tem"
}`;
    }

    const advice = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: outfit_photo_url ? [outfit_photo_url] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          outfit_name: { type: "string" },
          occasion: { type: "string" },
          complete_outfit: { type: "object" },
          styling_tips: { type: "array" },
          color_harmony: { type: "string" },
          confidence_score: { type: "string" },
          personal_note: { type: "string" },
          overall_assessment: { type: "string" },
          what_works: { type: "array" },
          outfit_analysis: { type: "string" },
          opportunities: { type: "array" },
          practical_suggestions: { type: "array" },
          alternative_combos: { type: "array" },
          encouraging_note: { type: "string" },
          rating: { type: "string" },
          improvements: { type: "array" },
          alternative_pieces: { type: "array" },
          score_before: { type: "string" },
          score_after: { type: "string" },
          recommendations: { type: "array" },
          shopping_strategy: { type: "string" },
          impact: { type: "string" },
          budget_tip: { type: "string" },
          wardrobe_analysis: { type: "object" },
          impact_forecast: { type: "string" },
          budget_allocation: { type: "string" },
          styling_unlock: { type: "string" },
          combinations: { type: "array" },
          general_mixing_tips: { type: "array" },
          maximizing_wardrobe: { type: "string" }
        }
      }
    });

    return Response.json({ data: advice });
  } catch (error) {
    console.error('Error generating style advice:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});