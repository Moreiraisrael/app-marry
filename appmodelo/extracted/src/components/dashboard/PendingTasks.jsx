import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Palette, Sparkles, Shirt, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PendingTasks({ 
  pendingColorAnalysis = [], 
  pendingStyleQuizzes = [],
  recentWardrobeItems = []
}) {
  const tasks = [
    {
      id: 'color',
      title: 'Análises de Coloração',
      count: pendingColorAnalysis.length,
      icon: Palette,
      color: 'rose',
      link: createPageUrl('ColorAnalysis'),
      items: pendingColorAnalysis.slice(0, 3),
      emptyMessage: 'Nenhuma análise pendente'
    },
    {
      id: 'style',
      title: 'Questionários de Estilo',
      count: pendingStyleQuizzes.length,
      icon: Sparkles,
      color: 'purple',
      link: createPageUrl('PendingStyleQuizzes'),
      items: pendingStyleQuizzes.slice(0, 3),
      emptyMessage: 'Nenhum questionário pendente'
    },
    {
      id: 'wardrobe',
      title: 'Novos Itens de Guarda-Roupa',
      count: recentWardrobeItems.length,
      icon: Shirt,
      color: 'blue',
      link: createPageUrl('VirtualWardrobe'),
      items: recentWardrobeItems.slice(0, 3),
      emptyMessage: 'Nenhum item novo'
    }
  ];

  const totalPending = pendingColorAnalysis.length + pendingStyleQuizzes.length + recentWardrobeItems.length;

  const colorClasses = {
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-500' }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            Tarefas Pendentes
          </CardTitle>
          {totalPending > 0 && (
            <Badge className="bg-red-500 text-white">{totalPending}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalPending === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-gray-600 font-medium">Tudo em dia!</p>
            <p className="text-sm text-gray-500">Não há tarefas pendentes no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`p-4 rounded-lg ${colorClasses[task.color].bg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <task.icon className={`w-5 h-5 ${colorClasses[task.color].text}`} />
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    </div>
                    {task.count > 0 && (
                      <Badge className={`${colorClasses[task.color].badge} text-white`}>
                        {task.count}
                      </Badge>
                    )}
                  </div>

                  {task.count === 0 ? (
                    <p className="text-sm text-gray-500">{task.emptyMessage}</p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-3">
                        {task.items.map((item, idx) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <AlertCircle className="w-3 h-3" />
                            <span className="truncate">
                              {new Date(item.created_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ))}
                        {task.count > 3 && (
                          <p className="text-xs text-gray-500">+ {task.count - 3} mais</p>
                        )}
                      </div>
                      <Link to={task.link}>
                        <Button size="sm" variant="outline" className="w-full">
                          Ver todas
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}