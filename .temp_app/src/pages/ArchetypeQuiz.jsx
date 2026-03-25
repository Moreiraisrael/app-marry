import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, RefreshCw, Sparkles, Star } from 'lucide-react';

const questions = [
  {
    question: "Como você prefere passar seu dia livre?",
    options: [
      { label: "Em casa com velas, flores e um bom livro", archetype: "romantica" },
      { label: "Em um museu, galeria de arte ou café elegante", archetype: "classica" },
      { label: "Em um evento exclusivo ou jantar sofisticado", archetype: "dramatica" },
      { label: "Na natureza, parque ou passeio ao ar livre", archetype: "natural" },
      { label: "Explorando brechós, feiras de arte ou vielas criativas", archetype: "criativa" },
      { label: "Praticando esporte, academia ou yoga", archetype: "esportiva" },
    ]
  },
  {
    question: "Qual palavra melhor descreve seu estilo ideal?",
    options: [
      { label: "Delicado e feminino", archetype: "romantica" },
      { label: "Elegante e atemporal", archetype: "classica" },
      { label: "Marcante e sofisticado", archetype: "dramatica" },
      { label: "Despojado e autêntico", archetype: "natural" },
      { label: "Único e expressivo", archetype: "criativa" },
      { label: "Funcional e moderno", archetype: "esportiva" },
    ]
  },
  {
    question: "Que tipo de tecido te atrai mais?",
    options: [
      { label: "Seda, renda, chiffon e cetim", archetype: "romantica" },
      { label: "Linho, lã e algodão estruturado", archetype: "classica" },
      { label: "Couro, veludo e tecidos com textura rica", archetype: "dramatica" },
      { label: "Algodão, linho lavado e tecidos naturais", archetype: "natural" },
      { label: "Misturas inesperadas e tecidos artesanais", archetype: "criativa" },
      { label: "Tecidos técnicos, moletom premium e neoprene", archetype: "esportiva" },
    ]
  },
  {
    question: "Como é a sua maquiagem ideal?",
    options: [
      { label: "Rosinha, batom nude e blush suave", archetype: "romantica" },
      { label: "Natural e bem cuidada, nada excessivo", archetype: "classica" },
      { label: "Olho marcado, batom vermelho ou lábio poderoso", archetype: "dramatica" },
      { label: "Quase sem maquiagem, skin care em foco", archetype: "natural" },
      { label: "Experimental – delineado colorido, glitter, graphic liner", archetype: "criativa" },
      { label: "BB cream e protetor solar, praticidade total", archetype: "esportiva" },
    ]
  },
  {
    question: "Que ambiente te inspira mais?",
    options: [
      { label: "Jardins floridos, castelos, Paris em primavera", archetype: "romantica" },
      { label: "Hotéis clássicos, escritórios modernos e museus", archetype: "classica" },
      { label: "Arranha-céus, moda de alto padrão, NY Fashion Week", archetype: "dramatica" },
      { label: "Fazendas, campos abertos, praia sem filtro", archetype: "natural" },
      { label: "Bairros boêmios, feiras de arte, ateliers", archetype: "criativa" },
      { label: "Academia, trilhas, eventos ao ar livre", archetype: "esportiva" },
    ]
  },
  {
    question: "Como você escolhe suas cores favoritas?",
    options: [
      { label: "Tons pastel, rosé, lilás e tons de baunilha", archetype: "romantica" },
      { label: "Neutros sofisticados: navy, bege, cinza e branco", archetype: "classica" },
      { label: "Alto contraste: preto, branco e um acento forte", archetype: "dramatica" },
      { label: "Tons terrosos, verde, caramelo e areia", archetype: "natural" },
      { label: "Combinações inesperadas e cores vibrantes", archetype: "criativa" },
      { label: "Cores vivas e funcionais, sem medo do colorido", archetype: "esportiva" },
    ]
  },
  {
    question: "Qual acessório não pode faltar no seu look?",
    options: [
      { label: "Brinco pérola, laço ou flor nos cabelos", archetype: "romantica" },
      { label: "Relógio clássico ou colar discreto de ouro", archetype: "classica" },
      { label: "Statement jewelry – maxi brincos ou colar poderoso", archetype: "dramatica" },
      { label: "Bolsa de couro natural, sandália rasteira ou chapéu", archetype: "natural" },
      { label: "Acessórios vintage, artesanais ou inusitados", archetype: "criativa" },
      { label: "Tênis de grife, mochila funcional ou boné", archetype: "esportiva" },
    ]
  },
  {
    question: "Como você se relaciona com tendências da moda?",
    options: [
      { label: "Prefiro looks atemporais com toque feminino", archetype: "romantica" },
      { label: "Só adoto tendências que são clássicas e discretas", archetype: "classica" },
      { label: "Sou a primeira a usar o que aparece nas passarelas", archetype: "dramatica" },
      { label: "Ignoro tendências – uso o que me faz bem", archetype: "natural" },
      { label: "Misturo tendências com peças vintage e artesanais", archetype: "criativa" },
      { label: "Adoto tendências que sejam confortáveis e práticas", archetype: "esportiva" },
    ]
  },
  {
    question: "Como você quer ser percebida pelas pessoas?",
    options: [
      { label: "Doce, encantadora e feminina", archetype: "romantica" },
      { label: "Elegante, confiante e profissional", archetype: "classica" },
      { label: "Poderosa, marcante e sofisticada", archetype: "dramatica" },
      { label: "Autêntica, leve e sem esforço aparente", archetype: "natural" },
      { label: "Original, artística e cheia de personalidade", archetype: "criativa" },
      { label: "Ativa, moderna e cheia de energia", archetype: "esportiva" },
    ]
  },
  {
    question: "Qual look você escolheria para uma ocasião especial?",
    options: [
      { label: "Vestido fluido com florais, renda ou babados delicados", archetype: "romantica" },
      { label: "Conjunto estruturado em neutro com acessório clássico", archetype: "classica" },
      { label: "Vestido longo dramático ou blazer oversized impactante", archetype: "dramatica" },
      { label: "Linho bem cortado ou jumpsuit minimalista em tom terra", archetype: "natural" },
      { label: "Mix de estampas, peças vintage e acessórios autorais", archetype: "criativa" },
      { label: "Look esportivo chique com tênis de grife e peças técnicas premium", archetype: "esportiva" },
    ]
  },
];

