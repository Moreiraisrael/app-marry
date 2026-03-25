import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingBag, Star } from 'lucide-react';

export default function BrandRecommendationsDisplay({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {brands.map((brand, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {brand.brand_name}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {brand.price_range}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Style Description */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">🎨 Estilo:</p>
                <p className="text-sm text-gray-700">{brand.style}</p>
              </div>

              {/* Why Perfect */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-1">✓ Por que é perfeita:</p>
                <p className="text-sm text-green-800 leading-relaxed">{brand.why_perfect}</p>
              </div>

              {/* Strength Categories */}
              {brand.strength_categories?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">💪 Pontos Fortes:</p>
                  <div className="flex flex-wrap gap-1">
                    {brand.strength_categories.map((cat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Note */}
              {brand.special_note && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-purple-900 mb-1">💡 Algo Especial:</p>
                  <p className="text-xs text-purple-800">{brand.special_note}</p>
                </div>
              )}

              {/* Visit Button */}
              {brand.website && (
                <Button
                  asChild
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <a href={brand.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visitar Loja
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}