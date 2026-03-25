import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function PieceRecommendationsDisplay({ pieces }) {
  if (!pieces || pieces.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pieces.map((piece, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg">{piece.name}</CardTitle>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {piece.type}
                  </Badge>
                </div>
                <ShoppingBag className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Why it works */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">✨ Por que combina:</p>
                <p className="text-sm text-gray-600 leading-relaxed">{piece.why_it_works}</p>
              </div>

              {/* Colors */}
              {piece.ideal_colors?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">🎨 Cores Ideais:</p>
                  <div className="flex flex-wrap gap-1">
                    {piece.ideal_colors.map((color, i) => (
                      <Badge key={i} variant="secondary" className="text-xs capitalize">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasions */}
              {piece.occasions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">🎭 Ocasiões:</p>
                  <div className="flex flex-wrap gap-1">
                    {piece.occasions.map((occ, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {occ}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              {piece.price_range && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">💰 {piece.price_range}</p>
                </div>
              )}

              {/* Styling Tip */}
              {piece.styling_tip && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-medium text-purple-900 mb-1">💡 Dica:</p>
                  <p className="text-xs text-purple-800">{piece.styling_tip}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}