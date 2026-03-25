import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TrendReports({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz
}) {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generatePersonalizedContent', {
          clientId,
          clientData,
          wardrobeItems,
          colorAnalysis,
          styleQuiz,
          contentType: 'trends'
        });
        setTrends(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar relatório de tendências');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadTrends();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-pink-600 animate-spin" />
          <p className="text-gray-600">Analisando tendências para você...</p>
        </CardContent>
      </Card>
    );
  }

  if (!trends) return null;

  const accessibilityColor = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-amber-100 text-amber-800',
    challenging: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      {/* Trend Report Summary */}
      {trends.trend_report && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Relatório de Tendências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-white/90">{trends.trend_report}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Individual Trends */}
      <div className="space-y-4">
        {trends.trends?.map((trend, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{trend.trend_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{trend.description}</p>
                    </div>
                    <Badge className={accessibilityColor[trend.accessibility]}>
                      {trend.accessibility === 'easy' && '✨ Fácil'}
                      {trend.accessibility === 'moderate' && '⚡ Moderado'}
                      {trend.accessibility === 'challenging' && '🎯 Desafiador'}
                    </Badge>
                  </div>

                  {trend.season_relevance && (
                    <Badge variant="outline" className="w-fit">
                      📅 {trend.season_relevance}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-6">
                {/* Why for client */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Por que combina com você
                  </p>
                  <p className="text-sm text-green-800">{trend.why_for_client}</p>
                </div>

                {/* How to adopt */}
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">💡 Como Adotar</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {trend.how_to_adopt}
                  </p>
                </div>

                {/* Key pieces */}
                {trend.key_pieces?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">👗 Peças-Chave</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.key_pieces.map((piece, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          {piece}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style examples */}
                {trend.style_examples && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-purple-900 mb-2">📸 Exemplos Práticos</p>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {trend.style_examples}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}