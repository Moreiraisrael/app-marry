import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Grid, List, Download, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  blusa: '👔',
  camisa: '👕',
  vestido: '👗',
  calca: '👖',
  saia: '🩱',
  jaqueta: '🧥',
  casaco: '🧥',
  sapato: '👟',
  acessorio: '✨',
  bolsa: '👜',
  outros: '📦'
};

export default function DigitalWardrobeVisualizer({ wardrobeItems, onDelete, onEdit }) {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');

  // Get unique colors
  const colors = ['all', ...new Set(wardrobeItems.map(item => item.color?.toLowerCase()).filter(Boolean))];
  const categories = ['all', ...new Set(wardrobeItems.map(item => item.category))];

  // Filter items
  const filteredItems = wardrobeItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const colorMatch = selectedColor === 'all' || item.color?.toLowerCase() === selectedColor;
    return categoryMatch && colorMatch;
  });

  // Stats
  const statsData = categories.slice(1).map(cat => ({
    category: cat,
    count: wardrobeItems.filter(i => i.category === cat).length
  }));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.slice(0, 4).map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-4">
                <p className="text-3xl mb-1">{categoryIcons[stat.category]}</p>
                <p className="text-2xl font-bold text-purple-600">{stat.count}</p>
                <p className="text-xs text-gray-500 capitalize">{stat.category}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & View Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtrar e Visualizar</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Todas' : cat} ({wardrobeItems.filter(i => selectedCategory === 'all' || i.category === selectedCategory).length})
                </Badge>
              ))}
            </div>
          </div>

          {colors.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Cor</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <Badge
                    key={color}
                    variant={selectedColor === color ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color === 'all' ? 'Todas' : color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Mostrando {filteredItems.length} de {wardrobeItems.length} peças
          </p>
        </CardContent>
      </Card>

      {/* Wardrobe Display */}
      {filteredItems.length === 0 ? (
        <Card className="border-0 shadow-lg text-center py-12">
          <CardContent>
            <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Nenhuma peça encontrada com esses filtros</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={item.photo}
                    alt={item.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-between p-2">
                    <Badge className="bg-white/90 text-gray-900 capitalize">
                      {categoryIcons[item.category]} {item.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  {item.color && (
                    <p className="text-xs text-gray-600 mb-2 capitalize">🎨 {item.color}</p>
                  )}
                  {item.subcategory && (
                    <p className="text-sm font-medium text-gray-900 mb-2">{item.subcategory}</p>
                  )}
                  <div className="flex gap-1">
                    {item.style_match && <Badge variant="outline" className="text-xs">Estilo ✓</Badge>}
                    {item.season_match && <Badge variant="outline" className="text-xs">Estação ✓</Badge>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={item.photo}
                    alt={item.category}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{categoryIcons[item.category]}</span>
                      <p className="font-semibold capitalize">{item.category}</p>
                      {item.subcategory && (
                        <span className="text-sm text-gray-600">• {item.subcategory}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.color && <Badge variant="outline" className="text-xs capitalize">🎨 {item.color}</Badge>}
                      {item.style_match && <Badge variant="outline" className="text-xs">Estilo ✓</Badge>}
                      {item.season_match && <Badge variant="outline" className="text-xs">Estação ✓</Badge>}
                    </div>
                    {item.ai_analysis && (
                      <p className="text-xs text-gray-600 line-clamp-1">{item.ai_analysis.substring(0, 60)}...</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}