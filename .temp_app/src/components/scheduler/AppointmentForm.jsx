import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react';

export default function AppointmentForm({ appointment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(appointment || {
    client_id: '',
    service_type: 'coloracao',
    date: '',
    time: '',
    duration: 60,
    location: '',
    notes: '',
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '',
    color: '#e11d48'
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-form'],
    queryFn: () => base44.entities.Client.list()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    onSubmit({
      ...formData,
      date: dateTime.toISOString()
    });
  };

  const serviceTypes = [
    { value: 'coloracao', label: 'Análise de Coloração', duration: 90 },
    { value: 'estilo', label: 'Análise de Estilo', duration: 120 },
    { value: 'closet', label: 'Organização de Closet', duration: 180 },
    { value: 'personal_shopping', label: 'Personal Shopping', duration: 120 },
    { value: 'followup', label: 'Follow-up', duration: 45 },
    { value: 'outro', label: 'Outro', duration: 60 }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Cliente *</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo de Serviço *</Label>
          <Select
            value={formData.service_type}
            onValueChange={(value) => {
              const service = serviceTypes.find(s => s.value === value);
              setFormData({
                ...formData,
                service_type: value,
                duration: service?.duration || 60
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map(service => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Data *</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <Label htmlFor="time">Horário *</Label>
          <div className="relative">
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <Label htmlFor="duration">Duração (minutos)</Label>
          <Input
            id="duration"
            type="number"
            min="15"
            step="15"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            placeholder="Presencial, Zoom, etc."
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Notas sobre a consulta..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Recurrence Section */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
          />
          <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
            <Repeat className="w-4 h-4" />
            Agendamento Recorrente
          </Label>
        </div>

        {formData.is_recurring && (
          <div className="grid md:grid-cols-2 gap-4 ml-6">
            <div>
              <Label>Padrão de Recorrência</Label>
              <Select
                value={formData.recurrence_pattern}
                onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="biweekly">Quinzenalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurrence_end">Data de Término</Label>
              <Input
                id="recurrence_end"
                type="date"
                value={formData.recurrence_end_date}
                onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600">
          {appointment ? 'Atualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
}