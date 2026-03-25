import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, RefreshCw, Heart, Star, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const questions = [
  {
    question: 'Ao escolher uma roupa, o que é mais importante para você?',
    options: [
      { label: 'Que seja atemporal e versátil', style: 'classico' },
      { label: 'Que cause impacto e chame atenção', style: 'dramatico' },
      { label: 'Que seja delicada e feminina', style: 'romantico' },
      { label: 'Que seja confortável e prática', style: 'natural' },
      { label: 'Que seja única e diferente', style: 'criativo' },
      { label: 'Que seja sofisticada e refinada', style: 'elegante' },
      { label: 'Que valorize minhas curvas', style: 'sensual' },
    ]
  },
  {
    question: 'Qual peça te descreve melhor?',
    options: [
      { label: 'Blazer bem cortado e camisa branca', style: 'classico' },
      { label: 'Casaco oversized e botas de salto', style: 'dramatico' },
      { label: 'Vestido com babados e rendas', style: 'romantico' },
      { label: 'Jeans e camiseta confortável', style: 'natural' },
      { label: 'Mix de estampas e peças vintage', style: 'criativo' },
      { label: 'Vestido de seda e scarpin', style: 'elegante' },
      { label: 'Vestido justo e salto alto', style: 'sensual' },
    ]
  },
  {
    question: 'Como você gosta de usar acessórios?',
    options: [
      { label: 'Peças discretas e atemporais', style: 'classico' },
      { label: 'Acessórios grandes e impactantes', style: 'dramatico' },
      { label: 'Detalhes delicados e femininos', style: 'romantico' },
      { label: 'O mínimo possível, só o necessário', style: 'natural' },
      { label: 'Peças únicas e artesanais', style: 'criativo' },
      { label: 'Joias finas e sofisticadas', style: 'elegante' },
      { label: 'Acessórios que complementam o look glamouroso', style: 'sensual' },
    ]
  },
  {
    question: 'Qual paleta de cores te atrai mais?',
    options: [
      { label: 'Neutros: preto, branco, bege, cinza', style: 'classico' },
      { label: 'Contrastantes: preto com vermelho, branco com preto', style: 'dramatico' },
      { label: 'Pastéis: rosa, lavanda, azul claro', style: 'romantico' },
      { label: 'Terrosas: caramelo, verde, marrom', style: 'natural' },
      { label: 'Variadas e inesperadas', style: 'criativo' },
      { label: 'Sofisticadas: azul marinho, vinho, camel', style: 'elegante' },
      { label: 'Intensas: vermelho, preto, roxo', style: 'sensual' },
    ]
  },
  {
    question: 'Como você se sente melhor em um evento formal?',
    options: [
      { label: 'Com um vestido tubinho preto clássico', style: 'classico' },
      { label: 'Com um vestido longo statement', style: 'dramatico' },
      { label: 'Com um vestido fluido e delicado', style: 'romantico' },
      { label: 'Com um conjunto confortável mas elegante', style: 'natural' },
      { label: 'Com algo único que ninguém mais terá', style: 'criativo' },
      { label: 'Com um vestido sofisticado em tecido nobre', style: 'elegante' },
      { label: 'Com um vestido que valoriza minha silhueta', style: 'sensual' },
    ]
  },
  {
    question: 'Qual palavra te define melhor?',
    options: [
      { label: 'Atemporal', style: 'classico' },
      { label: 'Ousada', style: 'dramatico' },
      { label: 'Delicada', style: 'romantico' },
      { label: 'Autêntica', style: 'natural' },
      { label: 'Única', style: 'criativo' },
      { label: 'Sofisticada', style: 'elegante' },
      { label: 'Confiante', style: 'sensual' },
    ]
  },
  {
    question: 'Qual tipo de estampa você prefere?',
    options: [
      { label: 'Listras ou sem estampa', style: 'classico' },
      { label: 'Geométricas e marcantes', style: 'dramatico' },
      { label: 'Florais delicadas', style: 'romantico' },
      { label: 'Estampas naturais ou sem estampa', style: 'natural' },
      { label: 'Todas! Gosto de misturar', style: 'criativo' },
      { label: 'Estampas discretas e sofisticadas', style: 'elegante' },
      { label: 'Animal print ou rendas', style: 'sensual' },
    ]
  },
  {
    question: 'Como você gostaria que as pessoas te descrevessem?',
    options: [
      { label: 'Elegante e bem vestida', style: 'classico' },
      { label: 'Marcante e inesquecível', style: 'dramatico' },
      { label: 'Feminina e doce', style: 'romantico' },
      { label: 'Autêntica e confortável', style: 'natural' },
      { label: 'Criativa e original', style: 'criativo' },
      { label: 'Sofisticada e refinada', style: 'elegante' },
      { label: 'Confiante e glamourosa', style: 'sensual' },
    ]
  },
  {
    question: 'Qual seu calçado favorito para o dia a dia?',
    options: [
      { label: 'Scarpin ou mocassim clássico', style: 'classico' },
      { label: 'Botas de salto ou tênis statement', style: 'dramatico' },
      { label: 'Sapatilhas delicadas ou sandálias românticas', style: 'romantico' },
      { label: 'Tênis ou rasteirinhas', style: 'natural' },
      { label: 'Qualquer coisa diferente e única', style: 'criativo' },
      { label: 'Scarpin de salto alto elegante', style: 'elegante' },
      { label: 'Salto alto que alonga a silhueta', style: 'sensual' },
    ]
  },
  {
    question: 'O que não pode faltar no seu guarda-roupa?',
    options: [
      { label: 'Peças básicas de qualidade', style: 'classico' },
      { label: 'Pelo menos uma peça statement', style: 'dramatico' },
      { label: 'Vestidos e blusas com detalhes delicados', style: 'romantico' },
      { label: 'Peças confortáveis e versáteis', style: 'natural' },
      { label: 'Peças únicas que contam histórias', style: 'criativo' },
      { label: 'Peças em tecidos nobres', style: 'elegante' },
      { label: 'Peças que valorizam o corpo', style: 'sensual' },
    ]
  },
];

