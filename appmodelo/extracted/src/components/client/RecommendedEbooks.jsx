import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Gift, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendedEbooks({ clientId }) {
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommended-ebooks', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return await base44.entities.EbookRecommendation.filter({ 
        client_id: clientId,
        status: 'active'
      }, '-recommendation_date');
    },
    enabled: !!clientId
  });

  const { data: ebooks = [] } = useQuery({
    queryKey: ['ebooks'],
    queryFn: () => base44.entities.Ebook.filter({ is_active: true })
  });

  const recommendedEbooksList = recommendations.map(rec => {
    const ebook = ebooks.find(e => e.id === rec.ebook_id);
    return { ...ebook, recommendationId: rec.id };
  }).filter(e => e && e.id);

  const handlePurchase = async (ebook, recommendationId) => {
    setPurchaseLoading(ebook.id);
    try {
      // Registrar compra e comissão
      const commission = {
        consultant_id: (await base44.entities.EbookRecommendation.list()).find(r => r.id === recommendationId)?.consultant_id,
        ebook_id: ebook.id,
        client_id: clientId,
        recommendation_id: recommendationId,
        ebook_price: ebook.price,
        commission_amount: (ebook.price * 5) / 100,
        commission_rate: 5,
        purchase_date: new Date().toISOString(),
        status: 'pending'
      };

      await base44.entities.EbookCommission.create(commission);

      // Atualizar recomendação para "purchased"
      const rec = recommendations.find(r => r.id === recommendationId);
      if (rec) {
        await base44.entities.EbookRecommendation.update(recommendationId, { status: 'purchased' });
      }

      // Aqui você implementaria o fluxo de pagamento real com Stripe
      // Por enquanto, simular sucesso
      const a = document.createElement('a');
      a.href = ebook.file_url;
      a.download = `${ebook.title}.pdf`;
      a.click();

    } catch (error) {
      console.error('Erro ao processar compra:', error);
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (recommendedEbooksList.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          E-books Recomendados para Você
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Sua consultora selecionou especialmente esses e-books para complementar sua análise
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEbooksList.map((ebook) => (
            <motion.div
              key={ebook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow h-full flex flex-col">
                {ebook.cover_image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={ebook.cover_image} 
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{ebook.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 flex-1">{ebook.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-amber-100 text-amber-700">
                      {ebook.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                    <span className="text-2xl font-bold text-amber-600">
                      R$ {ebook.price.toFixed(2)}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => handlePurchase(ebook, ebook.recommendationId)}
                      disabled={purchaseLoading === ebook.id}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      {purchaseLoading === ebook.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Comprar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}