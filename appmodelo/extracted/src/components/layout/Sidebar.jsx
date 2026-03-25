import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Palette,
  Users,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Camera,
  Briefcase,
  Settings,
  X,
  BarChart3,
  Image,
  TrendingUp,
  Package
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { icon: Home, label: t('dashboard'), path: "Home" },
    { icon: Calendar, label: t('appointments'), path: "Appointments" },
    { icon: Package, label: 'Meus Pedidos', path: "MyOrders" },
    { icon: ShoppingBag, label: 'Assistente de Compras', path: "PersonalizedShopping" },
    { icon: ShoppingBag, label: t('shop'), path: "Shop" },
    { icon: Palette, label: t('colorAnalysis'), path: "ColorAnalysis" },
    { icon: Sparkles, label: t('styleQuiz'), path: "PendingStyleQuizzes" },
    { icon: Sparkles, label: 'Quiz de Arquétipo', path: "ArchetypeQuiz" },
    { icon: Users, label: t('clients'), path: "Clients" },
    { icon: Camera, label: t('virtualFitting'), path: "VirtualFitting" },
    { icon: Sparkles, label: t('virtualWardrobe'), path: "VirtualWardrobe" },
    { icon: Camera, label: t('capsuleWardrobe'), path: "CapsuleWardrobe" },
    { icon: Image, label: t('productInspirations'), path: "ProductInspirations" },
    { icon: BarChart3, label: t('myProgress'), path: "ClientProgress" },
    { icon: BarChart3, label: t('analytics'), path: "Analytics" },
    { icon: TrendingUp, label: 'Tendências', path: "StyleTrends" },
    { icon: ShoppingBag, label: t('shoppingLists'), path: "ShoppingLists" },
    { icon: BookOpen, label: t('ebooks'), path: "Ebooks" },
    { icon: ShoppingBag, label: t('partnerStores'), path: "PartnerStores" },
    { icon: Camera, label: t('gallery'), path: "Gallery" },
    { icon: Briefcase, label: t('services'), path: "Services" },
  ];
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Premium Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-neutral-950 via-black to-neutral-950 border-r border-amber-500/20 z-50 transform transition-transform duration-300 lg:translate-x-0 shadow-2xl shadow-amber-500/5 backdrop-blur-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Luxury Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(217, 119, 6) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative flex flex-col h-full">
          {/* Premium Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-500/40 ring-2 ring-amber-400/20 group-hover:shadow-amber-500/60 group-hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent tracking-tight">Style</span>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Consultoria Premium</p>
              </div>
            </Link>
            <button 
              onClick={onClose}
              className="lg:hidden p-2.5 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-amber-600/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-amber-500/10"
            >
              <X className="w-5 h-5 text-amber-400" />
            </button>
          </div>
          
          {/* Premium Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10" 
                      : "text-neutral-300 hover:text-amber-400"
                  )}
                >
                  {/* Hover Background Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600 rounded-r-full" />
                  )}
                  
                  {/* Icon with glow effect */}
                  <div className="relative z-10">
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
                      !isActive && "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    )} />
                  </div>
                  
                  {/* Text */}
                  <span className="relative z-10 font-semibold tracking-wide">{item.label}</span>
                  
                  {/* Subtle border */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl border transition-colors duration-300",
                    isActive ? "border-amber-500/30" : "border-transparent group-hover:border-amber-500/20"
                  )} />
                </Link>
              );
            })}
          </nav>
          
          {/* Premium Footer */}
          <div className="p-4 border-t border-amber-500/20 bg-gradient-to-br from-transparent to-amber-500/5">
            <Link
              to={createPageUrl("Settings")}
              className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-neutral-400 hover:text-amber-400 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Settings className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-500 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="relative z-10 font-semibold tracking-wide">{t('settings')}</span>
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-amber-500/20 transition-colors duration-300" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}