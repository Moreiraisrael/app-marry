import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function Section3Perceptions({ answers, onChange }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Image Message */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Qual é seu objetivo com a imagem?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Que mensagem quer transmitir? O que as pessoas devem pensar?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva o que gostaria que as pessoas pensassem ao te ver..."
            value={answers.image_message || ''}
            onChange={(e) => onChange('image_message', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* How Others Perceive */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como as pessoas costumam perceber seu jeito de se vestir?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Você recebe comentários? Quais?</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva como as pessoas reagem ao seu estilo..."
            value={answers.others_perception || ''}
            onChange={(e) => onChange('others_perception', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Inspirations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Existe alguém que te inspira?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Em relação à imagem e estilo</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Quem? O que você gosta no estilo dessa pessoa?"
            value={answers.inspirations || ''}
            onChange={(e) => onChange('inspirations', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Childhood & Parents */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Como foi sua infância?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Seu relacionamento com seus pais</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Compartilhe como isso influencia sua imagem hoje..."
            value={answers.childhood || ''}
            onChange={(e) => onChange('childhood', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* What Stands Out */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que chama atenção das pessoas em você?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Ex: bom humor, organização, criatividade, responsabilidade</p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.stands_out || ''} onValueChange={(value) => onChange('stands_out', value)}>
            {[
              'Bom humor',
              'Organização',
              'Responsabilidade',
              'Generosidade',
              'Criatividade',
              'Inteligência',
              'Carisma',
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

      {/* Who Will Be Happy */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Quem ficará feliz com sua mudança?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Pessoas importantes para você..."
            value={answers.supporters || ''}
            onChange={(e) => onChange('supporters', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}