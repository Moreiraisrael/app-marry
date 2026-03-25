import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SustainabilityAnalysis({ sustainability }) {
  if (!sustainability) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              Análise de Sustentabilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sustainability Score */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Score de Sustentabilidade</span>
                <span className="text-2xl font-bold text-green-600">
                  {sustainability.overall_score}%
                </span>
              </div>
              <Progress
                value={sustainability.overall_score}
                className="h-3 bg-green-200"
              />
              <p className="text-sm text-gray-600 mt-2">
                {sustainability.overall_assessment}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Versatilidade Média</p>
              <p className="text-3xl font-bold text-emerald-600">
                {sustainability.versatility_score}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Peças com múltiplos usos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Durabilidade Estimada</p>
              <p className="text-3xl font-bold text-blue-600">
                {sustainability.durability_score}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Qualidade dos materiais
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Potencial de Reuso</p>
              <p className="text-3xl font-bold text-purple-600">
                {sustainability.reuse_potential}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tendências atemporais
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Versatile Pieces */}
      {sustainability.versatile_pieces?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Peças Versáteis (Sustentáveis)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Peças que combinam com muitos looks
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sustainability.versatile_pieces.map((piece, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{piece.name}</h4>
                    <Badge className="bg-green-600 text-white flex-shrink-0">
                      {piece.versatility_score}% versátil
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{piece.why_versatile}</p>
                  <div className="flex flex-wrap gap-1">
                    {piece.pairing_styles?.slice(0, 3).map((style, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* High-Quality Pieces */}
      {sustainability.high_quality_pieces?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⭐ Peças Duráveis (Qualidade Alta)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Investimentos que valem a pena manter
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sustainability.high_quality_pieces.map((piece, idx) => (
                <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{piece.name}</h4>
                    <Badge className="bg-blue-600 text-white flex-shrink-0">
                      {piece.durability_years}+ anos
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{piece.quality_assessment}</p>
                  {piece.care_tips && (
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">💡 Cuidados:</p>
                      <p>{piece.care_tips}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeless Pieces */}
      {sustainability.timeless_pieces?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🕐 Peças Atemporais (Reuso Potencial)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Nunca saem de moda, sempre relevantes
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sustainability.timeless_pieces.map((piece, idx) => (
                <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-1">{piece.name}</h4>
                  <p className="text-sm text-gray-700 mb-2">{piece.timeless_reason}</p>
                  {piece.style_evolution && (
                    <p className="text-xs text-gray-600 italic">
                      "Continua relevante: {piece.style_evolution}"
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sustainability Recommendations */}
      {sustainability.recommendations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💚 Recomendações para Melhorar Sustentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sustainability.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sustainability Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Leaf className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Impacto Sustentável</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {sustainability.impact_message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}