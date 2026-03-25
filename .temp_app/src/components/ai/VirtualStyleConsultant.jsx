import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Send, Loader2, MessageCircle, ShoppingBag, Shirt, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function VirtualStyleConsultant({ clientId }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: client } = useQuery({
    queryKey: ['client-consultant', clientId],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: clientId });
      return clients[0];
    },
    enabled: !!clientId
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['style-conversations', clientId],
    queryFn: async () => {
      return await base44.agents.listConversations({
        agent_name: 'style_consultant'
      });
    },
    enabled: !!clientId
  });

  // Carregar ou criar conversa
  useEffect(() => {
    if (!clientId || !client) return;

    const loadOrCreateConversation = async () => {
      // Procurar conversa existente para esta cliente
      const existingConv = conversations.find(c => 
        c.metadata?.client_id === clientId
      );

      if (existingConv) {
        setConversationId(existingConv.id);
        setMessages(existingConv.messages || []);
      } else {
        // Criar nova conversa
        const newConv = await base44.agents.createConversation({
          agent_name: 'style_consultant',
          metadata: {
            client_id: clientId,
            client_name: client.full_name,
            name: `Consultoria de Estilo - ${client.full_name}`
          }
        });
        setConversationId(newConv.id);
        setMessages([]);
        
        // Enviar mensagem de boas-vindas
        setTimeout(() => {
          sendWelcomeMessage();
        }, 500);
      }
    };

    loadOrCreateConversation();
  }, [clientId, client, conversations]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      scrollToBottom();
    });

    return unsubscribe;
  }, [conversationId]);

  const sendWelcomeMessage = () => {
    const welcomeMessage = `Olá! 👋 Sou sua consultora de estilo virtual! Estou aqui para te ajudar a:\n\n✨ **Criar looks incríveis** com as peças que você já tem\n👗 **Sugerir combinações** para diferentes ocasiões\n💡 **Dar conselhos** sobre caimento e ajuste de roupas\n🛍️ **Recomendar novas peças** que vão completar seu guarda-roupa\n\nTenho acesso ao seu perfil de estilo, análise de coloração, e todo o seu guarda-roupa digital. Pode me perguntar qualquer coisa sobre moda!\n\nO que você gostaria de fazer hoje? 😊`;

    setMessages([{ role: 'assistant', content: welcomeMessage }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversationId || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Adicionar contexto útil na primeira mensagem
      const contextPrefix = messages.length <= 1 ? 
        `[CONTEXTO: Cliente ID: ${clientId}. Sempre consulte os dados da cliente antes de responder.]\n\n` : '';

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: contextPrefix + userMessage
      });

      scrollToBottom();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar mensagem');
    }

    setSending(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const quickActions = [
    { label: '✨ Criar look para trabalho', query: 'Me sugira um look completo para o trabalho usando peças do meu guarda-roupa' },
    { label: '🎉 Look para evento', query: 'Preciso de um look para um evento especial, o que você sugere?' },
    { label: '👗 Otimizar guarda-roupa', query: 'Como posso usar melhor as peças que já tenho?' },
    { label: '🛍️ O que comprar', query: 'Quais peças essenciais estão faltando no meu guarda-roupa?' }
  ];

  if (!conversationId) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Iniciando consultoria...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl overflow-hidden h-[700px] flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2" />
      
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Consultora de Estilo Virtual</CardTitle>
            <p className="text-sm text-gray-600">Sua assistente pessoal de moda com IA</p>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <ReactMarkdown 
                      className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="ml-4 mb-2 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-purple-900">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        h3: ({ children }) => <h3 className="font-semibold text-base mb-2 mt-3 first:mt-0">{children}</h3>,
                        code: ({ children }) => <code className="bg-gray-200 px-1 rounded text-xs">{children}</code>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                
                {/* Tool Calls */}
                {message.tool_calls?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.tool_calls.map((tool, i) => (
                      <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                        {tool.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                        {tool.status === 'completed' && tool.name.includes('WardrobeItem') && <Shirt className="w-3 h-3" />}
                        {tool.status === 'completed' && tool.name.includes('ShoppingList') && <ShoppingBag className="w-3 h-3" />}
                        {tool.status === 'completed' && tool.name.includes('Client') && <User className="w-3 h-3" />}
                        <span className="opacity-70">
                          {tool.status === 'running' ? 'Consultando dados...' : 
                           tool.status === 'completed' ? 'Dados consultados' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-medium text-sm">
                  {client?.full_name?.[0] || 'C'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-600 mb-2">Ações rápidas:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(action.query)}
                className="text-xs justify-start"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua pergunta ou pedido..."
            disabled={sending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || sending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}