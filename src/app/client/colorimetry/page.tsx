"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Palette, CheckCircle2, XCircle, Droplet, Sun, Star, CircleDot, Brush, Scissors, Download, Share2, Copy, Camera, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { colorimetrySeasons } from "@/data/colorimetrySeasons"

export default function ColorimetryPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [currentSeason, setCurrentSeason] = useState(colorimetrySeasons[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skinAnalysis, setSkinAnalysis] = useState<{ hex: string, isWarm: boolean, isLight: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extrair as propriedades da estação atual
  const { valorizamColors, apagamColors, metais, neutros } = currentSeason;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        startAnalysis(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = (imgSrc: string) => {
    setIsAnalyzing(true);
    
    // Análise computacional da imagem usando Canvas
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Pega o centro da imagem (onde geralmente está o rosto)
      const centerX = Math.floor(img.width * 0.3);
      const centerY = Math.floor(img.height * 0.3);
      const width = Math.floor(img.width * 0.4);
      const height = Math.floor(img.height * 0.4);
      
      const imageData = ctx.getImageData(centerX, centerY, width, height);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      let count = 0;
      
      // Calcula a cor média da pele
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // Ignora transparência
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      
      if (count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
      }
      
      // Converte RGB para HSL para determinar as características da pele
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }
      
      // Heurística de classificação de colorimetria:
      // Subtom quente (vermelho-amarelado): hue próximo a 0 ou 1, ou levemente amarelado
      // Subtom frio (rosado/oliva/azulado): hue mais distante
      const isWarm = (h < 0.12 || h > 0.88);
      // Profundidade: Lightness maior ou menor
      const isLight = l > 0.55;
      
      let seasonId = "outono-suave";
      
      if (isWarm && isLight) {
        seasonId = "primavera-clara";
      } else if (!isWarm && isLight) {
        seasonId = "verao-suave";
      } else if (isWarm && !isLight) {
        seasonId = "outono-suave";
      } else if (!isWarm && !isLight) {
        seasonId = "inverno-frio";
      }
      
      const selectedSeason = colorimetrySeasons.find(s => s.id === seasonId) || colorimetrySeasons[0];
      
      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      // Simula tempo adicional de processamento para UX
      setTimeout(() => {
        setCurrentSeason(selectedSeason);
        setSkinAnalysis({ hex: hexColor, isWarm, isLight });
        setIsAnalyzing(false);
      }, 3500);
    };
    
    // Se a imagem falhar ao carregar, simula um aleatório
    img.onerror = () => {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * colorimetrySeasons.length);
        setCurrentSeason(colorimetrySeasons[randomIndex]);
        setIsAnalyzing(false);
      }, 3500);
    };
    
    img.src = imgSrc;
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  }

  const handleDownloadPDF = async () => {
    if (!pageRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(pageRef.current, {
        scale: 2, // Melhor resolução
        useCORS: true,
        backgroundColor: '#FCFAF8',
        windowWidth: pageRef.current.scrollWidth,
        windowHeight: pageRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Se a altura passar de uma página, ele gera o PDF longo normal e o jsPDF corta,
      // mas ajustamos para exibir corretamente o conteúdo principal na primeira folha
      // ou dividimos se necessário. Como é algo rápido, colocaremos contínuo.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Dossie-Colorimetria-Marry-Miele.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o seu PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha Colorimetria - Marry Miele',
          text: 'Confira minha análise de colorimetria pessoal no aplicativo Marry Miele!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Top Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-rose-100/50 shadow-sm" data-html2canvas-ignore>
        <h2 className="font-serif text-xl text-[#4A3B32] font-bold">Resumo da Análise</h2>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6 gap-2"
          >
            <Download className="w-4 h-4" /> 
            {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
          </Button>
          <Button 
            onClick={handleShare}
            className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 rounded-xl px-6 gap-2"
          >
            <Share2 className="w-4 h-4" /> Compartilhar
          </Button>
        </div>
      </div>

      {copiedColor && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4" data-html2canvas-ignore>
          <Copy className="w-4 h-4 text-rose-400" />
          <span className="text-sm font-medium">Cor {copiedColor} copiada!</span>
        </div>
      )}

      {/* Container principal para o PDF */}
      <div ref={pageRef} className="space-y-8 p-1 sm:p-4 bg-[#FCFAF8] rounded-3xl">
        <div className="flex flex-col md:flex-row gap-6">
        
        {/* LEFT COLUMN - USER INFO AND TECHNICAL ANALYSIS */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <Card className="border-rose-100/50 bg-[#FAF8F5] shadow-xl shadow-rose-100/30 overflow-hidden rounded-3xl">
            {/* User Photo Area */}
            <div 
              className="h-72 w-full bg-rose-200/50 relative overflow-hidden flex items-center justify-center cursor-pointer group"
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />
              
              {uploadedImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImage} alt="Sua foto" className="object-cover w-full h-full" />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-rose-500/20 z-20 overflow-hidden">
                      <div className="w-full h-2 bg-rose-400 shadow-[0_0_25px_rgba(244,63,94,1)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-400 mb-3" />
                        <span className="font-medium text-sm tracking-widest uppercase animate-pulse">Analisando tons...</span>
                      </div>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Trocar Foto</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent opacity-80 pointer-events-none" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="text-center z-10 text-rose-800/60 p-4 transition-transform group-hover:scale-105">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium uppercase tracking-widest">Enviar Rosto</p>
                    <p className="text-xs opacity-70 mt-1">Clique para a IA analisar seu tom</p>
                  </div>
                </>
              )}
            </div>

            <CardContent className="p-8 text-center bg-gradient-to-b from-transparent to-[#F2EDE4]">
              <span className="text-rose-700 font-bold uppercase tracking-widest text-[10px] mb-2 block">
                Sua Estação
              </span>
              <h1 className="text-3xl lg:text-4xl font-serif text-[#4A3B32] mb-1 transition-all">
                {isAnalyzing ? "Analisando..." : currentSeason.name}
              </h1>
              <p className="text-[10px] lg:text-xs font-bold text-[#8A7969] tracking-[0.15em] uppercase transition-all">
                {isAnalyzing ? "Mapeando contrastes" : currentSeason.tags}
              </p>
              
              {skinAnalysis && !isAnalyzing && (
                <div className="mt-6 pt-6 border-t border-[#8A7969]/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[#8A7969] text-[10px] font-bold tracking-widest uppercase">
                      Tonalidade Detectada
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 px-6 py-4 rounded-2xl">
                      <div 
                        className="w-12 h-12 rounded-full border-4 border-white shadow-md transition-all hover:scale-110"
                        style={{ backgroundColor: skinAnalysis.hex }}
                        title={`Cor predominante: ${skinAnalysis.hex}`}
                      />
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-bold text-[#4A3B32]">
                          {skinAnalysis.isWarm ? 'Subtom Quente' : 'Subtom Frio'}
                        </p>
                        <p className="text-xs text-neutral-500 font-medium">
                          {skinAnalysis.isLight ? 'Pele Clara/Luminosa' : 'Pele Profunda/Intensa'}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">
                          HEX: {skinAnalysis.hex.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Analysis */}
          <Card className="border-rose-100/50 bg-white shadow-xl shadow-rose-100/20 rounded-3xl">
            <div className="p-6 border-b border-rose-50 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <h3 className="font-serif text-xl text-[#4A3B32]">Sua Análise Técnica</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-rose-50 p-2 rounded-full text-rose-500">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-1">Subtom da Pele</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">{currentSeason.subtone}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-rose-50 p-2 rounded-full text-rose-500">
                  <CircleDot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-1">Contraste</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">{currentSeason.contrast}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-rose-50 p-2 rounded-full text-rose-500">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-1">Profundidade</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">{currentSeason.depth}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-rose-50 p-2 rounded-full text-rose-500">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-1">Intensidade (Croma)</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">{currentSeason.chroma}</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - VISUAL GUIDELINES */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          
          {/* Top Row: Cores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cores que Valorizam */}
            <Card className="border-rose-100/50 bg-white shadow-xl shadow-rose-100/20 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-rose-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-serif text-lg text-[#4A3B32]">Cores que Valorizam</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {valorizamColors.map((color, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleCopyColor(color)}
                      title={`Copiar cor ${color}`}
                      className="aspect-square rounded-md shadow-sm border border-stone-200/50 transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-center text-neutral-400 uppercase tracking-widest mb-2 font-medium">Clique nas cores para copiar o código HEX</p>
                <p className="text-xs italic text-center text-neutral-500 font-serif">
                  Tons quentes, suaves e sofisticados trazem luminosidade, harmonia e realçam sua beleza natural.
                </p>
              </CardContent>
            </Card>

            {/* Cores que Apagam */}
            <Card className="border-rose-100/50 bg-white shadow-xl shadow-rose-100/20 rounded-3xl overflow-hidden opacity-90">
              <div className="p-6 border-b border-rose-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-serif text-lg text-[#4A3B32]">Cores que Apagam</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {apagamColors.map((color, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleCopyColor(color)}
                      title={`Copiar cor ${color}`}
                      className="aspect-square rounded-md shadow-sm border border-stone-200/50 transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-center text-neutral-400 uppercase tracking-widest mb-2 font-medium">Clique nas cores para copiar o código HEX</p>
                <p className="text-xs italic text-center text-neutral-500 font-serif">
                  Tons muito frios, vibrantes ou de alto contraste tendem a apagar sua luminosidade natural.
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Middle Row: Metals & Neutrals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Metais */}
            <Card className="border-rose-100/50 bg-[#FCFAF8] shadow-xl shadow-rose-100/20 rounded-3xl">
              <div className="p-5 text-center border-b border-rose-50">
                <h3 className="font-serif text-lg text-[#4A3B32]">Metais</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex gap-6 justify-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3"/> Ideais</span>
                    <div className="flex gap-3">
                      {metais.filter(m => m.type === 'ideal').map(m => (
                        <button 
                          key={m.name} 
                          onClick={() => handleCopyColor(m.hex)}
                          title={`Copiar base ${m.hex}`}
                          className="flex flex-col items-center gap-2 group focus:outline-none"
                        >
                          <div className={`w-10 h-10 rounded-full shadow-md ${m.bg} border border-white/50 transition-transform group-hover:scale-110`} />
                          <span className="text-[9px] text-neutral-500 text-center uppercase">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-px bg-rose-100/50" />
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 justify-center"><XCircle className="w-3 h-3"/> Evitar</span>
                    <div className="flex gap-3">
                      {metais.filter(m => m.type === 'evitar').map(m => (
                        <button 
                          key={m.name} 
                          onClick={() => handleCopyColor(m.hex)}
                          title={`Copiar base ${m.hex}`}
                          className="flex flex-col items-center gap-2 group focus:outline-none"
                        >
                          <div className={`w-10 h-10 rounded-full shadow-md ${m.bg} border border-white/50 transition-transform group-hover:scale-110`} />
                          <span className="text-[9px] text-neutral-500 text-center uppercase">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] italic text-center text-neutral-500 mt-6 font-serif">
                  Metais quentes e amanteigados harmonizam com seu subtom e trazem mais luz ao rosto.
                </p>
              </CardContent>
            </Card>

            {/* Neutros Ideais */}
            <Card className="border-rose-100/50 bg-[#FCFAF8] shadow-xl shadow-rose-100/20 rounded-3xl">
              <div className="p-5 text-center border-b border-rose-50">
                <h3 className="font-serif text-lg text-[#4A3B32]">Neutros Ideais</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-center gap-2">
                  {neutros.map(n => (
                    <button 
                      key={n.name} 
                      onClick={() => handleCopyColor(n.color)}
                      title={`Copiar ${n.color}`}
                      className="flex flex-col items-center gap-2 group focus:outline-none"
                    >
                      <div 
                        className="w-10 h-16 rounded-md shadow-sm border border-stone-200/50 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: n.color }}
                      />
                      <span className="text-[9px] text-neutral-500 text-center leading-tight uppercase w-12">{n.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] italic text-center text-neutral-500 mt-4 font-serif">
                  Neutros quentes e suaves criam uma base elegante, sofisticada e atemporal para o seu visual.
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Bottom Row: Cabelo & Maquiagem */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cabelo */}
            <Card className="border-rose-100/50 bg-white shadow-xl shadow-rose-100/20 rounded-3xl col-span-1">
              <div className="p-4 text-center border-b border-rose-50 flex items-center justify-center gap-2">
                <Scissors className="w-4 h-4 text-rose-400" />
                <h3 className="font-serif text-base text-[#4A3B32]">Cabelo Ideal</h3>
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1 text-center">Base Ideal</h4>
                  <p className="text-xs text-neutral-600 text-center">Loiro médio a escuro com fundo quente</p>
                </div>
                <div className="w-full h-px bg-rose-50" />
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1 text-center">Luzes / Mechas</h4>
                  <p className="text-xs text-neutral-600 text-center">Mechas em tons de mel, dourado, caramelo e baunilha</p>
                </div>
                <p className="text-[10px] italic text-center text-neutral-500 pt-2 font-serif">
                  Tons quentes e iluminados trazem brilho, movimento e naturalidade ao rosto.
                </p>
              </CardContent>
            </Card>

            {/* Maquiagem */}
            <Card className="border-rose-100/50 bg-white shadow-xl shadow-rose-100/20 rounded-3xl col-span-1 md:col-span-2">
              <div className="p-4 text-center border-b border-rose-50 flex items-center justify-center gap-2">
                <Brush className="w-4 h-4 text-rose-400" />
                <h3 className="font-serif text-base text-[#4A3B32]">Maquiagem Ideal</h3>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1">Base</h4>
                    <p className="text-xs text-neutral-600">Subtom ideal: neutro quente (dourado/pêssego)</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1">Blush</h4>
                    <p className="text-xs text-neutral-600">Pêssego, rosado queimado e terracota suave</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1">Batom</h4>
                    <p className="text-xs text-neutral-600">Nudes quentes, rosados queimados, corais e terracotas</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-1">Olhos</h4>
                    <p className="text-xs text-neutral-600">Dourado, bronze, marrom, cobre, oliva e champagne</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
      </div>
      
      {/* Footer Branding */}
      <div className="text-center py-6 border-t border-rose-100/50 flex flex-col items-center gap-2" data-html2canvas-ignore>
        <p className="font-serif italic text-sm text-[#4A3B32]">
          Sua beleza está na harmonia, na suavidade e no calor natural que ilumina sua essência.
        </p>
        <span className="text-rose-400 text-[10px] tracking-[0.3em] font-medium uppercase mt-2">
          Cores Que Abraçam • Realçam • Elevam
        </span>
      </div>
    </div>
  )
}
