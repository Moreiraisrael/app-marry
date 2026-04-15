import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, Palette, BookOpen, 
  Download, Share2, ClipboardList, Star, Shirt
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getClientDashboard } from "@/lib/actions/dashboard"
import { SEASONS_DATA, ARCHETYPES_DATA } from "@/lib/constants/style-data"

export const dynamic = 'force-dynamic'

export default async function ClientDossierPage() {
  const data = await getClientDashboard()
  
  if (!data || !data.profile) return null

  const profile = data.profile
  const currentSeason = profile.season || "Inverno Frio" // Default fallback for preview
  const currentArchetypeKey = (profile.style_archetypes && profile.style_archetypes.length > 0) 
    ? profile.style_archetypes[0] 
    : "A Governante" // Default fallback

  const seasonData = SEASONS_DATA[currentSeason] || SEASONS_DATA["Inverno Frio"]
  const archetypeData = ARCHETYPES_DATA[currentArchetypeKey] || ARCHETYPES_DATA["A Governante"]

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge className="bg-rose-100 text-rose-600 border-rose-200 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
          Sua Identidade Visual
        </Badge>
        <h1 className="text-5xl font-serif font-bold text-neutral-900 tracking-tight">Meu Dossiê de Estilo</h1>
        <p className="text-neutral-500 text-lg max-w-2xl mx-auto italic">
          &quot;A moda passa, o estilo permanece.&quot; — Coco Chanel
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6 gap-2">
            <Download className="w-4 h-4" /> Baixar PDF
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 rounded-xl px-6 gap-2">
            <Share2 className="w-4 h-4" /> Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Color Palette Card */}
        <Card className="border-rose-100 bg-white shadow-xl shadow-rose-50/50 rounded-3xl overflow-hidden group hover:shadow-rose-100/50 transition-all duration-500">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <Palette className="w-6 h-6" />
              <CardTitle className="font-serif text-2xl text-neutral-800">Sua Cartela de Cores</CardTitle>
            </div>
            <p className="text-neutral-500 text-sm">Harmonia cromática baseada no seu subtom e contraste.</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50 text-center">
              <span className="text-rose-700 font-bold uppercase tracking-widest text-xs">Paleta Sugerida</span>
              <h3 className="text-2xl font-serif text-neutral-900 mt-1">{seasonData.name}</h3>
              <p className="text-[10px] font-bold text-neutral-400 mt-2 tracking-wider uppercase">{seasonData.contrast}</p>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {seasonData.colors.map((color, i) => (
                <div key={i} className="group/color relative">
                  <div 
                    className="w-12 h-12 rounded-full shadow-inner border border-stone-200 transition-transform group-hover/color:scale-110 bg-[var(--swatch-color)]"
                    style={{ '--swatch-color': color } as React.CSSProperties}
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity text-[8px] font-bold text-neutral-400">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Archetype Card */}
        <Card className="border-rose-100 bg-white shadow-xl shadow-rose-50/50 rounded-3xl overflow-hidden group hover:shadow-rose-100/50 transition-all duration-500">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <Star className="w-6 h-6" />
              <CardTitle className="font-serif text-2xl text-neutral-800">Seu Arquétipo Base</CardTitle>
            </div>
            <p className="text-neutral-500 text-sm">A energia predominante na sua expressão de imagem.</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50 text-center">
              <span className="text-rose-700 font-bold uppercase tracking-widest text-xs">Arquétipo Principal</span>
              <h3 className="text-2xl font-serif text-neutral-900 mt-1">{archetypeData.title}</h3>
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed">
              {archetypeData.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Style DNA Section */}
      <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/30 shadow-xl shadow-rose-50/50 rounded-3xl overflow-hidden">
        <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-rose-100/50">
          <div className="flex items-center gap-3 text-rose-500">
            <ClipboardList className="w-6 h-6" />
            <CardTitle className="font-serif text-2xl text-neutral-800">Seu DNA de Estilo</CardTitle>
          </div>
          <Badge variant="outline" className="border-rose-200 text-rose-500">{archetypeData.proportion}</Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Shirt className="w-4 h-4" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Peças-Chave</h4>
              </div>
              <ul className="text-neutral-600 text-sm space-y-2">
                {archetypeData.keyItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 italic">
                    <span className="w-1 h-1 bg-rose-300 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Acessórios</h4>
              </div>
              <ul className="text-neutral-600 text-sm space-y-2">
                {archetypeData.accessories.map((item, idx) => (
                   <li key={idx} className="flex items-center gap-2 italic">
                     <span className="w-1 h-1 bg-rose-300 rounded-full" /> {item}
                   </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <BookOpen className="w-4 h-4" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Palavras-Chave</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {archetypeData.attributes.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-white border-rose-100 text-neutral-500 font-medium px-3">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer Branding */}
      <div className="text-center pb-12 opacity-50 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-rose-400" />
        <span className="text-neutral-400 text-xs tracking-[0.3em] font-medium uppercase">E.S.T.I.L.O. Methodology by Estilo App</span>
      </div>
    </div>
  )
}
