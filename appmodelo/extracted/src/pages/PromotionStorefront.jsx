import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Megaphone, Plus, Trash2, Edit, ExternalLink, Upload,
  Loader2, Star, Calendar, Image, Link as LinkIcon, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const categories = [
  { value: 'roupas', label: '👗 Roupas' },
  { value: 'acessorios', label: '👜 Acessórios' },
  { value: 'calcados', label: '👠 Calçados' },
  { value: 'maquiagem', label: '💄 Maquiagem' },
  { value: 'joias', label: '💍 Joias' },
  { value: 'outros', label: '✨ Outros' },
];

const catColors = {
  roupas: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  acessorios: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  calcados: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  maquiagem: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  joias: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  outros: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function isExpired(date) {
  return date && new Date(date) < new Date();
}

const EMPTY_FORM = {
  title: '', description: '', type: 'both', banner_image: '',
  link_url: '', link_label: 'Ver Promoção', store_name: '',
  discount_badge: '', category: '', expiry_date: '',
  is_active: true, is_featured: false, sort_order: 0
};

export default function PromotionStorefront() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.list('sort_order')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing?.id
      ? base44.entities.Promotion.update(editing.id, data)
      : base44.entities.Promotion.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] });
      setIsFormOpen(false);
      resetForm();
      toast.success(editing ? 'Promoção atualizada!' : 'Promoção criada!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promoção removida!');
    }
  });

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '', description: p.description || '',
      type: p.type || 'both', banner_image: p.banner_image || '',
      link_url: p.link_url || '', link_label: p.link_label || 'Ver Promoção',
      store_name: p.store_name || '', discount_badge: p.discount_badge || '',
      category: p.category || '', expiry_date: p.expiry_date || '',
      is_active: p.is_active !== false, is_featured: p.is_featured || false,
      sort_order: p.sort_order || 0
    });
    setIsFormOpen(true);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, banner_image: file_url }));
    setUploading(false);
  };

  const active = promos.filter(p => p.is_active && !isExpired(p.expiry_date));
  const featured = active.filter(p => p.is_featured);
  const regular = active.filter(p => !p.is_featured);
  const expired = promos.filter(p => !p.is_active || isExpired(p.expiry_date));

  const applyFilter = (list) => filterCat === 'all' ? list : list.filter(p => p.category === filterCat);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-4">
            <Megaphone className="w-4 h-4" />
            Vitrine de Promoções
          </div>
          <h1 className="text-3xl font-light text-neutral-100">
            Promoções <span className="font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">em Destaque</span>
          </h1>
          <p className="text-neutral-400 mt-1">{active.length} promoções ativas</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={(o) => { setIsFormOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/20">
              <Plus className="w-4 h-4 mr-2" /> Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-neutral-900 border-neutral-700 text-neutral-100 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">{editing ? 'Editar Promoção' : 'Nova Promoção'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">

              <div>
                <Label className="text-neutral-300">Título *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Liquidação de verão" className="bg-neutral-800 border-neutral-700 text-neutral-100" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Loja</Label>
                  <Input value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))}
                    placeholder="Nome da loja" className="bg-neutral-800 border-neutral-700 text-neutral-100" />
                </div>
                <div>
                  <Label className="text-neutral-300">Badge (ex: 50% OFF)</Label>
                  <Input value={form.discount_badge} onChange={e => setForm(p => ({ ...p, discount_badge: e.target.value }))}
                    placeholder="50% OFF" className="bg-neutral-800 border-neutral-700 text-neutral-100" />
                </div>
              </div>

              <div>
                <Label className="text-neutral-300">Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva a promoção..." rows={2} className="bg-neutral-800 border-neutral-700 text-neutral-100" />
              </div>

              {/* Banner Upload */}
              <div>
                <Label className="text-neutral-300 flex items-center gap-1"><Image className="w-4 h-4" /> Banner</Label>
                {form.banner_image ? (
                  <div className="relative mt-2">
                    <img src={form.banner_image} alt="banner" className="w-full h-36 object-cover rounded-xl" />
                    <Button type="button" size="sm" variant="ghost" onClick={() => setForm(p => ({ ...p, banner_image: '' }))}
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="mt-2 flex flex-col items-center justify-center h-28 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-rose-500/50 transition-colors">
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin text-neutral-400" /> : <Upload className="w-6 h-6 text-neutral-400" />}
                    <span className="text-xs text-neutral-500 mt-1">Clique para enviar imagem</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                )}
              </div>

              {/* Link */}
              <div>
                <Label className="text-neutral-300 flex items-center gap-1"><LinkIcon className="w-4 h-4" /> Link da Promoção</Label>
                <Input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                  placeholder="https://loja.com.br/promocao" className="bg-neutral-800 border-neutral-700 text-neutral-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Texto do Botão</Label>
                  <Input value={form.link_label} onChange={e => setForm(p => ({ ...p, link_label: e.target.value }))}
                    placeholder="Ver Promoção" className="bg-neutral-800 border-neutral-700 text-neutral-100" />
                </div>
                <div>
                  <Label className="text-neutral-300">Validade</Label>
                  <Input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-neutral-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Categoria</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-100">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {categories.map(c => <SelectItem key={c.value} value={c.value} className="text-neutral-200">{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-300">Ordem</Label>
                  <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="bg-neutral-800 border-neutral-700 text-neutral-100" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} className="accent-amber-500" />
                  <span className="text-neutral-300 text-sm">⭐ Destaque</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="accent-green-500" />
                  <span className="text-neutral-300 text-sm">✅ Ativa</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); }} className="flex-1 border-neutral-700 text-neutral-300">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? 'Atualizar' : 'Publicar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {[{ value: 'all', label: 'Todas' }, ...categories].map(cat => (
          <button key={cat.value} onClick={() => setFilterCat(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterCat === cat.value ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/5 border border-white/10 text-neutral-400 hover:border-rose-500/30 hover:text-rose-400'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Megaphone className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Nenhuma promoção cadastrada</h3>
          <p className="text-neutral-600 mb-4">Publique banners e links de promoções para suas clientes</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-rose-600 hover:bg-rose-700">
            <Plus className="w-4 h-4 mr-2" /> Criar Promoção
          </Button>
        </div>
      ) : (
        <>
          {/* Featured */}
          {applyFilter(featured).length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400" /> Em Destaque
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <AnimatePresence>
                  {applyFilter(featured).map((promo, i) => (
                    <PromoCard key={promo.id} promo={promo} index={i} featured onEdit={handleEdit} onDelete={id => deleteMutation.mutate(id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Regular */}
          {applyFilter(regular).length > 0 && (
            <div className="mb-10">
              {applyFilter(featured).length > 0 && (
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Outras Promoções</h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {applyFilter(regular).map((promo, i) => (
                    <PromoCard key={promo.id} promo={promo} index={i} onEdit={handleEdit} onDelete={id => deleteMutation.mutate(id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Expired */}
          {applyFilter(expired).length > 0 && (
            <div className="opacity-40">
              <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Expiradas
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {applyFilter(expired).map((promo, i) => (
                  <PromoCard key={promo.id} promo={promo} index={i} onEdit={handleEdit} onDelete={id => deleteMutation.mutate(id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PromoCard({ promo, index, featured, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'border-amber-500/40 hover:border-amber-500/70 bg-gradient-to-br from-amber-500/5 to-rose-500/5 hover:shadow-xl hover:shadow-amber-500/10'
          : 'border-white/10 hover:border-rose-500/30 bg-white/5 hover:shadow-xl hover:shadow-rose-500/10'
      }`}
    >
      {/* Featured star */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-black" /> Destaque
        </div>
      )}

      {/* Badge */}
      {promo.discount_badge && (
        <div className="absolute top-3 right-3 z-10 bg-rose-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {promo.discount_badge}
        </div>
      )}

      {/* Banner */}
      {promo.banner_image ? (
        <div className="relative h-48 overflow-hidden">
          <img src={promo.banner_image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-rose-900/40 to-pink-900/40 flex items-center justify-center">
          <Megaphone className="w-10 h-10 text-rose-400/50" />
        </div>
      )}

      <div className="p-5">
        {promo.store_name && (
          <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> {promo.store_name}
          </p>
        )}
        <h3 className="font-bold text-neutral-100 text-base mb-1">{promo.title}</h3>
        {promo.description && <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{promo.description}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {promo.category && (
              <Badge className={`${catColors[promo.category]} border text-xs`}>
                {promo.category}
              </Badge>
            )}
            {promo.expiry_date && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(promo.expiry_date), 'dd/MM/yy')}
              </span>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(promo)} className="p-1.5 hover:bg-white/10 rounded-lg">
              <Edit className="w-3.5 h-3.5 text-neutral-400" />
            </button>
            <button onClick={() => onDelete(promo.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {promo.link_url && (
          <a href={promo.link_url} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/40 hover:text-rose-200 transition-all text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            {promo.link_label || 'Ver Promoção'}
          </a>
        )}
      </div>
    </motion.div>
  );
}