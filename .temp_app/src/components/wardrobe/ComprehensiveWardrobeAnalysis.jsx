import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, Sparkles, Zap, AlertCircle, TrendingUp, ShoppingBag, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ComprehensiveWardrobeAnalysis({ clientId, wardrobeItems, colorAnalysis, bodyType, stylePreferences }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('analyzeWardrobeComprehensive', {
        clientId,
        wardrobeItems,
        colorAnalysis,
        bodyType,
        stylePreferences
      });
      setAnalysis(data);
      toast.success('Análise de guarda-roupa concluída!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao analisar guarda-roupa');
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Análise Completa de Guarda-Roupa</h3>
          <p className="text-gray-600 mb-6">Descubra insights sobre suas peças, lacunas e oportunidades de compra</p>
          <Button onClick={loadAnalysis} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Iniciar Análise
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Analisando seu guarda-roupa...</p>
        </CardContent>
      </Card>
    );
  }

  const health = analysis?.wardrobe_health || {};
  const gaps = analysis?.wardrobe_gaps || {};
  const recommendations = analysis?.shopping_recommendations || [];
  const outfits = analysis?.outfit_suggestions || [];
  const versatile = analysis?.versatile_pieces || {};

  const healthScores = [
    { name: 'Versatilidade', value: health.versatility_score || 0 },
    { name: 'Completude', value: health.completeness_score || 0 },
    { name: 'Alinhamento', value: health.style_alignment_score || 0 }
  ];

  const priorityColors = {
    alta: 'bg-red-100 text-red-800',
    média: 'bg-yellow-100 text-yellow-800',
    baixa: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="space-y-6">
      {/* Health Dashboard */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthScores.map((score, idx) => (
          <Card key={idx} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">{score.name}</p>
              <div className="text-3xl font-bold text-purple-600 mb-3">{score.value}%</div>
              <Progress value={score.value} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="gaps">Lacunas</TabsTrigger>
          <TabsTrigger value="outfits">Looks</TabsTrigger>
          <TabsTrigger value="shopping">Compras</TabsTrigger>
          <TabsTrigger value="versatile">Coringa</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Status Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium">{health.overall_recommendation}</p>
                <p className="text-sm text-gray-600 mt-2">Ação prioritária: {health.priority_action}</p>
              </div>

              {/* Categorization Chart */}
              {analysis?.piece_categorization && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Distribuição por Estilo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analysis.piece_categorization.map((cat, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-gray-900">{cat.category}</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{cat.pieces_in_category?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Versatilidade: {cat.versatility_score}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Lacunas Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Missing Categories */}
              {gaps.missing_categories && gaps.missing_categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Categorias Faltando</h4>
                  <div className="space-y-2">
                    {gaps.missing_categories.map((gap, idx) => (
                      <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="font-medium text-red-900">{gap.category}</p>
                        <p className="text-sm text-red-700">{gap.reason}</p>
                        <Badge className="mt-2 bg-red-200 text-red-800">Impacto: {gap.impact}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Occasions */}
              {gaps.missing_occasions && gaps.missing_occasions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-orange-700">Ocasiões Não Cobertas</h4>
                  <div className="flex flex-wrap gap-2">
                    {gaps.missing_occasions.map((occasion, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-300 text-orange-700">
                        {occasion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Gaps */}
              {gaps.color_gaps && gaps.color_gaps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-yellow-700">Cores Faltando</h4>
                  <div className="flex flex-wrap gap-2">
                    {gaps.color_gaps.map((color, idx) => (
                      <Badge key={idx} variant="outline" className="border-yellow-300 text-yellow-700">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outfits Tab */}
        <TabsContent value="outfits" className="space-y-4">
          {outfits.map((outfit, idx) => (
            <Card key={idx} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{outfit.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{outfit.occasion}</Badge>
                  <Badge variant="outline">{outfit.weather}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{outfit.styling}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Peças Necessárias:</h4>
                  <div className="flex flex-wrap gap-2">
                    {outfit.pieces.map((piece, pidx) => (
                      <Badge key={pidx} className="bg-purple-100 text-purple-800">{piece}</Badge>
                    ))}
                  </div>
                </div>
                {outfit.variations && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Variações:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {outfit.variations.map((variant, vidx) => (
                        <li key={vidx}>• {variant}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Shopping Tab */}
        <TabsContent value="shopping" className="space-y-4">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{rec.piece_type}</CardTitle>
                  <Badge className={priorityColors[rec.priority] || 'bg-gray-100 text-gray-800'}>
                    Prioridade {rec.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{rec.why_needed}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Cores Ideais</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.ideal_colors?.map((color, cidx) => (
                        <Badge key={cidx} variant="outline" className="text-xs">{color}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Aumento de Versatilidade</p>
                    <p className="text-xl font-bold text-green-600 mt-1">{rec.versatility_increase}</p>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Faixa de Preço</p>
                    <p className="font-semibold text-gray-900">{rec.price_range}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {rec.where_to_buy}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Versatile Pieces Tab */}
        <TabsContent value="versatile" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Peças Coringa
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {versatile.versatility_percentage}% do seu guarda-roupa é coringa (combina com tudo)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {versatile.pieces?.map((piece, idx) => (
                <div key={idx} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-gray-900 mb-2">{piece.name}</h4>
                  <p className="text-sm text-gray-700 mb-3">{piece.reason}</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-2 rounded">
                      <p className="text-xs text-gray-600">Combinações</p>
                      <p className="font-bold text-yellow-600">{piece.max_combinations}+</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-xs text-gray-600">Estilo</p>
                      <p className="font-semibold text-sm text-gray-900">Versátil</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Como Usar:</p>
                    <div className="flex flex-wrap gap-2">
                      {piece.styling_tips?.map((tip, tidx) => (
                        <Badge key={tidx} className="bg-yellow-100 text-yellow-800 text-xs">
                          {tip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={loadAnalysis}
          variant="outline"
          className="border-purple-600 text-purple-600"
        >
          Reanalizar
        </Button>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Ir às Compras (com Recomendações)
        </Button>
      </div>
    </div>
  );
}