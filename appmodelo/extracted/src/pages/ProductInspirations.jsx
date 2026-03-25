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
import { ShoppingBag, Plus, Trash2, Download, Upload, Link as LinkIcon, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductInspirations() {
  const [selectedClient, setSelectedClient] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    photos: [],
    product_link: '',
    store: '',
    price: '',
    category: '',
    why_recommended: '',
    status: 'indicado'
  });
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['product-inspirations', selectedClient],
    queryFn: () => base44.entities.ProductInspiration.filter({ client_id: selectedClient }, '-created_date'),
    enabled: !!selectedClient
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.ProductInspiration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-inspirations'] });
      setShowAddDialog(false);
      setNewProduct({ title: '', description: '', photos: [], product_link: '', store: '', price: '', category: '', why_recommended: '', status: 'indicado' });
      toast.success('Produto salvo!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.ProductInspiration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-inspirations'] });
      toast.success('Produto removido!');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => 
      await base44.entities.ProductInspiration.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-inspirations'] });
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
      setNewProduct({ ...newProduct, photos: [...newProduct.photos, ...uploadedUrls] });
      toast.success(`${files.length} foto(s) adicionada(s)!`);
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.title) {
      toast.error('Adicione um título');
      return;
    }

    await createMutation.mutateAsync({
      ...newProduct,
      client_id: selectedClient,
      consultant_id: (await base44.auth.me()).id
    });
  };

  const downloadPhoto = async (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'produto.jpg';
    link.target = '_blank';
    link.click();
  };

  const statusColors = {
    indicado: 'bg-blue-100 text-blue-700',
    comprado: 'bg-green-100 text-green-700',
    descartado: 'bg-gray-100 text-gray-700'
  };

  const statusLabels = {
    indicado: 'Indicado',
    comprado: 'Comprado',
    descartado: 'Descartado'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Indicações de Produtos
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Produtos <span className="font-semibold">Recomendados</span>
          </h1>
        </div>
        {selectedClient && (
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Indicação
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

      {/* Products Grid */}
      {selectedClient && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {product.photos?.[0] && (
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={product.photos[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {product.photos.length > 1 && (
                        <Badge className="absolute top-2 right-2 bg-black/60 text-white">
                          +{product.photos.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{product.title}</CardTitle>
                        {product.category && (
                          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                        )}
                      </div>
                      <Badge className={statusColors[product.status]}>
                        {statusLabels[product.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {product.description && (
                      <p className="text-sm text-gray-600">{product.description}</p>
                    )}

                    {product.why_recommended && (
                      <div className="bg-pink-50 p-3 rounded-lg text-xs">
                        <p className="font-medium text-pink-900 mb-1">💡 Por que recomendei:</p>
                        <p className="text-gray-700">{product.why_recommended}</p>
                      </div>
                    )}

                    {product.store && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{product.store}</span>
                        {product.price && <span className="font-semibold">{product.price}</span>}
                      </div>
                    )}

                    {product.product_link && (
                      <a
                        href={product.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver produto
                      </a>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Select
                        value={product.status}
                        onValueChange={(value) => updateStatusMutation.mutate({ id: product.id, status: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indicado">Indicado</SelectItem>
                          <SelectItem value="comprado">Comprado</SelectItem>
                          <SelectItem value="descartado">Descartado</SelectItem>
                        </SelectContent>
                      </Select>
                      {product.photos?.[0] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPhoto(product.photos[0])}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(product.id)}
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

          {products.length === 0 && (
            <Card className="border-0 shadow-lg col-span-full">
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Nenhum produto indicado ainda</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Indicação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Indicação de Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
              <Input
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                placeholder="Ex: Blazer Clássico Preto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Input
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="Ex: Blazer, Vestido, Sapato"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fotos do Produto</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="product-photo-upload"
                  disabled={uploadingPhotos}
                />
                <label htmlFor="product-photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingPhotos ? 'Fazendo upload...' : 'Clique para adicionar fotos'}
                  </p>
                </label>
              </div>
              {newProduct.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {newProduct.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setNewProduct({ ...newProduct, photos: newProduct.photos.filter((_, i) => i !== idx) })}
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
              <label className="block text-sm font-medium mb-2">Link do Produto</label>
              <div className="flex gap-2">
                <Input
                  value={newProduct.product_link}
                  onChange={(e) => setNewProduct({ ...newProduct, product_link: e.target.value })}
                  placeholder="Cole o link aqui..."
                />
                <Button variant="outline" size="icon">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loja</label>
                <Input
                  value={newProduct.store}
                  onChange={(e) => setNewProduct({ ...newProduct, store: e.target.value })}
                  placeholder="Ex: Zara, Renner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preço</label>
                <Input
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Ex: R$ 250,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Por que recomendei?</label>
              <Textarea
                value={newProduct.why_recommended}
                onChange={(e) => setNewProduct({ ...newProduct, why_recommended: e.target.value })}
                placeholder="Explique por que este produto é ideal para a cliente..."
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
                onClick={handleSaveProduct}
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600"
              >
                Salvar Indicação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}