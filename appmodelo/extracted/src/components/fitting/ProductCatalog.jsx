import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCatalog({ clientData, onSelectProduct, onTryOn }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'blusa', label: 'Blusas' },
    { value: 'vestido', label: 'Vestidos' },
    { value: 'calca', label: 'Calças' },
    { value: 'saia', label: 'Saias' },
    { value: 'casaco', label: 'Casacos' },
  ];

  const searchProducts = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a catalog of 6-8 fashion products suitable for a client with this profile:
      
      Client Style: ${clientData?.season || 'versatile'}
      Body Type: ${clientData?.body_type || 'balanced'}
      ${searchQuery ? `Search query: ${searchQuery}` : ''}
      ${selectedCategory !== 'all' ? `Category: ${selectedCategory}` : ''}
      
      For each product, provide:
      - Name (descriptive and appealing)
      - Category
      - Brief description highlighting why it suits this client
      - Simulated price in BRL (realistic)
      - Color options matching their season
      - Style tags
      
      Make it realistic like an actual online store catalog.`;

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
                  category: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  colors: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  why_recommended: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Generate images for products
      const productsWithImages = await Promise.all(
        result.products.map(async (product) => {
          try {
            const imagePrompt = `Professional e-commerce product photo of a ${product.name}. 
            ${product.description}. Clean white background, studio lighting, fashion catalog style.`;
            
            const { url } = await base44.integrations.Core.GenerateImage({
              prompt: imagePrompt
            });
            
            return { ...product, image: url };
          } catch (err) {
            return { ...product, image: null };
          }
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      toast.error('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleTryOnProduct = (product) => {
    if (product.image) {
      onTryOn({
        imageUrl: product.image,
        type: product.category,
        productInfo: product
      });
    } else {
      toast.error('Produto sem imagem disponível');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos personalizados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={searchProducts}
          disabled={loading}
          className="bg-gradient-to-r from-violet-500 to-purple-600"
        >
          {loading ? (
            <>Buscando...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Buscar com IA
            </>
          )}
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {products
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .map((product, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-square bg-gray-50">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleTryOnProduct(product)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-violet-600"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Experimentar
                  </Button>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-violet-600">
                      R$ {product.price?.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  </div>
                  
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {product.colors.slice(0, 4).map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                  
                  {product.why_recommended && (
                    <div className="bg-violet-50 p-2 rounded text-xs text-violet-900 mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {product.why_recommended}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">Nenhum produto encontrado</p>
          <p className="text-sm text-gray-500">
            Use a busca com IA para encontrar produtos personalizados
          </p>
        </div>
      )}
    </div>
  );
}