import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function ContextualEbookSuggestions({ season, style, occasion, clientId }) {
  const { data: allEbooks = [], isLoading } = useQuery({
    queryKey: ['ebooks-contextual'],
    queryFn: () => base44.entities.Ebook.filter({ is_active: true })
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['ebook-recommendations', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return await base44.entities.EbookRecommendation.filter({ 
        client_id: clientId,
        status: 'active'
      });
    },
    enabled: !!clientId
  });

  // AI-based contextual filtering
  const getContextualEbooks = () => {
    const recommendedIds = recommendations.map(r => r.ebook_id);
    const recommendedEbooks = allEbooks.filter(e => recommendedIds.includes(e.id));
    
    // Score e-books based on context
    const scored = allEbooks.map(ebook => {
      let score = 0;
      const title = ebook.title.toLowerCase();
      const description = (ebook.description || '').toLowerCase();
      const content = title + ' ' + description;

      // Season match
      if (season) {
        const seasonName = seasonLabels[season]?.toLowerCase() || '';
        if (content.includes(seasonName) || content.includes(season)) score += 50;
        
        // Check for season family
        if (season?.includes('primavera') && content.includes('primavera')) score += 30;
        if (season?.includes('verao') && content.includes('verão')) score += 30;
        if (season?.includes('outono') && content.includes('outono')) score += 30;
        if (season?.includes('inverno') && content.includes('inverno')) score += 30;
      }

      // Style match
      if (style && content.includes(style.toLowerCase())) score += 40;

      // Occasion match
      if (occasion) {
        const occasionLower = occasion.toLowerCase();
        if (occasionLower.includes('casamento') && (content.includes('casamento') || content.includes('festa'))) score += 60;
        if (occasionLower.includes('trabalho') && (content.includes('trabalho') || content.includes('profissional'))) score += 60;
        if (occasionLower.includes('entrevista') && content.includes('entrevista')) score += 60;
        if (occasionLower.includes('festa') && content.includes('festa')) score += 60;
        if (occasionLower.includes('casual') && content.includes('casual')) score += 60;
        if (occasionLower.includes('jantar') && (content.includes('jantar') || content.includes('noite'))) score += 60;
      }

      // Boost recommended e-books
      if (recommendedIds.includes(ebook.id)) score += 100;

      // Category relevance
      if (ebook.category === 'coloracao' && season) score += 20;
      if (ebook.category === 'estilo' && style) score += 20;

      return { ...ebook, relevanceScore: score };
    });

    // Filter and sort by relevance
    return scored
      .filter(e => e.relevanceScore > 20)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  };

  if (isLoading) {
    return null;
  }

  const contextualEbooks = getContextualEbooks();

  if (contextualEbooks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <BookOpen className="w-5 h-5" />
            E-books Recomendados para Você
          </CardTitle>
          <p className="text-sm text-amber-700">
            Baseado em {season && `sua estação (${seasonLabels[season]})`}
            {season && style && ', '}
            {style && `seu estilo (${style})`}
            {(season || style) && occasion && ' e '}
            {occasion && `esta ocasião`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {contextualEbooks.map((ebook, idx) => (
            <motion.div
              key={ebook.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                {ebook.cover_image && (
                  <img
                    src={ebook.cover_image}
                    alt={ebook.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ebook.title}</h4>
                      {recommendations.some(r => r.ebook_id === ebook.id) && (
                        <Badge className="mt-1 bg-amber-500 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recomendado pela consultora
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold text-amber-600">
                      R$ {ebook.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ebook.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Why it's relevant */}
              <div className="mt-3 pt-3 border-t border-amber-100">
                <p className="text-xs text-amber-700">
                  <strong>Por que recomendamos:</strong> Este e-book é perfeito para complementar {
                    occasion ? `looks de ${occasion}` : 'seu estilo'
                  } {season && `com dicas específicas para ${seasonLabels[season]}`}.
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}