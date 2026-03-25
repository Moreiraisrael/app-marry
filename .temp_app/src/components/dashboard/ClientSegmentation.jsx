import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Tag, Star, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientSegmentation({ onClientSelect }) {
  const [filterTags, setFilterTags] = useState([]);
  const [filterVIP, setFilterVIP] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-segmentation'],
    queryFn: () => base44.entities.Client.list()
  });

  const queryClient = useQueryClient();

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }) => await base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-segmentation'] });
    }
  });

  // All unique tags
  const allTags = [...new Set(clients.flatMap(c => c.tags || []))];

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = filterTags.length === 0 || 
      filterTags.every(tag => client.tags?.includes(tag));
    
    const matchesVIP = filterVIP === 'all' || client.vip_level === filterVIP;

    return matchesSearch && matchesTags && matchesVIP;
  });

  const toggleClientTag = async (client, tag) => {
    const currentTags = client.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    await updateClientMutation.mutateAsync({
      id: client.id,
      data: { tags: newTags }
    });
  };

  const setClientVIP = async (client, level) => {
    await updateClientMutation.mutateAsync({
      id: client.id,
      data: { vip_level: level }
    });
  };

  const vipColors = {
    regular: 'bg-gray-100 text-gray-700',
    vip: 'bg-amber-100 text-amber-700',
    premium: 'bg-purple-100 text-purple-700'
  };

  const vipIcons = {
    regular: '',
    vip: '⭐',
    premium: '👑'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Segmentação de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex gap-2">
            <Select value={filterVIP} onValueChange={setFilterVIP}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="vip">VIP ⭐</SelectItem>
                <SelectItem value="premium">Premium 👑</SelectItem>
              </SelectContent>
            </Select>

            {allTags.length > 0 && (
              <div className="flex-1 flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    onClick={() => setFilterTags(
                      filterTags.includes(tag) 
                        ? filterTags.filter(t => t !== tag)
                        : [...filterTags, tag]
                    )}
                    className={`cursor-pointer ${
                      filterTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {(filterTags.length > 0 || filterVIP !== 'all' || searchTerm) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFilterTags([]);
                setFilterVIP('all');
                setSearchTerm('');
              }}
            >
              <X className="w-3 h-3 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Clients List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredClients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="p-3 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onClientSelect?.(client)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{client.full_name}</h4>
                    <Badge className={`text-xs ${vipColors[client.vip_level || 'regular']}`}>
                      {vipIcons[client.vip_level || 'regular']} {client.vip_level || 'regular'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{client.email}</p>
                  
                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredClients.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhuma cliente encontrada
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {filteredClients.length} de {clients.length} clientes
        </p>
      </CardContent>
    </Card>
  );
}