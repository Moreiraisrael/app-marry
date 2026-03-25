import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookMarked, Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const topicSuggestions = [
  'Como combinar cores para sua estação',
  'Dicas para seu tipo de corpo',
  'Looks para o dia a dia',
  'Tendências que funcionam com seu estilo',
  'Acessórios essenciais',
  'Cores que valorizam sua pele',
  'Silhuetas ideais para você'
];

export default function MiniEbookGenerator({ clientId, styleQuiz, colorAnalysis, bodyType }) {
  const [topic, setTopic] = useState('');
  const [miniEbook, setMiniEbook] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (selectedTopic = topic) => {
    if (!selectedTopic.trim()) {
      toast.error('Digite um tema para o mini-ebook');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateMiniEbook', {
        clientId,
        styleQuiz,
        colorAnalysis,
        bodyType,
        topic: selectedTopic
      });
      setMiniEbook(data.mini_ebook);
      toast.success('Mini-ebook gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar mini-ebook');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `${miniEbook.title}\n${miniEbook.subtitle}\n\n${miniEbook.introduction}\n\n${miniEbook.sections.map(s => `${s.title}\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    toast.success('Mini-ebook copiado!');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
            Gerar Mini-Ebook Personalizado
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">Crie um guia customizado baseado em seu perfil</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Digite um tema ou escolha uma sugestão abaixo..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              className="text-base"
            />
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Temas sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(sug);
                    setTimeout(() => handleGenerate(sug), 100);
                  }}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Mini-Ebook'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mini Ebook Display */}
      {miniEbook && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-2">{miniEbook.title}</h1>
              <p className="text-lg opacity-90">{miniEbook.subtitle}</p>
              <div className="mt-4 flex gap-3">
                <Badge className="bg-white/20 border border-white/30">{topic}</Badge>
                <Badge className="bg-white/20 border border-white/30">
                  {miniEbook.personalization_level}% personalizado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Introduction */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed text-lg italic">
                {miniEbook.introduction}
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          {miniEbook.sections && miniEbook.sections.map((section, idx) => (
            <Card key={idx} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  <span className="inline-block w-8 h-8 rounded-full bg-purple-600 text-white text-center text-sm mr-3">
                    {section.section_number}
                  </span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{section.content}</p>

                {section.tips_for_her && (
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm font-semibold text-yellow-900 mb-1">💡 Para você especificamente:</p>
                    <p className="text-sm text-yellow-800">{section.tips_for_her}</p>
                  </div>
                )}

                {section.examples && section.examples.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Exemplos práticos:</p>
                    <ul className="space-y-1">
                      {section.examples.map((ex, eidx) => (
                        <li key={eidx} className="text-sm text-purple-800">• {ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Quick Wins */}
          {miniEbook.quick_wins && miniEbook.quick_wins.length > 0 && (
            <Card className="border-0 shadow-lg bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">⚡ Vitórias Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {miniEbook.quick_wins.map((win, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-green-800">
                      <span className="text-lg">✓</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Checklist */}
          {miniEbook.practical_checklist && miniEbook.practical_checklist.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">✓ Checklist Prático</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {miniEbook.practical_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 cursor-pointer"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Conclusion */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <p className="text-gray-900 leading-relaxed font-medium">
                {miniEbook.conclusion}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-1 border-purple-300 text-purple-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button
              onClick={() => {
                const text = `${miniEbook.title}\n${miniEbook.subtitle}\n\n${miniEbook.introduction}\n\n${miniEbook.sections.map(s => `${s.title}\n${s.content}`).join('\n\n')}`;
                const blob = new Blob([text], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${miniEbook.title}.txt`;
                a.click();
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}