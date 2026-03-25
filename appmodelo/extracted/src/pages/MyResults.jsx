import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import SeasonalColorPalette from '@/components/dossier/SeasonalColorPalette';

const seasonData = {
  primavera_clara: {
    name: 'Primavera Clara',
    description: 'Você tem uma beleza delicada e luminosa, com características suaves e douradas.',
    colors: ['#FFE4C4', '#FFDAB9', '#F5DEB3', '#FFA07A', '#20B2AA', '#98FB98'],
    avoid: ['#000000', '#36454F', '#800020'],
    tips: ['Opte por cores claras e quentes', 'Use dourado em acessórios', 'Evite cores muito escuras ou frias']
  },
  primavera_quente: {
    name: 'Primavera Quente',
    description: 'Sua beleza irradia calor e vitalidade, com tons dourados e saturados.',
    colors: ['#FF6347', '#FF8C00', '#FFD700', '#9ACD32', '#20B2AA', '#DEB887'],
    avoid: ['#000000', '#4B0082', '#800080'],
    tips: ['Invista em tons terrosos e quentes', 'Dourado é seu melhor amigo', 'Evite roxos e pretos puros']
  },
  primavera_brilhante: {
    name: 'Primavera Brilhante',
    description: 'Você possui um alto contraste natural com cores vivas e vibrantes.',
    colors: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#FFD700', '#00BFFF'],
    avoid: ['#808080', '#D3D3D3', '#8B4513'],
    tips: ['Aposte em cores vibrantes', 'Contraste é sua marca', 'Evite tons apagados']
  },
  verao_claro: {
    name: 'Verão Claro',
    description: 'Sua beleza é suave e etérea, com tons delicados e acinzentados.',
    colors: ['#E6E6FA', '#B0C4DE', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1'],
    avoid: ['#000000', '#FF4500', '#FFD700'],
    tips: ['Escolha tons suaves e rosados', 'Prata combina mais que ouro', 'Evite cores muito vibrantes']
  },
  verao_suave: {
    name: 'Verão Suave',
    description: 'Você tem uma beleza elegante e sofisticada, com tons neutros.',
    colors: ['#BC8F8F', '#C0C0C0', '#D8BFD8', '#9DC183', '#87CEEB', '#DEB887'],
    avoid: ['#000000', '#FF0000', '#FF8C00'],
    tips: ['Tons pastéis são perfeitos', 'Misture tons neutros', 'Evite contrastes fortes']
  },
  verao_frio: {
    name: 'Verão Frio',
    description: 'Sua beleza é refinada e fresca, com subtons rosados.',
    colors: ['#DB7093', '#6495ED', '#DDA0DD', '#778899', '#F5F5DC', '#E0B0FF'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    tips: ['Aposte em tons frios', 'Prata e platina são ideais', 'Evite tons quentes']
  },
  outono_suave: {
    name: 'Outono Suave',
    description: 'Você possui uma beleza terrosa e aconchegante.',
    colors: ['#D2B48C', '#BC8F8F', '#8FBC8F', '#CD853F', '#F4A460', '#DAA520'],
    avoid: ['#000000', '#FF1493', '#00FFFF'],
    tips: ['Tons terrosos são perfeitos', 'Ouro rosa combina', 'Evite cores vibrantes']
  },
  outono_quente: {
    name: 'Outono Quente',
    description: 'Sua beleza é rica e vibrante, com tons intensos e dourados.',
    colors: ['#D2691E', '#B8860B', '#6B8E23', '#CD5C5C', '#8B4513', '#FF8C00'],
    avoid: ['#000000', '#C0C0C0', '#FFB6C1'],
    tips: ['Invista em tons terrosos intensos', 'Dourado é sua cor', 'Evite tons frios']
  },
  outono_profundo: {
    name: 'Outono Profundo',
    description: 'Você tem uma beleza marcante e intensa.',
    colors: ['#8B0000', '#006400', '#4B0082', '#8B4513', '#B8860B', '#2F4F4F'],
    avoid: ['#FFB6C1', '#E6E6FA', '#FFFAF0'],
    tips: ['Cores profundas são ideais', 'Pode usar preto moderadamente', 'Evite tons claros']
  },
  inverno_profundo: {
    name: 'Inverno Profundo',
    description: 'Sua beleza é dramática e impactante.',
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000CD', '#006400', '#4B0082'],
    avoid: ['#FFE4C4', '#F5DEB3', '#DEB887'],
    tips: ['Alto contraste é seu forte', 'Preto e branco são aliados', 'Evite tons suaves']
  },
  inverno_frio: {
    name: 'Inverno Frio',
    description: 'Você possui uma beleza sofisticada e elegante.',
    colors: ['#FF00FF', '#00FFFF', '#4169E1', '#C0C0C0', '#FFFFFF', '#800080'],
    avoid: ['#FF8C00', '#FFD700', '#8B4513'],
    tips: ['Tons puros e frios são perfeitos', 'Prata combina bem', 'Evite tons quentes']
  },
  inverno_brilhante: {
    name: 'Inverno Brilhante',
    description: 'Sua beleza é vibrante e eletrizante.',
    colors: ['#FF1493', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF'],
    avoid: ['#808080', '#D2B48C', '#8FBC8F'],
    tips: ['Cores vibrantes são ideais', 'Pode combinar cores ousadas', 'Evite tons apagados']
  }
};

export default function MyResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('requestId');
  const [user, setUser] = useState(null);

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

  const { data: request, isLoading } = useQuery({
    queryKey: ['analysis-request', requestId],
    queryFn: async () => {
      const requests = await base44.entities.ColorAnalysisRequest.filter({ id: requestId });
      return requests[0];
    },
    enabled: !!requestId
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!request || request.status !== 'approved') {
    return (
      <div className="p-4 md:p-8 text-center py-16">
        <p className="text-gray-600">Análise não encontrada ou ainda não aprovada</p>
        <Link to={createPageUrl("ClientPortal")}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const season = seasonData[request.consultant_season];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("ClientPortal")}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Sua Estação é</h1>
              <h2 className="text-4xl font-light">{season.name}</h2>
            </div>
            
            <CardContent className="p-8">
              <p className="text-gray-600 text-lg mb-8 text-center">
                {season.description}
              </p>
              
              {/* Cartela de Cores Completa */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-center text-xl">Sua Cartela de Cores</h3>
                <SeasonalColorPalette season={request.consultant_season} />
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Dicas de Estilo</h3>
                <ul className="space-y-2">
                  {season.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 py-2 border-b border-gray-100">
                      <Check className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {request.consultant_notes && (
                <div className="bg-rose-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Observações da Consultora</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{request.consultant_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}