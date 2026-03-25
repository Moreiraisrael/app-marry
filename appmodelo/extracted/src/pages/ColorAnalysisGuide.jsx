import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, X, Zap, Thermometer, Sun, Palette, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SeasonSelector from '@/components/color-analysis/SeasonSelector';

const SEASONS = {
  quentes: [
    { id: 'primavera_clara', name: 'Primavera Clara', emoji: '🌸', desc: 'Quente + Claro + Brilhante' },
    { id: 'primavera_quente', name: 'Primavera Quente', emoji: '🌼', desc: 'Quente + Claro + Suave' },
    { id: 'primavera_brilhante', name: 'Primavera Brilhante', emoji: '✨', desc: 'Quente + Claro + Saturado' },
    { id: 'outono_suave', name: 'Outono Suave', emoji: '🍂', desc: 'Quente + Profundo + Suave' },
    { id: 'outono_quente', name: 'Outono Quente', emoji: '🔥', desc: 'Quente + Profundo + Médio' },
    { id: 'outono_profundo', name: 'Outono Profundo', emoji: '🌲', desc: 'Quente + Profundo + Brilhante' }
  ],
  frios: [
    { id: 'verao_claro', name: 'Verão Claro', emoji: '🌊', desc: 'Frio + Claro + Suave' },
    { id: 'verao_suave', name: 'Verão Suave', emoji: '☁️', desc: 'Frio + Claro/Médio + Suave' },
    { id: 'verao_frio', name: 'Verão Frio', emoji: '❄️', desc: 'Frio + Médio + Brilhante' },
    { id: 'inverno_brilhante', name: 'Inverno Brilhante', emoji: '💎', desc: 'Frio + Profundo + Brilhante' },
    { id: 'inverno_frio', name: 'Inverno Frio', emoji: '🧊', desc: 'Frio + Profundo + Médio' },
    { id: 'inverno_profundo', name: 'Inverno Profundo', emoji: '🌙', desc: 'Frio + Profundo + Suave' }
  ]
};

