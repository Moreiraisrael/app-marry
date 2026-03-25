import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Sparkles, ShoppingBag, Plus, ExternalLink, Check, Trash2, Eye, ListChecks, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Avatar3D from '@/components/virtual/Avatar3D';
import CollaborativeShoppingList from '@/components/shopping/CollaborativeShoppingList';
import StyleProfileGenerator from '@/components/ai/StyleProfileGenerator';
import TrendAnalyzer from '@/components/trends/TrendAnalyzer';
import VirtualStyleConsultant from '@/components/ai/VirtualStyleConsultant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ShoppingLists() {
  const [selectedClient, setSelectedClient] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [tryOnItem, setTryOnItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: shoppingLists = [] } = useQuery({
    queryKey: ['shopping-lists', selectedClient],
    queryFn: () => base44.entities.ShoppingList.filter({ client_id: selectedClient }, '-created_date'),
    enabled: !!selectedClient
  });

  const { data: clientData } = useQuery({
    queryKey: ['client-shopping', selectedClient],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: selectedClient });
      return clients[0];
    },
    enabled: !!selectedClient
  });

  const { data: colorAnalysis = [] } = useQuery({
    queryKey: ['color-analysis-shopping', selectedClient],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: selectedClient, status: 'approved' }),
    enabled: !!selectedClient
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['style-quizzes-shopping', selectedClient],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: selectedClient, status: 'approved' }),
    enabled: !!selectedClient
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-shopping', selectedClient],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: selectedClient }),
    enabled: !!selectedClient
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.ShoppingList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setShowGenerateDialog(false);
      toast.success('Lista criada!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => await base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.ShoppingList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('Lista removida!');
    }
  });

  const generateAIShoppingList = async () => {
    setGenerating(true);
    try {
      const wardrobeCategories = wardrobeItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const prompt = `Create a personalized shopping list for a client with the following profile:

Style: ${styleQuizzes[0]?.consultant_style || 'not specified'}
Color Season: ${colorAnalysis[0]?.consultant_season || 'not specified'}
Current Wardrobe: ${Object.entries(wardrobeCategories).map(([cat, count]) => `${count} ${cat}`).join(', ')}

Generate 5-8 essential items they should add to complete their wardrobe. For each item:
- Specify what it is and why they need it
- Suggest colors that match their season
- Set priority (high/medium/low)
- Suggest a budget range

Focus on filling gaps in their current wardrobe and matching their style.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  color_suggestions: { type: "array", items: { type: "string" } },
                  budget_range: { type: "string" }
                }
              }
            }
          }
        }
      });

      await createMutation.mutateAsync({
        client_id: selectedClient,
        title: `Lista Personalizada - ${new Date().toLocaleDateString('pt-BR')}`,
        items: result.items.map(item => ({ ...item, purchased: false, product_links: [] })),
        generated_by_ai: true,
        status: 'active'
      });
    } catch (error) {
      toast.error('Erro ao gerar lista');
    } finally {
      setGenerating(false);
    }
  };

  const toggleItemPurchased = (listId, itemIndex, list) => {
    const updatedItems = [...list.items];
    updatedItems[itemIndex].purchased = !updatedItems[itemIndex].purchased;
    updateMutation.mutate({ id: listId, data: { items: updatedItems } });
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
          <ShoppingBag className="w-4 h-4" />
          Listas de Compras & Análise de Estilo com IA
        </div>
        <h1 className="text-3xl font-light text-gray-900">
          Recomendações <span className="font-semibold">Inteligentes</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Listas colaborativas, análise de estilo e tendências personalizadas
        </p>
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
        <Tabs defaultValue="consultant" className="space-y-6">
          <TabsList className="grid grid-cols-5 bg-gray-100">
            <TabsTrigger value="consultant" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Consultora IA
            </TabsTrigger>
            <TabsTrigger value="lists" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Listas
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Lista IA
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultant">
            <VirtualStyleConsultant clientId={selectedClient} />
          </TabsContent>

          <TabsContent value="lists">
            <CollaborativeShoppingList clientId={selectedClient} />
          </TabsContent>

          <TabsContent value="legacy">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowGenerateDialog(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Lista Rápida com IA
                </Button>
              </div>

              {shoppingLists.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Nenhuma lista gerada ainda</p>
                    <Button
                      onClick={() => setShowGenerateDialog(true)}
                      className="bg-gradient-to-r from-pink-500 to-rose-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Lista com IA
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                shoppingLists.map((list) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {list.title}
                              {list.generated_by_ai && (
                                <Badge className="bg-purple-100 text-purple-700">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {list.items.filter(i => i.purchased).length} de {list.items.length} itens comprados
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(list.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {list.items.map((item, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${item.purchased ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item.purchased}
                                  onCheckedChange={() => toggleItemPurchased(list.id, index, list)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className={`font-semibold ${item.purchased ? 'line-through' : ''}`}>
                                        {item.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">{item.category}</p>
                                    </div>
                                    <Badge className={priorityColors[item.priority]}>
                                      {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 mb-2">{item.reason}</p>
                                  
                                  {item.color_suggestions?.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs text-gray-500 mb-1">Cores sugeridas:</p>
                                      <div className="flex gap-1">
                                        {item.color_suggestions.map((color, i) => (
                                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {color}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {item.budget_range && (
                                    <p className="text-xs text-gray-500">
                                      Orçamento: {item.budget_range}
                                    </p>
                                  )}

                                  {item.product_links?.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {item.product_links.map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          {link.store} - {link.price}
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setTryOnItem(item)}
                                    className="mt-3 w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Prova Virtual 3D
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <StyleProfileGenerator
              client={clientData}
              colorAnalysis={colorAnalysis[0]}
              styleQuiz={styleQuizzes[0]}
              wardrobeItems={wardrobeItems}
            />
          </TabsContent>

          <TabsContent value="trends">
            <TrendAnalyzer
              client={clientData}
              colorAnalysis={colorAnalysis[0]}
              styleQuiz={styleQuizzes[0]}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Lista Personalizada com IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                A IA irá analisar:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Estilo pessoal da cliente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Paleta de cores da estação
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Peças já existentes no guarda-roupa
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Lacunas que precisam ser preenchidas
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={generateAIShoppingList}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600"
              >
                {generating ? 'Gerando...' : 'Gerar Lista'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Virtual Try-On 3D Avatar */}
      {tryOnItem && clientData && (
        <Avatar3D
          client={clientData}
          clothingItem={tryOnItem}
          onClose={() => setTryOnItem(null)}
        />
      )}
    </div>
  );
}