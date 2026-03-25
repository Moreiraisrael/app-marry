import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, FileText, Palette, Ruler, Camera, Sparkles, Calendar, Phone, Mail, Clock, Plus, CheckCircle, TrendingUp
} from 'lucide-react';
import AIStyleProfile from '@/components/client/AIStyleProfile';
import StyleEvolutionTracker from '@/components/dashboard/StyleEvolutionTracker';
import ProductRecommendationForm from '@/components/consultant/ProductRecommendationForm';

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

const seasonColors = {
  primavera_clara: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', colors: ['#FFE4C4', '#FFDAB9', '#F5DEB3', '#FFA07A', '#20B2AA', '#98FB98'] },
  primavera_quente: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', colors: ['#FF6347', '#FF8C00', '#FFD700', '#9ACD32', '#20B2AA', '#DEB887'] },
  primavera_brilhante: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', colors: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#FFD700', '#00BFFF'] },
  verao_claro: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', colors: ['#E6E6FA', '#B0C4DE', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'] },
  verao_suave: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', colors: ['#BC8F8F', '#C0C0C0', '#D8BFD8', '#9DC183', '#87CEEB', '#DEB887'] },
  verao_frio: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', colors: ['#DB7093', '#6495ED', '#DDA0DD', '#778899', '#F5F5DC', '#E0B0FF'] },
  outono_suave: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', colors: ['#D2B48C', '#BC8F8F', '#8FBC8F', '#CD853F', '#F4A460', '#DAA520'] },
  outono_quente: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', colors: ['#D2691E', '#B8860B', '#6B8E23', '#CD5C5C', '#8B4513', '#FF8C00'] },
  outono_profundo: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', colors: ['#8B0000', '#006400', '#4B0082', '#8B4513', '#B8860B', '#2F4F4F'] },
  inverno_profundo: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', colors: ['#000000', '#FFFFFF', '#FF0000', '#0000CD', '#006400', '#4B0082'] },
  inverno_frio: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', colors: ['#FF00FF', '#00FFFF', '#4169E1', '#C0C0C0', '#FFFFFF', '#800080'] },
  inverno_brilhante: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', colors: ['#FF1493', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF'] },
};

const bodyTypeLabels = {
  ampulheta: 'Ampulheta',
  triangulo: 'Triângulo',
  triangulo_invertido: 'Triângulo Invertido',
  retangulo: 'Retângulo',
  oval: 'Oval'
};

const styleLabels = {
  classico: 'Clássico',
  dramatico: 'Dramático',
  romantico: 'Romântico',
  natural: 'Natural',
  criativo: 'Criativo',
  elegante: 'Elegante',
  sensual: 'Sensual'
};

