import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingBag, ExternalLink, Heart, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import Avatar3D from '@/components/virtual/Avatar3D';

export default function ProductRecommendations({ clientId, season, style, clientData, title = "Recomendações Personalizadas" }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [tryOnItem, setTryOnItem] = useState(null);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const prompt = `Gere 6 recomendações de produtos personalizadas para uma cliente com:
      ${season ? `Estação de Cores: ${season}` : ''}
      ${style ? `Estilo: ${style}` : ''}
      
      Para cada produto, forneça:
      - Nome e descrição do produto
      - Categoria (roupas, acessórios, calçados, etc)
      - Por que combina com o perfil
      - Cores sugeridas
      - Faixa de preço
      - Exemplos de lojas onde encontrar (use lojas brasileiras reais como Zara, Renner, C&A, Shoulder, Farm, etc)
      
      Foque em peças essenciais do guarda-roupa que complementam o perfil.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  reason: { type: "string" },
                  colors: { type: "array", items: { type: "string" } },
                  price_range: { type: "string" },
                  stores: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.products);
    } catch (error) {
      toast.error('Erro ao gerar recomendações');
    } finally {
      setLoading(false);
    }
  };

  const saveToShoppingList = async (product) => {
    try {
      // Check if client already has an active shopping list
      const existingLists = await base44.entities.ShoppingList.filter({ 
        client_id: clientId, 
        status: 'active' 
      });

      let listId;
      if (existingLists.length > 0) {
        // Add to existing list
        const list = existingLists[0];
        const updatedItems = [
          ...list.items,
          {
            name: product.name,
            category: product.category,
            priority: 'medium',
            reason: product.reason,
            color_suggestions: product.colors,
            budget_range: product.price_range,
            product_links: product.stores.map(store => ({ store, url: '', price: '' })),
            purchased: false
          }
        ];
        await base44.entities.ShoppingList.update(list.id, { items: updatedItems });
        listId = list.id;
      } else {
        // Create new list
        const newList = await base44.entities.ShoppingList.create({
          client_id: clientId,
          title: 'Recomendações Personalizadas',
          items: [{
            name: product.name,
            category: product.category,
            priority: 'medium',
            reason: product.reason,
            color_suggestions: product.colors,
            budget_range: product.price_range,
            product_links: product.stores.map(store => ({ store, url: '', price: '' })),
            purchased: false
          }],
          generated_by_ai: true,
          status: 'active'
        });
        listId = newList.id;
      }

      setSavedItems([...savedItems, product.name]);
      toast.success('Adicionado à lista de compras!');
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <p className="text-gray-600 mb-4">
              Descubra produtos perfeitos para este perfil!
            </p>
            <Button
              onClick={generateRecommendations}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Recomendações
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((product, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border border-purple-200 bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <Badge className="mt-1 bg-purple-100 text-purple-700">
                            {product.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveToShoppingList(product)}
                          disabled={savedItems.includes(product.name)}
                          className="text-pink-600 hover:text-pink-700"
                        >
                          <Heart className={`w-4 h-4 ${savedItems.includes(product.name) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                      <div className="bg-purple-50 p-3 rounded-lg mb-3">
                        <p className="text-xs font-semibold text-purple-700 mb-1">
                          Por que combina:
                        </p>
                        <p className="text-xs text-gray-700">{product.reason}</p>
                      </div>

                      {product.colors?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Cores sugeridas:</p>
                          <div className="flex gap-1 flex-wrap">
                            {product.colors.map((color, j) => (
                              <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span className="font-semibold">{product.price_range}</span>
                        <div className="flex gap-1">
                          {product.stores?.slice(0, 2).map((store, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {store}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTryOnItem(product)}
                          className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          3D
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.location.href = createPageUrl('Shop')}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setRecommendations(null)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={generateRecommendations}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Gerar Novas Sugestões
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Virtual Try-On 3D Avatar */}
      {tryOnItem && clientData && (
        <Avatar3D
          client={clientData}
          clothingItem={tryOnItem}
          onClose={() => setTryOnItem(null)}
        />
      )}
    </Card>
  );
}