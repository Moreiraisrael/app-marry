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

    // Buscar histórico de looks gerados
    const wardrobeItems = await base44.entities.WardrobeItem.filter({
      client_id: clientId
    });

    // Buscar compras/recomendações
    const ebookRecs = await base44.entities.EbookRecommendation.filter({
      client_id: clientId
    });

    // Buscar consultas
    const appointments = await base44.entities.Appointment.filter({
      client_id: clientId
    });

    // Buscar evolução anterior
    const existingEvolution = await base44.entities.StyleEvolution.filter({
      client_id: clientId
    });

    if (!colorAnalysis || !styleQuiz) {
      return Response.json({
        error: 'Incomplete profile - missing color analysis or style quiz'
      }, { status: 400 });
    }

    const currentEvolutionLevel = existingEvolution[0]?.current_style_level || 1;
    const previousGoals = existingEvolution[0]?.long_term_goals || [];

    // Gerar evolução com IA
    const prompt = `Você é uma consultora de estilo de topo. Analise o perfil desta cliente e crie um plano de EVOLUÇÃO ESTILÍSTICA personalizado para 2026 em PORTUGUÊS:

**Perfil da Cliente:** ${clients.full_name}
**Estação:** ${colorAnalysis.consultant_season}
**Estilo Base:** ${styleQuiz.consultant_style}
**Nível Atual de Desenvolvimento:** ${currentEvolutionLevel}/10
**Consultas Realizadas:** ${appointments.length}
**Itens no Guarda-roupa:** ${wardrobeItems.length}

**Histórico:**
- Ebooks Recomendados: ${ebookRecs.length}
- Meses de acompanhamento: ${Math.ceil(appointments.length / 2) || 1}

**CRIE UM PLANO COM:**

1. **FASE ATUAL DE EVOLUÇÃO:** Determine se está em foundational (iniciante), intermediate (intermediário), advanced (avançado) ou mastery (domínio)

2. **SUGESTÕES DE EVOLUÇÃO (4-5):** Cada uma com:
   - Categoria (new_silhouette, color_exploration, pattern_mixing, accessory_evolution, occasion_expansion, designer_discovery, trend_adoption, fabric_exploration)
   - Descrição clara e inspiradora
   - Por que é importante para ela
   - Passos de implementação (3-4 passos práticos)
   - Dificuldade estimada (easy/moderate/challenging)
   - Produtos/peças para experimentar

3. **METAS DE LONGO PRAZO (3):** 
   - Descrição clara (ex: dominar pattern mixing, expandir para ocasiões formais)
   - Timeline (3_months, 6_months, 12_months)
   - Milestones específicos

4. **LACUNAS NO GUARDA-ROUPA:**
   - Categorias faltando
   - Prioridade (high/medium/low)
   - Peças recomendadas

5. **ROADMAP DE TENDÊNCIAS 2026:**
   - Safe trends: tendências que funcionam bem com o estilo dela
   - Experimental trends: aventuras criativas
   - Avoidance zones: não combina com seu estilo

6. **PRÓXIMA EXPLORAÇÃO:**
   - Tema para explorar nos próximos 3 meses
   - Descrição detalhada
   - Prompt para gerar mood board

Seja ESPECÍFICA, INSPIRADORA e PRÁTICA.`;

    const evolution = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          current_phase: {
            type: "string",
            enum: ["foundational", "intermediate", "advanced", "mastery"]
          },
          style_level_assessment: { type: "string" },
          evolution_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["new_silhouette", "color_exploration", "pattern_mixing", "accessory_evolution", "occasion_expansion", "designer_discovery", "trend_adoption", "fabric_exploration"]
                },
                suggestion: { type: "string" },
                reasoning: { type: "string" },
                implementation_steps: { type: "array", items: { type: "string" } },
                estimated_difficulty: { type: "string", enum: ["easy", "moderate", "challenging"] },
                products_to_try: { type: "array", items: { type: "string" } }
              }
            }
          },
          long_term_goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                goal: { type: "string" },
                timeline: { type: "string", enum: ["3_months", "6_months", "12_months"] },
                milestones: { type: "array", items: { type: "string" } }
              }
            }
          },
          wardrobe_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                gap_description: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                recommended_pieces: { type: "array", items: { type: "string" } }
              }
            }
          },
          trend_roadmap: {
            type: "object",
            properties: {
              safe_trends: { type: "array", items: { type: "string" } },
              experimental_trends: { type: "array", items: { type: "string" } },
              avoidance_zones: { type: "array", items: { type: "string" } }
            }
          },
          next_exploration: {
            type: "object",
            properties: {
              theme: { type: "string" },
              description: { type: "string" },
              mood_board_prompt: { type: "string" }
            }
          }
        }
      }
    });

    // Calcular novo nível
    const newLevel = Math.min(10, currentEvolutionLevel + 0.5);
    const evolutionScore = Math.round((newLevel / 10) * 100);

    // Salvar ou atualizar evolução
    let savedEvolution;
    if (existingEvolution[0]) {
      await base44.entities.StyleEvolution.update(existingEvolution[0].id, {
        evolution_phase: evolution.current_phase,
        current_style_level: newLevel,
        suggestions: evolution.evolution_suggestions.map((s, i) => ({
          id: `sug-${i}`,
          category: s.category,
          suggestion: s.suggestion,
          reasoning: s.reasoning,
          implementation_steps: s.implementation_steps,
          estimated_difficulty: s.estimated_difficulty,
          products_to_try: s.products_to_try,
          created_date: new Date().toISOString(),
          status: 'pending'
        })),
        long_term_goals: evolution.long_term_goals.map((g, i) => ({
          goal: g.goal,
          timeline: g.timeline,
          milestones: g.milestones,
          progress_percentage: i === 0 ? 25 : 0,
          created_date: new Date().toISOString()
        })),
        wardrobe_gaps: evolution.wardrobe_gaps,
        trend_adoption_roadmap: evolution.trend_roadmap,
        next_exploration: {
          theme: evolution.next_exploration.theme,
          description: evolution.next_exploration.description,
          mood_board_prompt: evolution.next_exploration.mood_board_prompt,
          start_date: new Date().toISOString().split('T')[0]
        },
        evolution_score: evolutionScore,
        last_generated_date: new Date().toISOString()
      });
      savedEvolution = existingEvolution[0].id;
    } else {
      const result = await base44.entities.StyleEvolution.create({
        client_id: clientId,
        consultant_id: clients.consultant_id,
        evolution_phase: evolution.current_phase,
        current_style_level: newLevel,
        suggestions: evolution.evolution_suggestions.map((s, i) => ({
          id: `sug-${i}`,
          category: s.category,
          suggestion: s.suggestion,
          reasoning: s.reasoning,
          implementation_steps: s.implementation_steps,
          estimated_difficulty: s.estimated_difficulty,
          products_to_try: s.products_to_try,
          created_date: new Date().toISOString(),
          status: 'pending'
        })),
        long_term_goals: evolution.long_term_goals.map((g, i) => ({
          goal: g.goal,
          timeline: g.timeline,
          milestones: g.milestones,
          progress_percentage: i === 0 ? 25 : 0,
          created_date: new Date().toISOString()
        })),
        wardrobe_gaps: evolution.wardrobe_gaps,
        trend_adoption_roadmap: evolution.trend_roadmap,
        next_exploration: {
          theme: evolution.next_exploration.theme,
          description: evolution.next_exploration.description,
          mood_board_prompt: evolution.next_exploration.mood_board_prompt,
          start_date: new Date().toISOString().split('T')[0]
        },
        evolution_score: evolutionScore,
        last_generated_date: new Date().toISOString()
      });
      savedEvolution = result.id;
    }

    return Response.json({
      success: true,
      evolution: {
        evolutionId: savedEvolution,
        phase: evolution.current_phase,
        levelAssessment: evolution.style_level_assessment,
        suggestions: evolution.evolution_suggestions,
        longTermGoals: evolution.long_term_goals,
        wardrobeGaps: evolution.wardrobe_gaps,
        trendRoadmap: evolution.trend_roadmap,
        nextExploration: evolution.next_exploration
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});