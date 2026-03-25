import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { RotateCw, Maximize2, User, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Avatar3D({ client, clothingItem, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Create simplified avatar based on client measurements
    const avatar = createAvatar(client, clothingItem);
    scene.add(avatar);
    avatarRef.current = avatar;

    // Grid floor
    const gridHelper = new THREE.GridHelper(5, 10, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (autoRotate && avatarRef.current) {
        avatarRef.current.rotation.y += 0.005;
        setRotation(avatarRef.current.rotation.y);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [client, clothingItem, autoRotate]);

  const createAvatar = (client, item) => {
    const group = new THREE.Group();

    // Scale factor based on height (assuming 170cm as base)
    const heightScale = (client?.height || 170) / 170;
    
    // Body proportions
    const bustRatio = (client?.bust || 90) / 90;
    const waistRatio = (client?.waist || 70) / 70;
    const hipRatio = (client?.hip || 95) / 95;

    // Skin tone color
    const skinColor = 0xffdbac;

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12 * heightScale, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.6 * heightScale;
    head.castShadow = true;
    group.add(head);

    // Hair (simple cap)
    const hairGeometry = new THREE.SphereGeometry(0.13 * heightScale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x3d2817 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.65 * heightScale;
    group.add(hair);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.05 * heightScale, 0.06 * heightScale, 0.15 * heightScale, 16);
    const neckMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 1.45 * heightScale;
    group.add(neck);

    // Torso - adjust based on item type
    const itemColor = getItemColor(item);
    const torsoHeight = 0.6 * heightScale;
    const torsoTop = 0.15 * bustRatio * heightScale;
    const torsoBottom = 0.13 * waistRatio * heightScale;
    
    const torsoGeometry = new THREE.CylinderGeometry(torsoTop, torsoBottom, torsoHeight, 16);
    const torsoMaterial = new THREE.MeshPhongMaterial({ 
      color: itemColor,
      shininess: 30
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1.05 * heightScale;
    torso.castShadow = true;
    group.add(torso);

    // Hips/Lower body
    const hipsGeometry = new THREE.CylinderGeometry(0.14 * hipRatio * heightScale, 0.12 * heightScale, 0.3 * heightScale, 16);
    const hipsMaterial = new THREE.MeshPhongMaterial({ 
      color: item?.category === 'calca' || item?.category === 'saia' ? itemColor : 0x2c3e50
    });
    const hips = new THREE.Mesh(hipsGeometry, hipsMaterial);
    hips.position.y = 0.6 * heightScale;
    hips.castShadow = true;
    group.add(hips);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.06 * heightScale, 0.05 * heightScale, 0.5 * heightScale, 16);
    const legMaterial = new THREE.MeshPhongMaterial({ 
      color: item?.category === 'calca' ? itemColor : 0x2c3e50
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.08 * heightScale, 0.25 * heightScale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.08 * heightScale, 0.25 * heightScale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.04 * heightScale, 0.035 * heightScale, 0.5 * heightScale, 16);
    const armMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.2 * heightScale, 1.05 * heightScale, 0);
    leftArm.rotation.z = 0.2;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.2 * heightScale, 1.05 * heightScale, 0);
    rightArm.rotation.z = -0.2;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Add dress/skirt overlay if applicable
    if (item?.category === 'vestido' || item?.category === 'saia') {
      const skirtGeometry = new THREE.CylinderGeometry(0.18 * heightScale, 0.25 * heightScale, 0.4 * heightScale, 16);
      const skirtMaterial = new THREE.MeshPhongMaterial({ 
        color: itemColor,
        side: THREE.DoubleSide
      });
      const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
      skirt.position.y = 0.65 * heightScale;
      group.add(skirt);
    }

    return group;
  };

  const getItemColor = (item) => {
    if (!item?.color) return 0x8b9dc3;
    
    const colorMap = {
      'preto': 0x1a1a1a,
      'branco': 0xffffff,
      'azul': 0x2c5aa0,
      'vermelho': 0xc41e3a,
      'verde': 0x2d5016,
      'amarelo': 0xffd700,
      'rosa': 0xff69b4,
      'roxo': 0x8b00ff,
      'marrom': 0x8b4513,
      'cinza': 0x808080,
      'bege': 0xf5f5dc,
      'laranja': 0xff8c00
    };

    const colorLower = item.color.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (colorLower.includes(key)) return value;
    }
    
    return 0x8b9dc3;
  };

  const handleManualRotate = () => {
    if (avatarRef.current) {
      setAutoRotate(false);
      avatarRef.current.rotation.y += Math.PI / 4;
      setRotation(avatarRef.current.rotation.y);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Prova Virtual 3D</h2>
                <p className="text-purple-100 text-sm">
                  Visualize como a peça ficará em você
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 text-xl"
            >
              ✕
            </Button>
          </div>

          {/* Item info */}
          {clothingItem && (
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
              <Badge className="bg-white/20 text-white">
                {clothingItem.category || 'Peça'}
              </Badge>
              {clothingItem.color && (
                <span className="text-sm">Cor: {clothingItem.color}</span>
              )}
            </div>
          )}
        </div>

        {/* 3D View */}
        <div className="relative bg-gradient-to-b from-gray-50 to-gray-100" style={{ height: '500px' }}>
          <div ref={mountRef} className="w-full h-full" />

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button
              onClick={handleManualRotate}
              variant="secondary"
              size="sm"
              className="shadow-lg"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Girar
            </Button>
            <Button
              onClick={() => setAutoRotate(!autoRotate)}
              variant="secondary"
              size="sm"
              className="shadow-lg"
            >
              {autoRotate ? 'Parar' : 'Auto-girar'}
            </Button>
          </div>

          {/* Measurements display */}
          {client && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold">Medidas</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                {client.height && <div>Altura: {client.height}cm</div>}
                {client.bust && <div>Busto: {client.bust}cm</div>}
                {client.waist && <div>Cintura: {client.waist}cm</div>}
                {client.hip && <div>Quadril: {client.hip}cm</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              💡 Use os controles para girar e visualizar todos os ângulos
            </div>
            <Button onClick={onClose} className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700">
              Fechar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}