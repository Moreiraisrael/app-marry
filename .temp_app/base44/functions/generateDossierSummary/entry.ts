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

    // Buscar histórico de consultas
    const appointments = await base44.entities.Appointment.filter({
      client_id: clientId
    }, '-date');

    // Buscar recomendações de ebooks
    const ebookRecs = await base44.entities.EbookRecommendation.filter({
      client_id: clientId,
      status: 'active'
    });

    // Buscar mensagens
    const messages = await base44.entities.ChatMessage.filter({
      client_id: clientId
    }, '-created_date');

    if (!colorAnalysis || !styleQuiz) {
      return Response.json({ 
        error: 'Incomplete profile - missing color analysis or style quiz' 
      }, { status: 400 });
    }

    // Gerar resumo visual com IA
    const prompt = `Você é uma consultora de imagem experiente. Crie um RESUMO VISUAL e EXECUTIVO do dossiê desta cliente em PORTUGUÊS:

**Perfil da Cliente:** ${clients.full_name}

**Estação de Cores:** ${colorAnalysis.consultant_season}
**Análise de Cor (Resumo):** ${colorAnalysis.questionnaire_answers?.summary || 'Não disponível'}

**Estilo Pessoal:** ${styleQuiz.consultant_style}
**Observações da Consultora:** ${styleQuiz.consultant_notes || 'Sem observações'}

**Histórico:**
- Total de Consultas: ${appointments.length}
- Ebooks Recomendados: ${ebookRecs.length}
- Mensagens Trocadas: ${messages.length}

**GERE:**
1. **Resumo Executivo**: Parágrafo único (2-3 linhas) capturando a essência do estilo da cliente
2. **Destaques Visuais**: 4-5 elementos chave que definem o look dela
3. **Paleta de Cores Resumida**: 3-5 cores principais mais impactantes
4. **Tendências Aplicáveis**: 3-4 tendências 2026 que funcionam melhor para ela
5. **Próximos Passos Recomendados**: 2-3 ações para evoluir seu estilo
6. **Pontos Fortes de Estilo**: 3 coisas que a cliente já faz bem
7. **Dica de Estilo do Momento**: Uma recomendação prática e inspiradora

Seja CONCISO, VISUAL e MOTIVADOR.`;

    const summary = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          visual_highlights: { type: "array", items: { type: "string" } },
          color_palette: { type: "array", items: { type: "string" } },
          applicable_trends: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } },
          style_strengths: { type: "array", items: { type: "string" } },
          style_tip_of_month: { type: "string" }
        }
      }
    });

    // Gerar imagem do mood board integrado
    const moodBoardPrompt = `Create a stunning professional fashion dossier cover image for ${clients.full_name}.
Style: Elegant, sophisticated, modern fashion editorial aesthetic.
Include visual elements representing: ${styleQuiz.consultant_style} style, ${colorAnalysis.consultant_season} color palette, luxury and professionalism.
Make it aspirational, trendy and inspirational for 2026.`;

    const moodBoardImage = await base44.integrations.Core.GenerateImage({
      prompt: moodBoardPrompt
    });

    return Response.json({
      success: true,
      summary: {
        ...summary,
        cover_image: moodBoardImage.url,
        generated_at: new Date().toISOString(),
        client_name: clients.full_name,
        season: colorAnalysis.consultant_season,
        style: styleQuiz.consultant_style,
        interaction_history: {
          total_appointments: appointments.length,
          recent_appointments: appointments.slice(0, 3).map(a => ({
            date: a.date,
            service_type: a.service_type,
            status: a.status
          })),
          total_ebook_recommendations: ebookRecs.length,
          total_messages: messages.length
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});