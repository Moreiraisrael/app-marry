import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function FashionTrendsDisplay({ trends }) {
  if (!trends || trends.length === 0) return null;

  const riskLevelColors = {
    safe: 'bg-green-100 text-green-800 border-green-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    bold: 'bg-pink-100 text-pink-800 border-pink-300'
  };

  const riskLevelLabels = {
    safe: '✓ Segura',
    moderate: '⚡ Moderada',
    bold: '🔥 Ousada'
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {trends.map((trend, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                    {trend.trend_name}
                  </CardTitle>
                </div>
                <Badge className={`flex-shrink-0 ${riskLevelColors[trend.risk_level]}`}>
                  {riskLevelLabels[trend.risk_level]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed">{trend.description}</p>

              {/* Why For Client */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 Por que para você:</p>
                <p className="text-sm text-blue-800">{trend.why_for_client}</p>
              </div>

              {/* How To Implement */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">🎯 Como Usar:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{trend.how_to_implement}</p>
              </div>

              {/* Key Pieces */}
              {trend.key_pieces?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">👗 Peças-Chave:</p>
                  <div className="flex flex-wrap gap-1">
                    {trend.key_pieces.map((piece, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {piece}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Level Warning */}
              {trend.risk_level === 'bold' && (
                <div className="flex gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <AlertCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-pink-800">
                    Esta tendência é mais ousada. Comece com acessórios para testar!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}