import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles,
  ShoppingCart,
  Star
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from '@/components/shop/ProductCard';
import ShoppingCartPanel from '@/components/shop/ShoppingCartPanel';
import AIRecommendedProducts from '@/components/shop/AIRecommendedProducts';
import { motion } from 'framer-motion';

const categoryLabels = {
  blusa: 'Blusas',
  camisa: 'Camisas',
  vestido: 'Vestidos',
  calca: 'Calças',
  saia: 'Saias',
  jaqueta: 'Jaquetas',
  casaco: 'Casacos',
  sapato: 'Sapatos',
  acessorio: 'Acessórios',
  bolsa: 'Bolsas',
  outros: 'Outros'
};

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load client data if available
        if (userData?.user_type === 'client') {
          const clients = await base44.entities.Client.filter({ email: userData.email });
          if (clients[0]) setClient(clients[0]);
        }
      } catch (e) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date')
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.PartnerStore.filter({ is_active: true })
  });

  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-items', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      return await base44.entities.WardrobeItem.filter({ client_id: client.id });
    },
    enabled: !!client?.id
  });

  const { data: colorAnalysis } = useQuery({
    queryKey: ['color-analysis', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const analyses = await base44.entities.ColorAnalysisRequest.filter(
        { client_id: client.id, status: 'approved' },
        '-created_date'
      );
      return analyses[0] || null;
    },
    enabled: !!client?.id
  });

  const { data: styleQuiz } = useQuery({
    queryKey: ['style-quiz', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const quizzes = await base44.entities.StyleQuiz.filter(
        { client_id: client.id, status: 'approved' },
        '-created_date'
      );
      return quizzes[0] || null;
    },
    enabled: !!client?.id
  });

  const addToCart = (product, selectedSize, selectedColor) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.id === product.id && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor
      );
      
      if (existing) {
        return prev.map(item =>
          item.id === product.id && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { 
        ...product, 
        quantity: 1, 
        selectedSize, 
        selectedColor 
      }];
    });
    setCartOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSeason = selectedSeason === 'all' || 
                         product.seasons?.includes(selectedSeason) ||
                         (client?.season && product.seasons?.includes(client.season));
    const matchesStyle = selectedStyle === 'all' || product.styles?.includes(selectedStyle);
    
    return matchesSearch && matchesCategory && matchesSeason && matchesStyle;
  });

  // Smart recommendations based on client profile
  const recommendedProducts = client?.season || client?.style_preferences
    ? filteredProducts.filter(p => 
        (client.season && p.seasons?.includes(client.season)) ||
        (client.style_preferences && p.styles?.some(s => client.style_preferences.includes(s)))
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-rose-600 text-sm font-medium mb-4">
              <ShoppingBag className="w-4 h-4" />
              Loja Personalizada
            </div>
            <h1 className="text-3xl font-light text-gray-900">
              Sua <span className="font-semibold">Boutique Virtual</span>
            </h1>
            {client && (
              <p className="text-gray-600">
                Produtos selecionados para {client.season ? `seu estilo ${client.season}` : 'você'}
              </p>
            )}
          </div>
          
          <Button
            onClick={() => setCartOpen(true)}
            className="relative bg-gradient-to-r from-rose-500 to-pink-600"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrinho
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-purple-600 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Estação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Estações</SelectItem>
                  <SelectItem value="primavera_clara">Primavera Clara</SelectItem>
                  <SelectItem value="primavera_quente">Primavera Quente</SelectItem>
                  <SelectItem value="verao_claro">Verão Claro</SelectItem>
                  <SelectItem value="inverno_frio">Inverno Frio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Estilos</SelectItem>
                  <SelectItem value="classico">Clássico</SelectItem>
                  <SelectItem value="romantico">Romântico</SelectItem>
                  <SelectItem value="moderno">Moderno</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommended Pieces Section */}
        {client && wardrobeItems.length > 0 && colorAnalysis && styleQuiz && (
          <div className="mb-12">
            <AIRecommendedProducts
              clientId={client.id}
              clientData={client}
              wardrobeItems={wardrobeItems}
              colorAnalysis={colorAnalysis}
              styleQuiz={styleQuiz}
              products={products}
              onAddToCart={addToCart}
              stores={stores}
            />
          </div>
        )}

        {/* Classic Recommended Section */}
        {recommendedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Favoritos do Catálogo
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  stores={stores}
                  recommended
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Todos os Produtos
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  stores={stores}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        client={client}
      />
    </div>
  );
}