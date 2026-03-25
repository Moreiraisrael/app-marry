import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, Eye, Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function OutfitVisualizer({ wardrobeItems, clientData, onSaveOutfit }) {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [outfitSuggestions, setOutfitSuggestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [visualizing, setVisualizing] = useState(false);
  const [visualizationResult, setVisualizationResult] = useState(null);

  const occasions = [
    { value: 'trabalho', label: 'Trabalho/Professional' },
    { value: 'casual', label: 'Casual Diário' },
    { value: 'formal', label: 'Evento Formal' },
    { value: 'weekend', label: 'Final de Semana' },
    { value: 'date', label: 'Encontro Romântico' },
    { value: 'esporte', label: 'Atividade Física' },
  ];

  const generateOutfits = async () => {
    if (!selectedOccasion) {
      toast.error('Selecione uma ocasião');
      return;
    }

    setGenerating(true);
    try {
      const itemsByCategory = wardrobeItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({
          category: item.category,
          color: item.color,
          subcategory: item.subcategory,
          id: item.id
        });
        return acc;
      }, {});

      const prompt = `You are a professional stylist. Create 4 complete outfit combinations for "${selectedOccasion}" occasion using ONLY items from this wardrobe:

Available items:
${Object.entries(itemsByCategory).map(([cat, items]) => 
  `${cat}: ${items.map(i => `${i.color || 'neutral'} ${i.subcategory || cat}`).join(', ')}`
).join('\n')}

Client profile:
- Body type: ${clientData?.body_type || 'balanced'}
- Color season: ${clientData?.season || 'universal'}

For each outfit:
- Select 3-5 items that work together
- Explain why this combination works
- Give styling tips
- Rate the outfit appropriateness for the occasion (1-10)

IMPORTANT: Only use items that actually exist in the wardrobe above.`;

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
                  name: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  },
                  why_works: { type: "string" },
                  styling_tips: { type: "string" },
                  occasion_rating: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Match suggested items with actual wardrobe items
      const outfitsWithIds = result.outfits.map(outfit => ({
        ...outfit,
        wardrobeItems: outfit.items.map(suggItem => {
          const matches = wardrobeItems.filter(w => 
            w.category === suggItem.category && 
            (!suggItem.description || 
             w.color?.toLowerCase().includes(suggItem.description.toLowerCase()) ||
             w.subcategory?.toLowerCase().includes(suggItem.description.toLowerCase()))
          );
          return matches[0] || null;
        }).filter(Boolean)
      }));

      setOutfitSuggestions(outfitsWithIds);
    } catch (error) {
      toast.error('Erro ao gerar looks');
    } finally {
      setGenerating(false);
    }
  };

  const visualizeOutfit = async (outfit) => {
    setSelectedOutfit(outfit);
    setVisualizing(true);
    
    try {
      // Create a visual representation of the outfit on the client's avatar
      const itemDescriptions = outfit.wardrobeItems.map(item => 
        `${item.color || ''} ${item.subcategory || item.category}`
      ).join(', ');

      const prompt = `Create a professional fashion illustration showing a complete outfit on a 3D avatar:

Avatar characteristics:
- Height: ${clientData?.height || 165}cm
- Body type: ${clientData?.body_type || 'balanced'}
- Measurements: Bust ${clientData?.bust}cm, Waist ${clientData?.waist}cm, Hip ${clientData?.hip}cm

Outfit pieces: ${itemDescriptions}

Create a full-body fashion editorial image showing this complete outfit styled professionally. 
Clean background, good lighting, fashion catalog quality.`;

      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setVisualizationResult(url);
      toast.success('Look visualizado!');
    } catch (error) {
      toast.error('Erro ao visualizar look');
    } finally {
      setVisualizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-violet-600" />
            Visualizador de Looks Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione a ocasião" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map(occ => (
                  <SelectItem key={occ.value} value={occ.value}>
                    {occ.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={generateOutfits}
              disabled={!selectedOccasion || generating}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Looks
                </>
              )}
            </Button>
          </div>

          {/* Outfit Suggestions */}
          {outfitSuggestions.length > 0 && (
            <div className="space-y-4">
              {outfitSuggestions.map((outfit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-lg border border-violet-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{outfit.name}</h4>
                      <Badge className="mt-1">
                        Nota: {outfit.occasion_rating}/10
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => visualizeOutfit(outfit)}
                      disabled={visualizing}
                      className="bg-violet-600"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>

                  {/* Outfit Items */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                    {outfit.wardrobeItems?.map((item, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={item.photo} 
                          alt={item.category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="bg-violet-50 p-3 rounded">
                      <strong className="text-violet-900">Por que funciona:</strong>
                      <p className="text-gray-700 mt-1">{outfit.why_works}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <strong className="text-purple-900">Dicas de styling:</strong>
                      <p className="text-gray-700 mt-1">{outfit.styling_tips}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Visualization Result */}
          {visualizationResult && selectedOutfit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-4 rounded-lg border-2 border-violet-300"
            >
              <h4 className="font-semibold mb-3">{selectedOutfit.name} - Visualização</h4>
              <img 
                src={visualizationResult} 
                alt="Outfit visualization"
                className="w-full rounded-lg mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => onSaveOutfit?.({
                    name: selectedOutfit.name,
                    items: selectedOutfit.wardrobeItems,
                    image: visualizationResult,
                    occasion: selectedOccasion
                  })}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Look
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setVisualizationResult(null)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}