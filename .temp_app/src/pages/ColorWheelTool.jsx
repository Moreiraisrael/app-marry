import React from 'react';
import ColorWheel from '@/components/tools/ColorWheel';
import { Palette } from 'lucide-react';

export default function ColorWheelTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md text-purple-600 text-sm font-medium mb-4">
            <Palette className="w-4 h-4" />
            Ferramenta de Cores
          </div>
          <h1 className="text-3xl font-light text-gray-900">
            <span className="font-semibold">Círculo Cromático</span> Digital
          </h1>
          <p className="text-gray-600 mt-2">
            Explore harmonias de cores e crie paletas personalizadas
          </p>
        </div>

        {/* Color Wheel Component */}
        <ColorWheel />

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Complementares</h3>
            <p className="text-sm text-gray-600">
              Cores opostas no círculo que criam alto contraste
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Análogas</h3>
            <p className="text-sm text-gray-600">
              Cores adjacentes que criam harmonia suave
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Triádicas</h3>
            <p className="text-sm text-gray-600">
              Três cores equidistantes com equilíbrio vibrante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}