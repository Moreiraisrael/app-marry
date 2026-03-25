import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Users,
  Palette,
  Camera,
  BookOpen,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Search,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import ClientOverview from '@/components/dashboard/ClientOverview';
import AffiliateRewardsCenter from '@/components/consultant/AffiliateRewardsCenter';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import BirthdayReminders from '@/components/dashboard/BirthdayReminders';
import ClientSegmentation from '@/components/dashboard/ClientSegmentation';
import BusinessMetrics from '@/components/dashboard/BusinessMetrics';
import PendingTasks from '@/components/dashboard/PendingTasks';
import ClientPerformance from '@/components/dashboard/ClientPerformance';

export default function ConsultantDashboard() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  const { data: colorAnalyses = [] } = useQuery({
    queryKey: ['dashboard-color-analyses'],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ status: 'approved' })
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['dashboard-style-quizzes'],
    queryFn: () => base44.entities.StyleQuiz.filter({ status: 'approved' })
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const { data: pendingColorAnalysis = [] } = useQuery({
    queryKey: ['dashboard-pending-color'],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ status: 'pending' })
  });

  const { data: pendingStyleQuizzes = [] } = useQuery({
    queryKey: ['dashboard-pending-style'],
    queryFn: () => base44.entities.StyleQuiz.filter({ status: 'pending' })
  });

  const { data: recentWardrobeItems = [] } = useQuery({
    queryKey: ['dashboard-wardrobe'],
    queryFn: async () => {
      const items = await base44.entities.WardrobeItem.list('-created_date', 10);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return items.filter(item => new Date(item.created_date) >= threeDaysAgo);
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ['dashboard-services'],
    queryFn: () => base44.entities.Service.list()
  });

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientsWithData = filteredClients.map(client => {
    const colorAnalysis = colorAnalyses.find(ca => ca.client_id === client.id);
    const styleQuiz = styleQuizzes.find(sq => sq.client_id === client.id);
    const nextAppointment = appointments
      .filter(apt => apt.client_id === client.id && new Date(apt.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    
    return {
      ...client,
      colorAnalysis,
      styleQuiz,
      nextAppointment
    };
  }).sort((a, b) => {
    // Sort by next appointment date
    if (a.nextAppointment && !b.nextAppointment) return -1;
    if (!a.nextAppointment && b.nextAppointment) return 1;
    if (a.nextAppointment && b.nextAppointment) {
      return new Date(a.nextAppointment.date) - new Date(b.nextAppointment.date);
    }
    return 0;
  });

  const features = [
    { icon: Calendar, label: "Agendamentos", path: "Appointments", color: "from-blue-500 to-indigo-600", count: upcomingAppointments.length },
    { icon: Palette, label: "Análise de Coloração", path: "ColorAnalysis", color: "from-rose-500 to-pink-600", count: pendingColorAnalysis.length },
    { icon: Sparkles, label: "Análise de Estilo", path: "PendingStyleQuizzes", color: "from-purple-500 to-pink-600", count: pendingStyleQuizzes.length },
    { icon: Users, label: "Clientes", path: "Clients", color: "from-emerald-500 to-teal-600", count: clients.length },
    { icon: Camera, label: "Provador Virtual", path: "VirtualFitting", color: "from-amber-500 to-orange-600" },
    { icon: ShoppingBag, label: "Listas de Compras", path: "ShoppingLists", color: "from-pink-500 to-rose-600" },
    { icon: BookOpen, label: "Ebooks", path: "Ebooks", color: "from-violet-500 to-purple-600" },
    { icon: Sparkles, label: "Guarda-Roupa Virtual", path: "VirtualWardrobe", color: "from-cyan-500 to-blue-600" },
  ];

  const stats = [
    { label: 'Total de Clientes', value: clients.length, icon: Users, color: 'text-blue-600' },
    { label: 'Consultas Próximas', value: upcomingAppointments.length, icon: Calendar, color: 'text-green-600' },
    { label: 'Análises Pendentes', value: pendingColorAnalysis.length + pendingStyleQuizzes.length, icon: Sparkles, color: 'text-amber-600' },
    { label: 'Este Mês', value: appointments.filter(a => {
      const date = new Date(a.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length, icon: TrendingUp, color: 'text-purple-600' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Bem-vinda ao <span className="font-semibold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">StyleStudio</span>
        </h1>
        <p className="text-gray-600">Gerencie suas clientes e consultorias em um só lugar</p>
      </div>

      {/* Business Metrics */}
      <div className="mb-8">
        <BusinessMetrics 
          clients={clients}
          appointments={appointments}
          services={services}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Notifications & Tasks */}
        <div className="space-y-6">
          <NotificationCenter />
          <PendingTasks 
            pendingColorAnalysis={pendingColorAnalysis}
            pendingStyleQuizzes={pendingStyleQuizzes}
            recentWardrobeItems={recentWardrobeItems}
          />
          <AffiliateRewardsCenter />
        </div>

        {/* Middle/Right Columns - Quick Access & Performance */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.path}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={createPageUrl(feature.path)}>
                      <div className={`relative p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white hover:scale-105 transition-transform cursor-pointer shadow-lg`}>
                        {feature.count !== undefined && feature.count > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {feature.count}
                          </div>
                        )}
                        <feature.icon className="w-6 h-6 mb-2" />
                        <p className="text-xs font-medium">{feature.label}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ClientPerformance 
            clients={clients}
            appointments={appointments}
          />
        </div>
      </div>

      {/* Client Overview Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visão Geral das Clientes</CardTitle>
            <Link to={createPageUrl("Clients")}>
              <Button variant="outline" size="sm">
                Ver Todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {clientsWithData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma cliente encontrada</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientsWithData.slice(0, 9).map((client, index) => (
                <ClientOverview
                  key={client.id}
                  client={client}
                  colorAnalysis={client.colorAnalysis}
                  styleQuiz={client.styleQuiz}
                  nextAppointment={client.nextAppointment}
                  index={index}
                />
              ))}
            </div>
          )}

          {clientsWithData.length > 9 && (
            <div className="text-center mt-6">
              <Link to={createPageUrl("Clients")}>
                <Button variant="outline">
                  Ver Mais {clientsWithData.length - 9} Clientes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}