import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Cloud, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import OutfitFeedbackUploader from '@/components/outfit/OutfitFeedbackUploader';

const EVENTS = [
  { value: 'trabalho', label: '💼 Trabalho' },
  { value: 'casual', label: '👟 Casual' },
  { value: 'encontro', label: '💕 Encontro' },
  { value: 'festa', label: '🎉 Festa' },
  { value: 'casamento', label: '💒 Casamento' },
  { value: 'academia', label: '💪 Academia' },
  { value: 'praia', label: '🏖️ Praia' },
  { value: 'evento_formal', label: '🎩 Evento Formal' },
  { value: 'compras', label: '🛍️ Compras' },
  { value: 'viagem', label: '✈️ Viagem' }
];

const WEATHER = [
  { value: 'sol', label: '☀️ Ensolarado' },
  { value: 'nublado', label: '☁️ Nublado' },
  { value: 'chuva', label: '🌧️ Chuva' },
  { value: 'frio', label: '❄️ Frio' },
  { value: 'muito_frio', label: '🥶 Muito Frio' },
  { value: 'calor', label: '🔥 Calor Intenso' }
];

export default function OutfitGenerator() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState(null);
  
  const [formData, setFormData] = useState({
    event: '',
    weather: '',
    occasion_details: '',
    preferences: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const clients = await base44.entities.Client.filter({ email: userData.email });
        if (clients[0]) {
          setClient(clients[0]);
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: wardrobeItems } = useQuery({
    queryKey: ['wardrobeItems', client?.id],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: client?.id }),
    enabled: !!client?.id,
    initialData: []
  });

  const { data: colorAnalysis } = useQuery({
    queryKey: ['colorAnalysis', client?.id],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: client?.id }),
    enabled: !!client?.id,
    initialData: []
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['styleQuiz', client?.id],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: client?.id }),
    enabled: !!client?.id,
    initialData: []
  });

  const handleGenerateOutfits = async () => {
    if (!formData.event || !formData.weather) {
      toast.error('Selecione evento e clima');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateStyleAdvice', {
        clientId: client?.id,
        clientData: client,
        wardrobeItems: wardrobeItems || [],
        colorAnalysis: colorAnalysis?.[0],
        styleQuiz: styleQuiz?.[0],
        request_type: 'outfit',
        occasion: EVENTS.find(e => e.value === formData.event)?.label,
        event: formData.event,
        weather: formData.weather,
        preferences: formData.preferences
      });

      setGeneratedOutfits(data);
      toast.success('Outfits gerados com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar outfits');
    } finally {
      setGenerating(false);
    }
  };

  if (!user || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-light text-neutral-100 mb-2">
            Gerador de <span className="font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">Outfit Ideas</span>
          </h1>
          <p className="text-neutral-400">Crie looks personalizados para qualquer evento e clima</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-amber-500/20">
            <TabsTrigger value="generate" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-amber-600 data-[state=active]:text-white text-neutral-400">
              Gerar Looks
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-amber-600 data-[state=active]:text-white text-neutral-400">
              Feedback de Outfit
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            {/* Profile Summary */}
            {(colorAnalysis?.[0] || styleQuiz?.[0] || wardrobeItems?.length > 0) && (
              <Card className="border border-amber-500/20 shadow-lg bg-black">
                <CardContent className="p-6">
                  <p className="text-xs text-amber-400 font-semibold mb-3">🎯 PERFIL PERSONALIZADO</p>
                  <div className="flex flex-wrap gap-3">
                    {colorAnalysis?.[0]?.consultant_season && (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        🎨 {colorAnalysis[0].consultant_season.replace('_', ' ')}
                      </Badge>
                    )}
                    {styleQuiz?.[0]?.consultant_style && (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/30">
                        ✨ {styleQuiz[0].consultant_style}
                      </Badge>
                    )}
                    {wardrobeItems?.length > 0 && (
                      <Badge className="bg-neutral-800 text-neutral-300 border border-neutral-700">
                        👗 {wardrobeItems.length} peças
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form */}
            <Card className="border border-amber-500/20 shadow-2xl bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Customize sua Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block text-neutral-200">
                      <MapPin className="w-4 h-4 inline mr-2 text-amber-400" />
                      Qual é a ocasião?
                    </Label>
                    <Select value={formData.event} onValueChange={(value) => setFormData({ ...formData, event: value })}>
                      <SelectTrigger className="h-12 text-base bg-neutral-900 border-neutral-700 text-neutral-200">
                        <SelectValue placeholder="Escolha um evento" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        {EVENTS.map((e) => (
                          <SelectItem key={e.value} value={e.value} className="text-neutral-200 hover:bg-amber-500/10 focus:bg-amber-500/10">
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weather Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block text-neutral-200">
                      <Cloud className="w-4 h-4 inline mr-2 text-amber-400" />
                      Como está o tempo?
                    </Label>
                    <Select value={formData.weather} onValueChange={(value) => setFormData({ ...formData, weather: value })}>
                      <SelectTrigger className="h-12 text-base bg-neutral-900 border-neutral-700 text-neutral-200">
                        <SelectValue placeholder="Escolha o clima" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        {WEATHER.map((w) => (
                          <SelectItem key={w.value} value={w.value} className="text-neutral-200 hover:bg-amber-500/10 focus:bg-amber-500/10">
                            {w.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <Label className="text-base font-semibold mb-3 block text-neutral-200">Detalhes Adicionais (opcional)</Label>
                  <Textarea
                    placeholder="Ex: Preciso estar confortável, tem um importante, quero me sentir confiante..."
                    value={formData.occasion_details}
                    onChange={(e) => setFormData({ ...formData, occasion_details: e.target.value })}
                    className="h-20 bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600"
                  />
                </div>

                {/* Preferences */}
                <div>
                  <Label className="text-base font-semibold mb-3 block text-neutral-200">Preferências (opcional)</Label>
                  <Textarea
                    placeholder="Ex: Prefiro calças, não quero usar tacão, gosto de cores neutras..."
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    className="h-20 bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600"
                  />
                </div>

                <Button
                  onClick={handleGenerateOutfits}
                  disabled={generating || !formData.event || !formData.weather}
                  className="w-full h-12 text-base bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Looks...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Gerar Look Personalizado
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Outfits */}
            {generatedOutfits && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {generatedOutfits.complete_outfit && (
                  <Card className="border border-amber-500/30 shadow-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
                    <CardHeader>
                      <CardTitle className="text-2xl text-neutral-100">{generatedOutfits.outfit_name}</CardTitle>
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">{generatedOutfits.occasion}</Badge>
                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">{formData.weather}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Color Harmony */}
                      <div className="bg-neutral-900 border border-amber-500/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                          🎨 Harmonia de Cores
                        </h4>
                        <p className="text-neutral-300">{generatedOutfits.color_harmony}</p>
                      </div>

                      {/* Complete Outfit */}
                      {generatedOutfits.complete_outfit?.existing_pieces && (
                        <div className="bg-neutral-900 border border-green-500/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-400 mb-3">👚 Peças do Seu Guarda-roupa</h4>
                          <div className="space-y-3">
                            {generatedOutfits.complete_outfit.existing_pieces.map((piece, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-neutral-300 bg-green-500/5 p-3 rounded-lg">
                                <span className="text-lg text-green-400">✓</span>
                                <div>
                                  <p className="font-medium text-neutral-100">{piece.item}</p>
                                  <p className="text-sm text-neutral-400">{piece.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedOutfits.complete_outfit?.new_pieces && (
                        <div className="bg-neutral-900 border-2 border-blue-500/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-400 mb-3">🛍️ Peças para Completar o Look</h4>
                          <div className="space-y-3">
                            {generatedOutfits.complete_outfit.new_pieces.map((piece, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-neutral-300 bg-blue-500/5 p-3 rounded-lg">
                                <span className="text-lg text-blue-400">→</span>
                                <div>
                                  <p className="font-medium text-neutral-100">{piece.item}</p>
                                  <p className="text-sm text-blue-400">{piece.why_needed}</p>
                                  {piece.color && <p className="text-sm text-neutral-400">Cor: {piece.color}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Styling Tips */}
                      {generatedOutfits.styling_tips && (
                        <div className="bg-neutral-900 border border-amber-500/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-amber-400 mb-3">✨ Dicas de Styling</h4>
                          <ul className="space-y-2">
                            {generatedOutfits.styling_tips.map((tip, idx) => (
                              <li key={idx} className="flex gap-3 text-neutral-300">
                                <span className="font-bold text-amber-400 min-w-6">{idx + 1}.</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Confidence Score */}
                      {generatedOutfits.confidence_score && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-neutral-300 mb-1">Confiança da Recomendação</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">{generatedOutfits.confidence_score}</p>
                        </div>
                      )}

                      {/* Personal Note */}
                      {generatedOutfits.personal_note && (
                        <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 p-4 rounded-lg border-l-4 border-amber-500">
                          <p className="text-neutral-200 italic text-lg">{generatedOutfits.personal_note}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <OutfitFeedbackUploader
              clientId={client?.id}
              clientData={client}
              wardrobeItems={wardrobeItems}
              colorAnalysis={colorAnalysis?.[0]}
              styleQuiz={styleQuiz?.[0]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}