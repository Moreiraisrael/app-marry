import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Tag, Plus, Copy, Check, Trash2, Edit, ExternalLink, Calendar, Sparkles, Upload, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const categories = [
  { value: 'roupas', label: '👗 Roupas' },
  { value: 'acessorios', label: '👜 Acessórios' },
  { value: 'calcados', label: '👠 Calçados' },
  { value: 'maquiagem', label: '💄 Maquiagem' },
  { value: 'joias', label: '💍 Joias' },
  { value: 'outros', label: '✨ Outros' },
];

const discountTypes = [
  { value: 'percentage', label: '% Porcentagem' },
  { value: 'fixed', label: 'R$ Valor fixo' },
  { value: 'free_shipping', label: '🚚 Frete grátis' },
];

const categoryColors = {
  roupas: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  acessorios: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  calcados: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  maquiagem: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  joias: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  outros: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const discountGradients = {
  percentage: 'from-green-600 to-emerald-700',
  fixed: 'from-blue-600 to-indigo-700',
  free_shipping: 'from-amber-600 to-orange-700',
};

function formatDiscount(type, value) {
  if (type === 'percentage') return `${value}% OFF`;
  if (type === 'fixed') return `R$ ${value} OFF`;
  return 'Frete Grátis';
}

function isExpired(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function Coupons() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    code: '', description: '', store_name: '', store_logo: '',
    store_link: '', discount_type: 'percentage', discount_value: '',
    category: '', expiry_date: '', terms: '', is_active: true
  });
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingCoupon?.id
      ? base44.entities.Coupon.update(editingCoupon.id, data)
      : base44.entities.Coupon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsFormOpen(false);
      resetForm();
      toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom removido!');
    }
  });

  const resetForm = () => {
    setFormData({
      code: '', description: '', store_name: '', store_logo: '',
      store_link: '', discount_type: 'percentage', discount_value: '',
      category: '', expiry_date: '', terms: '', is_active: true
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      store_name: coupon.store_name || '',
      store_logo: coupon.store_logo || '',
      store_link: coupon.store_link || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || '',
      category: coupon.category || '',
      expiry_date: coupon.expiry_date || '',
      terms: coupon.terms || '',
      is_active: coupon.is_active !== false
    });
    setIsFormOpen(true);
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(p => ({ ...p, store_logo: file_url }));
    setUploading(false);
  };

  const handleCopy = (coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    toast.success(`Código ${coupon.code} copiado!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = selectedCategory === 'all'
    ? coupons
    : coupons.filter(c => c.category === selectedCategory);

  const activeCoupons = filtered.filter(c => c.is_active && !isExpired(c.expiry_date));
  const expiredCoupons = filtered.filter(c => !c.is_active || isExpired(c.expiry_date));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <Tag className="w-4 h-4" />
            Descontos Exclusivos
          </div>
          <h1 className="text-3xl font-light text-neutral-100">
            Cupons de <span className="font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Desconto</span>
          </h1>
          <p className="text-neutral-400 mt-1">
            {activeCoupons.length} cupons ativos disponíveis para suas clientes
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-neutral-900 border-neutral-700 text-neutral-100">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Código do Cupom *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="EX: STYLE20"
                    className="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-neutral-300">Loja *</Label>
                  <Input
                    value={formData.store_name}
                    onChange={(e) => setFormData(p => ({ ...p, store_name: e.target.value }))}
                    placeholder="Nome da loja"
                    className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Tipo de Desconto</Label>
                  <Select value={formData.discount_type} onValueChange={(v) => setFormData(p => ({ ...p, discount_type: v }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {discountTypes.map(t => (
                        <SelectItem key={t.value} value={t.value} className="text-neutral-200">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.discount_type !== 'free_shipping' && (
                  <div>
                    <Label className="text-neutral-300">
                      {formData.discount_type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(p => ({ ...p, discount_value: e.target.value }))}
                      placeholder="0"
                      className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Categoria</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-100">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-neutral-200">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-300">Validade</Label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData(p => ({ ...p, expiry_date: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <Label className="text-neutral-300">Link da Loja</Label>
                <Input
                  value={formData.store_link}
                  onChange={(e) => setFormData(p => ({ ...p, store_link: e.target.value }))}
                  placeholder="https://loja.com.br"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <Label className="text-neutral-300">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva o cupom..."
                  rows={2}
                  className="bg-neutral-800 border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <Label className="text-neutral-300">Logo da Loja</Label>
                <div className="flex items-center gap-3 mt-1">
                  {formData.store_logo ? (
                    <img src={formData.store_logo} alt="logo" className="w-12 h-12 rounded-lg object-contain bg-neutral-800 p-1" />
                  ) : (
                    <label className="w-12 h-12 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center cursor-pointer hover:border-amber-500">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : <Upload className="w-4 h-4 text-neutral-400" />}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                    </label>
                  )}
                  {formData.store_logo && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(p => ({ ...p, store_logo: '' }))} className="text-red-400">
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }} className="flex-1 border-neutral-700 text-neutral-300">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-black font-semibold" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCoupon ? 'Atualizar' : 'Criar Cupom'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === 'all' ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10 text-neutral-400 hover:border-amber-500/30 hover:text-amber-400'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.value ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10 text-neutral-400 hover:border-amber-500/30 hover:text-amber-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Tag className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Nenhum cupom cadastrado</h3>
          <p className="text-neutral-600 mb-4">Comece adicionando cupons de desconto para suas clientes</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-black">
            <Plus className="w-4 h-4 mr-2" /> Criar Cupom
          </Button>
        </div>
      ) : (
        <>
          {/* Active Coupons */}
          {activeCoupons.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Cupons Ativos
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {activeCoupons.map((coupon, index) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      index={index}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onEdit={handleEdit}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Expired Coupons */}
          {expiredCoupons.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Expirados / Inativos
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                {expiredCoupons.map((coupon, index) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    index={index}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    expired
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CouponCard({ coupon, index, copiedId, onCopy, onEdit, onDelete, expired }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-amber-500/30 transition-all duration-300"
    >
      {/* Discount Badge */}
      <div className={`absolute top-0 right-0 bg-gradient-to-br ${discountGradients[coupon.discount_type] || 'from-neutral-600 to-neutral-700'} px-4 py-2 rounded-bl-2xl`}>
        <span className="text-white font-bold text-sm">
          {formatDiscount(coupon.discount_type, coupon.discount_value)}
        </span>
      </div>

      <div className="p-5">
        {/* Store info */}
        <div className="flex items-center gap-3 mb-4 pr-24">
          {coupon.store_logo ? (
            <img src={coupon.store_logo} alt={coupon.store_name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-neutral-100">{coupon.store_name}</p>
            {coupon.category && (
              <Badge className={`${categoryColors[coupon.category]} border text-xs mt-0.5`}>
                {categories.find(c => c.value === coupon.category)?.label}
              </Badge>
            )}
          </div>
        </div>

        {coupon.description && (
          <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{coupon.description}</p>
        )}

        {/* Coupon Code */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-dashed border-amber-500/40 rounded-xl px-4 py-3 mb-4">
          <span className="flex-1 font-mono font-bold text-amber-400 text-lg tracking-widest">{coupon.code}</span>
          <button
            onClick={() => onCopy(coupon)}
            className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            {copiedId === coupon.id
              ? <Check className="w-4 h-4 text-green-400" />
              : <Copy className="w-4 h-4 text-neutral-400 hover:text-amber-400" />
            }
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {coupon.expiry_date && (
              <span className={`text-xs flex items-center gap-1 ${expired ? 'text-red-400' : 'text-neutral-500'}`}>
                <Calendar className="w-3 h-3" />
                {expired ? 'Expirado' : `Até ${format(new Date(coupon.expiry_date), 'dd/MM/yy')}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {coupon.store_link && (
              <a href={coupon.store_link} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg">
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            )}
            <button onClick={() => onEdit(coupon)} className="p-1.5 hover:bg-white/10 rounded-lg">
              <Edit className="w-3.5 h-3.5 text-neutral-400" />
            </button>
            <button onClick={() => onDelete(coupon.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}