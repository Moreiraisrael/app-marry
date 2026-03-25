import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Plus, Trash2, ShoppingBag, Check, X, Shirt, Search, Brain } from 'lucide-react';
import { toast } from 'sonner';
import OutfitVisualizer from '@/components/wardrobe/OutfitVisualizer';
import FitAnalyzer from '@/components/wardrobe/FitAnalyzer';
import AIStyleAdvisor from '@/components/wardrobe/AIStyleAdvisor';
import AIOutfitGenerator from '@/components/wardrobe/AIOutfitGenerator';
import BulkWardrobeUploader from '@/components/wardrobe/BulkWardrobeUploader';

const categoryLabels = {
  blusa: 'Blusa',
  camisa: 'Camisa',
  vestido: 'Vestido',
  calca: 'Calça',
  saia: 'Saia',
  jaqueta: 'Jaqueta',
  casaco: 'Casaco',
  sapato: 'Sapato',
  acessorio: 'Acessório',
  bolsa: 'Bolsa',
  outros: 'Outros'
};

const statusColors = {
  keep: 'bg-green-100 text-green-700',
  donate: 'bg-blue-100 text-blue-700',
  repair: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-700'
};

export default function VirtualWardrobe() {
  const [selectedClient, setSelectedClient] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [analyzingItem, setAnalyzingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOutfitGenerator, setShowOutfitGenerator] = useState(false);
  const [generatingOutfit, setGeneratingOutfit] = useState(false);
  const [outfitSuggestions, setOutfitSuggestions] = useState(null);
  const [showOutfitVisualizer, setShowOutfitVisualizer] = useState(false);
  const [showFitAnalyzer, setShowFitAnalyzer] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showAIOutfitGen, setShowAIOutfitGen] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe', selectedClient],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: selectedClient }, '-created_date'),
    enabled: !!selectedClient
  });

  const { data: clientData } = useQuery({
    queryKey: ['client-data', selectedClient],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: selectedClient });
      return clients[0];
    },
    enabled: !!selectedClient
  });

  const { data: partnerStores = [] } = useQuery({
    queryKey: ['partner-stores-wardrobe'],
    queryFn: () => base44.entities.PartnerStore.filter({ is_active: true })
  });

  const { data: colorAnalysis } = useQuery({
    queryKey: ['color-analysis', selectedClient],
    queryFn: async () => {
      const analyses = await base44.entities.ColorAnalysisRequest.filter({ 
        client_id: selectedClient,
        status: 'approved'
      }, '-created_date', 1);
      return analyses[0];
    },
    enabled: !!selectedClient
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['style-quiz', selectedClient],
    queryFn: async () => {
      const quizzes = await base44.entities.StyleQuiz.filter({
        client_id: selectedClient,
        status: 'approved'
      }, '-created_date', 1);
      return quizzes[0];
    },
    enabled: !!selectedClient
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.WardrobeItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
      setShowUploadDialog(false);
      toast.success('Peça adicionada!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => await base44.entities.WardrobeItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Atualizado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.WardrobeItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Peça removida!');
    }
  });

  const handlePhotoUpload = async (e, sourceUrl = null) => {
    let file_url = sourceUrl;
    
    if (!sourceUrl) {
      const file = e?.target?.files?.[0];
      if (!file) return;
      
      setUploadingPhoto(true);
      try {
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        file_url = uploaded.file_url;
      } catch (error) {
        toast.error('Erro ao fazer upload');
        setUploadingPhoto(false);
        return;
      }
    }

    try {
      setAnalyzingItem(true);
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta peça de roupa em DETALHES e forneça informações completas.

IMPORTANTE: Responda TUDO em português brasileiro.

Forneça:
1. Categoria (escolha UMA): blusa, camisa, vestido, calca, saia, jaqueta, casaco, sapato, acessorio, bolsa, outros
2. Subcategoria específica (ex: "blusa manga longa", "vestido midi", "calça jeans skinny")
3. Cor principal
4. Cores secundárias (se houver)
5. Estilo/vibe (ex: casual, formal, esportivo, boho, minimalista, romântico)
6. Material aparente (ex: algodão, seda, jeans, couro, linho)
7. Padrão/estampa (liso, listrado, floral, poá, xadrez, etc)
8. Ocasiões de uso sugeridas (trabalho, festa, casual, esporte)
9. Descrição detalhada da peça
10. Dicas de styling e combinações`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string" },
            subcategory: { type: "string" },
            primary_color: { type: "string" },
            secondary_colors: { type: "array", items: { type: "string" } },
            style_vibe: { type: "string" },
            material: { type: "string" },
            pattern: { type: "string" },
            occasions: { type: "array", items: { type: "string" } },
            description: { type: "string" },
            styling_tips: { type: "string" }
          }
        }
      });

      const seasonMatch = clientData?.season && analysis.color ? 
        await checkSeasonMatch(analysis.color, clientData.season) : false;

      await createMutation.mutateAsync({
        client_id: selectedClient,
        photo: file_url,
        category: analysis.category || 'outros',
        subcategory: analysis.subcategory,
        color: analysis.primary_color,
        notes: `📦 Material: ${analysis.material || 'N/A'}\n🎨 Estilo: ${analysis.style_vibe || 'N/A'}\n✨ Padrão: ${analysis.pattern || 'Liso'}\n📍 Ocasiões: ${analysis.occasions?.join(', ') || 'N/A'}`,
        season_match: seasonMatch,
        ai_analysis: `${analysis.description}\n\n💡 Dicas de Styling:\n${analysis.styling_tips}`,
        status: 'keep'
      });
      
      setImportUrl('');
    } catch (error) {
      toast.error('Erro ao analisar peça');
    } finally {
      setUploadingPhoto(false);
      setAnalyzingItem(false);
    }
  };

  const checkSeasonMatch = async (color, season) => {
    // Simplified check - in production, this would be more sophisticated
    return true;
  };

  const generateOutfitSuggestions = async () => {
    if (wardrobeItems.length === 0) {
      toast.error('Adicione peças ao guarda-roupa primeiro');
      return;
    }

    setGeneratingOutfit(true);
    try {
      const itemsDescription = wardrobeItems.map(item => 
        `${item.category}: ${item.color || 'cor não especificada'} - ${item.subcategory || ''}`
      ).join('\n');

      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on these wardrobe items, suggest 3 complete outfits:
        
        Available items:
        ${itemsDescription}
        
        Client style: ${clientData?.season || 'not specified'}
        
        For each outfit, specify which items to combine and why they work together.`,
        response_json_schema: {
          type: "object",
          properties: {
            outfits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  items: { type: "array", items: { type: "string" } },
                  occasion: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOutfitSuggestions(suggestions.outfits);
    } catch (error) {
      toast.error('Erro ao gerar sugestões');
    } finally {
      setGeneratingOutfit(false);
    }
  };

  const byCategory = wardrobeItems.reduce((acc, item) => {
    const cat = item.category || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Guarda-Roupa Virtual com IA
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Análise de <span className="font-semibold">Guarda-Roupa</span>
          </h1>
        </div>
        {selectedClient && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAIOutfitGen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Looks IA
            </Button>
            <Button
              onClick={() => setShowAIAdvisor(true)}
              variant="outline"
              className="border-purple-300"
            >
              <Brain className="w-4 h-4 mr-2" />
              Assistente
            </Button>
            <Button
              onClick={() => setShowUploadDialog(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
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

      {selectedClient && (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Total de Peças</p>
                <p className="text-3xl font-bold text-purple-600">{wardrobeItems.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Combinam com Estação</p>
                <p className="text-3xl font-bold text-green-600">
                  {wardrobeItems.filter(i => i.season_match).length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Para Manter</p>
                <p className="text-3xl font-bold text-blue-600">
                  {wardrobeItems.filter(i => i.status === 'keep').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">
                  {wardrobeItems.filter(i => i.status === 'pending').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Items by Category */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-gray-100 p-1 rounded-xl flex-wrap">
              <TabsTrigger value="all">Todas ({wardrobeItems.length})</TabsTrigger>
              {Object.entries(byCategory).map(([cat, items]) => (
                <TabsTrigger key={cat} value={cat}>
                  {categoryLabels[cat]} ({items.length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {wardrobeItems.map((item) => (
                  <WardrobeItemCard
                    key={item.id}
                    item={item}
                    onStatusChange={(status) => updateMutation.mutate({ id: item.id, data: { status } })}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.entries(byCategory).map(([cat, items]) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <WardrobeItemCard
                      key={item.id}
                      item={item}
                      onStatusChange={(status) => updateMutation.mutate({ id: item.id, data: { status } })}
                      onDelete={() => deleteMutation.mutate(item.id)}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Peça ao Guarda-Roupa</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">Link/URL</TabsTrigger>
              <TabsTrigger value="partner">Lojas Parceiras</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhoto || analyzingItem}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {uploadingPhoto ? 'Fazendo upload...' :
                     analyzingItem ? 'Analisando com IA...' :
                     'Clique para fazer upload da foto'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    A IA irá categorizar automaticamente
                  </p>
                </label>
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    setShowBulkUpload(true);
                  }}
                  className="text-purple-600 border-purple-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload em Massa
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Cole a URL da imagem aqui"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
                {importUrl && (
                  <div className="border rounded-lg p-2">
                    <img 
                      src={importUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-contain"
                      onError={() => toast.error('URL inválida')}
                    />
                  </div>
                )}
                <Button
                  onClick={() => handlePhotoUpload(null, importUrl)}
                  disabled={!importUrl || analyzingItem}
                  className="w-full bg-purple-600"
                >
                  {analyzingItem ? 'Importando...' : 'Importar Peça'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="partner" className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {partnerStores.map(store => (
                  <a
                    key={store.id}
                    href={store.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    {store.logo && (
                      <img src={store.logo} alt={store.name} className="w-12 h-12 object-contain rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{store.name}</p>
                      <p className="text-xs text-gray-500">{store.category}</p>
                    </div>
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Copie o link da imagem do produto e cole na aba "Link/URL"
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Outfit Generator Dialog */}
      <Dialog open={showOutfitGenerator} onOpenChange={setShowOutfitGenerator}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sugestões de Looks com IA</DialogTitle>
          </DialogHeader>
          
          {!outfitSuggestions ? (
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <p className="text-gray-600 mb-4">
                A IA irá analisar o guarda-roupa e sugerir combinações perfeitas!
              </p>
              <Button
                onClick={generateOutfitSuggestions}
                disabled={generatingOutfit}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                {generatingOutfit ? 'Gerando...' : 'Gerar Sugestões'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {outfitSuggestions.map((outfit, i) => (
                <Card key={i} className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{outfit.name}</CardTitle>
                    <Badge className="w-fit">{outfit.occasion}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{outfit.description}</p>
                    <div className="space-y-1">
                      {outfit.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-purple-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setOutfitSuggestions(null);
                  generateOutfitSuggestions();
                }}
                className="w-full"
              >
                Gerar Novas Sugestões
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Style Advisor Dialog */}
      <Dialog open={showAIAdvisor} onOpenChange={setShowAIAdvisor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Assistente de Estilo Pessoal com IA
            </DialogTitle>
          </DialogHeader>
          <AIStyleAdvisor
            wardrobeItems={wardrobeItems}
            clientData={clientData}
            colorAnalysis={colorAnalysis}
            styleQuiz={styleQuiz}
          />
        </DialogContent>
      </Dialog>

      {/* Outfit Visualizer Dialog */}
      <Dialog open={showOutfitVisualizer} onOpenChange={setShowOutfitVisualizer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizador de Looks Inteligente</DialogTitle>
          </DialogHeader>
          <OutfitVisualizer
            wardrobeItems={wardrobeItems}
            clientData={clientData}
            onSaveOutfit={(outfit) => {
              toast.success('Look salvo!');
              setShowOutfitVisualizer(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* AI Outfit Generator Dialog */}
      <Dialog open={showAIOutfitGen} onOpenChange={setShowAIOutfitGen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Gerador de Looks Completos com IA
            </DialogTitle>
          </DialogHeader>
          <AIOutfitGenerator
            client={clientData}
            wardrobeItems={wardrobeItems}
            colorAnalysis={colorAnalysis}
            styleQuiz={styleQuiz}
          />
        </DialogContent>
      </Dialog>

      {/* Item Detail Dialog with Fit Analyzer */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Peça</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img src={selectedItem.photo} alt="Item" className="w-full rounded-lg" />
                <div className="space-y-2">
                  <p><strong>Categoria:</strong> {categoryLabels[selectedItem.category]}</p>
                  {selectedItem.subcategory && <p><strong>Tipo:</strong> {selectedItem.subcategory}</p>}
                  {selectedItem.color && <p><strong>Cor:</strong> {selectedItem.color}</p>}
                  {selectedItem.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Detalhes:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{selectedItem.notes}</p>
                    </div>
                  )}
                  {selectedItem.ai_analysis && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Análise IA:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{selectedItem.ai_analysis}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <FitAnalyzer item={selectedItem} clientData={clientData} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <BulkWardrobeUploader
            clientId={selectedClient}
            clientSeason={clientData?.season}
            onComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
              setShowBulkUpload(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WardrobeItemCard({ item, onStatusChange, onDelete, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer">
        <div onClick={onClick}>
          <div className="aspect-square overflow-hidden">
            <img 
              src={item.photo} 
              alt={item.category}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <CardContent className="p-2">
            <p className="text-xs font-medium truncate">{categoryLabels[item.category]}</p>
            {item.color && <p className="text-xs text-gray-500">{item.color}</p>}
            <div className="flex gap-1 mt-2">
              {item.season_match && (
                <Badge className="text-xs px-1 py-0 bg-green-100 text-green-700">✓</Badge>
              )}
              <Badge className={`text-xs px-1 py-0 ${statusColors[item.status]}`}>
                {item.status}
              </Badge>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}