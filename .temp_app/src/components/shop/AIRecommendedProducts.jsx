import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AIRecommendedProducts({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz,
  products,
  onAddToCart,
  stores
}) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generateAIShoppingRecommendations', {
          clientId,
          clientData,
          wardrobeItems,
          colorAnalysis,
          styleQuiz
        });
        setRecommendations(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar recomendações');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadRecommendations();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-purple-600 animate-spin" />
          <p className="text-gray-600">Analisando seu guarda-roupa e gerando recomendações...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="space-y-6">
      {/* Header with Strategy */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Peças Essenciais Recomendadas</h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  {recommendations.shopping_strategy}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Pieces */}
      <div className="space-y-3">
        {recommendations.recommended_pieces?.map((piece, idx) => {
          // Find matching products from the store
          const matchingProducts = products.filter(product =>
            product.category === piece.category &&
            (piece.ideal_colors.some(color =>
              product.colors?.some(c => c.toLowerCase().includes(color.toLowerCase()))
            ) || piece.ideal_colors.includes(product.colors?.[0]))
          ).slice(0, 3);

          const priorityColor = {
            high: 'border-red-300 bg-red-50',
            medium: 'border-amber-300 bg-amber-50',
            low: 'border-blue-300 bg-blue-50'
          }[piece.priority] || 'border-gray-300 bg-gray-50';

          const priorityLabel = {
            high: '⚡ Alta Prioridade',
            medium: '📌 Média Prioridade',
            low: '💡 Baixa Prioridade'
          }[piece.priority];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${priorityColor}`}>
                <CardContent
                  className="p-4"
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{piece.name}</h3>
                        <Badge className={
                          piece.priority === 'high' ? 'bg-red-600 text-white' :
                          piece.priority === 'medium' ? 'bg-amber-600 text-white' :
                          'bg-blue-600 text-white'
                        }>
                          {priorityLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{piece.reason}</p>

                      {/* Colors */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {piece.ideal_colors.map((color, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">
                            ✓ {color}
                          </Badge>
                        ))}
                        {piece.avoid_colors?.length > 0 && (
                          <Badge key="avoid" variant="outline" className="text-xs text-red-600 bg-red-50">
                            ✗ Evite {piece.avoid_colors[0]}
                          </Badge>
                        )}
                      </div>

                      {/* Occasions & Versatility */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        {piece.occasions?.length > 0 && (
                          <span>🎭 {piece.occasions.slice(0, 2).join(', ')}</span>
                        )}
                        {piece.versatility_score && (
                          <span>⭐ Versatilidade: {piece.versatility_score}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section */}
                  {expandedIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                    >
                      {/* Style Tip */}
                      {piece.style_tip && (
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs font-medium text-gray-900 mb-1">💡 Dica de Styling:</p>
                          <p className="text-xs text-gray-700">{piece.style_tip}</p>
                        </div>
                      )}

                      {/* Matching Products */}
                      {matchingProducts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-900 mb-2">
                            🛍️ Produtos Disponíveis na Loja:
                          </p>
                          <div className="space-y-2">
                            {matchingProducts.map(product => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-900">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    R$ {product.price.toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || '');
                                  }}
                                >
                                  Adicionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No matching products message */}
                      {matchingProducts.length === 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">
                            Nenhum produto correspondente no catálogo atual. 
                            Use as palavras-chave para buscar: <strong>{piece.search_keywords?.slice(0, 2).join(', ')}</strong>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Budget Tip */}
      {recommendations.budget_allocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💰 Alocação de Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {recommendations.budget_allocation}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}