import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Leaf, Zap, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PieceRecommendations from './PieceRecommendations';
import CapsuleWardrobeCreator from './CapsuleWardrobeCreator';
import SustainabilityAnalysis from './SustainabilityAnalysis';

export default function EnhancedWardrobeAnalyzer({ clientId, wardrobeItems, clientData, colorAnalysis, styleQuiz }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pieces');

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generateAdvancedWardrobeAnalysis', {
          clientId,
          wardrobeItems,
          clientData,
          colorAnalysis,
          styleQuiz
        });
        setAnalysis(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar análise avançada');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && wardrobeItems?.length > 0) {
      loadAnalysis();
    }
  }, [clientId, wardrobeItems?.length]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Gerando análise avançada com IA...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Análise Completa de Guarda-Roupa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.overview}</p>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pieces')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'pieces'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Preencher Lacunas
        </button>
        <button
          onClick={() => setActiveTab('capsules')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'capsules'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Mini-Coleções
        </button>
        <button
          onClick={() => setActiveTab('sustainability')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'sustainability'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Leaf className="w-4 h-4 inline mr-2" />
          Sustentabilidade
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'pieces' && (
          <PieceRecommendations recommendations={analysis.piece_recommendations} />
        )}
        {activeTab === 'capsules' && (
          <CapsuleWardrobeCreator capsules={analysis.capsule_collections} wardrobeItems={wardrobeItems} />
        )}
        {activeTab === 'sustainability' && (
          <SustainabilityAnalysis sustainability={analysis.sustainability_analysis} />
        )}
      </div>
    </div>
  );
}