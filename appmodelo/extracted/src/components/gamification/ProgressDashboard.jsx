import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AchievementBadge from './AchievementBadge';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const ACHIEVEMENTS = [
  { id: 'color_analysis', name: 'Análise Completa', description: 'Complete sua análise de coloração', points: 100 },
  { id: 'style_quiz', name: 'Descoberta de Estilo', description: 'Complete o quiz de estilo', points: 100 },
  { id: 'dossier_download', name: 'Dossiê em Mãos', description: 'Baixe seu dossiê personalizado', points: 150 },
  { id: 'first_purchase', name: 'Primeira Compra', description: 'Realize sua primeira compra', points: 200 },
  { id: 'wardrobe_10', name: 'Guarda-Roupa Digital', description: 'Adicione 10 peças ao guarda-roupa', points: 150 },
  { id: 'wardrobe_50', name: 'Fashionista', description: 'Adicione 50 peças ao guarda-roupa', points: 500 },
  { id: 'favorite_look', name: 'Look Favorito', description: 'Salve seu primeiro look favorito', points: 50 },
  { id: 'five_purchases', name: 'Cliente VIP', description: 'Complete 5 compras', points: 500 },
  { id: 'consultation_complete', name: 'Consultoria Completa', description: 'Finalize sua primeira consultoria', points: 300 },
  { id: 'trendsetter', name: 'Trendsetter', description: 'Acesse análise de tendências', points: 100 },
  { id: 'style_master', name: 'Mestre do Estilo', description: 'Alcance 2000 pontos', points: 1000 },
  { id: 'fashionista', name: 'Super Fashionista', description: 'Desbloqueie todas as conquistas', points: 2000 }
];

export default function ProgressDashboard({ clientId }) {
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [newUnlock, setNewUnlock] = useState(null);

  const { data: achievements = [], refetch } = useQuery({
    queryKey: ['achievements', clientId],
    queryFn: () => base44.entities.ClientAchievement.filter({ client_id: clientId })
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe', clientId],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: clientId })
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', clientId],
    queryFn: () => base44.entities.Order.filter({ client_id: clientId })
  });

  useEffect(() => {
    const xp = achievements.reduce((sum, a) => sum + a.points, 0);
    setTotalXP(xp);
    setLevel(Math.floor(xp / 500) + 1);
  }, [achievements]);

  const unlockedIds = achievements.map(a => a.achievement_id);
  
  const checkAndUnlockAchievement = async (achievementId) => {
    if (unlockedIds.includes(achievementId)) return;
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;
    
    await base44.entities.ClientAchievement.create({
      client_id: clientId,
      achievement_id: achievementId,
      achievement_name: achievement.name,
      points: achievement.points,
      unlocked_at: new Date().toISOString()
    });
    
    setNewUnlock(achievement);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => setNewUnlock(null), 3000);
    refetch();
  };

  useEffect(() => {
    // Auto-check achievements based on data
    if (wardrobeItems.length >= 10) checkAndUnlockAchievement('wardrobe_10');
    if (wardrobeItems.length >= 50) checkAndUnlockAchievement('wardrobe_50');
    if (orders.length >= 1) checkAndUnlockAchievement('first_purchase');
    if (orders.length >= 5) checkAndUnlockAchievement('five_purchases');
    if (totalXP >= 2000) checkAndUnlockAchievement('style_master');
    if (unlockedIds.length === ACHIEVEMENTS.length - 1) checkAndUnlockAchievement('fashionista');
  }, [wardrobeItems, orders, totalXP, unlockedIds]);

  const progressToNextLevel = ((totalXP % 500) / 500) * 100;

  return (
    <div className="space-y-6">
      {/* New Unlock Notification */}
      {newUnlock && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-4 rounded-lg shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <p className="font-bold">Nova Conquista!</p>
              <p className="text-sm">{newUnlock.name}</p>
              <p className="text-xs opacity-90">+{newUnlock.points} XP</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Level & XP Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold text-gray-900">Nível {level}</h3>
              </div>
              <p className="text-sm text-gray-600">{totalXP} XP Total</p>
            </div>
            
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-1" />
                {achievements.length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso para Nível {level + 1}</span>
              <span className="font-semibold text-purple-600">{Math.floor(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
            <p className="text-xs text-gray-500 text-center">
              {500 - (totalXP % 500)} XP para o próximo nível
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-4">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-gray-900">{totalXP}</p>
            <p className="text-xs text-gray-600">Pontos XP</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            <p className="text-xs text-gray-600">Conquistas</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-pink-500" />
            <p className="text-2xl font-bold text-gray-900">{level}</p>
            <p className="text-xs text-gray-600">Nível</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Suas Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedIds.includes(achievement.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}