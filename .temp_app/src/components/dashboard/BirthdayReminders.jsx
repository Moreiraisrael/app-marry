import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cake, Mail, Phone, Gift, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BirthdayReminders() {
  const [sendingEmail, setSendingEmail] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-birthdays'],
    queryFn: () => base44.entities.Client.list()
  });

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const upcomingBirthdays = clients
    .filter(client => client.birth_date)
    .map(client => {
      const birthDate = new Date(client.birth_date);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      let daysUntil = 0;
      const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
      
      if (thisYearBirthday < today) {
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
        daysUntil = Math.ceil((nextYearBirthday - today) / (1000 * 60 * 60 * 24));
      } else {
        daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
      }

      const age = today.getFullYear() - birthDate.getFullYear();

      return {
        ...client,
        birthMonth,
        birthDay,
        daysUntil,
        age,
        isToday: birthMonth === currentMonth && birthDay === currentDay,
        isThisMonth: birthMonth === currentMonth
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10);

  const thisMonthBirthdays = upcomingBirthdays.filter(c => c.isThisMonth);

  const sendBirthdayOffer = async (client) => {
    setSendingEmail(client.id);
    try {
      await base44.integrations.Core.SendEmail({
        to: client.email,
        subject: `🎉 Feliz Aniversário, ${client.full_name.split(' ')[0]}!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec4899;">🎉 Feliz Aniversário!</h1>
            <p>Olá ${client.full_name.split(' ')[0]},</p>
            <p>Hoje é um dia especial e queremos celebrar com você!</p>
            
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="margin: 0; color: white;">🎁 Presente Especial de Aniversário</h2>
              <p style="font-size: 18px; margin: 10px 0; color: white;">20% de desconto em todos os nossos serviços!</p>
              <p style="margin: 0; color: white;">Válido por 30 dias a partir de hoje.</p>
            </div>
            
            <p>Aproveite para agendar aquela consultoria que você tanto deseja!</p>
            
            <p>Com carinho,<br>Sua Consultora de Imagem</p>
          </div>
        `
      });
      toast.success(`E-mail enviado para ${client.full_name}!`);
    } catch (error) {
      toast.error('Erro ao enviar e-mail');
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="w-5 h-5 text-pink-600" />
          Aniversariantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {thisMonthBirthdays.length > 0 && (
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 mb-4">
              <p className="text-sm font-semibold text-pink-900">
                🎂 {thisMonthBirthdays.length} aniversariante(s) este mês
              </p>
            </div>
          )}

          {upcomingBirthdays.slice(0, 5).map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border ${
                client.isToday 
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{client.full_name}</h4>
                    {client.isToday && (
                      <Badge className="bg-pink-500 text-white">
                        <Cake className="w-3 h-3 mr-1" />
                        HOJE!
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(client.birth_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      {client.daysUntil > 0 && ` (em ${client.daysUntil} dias)`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-3 h-3" />
                      {client.age} anos
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => sendBirthdayOffer(client)}
                      disabled={sendingEmail === client.id}
                      className="bg-gradient-to-r from-pink-500 to-purple-600"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      {sendingEmail === client.id ? 'Enviando...' : 'Enviar Oferta'}
                    </Button>
                    {client.phone && (
                      <Button size="sm" variant="outline">
                        <Phone className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {upcomingBirthdays.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum aniversário próximo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}