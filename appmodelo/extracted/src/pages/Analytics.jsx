import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, DollarSign, Shirt, Calendar, 
  Target, Award, PieChart as PieIcon, BarChart3 
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

export default function Analytics() {
  const [selectedClient, setSelectedClient] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-analytics', selectedClient],
    queryFn: () => base44.entities.WardrobeItem.filter({ client_id: selectedClient }),
    enabled: !!selectedClient
  });

  const { data: clientData } = useQuery({
    queryKey: ['client-analytics', selectedClient],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ id: selectedClient });
      return clients[0];
    },
    enabled: !!selectedClient
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!wardrobeItems.length) return null;

    // Category breakdown
    const categoryData = wardrobeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Color distribution
    const colorData = wardrobeItems.reduce((acc, item) => {
      if (item.color) {
        acc[item.color] = (acc[item.color] || 0) + 1;
      }
      return acc;
    }, {});

    // Season & Style match
    const seasonMatch = wardrobeItems.filter(i => i.season_match).length;
    const styleMatch = wardrobeItems.filter(i => i.style_match).length;

    // Cost per wear analysis
    const itemsWithPrice = wardrobeItems.filter(i => i.purchase_price && i.times_worn > 0);
    const costPerWearData = itemsWithPrice.map(item => ({
      name: `${item.category} ${item.color || ''}`.substring(0, 20),
      costPerWear: (item.purchase_price / item.times_worn).toFixed(2),
      timesWorn: item.times_worn,
      price: item.purchase_price
    })).sort((a, b) => a.costPerWear - b.costPerWear);

    // Usage frequency
    const usageData = wardrobeItems
      .filter(i => i.times_worn > 0)
      .sort((a, b) => b.times_worn - a.times_worn)
      .slice(0, 10)
      .map(item => ({
        name: `${item.category}`.substring(0, 15),
        uses: item.times_worn,
        color: item.color
      }));

    // Status breakdown
    const statusData = wardrobeItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly wear trend (mock data based on wear_log)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
      
      const wears = wardrobeItems.reduce((sum, item) => {
        if (item.wear_log) {
          return sum + item.wear_log.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getMonth() === month.getMonth();
          }).length;
        }
        return sum;
      }, 0);
      
      monthlyTrend.push({ month: monthName, wears });
    }

    // Total investment
    const totalInvestment = wardrobeItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    const avgCostPerWear = itemsWithPrice.length > 0 
      ? (totalInvestment / itemsWithPrice.reduce((sum, i) => sum + i.times_worn, 0)).toFixed(2)
      : 0;

    return {
      total: wardrobeItems.length,
      categoryData: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
      colorData: Object.entries(colorData).map(([name, value]) => ({ name, value })),
      seasonMatchPercent: ((seasonMatch / wardrobeItems.length) * 100).toFixed(1),
      styleMatchPercent: ((styleMatch / wardrobeItems.length) * 100).toFixed(1),
      costPerWearData: costPerWearData.slice(0, 10),
      usageData,
      statusData: Object.entries(statusData).map(([name, value]) => ({ 
        name: name === 'keep' ? 'Manter' : name === 'donate' ? 'Doar' : name === 'repair' ? 'Consertar' : 'Pendente', 
        value 
      })),
      monthlyTrend,
      totalInvestment,
      avgCostPerWear,
      mostUsedItem: usageData[0]?.name || 'N/A',
      leastUsedCount: wardrobeItems.filter(i => i.times_worn === 0).length
    };
  }, [wardrobeItems]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
          <BarChart3 className="w-4 h-4" />
          Analytics & Insights
        </div>
        <h1 className="text-3xl font-light text-gray-900">
          Dashboard de <span className="font-semibold">Análises</span>
        </h1>
      </div>

      {/* Client Selector */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <label className="block font-medium mb-2">Selecione a Cliente</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <Shirt className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Total de Peças</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <Target className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Match de Estação</p>
                <p className="text-3xl font-bold">{stats.seasonMatchPercent}%</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <Award className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Match de Estilo</p>
                <p className="text-3xl font-bold">{stats.styleMatchPercent}%</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Custo Médio/Uso</p>
                <p className="text-3xl font-bold">R${stats.avgCostPerWear}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-pink-600" />
                  Peças por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Color Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-purple-600" />
                  Distribuição de Cores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.colorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Usage Frequency */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Peças Mais Usadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.usageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="uses" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Per Wear */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Melhor Custo por Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.costPerWearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="costPerWear" fill="#10b981">
                      {stats.costPerWearData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#10b981' : '#6ee7b7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Tendência de Uso (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wears" stroke="#6366f1" strokeWidth={2} name="Usos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-amber-600" />
                  Status das Peças
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Insights & Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">💰 Investimento Total</h4>
                  <p className="text-2xl font-bold text-purple-600">R$ {stats.totalInvestment.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">em {stats.total} peças</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">👔 Peça Mais Usada</h4>
                  <p className="text-lg font-bold text-blue-600">{stats.mostUsedItem}</p>
                  <p className="text-sm text-gray-600 mt-1">com {stats.usageData[0]?.uses || 0} usos</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Peças Não Usadas</h4>
                  <p className="text-2xl font-bold text-amber-600">{stats.leastUsedCount}</p>
                  <p className="text-sm text-gray-600 mt-1">peças sem registro de uso</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Compatibilidade</h4>
                  <div className="space-y-1">
                    <Badge className="bg-green-100 text-green-700">
                      {stats.seasonMatchPercent}% match estação
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 ml-2">
                      {stats.styleMatchPercent}% match estilo
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedClient && !stats && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma peça cadastrada ainda no guarda-roupa</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}