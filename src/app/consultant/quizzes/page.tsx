'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, CheckCircle2, Clock, Search, 
  ArrowRight, Filter, ClipboardCheck, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function ConsultantQuizzesPage() {
  const pendingQuizzes = [
    { client: 'Mariana Costa', quiz: 'Estilo Pessoal', date: 'Há 2 horas', status: 'pending' },
    { client: 'Luciana Ferreira', quiz: 'Arquétipos', date: 'Há 5 horas', status: 'pending' },
  ]

  const recentResults = [
    { client: 'Ana Paula', quiz: 'Coloração Pessoal', date: '24 Mar', result: 'Inverno Frio' },
    { client: 'Carla Dias', quiz: 'Estilo Pessoal', date: '23 Mar', result: 'Elegante/Moderno' },
    { client: 'Fernanda Lima', quiz: 'Arquétipos', date: '22 Mar', result: 'A Criadora' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Diagnósticos & Quizzes</h1>
          <p className="text-muted-foreground text-lg">Gerencie e analise as respostas dos testes de suas clientes.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6 gap-2">
            <ClipboardCheck className="w-4 h-4" /> Configurar Testes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Pending Review column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs px-2">
            <Clock className="w-4 h-4" /> Pendentes de Revisão
          </div>
          {pendingQuizzes.map((quiz, i) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={i}
            >
              <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-[2rem] p-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold text-base">{quiz.client}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{quiz.date}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-3 py-1 rounded-lg">Novo</Badge>
                </div>
                
                <div className="bg-background/40 p-4 rounded-2xl mb-6 text-sm text-foreground/80 border border-primary/5 relative z-10">
                  <span className="text-primary block mb-1 font-bold text-[10px] uppercase tracking-widest">Teste:</span>
                  {quiz.quiz}
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl gap-2 font-bold h-12 shadow-lg shadow-primary/10 border-none relative z-10">
                  Analisar Respostas <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Results table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resultados Recentes
            </div>
            <Button variant="link" className="text-primary text-xs font-bold p-0">Ver Todos</Button>
          </div>

          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] overflow-hidden">
             <div className="p-8 border-b border-primary/5 flex gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="bg-background/50 border-primary/10 text-foreground h-12 pl-12 rounded-2xl focus:ring-primary/20" placeholder="Filtrar por cliente..." />
                </div>
                <Button variant="outline" className="border-primary/20 bg-background/50 text-foreground h-12 w-12 p-0 rounded-2xl">
                  <Filter className="w-4 h-4" />
                </Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Cliente</th>
                      <th className="px-8 py-5">Diagnóstico</th>
                      <th className="px-8 py-5">Data</th>
                      <th className="px-8 py-5">Resultado Primário</th>
                      <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {recentResults.map((res, i) => (
                      <tr key={i} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-8 py-6 text-sm text-foreground font-bold">{res.client}</td>
                        <td className="px-8 py-6 text-sm text-foreground/70 font-medium">{res.quiz}</td>
                        <td className="px-8 py-6 text-sm text-muted-foreground">{res.date}</td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold text-[10px] uppercase rounded-xl">
                            {res.result}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button variant="ghost" size="sm" className="text-muted-foreground group-hover:text-primary transition-all hover:bg-primary/5 rounded-xl font-bold text-xs gap-1">
                             Dossiê <ArrowRight className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
