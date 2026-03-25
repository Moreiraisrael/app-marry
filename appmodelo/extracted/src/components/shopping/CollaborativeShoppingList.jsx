import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ExternalLink, Trash2, Edit, Check, X, ShoppingCart, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CollaborativeShoppingList({ clientId, isClientView = false }) {
  const [showNewList, setShowNewList] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    priority: 'medium',
    reason: '',
    budget_range: '',
    product_links: []
  });

  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ['shopping-lists', clientId],
    queryFn: () => base44.entities.ShoppingList.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId
  });

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: clientId });
      return clients[0];
    },
    enabled: !!clientId
  });

  const { data: colorAnalysis } = useQuery({
    queryKey: ['color-analysis', clientId],
    queryFn: async () => {
      const analyses = await base44.entities.ColorAnalysisRequest.filter({ 
        client_id: clientId, 
        status: 'approved' 
      }, '-created_date');
      return analyses[0];
    },
    enabled: !!clientId
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['style-quiz', clientId],
    queryFn: async () => {
      const quizzes = await base44.entities.StyleQuiz.filter({ 
        client_id: clientId, 
        status: 'approved' 
      }, '-created_date');
      return quizzes[0];
    },
    enabled: !!clientId
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!clientId) return;
    
    const unsubscribe = base44.entities.ShoppingList.subscribe((event) => {
      if (event.data.client_id === clientId) {
        queryClient.invalidateQueries({ queryKey: ['shopping-lists', clientId] });
        
        if (event.type === 'update') {
          toast.info('Lista atualizada pela consultora!', {
            description: 'Confira as novas recomendações'
          });
        }
      }
    });

    return unsubscribe;
  }, [clientId, queryClient]);

  const createListMutation = useMutation({
    mutationFn: async (data) => base44.entities.ShoppingList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', clientId] });
      setShowNewList(false);
      setNewListTitle('');
      toast.success('Lista criada com sucesso!');
    }
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', clientId] });
      setShowNewItem(false);
      setEditingItem(null);
      toast.success('Lista atualizada!');
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id) => base44.entities.ShoppingList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', clientId] });
      toast.success('Lista excluída!');
    }
  });

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;

    await createListMutation.mutateAsync({
      client_id: clientId,
      title: newListTitle,
      items: [],
      status: 'active',
      notes: ''
    });
  };

  const handleAddItem = async () => {
    if (!selectedList || !newItem.name.trim()) return;

    const updatedItems = [...(selectedList.items || []), { ...newItem, purchased: false }];
    
    await updateListMutation.mutateAsync({
      id: selectedList.id,
      data: { items: updatedItems }
    });

    setNewItem({
      name: '',
      category: '',
      priority: 'medium',
      reason: '',
      budget_range: '',
      product_links: []
    });
  };

  const handleUpdateItem = async (itemIndex, updates) => {
    if (!selectedList) return;

    const updatedItems = [...selectedList.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };

    await updateListMutation.mutateAsync({
      id: selectedList.id,
      data: { items: updatedItems }
    });
  };

  const handleDeleteItem = async (itemIndex) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.filter((_, i) => i !== itemIndex);

    await updateListMutation.mutateAsync({
      id: selectedList.id,
      data: { items: updatedItems }
    });
  };

  const handleTogglePurchased = async (itemIndex) => {
    if (!selectedList) return;

    const updatedItems = [...selectedList.items];
    updatedItems[itemIndex].purchased = !updatedItems[itemIndex].purchased;

    await updateListMutation.mutateAsync({
      id: selectedList.id,
      data: { items: updatedItems }
    });
  };

  const activeLists = lists.filter(l => l.status === 'active');
  const completedLists = lists.filter(l => l.status === 'completed');

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isClientView ? 'Minhas Listas de Compras' : 'Listas de Compras Colaborativas'}
          </h2>
          <p className="text-sm text-gray-600">
            {isClientView ? 'Gerencie suas listas e veja recomendações da consultora' : 'Colabore com a cliente em listas de compras'}
          </p>
        </div>
        <Button onClick={() => setShowNewList(true)} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Active Lists */}
      {activeLists.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {activeLists.map((list, index) => {
            const totalItems = list.items?.length || 0;
            const purchasedItems = list.items?.filter(i => i.purchased).length || 0;
            const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

            return (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedList(list)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{list.title}</CardTitle>
                        {list.generated_by_ai && (
                          <Badge className="mt-2 bg-purple-100 text-purple-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Gerado por IA
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteListMutation.mutate(list.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-medium">{purchasedItems} / {totalItems}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedList(list)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ver Lista
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New List Dialog */}
      <Dialog open={showNewList} onOpenChange={setShowNewList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Lista de Compras</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da lista (ex: Guarda-roupa Outono 2026)"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
            <Button 
              onClick={handleCreateList} 
              disabled={!newListTitle.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
            >
              Criar Lista
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List Details Dialog */}
      <Dialog open={!!selectedList} onOpenChange={() => setSelectedList(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedList?.title}</DialogTitle>
          </DialogHeader>

          {selectedList && (
            <div className="space-y-6">
              {/* Add Item Button */}
              <Button 
                onClick={() => setShowNewItem(!showNewItem)}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>

              {/* Add Item Form */}
              <AnimatePresence>
                {showNewItem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <Input
                      placeholder="Nome do item (ex: Blazer estruturado)"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Categoria (ex: Casacos)"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      />
                      <Select value={newItem.priority} onValueChange={(v) => setNewItem({ ...newItem, priority: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta Prioridade</SelectItem>
                          <SelectItem value="medium">Média Prioridade</SelectItem>
                          <SelectItem value="low">Baixa Prioridade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Por que este item? (ex: Completa looks formais)"
                      value={newItem.reason}
                      onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })}
                      rows={2}
                    />
                    <Input
                      placeholder="Orçamento (ex: R$ 200 - R$ 400)"
                      value={newItem.budget_range}
                      onChange={(e) => setNewItem({ ...newItem, budget_range: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddItem} className="flex-1">
                        <Check className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewItem(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Items List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {selectedList.items?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border-2 ${
                        item.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={item.purchased}
                          onCheckedChange={() => handleTogglePurchased(index)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                                {item.name}
                              </h4>
                              {item.category && (
                                <Badge variant="outline" className="mt-1">{item.category}</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Badge className={priorityColors[item.priority]}>
                                {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          {item.reason && (
                            <p className="text-sm text-gray-600 mt-2">{item.reason}</p>
                          )}
                          
                          {item.budget_range && (
                            <p className="text-sm text-gray-500 mt-1">💰 {item.budget_range}</p>
                          )}

                          {item.color_suggestions && item.color_suggestions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {item.color_suggestions.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          )}

                          {item.product_links && item.product_links.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {item.product_links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {link.store} - {link.price}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Notes Section */}
              {selectedList.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Notas da Consultora:
                  </p>
                  <p className="text-sm text-blue-800">{selectedList.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}