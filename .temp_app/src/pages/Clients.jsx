import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  Palette
} from 'lucide-react';
import ClientForm from '@/components/clients/ClientForm';

const seasonLabels = {
  primavera_clara: 'Primavera Clara',
  primavera_quente: 'Primavera Quente',
  primavera_brilhante: 'Primavera Brilhante',
  verao_claro: 'Verão Claro',
  verao_suave: 'Verão Suave',
  verao_frio: 'Verão Frio',
  outono_suave: 'Outono Suave',
  outono_quente: 'Outono Quente',
  outono_profundo: 'Outono Profundo',
  inverno_profundo: 'Inverno Profundo',
  inverno_frio: 'Inverno Frio',
  inverno_brilhante: 'Inverno Brilhante'
};

const seasonColors = {
  primavera_clara: 'bg-yellow-100 text-yellow-800',
  primavera_quente: 'bg-orange-100 text-orange-800',
  primavera_brilhante: 'bg-pink-100 text-pink-800',
  verao_claro: 'bg-blue-100 text-blue-800',
  verao_suave: 'bg-gray-100 text-gray-800',
  verao_frio: 'bg-indigo-100 text-indigo-800',
  outono_suave: 'bg-amber-100 text-amber-800',
  outono_quente: 'bg-red-100 text-red-800',
  outono_profundo: 'bg-brown-100 text-brown-800',
  inverno_profundo: 'bg-slate-100 text-slate-800',
  inverno_frio: 'bg-cyan-100 text-cyan-800',
  inverno_brilhante: 'bg-fuchsia-100 text-fuchsia-800'
};

export default function Clients() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  });

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">
            Minhas <span className="font-semibold">Clientes</span>
          </h1>
          <p className="text-gray-600 mt-1">Gerencie suas clientes e dossiês</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-500 to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Nova Cliente'}
              </DialogTitle>
            </DialogHeader>
            <ClientForm 
              client={editingClient} 
              onClose={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100">
              <Users className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Palette className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.season).length}
              </div>
              <div className="text-sm text-gray-600">Analisadas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'Nenhuma cliente encontrada' : 'Nenhuma cliente cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {search ? 'Tente buscar por outro termo' : 'Comece adicionando sua primeira cliente'}
          </p>
          {!search && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-rose-500">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {client.profile_photo ? (
                        <img 
                          src={client.profile_photo} 
                          alt={client.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-xl font-medium">
                          {client.full_name?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`ClientDetail?id=${client.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`GenerateDossier?clientId=${client.id}`)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Dossiê
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteMutation.mutate(client.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {client.season && (
                    <Badge className={seasonColors[client.season] || 'bg-gray-100'}>
                      {seasonLabels[client.season] || client.season}
                    </Badge>
                  )}
                  
                  {client.height && client.weight && (
                    <p className="text-sm text-gray-500 mt-3">
                      {client.height}cm • {client.weight}kg
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}