const archetypes = {
  romantica: {
    name: "Romântica",
    emoji: "🌸",
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    description: "Você é a mulher dos detalhes delicados, das flores e da feminilidade pura. Seu estilo encanta pelo romantismo e suavidade que transmite.",
    keywords: ["Feminino", "Delicado", "Encantador", "Suave"],
    pieces: ["Vestidos florais fluidos", "Rendas e transparências", "Babados e laços", "Tons pastel"],
    celebrities: ["Zendaya (looks românticos)", "Lily James", "Emma Watson"],
    tip: "Aposte em camadas leves, tecidos que fluem e detalhes como laços, pérolas e florais para realçar seu arquétipo.",
  },
  classica: {
    name: "Clássica",
    emoji: "👑",
    color: "from-amber-600 to-yellow-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    description: "Você tem elegância intemporal. Seu estilo é refinado, equilibrado e nunca passa de moda. A sofisticação discreta é sua marca registrada.",
    keywords: ["Elegante", "Atemporal", "Refinado", "Polido"],
    pieces: ["Blazer estruturado", "Calça de alfaiataria", "Camisa branca", "Sapato de salto clássico"],
    celebrities: ["Kate Middleton", "Carolina Herrera", "Meghan Markle"],
    tip: "Invista em peças de qualidade e corte perfeito. Menos é mais: um acessório clássico e boa alfaiataria valem mais que mil tendências.",
  },
  dramatica: {
    name: "Dramática",
    emoji: "⚡",
    color: "from-purple-600 to-indigo-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    description: "Você é presença! Poderosa, marcante e sofisticada, você não passa despercebida. Seu estilo comunica autoridade e impacto visual.",
    keywords: ["Marcante", "Poderosa", "Sofisticada", "Impactante"],
    pieces: ["Maxi casaco estruturado", "Calça wide leg preta", "Botas de cano longo", "Statement jewelry"],
    celebrities: ["Cate Blanchett", "Beyoncé", "Anitta"],
    tip: "Aposte em alto contraste, silhuetas marcantes e acessórios statement. Você nasceu para ocupar espaço – vista-se como tal.",
  },
  natural: {
    name: "Natural",
    emoji: "🌿",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    description: "Você valoriza o conforto, a autenticidade e a leveza. Seu estilo parece sem esforço mas é cheio de intenção – a beleza do natural sem maquiagem excessiva.",
    keywords: ["Autêntico", "Confortável", "Orgânico", "Despojado"],
    pieces: ["Calça de linho", "Camiseta premium", "Sandália rasteira artesanal", "Bolsa de couro natural"],
    celebrities: ["Alessandra Ambrosio", "Gwyneth Paltrow", "Jennifer Aniston"],
    tip: "Priorize tecidos naturais, cores terrosas e peças versáteis de qualidade. O seu estilo brilha na simplicidade intencional.",
  },
  criativa: {
    name: "Criativa",
    emoji: "🎨",
    color: "from-orange-400 to-rose-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    description: "Você é uma obra de arte ambulante! Expressiva, original e sem medo do julgamento alheio, sua roupa é uma extensão da sua arte.",
    keywords: ["Criativa", "Original", "Artística", "Expressiva"],
    pieces: ["Mix de estampas", "Peças vintage", "Acessórios autorais", "Layering inesperado"],
    celebrities: ["Erykah Badu", "Björk", "Solange Knowles"],
    tip: "Não tenha medo de misturar – décadas, texturas, estampas e estilos. Sua roupa conta sua história e não precisa de aprovação.",
  },
  esportiva: {
    name: "Esportiva / Athleisure",
    emoji: "⚡",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-700",
    description: "Você vive em movimento! Moderna, funcional e com energia contagiante, você prova que conforto e estilo caminham juntos.",
    keywords: ["Ativa", "Funcional", "Moderna", "Energética"],
    pieces: ["Legging premium", "Tênis de grife", "Cropped técnico", "Jaqueta bomber"],
    celebrities: ["Kendall Jenner", "Hailey Bieber", "Anitta (looks casuais)"],
    tip: "Invista em peças técnicas de qualidade e combine athleisure com itens de alfaiataria para elevar seus looks do dia a dia.",
  },
};

