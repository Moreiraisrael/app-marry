import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, ShoppingBag, Palette, Shirt, Calendar, Image, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Avatar3D from '@/components/virtual/Avatar3D';

export default function AIStyleProfile({ client, colorAnalysis, styleQuiz, wardrobeItems }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moodBoards, setMoodBoards] = useState([]);
  const [occasionRecommendations, setOccasionRecommendations] = useState(null);
  const [partnerProducts, setPartnerProducts] = useState([]);
  const [tryOnItem, setTryOnItem] = useState(null);

  const generateProfile = async () => {
    setLoading(true);
    try {
      const prompt = `Você é uma consultora de imagem experiente. Crie um Perfil de Estilo completo para esta cliente em PORTUGUÊS:

**Informações da Cliente:**
- Estação de Cores: ${client.season || 'Não analisada'}
- Estilo Pessoal: ${styleQuiz?.consultant_style || 'Não definido'}
- Tipo de Corpo: ${client.body_type || 'Não especificado'}

**Notas da Análise de Cores:**
${colorAnalysis?.consultant_notes || 'Sem notas disponíveis'}

**Notas do Questionário de Estilo:**
${styleQuiz?.consultant_notes || 'Sem notas disponíveis'}

**Visão Geral do Guarda-Roupa:**
- Total de peças: ${wardrobeItems?.length || 0}
- Peças que combinam com a estação: ${wardrobeItems?.filter(i => i.season_match).length || 0}
- Peças que combinam com o estilo: ${wardrobeItems?.filter(i => i.style_match).length || 0}

Gere um perfil de estilo detalhado com DNA de estilo, psicologia das cores, peças essenciais e prioridades de compra.
IMPORTANTE: Responda TUDO em PORTUGUÊS do Brasil.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            style_dna: { type: "string" },
            color_psychology: { type: "string" },
            style_strengths: { type: "array", items: { type: "string" } },
            must_have_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            signature_looks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  occasion: { type: "string" },
                  pieces: { type: "array", items: { type: "string" } },
                  styling_tip: { type: "string" }
                }
              }
            },
            evolution_tips: { type: "array", items: { type: "string" } },
            shopping_priorities: { type: "array", items: { type: "string" } }
          }
        }
      });

      setProfile(result);

      // Generate occasion-based recommendations
      await generateOccasionRecommendations(result);

      // Generate mood boards
      await generateMoodBoards(result);

      // Generate partner products
      await generatePartnerProducts(result);

      toast.success('Perfil de estilo completo gerado!');
    } catch (error) {
      toast.error('Erro ao gerar perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateOccasionRecommendations = async (styleProfile) => {
    try {
      const occasionPrompt = `Com base neste perfil de estilo, crie recomendações detalhadas de looks para diferentes ocasiões em PORTUGUÊS:
      
      DNA de Estilo: ${styleProfile.style_dna}
      Estação de Cores: ${client.season}
      
      Crie recomendações específicas de looks para: Trabalho/Profissional, Casual Diário, Eventos Formais, Fim de Semana/Lazer, Encontro Romântico
      
      Para cada ocasião, forneça 2-3 ideias de looks completos com peças específicas, dicas de styling e por que funcionam.
      IMPORTANTE: Responda TUDO em PORTUGUÊS do Brasil.`;

      const occasions = await base44.integrations.Core.InvokeLLM({
        prompt: occasionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            occasions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  occasion: { type: "string" },
                  outfits: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        pieces: { type: "array", items: { type: "string" } },
                        styling_tips: { type: "string" },
                        key_elements: { type: "array", items: { type: "string" } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setOccasionRecommendations(occasions.occasions);
    } catch (error) {
      console.error('Error generating occasion recommendations:', error);
    }
  };

  const generateMoodBoards = async (styleProfile) => {
    try {
      const moodBoardPrompts = [
        {
          name: "Essência do Estilo",
          prompt: `Create a fashion mood board showcasing the essence of this style. 
          Include elegant fashion layouts, aesthetic keywords: sophisticated, timeless, elegant. 
          Professional fashion photography, editorial style, Pinterest aesthetic.`
        },
        {
          name: "Paleta de Cores",
          prompt: `Create a color palette mood board featuring beautiful color combinations. 
          Show these colors in fabric swatches, fashion pieces, and elegant color combinations. 
          Organized, professional color board for fashion.`
        },
        {
          name: "Looks Inspiração",
          prompt: `Create an outfit inspiration mood board. 
          Show complete outfit combinations, street style photography, fashion editorial vibes. 
          Professional and inspiring fashion collage.`
        }
      ];

      const boards = await Promise.all(
        moodBoardPrompts.map(async (board) => {
          try {
            const { url } = await base44.integrations.Core.GenerateImage({
              prompt: board.prompt
            });
            return { name: board.name, image: url };
          } catch {
            return null;
          }
        })
      );

      setMoodBoards(boards.filter(b => b !== null));
    } catch (error) {
      console.error('Error generating mood boards:', error);
    }
  };

  const generatePartnerProducts = async (styleProfile) => {
    try {
      const productPrompt = `Com base neste perfil de estilo, sugira 6 produtos de moda específicos que combinem perfeitamente com este estilo e paleta de cores. Inclua variedade entre categorias (blusas, calças, vestidos, acessórios). IMPORTANTE: Responda TUDO em PORTUGUÊS do Brasil.`;

      const products = await base44.integrations.Core.InvokeLLM({
        prompt: productPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  price_range: { type: "string" },
                  why_perfect: { type: "string" },
                  styling_tip: { type: "string" }
                }
              }
            }
          }
        }
      });

      const productsWithImages = await Promise.all(
        products.products.map(async (product) => {
          try {
            const { url } = await base44.integrations.Core.GenerateImage({
              prompt: `Professional e-commerce product photo of ${product.name}. ${product.description}. 
              Clean white background, studio lighting, high-end fashion catalog style.`
            });
            return { ...product, image: url };
          } catch {
            return { ...product, image: null };
          }
        })
      );

      setPartnerProducts(productsWithImages);
    } catch (error) {
      console.error('Error generating partner products:', error);
    }
  };

  if (!profile) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Análise Profissional de Estilo
          </CardTitle>
          <p className="text-sm text-gray-600">
            Análise abrangente do estilo pessoal baseada em coloração, preferências e guarda-roupa
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Gere uma análise completa do estilo pessoal com recomendações personalizadas de peças e combinações
            </p>
            <Button
              onClick={generateProfile}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando Estilo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Análise de Estilo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Style DNA */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-purple-700">
            <Sparkles className="w-5 h-5" />
            DNA de Estilo Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 text-lg leading-relaxed italic">
            "{profile.style_dna}"
          </p>
        </CardContent>
      </Card>

      {/* Color Psychology */}
      <Card className="border-l-4 border-rose-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-rose-700">
            <Palette className="w-5 h-5" />
            Psicologia das Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{profile.color_psychology}</p>
        </CardContent>
      </Card>

      {/* Style Strengths */}
      <Card className="border-l-4 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-700">
            ✨ Pontos Fortes do Estilo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profile.style_strengths?.map((strength, i) => (
              <div key={i} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-700">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Must-Have Items */}
      <Card className="border-0 shadow-lg md:col-span-2">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
          <CardTitle className="flex items-center gap-2 text-xl text-purple-800">
            <ShoppingBag className="w-6 h-6" />
            Peças Essenciais do Guarda-Roupa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {profile.must_have_items?.map((item, i) => (
              <div key={i} className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{item.item}</h4>
                  <Badge className={
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Occasion Recommendations */}
      {occasionRecommendations && occasionRecommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Looks por Ocasião
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={occasionRecommendations[0]?.occasion}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {occasionRecommendations.map((occ, idx) => (
                  <TabsTrigger key={idx} value={occ.occasion}>
                    {occ.occasion}
                  </TabsTrigger>
                ))}
              </TabsList>
              {occasionRecommendations.map((occ, idx) => (
                <TabsContent key={idx} value={occ.occasion} className="space-y-3">
                  {occ.outfits?.map((outfit, oidx) => (
                    <div key={oidx} className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{outfit.name}</h4>
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Peças:</p>
                          <ul className="space-y-1">
                            {outfit.pieces?.map((piece, pidx) => (
                              <li key={pidx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                {piece}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Elementos-Chave:</p>
                          <div className="flex flex-wrap gap-1">
                            {outfit.key_elements?.map((el, eidx) => (
                              <Badge key={eidx} variant="outline" className="text-xs">
                                {el}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>Dica:</strong> {outfit.styling_tips}
                      </p>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Mood Boards */}
      {moodBoards.length > 0 && (
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-pink-600" />
              Mood Boards do Estilo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {moodBoards.map((board, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-md">
                    <img 
                      src={board.image} 
                      alt={board.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-center text-gray-900">{board.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partner Products */}
      {partnerProducts.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              Produtos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {partnerProducts.map((product, idx) => (
                <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {product.image && (
                    <div className="aspect-square bg-gray-50">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h4>
                    <Badge className="mb-2 text-xs">{product.category}</Badge>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="bg-amber-50 p-2 rounded text-xs mb-2">
                      <strong>Por que é perfeito:</strong> {product.why_perfect}
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2">{product.styling_tip}</p>
                    <div className="mt-2 pt-2 border-t space-y-2">
                      <span className="text-sm font-bold text-amber-600 block">{product.price_range}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => setTryOnItem(product)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Prova Virtual 3D
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={() => {
              setProfile(null);
              setMoodBoards([]);
              setOccasionRecommendations(null);
              setPartnerProducts([]);
            }}
            className="w-full"
            size="lg"
          >
            Gerar Nova Análise de Estilo
          </Button>
        </CardContent>
      </Card>

      {/* Virtual Try-On 3D Avatar */}
      {tryOnItem && client && (
        <Avatar3D
          client={client}
          clothingItem={tryOnItem}
          onClose={() => setTryOnItem(null)}
        />
      )}
    </motion.div>
  );
}