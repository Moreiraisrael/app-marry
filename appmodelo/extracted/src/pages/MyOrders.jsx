import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const clients = await base44.entities.Client.filter({ email: userData.email });
        if (clients[0]) {
          setClient(clients[0]);
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['client-orders', client?.id],
    queryFn: async () => {
      if (!client) return [];
      return await base44.entities.Order.filter({ client_id: client.id }, '-created_date');
    },
    enabled: !!client
  });

  const statusConfig = {
    pending: {
      label: 'Pendente',
      icon: Package,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    },
    processing: {
      label: 'Processando',
      icon: Package,
      color: 'bg-blue-100 text-blue-700 border-blue-300'
    },
    shipped: {
      label: 'Enviado',
      icon: Truck,
      color: 'bg-purple-100 text-purple-700 border-purple-300'
    },
    delivered: {
      label: 'Entregue',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-300'
    },
    cancelled: {
      label: 'Cancelado',
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-300'
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.items?.some(item => item.product_name?.toLowerCase().includes(searchLower))
    );
  });

  const ordersByStatus = {
    all: filteredOrders,
    active: filteredOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)),
    delivered: filteredOrders.filter(o => o.status === 'delivered'),
    cancelled: filteredOrders.filter(o => o.status === 'cancelled')
  };

  if (!user || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por número do pedido ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({ordersByStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({ordersByStatus.active.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Entregues ({ordersByStatus.delivered.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelados ({ordersByStatus.cancelled.length})
            </TabsTrigger>
          </TabsList>

          {['all', 'active', 'delivered', 'cancelled'].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {ordersByStatus[tab].length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhum pedido encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                ordersByStatus[tab].map((order, idx) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg mb-1">
                                Pedido #{order.order_number || order.id.slice(0, 8)}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={status.color}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Items */}
                          <div className="space-y-2">
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex gap-3 p-2 bg-gray-50 rounded">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product_name}</p>
                                  <p className="text-xs text-gray-500">{item.partner_name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Qtd: {item.quantity}
                                    </span>
                                    <span className="text-sm font-semibold text-amber-600">
                                      R$ {item.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tracking */}
                          {order.tracking_code && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Código de Rastreamento
                              </p>
                              <div className="flex items-center justify-between">
                                <code className="text-sm text-blue-700">{order.tracking_code}</code>
                                {order.tracking_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(order.tracking_url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Rastrear
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Delivery Estimate */}
                          {order.estimated_delivery && order.status !== 'delivered' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Truck className="w-4 h-4" />
                              <span>
                                Entrega prevista: {new Date(order.estimated_delivery).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {/* Total */}
                          <div className="flex justify-between items-center pt-3 border-t">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold text-amber-600">
                              R$ {order.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}