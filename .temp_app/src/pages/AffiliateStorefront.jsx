import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  ExternalLink,
  Search,
  Sparkles,
  Star
} from 'lucide-react';

const categories = [
  { value: 'all', label: 'Todas' },
  { value: 'roupas', label: '👗 Roupas' },
  { value: 'acessorios', label: '👜 Acessórios' },
  { value: 'calcados', label: '👠 Calçados' },
  { value: 'maquiagem', label: '💄 Maquiagem' },
  { value: 'joias', label: '💍 Joias' },
  { value: 'outros', label: '✨ Outros' },
];

const categoryGradients = {
  roupas: 'from-pink-500 to-rose-600',
  acessorios: 'from-amber-500 to-orange-600',
  calcados: 'from-blue-500 to-indigo-600',
  maquiagem: 'from-purple-500 to-violet-600',
  joias: 'from-yellow-500 to-amber-600',
  outros: 'from-gray-500 to-slate-600',
};

const categoryBadge = {
  roupas: 'bg-pink-100 text-pink-700',
  acessorios: 'bg-amber-100 text-amber-700',
  calcados: 'bg-blue-100 text-blue-700',
  maquiagem: 'bg-purple-100 text-purple-700',
  joias: 'bg-yellow-100 text-yellow-700',
  outros: 'bg-gray-100 text-gray-700',
};

export default function AffiliateStorefront() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['partner-stores-public'],
    queryFn: () => base44.entities.PartnerStore.filter({ is_active: true }, '-created_date')
  });

  const filtered = stores.filter(s => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(217, 119, 6) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative px-6 py-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Lojas Selecionadas com Cuidado
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-light text-white mb-4"
          >
            Vitrine de{' '}
            <span className="font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Lojas Afiliadas
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg mb-8"
          >
            Marcas e lojas cuidadosamente selecionadas pela sua consultora
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-md mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <Input
              placeholder="Buscar lojas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 rounded-2xl text-base focus:border-amber-500/50"
            />
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 border border-white/10 text-neutral-400 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-64" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-300 mb-2">Nenhuma loja encontrada</h3>
              <p className="text-neutral-600">Tente outro filtro ou busca</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((store, index) => (
                <motion.a
                  key={store.id}
                  href={store.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/8 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
                >
                  {/* Logo Area */}
                  <div className={`relative h-40 flex items-center justify-center bg-gradient-to-br ${categoryGradients[store.category] || 'from-neutral-700 to-neutral-800'} opacity-90`}>
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="max-h-24 max-w-32 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="text-white/80 text-center">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-1" />
                        <span className="text-sm font-semibold">{store.name}</span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-base group-hover:text-amber-400 transition-colors">
                        {store.name}
                      </h3>
                      <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    </div>
                    {store.category && (
                      <Badge className={`${categoryBadge[store.category] || 'bg-gray-100 text-gray-700'} text-xs mb-2`}>
                        {categories.find(c => c.value === store.category)?.label?.replace(/^.*?\s/, '')}
                      </Badge>
                    )}
                    {store.description && (
                      <p className="text-neutral-500 text-xs line-clamp-2 mt-1">
                        {store.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-amber-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3" />
                      Visitar loja
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* Stats bar */}
          {!isLoading && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center text-neutral-600 text-sm"
            >
              {filtered.length} {filtered.length === 1 ? 'loja' : 'lojas'} disponível{filtered.length !== 1 ? 'is' : ''}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}