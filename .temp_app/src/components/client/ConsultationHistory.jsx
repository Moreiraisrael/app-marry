import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Filter, ChevronRight, Palette, FileText, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConsultationDetails from './ConsultationDetails';

const CONSULTATION_TYPES = {
  color_analysis: { label: 'Análise de Coloração', icon: '🎨', color: 'bg-rose-100 text-rose-800', id: 'color_analysis' },
  style_quiz: { label: 'Questionário de Estilo', icon: '📋', color: 'bg-purple-100 text-purple-800', id: 'style_quiz' },
  wardrobe_analysis: { label: 'Análise de Guarda-roupa', icon: '👗', color: 'bg-blue-100 text-blue-800', id: 'wardrobe_analysis' },
  outfit_advice: { label: 'Consultoria de Looks', icon: '✨', color: 'bg-pink-100 text-pink-800', id: 'outfit_advice' },
  appointment: { label: 'Consultoria Pessoal', icon: '👤', color: 'bg-amber-100 text-amber-800', id: 'appointment' }
};

export default function ConsultationHistory({ clientId }) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Fetch all consultation data
  const { data: colorAnalyses = [] } = useQuery({
    queryKey: ['colorAnalyses', clientId],
    queryFn: () => base44.entities.ColorAnalysisRequest.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const { data: styleQuizzes = [] } = useQuery({
    queryKey: ['styleQuizzes', clientId],
    queryFn: () => base44.entities.StyleQuiz.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', clientId],
    queryFn: () => base44.entities.Appointment.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  // Consolidate consultations
  const allConsultations = useMemo(() => {
    const consultations = [];

    colorAnalyses.forEach(ca => {
      consultations.push({
        id: ca.id,
        type: 'color_analysis',
        date: new Date(ca.created_date),
        status: ca.status,
        data: ca,
        title: `Análise de Coloração - ${CONSULTATION_TYPES.color_analysis.label}`,
      });
    });

    styleQuizzes.forEach(sq => {
      consultations.push({
        id: sq.id,
        type: 'style_quiz',
        date: new Date(sq.created_date),
        status: sq.status || 'completed',
        data: sq,
        title: `${CONSULTATION_TYPES.style_quiz.label}`,
      });
    });

    appointments.forEach(apt => {
      consultations.push({
        id: apt.id,
        type: 'appointment',
        date: new Date(apt.date),
        status: apt.status,
        data: apt,
        title: `Consultoria - ${apt.service_type}`,
      });
    });

    return consultations.sort((a, b) => b.date - a.date);
  }, [colorAnalyses, styleQuizzes, appointments]);

  // Filter consultations
  const filteredConsultations = useMemo(() => {
    return allConsultations.filter(c => {
      const typeMatch = selectedType === 'all' || c.type === selectedType;
      
      if (selectedMonth === 'all') return typeMatch;
      
      const [year, month] = selectedMonth.split('-');
      const cDate = c.date;
      const monthMatch = 
        cDate.getFullYear() === parseInt(year) &&
        cDate.getMonth() === parseInt(month) - 1;
      
      return typeMatch && monthMatch;
    });
  }, [allConsultations, selectedType, selectedMonth]);

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set();
    allConsultations.forEach(c => {
      const year = c.date.getFullYear();
      const month = String(c.date.getMonth() + 1).padStart(2, '0');
      months.add(`${year}-${month}`);
    });
    return Array.from(months).sort().reverse();
  }, [allConsultations]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      approved: { label: 'Aprovada', color: 'bg-blue-100 text-blue-800' },
      scheduled: { label: 'Agendada', color: 'bg-purple-100 text-purple-800' },
      confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    };
    
    const st = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={st.color}>{st.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Consultorias</h2>
        <p className="text-gray-600">Acompanhe todas as suas sessões, análises e evolução</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Tipo de Consultoria
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {Object.entries(CONSULTATION_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.icon} {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Badge variant="outline" className="h-10 px-4">
                {filteredConsultations.length} resultado{filteredConsultations.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filteredConsultations.length > 0 ? (
        <div className="space-y-3">
          {filteredConsultations.map((consultation, idx) => {
            const typeConfig = CONSULTATION_TYPES[consultation.type];
            
            return (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedConsultation(consultation)}
                  className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Icon + Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`text-3xl flex-shrink-0 ${typeConfig.color.split(' ')[0]}`}>
                          {typeConfig.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                            {consultation.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(consultation.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                            
                            <span className="text-sm text-gray-500">
                              {format(consultation.date, 'HH:mm')}
                            </span>
                          </div>

                          {/* Additional Info based on type */}
                          {consultation.type === 'color_analysis' && consultation.data.ai_suggested_season && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                🎨 {consultation.data.ai_suggested_season.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          )}

                          {consultation.type === 'appointment' && consultation.data.location && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                📍 {consultation.data.location}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status + Arrow */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        {getStatusBadge(consultation.status)}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consultoria encontrada</h3>
            <p className="text-gray-600">Experimente ajustar os filtros ou agende uma nova consultoria</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedConsultation && (
        <ConsultationDetails
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  );
}