import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, Image, User } from 'lucide-react';
import { toast } from 'sonner';

const occasions = [
  { id: 'trabalho', label: 'Trabalho', emoji: '💼' },
  { id: 'casual', label: 'Casual', emoji: '👗' },
  { id: 'festa', label: 'Festa', emoji: '🎉' },
  { id: 'jantar', label: 'Jantar Romântico', emoji: '🍷' },
  { id: 'casamento', label: 'Casamento', emoji: '💒' },
  { id: 'academia', label: 'Academia', emoji: '🏋️' },
  { id: 'praia', label: 'Praia/Piscina', emoji: '🏖️' },
  { id: 'entrevista', label: 'Entrevista', emoji: '📋' }
];

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

const checkAndResetSubscription = async (sub) => {
  const today = new Date();
  const lastReset = new Date(sub.last_reset_date);
  
  // Reset se passou um mês
  if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
    await base44.entities.Subscription.update(sub.id, {
      looks_used_this_month: 0,
      last_reset_date: today.toISOString().split('T')[0]
    });
    return { ...sub, looks_used_this_month: 0 };
  }
  return sub;
};

export default function AILookGenerator({ client, season, style }) {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [tryOnImages, setTryOnImages] = useState({});
  const [generatingTryOn, setGeneratingTryOn] = useState({});

  useState(() => {
    const loadData = async () => {
      try {
        const [subs, wardrobe] = await Promise.all([
          base44.entities.Subscription.filter({ 
            client_id: client.id,
            status: 'active'
          }),
          base44.entities.WardrobeItem.filter({ client_id: client.id })
        ]);
        
        if (subs[0]) {
          const updatedSub = await checkAndResetSubscription(subs[0]);
          setSubscription(updatedSub);
        }
        setWardrobeItems(wardrobe);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSub(false);
      }
    };
    if (client?.id) loadData();
  }, [client]);

  const canGenerateLooks = () => {
    if (!subscription) return false;
    if (subscription.plan === 'basico') return false;
    if (subscription.looks_limit === -1) return true; // Ilimitado
    return subscription.looks_used_this_month < subscription.looks_limit;
  };

  const getRemainingLooks = () => {
    if (!subscription) return 0;
    if (subscription.looks_limit === -1) return 999;
    return subscription.looks_limit - subscription.looks_used_this_month;
  };

  const generateLooks = async () => {
    if (!selectedOccasion) {
      toast.error('Escolha uma ocasião primeiro!');
      return;
    }

    if (!canGenerateLooks()) {
      toast.error('Você atingiu o limite do seu plano. Faça upgrade para continuar! 💎');
      return;
    }

    setLoading(true);
    try {
      const occasion = occasions.find(o => o.id === selectedOccasion);
      
      const wardrobeInfo = wardrobeItems.length > 0 
        ? `\n\nGUARDA-ROUPA DA CLIENTE:\n${wardrobeItems.map(item => 
            `- ${item.category}: ${item.color || 'cor não especificada'} (${item.brand || 'marca não especificada'})`
          ).join('\n')}\n\nIMPORTANTE: Priorize usar peças que ela já possui no guarda-roupa quando apropriado.`
        : '\n\nA cliente ainda não tem peças cadastradas no guarda-roupa.';

      const bodyTypeInfo = client.body_type 
        ? `\nTIPO DE CORPO: ${client.body_type}\nMedidas: Busto ${client.bust}cm, Cintura ${client.waist}cm, Quadril ${client.hip}cm`
        : '';
      
      const prompt = `Você é uma consultora de imagem especializada em coloração pessoal e estilo.

PERFIL DA CLIENTE:
- Nome: ${client.full_name}
- Estação: ${seasonLabels[season] || season}
- Estilo Pessoal: ${style}${bodyTypeInfo}${wardrobeInfo}

OCASIÃO: ${occasion.label}

Crie 3 looks completos e específicos para esta ocasião, considerando:
1. A cartela de cores da estação da cliente
2. O estilo pessoal dela
3. O tipo de corpo e medidas dela
4. As peças que ela já possui no guarda-roupa (quando aplicável)
5. A ocasião escolhida

Para cada look, forneça:
- Nome do look (criativo e atraente)
- Descrição geral (2-3 linhas)
- Peças principais com cores exatas (indique se é do guarda-roupa dela ou sugestão de compra)
- Sapatos específicos (tipo, cor, altura do salto)
- Acessórios detalhados (bolsa, joias, óculos, lenço, etc)
- Dicas de styling
- Dicas específicas para o tipo de corpo dela
- Por que este look funciona para ela

Seja MUITO específica e detalhada. Use cores reais da estação dela.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            looks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  pieces: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        color: { type: "string" },
                        from_wardrobe: { type: "boolean" }
                      }
                    }
                  },
                  shoes: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      color: { type: "string" },
                      heel_height: { type: "string" }
                    }
                  },
                  accessories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  },
                  styling_tips: { type: "string" },
                  body_type_tips: { type: "string" },
                  why_works: { type: "string" }
                }
              }
            }
          }
        }
      });

      setLooks(result.looks);
      
      // Atualizar contador de uso
      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          looks_used_this_month: subscription.looks_used_this_month + 1
        });
        setSubscription({
          ...subscription,
          looks_used_this_month: subscription.looks_used_this_month + 1
        });
      }
      
      toast.success('Looks criados com sucesso! ✨');
    } catch (error) {
      toast.error('Erro ao gerar looks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTryOn = async (look, lookIndex) => {
    if (!client.profile_photo) {
      toast.error('A cliente não possui foto de perfil cadastrada. Adicione uma foto no perfil dela.');
      return;
    }
    
    setGeneratingTryOn(prev => ({ ...prev, [lookIndex]: true }));
    try {
      const occasion = occasions.find(o => o.id === selectedOccasion);
      const piecesDescription = look.pieces.map(p => `${p.item} na cor ${p.color}`).join(', ');
      const shoesDesc = look.shoes ? `${look.shoes.type} ${look.shoes.color}` : '';
      
      const prompt = `Fashion editorial photo: a woman wearing ${piecesDescription}${shoesDesc ? `, with ${shoesDesc}` : ''}. 
The outfit is for ${occasion?.label || 'daily use'}. 
Style: elegant, full body shot, natural lighting, clean background. 
The woman has the features visible in the reference photo. 
High quality, photorealistic, fashion magazine style.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [client.profile_photo]
      });

      setTryOnImages(prev => ({ ...prev, [lookIndex]: result.url }));
      toast.success('Visualização gerada! ✨');
    } catch (error) {
      toast.error('Erro ao gerar visualização');
      console.error(error);
    } finally {
      setGeneratingTryOn(prev => ({ ...prev, [lookIndex]: false }));
    }
  };

  if (loadingSub) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <Card className={`border-2 ${
          subscription.plan === 'vip' ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50' :
          subscription.plan === 'premium' ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Seu Plano:</p>
                <p className="font-bold text-lg capitalize">{subscription.plan}</p>
              </div>
              <div className="text-right">
                {subscription.looks_limit === -1 ? (
                  <Badge className="bg-gradient-to-r from-amber-400 to-rose-500">
                    Looks Ilimitados ✨
                  </Badge>
                ) : subscription.plan === 'basico' ? (
                  <Badge variant="outline" className="text-gray-600">
                    Sem geração de looks
                  </Badge>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-rose-600">
                      {getRemainingLooks()}
                    </p>
                    <p className="text-xs text-gray-600">looks restantes</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No subscription or basic plan */}
      {(!subscription || subscription.plan === 'basico') && (
        <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-rose-500" />
            <h3 className="font-bold text-gray-900 mb-2">
              Desbloqueie Looks Personalizados! 
            </h3>
            <p className="text-gray-600 mb-4">
              Faça upgrade do seu plano e tenha acesso a sugestões de looks com IA
            </p>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600">
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Looks Personalizados com IA
        </h2>
        <p className="text-gray-600">
          Escolha a ocasião e receba sugestões incríveis para o seu perfil!
        </p>
      </div>

      {/* Profile Info */}
      <Card className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-sm text-gray-500">Seu Perfil:</span>
              <div className="flex gap-2 mt-1">
                {season && (
                  <Badge className="bg-rose-600">
                    {seasonLabels[season]}
                  </Badge>
                )}
                {style && (
                  <Badge className="bg-purple-600 capitalize">
                    {style}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occasion Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          1. Escolha a Ocasião
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {occasions.map((occasion) => (
            <button
              key={occasion.id}
              onClick={() => setSelectedOccasion(occasion.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedOccasion === occasion.id
                  ? 'border-rose-500 bg-rose-50 shadow-md'
                  : 'border-gray-200 hover:border-rose-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{occasion.emoji}</div>
              <div className="text-sm font-medium text-gray-900">
                {occasion.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={generateLooks}
          disabled={loading || !selectedOccasion || !canGenerateLooks()}
          size="lg"
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-lg px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando looks mágicos...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Gerar Looks Personalizados
            </>
          )}
        </Button>
      </div>

      {/* Generated Looks */}
      {looks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-lg">
              ✨ Seus Looks Perfeitos
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={generateLooks}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novos
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {looks.map((look, index) => (
              <Card key={index} className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 p-4">
                  <h4 className="text-white font-bold text-lg">{look.name}</h4>
                </div>
                
                {/* Virtual Try-On Section */}
                <div className="px-4 pt-4">
                  {tryOnImages[index] ? (
                    <div className="relative rounded-xl overflow-hidden mb-3">
                      <img 
                        src={tryOnImages[index]} 
                        alt={`Look: ${look.name}`}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => generateTryOn(look, index)}
                          disabled={generatingTryOn[index]}
                          className="text-xs bg-white/90 hover:bg-white"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Gerar novamente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 mb-3"
                      onClick={() => generateTryOn(look, index)}
                      disabled={generatingTryOn[index]}
                    >
                      {generatingTryOn[index] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando visualização...
                        </>
                      ) : (
                        <>
                          {client.profile_photo ? (
                            <>
                              <User className="w-4 h-4 mr-2" />
                              Ver look em mim 🪄
                            </>
                          ) : (
                            <>
                              <Image className="w-4 h-4 mr-2" />
                              Ver visualização do look
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <CardContent className="p-4 space-y-4">
                  <p className="text-sm text-gray-600">{look.description}</p>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                      Peças:
                    </h5>
                    <div className="space-y-2">
                      {look.pieces.map((piece, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: piece.color }}
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-700">
                              {piece.item}
                            </span>
                            {piece.from_wardrobe && (
                              <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                                Guarda-roupa
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {look.shoes && (
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <h5 className="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-1">
                        👠 Sapatos
                      </h5>
                      <p className="text-sm text-amber-800">
                        <strong>{look.shoes.type}</strong> - {look.shoes.color}
                        {look.shoes.heel_height && ` (${look.shoes.heel_height})`}
                      </p>
                    </div>
                  )}

                  {look.accessories && look.accessories.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                        💎 Acessórios:
                      </h5>
                      <div className="space-y-1">
                        {look.accessories.map((acc, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            <strong>{acc.item}:</strong> {acc.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-1 text-sm">
                      💡 Dica de Styling
                    </h5>
                    <p className="text-xs text-purple-800">{look.styling_tips}</p>
                  </div>

                  {look.body_type_tips && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-1 text-sm">
                        👗 Para Seu Tipo de Corpo
                      </h5>
                      <p className="text-xs text-blue-800">{look.body_type_tips}</p>
                    </div>
                  )}

                  <div className="bg-rose-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-rose-900 mb-1 text-sm">
                      ✨ Por que funciona
                    </h5>
                    <p className="text-xs text-rose-800">{look.why_works}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {looks.length > 0 && (
        <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-rose-500" />
            <h3 className="font-bold text-gray-900 mb-2">
              {subscription?.plan === 'vip' ? 'Adorou seus looks?' : 'Quer looks ilimitados?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {subscription?.plan === 'vip' 
                ? 'Você tem acesso ilimitado! Continue explorando seu estilo.' 
                : 'Faça upgrade para o plano VIP e tenha sugestões ilimitadas!'}
            </p>
            <div className="flex gap-2 justify-center">
              {subscription?.plan !== 'vip' && (
                <Button className="bg-gradient-to-r from-amber-400 to-rose-500">
                  Fazer Upgrade
                </Button>
              )}
              <Button variant="outline" onClick={generateLooks} disabled={!canGenerateLooks()}>
                Gerar Novos Looks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}