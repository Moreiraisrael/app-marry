import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, ShoppingBag } from 'lucide-react';
import PersonalizedShoppingAssistant from '@/components/shopping/PersonalizedShoppingAssistant';

export default function PersonalizedShopping() {
  const [selectedClient, setSelectedClient] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Assistente Style
        </div>
        <h1 className="text-3xl font-light text-neutral-100">
          Assistente de Compras <span className="font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">Personalizado</span>
        </h1>
        <p className="text-neutral-400 mt-1">
          Sugestões inteligentes baseadas no perfil completo, guarda-roupa e histórico de cada cliente
        </p>
      </div>

      {/* Client Selection */}
      <Card className="border border-amber-500/20 shadow-2xl bg-black mb-8">
        <CardHeader>
          <CardTitle className="text-neutral-100">Selecionar Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-neutral-200">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="mt-2 bg-neutral-900 border-neutral-700 text-neutral-200">
                <SelectValue placeholder="Escolha uma cliente" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {clients.map(client => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id}
                    className="text-neutral-200 hover:bg-amber-500/10"
                  >
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Assistant */}
      {selectedClient ? (
        <PersonalizedShoppingAssistant clientId={selectedClient} />
      ) : (
        <Card className="border border-amber-500/20 bg-black">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-100 mb-2">
              Selecione uma Cliente
            </h3>
            <p className="text-neutral-400">
              Escolha uma cliente para ver sugestões personalizadas baseadas no perfil completo dela
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}