import { Card } from "@/components/ui/card"
import { Sparkles, Trophy, Palette, Flame, ArrowRight, ShoppingBag, Heart, Clock, Calendar } from "lucide-react"
import { getClientDashboard } from "@/lib/actions/dashboard"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const data = await getClientDashboard()
  
  if (!data) return null

  const { profile, wardrobeCount, level, styleProgress, nextAppointment } = data

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Bem-vinda ao seu Universo
          </div>
          <h1 className="text-5xl font-bold text-foreground tracking-tight mb-2">Olá, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-xl font-light">Sua jornada de estilo está em plena evolução.</p>
        </div>
        <Link href="/client/quiz" className="inline-flex items-center justify-center gap-3 h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl px-10 font-bold shadow-xl shadow-stone-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2">
            Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8 border border-primary/5">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Seu Nível</p>
              <h3 className="text-xl font-bold text-foreground line-clamp-1">{level}</h3>
            </div>
          </div>
        </Card>

        <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8 border border-primary/5 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Streak</p>
                <h3 className="text-2xl font-bold text-foreground">5 Dias</h3>
              </div>
            </div>
        </Card>

        <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2.5rem] p-8 border border-primary/5 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evolução de Estilo</p>
              <span className="text-2xl font-bold text-primary">{styleProgress}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3">
              <div className="bg-primary h-3 rounded-full shadow-sm" style={{ width: `${styleProgress}%` }}></div>
            </div>
        </Card>
      </div>

      {/* Main Core Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Dossiê Area */}
         <div className="lg:col-span-2 space-y-10">
            <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
               Seu Dossiê Estratégico
               <div className="h-px flex-1 bg-stone-200" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2.5rem] p-10 border border-primary/5 group hover:shadow-xl transition-all duration-700">
                  <div className="flex items-center gap-3 text-primary mb-6">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Identidade Visual</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {profile?.style_archetypes?.[0] || 'Aguardando Análise'}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed mb-8">
                    {profile?.style_archetypes?.[0] 
                      ? "Uma imagem que transmite poder e refinamento através de cortes impecáveis e tecidos nobres."
                      : "Sua consultora está finalizando o mapeamento da sua essência visual. Em breve aqui."}
                  </p>
                  <Link href="/client/dossier" className="inline-flex items-center justify-center p-0 text-primary font-bold gap-2 group/btn hover:underline transition-all">
                      Ver Detalhes <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
               </Card>

               <Card className="border-none bg-stone-900 shadow-2xl rounded-[2.5rem] p-10 text-white group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-1000" />
                  <div className="flex items-center gap-3 text-primary mb-6">
                    <Palette className="w-6 h-6" />
                    <span className="font-bold uppercase tracking-widest text-[10px] text-primary/80">Coloração Pessoal</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{profile?.season || 'Cartela Pendente'}</h3>
                  <p className="text-stone-400 font-light text-sm leading-relaxed mb-10">
                    Sua beleza natural é potencializada por tons frios e profundos. Use o contraste a seu favor.
                  </p>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
                     <div className="w-8 h-8 rounded-full bg-stone-800 border border-white/10" />
                     <div className="w-8 h-8 rounded-full bg-rose-900 border border-white/10" />
                     <div className="w-8 h-8 rounded-full bg-emerald-950 border border-white/10" />
                  </div>
               </Card>
            </div>
         </div>

         {/* Quick Actions Sidebar */}
         <div className="space-y-8">
             {nextAppointment && (
                <Card className="border-none bg-stone-900 border border-primary/20 p-8 rounded-[2rem] text-white relative shadow-xl shadow-stone-900/10 overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                   <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Calendar className="w-4 h-4" /> Próxima Sessão
                   </h4>
                   <h3 className="text-xl font-serif mb-2">{nextAppointment.notes || 'Sessão de Consultoria'}</h3>
                   <div className="flex items-center gap-2 text-stone-300 text-sm mb-6">
                      <Clock className="w-4 h-4 text-primary" />
                      {format(new Date(nextAppointment.start_time), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                   </div>
                </Card>
             )}

             <Card className="border-none bg-primary p-10 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10" />
                <h4 className="text-xl font-bold mb-3 relative z-10">Acervo Digital</h4>
                <div className="text-4xl font-black mb-4 relative z-10 tracking-tighter">{wardrobeCount}</div>
                <p className="text-xs text-white/80 leading-relaxed mb-8 relative z-10">Peças cadastradas em seu guarda-roupa para multiplicação de looks.</p>
                <Link href="/client/wardrobe" className="inline-flex items-center justify-center w-full bg-white text-primary hover:bg-stone-50 font-bold rounded-xl h-12 relative z-10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2">
                    Explorar Armário
                </Link>
             </Card>

             <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8 border border-primary/5">
                <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
                   <ShoppingBag className="w-4 h-4 text-primary" /> Curadoria Shop
                </h4>
                <div className="space-y-4">
                   <Link href="/client/shop" className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all cursor-pointer group hover:shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Heart className="w-5 h-5" />
                         </div>
                         <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Wishlist Ativa</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
             </Card>
         </div>
      </div>
    </div>
  )
}
