import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Package,
  BarChart3,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Upload,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerPortal() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check if user is a partner
        const partners = await base44.entities.PartnerAffiliate.filter({ email: userData.email });
        if (partners[0]) {
          setPartner(partners[0]);
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: ['partner-products', partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      return await base44.entities.AffiliateProduct.filter({ partner_id: partner.id }, '-created_date');
    },
    enabled: !!partner
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['partner-commissions', partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      return await base44.entities.AffiliateCommission.filter({ partner_id: partner.id }, '-created_date');
    },
    enabled: !!partner
  });

  const addProductMutation = useMutation({
    mutationFn: (productData) => base44.entities.AffiliateProduct.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-products'] });
      setShowAddProduct(false);
      toast.success('Produto adicionado com sucesso!');
    }
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    affiliate_link: '',
    colors: [],
    suitable_seasons: [],
    suitable_styles: []
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addProductMutation.mutate({
      ...newProduct,
      partner_id: partner.id,
      price: parseFloat(newProduct.price),
      commission_rate: partner.commission_rate
    });
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
    </div>;
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h2 className="text-2xl font-bold text-neutral-100 mb-2">Acesso Restrito</h2>
              <p className="text-neutral-400 mb-6">
                Este portal é exclusivo para parceiros afiliados. Entre em contato para se tornar um parceiro.
              </p>
              <Button onClick={() => base44.auth.logout()} variant="outline">
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = {
    totalSales: commissions.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.sale_amount, 0),
    totalCommission: commissions.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.commission_amount, 0),
    pendingCommission: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0),
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalClicks: products.reduce((sum, p) => sum + (p.clicks || 0), 0),
    conversionRate: products.reduce((sum, p) => sum + (p.clicks || 0), 0) > 0 
      ? ((products.reduce((sum, p) => sum + (p.sales || 0), 0) / products.reduce((sum, p) => sum + (p.clicks || 0), 0)) * 100).toFixed(1)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {partner.logo && (
              <img src={partner.logo} alt={partner.company_name} className="w-16 h-16 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">{partner.company_name}</h1>
              <p className="text-neutral-400">Portal de Parceiro</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => base44.auth.logout()}>
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Vendas Totais</p>
                  <p className="text-2xl font-bold text-neutral-100">R$ {stats.totalSales.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Comissão Confirmada</p>
                  <p className="text-2xl font-bold text-neutral-100">R$ {stats.totalCommission.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Visualizações</p>
                  <p className="text-2xl font-bold text-neutral-100">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-neutral-100">{stats.conversionRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-xl border border-amber-500/20">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Comissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-100">Meus Produtos ({products.length})</h2>
              <Button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-gradient-to-r from-amber-600 to-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>

            {showAddProduct && (
              <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-neutral-100">Novo Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nome do Produto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Preço (R$)"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="bg-neutral-900 text-neutral-100 border-neutral-700"
                    />
                    <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                      <SelectTrigger className="bg-neutral-900 text-neutral-100 border-neutral-700">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blusa">Blusa</SelectItem>
                        <SelectItem value="vestido">Vestido</SelectItem>
                        <SelectItem value="calca">Calça</SelectItem>
                        <SelectItem value="sapato">Sapato</SelectItem>
                        <SelectItem value="acessorio">Acessório</SelectItem>
                        <SelectItem value="bolsa">Bolsa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Link de Afiliado"
                    value={newProduct.affiliate_link}
                    onChange={(e) => setNewProduct({ ...newProduct, affiliate_link: e.target.value })}
                    className="bg-neutral-900 text-neutral-100 border-neutral-700"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="bg-gradient-to-r from-amber-600 to-amber-700">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Produto
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-neutral-100 mb-2">{product.name}</h3>
                    <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-amber-400">R$ {product.price.toFixed(2)}</span>
                      <Badge className="bg-amber-500/20 text-amber-400">
                        {product.commission_rate}% comissão
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-neutral-900 rounded">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <p className="text-neutral-400">{product.views || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-neutral-900 rounded">
                        <MousePointerClick className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <p className="text-neutral-400">{product.clicks || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-neutral-900 rounded">
                        <ShoppingCart className="w-4 h-4 mx-auto mb-1 text-green-400" />
                        <p className="text-neutral-400">{product.sales || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="border-amber-500/20 bg-black/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-neutral-100">Histórico de Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions.map(commission => (
                    <div key={commission.id} className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-100">
                          Venda: R$ {commission.sale_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {new Date(commission.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">
                          +R$ {commission.commission_amount.toFixed(2)}
                        </p>
                        <Badge className={
                          commission.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          commission.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}