const styles = {
  classico: {
    name: 'Clássico',
    emoji: '👑',
    color: 'from-slate-600 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    description: 'Você tem elegância atemporal. Seu estilo é refinado, equilibrado e nunca passa de moda. A sofisticação discreta é sua marca registrada.',
    keywords: ['Atemporal', 'Elegante', 'Versátil', 'Refinado'],
    pieces: ['Blazer bem cortado', 'Camisa branca de qualidade', 'Calça de alfaiataria', 'Scarpin clássico'],
    tip: 'Invista em peças de qualidade e corte perfeito. Neutros e básicos de luxo formam a base do seu guarda-roupa ideal.',
  },
  dramatico: {
    name: 'Dramático',
    emoji: '⚡',
    color: 'from-purple-700 to-indigo-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    description: 'Você é presença! Poderosa, marcante e impactante, você não passa despercebida. Seu estilo comunica autoridade e ousadia.',
    keywords: ['Marcante', 'Ousada', 'Impactante', 'Poderosa'],
    pieces: ['Maxi casaco estruturado', 'Calça wide leg preta', 'Botas de cano longo', 'Statement jewelry'],
    tip: 'Aposte em alto contraste, silhuetas marcantes e acessórios statement. Você nasceu para ocupar espaço — vista-se como tal.',
  },
  romantico: {
    name: 'Romântico',
    emoji: '🌸',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    description: 'Você é a mulher dos detalhes delicados, das flores e da feminilidade pura. Seu estilo encanta pela suavidade e romantismo que transmite.',
    keywords: ['Feminino', 'Delicado', 'Encantador', 'Suave'],
    pieces: ['Vestidos florais fluidos', 'Rendas e transparências', 'Babados e laços', 'Tons pastel'],
    tip: 'Aposte em camadas leves, tecidos que fluem e detalhes como laços, pérolas e florais para realçar seu estilo.',
  },
  natural: {
    name: 'Natural',
    emoji: '🌿',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    description: 'Você valoriza o conforto, a autenticidade e a leveza. Seu estilo parece sem esforço, mas é cheio de intenção e personalidade.',
    keywords: ['Autêntica', 'Confortável', 'Orgânico', 'Despojada'],
    pieces: ['Calça de linho', 'Camiseta premium', 'Sandália rasteira artesanal', 'Bolsa de couro natural'],
    tip: 'Priorize tecidos naturais, cores terrosas e peças versáteis de qualidade. Sua beleza brilha na simplicidade intencional.',
  },
  criativo: {
    name: 'Criativo',
    emoji: '🎨',
    color: 'from-orange-400 to-rose-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    description: 'Você é uma obra de arte ambulante! Expressiva, original e sem medo do julgamento alheio, sua roupa é uma extensão da sua arte.',
    keywords: ['Criativa', 'Original', 'Artística', 'Expressiva'],
    pieces: ['Mix de estampas', 'Peças vintage', 'Acessórios autorais', 'Layering inesperado'],
    tip: 'Não tenha medo de misturar décadas, texturas e estilos. Sua roupa conta sua história e não precisa de aprovação.',
  },
  elegante: {
    name: 'Elegante',
    emoji: '✨',
    color: 'from-amber-600 to-yellow-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Você irradia sofisticação e luxo discreto. Seu estilo é impecável, refinado e exige qualidade em cada detalhe.',
    keywords: ['Sofisticada', 'Luxuosa', 'Refinada', 'Impecável'],
    pieces: ['Vestido em seda ou crepe', 'Joias finas', 'Bolsa de grife discreta', 'Scarpin de salto alto'],
    tip: 'Invista em tecidos nobres, cortes perfeitos e acessórios de qualidade. Seu estilo pede o melhor — e você merece.',
  },
  sensual: {
    name: 'Sensual',
    emoji: '🔥',
    color: 'from-red-500 to-rose-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    description: 'Você conhece seu corpo e não tem medo de mostrá-lo. Confiante, glamourosa e irresistível — seu estilo é pura atitude.',
    keywords: ['Confiante', 'Glamourosa', 'Sedutora', 'Atitude'],
    pieces: ['Vestido justo em cor forte', 'Salto alto', 'Animal print', 'Renda e transparências'],
    tip: 'Valorize sua silhueta com peças bem ajustadas, cores intensas e decotes estratégicos. Confiança é o melhor acessório.',
  },
};

