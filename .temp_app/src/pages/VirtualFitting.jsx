import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Sparkles, 
  Camera, 
  Image as ImageIcon,
  Loader2,
  Heart,
  Trash2,
  Download,
  ShoppingBag,
  Save,
  User,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import ProductCatalog from '@/components/fitting/ProductCatalog';
import SimilarRecommendations from '@/components/fitting/SimilarRecommendations';
import Avatar3D from '@/components/virtual/Avatar3D';

export default function VirtualFitting() {
  const [selectedClient, setSelectedClient] = useState('');
  const [clothingImage, setClothingImage] = useState(null);
  const [clothingType, setClothingType] = useState('');
  const [sourceType, setSourceType] = useState('upload'); // 'upload', 'wardrobe', 'partner', 'url'
  const [clothingUrl, setClothingUrl] = useState('');
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTriedItem, setCurrentTriedItem] = useState(null);
  const [suggestedSize, setSuggestedSize] = useState(null);
  const [showAvatar, setShowAvatar] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  const { data: tryOns = [] } = useQuery({
    queryKey: ['virtual-tryons', selectedClient],
    queryFn: () => selectedClient 
      ? base44.entities.VirtualTryOn.filter({ client_id: selectedClient }, '-created_date')
      : [],
    enabled: !!selectedClient
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-fitting', selectedClient],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: selectedClient }),
    enabled: !!selectedClient
  });

  const { data: partnerStores = [] } = useQuery({
    queryKey: ['partner-stores'],
    queryFn: () => base44.entities.PartnerStore.filter({ is_active: true })
  });

  const { data: shoppingLists = [] } = useQuery({
    queryKey: ['shopping-lists-fitting', selectedClient],
    queryFn: () => base44.entities.ShoppingList.filter({ client_id: selectedClient, status: 'active' }),
    enabled: !!selectedClient
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.VirtualTryOn.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-tryons'] });
      toast.success('Look salvo com sucesso!');
    }
  });

  const saveToShoppingListMutation = useMutation({
    mutationFn: async ({ listId, item }) => {
      const list = shoppingLists.find(l => l.id === listId);
      const updatedItems = [...(list.items || []), item];
      return await base44.entities.ShoppingList.update(listId, { items: updatedItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists-fitting'] });
      toast.success('Adicionado à lista de compras!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VirtualTryOn.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['virtual-tryons'] })
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  // Função para calcular tamanho sugerido
  const calculateSuggestedSize = (client, itemCategory) => {
    if (!client || !client.bust || !client.waist || !client.hip) {
      return null;
    }

    const bust = client.bust;
    const waist = client.waist;
    const hip = client.hip;

    // Sistema de tamanhos brasileiro
    const sizingGuide = {
      blusa: [
        { size: 'PP', bustMin: 76, bustMax: 84 },
        { size: 'P', bustMin: 84, bustMax: 92 },
        { size: 'M', bustMin: 92, bustMax: 100 },
        { size: 'G', bustMin: 100, bustMax: 108 },
        { size: 'GG', bustMin: 108, bustMax: 116 },
        { size: 'XGG', bustMin: 116, bustMax: 999 }
      ],
      calca: [
        { size: '36', waistMin: 60, waistMax: 66, hipMin: 84, hipMax: 92 },
        { size: '38', waistMin: 66, waistMax: 70, hipMin: 92, hipMax: 96 },
        { size: '40', waistMin: 70, waistMax: 76, hipMin: 96, hipMax: 100 },
        { size: '42', waistMin: 76, waistMax: 82, hipMin: 100, hipMax: 106 },
        { size: '44', waistMin: 82, waistMax: 88, hipMin: 106, hipMax: 112 },
        { size: '46', waistMin: 88, waistMax: 94, hipMin: 112, hipMax: 118 },
        { size: '48', waistMin: 94, waistMax: 100, hipMin: 118, hipMax: 124 }
      ],
      vestido: [
        { size: 'PP', bustMin: 76, bustMax: 84, waistMin: 58, waistMax: 64 },
        { size: 'P', bustMin: 84, bustMax: 92, waistMin: 64, waistMax: 70 },
        { size: 'M', bustMin: 92, bustMax: 100, waistMin: 70, waistMax: 78 },
        { size: 'G', bustMin: 100, bustMax: 108, waistMin: 78, waistMax: 86 },
        { size: 'GG', bustMin: 108, bustMax: 116, waistMin: 86, waistMax: 94 }
      ]
    };

    let guide = sizingGuide[itemCategory] || sizingGuide.blusa;
    
    if (itemCategory === 'calca' || itemCategory === 'saia') {
      guide = sizingGuide.calca;
    } else if (itemCategory === 'vestido') {
      guide = sizingGuide.vestido;
    }

    for (const sizeInfo of guide) {
      if (itemCategory === 'calca' || itemCategory === 'saia') {
        if (waist >= sizeInfo.waistMin && waist <= sizeInfo.waistMax &&
            hip >= sizeInfo.hipMin && hip <= sizeInfo.hipMax) {
          return {
            size: sizeInfo.size,
            confidence: 'Alta',
            note: `Baseado em: Cintura ${waist}cm, Quadril ${hip}cm`
          };
        }
      } else {
        if (bust >= sizeInfo.bustMin && bust <= sizeInfo.bustMax) {
          return {
            size: sizeInfo.size,
            confidence: 'Alta',
            note: `Baseado em: Busto ${bust}cm`
          };
        }
      }
    }

    return {
      size: 'M',
      confidence: 'Média',
      note: 'Recomendamos provar antes de comprar'
    };
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setClothingImage(file_url);
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  const handleTryOn = async () => {
    let imageToUse = clothingImage;
    
    // Get image from different sources
    if (sourceType === 'url' && clothingUrl) {
      imageToUse = clothingUrl;
    } else if (sourceType === 'wardrobe' && selectedWardrobeItem) {
      imageToUse = selectedWardrobeItem.photo;
    }
    
    if (!selectedClient || !imageToUse) {
      toast.error('Selecione uma cliente e uma roupa para experimentar');
      return;
    }

    setIsProcessing(true);
    
    try {
      const clientInfo = selectedClientData;
      
      // Create detailed avatar description based on client data
      const avatarDescription = `
        Altura: ${clientInfo?.height || 165}cm
        Tipo de corpo: ${clientInfo?.body_type || 'equilibrado'}
        Medidas: Busto ${clientInfo?.bust || 90}cm, Cintura ${clientInfo?.waist || 70}cm, Quadril ${clientInfo?.hip || 95}cm
        Tom de pele: ${clientInfo?.skin_tone || 'médio'}
        Cor do cabelo: ${clientInfo?.hair_color || 'castanho'}
        Estação de cores: ${clientInfo?.season || 'não especificado'}
      `;

      const prompt = `Create a photorealistic fashion visualization of a full-body avatar wearing this clothing item.

Avatar characteristics:
${avatarDescription}

Instructions:
- Create a professional, realistic 3D avatar with the exact body measurements provided
- Show the clothing item being worn by this avatar in a fashion catalog style
- Use proper lighting and realistic fabric rendering
- Show full body view in a neutral, elegant pose
- Background should be clean and professional (studio-like)
- Ensure the clothing fits naturally according to the body measurements
- Make it look like a high-end e-commerce product photo with a real model`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [imageToUse]
      });

      setResult(url);
      setCurrentTriedItem({ image: imageToUse, type: clothingType || 'outros' });
      
      // Calcular tamanho sugerido
      const sizeInfo = calculateSuggestedSize(selectedClientData, clothingType);
      setSuggestedSize(sizeInfo);
      
      // Save the try-on
      await saveMutation.mutateAsync({
        client_id: selectedClient,
        clothing_image: imageToUse,
        result_image: url,
        clothing_type: clothingType || 'outros',
        suggested_size: sizeInfo?.size
      });

    } catch (error) {
      toast.error('Erro ao processar o provador virtual');
      console.error(error);
    }
    
    setIsProcessing(false);
  };

  const handleSaveToShoppingList = async () => {
    if (shoppingLists.length === 0) {
      toast.error('Crie uma lista de compras primeiro');
      return;
    }

    const item = {
      name: `${clothingType || 'Peça'} - Provador Virtual`,
      category: clothingType || 'outros',
      priority: 'medium',
      reason: 'Testado no provador virtual e aprovado',
      color_suggestions: [],
      budget_range: 'A definir',
      purchased: false,
      product_links: clothingUrl ? [{
        store: 'Link fornecido',
        url: clothingUrl,
        price: 'Consultar',
        image: clothingImage || clothingUrl
      }] : []
    };

    await saveToShoppingListMutation.mutateAsync({
      listId: shoppingLists[0].id,
      item
    });
  };

  const handleTryOnFromCatalog = async (productData) => {
    setClothingImage(productData.imageUrl);
    setClothingType(productData.type);
    setSourceType('upload');
    
    // Auto-trigger try on
    setTimeout(() => {
      handleTryOn();
    }, 500);
  };

  const clothingTypes = [
    { value: 'blusa', label: 'Blusa' },
    { value: 'vestido', label: 'Vestido' },
    { value: 'calca', label: 'Calça' },
    { value: 'saia', label: 'Saia' },
    { value: 'casaco', label: 'Casaco' },
    { value: 'conjunto', label: 'Conjunto' },
    { value: 'outros', label: 'Outros' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-neutral-950 min-h-screen">
      {/* Avatar 3D Modal */}
      {showAvatar && selectedClientData && (
        <Avatar3D
          client={selectedClientData}
          clothingItem={currentTriedItem}
          onClose={() => setShowAvatar(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Provador Virtual Style
        </div>
        <h1 className="text-3xl font-light text-neutral-100">
          Provador <span className="font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">Virtual 3D</span>
        </h1>
        <p className="text-neutral-400 mt-1">
          Veja como as roupas ficam com avatar personalizado baseado nas medidas da cliente
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Upload and Settings */}
        <div className="space-y-6">
          <Card className="border border-amber-500/20 shadow-2xl bg-black">
            <CardContent className="p-6 space-y-6">
              {/* Client Selection */}
              <div>
                <Label className="text-neutral-200">Selecionar Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="mt-1 bg-neutral-900 border-neutral-700 text-neutral-200">
                    <SelectValue placeholder="Escolha uma cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id} className="text-neutral-200 hover:bg-amber-500/10">
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClientData && (
                <div className="bg-gradient-to-br from-neutral-900 to-black rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <User className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-neutral-100">Avatar Personalizado</h3>
                    </div>
                    {selectedClientData.height && selectedClientData.bust && selectedClientData.waist && selectedClientData.hip && (
                      <Button
                        size="sm"
                        onClick={() => setShowAvatar(true)}
                        className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-xs h-8"
                      >
                        <User className="w-3 h-3 mr-1" />
                        Ver Avatar 3D
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-neutral-500">Altura:</span>
                      <span className="ml-1 font-semibold text-neutral-200">{selectedClientData.height || '—'} cm</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Tipo:</span>
                      <span className="ml-1 font-semibold text-neutral-200 capitalize">{selectedClientData.body_type || '—'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Busto:</span>
                      <span className="ml-1 font-semibold text-neutral-200">{selectedClientData.bust || '—'} cm</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Cintura:</span>
                      <span className="ml-1 font-semibold text-neutral-200">{selectedClientData.waist || '—'} cm</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Quadril:</span>
                      <span className="ml-1 font-semibold text-neutral-200">{selectedClientData.hip || '—'} cm</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Estação:</span>
                      <span className="ml-1 font-semibold text-neutral-200">{selectedClientData.season || '—'}</span>
                    </div>
                  </div>
                  {(!selectedClientData.height || !selectedClientData.bust || !selectedClientData.waist || !selectedClientData.hip) && (
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs text-amber-400">⚠️ Complete as medidas para ativar o avatar 3D</p>
                    </div>
                  )}
                </div>
              )}

              {/* Source Selection */}
              <div>
                <Label className="text-neutral-200">Fonte da Roupa</Label>
                <Tabs value={sourceType} onValueChange={setSourceType} className="mt-2">
                  <TabsList className="grid grid-cols-4 w-full bg-neutral-900 border border-neutral-800">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Upload</TabsTrigger>
                    <TabsTrigger value="wardrobe" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Guarda-Roupa</TabsTrigger>
                    <TabsTrigger value="partner" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Lojas</TabsTrigger>
                    <TabsTrigger value="url" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Link</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-4">
                    {clothingImage ? (
                      <div className="relative rounded-xl overflow-hidden">
                        <img 
                          src={clothingImage} 
                          alt="Roupa" 
                          className="w-full h-48 object-contain bg-gray-50"
                        />
                        <button
                          onClick={() => setClothingImage(null)}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
                        <Camera className="w-8 h-8 text-violet-400 mb-2" />
                        <p className="text-sm text-gray-600">Upload de imagem</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </TabsContent>

                  <TabsContent value="wardrobe" className="mt-4">
                    <div className="max-h-48 overflow-y-auto">
                      {wardrobeItems.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {wardrobeItems.map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedWardrobeItem(item);
                                setClothingType(item.category);
                              }}
                              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedWardrobeItem?.id === item.id 
                                  ? 'border-violet-500 ring-2 ring-violet-200' 
                                  : 'border-transparent hover:border-violet-300'
                              }`}
                            >
                              <img src={item.photo} alt="" className="w-full aspect-square object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">
                          Nenhuma peça no guarda-roupa
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="partner" className="mt-4">
                    <ProductCatalog
                      clientData={selectedClientData}
                      onTryOn={handleTryOnFromCatalog}
                    />
                  </TabsContent>

                  <TabsContent value="url" className="mt-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Cole o link da imagem aqui"
                        value={clothingUrl}
                        onChange={(e) => setClothingUrl(e.target.value)}
                      />
                      {clothingUrl && (
                        <img 
                          src={clothingUrl} 
                          alt="Preview" 
                          className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                          onError={() => toast.error('URL de imagem inválida')}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Clothing Type */}
              <div>
                <Label className="text-neutral-200">Tipo de Peça</Label>
                <Select value={clothingType} onValueChange={setClothingType}>
                  <SelectTrigger className="mt-1 bg-neutral-900 border-neutral-700 text-neutral-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    {clothingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-neutral-200 hover:bg-amber-500/10">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleTryOn}
                  disabled={!selectedClient || (!clothingImage && !clothingUrl && !selectedWardrobeItem) || isProcessing}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-amber-500/20"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando Avatar 3D...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Vestir no Avatar
                    </>
                  )}
                </Button>
                
                {result && (
                  <Button
                    onClick={handleSaveToShoppingList}
                    variant="outline"
                    className="w-full"
                    disabled={shoppingLists.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar na Lista de Compras
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Result */}
        <div className="space-y-6">
          <Card className="border border-amber-500/20 shadow-2xl bg-black min-h-[400px]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-neutral-100 mb-4">Resultado</h3>
              
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-80">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 flex items-center justify-center mb-4"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-gray-700 font-medium mb-1">Criando avatar 3D personalizado...</p>
                  <p className="text-sm text-gray-500 mb-4">O Style está ajustando a roupa às medidas exatas da cliente</p>
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 8, repeat: Infinity }}
                    />
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <img 
                    src={result} 
                    alt="Resultado" 
                    className="w-full rounded-xl object-contain bg-neutral-900 border border-neutral-800"
                  />
                  
                  {/* Sugestão de Tamanho */}
                  {suggestedSize && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {suggestedSize.size}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-100">Tamanho Sugerido</p>
                          <p className="text-xs text-neutral-400">Confiança: {suggestedSize.confidence}</p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-300 mt-2">
                        {suggestedSize.note}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800" asChild>
                      <a href={result} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button 
                      onClick={() => setShowAvatar(true)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
                      disabled={!selectedClientData?.height || !selectedClientData?.bust}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Ver Avatar 3D
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center p-6">
                  <div className="p-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full mb-4">
                    <User className="w-8 h-8 text-violet-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Provador Virtual com Avatar Style</h4>
                  <p className="text-sm text-gray-600 mb-4 max-w-sm">
                    Visualize como qualquer roupa ficaria na sua cliente usando um avatar 3D personalizado com as medidas dela
                  </p>
                  <div className="bg-violet-50 p-3 rounded-lg text-left">
                    <p className="text-xs font-semibold text-violet-900 mb-2">✨ Como funciona:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Selecione uma cliente</li>
                      <li>• Escolha uma roupa (upload, guarda-roupa ou link)</li>
                      <li>• O Style cria um avatar 3D personalizado</li>
                      <li>• Visualize o resultado fotorealista</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {result && (
            <SimilarRecommendations
              triedOnItem={currentTriedItem}
              clientData={selectedClientData}
              onTryOn={handleTryOnFromCatalog}
            />
          )}

          {/* History */}
          {selectedClient && tryOns.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Histórico de Provas</h3>
                <div className="grid grid-cols-3 gap-3">
                  {tryOns.slice(0, 6).map(tryOn => (
                    <div key={tryOn.id} className="relative group">
                      <img
                        src={tryOn.result_image || tryOn.clothing_image}
                        alt="Try-on"
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => setResult(tryOn.result_image)}
                      />
                      <button
                        onClick={() => deleteMutation.mutate(tryOn.id)}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}