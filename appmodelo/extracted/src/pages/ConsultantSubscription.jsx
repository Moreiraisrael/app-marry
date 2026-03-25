import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const consultantPlans = {
  mensal: {
    name: 'Plano Mensal',
    price: 49.90,
    priceLabel: '$49.90/mês',
    currency: 'USD',
    clientLimit: 20,
    features: [
      'Até 20 clientes ativas',
      'Dashboard completo',
      'Análises IA ilimitadas',
      'Provador virtual ilimitado',
      'Geração de dossiês',
      'Suporte prioritário',
      'Clientes excedentes: $10.00/cliente',
      '7 dias grátis para testar'
    ]
  },
  trimestral: {
    name: 'Plano Trimestral',
    price: 39.90,
    priceLabel: '$39.90/mês',
    totalPrice: 119.70,
    savings: 30.00,
    currency: 'USD',
    clientLimit: 20,
    popular: true,
    features: [
      'Até 20 clientes ativas',
      'ECONOMIZE $30.00 (3 meses)',
      'Dashboard completo',
      'Análises IA ilimitadas',
      'Provador virtual ilimitado',
      'Geração de dossiês',
      'Suporte prioritário',
      'Clientes excedentes: $10.00/cliente',
      '7 dias grátis para testar'
    ]
  },
  anual: {
    name: 'Plano Anual',
    price: 29.90,
    priceLabel: '$29.90/mês',
    totalPrice: 358.80,
    savings: 240.00,
    currency: 'USD',
    clientLimit: 20,
    bestValue: true,
    features: [
      'Até 20 clientes ativas',
      'ECONOMIZE $240.00 (12 meses)',
      'Dashboard completo',
      'Análises IA ilimitadas',
      'Provador virtual ilimitado',
      'Geração de dossiês',
      'Suporte prioritário VIP',
      'Clientes excedentes: $10.00/cliente',
      '7 dias grátis para testar'
    ]
  }
};

export default function ConsultantSubscription() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['consultant-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.ConsultantSubscription.filter({ 
        consultant_id: user.email,
        status: ['active', 'trial']
      });
      return subs[0];
    },
    enabled: !!user
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['consultant-clients', user?.email],
    queryFn: () => base44.entities.Client.filter({ consultant_id: user.email }),
    enabled: !!user
  });

  const subscribeMutation = useMutation({
    mutationFn: async (plan) => {
      const today = new Date();
      const trialEnd = addDays(today, 7);
      const endDate = plan === 'anual' 
        ? addDays(trialEnd, 365)
        : plan === 'trimestral' 
        ? addDays(trialEnd, 90) 
        : addDays(trialEnd, 30);

      if (subscription) {
        return await base44.entities.ConsultantSubscription.update(subscription.id, {
          plan: plan,
          price: consultantPlans[plan].price,
          end_date: endDate.toISOString().split('T')[0]
        });
      } else {
        return await base44.entities.ConsultantSubscription.create({
          consultant_id: user.email,
          plan: plan,
          status: 'trial',
          price: consultantPlans[plan].price,
          client_limit: consultantPlans[plan].clientLimit,
          clients_count: clients.length,
          trial_end_date: trialEnd.toISOString().split('T')[0],
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['consultant-subscription']);
      toast.success('Plano ativado com sucesso! 🎉');
    }
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const isInTrial = subscription?.status === 'trial';
  const trialDaysLeft = subscription?.trial_end_date 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Planos para <span className="font-semibold">Consultoras</span>
          </h1>
          <p className="text-gray-600">
            Gerencie até 5 clientes com ferramentas profissionais de análise de imagem
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="border-0 shadow-xl mb-8 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-violet-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {consultantPlans[subscription.plan].name}
                    </h3>
                    {isInTrial && (
                      <Badge className="bg-amber-500">
                        <Gift className="w-3 h-3 mr-1" />
                        Período de Teste
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-violet-600">
                    {consultantPlans[subscription.plan].priceLabel}
                  </p>
                </div>
                <Badge 
                  className={subscription.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}
                >
                  {subscription.status === 'active' ? 'Ativa' : 'Teste Grátis'}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {isInTrial && trialDaysLeft !== null && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-semibold text-gray-900">Teste Grátis</span>
                    </div>
                    <p className="text-lg font-bold text-amber-900">
                      {trialDaysLeft} dias restantes
                    </p>
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Clientes</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {clients.length} / {subscription.client_limit}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">Renovação</span>
                  </div>
                  <p className="text-sm font-bold text-green-900">
                    {format(new Date(subscription.end_date), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(consultantPlans).map(([key, plan]) => {
            const isCurrent = subscription?.plan === key;
            
            return (
              <Card 
                key={key}
                className={`border-0 shadow-xl overflow-hidden transition-all hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-violet-500' : ''
                } ${plan.bestValue ? 'ring-2 ring-amber-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1">
                      Mais Vantajoso
                    </Badge>
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1">
                      Melhor Valor
                    </Badge>
                  </div>
                )}
                
                <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.priceLabel.split('/')[0]}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  {plan.totalPrice && (
                    <p className="text-sm text-gray-600 mt-2">
                      Total: ${plan.totalPrice.toFixed(2)} {key === 'anual' ? 'por ano' : 'a cada 3 meses'}
                    </p>
                  )}
                  {plan.savings && (
                    <Badge className="mt-2 bg-green-100 text-green-700">
                      Economize ${plan.savings.toFixed(2)}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => subscribeMutation.mutate(key)}
                    disabled={isCurrent || subscribeMutation.isPending}
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                    }`}
                  >
                    {isCurrent ? (
                      'Plano Atual'
                    ) : subscribeMutation.isPending ? (
                      'Processando...'
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Começar Teste Grátis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>✨ <strong>7 dias grátis:</strong> Teste todos os recursos sem compromisso</p>
            <p>👥 <strong>Até 20 clientes:</strong> Gerencie até 20 clientes simultaneamente</p>
            <p>➕ <strong>Clientes excedentes:</strong> $10.00 por cliente adicional</p>
            <p>🎨 <strong>Ferramentas profissionais:</strong> IA para análise, provador virtual, geração de dossiês</p>
            <p>💳 <strong>Sem fidelidade:</strong> Cancele quando quiser, sem taxas</p>
            <p>💰 <strong>Plano anual:</strong> Economize $240.00 por ano</p>
            <p>🏢 <strong>Acima de 100 clientes:</strong> Entre em contato para planos personalizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}