import { Sparkles, ArrowRight, User, Briefcase, Star } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">E.S.T.I.L.O.</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-neutral-400">
          <a href="#" className="hover:text-amber-400 transition-colors">Metodologia</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Sobre</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Suporte</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-bold uppercase tracking-[0.2em]">
            <Star className="w-3 h-3" /> Lifestyle & Fashion Intelligence
          </div>
          <h1 className="text-7xl md:text-8xl font-serif font-bold tracking-tight leading-[0.9]">
            A Nova Era da <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Elegância</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
            Plataforma SaaS ultra-premium para consultoras de imagem e clientes que buscam a maestria do estilo pessoal através da metodologia E.S.T.I.L.O.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
             {/* Portal Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Link href="/auth/login" className="group">
                  <div className="h-full p-8 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-amber-500/30 hover:bg-neutral-900 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Briefcase className="w-20 h-20 text-amber-500" />
                    </div>
                    <Briefcase className="w-8 h-8 text-amber-500 mb-6" />
                    <h3 className="text-xl font-bold mb-2">Portal da Consultora</h3>
                    <p className="text-xs text-neutral-500 mb-6">Comece a gerenciar suas clientes e escale seu negócio.</p>
                    <div className="flex items-center text-amber-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Fazer Login <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>

                <Link href="/auth/login" className="group">
                  <div className="h-full p-8 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-rose-500/30 hover:bg-neutral-900 transition-all duration-500 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <User className="w-20 h-20 text-rose-500" />
                    </div>
                    <User className="w-8 h-8 text-rose-500 mb-6" />
                    <h3 className="text-xl font-bold mb-2">Área da Cliente</h3>
                    <p className="text-xs text-neutral-500 mb-6">Descubra seu estilo e receba seu dossiê exclusivo.</p>
                    <div className="flex items-center text-rose-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Fazer Login <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
             </div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative order-first lg:order-last animate-in fade-in zoom-in-95 duration-1000">
           <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-neutral-800 to-black border border-white/10 relative overflow-hidden shadow-2xl shadow-amber-500/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-neutral-800" />
                       ))}
                    </div>
                    <span className="text-sm font-medium text-neutral-400">+500 consultoras ativas</span>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                     <p className="text-sm italic text-neutral-200">{`"Transformei meu atendimento e escalei meu negócio com a precisão tecnológica do E.S.T.I.L.O."`}</p>
                    <p className="text-xs font-bold mt-4 text-amber-500">— Adriana M., Fashion Strategy</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Trust Bar */}
      <div className="border-t border-white/5 bg-neutral-950/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale contrast-125">
          {['VOGUE', 'ELLE', 'BAZAAR', 'L’OFFICIEL', 'GLAMOUR'].map(brand => (
             <span key={brand} className="text-2xl font-serif font-black tracking-widest">{brand}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
