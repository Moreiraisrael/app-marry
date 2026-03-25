import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle, Sparkles, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AppointmentBooking({ consultantId, clientId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', consultantId],
    queryFn: async () => {
      return await base44.entities.ConsultantAvailability.filter({
        consultant_id: consultantId,
        is_active: true
      });
    }
  });

  const { data: existingAppointments = [] } = useQuery({
    queryKey: ['appointments', consultantId],
    queryFn: async () => {
      return await base44.entities.Appointment.filter({
        consultant_id: consultantId
      });
    }
  });

  const bookMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const serviceTimeMap = {
        'coloracao': 120,
        'estilo': 90,
        'closet': 180,
        'personal_shopping': 120,
        'followup': 60,
        'outro': 60
      };

      const appointment = await base44.entities.Appointment.create({
        ...appointmentData,
        status: 'scheduled',
        duration: serviceTimeMap[appointmentData.service_type] || 60
      });

      // Enviar notificação
      await base44.functions.invoke('sendAppointmentNotification', {
        appointmentId: appointment.id,
        type: 'confirmation'
      });

      return appointment;
    },
    onSuccess: (appointment) => {
      setConfirmedAppointment(appointment);
      toast.success('Agendamento realizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: () => toast.error('Erro ao agendar consulta')
  });

  const handleGetSmartSuggestions = async () => {
    if (!serviceType) {
      toast.error('Selecione o tipo de serviço primeiro');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const { data } = await base44.functions.invoke('suggestSmartAppointmentSlots', {
        consultantId,
        clientId,
        serviceType,
        daysAhead: 14
      });
      setSmartSuggestions(data.suggestions || []);
      toast.success('Sugestões inteligentes carregadas!');
    } catch (error) {
      toast.error('Erro ao carregar sugestões');
      console.error(error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);

    const slots = [];
    daySlots.forEach(slot => {
      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);

      let current = setMinutes(setHours(selectedDate, startHour), startMin);
      const end = setMinutes(setHours(selectedDate, endHour), endMin);

      while (current < end) {
        const slotTime = new Date(current);
        const isBusy = existingAppointments.some(apt => {
          const aptDate = new Date(apt.date);
          return (
            aptDate.toDateString() === slotTime.toDateString() &&
            Math.abs(aptDate.getTime() - slotTime.getTime()) < 3600000 &&
            apt.status !== 'cancelled'
          );
        });

        if (!isBusy) {
          slots.push(slotTime);
        }

        current = new Date(current.getTime() + slot.slot_duration * 60000);
      }
    });

    return slots;
  };

  const availableSlots = getAvailableSlots();

  if (confirmedAppointment) {
    return (
      <Card className="border-0 shadow-lg bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold mb-2 text-green-900">Agendamento Confirmado!</h3>
          <p className="text-green-700 mb-4">
            Sua consulta foi agendada para {format(new Date(confirmedAppointment.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
          <Button
            onClick={() => setConfirmedAppointment(null)}
            className="bg-green-600 hover:bg-green-700"
          >
            Agendar Outra Consulta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Agendar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Serviço */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Serviço</label>
          <Select value={serviceType} onValueChange={(val) => {
            setServiceType(val);
            setSmartSuggestions([]);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coloracao">Análise de Coloração (2h)</SelectItem>
              <SelectItem value="estilo">Análise de Estilo (1.5h)</SelectItem>
              <SelectItem value="closet">Organização de Guarda-Roupa (3h)</SelectItem>
              <SelectItem value="personal_shopping">Personal Shopping (2h)</SelectItem>
              <SelectItem value="followup">Acompanhamento (1h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Smart Suggestions Button */}
        {serviceType && (
          <Button
            onClick={handleGetSmartSuggestions}
            disabled={loadingSuggestions}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            variant="outline"
          >
            {loadingSuggestions ? (
              <>Analisando disponibilidade...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Ver Sugestões Inteligentes
              </>
            )}
          </Button>
        )}

        {/* Smart Suggestions Display */}
        {smartSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
          >
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Horários Recomendados
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {smartSuggestions.slice(0, 5).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSlot(new Date(suggestion.datetime));
                    setSelectedDate(new Date(suggestion.datetime));
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedSlot?.toISOString() === suggestion.datetime
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {suggestion.dayOfWeek}, {format(new Date(suggestion.datetime), "dd/MM")} às {suggestion.time}
                        </span>
                        {suggestion.score >= 80 && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className={`text-xs ${
                        selectedSlot?.toISOString() === suggestion.datetime
                          ? 'text-purple-100'
                          : 'text-gray-600'
                      }`}>
                        {suggestion.reason}
                      </p>
                      {suggestion.hasPreparationTime && suggestion.prepTimeMinutes > 0 && (
                        <p className={`text-xs mt-1 ${
                          selectedSlot?.toISOString() === suggestion.datetime
                            ? 'text-purple-200'
                            : 'text-purple-600'
                        }`}>
                          ✓ Tempo para preparo do dossiê: {suggestion.prepTimeMinutes}min
                        </p>
                      )}
                    </div>
                    <div className={`text-sm font-bold ${
                      selectedSlot?.toISOString() === suggestion.datetime
                        ? 'text-white'
                        : 'text-purple-600'
                    }`}>
                      {suggestion.score}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Calendário */}
        <div>
          <label className="block text-sm font-medium mb-2">Próximos 14 dias</label>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const date = addDays(new Date(), i);
              const hasSlots = availability.some(a => a.day_of_week === date.getDay() && a.is_active);

              return (
                <motion.button
                  key={i}
                  whileHover={hasSlots ? { scale: 1.05 } : {}}
                  onClick={() => hasSlots && setSelectedDate(date)}
                  disabled={!hasSlots}
                  className={`p-2 rounded text-sm font-medium transition-all ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-blue-600 text-white'
                      : hasSlots
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <div className="text-xs">{format(date, 'd')}</div>
                  <div className="text-xs">{format(date, 'EEE', { locale: ptBR }).substring(0, 3)}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Horários Disponíveis */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block text-sm font-medium mb-2">Horários Disponíveis</label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 col-span-3">Nenhum horário disponível para este dia</p>
              ) : (
                availableSlots.map((slot) => (
                  <button
                    key={slot.getTime()}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded text-sm font-medium transition-all ${
                      selectedSlot?.getTime() === slot.getTime()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {format(slot, 'HH:mm')}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
          <Textarea
            placeholder="Descreva seus objetivos ou dúvidas para a consulta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24"
          />
        </div>

        {/* Botão de Agendar */}
        <Button
          onClick={() => {
            if (!serviceType || !selectedSlot) {
              toast.error('Selecione o tipo de serviço e o horário');
              return;
            }
            bookMutation.mutate({
              client_id: clientId,
              consultant_id: consultantId,
              service_type: serviceType,
              date: selectedSlot.toISOString(),
              client_notes: notes,
              location: 'online'
            });
          }}
          disabled={bookMutation.isPending || !selectedSlot}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          size="lg"
        >
          {bookMutation.isPending ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </CardContent>
    </Card>
  );
}