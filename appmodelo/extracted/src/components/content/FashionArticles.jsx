import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FashionArticles({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz
}) {
  const [articles, setArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generatePersonalizedContent', {
          clientId,
          clientData,
          wardrobeItems,
          colorAnalysis,
          styleQuiz,
          contentType: 'articles'
        });
        setArticles(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar artigos');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadArticles();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Gerando artigos personalizados para você...</p>
        </CardContent>
      </Card>
    );
  }

  if (!articles?.articles || articles.articles.length === 0) return null;

  return (
    <div className="space-y-6">
      {articles.articles.map((article, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <Badge variant="outline" className="capitalize">
                      {article.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ⏱️ {article.reading_time || '5'} min
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-1">{article.title}</CardTitle>
                  {article.subtitle && (
                    <p className="text-sm text-gray-600 italic">{article.subtitle}</p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Main Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>

              {/* Key Tips */}
              {article.key_tips?.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💡</span> Dicas Principais
                  </p>
                  <ul className="space-y-2">
                    {article.key_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-purple-600 flex-shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSavedArticles([...savedArticles, idx]);
                    toast.success('Artigo salvo!');
                  }}
                  disabled={savedArticles.includes(idx)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {savedArticles.includes(idx) ? 'Salvo' : 'Salvar'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}