import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 5.99,
    currency: 'USD',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-500',
    features: [
      'Acesso ao dossiê completo',
      'Cartela de cores personalizada',
      'Análise de estilo',
      'Suporte por email',
      '7 dias grátis para testar'
    ],
    looksLimit: 0,
    virtualTryOnCredits: 0,
    trialDays: 7,
    description: 'Perfeito para começar sua jornada de estilo'
  },
  {
    id: 'intermediario',
    name: 'Intermediário',
    price: 9.99,
    currency: 'USD',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    popular: true,
    features: [
      'Tudo do Básico',
      '5 créditos provador virtual/mês',
      'Créditos extras: $2.00 cada',
      'Chat prioritário com consultora',
      '7 dias grátis para testar'
    ],
    looksLimit: 10,
    virtualTryOnCredits: 5,
    extraCreditPrice: 2.00,
    extraCreditCurrency: 'USD',
    trialDays: 7,
    description: 'Ideal para experimentar o provador virtual'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'USD',
    icon: Crown,
    color: 'from-rose-400 to-amber-500',
    features: [
      'Tudo do Intermediário',
      'Créditos provador virtual ILIMITADOS',
      'Looks ilimitados com IA',
      'Consultoria prioritária',
      'Primeiro mês grátis c/ cupom consultora',
      '7 dias grátis para testar'
    ],
    looksLimit: -1,
    virtualTryOnCredits: -1,
    trialDays: 7,
    description: 'Experiência completa e exclusiva',
    discounts: [
      { type: 'Semestral', months: 6, discount: 10, price: 17.99, currency: 'USD' },
      { type: 'Anual', months: 12, discount: 20, price: 15.99, currency: 'USD' }
    ]
  }
];

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        const clients = await base44.entities.Client.filter({ email: user.email });
        if (clients[0]) {
          setClient(clients[0]);
          const subs = await base44.entities.Subscription.filter({ 
            client_id: clients[0].id,
            status: 'active'
          });
          if (subs[0]) setCurrentSubscription(subs[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!client) {
      toast.error('Erro ao carregar dados do cliente');
      return;
    }

    setLoading(true);
    try {
      // Cancelar assinatura atual se existir
      if (currentSubscription) {
        await base44.entities.Subscription.update(currentSubscription.id, {
          status: 'cancelled'
        });
      }

      // Criar nova assinatura
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await base44.entities.Subscription.create({
        client_id: client.id,
        plan: plan.id,
        looks_limit: plan.looksLimit,
        looks_used_this_month: 0,
        last_reset_date: today,
        start_date: today,
        end_date: endDate.toISOString().split('T')[0],
        price: plan.price,
        status: 'active'
      });

      toast.success(`Plano ${plan.name} ativado com sucesso! 🎉`);
      setTimeout(() => {
        navigate(createPageUrl('ClientPortal'));
      }, 1500);
    } catch (error) {
      toast.error('Erro ao processar assinatura');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do seu estilo com nossas assinaturas personalizadas
          </p>
          {currentSubscription && (
            <Badge className="mt-4 text-sm px-4 py-2 bg-green-600">
              Plano Atual: {plans.find(p => p.id === currentSubscription.plan)?.name}
            </Badge>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentSubscription?.plan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative border-0 shadow-xl transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-rose-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full mb-4 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600 text-sm">
                Sim! Você pode cancelar sua assinatura quando quiser, sem taxas ou multas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funciona o limite de looks?
              </h3>
              <p className="text-gray-600 text-sm">
                No plano Premium, você tem 10 gerações de looks por mês. No VIP, é ilimitado!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600 text-sm">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}