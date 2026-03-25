import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles,
  Star,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedOffersCarousel({ season, style, clientId }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['personalized-offers', season, style],
    queryFn: async () => {
      const allProducts = await base44.entities.AffiliateProduct.filter({ 
        is_active: true,
        stock_available: true
      });
      
      // Score products based on season and style match
      const scored = allProducts.map(product => {
        let score = 0;
        
        // Season match
        if (product.suitable_seasons?.includes(season)) score += 50;
        
        // Style match
        if (product.suitable_styles?.includes(style)) score += 40;
        
        // Featured products
        if (product.is_featured) score += 30;
        
        // Random factor for variety
        score += Math.random() * 20;
        
        return { ...product, relevanceScore: score };
      });
      
      // Sort by relevance and return top 10
      return scored
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);
    },
    enabled: !!season || !!style
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['active-partners'],
    queryFn: () => base44.entities.PartnerAffiliate.filter({ status: 'active' })
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, products.length - 3) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= products.length - 3 ? 0 : prev + 1));
  };

  const addToCartMutation = useMutation({
    mutationFn: async (product) => {
      const carts = await base44.entities.ShoppingCart.filter({ client_id: clientId });
      const cart = carts[0];
      const partner = partners.find(p => p.id === product.partner_id);

      const newItem = {
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        price: product.sale_price || product.price,
        quantity: 1,
        partner_id: product.partner_id,
        partner_name: partner?.company_name || '',
        affiliate_link: product.affiliate_link
      };

      if (!cart) {
        return await base44.entities.ShoppingCart.create({
          client_id: clientId,
          items: [newItem]
        });
      }

      const existingItem = cart.items.find(i => i.product_id === product.id);
      let newItems;
      
      if (existingItem) {
        newItems = cart.items.map(i => 
          i.product_id === product.id 
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      } else {
        newItems = [...cart.items, newItem];
      }

      return await base44.entities.ShoppingCart.update(cart.id, { items: newItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Produto adicionado ao carrinho!');
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (product) => {
      const partner = partners.find(p => p.id === product.partner_id);
      return await base44.entities.WishList.create({
        client_id: clientId,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        price: product.sale_price || product.price,
        partner_id: product.partner_id,
        partner_name: partner?.company_name || '',
        affiliate_link: product.affiliate_link
      });
    },
    onSuccess: () => {
      toast.success('Produto adicionado à lista de desejos!');
    }
  });

  const handleProductClick = async (product) => {
    await base44.entities.AffiliateProduct.update(product.id, {
      clicks: (product.clicks || 0) + 1,
      views: (product.views || 0) + 1
    });
    window.open(product.affiliate_link, '_blank');
  };

  if (isLoading || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + 3);

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900">Ofertas Exclusivas para Você</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= products.length - 3}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Selecionadas especialmente para {season && `sua estação`}
        {season && style && ' e '}
        {style && `seu estilo ${style}`}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {visibleProducts.map((product, idx) => {
            const partner = partners.find(p => p.id === product.partner_id);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative h-64 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-amber-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      </div>
                    )}

                    {/* Sale Badge */}
                    {product.sale_price && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white">
                          -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Partner Info */}
                    {partner && (
                      <div className="flex items-center gap-2 mb-2">
                        {partner.logo && (
                          <img src={partner.logo} alt={partner.company_name} className="w-6 h-6 rounded" />
                        )}
                        <span className="text-xs text-gray-500">{partner.company_name}</span>
                      </div>
                    )}

                    {/* Product Name */}
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {product.colors.slice(0, 5).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      {product.sale_price ? (
                        <>
                          <span className="text-2xl font-bold text-red-600">
                            R$ {product.sale_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCartMutation.mutate(product)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Carrinho
                      </Button>
                      <Button
                        onClick={() => addToWishlistMutation.mutate(product)}
                        variant="outline"
                        size="icon"
                        disabled={addToWishlistMutation.isPending}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleProductClick(product)}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver na Loja
                    </Button>

                    {/* Why it's recommended */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-amber-700">
                        <strong>💡 Por que recomendamos:</strong>{' '}
                        {product.suitable_seasons?.includes(season) && 'Perfeito para sua estação'}
                        {product.suitable_seasons?.includes(season) && product.suitable_styles?.includes(style) && ' e '}
                        {product.suitable_styles?.includes(style) && `combina com seu estilo ${style}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(products.length / 3) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx * 3)}
            className={`w-2 h-2 rounded-full transition-all ${
              Math.floor(currentIndex / 3) === idx
                ? 'bg-amber-500 w-8'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}