const STEPS = [
  {
    id: 'preparacao',
    title: '📸 Preparação do Ambiente',
    icon: '📸',
    description: 'Prepare o cenário para análise precisa',
    content: `É fundamental preparar o ambiente corretamente:

✓ **Iluminação**: Use luz natural próxima a uma janela (melhor 9h-15h)
✓ **Acessórios**: Remova colares, brincos e outras joias
✓ **Maquiagem**: Cliente deve estar sem maquiagem
✓ **Cabelo**: Prenda com uma faixa ou lenço NEUTRO (branco, preto ou cinza)
✓ **Roupas**: Use uma camiseta branca ou neutra
✓ **Fundo**: Prefira um fundo neutro (branco ou cinza)

Esse cuidado permite que a análise não seja influenciada por elementos externos.`,
    checklist: [
      'Luz natural disponível',
      'Sem acessórios no rosto',
      'Sem maquiagem',
      'Cabelo preso com faixa neutra',
      'Fundo neutro'
    ]
  },
  {
    id: 'contraste',
    title: '⚖️ Identificação do Contraste Natural',
    icon: '⚖️',
    description: 'Analise a diferença entre pele, cabelo e olhos',
    content: `Faça uma fotografia em luz natural, preferencialmente próxima a uma janela.

**MÉTODO DA ESCALA DE CINZA:**
1. Use a edição do celular para colocar a imagem em PRETO E BRANCO
2. Remova toda a saturação (deixe em tons de cinza puro)
3. Compare a tonalidade da pele, cabelo e olhos

**INTERPRETAÇÃO:**
• **Contraste Baixo**: Diferença pequena entre tons (ex: pele clara + cabelo loiro claro)
  → Elimina: Inverno Brilhante, Primavera Brilhante, Outono Profundo, Inverno Profundo
  
• **Contraste Médio**: Diferença intermediária (ex: pele média + cabelo castanho escuro)
  → Deixa em aberto, continua análise
  
• **Contraste Alto**: Grandes diferenças (ex: pele clara + cabelo preto)
  → Elimina: Primavera Suave, Outono Suave, Verão Suave, Verão Claro
  
• **Contraste Altíssimo**: Diferença máxima e definida
  → Favores: Inverno Brilhante, Primavera Brilhante, Outono Profundo`,
    checklist: [
      'Foto em preto e branco tirada',
      'Contraste analisado',
      'Estações eliminadas conforme nível de contraste'
    ]
  },
  {
    id: 'temperatura',
    title: '🌡️ Teste de Temperatura',
    icon: '🌡️',
    description: 'Determine se é Quente ou Frio',
    content: `Com a cliente em frente ao espelho, é hora de fazer o TESTE DO DRAPE.

**TESTE QUENTE vs FRIO:**
1. Comece com a temperatura (depois vem profundidade e intensidade)
2. Aproxime um tecido QUENTE (amarelado/dourado/cobre)
3. Depois aproxime um tecido FRIO (azulado/rosado/prateado)
4. Observe atentamente como cada cor afeta a luminosidade do rosto

**SINAIS DE TEMPERATURA QUENTE:**
✓ Rosto ganha luminosidade com cores quentes
✓ Tons dourados, mel, terracota "derretem" no rosto
✓ Pele parece mais radiante com ouro
✓ Sardas/sardanhas avermelhadas ou douradas
✓ Subtom da pele: dourado, amarelado, pêssego

**SINAIS DE TEMPERATURA FRIA:**
✓ Rosto ganha brilho com tons frios
✓ Cores prateadas, rosadas, azuladas parecem fazer "derreter" na beleza
✓ Pele parece mais radiante com prata
✓ Sem sardanhas douradas (ou com sardanhas acinzentadas)
✓ Subtom da pele: rosado, azulado, avermelhado

**COMO USAR ESSA INFORMAÇÃO:**
• Se QUENTE: Elimina Verão Claro, Verão Suave, Verão Frio, Inverno Brilhante, Inverno Frio, Inverno Profundo
• Se FRIO: Elimina Primavera Clara, Primavera Quente, Primavera Brilhante, Outono Suave, Outono Quente, Outono Profundo`,
    checklist: [
      'Tecidos de teste disponíveis (quente e frio)',
      'Teste feito em luz natural',
      'Temperatura identificada (Quente ou Frio)',
      'Estações de temperatura oposta eliminadas'
    ]
  },
  {
    id: 'profundidade',
    title: '🎨 Verificação de Profundidade',
    icon: '🎨',
    description: 'Cores claras ou escuras valorizam mais?',
    content: `Agora que você sabe a TEMPERATURA (Quente ou Frio), teste a PROFUNDIDADE.

**TESTE CLARO vs PROFUNDO:**
1. Mantenha a temperatura identificada (todos os drapes agora serão da temperatura correta)
2. Compare cores CLARAS versus cores ESCURAS/PROFUNDAS da mesma temperatura
3. Observe qual faz o rosto ganhar vida e claridade

**COMO IDENTIFICAR:**

**PROFUNDIDADE CLARA:**
✓ Rosto ganha vida com tons claros
✓ Cores muito escuras "puxam" o rosto para baixo
✓ Cliente parece mais radiante com tons pastel e suaves
✓ Pele é naturalmente clara
→ Estações candidatas: Primavera Clara, Verão Claro

**PROFUNDIDADE MÉDIA/NORMAL:**
✓ Rosto responde bem tanto a claros quanto a escuros
✓ Equilíbrio natural entre tons
✓ Nem muito claro, nem muito escuro
→ Estações candidatas: Primavera Quente, Verão Suave, Verão Frio

**PROFUNDIDADE PROFUNDA:**
✓ Rosto ganha luminosidade com tons escuros/profundos
✓ Cores claras "desaparecem" no rosto
✓ Cliente é naturalmente escura ou tem pele profunda
→ Estações candidatas: Outono Suave, Outono Quente, Inverno Brilhante

**COMO USAR ESSA INFORMAÇÃO:**
Combine com TEMPERATURA:
• Quente + Claro = Primavera (Clara, Quente ou Brilhante)
• Quente + Profundo = Outono (Suave, Quente ou Profundo)
• Frio + Claro = Verão (Claro ou Suave)
• Frio + Profundo = Inverno (Brilhante, Frio ou Profundo)`,
    checklist: [
      'Drapes claros e escuros testados',
      'Profundidade identificada',
      'Combinou com temperatura descoberta',
      'Estações de profundidade oposta eliminadas'
    ]
  },
  {
    id: 'intensidade',
    title: '✨ Verificação de Intensidade',
    icon: '✨',
    description: 'Cores vibrantes ou suavizadas?',
    content: `Você já eliminou muitas estações! Agora teste a INTENSIDADE (última dimensão).

**TESTE VIBRANTE vs SUAVE:**
1. Use cores da temperatura E profundidade identificadas
2. Compare cores SATURADAS/VIBRANTES versus cores SUAVES/ACINZENTADAS
3. Observe qual faz o rosto ficar mais luminoso

**COMO IDENTIFICAR:**

**INTENSIDADE BRILHANTE/VIBRANTE:**
✓ Rosto ganha vida com cores saturadas e puras
✓ Cores muito suaves "apagam" a cliente
✓ Tons com máxima saturação são favoráveis
✓ Cliente tem contraste natural marcado
→ Estações: Primavera Brilhante, Outono Profundo, Inverno Brilhante, Verão Frio

**INTENSIDADE SUAVE:**
✓ Rosto responde melhor a tons apagados e acinzentados
✓ Cores vibrantes parecem "agressivas"
✓ Tons suavizados parecem fazer "derreter" na beleza
✓ Cliente tem contraste natural baixo
→ Estações: Primavera Quente, Outono Suave, Inverno Frio, Verão Suave

**INTENSIDADE MÉDIA:**
✓ Rosto responde bem a ambas (nem muito vibrante, nem muito suave)
✓ Equilíbrio de saturação
→ Estações: Primavera Clara, Verão Claro, Inverno Profundo

**COMBINAÇÃO FINAL:**
Agora você tem:
✓ TEMPERATURA (Quente ou Frio)
✓ PROFUNDIDADE (Clara, Média ou Profunda)
✓ INTENSIDADE (Brilhante, Média ou Suave)

Apenas UMA estação deve corresponder aos 3 critérios!`,
    checklist: [
      'Cores vibrantes e suaves testadas',
      'Intensidade identificada',
      'Combinou Temperatura + Profundidade + Intensidade',
      'Uma única estação deve restar'
    ]
  },
  {
    id: 'resultado',
    title: '🏆 Resultado Final',
    icon: '🏆',
    description: 'Sua estação de coloração pessoal',
    content: `Parabéns! Você seguiu todas as etapas do Método Sazonal Expandido.

**O QUE VOCÊ DESCOBRIU:**
A combinação de:
• Temperatura (Quante ou Frio)
• Profundidade (Clara, Média ou Profunda)
• Intensidade (Brilhante, Média ou Suave)

Resultou em UMA estação específica que melhor valoriza a beleza natural da cliente.

**PRÓXIMOS PASSOS:**
1. Registre a estação final no perfil da cliente
2. Crie uma paleta de cores personalizada
3. Recomende peças de guarda-roupa que harmonizem
4. Sugira técnicas de maquiagem complementares
5. Indique acessórios que valorizem`,
    checklist: [
      'Estação final confirmada',
      'Resultado salvo no perfil',
      'Cliente entendeu seu tipo de coloração'
    ]
  }
];

