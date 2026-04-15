import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#30332f] selection:bg-[#6a5d4a]/20 selection:text-[#5e513e] font-sans flex flex-col">
      
      {/* Subtle Texture Fallback */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"><filter id=\\"noiseFilter\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23noiseFilter)\\"/></svg>")' }}
      ></div>

      {/* Top Navigation Bar */}
      <nav className="w-full z-50 py-8">
        <div className="flex justify-between items-center px-8 md:px-16 w-full max-w-[1600px] mx-auto">
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-[0.15rem] text-[#0e0e0d]">E.S.T.I.L.O.</Link>
          <div className="hidden md:flex items-center space-x-12 opacity-60">
            <Link href="#" className="font-serif tracking-[0.05em] uppercase text-[10px] md:text-xs font-medium text-[#0e0e0d] hover:opacity-100 transition-opacity">Coleções</Link>
            <Link href="#" className="font-serif tracking-[0.05em] uppercase text-[10px] md:text-xs font-medium text-[#0e0e0d] hover:opacity-100 transition-opacity">O Atelier</Link>
            <Link href="#" className="font-serif tracking-[0.05em] uppercase text-[10px] md:text-xs font-medium text-[#0e0e0d] hover:opacity-100 transition-opacity">Sobre</Link>
          </div>
          <Link href="/auth/login">
            <button className="bg-[#505050] text-white px-8 py-3 uppercase tracking-[0.15rem] text-[10px] font-bold hover:bg-black transition-colors">
               Continuar
            </button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden w-full max-w-[1600px] mx-auto px-8 md:px-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center w-full min-h-[70vh]">
          
          {/* Left: Content */}
          <div className="lg:col-span-5 z-10 flex flex-col justify-center mt-12 lg:mt-0">
            <div className="mb-8">
              <span className="uppercase tracking-[0.3em] text-[10px] text-[#8c8273]">Collection No. 04</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-[#0e0e0d] tracking-tight mb-8">
                A Nova Era <br/> 
                <span className="italic font-light">da</span> Elegância
            </h1>
            
            <p className="text-[#686868] text-base md:text-lg max-w-md leading-relaxed mb-12">
                Onde a tradição da alta costura encontra a precisão do digital. O atelier definitivo para o mestre do estilo pessoal contemporâneo.
            </p>
            
            <div className="flex items-center space-x-8">
              <Link href="/auth/login">
                <button className="bg-[#0e0e0d] text-white px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-semibold transition-colors hover:bg-[#30332f]">
                    Continuar
                </button>
              </Link>
              <Link href="/auth/login" className="group flex items-center uppercase tracking-[0.2em] text-[10px] text-[#0e0e0d] font-semibold border-b border-[#0e0e0d]/20 pb-1 hover:border-[#0e0e0d] transition-all">
                  Descobrir
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Abstract 3D Geometric/Editorial Element */}
          <div className="lg:col-span-7 relative h-full flex justify-end items-center right-0">
            {/* The structural transparent block from the design */}
            <div className="absolute left-0 bottom-10 w-48 h-48 bg-[#f0eee9] mix-blend-multiply opacity-50 z-0 hidden lg:block"></div>
            
            {/* The main subject image taking up a large clean square approach */}
            <div className="relative w-full max-w-[650px] aspect-square bg-[#ffffff] shadow-2xl z-10">
              <img 
                alt="3D Abstract Conceptual Elegance" 
                className="w-full h-full object-contain p-8 object-center" 
                // Imagem gerada por IA (Alta Costura & Estilo Minimalista)
                src="/lux_estilo_hero.png"
              />
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
