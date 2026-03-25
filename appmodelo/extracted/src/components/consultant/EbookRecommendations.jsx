import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Gift, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EbookRecommendations({ clientId }) {
  const [selectedEbooks, setSelectedEbooks] = useState([]);
  const queryClient = useQueryClient();

  const { data: ebooks = [] } = useQuery({
    queryKey: ['ebooks'],
    queryFn: () => base44.entities.Ebook.filter({ is_active: true })
  });

  const { data: existingRecs = [] } = useQuery({
    queryKey: ['existing-recommendations', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return await base44.entities.EbookRecommendation.filter({ 
        client_id: clientId,
        status: 'active'
      });
    },
    enabled: !!clientId
  });

  const recommendMutation = useMutation({
    mutationFn: async (ebookIds) => {
      const consultant = await base44.auth.me();
      
      const recommendations = ebookIds.map(ebookId => ({
        consultant_id: consultant.email,
        client_id: clientId,
        ebook_id: ebookId,
        recommendation_date: new Date().toISOString(),
        commission_rate: 5,
        status: 'active'
      }));

      await base44.entities.EbookRecommendation.bulkCreate(recommendations);
    },
    onSuccess: () => {
      toast.success('E-books recomendados com sucesso!');
      setSelectedEbooks([]);
      queryClient.invalidateQueries({ queryKey: ['existing-recommendations', clientId] });
    },
    onError: () => {
      toast.error('Erro ao recomendar e-books');
    }
  });

  const handleToggle = (ebookId) => {
    setSelectedEbooks(prev =>
      prev.includes(ebookId)
        ? prev.filter(id => id !== ebookId)
        : [...prev, ebookId]
    );
  };

  const handleRecommend = () => {
    if (selectedEbooks.length === 0) {
      toast.error('Selecione pelo menos um e-book');
      return;
    }
    recommendMutation.mutate(selectedEbooks);
  };

  const recommendedIds = existingRecs.map(r => r.ebook_id);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          Recomendar E-books
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Selecione e-books para recomendar à cliente (comissão de 5% por venda)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ebooks.map((ebook) => {
            const isRecommended = recommendedIds.includes(ebook.id);
            const isSelected = selectedEbooks.includes(ebook.id);

            return (
              <motion.div
                key={ebook.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Checkbox
                  id={`ebook-${ebook.id}`}
                  checked={isSelected || isRecommended}
                  disabled={isRecommended}
                  onCheckedChange={() => handleToggle(ebook.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`ebook-${ebook.id}`}
                    className="font-semibold text-gray-900 cursor-pointer block"
                  >
                    {ebook.title}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">{ebook.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {ebook.category}
                    </Badge>
                    <span className="text-sm font-medium text-amber-600">
                      R$ {ebook.price.toFixed(2)}
                    </span>
                    {isRecommended && (
                      <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                        <Check className="w-3 h-3" />
                        Já recomendado
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedEbooks.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-900 mb-3">
              {selectedEbooks.length} e-book{selectedEbooks.length > 1 ? 's' : ''} selecionado{selectedEbooks.length > 1 ? 's' : ''}
            </p>
            <Button
              onClick={handleRecommend}
              disabled={recommendMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {recommendMutation.isPending ? 'Recomendando...' : 'Recomendar E-books'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}