import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, ShoppingBag, Loader2, Heart, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StyleProfileGenerator({ client, colorAnalysis, styleQuiz, wardrobeItems = [] }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);

  const generateStyleProfile = async () => {
    if (!client) return;

    setLoading(true);
    try {
      // Generate comprehensive style profile
      const profilePrompt = `Você é uma consultora de moda especialista. Analise os dados da cliente e crie um perfil de estilo completo e personalizado.

**DADOS DA CLIENTE:**
- Nome: ${client.full_name}
- Estação de Coloração: ${colorAnalysis?.consultant_season ? colorAnalysis.consultant_season : 'Não definida'}
- Estilo Identificado: ${styleQuiz?.consultant_style ? styleQuiz.consultant_style : 'Não definido'}
- Peças no Guarda-Roupa: ${wardrobeItems.length} itens

**ANÁLISE DE COLORAÇÃO:**
${colorAnalysis?.questionnaire_answers?.reasoning || 'Não disponível'}

**ANÁLISE DE ESTILO:**
${styleQuiz?.consultant_notes || 'Não disponível'}

**CATEGORIAS NO GUARDA-ROUPA:**
${wardrobeItems.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {})}

Crie um perfil de estilo DETALHADO com:

1. **Essência do Estilo**: Descreva a essência única do estilo da cliente em 2-3 frases inspiradoras
2. **DNA de Estilo**: 5-7 características principais que definem seu estilo
3. **Arquétipos de Moda**: Quais arquétipos de moda ela incorpora (ex: A Clássica, A Criativa, A Elegante)
4. **Paleta de Cores Ideal**: Com base na estação, liste as melhores cores
5. **Cores a Evitar**: Cores que não favorecem
6. **Silhuetas Favoritas**: Que tipos de cortes e shapes funcionam melhor
7. **Acessórios Chave**: Que acessórios completam seu estilo
8. **Marcas Recomendadas**: 5-8 marcas que se alinham ao estilo dela
9. **Ícones de Estilo**: 3-5 personalidades/celebridades com estilo similar para inspiração
10. **Evolução do Estilo**: Como ela pode evoluir seu estilo mantendo sua essência`;

      const profileResult = await base44.integrations.Core.InvokeLLM({
        prompt: profilePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            essence: { type: "string" },
            style_dna: { type: "array", items: { type: "string" } },
            fashion_archetypes: { type: "array", items: { type: "string" } },
            ideal_colors: { type: "array", items: { type: "string" } },
            colors_to_avoid: { type: "array", items: { type: "string" } },
            favorite_silhouettes: { type: "array", items: { type: "string" } },
            key_accessories: { type: "array", items: { type: "string" } },
            recommended_brands: { type: "array", items: { type: "string" } },
            style_icons: { type: "array", items: { type: "string" } },
            style_evolution: { type: "string" }
          }
        }
      });

      setProfile(profileResult);

      // Generate clothing recommendations
      const recoPrompt = `Com base no perfil de estilo da cliente, sugira peças específicas de vestuário e combinações.

**ESTILO:** ${styleQuiz?.consultant_style || 'Não definido'}
**ESTAÇÃO:** ${colorAnalysis?.consultant_season || 'Não definida'}

**O QUE ELA JÁ TEM:**
${wardrobeItems.map(item => `- ${item.category}: ${item.color || 'cor não especificada'}`).join('\n')}

IMPORTANTE: Responda TUDO em português brasileiro.

Sugira:
1. **Peças Essenciais Faltando**: 5-7 itens que completariam o guarda-roupa
2. **Combinações Prontas**: 5 looks completos usando o que ela tem + sugestões
3. **Peças Statement**: 3 peças destaque que elevariam o guarda-roupa
4. **Basics Necessários**: Itens básicos que toda pessoa desse estilo precisa`;

      const recoResult = await base44.integrations.Core.InvokeLLM({
        prompt: recoPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            missing_essentials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            outfit_combinations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  pieces: { type: "array", items: { type: "string" } },
                  occasion: { type: "string" }
                }
              }
            },
            statement_pieces: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            basics_needed: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRecommendations(recoResult);

      // Trend analysis
      const trendPrompt = `Analise as tendências de moda atuais (2026) e compare com o estilo da cliente.

**ESTILO DA CLIENTE:** ${styleQuiz?.consultant_style || 'Não definido'}

IMPORTANTE: Responda TUDO em português brasileiro.

Forneça:
1. **Tendências Alinhadas**: 3-5 tendências atuais que combinam com o estilo dela
2. **Tendências a Evitar**: 2-3 tendências que não se alinham
3. **Como Adaptar Tendências**: Como incorporar tendências mantendo a autenticidade
4. **Tendências Futuras**: O que vem por aí que ela deveria saber
5. **Insights de Mercado**: Análise de marcas e produtos em alta que fazem sentido para ela`;

      const trendResult = await base44.integrations.Core.InvokeLLM({
        prompt: trendPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            aligned_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  why_works: { type: "string" },
                  how_to_wear: { type: "string" }
                }
              }
            },
            trends_to_avoid: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            adaptation_tips: { type: "string" },
            future_trends: { type: "array", items: { type: "string" } },
            market_insights: { type: "string" }
          }
        }
      });

      setTrendAnalysis(trendResult);

      toast.success('Perfil de estilo gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar perfil de estilo');
    }
    setLoading(false);
  };

  if (!profile && !loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-2xl font-bold mb-2">Análise Profissional de Estilo</h3>
          <p className="text-gray-600 mb-6">
            Gere uma análise de estilo completa com recomendações personalizadas, análise de tendências e insights de moda
          </p>
          <Button 
            onClick={generateStyleProfile}
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-12 px-8"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Gerar Análise de Estilo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Analisando Estilo...</h3>
          <p className="text-gray-600">
            Criando análise completa de estilo com recomendações personalizadas e insights de moda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Análise Profissional de Estilo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 bg-gray-100">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Essence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Essência do Estilo
                </h3>
                <p className="text-gray-700 italic leading-relaxed">{profile?.essence}</p>
              </motion.div>

              {/* Style DNA */}
              <div>
                <h3 className="text-lg font-semibold mb-3">DNA de Estilo</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {profile?.style_dna?.map((trait, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 p-3 bg-white rounded-lg border"
                    >
                      <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{trait}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Fashion Archetypes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Arquétipos de Moda</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.fashion_archetypes?.map((arch, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 px-4 py-2">
                      {arch}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">✓ Cores Ideais</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.ideal_colors?.map((color, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700">{color}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">✗ Cores a Evitar</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.colors_to_avoid?.map((color, i) => (
                      <Badge key={i} className="bg-red-100 text-red-700">{color}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Silhouettes & Accessories */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Silhuetas Favoritas</h3>
                  <ul className="space-y-2">
                    {profile?.favorite_silhouettes?.map((sil, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        {sil}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Acessórios Chave</h3>
                  <ul className="space-y-2">
                    {profile?.key_accessories?.map((acc, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        {acc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Brands & Icons */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Marcas Recomendadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.recommended_brands?.map((brand, i) => (
                      <Badge key={i} variant="outline">{brand}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ícones de Estilo</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.style_icons?.map((icon, i) => (
                      <Badge key={i} className="bg-amber-100 text-amber-700">{icon}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evolution */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">Evolução do Estilo</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{profile?.style_evolution}</p>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {/* Missing Essentials */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Peças Essenciais Faltando</h3>
                <div className="space-y-3">
                  {recommendations?.missing_essentials?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white rounded-lg border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.item}</h4>
                        <Badge className={
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.reason}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Outfit Combinations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Combinações Prontas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations?.outfit_combinations?.map((outfit, i) => (
                    <Card key={i} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-base">{outfit.name}</CardTitle>
                        <Badge variant="outline">{outfit.occasion}</Badge>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {outfit.pieces?.map((piece, j) => (
                            <li key={j} className="text-sm text-gray-700">• {piece}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Statement Pieces */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Peças Statement</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {recommendations?.statement_pieces?.map((piece, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{piece.item}</h4>
                      <p className="text-sm text-gray-700">{piece.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basics Necessários</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations?.basics_needed?.map((basic, i) => (
                    <Badge key={i} variant="outline" className="px-4 py-2">{basic}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Aligned Trends */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Tendências que Combinam com Você
                </h3>
                <div className="space-y-4">
                  {trendAnalysis?.aligned_trends?.map((trend, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <h4 className="font-semibold text-green-900 mb-2">{trend.trend}</h4>
                      <p className="text-sm text-green-800 mb-2">{trend.why_works}</p>
                      <p className="text-sm text-green-700">
                        <strong>Como usar:</strong> {trend.how_to_wear}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trends to Avoid */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tendências a Evitar</h3>
                <div className="space-y-3">
                  {trendAnalysis?.trends_to_avoid?.map((trend, i) => (
                    <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-1">{trend.trend}</h4>
                      <p className="text-sm text-red-700">{trend.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adaptation Tips */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">
                  Como Adaptar Tendências
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                  {trendAnalysis?.adaptation_tips}
                </p>
              </div>

              {/* Future Trends */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tendências Futuras</h3>
                <div className="flex flex-wrap gap-2">
                  {trendAnalysis?.future_trends?.map((trend, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 px-4 py-2">
                      {trend}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Market Insights */}
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-amber-900">
                  Insights de Mercado
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                  {trendAnalysis?.market_insights}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={generateStyleProfile}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Nova Análise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}