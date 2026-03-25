"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Star, RefreshCw } from "lucide-react"
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
    const primaryInfo = (archetypes as Record<string, any>)[result.primary]
    const secondaryInfo = result.secondary ? (archetypes as Record<string, any>)[result.secondary] : null

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in zoom-in duration-500">
        <div className={`rounded-3xl overflow-hidden shadow-2xl bg-white border border-neutral-100`}>
          <div className={`bg-gradient-to-br ${primaryInfo.color} p-10 text-white text-center`}>
            <div className="text-7xl mb-4 drop-shadow-lg">{primaryInfo.emoji}</div>
            <p className="text-white/80 text-sm uppercase tracking-[0.2em] font-bold mb-2">Seu Arquétipo Dominante</p>
            <h1 className="text-5xl font-serif font-bold mb-4">{primaryInfo.name}</h1>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {primaryInfo.keywords.map((k: string) => (
                <span key={k} className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">{k}</span>
              ))}
            </div>
          </div>

          <div className="p-10 space-y-8">
            <p className="text-neutral-600 text-xl leading-relaxed text-center font-medium italic">
              &quot;{primaryInfo.description}&quot;
            </p>

            {secondaryInfo && (
              <div className={`${secondaryInfo.bg} ${secondaryInfo.border} border rounded-2xl p-6 transition-all hover:shadow-md`}>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">Influência Secundária</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{secondaryInfo.emoji}</span>
                  <p className="text-xl font-bold text-neutral-900">{secondaryInfo.name}</p>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed">{secondaryInfo.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                  <h4 className="text-neutral-900 font-bold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Superpoderes
                  </h4>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li>• Comunicação visual autêntica</li>
                    <li>• Magnetismo pessoal elevado</li>
                    <li>• Coerência estratégica</li>
                  </ul>
               </div>
               <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                  <h4 className="text-neutral-900 font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Próximos Passos
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Sua jornada continua no painel principal, onde você encontrará sugestões de looks baseadas no seu arquétipo.
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="bg-neutral-900 hover:bg-black text-white h-14 rounded-2xl font-bold text-lg shadow-xl"
                onClick={() => router.push('/client/dashboard')}
              >
                Ir para o Dashboard
              </Button>
              <Button 
                variant="ghost"
                className="text-neutral-400 hover:text-neutral-600 gap-2"
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
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-neutral-900">
      <div className="mb-10 text-center">
        <Button variant="ghost" className="mb-6 text-neutral-400 hover:text-neutral-900" onClick={() => router.push('/client/quiz')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Desistir da Jornada
        </Button>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" />
          Mapeamento Arquetípico
        </div>
        <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-2">Desperte sua Essência</h1>
        <p className="text-neutral-500">Responda com seu coração para descobrir sua imagem magnética.</p>
      </div>

      <div className="mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          <span>Passo {currentStep + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-neutral-100" />
      </div>

      <Card className="border-neutral-200/40 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-b-[6px] border-rose-100">
        <CardHeader className="pb-8 pt-12 px-10 text-center">
          <CardTitle className="text-2xl md:text-3xl font-serif font-bold leading-tight text-neutral-900">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => setAnswers({...answers, [currentStep]: opt.archetype})}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 group
                  ${answers[currentStep] === opt.archetype 
                    ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-500/10' 
                    : 'border-neutral-100 bg-white hover:border-rose-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-4">
                   <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                    ${answers[currentStep] === opt.archetype ? 'bg-rose-500 text-white' : 'bg-neutral-50 text-neutral-400 group-hover:bg-rose-100 group-hover:text-rose-600'}
                   `}>
                     {String.fromCharCode(65 + idx)}
                   </span>
                   <span className={`text-left text-base font-medium transition-colors ${answers[currentStep] === opt.archetype ? 'text-rose-950 font-bold' : 'text-neutral-600'}`}>
                     {opt.text}
                   </span>
                </div>
                {answers[currentStep] === opt.archetype && <CheckCircle2 className="w-6 h-6 text-rose-500 animate-in zoom-in duration-300" />}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-10 py-8 flex justify-between bg-neutral-50/50 border-t border-neutral-100">
          <Button variant="ghost" size="lg" onClick={handleBack} disabled={currentStep === 0} className="text-neutral-400 font-bold text-xs uppercase tracking-widest">
            Anterior
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={!answers[currentStep] || isSaving}
            className="bg-neutral-900 text-white hover:bg-rose-600 transition-all shadow-xl px-10 rounded-xl font-bold h-14"
          >
            {isSaving ? 'Salvando...' : currentStep === questions.length - 1 ? 'Mapear Agora' : 'Próxima'} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
