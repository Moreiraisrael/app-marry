import React from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ShoppableProductCard({ product, clientId }) {
  const handleBuyNow = async () => {
    if (product.affiliate_url || product.external_url) {
      // Track click
      try {
        const affiliateLinks = await base44.entities.AffiliateLink.filter({
          product_id: product.id
        });
        
        if (affiliateLinks.length > 0) {
          const link = affiliateLinks[0];
          await base44.entities.AffiliateLink.update(link.id, {
            clicks: (link.clicks || 0) + 1
          });
        } else if (product.affiliate_url) {
          // Create new affiliate link
          await base44.entities.AffiliateLink.create({
            product_id: product.id,
            product_name: product.name,
            product_url: product.external_url || product.affiliate_url,
            affiliate_url: product.affiliate_url,
            affiliate_code: `AFF-${product.id.substring(0, 8)}`,
            platform: product.ecommerce_platform || 'custom',
            commission_rate: product.commission_rate || 0,
            clicks: 1,
            client_id: clientId,
            is_active: true
          });
        }
      } catch (error) {
        console.error('Error tracking click:', error);
      }
      
      // Open product URL
      window.open(product.affiliate_url || product.external_url, '_blank');
      toast.success('Redirecionando para a loja...');
    } else {
      toast.error('Link de compra não disponível');
    }
  };

  const handleAddToCart = async () => {
    // Implement add to cart logic based on platform
    toast.success('Produto adicionado ao carrinho!');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
        {product.is_shoppable && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            Comprável
          </Badge>
        )}
        {product.commission_rate > 0 && (
          <Badge className="absolute top-2 left-2 bg-rose-500">
            {product.commission_rate}% comissão
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-rose-600">
            R$ {product.price?.toFixed(2)}
          </div>
          {product.ecommerce_platform && (
            <Badge variant="outline" className="text-xs">
              {product.ecommerce_platform === 'shopify' && 'Shopify'}
              {product.ecommerce_platform === 'woocommerce' && 'WooCommerce'}
              {product.ecommerce_platform === 'mercadolivre' && 'Mercado Livre'}
              {product.ecommerce_platform === 'custom' && 'Loja Parceira'}
            </Badge>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.colors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {product.is_shoppable && (product.affiliate_url || product.external_url) ? (
            <>
              <Button 
                onClick={handleBuyNow}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar Agora
              </Button>
              <Button 
                onClick={handleBuyNow}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full" size="sm" disabled>
              Indisponível
            </Button>
          )}
        </div>

        {product.affiliate_url && (
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Link de afiliado ativo
          </div>
        )}
      </CardContent>
    </Card>
  );
}