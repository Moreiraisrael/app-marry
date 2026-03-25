import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Sparkles, User, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function QuizzesHub() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 tracking-tight mb-4">
          Descubra o seu E.S.T.I.L.O.
        </h1>
        <p className="text-neutral-500 max-w-xl mx-auto text-lg">
          Nosso motor de Inteligência Artificial precisa conhecer mais sobre você. Selecione qual jornada de descoberta deseja iniciar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-neutral-200 hover:border-rose-200 hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-rose-600" />
            </div>
            <CardTitle>Quiz de Estilo</CardTitle>
            <CardDescription>Descubra suas bases universais de estilo e a sua identidade visual diária ideal.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/client/quiz/style" className="w-full">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
                Iniciar Jornada <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-neutral-200 hover:border-amber-200 hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
              <Palette className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Coloração Pessoal</CardTitle>
            <CardDescription>Análise sazonal de contraste e temperatura guiada por IA para descobrir sua paleta.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/client/quiz/color" className="w-full">
              <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50 text-amber-900">
                Descobrir Paleta <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-neutral-200 hover:border-indigo-200 hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Arquétipos</CardTitle>
            <CardDescription>Mapeie a imagem magnética que você deseja projetar na sua vida amorosa e profissional.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/client/quiz/archetypes" className="w-full">
              <Button variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-900">
                Mapear Arquétipo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
