import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MoodBoard({ season, style, clientName }) {
  const [moodboardImages, setMoodboardImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateMoodboard = async () => {
    setLoading(true);
    try {
      const seasonDescriptions = {
        primavera_clara: 'light spring colors, soft pastels, warm delicate tones',
        primavera_quente: 'warm spring colors, golden vibrant tones',
        primavera_brilhante: 'bright spring colors, vivid clear tones',
        verao_claro: 'light summer colors, soft cool pastels',
        verao_suave: 'soft summer colors, muted gentle tones',
        verao_frio: 'cool summer colors, icy refined tones',
        outono_suave: 'soft autumn colors, muted earthy tones',
        outono_quente: 'warm autumn colors, rich golden earth tones',
        outono_profundo: 'deep autumn colors, rich warm dark tones',
        inverno_profundo: 'deep winter colors, dramatic dark rich tones',
        inverno_frio: 'cool winter colors, icy pure tones',
        inverno_brilhante: 'bright winter colors, clear vibrant tones'
      };

      const styleDescriptions = {
        classico: 'classic timeless elegant structured tailored',
        dramatico: 'dramatic bold striking statement pieces',
        romantico: 'romantic feminine delicate soft flowy',
        natural: 'natural relaxed comfortable casual earthy',
        criativo: 'creative unique artistic eclectic mixed',
        elegante: 'elegant sophisticated refined luxury',
        sensual: 'sensual confident glamorous body-conscious'
      };

      const prompt = `Create a fashion mood board with ${seasonDescriptions[season] || 'elegant colors'} and ${styleDescriptions[style] || 'sophisticated style'}. Professional fashion photography, high-end boutique aesthetic, editorial quality, elegant composition.`;

      // Generate 4 mood board images
      const imagePromises = Array(4).fill(null).map(() => 
        base44.integrations.Core.GenerateImage({ prompt })
      );

      const results = await Promise.all(imagePromises);
      setMoodboardImages(results.map(r => r.url));
      toast.success('Moodboard gerado!');
    } catch (error) {
      toast.error('Erro ao gerar moodboard');
    } finally {
      setLoading(false);
    }
  };

  if (!moodboardImages) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-rose-600" />
            Moodboard Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
              <Image className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-gray-600 mb-4">
              Crie um moodboard visual personalizado com IA
            </p>
            <Button
              onClick={generateMoodboard}
              disabled={loading}
              className="bg-gradient-to-r from-rose-500 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Moodboard...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Moodboard
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-rose-600" />
            Moodboard Visual - {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {moodboardImages.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-square rounded-xl overflow-hidden shadow-lg"
              >
                <img 
                  src={url} 
                  alt={`Mood ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setMoodboardImages(null)}
            className="w-full mt-4"
          >
            Gerar Novo Moodboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}