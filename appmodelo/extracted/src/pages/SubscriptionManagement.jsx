import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Sparkles,
  Crown,
  Shield,
  TrendingUp,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Substitua pela sua chave pública do Stripe
const stripePromise = loadStripe('pk_test_51YOUR_STRIPE_KEY');

const planConfig = {
  basico: {
    name: 'Básico',
    price: 5.99,
    icon: Shield,
    color: 'from-gray-400 to-gray-600',
    features: ['Acesso ao Dossiê Completo', 'Análise de coloração pessoal', 'Suporte por email'],
    virtualTryOnCredits: 0,
    trialDays: 7
  },
  intermediario: {
    name: 'Intermediário',
    price: 9.99,
    icon: Sparkles,
    color: 'from-purple-400 to-purple-600',
    features: ['Tudo do Básico', '5 créditos provador virtual/mês', 'Créditos extras: R$2,00 cada', 'Suporte prioritário'],
    virtualTryOnCredits: 5,
    extraCreditPrice: 2.00,
    trialDays: 7
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    icon: Crown,
    color: 'from-rose-400 to-amber-600',
    features: ['Tudo do Intermediário', 'Créditos provador virtual ILIMITADOS', 'Consultoria prioritária', 'Cupom 1º mês grátis da consultora'],
    virtualTryOnCredits: -1,
    trialDays: 7,
    discounts: {
      semestral: { months: 6, discount: 10, pricePerMonth: 17.99 },
      anual: { months: 12, discount: 20, pricePerMonth: 15.99 }
    }
  }
};

function CheckoutForm({ amount, plan, clientId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      // Criar Payment Intent (simulado)
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      // Salvar pagamento no banco
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await base44.entities.Payment.create({
        client_id: clientId,
        amount: amount,
        status: 'completed',
        payment_method: 'credit_card',
        stripe_payment_intent_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        card_last4: paymentMethod.card.last4,
        card_brand: paymentMethod.card.brand,
        period_start: today.toISOString().split('T')[0],
        period_end: nextMonth.toISOString().split('T')[0]
      });

      // Atualizar ou criar assinatura
      const existingSubs = await base44.entities.Subscription.filter({ 
        client_id: clientId,
        status: 'active'
      });

      if (existingSubs[0]) {
        await base44.entities.Subscription.update(existingSubs[0].id, {
          plan: plan,
          price: amount,
          looks_limit: plan === 'vip' ? -1 : plan === 'premium' ? 10 : 0,
          looks_used_this_month: 0,
          last_reset_date: today.toISOString().split('T')[0],
          end_date: nextMonth.toISOString().split('T')[0]
        });
      } else {
        await base44.entities.Subscription.create({
          client_id: clientId,
          plan: plan,
          status: 'active',
          price: amount,
          looks_limit: plan === 'vip' ? -1 : plan === 'premium' ? 10 : 0,
          start_date: today.toISOString().split('T')[0],
          end_date: nextMonth.toISOString().split('T')[0],
          last_reset_date: today.toISOString().split('T')[0]
        });
      }

      queryClient.invalidateQueries(['subscription']);
      queryClient.invalidateQueries(['payments']);
      
      toast.success('Pagamento realizado com sucesso! 🎉');
      onSuccess();
      
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      console.error(error);
    }
    
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-700">Plano {planConfig[plan].name}</span>
          <span className="font-semibold text-gray-900">R$ {amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-600">Cobrança mensal recorrente</p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-gradient-to-r from-rose-500 to-amber-500"
      >
        {processing ? (
          <>
            <Clock className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Confirmar Pagamento de R$ {amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const [clientData] = await base44.entities.Client.filter({ email: userData.email });
        setClient(clientData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', client?.id],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        client_id: client.id,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!client
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', client?.id],
    queryFn: () => base44.entities.Payment.filter({ client_id: client.id }, '-created_date'),
    enabled: !!client
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Subscription.update(subscription.id, {
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      toast.success('Assinatura cancelada');
      window.location.reload();
    }
  });

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    setShowPaymentDialog(true);
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Pago' },
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pendente' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Falhou' },
    refunded: { icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Reembolsado' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Assinatura & <span className="font-semibold">Pagamentos</span>
          </h1>
          <p className="text-gray-600">
            Gerencie sua assinatura e visualize seu histórico de pagamentos
          </p>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="current">Plano Atual</TabsTrigger>
            <TabsTrigger value="plans">Trocar Plano</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Current Subscription */}
          <TabsContent value="current" className="space-y-6">
            {subscription ? (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${planConfig[subscription.plan].color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {React.createElement(planConfig[subscription.plan].icon, {
                          className: "w-6 h-6"
                        })}
                        Plano {planConfig[subscription.plan].name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Assinatura ativa desde {format(new Date(subscription.start_date), 'dd/MM/yyyy')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        R$ {subscription.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">por mês</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">Próxima Cobrança</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {format(new Date(subscription.end_date), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">Looks IA Este Mês</span>
                      </div>
                      <p className="text-lg font-bold text-purple-900">
                        {subscription.looks_limit === -1 
                          ? 'Ilimitado ✨' 
                          : `${subscription.looks_used_this_month || 0} / ${subscription.looks_limit}`
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Benefícios Inclusos:</h4>
                    <div className="space-y-2">
                      {planConfig[subscription.plan].features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => cancelMutation.mutate()}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Cancelar Assinatura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma Assinatura Ativa
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Escolha um plano para começar a usar todos os recursos
                  </p>
                  <Button
                    onClick={() => document.querySelector('[value="plans"]').click()}
                    className="bg-gradient-to-r from-rose-500 to-amber-500"
                  >
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Available Plans */}
          <TabsContent value="plans">
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(planConfig).map(([key, plan]) => {
                const Icon = plan.icon;
                const isCurrent = subscription?.plan === key;
                
                return (
                  <Card key={key} className={`border-0 shadow-xl overflow-hidden transition-all hover:scale-105 ${
                    isCurrent ? 'ring-2 ring-rose-500' : ''
                  }`}>
                    <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Icon className="w-8 h-8" />
                        {isCurrent && (
                          <Badge className="bg-rose-500">Plano Atual</Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
                        <span className="text-gray-500">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {key === 'premium' && plan.discounts && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-amber-900 mb-2">Descontos especiais:</p>
                          {Object.entries(plan.discounts).map(([type, info]) => (
                            <div key={type} className="text-xs text-amber-800">
                              <strong>{type === 'semestral' ? 'Semestral' : 'Anual'}:</strong> {info.discount}% OFF 
                              <span className="ml-1">(R$ {info.pricePerMonth}/mês)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => handleSelectPlan(key)}
                        disabled={isCurrent}
                        className={`w-full ${isCurrent ? '' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`}
                      >
                        {isCurrent ? 'Plano Ativo' : '7 Dias Grátis'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="history">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>
                  Todos os seus pagamentos e transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => {
                      const config = statusConfig[payment.status];
                      const StatusIcon = config.icon;
                      
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${config.bg}`}>
                              <StatusIcon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  R$ {payment.amount.toFixed(2)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(payment.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                {payment.card_brand && payment.card_last4 && (
                                  <span className="ml-2">
                                    • {payment.card_brand} ****{payment.card_last4}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {payment.invoice_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum pagamento registrado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Pagamento</DialogTitle>
              <DialogDescription>
                Complete os dados do cartão para finalizar a assinatura
              </DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  amount={planConfig[selectedPlan].price}
                  plan={selectedPlan}
                  clientId={client.id}
                  onSuccess={() => {
                    setShowPaymentDialog(false);
                    setSelectedPlan(null);
                  }}
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}