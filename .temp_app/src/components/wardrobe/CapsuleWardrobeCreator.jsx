import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Package, Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CapsuleWardrobeCreator({ capsules, wardrobeItems }) {
  const [copiedId, setCopiedId] = useState(null);

  const getCapsuleItemDetails = (itemNames) => {
    return itemNames.map(name => {
      const foundItem = wardrobeItems?.find(item =>
        `${item.category}_${item.color}`.toLowerCase() === name.toLowerCase() ||
        item.subcategory?.toLowerCase().includes(name.toLowerCase()) ||
        item.color?.toLowerCase().includes(name.toLowerCase())
      );
      return { name, found: !!foundItem, item: foundItem };
    });
  };

  const handleCopyItems = (capsule) => {
    const itemsList = capsule.items.join('\n');
    navigator.clipboard.writeText(itemsList);
    setCopiedId(capsule.id);
    toast.success('Peças copiadas!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!capsules || capsules.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nenhuma cápsula gerada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Mini-Coleções Criadas com IA
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Coleções temáticas baseadas nos seus itens atuais. Maximize a versatilidade!
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {capsules.map((capsule, idx) => (
          <motion.div
            key={capsule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{capsule.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{capsule.theme}</p>
                  </div>
                  <Badge className="bg-green-600 text-white flex-shrink-0">
                    {capsule.items.length} peças
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {capsule.description}
                </p>

                {/* Items Preview */}
                <div>
                  <p className="font-medium text-gray-900 mb-2 text-sm">Peças da Cápsula:</p>
                  <div className="space-y-2">
                    {getCapsuleItemDetails(capsule.items).map((detail, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          detail.found
                            ? 'bg-green-50 text-green-900'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          detail.found
                            ? 'bg-green-600'
                            : 'border border-gray-300'
                        }`}>
                          {detail.found && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="flex-1">{detail.name}</span>
                        {detail.found && detail.item?.photo && (
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            <img src={detail.item.photo} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                {capsule.occasions?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2 text-sm">🎭 Ocasiões:</p>
                    <div className="flex flex-wrap gap-1">
                      {capsule.occasions.map((occ, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {occ}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {capsule.key_features?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2 text-sm">⭐ Destaque:</p>
                    <ul className="space-y-1">
                      {capsule.key_features.slice(0, 2).map((feature, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="text-green-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <Button
                  onClick={() => handleCopyItems(capsule)}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  {copiedId === capsule.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Peças
                    </>
                  )}
                </Button>

                {/* Styling Tips */}
                {capsule.styling_tips && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-900 mb-1">💡 Dica:</p>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {capsule.styling_tips}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: capsules.length * 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Share2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Como usar as cápsulas:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use cada cápsula como base para criar looks completos</li>
                  <li>• Misture peças entre cápsulas para maior versatilidade</li>
                  <li>• Complemente com as peças recomendadas para expandir as opções</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}