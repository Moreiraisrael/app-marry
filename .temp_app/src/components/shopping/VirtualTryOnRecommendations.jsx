import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Eye, Heart, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function VirtualTryOnRecommendations({ recommendation, clientData, onAddToList }) {
  const [tryOnResult, setTryOnResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const generateTryOnMutation = useMutation({
    mutationFn: async () => {
      // Construir descrição do avatar com características da cliente
      const avatarDescription = `
Uma mulher ${clientData.skin_tone || 'de pele clara'}, 
cabelo ${clientData.hair_color || 'castanho'}, 
olhos ${clientData.eye_color || 'castanhos'},
tipo de corpo ${clientData.body_type || 'proporcional'},
altura aproximada ${clientData.height ? `${clientData.height}cm` : '165cm'},
em pose natural para fotografia de moda.
      `.trim();

      const clothingDescription = `
${recommendation.name} - ${recommendation.category}
Cores: ${recommendation.ideal_colors?.join(', ') || 'cores neutras'}
Estilo: ${recommendation.ideal_styles?.join(', ') || 'moderno'}
      `.trim();

      const fullPrompt = `
Crie uma visualização fotorrealística profissional de prova virtual de roupa.

AVATAR/MODELO:
${avatarDescription}

ROUPA A SER VESTIDA:
${clothingDescription}

REQUISITOS TÉCNICOS:
- Fotografia de moda profissional em estúdio
- Iluminação suave e natural
- Fundo neutro elegante (branco, bege claro ou cinza claro)
- Modelo em pose natural e confiante
- A roupa deve estar perfeitamente ajustada ao corpo
- Mostrar a peça completa de forma clara
- Renderização realista da textura e caimento do tecido
- Expressão natural e amigável da modelo
- Enquadramento de corpo inteiro ou 3/4 conforme apropriado para a peça

Estilo: fotografia de lookbook profissional, alta qualidade, realista.
      `.trim();

      const response = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt,
        existing_image_urls: clientData.profile_photo ? [clientData.profile_photo] : undefined
      });

      return response.url;
    },
    onSuccess: (imageUrl) => {
      setTryOnResult(imageUrl);
      setShowModal(true);
      toast.success('Prova virtual gerada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar prova virtual. Tente novamente.');
    }
  });

  const saveTryOnMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.VirtualTryOn.create({
        client_id: clientData.id,
        clothing_image: tryOnResult,
        result_image: tryOnResult,
        clothing_type: recommendation.category,
        is_favorite: false
      });
    },
    onSuccess: () => {
      toast.success('Prova virtual salva!');
      queryClient.invalidateQueries({ queryKey: ['virtualTryOns'] });
    }
  });

  const handleTryOn = () => {
    generateTryOnMutation.mutate();
  };

  const handleSaveAndAddToList = () => {
    saveTryOnMutation.mutate();
    if (onAddToList) {
      onAddToList(recommendation);
    }
    setShowModal(false);
  };

  return (
    <>
      <Button
        onClick={handleTryOn}
        disabled={generateTryOnMutation.isPending}
        variant="outline"
        className="gap-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
      >
        {generateTryOnMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Prova Virtual
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Prova Virtual: {recommendation.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Virtual Try-On Result */}
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 p-4">
              {tryOnResult && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={tryOnResult}
                  alt="Virtual Try-On"
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              )}
            </div>

            {/* Recommendation Details */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Sobre esta peça</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Por que combina:</p>
                  <p className="text-sm text-gray-600">{recommendation.why_it_fits}</p>
                </div>

                {recommendation.trend_connection && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-purple-700 mb-1">🔥 Tendência Atual</p>
                    <p className="text-sm text-purple-600">{recommendation.trend_connection}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Cores ideais:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.ideal_colors?.map((color, i) => (
                      <Badge key={i} variant="outline" className="bg-purple-50">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Combina com:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recommendation.combines_with?.slice(0, 3).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge className="bg-green-100 text-green-700">
                    Versatilidade: {recommendation.versatility_score}%
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.budget_range}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveAndAddToList}
                disabled={saveTryOnMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar à Lista
              </Button>
              <Button
                onClick={() => saveTryOnMutation.mutate()}
                disabled={saveTryOnMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <Heart className="w-4 h-4" />
                Salvar
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}