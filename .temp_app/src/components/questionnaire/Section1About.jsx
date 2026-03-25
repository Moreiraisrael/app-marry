import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function Section1About({ answers, onChange }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Name */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como gosta de ser chamado(a)?</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Seu nome ou apelido"
            value={answers.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* About You */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Fale sobre você</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Suas habilidades, qualidades, o que valoriza em si</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Conte um pouco sobre você..."
            value={answers.about || ''}
            onChange={(e) => onChange('about', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Mirror Feelings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como se vê no espelho?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">O que sente em relação às roupas e ao seu corpo?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva seus sentimentos..."
            value={answers.mirror_feelings || ''}
            onChange={(e) => onChange('mirror_feelings', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que mais gosta em você?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Partes do corpo que quer mostrar ou esconder?</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="O que você mais gosta em você?"
            value={answers.strengths || ''}
            onChange={(e) => onChange('strengths', e.target.value)}
            className="h-20"
          />
          <Textarea
            placeholder="Há algo que não gosta? Algo que quer mostrar ou esconder?"
            value={answers.challenges || ''}
            onChange={(e) => onChange('challenges', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Life Stage */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como você definiria o momento atual da sua vida?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.life_stage || ''} onValueChange={(value) => onChange('life_stage', value)}>
            {[
              'Autoconhecimento',
              'Realizações',
              'Planejamento',
              'Busca',
              'Colhendo frutos',
              'Turbulência',
              'Outro'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}