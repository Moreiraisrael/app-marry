import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, RotateCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ColorWheel() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [complementary, setComplementary] = useState(null);
  const [analogous, setAnalogous] = useState([]);
  const [triadic, setTriadic] = useState([]);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    drawColorWheel();
  }, [rotation]);

  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel with saturation rings
    for (let ring = 0; ring < 5; ring++) {
      const ringRadius = radius * (1 - ring * 0.18);
      const saturation = 100 - ring * 20;
      
      for (let angle = 0; angle < 360; angle++) {
        const startAngle = ((angle + rotation) * Math.PI) / 180;
        const endAngle = ((angle + 1 + rotation) * Math.PI) / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
        ctx.closePath();
        
        const hue = angle;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, 50%)`;
        ctx.fill();
      }
    }
    
    // Draw inner gray circle for value variations
    const innerRadius = radius * 0.1;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#888888');
    gradient.addColorStop(1, '#000000');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw selection marker if color is selected
    if (selectedColor) {
      const angle = (selectedColor.hue - rotation) * Math.PI / 180;
      const markerRadius = radius * 0.6;
      const x = centerX + markerRadius * Math.cos(angle);
      const y = centerY + markerRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 20;
    
    // Check if click is within the color wheel
    if (distance < radius && distance > radius * 0.1) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      angle = (angle + 360) % 360;
      
      const hue = (angle - rotation + 360) % 360;
      const saturationRing = Math.floor((1 - distance / radius) / 0.18);
      const saturation = 100 - saturationRing * 20;
      
      const color = {
        hue: Math.round(hue),
        saturation,
        lightness: 50,
        hex: hslToHex(hue, saturation, 50)
      };
      
      setSelectedColor(color);
      calculateHarmonies(color);
    }
  };

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const rgb = [255 * f(0), 255 * f(8), 255 * f(4)];
    return '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
  };

  const calculateHarmonies = (color) => {
    // Complementary (opposite)
    const compHue = (color.hue + 180) % 360;
    setComplementary({
      hue: compHue,
      hex: hslToHex(compHue, color.saturation, color.lightness)
    });
    
    // Analogous (adjacent colors)
    const analog = [
      { hue: (color.hue - 30 + 360) % 360 },
      { hue: (color.hue + 30) % 360 }
    ].map(c => ({
      ...c,
      hex: hslToHex(c.hue, color.saturation, color.lightness)
    }));
    setAnalogous(analog);
    
    // Triadic (120 degrees apart)
    const triad = [
      { hue: (color.hue + 120) % 360 },
      { hue: (color.hue + 240) % 360 }
    ].map(c => ({
      ...c,
      hex: hslToHex(c.hue, color.saturation, color.lightness)
    }));
    setTriadic(triad);
  };

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    toast.success('Cor copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Círculo Cromático Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Color Wheel Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                onClick={handleCanvasClick}
                className="cursor-crosshair rounded-lg shadow-xl"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setRotation((r) => (r - 15 + 360) % 360)}
              >
                <RotateCw className="w-4 h-4 mr-2 transform rotate-180" />
                Girar Esquerda
              </Button>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {rotation}°
              </Badge>
              <Button
                variant="outline"
                onClick={() => setRotation((r) => (r + 15) % 360)}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Girar Direita
              </Button>
            </div>

            {/* Selected Color Info */}
            {selectedColor && (
              <div className="w-full space-y-4 pt-4 border-t">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Main Color */}
                  <div>
                    <h4 className="font-semibold mb-2">Cor Selecionada</h4>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <div>
                        <p className="font-mono text-sm">{selectedColor.hex}</p>
                        <p className="text-xs text-gray-600">
                          HSL({selectedColor.hue}°, {selectedColor.saturation}%, {selectedColor.lightness}%)
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyColor(selectedColor.hex)}
                          className="mt-1"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Complementary */}
                  {complementary && (
                    <div>
                      <h4 className="font-semibold mb-2">Complementar</h4>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md"
                          style={{ backgroundColor: complementary.hex }}
                        />
                        <div>
                          <p className="font-mono text-sm">{complementary.hex}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyColor(complementary.hex)}
                            className="mt-1"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analogous Colors */}
                <div>
                  <h4 className="font-semibold mb-2">Cores Análogas</h4>
                  <div className="flex gap-3">
                    {analogous.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-md cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => copyColor(color.hex)}
                        />
                        <p className="font-mono text-xs">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Triadic Colors */}
                <div>
                  <h4 className="font-semibold mb-2">Cores Triádicas</h4>
                  <div className="flex gap-3">
                    {triadic.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-md cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => copyColor(color.hex)}
                        />
                        <p className="font-mono text-xs">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!selectedColor && (
              <p className="text-sm text-gray-500 text-center">
                Clique no círculo cromático para selecionar uma cor
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}