import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, ExternalLink, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart, stores, recommended }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');

  const store = stores?.find(s => s.id === product.partner_store_id);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setShowDetails(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
          onClick={() => setShowDetails(true)}
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart className="w-16 h-16" />
              </div>
            )}
            
            {recommended && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-pink-600">
                <Sparkles className="w-3 h-3 mr-1" />
                Para Você
              </Badge>
            )}
            
            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-purple-600">
                <Star className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.name}
            </h3>
            
            {store && (
              <p className="text-xs text-gray-500 mb-2">{store.name}</p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-rose-600">
                R$ {product.price.toFixed(2)}
              </p>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
                className="bg-gradient-to-r from-rose-500 to-pink-600"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-gray-300" />
                </div>
              )}
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full aspect-square object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-rose-600 mb-2">
                  R$ {product.price.toFixed(2)}
                </p>
                {store && (
                  <p className="text-sm text-gray-600">
                    Vendido por: <span className="font-semibold">{store.name}</span>
                  </p>
                )}
              </div>
              
              {product.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}
              
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tamanho</h4>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Cor</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}
                </Button>
                
                {product.external_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(product.external_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver na Loja
                  </Button>
                )}
              </div>
              
              {product.stock > 0 && product.stock < 5 && (
                <p className="text-sm text-amber-600">
                  ⚠️ Apenas {product.stock} unidades disponíveis
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}