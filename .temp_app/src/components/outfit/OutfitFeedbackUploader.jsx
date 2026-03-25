import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Image, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function OutfitFeedbackUploader({ clientId, clientData, wardrobeItems, colorAnalysis, styleQuiz }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 5MB)');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Selecione uma foto do outfit');
      return;
    }

    setAnalyzing(true);
    try {
      // Upload file
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });

      // Get feedback from AI
      const { data } = await base44.functions.invoke('generateStyleAdvice', {
        clientId,
        clientData,
        wardrobeItems: wardrobeItems || [],
        colorAnalysis,
        styleQuiz,
        request_type: 'outfit_feedback',
        outfit_photo_url: uploadedFile.file_url,
        outfit_description: description
      });

      setFeedback(data);
      toast.success('Análise concluída!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao analisar outfit');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border border-amber-500/20 shadow-2xl bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <Image className="w-5 h-5 text-amber-400" />
            Enviar Foto do Outfit
          </CardTitle>
          <p className="text-sm text-neutral-400 mt-2">Tire uma foto ou envie uma existente para receber feedback Style</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-amber-500/30 bg-neutral-900 rounded-lg p-8 text-center hover:border-amber-500/60 transition-colors cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg ring-2 ring-amber-500/30" />
                <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700" onClick={() => document.getElementById('fileInput')?.click()}>
                  Trocar Foto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-amber-400 mx-auto" />
                <div>
                  <p className="font-semibold text-neutral-100">Clique para enviar ou arraste uma foto</p>
                  <p className="text-sm text-neutral-500">PNG, JPG até 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-base font-semibold text-neutral-200 block mb-3">
              Descreva o outfit (opcional)
            </label>
            <Textarea
              placeholder="Ex: Calça jeans azul claro com camiseta branca e tênis... O que você acha? Está bom para trabalho?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 bg-neutral-900 border-neutral-700 text-neutral-200 placeholder:text-neutral-600"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !file}
            className="w-full h-12 text-base bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-amber-500/20"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Obter Feedback Style
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback Display */}
      {feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Overall Assessment */}
          {feedback.outfit_analysis && (
            <Card className="border border-amber-500/20 shadow-lg bg-black">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-neutral-100">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Análise do Look
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-300 leading-relaxed">{feedback.outfit_analysis}</p>
              </CardContent>
            </Card>
          )}

          {/* What Works */}
          {feedback.what_works && feedback.what_works.length > 0 && (
            <Card className="border border-green-500/30 shadow-lg bg-green-500/5 border-l-4">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  O Que Funciona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.what_works.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-green-300">
                      <span className="text-xl">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          {feedback.opportunities && feedback.opportunities.length > 0 && (
            <Card className="border border-yellow-500/30 shadow-lg bg-yellow-500/5 border-l-4">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Oportunidades de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.opportunities.map((opp, idx) => (
                    <li key={idx} className="flex gap-3 text-yellow-300">
                      <span className="font-bold">{idx + 1}.</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Practical Suggestions */}
          {feedback.practical_suggestions && feedback.practical_suggestions.length > 0 && (
            <Card className="border border-amber-500/20 shadow-lg bg-black">
              <CardHeader>
                <CardTitle className="text-lg text-neutral-100">💡 Sugestões Práticas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.practical_suggestions.map((sug, idx) => (
                    <li key={idx} className="flex gap-3 text-neutral-300">
                      <span className="font-bold text-amber-400 min-w-6">{idx + 1}.</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alternative Combos */}
          {feedback.alternative_combos && feedback.alternative_combos.length > 0 && (
            <Card className="border border-blue-500/30 shadow-lg bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">🔄 Combos Alternativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-400 mb-3">Outras formas de usar essas mesmas peças:</p>
                <ul className="space-y-2">
                  {feedback.alternative_combos.map((combo, idx) => (
                    <li key={idx} className="text-blue-300">• {combo}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {feedback.rating && (
            <Card className="border border-amber-500/30 shadow-lg bg-gradient-to-r from-red-500/10 to-amber-500/10">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-2">Avaliação do Look</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">{feedback.rating}</div>
                  <div className="flex justify-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-2xl ${i < parseInt(feedback.rating) ? '⭐' : '☆'}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Encouraging Note */}
          {feedback.encouraging_note && (
            <Card className="border border-amber-500/30 shadow-lg bg-gradient-to-r from-amber-500/10 to-red-500/10 border-l-4">
              <CardContent className="p-6">
                <p className="text-neutral-200 italic text-lg">{feedback.encouraging_note}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setDescription('');
                setFeedback(null);
              }}
              variant="outline"
              className="flex-1 bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            >
              Analisar Outro Outfit
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-amber-500/20">
              Salvar Feedback
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}