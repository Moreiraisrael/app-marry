import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Calendar, Sun, Briefcase, Heart, PartyPopper } from 'lucide-react';
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

const occasionIcons = {
  trabalho: Briefcase,
  casual: Sun,
  jantar: Heart,
  festa: PartyPopper,
  evento: Calendar
};

export default function OutfitSuggestionAI({ season, analysisData }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateOutfits = async () => {
    setLoading(true);
    try {
      const facialFeatures = analysisData?.facial_features || {};
      const bodyAnalysis = analysisData?.body_analysis || {};
      const styleRecs = analysisData?.style_recommendations || {};

      const prompt = `Você é uma consultora de moda especialista. 

**CLIENTE:**
- Estação de Cores: ${seasonLabels[season]}
- Formato do Rosto: ${facialFeatures.face_shape || 'não especificado'}
- Traços: ${facialFeatures.facial_traits || 'não especificado'}
- Estrutura Corporal: ${bodyAnalysis.bone_structure || 'não especificada'}
- Ombros: ${bodyAnalysis.shoulders || 'não especificado'}

**RECOMENDAÇÕES JÁ IDENTIFICADAS:**
- Decotes: ${styleRecs.necklines || 'variados'}
- Comprimentos: ${styleRecs.lengths || 'variados'}
- Estampas: ${styleRecs.patterns || 'variadas'}

**TAREFA:**
Crie 5 looks completos e específicos para diferentes ocasiões, considerando:
1. A paleta de cores da estação ${seasonLabels[season]}
2. As características faciais e corporais
3. As recomendações de estilo já identificadas

Para cada look, seja MUITO ESPECÍFICA sobre:
- Peças exatas (ex: "blazer estruturado preto", não apenas "blazer")
- Cores específicas da paleta
- Como cada peça valoriza as características da pessoa
- Acessórios complementares
- Calçados adequados`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            outfits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  occasion: {
                    type: "string",
                    enum: ["trabalho", "casual", "jantar", "festa", "evento"],
                    description: "Ocasião do look"
                  },
                  title: {
                    type: "string",
                    description: "Título criativo do look"
                  },
                  description: {
                    type: "string",
                    description: "Descrição geral do visual"
                  },
                  pieces: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string", description: "Nome da peça específica" },
                        color: { type: "string", description: "Cor específica" },
                        why: { type: "string", description: "Por que essa peça valoriza" }
                      }
                    },
                    description: "Lista de peças do look"
                  },
                  accessories: {
                    type: "array",
                    items: { type: "string" },
                    description: "Acessórios complementares"
                  },
                  shoes: {
                    type: "string",
                    description: "Calçado recomendado"
                  },
                  styling_tip: {
                    type: "string",
                    description: "Dica final de styling"
                  }
                }
              }
            }
          },
          required: ["outfits"]
        }
      });

      setSuggestions(result.outfits);
      toast.success('Looks criados com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar sugestões');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-rose-600" />
            Assistente de Looks com IA
          </CardTitle>
          <p className="text-sm text-gray-600">
            Receba sugestões de looks completos baseados na estação de cores e características da cliente
          </p>
        </CardHeader>
        <CardContent>
          {!suggestions ? (
            <Button
              onClick={generateOutfits}
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando looks personalizados...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Sugestões de Looks
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={generateOutfits}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Novos Looks
            </Button>
          )}
        </CardContent>
      </Card>

      {suggestions && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-600" />
            Looks Personalizados
          </h3>
          <div className="grid gap-6">
            {suggestions.map((outfit, index) => {
              const Icon = occasionIcons[outfit.occasion] || Calendar;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Badge className="bg-white/20 backdrop-blur text-white border-white/30 mb-2">
                          {outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)}
                        </Badge>
                        <h4 className="text-xl font-bold text-white">{outfit.title}</h4>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-gray-700">{outfit.description}</p>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                      <p className="font-semibold text-sm text-gray-700 mb-3">👗 Peças do Look:</p>
                      <div className="space-y-2">
                        {outfit.pieces.map((piece, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {piece.item} - <span className="text-rose-600">{piece.color}</span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{piece.why}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {outfit.accessories?.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4">
                        <p className="font-semibold text-sm text-amber-700 mb-2">💍 Acessórios:</p>
                        <div className="flex flex-wrap gap-2">
                          {outfit.accessories.map((acc, idx) => (
                            <Badge key={idx} className="bg-white/80 text-amber-800 border border-amber-200">
                              {acc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {outfit.shoes && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                        <p className="font-semibold text-sm text-purple-700 mb-1">👠 Calçado:</p>
                        <p className="text-sm text-gray-700">{outfit.shoes}</p>
                      </div>
                    )}

                    {outfit.styling_tip && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="font-semibold text-sm text-blue-700 mb-1">✨ Dica de Styling:</p>
                        <p className="text-sm text-gray-700">{outfit.styling_tip}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}