import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Star, Award, Calendar, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientPerformance({ clients = [], appointments = [] }) {
  const [filter, setFilter] = useState('all');

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = clients.length;
    const vipCount = clients.filter(c => c.vip_level === 'vip').length;
    const premiumCount = clients.filter(c => c.vip_level === 'premium').length;
    const regularCount = clients.filter(c => !c.vip_level || c.vip_level === 'regular').length;

    // Clientes ativos (últimos 90 dias)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const activeCount = clients.filter(c => 
      c.last_appointment_date && new Date(c.last_appointment_date) >= ninetyDaysAgo
    ).length;

    // Clientes inativos (sem consulta há mais de 90 dias ou nunca)
    const inactiveCount = clients.filter(c => 
      !c.last_appointment_date || new Date(c.last_appointment_date) < ninetyDaysAgo
    ).length;

    return {
      total,
      vipCount,
      premiumCount,
      regularCount,
      activeCount,
      inactiveCount
    };
  }, [clients]);

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (filter === 'vip') {
      filtered = clients.filter(c => c.vip_level === 'vip');
    } else if (filter === 'premium') {
      filtered = clients.filter(c => c.vip_level === 'premium');
    } else if (filter === 'regular') {
      filtered = clients.filter(c => !c.vip_level || c.vip_level === 'regular');
    } else if (filter === 'active') {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      filtered = clients.filter(c => 
        c.last_appointment_date && new Date(c.last_appointment_date) >= ninetyDaysAgo
      );
    } else if (filter === 'inactive') {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      filtered = clients.filter(c => 
        !c.last_appointment_date || new Date(c.last_appointment_date) < ninetyDaysAgo
      );
    }

    // Ordenar por última consulta
    return filtered.sort((a, b) => {
      const dateA = a.last_appointment_date ? new Date(a.last_appointment_date) : new Date(0);
      const dateB = b.last_appointment_date ? new Date(b.last_appointment_date) : new Date(0);
      return dateB - dateA;
    });
  }, [clients, filter]);

  const vipLevelIcons = {
    vip: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    premium: { icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
    regular: { icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Desempenho da Base de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumo Estatístico */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.vipCount}</p>
            <p className="text-xs text-gray-600">VIP</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.premiumCount}</p>
            <p className="text-xs text-gray-600">Premium</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
            <p className="text-xs text-gray-600">Ativos</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.inactiveCount}</p>
            <p className="text-xs text-gray-600">Inativos</p>
          </div>
        </div>

        {/* Filtros */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-gray-100">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="regular">Regular</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Inativos</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Clientes */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum cliente encontrado</p>
          ) : (
            filteredClients.slice(0, 10).map((client, index) => {
              const vipLevel = client.vip_level || 'regular';
              const levelConfig = vipLevelIcons[vipLevel];
              
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link to={createPageUrl(`ClientDetail?id=${client.id}`)}>
                    <div className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {client.profile_photo ? (
                            <img 
                              src={client.profile_photo} 
                              alt={client.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-medium">
                              {client.full_name?.[0] || 'C'}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{client.full_name}</p>
                              <div className={`p-1 rounded ${levelConfig.bg}`}>
                                <levelConfig.icon className={`w-3 h-3 ${levelConfig.color}`} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {client.email && (
                                <span className="truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {client.email}
                                </span>
                              )}
                            </div>
                            {client.last_appointment_date && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                Última consulta: {new Date(client.last_appointment_date).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>

                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
          {filteredClients.length > 10 && (
            <Link to={createPageUrl('Clients')}>
              <Button variant="outline" className="w-full mt-2">
                Ver todos os {filteredClients.length} clientes
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}