import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Palette, 
  ShoppingBag, 
  Sparkles, 
  RefreshCw,
  Star,
  Target,
  Lightbulb,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StyleTrends() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: trendsData, isLoading, error, refetch } = useQuery({
    queryKey: ['fashionTrends', refreshKey],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeFashionTrends', {});
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24 * 7 // 7 dias
  });

  const handleRefresh = async () => {
    toast.info('Analisando tendências atualizadas...');
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Analisando tendências de moda atuais...</p>
              <p className="text-sm text-gray-500 mt-2">Consultando artigos, redes sociais e desfiles</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">Erro ao carregar tendências. Tente novamente.</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trends = trendsData?.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tendências de Estilo
                </h1>
                <p className="text-gray-600">Análise em tempo real de moda e estilo</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
          
          {trends.analysis_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Última atualização: {new Date(trends.analysis_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="trends" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="w-4 h-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="pieces" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Peças-Chave
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Emerging Trends */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4">
              {trends.emerging_trends?.map((trend, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-xl">
                            {idx < 3 && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
                            {trend.name}
                          </CardTitle>
                          <CardDescription className="mt-2 text-base">
                            {trend.description}
                          </CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-0">
                          {trend.popularity_score}% popularidade
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Elements */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Elementos-Chave
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trend.key_elements?.map((element, i) => (
                            <Badge key={i} variant="outline" className="bg-purple-50">
                              {element}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Styling Tips */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Como Usar
                        </h4>
                        <ul className="space-y-1">
                          {trend.styling_tips?.map((tip, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Target Audience */}
                      {trend.target_audience && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-gray-500">
                            Público-alvo: <span className="font-medium text-gray-700">{trend.target_audience}</span>
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Seasonal Colors */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.seasonal_colors?.map((color, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    <div 
                      className="h-32 w-full"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{color.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 font-mono">{color.hex_code}</p>
                      <p className="text-sm text-gray-600 mb-3">{color.description}</p>
                      {color.best_for && color.best_for.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Ideal para:</p>
                          <div className="flex flex-wrap gap-1">
                            {color.best_for.map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Key Pieces */}
          <TabsContent value="pieces" className="space-y-4">
            <div className="grid gap-4">
              {trends.key_pieces?.map((piece, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-pink-500" />
                            {piece.piece}
                          </h3>
                          <p className="text-gray-600 mb-3">{piece.why_trending}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-purple-600 mb-1">
                            Versatilidade
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            {piece.versatility}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Como usar:</span>
                          <p className="text-sm text-gray-600 mt-1">{piece.how_to_wear}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {piece.price_range}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Style Insights */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Vibe Geral da Estação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg">{trends.style_insights?.overall_vibe}</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Do's */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    Aposte Em
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {trends.style_insights?.dos_and_donts?.dos?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Don'ts */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    Evite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {trends.style_insights?.dos_and_donts?.donts?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sustainability Focus */}
            {trends.style_insights?.sustainability_focus && (
              <Card className="border-0 shadow-lg bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    🌱 Foco em Sustentabilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{trends.style_insights.sustainability_focus}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}