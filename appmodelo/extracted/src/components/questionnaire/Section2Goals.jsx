import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from 'framer-motion';

export default function Section2Goals({ answers, onChange }) {
  const helpAreas = [
    'Combinação de cores',
    'Montagem de looks',
    'Comunicação na imagem',
    'Quantidade de peças',
    'Compras online e offline',
    'Maquiagem e cabelo',
    'Acessórios'
  ];

  const changes = [
    'Novo emprego',
    'Casamento',
    'Divórcio',
    'Chegada de filho',
    'Mudança de cidade',
    'Outro'
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
      {/* What brings you here */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como a consultoria pode te ajudar?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">O que você busca? Quais suas dúvidas?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva seus objetivos e dúvidas..."
            value={answers.motivation || ''}
            onChange={(e) => onChange('motivation', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Help Areas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Em quais áreas você mais precisa de ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {helpAreas.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox
                id={area}
                checked={(answers.help_areas || []).includes(area)}
                onCheckedChange={() => handleCheckbox('help_areas', area)}
              />
              <Label htmlFor={area} className="cursor-pointer font-normal">{area}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Life Changes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Está passando por mudanças?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Novo emprego, casamento, mudança, etc</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {changes.map((change) => (
            <div key={change} className="flex items-center space-x-2">
              <Checkbox
                id={change}
                checked={(answers.life_changes || []).includes(change)}
                onCheckedChange={() => handleCheckbox('life_changes', change)}
              />
              <Label htmlFor={change} className="cursor-pointer font-normal">{change}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consultancy Questions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Tem dúvidas sobre o processo da consultoria?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Compartilhe suas dúvidas ou curiosidades..."
            value={answers.consultancy_questions || ''}
            onChange={(e) => onChange('consultancy_questions', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}