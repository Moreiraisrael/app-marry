import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Sparkles, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessMetrics({ clients = [], appointments = [], services = [] }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Clientes ativos (com consulta nos últimos 90 dias)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const activeClients = clients.filter(c => 
    c.last_appointment_date && new Date(c.last_appointment_date) >= ninetyDaysAgo
  ).length;

  // Agendamentos do mês
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentMonth && 
           aptDate.getFullYear() === currentYear &&
           apt.status !== 'cancelled';
  });

  // Agendamentos concluídos do mês
  const completedThisMonth = monthAppointments.filter(a => a.status === 'completed').length;

  // Receita estimada (baseada nos serviços mais comuns)
  const serviceRevenue = {
    'coloracao': 300,
    'estilo': 250,
    'closet': 400,
    'personal_shopping': 350,
    'followup': 150,
    'outro': 200
  };

  const estimatedRevenue = monthAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, apt) => sum + (serviceRevenue[apt.service_type] || 200), 0);

  // Taxa de crescimento (comparação com mês anterior)
  const lastMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === lastMonth.getMonth() && 
           aptDate.getFullYear() === lastMonth.getFullYear() &&
           apt.status === 'completed';
  }).length;

  const growthRate = lastMonthAppointments > 0 
    ? ((completedThisMonth - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1)
    : 0;

  // Total de clientes VIP/Premium
  const vipClients = clients.filter(c => c.vip_level === 'vip' || c.vip_level === 'premium').length;

  const metrics = [
    {
      title: 'Clientes Ativos',
      value: activeClients,
      total: clients.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Últimos 90 dias'
    },
    {
      title: 'Consultas do Mês',
      value: monthAppointments.length,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${completedThisMonth} concluídas`
    },
    {
      title: 'Receita Estimada',
      value: `R$ ${estimatedRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Este mês'
    },
    {
      title: 'Crescimento',
      value: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      textColor: growthRate >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: growthRate >= 0 ? 'bg-green-50' : 'bg-red-50',
      description: 'vs. mês anterior'
    },
    {
      title: 'Clientes VIP',
      value: vipClients,
      total: clients.length,
      icon: Sparkles,
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Premium & VIP'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${metric.color}`} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{metric.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  {metric.total && (
                    <span className="text-sm text-gray-500">/ {metric.total}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}