export default function ArchetypeQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  const progress = ((currentQ) / questions.length) * 100;

  const handleSelect = (archetype) => {
    setSelectedOption(archetype);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [currentQ]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQ + 1 >= questions.length) {
      // Calculate result
      const scores = {};
      Object.values(newAnswers).forEach(a => {
        scores[a] = (scores[a] || 0) + 1;
      });
      const top = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primary = top[0][0];
      const secondary = top[1]?.[1] === top[0][1] ? null : (top[1]?.[0] || null);
      setResult({ primary, secondary, scores });
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleBack = () => {
    if (currentQ === 0) return;
    const prevAnswers = { ...answers };
    delete prevAnswers[currentQ - 1];
    setAnswers(prevAnswers);
    setSelectedOption(null);
    setCurrentQ(currentQ - 1);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
  };

  if (result) {
    const primary = archetypes[result.primary];
    const secondary = result.secondary ? archetypes[result.secondary] : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            {/* Result Header */}
            <div className={`rounded-3xl overflow-hidden shadow-2xl`}>
              <div className={`bg-gradient-to-br ${primary.color} p-8 text-white text-center`}>
                <div className="text-6xl mb-3">{primary.emoji}</div>
                <p className="text-white/80 text-sm uppercase tracking-widest mb-1">Seu Arquétipo Principal</p>
                <h1 className="text-4xl font-bold mb-2">{primary.name}</h1>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {primary.keywords.map(k => (
                    <span key={k} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{k}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed text-center">{primary.description}</p>

                {secondary && (
                  <div className={`${secondary.bg} ${secondary.border} border rounded-2xl p-4`}>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Arquétipo Secundário</p>
                    <p className="font-bold text-gray-900">{secondary.emoji} {secondary.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{secondary.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Peças-chave para seu guarda-roupa
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {primary.pieces.map(p => (
                      <div key={p} className={`${primary.bg} ${primary.border} border rounded-xl px-3 py-2 text-sm text-gray-700`}>
                        ✦ {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${primary.bg} border ${primary.border} rounded-2xl p-5`}>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Dica da Consultora
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{primary.tip}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Referências de estilo</p>
                  <div className="flex flex-wrap gap-2">
                    {primary.celebrities.map(c => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleRestart} variant="outline" className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" /> Refazer o Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Quiz de Estilo
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Descubra seu <span className="font-bold">Arquétipo</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Responda 10 perguntas e descubra seu perfil de estilo único</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Pergunta {currentQ + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">{q.question}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.archetype)}
                  className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-sm leading-snug
                    ${selectedOption === opt.archetype
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-medium shadow-md shadow-amber-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="mr-2 text-amber-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentQ > 0 && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white gap-2 disabled:opacity-40"
          >
            {currentQ + 1 === questions.length ? 'Ver Resultado' : 'Próxima'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}