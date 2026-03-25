import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

const questions = [
  {
    id: 'q1',
    question: 'Qual palavra melhor descreve seu estilo ideal?',
    options: [
      { value: 'classico', label: 'Elegante e Atemporal', style: 'classico' },
      { value: 'dramatico', label: 'Ousado e Marcante', style: 'dramatico' },
      { value: 'romantico', label: 'Delicado e Feminino', style: 'romantico' },
      { value: 'natural', label: 'Confortável e Autêntico', style: 'natural' }
    ]
  },
  {
    id: 'q2',
    question: 'Que tipo de roupa você se sente mais você?',
    options: [
      { value: 'estruturado', label: 'Peças estruturadas e alfaiataria', style: 'classico' },
      { value: 'statement', label: 'Peças statement e impactantes', style: 'dramatico' },
      { value: 'fluido', label: 'Vestidos fluidos e delicados', style: 'romantico' },
      { value: 'casual', label: 'Looks casuais e relaxados', style: 'natural' }
    ]
  },
  {
    id: 'q3',
    question: 'Seus acessórios favoritos são:',
    options: [
      { value: 'discreto', label: 'Discretos e refinados', style: 'classico' },
      { value: 'chamativos', label: 'Grandes e chamativos', style: 'dramatico' },
      { value: 'delicados', label: 'Delicados e femininos', style: 'romantico' },
      { value: 'minimalistas', label: 'Minimalistas ou naturais', style: 'natural' }
    ]
  },
  {
    id: 'q4',
    question: 'Como você gosta de usar estampas?',
    options: [
      { value: 'classicas', label: 'Listras e xadrez clássicos', style: 'classico' },
      { value: 'ousadas', label: 'Estampas grandes e ousadas', style: 'dramatico' },
      { value: 'florais', label: 'Florais e rendas', style: 'romantico' },
      { value: 'naturais', label: 'Texturas e tons terrosos', style: 'natural' }
    ]
  },
  {
    id: 'q5',
    question: 'Seu evento formal ideal seria com:',
    options: [
      { value: 'terno', label: 'Terno ou vestido clássico', style: 'classico' },
      { value: 'impactante', label: 'Look impactante e memorável', style: 'dramatico' },
      { value: 'glamouroso', label: 'Vestido romântico e glamouroso', style: 'romantico' },
      { value: 'confortavel', label: 'Algo elegante mas confortável', style: 'natural' }
    ]
  },
  {
    id: 'q6',
    question: 'Cores que você mais usa:',
    options: [
      { value: 'neutras', label: 'Neutros sofisticados', style: 'classico' },
      { value: 'vibrantes', label: 'Cores vibrantes e saturadas', style: 'dramatico' },
      { value: 'pasteis', label: 'Tons pastel e suaves', style: 'romantico' },
      { value: 'terrosas', label: 'Tons terrosos e naturais', style: 'natural' }
    ]
  },
  {
    id: 'q7',
    question: 'Sua maquiagem favorita é:',
    options: [
      { value: 'natural_elegante', label: 'Natural e elegante', style: 'classico' },
      { value: 'dramatica', label: 'Olhos marcados ou lábios vermelhos', style: 'dramatico' },
      { value: 'suave', label: 'Suave e iluminada', style: 'romantico' },
      { value: 'minima', label: 'Mínima ou pele natural', style: 'natural' }
    ]
  },
  {
    id: 'q8',
    question: 'Tecidos que você prefere:',
    options: [
      { value: 'estruturados', label: 'Algodão, linho, lã estruturados', style: 'classico' },
      { value: 'luxuosos', label: 'Couro, veludo, metalizados', style: 'dramatico' },
      { value: 'leves', label: 'Seda, chiffon, renda', style: 'romantico' },
      { value: 'confortaveis', label: 'Malha, algodão orgânico', style: 'natural' }
    ]
  },
  {
    id: 'q9',
    question: 'Seu calçado preferido:',
    options: [
      { value: 'classico_cal', label: 'Scarpin ou oxford clássico', style: 'classico' },
      { value: 'statement_cal', label: 'Salto alto marcante ou botas', style: 'dramatico' },
      { value: 'delicado_cal', label: 'Sandália delicada ou sapatilha', style: 'romantico' },
      { value: 'casual_cal', label: 'Tênis ou rasteirinha', style: 'natural' }
    ]
  },
  {
    id: 'q10',
    question: 'Seu cabelo ideal:',
    options: [
      { value: 'bem_feito', label: 'Corte bem-feito e estruturado', style: 'classico' },
      { value: 'ousado', label: 'Corte ousado ou cor marcante', style: 'dramatico' },
      { value: 'longo_ondulado', label: 'Longo e ondulado', style: 'romantico' },
      { value: 'natural_cabelo', label: 'Natural e livre', style: 'natural' }
    ]
  },
  {
    id: 'q11',
    question: 'Seu estilo de bolsa:',
    options: [
      { value: 'estruturada', label: 'Estruturada e clássica', style: 'classico' },
      { value: 'statement_bolsa', label: 'Diferente e chamativa', style: 'dramatico' },
      { value: 'delicada', label: 'Delicada e feminina', style: 'romantico' },
      { value: 'pratica', label: 'Prática e funcional', style: 'natural' }
    ]
  },
  {
    id: 'q12',
    question: 'Como você se veste no dia a dia?',
    options: [
      { value: 'coordenado', label: 'Looks coordenados e completos', style: 'classico' },
      { value: 'unico', label: 'Algo que chame atenção', style: 'dramatico' },
      { value: 'feminino', label: 'Feminino e charmoso', style: 'romantico' },
      { value: 'confortavel_dia', label: 'Confortável e prático', style: 'natural' }
    ]
  },
  {
    id: 'q13',
    question: 'Sua inspiração de moda vem de:',
    options: [
      { value: 'icones', label: 'Ícones clássicos (Audrey, Grace)', style: 'classico' },
      { value: 'passarelas', label: 'Passarelas e editorial', style: 'dramatico' },
      { value: 'princesas', label: 'Princesas e celebridades glamourosas', style: 'romantico' },
      { value: 'blogueiras', label: 'Pessoas reais e blogueiras', style: 'natural' }
    ]
  },
  {
    id: 'q14',
    question: 'Seu perfume ideal é:',
    options: [
      { value: 'classico_perf', label: 'Clássico e sofisticado', style: 'classico' },
      { value: 'intenso', label: 'Intenso e marcante', style: 'dramatico' },
      { value: 'floral', label: 'Floral e delicado', style: 'romantico' },
      { value: 'leve', label: 'Leve e fresco', style: 'natural' }
    ]
  },
  {
    id: 'q15',
    question: 'Ao montar um look, você prioriza:',
    options: [
      { value: 'elegancia', label: 'Elegância e sofisticação', style: 'classico' },
      { value: 'impacto', label: 'Impacto visual', style: 'dramatico' },
      { value: 'feminilidade', label: 'Feminilidade e charme', style: 'romantico' },
      { value: 'autenticidade', label: 'Autenticidade e conforto', style: 'natural' }
    ]
  }
];

