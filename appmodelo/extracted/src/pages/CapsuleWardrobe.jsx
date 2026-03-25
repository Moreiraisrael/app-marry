import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Plus, Heart, Trash2, Download, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CapsuleWardrobe() {
  const [selectedClient, setSelectedClient] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [newLook, setNewLook] = useState({
    title: '',
    description: '',
    photos: [],
    occasion: '',
    season: '',
    styling_tips: '',
    category: 'casual'
  });
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: capsuleLooks = [] } = useQuery({
    queryKey: ['capsule-wardrobe', selectedClient],
    queryFn: () => base44.entities.CapsuleWardrobe.filter({ client_id: selectedClient }, '-created_date'),
    enabled: !!selectedClient
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.CapsuleWardrobe.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule-wardrobe'] });
      setShowAddDialog(false);
      setNewLook({ title: '', description: '', photos: [], occasion: '', season: '', styling_tips: '', category: 'casual' });
      toast.success('Look salvo!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.CapsuleWardrobe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule-wardrobe'] });
      toast.success('Look removido!');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, is_favorite }) => 
      await base44.entities.CapsuleWardrobe.update(id, { is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule-wardrobe'] });
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return file_url;
        })
      );
      setNewLook({ ...newLook, photos: [...newLook.photos, ...uploadedUrls] });
      toast.success(`${files.length} foto(s) adicionada(s)!`);
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSaveLook = async () => {
    if (!newLook.title || newLook.photos.length === 0) {
      toast.error('Adicione título e pelo menos uma foto');
      return;
    }

    await createMutation.mutateAsync({
      ...newLook,
      client_id: selectedClient,
      consultant_id: (await base44.auth.me()).id
    });
  };

  const downloadPhoto = async (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'look.jpg';
    link.target = '_blank';
    link.click();
  };

  const categoryLabels = {
    trabalho: 'Trabalho',
    casual: 'Casual',
    festa: 'Festa',
    esporte: 'Esporte',
    viagem: 'Viagem',
    outro: 'Outro'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Guarda Roupa Cápsula
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Looks <span className="font-semibold">Salvos</span>
          </h1>
        </div>
        {selectedClient && (
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Look
          </Button>
        )}
      </div>

      {/* Client Selector */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <label className="block font-medium mb-2">Selecione a Cliente</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Looks Grid */}
      {selectedClient && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {capsuleLooks.map((look) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Photo Gallery */}
                  <div className="relative aspect-square bg-gray-100">
                    {look.photos[0] && (
                      <img
                        src={look.photos[0]}
                        alt={look.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {look.photos.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/60 text-white">
                        +{look.photos.length - 1} fotos
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavoriteMutation.mutate({ id: look.id, is_favorite: !look.is_favorite })}
                      className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className={`w-4 h-4 ${look.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{look.title}</CardTitle>
                        <Badge className="mt-2 bg-purple-100 text-purple-700">
                          {categoryLabels[look.category]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {look.description && (
                      <p className="text-sm text-gray-600">{look.description}</p>
                    )}

                    {look.occasion && (
                      <div className="text-xs">
                        <span className="font-medium text-gray-700">Ocasião: </span>
                        <span className="text-gray-600">{look.occasion}</span>
                      </div>
                    )}

                    {look.styling_tips && (
                      <div className="bg-purple-50 p-3 rounded-lg text-xs">
                        <p className="font-medium text-purple-900 mb-1">💡 Dicas:</p>
                        <p className="text-gray-700">{look.styling_tips}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadPhoto(look.photos[0])}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(look.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {capsuleLooks.length === 0 && (
            <Card className="border-0 shadow-lg col-span-full">
              <CardContent className="text-center py-12">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Nenhum look salvo ainda</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Look
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Look Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Look do Guarda Roupa Cápsula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Look *</label>
              <Input
                value={newLook.title}
                onChange={(e) => setNewLook({ ...newLook, title: e.target.value })}
                placeholder="Ex: Look Trabalho Elegante"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={newLook.category} onValueChange={(value) => setNewLook({ ...newLook, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="festa">Festa</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fotos do Look *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhotos}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingPhotos ? 'Fazendo upload...' : 'Clique para adicionar fotos'}
                  </p>
                </label>
              </div>
              {newLook.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {newLook.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setNewLook({ ...newLook, photos: newLook.photos.filter((_, i) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={newLook.description}
                onChange={(e) => setNewLook({ ...newLook, description: e.target.value })}
                placeholder="Descreva o look..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ocasião</label>
                <Input
                  value={newLook.occasion}
                  onChange={(e) => setNewLook({ ...newLook, occasion: e.target.value })}
                  placeholder="Ex: Reunião, Jantar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estação</label>
                <Input
                  value={newLook.season}
                  onChange={(e) => setNewLook({ ...newLook, season: e.target.value })}
                  placeholder="Ex: Verão, Inverno"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dicas de Styling</label>
              <Textarea
                value={newLook.styling_tips}
                onChange={(e) => setNewLook({ ...newLook, styling_tips: e.target.value })}
                placeholder="Compartilhe dicas de como usar..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveLook}
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Salvar Look
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}