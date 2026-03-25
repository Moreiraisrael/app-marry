import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function CompleteLooksDisplay({ looks }) {
  if (!looks || looks.length === 0) return null;

  return (
    <div className="space-y-6">
      {looks.map((look, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    {look.name}
                  </CardTitle>
                  <Badge className="mt-2" variant="outline">
                    {look.occasion}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed">{look.description}</p>

              {/* Items Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Existing Items */}
                {look.required_items?.existing?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-3 text-sm">🏠 Do Guarda-Roupa:</p>
                    <div className="space-y-2">
                      {look.required_items.existing.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm">
                          <span className="text-green-600">✓</span>
                          <span className="text-green-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Items */}
                {look.required_items?.new?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-3 text-sm">🛍️ Peças Novas:</p>
                    <div className="space-y-2">
                      {look.required_items.new.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                          <span className="text-blue-600">+</span>
                          <span className="text-blue-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Coordination */}
              {look.color_coordination && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-900 mb-1">🎨 Harmonia de Cores:</p>
                  <p className="text-sm text-amber-800">{look.color_coordination}</p>
                </div>
              )}

              {/* Styling Advice */}
              {look.styling_advice && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900 mb-1">✨ Dicas de Styling:</p>
                  <p className="text-sm text-purple-800 leading-relaxed">{look.styling_advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}