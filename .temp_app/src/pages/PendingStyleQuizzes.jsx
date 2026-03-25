import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Eye, CheckCircle, XCircle, Palette } from 'lucide-react';
import { toast } from 'sonner';

const styleLabels = {
  classico: 'Clássico',
  dramatico: 'Dramático',
  romantico: 'Romântico',
  natural: 'Natural',
  criativo: 'Criativo',
  elegante: 'Elegante',
  sensual: 'Sensual'
};

const styleDescriptions = {
  classico: 'Elegância atemporal, linhas limpas, peças estruturadas',
  dramatico: 'Ousadia, impacto visual, peças statement',
  romantico: 'Delicadeza, feminilidade, detalhes suaves',
  natural: 'Conforto, autenticidade, estilo relaxado',
  criativo: 'Originalidade, mix de estilos, autenticidade',
  elegante: 'Sofisticação, refinamento, luxo discreto',
  sensual: 'Valorização das curvas, confiança, glamour'
};

export default function PendingStyleQuizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['pending-style-quizzes'],
    queryFn: () => base44.entities.StyleQuiz.filter({ status: 'pending' }, '-created_date')
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, style, notes }) => {
      await base44.entities.StyleQuiz.update(id, {
        status: 'approved',
        consultant_style: style,
        consultant_notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-style-quizzes'] });
      setSelectedQuiz(null);
      toast.success('Análise de estilo aprovada!');
    }
  });

  const handleApprove = () => {
    if (!style) {
      toast.error('Selecione um estilo');
      return;
    }
    approveMutation.mutate({
      id: selectedQuiz.id,
      style,
      notes
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
          <Clock className="w-4 h-4" />
          Questionários de Estilo Pendentes
        </div>
        <h1 className="text-3xl font-light text-gray-900">
          Análises de <span className="font-semibold">Estilo Pessoal</span>
        </h1>
        <p className="text-gray-600 mt-1">{quizzes.length} questionários para revisar</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum questionário pendente</h3>
          <p className="text-gray-600">Todos os questionários foram revisados!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group border-0 shadow-sm hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 pb-4">
                  <div className="flex items-center justify-between">
                    <Palette className="w-8 h-8 text-purple-500" />
                    <Badge className="bg-purple-500">Pendente</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Enviado em {new Date(quiz.created_date).toLocaleDateString('pt-BR')}
                  </p>
                  {quiz.ai_suggested_style && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Sugestão IA:</p>
                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                        {styleLabels[quiz.ai_suggested_style]}
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">15 respostas completas</p>
                  <Button
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setStyle(quiz.ai_suggested_style || '');
                      setNotes('');
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Analisar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analisar Questionário de Estilo</DialogTitle>
          </DialogHeader>
          
          {selectedQuiz && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Respostas do Questionário</h3>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {Object.entries(selectedQuiz.answers || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-purple-100">
                      <span className="text-gray-600 font-medium">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedQuiz.ai_suggested_style && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Estilo Sugerido pela IA:</p>
                  <p className="text-2xl font-bold text-purple-700 mb-2">
                    {styleLabels[selectedQuiz.ai_suggested_style]}
                  </p>
                  <p className="text-sm text-gray-600">
                    {styleDescriptions[selectedQuiz.ai_suggested_style]}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-2">Estilo Identificado *</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(styleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {style && (
                  <p className="text-sm text-gray-600 mt-2">
                    {styleDescriptions[style]}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione dicas e recomendações personalizadas..."
                  rows={4}
                />
              </div>

              {/* Product Recommendations */}
              {style && selectedQuiz.client_id && (
                <ProductRecommendations
                  clientId={selectedQuiz.client_id}
                  style={style}
                  title="Recomendações de Produtos para este Estilo"
                />
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuiz(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={!style || approveMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Análise
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import ProductRecommendations from '@/components/recommendations/ProductRecommendations';