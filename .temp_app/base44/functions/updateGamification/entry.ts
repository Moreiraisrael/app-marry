import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, action_type, metadata } = await req.json();

    // Buscar ou criar StyleEvolution para a cliente
    let evolutionRecords = await base44.entities.StyleEvolution.filter({ client_id });
    let evolution = evolutionRecords[0];

    if (!evolution) {
      evolution = await base44.entities.StyleEvolution.create({
        client_id,
        evolution_phase: 'foundational',
        current_style_level: 1,
        points: 0,
        points_this_month: 0,
        badges: [],
        streak_days: 0,
        evolution_score: 0
      });
    }

    // Sistema de pontuação baseado em ações
    const pointsMap = {
      'feedback_submitted': 10,
      'photo_uploaded': 15,
      'outfit_tried': 20,
      'quiz_completed': 50,
      'challenge_completed': 100,
      'appointment_attended': 30,
      'shopping_list_item_purchased': 25,
      'style_evolution_milestone': 150,
      'wardrobe_analyzed': 40,
      'trend_explored': 35
    };

    const points_earned = pointsMap[action_type] || 0;
    const new_points = (evolution.points || 0) + points_earned;
    const new_points_month = (evolution.points_this_month || 0) + points_earned;

    // Calcular novo nível baseado em pontos
    const level = Math.floor(new_points / 500) + 1;

    // Calcular fase de evolução
    let phase = 'foundational';
    if (level >= 10) phase = 'mastery';
    else if (level >= 6) phase = 'advanced';
    else if (level >= 3) phase = 'intermediate';

    // Sistema de badges
    const badges = evolution.badges || [];
    const newBadges = [];

    // Verificar conquistas
    const achievements = [
      { 
        id: 'first_steps', 
        name: 'Primeiros Passos', 
        condition: new_points >= 100,
        icon: '👣',
        description: 'Você começou sua jornada de estilo!'
      },
      { 
        id: 'trend_explorer', 
        name: 'Exploradora de Tendências', 
        condition: action_type === 'trend_explored' && new_points >= 200,
        icon: '🔥',
        description: 'Você está sempre por dentro das tendências!'
      },
      { 
        id: 'wardrobe_master', 
        name: 'Mestra do Guarda-Roupa', 
        condition: action_type === 'wardrobe_analyzed' && new_points >= 300,
        icon: '👗',
        description: 'Seu guarda-roupa está impecável!'
      },
      { 
        id: 'style_maven', 
        name: 'Maven de Estilo', 
        condition: level >= 5,
        icon: '⭐',
        description: 'Você atingiu um alto nível de expertise em estilo!'
      },
      { 
        id: 'consistent_stylist', 
        name: 'Estilista Consistente', 
        condition: (evolution.streak_days || 0) >= 7,
        icon: '🔥',
        description: 'Você manteve seu engajamento por 7 dias seguidos!'
      },
      { 
        id: 'photo_enthusiast', 
        name: 'Entusiasta de Fotos', 
        condition: action_type === 'photo_uploaded' && new_points >= 150,
        icon: '📸',
        description: 'Você adora compartilhar seus looks!'
      },
      { 
        id: 'challenge_champion', 
        name: 'Campeã de Desafios', 
        condition: action_type === 'challenge_completed',
        icon: '🏆',
        description: 'Você completou um desafio de estilo!'
      },
      { 
        id: 'style_evolution', 
        name: 'Evolução de Estilo', 
        condition: level >= 3,
        icon: '🦋',
        description: 'Seu estilo evoluiu significativamente!'
      }
    ];

    for (const achievement of achievements) {
      const alreadyHas = badges.some(b => b.badge_id === achievement.id);
      if (achievement.condition && !alreadyHas) {
        const newBadge = {
          badge_id: achievement.id,
          badge_name: achievement.name,
          badge_icon: achievement.icon,
          description: achievement.description,
          earned_date: new Date().toISOString(),
          category: 'achievement'
        };
        badges.push(newBadge);
        newBadges.push(newBadge);

        // Criar registro de conquista
        await base44.entities.ClientAchievement.create({
          client_id,
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          points: 50,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Atualizar streak (engajamento diário)
    const lastEngagement = evolution.last_engagement_date ? new Date(evolution.last_engagement_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = evolution.streak_days || 0;
    if (lastEngagement) {
      const lastDate = new Date(lastEngagement);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    // Calcular evolution score
    const evolution_score = Math.min(100, Math.floor(
      (level * 10) + 
      (streak * 2) + 
      (badges.length * 5)
    ));

    // Criar notificações para novos badges
    const notifications = evolution.notifications || [];
    for (const badge of newBadges) {
      notifications.push({
        id: Date.now().toString() + Math.random(),
        type: 'badge_earned',
        title: 'Nova Conquista! 🎉',
        message: `Você ganhou o badge "${badge.badge_name}"! ${badge.description}`,
        created_date: new Date().toISOString(),
        read: false
      });
    }

    // Se subiu de nível, notificar
    if (level > evolution.current_style_level) {
      notifications.push({
        id: Date.now().toString() + Math.random(),
        type: 'phase_upgrade',
        title: 'Subiu de Nível! 🌟',
        message: `Parabéns! Você alcançou o nível ${level} de estilo!`,
        created_date: new Date().toISOString(),
        read: false
      });
    }

    // Atualizar StyleEvolution
    const updatedEvolution = await base44.entities.StyleEvolution.update(evolution.id, {
      points: new_points,
      points_this_month: new_points_month,
      current_style_level: level,
      evolution_phase: phase,
      badges,
      streak_days: streak,
      last_engagement_date: new Date().toISOString(),
      evolution_score,
      notifications
    });

    return Response.json({
      success: true,
      points_earned,
      new_points,
      level,
      phase,
      new_badges: newBadges,
      streak_days: streak,
      evolution_score,
      evolution: updatedEvolution
    });

  } catch (error) {
    console.error('Gamification error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});