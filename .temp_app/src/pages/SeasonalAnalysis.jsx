import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Palette, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Sun,
  Leaf,
  Snowflake,
  Flower2,
  Check
} from 'lucide-react';

const questions = [
  {
    id: 'skin_undertone',
    question: 'Qual é o subtom da sua pele?',
    description: 'Olhe para a parte interna do seu pulso. Quais cores predominam nas suas veias?',
    options: [
      { value: 'warm', label: 'Quente', description: 'Veias esverdeadas, tom dourado/amarelado', color: 'bg-amber-100 border-amber-300' },
      { value: 'cool', label: 'Frio', description: 'Veias azuladas/roxas, tom rosado', color: 'bg-blue-100 border-blue-300' },
      { value: 'neutral', label: 'Neutro', description: 'Mix de verde e azul, tom equilibrado', color: 'bg-gray-100 border-gray-300' }
    ]
  },
  {
    id: 'skin_depth',
    question: 'Qual a profundidade do seu tom de pele?',
    description: 'Compare sua pele com as opções abaixo',
    options: [
      { value: 'light', label: 'Clara', description: 'Pele clara a muito clara', color: 'bg-rose-50 border-rose-200' },
      { value: 'medium', label: 'Média', description: 'Pele média, nem clara nem escura', color: 'bg-amber-100 border-amber-300' },
      { value: 'deep', label: 'Profunda', description: 'Pele escura a muito escura', color: 'bg-amber-800 border-amber-900 text-white' }
    ]
  },
  {
    id: 'contrast',
    question: 'Qual o contraste entre seus cabelos, olhos e pele?',
    description: 'Observe a diferença de intensidade entre essas características',
    options: [
      { value: 'high', label: 'Alto Contraste', description: 'Grande diferença (ex: pele clara, cabelo escuro)', color: 'bg-gray-900 border-gray-700 text-white' },
      { value: 'medium', label: 'Médio Contraste', description: 'Diferença moderada entre tons', color: 'bg-gray-400 border-gray-500 text-white' },
      { value: 'low', label: 'Baixo Contraste', description: 'Tons similares, suave transição', color: 'bg-gray-100 border-gray-300' }
    ]
  },
  {
    id: 'hair_color',
    question: 'Qual a cor natural do seu cabelo?',
    description: 'Considere sua cor natural, não a tingida',
    options: [
      { value: 'light', label: 'Loiro/Ruivo Claro', description: 'Tons claros e luminosos', color: 'bg-yellow-100 border-yellow-300' },
      { value: 'medium', label: 'Castanho', description: 'Tons médios acastanhados', color: 'bg-amber-700 border-amber-800 text-white' },
      { value: 'dark', label: 'Preto/Castanho Escuro', description: 'Tons escuros e profundos', color: 'bg-gray-900 border-gray-700 text-white' },
      { value: 'red', label: 'Ruivo', description: 'Tons avermelhados/alaranjados', color: 'bg-orange-500 border-orange-600 text-white' }
    ]
  },
  {
    id: 'eye_color',
    question: 'Qual a cor dos seus olhos?',
    description: 'Observe na luz natural',
    options: [
      { value: 'light', label: 'Claros', description: 'Azul, verde, mel claro', color: 'bg-sky-100 border-sky-300' },
      { value: 'medium', label: 'Médios', description: 'Castanho, avelã', color: 'bg-amber-600 border-amber-700 text-white' },
      { value: 'dark', label: 'Escuros', description: 'Castanho escuro, preto', color: 'bg-amber-950 border-amber-900 text-white' }
    ]
  },
  {
    id: 'best_metals',
    question: 'Quais metais ficam melhores em você?',
    description: 'Qual metal parece iluminar mais seu rosto?',
    options: [
      { value: 'gold', label: 'Dourado', description: 'Ouro, bronze, cobre', color: 'bg-gradient-to-r from-yellow-300 to-amber-400 border-amber-500' },
      { value: 'silver', label: 'Prateado', description: 'Prata, platina', color: 'bg-gradient-to-r from-gray-200 to-gray-400 border-gray-500' },
      { value: 'both', label: 'Ambos', description: 'Fico bem com os dois', color: 'bg-gradient-to-r from-yellow-200 to-gray-300 border-gray-400' }
    ]
  },
  {
    id: 'sun_reaction',
    question: 'Como sua pele reage ao sol?',
    description: 'Pense na reação típica após exposição solar',
    options: [
      { value: 'burn', label: 'Queima facilmente', description: 'Fica vermelha, difícil bronzear', color: 'bg-red-100 border-red-300' },
      { value: 'tan_gradual', label: 'Bronzeia gradualmente', description: 'Leve queimadura, depois bronzeia', color: 'bg-amber-200 border-amber-400' },
      { value: 'tan_easy', label: 'Bronzeia facilmente', description: 'Raramente queima, bronzeia rápido', color: 'bg-amber-500 border-amber-600 text-white' }
    ]
  }
];

