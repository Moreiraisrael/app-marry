import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VirtualTryOnRecommendations from './VirtualTryOnRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  Target,
  Plus,
  Loader2,
  CheckCircle2,
  Star,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PersonalizedShoppingAssistant({ clientId }) {
  const [generating, setGenerating] = useState(false);
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const queryClient = useQueryClient();

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => base44.entities.Client.get(clientId)
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe', clientId],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: clientId })
  });

  const { data: colorAnalysis = [] } = useQuery({
    queryKey: ['color-analysis', clientId],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: clientId })
  });

  const { data: styleQuiz = [] } = useQuery({
    queryKey: ['style-quiz', clientId],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: clientId })
  });

  const { data: tryOns = [] } = useQuery({
    queryKey: ['virtual-tryons', clientId],
    queryFn: () => base44.entities.VirtualTryOn.filter({ client_id: clientId })
  });

  const { data: shoppingLists = [] } = useQuery({
    queryKey: ['shopping-lists', clientId],
    queryFn: () => base44.entities.ShoppingList.filter({ client_id: clientId, status: 'active' })
  });

  const createListMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    }
  });

  const handleGenerateSuggestions = async () => {
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateStyleAdvice', {
        clientId,
        clientData: client,
        wardrobeItems,
        colorAnalysis: colorAnalysis[0],
        styleQuiz: styleQuiz[0],
        request_type: 'shopping_suggestions',
        preferences: context || 'Análise completa e sugestões estratégicas'
      });

      setSuggestions(data);
      toast.success('Sugestões geradas com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar sugestões');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToShoppingList = async (item) => {
    try {
      // Check if there's an active list or create one
      let targetList = shoppingLists[0];
      
      if (!targetList) {
        const newList = await createListMutation.mutateAsync({
          client_id: clientId,
          title: 'Lista de Compras Style',
          generated_by_ai: true,
          status: 'active',
          items: []
        });
        targetList = newList;
      }

      const newItem = {
        name: item.name,
        category: item.category,
        priority: item.priority,
        reason: item.why_it_fits,
        why_it_fits: item.why_it_fits,
        versatility_score: item.versatility_score,
        ideal_colors: item.ideal_colors,
        ideal_styles: item.ideal_styles,
        wardrobe_gap: item.wardrobe_gap,
        occasions: item.occasions,
        color_suggestions: item.ideal_colors,
        budget_range: item.budget_range,
        purchased: false,
        ai_suggested: true,
        suggestion_date: new Date().toISOString(),
        product_links: []
      };

      const updatedItems = [...(targetList.items || []), newItem];
      
      await updateListMutation.mutateAsync({
        id: targetList.id,
        data: { items: updatedItems }
      });

      toast.success('Item adicionado à lista de compras!');
    } catch (error) {
      toast.error('Erro ao adicionar à lista');
      console.error(error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-neutral-700 text-neutral-400 border-neutral-600'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-amber-500/20 shadow-2xl bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            Assistente de Compras Personalizado
          </CardTitle>
          <p className="text-sm text-neutral-400 mt-2">
            Recomendações inteligentes baseadas no perfil, guarda-roupa e histórico da cliente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-neutral-300 mb-2 block">
              Contexto Adicional (opcional)
            </label>
            <Textarea
              placeholder="Ex: Precisa de roupas para trabalho, tem viagem em breve, quer renovar o guarda-roupa..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600"
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerateSuggestions}
            disabled={generating}
            className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-amber-500/20"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando perfil e guarda-roupa...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Sugestões Personalizadas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Wardrobe Analysis */}
      {suggestions?.wardrobe_analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-amber-500/20 bg-black">
            <CardHeader>
              <CardTitle className="text-neutral-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Análise do Guarda-roupa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strengths */}
              {suggestions.wardrobe_analysis.strengths?.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1">
                    {suggestions.wardrobe_analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-green-300 text-sm">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {suggestions.wardrobe_analysis.gaps?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Lacunas Identificadas
                  </h4>
                  <ul className="space-y-1">
                    {suggestions.wardrobe_analysis.gaps.map((gap, idx) => (
                      <li key={idx} className="text-amber-300 text-sm">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Versatility Score */}
              {suggestions.wardrobe_analysis.versatility_score && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
                  <p className="text-neutral-400 text-sm mb-2">Score de Versatilidade Atual</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                    {suggestions.wardrobe_analysis.versatility_score}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Shopping Strategy */}
      {suggestions?.shopping_strategy && (
        <Card className="border border-amber-500/20 bg-black">
          <CardContent className="p-6">
            <h4 className="text-neutral-100 font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Estratégia de Compra
            </h4>
            <p className="text-neutral-300 text-sm">{suggestions.shopping_strategy}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {suggestions?.recommendations?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-neutral-100">Sugestões Personalizadas</h3>
          
          {suggestions.recommendations.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border border-amber-500/20 bg-black hover:border-amber-500/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-neutral-100">{item.name}</h4>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Alta Prioridade' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-bold">{item.versatility_score}</span>
                    </div>
                  </div>

                  {/* Why It Fits */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
                    <h5 className="text-amber-400 font-semibold text-sm mb-2">Por que combina com você</h5>
                    <p className="text-neutral-300 text-sm">{item.why_it_fits}</p>
                  </div>

                  {/* Wardrobe Gap */}
                  {item.wardrobe_gap && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-sm">
                        <span className="font-semibold">Preenche lacuna:</span> {item.wardrobe_gap}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Ideal Colors */}
                    {item.ideal_colors?.length > 0 && (
                      <div>
                        <h5 className="text-neutral-400 text-xs font-semibold mb-2">Cores Ideais</h5>
                        <div className="flex flex-wrap gap-1">
                          {item.ideal_colors.map((color, i) => (
                            <Badge key={i} className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Occasions */}
                    {item.occasions?.length > 0 && (
                      <div>
                        <h5 className="text-neutral-400 text-xs font-semibold mb-2">Ocasiões</h5>
                        <div className="flex flex-wrap gap-1">
                          {item.occasions.map((occasion, i) => (
                            <Badge key={i} className="bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
                              {occasion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Combines With */}
                  {item.combines_with?.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <h5 className="text-green-400 text-sm font-semibold mb-2">Combina com peças existentes</h5>
                      <div className="flex flex-wrap gap-1">
                        {item.combines_with.map((piece, i) => (
                          <span key={i} className="text-green-300 text-xs">• {piece}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment Value */}
                  {item.investment_value && (
                    <p className="text-neutral-400 text-sm mb-4">
                      💰 <span className="font-semibold">Valor do investimento:</span> {item.investment_value}
                    </p>
                  )}

                  {/* Budget Range */}
                  {item.budget_range && (
                    <p className="text-neutral-500 text-sm mb-4">
                      Orçamento estimado: {item.budget_range}
                    </p>
                  )}

                  {/* Trend Connection */}
                  {item.trend_connection && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
                      <p className="text-purple-300 text-sm">
                        <span className="font-semibold">🔥 Em alta:</span> {item.trend_connection}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <VirtualTryOnRecommendations 
                      recommendation={item}
                      clientData={client}
                      onAddToList={handleAddToShoppingList}
                    />
                    <Button
                      onClick={() => handleAddToShoppingList(item)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar à Lista
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Impact & Strategy */}
      {suggestions && (
        <Card className="border border-amber-500/20 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
          <CardContent className="p-6 space-y-4">
            {suggestions.impact_forecast && (
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">📈 Impacto Esperado</h4>
                <p className="text-neutral-300 text-sm">{suggestions.impact_forecast}</p>
              </div>
            )}
            
            {suggestions.budget_allocation && (
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">💳 Alocação de Orçamento</h4>
                <p className="text-neutral-300 text-sm">{suggestions.budget_allocation}</p>
              </div>
            )}
            
            {suggestions.styling_unlock && (
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">✨ Novos Looks Desbloqueados</h4>
                <p className="text-neutral-300 text-sm">{suggestions.styling_unlock}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}