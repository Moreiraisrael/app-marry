import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Package,
  ExternalLink,
  Upload,
  Check,
  Sparkles,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductRecommendationForm({ clientId, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    image: '',
    link: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const { data: affiliateProducts = [] } = useQuery({
    queryKey: ['affiliate-products-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const products = await base44.entities.AffiliateProduct.filter({ 
        is_active: true,
        stock_available: true
      });
      return products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
    },
    enabled: searchTerm.length >= 2
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['active-partners'],
    queryFn: () => base44.entities.PartnerAffiliate.filter({ status: 'active' })
  });

  const createRecommendationMutation = useMutation({
    mutationFn: async (productData) => {
      // Create shopping list item for client
      const shoppingLists = await base44.entities.ShoppingList.filter({ 
        client_id: clientId,
        status: 'active'
      });

      let shoppingList = shoppingLists[0];
      
      if (!shoppingList) {
        shoppingList = await base44.entities.ShoppingList.create({
          client_id: clientId,
          title: 'Recomendações da Consultora',
          generated_by_ai: false,
          status: 'active'
        });
      }

      const newItem = {
        name: productData.name,
        category: productData.category || 'outros',
        priority: 'high',
        reason: productData.notes || 'Recomendado pela consultora',
        product_links: productData.link ? [{
          store: productData.partner_name || 'Loja Parceira',
          url: productData.link,
          image: productData.image
        }] : [],
        purchased: false,
        ai_suggested: false
      };

      const currentItems = shoppingList.items || [];
      await base44.entities.ShoppingList.update(shoppingList.id, {
        items: [...currentItems, newItem]
      });

      // Award points to consultant if it's an affiliate product
      if (productData.is_affiliate) {
        const user = await base44.auth.me();
        const pointsRecords = await base44.entities.ConsultantPoints.filter({ 
          consultant_id: user.email 
        });
        
        if (pointsRecords[0]) {
          const points = pointsRecords[0];
          const earnedPoints = 10; // 10 points per recommendation
          
          const history = points.points_history || [];
          history.push({
            date: new Date().toISOString(),
            points: earnedPoints,
            type: 'earned',
            source: 'product_recommendation',
            description: `Recomendação de produto: ${productData.name}`
          });

          await base44.entities.ConsultantPoints.update(points.id, {
            total_points: points.total_points + earnedPoints,
            available_points: points.available_points + earnedPoints,
            lifetime_points: points.lifetime_points + earnedPoints,
            points_history: history
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('Produto recomendado com sucesso! +10 pontos');
      setSelectedProduct(null);
      setManualData({ name: '', image: '', link: '', notes: '' });
      setSearchTerm('');
      setShowSearch(false);
      if (onSuccess) onSuccess();
    }
  });

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    const partner = partners.find(p => p.id === product.partner_id);
    setManualData({
      name: product.name,
      image: product.images?.[0] || '',
      link: product.affiliate_link,
      notes: ''
    });
  };

  const handleRecommend = () => {
    if (!manualData.name) {
      toast.error('Informe o nome do produto');
      return;
    }

    const partner = selectedProduct ? partners.find(p => p.id === selectedProduct.partner_id) : null;

    createRecommendationMutation.mutate({
      ...manualData,
      category: selectedProduct?.category,
      partner_name: partner?.company_name,
      is_affiliate: !!selectedProduct
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setManualData({ ...manualData, image: data.file_url });
      toast.success('Imagem carregada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
  };

  return (
    <Card className="border-amber-500/20 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Recomendar Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="affiliate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="affiliate">
              <Star className="w-4 h-4 mr-2" />
              Lojas Parceiras
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Upload className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="affiliate" className="space-y-4">
            {!showSearch && !selectedProduct && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <p className="text-gray-600 mb-4">
                  Busque produtos das lojas parceiras afiliadas
                </p>
                <Button
                  onClick={() => setShowSearch(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Mostre-me Opções
                </Button>
              </div>
            )}

            {showSearch && !selectedProduct && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produto (ex: vestido, blusa, calça...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {affiliateProducts.length > 0 && (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {affiliateProducts.map((product, idx) => {
                      const partner = partners.find(p => p.id === product.partner_id);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSelectProduct(product)}
                          className="flex gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-amber-50 hover:border-amber-300 border-2 border-transparent transition-all"
                        >
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                {partner?.company_name}
                              </Badge>
                              <span className="text-sm font-bold text-amber-600">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {searchTerm.length >= 2 && affiliateProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Tente outra busca ou adicione manualmente
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedProduct && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Produto Selecionado</span>
                  </div>
                  <div className="flex gap-3">
                    {manualData.image && (
                      <img src={manualData.image} alt={manualData.name} className="w-20 h-20 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium">{manualData.name}</p>
                      <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                <Textarea
                  placeholder="Observações/motivo da recomendação (opcional)"
                  value={manualData.notes}
                  onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                  className="h-20"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleRecommend}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                    disabled={createRecommendationMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Recomendar à Cliente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(null);
                      setManualData({ name: '', image: '', link: '', notes: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Input
              placeholder="Nome do produto"
              value={manualData.name}
              onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="product-image"
              />
              <label htmlFor="product-image">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {manualData.image ? 'Alterar Imagem' : 'Fazer Upload da Imagem'}
                  </span>
                </Button>
              </label>
              {manualData.image && (
                <img src={manualData.image} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
              )}
            </div>

            <Input
              placeholder="Link do produto (opcional)"
              value={manualData.link}
              onChange={(e) => setManualData({ ...manualData, link: e.target.value })}
            />

            <Textarea
              placeholder="Observações/motivo da recomendação"
              value={manualData.notes}
              onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
              className="h-20"
            />

            <Button
              onClick={handleRecommend}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={!manualData.name || createRecommendationMutation.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Recomendar à Cliente
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}