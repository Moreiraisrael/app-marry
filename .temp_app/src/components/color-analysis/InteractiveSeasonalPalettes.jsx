import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, Palette, Sparkles, Shirt, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const seasonalPalettes = {
  primavera_clara: {
    name: 'Primavera Clara',
    subtitle: 'Suave, Luminosa e Delicada',
    category: 'PRIMAVERA (Quente)',
    gradient: 'from-yellow-100 via-peach-100 to-pink-100',
    borderColor: 'border-yellow-300',
    mainColors: [
      { hex: '#FFE5B4', name: 'Pêssego Claro', family: 'Neutros' },
      { hex: '#FFDAB9', name: 'Coral Suave', family: 'Corais' },
      { hex: '#F0E68C', name: 'Amarelo Manteiga', family: 'Amarelos' },
      { hex: '#E6F0FF', name: 'Azul Céu', family: 'Azuis' },
      { hex: '#FFE4E1', name: 'Rosa Bebê', family: 'Rosas' },
      { hex: '#E0FFE0', name: 'Verde Menta', family: 'Verdes' },
      { hex: '#F5DEB3', name: 'Trigo', family: 'Neutros' },
      { hex: '#DDA0DD', name: 'Lavanda', family: 'Roxos' },
    ],
    fabrics: ['Algodão leve', 'Linho', 'Seda fluida', 'Chiffon', 'Voile'],
    lookExamples: [
      { title: 'Casual Primavera', pieces: 'Blusa coral suave + calça bege clara + sandália nude', occasion: 'Dia a dia' },
      { title: 'Trabalho Leve', pieces: 'Blazer amarelo manteiga + camisa branca + saia midi pêssego', occasion: 'Escritório' },
      { title: 'Festa Delicada', pieces: 'Vestido rosa bebê com detalhes em lavanda + acessórios dourados', occasion: 'Evento' }
    ],
    characteristics: 'Clara, delicada e luminosa. Cores suaves com subtom quente.',
    avoid: 'Preto puro, cores muito escuras ou neon',
    hair: {
      colors: ['Loiro dourado', 'Loiro mel', 'Castanho claro dourado', 'Mechas douradas', 'Loiro arenoso'],
      avoid: 'Cinza platinado, colorações frias ou muito escuras',
      tips: 'Mechas californianas douradas realçam muito. Evite colorações cinza ou ash.'
    },
    makeup: {
      lips: ['Rosa pêssego', 'Coral suave', 'Nude rosado', 'Malva quente', 'Rosa salmão'],
      eyes: ['Dourado champagne', 'Bronze suave', 'Marrom claro', 'Pêssego', 'Lavanda suave'],
      blush: ['Pêssego', 'Coral suave', 'Rosa nude'],
      foundation: 'Base com subtom dourado/amarelado, FPS médio',
      tips: 'Olho esfumado em tons pêssego ou dourado. Boca coral ou nude rosado. Blush pêssego no maçã do rosto.'
    },
    metals: { primary: 'Dourado', secondary: 'Ouro rosé', avoid: 'Prata fria' }
  },
  primavera_quente: {
    name: 'Primavera Quente',
    subtitle: 'Vibrante, Calorosa e Energética',
    category: 'PRIMAVERA (Quente)',
    gradient: 'from-orange-200 via-amber-200 to-yellow-200',
    borderColor: 'border-orange-400',
    mainColors: [
      { hex: '#FF8C00', name: 'Laranja Vibrante', family: 'Laranjas' },
      { hex: '#FFD700', name: 'Dourado', family: 'Amarelos' },
      { hex: '#FF6347', name: 'Tomate', family: 'Vermelhos' },
      { hex: '#32CD32', name: 'Verde Vivo', family: 'Verdes' },
      { hex: '#FF7F50', name: 'Coral', family: 'Corais' },
      { hex: '#DEB887', name: 'Caramelo', family: 'Neutros' },
      { hex: '#FFB6C1', name: 'Rosa Salmão', family: 'Rosas' },
      { hex: '#87CEEB', name: 'Azul Celeste', family: 'Azuis' },
    ],
    fabrics: ['Algodão', 'Jersey', 'Tricô leve', 'Linho texturizado', 'Popeline'],
    lookExamples: [
      { title: 'Vibrante Casual', pieces: 'Blusa laranja + jeans médio + tênis branco + bolsa caramelo', occasion: 'Passeio' },
      { title: 'Executivo Caloroso', pieces: 'Terno caramelo + camisa amarelo suave + scarpin nude', occasion: 'Reunião' },
      { title: 'Festa Energética', pieces: 'Vestido coral com cinto dourado + salto nude + clutch dourada', occasion: 'Celebração' }
    ],
    characteristics: 'Calorosa e energética. Cores vibrantes com base dourada.',
    avoid: 'Cores frias como azul royal, rosa frio ou roxo profundo',
    hair: {
      colors: ['Loiro dourado intenso', 'Castanho acobreado', 'Ruivo dourado', 'Loiro caramelo', 'Bronze quente'],
      avoid: 'Loiro platinado, cinza, tons frios',
      tips: 'Cor ruiva ou acobreada fica lindíssima. Mechas caramelo ou mel em cabelos escuros.'
    },
    makeup: {
      lips: ['Laranja queimado', 'Coral vibrante', 'Terracota', 'Vermelho quente', 'Salmão intenso'],
      eyes: ['Cobre', 'Dourado', 'Terracota', 'Laranja suave', 'Bronze intenso'],
      blush: ['Pêssego intenso', 'Coral', 'Laranja suave'],
      foundation: 'Base com subtom dourado, pode ter tom dourado visível',
      tips: 'Delineador marrom ou dourado. Cobre nos olhos é iconic. Boca laranja ou terracota para um visual completo.'
    },
    metals: { primary: 'Dourado', secondary: 'Cobre', avoid: 'Prata' }
  },
  primavera_brilhante: {
    name: 'Primavera Brilhante',
    subtitle: 'Saturada, Viva e Radiante',
    category: 'PRIMAVERA (Quente)',
    gradient: 'from-red-300 via-pink-300 to-yellow-300',
    borderColor: 'border-red-400',
    mainColors: [
      { hex: '#FF1493', name: 'Pink Vibrante', family: 'Rosas' },
      { hex: '#FFFF00', name: 'Amarelo Puro', family: 'Amarelos' },
      { hex: '#FF4500', name: 'Vermelho Laranja', family: 'Vermelhos' },
      { hex: '#00CED1', name: 'Turquesa Brilhante', family: 'Azuis' },
      { hex: '#32CD32', name: 'Verde Limão', family: 'Verdes' },
      { hex: '#FF69B4', name: 'Rosa Choque', family: 'Rosas' },
      { hex: '#FFB347', name: 'Pêssego Saturado', family: 'Laranjas' },
      { hex: '#BA55D3', name: 'Orquídea', family: 'Roxos' },
    ],
    fabrics: ['Cetim', 'Seda lisa', 'Couro envernizado', 'Lycra', 'Crepe'],
    lookExamples: [
      { title: 'Statement Casual', pieces: 'Blusa pink + calça branca + tênis verde limão + bolsa amarela', occasion: 'Encontro' },
      { title: 'Ousadia Profissional', pieces: 'Blazer vermelho laranja + camisa branca + calça preta + scarpin nude', occasion: 'Apresentação' },
      { title: 'Festa Radiante', pieces: 'Vestido turquesa com acessórios dourados + salto pink', occasion: 'Gala' }
    ],
    characteristics: 'Cores saturadas e brilhantes. Alto contraste e energia.',
    avoid: 'Cores pastel, tons acinzentados ou muito suaves',
    hair: {
      colors: ['Loiro dourado brilhante', 'Castanho luminoso', 'Ruivo vibrante', 'Preto brilhante', 'Mechas contrastantes'],
      avoid: 'Cinza, tons apagados ou muito suaves',
      tips: 'Contraste forte cabelo/pele é marca desta estação. Mechas de cor viva (como ruivo) ficam ótimas.'
    },
    makeup: {
      lips: ['Vermelho puro', 'Coral vivo', 'Fúcsia', 'Rosa vibrante', 'Laranja pop'],
      eyes: ['Azul cobalto', 'Verde vivo', 'Dourado brilhante', 'Rosa choque', 'Turquesa'],
      blush: ['Coral vibrante', 'Rosa quente', 'Pêssego intenso'],
      foundation: 'Base com subtom neutro a dourado com boa cobertura',
      tips: 'Olho colorido é a assinatura. Boca vermelha ou fúcsia com skin clean. Alto contraste é o objetivo.'
    },
    metals: { primary: 'Dourado', secondary: 'Cobre brilhante', avoid: 'Prata fria' }
  },
  verao_claro: {
    name: 'Verão Claro',
    subtitle: 'Suave, Etérea e Delicada',
    category: 'VERÃO (Frio)',
    gradient: 'from-blue-100 via-purple-100 to-pink-100',
    borderColor: 'border-blue-300',
    mainColors: [
      { hex: '#E6E6FA', name: 'Lavanda Claro', family: 'Roxos' },
      { hex: '#B0E0E6', name: 'Azul Pó', family: 'Azuis' },
      { hex: '#FFB6C1', name: 'Rosa Claro', family: 'Rosas' },
      { hex: '#D8BFD8', name: 'Lilás Suave', family: 'Roxos' },
      { hex: '#F0F8FF', name: 'Azul Alice', family: 'Azuis' },
      { hex: '#E0F2F1', name: 'Menta Gelado', family: 'Verdes' },
      { hex: '#F5F5F5', name: 'Cinza Pérola', family: 'Neutros' },
      { hex: '#FADADD', name: 'Rosa Quartzo', family: 'Rosas' },
    ],
    fabrics: ['Seda leve', 'Chiffon', 'Georgette', 'Tule', 'Organza'],
    lookExamples: [
      { title: 'Romântico Casual', pieces: 'Blusa rosa claro + saia midi azul pó + sapatilha nude', occasion: 'Almoço' },
      { title: 'Elegância Suave', pieces: 'Vestido lavanda + blazer cinza pérola + scarpin rosa', occasion: 'Trabalho' },
      { title: 'Festa Etérea', pieces: 'Vestido longo lilás com aplicações prateadas + sandália prata', occasion: 'Casamento' }
    ],
    characteristics: 'Delicada e etérea. Cores claras com subtom frio.',
    avoid: 'Laranja, dourado, cores muito quentes ou escuras',
    hair: {
      colors: ['Loiro platinado', 'Loiro cinza pérola', 'Castanho acinzentado claro', 'Loiro frio', 'Mechas prateadas'],
      avoid: 'Ruivo, dourado, tons quentes',
      tips: 'Loiro platinado ou cinza pérola são transformadores. Mechas frias realçam muito.'
    },
    makeup: {
      lips: ['Rosa bebê', 'Nude rosado frio', 'Malva clara', 'Lavanda', 'Rosa quartzo'],
      eyes: ['Lilás', 'Azul bebê', 'Cinza pérola', 'Rosa suave', 'Branco nacarado'],
      blush: ['Rosa frio suave', 'Rosa bebê', 'Lavanda blush'],
      foundation: 'Base com subtom rosado, cobertura leve para manter frescor natural',
      tips: 'Maquiagem etérea e delicada. Olho lilás ou azul bebê. Batom rosado suave. Menos é mais.'
    },
    metals: { primary: 'Prata', secondary: 'Platina', avoid: 'Dourado' }
  },
  verao_suave: {
    name: 'Verão Suave',
    subtitle: 'Acinzentada, Sofisticada e Neutra',
    category: 'VERÃO (Frio)',
    gradient: 'from-slate-200 via-gray-200 to-rose-200',
    borderColor: 'border-gray-400',
    mainColors: [
      { hex: '#B0C4DE', name: 'Azul Aço Suave', family: 'Azuis' },
      { hex: '#C8A2C8', name: 'Lilás Acinzentado', family: 'Roxos' },
      { hex: '#D8BFD8', name: 'Malva', family: 'Roxos' },
      { hex: '#C0C0C0', name: 'Prata', family: 'Neutros' },
      { hex: '#D3B8AE', name: 'Rosa Taupe', family: 'Rosas' },
      { hex: '#A9A9A9', name: 'Cinza Médio', family: 'Neutros' },
      { hex: '#B4C7DC', name: 'Azul Nebuloso', family: 'Azuis' },
      { hex: '#C8C0B8', name: 'Greige', family: 'Neutros' },
    ],
    fabrics: ['Cashmere', 'Lã fina', 'Seda matte', 'Crepe', 'Suede'],
    lookExamples: [
      { title: 'Sofisticado Neutro', pieces: 'Blazer cinza médio + blusa malva + calça greige + scarpin nude', occasion: 'Corporativo' },
      { title: 'Casual Elegante', pieces: 'Suéter azul nebuloso + jeans cinza + tênis branco', occasion: 'Fim de semana' },
      { title: 'Jantar Refinado', pieces: 'Vestido rosa taupe + casaco prata + sandália prateada', occasion: 'Restaurante' }
    ],
    characteristics: 'Suave e acinzentada. Tons neutros sofisticados.',
    avoid: 'Cores muito saturadas, brilhantes ou quentes',
    hair: {
      colors: ['Loiro acinzentado', 'Cinza pérola', 'Castanho frio suave', 'Loiro fumaça', 'Cinza prateado'],
      avoid: 'Dourado, ruivo, tons muito quentes',
      tips: 'Cabelo cinza ou loiro fumaça é absolutamente sofisticado. Mechas frias acinzentadas.'
    },
    makeup: {
      lips: ['Malva cinzento', 'Rosa acinzentado', 'Nude frio', 'Ameixa suave', 'Vinho frio'],
      eyes: ['Cinza', 'Lilás acinzentado', 'Malva', 'Azul névoa', 'Lavanda escuro'],
      blush: ['Rosa acinzentado', 'Malva suave', 'Rosé frio'],
      foundation: 'Base com subtom neutro a frio, cobertura média',
      tips: 'Maquiagem monocromática acinzentada é sofisticadíssima. Olho cinza esfumado + boca malva.'
    },
    metals: { primary: 'Prata', secondary: 'Ouro rosé', avoid: 'Dourado quente' }
  },
  verao_frio: {
    name: 'Verão Frio',
    subtitle: 'Rosada, Fresca e Refinada',
    category: 'VERÃO (Frio)',
    gradient: 'from-pink-200 via-purple-200 to-blue-200',
    borderColor: 'border-pink-400',
    mainColors: [
      { hex: '#FFB6C1', name: 'Rosa Claro', family: 'Rosas' },
      { hex: '#DDA0DD', name: 'Ameixa Claro', family: 'Roxos' },
      { hex: '#B0E0E6', name: 'Azul Pó', family: 'Azuis' },
      { hex: '#D8BFD8', name: 'Lilás', family: 'Roxos' },
      { hex: '#E6E6FA', name: 'Lavanda', family: 'Roxos' },
      { hex: '#F0E68C', name: 'Amarelo Suave', family: 'Amarelos' },
      { hex: '#98D8C8', name: 'Verde Água', family: 'Verdes' },
      { hex: '#F5F5DC', name: 'Bege Rosado', family: 'Neutros' },
    ],
    fabrics: ['Seda', 'Cetim fosco', 'Crepe de chine', 'Linho fino', 'Tricô leve'],
    lookExamples: [
      { title: 'Feminino Casual', pieces: 'Blusa rosa claro + calça branca + sandália nude + bolsa lilás', occasion: 'Shopping' },
      { title: 'Trabalho Elegante', pieces: 'Vestido azul pó + blazer bege rosado + scarpin rosa', occasion: 'Escritório' },
      { title: 'Coquetel Chic', pieces: 'Vestido ameixa com cinto prateado + salto prata + clutch metálica', occasion: 'Evento' }
    ],
    characteristics: 'Fresca e rosada. Tons frios com suavidade.',
    avoid: 'Laranja, dourado, cores terrosas ou muito quentes',
    hair: {
      colors: ['Loiro frio rosado', 'Castanho frio médio', 'Chocolate frio', 'Loiro bege frio', 'Mechas rosa'],
      avoid: 'Dourado, ruivo, tons quentes',
      tips: 'Castanho frio com subtom azulado é lindo. Mechas rosa ou lavanda muito especiais.'
    },
    makeup: {
      lips: ['Rosa frio', 'Ameixa', 'Vinho rosado', 'Framboesa', 'Malva fria'],
      eyes: ['Rosa', 'Lilás', 'Azul pó', 'Ametista', 'Prata rosada'],
      blush: ['Rosa frio', 'Framboesa suave', 'Rosé'],
      foundation: 'Base com subtom rosado, boa fixação',
      tips: 'Blush rosado generoso é a assinatura. Olho lilás ou rosa. Boca framboesa ou vinho para noite.'
    },
    metals: { primary: 'Prata', secondary: 'Ouro rosé', avoid: 'Dourado amarelo' }
  },
  outono_suave: {
    name: 'Outono Suave',
    subtitle: 'Terrosa, Aconchegante e Neutra',
    category: 'OUTONO (Quente)',
    gradient: 'from-amber-200 via-orange-200 to-yellow-200',
    borderColor: 'border-amber-400',
    mainColors: [
      { hex: '#D2B48C', name: 'Tan', family: 'Neutros' },
      { hex: '#BC8F8F', name: 'Rosa Acinzentado', family: 'Rosas' },
      { hex: '#8FBC8F', name: 'Verde Musgo', family: 'Verdes' },
      { hex: '#CD853F', name: 'Peru', family: 'Laranjas' },
      { hex: '#F5DEB3', name: 'Trigo', family: 'Neutros' },
      { hex: '#C19A6B', name: 'Caramelo Suave', family: 'Marrons' },
      { hex: '#A0522D', name: 'Sienna', family: 'Marrons' },
      { hex: '#8B7355', name: 'Caqui', family: 'Verdes' },
    ],
    fabrics: ['Tweed', 'Lã', 'Camurça', 'Veludo cotelê', 'Algodão pesado'],
    lookExamples: [
      { title: 'Casual Aconchegante', pieces: 'Suéter verde musgo + calça caramelo + bota marrom + cachecol trigo', occasion: 'Outono' },
      { title: 'Trabalho Terroso', pieces: 'Blazer tan + camisa bege + saia midi marrom + sapato nude', occasion: 'Office' },
      { title: 'Jantar Elegante', pieces: 'Vestido peru com cinto dourado + bota de camurça', occasion: 'Restaurante' }
    ],
    characteristics: 'Terrosa e acinzentada. Tons neutros aconchegantes.',
    avoid: 'Cores muito brilhantes, neon ou frias como azul royal',
    hair: {
      colors: ['Castanho acinzentado', 'Castanho médio suave', 'Loiro areia', 'Mechado suave', 'Caramelo acinzentado'],
      avoid: 'Ruivo intenso, preto total, loiro muito claro',
      tips: 'Mechas de caramelo suave ou areia. Castanho natural com volume e movimento é ideal.'
    },
    makeup: {
      lips: ['Terracota suave', 'Nude terroso', 'Rosado acinzentado', 'Marrom claro', 'Malva quente'],
      eyes: ['Marrom suave', 'Bege dourado', 'Terracota', 'Caqui', 'Ferrugem'],
      blush: ['Pêssego suave', 'Terracota claro', 'Bege rosado'],
      foundation: 'Base com subtom neutro a quente, cobertura natural',
      tips: 'Maquiagem natural e terrosa é a essência. Nada muito marcado. Olho esfumado marrom suave.'
    },
    metals: { primary: 'Ouro rosé', secondary: 'Dourado opaco', avoid: 'Prata brilhante' }
  },
  outono_quente: {
    name: 'Outono Quente',
    subtitle: 'Dourada, Rica e Calorosa',
    category: 'OUTONO (Quente)',
    gradient: 'from-yellow-300 via-orange-300 to-red-300',
    borderColor: 'border-orange-500',
    mainColors: [
      { hex: '#FF8C00', name: 'Laranja Queimado', family: 'Laranjas' },
      { hex: '#DAA520', name: 'Dourado Velho', family: 'Amarelos' },
      { hex: '#8B4513', name: 'Marrom Ferrugem', family: 'Marrons' },
      { hex: '#228B22', name: 'Verde Floresta', family: 'Verdes' },
      { hex: '#DC143C', name: 'Vermelho Tijolo', family: 'Vermelhos' },
      { hex: '#D2691E', name: 'Chocolate', family: 'Marrons' },
      { hex: '#FF7F50', name: 'Coral Terroso', family: 'Corais' },
      { hex: '#B8860B', name: 'Mostarda', family: 'Amarelos' },
    ],
    fabrics: ['Couro', 'Lã pesada', 'Veludo', 'Tweed grosso', 'Jeans'],
    lookExamples: [
      { title: 'Casual Caloroso', pieces: 'Suéter mostarda + jeans escuro + bota marrom + jaqueta de couro', occasion: 'Passeio' },
      { title: 'Trabalho Rico', pieces: 'Blazer chocolate + blusa coral + calça caramelo + scarpin nude', occasion: 'Escritório' },
      { title: 'Festa Outonal', pieces: 'Vestido vermelho tijolo + acessórios dourados + sapato marrom', occasion: 'Evento' }
    ],
    characteristics: 'Rica e calorosa. Cores terrosas vibrantes.',
    avoid: 'Cores frias, preto puro ou tons acinzentados',
    hair: {
      colors: ['Ruivo intenso', 'Castanho acobreado', 'Preto com reflexos dourados', 'Castanho chocolate quente', 'Bronze'],
      avoid: 'Loiro platinado, cinza, tons frios',
      tips: 'Ruivo é a cor mais transformadora. Castanho com reflexos cobre ou bronze fica incrível.'
    },
    makeup: {
      lips: ['Vermelho tijolo', 'Terracota', 'Laranja queimado', 'Burgundy quente', 'Mostarda'],
      eyes: ['Cobre', 'Dourado antigo', 'Ferrugem', 'Verde oliva', 'Marrom escuro'],
      blush: ['Terracota', 'Laranja queimado', 'Cobre rosado'],
      foundation: 'Base com subtom dourado-oliva, cobertura média',
      tips: 'Cobre nos olhos + boca terracota é o look signature. Delineador marrom escuro ou preto quente.'
    },
    metals: { primary: 'Dourado', secondary: 'Cobre', avoid: 'Prata fria' }
  },
  outono_profundo: {
    name: 'Outono Profundo',
    subtitle: 'Escura, Intensa e Dramática',
    category: 'OUTONO (Quente)',
    gradient: 'from-amber-600 via-orange-700 to-red-800',
    borderColor: 'border-amber-700',
    mainColors: [
      { hex: '#8B4513', name: 'Marrom Chocolate', family: 'Marrons' },
      { hex: '#556B2F', name: 'Verde Oliva Escuro', family: 'Verdes' },
      { hex: '#8B0000', name: 'Vinho', family: 'Vermelhos' },
      { hex: '#CD5C5C', name: 'Terracota', family: 'Laranjas' },
      { hex: '#2F4F4F', name: 'Cinza Ardósia', family: 'Neutros' },
      { hex: '#800020', name: 'Burgundy', family: 'Vermelhos' },
      { hex: '#4A5D23', name: 'Verde Musgo Escuro', family: 'Verdes' },
      { hex: '#654321', name: 'Marrom Escuro', family: 'Marrons' },
    ],
    fabrics: ['Veludo pesado', 'Couro', 'Lã grossa', 'Tweed', 'Sarja'],
    lookExamples: [
      { title: 'Drama Casual', pieces: 'Jaqueta de couro marrom + suéter vinho + jeans escuro + bota preta', occasion: 'Noite' },
      { title: 'Poder Executivo', pieces: 'Terno burgundy + camisa bege + gravata verde oliva + sapato marrom', occasion: 'Reunião' },
      { title: 'Elegância Noturna', pieces: 'Vestido longo terracota + acessórios dourados + sandália dourada', occasion: 'Gala' }
    ],
    characteristics: 'Profunda e intensa. Cores escuras e ricas.',
    avoid: 'Cores pastel, tons muito claros ou frios',
    hair: {
      colors: ['Preto intenso', 'Castanho escuro quente', 'Preto com reflexos cobre', 'Escuro com mechas terracota', 'Burgundi'],
      avoid: 'Loiro, cinza, tons muito claros',
      tips: 'Cabelo preto brilhante é exuberante. Mechas terracota ou cobre escuro em cabelos pretos ficam deslumbrantes.'
    },
    makeup: {
      lips: ['Vinho escuro', 'Burgundy', 'Prune', 'Vermelho escuro', 'Terracota escura'],
      eyes: ['Marrom escuro', 'Bronze escuro', 'Verde escuro', 'Preto', 'Cobre escuro'],
      blush: ['Terracota', 'Bronze suave', 'Marrom rosado'],
      foundation: 'Base com subtom dourado ou neutro-quente, pode ser mais escura',
      tips: 'Olho muito esfumado escuro é a assinatura. Boca vinho ou burgundy. Delineador preto intenso.'
    },
    metals: { primary: 'Dourado', secondary: 'Bronze', avoid: 'Prata' }
  },
  inverno_profundo: {
    name: 'Inverno Profundo',
    subtitle: 'Escura, Dramática e Contrastante',
    category: 'INVERNO (Frio)',
    gradient: 'from-gray-700 via-purple-800 to-black',
    borderColor: 'border-gray-700',
    mainColors: [
      { hex: '#000000', name: 'Preto', family: 'Neutros' },
      { hex: '#2F4F4F', name: 'Cinza Carvão', family: 'Neutros' },
      { hex: '#4B0082', name: 'Índigo', family: 'Roxos' },
      { hex: '#8B0000', name: 'Vermelho Escuro', family: 'Vermelhos' },
      { hex: '#000080', name: 'Azul Marinho', family: 'Azuis' },
      { hex: '#800080', name: 'Roxo Profundo', family: 'Roxos' },
      { hex: '#006400', name: 'Verde Esmeralda Escuro', family: 'Verdes' },
      { hex: '#FFFFFF', name: 'Branco Puro', family: 'Neutros' },
    ],
    fabrics: ['Seda pesada', 'Veludo', 'Cetim', 'Lã fina', 'Couro'],
    lookExamples: [
      { title: 'Clássico Moderno', pieces: 'Blazer preto + blusa branca + calça cinza carvão + scarpin preto', occasion: 'Trabalho' },
      { title: 'Casual Dramático', pieces: 'Suéter roxo profundo + jeans escuro + coturno preto + bolsa preta', occasion: 'Passeio' },
      { title: 'Gala Sofisticada', pieces: 'Vestido longo preto com detalhes prateados + clutch prata', occasion: 'Evento' }
    ],
    characteristics: 'Dramática com alto contraste. Cores profundas e intensas.',
    avoid: 'Cores pastel, tons terrosos ou dourados',
    hair: {
      colors: ['Preto azulado', 'Preto puro', 'Castanho muito escuro frio', 'Preto com reflexos roxos', 'Escuro com mechas frias'],
      avoid: 'Dourado, quente, ruivo',
      tips: 'Preto puro ou com reflexo azulado é absolutamente sofisticado. Mechas roxas ou escuras frias ficam dramáticas.'
    },
    makeup: {
      lips: ['Vermelho frio puro', 'Burgundy frio', 'Ameixa', 'Rosa pink intenso', 'Preto-vinho'],
      eyes: ['Preto', 'Cinza escuro', 'Azul marinho', 'Roxo escuro', 'Prata escura'],
      blush: ['Rosa escuro frio', 'Ameixa suave', 'Vinho suave'],
      foundation: 'Base com subtom neutro a frio, cobertura completa',
      tips: 'Eyeliner preto preciso é fundamental. Boca vermelha frio + olho preto = looks lendários. Alto contraste.'
    },
    metals: { primary: 'Prata', secondary: 'Platina', avoid: 'Dourado' }
  },
  inverno_frio: {
    name: 'Inverno Frio',
    subtitle: 'Gelada, Sofisticada e Elegante',
    category: 'INVERNO (Frio)',
    gradient: 'from-blue-300 via-purple-300 to-pink-300',
    borderColor: 'border-blue-500',
    mainColors: [
      { hex: '#4169E1', name: 'Azul Royal', family: 'Azuis' },
      { hex: '#FF1493', name: 'Pink Profundo', family: 'Rosas' },
      { hex: '#8B008B', name: 'Magenta', family: 'Roxos' },
      { hex: '#00CED1', name: 'Turquesa', family: 'Azuis' },
      { hex: '#C0C0C0', name: 'Prata', family: 'Neutros' },
      { hex: '#DC143C', name: 'Vermelho Frio', family: 'Vermelhos' },
      { hex: '#4B0082', name: 'Índigo', family: 'Roxos' },
      { hex: '#F5F5F5', name: 'Branco Gelo', family: 'Neutros' },
    ],
    fabrics: ['Seda gelada', 'Cetim', 'Tafetá', 'Organza', 'Metalizado'],
    lookExamples: [
      { title: 'Executivo Gelado', pieces: 'Blazer azul royal + blusa branca + calça preta + scarpin prata', occasion: 'Escritório' },
      { title: 'Casual Elegante', pieces: 'Suéter turquesa + jeans escuro + tênis branco + bolsa prata', occasion: 'Dia a dia' },
      { title: 'Festa Sofisticada', pieces: 'Vestido pink profundo com acessórios prateados + salto prata', occasion: 'Coquetel' }
    ],
    characteristics: 'Fria e sofisticada. Cores vibrantes com base fria.',
    avoid: 'Laranja, dourado, cores terrosas ou quentes',
    hair: {
      colors: ['Preto com reflexo azul', 'Castanho escuro frio', 'Castanho acinzentado', 'Preto', 'Loiro cinza'],
      avoid: 'Dourado, ruivo, tons quentes',
      tips: 'Preto com reflexo azulado fica incrível. Castanho escuro natural sem reflexos quentes é elegante.'
    },
    makeup: {
      lips: ['Pink frio', 'Framboesa', 'Rosa fuchsia', 'Ameixa', 'Vinho frio'],
      eyes: ['Azul royal', 'Roxo', 'Cinza gelado', 'Ametista', 'Azul marinho'],
      blush: ['Rosa frio', 'Framboesa', 'Vinho suave'],
      foundation: 'Base com subtom rosado a neutro-frio',
      tips: 'Azul royal nos olhos é transformador. Pink ou framboesa nos lábios. Contorno preciso valoriza o rosto.'
    },
    metals: { primary: 'Prata', secondary: 'Ródio', avoid: 'Dourado' }
  },
  inverno_brilhante: {
    name: 'Inverno Brilhante',
    subtitle: 'Vibrante, Ousada e Radiante',
    category: 'INVERNO (Frio)',
    gradient: 'from-blue-400 via-fuchsia-400 to-purple-400',
    borderColor: 'border-fuchsia-500',
    mainColors: [
      { hex: '#FF00FF', name: 'Fúcsia', family: 'Rosas' },
      { hex: '#0000FF', name: 'Azul Elétrico', family: 'Azuis' },
      { hex: '#FF1493', name: 'Pink Neon', family: 'Rosas' },
      { hex: '#00FFFF', name: 'Ciano', family: 'Azuis' },
      { hex: '#FF0000', name: 'Vermelho Puro', family: 'Vermelhos' },
      { hex: '#8A2BE2', name: 'Violeta', family: 'Roxos' },
      { hex: '#00FF00', name: 'Verde Neon', family: 'Verdes' },
      { hex: '#000000', name: 'Preto Intenso', family: 'Neutros' },
    ],
    fabrics: ['Cetim brilhante', 'Paetês', 'Metalizado', 'Lycra', 'Vinil'],
    lookExamples: [
      { title: 'Statement Urbano', pieces: 'Blazer fúcsia + top preto + calça couro preta + scarpin preto', occasion: 'Night out' },
      { title: 'Casual Ousado', pieces: 'Moletom azul elétrico + legging preta + tênis neon + mochila prata', occasion: 'Esporte' },
      { title: 'Festa Radiante', pieces: 'Vestido curto pink neon com paetês + salto prateado + clutch holográfica', occasion: 'Balada' }
    ],
    characteristics: 'Ousada e vibrante. Cores saturadas e brilhantes.',
    avoid: 'Cores pastel, tons suaves ou acinzentados',
    hair: {
      colors: ['Preto intenso brilhante', 'Preto azulado', 'Escuro com mechas neon', 'Mechas fúcsia ou azul elétrico', 'Loiro platinado com mechas coloridas'],
      avoid: 'Tons suaves, acinzentados',
      tips: 'Mechas coloridas ou loiro platinado com detalhes coloridos são espetaculares. O contraste é o objetivo.'
    },
    makeup: {
      lips: ['Fúcsia', 'Vermelho puro', 'Pink neon', 'Azul (statement)', 'Roxo brilhante'],
      eyes: ['Ciano', 'Azul elétrico', 'Fúcsia', 'Verde neon', 'Preto com brilho'],
      blush: ['Fúcsia', 'Rosa neon', 'Coral vibrante'],
      foundation: 'Base com subtom frio a neutro, alta cobertura',
      tips: 'Glitter e pigmentos vibrantes são a assinatura. Olho colorido neon + pele impecável. Seja ousada!'
    },
    metals: { primary: 'Prata brilhante', secondary: 'Holográfico', avoid: 'Dourado opaco' }
  }
};

