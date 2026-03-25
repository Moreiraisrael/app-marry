import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AIInsightsSection({ client, colorAnalysis, styleQuiz, wardrobeItems, appointments }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Você é uma consultora de imagem experiente. Gere insights abrangentes para esta cliente em PORTUGUÊS:

**Perfil da Cliente:**
- Estação: ${client.season || 'Não analisada'}
- Estilo: ${styleQuiz?.consultant_style || 'Não definido'}
- Tipo de Corpo: ${client.body_type || 'Não especificado'}

**Histórico de Consultorias:**
${appointments?.map(apt => `- ${apt.service_type}: ${apt.notes || 'Sem notas'}`).join('\n') || 'Sem consultorias ainda'}

**Análise do Guarda-Roupa:**
${wardrobeItems ? `${wardrobeItems.length} peças analisadas` : 'Sem análise de guarda-roupa'}
- Peças que combinam com a estação: ${wardrobeItems?.filter(i => i.season_match).length || 0}
- Peças que combinam com o estilo: ${wardrobeItems?.filter(i => i.style_match).length || 0}

**Notas da Análise de Cores:**
${colorAnalysis?.consultant_notes || 'Sem notas'}

**Notas do Questionário de Estilo:**
${styleQuiz?.consultant_notes || 'Sem notas'}

Gere insights detalhados incluindo:
1. Evolução e progresso geral de estilo
2. Pontos fortes e lacunas do guarda-roupa
3. Recomendações de estilo personalizadas
4. Próximos passos para desenvolvimento de estilo
5. Principais conclusões das consultorias

Seja específica, prática e encorajadora.
IMPORTANTE: Responda TUDO em PORTUGUÊS do Brasil.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            style_evolution: { type: "string" },
            wardrobe_strengths: { type: "array", items: { type: "string" } },
            wardrobe_gaps: { type: "array", items: { type: "string" } },
            personalized_recommendations: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } },
            key_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      toast.error('Erro ao gerar insights');
    } finally {
      setLoading(false);
    }
  };

  if (!insights) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Insights Gerados por IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Gere análises profundas com IA baseadas em todo o histórico da cliente
            </p>
            <Button
              onClick={generateInsights}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Insights...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Análise com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Assessment */}
      <Card className="border-l-4 border-purple-500">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700">Avaliação Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{insights.overall_assessment}</p>
        </CardContent>
      </Card>

      {/* Style Evolution */}
      <Card className="border-l-4 border-pink-500">
        <CardHeader>
          <CardTitle className="text-lg text-pink-700">Evolução de Estilo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{insights.style_evolution}</p>
        </CardContent>
      </Card>

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Pontos Fortes do Guarda-Roupa</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.wardrobe_strengths?.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardHeader>
            <CardTitle className="text-lg text-amber-700">Oportunidades de Melhoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.wardrobe_gaps?.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-amber-500 mt-1">→</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700">Recomendações Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.personalized_recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-500 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-l-4 border-indigo-500">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-700">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.next_steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-indigo-500 font-bold mt-1">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0">
        <CardHeader>
          <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Insights-Chave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.key_insights?.map((insight, i) => (
              <li key={i} className="bg-white/60 p-3 rounded-lg text-gray-800">
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={() => setInsights(null)}
        className="w-full"
      >
        Gerar Novos Insights
      </Button>
    </motion.div>
  );
}