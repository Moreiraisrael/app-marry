import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  'pt-BR': {
    // Layout & Navigation
    dashboard: 'Dashboard',
    clients: 'Clientes',
    appointments: 'Agendamentos',
    colorAnalysis: 'Análise de Cores',
    styleQuiz: 'Quiz de Estilo',
    virtualWardrobe: 'Guarda-Roupa Virtual',
    capsuleWardrobe: 'Cápsula de Guarda-Roupa',
    productInspirations: 'Inspirações',
    shoppingLists: 'Listas de Compras',
    shop: 'Loja Virtual',
    ebooks: 'E-books',
    services: 'Serviços',
    partnerStores: 'Lojas Parceiras',
    gallery: 'Galeria',
    analytics: 'Análises',
    settings: 'Configurações',
    logout: 'Sair',
    myProfile: 'Meu Perfil',
    
    // Common
    save: 'Salvar',
    cancel: 'Cancel',
    edit: 'Editar',
    delete: 'Excluir',
    add: 'Adicionar',
    create: 'Criar',
    update: 'Atualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    loading: 'Carregando...',
    noData: 'Nenhum dado disponível',
    yes: 'Sim',
    no: 'Não',
    confirm: 'Confirmar',
    close: 'Fechar',
    download: 'Baixar',
    upload: 'Carregar',
    
    // Client Portal
    clientPortal: 'Portal da Cliente',
    myResults: 'Meus Resultados',
    myDossier: 'Meu Dossiê',
    virtualFitting: 'Prova Virtual',
    myProgress: 'Meu Progresso',
    chat: 'Chat',
    photos: 'Fotos',
    overview: 'Visão Geral',
    
    // Seasons
    'primavera_clara': 'Primavera Clara',
    'primavera_quente': 'Primavera Quente',
    'primavera_brilhante': 'Primavera Brilhante',
    'verao_claro': 'Verão Claro',
    'verao_suave': 'Verão Suave',
    'verao_frio': 'Verão Frio',
    'outono_suave': 'Outono Suave',
    'outono_quente': 'Outono Quente',
    'outono_profundo': 'Outono Profundo',
    'inverno_profundo': 'Inverno Profundo',
    'inverno_frio': 'Inverno Frio',
    'inverno_brilhante': 'Inverno Brilhante',
    
    // Styles
    'classico': 'Clássico',
    'dramatico': 'Dramático',
    'romantico': 'Romântico',
    'natural': 'Natural',
    'criativo': 'Criativo',
    'elegante': 'Elegante',
    'sensual': 'Sensual',
    
    // Body Types
    'ampulheta': 'Ampulheta',
    'triangulo': 'Triângulo',
    'triangulo_invertido': 'Triângulo Invertido',
    'retangulo': 'Retângulo',
    'oval': 'Oval',
    
    // Status
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    completed: 'Concluído',
    active: 'Ativo',
    inactive: 'Inativo',
    
    // Messages
    saveSuccess: 'Salvo com sucesso!',
    saveError: 'Erro ao salvar',
    deleteSuccess: 'Excluído com sucesso!',
    deleteError: 'Erro ao excluir',
    updateSuccess: 'Atualizado com sucesso!',
    updateError: 'Erro ao atualizar',
  },
  
  'en': {
    // Layout & Navigation
    dashboard: 'Dashboard',
    clients: 'Clients',
    appointments: 'Appointments',
    colorAnalysis: 'Color Analysis',
    styleQuiz: 'Style Quiz',
    virtualWardrobe: 'Virtual Wardrobe',
    capsuleWardrobe: 'Capsule Wardrobe',
    productInspirations: 'Inspirations',
    shoppingLists: 'Shopping Lists',
    shop: 'Virtual Shop',
    ebooks: 'E-books',
    services: 'Services',
    partnerStores: 'Partner Stores',
    gallery: 'Gallery',
    analytics: 'Analytics',
    settings: 'Settings',
    logout: 'Logout',
    myProfile: 'My Profile',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No data available',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    close: 'Close',
    download: 'Download',
    upload: 'Upload',
    
    // Client Portal
    clientPortal: 'Client Portal',
    myResults: 'My Results',
    myDossier: 'My Dossier',
    virtualFitting: 'Virtual Fitting',
    myProgress: 'My Progress',
    chat: 'Chat',
    photos: 'Photos',
    overview: 'Overview',
    
    // Seasons
    'primavera_clara': 'Light Spring',
    'primavera_quente': 'Warm Spring',
    'primavera_brilhante': 'Bright Spring',
    'verao_claro': 'Light Summer',
    'verao_suave': 'Soft Summer',
    'verao_frio': 'Cool Summer',
    'outono_suave': 'Soft Autumn',
    'outono_quente': 'Warm Autumn',
    'outono_profundo': 'Deep Autumn',
    'inverno_profundo': 'Deep Winter',
    'inverno_frio': 'Cool Winter',
    'inverno_brilhante': 'Bright Winter',
    
    // Styles
    'classico': 'Classic',
    'dramatico': 'Dramatic',
    'romantico': 'Romantic',
    'natural': 'Natural',
    'criativo': 'Creative',
    'elegante': 'Elegant',
    'sensual': 'Sensual',
    
    // Body Types
    'ampulheta': 'Hourglass',
    'triangulo': 'Triangle',
    'triangulo_invertido': 'Inverted Triangle',
    'retangulo': 'Rectangle',
    'oval': 'Oval',
    
    // Status
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',
    
    // Messages
    saveSuccess: 'Saved successfully!',
    saveError: 'Error saving',
    deleteSuccess: 'Deleted successfully!',
    deleteError: 'Error deleting',
    updateSuccess: 'Updated successfully!',
    updateError: 'Error updating',
  },
  
  'es': {
    // Layout & Navigation
    dashboard: 'Panel',
    clients: 'Clientes',
    appointments: 'Citas',
    colorAnalysis: 'Análisis de Color',
    styleQuiz: 'Quiz de Estilo',
    virtualWardrobe: 'Armario Virtual',
    capsuleWardrobe: 'Armario Cápsula',
    productInspirations: 'Inspiraciones',
    shoppingLists: 'Listas de Compras',
    shop: 'Tienda Virtual',
    ebooks: 'E-books',
    services: 'Servicios',
    partnerStores: 'Tiendas Asociadas',
    gallery: 'Galería',
    analytics: 'Análisis',
    settings: 'Configuración',
    logout: 'Salir',
    myProfile: 'Mi Perfil',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    loading: 'Cargando...',
    noData: 'No hay datos disponibles',
    yes: 'Sí',
    no: 'No',
    confirm: 'Confirmar',
    close: 'Cerrar',
    download: 'Descargar',
    upload: 'Cargar',
    
    // Client Portal
    clientPortal: 'Portal del Cliente',
    myResults: 'Mis Resultados',
    myDossier: 'Mi Dossiê',
    virtualFitting: 'Prueba Virtual',
    myProgress: 'Mi Progreso',
    chat: 'Chat',
    photos: 'Fotos',
    overview: 'Resumen',
    
    // Seasons
    'primavera_clara': 'Primavera Clara',
    'primavera_quente': 'Primavera Cálida',
    'primavera_brilhante': 'Primavera Brillante',
    'verao_claro': 'Verano Claro',
    'verao_suave': 'Verano Suave',
    'verao_frio': 'Verano Frío',
    'outono_suave': 'Otoño Suave',
    'outono_quente': 'Otoño Cálido',
    'outono_profundo': 'Otoño Profundo',
    'inverno_profundo': 'Invierno Profundo',
    'inverno_frio': 'Invierno Frío',
    'inverno_brilhante': 'Invierno Brillante',
    
    // Styles
    'classico': 'Clásico',
    'dramatico': 'Dramático',
    'romantico': 'Romántico',
    'natural': 'Natural',
    'criativo': 'Creativo',
    'elegante': 'Elegante',
    'sensual': 'Sensual',
    
    // Body Types
    'ampulheta': 'Reloj de Arena',
    'triangulo': 'Triángulo',
    'triangulo_invertido': 'Triángulo Invertido',
    'retangulo': 'Rectángulo',
    'oval': 'Oval',
    
    // Status
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    completed: 'Completado',
    active: 'Activo',
    inactive: 'Inactivo',
    
    // Messages
    saveSuccess: '¡Guardado exitosamente!',
    saveError: 'Error al guardar',
    deleteSuccess: '¡Eliminado exitosamente!',
    deleteError: 'Error al eliminar',
    updateSuccess: '¡Actualizado exitosamente!',
    updateError: 'Error al actualizar',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}