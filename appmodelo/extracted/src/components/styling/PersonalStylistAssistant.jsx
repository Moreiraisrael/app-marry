import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Sparkles, MessageCircle, Lightbulb, Cloud, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import StyleAdviceCard from './StyleAdviceCard';

const occasions = [
  'Trabalho',
  'Casual Diário',
  'Encontro/Passeio',
  'Festa/Evento Social',
  'Evento Formal',
  'Esporte/Atividade',
  'Fim de Semana',
  'Viagem'
];

const events = [
  'Casamento',
  'Coquetel',
  'Brunch',
  'Cine/Teatro',
  'Praia',
  'Montanha/Trilha',
  'Churrasco',
  'Happy Hour',
  'Entrevista de Emprego',
  'Apresentação/Palestra',
  'Encontro Romântico',
  'Reunião de Amigos'
];

const weatherConditions = [
  'Ensolarado',
  'Nublado',
  'Chuva',
  'Muito Frio',
  'Muito Quente',
  'Primavera',
  'Verão',
  'Outono',
  'Inverno',
  'Vento Forte'
];

export default function PersonalStylistAssistant({
  clientId,
  clientData,
  wardrobeItems,
  colorAnalysis,
  styleQuiz
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Olá! Sou sua assistente de estilo pessoal. Estou aqui para ajudá-la a:',
      suggestions: [
        '👗 Criar looks para ocasiões específicas',
        '💬 Dar feedback sobre seus outfits',
        '🛍️ Sugerir peças novas para seu guarda-roupa',
        '🎨 Combinar peças de formas criativas'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');
  const [requestType, setRequestType] = useState('outfit');
  const [loading, setLoading] = useState(false);
  const [showAdviceCard, setShowAdviceCard] = useState(null);
  const [outfitPhotoUrl, setOutfitPhotoUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      setOutfitPhotoUrl(uploaded.file_url);
      
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
      
      toast.success('Foto carregada! Agora você pode pedir feedback.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedOccasion && !outfitPhotoUrl && requestType !== 'outfit_feedback') return;

    let userContent = inputValue;
    if (requestType === 'outfit') {
      userContent = selectedEvent ? `Outfit para ${selectedEvent}${selectedWeather ? ` (${selectedWeather})` : ''}: ${inputValue || 'criar look'}` : inputValue || `Criar look para: ${selectedOccasion}`;
    } else if (requestType === 'outfit_feedback' && outfitPhotoUrl) {
      userContent = `Feedback do meu outfit: ${inputValue || 'O que você acha?'}`;
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userContent,
      photoUrl: requestType === 'outfit_feedback' ? outfitPhotoUrl : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedOccasion('');
    setSelectedEvent('');
    setSelectedWeather('');
    setOutfitPhotoUrl(null);
    setPhotoPreview(null);
    setLoading(true);

    try {
      const result = await base44.functions.invoke('generateStyleAdvice', {
        clientId,
        clientData,
        wardrobeItems,
        colorAnalysis,
        styleQuiz,
        request_type: requestType,
        occasion: selectedOccasion || undefined,
        event: selectedEvent || undefined,
        weather: selectedWeather || undefined,
        outfit_photo_url: requestType === 'outfit_feedback' ? outfitPhotoUrl : undefined,
        outfit_description: inputValue || undefined,
        preferences: inputValue || undefined,
        conversation_history: messages
          .filter(m => m.type !== 'assistant' || !m.suggestions)
          .map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
      });

      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: result.data.personal_note || result.data.encouraging_note || 'Aqui está minha sugestão:',
        advice: result.data,
        requestType
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowAdviceCard(result.data);
      toast.success('Conselho gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar conselho de estilo');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      {/* Chat Area */}
      <div className="md:col-span-2 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.photoUrl && (
                    <img src={message.photoUrl} alt="Outfit" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  {message.content && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}

                  {message.suggestions && (
                    <div className="space-y-2 mt-3">
                      {message.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setRequestType(
                              sug.includes('looks') ? 'outfit' :
                              sug.includes('feedback') ? 'outfit_feedback' :
                              sug.includes('peças') ? 'new_pieces' :
                              'combination'
                            );
                          }}
                          className="block w-full text-left text-xs p-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            {/* Request Type Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setRequestType('outfit')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  requestType === 'outfit'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👗 Criar Look
              </button>
              <button
                onClick={() => setRequestType('outfit_feedback')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  requestType === 'outfit_feedback'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📸 Feedback Outfit
              </button>
              <button
                onClick={() => setRequestType('new_pieces')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  requestType === 'new_pieces'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🛍️ Novas Peças
              </button>
              <button
                onClick={() => setRequestType('combination')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  requestType === 'combination'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎨 Combinações
              </button>
            </div>

            {/* Occasion/Event Selectors (for outfit requests) */}
            {requestType === 'outfit' && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-2">
                  <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Ocasião..." />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map(occ => (
                        <SelectItem key={occ} value={occ}>
                          {occ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Ou evento específico..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(evt => (
                        <SelectItem key={evt} value={evt}>
                          {evt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedOccasion || selectedEvent) && (
                  <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Qual é o clima?" />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherConditions.map(wea => (
                        <SelectItem key={wea} value={wea}>
                          {wea}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Photo Upload (for outfit feedback) */}
            {requestType === 'outfit_feedback' && (
              <div className="space-y-3">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Outfit preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        setOutfitPhotoUrl(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-purple-300 rounded-lg p-4 hover:bg-purple-50 transition-colors text-center"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-gray-700">Clique para fazer upload da sua foto</p>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                />
              </div>
            )}

            {/* Message Input */}
            {requestType === 'outfit_feedback' ? (
              <Textarea
                placeholder="Adicione suas observações sobre o outfit (opcional)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-sm resize-none h-20"
                disabled={!outfitPhotoUrl}
              />
            ) : requestType === 'new_pieces' ? (
              <Input
                placeholder="Ex: Preciso de peças para trabalho, algo versátil..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-sm"
              />
            ) : requestType === 'combination' ? (
              <Input
                placeholder="Deixe em branco ou adicione preferências específicas..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-sm"
              />
            ) : (
              <Input
                placeholder="Adicione mais detalhes sobre o que você quer..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-sm"
              />
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={loading || (!inputValue.trim() && !selectedOccasion && !selectedEvent && !outfitPhotoUrl)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advice Display Panel */}
      {showAdviceCard && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <StyleAdviceCard advice={showAdviceCard} requestType={requestType} />
        </motion.div>
      )}

      {/* Empty State */}
      {!showAdviceCard && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 text-sm mb-2">👗 Criar Look</p>
                <p className="text-xs text-gray-700">
                  Selecione uma ocasião e receba um look completo personalizado
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900 text-sm mb-2">📸 Feedback de Outfit</p>
                <p className="text-xs text-gray-700">
                  Envie uma foto do seu outfit para receber sugestões de melhoria
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900 text-sm mb-2">🌦️ Outfit + Clima</p>
                <p className="text-xs text-gray-700">
                  Selecione um evento e clima para outfit ideas personalizadas
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900 text-sm mb-2">🛍️ Novas Peças</p>
                <p className="text-xs text-gray-700">
                  Descubra quais peças complementarão seu guarda-roupa
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900 text-sm mb-2">🎨 Combinações</p>
                <p className="text-xs text-gray-700">
                  Explore formas criativas de combinar o que você já tem
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-purple-200 mt-4">
                <p className="text-xs text-gray-700 leading-relaxed">
                  ✨ <strong>Dica:</strong> Quanto mais detalhes você fornecer, melhor será o conselho!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}