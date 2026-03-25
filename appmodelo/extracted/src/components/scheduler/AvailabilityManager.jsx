import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AvailabilityManager() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ConsultantAvailability.filter({ 
        consultant_id: user.email 
      }, 'day_of_week');
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ConsultantAvailability.create({
        ...data,
        consultant_id: user.email
      });
    },
    onSuccess: () => {
      toast.success('Horário adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['availability', user?.email] });
    },
    onError: () => toast.error('Erro ao adicionar horário')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ConsultantAvailability.delete(id),
    onSuccess: () => {
      toast.success('Horário removido');
      queryClient.invalidateQueries({ queryKey: ['availability', user?.email] });
    }
  });

  const handleAddSlot = (dayOfWeek) => {
    createMutation.mutate({ day_of_week: dayOfWeek, start_time: '09:00', end_time: '10:00' });
  };

  const availabilityByDay = {};
  DAYS.forEach((_, i) => {
    availabilityByDay[i] = availability.filter(a => a.day_of_week === i);
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Minha Disponibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map((day, dayIndex) => {
          const daySlots = availabilityByDay[dayIndex] || [];

          return (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{day}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSlot(dayIndex)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Horário
                </Button>
              </div>

              <div className="space-y-2">
                {daySlots.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Sem horários disponíveis</p>
                ) : (
                  daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 bg-white p-3 rounded">
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => {
                            // Implementar atualização
                          }}
                          className="w-20"
                        />
                        <span>até</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => {
                            // Implementar atualização
                          }}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">({slot.slot_duration}min)</span>
                      </div>
                      <Checkbox
                        checked={slot.is_active}
                        onCheckedChange={() => {
                          // Implementar toggle
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(slot.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}