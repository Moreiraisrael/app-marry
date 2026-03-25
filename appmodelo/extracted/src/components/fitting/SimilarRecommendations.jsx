import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SimilarRecommendations({ triedOnItem, clientData, onTryOn }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (triedOnItem) {
      generateRecommendations();
    }
  }, [triedOnItem]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const prompt = `Based on this item that was tried on: "${triedOnItem.type || 'clothing item'}", 
      suggest 4 similar or complementary products that would match this client's profile:
      
      Client Season: ${clientData?.season || 'versatile'}
      Body Type: ${clientData?.body_type || 'balanced'}
      
      For each recommendation:
      - Suggest similar items in different colors/styles
      - Or suggest complementary pieces that complete the outfit
      - Include why it's recommended
      - Provide realistic pricing`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  reason: { type: "string" },
                  price: { type: "number" },
                  colors: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Generate images for recommendations
      const recsWithImages = await Promise.all(
        result.recommendations.map(async (rec) => {
          try {
            const { url } = await base44.integrations.Core.GenerateImage({
              prompt: `Professional e-commerce photo of ${rec.name}. Clean white background, studio lighting.`
            });
            return { ...rec, image: url };
          } catch {
            return { ...rec, image: null };
          }
        })
      );

      setRecommendations(recsWithImages);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!triedOnItem) return null;

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-violet-600" />
          Recomendações Personalizadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-3 space-y-2 group hover:shadow-md transition-all">
                {rec.image && (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                    <Button
                      size="sm"
                      onClick={() => onTryOn({ imageUrl: rec.image, type: rec.type, productInfo: rec })}
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{rec.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-1">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-violet-600">
                      R$ {rec.price?.toFixed(2)}
                    </span>
                    {rec.colors && rec.colors.length > 0 && (
                      <div className="flex gap-1">
                        {rec.colors.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">
            Experimentando uma peça para ver recomendações personalizadas
          </p>
        )}
      </CardContent>
    </Card>
  );
}