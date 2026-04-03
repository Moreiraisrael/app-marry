import { Card } from "@/components/ui/card"
import { ClipboardList, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { getQuizzes } from "@/lib/actions/quizzes"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function ClientQuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const quizResults = await getQuizzes(user.id)
  
  const availableQuizzes = [
    {
      id: 'style',
      slug: 'style',
      title: 'Descoberta de Estilo',
      description: 'Identifique sua essência visual e pilares de estilo.',
      quiz_type: 'style'
    },
    {
      id: 'archetype',
      slug: 'archetypes',
      title: 'Arquétipos de Imagem',
      description: 'Descubra a mensagem que sua imagem transmite.',
      quiz_type: 'archetype'
    },
    {
      id: 'color',
      slug: 'color',
      title: 'Análise de Coloração',
      description: 'Guia preliminar para sua paleta de cores ideal.',
      quiz_type: 'color'
    }
  ]

  const quizzesWithStatus = availableQuizzes.map(q => {
    const result = quizResults.find(r => r.quiz_type === q.quiz_type)
    return {
      ...q,
      completed: !!result,
      status: result?.status || 'pending'
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <ClipboardList className="w-4 h-4" />
            Mapeamento de Essência
          </div>
           <h1 className="text-5xl font-bold text-foreground leading-tight tracking-tight">Seus <span className="text-primary italic">Questionários</span></h1>
           <p className="text-muted-foreground text-xl max-w-xl font-light leading-relaxed">Responda aos testes para que sua consultora possa criar uma estratégia de imagem sob medida.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between border-b border-stone-100 pb-6">
              <h2 className="text-2xl font-bold text-foreground">Testes Disponíveis</h2>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">QUESTIONÁRIOS DISPONÍVEIS</span>
           </div>

           <div className="space-y-6">
              {quizzesWithStatus.map((quiz) => (
                  <Card key={quiz.id} className="p-8 rounded-[2rem] bg-white border-stone-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                       <div className="flex gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-inner">
                             {quiz.completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                          </div>
                          <div className="space-y-1">
                             <h3 className="text-xl font-bold text-foreground">{quiz.title}</h3>
                             <p className="text-muted-foreground font-light">{quiz.description}</p>
                             {quiz.completed && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest mt-2 inline-block">Concluído</span>}
                          </div>
                       </div>
                       <Link href={`/client/quiz/${quiz.slug}`} className={`inline-flex items-center justify-center h-12 rounded-xl px-8 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${quiz.completed ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-100'}`}>
                             {quiz.completed ? "Refazer Teste" : "Começar Agora"}
                       </Link>
                     </div>
                  </Card>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-stone-100 pb-6">
              <h2 className="text-2xl font-bold text-foreground">Por que responder?</h2>
           </div>
           
           <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 space-y-8">
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                       <p className="font-light text-stone-400">Dados precisos para sua análise cromática.</p>
                    </div>
                    <div className="flex gap-4">
                       <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                       <p className="font-light text-stone-400">Definição do seu arquétipo de estilo.</p>
                    </div>
                    <div className="flex gap-4">
                       <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                       <p className="font-light text-stone-400">Curadoria de compras mais assertiva.</p>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-sm text-stone-300 font-light">
                   &quot;As respostas nos ajudam a traduzir sua personalidade em uma imagem visual impactante.&quot;
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
