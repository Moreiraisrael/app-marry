import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Camera, 
  Plus, 
  Upload,
  Loader2,
  Download,
  Trash2,
  X,
  Image as ImageIcon,
  Grid,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'inspiracao', label: 'Inspiração' },
  { value: 'look', label: 'Look' },
  { value: 'antes_depois', label: 'Antes & Depois' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'paleta', label: 'Paleta de Cores' },
  { value: 'outros', label: 'Outros' },
];

export default function Gallery() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: '',
    is_public: false
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos'],
    queryFn: () => base44.entities.Photo.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Photo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setIsFormOpen(false);
      resetForm();
      toast.success('Foto adicionada!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Photo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setSelectedPhoto(null);
      toast.success('Foto removida!');
    }
  });

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      category: '',
      is_public: false
    });
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.Photo.create({
          url: file_url,
          title: file.name.split('.')[0],
          category: formData.category || 'outros'
        });
      } catch (error) {
        toast.error(`Erro ao fazer upload: ${file.name}`);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['photos'] });
    setUploading(false);
    setIsFormOpen(false);
    toast.success('Upload concluído!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      toast.error('Faça upload de uma imagem');
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Acervo de Imagens
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Minha <span className="font-semibold">Galeria</span>
          </h1>
          <p className="text-gray-600 mt-1">Seu acervo de inspirações, looks e referências</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fotos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Fotos</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(p => ({ ...p, category: value }))}
                >
                  <SelectTrigger className="mt-1">
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

              {/* Bulk Upload */}
              <div>
                <Label>Upload de Imagens</Label>
                <label className="mt-2 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-2" />
                      <p className="text-sm text-gray-600">Fazendo upload...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-pink-100 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-pink-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Clique para upload</span> ou arraste
                      </p>
                      <p className="text-xs text-gray-500">Suporta múltiplas imagens</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handlePhotoUpload(Array.from(e.target.files))}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-gray-900' : ''}
        >
          Todas
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className={selectedCategory === cat.value ? 'bg-gray-900' : ''}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{photos.length}</div>
            <div className="text-sm text-gray-600">Total de Fotos</div>
          </CardContent>
        </Card>
        {['inspiracao', 'look', 'cliente'].map(cat => (
          <Card key={cat} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {photos.filter(p => p.category === cat).length}
              </div>
              <div className="text-sm text-gray-600">
                {categories.find(c => c.value === cat)?.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'Nenhuma foto na galeria' : 'Nenhuma foto nesta categoria'}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'all' && 'Comece adicionando suas primeiras imagens'}
          </p>
          {selectedCategory === 'all' && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fotos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.url} 
                alt={photo.title || 'Photo'} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {photo.title && (
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.title || 'Photo'} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <a href={selectedPhoto.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedPhoto.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}