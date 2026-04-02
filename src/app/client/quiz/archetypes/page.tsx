"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Star, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { saveQuizResult } from "@/lib/actions/quizzes"
import { useRouter } from "next/navigation"

const questions = [
  {
    id: 1,
    question: "Como você prefere passar seu dia livre?",
    options: [
      { id: "1a", text: "Em casa com velas, flores e um bom livro", archetype: "romantica" },
      { id: "1b", text: "Em um museu, galeria de arte ou café elegante", archetype: "classica" },
      { id: "1c", text: "Em um evento exclusivo ou jantar sofisticado", archetype: "dramatica" },
      { id: "1d", text: "Na natureza, parque ou passeio ao ar livre", archetype: "natural" },
      { id: "1e", text: "Explorando brechós, feiras de arte ou vielas criativas", archetype: "criativa" },
      { id: "1f", text: "Praticando esporte, academia ou yoga", archetype: "esportiva" },
    ]
  },
  {
    id: 2,
    question: "Qual palavra melhor descreve seu estilo ideal?",
    options: [
      { id: "2a", text: "Delicado e feminino", archetype: "romantica" },
      { id: "2b", text: "Elegante e atemporal", archetype: "classica" },
      { id: "2c", text: "Marcante e sofisticado", archetype: "dramatica" },
      { id: "2d", text: "Despojado e autêntico", archetype: "natural" },
      { id: "2e", text: "Único e expressivo", archetype: "criativa" },
      { id: "2f", text: "Funcional e moderno", archetype: "esportiva" },
    ]
  },
  {
    id: 3,
    question: "Que tipo de tecido te atrai mais?",
    options: [
      { id: "3a", text: "Seda, renda, chiffon e cetim", archetype: "romantica" },
      { id: "3b", text: "Linho, lã e algodão estruturado", archetype: "classica" },
      { id: "3c", text: "Couro, veludo e tecidos com textura rica", archetype: "dramatica" },
      { id: "3d", text: "Algodão, linho lavado e tecidos naturais", archetype: "natural" },
      { id: "3e", text: "Misturas inesperadas e tecidos artesanais", archetype: "criativa" },
      { id: "3f", text: "Tecidos técnicos, moletom premium e neoprene", archetype: "esportiva" },
    ]
  },
  {
    id: 4,
    question: "Como é a sua maquiagem ideal?",
    options: [
      { id: "4a", text: "Rosinha, batom nude e blush suave", archetype: "romantica" },
      { id: "4b", text: "Natural e bem cuidada, nada excessivo", archetype: "classica" },
      { id: "4c", text: "Olho marcado, batom vermelho ou lábio poderoso", archetype: "dramatica" },
      { id: "4d", text: "Quase sem maquiagem, skin care em foco", archetype: "natural" },
      { id: "4e", text: "Experimental – delineado colorido, glitter, graphic liner", archetype: "criativa" },
      { id: "4f", text: "BB cream e protetor solar, praticidade total", archetype: "esportiva" },
    ]
  },
  {
    id: 5,
    question: "Que ambiente te inspira mais?",
    options: [
      { id: "5a", text: "Jardins floridos, castelos, Paris em primavera", archetype: "romantica" },
      { id: "5b", text: "Hotéis clássicos, escritórios modernos e museus", archetype: "classica" },
      { id: "5c", text: "Arranha-céus, moda de alto padrão, NY Fashion Week", archetype: "dramatica" },
      { id: "5d", text: "Fazendas, campos abertos, praia sem filtro", archetype: "natural" },
      { id: "5e", text: "Bairros boêmios, feiras de arte, ateliers", archetype: "criativa" },
      { id: "5f", text: "Academia, trilhas, eventos ao ar livre", archetype: "esportiva" },
    ]
  },
  {
    id: 6,
    question: "Como você escolhe suas cores favoritas?",
    options: [
      { id: "6a", text: "Tons pastel, rosé, lilás e tons de baunilha", archetype: "romantica" },
      { id: "6b", text: "Neutros sofisticados: navy, bege, cinza e branco", archetype: "classica" },
      { id: "6c", text: "Alto contraste: preto, branco e um acento forte", archetype: "dramatica" },
      { id: "6d", text: "Tons terrosos, verde, caramelo e areia", archetype: "natural" },
      { id: "6e", text: "Combinações inesperadas e cores vibrantes", archetype: "criativa" },
      { id: "6f", text: "Cores vivas e funcionais, sem medo do colorido", archetype: "esportiva" },
    ]
  },
  {
    id: 7,
    question: "Qual acessório não pode faltar no seu look?",
    options: [
      { id: "7a", text: "Brinco pérola, laço ou flor nos cabelos", archetype: "romantica" },
      { id: "7b", text: "Relógio clássico ou colar discreto de ouro", archetype: "classica" },
      { id: "7c", text: "Statement jewelry – maxi brincos ou colar poderoso", archetype: "dramatica" },
      { id: "7d", text: "Bolsa de couro natural, sandália rasteira ou chapéu", archetype: "natural" },
      { id: "7e", text: "Acessórios vintage, artesanais ou inusitados", archetype: "criativa" },
      { id: "7f", text: "Tênis de grife, mochila funcional ou boné", archetype: "esportiva" },
    ]
  },
  {
    id: 8,
    question: "Como você se relaciona com tendências da moda?",
    options: [
      { id: "8a", text: "Prefiro looks atemporais com toque feminino", archetype: "romantica" },
      { id: "8b", text: "Só adoto tendências que são clássicas e discretas", archetype: "classica" },
      { id: "8c", text: "Sou a primeira a usar o que aparece nas passarelas", archetype: "dramatica" },
      { id: "8d", text: "Ignoro tendências – uso o que me faz bem", archetype: "natural" },
      { id: "8e", text: "Misturo tendências com peças vintage e artesanais", archetype: "criativa" },
      { id: "8f", text: "Adoto tendências que sejam confortáveis e práticas", archetype: "esportiva" },
    ]
  },
  {
    id: 9,
    question: "Como você quer ser percebida pelas pessoas?",
    options: [
      { id: "9a", text: "Doce, encantadora e feminina", archetype: "romantica" },
      { id: "9b", text: "Elegante, confiante e profissional", archetype: "classica" },
      { id: "9c", text: "Poderosa, marcante e sofisticada", archetype: "dramatica" },
      { id: "9d", text: "Autêntica, leve e sem esforço aparente", archetype: "natural" },
      { id: "9e", text: "Original, artística e cheia de personalidade", archetype: "criativa" },
      { id: "9f", text: "Ativa, moderna e cheia de energia", archetype: "esportiva" },
    ]
  },
  {
    id: 10,
    question: "Qual look você escolheria para uma ocasião especial?",
    options: [
      { id: "10a", text: "Vestido fluido com florais, renda ou babados delicados", archetype: "romantica" },
      { id: "10b", text: "Conjunto estruturado em neutro com acessório clássico", archetype: "classica" },
      { id: "10c", text: "Vestido longo dramático ou blazer oversized impactante", archetype: "dramatica" },
      { id: "10d", text: "Linho bem cortado ou jumpsuit minimalista em tom terra", archetype: "natural" },
      { id: "10e", text: "Mix de estampas, peças vintage e acessórios autorais", archetype: "criativa" },
      { id: "10f", text: "Look esportivo chique com tênis de grife e peças técnicas premium", archetype: "esportiva" },
    ]
  }
]

