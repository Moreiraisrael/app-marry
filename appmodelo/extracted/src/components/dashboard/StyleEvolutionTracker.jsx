import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Camera, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StyleEvolutionTracker({ clientId }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newEntry, setNewEntry] = useState({
    milestone: '',
    description: '',
    photos: [],
    category: 'primeira_consultoria'
  });
  const queryClient = useQueryClient();

  const { data: evolutions = [] } = useQuery({
    queryKey: ['style-evolution', clientId],
    queryFn: () => base44.entities.StyleEvolution.filter({ client_id: clientId }, '-date'),
    enabled: !!clientId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.StyleEvolution.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-evolution'] });
      setShowAddDialog(false);
      setNewEntry({ milestone: '', description: '', photos: [], category: 'primeira_consultoria' });
      toast.success('Marco registrado!');
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return file_url;
        })
      );
      setNewEntry({ ...newEntry, photos: [...newEntry.photos, ...uploadedUrls] });
      toast.success('Fotos adicionadas!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!newEntry.milestone) {
      toast.error('Adicione um título');
      return;
    }

    await createMutation.mutateAsync({
      ...newEntry,
      client_id: clientId,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const categoryLabels = {
    analise_inicial: 'Análise Inicial',
    primeira_consultoria: 'Primeira Consultoria',
    organizacao_guarda_roupa: 'Organização de Guarda-Roupa',
    shopping: 'Personal Shopping',
    evento_especial: 'Evento Especial',
    transformacao_completa: 'Transformação Completa'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Evolução de Estilo
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Novo Marco
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {evolutions.map((evolution, idx) => (
            <motion.div
              key={evolution.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-6 pb-6 border-l-2 border-purple-200 last:border-0 last:pb-0"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{evolution.milestone}</h4>
                    <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">
                      {categoryLabels[evolution.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(evolution.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {evolution.description && (
                  <p className="text-sm text-gray-600 mt-2">{evolution.description}</p>
                )}

                {evolution.photos && evolution.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {evolution.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Evolução"
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                {evolution.ai_analysis && (
                  <div className="mt-3 p-2 bg-white rounded border border-purple-200">
                    <p className="text-xs text-purple-900 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Análise IA
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{evolution.ai_analysis}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {evolutions.length === 0 && (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhum marco registrado ainda</p>
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="mt-3"
              >
                Registrar Primeiro Marco
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Marco de Evolução</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Marco *</label>
              <Input
                value={newEntry.milestone}
                onChange={(e) => setNewEntry({ ...newEntry, milestone: e.target.value })}
                placeholder="Ex: Primeira análise de coloração"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select
                value={newEntry.category}
                onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Descreva a evolução e conquistas..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fotos (Antes/Depois)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="evolution-photo-upload"
                  disabled={uploadingPhoto}
                />
                <label htmlFor="evolution-photo-upload" className="cursor-pointer">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingPhoto ? 'Fazendo upload...' : 'Adicionar fotos'}
                  </p>
                </label>
              </div>
              {newEntry.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {newEntry.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setNewEntry({ ...newEntry, photos: newEntry.photos.filter((_, i) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Salvar Marco
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}