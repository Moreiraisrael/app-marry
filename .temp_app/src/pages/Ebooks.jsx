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
  BookOpen, 
  Plus, 
  Upload,
  Loader2,
  Download,
  ShoppingCart,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'coloracao', label: 'Coloração Pessoal' },
  { value: 'estilo', label: 'Estilo Pessoal' },
  { value: 'guarda_roupa', label: 'Guarda-Roupa' },
  { value: 'moda', label: 'Moda' },
  { value: 'beleza', label: 'Beleza' },
  { value: 'outros', label: 'Outros' },
];

const categoryLabels = {
  coloracao: 'Coloração Pessoal',
  estilo: 'Estilo Pessoal',
  guarda_roupa: 'Guarda-Roupa',
  moda: 'Moda',
  beleza: 'Beleza',
  outros: 'Outros',
};

export default function Ebooks() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    file_url: '',
    price: '',
    category: '',
    is_active: true
  });
  const [uploading, setUploading] = useState({ cover: false, file: false });
  const queryClient = useQueryClient();

  const { data: ebooks = [], isLoading } = useQuery({
    queryKey: ['ebooks'],
    queryFn: () => base44.entities.Ebook.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingEbook?.id) {
        return base44.entities.Ebook.update(editingEbook.id, data);
      }
      return base44.entities.Ebook.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      setIsFormOpen(false);
      resetForm();
      toast.success(editingEbook ? 'Ebook atualizado!' : 'Ebook adicionado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ebook.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('Ebook removido!');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cover_image: '',
      file_url: '',
      price: '',
      category: '',
      is_active: true
    });
    setEditingEbook(null);
  };

  const handleEdit = (ebook) => {
    setEditingEbook(ebook);
    setFormData({
      title: ebook.title || '',
      description: ebook.description || '',
      cover_image: ebook.cover_image || '',
      file_url: ebook.file_url || '',
      price: ebook.price?.toString() || '',
      category: ebook.category || '',
      is_active: ebook.is_active !== false
    });
    setIsFormOpen(true);
  };

  const handleUpload = async (type, file) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        [type === 'cover' ? 'cover_image' : 'file_url']: file_url
      }));
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
    setUploading(prev => ({ ...prev, [type]: false }));
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Materiais Digitais
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Loja de <span className="font-semibold">Ebooks</span>
          </h1>
          <p className="text-gray-600 mt-1">Seus materiais exclusivos para venda</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEbook ? 'Editar Ebook' : 'Novo Ebook'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Upload */}
              <div>
                <Label>Capa do Ebook</Label>
                <div className="mt-2">
                  {formData.cover_image ? (
                    <div className="relative w-32 h-44 rounded-lg overflow-hidden">
                      <img 
                        src={formData.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, cover_image: '' }))}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-44 border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-400">
                      {uploading.cover ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Upload capa</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload('cover', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
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
                    required
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(p => ({ ...p, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
              </div>

              {/* File Upload */}
              <div>
                <Label>Arquivo do Ebook (PDF)</Label>
                <div className="mt-2">
                  {formData.file_url ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm flex-1 truncate">Arquivo carregado</span>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, file_url: '' }))}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-400">
                      {uploading.file ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Clique para upload do PDF</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload('file', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
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
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingEbook ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ebooks Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-56 bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : ebooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ebook cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando seu primeiro material digital</p>
          <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-500">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Ebook
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ebooks.map((ebook, index) => (
            <motion.div
              key={ebook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 bg-gradient-to-br from-emerald-100 to-teal-100">
                  {ebook.cover_image ? (
                    <img 
                      src={ebook.cover_image} 
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(ebook)}
                      className="p-2 bg-white rounded-full shadow-lg"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(ebook.id)}
                      className="p-2 bg-white rounded-full shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {ebook.category && (
                    <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-700">
                      {categoryLabels[ebook.category]}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ebook.title}</h3>
                  {ebook.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ebook.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-emerald-600">
                      R$ {ebook.price?.toFixed(2)}
                    </span>
                    {ebook.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
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