export default function StyleQuiz() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.StyleQuiz.create(data);
    },
    onSuccess: () => {
      toast.success('Questionário enviado!');
      navigate(createPageUrl('ClientPortal'));
    }
  });

  const calculateStyle = () => {
    const styleCounts = {
      classico: 0,
      dramatico: 0,
      romantico: 0,
      natural: 0,
      criativo: 0,
      elegante: 0,
      sensual: 0
    };

    Object.values(answers).forEach(answer => {
      const question = questions.find(q => answers[q.id] === answer);
      const option = question?.options.find(o => o.value === answer);
      if (option?.style) {
        styleCounts[option.style]++;
      }
    });

    return Object.entries(styleCounts).sort(([,a], [,b]) => b - a)[0][0];
  };

  const handleSubmit = async () => {
    const suggestedStyle = calculateStyle();
    
    await submitMutation.mutateAsync({
      client_id: user.id,
      consultant_id: user.consultant_id,
      answers: answers,
      ai_suggested_style: suggestedStyle
    });
  };

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const isReviewStep = step === questions.length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("ClientPortal")}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="text-sm text-gray-600">
            Pergunta {Math.min(step + 1, questions.length)} de {questions.length}
          </div>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {!isReviewStep ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>
                  
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          answers[currentQuestion.id] === option.value
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {answers[currentQuestion.id] === option.value && (
                            <Check className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {step > 0 && (
                      <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                    )}
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={!answers[currentQuestion.id]}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600"
                    >
                      {step === questions.length - 1 ? 'Revisar' : 'Próximo'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-2">Revisar e Enviar</h2>
                  <p className="text-gray-600 mb-6">
                    Questionário completo! Envie para a consultora analisar.
                  </p>

                  <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-6 mb-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Questionário completo</p>
                    <p className="text-3xl font-bold text-gray-900">{Object.keys(answers).length}/{questions.length}</p>
                    <p className="text-sm text-gray-500 mt-2">respostas</p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Enviar para Análise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}