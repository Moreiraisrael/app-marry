import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';

export default function Section6PersonalCare({ answers, onChange }) {
  const handleCheckbox = (key, item) => {
    const current = answers[key] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    onChange(key, updated);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Nails */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sobre suas unhas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.nails_frequency || ''} onValueChange={(value) => onChange('nails_frequency', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular">Faço regularmente</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="ocasional" id="ocasional" />
              <Label htmlFor="ocasional">Faço ocasionalmente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nunca" id="nunca" />
              <Label htmlFor="nunca">Nunca faço</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Comprimento preferido? Cores favoritas?"
            value={answers.nails_preference || ''}
            onChange={(e) => onChange('nails_preference', e.target.value)}
            className="h-16"
          />
        </CardContent>
      </Card>

      {/* Makeup */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sua relação com maquiagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.makeup_style || ''} onValueChange={(value) => onChange('makeup_style', value)}>
            {[
              'Só batom',
              'Leve',
              'Completa',
              'Chamativa',
              'Sofisticada',
              'Discreta',
              'Não uso'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={`makeup_${option}`} />
                <Label htmlFor={`makeup_${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Hair */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Seu cabelo</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Importância, desejos, restrições, problemas</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="O que o cabelo representa para você?"
            value={answers.hair_importance || ''}
            onChange={(e) => onChange('hair_importance', e.target.value)}
            className="h-16"
          />
          <Textarea
            placeholder="Tem vontade de mudar? Problemas de saúde? Muda com frequência?"
            value={answers.hair_changes || ''}
            onChange={(e) => onChange('hair_changes', e.target.value)}
            className="h-16"
          />
        </CardContent>
      </Card>

      {/* Skin Care */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Cuidados com a pele</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'Botox',
            'Limpeza de pele',
            'Peelings',
            'Hidratação profunda',
            'Cuidados naturais',
            'Nenhum em específico'
          ].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`skin_${option}`}
                checked={(answers.skin_treatments || []).includes(option)}
                onCheckedChange={() => handleCheckbox('skin_treatments', option)}
              />
              <Label htmlFor={`skin_${option}`} className="cursor-pointer font-normal">{option}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tattoos & Piercings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Tatuagens e Piercings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold block mb-3">Você tem tatuagem(ns)?</Label>
            <RadioGroup value={answers.tattoo || ''} onValueChange={(value) => onChange('tattoo', value)}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="sim" id="tattoo_sim" />
                <Label htmlFor="tattoo_sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="não" id="tattoo_não" />
                <Label htmlFor="tattoo_não">Não</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm font-semibold block mb-3">Você tem piercing(s)?</Label>
            <RadioGroup value={answers.piercing || ''} onValueChange={(value) => onChange('piercing', value)}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="sim" id="piercing_sim" />
                <Label htmlFor="piercing_sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="não" id="piercing_não" />
                <Label htmlFor="piercing_não">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Surgeries */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Intervenções cirúrgicas estéticas</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.cosmetic_surgery || ''} onValueChange={(value) => onChange('cosmetic_surgery', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_descrever" id="surgery_sim" />
              <Label htmlFor="surgery_sim">Sim, já fiz</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="considerando" id="surgery_considering" />
              <Label htmlFor="surgery_considering">Estou considerando</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id="surgery_não" />
              <Label htmlFor="surgery_não">Não, não faço</Label>
            </div>
          </RadioGroup>
          {(answers.cosmetic_surgery === 'sim_descrever' || answers.cosmetic_surgery === 'considerando') && (
            <Textarea
              placeholder="Qual procedimento? Por quê?"
              value={answers.cosmetic_surgery_details || ''}
              onChange={(e) => onChange('cosmetic_surgery_details', e.target.value)}
              className="h-16 mt-4"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}