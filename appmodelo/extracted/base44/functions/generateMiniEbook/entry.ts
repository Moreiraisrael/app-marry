import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, styleQuiz, colorAnalysis, bodyType, topic } = await req.json();

    if (!clientId || !styleQuiz || !colorAnalysis || !topic) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const prompt = `Você é um especialista em consultoria de imagem e estilo. Crie um mini-ebook personalizado e prático.

PERFIL DA CLIENTE:
Tipo de Estilo: ${styleQuiz.consultant_style || 'não definido'}
Preferências: ${styleQuiz.style_preferences?.join(', ') || 'não definidas'}
Estação: ${colorAnalysis?.recommended_season || 'não definida'}
Tipo de Corpo: ${bodyType || 'não definido'}
Cores Recomendadas: ${colorAnalysis?.recommended_colors?.join(', ') || 'não definidas'}

TEMA DO MINI-EBOOK: ${topic}

CRIE:
1. Título atraente e personalizado
2. Introdução contextualizada para ela
3. 4-5 seções principais com conteúdo prático
4. Dicas específicas para seu tipo de corpo e estação
5. Exemplos com suas cores recomendadas
6. Checklist prático aplicável imediatamente
7. Conclusão motivadora

O conteúdo deve ser:
- Específico para seu perfil
- Prático e aplicável imediatamente
- Estruturado em seções curtas e digestivas
- Com exemplos visuais (descritos)
- Motivador e positivo

RESPONDA EM JSON:
{
  "mini_ebook": {
    "title": "título personalizado",
    "subtitle": "subtítulo contextualizado",
    "introduction": "introdução para a cliente",
    "sections": [
      {
        "section_number": 1,
        "title": "título da seção",
        "content": "conteúdo detalhado",
        "tips_for_her": "dicas específicas para seu perfil",
        "examples": ["exemplo com suas cores", "exemplo com seu corpo"]
      }
    ],
    "practical_checklist": ["item1", "item2", "item3"],
    "quick_wins": ["vitória rápida 1", "vitória rápida 2"],
    "conclusion": "conclusão motivadora",
    "personalization_level": "quanto foi personalizado (%)"
  }
}`;

    const miniEbook = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          mini_ebook: { type: "object" }
        }
      }
    });

    return Response.json({ data: miniEbook });
  } catch (error) {
    console.error('Error generating mini ebook:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});