const archetypes = {
  romantica: {
    name: "Romântica",
    emoji: "🌸",
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    description: "Você é a mulher dos detalhes delicados, das flores e da feminilidade pura. Seu estilo encanta pelo romantismo e suavidade que transmite.",
    keywords: ["Feminino", "Delicado", "Encantador", "Suave"]
  },
  classica: {
    name: "Clássica",
    emoji: "👑",
    color: "from-amber-600 to-yellow-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Você tem elegância intemporal. Seu estilo é refinado, equilibrado e nunca passa de moda. A sofisticação discreta é sua marca registrada.",
    keywords: ["Elegante", "Atemporal", "Refinado", "Polido"]
  },
  dramatica: {
    name: "Dramática",
    emoji: "⚡",
    color: "from-purple-600 to-indigo-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    description: "Você é presença! Poderosa, marcante e sofisticada, você não passa despercebida. Seu estilo comunica autoridade e impacto visual.",
    keywords: ["Marcante", "Poderosa", "Sofisticada", "Impactante"]
  },
  natural: {
    name: "Natural",
    emoji: "🌿",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-200",
    description: "Você valoriza o conforto, a autenticidade e a leveza. Seu estilo parece sem esforço mas é cheio de intenção.",
    keywords: ["Autêntico", "Confortável", "Orgânico", "Despojado"]
  },
  criativa: {
    name: "Criativa",
    emoji: "🎨",
    color: "from-orange-400 to-rose-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    description: "Você é uma obra de arte ambulante! Expressiva, original e sem medo do julgamento alheio.",
    keywords: ["Criativa", "Original", "Artística", "Expressiva"]
  },
  esportiva: {
    name: "Esportiva",
    emoji: "⚡",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    description: "Você vive em movimento! Moderna, funcional e com energia contagiante.",
    keywords: ["Ativa", "Funcional", "Moderna", "Energética"]
  }
}