const seasonData = {
  primavera_clara: {
    name: 'Primavera Clara',
    icon: Flower2,
    description: 'Você tem uma beleza delicada e luminosa, com características suaves e douradas.',
    colors: ['#FFE4C4', '#FFDAB9', '#F5DEB3', '#FFA07A', '#20B2AA', '#98FB98'],
    avoid: ['#000000', '#36454F', '#800020'],
    celebrities: 'Taylor Swift, Amanda Seyfried'
  },
  primavera_quente: {
    name: 'Primavera Quente',
    icon: Flower2,
    description: 'Sua beleza irradia calor e vitalidade, com tons dourados e saturados.',
    colors: ['#FF6347', '#FF8C00', '#FFD700', '#9ACD32', '#20B2AA', '#DEB887'],
    avoid: ['#000000', '#4B0082', '#800080'],
    celebrities: 'Amy Adams, Nicole Kidman'
  },
  primavera_brilhante: {
    name: 'Primavera Brilhante',
    icon: Flower2,
    description: 'Você possui um alto contraste natural com cores vivas e vibrantes.',
    colors: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#FFD700', '#00BFFF'],
    avoid: ['#808080', '#D3D3D3', '#8B4513'],
    celebrities: 'Emma Stone'
  },
  verao_claro: {
    name: 'Verão Claro',
    icon: Sun,
    description: 'Sua beleza é suave e etérea, com tons delicados e acinzentados.',
    colors: ['#E6E6FA', '#B0C4DE', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'],
    avoid: ['#000000', '#FF4500', '#FFD700'],
    celebrities: 'Cate Blanchett'
  },
  verao_suave: {
    name: 'Verão Suave',
    icon: Sun,
    description: 'Você tem uma beleza elegante e sofisticada, com tons neutros e suaves.',
    colors: ['#BC8F8F', '#C0C0C0', '#D8BFD8', '#9DC183', '#87CEEB', '#DEB887'],
    avoid: ['#000000', '#FF0000', '#FF8C00'],
    celebrities: 'Jennifer Aniston'
  },
  verao_frio: {
    name: 'Verão Frio',
    icon: Sun,
    description: 'Sua beleza é refinada e fresca, com subtons rosados e azulados.',
    colors: ['#DB7093', '#6495ED', '#DDA0DD', '#778899', '#F5F5DC', '#E0B0FF'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    celebrities: 'Kate Middleton'
  },
  outono_suave: {
    name: 'Outono Suave',
    icon: Leaf,
    description: 'Você possui uma beleza terrosa e aconchegante, com tons amenos.',
    colors: ['#D2B48C', '#BC8F8F', '#8FBC8F', '#CD853F', '#F4A460', '#DAA520'],
    avoid: ['#000000', '#FF1493', '#00FFFF'],
    celebrities: 'Drew Barrymore'
  },
  outono_quente: {
    name: 'Outono Quente',
    icon: Leaf,
    description: 'Sua beleza é rica e vibrante, com tons intensos e dourados.',
    colors: ['#D2691E', '#B8860B', '#6B8E23', '#CD5C5C', '#8B4513', '#FF8C00'],
    avoid: ['#000000', '#C0C0C0', '#FFB6C1'],
    celebrities: 'Julia Roberts, Julianne Moore'
  },
  outono_profundo: {
    name: 'Outono Profundo',
    icon: Leaf,
    description: 'Você tem uma beleza marcante e intensa, com tons ricos e profundos.',
    colors: ['#8B0000', '#006400', '#4B0082', '#8B4513', '#B8860B', '#2F4F4F'],
    avoid: ['#FFB6C1', '#E6E6FA', '#FFFAF0'],
    celebrities: 'Jennifer Lopez, Eva Mendes'
  },
  inverno_profundo: {
    name: 'Inverno Profundo',
    icon: Snowflake,
    description: 'Sua beleza é dramática e impactante, com alto contraste e cores intensas.',
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000CD', '#006400', '#4B0082'],
    avoid: ['#FFE4C4', '#F5DEB3', '#DEB887'],
    celebrities: 'Anne Hathaway, Penélope Cruz'
  },
  inverno_frio: {
    name: 'Inverno Frio',
    icon: Snowflake,
    description: 'Você possui uma beleza sofisticada e elegante, com tons puros e gelados.',
    colors: ['#FF00FF', '#00FFFF', '#4169E1', '#C0C0C0', '#FFFFFF', '#800080'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    celebrities: 'Keira Knightley'
  },
  inverno_brilhante: {
    name: 'Inverno Brilhante',
    icon: Snowflake,
    description: 'Sua beleza é vibrante e eletrizante, com cores claras e intensas.',
    colors: ['#FF1493', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF'],
    avoid: ['#808080', '#D2B48C', '#8FBC8F'],
    celebrities: 'Megan Fox, Courtney Cox'
  }
};

function determineSeasonFromAnswers(answers) {
  const { skin_undertone, skin_depth, contrast, hair_color, eye_color, best_metals } = answers;
  
  // Logic to determine season based on answers
  if (skin_undertone === 'warm') {
    if (skin_depth === 'light') {
      if (contrast === 'high') return 'primavera_brilhante';
      return 'primavera_clara';
    }
    if (skin_depth === 'medium') {
      if (contrast === 'low') return 'outono_suave';
      return 'primavera_quente';
    }
    if (skin_depth === 'deep') {
      return 'outono_profundo';
    }
    return 'outono_quente';
  }
  
  if (skin_undertone === 'cool') {
    if (skin_depth === 'light') {
      if (contrast === 'high') return 'inverno_brilhante';
      if (contrast === 'low') return 'verao_claro';
      return 'verao_frio';
    }
    if (skin_depth === 'medium') {
      if (contrast === 'low') return 'verao_suave';
      return 'inverno_frio';
    }
    return 'inverno_profundo';
  }
  
  // Neutral undertone
  if (skin_depth === 'light') {
    if (contrast === 'low') return 'verao_suave';
    return 'primavera_clara';
  }
  if (skin_depth === 'deep') {
    return 'outono_profundo';
  }
  return 'outono_suave';
}

export default function SeasonalAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      analyzeResults();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const season = determineSeasonFromAnswers(answers);
    setResult(seasonData[season]);
    setResult(prev => ({ ...prev, seasonKey: season }));
    setIsAnalyzing(false);
  };

  const restartAnalysis = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analisando seu perfil...</h2>
          <p className="text-gray-600">Descobrindo sua estação perfeita</p>
        </motion.div>
      </div>
    );
  }

  if (result) {
    const SeasonIcon = result.icon;
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
              >
                <SeasonIcon className="w-10 h-10" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Sua Estação é</h1>
              <h2 className="text-4xl font-light">{result.name}</h2>
            </div>
            
            <CardContent className="p-8">
              <p className="text-gray-600 text-lg mb-8 text-center">
                {result.description}
              </p>
              
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Suas Cores Ideais
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.colors.map((color, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-14 h-14 rounded-xl shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">✕</span>
                  Cores para Evitar
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.avoid.map((color, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="w-14 h-14 rounded-xl shadow-lg relative overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-white/50 rotate-45" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Celebridades com sua estação:</h3>
                <p className="text-gray-600">{result.celebrities}</p>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={restartAnalysis}
                  className="flex-1"
                >
                  Refazer Análise
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600"
                  onClick={() => {/* Save to client profile */}}
                >
                  Salvar Resultado
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4">
            <Palette className="w-4 h-4" />
            Análise de Coloração Pessoal
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Descubra sua <span className="font-semibold">Estação</span>
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pergunta {currentStep + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentQuestion.question}
                </h2>
                <p className="text-gray-600 mb-8">
                  {currentQuestion.description}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-rose-500 bg-rose-50'
                          : `${option.color} hover:border-rose-300`
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-80">{option.description}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion.id]}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600"
                  >
                    {currentStep === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}