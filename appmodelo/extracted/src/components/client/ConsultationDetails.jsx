import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const SEASON_LABELS = {
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

export default function ConsultationDetails({ consultation, isOpen, onClose }) {
  if (!consultation) return null;

  const { type, data, date } = consultation;

  const renderColorAnalysisDetails = () => (
    <Tabs defaultValue="resultado" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="resultado">Resultado</TabsTrigger>
        <TabsTrigger value="analise">Análise</TabsTrigger>
        <TabsTrigger value="caracteristicas">Características</TabsTrigger>
        <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
      </TabsList>

      {/* Resultado */}
      <TabsContent value="resultado" className="space-y-4">
        {data.consultant_season && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-amber-50">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Estação de Coloração Final</p>
              <p className="text-3xl font-bold text-rose-700">
                {SEASON_LABELS[data.consultant_season] || data.ai_suggested_season}
              </p>
              {data.consultant_notes && (
                <div className="mt-4 pt-4 border-t border-rose-200">
                  <p className="text-sm text-gray-600 mb-2">Observações da Consultora:</p>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{data.consultant_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.ai_suggested_season && !data.consultant_season && (
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Sugestão Inicial da IA</p>
              <p className="text-2xl font-bold text-blue-700">
                {SEASON_LABELS[data.ai_suggested_season]}
              </p>
              <Badge className="mt-3 bg-yellow-100 text-yellow-800">Aguardando validação</Badge>
            </CardContent>
          </Card>
        )}

        {data.client_photo && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Fotos da Análise</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <img src={data.client_photo} alt="Foto principal" className="rounded-lg w-full h-48 object-cover" />
              {data.additional_photos?.[0] && (
                <img src={data.additional_photos[0]} alt="Luz natural" className="rounded-lg w-full h-48 object-cover" />
              )}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Análise */}
      <TabsContent value="analise" className="space-y-3">
        {data.questionnaire_answers?.temperature_analysis && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">🌡️ Temperatura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {data.questionnaire_answers.temperature_analysis}
              </p>
            </CardContent>
          </Card>
        )}

        {data.questionnaire_answers?.depth_analysis && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">🎨 Profundidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {data.questionnaire_answers.depth_analysis}
              </p>
            </CardContent>
          </Card>
        )}

        {data.questionnaire_answers?.intensity_analysis && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">✨ Intensidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {data.questionnaire_answers.intensity_analysis}
              </p>
            </CardContent>
          </Card>
        )}

        {data.questionnaire_answers?.contrast_level && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">⚖️ Contraste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 font-semibold">{data.questionnaire_answers.contrast_level}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Características */}
      <TabsContent value="caracteristicas" className="space-y-3">
        {data.questionnaire_answers?.specific_features && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.questionnaire_answers.specific_features.skin_tone && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-600 mb-1">Tom de Pele</p>
                  <p className="font-semibold text-gray-900">{data.questionnaire_answers.specific_features.skin_tone}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.specific_features.hair_color && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-600 mb-1">Cabelo</p>
                  <p className="font-semibold text-gray-900">{data.questionnaire_answers.specific_features.hair_color}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.specific_features.eye_color && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-600 mb-1">Olhos</p>
                  <p className="font-semibold text-gray-900">{data.questionnaire_answers.specific_features.eye_color}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.specific_features.undertone && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-600 mb-1">Subtom</p>
                  <p className="font-semibold text-gray-900">{data.questionnaire_answers.specific_features.undertone}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {data.questionnaire_answers?.facial_features && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">👤 Características Faciais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><p className="text-gray-600">Formato do Rosto</p><p className="font-semibold">{data.questionnaire_answers.facial_features.face_shape}</p></div>
              <div><p className="text-gray-600">Traços</p><p className="font-semibold">{data.questionnaire_answers.facial_features.facial_traits}</p></div>
              <div><p className="text-gray-600">Olhos</p><p className="font-semibold">{data.questionnaire_answers.facial_features.eyes_shape}</p></div>
              <div><p className="text-gray-600">Sobrancelhas</p><p className="font-semibold">{data.questionnaire_answers.facial_features.eyebrows}</p></div>
            </CardContent>
          </Card>
        )}

        {data.questionnaire_answers?.body_analysis && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">🏃 Análise Corporal</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div><p className="text-gray-600">Estrutura Óssea</p><p className="font-semibold">{data.questionnaire_answers.body_analysis.bone_structure}</p></div>
              <div><p className="text-gray-600">Ombros</p><p className="font-semibold">{data.questionnaire_answers.body_analysis.shoulders}</p></div>
              <div><p className="text-gray-600">Proporções</p><p className="font-semibold">{data.questionnaire_answers.body_analysis.proportions}</p></div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Recomendações */}
      <TabsContent value="recomendacoes" className="space-y-3">
        {data.questionnaire_answers?.style_recommendations && (
          <>
            {data.questionnaire_answers.style_recommendations.necklines && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">👔 Decotes Recomendados</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.necklines}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.style_recommendations.lengths && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">📏 Comprimentos Ideais</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.lengths}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.style_recommendations.patterns && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">🎨 Estampas Recomendadas</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.patterns}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.style_recommendations.accessories && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">💍 Acessórios</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.accessories}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.style_recommendations.hair_tips && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">💇 Dicas de Cabelo</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.hair_tips}</p>
                </CardContent>
              </Card>
            )}
            {data.questionnaire_answers.style_recommendations.makeup_tips && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">💄 Dicas de Maquiagem</p>
                  <p className="text-sm text-gray-700">{data.questionnaire_answers.style_recommendations.makeup_tips}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );

  const renderStyleQuizDetails = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Resposta do Questionário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.answers && Object.entries(data.answers).map(([key, value]) => (
          <div key={key} className="border-b pb-3">
            <p className="text-sm font-semibold text-gray-700 capitalize">
              {key.replace(/_/g, ' ')}
            </p>
            <p className="text-gray-600 mt-1">{JSON.stringify(value, null, 2)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderAppointmentDetails = () => (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detalhes da Consultoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><p className="text-sm text-gray-600">Serviço</p><p className="font-semibold text-gray-900 capitalize">{data.service_type?.replace(/_/g, ' ')}</p></div>
          <div><p className="text-sm text-gray-600">Local</p><p className="font-semibold text-gray-900">{data.location}</p></div>
          <div><p className="text-sm text-gray-600">Duração</p><p className="font-semibold text-gray-900">{data.duration} minutos</p></div>
          {data.notes && <div><p className="text-sm text-gray-600">Observações</p><p className="font-semibold text-gray-900 whitespace-pre-line">{data.notes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );

  const renderDefaultDetails = () => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <p className="text-gray-600">Detalhes completos da consultoria</p>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {consultation.title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </DialogHeader>

        <div className="mt-6">
          {type === 'color_analysis' && renderColorAnalysisDetails()}
          {type === 'style_quiz' && renderStyleQuizDetails()}
          {type === 'appointment' && renderAppointmentDetails()}
          {!['color_analysis', 'style_quiz', 'appointment'].includes(type) && renderDefaultDetails()}
        </div>
      </DialogContent>
    </Dialog>
  );
}