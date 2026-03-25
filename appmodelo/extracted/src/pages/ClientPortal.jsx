import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import PersonalizedOffersCarousel from '@/components/affiliate/PersonalizedOffersCarousel';
import ShoppingCartPanel from '@/components/shop/ShoppingCartPanel';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Clock, 
  CheckCircle,
  Camera,
  User,
  ArrowRight,
  XCircle,
  Palette,
  FileText,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  Image as ImageIcon,
  Award,
  Shirt,
  TrendingUp,
  Trophy
} from 'lucide-react';
import ChatWithConsultant from '@/components/client/ChatWithConsultant';
import PhotoGallery from '@/components/client/PhotoGallery';
import ProgressDashboard from '@/components/gamification/ProgressDashboard';
import AILookGenerator from '@/components/client/AILookGenerator';
import SeasonalColorPalette from '@/components/dossier/SeasonalColorPalette';
import RecommendedEbooks from '@/components/client/RecommendedEbooks';
import EnhancedDossierSummary from '@/components/dossier/EnhancedDossierSummary';
import StyleEvolutionTracker from '@/components/evolution/StyleEvolutionTracker';
import BulkWardrobeUploader from '@/components/wardrobe/BulkWardrobeUploader';
import DigitalWardrobeVisualizer from '@/components/wardrobe/DigitalWardrobeVisualizer';
import WardrobeGapsAnalyzer from '@/components/wardrobe/WardrobeGapsAnalyzer';
import AIOutfitGenerator from '@/components/wardrobe/AIOutfitGenerator';
import PersonalStylistAssistant from '@/components/styling/PersonalStylistAssistant';
import { Link as RouterLink } from 'react-router-dom';

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load client data
        const clients = await base44.entities.Client.filter({ email: userData.email });
        if (clients[0]) setClient(clients[0]);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: analysisRequests = [] } = useQuery({
    queryKey: ['my-analysis-requests'],
    queryFn: async () => {
      if (!client) return [];
      return await base44.entities.ColorAnalysisRequest.filter({ client_id: client.id }, '-created_date');
    },
    enabled: !!client
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['my-style-quizzes'],
    queryFn: async () => {
      if (!client) return [];
      return await base44.entities.StyleQuiz.filter({ client_id: client.id }, '-created_date');
    },
    enabled: !!client
  });

  const { data: ebooks = [] } = useQuery({
    queryKey: ['ebooks'],
    queryFn: () => base44.entities.Ebook.filter({ is_active: true })
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['my-appointments', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      return await base44.entities.Appointment.filter({ client_id: client.id }, '-date');
    },
    enabled: !!client?.id
  });

  const { data: wardrobeItems = [], refetch: refetchWardrobe } = useQuery({
    queryKey: ['my-wardrobe', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      return await base44.entities.WardrobeItem.filter({ client_id: client.id }, '-created_date');
    },
    enabled: !!client?.id
  });

  const approvedAnalysis = analysisRequests.find(r => r.status === 'approved');
  const pendingAnalysis = analysisRequests.find(r => r.status === 'pending');
  const approvedStyleQuiz = styleQuizzes.find(q => q.status === 'approved');
  const pendingStyleQuiz = styleQuizzes.find(q => q.status === 'pending');

  const seasonLabels = {
    primavera_clara: 'Primavera Clara',
    primavera_quente: 'Primavera Quente',
    primavera_brilhante: 'Primavera Brilhante',
    verao_claro: 'Verão Claro',
    verao_suave: 'Verão Suave',
    verao_frio: 'Verão Frio',
    outono_suave: 'Outono Suave',
    outono_quente: 'Outono Quente',
    outono_profundo: 'Outono Profundo',
    inverno_profundo: 'Inverno Profundo',
    inverno_frio: 'Inverno Frio',
    inverno_brilhante: 'Inverno Brilhante'
  };

  if (!user || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const hasDossier = approvedAnalysis && approvedStyleQuiz;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Olá, <span className="font-semibold">{user.full_name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-600">Bem-vinda ao seu portal de estilo</p>
          </div>
          <div className="flex items-center gap-3">
            <ShoppingCartPanel clientId={client.id} />
            <Button variant="outline" onClick={() => base44.auth.logout()}>
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="looks" className="rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Meus Looks IA
            </TabsTrigger>
            {hasDossier && (
              <TabsTrigger value="dossier" className="rounded-lg">
                <FileText className="w-4 h-4 mr-2" />
                Meu Dossiê
              </TabsTrigger>
            )}
            <TabsTrigger value="shop" className="rounded-lg">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              E-books
            </TabsTrigger>
            <TabsTrigger value="wardrobe" className="rounded-lg">
              <Shirt className="w-4 h-4 mr-2" />
              Guarda-Roupa Digital
            </TabsTrigger>
            <TabsTrigger value="virtual" className="rounded-lg">
              <Shirt className="w-4 h-4 mr-2" />
              Provador Virtual
            </TabsTrigger>
            <TabsTrigger value="photos" className="rounded-lg">
              <ImageIcon className="w-4 h-4 mr-2" />
              Minhas Fotos
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg">
              <Award className="w-4 h-4 mr-2" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="evolution" className="rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="gamification" className="rounded-lg">
              <Trophy className="w-4 h-4 mr-2" />
              Gamificação
            </TabsTrigger>
            <TabsTrigger value="stylist" className="rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Assistente de Estilo
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

            {/* Personalized Offers Carousel */}
            {approvedAnalysis && (
              <PersonalizedOffersCarousel
                season={approvedAnalysis.consultant_season}
                style={approvedStyleQuiz?.consultant_style}
                clientId={client.id}
              />
            )}

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Approved Analysis */}
          {approvedAnalysis ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Análise Aprovada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sua estação foi identificada pela consultora!
                </p>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-lg px-4 py-2">
                  {seasonLabels[approvedAnalysis.consultant_season]}
                </Badge>
                <Link to={createPageUrl(`MyResults?requestId=${approvedAnalysis.id}`)}>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    Ver Meus Resultados
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : pendingAnalysis ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-5 h-5" />
                  Análise em Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sua análise está sendo avaliada pela consultora. Você receberá os resultados em breve!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-700">
                  <Clock className="w-5 h-5" />
                  Análise de Coloração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aguardando análise da consultora. Você será notificada quando estiver pronta!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Style Quiz Card */}
          {approvedStyleQuiz ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Palette className="w-5 h-5" />
                  Estilo Aprovado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Seu estilo pessoal foi identificado!
                </p>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-lg px-4 py-2 capitalize">
                  {approvedStyleQuiz.consultant_style}
                </Badge>
              </CardContent>
            </Card>
          ) : pendingStyleQuiz ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-5 h-5" />
                  Questionário em Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Seu questionário está sendo avaliado pela consultora!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Palette className="w-5 h-5" />
                  Descobrir Meu Estilo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Responda o questionário de estilo pessoal!
                </p>
                <Link to={createPageUrl("StyleQuiz")}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
                    Iniciar Questionário
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Profile Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Nome</span>
                <p className="font-medium">{user.full_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <span className="text-sm text-gray-500">Telefone</span>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

            {/* Help Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-rose-500" />
                <h3 className="text-lg font-semibold mb-2">Como funciona?</h3>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Faça upload de suas fotos e responda o questionário. Nossa consultora 
                  irá analisar cuidadosamente e identificar sua estação no método das 12 estações. 
                  Você receberá um dossiê completo com suas cores ideais!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dossier Tab */}
          {hasDossier && (
            <TabsContent value="dossier" className="space-y-6">
              <EnhancedDossierSummary 
                clientId={client.id}
                season={approvedAnalysis.consultant_season}
                style={approvedStyleQuiz.consultant_style}
                colorAnalysis={approvedAnalysis}
                styleQuiz={approvedStyleQuiz}
                appointments={appointments}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-rose-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-rose-700 mb-2">Sua Estação</h3>
                  <Badge className="bg-rose-600 text-lg px-4 py-2">
                    {seasonLabels[approvedAnalysis.consultant_season]}
                  </Badge>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-700 mb-2">Seu Estilo</h3>
                  <Badge className="bg-purple-600 text-lg px-4 py-2 capitalize">
                    {approvedStyleQuiz.consultant_style}
                  </Badge>
                </div>
              </div>

              {/* Cartela de Cores Completa */}
              <div>
                <SeasonalColorPalette season={approvedAnalysis.consultant_season} />
              </div>

              <Link to={createPageUrl(`MyResults?requestId=${approvedAnalysis.id}`)}>
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600" size="lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Ver Dossiê Completo com Análises
                </Button>
              </Link>
            </TabsContent>
          )}

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                  Loja Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Explore produtos selecionados especialmente para seu perfil!
                </p>
                <Link to={createPageUrl('Shop')}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Acessar Loja
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ebooks Tab */}
          <TabsContent value="ebooks" className="space-y-6">
            <Tabs defaultValue="recomendados" className="space-y-6">
              <TabsList className="bg-white shadow-md p-1 rounded-xl">
                <TabsTrigger value="recomendados" className="rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Recomendados
                </TabsTrigger>
                <TabsTrigger value="todos" className="rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Todos os E-books
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recomendados">
                <RecommendedEbooks clientId={client.id} />
              </TabsContent>

              <TabsContent value="todos">
                <div className="grid md:grid-cols-2 gap-6">
                  {ebooks.map((ebook) => (
                    <Card key={ebook.id} className="border-0 shadow-lg">
                      {ebook.cover_image && (
                        <img 
                          src={ebook.cover_image} 
                          alt={ebook.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{ebook.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{ebook.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-rose-600">
                            R$ {ebook.price.toFixed(2)}
                          </span>
                          <Button className="bg-gradient-to-r from-rose-500 to-pink-600">
                            Comprar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Virtual Fitting Tab */}
          <TabsContent value="virtual">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-pink-500" />
                  Provador Virtual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Experimente roupas virtualmente antes de comprar!
                </p>
                <Link to={createPageUrl('VirtualFitting')}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-600">
                    <Shirt className="w-5 h-5 mr-2" />
                    Abrir Provador Virtual
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <PhotoGallery clientId={client.id} canUpload={true} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ChatWithConsultant clientId={client.id} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <ProgressDashboard clientId={client.id} />
          </TabsContent>

          {/* AI Looks Tab */}
          <TabsContent value="looks">
            <AILookGenerator 
              client={client}
              season={approvedAnalysis?.consultant_season}
              style={approvedStyleQuiz?.consultant_style}
            />
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution">
            <StyleEvolutionTracker clientId={client.id} />
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification">
            <GamificationDashboard clientId={client.id} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Seu Guia de Estilo Completo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Acesse artigos personalizados, guias de estilo, relatórios de tendências e outfit ideas criados especialmente para você.
                </p>
                <RouterLink to={createPageUrl('StyleContent')}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Explorar Conteúdo Personalizado
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </RouterLink>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Stylist Tab */}
          <TabsContent value="stylist" className="space-y-6">
            {wardrobeItems.length > 0 ? (
              <PersonalStylistAssistant
                clientId={client.id}
                clientData={client}
                wardrobeItems={wardrobeItems}
                colorAnalysis={approvedAnalysis}
                styleQuiz={approvedStyleQuiz}
              />
            ) : (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-gray-600 mb-4">
                    Digitalize seu guarda-roupa primeiro para usar o assistente de estilo!
                  </p>
                  <Link to={createPageUrl('ClientPortal?tab=wardrobe')}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Ir para Guarda-Roupa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Wardrobe Tab */}
          <TabsContent value="wardrobe" className="space-y-6">
            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="bg-white shadow-md p-1 rounded-xl">
                <TabsTrigger value="upload" className="gap-2">
                  Upload em Massa
                </TabsTrigger>
                <TabsTrigger value="visualize" className="gap-2">
                  Meu Guarda-Roupa ({wardrobeItems.length})
                </TabsTrigger>
                <TabsTrigger value="gaps" className="gap-2">
                  Análise de Lacunas
                </TabsTrigger>
                <TabsTrigger value="outfits" className="gap-2">
                  Sugerir Outfits
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <BulkWardrobeUploader 
                  clientId={client.id}
                  clientSeason={approvedAnalysis?.consultant_season}
                  onComplete={() => refetchWardrobe()}
                />
              </TabsContent>

              <TabsContent value="visualize">
                {wardrobeItems.length === 0 ? (
                  <Card className="border-0 shadow-lg text-center py-12">
                    <CardContent>
                      <Shirt className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-4">Comece digitalizando seu guarda-roupa!</p>
                      <Button 
                        onClick={() => document.querySelector('[value="upload"]')?.click()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        Fazer Upload
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <DigitalWardrobeVisualizer 
                    wardrobeItems={wardrobeItems}
                    onDelete={async (itemId) => {
                      await base44.entities.WardrobeItem.delete(itemId);
                      refetchWardrobe();
                      toast.success('Peça removida');
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="gaps">
                {wardrobeItems.length > 0 && (
                  <WardrobeGapsAnalyzer clientId={client.id} />
                )}
              </TabsContent>

              <TabsContent value="outfits">
                {wardrobeItems.length > 0 ? (
                  <AIOutfitGenerator 
                    client={client}
                    wardrobeItems={wardrobeItems}
                    colorAnalysis={approvedAnalysis}
                    styleQuiz={approvedStyleQuiz}
                  />
                ) : (
                  <Card className="border-0 shadow-lg text-center py-12">
                    <CardContent>
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                      <p className="text-gray-600 mb-4">Digitalize seu guarda-roupa para gerar outfits!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}