import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from 'framer-motion';

export default function Section5Fashion({ answers, onChange }) {
  const handleCheckbox = (key, item) => {
    const current = answers[key] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    onChange(key, updated);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Favorite Look */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Descreva seu look favorito</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Ex: calça jeans, camiseta branca, tênis, lenço, bolsa grande</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Como seria seu visual perfeito?"
            value={answers.favorite_look || ''}
            onChange={(e) => onChange('favorite_look', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Brands */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Preferências de marca</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Roupas, sapatos, acessórios</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Quais marcas você gosta?"
            value={answers.favorite_brands || ''}
            onChange={(e) => onChange('favorite_brands', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Never Wear */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que você jamais usaria?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Tipos de roupa, cor, estampa, acessório</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva suas limitações..."
            value={answers.never_wear || ''}
            onChange={(e) => onChange('never_wear', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Handmade Pieces */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Gosta de peças feitas à mão?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.handmade || ''} onValueChange={(value) => onChange('handmade', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_tricô_crochê" id="sim_tricô_crochê" />
              <Label htmlFor="sim_tricô_crochê">Sim, gosto de tricô/crochê</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_acessórios" id="sim_acessórios" />
              <Label htmlFor="sim_acessórios">Sim, acessórios feitos à mão</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_ambos" id="sim_ambos" />
              <Label htmlFor="sim_ambos">Sim, ambos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id="não_handmade" />
              <Label htmlFor="não_handmade">Não, prefiro industrializados</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Essential Item */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que é indispensável quando sai?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Qual peça/acessório você nunca sai sem?"
            value={answers.essential_item || ''}
            onChange={(e) => onChange('essential_item', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Attention Seeking */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Gosta de chamar atenção?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.attention_level || ''} onValueChange={(value) => onChange('attention_level', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_sempre" id="sim_sempre" />
              <Label htmlFor="sim_sempre">Sim, sempre chamo atenção</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="um_pouco" id="um_pouco" />
              <Label htmlFor="um_pouco">Um pouco, moderado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não_discreto" id="não_discreto" />
              <Label htmlFor="não_discreto">Não, prefiro ser discreto(a)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Dream Fashion */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Algo que adoraria usar mas não tem coragem?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Existe algo fashion que te assusta? Por quê?"
            value={answers.dream_fashion || ''}
            onChange={(e) => onChange('dream_fashion', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}