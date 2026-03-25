import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';

const ALL_SEASONS = [
  // Quentes
  { id: 'primavera_clara', name: 'Primavera Clara', emoji: '🌸', temp: 'quente', depth: 'clara', intensity: 'brilhante', season: 'primavera' },
  { id: 'primavera_quente', name: 'Primavera Quente', emoji: '🌼', temp: 'quente', depth: 'clara', intensity: 'suave', season: 'primavera' },
  { id: 'primavera_brilhante', name: 'Primavera Brilhante', emoji: '✨', temp: 'quente', depth: 'clara', intensity: 'media', season: 'primavera' },
  { id: 'outono_suave', name: 'Outono Suave', emoji: '🍂', temp: 'quente', depth: 'profunda', intensity: 'suave', season: 'outono' },
  { id: 'outono_quente', name: 'Outono Quente', emoji: '🔥', temp: 'quente', depth: 'profunda', intensity: 'media', season: 'outono' },
  { id: 'outono_profundo', name: 'Outono Profundo', emoji: '🌲', temp: 'quente', depth: 'profunda', intensity: 'brilhante', season: 'outono' },
  
  // Frios
  { id: 'verao_claro', name: 'Verão Claro', emoji: '🌊', temp: 'frio', depth: 'clara', intensity: 'suave', season: 'verao' },
  { id: 'verao_suave', name: 'Verão Suave', emoji: '☁️', temp: 'frio', depth: 'media', intensity: 'suave', season: 'verao' },
  { id: 'verao_frio', name: 'Verão Frio', emoji: '❄️', temp: 'frio', depth: 'media', intensity: 'brilhante', season: 'verao' },
  { id: 'inverno_brilhante', name: 'Inverno Brilhante', emoji: '💎', temp: 'frio', depth: 'profunda', intensity: 'brilhante', season: 'inverno' },
  { id: 'inverno_frio', name: 'Inverno Frio', emoji: '🧊', temp: 'frio', depth: 'profunda', intensity: 'media', season: 'inverno' },
  { id: 'inverno_profundo', name: 'Inverno Profundo', emoji: '🌙', temp: 'frio', depth: 'profunda', intensity: 'suave', season: 'inverno' }
];

export default function SeasonSelector({
  completedSteps,
  selectedTemperature,
  setSelectedTemperature,
  selectedDepth,
  setSelectedDepth,
  selectedIntensity,
  setSelectedIntensity
}) {
  // Filter seasons based on selections
  const visibleSeasons = useMemo(() => {
    return ALL_SEASONS.filter(season => {
      if (selectedTemperature && season.temp !== selectedTemperature) return false;
      if (selectedDepth && season.depth !== selectedDepth) return false;
      if (selectedIntensity && season.intensity !== selectedIntensity) return false;
      return true;
    });
  }, [selectedTemperature, selectedDepth, selectedIntensity]);

  const finalSeason = visibleSeasons.length === 1 ? visibleSeasons[0] : null;

  return (
    <div className="space-y-4">
      {/* Final Result */}
      {finalSeason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg p-6 shadow-lg"
        >
          <div className="text-center">
            <p className="text-sm text-amber-700 font-semibold mb-2">✨ RESULTADO FINAL</p>
            <div className="text-5xl mb-3">{finalSeason.emoji}</div>
            <h3 className="text-2xl font-bold text-amber-900 mb-1">{finalSeason.name}</h3>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Badge className="bg-amber-100 text-amber-800">{finalSeason.temp}</Badge>
              <Badge className="bg-orange-100 text-orange-800">{finalSeason.depth}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">{finalSeason.intensity}</Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Temperature */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">🌡️ TEMPERATURA</label>
            <div className="flex gap-2">
              <Button
                variant={selectedTemperature === 'quente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemperature(selectedTemperature === 'quente' ? null : 'quente')}
                className={selectedTemperature === 'quente' ? 'bg-orange-600 flex-1' : 'flex-1'}
              >
                Quente
              </Button>
              <Button
                variant={selectedTemperature === 'frio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemperature(selectedTemperature === 'frio' ? null : 'frio')}
                className={selectedTemperature === 'frio' ? 'bg-blue-600 flex-1' : 'flex-1'}
              >
                Frio
              </Button>
            </div>
          </div>

          {/* Depth */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">🎨 PROFUNDIDADE</label>
            <div className="flex gap-2">
              <Button
                variant={selectedDepth === 'clara' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepth(selectedDepth === 'clara' ? null : 'clara')}
                className={selectedDepth === 'clara' ? 'bg-yellow-600 flex-1' : 'flex-1'}
              >
                Clara
              </Button>
              <Button
                variant={selectedDepth === 'media' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepth(selectedDepth === 'media' ? null : 'media')}
                className={selectedDepth === 'media' ? 'bg-amber-600 flex-1' : 'flex-1'}
              >
                Média
              </Button>
              <Button
                variant={selectedDepth === 'profunda' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepth(selectedDepth === 'profunda' ? null : 'profunda')}
                className={selectedDepth === 'profunda' ? 'bg-gray-900 text-white flex-1' : 'flex-1'}
              >
                Profunda
              </Button>
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">✨ INTENSIDADE</label>
            <div className="flex gap-2">
              <Button
                variant={selectedIntensity === 'brilhante' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIntensity(selectedIntensity === 'brilhante' ? null : 'brilhante')}
                className={selectedIntensity === 'brilhante' ? 'bg-red-600 flex-1' : 'flex-1'}
              >
                Brilhante
              </Button>
              <Button
                variant={selectedIntensity === 'media' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIntensity(selectedIntensity === 'media' ? null : 'media')}
                className={selectedIntensity === 'media' ? 'bg-purple-600 flex-1' : 'flex-1'}
              >
                Média
              </Button>
              <Button
                variant={selectedIntensity === 'suave' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIntensity(selectedIntensity === 'suave' ? null : 'suave')}
                className={selectedIntensity === 'suave' ? 'bg-teal-600 flex-1' : 'flex-1'}
              >
                Suave
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedTemperature || selectedDepth || selectedIntensity) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTemperature(null);
                setSelectedDepth(null);
                setSelectedIntensity(null);
              }}
              className="w-full text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Seasons Grid */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            12 Estações
            <Badge variant="outline" className="ml-2">
              {visibleSeasons.length}/12
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {visibleSeasons.map((season, idx) => (
                <motion.div
                  key={season.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    finalSeason?.id === season.id
                      ? 'border-amber-400 bg-amber-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{season.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {season.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {season.temp} • {season.depth} • {season.intensity}
                        </p>
                      </div>
                    </div>
                    {finalSeason?.id === season.id && (
                      <span className="text-xl">✓</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {visibleSeasons.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">Nenhuma estação corresponde aos filtros selecionados</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemperature(null);
                  setSelectedDepth(null);
                  setSelectedIntensity(null);
                }}
                className="text-purple-600 mt-2"
              >
                Resetar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}