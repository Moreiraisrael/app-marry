import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { ShoppingCart, Plus, Edit, Trash2, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EcommerceIntegrations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  
  const [formData, setFormData] = useState({
    platform: 'shopify',
    store_name: '',
    store_url: '',
    api_key: '',
    api_secret: '',
    commission_rate: 10,
    sync_products: false,
    is_active: true
  });

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['ecommerce-integrations'],
    queryFn: () => base44.entities.EcommerceIntegration.list('-created_date')
  });

  const { data: affiliateLinks = [] } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: () => base44.entities.AffiliateLink.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EcommerceIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ecommerce-integrations']);
      toast.success('Integração criada com sucesso!');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Erro ao criar integração')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EcommerceIntegration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ecommerce-integrations']);
      toast.success('Integração atualizada!');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Erro ao atualizar')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EcommerceIntegration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ecommerce-integrations']);
      toast.success('Integração removida!');
    },
    onError: () => toast.error('Erro ao remover')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIntegration) {
      updateMutation.mutate({ id: editingIntegration.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'shopify',
      store_name: '',
      store_url: '',
      api_key: '',
      api_secret: '',
      commission_rate: 10,
      sync_products: false,
      is_active: true
    });
    setEditingIntegration(null);
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setFormData(integration);
    setDialogOpen(true);
  };

  const platformLabels = {
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
    mercadolivre: 'Mercado Livre',
    custom: 'Personalizado'
  };

  const platformColors = {
    shopify: 'bg-green-100 text-green-800',
    woocommerce: 'bg-purple-100 text-purple-800',
    mercadolivre: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-gray-100 text-gray-800'
  };

  const totalClicks = affiliateLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalConversions = affiliateLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const totalRevenue = affiliateLinks.reduce((sum, link) => sum + (link.revenue || 0), 0);
  const totalCommission = affiliateLinks.reduce((sum, link) => sum + (link.commission_earned || 0), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrações E-commerce</h1>
          <p className="text-gray-600">Conecte sua loja e gerencie afiliados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? 'Editar Integração' : 'Nova Integração E-commerce'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Plataforma</Label>
                <Select value={formData.platform} onValueChange={(val) => setFormData({...formData, platform: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Loja</Label>
                  <Input
                    value={formData.store_name}
                    onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                    placeholder="Minha Loja"
                    required
                  />
                </div>
                <div>
                  <Label>URL da Loja</Label>
                  <Input
                    value={formData.store_url}
                    onChange={(e) => setFormData({...formData, store_url: e.target.value})}
                    placeholder="https://minhaloja.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                    placeholder="sua-api-key"
                  />
                </div>
                <div>
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={formData.api_secret}
                    onChange={(e) => setFormData({...formData, api_secret: e.target.value})}
                    placeholder="seu-api-secret"
                  />
                </div>
              </div>

              <div>
                <Label>Taxa de Comissão Padrão (%)</Label>
                <Input
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Sincronizar Produtos Automaticamente</Label>
                <Switch
                  checked={formData.sync_products}
                  onCheckedChange={(checked) => setFormData({...formData, sync_products: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Integração Ativa</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIntegration ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          {isLoading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : integrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhuma integração configurada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          {integration.store_name}
                        </CardTitle>
                        <Badge className={`mt-2 ${platformColors[integration.platform]}`}>
                          {platformLabels[integration.platform]}
                        </Badge>
                      </div>
                      {integration.is_active && (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ExternalLink className="w-4 h-4" />
                      <a href={integration.store_url} target="_blank" rel="noopener noreferrer" className="hover:text-rose-600">
                        {integration.store_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span>Comissão: <strong>{integration.commission_rate}%</strong></span>
                    </div>
                    {integration.sync_products && (
                      <div className="text-xs text-green-600">
                        ✓ Sincronização automática ativada
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(integration)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Remover esta integração?')) {
                            deleteMutation.mutate(integration.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Links de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              {affiliateLinks.length === 0 ? (
                <p className="text-center text-gray-600 py-8">Nenhum link de afiliado ainda</p>
              ) : (
                <div className="space-y-3">
                  {affiliateLinks.slice(0, 10).map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{link.product_name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{link.clicks || 0} cliques</span>
                          <span>{link.conversions || 0} conversões</span>
                          <span className="text-green-600 font-semibold">R$ {(link.commission_earned || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <Badge className={platformColors[link.platform]}>
                        {platformLabels[link.platform]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Total de Cliques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalClicks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Conversões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalConversions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Comissão Ganha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rose-600">R$ {totalCommission.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(platformLabels).map((platform) => {
                  const links = affiliateLinks.filter(l => l.platform === platform);
                  if (links.length === 0) return null;
                  
                  const clicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
                  const conversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
                  const commission = links.reduce((sum, l) => sum + (l.commission_earned || 0), 0);
                  
                  return (
                    <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={platformColors[platform]}>
                          {platformLabels[platform]}
                        </Badge>
                        <span className="text-sm text-gray-600">{links.length} produtos</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Cliques: </span>
                          <strong>{clicks}</strong>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversões: </span>
                          <strong>{conversions}</strong>
                        </div>
                        <div>
                          <span className="text-green-600">Comissão: </span>
                          <strong>R$ {commission.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}