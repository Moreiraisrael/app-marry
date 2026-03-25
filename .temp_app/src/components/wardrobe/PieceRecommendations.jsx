import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { AlertCircle, ShoppingBag } from 'lucide-react';

export default function PieceRecommendations({ recommendations }) {
  if (!recommendations) return null;

  return (
    <div className="space-y-6">
      {/* Critical Gaps */}
      {recommendations.critical_gaps?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Lacunas Críticas para Preencher
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Essas peças são fundamentais para completar o estilo
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.critical_gaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{gap.piece}</h4>
                      <p className="text-sm text-gray-700 mt-1">{gap.why_needed}</p>
                    </div>
                    <Badge className="bg-red-600 text-white flex-shrink-0">Crítica</Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    {gap.ideal_colors?.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">🎨 Cores Recomendadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {gap.ideal_colors.map((color, i) => (
                            <Badge key={i} variant="outline" className="capitalize">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {gap.style_details && (
                      <div>
                        <p className="font-medium text-gray-700">✨ Detalhes de Estilo:</p>
                        <p className="text-gray-600">{gap.style_details}</p>
                      </div>
                    )}

                    {gap.versatility && (
                      <div>
                        <p className="font-medium text-gray-700">🔄 Versatilidade:</p>
                        <p className="text-gray-600">{gap.versatility}</p>
                      </div>
                    )}

                    {gap.occasions?.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700">🎭 Ocasiões:</p>
                        <div className="flex flex-wrap gap-1">
                          {gap.occasions.map((occ, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {occ}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Occasion Gaps */}
      {recommendations.occasion_gaps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎭 Peças para Ocasiões Específicas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Complemente looks para momentos especiais
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.occasion_gaps.map((gap, idx) => (
                  <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{gap.occasion}</h4>
                    <p className="text-sm text-gray-700 mb-3">{gap.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">👗 Peças Sugeridas:</p>
                        <ul className="space-y-1">
                          {gap.suggested_pieces?.map((piece, i) => (
                            <li key={i} className="flex gap-2">
                              <ShoppingBag className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span>{piece}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {gap.color_palette && (
                        <div>
                          <p className="font-medium text-gray-700">🎨 Paleta de Cores:</p>
                          <p className="text-gray-600">{gap.color_palette}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Styling Tips */}
      {recommendations.styling_tips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle>💡 Dicas de Styling</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.styling_tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-blue-600 font-semibold flex-shrink-0">→</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}