import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleCalendarSync({ appointment, onSynced }) {
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  const syncToGoogleCalendar = async () => {
    setSync(true);
    try {
      toast.info('Integração com Google Calendar disponível após habilitar backend functions nas configurações do app');
      
      // Exemplo de como seria a integração:
      // const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
      // const event = {
      //   summary: `${appointment.service_type} - ${appointment.client_name}`,
      //   start: { dateTime: appointment.date },
      //   end: { dateTime: new Date(new Date(appointment.date).getTime() + appointment.duration * 60000) },
      //   description: appointment.notes
      // };
      // const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
      
    } catch (error) {
      toast.error('Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          Sincronização com Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {appointment?.google_calendar_event_id ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Sincronizado com Google Calendar</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Não sincronizado</span>
              </>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <strong>💡 Dica:</strong> Para habilitar a sincronização automática com Google Calendar:
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Ative backend functions nas configurações do app</li>
              <li>Conecte sua conta do Google Calendar</li>
              <li>Os agendamentos serão sincronizados automaticamente</li>
            </ol>
          </div>

          <Button
            onClick={syncToGoogleCalendar}
            disabled={syncing || !appointment}
            variant="outline"
            className="w-full"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}