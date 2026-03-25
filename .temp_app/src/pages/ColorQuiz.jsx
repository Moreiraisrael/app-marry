import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const questions = [
  {
    id: 'skin_tone',
    question: 'Qual é o tom da sua pele?',
    options: [
      { value: 'muito_clara', label: 'Muito Clara (queima fácil ao sol)' },
      { value: 'clara', label: 'Clara (queima moderadamente)' },
      { value: 'media', label: 'Média (bronzeia facilmente)' },
      { value: 'morena', label: 'Morena' },
      { value: 'escura', label: 'Escura/Negra' }
    ]
  },
  {
    id: 'vein_color',
    question: 'Quando você olha para as veias do seu pulso, qual cor você vê?',
    options: [
      { value: 'azul_roxo', label: 'Azul ou Roxo (subtom frio)' },
      { value: 'verde_oliva', label: 'Verde ou Oliva (subtom quente)' },
      { value: 'azul_verde', label: 'Azul-esverdeado (subtom neutro)' },
      { value: 'nao_sei', label: 'Não consigo identificar' }
    ]
  },
  {
    id: 'sun_reaction',
    question: 'Como sua pele reage ao sol?',
    options: [
      { value: 'queima_muito', label: 'Queima muito facilmente, nunca bronzeia' },
      { value: 'queima_bronzeia', label: 'Queima facilmente, mas bronzeia um pouco' },
      { value: 'bronzeia_facil', label: 'Bronzeia facilmente, raramente queima' },
      { value: 'bronzeia_muito', label: 'Bronzeia muito facilmente' }
    ]
  },
  {
    id: 'natural_hair',
    question: 'Qual é a cor natural do seu cabelo?',
    options: [
      { value: 'loiro_platinado', label: 'Loiro Platinado' },
      { value: 'loiro_dourado', label: 'Loiro Dourado' },
      { value: 'castanho_claro', label: 'Castanho Claro' },
      { value: 'castanho_medio', label: 'Castanho Médio' },
      { value: 'castanho_escuro', label: 'Castanho Escuro' },
      { value: 'preto', label: 'Preto' },
      { value: 'ruivo', label: 'Ruivo' }
    ]
  },
  {
    id: 'eye_color',
    question: 'Qual é a cor dos seus olhos?',
    options: [
      { value: 'azul_claro', label: 'Azul Claro' },
      { value: 'azul_escuro', label: 'Azul Escuro' },
      { value: 'verde', label: 'Verde' },
      { value: 'castanho_claro', label: 'Castanho Claro/Mel' },
      { value: 'castanho_medio', label: 'Castanho Médio' },
      { value: 'castanho_escuro', label: 'Castanho Escuro/Preto' }
    ]
  },
  {
    id: 'metal_preference',
    question: 'Qual metal te favorece mais?',
    options: [
      { value: 'prata', label: 'Prata (me deixa com aparência mais iluminada)' },
      { value: 'ouro', label: 'Ouro (me deixa com aparência mais iluminada)' },
      { value: 'ambos', label: 'Ambos ficam bem' },
      { value: 'nao_sei', label: 'Não sei' }
    ]
  },
  {
    id: 'white_preference',
    question: 'Qual tipo de branco te favorece mais?',
    options: [
      { value: 'branco_gelo', label: 'Branco Gelo/Puro (branco brilhante)' },
      { value: 'off_white', label: 'Off-White/Marfim (branco cremoso)' },
      { value: 'nao_sei', label: 'Não sei' }
    ]
  },
  {
    id: 'best_colors',
    question: 'Quais cores geralmente te deixam com melhor aparência?',
    options: [
      { value: 'pasteis_frios', label: 'Cores pastéis e frias (rosa bebê, azul claro, lavanda)' },
      { value: 'quentes_terrosas', label: 'Cores quentes e terrosas (caramelo, mostarda, terracota)' },
      { value: 'vibrantes_puras', label: 'Cores vibrantes e puras (vermelho, azul royal, verde esmeralda)' },
      { value: 'neutras_suaves', label: 'Cores neutras e suaves (bege, cinza, taupe)' }
    ]
  },
  {
    id: 'contrast',
    question: 'Como você descreveria o contraste natural entre sua pele, cabelo e olhos?',
    options: [
      { value: 'alto', label: 'Alto contraste (diferenças marcantes)' },
      { value: 'medio', label: 'Contraste médio' },
      { value: 'baixo', label: 'Baixo contraste (tons similares)' }
    ]
  }
];

export default function ColorQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const progress = ((currentStep + 1) / (questions.length + 1)) * 100;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(result.file_url);
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Criar requisição de análise
      await base44.entities.ColorAnalysisRequest.create({
        client_id: user.id,
        client_photo: photoUrl,
        questionnaire_answers: answers,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Questionário enviado! Aguarde a análise da consultora.');
      setTimeout(() => {
        window.location.href = createPageUrl('MyResults');
      }, 1500);
    },
    onError: () => {
      toast.error('Erro ao enviar questionário');
    }
  });

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      submitMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === questions.length) {
      return photoUrl;
    }
    return answers[questions[currentStep]?.id];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Questionário de Coloração Pessoal
          </h1>
          <p className="text-gray-600">
            Descubra sua paleta de cores ideal através da análise sazonal
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Etapa {currentStep + 1} de {questions.length + 1}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentStep < questions.length 
                ? questions[currentStep].question 
                : 'Envie sua foto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep < questions.length ? (
              <RadioGroup
                value={answers[questions[currentStep].id] || ''}
                onValueChange={(value) => 
                  setAnswers({ ...answers, [questions[currentStep].id]: value })
                }
              >
                <div className="space-y-3">
                  {questions[currentStep].options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                      onClick={() => 
                        setAnswers({ ...answers, [questions[currentStep].id]: option.value })
                      }
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer font-medium text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Para uma análise mais precisa, envie uma foto sua com luz natural, sem maquiagem:
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt="Preview"
                          className="w-48 h-48 object-cover rounded-lg mb-4"
                        />
                        <p className="text-green-600 font-semibold">Foto enviada com sucesso!</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">
                          {uploading ? 'Enviando...' : 'Clique para enviar sua foto'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, PNG ou JPEG (máx. 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
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
            disabled={!canProceed() || submitMutation.isPending}
            className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600"
          >
            {currentStep === questions.length ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? 'Enviando...' : 'Finalizar'}
              </>
            ) : (
              <>
                Próxima
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center mt-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-gray-600">
              Cancelar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}