import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingBag, 
  Plus, 
  Upload,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  Link as LinkIcon,
  Tag,
  Percent,
  Gift,
  Ticket,
  Sparkles,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'roupas', label: 'Roupas' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'calcados', label: 'Calçados' },
  { value: 'maquiagem', label: 'Maquiagem' },
  { value: 'joias', label: 'Joias' },
  { value: 'outros', label: 'Outros' },
];

const categoryColors = {
  roupas: 'bg-pink-100 text-pink-700',
  acessorios: 'bg-amber-100 text-amber-700',
  calcados: 'bg-blue-100 text-blue-700',
  maquiagem: 'bg-purple-100 text-purple-700',
  joias: 'bg-yellow-100 text-yellow-700',
  outros: 'bg-gray-100 text-gray-700',
};

export default function PartnerStores() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('lojas');
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [isPromoFormOpen, setIsPromoFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '', description: '', store_name: '', store_link: '', discount_type: 'percentage',
    discount_value: '', category: '', expiry_date: '', is_active: true, terms: ''
  });
  const [promoFormData, setPromoFormData] = useState({
    title: '', description: '', store_name: '', link_url: '', link_label: 'Ver Oferta',
    banner_image: '', discount_badge: '', category: '', expiry_date: '', is_active: true, is_featured: false, type: 'link'
  });
  const [formData, setFormData] = useState({
    name: '', logo: '', link: '', description: '', category: '', is_active: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['partner-stores'],
    queryFn: () => base44.entities.PartnerStore.list('-created_date')
  });

  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date')
  });

  const { data: promotions = [], isLoading: loadingPromos } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingStore?.id) {
        return base44.entities.PartnerStore.update(editingStore.id, data);
      }
      return base44.entities.PartnerStore.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-stores'] });
      setIsFormOpen(false);
      resetForm();
      toast.success(editingStore ? 'Loja atualizada!' : 'Loja adicionada!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PartnerStore.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-stores'] });
      toast.success('Loja removida!');
    }
  });

  const saveCouponMutation = useMutation({
    mutationFn: (data) => editingCoupon?.id
      ? base44.entities.Coupon.update(editingCoupon.id, data)
      : base44.entities.Coupon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsCouponFormOpen(false);
      resetCouponForm();
      toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom adicionado!');
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom removido!');
    }
  });

  const savePromoMutation = useMutation({
    mutationFn: (data) => editingPromo?.id
      ? base44.entities.Promotion.update(editingPromo.id, data)
      : base44.entities.Promotion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsPromoFormOpen(false);
      resetPromoForm();
      toast.success(editingPromo ? 'Oferta atualizada!' : 'Oferta adicionada!');
    }
  });

  const deletePromoMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Oferta removida!');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', logo: '', link: '', description: '', category: '', is_active: true });
    setEditingStore(null);
  };

  const resetCouponForm = () => {
    setCouponFormData({ code: '', description: '', store_name: '', store_link: '', discount_type: 'percentage', discount_value: '', category: '', expiry_date: '', is_active: true, terms: '' });
    setEditingCoupon(null);
  };

  const resetPromoForm = () => {
    setPromoFormData({ title: '', description: '', store_name: '', link_url: '', link_label: 'Ver Oferta', banner_image: '', discount_badge: '', category: '', expiry_date: '', is_active: true, is_featured: false, type: 'link' });
    setEditingPromo(null);
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({ name: store.name || '', logo: store.logo || '', link: store.link || '', description: store.description || '', category: store.category || '', is_active: store.is_active !== false });
    setIsFormOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({ code: coupon.code || '', description: coupon.description || '', store_name: coupon.store_name || '', store_link: coupon.store_link || '', discount_type: coupon.discount_type || 'percentage', discount_value: coupon.discount_value || '', category: coupon.category || '', expiry_date: coupon.expiry_date || '', is_active: coupon.is_active !== false, terms: coupon.terms || '' });
    setIsCouponFormOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoFormData({ title: promo.title || '', description: promo.description || '', store_name: promo.store_name || '', link_url: promo.link_url || '', link_label: promo.link_label || 'Ver Oferta', banner_image: promo.banner_image || '', discount_badge: promo.discount_badge || '', category: promo.category || '', expiry_date: promo.expiry_date || '', is_active: promo.is_active !== false, is_featured: promo.is_featured || false, type: promo.type || 'link' });
    setIsPromoFormOpen(true);
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo: file_url }));
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
    setUploading(false);
  };

  const handleBannerUpload = async (file) => {
    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPromoFormData(prev => ({ ...prev, banner_image: file_url }));
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
    setUploadingBanner(false);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const discountTypeLabel = { percentage: '% OFF', fixed: 'R$ OFF', free_shipping: 'Frete Grátis' };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const filteredStores = selectedCategory === 'all' 
    ? stores 
    : stores.filter(s => s.category === selectedCategory);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Parceiros Recomendados
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Lojas <span className="font-semibold">Parceiras</span>
          </h1>
          <p className="text-gray-600 mt-1">Lojas, cupons e ofertas para suas clientes</p>
        </div>
        
        <>
        {activeTab === 'lojas' && (
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? 'Editar Loja' : 'Nova Loja Parceira'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div>
                <Label>Logo da Loja</Label>
                <div className="mt-2 flex items-center gap-4">
                  {formData.logo ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, logo: '' }))}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-400">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      />
                    </label>
                  )}
                  <div className="text-sm text-gray-500">
                    Recomendado: 200x200px
                  </div>
                </div>
              </div>

              <div>
                <Label>Nome da Loja *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Zara"
                  required
                />
              </div>

              <div>
                <Label>Link da Loja *</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))}
                    placeholder="https://www.loja.com.br"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(p => ({ ...p, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Uma breve descrição da loja..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingStore ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}

        {activeTab === 'cupons' && (
          <Dialog open={isCouponFormOpen} onOpenChange={(open) => { setIsCouponFormOpen(open); if (!open) resetCouponForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveCouponMutation.mutate({ ...couponFormData, discount_value: couponFormData.discount_value ? Number(couponFormData.discount_value) : undefined }); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Código do Cupom *</Label>
                    <Input value={couponFormData.code} onChange={(e) => setCouponFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="EX: MODA20" required />
                  </div>
                  <div>
                    <Label>Loja *</Label>
                    <Input value={couponFormData.store_name} onChange={(e) => setCouponFormData(p => ({ ...p, store_name: e.target.value }))} placeholder="Nome da loja" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo de Desconto *</Label>
                    <Select value={couponFormData.discount_type} onValueChange={(v) => setCouponFormData(p => ({ ...p, discount_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="free_shipping">Frete Grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {couponFormData.discount_type !== 'free_shipping' && (
                    <div>
                      <Label>Valor</Label>
                      <Input type="number" value={couponFormData.discount_value} onChange={(e) => setCouponFormData(p => ({ ...p, discount_value: e.target.value }))} placeholder="Ex: 20" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={couponFormData.category} onValueChange={(v) => setCouponFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Validade</Label>
                    <Input type="date" value={couponFormData.expiry_date} onChange={(e) => setCouponFormData(p => ({ ...p, expiry_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Link da Loja</Label>
                  <Input value={couponFormData.store_link} onChange={(e) => setCouponFormData(p => ({ ...p, store_link: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={couponFormData.description} onChange={(e) => setCouponFormData(p => ({ ...p, description: e.target.value }))} placeholder="Descrição da oferta..." rows={2} />
                </div>
                <div>
                  <Label>Termos e Condições</Label>
                  <Textarea value={couponFormData.terms} onChange={(e) => setCouponFormData(p => ({ ...p, terms: e.target.value }))} placeholder="Ex: Válido somente para primeira compra..." rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setIsCouponFormOpen(false); resetCouponForm(); }} className="flex-1">Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600" disabled={saveCouponMutation.isPending}>
                    {saveCouponMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCoupon ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {activeTab === 'ofertas' && (
          <Dialog open={isPromoFormOpen} onOpenChange={(open) => { setIsPromoFormOpen(open); if (!open) resetPromoForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Oferta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingPromo ? 'Editar Oferta' : 'Nova Oferta'}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); savePromoMutation.mutate(promoFormData); }} className="space-y-3">
                <div>
                  <Label>Título da Oferta *</Label>
                  <Input value={promoFormData.title} onChange={(e) => setPromoFormData(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Sale de Verão – 50% em tudo!" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Loja</Label>
                    <Input value={promoFormData.store_name} onChange={(e) => setPromoFormData(p => ({ ...p, store_name: e.target.value }))} placeholder="Nome da loja" />
                  </div>
                  <div>
                    <Label>Badge de Desconto</Label>
                    <Input value={promoFormData.discount_badge} onChange={(e) => setPromoFormData(p => ({ ...p, discount_badge: e.target.value }))} placeholder="Ex: 50% OFF" />
                  </div>
                </div>
                <div>
                  <Label>Banner (imagem)</Label>
                  <div className="mt-1">
                    {promoFormData.banner_image ? (
                      <div className="relative rounded-xl overflow-hidden h-28 bg-gray-100">
                        <img src={promoFormData.banner_image} alt="Banner" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPromoFormData(p => ({ ...p, banner_image: '' }))} className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer hover:border-orange-400">
                        {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400 mt-1">Clique para enviar</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Link da Oferta</Label>
                    <Input value={promoFormData.link_url} onChange={(e) => setPromoFormData(p => ({ ...p, link_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Texto do Botão</Label>
                    <Input value={promoFormData.link_label} onChange={(e) => setPromoFormData(p => ({ ...p, link_label: e.target.value }))} placeholder="Ver Oferta" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={promoFormData.category} onValueChange={(v) => setPromoFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Validade</Label>
                    <Input type="date" value={promoFormData.expiry_date} onChange={(e) => setPromoFormData(p => ({ ...p, expiry_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={promoFormData.description} onChange={(e) => setPromoFormData(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da oferta..." rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setIsPromoFormOpen(false); resetPromoForm(); }} className="flex-1">Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600" disabled={savePromoMutation.isPending}>
                    {savePromoMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingPromo ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger value="lojas" className="gap-2"><ShoppingBag className="w-4 h-4" />Lojas ({stores.length})</TabsTrigger>
          <TabsTrigger value="cupons" className="gap-2"><Ticket className="w-4 h-4" />Cupons ({coupons.length})</TabsTrigger>
          <TabsTrigger value="ofertas" className="gap-2"><Sparkles className="w-4 h-4" />Ofertas ({promotions.length})</TabsTrigger>
        </TabsList>

        {/* === LOJAS === */}
        <TabsContent value="lojas">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'bg-gray-900' : ''}>Todas</Button>
            {categories.map(cat => (
              <Button key={cat.value} variant={selectedCategory === cat.value ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.value)} className={selectedCategory === cat.value ? 'bg-gray-900' : ''}>{cat.label}</Button>
            ))}
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-xl bg-gray-200" /><div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div></CardContent></Card>)}</div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-gray-400" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedCategory === 'all' ? 'Nenhuma loja cadastrada' : 'Nenhuma loja nesta categoria'}</h3>
              {selectedCategory === 'all' && <Button onClick={() => setIsFormOpen(true)} className="bg-blue-500 mt-4"><Plus className="w-4 h-4 mr-2" />Adicionar Loja</Button>}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store, index) => (
                <motion.div key={store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {store.logo ? <img src={store.logo} alt={store.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 p-2" /> : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-blue-500" /></div>}
                          <div>
                            <h3 className="font-semibold text-gray-900">{store.name}</h3>
                            {store.category && <Badge className={`${categoryColors[store.category]} mt-1`}>{categories.find(c => c.value === store.category)?.label}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(store)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={() => deleteMutation.mutate(store.id)} className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </div>
                      {store.description && <p className="text-sm text-gray-600 mt-4 line-clamp-2">{store.description}</p>}
                      <div className="mt-4">
                        <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700" asChild>
                          <a href={store.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Visitar Loja</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === CUPONS === */}
        <TabsContent value="cupons">
          {loadingCoupons ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-40" /></Card>)}</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center"><Ticket className="w-10 h-10 text-purple-400" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cupom cadastrado</h3>
              <Button onClick={() => setIsCouponFormOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 mt-4"><Plus className="w-4 h-4 mr-2" />Adicionar Cupom</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon, index) => (
                <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">{coupon.store_name}</p>
                          <h3 className="font-bold text-gray-900 mt-0.5">{coupon.description || 'Desconto especial'}</h3>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditCoupon(coupon)} className="p-1.5 hover:bg-white rounded-lg"><Edit className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button onClick={() => deleteCouponMutation.mutate(coupon.id)} className="p-1.5 hover:bg-white rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </div>

                      {/* Discount badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700">
                          {coupon.discount_type === 'free_shipping' ? <Gift className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                          <span className="font-bold text-sm">
                            {coupon.discount_type === 'free_shipping' ? 'Frete Grátis' : `${coupon.discount_type === 'fixed' ? 'R$ ' : ''}${coupon.discount_value || ''}${coupon.discount_type === 'percentage' ? '% OFF' : ''}`}
                          </span>
                        </div>
                        {coupon.category && <Badge className={`${categoryColors[coupon.category]} text-xs`}>{categories.find(c => c.value === coupon.category)?.label}</Badge>}
                      </div>

                      {/* Code block */}
                      <div className="flex items-center gap-2 p-3 bg-white border-2 border-dashed border-purple-200 rounded-xl">
                        <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="font-mono font-bold text-gray-900 flex-1 tracking-widest">{coupon.code}</span>
                        <button onClick={() => copyCouponCode(coupon.code)} className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-purple-500" />
                        </button>
                      </div>

                      {coupon.expiry_date && (
                        <p className="text-xs text-gray-400 mt-2">Válido até: {new Date(coupon.expiry_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      )}

                      {coupon.store_link && (
                        <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                          <a href={coupon.store_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Ir para a loja</a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === OFERTAS === */}
        <TabsContent value="ofertas">
          {loadingPromos ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-0 h-52" /></Card>)}</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center"><Sparkles className="w-10 h-10 text-orange-400" /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma oferta cadastrada</h3>
              <Button onClick={() => setIsPromoFormOpen(true)} className="bg-gradient-to-r from-orange-500 to-rose-600 mt-4"><Plus className="w-4 h-4 mr-2" />Adicionar Oferta</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo, index) => (
                <motion.div key={promo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                    {promo.banner_image && (
                      <div className="relative h-40 overflow-hidden">
                        <img src={promo.banner_image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {promo.discount_badge && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-sm font-bold rounded-full shadow-lg">{promo.discount_badge}</div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditPromo(promo)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow"><Edit className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button onClick={() => deletePromoMutation.mutate(promo.id)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-5">
                      {!promo.banner_image && (
                        <div className="flex justify-end gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditPromo(promo)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button onClick={() => deletePromoMutation.mutate(promo.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 leading-tight">{promo.title}</h3>
                        {!promo.banner_image && promo.discount_badge && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">{promo.discount_badge}</span>
                        )}
                      </div>
                      {promo.store_name && <p className="text-sm text-gray-500 mb-2">{promo.store_name}</p>}
                      {promo.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{promo.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {promo.category && <Badge className={`${categoryColors[promo.category]} text-xs`}>{categories.find(c => c.value === promo.category)?.label}</Badge>}
                        {promo.expiry_date && <span className="text-xs text-gray-400">Até {new Date(promo.expiry_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                      </div>
                      {promo.link_url && (
                        <Button className="w-full mt-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm" asChild>
                          <a href={promo.link_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />{promo.link_label || 'Ver Oferta'}</a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}