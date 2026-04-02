import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, CheckCircle2, Clock, 
  ArrowRight, ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getQuizzes } from "@/lib/actions/quizzes"
import { QuizListItem } from "@/components/quizzes/QuizListItem"

export const dynamic = 'force-dynamic'

export default async function ConsultantQuizzesPage() {
  const quizzes = await getQuizzes()
  
  const pendingQuizzes = quizzes.filter(q => q.status === 'pending')
  const completedQuizzes = quizzes.filter(q => q.status === 'approved')

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Insights & Analytics
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Diagnósticos & Quizzes</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Gerencie e analise as respostas dos testes de suas clientes para criar estratégias de imagem personalizadas.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2 transition-all">
            <ClipboardCheck className="w-4 h-4" /> Configurar Testes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs px-2">
            <Clock className="w-4 h-4" /> Pendentes de Revisão
          </div>
          
          <div className="space-y-6">
            {pendingQuizzes.length === 0 ? (
              <Card className="border-dashed border-2 border-primary/10 bg-background/20 rounded-[2rem] p-10 text-center">
                <p className="text-muted-foreground text-sm italic">Nenhum teste pendente.</p>
              </Card>
            ) : (
              pendingQuizzes.map((quiz, i) => (
                <QuizListItem key={quiz.id} quiz={quiz} index={i} isPending />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
              <CheckCircle2 className="w-4 h-4" /> Resultados Recentes
            </div>
            <Button variant="link" className="text-primary text-xs font-bold p-0 decoration-primary/30">Ver Todos</Button>
          </div>

          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2.5rem] overflow-hidden border border-primary/5">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-[0.25em]">
                    <tr>
                      <th className="px-8 py-6">Cliente</th>
                      <th className="px-8 py-6">Diagnóstico</th>
                      <th className="px-8 py-6">Data</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {completedQuizzes.length === 0 && pendingQuizzes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground italic text-sm">
                          Nenhum dado disponível no momento.
                        </td>
                      </tr>
                    ) : (
                      [...pendingQuizzes, ...completedQuizzes].map((quiz, i) => (
                        <tr key={quiz.id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                {quiz.profiles?.full_name?.charAt(0) || 'C'}
                              </div>
                              <span className="text-sm text-foreground font-bold tracking-tight">
                                {quiz.profiles?.full_name || 'Cliente'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg">
                              {quiz.quiz_type}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-xs text-muted-foreground font-medium">
                            {new Date(quiz.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${quiz.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                 {quiz.status === 'pending' ? 'Pendente' : 'Finalizado'}
                               </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-xl font-bold text-xs gap-2 transition-all">
                               Dossiê <ArrowRight className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
