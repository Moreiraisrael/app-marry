import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWithConsultant({ clientId }) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', clientId],
    queryFn: () => base44.entities.ChatMessage.filter({ client_id: clientId }, 'created_date'),
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    await sendMessageMutation.mutateAsync({
      client_id: clientId,
      sender_type: 'client',
      message: message.trim()
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await sendMessageMutation.mutateAsync({
        client_id: clientId,
        sender_type: 'client',
        message: '📷 Imagem compartilhada',
        attachments: [file_url]
      });
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          Chat com sua Consultora
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${
                msg.sender_type === 'client' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              } rounded-lg p-3`}>
                <p className="text-sm">{msg.message}</p>
                {msg.attachments?.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Attachment"
                    className="mt-2 rounded max-w-full"
                  />
                ))}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_date).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="chat-image-upload"
            disabled={uploading}
          />
          <label htmlFor="chat-image-upload">
            <Button
              asChild
              variant="outline"
              size="icon"
              disabled={uploading}
            >
              <span>
                <ImageIcon className="w-4 h-4" />
              </span>
            </Button>
          </label>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={uploading}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || uploading}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}