export default function ArchetypeQuiz() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<{ primary: string; secondary: string | null } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const progress = ((currentStep) / questions.length) * 100
  const currentQ = questions[currentStep]

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      // Calculate results
      const scores: Record<string, number> = {}
      Object.entries(answers).forEach(([_, arc]) => {
        scores[arc] = (scores[arc] || 0) + 1
      })
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
      const primary = sorted[0][0]
      const secondary = sorted[1]?.[1] === sorted[0][1] ? null : (sorted[1]?.[0] || null)
      
      const resultObj = { primary, secondary }
      setResult(resultObj)
      
      // Save to DB
      setIsSaving(true)
      await saveQuizResult('archetype', answers, primary)
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  if (result) {
    const primaryInfo = (archetypes as Record<string, typeof archetypes.romantica>)[result.primary]
    const secondaryInfo = result.secondary ? (archetypes as Record<string, typeof archetypes.romantica>)[result.secondary] : null

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in zoom-in duration-700">
        <div className={`rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-white border border-stone-100`}>
          <div className={`bg-gradient-to-br ${primaryInfo.color} p-12 text-white text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
            <div className="relative z-10">
              <div className="text-8xl mb-6 drop-shadow-2xl animate-bounce-slow">{primaryInfo.emoji}</div>
              <p className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">Seu Arquétipo Dominante</p>
              <h1 className="text-6xl font-serif font-bold mb-6 tracking-tight">{primaryInfo.name}</h1>
              <div className="flex flex-wrap justify-center gap-2.5 mt-8">
                {primaryInfo.keywords.map((k: string) => (
                  <span key={k} className="px-6 py-2 bg-white/20 backdrop-blur-xl rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-10 md:p-14 space-y-12">
            <p className="text-stone-600 text-2xl leading-relaxed text-center font-serif italic max-w-2xl mx-auto">
              &quot;{primaryInfo.description}&quot;
            </p>

            {secondaryInfo && (
              <div className={`${secondaryInfo.bg} ${secondaryInfo.border} border-2 rounded-[2rem] p-8 transition-all hover:shadow-xl group`}>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">Influência Secundária</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{secondaryInfo.emoji}</span>
                  <p className="text-2xl font-bold text-stone-900 tracking-tight">{secondaryInfo.name}</p>
                </div>
                <p className="text-stone-600 text-base leading-relaxed">{secondaryInfo.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-stone-50/50 rounded-3xl p-8 border border-stone-100">
                  <h4 className="text-stone-900 font-bold mb-4 flex items-center gap-3 text-lg">
                    <Star className="w-5 h-5 text-[#B48D6C]" /> Superpoderes
                  </h4>
                  <ul className="text-stone-600 space-y-3">
                    <li className="flex items-center gap-2">• <span className="text-sm">Comunicação visual autêntica</span></li>
                    <li className="flex items-center gap-2">• <span className="text-sm">Magnetismo pessoal elevado</span></li>
                    <li className="flex items-center gap-2">• <span className="text-sm">Coerência estratégica</span></li>
                  </ul>
               </div>
               <div className="bg-stone-50/50 rounded-3xl p-8 border border-stone-100">
                  <h4 className="text-stone-900 font-bold mb-4 flex items-center gap-3 text-lg">
                    <Sparkles className="w-5 h-5 text-[#B48D6C]" /> Próximos Passos
                  </h4>
                  <p className="text-stone-600 text-sm leading-relaxed italic">
                    Sua jornada continua no painel principal, onde você encontrará sugestões de looks baseadas no seu arquétipo.
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <Button 
                className="bg-stone-900 hover:bg-stone-800 text-stone-50 h-16 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                onClick={() => router.push('/client/dashboard')}
              >
                Ir para o Dashboard
              </Button>
              <Button 
                variant="ghost"
                className="text-stone-400 hover:text-stone-900 h-12 gap-2 hover:bg-stone-50 rounded-xl transition-all"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" /> Refazer Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 text-stone-900">
      <div className="mb-12 text-center">
        <Button variant="ghost" className="mb-8 text-stone-400 hover:text-stone-900 transition-colors hover:bg-stone-50" onClick={() => router.push('/client/quiz')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Desistir da Jornada
        </Button>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B48D6C]/10 text-[#B48D6C] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-[#B48D6C]/10">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Mapeamento Arquetípico
        </div>
        <h1 className="text-5xl font-serif font-bold text-stone-900 mb-3 tracking-tight">Desperte sua Essência</h1>
        <p className="text-stone-500 text-lg max-w-lg mx-auto">Responda com seu coração para descobrir sua imagem magnética.</p>
      </div>

      <div className="mb-10 max-w-md mx-auto w-full">
        <div className="flex justify-between text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">
          <span>Passo {currentStep + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-stone-100 rounded-full" />
      </div>

      <Card className="border-stone-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden border-b-[8px] border-stone-100/80 transition-all duration-500">
        <CardHeader className="pb-10 pt-16 px-8 md:px-14 text-center">
          <CardTitle className="text-3xl md:text-4xl font-serif font-bold leading-tight text-stone-900 tracking-tight">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 md:px-14 pb-16">
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => setAnswers({...answers, [currentStep]: opt.archetype})}
                className={`flex items-center justify-between p-7 rounded-[2rem] border-2 transition-all duration-500 group relative overflow-hidden
                  ${answers[currentStep] === opt.archetype 
                    ? 'border-[#B48D6C] bg-[#B48D6C]/5 shadow-lg' 
                    : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-6 relative z-10">
                   <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500
                    ${answers[currentStep] === opt.archetype ? 'bg-[#B48D6C] text-white rotate-6' : 'bg-stone-50 text-stone-400 group-hover:bg-[#B48D6C]/10 group-hover:text-[#B48D6C]'}
                   `}>
                     {String.fromCharCode(65 + idx)}
                   </span>
                   <span className={`text-left text-lg transition-all duration-500 ${answers[currentStep] === opt.archetype ? 'text-stone-900 font-bold tracking-tight transform translate-x-1' : 'text-stone-600 font-medium'}`}>
                     {opt.text}
                   </span>
                </div>
                {answers[currentStep] === opt.archetype && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-7 h-7 text-[#B48D6C]" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-8 md:px-14 py-10 flex flex-col md:flex-row gap-4 justify-between bg-stone-50/40 border-t border-stone-100/60 mt-auto">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handleBack} 
            disabled={currentStep === 0} 
            className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] h-14 px-8 hover:bg-white hover:text-stone-900 rounded-2xl disabled:opacity-30"
          >
            Anterior
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={!answers[currentStep] || isSaving}
            className="bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all shadow-2xl px-12 rounded-2xl font-bold h-16 text-lg min-w-[200px] active:scale-95 disabled:bg-stone-200"
          >
            {isSaving ? 'Salvando...' : currentStep === questions.length - 1 ? 'Mapear Agora' : 'Próxima'} <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
