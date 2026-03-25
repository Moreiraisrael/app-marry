import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { Flame, Star, Trophy } from 'lucide-react';

export default function GamificationDisplay({ evolution }) {
  if (!evolution) return null;

  const badgesByCategory = {
    milestone: evolution.badges?.filter(b => b.category === 'milestone') || [],
    achievement: evolution.badges?.filter(b => b.category === 'achievement') || [],
    consistency: evolution.badges?.filter(b => b.category === 'consistency') || [],
    exploration: evolution.badges?.filter(b => b.category === 'exploration') || []
  };

  return (
    <div className="space-y-4">
      {/* Points & Streak Header */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-3xl font-bold text-yellow-600">{evolution.points || 0}</p>
              <p className="text-sm text-gray-600">Pontos Acumulados</p>
              <p className="text-xs text-gray-500 mt-1">+{evolution.points_this_month || 0} este mês</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-3xl font-bold text-orange-600">{evolution.streak_days || 0}</p>
              <p className="text-sm text-gray-600">Dias de Streak</p>
              <p className="text-xs text-gray-500 mt-1">Mantenha o fogo aceso!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-purple-600">{evolution.badges?.length || 0}</p>
              <p className="text-sm text-gray-600">Badges Ganhos</p>
              <p className="text-xs text-gray-500 mt-1">Colecione todas!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Badges Conquistados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(badgesByCategory).some(cat => badgesByCategory[cat].length > 0) ? (
            Object.entries(badgesByCategory).map(([category, badges]) =>
              badges.length > 0 && (
                <div key={category}>
                  <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {category === 'milestone' ? '🎯 Marcos' : category === 'achievement' ? '🏆 Conquistas' : category === 'consistency' ? '⚔️ Consistência' : '🗺️ Exploração'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((badge, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <span className="text-3xl">{badge.badge_icon}</span>
                        <p className="text-xs font-medium text-center text-gray-900 line-clamp-2">
                          {badge.badge_name}
                        </p>
                        <p className="text-xs text-gray-600 text-center line-clamp-2">
                          {badge.description}
                        </p>
                        <Badge className="text-xs bg-purple-100 text-purple-700 mt-1">
                          {badge.earned_date ? new Date(badge.earned_date).toLocaleDateString('pt-BR') : 'Ganho'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <p className="text-gray-600 text-center py-8">
              Complete sugestões e metas para ganhar badges! 🎯
            </p>
          )}
        </CardContent>
      </Card>

      {/* Points Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Progresso do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pontos deste mês</span>
              <span className="font-semibold">{evolution.points_this_month || 0} / 500</span>
            </div>
            <Progress value={Math.min(((evolution.points_this_month || 0) / 500) * 100, 100)} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {500 - (evolution.points_this_month || 0)} pontos para unlock especial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}