export default function PersonalStyleQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  const progress = (currentQ / questions.length) * 100;

  const submitMutation = useMutation({
    mutationFn: async (dominantStyle) => {
      const user = await base44.auth.me();
      const clients = await base44.entities.Client.filter({ email: user.email });
      const clientId = clients[0]?.id || user.id;
      await base44.entities.StyleQuiz.create({
        client_id: clientId,
        answers: answers,
        ai_suggested_style: dominantStyle,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Questionário enviado! Aguarde a validação da consultora.');
    },
    onError: () => {
      toast.error('Erro ao enviar questionário');
    }
  });

  const handleSelect = (style) => setSelectedOption(style);

  const handleNext = () => {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [currentQ]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQ + 1 >= questions.length) {
      const scores = {};
      Object.values(newAnswers).forEach(s => { scores[s] = (scores[s] || 0) + 1; });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primary = sorted[0][0];
      const secondary = sorted[1]?.[0] || null;
      setResult({ primary, secondary, scores });
      submitMutation.mutate(primary);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleBack = () => {
    if (currentQ === 0) return;
    setAnswers(prev => { const n = { ...prev }; delete n[currentQ - 1]; return n; });
    setSelectedOption(null);
    setCurrentQ(currentQ - 1);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
  };

  if (result) {
    const primary = styles[result.primary];
    const secondary = result.secondary ? styles[result.secondary] : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <div className={`bg-gradient-to-br ${primary.color} p-8 text-white text-center`}>
                <div className="text-6xl mb-3">{primary.emoji}</div>
                <p className="text-white/80 text-sm uppercase tracking-widest mb-1">Seu Estilo Principal</p>
                <h1 className="text-4xl font-bold mb-2">{primary.name}</h1>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {primary.keywords.map(k => (
                    <span key={k} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{k}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed text-center">{primary.description}</p>

                {secondary && (
                  <div className={`${secondary.bg} ${secondary.border} border rounded-2xl p-4`}>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Estilo Secundário</p>
                    <p className="font-bold text-gray-900">{secondary.emoji} {secondary.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{secondary.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Peças-chave para seu guarda-roupa
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {primary.pieces.map(p => (
                      <div key={p} className={`${primary.bg} ${primary.border} border rounded-xl px-3 py-2 text-sm text-gray-700`}>
                        ✦ {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${primary.bg} border ${primary.border} rounded-2xl p-5`}>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Dica da Consultora
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{primary.tip}</p>
                </div>

                {submitMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando resultado para sua consultora...
                  </div>
                )}
                {submitMutation.isSuccess && (
                  <p className="text-center text-sm text-green-600 font-medium">✓ Resultado enviado para validação da consultora!</p>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleRestart} variant="outline" className="flex-1 gap-2">
                    <RefreshCw className="w-4 h-4" /> Refazer
                  </Button>
                  <Button onClick={() => window.location.href = createPageUrl('ClientPortal')} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    Ir para o Portal
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Questionário de Estilo
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Descubra seu <span className="font-bold">Estilo Pessoal</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Responda 10 perguntas e descubra seu estilo único entre os 7 estilos universais</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Pergunta {currentQ + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">{q.question}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.style)}
                  className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-sm leading-snug
                    ${selectedOption === opt.style
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-medium shadow-md shadow-pink-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="mr-2 text-pink-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentQ > 0 && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white gap-2 disabled:opacity-40"
          >
            {currentQ + 1 === questions.length ? 'Ver Resultado' : 'Próxima'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}