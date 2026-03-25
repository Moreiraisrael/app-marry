import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp, Heart, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ContextualEbookSuggestions from '@/components/ebook/ContextualEbookSuggestions';

export default function EnhancedDossierSummary({ clientId, season, style, colorAnalysis, styleQuiz, appointments }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generateDossierSummary', {
          clientId
        });
        setSummary(result.data.summary);
      } catch (err) {
        console.error(err);
        setError(true);
        toast.error('Erro ao gerar resumo do dossiê');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadSummary();
    }
  }, [clientId]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Gerando resumo visual do dossiê...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cover Image & Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl"
      >
        <img 
          src={summary.cover_image} 
          alt="Dossiê" 
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-2">{summary.client_name}</h2>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
              {summary.executive_summary}
            </p>
            <div className="flex gap-2 mt-4">
              <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
                {summary.season}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur text-white border-white/30 capitalize">
                {summary.style}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual Highlights & Color Palette */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Visual Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Destaques do Estilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.visual_highlights?.map((highlight, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-600"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {idx + 1}. {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Color Palette */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                Paleta de Cores Essencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.color_palette?.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-200" 
                      style={{
                        backgroundColor: color.toLowerCase().includes('preto') ? '#1a1a1a' :
                                        color.toLowerCase().includes('branco') ? '#ffffff' :
                                        color.toLowerCase().includes('vermelho') ? '#ef4444' :
                                        color.toLowerCase().includes('azul') ? '#3b82f6' :
                                        color.toLowerCase().includes('verde') ? '#22c55e' :
                                        color.toLowerCase().includes('amarelo') ? '#eab308' :
                                        color.toLowerCase().includes('rosa') ? '#ec4899' :
                                        color.toLowerCase().includes('cinza') ? '#9ca3af' :
                                        '#f3f4f6',
                        border: color.toLowerCase().includes('branco') ? '1px solid #d1d5db' : 'none'
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">{color}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Applicable Trends & Style Strengths */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applicable Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Tendências 2026 Aplicáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.applicable_trends?.map((trend, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                    <span className="text-blue-600 font-bold text-sm mt-0.5">{idx + 1}</span>
                    <span className="text-sm text-gray-900">{trend}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Style Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Seus Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.style_strengths?.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-green-50 rounded">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-sm text-gray-900">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📍 Próximos Passos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.next_steps?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-900 pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Style Tip of the Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-2">Dica de Estilo do Momento</p>
                <p className="text-sm text-purple-800 leading-relaxed">
                  {summary.style_tip_of_month}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interaction History */}
      {summary.interaction_history && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Histórico de Interações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.interaction_history.total_appointments}
                  </p>
                  <p className="text-sm text-blue-700">Consultas Realizadas</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-lg text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-rose-600" />
                  <p className="text-2xl font-bold text-rose-900">
                    {summary.interaction_history.total_ebook_recommendations}
                  </p>
                  <p className="text-sm text-rose-700">E-books Recomendados</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-900">
                    {summary.interaction_history.total_messages}
                  </p>
                  <p className="text-sm text-purple-700">Mensagens Trocadas</p>
                </div>
              </div>

              {summary.interaction_history.recent_appointments?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="font-semibold text-gray-900 mb-3">Consultas Recentes</p>
                  <div className="space-y-2">
                    {summary.interaction_history.recent_appointments.map((apt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 capitalize">
                          {apt.service_type}
                        </span>
                        <Badge className={apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {apt.status === 'completed' ? 'Concluída' : 'Agendada'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contextual E-book Recommendations */}
      <ContextualEbookSuggestions
        season={season}
        style={style}
        occasion={null}
        clientId={clientId}
      />
    </div>
  );
}