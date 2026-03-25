import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await base44.auth.me();
        
        // Redirecionar baseado no tipo de usuário
        if (user.user_type === 'client') {
          navigate(createPageUrl('ClientPortal'));
        } else if (user.user_type === 'consultant') {
          navigate(createPageUrl('ConsultantDashboard'));
        } else {
          // Usuário sem tipo definido, redireciona para dashboard da consultora
          navigate(createPageUrl('ConsultantDashboard'));
        }
      } catch (e) {
        // Não autenticado, redireciona para login
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };

    checkUserAndRedirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
}