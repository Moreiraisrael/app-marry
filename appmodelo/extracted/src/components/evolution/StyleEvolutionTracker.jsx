import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Award,
  Star,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import GamificationDisplay from './GamificationDisplay';
import MilestoneNotifications from './MilestoneNotifications';

const phaseLabels = {
  foundational: '🌱 Fundamental',
  intermediate: '📈 Intermediário',
  advanced: '⭐ Avançado',
  mastery: '👑 Domínio'
};

const categoryIcons = {
  new_silhouette: '👗',
  color_exploration: '🎨',
  pattern_mixing: '✨',
  accessory_evolution: '💍',
  occasion_expansion: '🎭',
  designer_discovery: '👜',
  trend_adoption: '🌟',
  fabric_exploration: '🧵'
};

export default function StyleEvolutionTracker({ clientId }) {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: evolution } = useQuery({
    queryKey: ['style-evolution', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const evolutions = await base44.entities.StyleEvolution.filter({
        client_id: clientId
      });
      return evolutions[0];
    },
    enabled: !!clientId
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateStyleEvolution', {
        clientId
      });
      return result.data;
    },
    onSuccess: () => {
      toast.success('Plano de evolução gerado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar plano de evolução');
    }
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ evolutionId, suggestionId, status }) => {
      const updated = evolution.suggestions.map(s =>
        s.id === suggestionId ? { ...s, status } : s
      );
      await base44.entities.StyleEvolution.update(evolutionId, {
        suggestions: updated
      });

      // Award gamification points
      if (status === 'completed') {
        await base44.functions.invoke('updateStyleGamification', {
          clientId,
          action: 'complete_suggestion',
          data: { suggestionId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-evolution', clientId] });
      toast.success('Sugestão atualizada! Pontos ganhos! 🎉');
    }
  });

  if (!evolution && !generating) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-xl font-semibold mb-2">Plano de Evolução Estilística</h3>
          <p className="text-gray-600 mb-6">
            Descubra como evoluir seu estilo de forma estratégica e personalizada
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-11"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Meu Plano de Evolução
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!evolution) return null;

  return (
    <>
      <MilestoneNotifications evolution={evolution} />
      <div className="space-y-6">
        {/* Gamification Display */}
        <GamificationDisplay evolution={evolution} />

        {/* Header com nível */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMTVhMTUgMTUgMCAxIDAgMzAgMCAxNSAxNSAwIDAgMC0zMCAweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] "></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Sua Evolução de Estilo</h2>
              <p className="text-white/90">{phaseLabels[evolution.evolution_phase]}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/40">
                <span className="text-4xl font-bold text-white">{evolution.current_style_level.toFixed(1)}</span>
              </div>
              <p className="text-white/80 text-sm mt-2">/10</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/90">Score de Evolução</span>
              <span className="text-white font-semibold">{evolution.evolution_score}%</span>
            </div>
            <Progress value={evolution.evolution_score} className="bg-white/20 h-2" />
          </div>

          {evolution.next_exploration && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
              <p className="text-white/80 text-sm mb-1">Próxima Exploração:</p>
              <p className="text-white font-semibold">{evolution.next_exploration.theme}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="bg-white shadow-md p-1 rounded-xl">
          <TabsTrigger value="suggestions" className="gap-2">
            <Zap className="w-4 h-4" />
            Sugestões ({evolution.suggestions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            Metas ({evolution.long_term_goals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Lacunas
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendências
          </TabsTrigger>
        </TabsList>

        {/* Sugestões */}
        <TabsContent value="suggestions" className="space-y-4">
          {evolution.suggestions?.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{categoryIcons[suggestion.category]}</span>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{suggestion.suggestion}</CardTitle>
                        <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          suggestion.estimated_difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : suggestion.estimated_difficulty === 'moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {suggestion.estimated_difficulty === 'easy'
                          ? 'Fácil'
                          : suggestion.estimated_difficulty === 'moderate'
                          ? 'Moderado'
                          : 'Desafiador'}
                      </Badge>
                      {suggestion.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {suggestion.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSuggestionMutation.mutate({
                            evolutionId: evolution.id,
                            suggestionId: suggestion.id,
                            status: suggestion.status === 'pending' ? 'in_progress' : 'completed'
                          });
                        }}
                      >
                        {suggestion.status === 'pending' ? 'Iniciar' : 'Completar'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      Ver Detalhes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Metas */}
        <TabsContent value="goals" className="space-y-4">
          {evolution.long_term_goals?.map((goal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setSelectedGoal(goal)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        {goal.goal}
                      </CardTitle>
                      <Badge variant="outline" className="mb-3">
                        {goal.timeline === '3_months'
                          ? '3 meses'
                          : goal.timeline === '6_months'
                          ? '6 meses'
                          : '12 meses'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{goal.progress_percentage}%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Milestones:</p>
                      <ul className="space-y-1">
                        {goal.milestones?.slice(0, 2).map((m, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-gray-400">•</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Lacunas */}
        <TabsContent value="gaps" className="space-y-4">
          {evolution.wardrobe_gaps?.map((gap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize mb-1">{gap.category}</CardTitle>
                      <p className="text-sm text-gray-600">{gap.gap_description}</p>
                    </div>
                    <Badge
                      className={
                        gap.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : gap.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    >
                      {gap.priority === 'high'
                        ? 'Alta'
                        : gap.priority === 'medium'
                        ? 'Média'
                        : 'Baixa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {gap.recommended_pieces?.map((piece, i) => (
                      <Badge key={i} variant="outline">
                        {piece}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-6">
          {evolution.trend_adoption_roadmap && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ✅ Tendências Seguras
                </h3>
                <div className="space-y-2">
                  {evolution.trend_adoption_roadmap.safe_trends?.map((trend, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-900"
                    >
                      ✓ {trend}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  🚀 Tendências Experimentais
                </h3>
                <div className="space-y-2">
                  {evolution.trend_adoption_roadmap.experimental_trends?.map((trend, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-900"
                    >
                      ⚡ {trend}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ✕ Não Recomendado
                </h3>
                <div className="space-y-2">
                  {evolution.trend_adoption_roadmap.avoidance_zones?.map((trend, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-gray-900"
                    >
                      × {trend}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Detalhes Sugestão */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedSuggestion && (
                <span className="flex items-center gap-3">
                  <span className="text-4xl">{categoryIcons[selectedSuggestion.category]}</span>
                  {selectedSuggestion.suggestion}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{selectedSuggestion.reasoning}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  📋 Passos de Implementação
                </h4>
                <ol className="space-y-2">
                  {selectedSuggestion.implementation_steps?.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-bold text-purple-600">{idx + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-3">👗 Peças para Experimentar</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestion.products_to_try?.map((product, idx) => (
                    <Badge key={idx} variant="outline">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  updateSuggestionMutation.mutate({
                    evolutionId: evolution.id,
                    suggestionId: selectedSuggestion.id,
                    status: selectedSuggestion.status === 'pending' ? 'in_progress' : 'completed'
                  });
                  setSelectedSuggestion(null);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {selectedSuggestion.status === 'pending'
                  ? 'Iniciar Exploração'
                  : selectedSuggestion.status === 'in_progress'
                  ? 'Marcar como Completa'
                  : 'Concluída'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes Meta */}
      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedGoal?.goal}</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{selectedGoal.progress_percentage}%</p>
                  <p className="text-sm text-blue-700">Progresso</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-lg font-semibold text-purple-600">
                    {selectedGoal.timeline === '3_months'
                      ? '3 meses'
                      : selectedGoal.timeline === '6_months'
                      ? '6 meses'
                      : '12 meses'}
                  </p>
                  <p className="text-sm text-purple-700">Prazo</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🎯 Milestones</h4>
                <ul className="space-y-2">
                  {selectedGoal.milestones?.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                      <span className="text-lg mt-0.5">•</span>
                      <span className="text-gray-700">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Progress value={selectedGoal.progress_percentage} className="h-3" />
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}