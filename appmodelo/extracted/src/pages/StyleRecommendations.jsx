import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import TrendAnalyzer from '@/components/trends/TrendAnalyzer';
import SmartShoppingRecommendations from '@/components/recommendations/SmartShoppingRecommendations';
import MoodBoard from '@/components/dossier/MoodBoard';

export default function StyleRecommendations() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.user_type === 'client') {
        const clients = await base44.entities.Client.filter({ 
          email: userData.email 
        });
        if (clients.length > 0) {
          setClient(clients[0]);
        }
      }
    };
    loadUser();
  }, []);

  const { data: colorAnalysis } = useQuery({
    queryKey: ['color-analysis', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const analyses = await base44.entities.ColorAnalysisRequest.filter({
        client_id: client.id,
        status: 'approved'
      });
      return analyses[0];
    },
    enabled: !!client?.id
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['style-quiz', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const quizzes = await base44.entities.StyleQuiz.filter({
        client_id: client.id,
        status: 'approved'
      });
      return quizzes[0];
    },
    enabled: !!client?.id
  });

  if (!client) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Card className="border-0 shadow-lg text-center py-12">
          <CardContent>
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Carregando suas recomendações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Recomendações Inteligentes
        </div>
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          <span className="font-semibold">Análise de Tendências</span> & Recomendações Personalizadas
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Descubra as tendências de moda mais recentes, mood boards visuais e produtos específicos selecionados especialmente para seu estilo e coloração
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-white shadow-md p-1 rounded-xl border">
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendências 2026
          </TabsTrigger>
          <TabsTrigger value="shopping" className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            Recomendações de Compra
          </TabsTrigger>
          <TabsTrigger value="moodboard" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Mood Boards
          </TabsTrigger>
        </TabsList>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <TrendAnalyzer 
            client={client}
            colorAnalysis={colorAnalysis}
            styleQuiz={styleQuiz}
          />
        </TabsContent>

        {/* Shopping Recommendations */}
        <TabsContent value="shopping" className="space-y-6">
          <SmartShoppingRecommendations
            clientId={client.id}
            season={client.season}
            stylePreference={styleQuiz?.consultant_style}
          />
        </TabsContent>

        {/* Mood Boards */}
        <TabsContent value="moodboard" className="space-y-6">
          <MoodBoard
            season={client.season}
            style={styleQuiz?.consultant_style}
            clientName={client.full_name}
          />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Como Isso Funciona?</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✨ <strong>Tendências:</strong> Análise em tempo real das tendências de moda 2026 com compatibilidade com seu perfil</li>
                <li>🛍️ <strong>Compras:</strong> Sugestões específicas de produtos em lojas parceiras com links diretos</li>
                <li>🎨 <strong>Mood Boards:</strong> Inspiração visual personalisada baseada em sua estação de cores e estilo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}