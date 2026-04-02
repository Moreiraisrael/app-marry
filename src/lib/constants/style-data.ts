export const SEASONS_DATA: Record<string, { name: string, colors: string[], contrast: string }> = {
  "Inverno Frio": { name: "Inverno Frio", colors: ['#1A1A1A', '#2E5A88', '#8B0000', '#FFFFFF', '#C0C0C0'], contrast: "Alto Contraste Frio" },
  "Inverno Escuro": { name: "Inverno Escuro", colors: ['#1A1A1A', '#2C2A29', '#4E070C', '#273B4D', '#1B3C35'], contrast: "Alto Contraste Profundo" },
  "Inverno Brilhante": { name: "Inverno Brilhante", colors: ['#000000', '#E51A4C', '#0047AB', '#00A36C', '#FFFFFF'], contrast: "Alto Contraste Brilhante" },
  "Verão Frio": { name: "Verão Frio", colors: ['#808080', '#AEC6CF', '#CDB8D8', '#F4C2C2', '#E6E6FA'], contrast: "Baixo/Médio Contraste Frio" },
  "Verão Claro": { name: "Verão Claro", colors: ['#D3D3D3', '#B0E0E6', '#FFB6C1', '#PaleGreen', '#FFF0F5'], contrast: "Baixo Contraste Claro" },
  "Verão Suave": { name: "Verão Suave", colors: ['#778899', '#BDB76B', '#BC8F8F', '#4682B4', '#D8BFD8'], contrast: "Baixo Contraste Opaco" },
  "Outono Quente": { name: "Outono Quente", colors: ['#8B4513', '#CD853F', '#D2691E', '#556B2F', '#B8860B'], contrast: "Médio Contraste Quente" },
  "Outono Escuro": { name: "Outono Escuro", colors: ['#3E2723', '#2E3B32', '#4A148C', '#880E4F', '#004D40'], contrast: "Alto Contraste Profundo Quente" },
  "Outono Suave": { name: "Outono Suave", colors: ['#8D6E63', '#A1887F', '#9E9D24', '#5D4037', '#7CB342'], contrast: "Baixo/Médio Contraste Opaco" },
  "Primavera Quente": { name: "Primavera Quente", colors: ['#FFA500', '#FF4500', '#32CD32', '#FFD700', '#00CED1'], contrast: "Médio Contraste Quente Claro" },
  "Primavera Clara": { name: "Primavera Clara", colors: ['#FFC0CB', '#98FB98', '#87CEFA', '#FFFACD', '#E0FFFF'], contrast: "Baixo Contraste Claro Quente" },
  "Primavera Brilhante": { name: "Primavera Brilhante", colors: ['#FF1493', '#00FF00', '#00BFFF', '#FFFF00', '#FF00FF'], contrast: "Alto Contraste Brilhante Quente" },
}

export const ARCHETYPES_DATA: Record<string, { title: string, description: string, keyItems: string[], attributes: string[], accessories: string[], proportion: string }> = {
  "A Governante": {
    title: "A Governante",
    description: "Sua imagem comunica autoridade, elegância e controle. Você prefere linhas estruturadas e elementos de alta qualidade que reforçam sua credibilidade.",
    keyItems: ["Alfaiataria sob medida", "Tecidos nobres (seda, linho)", "Cores neutras com contrastes"],
    accessories: ["Metais prateados ou dourados escuros", "Formas geométricas limpas", "Bolsas de couro estruturadas"],
    attributes: ["Sofisticação", "Poder", "Clareza", "Excelência", "Liderança"],
    proportion: "70% Clássico / 30% Moderno"
  },
  "A Criadora": {
    title: "A Criadora",
    description: "Sua imagem comunica originalidade, expressão artística e inovação. Suas escolhas são únicas, quebrando padrões e criando novas regras estéticas.",
    keyItems: ["Peças assimétricas e modelagens criativas", "Mix de estampas e texturas", "Cores vibrantes estruturadas"],
    accessories: ["Peças de design autoral", "Bolsas com formatos inusitados", "Óculos marcantes"],
    attributes: ["Inovação", "Autenticidade", "Expressão", "Ousadia", "Arte"],
    proportion: "80% Criativo / 20% Contemporâneo"
  },
  "A Amante": {
    title: "A Amante",
    description: "Sua imagem comunica magnetismo, sensualidade e refinamento estético. Valoriza a beleza das formas e texturas que envolvem os sentidos.",
    keyItems: ["Tecidos fluidos e táteis (seda, veludo, couro)", "Exposição estratégica de pele", "Cores profundas e vermelhos ricos"],
    accessories: ["Metais dourados e brilhantes", "Joias com movimento", "Saltos finos e sapatos delicados"],
    attributes: ["Magnetismo", "Sensualidade", "Beleza", "Intensidade", "Charme"],
    proportion: "60% Sensual / 40% Refinado"
  },
  "O Inocente": {
    title: "A Romântica",
    description: "Sua imagem comunica leveza, gentileza e doçura. Suas linhas são fluidas e você busca peças que trazem conforto emocional e visual.",
    keyItems: ["Tecidos fluidos, rendas e tules", "Tons pastéis e cores suaves", "Estampas florais delicadas"],
    accessories: ["Pérolas e metais finos", "Laços e fitas", "Bolsas pequenas e arredondadas"],
    attributes: ["Gentileza", "Delicadeza", "Feminilidade", "Leveza", "Doçura"],
    proportion: "70% Romântico / 30% Casual"
  },
  "A Exploradora": {
    title: "A Exploradora",
    description: "Sua imagem comunica liberdade, praticidade e dinamismo. Suas roupas acompanham sua necessidade de movimento, sem nunca perder o estilo.",
    keyItems: ["Tecidos tecnológicos leves e respiráveis", "Modelagens soltas e utilitárias", "Tons terrosos e naturais"],
    accessories: ["Mochilas de couro e bolsas crossbody", "Sapatos confortáveis e robustos", "Acessórios práticos"],
    attributes: ["Liberdade", "Aventura", "Praticidade", "Movimento", "Autenticidade"],
    proportion: "80% Casual / 20% Natural"
  }
}