export default function InteractiveSeasonalPalettes() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFamily, setFilterFamily] = useState('all');

  const seasonsByCategory = {
    'PRIMAVERA (Quente)': ['primavera_clara', 'primavera_quente', 'primavera_brilhante'],
    'VERÃO (Frio)': ['verao_claro', 'verao_suave', 'verao_frio'],
    'OUTONO (Quente)': ['outono_suave', 'outono_quente', 'outono_profundo'],
    'INVERNO (Frio)': ['inverno_profundo', 'inverno_frio', 'inverno_brilhante']
  };

  const getFilteredColors = (season) => {
    if (!season) return [];
    let colors = seasonalPalettes[season].mainColors;

    if (filterFamily !== 'all') {
      colors = colors.filter(c => c.family === filterFamily);
    }

    if (searchTerm) {
      colors = colors.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.family.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return colors;
  };

  const getUniqueFamilies = (season) => {
    if (!season) return [];
    const families = seasonalPalettes[season].mainColors.map(c => c.family);
    return [...new Set(families)];
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-rose-600" />
          Paletas Sazonais Interativas
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore as 12 estações do método sazonal expandido. Clique em cada paleta para ver cores detalhadas, tecidos recomendados e exemplos de looks.
        </p>
      </div>

      {Object.entries(seasonsByCategory).map(([category, seasons]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-4">
            <Sparkles className="w-5 h-5 text-rose-500" />
            {category}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {seasons.map((seasonKey) => {
              const season = seasonalPalettes[seasonKey];
              return (
                <motion.div
                  key={seasonKey}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 ${season.borderColor}`}
                    onClick={() => setSelectedSeason(seasonKey)}
                  >
                    <div className={`h-32 bg-gradient-to-br ${season.gradient} relative`}>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
                      <div className="relative h-full flex items-center justify-center">
                        <Eye className="w-12 h-12 text-white opacity-60" />
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{season.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{season.subtitle}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {season.mainColors.slice(0, 6).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                        {season.mainColors.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            +{season.mainColors.length - 6}
                          </div>
                        )}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSeason} onOpenChange={() => setSelectedSeason(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedSeason && (
            <>
              <DialogHeader>
                <div className={`-mx-6 -mt-6 mb-6 p-8 bg-gradient-to-br ${seasonalPalettes[selectedSeason].gradient}`}>
                  <DialogTitle className="text-3xl font-bold text-gray-900">
                    {seasonalPalettes[selectedSeason].name}
                  </DialogTitle>
                  <p className="text-gray-700 text-lg mt-2">{seasonalPalettes[selectedSeason].subtitle}</p>
                  <Badge className="mt-3 bg-white/30 backdrop-blur border-white/50 text-gray-800">
                    {seasonalPalettes[selectedSeason].category}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Characteristics */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-lg text-blue-900 mb-2">📋 Características</h4>
                  <p className="text-gray-700">{seasonalPalettes[selectedSeason].characteristics}</p>
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800"><strong>Evitar:</strong> {seasonalPalettes[selectedSeason].avoid}</p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar cor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  <select
                    value={filterFamily}
                    onChange={(e) => setFilterFamily(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="all">Todas as Famílias</option>
                    {getUniqueFamilies(selectedSeason).map(family => (
                      <option key={family} value={family}>{family}</option>
                    ))}
                  </select>
                </div>

                {/* Colors */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    🎨 Paleta de Cores
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {getFilteredColors(selectedSeason).map((color, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-center"
                      >
                        <div
                          className="w-full aspect-square rounded-xl mb-2 shadow-lg border-4 border-white"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-sm font-semibold text-gray-900">{color.name}</p>
                        <p className="text-xs text-gray-500">{color.hex}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{color.family}</Badge>
                      </motion.div>
                    ))}
                  </div>
                  {getFilteredColors(selectedSeason).length === 0 && (
                    <p className="text-center text-gray-500 py-8">Nenhuma cor encontrada</p>
                  )}
                </div>

                {/* Hair */}
                {seasonalPalettes[selectedSeason].hair && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                    <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                      💇 Cabelo Ideal
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {seasonalPalettes[selectedSeason].hair.colors.map((c, i) => (
                          <Badge key={i} className="bg-amber-100 text-amber-800 border border-amber-300 text-sm">{c}</Badge>
                        ))}
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 text-sm text-gray-700">
                        <span className="font-semibold text-amber-700">💡 Dica: </span>{seasonalPalettes[selectedSeason].hair.tips}
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                        <span className="font-semibold">Evitar: </span>{seasonalPalettes[selectedSeason].hair.avoid}
                      </div>
                    </div>
                  </div>
                )}

                {/* Makeup */}
                {seasonalPalettes[selectedSeason].makeup && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                    <h4 className="font-bold text-lg text-rose-900 mb-4 flex items-center gap-2">
                      💄 Maquiagem
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-rose-700 mb-2">👄 Lábios</p>
                        <div className="flex flex-wrap gap-1.5">
                          {seasonalPalettes[selectedSeason].makeup.lips.map((l, i) => (
                            <Badge key={i} className="bg-rose-100 text-rose-800 border border-rose-200 text-xs">{l}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-purple-700 mb-2">👁️ Olhos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {seasonalPalettes[selectedSeason].makeup.eyes.map((e, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-800 border border-purple-200 text-xs">{e}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-pink-700 mb-2">🌸 Blush</p>
                        <div className="flex flex-wrap gap-1.5">
                          {seasonalPalettes[selectedSeason].makeup.blush.map((b, i) => (
                            <Badge key={i} className="bg-pink-100 text-pink-800 border border-pink-200 text-xs">{b}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-orange-700 mb-2">🎨 Base</p>
                        <p className="text-xs text-gray-700">{seasonalPalettes[selectedSeason].makeup.foundation}</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-white/80 rounded-lg p-3 text-sm text-gray-700">
                      <span className="font-semibold text-rose-700">💡 Dica: </span>{seasonalPalettes[selectedSeason].makeup.tips}
                    </div>
                  </div>
                )}

                {/* Metals */}
                {seasonalPalettes[selectedSeason].metals && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      💍 Metais e Acessórios
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
                        <div className={`w-4 h-4 rounded-full ${
                          seasonalPalettes[selectedSeason].metals.primary === 'Dourado' ? 'bg-yellow-400' :
                          seasonalPalettes[selectedSeason].metals.primary === 'Cobre' ? 'bg-orange-500' :
                          'bg-gray-300'
                        }`} />
                        <span className="font-semibold text-sm">{seasonalPalettes[selectedSeason].metals.primary}</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">Principal</Badge>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
                        <div className={`w-4 h-4 rounded-full ${
                          seasonalPalettes[selectedSeason].metals.secondary?.includes('rosé') ? 'bg-rose-300' :
                          seasonalPalettes[selectedSeason].metals.secondary?.includes('Cobre') ? 'bg-orange-400' :
                          seasonalPalettes[selectedSeason].metals.secondary?.includes('Bronze') ? 'bg-amber-600' :
                          'bg-gray-200'
                        }`} />
                        <span className="font-semibold text-sm">{seasonalPalettes[selectedSeason].metals.secondary}</span>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Secundário</Badge>
                      </div>
                      <div className="flex items-center gap-2 bg-red-50 rounded-lg px-4 py-2 border border-red-200">
                        <span className="text-sm text-red-700">❌ Evitar: <strong>{seasonalPalettes[selectedSeason].metals.avoid}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fabrics */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-bold text-lg text-purple-900 mb-3 flex items-center gap-2">
                    <Shirt className="w-5 h-5" />
                    Tecidos Recomendados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {seasonalPalettes[selectedSeason].fabrics.map((fabric, idx) => (
                      <Badge key={idx} className="bg-white/80 text-purple-800 border border-purple-300 text-sm">
                        {fabric}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Look Examples */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Exemplos de Looks
                  </h4>
                  <div className="space-y-4">
                    {seasonalPalettes[selectedSeason].lookExamples.map((look, idx) => (
                      <div key={idx} className="bg-white/80 backdrop-blur rounded-lg p-4 border border-amber-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{look.title}</h5>
                          <Badge variant="outline" className="text-xs">{look.occasion}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{look.pieces}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}