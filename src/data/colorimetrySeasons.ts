export type SeasonData = {
  id: string;
  name: string;
  tags: string;
  subtone: string;
  contrast: string;
  depth: string;
  chroma: string;
  valorizamColors: string[];
  apagamColors: string[];
  metais: { name: string; bg: string; type: "ideal" | "evitar"; hex: string }[];
  neutros: { name: string; color: string }[];
  cabeloBase: string;
  cabeloLuzes: string;
  maquiagem: {
    base: string;
    blush: string;
    batom: string;
    olhos: string;
  };
  footerMessage: string;
};

export const colorimetrySeasons: SeasonData[] = [
  {
    id: "outono-suave",
    name: "Outono Suave",
    tags: "QUENTE • SUAVE • PROFUNDO",
    subtone: "Neutro quente com nuances douradas, pêssego e leve fundo oliva.",
    contrast: "Médio — equilíbrio entre pele, olhos e cabelo.",
    depth: "Média clara — cores médias e suaves harmonizam melhor.",
    chroma: "Suave — tons levemente desaturados e sofisticados valorizam mais.",
    valorizamColors: [
      "#f1dec8", "#d9a07d", "#cb8561", "#b86b4f", "#cf7e76", 
      "#d68984", "#cb8b80", "#978964", "#7b8359", "#6b8e76", 
      "#7f8e65", "#7f9e8a", "#6b969e", "#598197", "#447087", 
      "#8f6c53", "#9b6140", "#7a4a30", "#6f442c", "#a25a3a", 
    ],
    apagamColors: [
      "#ffffff", "#d3d3d3", "#a9a9a9", "#4a4a4a", "#0b0c10",
      "#f72585", "#b5179e", "#7209b7", "#560bad", "#3a0ca3",
      "#bde0fe", "#a2d2ff", "#7cb342", "#4caf50", "#0066cc",
      "#81d4fa", "#4fc3f7", "#ffee58", "#ff9800", "#ff3d00",
    ],
    metais: [
      { name: "Dourado", bg: "bg-gradient-to-br from-yellow-400 to-amber-600", type: "ideal", hex: "#fbbf24" },
      { name: "Ouro champagne", bg: "bg-gradient-to-br from-[#F3E5AB] to-[#C1A87D]", type: "ideal", hex: "#F3E5AB" },
      { name: "Rosé gold", bg: "bg-gradient-to-br from-[#B76E79] to-[#E0BFB8]", type: "ideal", hex: "#B76E79" },
      { name: "Prata brilhante", bg: "bg-gradient-to-br from-gray-200 to-gray-400", type: "evitar", hex: "#e5e7eb" },
      { name: "Prata envelhecida", bg: "bg-gradient-to-br from-gray-400 to-gray-700", type: "evitar", hex: "#9ca3af" },
    ],
    neutros: [
      { name: "Off-white", color: "#f8f5f0" },
      { name: "Bege areia", color: "#e3dac9" },
      { name: "Camel", color: "#c19a6b" },
      { name: "Taupe", color: "#8b8589" },
      { name: "Avelã", color: "#8E5E3A" },
      { name: "Cappuccino", color: "#633A21" },
    ],
    cabeloBase: "Loiro médio a escuro com fundo quente",
    cabeloLuzes: "Mechas em tons de mel, dourado, caramelo e baunilha",
    maquiagem: {
      base: "Subtom ideal: neutro quente (dourado/pêssego)",
      blush: "Pêssego, rosado queimado e terracota suave",
      batom: "Nudes quentes, rosados queimados, corais e terracotas",
      olhos: "Dourado, bronze, marrom, cobre, oliva e champagne",
    },
    footerMessage: "Cores Que Abraçam • Realçam • Elevam"
  },
  {
    id: "inverno-frio",
    name: "Inverno Frio",
    tags: "FRIO • BRILHANTE • PROFUNDO",
    subtone: "Frio e rosado, muitas vezes de porcelana ou oliva frio.",
    contrast: "Alto — grande diferença entre pele clara e cabelo escuro, por exemplo.",
    depth: "Profunda — cores intensas, escuras e puras.",
    chroma: "Brilhante — tons vibrantes e saturados valorizam a beleza.",
    valorizamColors: [
      "#ffffff", "#000000", "#1a1a1a", "#4a4a4a", "#e6194B", 
      "#f032e6", "#911eb4", "#4363d8", "#000075", "#3cb44b", 
      "#008080", "#46f0f0", "#00405c", "#800080", "#c2185b", 
      "#1565c0", "#0d47a1", "#00838f", "#00695c", "#2e7d32", 
    ],
    apagamColors: [
      "#ffb347", "#ffcc5c", "#ff9e9d", "#ff7b25", "#d2b48c",
      "#f5deb3", "#b8860b", "#cd853f", "#d2691e", "#8b4513",
      "#a0522d", "#808000", "#556b2f", "#8fbc8f", "#9acd32",
      "#bdb76b", "#f0e68c", "#eee8aa", "#ffe4b5", "#ffdead",
    ],
    metais: [
      { name: "Prata brilhante", bg: "bg-gradient-to-br from-gray-200 to-gray-400", type: "ideal", hex: "#e5e7eb" },
      { name: "Ouro branco", bg: "bg-gradient-to-br from-gray-100 to-gray-300", type: "ideal", hex: "#f3f4f6" },
      { name: "Platina", bg: "bg-gradient-to-br from-[#E5E4E2] to-[#B0B0B0]", type: "ideal", hex: "#E5E4E2" },
      { name: "Dourado", bg: "bg-gradient-to-br from-yellow-400 to-amber-600", type: "evitar", hex: "#fbbf24" },
      { name: "Cobre", bg: "bg-gradient-to-br from-[#B87333] to-[#8A5A2B]", type: "evitar", hex: "#B87333" },
    ],
    neutros: [
      { name: "Branco Puro", color: "#ffffff" },
      { name: "Gelo", color: "#e8ecef" },
      { name: "Cinza Claro", color: "#d3d3d3" },
      { name: "Chumbo", color: "#36454F" },
      { name: "Marinho", color: "#000080" },
      { name: "Preto", color: "#000000" },
    ],
    cabeloBase: "Preto, castanho escuro ou loiro platinado",
    cabeloLuzes: "Evite dourados; prefira nuances platinadas, acinzentadas ou azuladas",
    maquiagem: {
      base: "Subtom ideal: frio/rosado",
      blush: "Rosa pink, magenta, vinho ou amora",
      batom: "Vermelho cereja, fúcsia, vinho, roxo e rosa choque",
      olhos: "Prata, chumbo, preto, azul marinho, roxo e branco brilhante",
    },
    footerMessage: "Cores Que Impactam • Contrastam • Iluminam"
  },
  {
    id: "primavera-clara",
    name: "Primavera Clara",
    tags: "QUENTE • CLARA • BRILHANTE",
    subtone: "Quente e delicado, tons de pêssego e dourado claro.",
    contrast: "Baixo a Médio — pouca diferença entre pele, cabelo e olhos.",
    depth: "Clara — cores pasteis quentes e tons luminosos.",
    chroma: "Brilhante — tons limpos e vibrantes, sem cinza na composição.",
    valorizamColors: [
      "#ffb347", "#ffcc5c", "#ff9e9d", "#ffd1dc", "#ffb6c1", 
      "#ff69b4", "#f08080", "#fa8072", "#e9967a", "#f4a460", 
      "#ffe4e1", "#fafad2", "#fffacd", "#e0ffff", "#afeeee", 
      "#7fffd4", "#40e0d0", "#48d1cc", "#00ced1", "#20b2aa", 
    ],
    apagamColors: [
      "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666",
      "#000080", "#00008b", "#0000cd", "#0000ff", "#191970",
      "#800000", "#8b0000", "#a52a2a", "#b22222", "#dc143c",
      "#4b0082", "#8a2be2", "#9932cc", "#8b008b", "#800080",
    ],
    metais: [
      { name: "Ouro claro", bg: "bg-gradient-to-br from-yellow-200 to-yellow-400", type: "ideal", hex: "#fde047" },
      { name: "Rosé gold", bg: "bg-gradient-to-br from-[#B76E79] to-[#E0BFB8]", type: "ideal", hex: "#B76E79" },
      { name: "Ouro champagne", bg: "bg-gradient-to-br from-[#F3E5AB] to-[#C1A87D]", type: "ideal", hex: "#F3E5AB" },
      { name: "Prata escurecida", bg: "bg-gradient-to-br from-gray-400 to-gray-700", type: "evitar", hex: "#9ca3af" },
      { name: "Chumbo", bg: "bg-gradient-to-br from-gray-700 to-black", type: "evitar", hex: "#374151" },
    ],
    neutros: [
      { name: "Marfim", color: "#fffff0" },
      { name: "Creme", color: "#fffdd0" },
      { name: "Areia", color: "#f4a460" },
      { name: "Caramelo", color: "#d2b48c" },
      { name: "Pêssego", color: "#ffdab9" },
      { name: "Verde Água", color: "#e0ffff" },
    ],
    cabeloBase: "Loiro dourado, mel, morango ou ruivo claro",
    cabeloLuzes: "Mechas douradas, acobreadas e iluminadas",
    maquiagem: {
      base: "Subtom ideal: quente/pêssego",
      blush: "Pêssego, coral claro, rosa quente",
      batom: "Coral, pêssego, salmão, rosa quente e vermelho aberto",
      olhos: "Dourado claro, champanhe, cobre suave e tons amendoados",
    },
    footerMessage: "Cores Que Radiam • Iluminam • Celebram"
  },
  {
    id: "verao-suave",
    name: "Verão Suave",
    tags: "FRIO • SUAVE • CLARO",
    subtone: "Frio e acinzentado, com leve fundo rosado.",
    contrast: "Baixo — tons de cabelo, pele e olhos são similares e suaves.",
    depth: "Clara a Média — cores não muito escuras nem muito claras.",
    chroma: "Suave — tons opacos, pastéis empoeirados e lavados.",
    valorizamColors: [
      "#d8bfd8", "#dda0dd", "#ee82ee", "#da70d6", "#ba55d3", 
      "#9370db", "#8a2be2", "#7b68ee", "#6a5acd", "#483d8b", 
      "#e6e6fa", "#b0c4de", "#87cefa", "#87ceeb", "#00bfff", 
      "#add8e6", "#b0e0e6", "#5f9ea0", "#4682b4", "#778899", 
    ],
    apagamColors: [
      "#ff4500", "#ff8c00", "#ffa500", "#ffd700", "#ffff00",
      "#adff2f", "#7fff00", "#7cfc00", "#00ff00", "#32cd32",
      "#00fa9a", "#00ff7f", "#8b4513", "#a0522d", "#d2691e",
      "#cd853f", "#f4a460", "#deb887", "#d2b48c", "#bc8f8f",
    ],
    metais: [
      { name: "Prata fosca", bg: "bg-gradient-to-br from-gray-300 to-gray-500", type: "ideal", hex: "#d1d5db" },
      { name: "Ouro rosado frio", bg: "bg-gradient-to-br from-[#C9A0B5] to-[#E5D1DC]", type: "ideal", hex: "#C9A0B5" },
      { name: "Prata polida", bg: "bg-gradient-to-br from-gray-100 to-gray-300", type: "ideal", hex: "#f3f4f6" },
      { name: "Dourado amarelo", bg: "bg-gradient-to-br from-yellow-400 to-yellow-600", type: "evitar", hex: "#facc15" },
      { name: "Cobre", bg: "bg-gradient-to-br from-orange-500 to-orange-700", type: "evitar", hex: "#ea580c" },
    ],
    neutros: [
      { name: "Off-white frio", color: "#f0f8ff" },
      { name: "Cinza Pompombo", color: "#a9a9a9" },
      { name: "Grafite Suave", color: "#808080" },
      { name: "Rosa Antigo", color: "#c0c0c0" }, // Mock
      { name: "Azul Acinzentado", color: "#708090" },
      { name: "Malva", color: "#e6e6fa" },
    ],
    cabeloBase: "Loiro acinzentado, castanho claro ou médio frio",
    cabeloLuzes: "Mechas platinadas, bege frio ou cinzas",
    maquiagem: {
      base: "Subtom ideal: frio/rosado suave",
      blush: "Rosa antigo, malva, rosado suave",
      batom: "Malva, rosa queimado, framboesa suave e nude rosado",
      olhos: "Prata fosco, cinza, azul esfumaçado, rosa antigo e taupe frio",
    },
    footerMessage: "Cores Que Acalmam • Sofisticam • Harmonizam"
  }
];
