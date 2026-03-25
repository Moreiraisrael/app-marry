import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function Section7Shopping({ answers, onChange }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Shopping Frequency */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Você gosta de fazer compras?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Com qual frequência?</p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.shopping_frequency || ''} onValueChange={(value) => onChange('shopping_frequency', value)}>
            {[
              'Semanalmente',
              'Quinzenalmente',
              'Mensalmente',
              'Poucas vezes ao ano',
              'Raramente'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Planning */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como você compra?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={answers.shopping_planning || ''} onValueChange={(value) => onChange('shopping_planning', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="planejada" id="planejada" />
              <Label htmlFor="planejada">Planejada com antecedência</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="necessidade" id="necessidade" />
              <Label htmlFor="necessidade">Só quando há necessidade</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="impulso" id="impulso" />
              <Label htmlFor="impulso">Por impulso</Label>
            </div>
          </RadioGroup>
          <RadioGroup value={answers.shopping_speed || ''} onValueChange={(value) => onChange('shopping_speed', value)} className="mt-4">
            <Label className="text-sm font-semibold block mb-2">Você compra...</Label>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="rapidamente" id="rapidamente" />
              <Label htmlFor="rapidamente">Rapidamente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="com_calma" id="com_calma" />
              <Label htmlFor="com_calma">Com calma</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Company */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Prefere comprar sozinho ou acompanhado?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.shopping_company || ''} onValueChange={(value) => onChange('shopping_company', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sozinho" id="sozinho" />
              <Label htmlFor="sozinho">Sozinho</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="amigos" id="amigos" />
              <Label htmlFor="amigos">Com amigos</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="família" id="família" />
              <Label htmlFor="família">Com família</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ambos" id="ambos" />
              <Label htmlFor="ambos">Ambos</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Impulse Buying */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Você costuma comprar por impulso?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.impulse_buying || ''} onValueChange={(value) => onChange('impulse_buying', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_frequente" id="sim_frequente" />
              <Label htmlFor="sim_frequente">Sim, frequentemente</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="às_vezes" id="às_vezes" />
              <Label htmlFor="às_vezes">Às vezes</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="raramente" id="raramente" />
              <Label htmlFor="raramente">Raramente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nunca" id="nunca_impulse" />
              <Label htmlFor="nunca_impulse">Nunca</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Motivation */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que mais te motiva a comprar?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: eventos, trabalho, distração, desejo de algo novo..."
            value={answers.shopping_motivation || ''}
            onChange={(e) => onChange('shopping_motivation', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Forgotten Clothes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Compra peças que ficam esquecidas no guarda-roupa?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.forgotten_clothes_freq || ''} onValueChange={(value) => onChange('forgotten_clothes_freq', value)} className="mb-4">
            {[
              'Frequentemente',
              'Às vezes',
              'Raramente',
              'Nunca'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={`forgotten_${option}`} />
                <Label htmlFor={`forgotten_${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          <Textarea
            placeholder="Por que ficam esquecidas? Pode citar um exemplo?"
            value={answers.forgotten_clothes_reason || ''}
            onChange={(e) => onChange('forgotten_clothes_reason', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Dream Shop */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Se dinheiro não fosse problema...</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Onde compraria suas roupas?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Qual loja ou marca é seu sonho?"
            value={answers.dream_shop || ''}
            onChange={(e) => onChange('dream_shop', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Online Shopping */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Compra online?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.online_shopping || ''} onValueChange={(value) => onChange('online_shopping', value)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="sim_frequente" id="online_sim_freq" />
              <Label htmlFor="online_sim_freq">Sim, frequentemente</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="às_vezes" id="online_às_vezes" />
              <Label htmlFor="online_às_vezes">Às vezes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id="online_não" />
              <Label htmlFor="online_não">Não, compro apenas presencialmente</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}