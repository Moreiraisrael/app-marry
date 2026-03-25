import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Sparkles, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const styleDescriptions = {
  classico: 'Clássico - Elegância atemporal',
  dramatico: 'Dramático - Ousadia e impacto',
  romantico: 'Romântico - Delicadeza e feminilidade',
  natural: 'Natural - Conforto e autenticidade',
  criativo: 'Criativo - Originalidade e expressão',
  elegante: 'Elegante - Sofisticação e refinamento',
  sensual: 'Sensual - Confiança e glamour'
};

export default function StyleQuizValidation() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [consultantNotes, setConsultantNotes] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const queryClient = useQueryClient();

  const { data: pendingQuizzes = [] } = useQuery({
    queryKey: ['pending-style-quizzes'],
    queryFn: async () => {
      const quizzes = await base44.entities.StyleQuiz.filter({
        status: 'pending'
      }, '-created_date');
      
      // Buscar dados do cliente para cada quiz
      return Promise.all(
        quizzes.map(async (quiz) => {
          const clients = await base44.entities.Client.filter({ id: quiz.client_id });
          return { ...quiz, client: clients[0] };
        })
      );
    }
  });

  const { data: approvedQuizzes = [] } = useQuery({
    queryKey: ['approved-style-quizzes'],
    queryFn: async () => {
      const quizzes = await base44.entities.StyleQuiz.filter({
        status: 'approved'
      }, '-created_date');
      
      return Promise.all(
        quizzes.map(async (quiz) => {
          const clients = await base44.entities.Client.filter({ id: quiz.client_id });
          return { ...quiz, client: clients[0] };
        })
      );
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ quizId, clientId, style, notes }) => {
      // Atualizar questionário
      await base44.entities.StyleQuiz.update(quizId, {
        consultant_style: style,
        consultant_notes: notes,
        status: 'approved'
      });

      // Salvar no perfil da cliente
      await base44.entities.Client.update(clientId, {
        style_recommendations: {
          style: style,
          consultant_notes: notes
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-style-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['approved-style-quizzes'] });
      setSelectedQuiz(null);
      setSelectedStyle('');
      setConsultantNotes('');
      setAiInsights(null);
      toast.success('Questionário aprovado e salvo!');
    },
    onError: () => toast.error('Erro ao aprovar')
  });

  const generateAIInsights = async () => {
    if (!selectedQuiz?.answers) return;

    setGeneratingInsights(true);
    try {
      const answersText = Object.entries(selectedQuiz.answers)
        .map(([q, a]) => `Pergunta ${q}: ${a}`)
        .join('\n');

      const prompt = `Analise as respostas deste questionário de estilo pessoal e gere insights profundos em PORTUGUÊS:

**Respostas do Questionário:**
${answersText}

**Estilo Sugerido pela IA:** ${styleDescriptions[selectedQuiz.ai_suggested_style]}

**ANÁLISE REQUERIDA:**
1. **Confirmação do Estilo**: A IA sugeriu corretamente? Por quê?
2. **Traços Principais**: Quais traços de personalidade e estilo emergem?
3. **Pontos Fortes**: O que funciona bem para este estilo?
4. **Áreas de Desenvolvimento**: Onde a cliente pode evoluir?
5. **Recomendações Práticas**: 3-4 ações concretas para implementar
6. **Paleta de Cores**: Quais cores funcionam melhor?
7. **Peças Essenciais**: Que peças absolutamente precisam estar no guarda-roupa?

Seja ESPECÍFICA, PRÁTICA e MOTIVADORA.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            style_confirmation: { type: "string" },
            main_traits: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            development_areas: { type: "array", items: { type: "string" } },
            practical_recommendations: { type: "array", items: { type: "string" } },
            color_palette: { type: "array", items: { type: "string" } },
            essential_pieces: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setAiInsights(result);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar insights');
    }
    setGeneratingInsights(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Validação de Questionários
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Questionários de <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Estilo Pessoal</span>
        </h1>
        <p className="text-gray-600">
          Valide os questionários respondidos pelas clientes e insira no dossiê
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white shadow-md p-1 rounded-xl">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Pendentes ({pendingQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Aprovados ({approvedQuizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Quizzes */}
        <TabsContent value="pending" className="space-y-6">
          {pendingQuizzes.length === 0 ? (
            <Card className="border-0 shadow-lg text-center py-12">
              <CardContent>
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Nenhum questionário pendente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingQuizzes.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setSelectedStyle(quiz.ai_suggested_style || '');
                      setConsultantNotes('');
                      setAiInsights(null);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{quiz.client?.full_name}</CardTitle>
                          <p className="text-xs text-gray-500">{quiz.client?.email}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                          Pendente
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {quiz.ai_suggested_style && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-xs text-gray-600 mb-1">Estilo Sugerido:</p>
                          <p className="font-semibold text-purple-700">
                            {styleDescriptions[quiz.ai_suggested_style]}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(quiz.created_date).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Quizzes */}
        <TabsContent value="approved" className="space-y-6">
          {approvedQuizzes.length === 0 ? (
            <Card className="border-0 shadow-lg text-center py-12">
              <CardContent>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Nenhum questionário aprovado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedQuizzes.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-2 border-green-200 bg-green-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{quiz.client?.full_name}</CardTitle>
                          <p className="text-xs text-gray-500">{quiz.client?.email}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          Aprovado
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {quiz.consultant_style && (
                        <div className="mb-4 p-3 bg-white rounded-lg border border-green-100">
                          <p className="text-xs text-gray-600 mb-1">Estilo Definido:</p>
                          <p className="font-semibold text-green-700">
                            {styleDescriptions[quiz.consultant_style]}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(quiz.created_date).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Validar Questionário - {selectedQuiz?.client?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-6">
              {/* Respostas */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Respostas do Questionário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {Object.entries(selectedQuiz.answers || {}).map(([q, a]) => (
                      <div key={q} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Pergunta {q.replace('q', '')}:</p>
                        <p className="text-sm font-medium text-gray-900">{a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {!aiInsights && (
                <Button
                  onClick={generateAIInsights}
                  disabled={generatingInsights}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-11"
                >
                  {generatingInsights ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Insights...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Insights com IA
                    </>
                  )}
                </Button>
              )}

              {aiInsights && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Análise com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-purple-700 mb-1">Confirmação do Estilo:</p>
                        <p className="text-sm text-gray-700">{aiInsights.style_confirmation}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-purple-700 mb-2">Traços Principais:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiInsights.main_traits?.map((trait, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-700">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-2">✓ Pontos Fortes:</p>
                        <ul className="space-y-1">
                          {aiInsights.strengths?.map((s, i) => (
                            <li key={i} className="text-xs text-gray-700 flex gap-2">
                              <span className="text-green-600">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-2">📈 Desenvolvimento:</p>
                        <ul className="space-y-1">
                          {aiInsights.development_areas?.map((d, i) => (
                            <li key={i} className="text-xs text-gray-700 flex gap-2">
                              <span className="text-amber-600">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-2">💡 Recomendações Práticas:</p>
                        <ol className="space-y-1">
                          {aiInsights.practical_recommendations?.map((rec, i) => (
                            <li key={i} className="text-xs text-gray-700 flex gap-2">
                              <span className="text-blue-600 font-bold">{i + 1}.</span>
                              {rec}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-rose-700 mb-2">🎨 Paleta de Cores:</p>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.color_palette?.map((color, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-orange-700 mb-2">👕 Peças Essenciais:</p>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.essential_pieces?.slice(0, 3).map((piece, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {piece}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Validação */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Estilo Final *</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(styleDescriptions).map(([key, desc]) => (
                        <SelectItem key={key} value={key}>
                          {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Observações da Consultora</label>
                  <Textarea
                    value={consultantNotes}
                    onChange={(e) => setConsultantNotes(e.target.value)}
                    placeholder="Adicione suas observações, dicas de estilo, tendências para essa cliente..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={() => approveMutation.mutate({
                    quizId: selectedQuiz.id,
                    clientId: selectedQuiz.client_id,
                    style: selectedStyle,
                    notes: consultantNotes
                  })}
                  disabled={!selectedStyle || approveMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 h-11"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar e Salvar no Dossiê
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}