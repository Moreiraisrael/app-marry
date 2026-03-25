import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function Section4Lifestyle({ answers, onChange }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Daily Routine */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Descreva sua rotina diária</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Horas dedicadas a trabalho, estudo, lazer, exercício, sono, etc</p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 8h trabalho • 1h academia • 7h sono • 2h lazer..."
            value={answers.daily_routine || ''}
            onChange={(e) => onChange('daily_routine', e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Free Time */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">O que mais gosta de fazer nas horas vagas?</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva seus hobbies e atividades favoritas..."
            value={answers.free_time || ''}
            onChange={(e) => onChange('free_time', e.target.value)}
            className="h-20"
          />
        </CardContent>
      </Card>

      {/* Hobbies */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Pratica alguma atividade manual?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Música, pintura, crochê, ioga, etc</p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.hobbies || ''} onValueChange={(value) => onChange('hobbies', value)}>
            {[
              'Sim, música',
              'Sim, pintura/arte',
              'Sim, crochê/tricô',
              'Sim, ioga/pilates',
              'Sim, dança',
              'Sim, outra',
              'Não pratico'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Music & Movies */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Preferências culturais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold block mb-2">Tipo de música favorito?</Label>
            <Textarea
              placeholder="Ex: pop, rock, sertanejo, clássico..."
              value={answers.favorite_music || ''}
              onChange={(e) => onChange('favorite_music', e.target.value)}
              className="h-16"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold block mb-2">Tipo de filme favorito?</Label>
            <Textarea
              placeholder="Ex: ação, romance, comédia, drama..."
              value={answers.favorite_movies || ''}
              onChange={(e) => onChange('favorite_movies', e.target.value)}
              className="h-16"
            />
          </div>
        </CardContent>
      </Card>

      {/* Travel Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Seu roteiro de viagem preferido?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers.travel_style || ''} onValueChange={(value) => onChange('travel_style', value)}>
            {[
              'Praia',
              'Montanha',
              'Campo',
              'Cidade',
              'Resort',
              'Aventura',
              'Mix de tudo'
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