export default function ClientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: clientId });
      return clients[0];
    },
    enabled: !!clientId
  });

  const { data: tryOns = [] } = useQuery({
    queryKey: ['client-tryons', clientId],
    queryFn: () => base44.entities.VirtualTryOn.filter({ client_id: clientId }, '-created_date', 10),
    enabled: !!clientId
  });

  const { data: colorAnalysis = [] } = useQuery({
    queryKey: ['color-analysis', clientId],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['style-quizzes', clientId],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', clientId],
    queryFn: () => base44.entities.Appointment.filter({ client_id: clientId }, '-date'),
    enabled: !!clientId
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-items', clientId],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto text-center py-16">
        <p className="text-gray-600">Cliente não encontrada</p>
        <Link to={createPageUrl("Clients")}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const seasonStyle = client.season ? seasonColors[client.season] : null;
  const approvedColorAnalysis = colorAnalysis.find(a => a.status === 'approved');
  const approvedStyleQuiz = styleQuizzes.find(q => q.status === 'approved');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link to={createPageUrl("Clients")}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Link to={createPageUrl(`GenerateDossier?clientId=${client.id}`)}>
          <Button className="bg-gradient-to-r from-rose-500 to-rose-600">
            <FileText className="w-4 h-4 mr-2" />
            Gerar Dossiê PDF
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-xl mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-32" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            {client.profile_photo ? (
              <img 
                src={client.profile_photo} 
                alt={client.full_name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-4xl font-medium border-4 border-white shadow-lg">
                {client.full_name?.[0] || 'C'}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{client.full_name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {client.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                )}
                {client.birth_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(client.birth_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              
              {client.season && (
                <Badge className={`mt-3 ${seasonStyle?.bg} ${seasonStyle?.text} ${seasonStyle?.border} border`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {seasonLabels[client.season]}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Visão Geral</TabsTrigger>
          <TabsTrigger value="recommend" className="rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Recomendar
          </TabsTrigger>
          <TabsTrigger value="ai-profile" className="rounded-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Perfil IA
          </TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-lg">
            <Palette className="w-4 h-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-lg">
            <Clock className="w-4 h-4 mr-2" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="measures" className="rounded-lg">
            <Ruler className="w-4 h-4 mr-2" />
            Medidas
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-lg">
            <Camera className="w-4 h-4 mr-2" />
            Galeria
          </TabsTrigger>
          <TabsTrigger value="evolution" className="rounded-lg">
            <TrendingUp className="w-4 h-4 mr-2" />
            Evolução
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommend">
          <ProductRecommendationForm clientId={clientId} />
        </TabsContent>

        <TabsContent value="ai-profile">
          <AIStyleProfile
            client={client}
            colorAnalysis={approvedColorAnalysis}
            styleQuiz={approvedStyleQuiz}
            wardrobeItems={wardrobeItems}
          />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Análise de Coloração
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedColorAnalysis ? (
                  <div>
                    <Badge className="bg-green-100 text-green-700 mb-3">
                      {seasonLabels[approvedColorAnalysis.consultant_season]}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Aprovada em {new Date(approvedColorAnalysis.updated_date).toLocaleDateString('pt-BR')}
                    </p>
                    {approvedColorAnalysis.consultant_notes && (
                      <p className="text-sm text-gray-700 mt-2">{approvedColorAnalysis.consultant_notes}</p>
                    )}
                  </div>
                ) : colorAnalysis.find(a => a.status === 'pending') ? (
                  <p className="text-sm text-amber-600">Análise pendente</p>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma análise</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Análise de Estilo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedStyleQuiz ? (
                  <div>
                    <Badge className="bg-purple-100 text-purple-700 mb-3 capitalize">
                      {styleLabels[approvedStyleQuiz.consultant_style]}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Aprovada em {new Date(approvedStyleQuiz.updated_date).toLocaleDateString('pt-BR')}
                    </p>
                    {approvedStyleQuiz.consultant_notes && (
                      <p className="text-sm text-gray-700 mt-2">{approvedStyleQuiz.consultant_notes}</p>
                    )}
                  </div>
                ) : styleQuizzes.find(q => q.status === 'pending') ? (
                  <p className="text-sm text-amber-600">Pendente</p>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum questionário</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Histórico de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {apt.service_type === 'coloracao' ? 'Análise de Coloração' :
                             apt.service_type === 'estilo' ? 'Análise de Estilo' :
                             apt.service_type === 'closet' ? 'Organização de Closet' :
                             apt.service_type === 'personal_shopping' ? 'Personal Shopping' :
                             apt.service_type === 'followup' ? 'Follow-up' : 'Outro'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(apt.date).toLocaleDateString('pt-BR')} às {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge className={
                          apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }>
                          {apt.status === 'scheduled' ? 'Agendado' :
                           apt.status === 'confirmed' ? 'Confirmado' :
                           apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma consulta</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid md:grid-cols-2 gap-6">
            {client.season && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Estação: {seasonLabels[client.season]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Paleta de cores:</p>
                  <div className="flex flex-wrap gap-3">
                    {seasonStyle?.colors.map((color, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-12 h-12 rounded-xl shadow-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.skin_tone && (
                  <div>
                    <span className="text-sm text-gray-500">Tom de Pele</span>
                    <p className="font-medium">{client.skin_tone}</p>
                  </div>
                )}
                {client.hair_color && (
                  <div>
                    <span className="text-sm text-gray-500">Cor dos Cabelos</span>
                    <p className="font-medium">{client.hair_color}</p>
                  </div>
                )}
                {client.eye_color && (
                  <div>
                    <span className="text-sm text-gray-500">Cor dos Olhos</span>
                    <p className="font-medium">{client.eye_color}</p>
                  </div>
                )}
                {client.body_type && (
                  <div>
                    <span className="text-sm text-gray-500">Tipo de Corpo</span>
                    <p className="font-medium">{bodyTypeLabels[client.body_type]}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.notes && (
              <Card className="border-0 shadow-lg md:col-span-2">
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consultas Agendadas</CardTitle>
                <Button size="sm" onClick={() => navigate(createPageUrl('Appointments'))} className="bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {apt.service_type === 'coloracao' ? 'Análise de Coloração' :
                             apt.service_type === 'estilo' ? 'Análise de Estilo' :
                             apt.service_type === 'closet' ? 'Organização de Closet' :
                             apt.service_type === 'personal_shopping' ? 'Personal Shopping' :
                             apt.service_type === 'followup' ? 'Follow-up' : 'Outro'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {apt.duration} min
                          </p>
                        </div>
                        <Badge className={
                          apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }>
                          {apt.status === 'scheduled' ? 'Agendado' :
                           apt.status === 'confirmed' ? 'Confirmado' :
                           apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>
                      {apt.location && <p className="text-sm text-gray-600 mb-2"><strong>Local:</strong> {apt.location}</p>}
                      {apt.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Observações:</p>
                          <p className="text-sm">{apt.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Nenhuma consulta agendada</p>
                  <Button onClick={() => navigate(createPageUrl('Appointments'))} className="mt-4 bg-blue-600">
                    Agendar Primeira Consulta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measures">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Medidas Corporais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.height || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Altura (cm)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.weight || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Peso (kg)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.bust || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Busto (cm)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.waist || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Cintura (cm)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.hip || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Quadril (cm)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl font-bold text-gray-900">{client.shoulder_width || '—'}</span>
                  <p className="text-sm text-gray-500 mt-1">Ombros (cm)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Provas Virtuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tryOns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma prova virtual</p>
                  <Link to={createPageUrl("VirtualFitting")}>
                    <Button variant="outline" className="mt-4">Ir para Provador Virtual</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tryOns.map(tryOn => (
                    <div key={tryOn.id} className="aspect-square rounded-xl overflow-hidden">
                      <img 
                        src={tryOn.result_image || tryOn.clothing_image} 
                        alt="Try-on"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <StyleEvolutionTracker clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}