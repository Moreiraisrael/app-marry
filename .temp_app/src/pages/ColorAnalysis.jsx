import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Camera, Upload, Loader2, X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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

export default function ColorAnalysis() {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [mainPhoto, setMainPhoto] = useState(null);
  const [naturalLightPhoto, setNaturalLightPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Passos da análise
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [season, setSeason] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['color-analysis-requests'],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({}, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ColorAnalysisRequest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-analysis-requests'] });
      setShowNewAnalysis(false);
      resetForm();
      toast.success('Análise criada com sucesso!');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, season, notes, clientId, analysisData }) => {
      // Atualizar análise
      await base44.entities.ColorAnalysisRequest.update(id, {
        status: 'approved',
        consultant_season: season,
        consultant_notes: notes
      });

      // Salvar dados da análise no perfil da cliente
      const updateData = {
        season: season
      };

      if (analysisData?.facial_features) {
        updateData.facial_features = analysisData.facial_features;
      }
      if (analysisData?.body_analysis) {
        updateData.body_analysis = analysisData.body_analysis;
      }
      if (analysisData?.style_recommendations) {
        updateData.style_recommendations = analysisData.style_recommendations;
      }

      await base44.entities.Client.update(clientId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-analysis-requests'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedRequest(null);
      toast.success('Análise aprovada e salva no perfil da cliente!');
    }
  });

  const handlePhotoUpload = async (file, type = 'main') => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'main') {
        setMainPhoto(file_url);
      } else {
        setNaturalLightPhoto(file_url);
      }
      toast.success('Foto enviada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    }
    setUploading(false);
  };

  const analyzeWithAI = async () => {
    if (!mainPhoto || !naturalLightPhoto) {
      toast.error('Adicione ambas as fotos para análise');
      return;
    }

    setAnalyzing(true);
    try {
      const photos = [mainPhoto, naturalLightPhoto];
      
      const prompt = `Você é uma CONSULTORA DE COLORAÇÃO PESSOAL ESPECIALISTA com 15+ anos de experiência em análise de estações de cores pelo Método Sazonal Expandido das 12 Estações.

**INSTRUÇÕES CRÍTICAS - LEIA COM MÁXIMA ATENÇÃO:**
1. Observe CADA DETALHE na foto com precisão diagnóstica
2. Anote EXATAMENTE o que você vê (não o que "pode ser")
3. Use TODAS as 4 dimensões: Temperatura, Profundidade, Intensidade, Contraste
4. Compara com TODAS as 12 estações antes de decidir
5. Jusitfique CADA decisão com evidência visual específica
6. Seja crítica: erros comuns incluem confundir Primavera com Verão, Outono com Primavera

**ANÁLISE ESTRUTURADA OBRIGATÓRIA:**

**1. OBSERVAÇÃO INICIAL - O QUE VOCÊ VÊ:**
- Resumo da impressão geral (tom, luminosidade, vivacidade)
- Principais características que saltam aos olhos

**2. ANÁLISE DE TEMPERATURA (Quente vs Frio) - CRÍTICA:**
Examine:
- Subtom predominante da pele:
  * Dourado/amarelado/pêssego = QUENTE
  * Rosado/avermelhado/azulado = FRIO
  * Ambos = NEUTRO (raro)
- Cor das VEIAS (se visível):
  * Predominantemente VERDES = QUENTE definitivo
  * Predominantemente AZUIS = FRIO definitivo
  * Mistura = mais complexo, use outros indicadores
- Reflexos naturais do cabelo:
  * Dourados, acobreados, mel = QUENTE
  * Acinzentados, azulados, prateados = FRIO
- Cor dos olhos:
  * Âmbar, verde-oliva, castanho com tons quentes = QUENTE
  * Azul, cinza, castanho muito escuro, preto = FRIO
  * Verde puro, entre terras = verificar outros indicadores
- Presença de sardas/sardanças (tons avermelhados/dourados):
  * QUENTES: douradas, avermelhadas
  * FRIAS: castanho-acinzentadas

**DIAGNÓSTICO:** Qual é o subtom predominante? Quente ou Frio?

**3. ANÁLISE DE PROFUNDIDADE (Clara, Média/Normal ou Profunda):**
Compare pele + cabelo + olhos:
- CLARA: Pele muito clara (LRV alto), cabelo claro ou loiro, contraste leve
- MÉDIA/NORMAL: Tons médios naturais, nem muito claros nem muito escuros
- PROFUNDA: Pele escura a negra, cabelo escuro/preto, olhos profundos, alto contraste visual

**Verificação de claridade:**
- Coloque mentalmente em "light" vs "dark": para qual lado?
- Leve em conta a saturação também (não confunda profundidade com saturação)

**4. ANÁLISE DE INTENSIDADE/SATURAÇÃO (Brilhante vs Suave vs Média):**
- BRILHANTE: Cores naturais vibrantes, saturadas, "pop" visual (não confunda com iluminação)
  * Cabelo com reflexos vívidos
  * Pele com contraste nítido
  * Olhos intensos
- SUAVE: Cores naturais mais apagadas, acinzentadas, low-key
  * Sem muita diferença entre pele/cabelo/olhos
  * Aspecto "suave e delicado"
- MÉDIA: Entre os dois

**5. ANÁLISE DE CONTRASTE PESSOAL (Alto, Médio, Baixo):**
Diferença visual ENTRE pele, cabelo e olhos:
- ALTO: Pele clara + cabelo muito escuro OU pele escura + cabelo claro/loiro
- MÉDIO: Diferença moderada, tons complementares
- BAIXO: Tons muito similares, aspecto "todo igual"

**6. CARACTERÍSTICAS FACIAIS - OBSERVAÇÃO:**
- Formato do rosto: oval, redondo, quadrado, alongado, coração, diamante
- Traços: angulares/estruturados OU suaves/arredondados
- Olhos: tamanho, formato, posição (puxados para cima?)
- Sobrancelhas: forma, espessura, posição
- Nariz: tamanho, forma
- Lábios: volume, forma
- Testa e queixo: prominência

**7. INDICADORES ESPECÍFICOS CRÍTICOS:**
Cite EXATAMENTE o que você viu:
- Ex: "Pele com subtom dourado-pêssego inequívoco"
- Ex: "Cabelo castanho-escuro com reflexos mel definitivos"
- Ex: "Olhos castanho-médio com aro externo mais escuro"
- Ex: "Sardas acobreadas espalhadas"
- Ex: "Leve rubor/flush avermelhado natural"

**8. EXCLUSÃO SISTEMÁTICA DE ESTAÇÕES:**
Primeiro, determine: **QUENTE ou FRIO?** (elimina 6 estações)
Depois, determine: **CLARO, MÉDIO ou PROFUNDO?** (elimina mais)
Depois, determine: **BRILHANTE, MÉDIO ou SUAVE?** (elimina mais)

Teste final contra as 3 estações candidatas com a combinação correta.

**AS 12 ESTAÇÕES EXPLICADAS:**

QUENTES:
- primavera_clara: Quente + Claro + Brilhante (loira clara com reflexos dourados, pele clara dourada, olhos claros)
- primavera_quente: Quente + Claro + Suave (loira dourada suave, pele morna clara, sem muito contraste)
- primavera_brilhante: Quente + Claro + Brilhante com mais saturação (contraste mais marcado que clara, mas ainda claro)
- outono_suave: Quente + Profundo + Suave (cabelo castanho-escuro morno sem brilho, pele olive-quente apagada)
- outono_quente: Quente + Profundo + Médio (cabelo preto/castanho-escuro com reflexos mel, pele olive, sardas)
- outono_profundo: Quente + Profundo + Brilhante (cabelo preto brilhante, pele warm olive, máximo contraste quente)

FRIOS:
- verao_claro: Frio + Claro + Suave (pele muito clara rosada, cabelo loiro platinado, olhos azul-claro, suave)
- verao_suave: Frio + Claro/Médio + Suave (pele clara a média azulada, cabelo loiro/castanho claro cinzento, baixo contraste)
- verao_frio: Frio + Médio + Brilhante (pele média rosada, cabelo castanho-escuro acinzentado, olhos azuis/cinzentos, mais contraste)
- inverno_brilhante: Frio + Profundo + Brilhante (pele clara porcelana com rouge nativo, cabelo preto com reflexo azulado, olhos claros)
- inverno_frio: Frio + Profundo + Médio (pele média a morena com subtom rosado, cabelo preto/castanho escuro acinzentado, olhos escuros mas frios)
- inverno_profundo: Frio + Profundo + Suave/Profundo (pele negra a muito escura, cabelo preto, olhos escuros, pouco contraste porque tudo é profundo)

**9. RECOMENDAÇÕES DE ESTILO:**
Com base APENAS na estação final:
- Decotes: baseado em traços faciais
- Comprimentos: baseado em formato do rosto
- Estampas: baseado em intensidade
- Acessórios: baseado em temperatura
- Cabelo: cortes que valorizam formato do rosto
- Maquiagem: cores que harmonizam com estação

**RETORNE ANÁLISE PROFISSIONAL DETALHADA:**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: photos,
        response_json_schema: {
          type: "object",
          properties: {
            season: { 
              type: "string",
              description: "Código da estação (ex: primavera_clara)"
            },
            temperature_analysis: { 
              type: "string",
              description: "Análise detalhada da temperatura com características específicas observadas"
            },
            depth_analysis: { 
              type: "string",
              description: "Análise detalhada da profundidade"
            },
            intensity_analysis: { 
              type: "string",
              description: "Análise detalhada da intensidade"
            },
            contrast_level: { 
              type: "string",
              description: "Nível de contraste: alto, médio ou baixo"
            },
            facial_features: {
              type: "object",
              properties: {
                face_shape: { type: "string", description: "Formato do rosto" },
                facial_traits: { type: "string", description: "Traços predominantes: angulares ou suaves" },
                eyes_size: { type: "string", description: "Tamanho dos olhos" },
                eyes_shape: { type: "string", description: "Formato dos olhos" },
                eyebrows: { type: "string", description: "Características das sobrancelhas" },
                nose: { type: "string", description: "Características do nariz" },
                lips: { type: "string", description: "Características dos lábios" },
                chin: { type: "string", description: "Formato do queixo" },
                forehead: { type: "string", description: "Características da testa" }
              }
            },
            body_analysis: {
              type: "object",
              properties: {
                bone_structure: { type: "string", description: "Estrutura óssea: delicada, média ou robusta" },
                shoulders: { type: "string", description: "Largura dos ombros" },
                proportions: { type: "string", description: "Proporções corporais visíveis" }
              }
            },
            specific_features: {
              type: "object",
              properties: {
                skin_tone: { type: "string", description: "Tom exato da pele observado" },
                hair_color: { type: "string", description: "Cor específica do cabelo com detalhes" },
                eye_color: { type: "string", description: "Cor específica dos olhos" },
                undertone: { type: "string", description: "Subtom: quente (dourado) ou frio (rosado)" }
              }
            },
            style_recommendations: {
              type: "object",
              properties: {
                necklines: { type: "string", description: "Decotes recomendados" },
                lengths: { type: "string", description: "Comprimentos ideais" },
                patterns: { type: "string", description: "Estampas recomendadas" },
                accessories: { type: "string", description: "Acessórios que harmonizam" },
                hair_tips: { type: "string", description: "Dicas de cabelo e penteados" },
                makeup_tips: { type: "string", description: "Técnicas de maquiagem" }
              }
            },
            reasoning: { 
              type: "string",
              description: "Justificativa completa e detalhada explicando POR QUE esta estação foi escolhida, citando características específicas vistas nas fotos"
            },
            alternatives_considered: {
              type: "string",
              description: "Outras 1-2 estações consideradas e POR QUE foram descartadas"
            },
            confidence: { 
              type: "string",
              description: "Nível de confiança: Alta, Média ou Baixa - com justificativa"
            },
            consultant_tips: {
              type: "string",
              description: "Dicas específicas para a consultora validar: o que observar, possíveis dúvidas, testes sugeridos"
            }
          },
          required: ["season", "temperature_analysis", "depth_analysis", "intensity_analysis", "contrast_level", "facial_features", "body_analysis", "specific_features", "style_recommendations", "reasoning", "alternatives_considered", "confidence", "consultant_tips"]
        }
      });

      const client = clients.find(c => c.id === selectedClient);
      
      await createMutation.mutateAsync({
        client_id: selectedClient,
        consultant_id: client?.consultant_id,
        client_photo: mainPhoto,
        additional_photos: [naturalLightPhoto],
        ai_suggested_season: result.season,
        questionnaire_answers: {
          temperature_analysis: result.temperature_analysis,
          depth_analysis: result.depth_analysis,
          intensity_analysis: result.intensity_analysis,
          contrast_level: result.contrast_level,
          facial_features: result.facial_features,
          body_analysis: result.body_analysis,
          specific_features: result.specific_features,
          style_recommendations: result.style_recommendations,
          reasoning: result.reasoning,
          alternatives_considered: result.alternatives_considered,
          confidence: result.confidence,
          consultant_tips: result.consultant_tips
        },
        status: 'pending'
      });

      setCurrentStep(1);

    } catch (error) {
      toast.error('Erro na análise. Tente novamente.');
      console.error(error);
    }
    setAnalyzing(false);
  };

  const resetForm = () => {
    setSelectedClient('');
    setMainPhoto(null);
    setNaturalLightPhoto(null);
    setCurrentStep(1);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-amber-50/30">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-500 to-amber-500 p-8 md:p-12 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4 border border-white/30">
                <Sparkles className="w-4 h-4" />
                Método Sazonal Expandido - 12 Estações
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Análise de Coloração Pessoal
              </h1>
              <p className="text-white/90 text-lg max-w-2xl">
                Descubra sua paleta ideal com análise automática de IA baseada em temperatura, profundidade, intensidade e contraste
              </p>
            </div>
            <Button
              onClick={() => setShowNewAnalysis(true)}
              size="lg"
              className="bg-white text-rose-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold h-14 px-8"
            >
              <Camera className="w-5 h-5 mr-2" />
              Nova Análise
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <p className="text-sm text-amber-700 mb-2 font-medium relative z-10">Aguardando Validação</p>
                <p className="text-4xl font-bold text-amber-700 relative z-10">{pendingRequests.length}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <p className="text-sm text-emerald-700 mb-2 font-medium relative z-10">Aprovadas</p>
                <p className="text-4xl font-bold text-emerald-700 relative z-10">{approvedRequests.length}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-50 to-rose-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                <p className="text-sm text-rose-700 mb-2 font-medium relative z-10">Total de Análises</p>
                <p className="text-4xl font-bold text-rose-700 relative z-10">{requests.length}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interactive Seasonal Palettes */}
        <div className="mb-10">
          <InteractiveSeasonalPalettes />
        </div>

        {/* Pending Analyses */}
        {pendingRequests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Aguardando Validação</h2>
              <Badge className="bg-amber-100 text-amber-700 text-sm px-3 py-1">
                {pendingRequests.length} {pendingRequests.length === 1 ? 'análise' : 'análises'}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white hover:scale-[1.02]">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img 
                        src={request.client_photo} 
                        alt="Cliente" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <Badge className="absolute top-4 right-4 bg-amber-500 text-white shadow-xl border-2 border-white/30 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        {new Date(request.created_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {request.ai_suggested_season && (
                        <div className="mb-4 p-3 bg-gradient-to-br from-rose-50 to-amber-50 rounded-lg border border-rose-100">
                          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-rose-500" />
                            Sugestão IA:
                          </p>
                          <p className="font-semibold text-rose-700">
                            {seasonLabels[request.ai_suggested_season]}
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setSeason(request.ai_suggested_season || '');
                          setNotes('');
                        }}
                        className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 h-11"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Validar Análise
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* New Analysis Dialog */}
        <Dialog open={showNewAnalysis} onOpenChange={setShowNewAnalysis}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Nova Análise de Coloração
              </DialogTitle>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Método Sazonal Expandido das 12 Estações
              </p>
            </DialogHeader>

          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[
                { num: 1, label: 'Cliente' },
                { num: 2, label: 'Fotos' },
                { num: 3, label: 'Análise' }
              ].map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 shadow-lg ${
                      currentStep >= step.num 
                        ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-white scale-110' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.num}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${
                      currentStep >= step.num ? 'text-rose-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step.num ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Select Client */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="font-semibold text-lg mb-4">1. Selecionar Cliente</h3>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Escolha a cliente para análise" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedClient}
                    className="w-full mt-6 bg-gradient-to-r from-rose-500 to-amber-500 h-12"
                  >
                    Próximo: Upload de Fotos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Upload Photos */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="font-semibold text-lg">2. Upload de Fotos</h3>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-3 text-lg">Requisitos das Fotos</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>Rosto sem maquiagem</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>Luz natural (próximo a uma janela)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>Fundo neutro (branco ou claro)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>Cabelo afastado do rosto</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>Duas fotos: uma frontal e uma com luz natural lateral</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2">Foto Frontal *</label>
                      {mainPhoto ? (
                        <div className="relative">
                          <img src={mainPhoto} alt="Main" className="w-full h-64 object-cover rounded-xl" />
                          <button
                            onClick={() => setMainPhoto(null)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer hover:border-rose-400 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-12 h-12 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500 text-center px-4">
                                Foto frontal sem maquiagem
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'main')}
                          />
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Foto Luz Natural *</label>
                      {naturalLightPhoto ? (
                        <div className="relative">
                          <img src={naturalLightPhoto} alt="Natural" className="w-full h-64 object-cover rounded-xl" />
                          <button
                            onClick={() => setNaturalLightPhoto(null)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer hover:border-rose-400 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500 text-center px-4">
                                Foto próxima à janela com luz natural
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'natural')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!mainPhoto || !naturalLightPhoto}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500"
                    >
                      Próximo: Análise
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Analyze */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="font-semibold text-lg">3. Análise com IA</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <img src={mainPhoto} alt="Main" className="w-full h-48 object-cover rounded-xl" />
                    <img src={naturalLightPhoto} alt="Natural" className="w-full h-48 object-cover rounded-xl" />
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl p-8 shadow-xl border border-rose-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-900 mb-2">
                          Análise Automática com IA
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tecnologia avançada para determinar sua paleta perfeita
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-rose-100">
                        <p className="font-semibold text-rose-700 mb-2 flex items-center gap-2">
                          🌡️ Temperatura
                        </p>
                        <p className="text-sm text-gray-600">Quente ou Frio</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-amber-100">
                        <p className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                          🎨 Profundidade
                        </p>
                        <p className="text-sm text-gray-600">Clara, Média ou Profunda</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-pink-100">
                        <p className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                          ✨ Intensidade
                        </p>
                        <p className="text-sm text-gray-600">Brilhante, Suave ou Média</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-purple-100">
                        <p className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                          ⚖️ Contraste
                        </p>
                        <p className="text-sm text-gray-600">Alto, Médio ou Baixo</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={analyzeWithAI}
                      disabled={analyzing || createMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 h-12"
                    >
                      {analyzing || createMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analisando com IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Iniciar Análise
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

        {/* Validation Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Validar Análise de Coloração</DialogTitle>
            </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto Frontal</p>
                  <img src={selectedRequest.client_photo} alt="Main" className="w-full h-64 object-cover rounded-xl" />
                </div>
                {selectedRequest.additional_photos?.[0] && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Foto Luz Natural</p>
                    <img src={selectedRequest.additional_photos[0]} alt="Natural" className="w-full h-64 object-cover rounded-xl" />
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selectedRequest.ai_suggested_season && (
                <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Análise Detalhada da IA
                      </p>
                      <p className="text-3xl font-bold text-rose-700">
                        {seasonLabels[selectedRequest.ai_suggested_season]}
                      </p>
                      {selectedRequest.questionnaire_answers?.confidence && (
                        <Badge className="mt-2 bg-white/60 text-gray-800 border border-gray-300">
                          Confiança: {selectedRequest.questionnaire_answers.confidence}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Características Específicas Observadas */}
                  {selectedRequest.questionnaire_answers?.specific_features && (
                    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-sm text-gray-700 mb-3">🔍 Características Observadas:</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedRequest.questionnaire_answers.specific_features.skin_tone && (
                          <div>
                            <p className="text-xs text-gray-500">Tom de Pele</p>
                            <p className="text-sm font-medium text-gray-800">
                              {selectedRequest.questionnaire_answers.specific_features.skin_tone}
                            </p>
                          </div>
                        )}
                        {selectedRequest.questionnaire_answers.specific_features.hair_color && (
                          <div>
                            <p className="text-xs text-gray-500">Cabelo</p>
                            <p className="text-sm font-medium text-gray-800">
                              {selectedRequest.questionnaire_answers.specific_features.hair_color}
                            </p>
                          </div>
                        )}
                        {selectedRequest.questionnaire_answers.specific_features.eye_color && (
                          <div>
                            <p className="text-xs text-gray-500">Olhos</p>
                            <p className="text-sm font-medium text-gray-800">
                              {selectedRequest.questionnaire_answers.specific_features.eye_color}
                            </p>
                          </div>
                        )}
                        {selectedRequest.questionnaire_answers.specific_features.undertone && (
                          <div>
                            <p className="text-xs text-gray-500">Subtom</p>
                            <p className="text-sm font-medium text-gray-800">
                              {selectedRequest.questionnaire_answers.specific_features.undertone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Análises Detalhadas */}
                  <div className="space-y-3 mb-4">
                    {selectedRequest.questionnaire_answers?.temperature_analysis && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">🌡️ Análise de Temperatura:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedRequest.questionnaire_answers.temperature_analysis}
                        </p>
                      </div>
                    )}
                    
                    {selectedRequest.questionnaire_answers?.depth_analysis && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">🎨 Análise de Profundidade:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedRequest.questionnaire_answers.depth_analysis}
                        </p>
                      </div>
                    )}
                    
                    {selectedRequest.questionnaire_answers?.intensity_analysis && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">✨ Análise de Intensidade:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedRequest.questionnaire_answers.intensity_analysis}
                        </p>
                      </div>
                    )}
                    
                    {selectedRequest.questionnaire_answers?.contrast_level && (
                      <div className="bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">⚖️ Nível de Contraste:</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {selectedRequest.questionnaire_answers.contrast_level}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Justificativa Principal */}
                  {selectedRequest.questionnaire_answers?.reasoning && (
                    <div className="bg-gradient-to-r from-white to-rose-50 rounded-lg p-4 border-l-4 border-rose-500 mb-4">
                      <p className="text-xs font-semibold text-rose-700 mb-2">💡 Por que esta estação?</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedRequest.questionnaire_answers.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Alternativas Consideradas */}
                  {selectedRequest.questionnaire_answers?.alternatives_considered && (
                    <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500 mb-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">🤔 Outras estações consideradas:</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedRequest.questionnaire_answers.alternatives_considered}
                      </p>
                    </div>
                  )}

                  {/* Dicas para a Consultora */}
                  {selectedRequest.questionnaire_answers?.consultant_tips && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-xs font-semibold text-blue-700 mb-2">💼 Dicas para Validação:</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedRequest.questionnaire_answers.consultant_tips}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Facial Features Analysis */}
              {selectedRequest.questionnaire_answers?.facial_features && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-bold text-lg text-purple-800 mb-4 flex items-center gap-2">
                    👤 Análise de Características Faciais
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Formato do Rosto</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.face_shape}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Traços Predominantes</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.facial_traits}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Olhos</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.eyes_shape} - {selectedRequest.questionnaire_answers.facial_features.eyes_size}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Sobrancelhas</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.eyebrows}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Nariz</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.nose}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Lábios</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.facial_features.lips}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Body Analysis */}
              {selectedRequest.questionnaire_answers?.body_analysis && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                  <h4 className="font-bold text-lg text-teal-800 mb-4 flex items-center gap-2">
                    🏃 Análise Corporal
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Estrutura Óssea</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.body_analysis.bone_structure}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Ombros</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.body_analysis.shoulders}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Proporções</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRequest.questionnaire_answers.body_analysis.proportions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Style Recommendations */}
              {selectedRequest.questionnaire_answers?.style_recommendations && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h4 className="font-bold text-lg text-amber-800 mb-4 flex items-center gap-2">
                    ✨ Recomendações de Estilo Personalizadas
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">👔 Decotes Recomendados:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.necklines}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">📏 Comprimentos Ideais:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.lengths}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">🎨 Estampas Recomendadas:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.patterns}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">💍 Acessórios:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.accessories}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">💇 Dicas de Cabelo:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.hair_tips}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-2">💄 Dicas de Maquiagem:</p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.questionnaire_answers.style_recommendations.makeup_tips}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultant Validation */}
              <div>
                <label className="block font-semibold mb-2">Confirmar ou Ajustar Estação *</label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a estação final" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 font-semibold text-xs text-gray-500">PRIMAVERA (Quente)</div>
                    <SelectItem value="primavera_clara">Primavera Clara</SelectItem>
                    <SelectItem value="primavera_quente">Primavera Quente</SelectItem>
                    <SelectItem value="primavera_brilhante">Primavera Brilhante</SelectItem>
                    
                    <div className="p-2 font-semibold text-xs text-gray-500 mt-2">VERÃO (Frio)</div>
                    <SelectItem value="verao_claro">Verão Claro</SelectItem>
                    <SelectItem value="verao_suave">Verão Suave</SelectItem>
                    <SelectItem value="verao_frio">Verão Frio</SelectItem>
                    
                    <div className="p-2 font-semibold text-xs text-gray-500 mt-2">OUTONO (Quente)</div>
                    <SelectItem value="outono_suave">Outono Suave</SelectItem>
                    <SelectItem value="outono_quente">Outono Quente</SelectItem>
                    <SelectItem value="outono_profundo">Outono Profundo</SelectItem>
                    
                    <div className="p-2 font-semibold text-xs text-gray-500 mt-2">INVERNO (Frio)</div>
                    <SelectItem value="inverno_profundo">Inverno Profundo</SelectItem>
                    <SelectItem value="inverno_frio">Inverno Frio</SelectItem>
                    <SelectItem value="inverno_brilhante">Inverno Brilhante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Observações da Consultora</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione recomendações de cores, dicas de maquiagem, cabelo..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* AI Outfit Suggestions */}
              {season && selectedRequest.questionnaire_answers && (
                <OutfitSuggestionAI
                  season={season}
                  analysisData={selectedRequest.questionnaire_answers}
                />
              )}

              {/* Product Recommendations */}
              {season && selectedRequest.client_id && (
                <ProductRecommendations
                  clientId={selectedRequest.client_id}
                  season={season}
                  title="Recomendações de Produtos para esta Estação"
                />
              )}

              <Button
                onClick={() => approveMutation.mutate({ 
                  id: selectedRequest.id, 
                  season, 
                  notes,
                  clientId: selectedRequest.client_id,
                  analysisData: selectedRequest.questionnaire_answers
                })}
                disabled={!season || approveMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 h-12"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aprovar e Salvar no Perfil da Cliente
              </Button>
            </div>
          )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import ProductRecommendations from '@/components/recommendations/ProductRecommendations';
import OutfitSuggestionAI from '@/components/color-analysis/OutfitSuggestionAI';
import InteractiveSeasonalPalettes from '@/components/color-analysis/InteractiveSeasonalPalettes';