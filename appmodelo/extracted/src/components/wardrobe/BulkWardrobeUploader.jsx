import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkWardrobeUploader({ clientId, clientSeason, onComplete }) {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);

  const handleFilesSelected = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setResults([]);
  };

  const analyzeAndUploadItems = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload file
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = uploaded.file_url;

        // AI Analysis
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analise esta peça de roupa e forneça informações detalhadas.

IMPORTANTE: Responda em português brasileiro.

Forneça:
1. Categoria (escolha uma): blusa, camisa, vestido, calca, saia, jaqueta, casaco, sapato, acessorio, bolsa, outros
2. Subcategoria específica (ex: "blusa manga longa", "vestido midi", "calça jeans")
3. Cor principal
4. Cores secundárias (se houver)
5. Estilo/vibe (ex: casual, formal, esportivo, elegante)
6. Material aparente (ex: algodão, seda, jeans, couro)
7. Padrão/estampa (se houver)
8. Descrição e dicas de uso`,
          file_urls: [fileUrl],
          response_json_schema: {
            type: "object",
            properties: {
              category: { type: "string" },
              subcategory: { type: "string" },
              primary_color: { type: "string" },
              secondary_colors: { type: "array", items: { type: "string" } },
              style_vibe: { type: "string" },
              material: { type: "string" },
              pattern: { type: "string" },
              description: { type: "string" },
              styling_tips: { type: "string" }
            }
          }
        });

        // Create wardrobe item
        await base44.entities.WardrobeItem.create({
          client_id: clientId,
          photo: fileUrl,
          category: analysis.category || 'outros',
          subcategory: analysis.subcategory,
          color: analysis.primary_color,
          notes: `Material: ${analysis.material || 'N/A'}\nEstilo: ${analysis.style_vibe || 'N/A'}\nPadrão: ${analysis.pattern || 'Liso'}`,
          ai_analysis: `${analysis.description}\n\n💡 Dicas: ${analysis.styling_tips}`,
          status: 'keep',
          season_match: true // Could be enhanced with season matching logic
        });

        uploadResults.push({
          filename: file.name,
          status: 'success',
          analysis: analysis
        });

      } catch (error) {
        console.error(error);
        uploadResults.push({
          filename: file.name,
          status: 'error',
          error: error.message
        });
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResults(uploadResults);
    setProcessing(false);
    
    const successCount = uploadResults.filter(r => r.status === 'success').length;
    toast.success(`${successCount} de ${files.length} peças adicionadas com sucesso!`);
    
    if (onComplete) onComplete();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Upload em Massa com IA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Adicione múltiplas fotos e a IA irá categorizar automaticamente
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        {!processing && results.length === 0 && (
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
              id="bulk-upload"
            />
            <label htmlFor="bulk-upload">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                <Upload className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <p className="text-lg font-medium mb-2">
                  Clique ou arraste fotos aqui
                </p>
                <p className="text-sm text-gray-500">
                  Selecione múltiplas imagens do guarda-roupa
                </p>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">
                  {files.length} foto(s) selecionada(s)
                </p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {files.slice(0, 8).map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {files.length > 8 && (
                    <div className="aspect-square rounded-lg border bg-gray-100 flex items-center justify-center">
                      <p className="text-sm text-gray-600">+{files.length - 8}</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={analyzeAndUploadItems}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar e Adicionar {files.length} Peça(s)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
            <p className="text-lg font-medium mb-2">Processando com IA...</p>
            <p className="text-sm text-gray-600 mb-4">
              Analisando categorias, cores, estilos e gerando dicas
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-sm text-gray-500">{progress}% concluído</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !processing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Resultados</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiles([]);
                  setResults([]);
                  setProgress(0);
                }}
              >
                Fazer Novo Upload
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.status === 'success' ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.filename}</p>
                        {result.status === 'success' && result.analysis && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {result.analysis.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.analysis.primary_color}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.analysis.style_vibe}
                            </Badge>
                          </div>
                        )}
                        {result.status === 'error' && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}