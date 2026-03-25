import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Zap, 
  Target,
  Flame,
  Crown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function GamificationDashboard({ clientId }) {
  const queryClient = useQueryClient();
  const [showNewBadge, setShowNewBadge] = useState(null);

  const { data: evolution, isLoading } = useQuery({
    queryKey: ['style-evolution', clientId],
    queryFn: async () => {
      const records = await base44.entities.StyleEvolution.filter({ client_id: clientId });
      return records[0];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['style-challenges'],
    queryFn: async () => {
      const allChallenges = await base44.entities.StyleChallenge.filter({ is_active: true });
      return allChallenges;
    }
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      const participants = challenge.participants || [];
      
      if (participants.some(p => p.client_id === clientId)) {
        throw new Error('Você já está participando deste desafio');
      }

      participants.push({
        client_id: clientId,
        joined_date: new Date().toISOString(),
        completed: false
      });

      return await base44.entities.StyleChallenge.update(challengeId, { participants });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-challenges'] });
    }
  });

  useEffect(() => {
    if (evolution?.notifications) {
      const unreadBadges = evolution.notifications.filter(n => !n.read && n.type === 'badge_earned');
      if (unreadBadges.length > 0) {
        setShowNewBadge(unreadBadges[0]);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [evolution?.notifications]);

  if (isLoading) {
    return <div className="text-center py-8 text-neutral-400">Carregando...</div>;
  }

  const level = evolution?.current_style_level || 1;
  const points = evolution?.points || 0;
  const pointsToNextLevel = (level * 500);
  const progress = ((points % 500) / 500) * 100;
  const badges = evolution?.badges || [];
  const streak = evolution?.streak_days || 0;

  const phaseInfo = {
    foundational: { name: 'Fundacional', color: 'bg-blue-500', icon: '🌱' },
    intermediate: { name: 'Intermediário', color: 'bg-purple-500', icon: '🌿' },
    advanced: { name: 'Avançado', color: 'bg-amber-500', icon: '🌳' },
    mastery: { name: 'Maestria', color: 'bg-gradient-to-r from-amber-500 to-amber-700', icon: '👑' }
  };

  const currentPhase = phaseInfo[evolution?.evolution_phase] || phaseInfo.foundational;

  const activeUserChallenges = challenges.filter(c => 
    c.participants?.some(p => p.client_id === clientId)
  );

  const availableChallenges = challenges.filter(c => 
    !c.participants?.some(p => p.client_id === clientId)
  );

  return (
    <div className="space-y-6 p-6">
      {/* New Badge Notification */}
      <AnimatePresence>
        {showNewBadge && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="font-bold">{showNewBadge.title}</p>
                <p className="text-sm">{showNewBadge.message}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowNewBadge(null)}>
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level & Progress */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-neutral-950 to-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full ${currentPhase.color} flex items-center justify-center text-3xl shadow-lg`}>
                {currentPhase.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-100">Nível {level}</h3>
                <Badge className={`${currentPhase.color} text-white`}>
                  {currentPhase.name}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {points}
              </p>
              <p className="text-xs text-neutral-400">pontos totais</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Progresso para nível {level + 1}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-neutral-500 text-center">
              Faltam {pointsToNextLevel - (points % 500)} pontos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak & Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-amber-500/20 bg-black">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-400">{streak}</p>
            <p className="text-xs text-neutral-400">dias de sequência</p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/20 bg-black">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-400">{badges.length}</p>
            <p className="text-xs text-neutral-400">conquistas</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <Card className="border-amber-500/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <Trophy className="w-5 h-5 text-amber-400" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {badges.map((badge, idx) => (
                <motion.div
                  key={badge.badge_id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center p-3 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <span className="text-3xl mb-1">{badge.badge_icon}</span>
                  <p className="text-xs text-neutral-300 text-center font-medium">
                    {badge.badge_name}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {activeUserChallenges.length > 0 && (
        <Card className="border-purple-500/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <Target className="w-5 h-5 text-purple-400" />
              Seus Desafios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUserChallenges.map(challenge => {
              const participation = challenge.participants.find(p => p.client_id === clientId);
              return (
                <div key={challenge.id} className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-neutral-100">{challenge.title}</h4>
                      <p className="text-sm text-neutral-400">{challenge.description}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {challenge.points_reward} pts
                    </Badge>
                  </div>
                  {participation?.completed ? (
                    <Badge className="bg-green-500/20 text-green-400">✓ Concluído!</Badge>
                  ) : (
                    <p className="text-xs text-neutral-500">Em andamento...</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Available Challenges */}
      {availableChallenges.length > 0 && (
        <Card className="border-amber-500/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Desafios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableChallenges.slice(0, 3).map(challenge => (
              <div key={challenge.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-100 mb-1">{challenge.title}</h4>
                    <p className="text-sm text-neutral-400 mb-2">{challenge.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {challenge.difficulty}
                      </Badge>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                        +{challenge.points_reward} pts
                      </Badge>
                    </div>
                  </div>
                </div>
                {challenge.tips && challenge.tips.length > 0 && (
                  <div className="mb-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded">
                    <p className="text-xs text-amber-400 font-semibold mb-1">💡 Dicas:</p>
                    <ul className="text-xs text-neutral-400 space-y-1">
                      {challenge.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  onClick={() => joinChallengeMutation.mutate(challenge.id)}
                  disabled={joinChallengeMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Aceitar Desafio
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}