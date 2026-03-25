import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const seasonPalettes = {
  inverno_frio: {
    name: 'Inverno Frio',
    headerColor: '#2C3E7C',
    hair: { colors: ['Preto azulado', 'Preto puro', 'Castanho escuro frio', 'Loiro cinza'], tips: 'Preto com reflexo azulado fica incrível. Castanho escuro sem reflexos quentes é elegante.' },
    makeup: { lips: ['Pink frio', 'Framboesa', 'Fúcsia', 'Ameixa'], eyes: ['Azul royal', 'Roxo', 'Cinza gelado', 'Ametista'], blush: ['Rosa frio', 'Framboesa'], tips: 'Azul royal nos olhos é transformador. Pink ou framboesa nos lábios.' },
    metals: { primary: 'Prata', secondary: 'Ródio', avoid: 'Dourado' },
    mainColors: [
      ['#5C4B47', '#9B7E8E', '#C8A8B8', '#D8C8C8', '#FFFFFF'],
      ['#000000', '#6B5E5B', '#928885', '#B8AFA8', '#D8C8B8'],
      ['#D4C800', '#EFDF00', '#F5E859', '#F8EFA0', '#F8F8C8'],
      ['#1B4D40', '#006B5B', '#00897B', '#4DD0C0', '#80E8D8'],
      ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A', '#90EE90'],
      ['#003A6B', '#005A9C', '#1976D2', '#42A5F5', '#90CAF9'],
      ['#2E2A5C', '#4A3A7E', '#1B6B8B', '#7B5AA8', '#A08EC8'],
      ['#6A0F49', '#A82166', '#D81B60', '#F06292', '#F8BBD0'],
      ['#6A1C1C', '#C62828', '#F44336', '#EF5350', '#FFCDD2'],
      ['#4A1F6A', '#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8']
    ],
    lipstick: ['#D1899D', '#C2185B', '#8E1557', '#6A1049', '#5B0E40', '#4A0838'],
    eyeshadow: ['#FFE4F0', '#C8C8C8', '#7B9BAE', '#FFB6D8', '#FF89AC', '#006B5B', '#4A3A7E', '#000000', '#C2185B', '#7B5AA8'],
    blush: ['#FFB6C1', '#DDBFA8', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    hair: ['#E8D4B8', '#C5A373', '#8B6F47', '#5C4738', '#3E2E23', '#1A1612'],
    metal: 'PRATEADO'
  },
  inverno_profundo: {
    name: 'Inverno Escuro',
    headerColor: '#8B1538',
    hair: { colors: ['Preto azulado', 'Preto puro', 'Castanho muito escuro frio', 'Preto com reflexos roxos'], tips: 'Preto puro ou com reflexo azulado é absolutamente sofisticado. Mechas roxas frias são dramáticas.' },
    makeup: { lips: ['Vermelho frio puro', 'Burgundy frio', 'Ameixa', 'Rosa pink intenso'], eyes: ['Preto', 'Cinza escuro', 'Azul marinho', 'Roxo escuro'], blush: ['Rosa escuro frio', 'Ameixa suave'], tips: 'Eyeliner preto preciso é fundamental. Boca vermelha frio + olho preto = looks lendários.' },
    metals: { primary: 'Prata', secondary: 'Platina', avoid: 'Dourado' },
    mainColors: [
      ['#5C5347', '#8B7D6B', '#B8AA97', '#E3CFC5', '#FFFFFF'],
      ['#000000', '#3E4F50', '#708090', '#A0A8A8', '#C9B8A8'],
      ['#9B9E00', '#C8CA00', '#DFDF00', '#EFEF59', '#F5F5A0'],
      ['#004D40', '#006B5B', '#00897B', '#4DB6AC', '#80CBC4'],
      ['#1B4D20', '#2E5D32', '#3E7D47', '#5C9B6A', '#7CB87C'],
      ['#003366', '#005A9C', '#0066CC', '#3399FF', '#87CEEB'],
      ['#3E1F47', '#5C3A6E', '#7B5A9E', '#9B7AB8', '#BDA5D6'],
      ['#6A0F49', '#8E1557', '#B22166', '#D1347A', '#F48FB1'],
      ['#7B1F1C', '#A82828', '#D32F2F', '#EF5350', '#FFCDD2'],
      ['#6A1B5A', '#8E1E7A', '#B8339B', '#CE5FB8', '#E1A0D8']
    ],
    lipstick: ['#D1899D', '#C75B83', '#B5316D', '#992558', '#7C1D47', '#5B0E40'],
    eyeshadow: ['#F0E8E0', '#DDBFA8', '#B8998A', '#8B7060', '#000000', '#7B5A9E', '#5C3A6E', '#006B5B', '#4D9B7A', '#3E7D47'],
    blush: ['#E89BB4', '#DDBFA8', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    hair: ['#E8D4B8', '#C5A373', '#8B6F47', '#5C4738', '#3E2E23', '#1A1612'],
    metal: 'PRATEADO / DOURADO'
  },
  inverno_brilhante: {
    name: 'Inverno Brilhante',
    headerColor: '#4169E1',
    hair: { colors: ['Preto intenso brilhante', 'Preto azulado', 'Mechas fúcsia ou azul elétrico', 'Loiro platinado com mechas coloridas'], tips: 'Mechas coloridas ou loiro platinado com detalhes coloridos são espetaculares.' },
    makeup: { lips: ['Fúcsia', 'Vermelho puro', 'Pink neon', 'Roxo brilhante'], eyes: ['Ciano', 'Azul elétrico', 'Fúcsia', 'Verde neon'], blush: ['Fúcsia', 'Rosa neon', 'Coral vibrante'], tips: 'Glitter e pigmentos vibrantes são a assinatura. Seja ousada!' },
    metals: { primary: 'Prata brilhante', secondary: 'Holográfico', avoid: 'Dourado opaco' },
    mainColors: [
      ['#5C5C5C', '#A9A9A9', '#E3CFC5', '#E8D7CC', '#FFFFFF'],
      ['#000000', '#4A4A4A', '#808080', '#B8B8B8', '#FFF9E6'],
      ['#6B8E23', '#9ACD32', '#D4E157', '#F0F45F', '#FFEB3B'],
      ['#004D40', '#008B7B', '#00BFA5', '#4DD0E1', '#B2EBF2'],
      ['#1B5E20', '#2E7D32', '#4CAF50', '#81C784', '#C8E6C9'],
      ['#00008B', '#0033A0', '#1E88E5', '#5C8EC6', '#90CAF9'],
      ['#4A148C', '#673AB7', '#00838F', '#9575CD', '#B39DDB'],
      ['#880E4F', '#C2185B', '#E91E63', '#F06292', '#F8BBD0'],
      ['#B71C1C', '#D32F2F', '#F44336', '#EF5350', '#FFCDD2'],
      ['#6A1B9A', '#8E24AA', '#BA68C1', '#CE93D8', '#E1BEE7']
    ],
    lipstick: ['#D1899D', '#C75B83', '#B5316D', '#992558', '#7C1D47', '#5B0E40'],
    eyeshadow: ['#B8B8B8', '#FFB6C1', '#B8E6B8', '#8E7CC3', '#000000', '#003366', '#4A4A4A', '#1E88E5', '#4CAF50', '#C2185B'],
    blush: ['#EDB8B4', '#F0C1C1', '#D89B9B', '#C47C7C', '#B05F5F', '#983838'],
    hair: ['#E8D4B8', '#C5A373', '#8B6F47', '#5C4738', '#3E2E23', '#1A1612'],
    metal: 'PRATEADO / DOURADO'
  },
  primavera_quente: {
    name: 'Primavera Quente',
    headerColor: '#FF6347',
    hair: { colors: ['Loiro dourado intenso', 'Castanho acobreado', 'Ruivo dourado', 'Loiro caramelo', 'Bronze quente'], tips: 'Cor ruiva ou acobreada fica lindíssima. Mechas caramelo ou mel em cabelos escuros.' },
    makeup: { lips: ['Laranja queimado', 'Coral vibrante', 'Terracota', 'Vermelho quente'], eyes: ['Cobre', 'Dourado', 'Terracota', 'Laranja suave'], blush: ['Pêssego intenso', 'Coral'], tips: 'Cobre nos olhos é iconic. Boca laranja ou terracota para um visual completo.' },
    metals: { primary: 'Dourado', secondary: 'Cobre', avoid: 'Prata' },
    mainColors: [
      ['#5C4B3A', '#8B6F47', '#C19A6B', '#D4AF7A', '#F0E68C'],
      ['#CC6600', '#FF8C00', '#FFB347', '#FFD966', '#FFE5B4'],
      ['#4B5320', '#6B7B2F', '#B8B847', '#D8D87A', '#E6F0A3'],
      ['#1B4D20', '#2E7D32', '#7CB342', '#AED581', '#C5E1A5'],
      ['#006064', '#00838F', '#00ACC1', '#26C6DA', '#80DEEA'],
      ['#01579B', '#0277BD', '#0288D1', '#03A9F4', '#81D4FA'],
      ['#FF5A7D', '#FF7A9A', '#FF9DB6', '#FFB6C8', '#FFD6E4'],
      ['#6A1F3C', '#DC143C', '#FF5733', '#FF8566', '#FFB3A0'],
      ['#8B3A3A', '#B74D4D', '#D97A6B', '#E89A8B', '#F5C1B0'],
      ['#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8', '#E1BEE7']
    ],
    lipstick: ['#FFCCB8', '#FF9966', '#C8967A', '#A8372E', '#8E1F1C', '#6A4738'],
    eyeshadow: ['#FFE4D9', '#FFCCB8', '#B8E6D6', '#FF8C00', '#7CB342', '#D8B896', '#8B6F47', '#696969', '#8E24AA', '#9ACD32'],
    blush: ['#FFCCB8', '#FF9966', '#C8967A', '#A8372E', '#8E1F1C', '#6A4738'],
    hair: ['#D4AF7A', '#B8774D', '#8B5A2B', '#6B4423', '#5C3A2E', '#3E2723'],
    metal: 'DOURADO'
  },
  primavera_clara: {
    name: 'Primavera Clara',
    headerColor: '#F4C542',
    hair: { colors: ['Loiro dourado', 'Loiro mel', 'Castanho claro dourado', 'Mechas douradas', 'Loiro arenoso'], tips: 'Mechas californianas douradas realçam muito. Evite colorações cinza ou ash.' },
    makeup: { lips: ['Rosa pêssego', 'Coral suave', 'Nude rosado', 'Rosa salmão'], eyes: ['Dourado champagne', 'Bronze suave', 'Pêssego', 'Lavanda suave'], blush: ['Pêssego', 'Coral suave'], tips: 'Olho esfumado em tons pêssego ou dourado. Boca coral ou nude rosado.' },
    metals: { primary: 'Dourado', secondary: 'Ouro rosé', avoid: 'Prata fria' },
    mainColors: [
      ['#6B4E47', '#C8A8B8', '#D4AF7A', '#E8D4BB', '#FAEBD7'],
      ['#4D5D53', '#696969', '#A9A9A9', '#C8C0B8', '#D8D0C8'],
      ['#556B2F', '#6B8E23', '#D4D400', '#EFEF66', '#F5F5C0'],
      ['#1B8E52', '#228B22', '#5CB85C', '#80D080', '#A0E8A0'],
      ['#FF8C00', '#FFB347', '#FFD966', '#FFE699', '#FFF0CC'],
      ['#FF1493', '#FF69B4', '#FFB6D8', '#FFC0E0', '#FFE4F0'],
      ['#8B1F3C', '#DC143C', '#FF5F72', '#FF8FA0', '#FFCCDB'],
      ['#1B4D6B', '#1976D2', '#4DA5E8', '#90C0E8', '#BBDEFB'],
      ['#006B7D', '#00ACC1', '#4DD0E8', '#80DEEA', '#B2EBF2'],
      ['#5C3A6E', '#8E24AA', '#BA68C1', '#CE93D8', '#E1BEE7']
    ],
    lipstick: ['#D9967A', '#FFCCB8', '#C8967A', '#B85F4D', '#8E3726', '#6A1F1C'],
    eyeshadow: ['#FFE4E0', '#FFCCB8', '#D8C0B8', '#B8A8A8', '#9E8E8E', '#8E24AA', '#7B5A9E', '#006B7D', '#1B8E52', '#1B4D6B'],
    blush: ['#D9967A', '#FFCCB8', '#C8967A', '#B85F4D', '#A83726', '#8E1F1C'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#8B6F47', '#5C4738', '#3E2E23'],
    metal: 'PRATEADO / DOURADO'
  },
  primavera_brilhante: {
    name: 'Primavera Brilhante',
    headerColor: '#C41E3A',
    hair: { colors: ['Loiro dourado brilhante', 'Castanho luminoso', 'Ruivo vibrante', 'Preto brilhante', 'Mechas contrastantes'], tips: 'Contraste forte cabelo/pele é marca desta estação. Mechas de cor viva ficam ótimas.' },
    makeup: { lips: ['Vermelho puro', 'Coral vivo', 'Fúcsia', 'Rosa vibrante'], eyes: ['Azul cobalto', 'Verde vivo', 'Dourado brilhante', 'Turquesa'], blush: ['Coral vibrante', 'Rosa quente'], tips: 'Olho colorido é a assinatura. Boca vermelha ou fúcsia com skin clean.' },
    metals: { primary: 'Dourado', secondary: 'Cobre brilhante', avoid: 'Prata fria' },
    mainColors: [
      ['#C8B8A8', '#FFCCB8', '#F5F0B8', '#FFF9E6', '#FFFFFF'],
      ['#2F4F4F', '#5C5C5C', '#B0B0B0', '#C8C0B8', '#F0E8D8'],
      ['#FF8C00', '#FFB347', '#FFFF00', '#FFFF66', '#FFFFE0'],
      ['#1B5E3C', '#6B8E23', '#A0BC32', '#C5D870', '#E0F2A8'],
      ['#8B0000', '#DC143C', '#FF5722', '#FF8A65', '#FFCCB8'],
      ['#C2185B', '#FF1493', '#FF69B4', '#FFB6D8', '#FFE4F0'],
      ['#6A1B5A', '#C2185B', '#FF1493', '#FF8FCC', '#FFB6D8'],
      ['#004D5C', '#008B9E', '#00CED1', '#80E8E8', '#B0F8F8'],
      ['#004D40', '#00796B', '#26C6DA', '#80DEEA', '#B0F0F8'],
      ['#5C1F6A', '#8E24AA', '#BA68C1', '#CE93D8', '#E1BEE7']
    ],
    lipstick: ['#FFCCB8', '#C8967A', '#B85F4D', '#A8372E', '#8E1F1C', '#6A4738'],
    eyeshadow: ['#FFF9E6', '#FFCCB8', '#FFB6D8', '#80E8D8', '#008B9E', '#6B5B4F', '#8B4726', '#5C3A3C', '#000000', '#004D40'],
    blush: ['#FFCCB8', '#FF9966', '#C8967A', '#B85F4D', '#A8372E', '#8E1F1C'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#8B6F47', '#5C4738', '#3E2E23'],
    metal: 'PRATEADO / DOURADO'
  },
  outono_profundo: {
    name: 'Outono Escuro',
    headerColor: '#1B5E20',
    hair: { colors: ['Preto intenso', 'Castanho escuro quente', 'Preto com reflexos cobre', 'Mechas terracota', 'Burgundi'], tips: 'Preto brilhante é exuberante. Mechas terracota ou cobre escuro ficam deslumbrantes.' },
    makeup: { lips: ['Vinho escuro', 'Burgundy', 'Prune', 'Vermelho escuro'], eyes: ['Marrom escuro', 'Bronze escuro', 'Verde escuro', 'Cobre escuro'], blush: ['Terracota', 'Bronze suave'], tips: 'Olho muito esfumado escuro é a assinatura. Boca vinho ou burgundy.' },
    metals: { primary: 'Dourado', secondary: 'Bronze', avoid: 'Prata' },
    mainColors: [
      ['#6B4E47', '#B8966E', '#D4AF7A', '#E8C49A', '#F5E8C0'],
      ['#3E2723', '#8B7E7E', '#C8A8A8', '#E3CFC5', '#FFF9E6'],
      ['#8B5A00', '#CD7F32', '#FF8C00', '#FFB347', '#FFE4B5'],
      ['#004D1B', '#556B2F', '#7C8E23', '#C0CA33', '#E0F2A8'],
      ['#6A1F1C', '#A52A2A', '#DC143C', '#FF5722', '#FF8A65'],
      ['#6A0F49', '#C2185B', '#E91E63', '#F06292', '#FFB6C1'],
      ['#4D0000', '#8B0000', '#DC143C', '#F44336', '#FF8A80'],
      ['#1A2A4D', '#003A5C', '#005A8B', '#4682B4', '#87CEEB'],
      ['#004D40', '#00695C', '#00897B', '#26C6DA', '#80DEEA'],
      ['#4A1F5C', '#7B5A9E', '#BA68C1', '#CE93D8', '#E1BEE7']
    ],
    lipstick: ['#C8967A', '#B85F4D', '#A8372E', '#8E1F1C', '#6A1049', '#4D0838'],
    eyeshadow: ['#F5E8C0', '#D4C4B0', '#C19A6B', '#B8724D', '#6A4738', '#A52A2A', '#6A0F49', '#1A3A5C', '#006B5B', '#556B2F'],
    blush: ['#D9967A', '#FFCCB8', '#C8967A', '#8E1F1C', '#A8372E', '#6A4738'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#8B6F47', '#5C4738', '#3E2E23'],
    metal: 'PRATEADO / DOURADO'
  },
  outono_suave: {
    name: 'Outono Suave',
    headerColor: '#8B9556',
    hair: { colors: ['Castanho acinzentado', 'Castanho médio suave', 'Loiro areia', 'Caramelo acinzentado'], tips: 'Mechas de caramelo suave ou areia. Castanho natural com volume e movimento é ideal.' },
    makeup: { lips: ['Terracota suave', 'Nude terroso', 'Rosado acinzentado', 'Malva quente'], eyes: ['Marrom suave', 'Bege dourado', 'Terracota', 'Ferrugem'], blush: ['Pêssego suave', 'Terracota claro'], tips: 'Maquiagem natural e terrosa. Nada muito marcado. Olho esfumado marrom suave.' },
    metals: { primary: 'Ouro rosé', secondary: 'Dourado opaco', avoid: 'Prata brilhante' },
    mainColors: [
      ['#4D4D54', '#9B7E8E', '#B8968A', '#D4B8A8', '#FFE4C4'],
      ['#3E3E50', '#8B7E7E', '#A9A9A9', '#C8C0B8', '#E8E8E8'],
      ['#8B5A2B', '#CD9A3D', '#E8B89A', '#F0D890', '#F5E8C0'],
      ['#1B4D20', '#2E6B32', '#5C9B5C', '#80BC80', '#A0D0A0'],
      ['#4B5320', '#6B7B2F', '#8B9B47', '#B8C47A', '#C5E1A5'],
      ['#6A1F3C', '#C2185B', '#E85C8B', '#F08CAC', '#FFB6C1'],
      ['#D32F2F', '#FF5F5F', '#FF8A80', '#FFCCB8', '#FFE5E0'],
      ['#8B5A3C', '#A0664D', '#C87855', '#D89B7A', '#E8C8A8'],
      ['#1B4D5C', '#006B7D', '#5C9BAC', '#80BCC8', '#A0E0E8'],
      ['#2A4D5C', '#006B78', '#5C8B9E', '#80ABC8', '#A0D0E8']
    ],
    lipstick: ['#D9967A', '#C87666', '#B85746', '#A83726', '#983020', '#881F1C'],
    eyeshadow: ['#F5E8C0', '#FF9966', '#D4B8A0', '#C87855', '#A8372E', '#C2185B', '#2A4D5C', '#006B78', '#5C9B5C', '#1B4D20'],
    blush: ['#D9967A', '#FF9966', '#C87855', '#B85746', '#A83726', '#983020'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#8B6F47', '#5C4738', '#3E2E23'],
    metal: 'PRATEADO / DOURADO'
  },
  outono_quente: {
    name: 'Outono Quente',
    headerColor: '#1B5E20',
    hair: { colors: ['Ruivo intenso', 'Castanho acobreado', 'Preto com reflexos dourados', 'Castanho chocolate quente', 'Bronze'], tips: 'Ruivo é a cor mais transformadora. Castanho com reflexos cobre ou bronze fica incrível.' },
    makeup: { lips: ['Vermelho tijolo', 'Terracota', 'Laranja queimado', 'Burgundy quente'], eyes: ['Cobre', 'Dourado antigo', 'Ferrugem', 'Verde oliva'], blush: ['Terracota', 'Laranja queimado'], tips: 'Cobre nos olhos + boca terracota é o look signature. Delineador marrom escuro.' },
    metals: { primary: 'Dourado', secondary: 'Cobre', avoid: 'Prata fria' },
    mainColors: [
      ['#6B4423', '#8B5A2B', '#C87855', '#E8B89A', '#FFE4C4'],
      ['#3E2723', '#6B5B4F', '#B8A896', '#D4C5A0', '#F5F5DC'],
      ['#CC6600', '#FF8C00', '#FFB347', '#FFD966', '#FFE5B4'],
      ['#4B5320', '#6B7B2F', '#B8B847', '#D8D87A', '#E6F0A3'],
      ['#1B4D20', '#2E7D32', '#7CB342', '#AED581', '#C5E1A5'],
      ['#6A1F3C', '#DC143C', '#FF5733', '#FF8566', '#FFB3A0'],
      ['#FF5722', '#FF8C42', '#FFB366', '#FFCC80', '#FFE5B4'],
      ['#6A1F3C', '#C2185B', '#D97A8C', '#E8A8B8', '#FFCCDB'],
      ['#004D5C', '#006B7D', '#26A69A', '#5DD3C7', '#A7FFEB'],
      ['#1B4D40', '#00695C', '#4A8C7A', '#6FB89C', '#A3D9CC']
    ],
    lipstick: ['#FFCCB8', '#FF9966', '#C8967A', '#A8372E', '#8E1F1C', '#6A4738'],
    eyeshadow: ['#FFE4D9', '#8B7355', '#6B8E23', '#C5C8A8', '#ADDB98', '#004D40', '#6A1F3C', '#8B4726', '#A0522D', '#4B5320'],
    blush: ['#FFCCB8', '#FF9966', '#C8967A', '#A8372E', '#8E1F1C', '#6A4738'],
    hair: ['#D4AF7A', '#B8774D', '#8B5A2B', '#6B4423', '#5C3A2E', '#3E2723'],
    metal: 'DOURADO'
  },
  verao_suave: {
    name: 'Verão Suave',
    headerColor: '#9C88AB',
    hair: { colors: ['Loiro acinzentado', 'Cinza pérola', 'Castanho frio suave', 'Loiro fumaça', 'Cinza prateado'], tips: 'Cabelo cinza ou loiro fumaça é absolutamente sofisticado. Mechas frias acinzentadas.' },
    makeup: { lips: ['Malva cinzento', 'Rosa acinzentado', 'Nude frio', 'Ameixa suave'], eyes: ['Cinza', 'Lilás acinzentado', 'Malva', 'Azul névoa'], blush: ['Rosa acinzentado', 'Malva suave'], tips: 'Maquiagem monocromática acinzentada é sofisticadíssima. Olho cinza esfumado + boca malva.' },
    metals: { primary: 'Prata', secondary: 'Ouro rosé', avoid: 'Dourado quente' },
    mainColors: [
      ['#4D4D54', '#9B7E8E', '#B8968A', '#D4B8A8', '#FFE4C4'],
      ['#3E3E50', '#8B7E7E', '#A9A9A9', '#C8C0B8', '#E8E8E8'],
      ['#8B5A2B', '#CD9A3D', '#E8B89A', '#F0D890', '#F5E8C0'],
      ['#1B4D20', '#2E6B32', '#5C9B5C', '#80BC80', '#A0D0A0'],
      ['#6A1F49', '#C2185B', '#E85C8B', '#F08CAC', '#FFB6C1'],
      ['#8B1538', '#C2185B', '#E85C8B', '#FF8FA0', '#FFCCDB'],
      ['#DC143C', '#FF5F5F', '#FF8A80', '#FFCCB8', '#FFE5E0'],
      ['#4B0082', '#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8'],
      ['#1B4D5C', '#006B7D', '#5C9BAC', '#80BCC8', '#A0E0E8'],
      ['#2A4D5C', '#006B78', '#5C8B9E', '#80ABC8', '#A0D0E8']
    ],
    lipstick: ['#FFB6C1', '#FFC1D3', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    eyeshadow: ['#F5F5F5', '#D8D0C8', '#D4B8A8', '#9B7E8E', '#FFB6C1', '#6A1F49', '#4B0082', '#1B4D5C', '#2E6B32', '#1B8678'],
    blush: ['#FFB6C1', '#FFC1D3', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#A0774E', '#8B6F47', '#6B4E3C'],
    metal: 'PRATEADO / DOURADO'
  },
  verao_claro: {
    name: 'Verão Claro',
    headerColor: '#D8A7C5',
    hair: { colors: ['Loiro platinado', 'Loiro cinza pérola', 'Castanho acinzentado claro', 'Loiro frio', 'Mechas prateadas'], tips: 'Loiro platinado ou cinza pérola são transformadores. Mechas frias realçam muito.' },
    makeup: { lips: ['Rosa bebê', 'Nude rosado frio', 'Malva clara', 'Lavanda'], eyes: ['Lilás', 'Azul bebê', 'Cinza pérola', 'Rosa suave'], blush: ['Rosa frio suave', 'Lavanda blush'], tips: 'Maquiagem etérea e delicada. Olho lilás ou azul bebê. Menos é mais.' },
    metals: { primary: 'Prata', secondary: 'Platina', avoid: 'Dourado' },
    mainColors: [
      ['#4D5D53', '#696969', '#A9A9A9', '#C0C0C0', '#D3D3D3'],
      ['#696969', '#808080', '#A9A9A9', '#C0C0C0', '#DCDCDC'],
      ['#C5D870', '#E6EE9C', '#FFD966', '#FFE699', '#FFF9C4'],
      ['#006B5B', '#00897B', '#4DB6AC', '#66D9B8', '#A0E8D0'],
      ['#006B7D', '#00ACC1', '#4DD0E1', '#80DEEA', '#B0E8F0'],
      ['#8B008B', '#BA55D3', '#DA70D6', '#EE82EE', '#F0C0F0'],
      ['#6A1049', '#C2185B', '#E91E63', '#F48FB1', '#F8BBD0'],
      ['#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8', '#E1BEE7'],
      ['#1B4D6B', '#1976D2', '#4DA5E8', '#90C0E8', '#B0D8F0'],
      ['#004D5C', '#5C7B9E', '#7B9BB8', '#9EBBD8', '#C0D8F0']
    ],
    lipstick: ['#FFB6C1', '#FFC1D3', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    eyeshadow: ['#F5F5F5', '#FFF9E6', '#E1BEE7', '#90CAF9', '#80DEEA', '#D3D3D3', '#BA55D3', '#8E24AA', '#1976D2', '#006B7D'],
    blush: ['#FFB6C1', '#FFC1D3', '#D89B9B', '#C78585', '#B16868', '#9E5454'],
    hair: ['#F5E8C0', '#D4C4B0', '#B8966E', '#A0774E', '#8B6F47', '#6B4E3C'],
    metal: 'PRATEADO / DOURADO'
  },
  verao_frio: {
    name: 'Verão Frio',
    headerColor: '#A8518A',
    hair: { colors: ['Loiro frio rosado', 'Castanho frio médio', 'Chocolate frio', 'Loiro bege frio', 'Mechas rosa'], tips: 'Castanho frio com subtom azulado é lindo. Mechas rosa ou lavanda muito especiais.' },
    makeup: { lips: ['Rosa frio', 'Ameixa', 'Vinho rosado', 'Framboesa'], eyes: ['Rosa', 'Lilás', 'Azul pó', 'Ametista'], blush: ['Rosa frio', 'Framboesa suave'], tips: 'Blush rosado generoso é a assinatura. Boca framboesa ou vinho para noite.' },
    metals: { primary: 'Prata', secondary: 'Ouro rosé', avoid: 'Dourado amarelo' },
    mainColors: [
      ['#5C4B47', '#9B7E8E', '#C8A8B8', '#D8C8C8', '#FFFFFF'],
      ['#5C5C5C', '#808080', '#A9A9A9', '#C0C0C0', '#D8D0C8'],
      ['#006B5B', '#80C8B8', '#A0D8C8', '#C5D870', '#E6EE9C'],
      ['#004D40', '#00897B', '#4DD0C0', '#80E8D8', '#B0F0E8'],
      ['#006064', '#00838F', '#00ACC1', '#4DD0E1', '#80DEEA'],
      ['#6A0F49', '#C2185B', '#E85C8B', '#F08CAC', '#FFB6C1'],
      ['#8B008B', '#BA55D3', '#D97AC8', '#EE9FE0', '#F8C8E8'],
      ['#4B0082', '#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8'],
      ['#1B4D5C', '#006778', '#5C8B9E', '#80ABC8', '#A0D0E8'],
      ['#2A3E5C', '#1976D2', '#5C8EC6', '#80A8D8', '#B0C8F0']
    ],
    lipstick: ['#FFB6C1', '#C8A8D8', '#D89BB4', '#BA5583', '#9E4070', '#7C1D47'],
    eyeshadow: ['#F5F5F5', '#FFE4E0', '#D8C8D8', '#80DEEA', '#006B7D', '#8E24AA', '#6A1B9A', '#1B4D5C', '#004D40', '#5C3A3C'],
    blush: ['#FFB6C1', '#D8A8D8', '#C89BB8', '#B87C9E', '#9E5F83', '#8B4070'],
    hair: ['#1A1612', '#3E2E23', '#5C4738', '#8B6F47', '#C5A373', '#E8D4B8'],
    metal: 'PRATEADO'
  }
};

const seasonImages = {
  inverno_brilhante: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/6f0472370_IB.png',
  inverno_profundo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/7c9360a60_IE.png',
  inverno_frio: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/dc54104ee_IF.png',
  outono_profundo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/b42e29eac_OE.png',
  outono_quente: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/02ae1f10d_OQ.png',
  outono_suave: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/13cdd4eed_OS.png',
  primavera_brilhante: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/3fb7da7e1_PB.png',
  primavera_clara: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/afa8c8391_PC.png',
  primavera_quente: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/0bfa884cd_PQ.png',
  verao_claro: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/261cbaf60_VC.png',
  verao_frio: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/96c06e7be_VF.png',
  verao_suave: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989205392f69694df37d205/ebccfc121_VS.png'
};

export default function SeasonalColorPalette({ season }) {
  if (!season || !seasonPalettes[season]) {
    return null;
  }

  const palette = seasonPalettes[season];
  const imageUrl = seasonImages[season];

  return (
    <div className="section mb-8 print:break-inside-avoid">
      {/* Cartela de Cores Profissional em Imagem */}
      {imageUrl && (
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-white ring-2 ring-gray-200">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none z-10" />
            <img 
              src={imageUrl} 
              alt={`Cartela ${palette.name}`}
              className="w-full h-auto"
            />
          </div>
          <div className="text-center mt-6">
            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600 mb-2">
              {palette.name}
            </h2>
            <p className="text-gray-600 italic">
              Sua paleta de cores personalizada
            </p>
          </div>
        </div>
      )}

      {/* Descrição e Dicas */}
      <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl p-8 shadow-lg border border-rose-100">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">✨</span>
            Sobre sua estação
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {palette.name === 'Inverno Frio' && 'Você possui uma beleza sofisticada e elegante com subtons frios e características marcantes.'}
            {palette.name === 'Inverno Escuro' && 'Você tem uma beleza dramática e marcante, com contraste natural intenso.'}
            {palette.name === 'Inverno Brilhante' && 'Sua beleza é vibrante e eletrizante, com alto contraste e cores puras.'}
            {palette.name === 'Outono Escuro' && 'Você possui uma beleza rica e profunda com tons terrosos intensos.'}
            {palette.name === 'Outono Quente' && 'Sua beleza é vibrante e calorosa, com tons dourados e intensos.'}
            {palette.name === 'Outono Suave' && 'Você tem uma beleza terrosa e aconchegante, com tons neutros e suaves.'}
            {palette.name === 'Primavera Brilhante' && 'Sua beleza é vibrante e energética, com cores claras e saturadas.'}
            {palette.name === 'Primavera Clara' && 'Você possui uma beleza delicada e luminosa com características suaves e douradas.'}
            {palette.name === 'Primavera Quente' && 'Sua beleza irradia calor e vitalidade com tons dourados e vibrantes.'}
            {palette.name === 'Verão Claro' && 'Você tem uma beleza suave e etérea com tons delicados e acinzentados.'}
            {palette.name === 'Verão Frio' && 'Sua beleza é refinada e fresca com subtons rosados e frios.'}
            {palette.name === 'Verão Suave' && 'Você possui uma beleza elegante e sofisticada com tons neutros suaves.'}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur rounded-lg p-5 shadow-md">
              <h4 className="font-semibold text-rose-700 mb-3 text-lg">
                ✓ Cores que valorizam
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                As cores da sua cartela realçam sua beleza natural, iluminam seu rosto e harmonizam com seu subtom.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-lg p-5 shadow-md">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                ★ Acessórios ideais
              </h4>
              <div className="flex gap-2 flex-wrap">
                {palette.metal.includes('PRATEADO') && (
                  <Badge className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 text-sm px-4 py-1.5">
                    Prateado
                  </Badge>
                )}
                {palette.metal.includes('DOURADO') && (
                  <Badge className="bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 hover:from-yellow-400 hover:to-amber-500 text-sm px-4 py-1.5">
                    Dourado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}