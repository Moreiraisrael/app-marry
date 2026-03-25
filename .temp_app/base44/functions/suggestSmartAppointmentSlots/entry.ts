import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consultantId, clientId, serviceType, daysAhead = 14 } = await req.json();

    if (!consultantId || !clientId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Buscar dados necessários
    const [availability, existingAppointments, clientAppointments, client] = await Promise.all([
      base44.entities.ConsultantAvailability.filter({ 
        consultant_id: consultantId, 
        is_active: true 
      }),
      base44.entities.Appointment.filter({ consultant_id: consultantId }),
      base44.entities.Appointment.filter({ client_id: clientId }),
      base44.entities.Client.get(clientId)
    ]);

    // Configuração de tempo necessário por tipo de serviço
    const serviceTimeRequirements = {
      'coloracao': { duration: 120, prepTime: 180 }, // 2h consulta + 3h preparo dossiê
      'estilo': { duration: 90, prepTime: 120 }, // 1.5h consulta + 2h preparo
      'closet': { duration: 180, prepTime: 60 }, // 3h consulta + 1h organização
      'personal_shopping': { duration: 120, prepTime: 30 },
      'followup': { duration: 60, prepTime: 0 },
      'outro': { duration: 60, prepTime: 0 }
    };

    const serviceConfig = serviceTimeRequirements[serviceType] || serviceTimeRequirements['outro'];

    // Analisar padrões históricos da cliente
    const clientHistory = analyzeClientHistory(clientAppointments);

    // Gerar slots disponíveis
    const suggestedSlots = [];
    const now = new Date();
    
    for (let daysOffset = 1; daysOffset <= daysAhead; daysOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysOffset);
      const dayOfWeek = targetDate.getDay();

      // Verificar disponibilidade do consultor neste dia
      const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);

      for (const slot of dayAvailability) {
        const [startHour, startMin] = slot.start_time.split(':').map(Number);
        const [endHour, endMin] = slot.end_time.split(':').map(Number);

        let currentTime = new Date(targetDate);
        currentTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(targetDate);
        endTime.setHours(endHour, endMin, 0, 0);

        // Gerar slots dentro do período disponível
        while (currentTime < endTime) {
          const slotEndTime = new Date(currentTime.getTime() + serviceConfig.duration * 60000);

          if (slotEndTime <= endTime) {
            // Verificar se o slot está livre
            const isAvailable = !existingAppointments.some(apt => {
              const aptDate = new Date(apt.date);
              const aptEnd = new Date(aptDate.getTime() + (apt.duration || 60) * 60000);
              
              return (
                apt.status !== 'cancelled' &&
                ((currentTime >= aptDate && currentTime < aptEnd) ||
                 (slotEndTime > aptDate && slotEndTime <= aptEnd) ||
                 (currentTime <= aptDate && slotEndTime >= aptEnd))
              );
            });

            if (isAvailable) {
              // Verificar se há tempo suficiente antes para preparo (se necessário)
              const hasPreparationTime = checkPreparationTime(
                currentTime, 
                existingAppointments, 
                serviceConfig.prepTime
              );

              // Calcular score de adequação
              const score = calculateSlotScore(
                currentTime,
                clientHistory,
                serviceType,
                hasPreparationTime
              );

              suggestedSlots.push({
                datetime: currentTime.toISOString(),
                dayOfWeek: getDayName(dayOfWeek),
                time: `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`,
                duration: serviceConfig.duration,
                score: score,
                reason: generateReasonText(score, clientHistory, hasPreparationTime, serviceType),
                hasPreparationTime: hasPreparationTime,
                prepTimeMinutes: serviceConfig.prepTime
              });
            }
          }

          // Avançar para o próximo slot
          currentTime = new Date(currentTime.getTime() + slot.slot_duration * 60000);
        }
      }
    }

    // Ordenar por score (maior para menor)
    suggestedSlots.sort((a, b) => b.score - a.score);

    // Retornar top 10 sugestões
    return Response.json({
      suggestions: suggestedSlots.slice(0, 10),
      clientPreferences: clientHistory,
      serviceRequirements: serviceConfig
    });

  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeClientHistory(appointments) {
  if (appointments.length === 0) {
    return {
      preferredDays: [],
      preferredTimes: [],
      avgAppointmentsPerMonth: 0,
      lastAppointment: null
    };
  }

  const dayCount = {};
  const hourCount = {};
  
  appointments.forEach(apt => {
    const date = new Date(apt.date);
    const day = date.getDay();
    const hour = date.getHours();

    dayCount[day] = (dayCount[day] || 0) + 1;
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });

  const preferredDays = Object.entries(dayCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([day]) => parseInt(day));

  const preferredTimes = Object.entries(hourCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([hour]) => parseInt(hour));

  const lastApt = appointments
    .filter(a => new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return {
    preferredDays,
    preferredTimes,
    avgAppointmentsPerMonth: appointments.length / 
      Math.max(1, (Date.now() - new Date(appointments[0].created_date).getTime()) / (30 * 24 * 60 * 60 * 1000)),
    lastAppointment: lastApt?.date || null
  };
}

function checkPreparationTime(slotTime, existingAppointments, requiredMinutes) {
  if (requiredMinutes === 0) return true;

  const prepStartTime = new Date(slotTime.getTime() - requiredMinutes * 60000);

  // Verificar se há tempo livre antes do slot
  const hasConflict = existingAppointments.some(apt => {
    const aptDate = new Date(apt.date);
    const aptEnd = new Date(aptDate.getTime() + (apt.duration || 60) * 60000);
    
    return (
      apt.status !== 'cancelled' &&
      aptEnd > prepStartTime &&
      aptDate < slotTime
    );
  });

  return !hasConflict;
}

function calculateSlotScore(slotTime, clientHistory, serviceType, hasPreparationTime) {
  let score = 50; // Base score

  const dayOfWeek = slotTime.getDay();
  const hour = slotTime.getHours();

  // Preferência de dia (+20 pontos)
  if (clientHistory.preferredDays.includes(dayOfWeek)) {
    score += 20;
  }

  // Preferência de horário (+20 pontos)
  if (clientHistory.preferredTimes.includes(hour)) {
    score += 20;
  }

  // Tempo de preparo disponível (+15 pontos)
  if (hasPreparationTime) {
    score += 15;
  }

  // Horários ideais gerais
  if (hour >= 9 && hour <= 11) {
    score += 10; // Manhã produtiva
  } else if (hour >= 14 && hour <= 16) {
    score += 8; // Tarde tranquila
  }

  // Evitar sexta à tarde e segunda de manhã muito cedo
  if (dayOfWeek === 5 && hour >= 16) {
    score -= 5; // Sexta tarde
  } else if (dayOfWeek === 1 && hour < 10) {
    score -= 5; // Segunda muito cedo
  }

  // Serviços complexos preferem manhãs
  if (['coloracao', 'estilo', 'closet'].includes(serviceType) && hour >= 9 && hour <= 12) {
    score += 10;
  }

  // Intervalo desde última consulta
  if (clientHistory.lastAppointment) {
    const daysSinceLastVisit = (slotTime - new Date(clientHistory.lastAppointment)) / (24 * 60 * 60 * 1000);
    if (daysSinceLastVisit >= 30 && daysSinceLastVisit <= 45) {
      score += 10; // Bom intervalo para acompanhamento
    }
  }

  return Math.min(100, Math.max(0, score));
}

function generateReasonText(score, clientHistory, hasPreparationTime, serviceType) {
  const reasons = [];

  if (score >= 80) {
    reasons.push('⭐ Horário ideal');
  }

  if (clientHistory.preferredDays.length > 0 || clientHistory.preferredTimes.length > 0) {
    reasons.push('Baseado no histórico da cliente');
  }

  if (hasPreparationTime) {
    reasons.push('Tempo adequado para preparação do dossiê');
  }

  if (['coloracao', 'estilo'].includes(serviceType)) {
    reasons.push('Horário otimizado para serviços detalhados');
  }

  return reasons.join(' • ') || 'Horário disponível';
}

function getDayName(dayNum) {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayNum];
}