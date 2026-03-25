import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function StyleGuides({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz
}) {
  const [guides, setGuides] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGuide, setExpandedGuide] = useState(0);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true);
        const result = await base44.functions.invoke('generatePersonalizedContent', {
          clientId,
          clientData,
          wardrobeItems,
          colorAnalysis,
          styleQuiz,
          contentType: 'guides'
        });
        setGuides(result.data);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao gerar guias');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && clientData) {
      loadGuides();
    }
  }, [clientId, clientData]);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Gerando guias personalizados para você...</p>
        </CardContent>
      </Card>
    );
  }

  if (!guides?.guides || guides.guides.length === 0) return null;

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-4">
      {guides.guides.map((guide, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setExpandedGuide(expandedGuide === idx ? -1 : idx)}
          >
            <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <Badge className={difficultyColor[guide.difficulty]}>
                      {guide.difficulty === 'beginner' && '🌱 Iniciante'}
                      {guide.difficulty === 'intermediate' && '📈 Intermediário'}
                      {guide.difficulty === 'advanced' && '🎯 Avançado'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedGuide === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </CardHeader>

            <AnimatePresence>
              {expandedGuide === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="space-y-6 pt-6">
                    {guide.sections?.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.heading}
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </p>

                        {section.tips?.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                            {section.tips.map((tip, tIdx) => (
                              <div key={tIdx} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-blue-600 flex-shrink-0">✓</span>
                                {tip}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {guide.target_outcome && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-900 mb-1">🎯 Resultado Esperado</p>
                        <p className="text-sm text-green-800">{guide.target_outcome}</p>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}