import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Ruler, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FitAnalyzer({ item, clientData }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeFit = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are a professional fashion fit consultant. Analyze how this clothing item would fit on the client:

**Clothing Item:**
- Category: ${item.category}
- Subcategory: ${item.subcategory || 'not specified'}
- Color: ${item.color || 'not specified'}

**Client Measurements:**
- Height: ${clientData?.height || 165}cm
- Body Type: ${clientData?.body_type || 'balanced'}
- Bust: ${clientData?.bust || 90}cm
- Waist: ${clientData?.waist || 70}cm
- Hip: ${clientData?.hip || 95}cm
- Shoulder Width: ${clientData?.shoulder_width || 40}cm

Provide a detailed fit analysis including:
1. Overall fit prediction (excellent/good/fair/poor)
2. Specific fit for different body areas
3. Potential fit issues and how to address them
4. Styling recommendations to optimize the fit
5. Overall fit score (0-100)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [item.photo],
        response_json_schema: {
          type: "object",
          properties: {
            overall_fit: { 
              type: "string",
              enum: ["excellent", "good", "fair", "poor"]
            },
            fit_score: { type: "number" },
            body_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  fit_level: { type: "string" },
                  notes: { type: "string" }
                }
              }
            },
            potential_issues: { type: "array", items: { type: "string" } },
            solutions: { type: "array", items: { type: "string" } },
            styling_tips: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          }
        }
      });

      setAnalysis(result);
      toast.success('Análise de caimento concluída!');
    } catch (error) {
      toast.error('Erro ao analisar caimento');
    } finally {
      setAnalyzing(false);
    }
  };

  const fitColors = {
    excellent: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    good: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    fair: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    poor: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-indigo-600" />
          Análise de Caimento com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!analysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <Ruler className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 mb-4">
              Analise como esta peça cairia no corpo da cliente usando IA
            </p>
            <Button
              onClick={analyzeFit}
              disabled={analyzing}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar Caimento
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Overall Fit */}
            <div className={`p-4 rounded-lg border-2 ${fitColors[analysis.overall_fit].bg} ${fitColors[analysis.overall_fit].border}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Caimento Geral</h4>
                <Badge className={fitColors[analysis.overall_fit].text}>
                  {analysis.overall_fit === 'excellent' ? 'Excelente' :
                   analysis.overall_fit === 'good' ? 'Bom' :
                   analysis.overall_fit === 'fair' ? 'Regular' : 'Ruim'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={analysis.fit_score} className="flex-1" />
                <span className="font-bold text-lg">{analysis.fit_score}%</span>
              </div>
            </div>

            {/* Body Areas Fit */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Caimento por Área</h4>
              <div className="space-y-2">
                {analysis.body_areas?.map((area, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{area.area}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        area.fit_level === 'perfect' ? 'bg-green-100 text-green-700' :
                        area.fit_level === 'good' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {area.fit_level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{area.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Solutions */}
            {analysis.potential_issues?.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Possíveis Problemas de Caimento
                </h4>
                <ul className="space-y-1 mb-3">
                  {analysis.potential_issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-gray-700">• {issue}</li>
                  ))}
                </ul>
                <h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Soluções
                </h5>
                <ul className="space-y-1">
                  {analysis.solutions?.map((solution, idx) => (
                    <li key={idx} className="text-sm text-gray-700">✓ {solution}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Styling Tips */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                💡 Dicas de Styling
              </h4>
              <ul className="space-y-1">
                {analysis.styling_tips?.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">
                Recomendação Final
              </h4>
              <p className="text-sm text-gray-700">{analysis.recommendation}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => setAnalysis(null)}
              className="w-full"
            >
              Nova Análise
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}