import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';

export default function Section9Style({ answers, onChange }) {
  const styleOptions = [
    { id: 'A', label: 'A', description: 'Clássica, neutra, tradicional' },
    { id: 'B', label: 'B', description: 'Criativa, ousada, alegre' },
    { id: 'C', label: 'C', description: 'Elegante, com classe, cara de rica' },
    { id: 'D', label: 'D', description: 'Romântica, delicada, sutil' },
    { id: 'E', label: 'E', description: 'Dramática, impactante, séria' },
    { id: 'F', label: 'F', description: 'Despojada, confortável, descontraída' },
    { id: 'G', label: 'G', description: 'Sexy, interessante, misteriosa' }
  ];

  const handleCheckbox = (key, item) => {
    const current = answers[key] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    onChange(key, updated);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Current Style */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como você se veste ATUALMENTE?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Escolha UMA alternativa</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {styleOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onChange('current_style', option.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                answers.current_style === option.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <RadioGroup value={answers.current_style || ''}>
                  <RadioGroupItem value={option.id} id={`current_${option.id}`} />
                </RadioGroup>
                <div>
                  <Label htmlFor={`current_${option.id}`} className="font-semibold text-base cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Color Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Suas cores favoritas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Quais são suas cores preferidas para vestuário?"
            value={answers.favorite_colors || ''}
            onChange={(e) => onChange('favorite_colors', e.target.value)}
            className="h-20"
          />
          <Textarea
            placeholder="Tem alguma limitação? Cores que evita?"
            value={answers.color_restrictions || ''}
            onChange={(e) => onChange('color_restrictions', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Patterns */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sobre estampas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.patterns_preference || ''} onValueChange={(value) => onChange('patterns_preference', value)}>
            <Label className="text-sm font-semibold block mb-3">Você gosta de estampas?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_muito" id="pattern_sim_muito" />
              <Label htmlFor="pattern_sim_muito">Sim, muito</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="algumas" id="pattern_algumas" />
              <Label htmlFor="pattern_algumas">Apenas algumas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id="pattern_não" />
              <Label htmlFor="pattern_não">Não, prefiro cores lisas</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Quais estampas gosta? Mistura estampas?"
            value={answers.patterns_types || ''}
            onChange={(e) => onChange('patterns_types', e.target.value)}
            className="h-16 mt-4"
          />
        </CardContent>
      </Card>

      {/* Bottom Wear */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Partes de baixo</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.bottom_preference || ''} onValueChange={(value) => onChange('bottom_preference', value)}>
            {[
              'Saias',
              'Calças',
              'Shorts',
              'Bermudas',
              'Mix de tudo'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={`bottom_${option}`} />
                <Label htmlFor={`bottom_${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Accessories */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Acessórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.accessories_use || ''} onValueChange={(value) => onChange('accessories_use', value)} className="mb-4">
            <Label className="text-sm font-semibold block mb-3">Você usa acessórios?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sempre" id="acc_sempre" />
              <Label htmlFor="acc_sempre">Sempre</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="às_vezes" id="acc_às_vezes" />
              <Label htmlFor="acc_às_vezes">Às vezes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="raramente" id="acc_raramente" />
              <Label htmlFor="acc_raramente">Raramente</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Quais acessórios gosta? De que material (metal, pedra, tecido)?"
            value={answers.accessories_types || ''}
            onChange={(e) => onChange('accessories_types', e.target.value)}
            className="h-16"
          />
        </CardContent>
      </Card>

      {/* Bags */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Bolsas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.bags_frequency || ''} onValueChange={(value) => onChange('bags_frequency', value)} className="mb-4">
            <Label className="text-sm font-semibold block mb-3">Você troca de bolsa com frequência?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_frequente" id="bag_sim_freq" />
              <Label htmlFor="bag_sim_freq">Sim, frequentemente</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="às_vezes" id="bag_às_vezes" />
              <Label htmlFor="bag_às_vezes">Às vezes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id="bag_não" />
              <Label htmlFor="bag_não">Não, uso sempre a mesma</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Quais modelos prefere? (grandes, pequenas, tiracolo, estruturada)"
            value={answers.bags_types || ''}
            onChange={(e) => onChange('bags_types', e.target.value)}
            className="h-16"
          />
        </CardContent>
      </Card>

      {/* Getting Dressed */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sua relação com se vestir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.getting_dressed_feeling || ''} onValueChange={(value) => onChange('getting_dressed_feeling', value)} className="mb-4">
            <Label className="text-sm font-semibold block mb-3">Vestir-se é prazeroso ou obrigação?</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="prazeroso" id="dress_prazeroso" />
              <Label htmlFor="dress_prazeroso">Prazeroso</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="neutro" id="dress_neutro" />
              <Label htmlFor="dress_neutro">Neutro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="obrigação" id="dress_obrigação" />
              <Label htmlFor="dress_obrigação">Obrigação</Label>
            </div>
          </RadioGroup>
          <RadioGroup value={answers.dressing_motivation || ''} onValueChange={(value) => onChange('dressing_motivation', value)}>
            <Label className="text-sm font-semibold block mb-3">Você se veste por...</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="hábito" id="mot_hábito" />
              <Label htmlFor="mot_hábito">Hábito</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="conforto" id="mot_conforto" />
              <Label htmlFor="mot_conforto">Conforto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gosto" id="mot_gosto" />
              <Label htmlFor="mot_gosto">Porque gosta</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Existe algum desafio?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Algo muito difícil de mudar para atingir seus objetivos?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Compartilhe seus desafios..."
            value={answers.challenges_main || ''}
            onChange={(e) => onChange('challenges_main', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* How Consultancy Can Help */}
      <Card className="border-0 shadow-lg bg-purple-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">Como você acredita que esta consultoria pode te ajudar?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Suas expectativas finais..."
            value={answers.consultancy_help || ''}
            onChange={(e) => onChange('consultancy_help', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}