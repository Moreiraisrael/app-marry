import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Sparkles, Loader2, Download, ExternalLink, Eye, Heart, Share2, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function TrendAnalyzer({ client, colorAnalysis, styleQuiz }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);

  const analyzeTrends = async () => {
    if (!client) return;

    setLoading(true);
    try {
      // Buscar tendências atuais com contexto da internet
      const trendPrompt = `Você é uma analista de tendências de moda especializada. Faça uma análise COMPLETA e ATUALIZADA das tendências de moda para 2026.

**FONTES A CONSULTAR:**
- Vogue, Elle, Harper's Bazaar (últimas edições)
- Instagram e Pinterest (fashion trends)
- Semanas de moda de Paris, Milão, Nova York, Londres
- Blogs de moda influentes
- TikTok fashion trends

**PERFIL DA CLIENTE:**
- Estilo: ${styleQuiz?.consultant_style || 'Não definido'}
- Estação de Coloração: ${colorAnalysis?.consultant_season || 'Não definida'}
- Nome: ${client.full_name}

IMPORTANTE: Responda TUDO em português brasileiro. Use nomes de marcas, tendências e termos em português.

**ANÁLISE REQUERIDA:**

1. **Macro Tendências 2026**: 5-7 principais tendências globais de moda
2. **Micro Tendências Emergentes**: 3-5 tendências específicas que estão surgindo
3. **Tendências por Categoria**: 
   - Cores (Pantone 2026, paletas em alta)
   - Tecidos e texturas
   - Silhuetas e cortes
   - Estampas e padrões
   - Acessórios must-have
4. **Tendências Sustentáveis**: Movimento eco-friendly na moda
5. **Influenciadores de Tendências**: Celebridades, designers, influencers

Para CADA tendência, analise:
- Compatibilidade com o perfil da cliente (0-100%)
- Como adaptar ao estilo pessoal dela
- Nível de ousadia (conservador, moderado, ousado)
- Durabilidade (passageira, sazonal, atemporal)
- Onde encontrar peças

Seja ESPECÍFICA, ATUAL e PRÁTICA.`;

      const trendResult = await base44.integrations.Core.InvokeLLM({
        prompt: trendPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            macro_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  compatibility: { type: "number" },
                  adaptation_tips: { type: "string" },
                  boldness_level: { type: "string" },
                  durability: { type: "string" },
                  key_pieces: { type: "array", items: { type: "string" } },
                  where_to_find: { type: "array", items: { type: "string" } },
                  inspiration_sources: { type: "array", items: { type: "string" } }
                }
              }
            },
            micro_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  origin: { type: "string" },
                  compatibility: { type: "number" },
                  how_to_wear: { type: "string" }
                }
              }
            },
            color_trends: {
              type: "object",
              properties: {
                pantone_2026: { type: "string" },
                trending_palettes: { type: "array", items: { type: "string" } },
                colors_for_client: { type: "array", items: { type: "string" } }
              }
            },
            fabric_trends: { type: "array", items: { type: "string" } },
            silhouette_trends: { type: "array", items: { type: "string" } },
            pattern_trends: { type: "array", items: { type: "string" } },
            accessory_trends: { type: "array", items: { type: "string" } },
            sustainable_trends: { type: "string" },
            influencers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  why_relevant: { type: "string" }
                }
              }
            },
            personalized_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  action: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Gerar múltiplos mood boards visuais personalizados
      const moodBoardPrompts = [
        {
          name: "Tendências Globais 2026",
          prompt: `Create a high-fashion mood board image representing the TOP 3 fashion trends for 2026. 
Style: Editorial fashion photography, Vogue-style, sophisticated, trendy.
Include: Color palettes, textures, silhouettes, key pieces.
Make it visually stunning and inspirational for ${client.full_name}.`
        },
        {
          name: "Paleta de Cores Tendência",
          prompt: `Create a sophisticated color palette mood board for 2026 trends.
Show beautiful color combinations, fabric swatches, and elegant arrangements.
Focus on luxury fashion aesthetics with trending colors and tones.`
        }
      ];

      const moodBoardImages = await Promise.all(
        moodBoardPrompts.map(async (board) => {
          const { url } = await base44.integrations.Core.GenerateImage({
            prompt: board.prompt
          });
          return { name: board.name, url };
        })
      );
      
      const moodBoardImage = moodBoardImages[0];

      setAnalysis({
        ...trendResult,
        mood_board: moodBoardImage.url,
        mood_boards: moodBoardImages,
        generated_at: new Date().toISOString()
      });

      toast.success('Análise de tendências completa!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao analisar tendências');
    }
    setLoading(false);
  };

  const downloadReport = () => {
    const reportContent = JSON.stringify(analysis, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-tendencias-${client?.full_name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Relatório baixado!');
  };

  if (!analysis && !loading) {
    return (
      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 h-2" />
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Análise de Tendências 2026
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Descubra as últimas tendências de moda de Vogue, Instagram, semanas de moda e blogs especializados, personalizadas para o perfil da cliente
          </p>
          <Button 
            onClick={analyzeTrends}
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-12 px-8 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analisar Tendências com IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-6 text-purple-600 animate-spin" />
          <h3 className="text-2xl font-semibold mb-3">Analisando Tendências Globais...</h3>
          <p className="text-gray-600 mb-6">
            Consultando Vogue, Instagram, blogs de moda e semanas de moda internacionais
          </p>
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Analisando feeds de moda...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Identificando tendências emergentes...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Personalizando recomendações...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBoldnessColor = (level) => {
    if (level === 'ousado') return 'bg-red-100 text-red-700';
    if (level === 'moderado') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 h-2" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Relatório de Tendências 2026</h2>
              <p className="text-sm text-gray-600">
                Gerado em {new Date(analysis.generated_at).toLocaleDateString('pt-BR')} • Personalizado para {client?.full_name}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={downloadReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Baixar Relatório
              </Button>
              <Button onClick={analyzeTrends} variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Boards Visuais */}
      <div className="grid md:grid-cols-2 gap-6">
        {analysis.mood_boards?.map((board, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl group"
          >
            <img 
              src={board.url} 
              alt={board.name} 
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-xl font-bold">{board.name}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="macro" className="space-y-6">
        <TabsList className="grid grid-cols-4 bg-gray-100">
          <TabsTrigger value="macro">Macro Tendências</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="personalized">Personalizado</TabsTrigger>
          <TabsTrigger value="influencers">Influenciadores</TabsTrigger>
        </TabsList>

        {/* Macro Trends */}
        <TabsContent value="macro" className="space-y-4">
          {analysis.macro_trends?.map((trend, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-2 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedTrend(trend)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{trend.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{trend.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getCompatibilityColor(trend.compatibility)}>
                        {trend.compatibility}% compatível
                      </Badge>
                      <Badge className={getBoldnessColor(trend.boldness_level)}>
                        {trend.boldness_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Alinhamento com perfil</span>
                      <span className="font-medium">{trend.compatibility}%</span>
                    </div>
                    <Progress value={trend.compatibility} className="h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        Como Adaptar
                      </h4>
                      <p className="text-sm text-gray-700">{trend.adaptation_tips}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Durabilidade
                      </h4>
                      <Badge variant="outline">{trend.durability}</Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2">Peças Chave:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.key_pieces?.map((piece, j) => (
                        <Badge key={j} variant="outline">{piece}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2">Onde Encontrar:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.where_to_find?.map((place, j) => (
                        <Badge key={j} className="bg-blue-100 text-blue-700">{place}</Badge>
                      ))}
                    </div>
                  </div>

                  {trend.inspiration_sources?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Fontes de Inspiração:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.inspiration_sources.map((source, j) => (
                          <Badge key={j} className="bg-purple-100 text-purple-700">{source}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Category Trends */}
        <TabsContent value="categories" className="space-y-6">
          {/* Colors */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                Tendências de Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Pantone 2026:</h4>
                <Badge className="text-lg px-4 py-2">{analysis.color_trends?.pantone_2026}</Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Paletas em Alta:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.color_trends?.trending_palettes?.map((palette, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700">{palette}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cores Ideais para a Cliente:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.color_trends?.colors_for_client?.map((color, i) => (
                    <Badge key={i} className="bg-green-100 text-green-700">{color}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Tecidos & Texturas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.fabric_trends?.map((fabric, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      {fabric}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Silhuetas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.silhouette_trends?.map((silhouette, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-pink-600" />
                      {silhouette}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Estampas & Padrões</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.pattern_trends?.map((pattern, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Acessórios Must-Have</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.accessory_trends?.map((accessory, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                      {accessory}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sustainable */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-900">🌱 Moda Sustentável</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 leading-relaxed whitespace-pre-line">
                {analysis.sustainable_trends}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalized */}
        <TabsContent value="personalized" className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">Recomendações Personalizadas</h3>
            <p className="text-gray-700">
              Baseado no estilo {styleQuiz?.consultant_style} e estação {colorAnalysis?.consultant_season}
            </p>
          </div>

          {analysis.personalized_recommendations?.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border-2 ${
                rec.priority === 'high' ? 'border-red-300 bg-red-50' :
                rec.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                'border-blue-300 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.trend}</h4>
                      <p className="text-sm text-gray-700">{rec.action}</p>
                    </div>
                    <Badge className={
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Micro Trends */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Tendências Emergentes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.micro_trends?.map((trend, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{trend.name}</h4>
                      <Badge className={getCompatibilityColor(trend.compatibility)}>
                        {trend.compatibility}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Origem: {trend.origin}</p>
                    <p className="text-sm text-gray-700">{trend.how_to_wear}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Influencers */}
        <TabsContent value="influencers" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.influencers?.map((influencer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-bold mb-1">{influencer.name}</h4>
                    <Badge className="mb-3">{influencer.category}</Badge>
                    <p className="text-sm text-gray-600">{influencer.why_relevant}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}