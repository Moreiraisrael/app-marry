import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Trophy, Palette, Flame } from "lucide-react"

export default function ClientDashboard() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-2">Bem-vinda de volta, Cliente!</h1>
        <p className="text-neutral-500 text-lg">Acompanhe seu progresso e evolução de estilo E.S.T.I.L.O.</p>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Seu Nível</p>
              <h3 className="text-2xl font-bold text-neutral-900">Iniciante</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Dias Seguidos</p>
              <h3 className="text-2xl font-bold text-neutral-900">3 Dias</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-100 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Evolução do Estilo</p>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 min-w-[200px]">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-rose-600 ml-4">45%</span>
          </CardContent>
        </Card>
      </div>

      {/* Digital Dossier Preview */}
      <h2 className="text-2xl font-serif font-bold text-neutral-900 mb-6 mt-12">Seu Dossiê Base</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2 text-rose-600 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold uppercase tracking-wider text-xs">Identidade Mapeada</span>
            </div>
            <CardTitle className="text-xl">Estilo Clássico & Elegante</CardTitle>
            <CardDescription className="text-base mt-2">
              Você projeta uma imagem refinada e transmite credibilidade. Prefere peças atemporais de alfaiataria com caimento impecável.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2 text-amber-600 mb-2">
              <Palette className="w-5 h-5" />
              <span className="font-semibold uppercase tracking-wider text-xs">Cartela de Cores</span>
            </div>
            <CardTitle className="text-xl">Inverno Frio</CardTitle>
            <CardDescription className="text-base mt-2">
              Sua pele brilha com cores profundas, intensas e de fundo azulado. Evite tons muito quentes e terrosos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 shadow-sm"></div>
              <div className="w-8 h-8 rounded-full bg-rose-700 shadow-sm"></div>
              <div className="w-8 h-8 rounded-full bg-emerald-800 shadow-sm"></div>
              <div className="w-8 h-8 rounded-full bg-indigo-900 shadow-sm"></div>
              <div className="w-8 h-8 rounded-full bg-fuchsia-800 shadow-sm"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
