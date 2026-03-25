import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const categories = {
  look_do_dia: 'Look do Dia',
  inspiracao: 'Inspiração',
  duvida: 'Dúvida de Look',
  evolucao: 'Evolução',
  outros: 'Outros'
};

export default function PhotoGallery({ clientId, canUpload = true }) {
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('look_do_dia');
  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();

  const { data: photos = [] } = useQuery({
    queryKey: ['client-photos', clientId],
    queryFn: () => base44.entities.ClientPhotoGallery.filter({ client_id: clientId }, '-created_date')
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientPhotoGallery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-photos'] });
      setShowUploadDialog(false);
      setCaption('');
      setCategory('look_do_dia');
      toast.success('Foto compartilhada!');
    }
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await uploadPhotoMutation.mutateAsync({
        client_id: clientId,
        photo_url: file_url,
        caption,
        category
      });
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-600" />
              Galeria de Fotos
            </CardTitle>
            {canUpload && (
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Foto
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Nenhuma foto compartilhada ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedImage(photo)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Foto'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                      <Badge className="bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {categories[photo.category]}
                      </Badge>
                    </div>
                    {photo.consultant_feedback && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-600">
                          <MessageSquare className="w-3 h-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Foto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Legenda (opcional)</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Adicione uma descrição ou pergunta..."
                rows={3}
              />
            </div>

            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{categories[selectedImage.category]}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <img
                src={selectedImage.photo_url}
                alt={selectedImage.caption || 'Foto'}
                className="w-full rounded-lg"
              />
              
              {selectedImage.caption && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedImage.caption}</p>
                </div>
              )}

              {selectedImage.consultant_feedback && (
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm font-semibold text-purple-700 mb-1">
                    Feedback da Consultora:
                  </p>
                  <p className="text-sm text-gray-700">{selectedImage.consultant_feedback}</p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Enviado em {new Date(selectedImage.created_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}