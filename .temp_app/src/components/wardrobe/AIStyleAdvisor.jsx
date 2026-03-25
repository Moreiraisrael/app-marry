import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, Lightbulb, TrendingDown, Map, Target } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AIStyleAdvisor({ wardrobeItems, clientData, colorAnalysis, styleQuiz }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState(null);

  const generateAdvice = async () => {
    setAnalyzing(true);
    try {
      // Prepare wardrobe data
      const wardrobeByCategory = wardrobeItems.reduce((acc, item) => {
        const cat = item.category || 'outros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          color: item.color,
          subcategory: item.subcategory,
          season_match: item.season_match,
          style_match: item.style_match
        });
        return acc;
      }, {});

      const prompt = `You are an expert personal stylist. Analyze this client's wardrobe and provide comprehensive styling advice:

**Client Profile:**
- Color Season: ${clientData?.season || 'Not analyzed'}
- Personal Style: ${styleQuiz?.consultant_style || 'Not defined'}
- Body Type: ${clientData?.body_type || 'Not specified'}

**Color Analysis Notes:**
${colorAnalysis?.consultant_notes || 'No specific notes'}

**Current Wardrobe:**
Total items: ${wardrobeItems.length}
Items matching season: ${wardrobeItems.filter(i => i.season_match).length}
Items matching style: ${wardrobeItems.filter(i => i.style_match).length}

Categories breakdown:
${Object.entries(wardrobeByCategory).map(([cat, items]) => 
  `${cat}: ${items.length} items (${items.map(i => i.color).filter(Boolean).join(', ')})`
).join('\n')}

Provide:
1. Wardrobe analysis: strengths and weaknesses
2. 6 complete outfit combinations for different occasions (work, casual, formal, weekend, date, sport)
3. Wardrobe gaps: missing essential items
4. Shopping recommendations: specific items to buy that complement existing pieces
5. Styling tips: how to maximize current wardrobe
6. Color mixing guide: which colors from wardrobe work together
7. Wardrobe sentiment: identify underutilized pieces and why they might not be worn
8. Style evolution roadmap: a 6-month plan to evolve the client's style`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            wardrobe_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            underutilized_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  color: { type: "string" },
                  why_not_worn: { type: "string" },
                  how_to_revive: { type: "string" },
                  sentiment: { type: "string" }
                }
              }
            },
            outfit_combinations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  occasion: { type: "string" },
                  name: { type: "string" },
                  pieces: { type: "array", items: { type: "string" } },
                  why_works: { type: "string" },
                  styling_tips: { type: "string" },
                  confidence_score: { type: "number" }
                }
              }
            },
            wardrobe_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  budget_estimate: { type: "string" }
                }
              }
            },
            shopping_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  why_needed: { type: "string" },
                  how_to_style: { type: "string" },
                  color_suggestions: { type: "array", items: { type: "string" } },
                  complements: { type: "array", items: { type: "string" } }
                }
              }
            },
            styling_tips: { type: "array", items: { type: "string" } },
            color_combinations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  colors: { type: "array", items: { type: "string" } },
                  vibe: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            },
            style_evolution_roadmap: {
              type: "object",
              properties: {
                current_style_summary: { type: "string" },
                aspirational_style: { type: "string" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      focus: { type: "string" },
                      actions: { type: "array", items: { type: "string" } },
                      milestones: { type: "array", items: { type: "string" } },
                      investment_items: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setAdvice(result);
      toast.success('Análise completa gerada!');
    } catch (error) {
      toast.error('Erro ao gerar análise');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!advice) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Assistente de Estilo Pessoal com IA
          </CardTitle>
          <p className="text-sm text-gray-600">
            Análise completa do guarda-roupa com recomendações personalizadas de looks e peças
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-700 mb-6 max-w-lg mx-auto">
              A IA irá analisar cada peça do guarda-roupa e criar um guia completo de estilo com:
              <br/>• Combinações de looks para diferentes ocasiões
              <br/>• Análise de pontos fortes e fracos
              <br/>• Sugestões de compras estratégicas
              <br/>• Dicas de como maximizar o guarda-roupa atual
            </p>
            <Button
              onClick={generateAdvice}
              disabled={analyzing || wardrobeItems.length === 0}
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando Guarda-Roupa...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Análise Completa
                </>
              )}
            </Button>
            {wardrobeItems.length === 0 && (
              <p className="text-sm text-amber-600 mt-4">
                Adicione peças ao guarda-roupa para começar a análise
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Wardrobe Score */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Pontuação do Guarda-Roupa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={advice.wardrobe_score} className="flex-1 h-3" />
            <span className="text-3xl font-bold text-purple-600">{advice.wardrobe_score}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {advice.wardrobe_score >= 80 ? 'Excelente! Seu guarda-roupa está muito bem equilibrado.' :
             advice.wardrobe_score >= 60 ? 'Bom! Algumas melhorias podem elevar ainda mais seu estilo.' :
             'Há oportunidades para otimizar e expandir seu guarda-roupa estrategicamente.'}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advice.strengths?.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Oportunidades de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advice.weaknesses?.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 font-bold mt-0.5">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <Tabs defaultValue="outfits">
            <TabsList className="grid grid-cols-6 w-full mb-6">
              <TabsTrigger value="outfits">Looks</TabsTrigger>
              <TabsTrigger value="underused">Subutilizadas</TabsTrigger>
              <TabsTrigger value="gaps">Lacunas</TabsTrigger>
              <TabsTrigger value="shopping">Compras</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="tips">Dicas</TabsTrigger>
            </TabsList>

            {/* Outfit Combinations */}
            <TabsContent value="outfits" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Combinações de Looks Personalizadas</h3>
              {advice.outfit_combinations?.map((outfit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="mb-2">{outfit.occasion}</Badge>
                      <h4 className="font-semibold text-lg text-gray-900">{outfit.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{outfit.confidence_score}%</div>
                      <p className="text-xs text-gray-500">confiança</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Peças:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {outfit.pieces?.map((piece, i) => (
                        <div key={i} className="text-sm bg-purple-50 px-3 py-2 rounded">
                          • {piece}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-purple-100 p-3 rounded">
                      <p className="text-xs font-semibold text-purple-900 mb-1">Por que funciona:</p>
                      <p className="text-sm text-gray-700">{outfit.why_works}</p>
                    </div>
                    <div className="bg-pink-100 p-3 rounded">
                      <p className="text-xs font-semibold text-pink-900 mb-1">💡 Dica de styling:</p>
                      <p className="text-sm text-gray-700">{outfit.styling_tips}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Underutilized Items */}
            <TabsContent value="underused" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Peças Subutilizadas no Guarda-Roupa</h3>
              <p className="text-sm text-gray-600 mb-4">
                A IA identificou peças que podem não estar sendo usadas com frequência e sugere formas de revitalizá-las.
              </p>
              {advice.underutilized_items?.length > 0 ? (
                <div className="space-y-3">
                  {advice.underutilized_items.map((item, idx) => (
                    <Card key={idx} className="border-2 border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <TrendingDown className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {item.category} {item.color && `- ${item.color}`}
                                </h4>
                                <Badge className="mt-1 bg-orange-100 text-orange-700">
                                  {item.sentiment === 'forgotten' ? 'Esquecida' :
                                   item.sentiment === 'outdated' ? 'Desatualizada' :
                                   item.sentiment === 'uncomfortable' ? 'Desconfortável' : 'Pouco usada'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="bg-white p-3 rounded">
                                <strong className="text-orange-900">Por que não é usada:</strong>
                                <p className="text-gray-700 mt-1">{item.why_not_worn}</p>
                              </div>
                              
                              <div className="bg-white p-3 rounded">
                                <strong className="text-orange-900">💡 Como revitalizar:</strong>
                                <p className="text-gray-700 mt-1">{item.how_to_revive}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <p className="text-green-800 font-medium">
                      Ótimo! Todas as peças parecem estar sendo bem aproveitadas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Wardrobe Gaps */}
            <TabsContent value="gaps" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Peças Essenciais que Faltam</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {advice.wardrobe_gaps?.map((gap, idx) => (
                  <Card key={idx} className="border-2 border-rose-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{gap.item}</h4>
                        <Badge className={
                          gap.priority === 'high' ? 'bg-red-100 text-red-700' :
                          gap.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {gap.priority === 'high' ? 'Alta' : gap.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gap.reason}</p>
                      <p className="text-xs text-gray-500">
                        <strong>Orçamento estimado:</strong> {gap.budget_estimate}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Shopping Recommendations */}
            <TabsContent value="shopping" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Recomendações de Compras Estratégicas</h3>
              {advice.shopping_recommendations?.map((rec, idx) => (
                <Card key={idx} className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{rec.item}</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="bg-white p-2 rounded">
                            <strong className="text-amber-900">Por que você precisa:</strong>
                            <p className="text-gray-700 mt-1">{rec.why_needed}</p>
                          </div>
                          
                          <div className="bg-white p-2 rounded">
                            <strong className="text-amber-900">Como usar:</strong>
                            <p className="text-gray-700 mt-1">{rec.how_to_style}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <strong className="text-amber-900 w-full text-xs">Cores sugeridas:</strong>
                            {rec.color_suggestions?.map((color, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>

                          <div>
                            <strong className="text-amber-900 text-xs">Combina com:</strong>
                            <p className="text-xs text-gray-600 mt-1">
                              {rec.complements?.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Style Evolution Roadmap */}
            <TabsContent value="roadmap" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Roadmap de Evolução de Estilo</h3>
              
              {advice.style_evolution_roadmap && (
                <div className="space-y-6">
                  {/* Current & Aspirational */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-sm">Estilo Atual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {advice.style_evolution_roadmap.current_style_summary}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          Estilo Aspiracional
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {advice.style_evolution_roadmap.aspirational_style}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Roadmap Phases */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                      <CardTitle className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-purple-600" />
                        Plano de 6 Meses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {advice.style_evolution_roadmap.phases?.map((phase, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative pl-8 pb-6 border-l-2 border-purple-300 last:border-l-0 last:pb-0"
                          >
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow" />
                            
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <Badge className="mb-2 bg-purple-600">{phase.month}</Badge>
                                  <h4 className="font-semibold text-lg text-gray-900">{phase.focus}</h4>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-3 gap-3 mt-4">
                                <div className="bg-white p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Ações:</p>
                                  <ul className="space-y-1">
                                    {phase.actions?.map((action, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                        <span className="text-purple-500 mt-0.5">•</span>
                                        <span>{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Marcos:</p>
                                  <ul className="space-y-1">
                                    {phase.milestones?.map((milestone, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>{milestone}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Investimentos:</p>
                                  <ul className="space-y-1">
                                    {phase.investment_items?.map((item, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                        <ShoppingBag className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Styling Tips */}
            <TabsContent value="tips" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Dicas para Maximizar Seu Guarda-Roupa</h3>
              
              {/* General Tips */}
              <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <Lightbulb className="w-5 h-5" />
                    Dicas Gerais de Styling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {advice.styling_tips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg">
                        <span className="text-indigo-600 font-bold text-lg">{idx + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Color Combinations */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    🎨 Guia de Combinações de Cores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {advice.color_combinations?.map((combo, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {combo.colors?.map((color, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-700">
                              {color}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{combo.vibe}</p>
                        <p className="text-xs text-gray-600">Ideal para: {combo.best_for}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={() => setAdvice(null)}
        className="w-full"
        size="lg"
      >
        Gerar Nova Análise
      </Button>
    </motion.div>
  );
}