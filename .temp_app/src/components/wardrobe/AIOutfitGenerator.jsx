import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles, ShoppingBag, Save, RefreshCw, ThumbsUp, ThumbsDown, Star, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualEbookSuggestions from '@/components/ebook/ContextualEbookSuggestions';

const occasionTypes = [
  { value: 'trabalho', label: 'Trabalho', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '👗' },
  { value: 'festa', label: 'Festa', emoji: '🎉' },
  { value: 'jantar', label: 'Jantar Romântico', emoji: '🍷' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'entrevista', label: 'Entrevista de Emprego', emoji: '📋' },
  { value: 'academia', label: 'Academia', emoji: '🏋️' },
  { value: 'praia', label: 'Praia/Piscina', emoji: '🏖️' },
  { value: 'evento_formal', label: 'Evento Formal', emoji: '🎭' },
  { value: 'brunch', label: 'Brunch', emoji: '🥂' },
  { value: 'viagem', label: 'Viagem', emoji: '✈️' },
  { value: 'date', label: 'Encontro', emoji: '💕' }
];

export default function AIOutfitGenerator({ client, wardrobeItems, colorAnalysis, styleQuiz, onSaveOutfit }) {
  const [occasion, setOccasion] = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters
  const [prioritizeWardrobe, setPrioritizeWardrobe] = useState(true);
  const [budgetPreference, setBudgetPreference] = useState('medium');
  const [formalityLevel, setFormalityLevel] = useState(50);
  const [comfortLevel, setComfortLevel] = useState(50);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Feedback states
  const [feedbackMode, setFeedbackMode] = useState({});
  const [feedbackData, setFeedbackData] = useState({});

  const generateOutfits = async () => {
    const finalOccasion = occasion === 'custom' ? customOccasion : occasion;
    
    if (!finalOccasion) {
      toast.error('Selecione ou digite a ocasião desejada');
      return;
    }

    setGenerating(true);
    try {
      // Buscar feedbacks anteriores para machine learning
      const previousFeedbacks = await base44.entities.OutfitFeedback.filter({ 
        client_id: client.id 
      }, '-created_date', 10);
      
      const learningData = previousFeedbacks.length > 0 ? `\n\nAPRENDIZAGEM DE FEEDBACKS ANTERIORES:
${previousFeedbacks.map(f => `
- Avaliação: ${f.rating}/5 estrelas
- Gostou: ${f.liked_aspects?.join(', ') || 'N/A'}
- Não gostou: ${f.disliked_aspects?.join(', ') || 'N/A'}
- Comentário: ${f.comments || 'N/A'}
- Usaria: ${f.would_wear ? 'Sim' : 'Não'}
`).join('\n')}

IMPORTANTE: Use esses feedbacks para refinar suas sugestões! Evite aspectos que a cliente não gostou e priorize o que ela aprecia.` : '';

      const formalityText = formalityLevel < 30 ? 'bem casual e descontraído' : 
                           formalityLevel > 70 ? 'formal e elegante' : 
                           'equilibrado entre casual e formal';
      
      const comfortText = comfortLevel < 30 ? 'pode sacrificar conforto pelo estilo' :
                         comfortLevel > 70 ? 'MÁXIMO conforto é essencial' :
                         'bom equilíbrio entre estilo e conforto';

      const prompt = `Você é uma consultora de imagem especialista. Crie 3 looks completos para a seguinte cliente:

PERFIL DA CLIENTE:
- Nome: ${client.full_name}
- Estação de cores: ${colorAnalysis?.consultant_season || 'não definida'}
- Estilo pessoal: ${styleQuiz?.consultant_style || 'não definido'}
- Tipo de corpo: ${client.body_type || 'não definido'}

OCASIÃO: ${finalOccasion}

PREFERÊNCIAS PARA ESTA BUSCA:
- Nível de formalidade desejado: ${formalityText} (${formalityLevel}/100)
- Prioridade de conforto: ${comfortText} (${comfortLevel}/100)
- Orçamento: ${budgetPreference === 'low' ? 'Econômico' : budgetPreference === 'medium' ? 'Médio' : 'Premium/Luxo'}
- ${prioritizeWardrobe ? '🔥 PRIORIZE MÁXIMO uso do guarda-roupa existente!' : 'Pode sugerir novas peças livremente'}
${additionalNotes ? `- Notas adicionais: ${additionalNotes}` : ''}
${learningData}

GUARDA-ROUPA ATUAL (${wardrobeItems.length} peças):
${wardrobeItems.map(item => `- ${item.category}: ${item.color || 'cor não especificada'} ${item.brand ? `(${item.brand})` : ''} ${item.season_match ? '✓ combina com estação' : ''} ${item.times_worn ? `(usado ${item.times_worn}x)` : ''}`).join('\n')}

Para cada look:
1. ${prioritizeWardrobe ? 'Use PREFERENCIALMENTE peças do guarda-roupa! Só sugira compras se ESSENCIAL.' : 'Balance entre peças existentes e novas sugestões.'}
2. Respeite o nível de formalidade e conforto solicitados
3. Considere o orçamento preferido para sugestões de compra
4. Explique POR QUE cada combinação funciona
5. Dê dicas de styling específicas
6. Indique alternativas caso ela não tenha alguma peça exata

${prioritizeWardrobe ? 'CRÍTICO: A cliente quer MAXIMIZAR uso do que já tem. Seja criativo com as peças existentes!' : ''}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            outfits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  vibe: { type: "string" },
                  items_from_wardrobe: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        color: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  },
                  items_to_buy: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        reason: { type: "string" },
                        color_suggestion: { type: "string" },
                        price_range: { type: "string" }
                      }
                    }
                  },
                  why_it_works: { type: "string" },
                  styling_tips: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOutfits(result.outfits || []);
      toast.success(`${result.outfits?.length || 0} looks criados!`);
      
      // Atualizar gamificação
      await base44.functions.invoke('updateGamification', {
        client_id: client.id,
        action_type: 'outfit_tried',
        metadata: { occasion: finalOccasion }
      });
    } catch (error) {
      toast.error('Erro ao gerar looks');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const submitFeedback = async (outfitIndex) => {
    const feedback = feedbackData[outfitIndex];
    if (!feedback || !feedback.rating) {
      toast.error('Por favor, avalie o look com estrelas');
      return;
    }

    try {
      await base44.entities.OutfitFeedback.create({
        client_id: client.id,
        outfit_data: outfits[outfitIndex],
        occasion: occasion === 'custom' ? customOccasion : occasion,
        rating: feedback.rating,
        liked_aspects: feedback.liked || [],
        disliked_aspects: feedback.disliked || [],
        comments: feedback.comments || '',
        would_wear: feedback.wouldWear || false,
        ai_learning_data: {
          preferred_styles: feedback.liked || [],
          avoided_colors: feedback.disliked?.includes('colors') ? ['to_analyze'] : [],
          preferred_formality: formalityLevel < 50 ? 'casual' : 'formal',
          budget_preference: budgetPreference
        }
      });

      // Atualizar gamificação por feedback
      await base44.functions.invoke('updateGamification', {
        client_id: client.id,
        action_type: 'feedback_submitted',
        metadata: { outfit_feedback: true }
      });

      setFeedbackMode({ ...feedbackMode, [outfitIndex]: false });
      toast.success('Feedback enviado! Isso ajudará futuras sugestões 🎯');
    } catch (error) {
      toast.error('Erro ao enviar feedback');
      console.error(error);
    }
  };

  const updateFeedback = (outfitIndex, field, value) => {
    setFeedbackData({
      ...feedbackData,
      [outfitIndex]: {
        ...(feedbackData[outfitIndex] || {}),
        [field]: value
      }
    });
  };

  const toggleAspect = (outfitIndex, type, aspect) => {
    const current = feedbackData[outfitIndex]?.[type] || [];
    const updated = current.includes(aspect)
      ? current.filter(a => a !== aspect)
      : [...current, aspect];
    
    updateFeedback(outfitIndex, type, updated);
  };

  const handleSaveOutfit = async (outfit) => {
    try {
      const lookData = {
        client_id: client.id,
        title: outfit.name,
        description: outfit.why_it_works,
        occasion,
        styling_tips: outfit.styling_tips,
        category: 'outro'
      };
      
      if (onSaveOutfit) {
        await onSaveOutfit(lookData);
      } else {
        await base44.entities.CapsuleWardrobe.create({
          ...lookData,
          consultant_id: (await base44.auth.me()).id,
          photos: []
        });
      }
      
      toast.success('Look salvo no Guarda Roupa Cápsula!');
    } catch (error) {
      toast.error('Erro ao salvar look');
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Gerador de Looks com IA
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Filtros'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Occasion Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Para qual ocasião?</label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione a ocasião..." />
              </SelectTrigger>
              <SelectContent>
                {occasionTypes.map(occ => (
                  <SelectItem key={occ.value} value={occ.value}>
                    {occ.emoji} {occ.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">✏️ Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Occasion */}
          {occasion === 'custom' && (
            <Input
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              placeholder="Digite a ocasião específica..."
              className="bg-white"
            />
          )}

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t pt-4"
              >
                {/* Prioritize Wardrobe */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Priorizar Guarda-Roupa</p>
                    <p className="text-xs text-green-700">Maximizar uso das suas peças</p>
                  </div>
                  <Button
                    variant={prioritizeWardrobe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPrioritizeWardrobe(!prioritizeWardrobe)}
                    className={prioritizeWardrobe ? "bg-green-600" : ""}
                  >
                    {prioritizeWardrobe ? '✓ Ativo' : 'Desativado'}
                  </Button>
                </div>

                {/* Budget Preference */}
                <div>
                  <label className="block text-sm font-medium mb-2">Orçamento para Compras</label>
                  <Select value={budgetPreference} onValueChange={setBudgetPreference}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">💰 Econômico</SelectItem>
                      <SelectItem value="medium">💳 Médio</SelectItem>
                      <SelectItem value="high">💎 Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Formality Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nível de Formalidade: {formalityLevel < 30 ? 'Casual' : formalityLevel > 70 ? 'Formal' : 'Médio'}
                  </label>
                  <Slider
                    value={[formalityLevel]}
                    onValueChange={([v]) => setFormalityLevel(v)}
                    max={100}
                    step={10}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>

                {/* Comfort Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prioridade de Conforto: {comfortLevel}%
                  </label>
                  <Slider
                    value={[comfortLevel]}
                    onValueChange={([v]) => setComfortLevel(v)}
                    max={100}
                    step={10}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Estilo</span>
                    <span>Conforto</span>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notas Adicionais</label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Ex: Quero usar minha blusa vermelha, precisa ter bolsos, etc..."
                    className="bg-white"
                    rows={2}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={generateOutfits}
            disabled={generating || (!occasion || (occasion === 'custom' && !customOccasion))}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando looks perfeitos...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Looks Completos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Outfits Display */}
      {outfits.length > 0 && (
        <div className="space-y-6">
          {outfits.map((outfit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{outfit.name}</h3>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {outfit.vibe}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items from Wardrobe */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Peças do seu Guarda-Roupa
                      </h4>
                      <div className="space-y-2">
                        {outfit.items_from_wardrobe?.map((item, i) => (
                          <div
                            key={i}
                            className="bg-green-50 border border-green-200 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded bg-green-100 flex items-center justify-center text-green-700 font-medium">
                                {item.category?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.category}</p>
                                <p className="text-sm text-gray-600">{item.color}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items to Buy */}
                    {outfit.items_to_buy && outfit.items_to_buy.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-pink-600" />
                          Sugestões de Compra
                        </h4>
                        <div className="space-y-2">
                          {outfit.items_to_buy.map((item, i) => (
                            <div
                              key={i}
                              className="bg-pink-50 border border-pink-200 rounded-lg p-3"
                            >
                              <p className="font-medium text-gray-900">{item.item}</p>
                              <p className="text-sm text-pink-700 mt-1">
                                Cor sugerida: {item.color_suggestion}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                              {item.price_range && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {item.price_range}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Why it works */}
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">✨ Por que funciona:</h4>
                    <p className="text-gray-700 text-sm">{outfit.why_it_works}</p>
                  </div>

                  {/* Styling Tips */}
                  {outfit.styling_tips && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-2">💡 Dicas de Styling:</h4>
                      <p className="text-gray-700 text-sm">{outfit.styling_tips}</p>
                    </div>
                  )}

                  {/* Feedback Section */}
                  <AnimatePresence>
                    {feedbackMode[idx] ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4"
                      >
                        <h5 className="font-semibold text-amber-900">💭 Dê seu Feedback</h5>
                        
                        {/* Star Rating */}
                        <div>
                          <p className="text-sm mb-2">Avaliação Geral:</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => updateFeedback(idx, 'rating', star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    (feedbackData[idx]?.rating || 0) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Liked Aspects */}
                        <div>
                          <p className="text-sm mb-2">O que você gostou?</p>
                          <div className="flex flex-wrap gap-2">
                            {['colors', 'style', 'comfort', 'versatility', 'creativity'].map(aspect => (
                              <Button
                                key={aspect}
                                size="sm"
                                variant={feedbackData[idx]?.liked?.includes(aspect) ? "default" : "outline"}
                                onClick={() => toggleAspect(idx, 'liked', aspect)}
                                className={feedbackData[idx]?.liked?.includes(aspect) ? "bg-green-600" : ""}
                              >
                                {aspect === 'colors' && '🎨 Cores'}
                                {aspect === 'style' && '✨ Estilo'}
                                {aspect === 'comfort' && '😌 Conforto'}
                                {aspect === 'versatility' && '🔄 Versatilidade'}
                                {aspect === 'creativity' && '💡 Criatividade'}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Disliked Aspects */}
                        <div>
                          <p className="text-sm mb-2">O que não gostou?</p>
                          <div className="flex flex-wrap gap-2">
                            {['colors', 'style', 'formality', 'price'].map(aspect => (
                              <Button
                                key={aspect}
                                size="sm"
                                variant={feedbackData[idx]?.disliked?.includes(aspect) ? "destructive" : "outline"}
                                onClick={() => toggleAspect(idx, 'disliked', aspect)}
                              >
                                {aspect === 'colors' && '🎨 Cores'}
                                {aspect === 'style' && '✨ Estilo'}
                                {aspect === 'formality' && '👔 Formalidade'}
                                {aspect === 'price' && '💰 Preço'}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Would Wear */}
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <span className="text-sm font-medium">Você usaria este look?</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={feedbackData[idx]?.wouldWear === true ? "default" : "outline"}
                              onClick={() => updateFeedback(idx, 'wouldWear', true)}
                              className={feedbackData[idx]?.wouldWear === true ? "bg-green-600" : ""}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={feedbackData[idx]?.wouldWear === false ? "destructive" : "outline"}
                              onClick={() => updateFeedback(idx, 'wouldWear', false)}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Comments */}
                        <Textarea
                          placeholder="Comentários adicionais (opcional)..."
                          value={feedbackData[idx]?.comments || ''}
                          onChange={(e) => updateFeedback(idx, 'comments', e.target.value)}
                          rows={2}
                          className="bg-white"
                        />

                        {/* Submit Feedback */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => submitFeedback(idx)}
                            className="flex-1 bg-amber-600 hover:bg-amber-700"
                          >
                            Enviar Feedback
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setFeedbackMode({ ...feedbackMode, [idx]: false })}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="mt-6 flex gap-3">
                        <Button
                          onClick={() => handleSaveOutfit(outfit)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Look
                        </Button>
                        <Button
                          onClick={() => setFeedbackMode({ ...feedbackMode, [idx]: true })}
                          variant="outline"
                          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Dar Feedback
                        </Button>
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Contextual E-book Suggestions */}
          <ContextualEbookSuggestions
            season={colorAnalysis?.consultant_season}
            style={styleQuiz?.consultant_style}
            occasion={occasion === 'custom' ? customOccasion : occasionTypes.find(o => o.value === occasion)?.label}
            clientId={client.id}
          />

          {/* Regenerate */}
          <Button
            onClick={generateOutfits}
            variant="outline"
            className="w-full"
            disabled={generating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Gerar Novos Looks
          </Button>
        </div>
      )}
    </div>
  );
}