import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedEbookRecommendations({ clientId, styleQuiz, colorAnalysis, bodyType, ebooks }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('recommendPersonalizedEbooks', {
        clientId,
        styleQuiz,
        colorAnalysis,
        bodyType,
        availableEbooks: ebooks
      });
      setRecommendations(data);
      toast.success('Recomendações geradas!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar recomendações');
    } finally {
      setLoading(false);
    }
  };

  if (!recommendations && !loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ebooks Personalizados</h3>
          <p className="text-gray-600 mb-6">Descubra ebooks especialmente selecionados para seu estilo</p>
          <Button onClick={loadRecommendations} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Gerar Recomendações
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
          <p className="text-gray-600">Analisando seu perfil...</p>
        </CardContent>
      </Card>
    );
  }

  const recs = recommendations?.personalized_recommendations || [];
  const readingOrder = recommendations?.reading_order || [];

  const importanceColors = {
    essencial: 'bg-red-100 text-red-800',
    importante: 'bg-yellow-100 text-yellow-800',
    complementar: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="space-y-6">
      {/* Insights */}
      {recommendations?.personalization_insights && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-gray-900">{recommendations.personalization_insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Reading Order */}
      {readingOrder && readingOrder.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Ordem de Leitura Recomendada</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {readingOrder.map((title, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="font-bold w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  {title}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {recs.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      {rec.ebook_title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{rec.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{rec.relevance_score}%</div>
                    <p className="text-xs text-gray-600">Relevância</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Why Perfect */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Por que é perfeito para você</p>
                  <p className="text-sm text-gray-700">{rec.why_perfect}</p>
                </div>

                {/* How It Helps */}
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Como vai ajudar</p>
                  <p className="text-sm text-gray-700">{rec.how_it_helps}</p>
                </div>

                {/* Key Topics */}
                {rec.key_topics && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Temas abordados</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.key_topics.map((topic, tidx) => (
                        <Badge key={tidx} variant="outline" className="bg-gray-50">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Importance & Impact */}
                <div className="flex items-center justify-between border-t pt-4">
                  <Badge className={importanceColors[rec.importance_level] || 'bg-gray-100'}>
                    {rec.importance_level}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    <Zap className="w-4 h-4 inline mr-1 text-yellow-500" />
                    {rec.estimated_impact}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Complementary Resources */}
      {recommendations?.complementary_resources && (
        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Recursos Complementares:</span> {recommendations.complementary_resources}
            </p>
          </CardContent>
        </Card>
      )}

      <Button onClick={loadRecommendations} variant="outline" className="w-full">
        Regenerar Recomendações
      </Button>
    </div>
  );
}