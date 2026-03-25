import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Gift, 
  Star, 
  Sparkles,
  BookOpen,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AffiliateRewardsCenter() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: points } = useQuery({
    queryKey: ['consultant-points', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const records = await base44.entities.ConsultantPoints.filter({ 
        consultant_id: user.email 
      });
      return records[0] || null;
    },
    enabled: !!user
  });

  const { data: ebooks = [] } = useQuery({
    queryKey: ['ebooks-rewards'],
    queryFn: () => base44.entities.Ebook.filter({ is_active: true })
  });

  const redeemPointsMutation = useMutation({
    mutationFn: async ({ rewardType, pointsCost, rewardValue, ebookId }) => {
      if (!points || points.available_points < pointsCost) {
        throw new Error('Pontos insuficientes');
      }

      // Create redemption
      const redemption = await base44.entities.PointsRedemption.create({
        consultant_id: user.email,
        points_used: pointsCost,
        reward_type: rewardType,
        reward_value: rewardValue,
        ebook_id: ebookId,
        voucher_code: `REWARD${Date.now()}`,
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Update consultant points
      const history = points.points_history || [];
      history.push({
        date: new Date().toISOString(),
        points: -pointsCost,
        type: 'redeemed',
        source: rewardType,
        description: `Resgate: ${rewardType}`
      });

      await base44.entities.ConsultantPoints.update(points.id, {
        available_points: points.available_points - pointsCost,
        points_history: history
      });

      return redemption;
    },
    onSuccess: (redemption) => {
      queryClient.invalidateQueries({ queryKey: ['consultant-points'] });
      toast.success(`Resgate realizado! Código: ${redemption.voucher_code}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao resgatar pontos');
    }
  });

  if (!user || !points) {
    return null;
  }

  const tierInfo = {
    bronze: { name: 'Bronze', color: 'bg-amber-700', min: 0, max: 500, icon: '🥉' },
    silver: { name: 'Prata', color: 'bg-gray-400', min: 500, max: 1500, icon: '🥈' },
    gold: { name: 'Ouro', color: 'bg-amber-500', min: 1500, max: 3000, icon: '🥇' },
    platinum: { name: 'Platina', color: 'bg-purple-500', min: 3000, max: 999999, icon: '💎' }
  };

  const currentTier = tierInfo[points.tier] || tierInfo.bronze;
  const nextTier = points.lifetime_points < 500 ? tierInfo.silver : 
                   points.lifetime_points < 1500 ? tierInfo.gold :
                   points.lifetime_points < 3000 ? tierInfo.platinum : null;

  const progressToNext = nextTier ? 
    ((points.lifetime_points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const rewards = [
    {
      id: 'ebook_50',
      type: 'ebook_discount',
      name: 'Desconto 50% em E-book',
      points: 100,
      value: 'até R$ 25',
      icon: BookOpen
    },
    {
      id: 'ebook_100',
      type: 'ebook_discount',
      name: 'E-book Gratuito',
      points: 200,
      value: 'até R$ 50',
      icon: Gift
    },
    {
      id: 'subscription_10',
      type: 'subscription_discount',
      name: '10% OFF Assinatura',
      points: 300,
      value: 'R$ 30',
      icon: CreditCard
    },
    {
      id: 'subscription_20',
      type: 'subscription_discount',
      name: '20% OFF Assinatura',
      points: 500,
      value: 'R$ 60',
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Points Summary */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full ${currentTier.color} flex items-center justify-center text-3xl shadow-lg`}>
                {currentTier.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Nível {currentTier.name}</h3>
                <p className="text-sm text-gray-600">Você é uma consultora {currentTier.name}!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-amber-600">{points.available_points}</p>
              <p className="text-sm text-gray-600">pontos disponíveis</p>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso para {nextTier.name}</span>
                <span>{Math.floor(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-xs text-gray-500 text-center">
                Faltam {nextTier.min - points.lifetime_points} pontos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="border-amber-500/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Como Ganhar Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                5%
              </div>
              <div>
                <p className="font-medium text-gray-900">Recomende Produtos de Parceiros</p>
                <p className="text-sm text-gray-600">Ganhe 5% do valor da venda em pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                3%
              </div>
              <div>
                <p className="font-medium text-gray-900">Recomende Serviços de Parceiros</p>
                <p className="text-sm text-gray-600">Ganhe 3% do valor em pontos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resgate seus Pontos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {rewards.map((reward, idx) => {
            const canAfford = points.available_points >= reward.points;
            const Icon = reward.icon;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-2 ${canAfford ? 'border-amber-300 hover:shadow-lg' : 'border-gray-200 opacity-60'} transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full ${canAfford ? 'bg-amber-100' : 'bg-gray-100'} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${canAfford ? 'text-amber-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{reward.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">Valor: {reward.value}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={canAfford ? 'bg-amber-500' : 'bg-gray-400'}>
                            {reward.points} pontos
                          </Badge>
                          <Button
                            size="sm"
                            disabled={!canAfford || redeemPointsMutation.isPending}
                            onClick={() => redeemPointsMutation.mutate({
                              rewardType: reward.type,
                              pointsCost: reward.points,
                              rewardValue: parseInt(reward.value.match(/\d+/)?.[0] || '0')
                            })}
                            className={canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-600' : ''}
                          >
                            Resgatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {points.points_history && points.points_history.length > 0 && (
        <Card className="border-amber-500/20 bg-white">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {points.points_history.slice(-5).reverse().map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${activity.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.type === 'earned' ? '+' : '-'}{Math.abs(activity.points)} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}