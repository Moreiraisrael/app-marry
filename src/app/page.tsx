import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2d2d2d] font-sans selection:bg-[#c2b291]/20 selection:text-[#5e513e]">
      
      {/* Texture Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-[50] opacity-[0.02]"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"><filter id=\\"noiseFilter\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.8\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23noiseFilter)\\"/></svg>")' }}
      ></div>

      {/* Header */}
      <header className="absolute top-0 w-full z-40">
        <div className="flex justify-between items-center px-10 py-8 lg:px-20 max-w-[1920px] mx-auto">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl tracking-[0.2em] font-medium text-[#111]">
            E.S.T.I.L.O.
          </Link>
          
          {/* Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-14 absolute left-1/2 -translate-x-1/2">
            <Link href="#" className="font-serif text-[9px] tracking-[0.1em] text-[#6d6d6d] uppercase hover:text-[#111] transition-colors">Coleções</Link>
            <Link href="#" className="font-serif text-[9px] tracking-[0.1em] text-[#6d6d6d] uppercase hover:text-[#111] transition-colors">O Atelier</Link>
            <Link href="#" className="font-serif text-[9px] tracking-[0.1em] text-[#6d6d6d] uppercase hover:text-[#111] transition-colors">Sobre</Link>
          </nav>

          {/* Top Right Button */}
          <Link href="/auth/login">
            <button className="bg-[#565554] text-[#f7f5f2] px-8 py-3 text-[9px] uppercase tracking-[0.15em] hover:bg-[#333] transition-colors shadow-sm">
              Continuar
            </button>
          </Link>
        </div>
      </header>

      {/* Main Presell Content */}
      <main className="relative min-h-screen flex items-center pt-24 pb-12 w-full max-w-[1920px] mx-auto overflow-hidden">
        <div className="w-full grid lg:grid-cols-2 lg:gap-8 px-10 lg:px-20 items-center">
          
          {/* Left Column (Text) */}
          <div className="flex flex-col z-10 lg:pr-20 mb-12 lg:mb-0">
            {/* Meta */}
            <p className="text-[#a49a88] text-[9px] uppercase tracking-[0.4em] mb-8 font-medium">
              Collection No. 04
            </p>

            {/* Typography */}
            <h1 className="font-serif text-[3.5rem] sm:text-[4.5rem] lg:text-[6.5rem] leading-[1.05] text-[#111] mb-8">
              A Nova Era <br />
              <span className="italic font-light">da</span> Elegância
            </h1>

            {/* Description */}
            <p className="text-[#757575] text-[15px] sm:text-[17px] leading-[1.8] max-w-lg mb-12">
              Onde a tradição da alta costura encontra a precisão do digital. O atelier definitivo para o mestre do estilo pessoal contemporâneo.
            </p>

            {/* Actions */}
            <div className="flex items-center space-x-10">
              <Link href="/auth/login">
                <button className="bg-[#0b0b0b] text-[#faf9f6] px-10 py-4 text-[10px] uppercase font-semibold tracking-[0.2em] hover:bg-[#2d2d2d] transition-colors shadow-xl">
                  Continuar
                </button>
              </Link>
              <Link href="/auth/login" className="flex items-center text-[#9b8d74] hover:text-[#2d2d2d] transition-colors group">
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] border-b border-[#9b8d74]/30 pb-1 group-hover:border-[#2d2d2d]/50 transition-colors">
                  Descobrir
                </span>
                <span className="ml-3 text-[14px] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column (Visual) */}
          <div className="relative h-full flex justify-center lg:justify-end items-center">
            {/* Underlying shadow/geometric accent box matching the design */}
            <div className="absolute left-[10%] bottom-[10%] w-[180px] sm:w-[250px] h-[180px] sm:h-[250px] bg-[#ebe7e1] opacity-70 scale-90 sm:scale-100 hidden sm:block pointer-events-none"></div>
            
            {/* Main Image Container */}
            <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] w-full max-w-[680px] aspect-[4/5] sm:aspect-square flex items-center justify-center p-8 sm:p-16 mx-auto lg:mx-0">
              <img 
                src="/lux_estilo_hero.png" 
                alt="3D Digital Elegance Concept" 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
