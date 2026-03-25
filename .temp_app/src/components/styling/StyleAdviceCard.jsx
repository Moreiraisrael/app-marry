import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';

export default function StyleAdviceCard({ advice, requestType }) {
  if (!advice) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-0 shadow-lg h-full overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Outfit Request */}
        {requestType === 'outfit' && advice.outfit_name && (
          <>
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-lg">{advice.outfit_name}</CardTitle>
              {advice.confidence_score && (
                <Badge className="w-fit mt-2 bg-green-600 text-white">
                  {advice.confidence_score} confiança
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Existing Pieces */}
              {advice.complete_outfit?.existing_pieces?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Do Seu Guarda-Roupa
                  </p>
                  <div className="space-y-2">
                    {advice.complete_outfit.existing_pieces.map((piece, i) => (
                      <div key={i} className="p-2 bg-green-50 rounded-lg text-sm border border-green-200">
                        <p className="font-medium text-green-900">{piece.item}</p>
                        <p className="text-xs text-green-800 mt-1">{piece.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Pieces */}
              {advice.complete_outfit?.new_pieces?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    Peças Sugeridas
                  </p>
                  <div className="space-y-2">
                    {advice.complete_outfit.new_pieces.map((piece, i) => (
                      <div key={i} className="p-2 bg-blue-50 rounded-lg text-sm border border-blue-200">
                        <p className="font-medium text-blue-900">{piece.item}</p>
                        <p className="text-xs text-blue-800 mt-1">{piece.why_needed}</p>
                        {piece.color && (
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                            {piece.color}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Harmony */}
              {advice.color_harmony && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-900 mb-1">🎨 Harmonia de Cores:</p>
                  <p className="text-xs text-amber-800">{advice.color_harmony}</p>
                </div>
              )}

              {/* Styling Tips */}
              {advice.styling_tips?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-2">✨ Dicas de Styling:</p>
                  <ul className="space-y-1">
                    {advice.styling_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-purple-600">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* Feedback Request */}
        {requestType === 'feedback' && advice.overall_assessment && (
          <>
            <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
              <CardTitle className="text-lg">Análise do Outfit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-gray-700 leading-relaxed">{advice.overall_assessment}</p>

              {/* What Works */}
              {advice.what_works?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    O Que Funciona
                  </p>
                  <ul className="space-y-1">
                    {advice.what_works.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {advice.improvements?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Melhorias Sugeridas
                  </p>
                  <div className="space-y-2">
                    {advice.improvements.map((imp, i) => (
                      <div key={i} className="p-2 bg-amber-50 rounded-lg text-sm border border-amber-200">
                        <p className="font-medium text-amber-900">{imp.area}</p>
                        <p className="text-xs text-amber-800 mt-1">{imp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scores */}
              {(advice.score_before || advice.score_after) && (
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  {advice.score_before && (
                    <div className="p-2 bg-gray-100 rounded">
                      <p className="text-gray-600 text-xs">Antes</p>
                      <p className="font-bold text-gray-900">{advice.score_before}</p>
                    </div>
                  )}
                  {advice.score_after && (
                    <div className="p-2 bg-green-100 rounded">
                      <p className="text-green-600 text-xs">Depois</p>
                      <p className="font-bold text-green-900">{advice.score_after}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* New Pieces Request */}
        {requestType === 'new_pieces' && advice.recommendations?.length > 0 && (
          <>
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
              <CardTitle className="text-lg">Recomendações de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {advice.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-gray-900">{rec.piece}</p>
                  <p className="text-xs text-gray-700 mt-1">{rec.why_it_completes}</p>

                  {rec.ideal_colors?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Cores:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.ideal_colors.map((color, j) => (
                          <Badge key={j} variant="outline" className="text-xs capitalize">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.versatility && (
                    <p className="text-xs text-green-800 mt-2">
                      <strong>Versatilidade:</strong> {rec.versatility}
                    </p>
                  )}
                </div>
              ))}

              {advice.shopping_strategy && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900 mb-1">🎯 Estratégia:</p>
                  <p className="text-xs text-purple-800">{advice.shopping_strategy}</p>
                </div>
              )}

              {advice.budget_tip && (
                <div className="p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                  💰 {advice.budget_tip}
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* Combinations Request */}
        {requestType === 'combination' && advice.combinations?.length > 0 && (
          <>
            <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
              <CardTitle className="text-lg">Combinações Criativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {advice.combinations.map((combo, i) => (
                <div key={i} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900">{combo.name}</p>
                    {combo.versatility_score && (
                      <Badge className="text-xs bg-pink-600 text-white flex-shrink-0">
                        {combo.versatility_score}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-pink-700 mb-2">{combo.occasion}</p>
                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Peças:</strong> {combo.pieces?.join(', ')}
                  </p>
                  {combo.styling_secret && (
                    <p className="text-xs text-pink-800 italic">
                      ✨ {combo.styling_secret}
                    </p>
                  )}
                </div>
              ))}

              {advice.general_mixing_tips?.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mt-3">
                  <p className="text-sm font-medium text-purple-900 mb-2">Dicas Gerais:</p>
                  <ul className="space-y-1">
                    {advice.general_mixing_tips.map((tip, i) => (
                      <li key={i} className="text-xs text-purple-800 flex gap-2">
                        <span className="flex-shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
}