
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  isThinking?: boolean;
  volume?: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isThinking, volume = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const volumeRef = useRef(0);
  const smoothVolumeRef = useRef(0);

  // Sincronización de volumen con suavizado extra
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speed: number; angle: number; distance: number; color: string }[] = [];

    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: 0,
          y: 0,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.01 + 0.005,
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 60 + 40,
          color: Math.random() > 0.5 ? '#a78bfa' : '#c4b5fd'
        });
      }
    };

    const draw = () => {
      const { width, height } = canvas;
      const centerX = width / 2;
      const centerY = height / 2;

      // Suavizado del volumen para la animación
      smoothVolumeRef.current += (volumeRef.current - smoothVolumeRef.current) * 0.2;
      const v = smoothVolumeRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      // 1. Aura de Fondo (Glow Profundo)
      const auraRadius = (80 + v * 120);
      const auraGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraRadius);
      auraGlow.addColorStop(0, isActive ? `rgba(139, 92, 246, ${0.15 + v * 0.3})` : 'rgba(30, 27, 75, 0.05)');
      auraGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGlow;
      ctx.fillRect(0, 0, width, height);

      if (isActive) {
        // 2. Anillos de Frecuencia (Reactivos)
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const time = Date.now() / 1000;
          const rotation = i * (Math.PI / 3) + (time * 0.5);
          const scale = 1 + (i * 0.2) + (v * 0.5);
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(rotation);
          
          ctx.beginPath();
          ctx.lineWidth = 1 + (v * 2);
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.15 - i * 0.03 + v * 0.4})`;
          
          // Dibujamos un arco irregular que "vibra"
          const baseR = 70 * scale;
          for (let a = 0; a < Math.PI * 2; a += 0.2) {
            const noise = Math.sin(a * 5 + time * 10) * (v * 15);
            const r = baseR + noise;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        // 3. Núcleo Incandescente (Central)
        const coreRadius = 35 + (v * 25);
        const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
        coreGlow.addColorStop(0, '#ffffff');
        coreGlow.addColorStop(0.2, '#c4b5fd');
        coreGlow.addColorStop(0.5, '#8b5cf6');
        coreGlow.addColorStop(1, 'transparent');
        
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Brillo pulsante extra para el núcleo
        ctx.shadowBlur = 15 + v * 30;
        ctx.shadowColor = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 + v * 10, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Estado IDLE sutil
        const idleRadius = 30 + Math.sin(Date.now() / 1000) * 5;
        const idleGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, idleRadius);
        idleGlow.addColorStop(0, 'rgba(49, 46, 129, 0.4)');
        idleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = idleGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, idleRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Enjambre de Partículas (Neural Synapses)
      particles.forEach((p, i) => {
        const time = Date.now() / 1000;
        // La velocidad y distancia de las partículas aumenta con el volumen
        p.angle += p.speed * (1 + v * 8);
        const dynamicDist = p.distance * (1 + v * 1.5) + Math.sin(time + i) * 10;
        
        p.x = centerX + Math.cos(p.angle) * dynamicDist;
        p.y = centerY + Math.sin(p.angle) * dynamicDist;

        const size = p.size * (1 + v * 2);
        const opacity = (isActive ? 0.3 + v * 0.7 : 0.1);
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Estelas de luz cortas durante picos de voz
        if (isActive && v > 0.2) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const tailLen = 15 * v;
          ctx.lineTo(p.x - Math.cos(p.angle) * tailLen, p.y - Math.sin(p.angle) * tailLen);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    canvas.width = 500; // Lienzo más grande para evitar recortes
    canvas.height = 500;
    init();
    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  return (
    <div className="relative flex items-center justify-center overflow-visible w-64 h-64 md:w-80 md:h-80">
      {/* Contenedor con overflow-visible para que el brillo se extienda */}
      <canvas 
        ref={canvasRef} 
        className="absolute z-10 pointer-events-none transform scale-75 md:scale-100" 
        style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' }}
      />
      
      {/* Halo de luz ambiental reactivo por CSS */}
      <div className={`absolute w-40 h-40 md:w-56 md:h-56 rounded-full blur-[60px] transition-all duration-500 ${
        isActive ? 'bg-violet-600/20' : 'bg-transparent'
      }`} style={{ 
        transform: `scale(${1 + volume * 1.8})`,
        opacity: isActive ? 0.2 + volume * 0.8 : 0
      }}></div>
    </div>
  );
};

export default Visualizer;
