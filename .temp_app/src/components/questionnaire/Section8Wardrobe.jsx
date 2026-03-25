import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';

export default function Section8Wardrobe({ answers, onChange }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Wardrobe Description */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como você descreveria seu guarda-roupa?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Ex: elegante, sofisticado, esportivo, misturado</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descrição em poucas palavras..."
            value={answers.wardrobe_description || ''}
            onChange={(e) => onChange('wardrobe_description', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Most Pieces */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que você tem em maior quantidade?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.most_pieces || ''} onValueChange={(value) => onChange('most_pieces', value)}>
            {[
              'Blusas',
              'Calças',
              'Vestidos',
              'Saias',
              'Camisetas',
              'Casacos',
              'Acessórios',
              'Bolsas',
              'Sapatos'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como seu armário é organizado?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Por cor? Por tipo? Por estação? Desorganizado?"
            value={answers.wardrobe_organization || ''}
            onChange={(e) => onChange('wardrobe_organization', e.target.value)}
            className="h-16"
          />
          <div>
            <Label className="text-sm font-semibold block mb-3">Faz triagem regularmente?</Label>
            <RadioGroup value={answers.wardrobe_cleaning || ''} onValueChange={(value) => onChange('wardrobe_cleaning', value)}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="sim_frequente" id="triagem_sim" />
                <Label htmlFor="triagem_sim">Sim, frequentemente</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="às_vezes" id="triagem_às_vezes" />
                <Label htmlFor="triagem_às_vezes">Às vezes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nunca" id="triagem_nunca" />
                <Label htmlFor="triagem_nunca">Nunca</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Piece */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Qual é sua peça favorita?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva sua peça preferida e por quê"
            value={answers.favorite_piece || ''}
            onChange={(e) => onChange('favorite_piece', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Shoes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sobre seus calçados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.shoes_quantity || ''} onValueChange={(value) => onChange('shoes_quantity', value)}>
            <Label className="text-sm font-semibold block mb-2">Quantos pares você tem?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="até_5" id="até_5" />
              <Label htmlFor="até_5">Até 5 pares</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="5_a_10" id="5_a_10" />
              <Label htmlFor="5_a_10">Entre 5 e 10</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mais_10" id="mais_10" />
              <Label htmlFor="mais_10">Mais de 10</Label>
            </div>
          </RadioGroup>
          <RadioGroup value={answers.shoes_type || ''} onValueChange={(value) => onChange('shoes_type', value)} className="mt-4">
            <Label className="text-sm font-semibold block mb-2">Qual tipo predomina?</Label>
            {[
              'Botas',
              'Tênis',
              'Sandálias',
              'Saltos',
              'Mocassins',
              'Variado'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option} id={`shoes_${option}`} />
                <Label htmlFor={`shoes_${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Going Out Clothes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Suas roupas de sair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.going_out_quantity || ''} onValueChange={(value) => onChange('going_out_quantity', value)}>
            <Label className="text-sm font-semibold block mb-2">Aproximadamente quantas?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="até_20" id="até_20" />
              <Label htmlFor="até_20">Até 20 peças</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="20_a_50" id="20_a_50" />
              <Label htmlFor="20_a_50">Entre 20 e 50</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mais_50" id="mais_50" />
              <Label htmlFor="mais_50">Mais de 50</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Suas medidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold block mb-2">Tamanho de roupas</Label>
            <Input
              placeholder="Ex: P, M, G, GG, 36, 38"
              value={answers.clothing_size || ''}
              onChange={(e) => onChange('clothing_size', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold block mb-2">Numeração de sapatos</Label>
            <Input
              placeholder="Ex: 35, 36, 37"
              value={answers.shoe_size || ''}
              onChange={(e) => onChange('shoe_size', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Problem Pieces */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Peças problemáticas</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Algo que gosta mas não consegue usar?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Qual peça? Por que não consegue usar?"
            value={answers.problem_pieces || ''}
            onChange={(e) => onChange('problem_pieces', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}