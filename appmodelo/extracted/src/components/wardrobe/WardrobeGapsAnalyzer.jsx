import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, ShoppingBag, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function WardrobeGapsAnalyzer({ clientId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('analyzeWardrobeGaps', {
          clientId
        });
        setAnalysis(result.data.analysis);
      } catch (err) {
        console.error(err);
        setError(true);
        toast.error('Erro ao analisar lacunas do guarda-roupa');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadAnalysis();
    }
  }, [clientId]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Analisando seu guarda-roupa...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Wardrobe Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Resumo do Guarda-Roupa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{analysis.currentWardrobe.totalItems}</p>
              <p className="text-sm text-gray-600">Peças Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-600">{Object.keys(analysis.currentWardrobe.byCategory).length}</p>
              <p className="text-sm text-gray-600">Categorias</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {analysis.gapAnalysis.critical_gaps?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Lacunas Críticas</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {analysis.gapAnalysis.wardrobe_summary}
          </p>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      {analysis.gapAnalysis.critical_gaps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Lacunas Críticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.gapAnalysis.critical_gaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{gap.gap}</p>
                    <Badge className={
                      gap.priority === 'critical'
                        ? 'bg-red-600 text-white'
                        : gap.priority === 'high'
                        ? 'bg-orange-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }>
                      {gap.priority === 'critical' ? 'Crítica' : gap.priority === 'high' ? 'Alta' : 'Média'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{gap.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Occasion Gaps */}
      {analysis.gapAnalysis.occasion_gaps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎭 Lacunas por Ocasião
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(analysis.gapAnalysis.occasion_gaps).map(([occasion, items]) => (
                  <div key={occasion} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-gray-900 mb-2 capitalize">
                      {occasion === 'special_events' ? '✨ Eventos Especiais' : `🎪 ${occasion === 'formal' ? 'Formal' : occasion === 'business' ? 'Executivo' : 'Casual'}`}
                    </p>
                    <ul className="space-y-1">
                      {items?.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Versatility Gaps */}
      {analysis.gapAnalysis.versatility_gaps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Expandir Versatilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.gapAnalysis.versatility_gaps.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-gray-900">
                    ✨ {gap}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Priority Shopping List */}
      {analysis.gapAnalysis.priority_shopping_list?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                Top 5 Compras Prioritárias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.gapAnalysis.priority_shopping_list.map((item, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.piece}</p>
                        <p className="text-sm text-gray-700 mt-1">{item.why_important}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm ml-11">
                    {item.ideal_colors?.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">🎨 Cores Ideais:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.ideal_colors.map((color, i) => (
                            <Badge key={i} variant="outline" className="capitalize">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.styling_versatility && (
                      <div>
                        <p className="font-medium text-gray-700">💫 Versatilidade:</p>
                        <p className="text-gray-600">{item.styling_versatility}</p>
                      </div>
                    )}

                    {item.where_to_find && (
                      <div>
                        <p className="font-medium text-gray-700">🛍️ Onde Procurar:</p>
                        <p className="text-gray-600">{item.where_to_find}</p>
                      </div>
                    )}

                    {item.estimated_price_range && (
                      <Badge variant="outline">
                        💰 {item.estimated_price_range}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Missing Pieces */}
      {analysis.gapAnalysis.key_missing_pieces?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Peças-Chave Essenciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.gapAnalysis.key_missing_pieces.map((piece, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-900">✓ {piece}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}