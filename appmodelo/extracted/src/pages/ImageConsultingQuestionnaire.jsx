import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Section1About from '@/components/questionnaire/Section1About';
import Section2Goals from '@/components/questionnaire/Section2Goals';
import Section3Perceptions from '@/components/questionnaire/Section3Perceptions';
import Section4Lifestyle from '@/components/questionnaire/Section4Lifestyle';
import Section5Fashion from '@/components/questionnaire/Section5Fashion';
import Section6PersonalCare from '@/components/questionnaire/Section6PersonalCare';
import Section7Shopping from '@/components/questionnaire/Section7Shopping';
import Section8Wardrobe from '@/components/questionnaire/Section8Wardrobe';
import Section9Style from '@/components/questionnaire/Section9Style';

export default function ImageConsultingQuestionnaire() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState('1');

  const [answers, setAnswers] = useState({
    section1: {},
    section2: {},
    section3: {},
    section4: {},
    section5: {},
    section6: {},
    section7: {},
    section8: {},
    section9: {}
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const clients = await base44.entities.Client.filter({ email: userData.email });
        if (clients[0]) {
          setClient(clients[0]);
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const handleSectionAnswerChange = (sectionNum, key, value) => {
    setAnswers(prev => ({
      ...prev,
      [sectionNum]: {
        ...prev[sectionNum],
        [key]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!client) return;

    setSubmitting(true);
    try {
      await base44.entities.StyleQuiz.create({
        client_id: client.id,
        questionnaire_responses: answers,
        status: 'pending',
        submitted_date: new Date().toISOString()
      });

      toast.success('Questionário enviado com sucesso!');
      setTimeout(() => {
        window.location.href = '/client-portal';
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar questionário');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  const sections = [
    { id: '1', label: 'Sobre Você', icon: '👤' },
    { id: '2', label: 'Objetivos', icon: '🎯' },
    { id: '3', label: 'Percepção', icon: '👀' },
    { id: '4', label: 'Rotina', icon: '⏰' },
    { id: '5', label: 'Moda', icon: '👗' },
    { id: '6', label: 'Cuidados', icon: '✨' },
    { id: '7', label: 'Compras', icon: '🛍️' },
    { id: '8', label: 'Guarda-Roupa', icon: '👚' },
    { id: '9', label: 'Estilo', icon: '💎' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Questionário de <span className="font-semibold">Consultoria de Imagem</span>
          </h1>
          <p className="text-gray-600">
            Conhece-nos melhor para personalizar sua consultoria. Sem respostas certas ou erradas! 💝
          </p>
        </motion.div>

        {/* Progress */}
        <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Seção {parseInt(currentSection)} de 9</p>
                <p className="text-lg font-semibold text-purple-900 mt-1">
                  {sections.find(s => s.id === currentSection)?.label}
                </p>
              </div>
              <div className="w-24 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                  style={{ width: `${(parseInt(currentSection) / 9) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={currentSection} onValueChange={setCurrentSection} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-9 w-full bg-white shadow-md p-1 rounded-xl">
            {sections.map(section => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="rounded-lg text-xs md:text-sm flex flex-col items-center gap-1"
              >
                <span className="text-lg">{section.icon}</span>
                <span className="hidden md:inline">{section.label}</span>
                <span className="md:hidden">{section.id}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Section 1: About You */}
          <TabsContent value="1">
            <Section1About
              answers={answers.section1}
              onChange={(key, value) => handleSectionAnswerChange('section1', key, value)}
            />
          </TabsContent>

          {/* Section 2: Goals */}
          <TabsContent value="2">
            <Section2Goals
              answers={answers.section2}
              onChange={(key, value) => handleSectionAnswerChange('section2', key, value)}
            />
          </TabsContent>

          {/* Section 3: Perceptions */}
          <TabsContent value="3">
            <Section3Perceptions
              answers={answers.section3}
              onChange={(key, value) => handleSectionAnswerChange('section3', key, value)}
            />
          </TabsContent>

          {/* Section 4: Lifestyle */}
          <TabsContent value="4">
            <Section4Lifestyle
              answers={answers.section4}
              onChange={(key, value) => handleSectionAnswerChange('section4', key, value)}
            />
          </TabsContent>

          {/* Section 5: Fashion Preferences */}
          <TabsContent value="5">
            <Section5Fashion
              answers={answers.section5}
              onChange={(key, value) => handleSectionAnswerChange('section5', key, value)}
            />
          </TabsContent>

          {/* Section 6: Personal Care */}
          <TabsContent value="6">
            <Section6PersonalCare
              answers={answers.section6}
              onChange={(key, value) => handleSectionAnswerChange('section6', key, value)}
            />
          </TabsContent>

          {/* Section 7: Shopping */}
          <TabsContent value="7">
            <Section7Shopping
              answers={answers.section7}
              onChange={(key, value) => handleSectionAnswerChange('section7', key, value)}
            />
          </TabsContent>

          {/* Section 8: Wardrobe */}
          <TabsContent value="8">
            <Section8Wardrobe
              answers={answers.section8}
              onChange={(key, value) => handleSectionAnswerChange('section8', key, value)}
            />
          </TabsContent>

          {/* Section 9: Style */}
          <TabsContent value="9">
            <Section9Style
              answers={answers.section9}
              onChange={(key, value) => handleSectionAnswerChange('section9', key, value)}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const current = parseInt(currentSection);
              if (current > 1) {
                setCurrentSection(String(current - 1));
              }
            }}
            disabled={currentSection === '1'}
          >
            ← Anterior
          </Button>

          {currentSection === '9' ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Questionário
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const current = parseInt(currentSection);
                if (current < 9) {
                  setCurrentSection(String(current + 1));
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Próximo →
            </Button>
          )}
        </div>

        {/* Info Box */}
        <Card className="border-0 shadow-lg bg-amber-50 mt-6">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Dica:</strong> Seja honesta e detalhada nas respostas. Quanto mais informação você compartilhar, melhor será a consultoria personalizada!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}