import { ArrowRight, PenTool, Scan, Scissors, Quote, Globe, Share2 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#30332f] selection:bg-[#6a5d4a]/20 selection:text-[#5e513e] font-sans">
      
      {/* Subtle Texture Fallback */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"><filter id=\\"noiseFilter\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23noiseFilter)\\"/></svg>")' }}
      ></div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#fbf9f6]/80 backdrop-blur-md transition-colors duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-serif tracking-[0.15rem] text-[#0e0e0d]">E.S.T.I.L.O.</Link>
          <div className="hidden md:flex items-center space-x-12">
            <Link href="#" className="font-serif tracking-[0.02em] uppercase text-xs font-medium text-[#5f5e5e] hover:text-[#6a5d4a] transition-all duration-300">Coleções</Link>
            <Link href="#" className="font-serif tracking-[0.02em] uppercase text-xs font-medium text-[#5f5e5e] hover:text-[#6a5d4a] transition-all duration-300">O Atelier</Link>
            <Link href="#" className="font-serif tracking-[0.02em] uppercase text-xs font-medium text-[#5f5e5e] hover:text-[#6a5d4a] transition-all duration-300">Sobre</Link>
          </div>
          <Link href="/auth/login">
            <button className="bg-[#5f5e5e] text-[#faf7f6] px-8 py-3 uppercase tracking-[0.15rem] text-[10px] font-bold hover:opacity-90 transition-opacity">
               Continuar
            </button>
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 overflow-hidden mx-auto">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-6 z-10">
              <div className="mb-6">
                <span className="uppercase tracking-[0.3rem] text-[10px] text-[#6a5d4a] opacity-80">Collection No. 04</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-[#0e0e0d] tracking-[0.02em] mb-8">
                  A Nova Era <br/> <span className="italic font-light">da</span> Elegância
              </h1>
              <p className="text-[#5d605b] text-lg md:text-xl max-w-lg leading-relaxed mb-12 opacity-90">
                  Onde a tradição da alta costura encontra a precisão do digital. O atelier definitivo para o mestre do estilo pessoal contemporâneo.
              </p>
              <div className="flex items-center space-x-8">
                <Link href="/auth/login">
                  <button className="bg-[#0e0e0d] text-[#fbf9f6] px-12 py-5 uppercase tracking-[0.2rem] text-xs font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      Continuar
                  </button>
                </Link>
                <Link href="/auth/login" className="group flex items-center uppercase tracking-[0.15rem] text-[10px] text-[#5e513e] font-bold border-b border-[#b1b3ad]/30 pb-1 hover:border-[#6a5d4a] transition-all">
                    Descobrir
                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Hero Image Asymmetric */}
            <div className="lg:col-span-6 relative mt-12 lg:mt-0">
              <div className="relative w-full aspect-[4/5] bg-[#f5f3f0] overflow-hidden shadow-[40px_60px_80px_-40px_rgba(48,51,47,0.04)]">
                <img 
                  alt="Elegância Atemporal" 
                  className="w-full h-full object-cover grayscale-[20%] hover:scale-105 transition-transform duration-[2000ms]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj0ccXbu8HuFRbaIfjhJpbdiiZ_FCf08GUFCLIeNG-6Ic0S-IxHmxNXd_GGoU_ybA7M_YqoNPcu0y0__Ai6zVCzhpWqLMH5KpucCX8eIQsk8_MvEN1AfcWDoGULIoaaxGZiKJA-wOLPTNFlLaTeijvZhcO6OptG1IYERzgg3Re3KjlqFmNOztSrq1p4bVQTn7r34itaXwNf-1Pk0VWP2omODTA2WVenEJiJBr-TPdV7gxEc_EQ8omJhW7eLTAAL6Gdbk4O3PVmYLtl"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#e2e3dd]/15 pointer-events-none"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#6a5d4a]/5 hidden md:block"></div>
            </div>
          </div>

          {/* Logo Cloud */}
          <div className="mt-24 md:mt-48 w-full border-t border-[#b1b3ad]/15 pt-12 pb-24">
            <p className="uppercase tracking-[0.2rem] text-[9px] text-center mb-10 opacity-50">Destaque em Publicações de Prestígio</p>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 grayscale opacity-40 hover:opacity-70 transition-opacity">
              <span className="font-serif text-2xl tracking-tighter italic">VOGUE</span>
              <span className="font-serif text-2xl font-bold tracking-widest">ELLE</span>
              <span className="font-serif text-2xl tracking-widest uppercase">Bazaar</span>
              <span className="font-serif text-2xl font-light tracking-[0.3em]">L'OFFICIEL</span>
              <span className="font-serif text-2xl italic tracking-tight">Marie Claire</span>
            </div>
          </div>
        </section>

        {/* Digital Atelier Section */}
        <section className="py-32 px-6 md:px-12 bg-[#f5f3f0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-xl">
                <h2 className="font-serif text-4xl md:text-5xl text-[#0e0e0d] mb-6 leading-tight">O Domínio <br/><span className="italic">da</span> Forma</h2>
                <p className="text-[#5d605b]">Cada detalhe é uma declaração de intenções. Nosso atelier digital utiliza algoritmos de proporção áurea para curar o guarda-roupa que define sua essência.</p>
              </div>
              <div className="hidden md:block">
                <PenTool size={60} className="text-[#5e513e]/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-[#fbf9f6] p-12 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
                  <span className="uppercase tracking-[0.2rem] text-[10px] text-[#6a5d4a]">A Curadoria</span>
                  <div>
                    <h3 className="font-serif text-3xl mb-4 italic text-[#0e0e0d]">Peças Atemporais</h3>
                    <p className="text-[#5d605b] max-w-xs text-sm">Uma seleção rigorosa de materiais nobres e cortes arquitetônicos.</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
                  <img alt="Texturas" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsLg8rQpVhJCmMgKODybep65S7cSO1Ux71eZaFa-04YwxbYFXVLp0fljEyxXLFUSYUdyrpMC-sEwTv7QS14dK2JxuSvO_j-hgTcY4_DrQc4ZFNuKJ92_bto4TqTjuXCVto_YP_pVW91boP_i6gzTGy5yv2NXBlBw_tYiqhdPSme9BZwN3P4u5-obflFIrq4rtTx2TC5jZOmF81gzbrsvO3O7McDQM9qD2oBizsFk6-kIq-pjm3v88dDlpDciQPkamYVb960K4dAueC"/>
                </div>
              </div>
              <div className="md:col-span-4 bg-[#0e0e0d] p-12 text-[#fbf9f6] flex flex-col justify-between min-h-[400px]">
                <span className="uppercase tracking-[0.2rem] text-[10px] text-[#b1b3ad]">A Tecnologia</span>
                <h3 className="font-serif text-3xl leading-snug">O Algoritmo <br/>da Silhueta</h3>
                <Scan size={48} className="opacity-30 self-end mt-4 md:mt-12" />
              </div>
              <div className="md:col-span-4 bg-[#e2e3dd] p-12 min-h-[400px] flex flex-col justify-center items-center text-center">
                <Scissors size={36} className="text-[#6a5d4a] mb-6" />
                <h3 className="font-serif text-2xl italic mb-4 text-[#0e0e0d]">Medida Digital</h3>
                <p className="text-[#5d605b] text-sm px-4">Precisão milimétrica através de mapeamento visual exclusivo.</p>
              </div>
              <div className="md:col-span-8 relative aspect-video md:aspect-auto overflow-hidden">
                <img alt="Fashion" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwqNfyVKhjChms0aS3u2BrwC66BMFED1U3qesxY28U6AI_xOEO1wTB9UI_4OL2ZyvPUluBLHS1SpweAW1gMj5VURMrTCSEebvj7t7H8he0Qp7disKmCklvjmWaYAYjkqlBzE_J-TMDmlBDpz6q9FCDSMAhTkvuhQRhDqUp1DQhdJLvTjK_c7CBQfBCk8qTsGiLfI7LrbRyoR_cCt8b5mBiOcJUQqarFtIk4OjpHo2QyX4qUdXsPeZpIlRmC0wCORLpPBgrg_JScsmd"/>
              </div>
            </div>
          </div>
        </section>

        {/* Signature Quote Section */}
        <section className="py-48 px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <Quote size={48} className="text-[#6a5d4a] opacity-30 mb-8" />
            <blockquote className="font-serif text-3xl md:text-5xl italic leading-relaxed text-[#0e0e0d] mb-12">
                "O estilo é uma linguagem secreta que todos ouvem, mas poucos sabem articular com perfeição."
            </blockquote>
            <cite className="uppercase tracking-[0.3rem] text-xs text-[#5e513e] not-italic">E.S.T.I.L.O. Digital Atelier</cite>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-6 md:px-12 border-t border-[#b1b3ad]/15 bg-[#f5f3f0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 w-full">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-serif tracking-widest text-[#0e0e0d]">E.S.T.I.L.O.</span>
            <p className="uppercase tracking-[0.15rem] text-[10px] text-[#5f5e5e]">
                © 2026 E.S.T.I.L.O. Digital Atelier. All Rights Reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <Link href="#" className="uppercase tracking-[0.15rem] text-[10px] text-[#5f5e5e] hover:text-[#6a5d4a] transition-colors focus:underline underline-offset-4">Privacidade</Link>
            <Link href="#" className="uppercase tracking-[0.15rem] text-[10px] text-[#5f5e5e] hover:text-[#6a5d4a] transition-colors focus:underline underline-offset-4">Termos</Link>
            <Link href="#" className="uppercase tracking-[0.15rem] text-[10px] text-[#5f5e5e] hover:text-[#6a5d4a] transition-colors focus:underline underline-offset-4">Contato</Link>
          </div>
          <div className="flex gap-6">
            <Globe size={18} className="text-[#5f5e5e] cursor-pointer hover:text-[#6a5d4a] transition-colors" />
            <Share2 size={18} className="text-[#5f5e5e] cursor-pointer hover:text-[#6a5d4a] transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  )
}
