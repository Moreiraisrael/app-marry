import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { 
  Award, 
  Star, 
  Trophy, 
  Sparkles, 
  ShoppingBag, 
  Palette,
  Users,
  Download,
  Camera,
  Heart,
  Crown,
  Zap
} from 'lucide-react';

const ACHIEVEMENT_ICONS = {
  color_analysis: Palette,
  style_quiz: Sparkles,
  dossier_download: Download,
  first_purchase: ShoppingBag,
  wardrobe_10: Camera,
  wardrobe_50: Camera,
  favorite_look: Heart,
  five_purchases: ShoppingBag,
  consultation_complete: Users,
  trendsetter: Star,
  style_master: Crown,
  fashionista: Zap
};

export default function AchievementBadge({ achievement, unlocked, animated = false }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.id] || Award;
  
  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <Card className={`border-2 ${unlocked ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' : 'border-gray-200 bg-gray-50 opacity-50'} p-4 text-center`}>
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
          unlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg' 
            : 'bg-gray-200'
        }`}>
          <Icon className={`w-8 h-8 ${unlocked ? 'text-white' : 'text-gray-400'}`} />
        </div>
        
        <h4 className={`font-semibold text-sm mb-1 ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
          {achievement.name}
        </h4>
        
        <p className={`text-xs mb-2 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
        
        <Badge className={unlocked ? 'bg-yellow-500' : 'bg-gray-300'}>
          +{achievement.points} XP
        </Badge>
      </Card>
    </motion.div>
  );
}