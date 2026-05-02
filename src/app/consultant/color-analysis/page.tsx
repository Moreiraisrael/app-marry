import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, Camera, History, Plus, 
  Palette, Star
} from "lucide-react"
import { getColorAnalysisRequests } from "@/lib/actions/color-analysis"
import { ColorAnalysisItem } from "@/components/color-analysis/ColorAnalysisItem"
import { NewAnalysisDialog } from "@/components/color-analysis/NewAnalysisDialog"
import { IALearningDialog } from "@/components/color-analysis/IALearningDialog"

export const dynamic = 'force-dynamic'

export default async function ColorAnalysisPage() {
  const requests = await getColorAnalysisRequests()

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-primary font-bold tracking-[0.2em] uppercase text-xs">
            <Sparkles className="w-4 h-4" />
            Color Intelligence AI
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Análise de Coloração</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Identifique a cartela de cores ideal de sua cliente com precisão matemática e auxílio de visão computacional.
          </p>
        </div>
        <NewAnalysisDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-700">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-4">Inicie uma nova jornada cromática</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Arraste uma foto da sua cliente ou use a câmera para capturar o subtom de pele e olhos em tempo real.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm">
                <NewAnalysisDialog trigger={
                  <Button className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold gap-2 hover:bg-foreground/90 transition-colors">
                    <Plus className="w-5 h-5" /> Enviar Foto
                  </Button>
                } />
                <NewAnalysisDialog trigger={
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 text-foreground hover:bg-primary/5 gap-2 transition-colors">
                     Manual
                  </Button>
                } />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-white/60 transition-all cursor-pointer shadow-sm border border-primary/5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Dossiê de Cores</h4>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gerador de PDF Pro</p>
              </div>
            </Card>
            <Card className="border-none bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-white/60 transition-all cursor-pointer shadow-sm border border-primary/5">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 border border-stone-200/50">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Histórico</h4>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Análises Anteriores</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <History className="w-4 h-4" /> Recentes
            </h3>
            <Button variant="link" className="text-primary text-xs font-bold p-0 decoration-primary/30">Ver Tudo</Button>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card className="border-dashed border-2 border-primary/10 bg-background/20 rounded-[2rem] p-8 text-center">
                <p className="text-muted-foreground text-sm italic">Nenhuma análise pendente ou recente.</p>
              </Card>
            ) : (
              requests.map((request, i) => (
                <ColorAnalysisItem key={request.id} request={request} index={i} />
              ))
            )}
          </div>
          
          <Card className="border-none bg-primary p-10 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group cursor-pointer shadow-2xl shadow-primary/20">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
             <div className="relative z-10">
               <h4 className="text-2xl font-bold mb-3 tracking-tight">IA Learning</h4>
               <p className="text-sm text-white/80 mb-8 font-light leading-relaxed">
                 Sua precisão nas análises subiu 15% este mês graças às novas atualizações de motor visual.
               </p>
               <IALearningDialog />
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
