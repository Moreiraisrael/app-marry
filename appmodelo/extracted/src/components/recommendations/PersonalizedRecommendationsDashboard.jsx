import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PieceRecommendationsDisplay from './PieceRecommendationsDisplay';
import CompleteLooksDisplay from './CompleteLooksDisplay';
import FashionTrendsDisplay from './FashionTrendsDisplay';
import BrandRecommendationsDisplay from './BrandRecommendationsDisplay';

export default function PersonalizedRecommendationsDashboard({ 
  clientId, 
  clientData, 
  colorAnalysis, 
  styleQuiz, 
  wardrobeItems 
}) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pieces');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generatePersonalizedRecommendations', {
          clientId,
          clientData,
          colorAnalysis,
          styleQuiz,
          wardrobeItems
        });
        setRecommendations(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar recomendações personalizadas');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadRecommendations();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Gerando recomendações personalizadas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  const tabs = [
    { id: 'pieces', label: '👗 Peças', icon: '👗' },
    { id: 'looks', label: '✨ Looks Completos', icon: '✨' },
    { id: 'trends', label: '🔥 Tendências', icon: '🔥' },
    { id: 'brands', label: '🛍️ Marcas', icon: '🛍️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Recomendações Personalizadas</h2>
            </div>
            <p className="text-white/90">
              Sugestões selecionadas especialmente para seu estilo, corpo e preferências
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'pieces' && (
          <PieceRecommendationsDisplay pieces={recommendations.piece_recommendations} />
        )}
        {activeTab === 'looks' && (
          <CompleteLooksDisplay looks={recommendations.complete_looks} />
        )}
        {activeTab === 'trends' && (
          <FashionTrendsDisplay trends={recommendations.fashion_trends} />
        )}
        {activeTab === 'brands' && (
          <BrandRecommendationsDisplay brands={recommendations.partner_brands} />
        )}
      </div>
    </div>
  );
}