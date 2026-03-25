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
  Briefcase, 
  Plus, 
  Upload,
  Loader2,
  Trash2,
  Edit,
  Clock,
  Check,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const serviceCategories = [
  { value: 'analise_coloracao', label: 'Análise de Coloração' },
  { value: 'consultoria_estilo', label: 'Consultoria de Estilo' },
  { value: 'personal_shopper', label: 'Personal Shopper' },
  { value: 'organizacao_closet', label: 'Organização de Closet' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'outros', label: 'Outros' },
];

const categoryColors = {
  analise_coloracao: 'bg-rose-100 text-rose-700',
  consultoria_estilo: 'bg-violet-100 text-violet-700',
  personal_shopper: 'bg-blue-100 text-blue-700',
  organizacao_closet: 'bg-amber-100 text-amber-700',
  workshop: 'bg-emerald-100 text-emerald-700',
  outros: 'bg-gray-100 text-gray-700',
};

export default function Services() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
    duration: '',
    category: '',
    features: [],
    is_active: true
  });
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingService?.id) {
        return base44.entities.Service.update(editingService.id, data);
      }
      return base44.entities.Service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsFormOpen(false);
      resetForm();
      toast.success(editingService ? 'Serviço atualizado!' : 'Serviço adicionado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço removido!');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      price: '',
      duration: '',
      category: '',
      features: [],
      is_active: true
    });
    setEditingService(null);
    setNewFeature('');
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      image: service.image || '',
      price: service.price?.toString() || '',
      duration: service.duration || '',
      category: service.category || '',
      features: service.features || [],
      is_active: service.is_active !== false
    });
    setIsFormOpen(true);
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image: file_url }));
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
    setUploading(false);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      price: parseFloat(formData.price) || 0
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            Portfólio de Serviços
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Meus <span className="font-semibold">Serviços</span>
          </h1>
          <p className="text-gray-600 mt-1">Ofereça seus serviços de consultoria</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Imagem do Serviço</Label>
                <div className="mt-2">
                  {formData.image ? (
                    <div className="relative h-40 rounded-xl overflow-hidden">
                      <img 
                        src={formData.image} 
                        alt="Service" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, image: '' }))}
                        className="absolute top-2 right-2 p-1 bg-white/90 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:border-violet-400">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Clique para upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Título do Serviço *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Análise de Coloração Completa"
                  required
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva seu serviço..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                    placeholder="500.00"
                    required
                  />
                </div>
                <div>
                  <Label>Duração</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                    placeholder="Ex: 2 horas"
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
                    {serviceCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Features */}
              <div>
                <Label>O que está incluído</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ex: Paleta de cores personalizada"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button type="button" onClick={() => removeFeature(index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingService ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando seus serviços de consultoria</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-violet-500">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 bg-gradient-to-br from-violet-100 to-purple-100">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="w-16 h-16 text-violet-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 bg-white rounded-full shadow-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(service.id)}
                      className="p-2 bg-white rounded-full shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    {service.category && (
                      <Badge className={categoryColors[service.category]}>
                        {serviceCategories.find(c => c.value === service.category)?.label}
                      </Badge>
                    )}
                    {service.duration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{service.title}</h3>
                  
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {service.description}
                    </p>
                  )}
                  
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                      {service.features.length > 3 && (
                        <span className="text-sm text-gray-400">
                          +{service.features.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-2xl font-bold text-violet-600">
                      R$ {service.price?.toFixed(2)}
                    </span>
                    <Button size="sm" className="bg-violet-500 hover:bg-violet-600">
                      Contratar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}