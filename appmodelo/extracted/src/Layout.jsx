import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/layout/Sidebar';
import { Menu, LogOut, User, Languages } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from '@/components/LanguageContext';

function LayoutContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  // Se for cliente, não mostrar sidebar (portal próprio)
  if (user?.user_type === 'client') {
    return <div>{children}</div>;
  }

  const languageOptions = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900">
      {/* Luxury Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(217, 119, 6) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Premium Top Bar */}
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-amber-500/20 shadow-2xl shadow-amber-500/5">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
          
          <div className="relative flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-amber-500/10"
            >
              <Menu className="w-6 h-6 text-amber-400" />
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-3">
              {/* Premium Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-amber-500/20"
                  >
                    <Languages className="w-5 h-5 text-amber-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900/95 backdrop-blur-xl border-amber-500/30 shadow-2xl shadow-amber-500/10">
                  {languageOptions.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`${language === lang.code ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border-l-2 border-amber-500' : 'text-neutral-300 hover:bg-amber-500/10'} transition-all duration-200`}
                    >
                      <span className="mr-2 text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Premium User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20 rounded-xl px-4 py-2.5 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-amber-500/20">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20">
                          {user.full_name?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-lg" />
                      </div>
                      <span className="hidden sm:block text-sm font-semibold text-neutral-100 tracking-wide">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-neutral-900/95 backdrop-blur-xl border-amber-500/30 shadow-2xl shadow-amber-500/10">
                    <div className="px-3 py-3 border-b border-amber-500/20">
                      <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Conta</p>
                      <p className="text-sm font-semibold text-neutral-100">{user.full_name || user.email}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem className="flex items-center gap-3 text-neutral-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-amber-600/20 hover:text-amber-400 transition-all duration-200 my-1 mx-1 rounded-lg">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{t('myProfile')}</span>
                    </DropdownMenuItem>
                    <div className="border-t border-amber-500/20 my-1" />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="flex items-center gap-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 my-1 mx-1 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </header>
        
        {/* Page Content with Premium Padding */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  );
}