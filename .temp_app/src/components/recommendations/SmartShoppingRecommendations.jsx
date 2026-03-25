import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Sparkles, Loader2, ExternalLink, Heart, Share2, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartShoppingRecommendations({ clientId, season, stylePreference }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateShoppingRecommendations', {
        clientId,
        season,
        stylePreference
      });

      setRecommendations(result.data);
      toast.success('Recomendações geradas com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar recomendações');
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'must_have') return 'bg-red-100 text-red-700 border-red-300';
    if (priority === 'high') return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'must_have') return '⭐ Essencial';
    if (priority === 'high') return '🔥 Alta';
    return '📌 Média';
  };

  const handleToggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleShare = (product) => {
    const text = `Encontrei um produto perfeito para mim: ${product.name} por ${product.brand}. Veja em: ${product.store_url}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: text,
        url: product.store_url
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Link copiado!');
    }
  };

  if (!recommendations && !loading) {
    return (
      <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 h-3" />
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recomendações Inteligentes de Compras
          </h3>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
            Descubra produtos específicos de marcas e lojas parceiras selecionados especialmente para seu estilo e coloração
          </p>
          <Button 
            onClick={generateRecommendations}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-12 px-8"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Gerar Recomendações
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-6 text-purple-600 animate-spin" />
          <h3 className="text-2xl font-semibold mb-3">Analisando Produtos...</h3>
          <p className="text-gray-600 mb-8">
            Buscando as melhores marcas e lojas parceiras para você
          </p>
          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Consultando lojas parceiras...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Filtrando por seu estilo...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Gerando imagens dos produtos...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allProducts = recommendations?.recommendations || [];
  const featuredProducts = recommendations?.featured_products || [];
  const partnerStores = recommendations?.partner_stores || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Suas Recomendações de Compras</h2>
          <p className="text-gray-600">{allProducts.length} produtos selecionados especialmente para você</p>
        </div>
        <Button 
          onClick={generateRecommendations}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Regenerar
        </Button>
      </div>

      {/* Featured Products com Imagens */}
      {featuredProducts.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Destaque - Essenciais Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <AnimatePresence>
                {featuredProducts.map((product, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                      {product.image_url && (
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => handleToggleFavorite(product.name)}
                            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all"
                          >
                            <Heart 
                              className={`w-5 h-5 ${favorites.has(product.name) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                          </button>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
                            <p className="text-sm text-purple-600 font-medium">{product.brand}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <Badge className={`${getPriorityColor(product.priority)} border`}>
                            {getPriorityLabel(product.priority)}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                        <div className="bg-purple-50 p-2 rounded mb-3">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Por que é perfeito:</p>
                          <p className="text-xs text-purple-600 line-clamp-2">{product.why_perfect}</p>
                        </div>

                        <div className="space-y-2 mb-3">
                          <p className="text-sm font-bold text-amber-600">{product.price_range}</p>
                          {product.colors_available?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.colors_available.slice(0, 3).map((color, i) => (
                                <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                  {color}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-purple-600 hover:bg-purple-700 h-8"
                            onClick={() => window.open(product.store_url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver na Loja
                          </Button>
                          <button
                            onClick={() => handleShare(product)}
                            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os Produtos em Lista */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            Todas as {allProducts.length} Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {allProducts.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx % 3) * 0.05 }}
                  className={`p-4 rounded-lg border-2 hover:shadow-md transition-all ${getPriorityColor(product.priority)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-purple-700 mb-2">{product.brand}</p>
                      <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-semibold text-amber-600">{product.price_range}</span>
                        {product.colors_available?.length > 0 && (
                          <span className="text-gray-600">
                            Cores: {product.colors_available.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(product.name)}
                        className="p-2 rounded hover:bg-white/50 transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 ${favorites.has(product.name) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(product.store_url, '_blank')}
                        className="gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Loja
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Partner Stores */}
      {partnerStores.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Lojas Parceiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {partnerStores.map((store, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {store.logo && (
                    <div className="aspect-square bg-gray-100 rounded mb-3 overflow-hidden">
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm mb-1">{store.name}</h4>
                  <Badge className="text-xs mb-2" variant="outline">{store.category}</Badge>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{store.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => window.open(store.link, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Visitar
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}