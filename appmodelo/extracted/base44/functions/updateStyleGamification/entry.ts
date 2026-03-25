import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BADGE_DEFINITIONS = {
  first_step: {
    id: 'first_step',
    name: 'Primeiro Passo',
    icon: '👟',
    description: 'Completou a primeira sugestão de estilo',
    points: 50,
    category: 'milestone'
  },
  explorer: {
    id: 'explorer',
    name: 'Explorador',
    icon: '🗺️',
    description: 'Completou 5 sugestões diferentes',
    points: 150,
    category: 'achievement'
  },
  trendsetter: {
    id: 'trendsetter',
    name: 'Trendsetter',
    icon: '✨',
    description: 'Experimentou tendências do roadmap',
    points: 200,
    category: 'exploration'
  },
  consistency_warrior: {
    id: 'consistency_warrior',
    name: 'Guerreira Consistente',
    icon: '⚔️',
    description: '7 dias seguidos de engajamento',
    points: 250,
    category: 'consistency'
  },
  goal_crusher: {
    id: 'goal_crusher',
    name: 'Destructora de Metas',
    icon: '🎯',
    description: 'Completou uma meta de longo prazo',
    points: 300,
    category: 'achievement'
  },
  phase_up: {
    id: 'phase_up',
    name: 'Evolução em Progresso',
    icon: '📈',
    description: 'Atingiu uma nova fase de evolução',
    points: 400,
    category: 'milestone'
  },
  master_stylist: {
    id: 'master_stylist',
    name: 'Mestre do Estilo',
    icon: '👑',
    description: 'Atingiu nível 9+ de desenvolvimento',
    points: 500,
    category: 'achievement'
  },
  wardrobe_architect: {
    id: 'wardrobe_architect',
    name: 'Arquiteta do Guarda-Roupa',
    icon: '🏗️',
    description: 'Preencheu lacunas críticas do guarda-roupa',
    points: 280,
    category: 'achievement'
  }
};

