import { Card } from "@/components/ui/card"
import { Crown, Palette, Settings2, Ruler, ScanFace, ArrowRight, Sparkles, Diamond, Cpu, Zap } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ClientToolsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-4 relative z-10 w-full">
           <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Crown className="w-4 h-4" />
            Recursos Exclusivos Marry Miele
          </div>
           <h1 className="text-5xl font-bold text-foreground leading-tight tracking-tight">Ferramentas <span className="text-primary italic">Avançadas</span></h1>
           <p className="text-muted-foreground text-xl max-w-xl font-light leading-relaxed">Acesse nosso ecossistema completo de análises estratégicas e diagnósticos inteligentes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dossiê Sazonal */}
        <Card className="border-none bg-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-stone-900/20 transition-all duration-700 hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px] -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-12">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5 shadow-inner">
                <Palette className="w-8 h-8 text-rose-200" />
              </div>
              <span className="flex items-center gap-2 text-[10px] font-bold text-rose-200 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Sparkles className="w-3 h-3" /> Color Analysis 2026
              </span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Dossiê Sazonal</h2>
              <p className="text-stone-400 font-light leading-relaxed text-sm max-w-sm">
                Explore sua cartela de coloração pessoal atualizada com as tendências cromáticas globais de 2026.
              </p>
              
              <div className="pt-6 flex gap-3">
                <div className="flex gap-2">
                   <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 shadow-lg" />
                   <div className="w-10 h-10 rounded-full bg-stone-800 border border-white/10 shadow-lg -ml-4" />
                   <div className="w-10 h-10 rounded-full bg-rose-900 border border-white/10 shadow-lg -ml-4" />
                   <div className="w-10 h-10 rounded-full bg-emerald-950 border border-white/10 shadow-lg -ml-4" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Guia de Biotipo */}
        <Card className="border-none bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 text-foreground relative overflow-hidden group shadow-xl shadow-stone-100 border border-stone-200/50 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stone-100 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-12">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200">
                <Ruler className="w-8 h-8 text-stone-700" />
              </div>
              <span className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-full">
                Análise Antropométrica
              </span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Guia de Biotipo</h2>
              <p className="text-muted-foreground font-light leading-relaxed text-sm max-w-sm">
                Descubra as modelagens, tecidos e proporções perfeitas para valorizar a arquitetura única do seu corpo.
              </p>
              
              <div className="pt-6">
                <div className="inline-flex items-center gap-3 text-sm font-bold text-stone-900 bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm">
                   Ver medidas detalhadas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Métricas de Visagismo */}
        <Card className="border-none bg-primary rounded-[3rem] p-12 text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20 transition-all duration-700 hover:shadow-primary/30 hover:-translate-y-1 cursor-pointer lg:col-span-2">
          <div className="absolute right-0 top-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ScanFace className="w-8 h-8 text-white" />
                </div>
                <div>
                   <span className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
                     <Cpu className="w-3 h-3" /> Diagnóstico por IA
                   </span>
                   <span className="text-white font-serif text-lg">Visagismo Avançado</span>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Métricas de Rosto</h2>
              <p className="text-white/80 font-light leading-relaxed max-w-lg mb-8 text-lg">
                 Nossa inteligência artificial mapeia os ângulos e linhas do seu rosto, revelando estratégias definitivas para cortes de cabelo, maquiagem e óculos perfeitos para sua essência geométrica.
              </p>
              
              <div className="inline-flex items-center justify-center gap-3 bg-white text-primary rounded-2xl px-8 py-4 font-bold shadow-xl hover:scale-105 transition-all">
                <Zap className="w-5 h-5" />
                Iniciar Escaneamento Facial
              </div>
            </div>
            
            <div className="hidden md:flex w-64 h-64 bg-white/5 backdrop-blur-sm rounded-full items-center justify-center border border-white/10 relative">
               <div className="absolute inset-0 rounded-full border border-white/20 animate-[spin_10s_linear_infinite]" />
               <div className="absolute inset-4 rounded-full border border-dashed border-white/30 animate-[spin_15s_linear_infinite_reverse]" />
               <ScanFace className="w-24 h-24 text-white opacity-80" />
            </div>
          </div>
        </Card>

        {/* Elite Settings */}
        <Card className="border-none bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 text-foreground relative overflow-hidden group shadow-xl shadow-stone-100 border border-stone-200/50 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 cursor-pointer lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-start gap-8">
             <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center shadow-2xl flex-shrink-0">
                <Diamond className="w-8 h-8 text-white" />
             </div>
             <div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Preferências da conta
                </span>
                <h2 className="text-3xl font-bold tracking-tight mb-3">Elite Settings</h2>
                <p className="text-muted-foreground font-light leading-relaxed max-w-xl text-sm">
                  Ajuste fino da sua experiência. Configure seu nível de ousadia fashion, gerencie seu concierge privado e defina notificações prioritárias.
                </p>
             </div>
          </div>
          
          <div className="w-full md:w-auto">
             <Link href="/client/profile" className="inline-flex items-center justify-center gap-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-2xl px-8 py-4 font-bold transition-all w-full md:w-auto border border-stone-200">
               <Settings2 className="w-5 h-5" />
               Acessar Configurações
             </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}
