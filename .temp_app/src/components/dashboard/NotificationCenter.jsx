import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Sparkles, Palette, Clock, Cake, Shirt, Mail, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  const { data: clients = [] } = useQuery({
    queryKey: ['notifications-clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: pendingColorAnalysis = [] } = useQuery({
    queryKey: ['pending-color-notifications'],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ status: 'pending' }, '-created_date', 5)
  });

  const { data: pendingStyleQuizzes = [] } = useQuery({
    queryKey: ['pending-style-notifications'],
    queryFn: () => base44.entities.StyleQuiz.filter({ status: 'pending' }, '-created_date', 5)
  });

  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ['upcoming-appointments-notifications'],
    queryFn: async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const allApts = await base44.entities.Appointment.list('-date');
      return allApts.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= new Date() && aptDate <= nextWeek && apt.status !== 'cancelled';
      });
    }
  });

  const { data: recentWardrobeItems = [] } = useQuery({
    queryKey: ['notifications-wardrobe'],
    queryFn: async () => {
      const items = await base44.entities.WardrobeItem.list('-created_date', 10);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return items.filter(item => new Date(item.created_date) >= threeDaysAgo);
    }
  });

  const sendBirthdayOffer = async (client, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.integrations.Core.SendEmail({
        to: client.email,
        subject: `🎉 Feliz Aniversário, ${client.full_name.split(' ')[0]}!`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec4899;">🎉 Feliz Aniversário!</h1>
            <p>Olá ${client.full_name.split(' ')[0]},</p>
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="margin: 0; color: white;">🎁 Presente Especial</h2>
              <p style="font-size: 18px; margin: 10px 0; color: white;">20% de desconto em todos os serviços!</p>
            </div>
            <p>Com carinho,<br>Sua Consultora de Imagem</p>
          </div>
        `
      });
      toast.success(`Oferta enviada para ${client.full_name}!`);
    } catch (error) {
      toast.error('Erro ao enviar e-mail');
    }
  };

  useEffect(() => {
    const today = new Date();

    // Birthday notifications (next 7 days)
    const upcomingBirthdays = clients
      .filter(client => client.birth_date)
      .map(client => {
        const birthDate = new Date(client.birth_date);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
        return { ...client, daysUntil, nextBirthday };
      })
      .filter(c => c.daysUntil >= 0 && c.daysUntil <= 7);

    // Clients needing consultation (last appointment > 30 days ago)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clientsNeedingConsultation = clients.filter(client => {
      if (!client.last_appointment_date) return false;
      return new Date(client.last_appointment_date) < thirtyDaysAgo;
    }).slice(0, 3);

    const newNotifications = [
      ...upcomingBirthdays.map(client => ({
        id: `birthday-${client.id}`,
        type: 'birthday',
        icon: Cake,
        color: 'pink',
        title: client.daysUntil === 0 
          ? `🎉 ${client.full_name} faz aniversário HOJE!`
          : `Aniversário de ${client.full_name}`,
        description: client.daysUntil === 0 ? 'Envie uma oferta especial!' : `Em ${client.daysUntil} dia(s)`,
        link: createPageUrl(`ClientDetail?id=${client.id}`),
        timestamp: client.nextBirthday,
        urgent: client.daysUntil === 0,
        action: (e) => sendBirthdayOffer(client, e),
        actionLabel: 'Enviar Oferta'
      })),
      ...clientsNeedingConsultation.map(client => ({
        id: `consult-${client.id}`,
        type: 'consultation',
        icon: Clock,
        color: 'amber',
        title: `${client.full_name} precisa de consulta`,
        description: 'Não há consulta há mais de 30 dias',
        link: createPageUrl('Appointments'),
        timestamp: new Date(client.last_appointment_date)
      })),
      ...pendingColorAnalysis.map(item => ({
        id: `color-${item.id}`,
        type: 'color_analysis',
        icon: Sparkles,
        color: 'rose',
        title: 'Análise de Coloração Pendente',
        description: `Nova análise aguardando validação`,
        link: createPageUrl('ColorAnalysis'),
        timestamp: new Date(item.created_date)
      })),
      ...pendingStyleQuizzes.map(item => ({
        id: `style-${item.id}`,
        type: 'style_quiz',
        icon: Palette,
        color: 'purple',
        title: 'Questionário de Estilo Pendente',
        description: `Novo questionário para revisar`,
        link: createPageUrl('PendingStyleQuizzes'),
        timestamp: new Date(item.created_date)
      })),
      ...recentWardrobeItems.map(item => ({
        id: `wardrobe-${item.id}`,
        type: 'wardrobe',
        icon: Shirt,
        color: 'blue',
        title: 'Nova Peça no Guarda-Roupa',
        description: 'Cliente adicionou uma peça',
        link: createPageUrl('VirtualWardrobe'),
        timestamp: new Date(item.created_date)
      })),
      ...upcomingAppointments.map(item => ({
        id: `apt-${item.id}`,
        type: 'appointment',
        icon: Calendar,
        color: 'green',
        title: 'Consulta Próxima',
        description: `${new Date(item.date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        link: createPageUrl('Appointments'),
        timestamp: new Date(item.date),
        urgent: new Date(item.date).getTime() - Date.now() < 3600000
      }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    setNotifications(newNotifications);
  }, [clients, pendingColorAnalysis, pendingStyleQuizzes, upcomingAppointments, recentWardrobeItems]);

  const colorClasses = {
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-600" />
          Central de Notificações
          {notifications.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">{notifications.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma notificação no momento ✨
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const Icon = notification.icon;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link to={notification.link}>
                      <div className={`p-3 rounded-lg border-l-4 ${colorClasses[notification.color]} hover:shadow-md transition-all cursor-pointer`}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {notification.urgent && (
                                <Badge className="bg-red-500 text-white text-xs">Urgente</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getRelativeTime(notification.timestamp)}
                            </p>
                            {notification.action && (
                              <Button
                                size="sm"
                                onClick={notification.action}
                                className="mt-2 h-7 text-xs bg-gradient-to-r from-pink-500 to-purple-600"
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const diffFuture = date - now;
  const minutes = Math.floor(Math.abs(diff) / 60000);
  const hours = Math.floor(Math.abs(diff) / 3600000);
  const days = Math.floor(Math.abs(diff) / 86400000);

  if (diffFuture > 0) {
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    if (days < 7) return `Em ${days}d`;
  }

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days < 7) return `Há ${days}d`;
  return date.toLocaleDateString('pt-BR');
}