const POINTS_CONFIG = {
  easy_suggestion: 30,
  moderate_suggestion: 50,
  challenging_suggestion: 80,
  goal_milestone: 100,
  daily_engagement: 20
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { clientId, action, data } = await req.json();

    if (!clientId || !action) {
      return Response.json({ error: 'clientId and action required' }, { status: 400 });
    }

    // Fetch current evolution
    const evolutions = await base44.entities.StyleEvolution.filter({ client_id: clientId });
    const evolution = evolutions[0];

    if (!evolution) {
      return Response.json({ error: 'Evolution not found' }, { status: 404 });
    }

    let pointsGained = 0;
    const newBadges = [];
    const newNotifications = [];
    const updatedEvolution = { ...evolution };

    // Handle different actions
    switch (action) {
      case 'complete_suggestion': {
        const suggestion = evolution.suggestions?.find(s => s.id === data.suggestionId);
        if (!suggestion) break;

        // Calculate points based on difficulty
        const difficultyPoints = {
          easy: POINTS_CONFIG.easy_suggestion,
          moderate: POINTS_CONFIG.moderate_suggestion,
          challenging: POINTS_CONFIG.challenging_suggestion
        };

        pointsGained = difficultyPoints[suggestion.estimated_difficulty] || 30;

        // Mark suggestion as completed
        updatedEvolution.suggestions = evolution.suggestions.map(s =>
          s.id === data.suggestionId ? { ...s, status: 'completed' } : s
        );

        newNotifications.push({
          id: `notif-${Date.now()}`,
          type: 'milestone',
          title: '✨ Sugestão Completada!',
          message: `Você ganhou ${pointsGained} pontos!`,
          created_date: new Date().toISOString(),
          read: false
        });

        // Check for explorer badge (5 completed suggestions)
        const completedCount = updatedEvolution.suggestions.filter(s => s.status === 'completed').length;
        if (completedCount === 5 && !evolution.badges?.some(b => b.badge_id === 'explorer')) {
          newBadges.push(BADGE_DEFINITIONS.explorer);
        }
        break;
      }

      case 'complete_goal': {
        const goal = evolution.long_term_goals?.find(g => g.id === data.goalId);
        if (!goal) break;

        pointsGained = goal.points_reward || POINTS_CONFIG.goal_milestone;

        // Mark goal as completed
        updatedEvolution.long_term_goals = evolution.long_term_goals.map(g =>
          g.id === data.goalId
            ? { ...g, progress_percentage: 100, completed_date: new Date().toISOString() }
            : g
        );

        newNotifications.push({
          id: `notif-${Date.now()}`,
          type: 'goal_progress',
          title: '🎯 Meta Alcançada!',
          message: `${goal.goal} - Ganhou ${pointsGained} pontos!`,
          created_date: new Date().toISOString(),
          read: false
        });

        // Award goal crusher badge
        if (!evolution.badges?.some(b => b.badge_id === 'goal_crusher')) {
          newBadges.push(BADGE_DEFINITIONS.goal_crusher);
        }
        break;
      }

      case 'daily_engagement': {
        pointsGained = POINTS_CONFIG.daily_engagement;

        const today = new Date().toISOString().split('T')[0];
        const lastDate = evolution.last_engagement_date?.split('T')[0];
        const today_date = new Date(today);
        const last_date = lastDate ? new Date(lastDate) : null;

        let newStreak = 1;
        if (last_date) {
          const diff = (today_date - last_date) / (1000 * 60 * 60 * 24);
          newStreak = diff === 1 ? (evolution.streak_days || 0) + 1 : 1;
        }

        updatedEvolution.streak_days = newStreak;
        updatedEvolution.last_engagement_date = new Date().toISOString();

        // Award consistency badge at 7 days
        if (newStreak === 7 && !evolution.badges?.some(b => b.badge_id === 'consistency_warrior')) {
          newBadges.push(BADGE_DEFINITIONS.consistency_warrior);
          newNotifications.push({
            id: `notif-${Date.now()}`,
            type: 'badge_earned',
            title: '⚔️ Guerreira Consistente!',
            message: 'Você mantém 7 dias de engajamento consecutivo!',
            created_date: new Date().toISOString(),
            read: false
          });
        }
        break;
      }

      case 'phase_upgrade': {
        const phases = ['foundational', 'intermediate', 'advanced', 'mastery'];
        const currentPhaseIdx = phases.indexOf(evolution.evolution_phase);

        if (currentPhaseIdx < phases.length - 1) {
          const newPhase = phases[currentPhaseIdx + 1];
          updatedEvolution.evolution_phase = newPhase;
          pointsGained = BADGE_DEFINITIONS.phase_up.points;

          if (!evolution.badges?.some(b => b.badge_id === 'phase_up')) {
            newBadges.push(BADGE_DEFINITIONS.phase_up);
          }

          newNotifications.push({
            id: `notif-${Date.now()}`,
            type: 'phase_upgrade',
            title: '📈 Nova Fase Desbloqueada!',
            message: `Você avançou para a fase ${newPhase === 'intermediate' ? 'Intermediária' : newPhase === 'advanced' ? 'Avançada' : 'Domínio'}!`,
            created_date: new Date().toISOString(),
            read: false
          });
        }
        break;
      }
    }

    // Update points
    updatedEvolution.points = (evolution.points || 0) + pointsGained;
    updatedEvolution.points_this_month = (evolution.points_this_month || 0) + pointsGained;

    // Add badges
    if (newBadges.length > 0) {
      const existingBadges = evolution.badges || [];
      updatedEvolution.badges = [
        ...existingBadges,
        ...newBadges.map(badge => ({
          badge_id: badge.id,
          badge_name: badge.name,
          badge_icon: badge.icon,
          description: badge.description,
          earned_date: new Date().toISOString(),
          category: badge.category
        }))
      ];
    }

    // Add notifications
    if (newNotifications.length > 0) {
      updatedEvolution.notifications = [
        ...(evolution.notifications || []),
        ...newNotifications
      ];
    }

    // Check for master stylist badge
    if (updatedEvolution.current_style_level >= 9 && !evolution.badges?.some(b => b.badge_id === 'master_stylist')) {
      if (!updatedEvolution.badges) updatedEvolution.badges = [];
      updatedEvolution.badges.push({
        badge_id: BADGE_DEFINITIONS.master_stylist.id,
        badge_name: BADGE_DEFINITIONS.master_stylist.name,
        badge_icon: BADGE_DEFINITIONS.master_stylist.icon,
        description: BADGE_DEFINITIONS.master_stylist.description,
        earned_date: new Date().toISOString(),
        category: BADGE_DEFINITIONS.master_stylist.category
      });
    }

    // Update in database
    await base44.entities.StyleEvolution.update(evolution.id, updatedEvolution);

    return Response.json({
      success: true,
      pointsGained,
      newBadges,
      newNotifications,
      totalPoints: updatedEvolution.points,
      streak: updatedEvolution.streak_days
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});