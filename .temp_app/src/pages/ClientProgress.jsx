import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ProgressDashboard from '@/components/gamification/ProgressDashboard';
import { Sparkles, Award } from 'lucide-react';

export default function ClientProgress() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData?.user_type === 'client') {
          const clients = await base44.entities.Client.filter({ email: userData.email });
          if (clients[0]) setClient(clients[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-gray-600">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-purple-600 text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Gamificação
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            Seu <span className="font-semibold">Progresso</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Desbloqueie conquistas e evolua na sua jornada de estilo!
          </p>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard clientId={client.id} />
      </div>
    </div>
  );
}