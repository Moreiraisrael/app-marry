import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const seasonLabels = {
  primavera_clara: 'Primavera Clara',
  primavera_quente: 'Primavera Quente',
  primavera_brilhante: 'Primavera Brilhante',
  verao_claro: 'Verão Claro',
  verao_suave: 'Verão Suave',
  verao_frio: 'Verão Frio',
  outono_suave: 'Outono Suave',
  outono_quente: 'Outono Quente',
  outono_profundo: 'Outono Profundo',
  inverno_profundo: 'Inverno Profundo',
  inverno_frio: 'Inverno Frio',
  inverno_brilhante: 'Inverno Brilhante'
};

const styleLabels = {
  classico: 'Clássico',
  dramatico: 'Dramático',
  romantico: 'Romântico',
  natural: 'Natural',
  criativo: 'Criativo',
  elegante: 'Elegante',
  sensual: 'Sensual'
};

export default function ClientOverview({ 
  client, 
  colorAnalysis, 
  styleQuiz, 
  nextAppointment,
  index 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {client.profile_photo ? (
              <img 
                src={client.profile_photo} 
                alt={client.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-medium">
                {client.full_name?.[0] || 'C'}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{client.full_name}</CardTitle>
              <p className="text-xs text-gray-500">{client.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Color Analysis */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-gray-600">Coloração:</span>
            {colorAnalysis ? (
              <Badge className="bg-rose-100 text-rose-700 text-xs">
                {seasonLabels[colorAnalysis.consultant_season]}
              </Badge>
            ) : (
              <span className="text-xs text-gray-400">Não analisada</span>
            )}
          </div>

          {/* Style Analysis */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Estilo:</span>
            {styleQuiz ? (
              <Badge className="bg-purple-100 text-purple-700 text-xs capitalize">
                {styleLabels[styleQuiz.consultant_style]}
              </Badge>
            ) : (
              <span className="text-xs text-gray-400">Não definido</span>
            )}
          </div>

          {/* Next Appointment */}
          {nextAppointment && (
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Próxima consulta:</span>
              </div>
              <p className="text-xs text-blue-700 ml-6">
                {new Date(nextAppointment.date).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          <Link to={createPageUrl(`ClientDetail?id=${client.id}`)}>
            <Button variant="outline" className="w-full mt-2" size="sm">
              Ver Perfil Completo
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}