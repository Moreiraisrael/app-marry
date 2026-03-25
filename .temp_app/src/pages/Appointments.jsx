import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, LayoutGrid, LayoutList, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import CalendarView from '@/components/scheduler/CalendarView';
import AppointmentForm from '@/components/scheduler/AppointmentForm';
import GoogleCalendarSync from '@/components/scheduler/GoogleCalendarSync';
import AvailabilityManager from '@/components/scheduler/AvailabilityManager';

const serviceLabels = {
  coloracao: 'Análise de Coloração',
  estilo: 'Análise de Estilo',
  closet: 'Organização de Closet',
  personal_shopping: 'Personal Shopping',
  followup: 'Follow-up',
  outro: 'Outro'
};

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700'
};

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export default function Appointments() {
  const [view, setView] = useState('month'); // 'month', 'week', 'day', 'list'
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Handle recurring appointments
      if (data.is_recurring && data.recurrence_pattern && data.recurrence_end_date) {
        const appointments = generateRecurringAppointments(data);
        return await base44.entities.Appointment.bulkCreate(appointments);
      }
      return await base44.entities.Appointment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowNewAppointment(false);
      setSelectedAppointment(null);
      toast.success('Agendamento criado!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Appointment.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelectedAppointment(null);
      toast.success('Agendamento atualizado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Appointment.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelectedAppointment(null);
      toast.success('Agendamento excluído!');
    }
  });

  const generateRecurringAppointments = (baseData) => {
    const appointments = [];
    const startDate = new Date(baseData.date);
    const endDate = new Date(baseData.recurrence_end_date);
    let currentDate = new Date(startDate);

    const parentId = `parent-${Date.now()}`;

    while (currentDate <= endDate) {
      appointments.push({
        ...baseData,
        date: new Date(currentDate).toISOString(),
        parent_appointment_id: parentId,
        is_recurring: false // Individual occurrences are not marked as recurring
      });

      // Increment based on pattern
      switch (baseData.recurrence_pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return appointments;
  };

  const handleSubmit = async (formData) => {
    if (selectedAppointment) {
      await updateMutation.mutateAsync({ id: selectedAppointment.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Agenda Inteligente
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            <span className="font-semibold">Agendamentos</span> e Calendário
          </h1>
        </div>
        <Button
          onClick={() => setShowNewAppointment(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="bg-white shadow-md p-1 rounded-xl">
          <TabsTrigger value="appointments" className="rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="availability" className="rounded-lg">
            <Clock className="w-4 h-4 mr-2" />
            Minha Disponibilidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Próximas</p>
            <p className="text-3xl font-bold text-blue-600">{upcomingAppointments.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Confirmadas</p>
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Concluídas</p>
            <p className="text-3xl font-bold text-gray-600">
              {appointments.filter(a => a.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Este Mês</p>
            <p className="text-3xl font-bold text-indigo-600">
              {appointments.filter(a => {
                const date = new Date(a.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
            size="sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Mês
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
            size="sm"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Semana
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Dia
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
          >
            <LayoutList className="w-4 h-4 mr-2" />
            Lista
          </Button>
        </div>

        {view === 'list' && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        )}
        </div>

        {/* Calendar/List View */}
        {view === 'list' ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const client = clients.find(c => c.id === appointment.client_id);
            return (
              <Card
                key={appointment.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{client?.full_name || 'Cliente'}</h3>
                        <Badge className={statusColors[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                        {appointment.parent_appointment_id && (
                          <Badge variant="outline">Recorrente</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Serviço:</strong> {serviceLabels[appointment.service_type]}</p>
                        <p><strong>Data:</strong> {new Date(appointment.date).toLocaleString('pt-BR')}</p>
                        <p><strong>Duração:</strong> {appointment.duration} minutos</p>
                        {appointment.location && <p><strong>Local:</strong> {appointment.location}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        ) : (
          <CalendarView
            appointments={appointments}
            view={view}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowNewAppointment(true);
            }}
            onSelectAppointment={setSelectedAppointment}
          />
        )}
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>

      {/* New/Edit Appointment Dialog */}
      <Dialog open={showNewAppointment || !!selectedAppointment} onOpenChange={(open) => {
        if (!open) {
          setShowNewAppointment(false);
          setSelectedAppointment(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AppointmentForm
                appointment={selectedAppointment}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowNewAppointment(false);
                  setSelectedAppointment(null);
                }}
              />
            </div>
            <div>
              <GoogleCalendarSync
                appointment={selectedAppointment}
                onSynced={() => queryClient.invalidateQueries({ queryKey: ['appointments'] })}
              />
              
              {selectedAppointment && (
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                      deleteMutation.mutate(selectedAppointment.id);
                    }
                  }}
                >
                  Excluir Agendamento
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}