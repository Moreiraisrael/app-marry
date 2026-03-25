import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, BookOpen, TrendingUp, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FashionArticles from '@/components/content/FashionArticles';
import StyleGuides from '@/components/content/StyleGuides';
import TrendReports from '@/components/content/TrendReports';
import OutfitIdeasContent from '@/components/content/OutfitIdeasContent';

export default function StyleContent() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const clients = await base44.entities.Client.filter({ email: userData.email });
        if (clients[0]) setClient(clients[0]);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-items', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      return await base44.entities.WardrobeItem.filter({ client_id: client.id });
    },
    enabled: !!client?.id
  });

  const { data: colorAnalysis } = useQuery({
    queryKey: ['color-analysis', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const analyses = await base44.entities.ColorAnalysisRequest.filter(
        { client_id: client.id, status: 'approved' },
        '-created_date'
      );
      return analyses[0] || null;
    },
    enabled: !!client?.id
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['style-quiz', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const quizzes = await base44.entities.StyleQuiz.filter(
        { client_id: client.id, status: 'approved' },
        '-created_date'
      );
      return quizzes[0] || null;
    },
    enabled: !!client?.id
  });

  if (!user || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'articles', label: '✍️ Artigos', icon: BookOpen },
    { id: 'guides', label: '📚 Guias', icon: BookOpen },
    { id: 'trends', label: '🔥 Tendências', icon: TrendingUp },
    { id: 'outfits', label: '👗 Outfits', icon: Shirt }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-purple-600 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Conteúdo Personalizado
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              Seu <span className="font-semibold">Guia de Estilo Completo</span>
            </h1>
            <p className="text-gray-600">
              Artigos, guias, tendências e outfit ideas criados especialmente para você
            </p>
          </div>
        </motion.div>

        {/* Profile Info Card */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Seu Estilo</p>
                <p className="text-lg font-semibold text-purple-900 capitalize">
                  {styleQuiz?.consultant_style || 'Não definido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Sua Estação</p>
                <p className="text-lg font-semibold text-purple-900 capitalize">
                  {colorAnalysis?.recommended_season || 'Não definida'}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Peças no Guarda-Roupa</p>
                <p className="text-lg font-semibold text-purple-900">
                  {wardrobeItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-white shadow-md p-1 rounded-xl">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg">
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Articles */}
          <TabsContent value="articles" className="space-y-6">
            {client && colorAnalysis && styleQuiz ? (
              <FashionArticles
                clientId={client.id}
                clientData={client}
                wardrobeItems={wardrobeItems}
                colorAnalysis={colorAnalysis}
                styleQuiz={styleQuiz}
              />
            ) : (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <p className="text-gray-600">
                    Complete sua análise de cor e teste de estilo para desbloquear artigos personalizados
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guides */}
          <TabsContent value="guides" className="space-y-6">
            {client && colorAnalysis && styleQuiz ? (
              <StyleGuides
                clientId={client.id}
                clientData={client}
                wardrobeItems={wardrobeItems}
                colorAnalysis={colorAnalysis}
                styleQuiz={styleQuiz}
              />
            ) : (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <p className="text-gray-600">
                    Complete sua análise de cor e teste de estilo para desbloquear guias personalizados
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-6">
            {client && colorAnalysis && styleQuiz ? (
              <TrendReports
                clientId={client.id}
                clientData={client}
                wardrobeItems={wardrobeItems}
                colorAnalysis={colorAnalysis}
                styleQuiz={styleQuiz}
              />
            ) : (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <p className="text-gray-600">
                    Complete sua análise de cor e teste de estilo para desbloquear relatórios de tendências
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Outfits */}
          <TabsContent value="outfits" className="space-y-6">
            {wardrobeItems.length > 0 && colorAnalysis && styleQuiz ? (
              <OutfitIdeasContent
                clientId={client.id}
                clientData={client}
                wardrobeItems={wardrobeItems}
                colorAnalysis={colorAnalysis}
                styleQuiz={styleQuiz}
              />
            ) : (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {wardrobeItems.length === 0
                      ? 'Digitalize seu guarda-roupa para gerar outfit ideas personalizados'
                      : 'Complete sua análise de cor e teste de estilo para desbloquear outfit ideas'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}