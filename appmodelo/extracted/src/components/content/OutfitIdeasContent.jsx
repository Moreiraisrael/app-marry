import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shirt, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function OutfitIdeasContent({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz
}) {
  const [outfits, setOutfits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generatePersonalizedContent', {
          clientId,
          clientData,
          wardrobeItems,
          colorAnalysis,
          styleQuiz,
          contentType: 'outfits'
        });
        setOutfits(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar outfit ideas');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadOutfits();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
          <p className="text-gray-600">Criando outfit ideas para você...</p>
        </CardContent>
      </Card>
    );
  }

  if (!outfits?.seasonal_outfits || outfits.seasonal_outfits.length === 0) return null;

  const seasonIcon = {
    primavera: '🌸',
    verão: '☀️',
    outono: '🍂',
    inverno: '❄️'
  };

  const seasonLabel = {
    primavera: 'Primavera',
    verão: 'Verão',
    outono: 'Outono',
    inverno: 'Inverno'
  };

  return (
    <div className="space-y-6">
      {outfits.seasonal_outfits.map((outfit, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-100 to-cyan-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {seasonIcon[outfit.season] || '👗'}
                      </span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {seasonLabel[outfit.season]}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{outfit.outfit_name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toast.success('Outfit salvo aos favoritos!')}
                  >
                    <Save className="w-5 h-5 text-teal-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Occasion & Description */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  🎭 Ocasião: <span className="capitalize text-teal-700">{outfit.occasion}</span>
                </p>
                <p className="text-gray-700 leading-relaxed">{outfit.description}</p>
              </div>

              {/* Outfit Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Existing Pieces */}
                {outfit.existing_pieces?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>✓</span> Do Seu Guarda-Roupa
                    </p>
                    <div className="space-y-2">
                      {outfit.existing_pieces.map((piece, i) => (
                        <div
                          key={i}
                          className="p-2 bg-green-50 rounded-lg border border-green-200 text-sm text-green-900"
                        >
                          {piece}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Pieces */}
                {outfit.new_pieces?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>+</span> Peças Complementares
                    </p>
                    <div className="space-y-2">
                      {outfit.new_pieces.map((piece, i) => (
                        <div
                          key={i}
                          className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-900"
                        >
                          {piece}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Story */}
              {outfit.color_story && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2">🎨 Harmonia de Cores</p>
                  <p className="text-sm text-purple-800">{outfit.color_story}</p>
                </div>
              )}

              {/* Styling Tips */}
              {outfit.styling_tips?.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">✨ Dicas de Styling</p>
                  <ul className="space-y-2">
                    {outfit.styling_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-teal-600 flex-shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accessories */}
              {outfit.accessories?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-semibold text-amber-900 mb-2">💍 Acessórios</p>
                  <div className="flex flex-wrap gap-2">
                    {outfit.accessories.map((acc, i) => (
                      <Badge key={i} className="bg-amber-600 text-white">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}