export default function ColorAnalysisGuide() {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedTemperature, setSelectedTemperature] = useState(null);
  const [selectedDepth, setSelectedDepth] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState(null);
  const [currentTab, setCurrentTab] = useState('preparacao');

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Guia Prático de Análise de Coloração
          </h1>
          <p className="text-xl text-gray-600">Método Sazonal Expandido - 12 Estações</p>
          <p className="text-gray-500 mt-2">Acompanhe passo a passo para identificar a estação perfeita</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Guide Steps */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="preparacao" className="text-sm">
                  {completedSteps.includes('preparacao') && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Prep
                </TabsTrigger>
                <TabsTrigger value="contraste" className="text-sm">
                  {completedSteps.includes('contraste') && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Contraste
                </TabsTrigger>
                <TabsTrigger value="temperatura" className="text-sm">
                  {completedSteps.includes('temperatura') && <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Temp
                </TabsTrigger>
              </TabsList>

              {STEPS.slice(0, 3).map((step) => (
                <TabsContent key={step.id} value={step.id} className="space-y-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <span className="text-3xl">{step.icon}</span>
                          {step.title}
                        </CardTitle>
                        <p className="text-gray-600 mt-2">{step.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg whitespace-pre-line text-sm text-gray-700 leading-relaxed border border-blue-200">
                          {step.content}
                        </div>

                        {/* Checklist */}
                        <div className="bg-white border-2 border-gray-100 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Checklist desta Etapa
                          </h4>
                          <div className="space-y-2">
                            {step.checklist.map((item, idx) => (
                              <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
                                <span className="text-gray-700">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Step Completion */}
                        <Button
                          onClick={() => markStepComplete(step.id)}
                          variant={completedSteps.includes(step.id) ? 'outline' : 'default'}
                          className={completedSteps.includes(step.id) ? 'w-full bg-green-50 border-green-200' : 'w-full bg-gradient-to-r from-rose-600 to-purple-600'}
                        >
                          {completedSteps.includes(step.id) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Etapa Concluída ✓
                            </>
                          ) : (
                            'Marcar como Concluída'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>

            {/* More Steps */}
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <h3 className="text-lg font-semibold">Próximas Etapas</h3>
                <Badge variant="outline">3 passos restantes</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {STEPS.slice(3, 6).map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      onClick={() => setCurrentTab(step.id)}
                      className="cursor-pointer border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all group"
                    >
                      <CardContent className="p-4">
                        <div className="text-3xl mb-2">{step.icon}</div>
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                        {completedSteps.includes(step.id) && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Season Selector Sidebar */}
          <div className="lg:col-span-1">
            <SeasonSelector
              completedSteps={completedSteps}
              selectedTemperature={selectedTemperature}
              setSelectedTemperature={setSelectedTemperature}
              selectedDepth={selectedDepth}
              setSelectedDepth={setSelectedDepth}
              selectedIntensity={selectedIntensity}
              setSelectedIntensity={setSelectedIntensity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}