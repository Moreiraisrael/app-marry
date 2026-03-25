import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    // Suporta tanto chamada direta quanto automação de entidade
    let appointmentId, type, appointment;
    
    if (body.event) {
      // Chamada vinda de automação de entidade
      appointmentId = body.event.entity_id;
      type = 'confirmation';
      appointment = body.data;
    } else {
      // Chamada direta
      appointmentId = body.appointmentId;
      type = body.type;
      appointment = await base44.asServiceRole.entities.Appointment.get(appointmentId);
    }

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const client = await base44.asServiceRole.entities.Client.get(appointment.client_id);

    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const serviceNames = {
      'coloracao': 'Análise de Coloração Pessoal',
      'estilo': 'Consultoria de Estilo',
      'closet': 'Organização de Guarda-Roupa',
      'personal_shopping': 'Personal Shopping',
      'followup': 'Sessão de Acompanhamento',
      'outro': 'Consulta'
    };

    const serviceName = serviceNames[appointment.service_type] || 'Consulta';

    if (type === 'confirmation') {
      // Email para cliente
      const clientEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #667eea; margin-top: 0;">✨ Consulta Confirmada!</h1>
            <p style="font-size: 16px; color: #333;">Olá ${client.full_name},</p>
            <p style="font-size: 16px; color: #333;">Sua consulta de <strong>${serviceName}</strong> foi confirmada!</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #555;"><strong>📅 Data:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0; color: #555;"><strong>🕐 Horário:</strong> ${formattedTime}</p>
              <p style="margin: 5px 0; color: #555;"><strong>⏱️ Duração:</strong> ${appointment.duration || 60} minutos</p>
              ${appointment.location ? `<p style="margin: 5px 0; color: #555;"><strong>📍 Local:</strong> ${appointment.location}</p>` : ''}
            </div>

            ${appointment.client_notes ? `<p style="color: #666; font-style: italic;">"${appointment.client_notes}"</p>` : ''}

            <p style="font-size: 14px; color: #888; margin-top: 30px;">Estamos ansiosas para ajudá-la na sua jornada de estilo! 💜</p>
            <p style="font-size: 14px; color: #888;">Atenciosamente,<br/>Sua Consultora de Estilo</p>
          </div>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: client.email,
        subject: `✨ ${serviceName} Confirmada - ${formattedDate}`,
        body: clientEmailBody
      });

      // Email para consultora
      const consultantEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">🎉 Nova Consulta Agendada</h2>
          <p><strong>Cliente:</strong> ${client.full_name}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Telefone:</strong> ${client.phone || 'Não informado'}</p>
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${formattedDate}</p>
          <p><strong>Horário:</strong> ${formattedTime}</p>
          <p><strong>Duração:</strong> ${appointment.duration || 60} minutos</p>
          ${appointment.client_notes ? `<p><strong>Observações da Cliente:</strong> ${appointment.client_notes}</p>` : ''}
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: appointment.consultant_id,
        subject: `📅 Nova Consulta: ${client.full_name} - ${formattedDate}`,
        body: consultantEmailBody
      });

    } else if (type === 'reminder') {
      // Lembretes 24h antes
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: client.email,
        subject: `⏰ Lembrete: ${serviceName} Amanhã`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">⏰ Lembrete de Consulta</h2>
            <p>Olá ${client.full_name},</p>
            <p>Sua consulta de <strong>${serviceName}</strong> é <strong>amanhã</strong>!</p>
            <p><strong>Horário:</strong> ${formattedTime}</p>
            <p><strong>Duração:</strong> ${appointment.duration || 60} minutos</p>
            <p style="margin-top: 20px;">Estamos aguardando você! 💜</p>
          </div>
        `
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: appointment.consultant_id,
        subject: `⏰ Lembrete: Consulta com ${client.full_name} amanhã`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">⏰ Lembrete de Consulta</h2>
            <p>Você tem consulta com <strong>${client.full_name}</strong> amanhã.</p>
            <p><strong>Serviço:</strong> ${serviceName}</p>
            <p><strong>Horário:</strong> ${formattedTime}</p>
            <p><strong>Duração:</strong> ${appointment.duration || 60} minutos</p>
          </div>
        `
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});