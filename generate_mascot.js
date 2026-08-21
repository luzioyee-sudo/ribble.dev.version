const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PixelMascotProps {
  className?: string;
  size?: number; // Base visual size in px
  interactive?: boolean;
  isFlying?: boolean;
  actionOverride?: 'idle' | 'walk' | 'run' | 'wave' | 'backflip' | 'fly';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
  type: 'heart' | 'star' | 'sparkle';
}

export const PixelMascot: React.FC<PixelMascotProps> = ({
  className = '',
  size = 72,
  interactive = true,
  isFlying = false,
  actionOverride,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [selectedAction, setSelectedAction] = useState<'idle' | 'walk' | 'run' | 'wave' | 'backflip'>('idle');

  // Premium Brand color palette: Warm terracotta clay matching the original mascot exactly
  const color = '#AE5B34'; // Primary brand terracotta
  const shadowColor = '#8A3C1B'; // Rich dark sienna shadow
  const highlightColor = '#D27F59'; // Warm terracotta highlight
  const blushColor = '#FF5274'; // Vibrant rosy pink blush for extreme contrast and clarity

  const studyTips = [
    '¡Hola Mohamed! Ready to practice today? 🤸‍♂️',
    'Perfect 10/10 backflip! 🏆',
    'Let’s conquer today’s streak! 🚀',
    'Amazing job on the vocabulary practice! 📝',
    'Bonjour! Every word count is progress! ✨'
  ];

  // Derive the active animation state
  // Flying state maps to a specialized aerodynamic superhero pose.
  // Hovering temporarily overrides any current action to perform a beautiful, zero-separation 3D backflip!
  const currentAction = actionOverride || (isFlying ? 'fly' : (isHovered ? 'backflip' : selectedAction));

  // Spawn adorable stars & hearts when hovered (doing acrobatics)
  useEffect(() => {
    if (!interactive || !isHovered) return;

    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const types: ('star' | 'heart' | 'sparkle')[] = ['star', 'heart', 'sparkle'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const colors = ['#E28C8C', '#F5C453', '#FF9D9D', '#FCD34D'];

      setParticles((prev) => [
        ...prev.slice(-12), // Keep max 12 particles
        {
          id,
          x: -30 + Math.random() * 60,
          y: -40 - Math.random() * 40,
          scale: 0.7 + Math.random() * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: randomType,
        },
      ]);
    }, 300);

    return () => clearInterval(interval);
  }, [isHovered, interactive]);

  // Clean up old particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => Date.now() - p.id < 1500));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    setIsClicked(true);

    if (!showBubble) {
      const text = studyTips[Math.floor(Math.random() * studyTips.length)];
      setBubbleText(text);
      setShowBubble(true);
    } else {
      setShowBubble(false);
    }

    // Burst a circle of sparkles
    const burst: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: -40 + Math.random() * 80,
      y: -30 - Math.random() * 40,
      scale: 0.8 + Math.random() * 0.5,
      color: i % 2 === 0 ? '#E28C8C' : '#FCD34D',
      type: i % 2 === 0 ? 'star' : 'sparkle',
    }));
    setParticles((prev) => [...prev, ...burst]);

    setTimeout(() => setIsClicked(false), 800);
  };

  // --- EXACT 2D PIXEL MAPS FROM THE USER'S ORIGINAL DESIGN ---
  
  // Head & Torso Pixels
  const mainBodyPixels = [
    { x: 9, y: 3, type: 'H' }, { x: 10, y: 3, type: 'H' }, { x: 11, y: 3, type: 'H' }, { x: 12, y: 3, type: 'H' }, { x: 13, y: 3, type: 'B' }, { x: 14, y: 3, type: 'B' }, { x: 15, y: 3, type: 'S' },
    { x: 8, y: 4, type: 'H' }, { x: 9, y: 4, type: 'B' }, { x: 10, y: 4, type: 'B' }, { x: 11, y: 4, type: 'B' }, { x: 12, y: 4, type: 'B' }, { x: 13, y: 4, type: 'B' }, { x: 14, y: 4, type: 'B' }, { x: 15, y: 4, type: 'B' }, { x: 16, y: 4, type: 'S' },
    { x: 7, y: 5, type: 'H' }, { x: 8, y: 5, type: 'B' }, { x: 9, y: 5, type: 'B' }, { x: 10, y: 5, type: 'B' }, { x: 11, y: 5, type: 'B' }, { x: 12, y: 5, type: 'B' }, { x: 13, y: 5, type: 'B' }, { x: 14, y: 5, type: 'B' }, { x: 15, y: 5, type: 'B' }, { x: 16, y: 5, type: 'B' }, { x: 17, y: 5, type: 'S' },
    { x: 7, y: 6, type: 'H' }, { x: 8, y: 6, type: 'B' }, { x: 11, y: 6, type: 'B' }, { x: 12, y: 6, type: 'B' }, { x: 13, y: 6, type: 'B' }, { x: 14, y: 6, type: 'B' }, { x: 15, y: 6, type: 'B' }, { x: 18, y: 6, type: 'S' },
    { x: 6, y: 7, type: 'H' }, { x: 7, y: 7, type: 'B' }, { x: 8, y: 7, type: 'B' }, { x: 11, y: 7, type: 'B' }, { x: 12, y: 7, type: 'B' }, { x: 13, y: 7, type: 'B' }, { x: 14, y: 7, type: 'B' }, { x: 15, y: 7, type: 'B' }, { x: 18, y: 7, type: 'S' },
    { x: 6, y: 8, type: 'H' }, { x: 7, y: 8, type: 'B' }, { x: 9, y: 8, type: 'B' }, { x: 10, y: 8, type: 'B' }, { x: 14, y: 8, type: 'B' }, { x: 18, y: 8, type: 'S' },
    { x: 6, y: 9, type: 'H' }, { x: 7, y: 9, type: 'B' }, { x: 8, y: 9, type: 'B' }, { x: 9, y: 9, type: 'B' }, { x: 10, y: 9, type: 'B' }, { x: 14, y: 9, type: 'B' }, { x: 15, y: 9, type: 'B' }, { x: 18, y: 9, type: 'S' },
    { x: 6, y: 10, type: 'H' }, { x: 7, y: 10, type: 'B' }, { x: 8, y: 10, type: 'B' }, { x: 9, y: 10, type: 'B' }, { x: 10, y: 10, type: 'B' }, { x: 11, y: 10, type: 'B' }, { x: 12, y: 10, type: 'B' }, { x: 13, y: 10, type: 'B' }, { x: 14, y: 10, type: 'B' }, { x: 15, y: 10, type: 'B' }, { x: 16, y: 10, type: 'B' }, { x: 17, y: 10, type: 'B' }, { x: 18, y: 10, type: 'S' },
    { x: 6, y: 11, type: 'H' }, { x: 7, y: 11, type: 'B' }, { x: 8, y: 11, type: 'B' }, { x: 9, y: 11, type: 'B' }, { x: 10, y: 11, type: 'B' }, { x: 11, y: 11, type: 'B' }, { x: 12, y: 11, type: 'B' }, { x: 13, y: 11, type: 'B' }, { x: 14, y: 11, type: 'B' }, { x: 15, y: 11, type: 'B' }, { x: 16, y: 11, type: 'B' }, { x: 17, y: 11, type: 'B' }, { x: 18, y: 11, type: 'S' },
    { x: 6, y: 12, type: 'H' }, { x: 7, y: 12, type: 'B' }, { x: 8, y: 12, type: 'B' }, { x: 9, y: 12, type: 'B' }, { x: 10, y: 12, type: 'B' }, { x: 11, y: 12, type: 'B' }, { x: 12, y: 12, type: 'B' }, { x: 13, y: 12, type: 'B' }, { x: 14, y: 12, type: 'B' }, { x: 15, y: 12, type: 'B' }, { x: 16, y: 12, type: 'B' }, { x: 17, y: 12, type: 'B' }, { x: 18, y: 12, type: 'S' },
    { x: 6, y: 13, type: 'H' }, { x: 7, y: 13, type: 'B' }, { x: 8, y: 13, type: 'B' }, { x: 9, y: 13, type: 'B' }, { x: 10, y: 13, type: 'B' }, { x: 11, y: 13, type: 'B' }, { x: 12, y: 13, type: 'B' }, { x: 13, y: 13, type: 'B' }, { x: 14, y: 13, type: 'B' }, { x: 15, y: 13, type: 'B' }, { x: 16, y: 13, type: 'B' }, { x: 17, y: 13, type: 'B' }, { x: 18, y: 13, type: 'S' },
    { x: 7, y: 14, type: 'H' }, { x: 8, y: 14, type: 'B' }, { x: 9, y: 14, type: 'B' }, { x: 10, y: 14, type: 'B' }, { x: 11, y: 14, type: 'B' }, { x: 12, y: 14, type: 'B' }, { x: 13, y: 14, type: 'B' }, { x: 14, y: 14, type: 'B' }, { x: 15, y: 14, type: 'B' }, { x: 16, y: 14, type: 'B' }, { x: 17, y: 14, type: 'S' }, { x: 18, y: 14, type: 'S' },
    { x: 7, y: 15, type: 'H' }, { x: 8, y: 15, type: 'B' }, { x: 9, y: 15, type: 'B' }, { x: 10, y: 15, type: 'B' }, { x: 11, y: 15, type: 'B' }, { x: 12, y: 15, type: 'B' }, { x: 13, y: 15, type: 'B' }, { x: 14, y: 15, type: 'B' }, { x: 15, y: 15, type: 'B' }, { x: 16, y: 15, type: 'S' }, { x: 17, y: 15, type: 'S' },
    { x: 7, y: 16, type: 'H' }, { x: 8, y: 16, type: 'B' }, { x: 9, y: 16, type: 'B' }, { x: 10, y: 16, type: 'B' }, { x: 11, y: 16, type: 'B' }, { x: 12, y: 16, type: 'B' }, { x: 13, y: 16, type: 'B' }, { x: 14, y: 16, type: 'B' }, { x: 15, y: 16, type: 'S' }, { x: 16, y: 16, type: 'S' },
    { x: 8, y: 17, type: 'H' }, { x: 9, y: 17, type: 'B' }, { x: 10, y: 17, type: 'B' }, { x: 11, y: 17, type: 'B' }, { x: 12, y: 17, type: 'B' }, { x: 13, y: 17, type: 'B' }, { x: 14, y: 17, type: 'S' }, { x: 15, y: 17, type: 'S' },
  ];

  // Rosy cheeks blush pixels
  const cheeksPixels = [
    { x: 7, y: 8 },
    { x: 15, y: 8 }
  ];

  // Left eye: open black box with a bright white glint for extreme clarity
  const leftEyeOpen = [
    { x: 9, y: 6, color: '#FFFFFF' }, { x: 10, y: 6, color: '#000000' },
    { x: 9, y: 7, color: '#000000' }, { x: 10, y: 7, color: '#000000' }
  ];

  // Right eye: open black box with a bright white glint for extreme clarity
  const rightEyeOpen = [
    { x: 16, y: 6, color: '#FFFFFF' }, { x: 17, y: 6, color: '#000000' },
    { x: 16, y: 7, color: '#000000' }, { x: 17, y: 7, color: '#000000' }
  ];

  // Crooked white mouth with drip
  const mouthPixels = [
    { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
    { x: 13, y: 9 }, { x: 14, y: 9 }
  ];

  // Left Arm (Dangling on the left cols 4-6)
  const leftArmPixels = [
    { x: 4, y: 11, type: 'H' }, { x: 5, y: 11, type: 'B' },
    { x: 4, y: 12, type: 'H' }, { x: 5, y: 12, type: 'B' },
    { x: 4, y: 13, type: 'H' }, { x: 5, y: 13, type: 'B' },
    { x: 5, y: 14, type: 'S' },
  ];

  // Right Arm pixels (Waving arm attached around 18, 11)
  const rightArmPixels = [
    { dx: 0, dy: 0, type: 'H' }, { dx: 1, dy: 0, type: 'B' }, { dx: 2, dy: -1, type: 'B' },
    { dx: 0, dy: 1, type: 'B' }, { dx: 1, dy: 1, type: 'B' }, { dx: 2, dy: 0, type: 'B' }, { dx: 3, dy: -1, type: 'B' },
    { dx: 1, dy: 2, type: 'B' }, { dx: 2, dy: 1, type: 'B' }, { dx: 3, dy: 0, type: 'B' }, { dx: 4, dy: -1, type: 'S' },
    { dx: 2, dy: 2, type: 'S' }, { dx: 3, dy: 1, type: 'S' }, { dx: 4, dy: 0, type: 'S' },
    { dx: 3, dy: -2, type: 'H' }, { dx: 4, dy: -2, type: 'S' }
  ];

  // Left Foot
  const leftLegPixels = [
    { x: 8, y: 18, type: 'H' }, { x: 9, y: 18, type: 'B' }, { x: 10, y: 18, type: 'S' },
    { x: 8, y: 19, type: 'B' }, { x: 9, y: 19, type: 'S' }, { x: 10, y: 19, type: 'S' },
  ];
  
  // Right Foot
  const rightLegPixels = [
    { x: 13, y: 18, type: 'H' }, { x: 14, y: 18, type: 'B' }, { x: 15, y: 18, type: 'S' },
    { x: 13, y: 19, type: 'B' }, { x: 14, y: 19, type: 'S' }, { x: 15, y: 19, type: 'S' },
  ];

  // --- 3D RENDERING SYSTEM ---
  const renderBodySlice = (depth: number, lightTint: 'shadow' | 'normal' | 'highlight') => (
    <svg 
      viewBox="0 0 24 24" 
      className="absolute inset-0 w-full h-full" 
      style={{ transform: \`translateZ(\${depth}px)\` }} 
      shapeRendering="crispEdges"
    >
      {mainBodyPixels.map((p, idx) => {
        let fillColor = color;
        if (p.type === 'H') fillColor = highlightColor;
        if (p.type === 'S') fillColor = shadowColor;

        if (lightTint === 'shadow') fillColor = shadowColor;
        if (lightTint === 'highlight') fillColor = highlightColor;

        return (
          <rect
            key={\`body-slice-\${idx}\`}
            x={p.x}
            y={p.y}
            width={1.05}
            height={1.05}
            fill={fillColor}
          />
        );
      })}
    </svg>
  );

  const renderFaceSlice = (depth: number) => (
    <svg 
      viewBox="0 0 24 24" 
      className="absolute inset-0 w-full h-full" 
      style={{ transform: \`translateZ(\${depth}px)\` }} 
      shapeRendering="crispEdges"
    >
      {cheeksPixels.map((p, idx) => (
        <rect
          key={\`cheek-\${idx}\`}
          x={p.x}
          y={p.y}
          width={1.05}
          height={1.05}
          fill={blushColor}
        />
      ))}

      {leftEyeOpen.map((p, idx) => (
        <rect
          key={\`left-eye-\${idx}\`}
          x={p.x}
          y={p.y}
          width={1.05}
          height={1.05}
          fill={p.color || '#000000'}
        />
      ))}

      {rightEyeOpen.map((p, idx) => (
        <rect
          key={\`right-eye-\${idx}\`}
          x={p.x}
          y={p.y}
          width={1.05}
          height={1.05}
          fill={p.color || '#000000'}
        />
      ))}

      {mouthPixels.map((p, idx) => (
        <rect
          key={\`mouth-\${idx}\`}
          x={p.x}
          y={p.y}
          width={1.05}
          height={1.05}
          fill="#FFFFFF"
        />
      ))}
    </svg>
  );

  const renderLeftArm3D = () => (
    <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg 
          key={\`la-\${i}\`} 
          viewBox="0 0 24 24" 
          className="absolute inset-0 w-full h-full" 
          style={{ transform: \`translateZ(\${-1.5 + i * 1}px)\` }} 
          shapeRendering="crispEdges"
        >
          {leftArmPixels.map((p, idx) => {
            let fillColor = color;
            if (p.type === 'H') fillColor = highlightColor;
            if (p.type === 'S') fillColor = shadowColor;

            if (i === 0) fillColor = shadowColor;
            if (i === 3) fillColor = highlightColor;

            return <rect key={\`l-arm-\${idx}\`} x={p.x} y={p.y} width={1.05} height={1.05} fill={fillColor} />;
          })}
        </svg>
      ))}
    </div>
  );

  const renderRightArm3D = () => (
    <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg 
          key={\`ra-\${i}\`} 
          viewBox="0 0 24 24" 
          className="absolute inset-0 w-full h-full" 
          style={{ transform: \`translateZ(\${-1.5 + i * 1}px)\` }} 
          shapeRendering="crispEdges"
        >
          {rightArmPixels.map((p, idx) => {
            let fillColor = color;
            if (p.type === 'H') fillColor = highlightColor;
            if (p.type === 'S') fillColor = shadowColor;

            if (i === 0) fillColor = shadowColor;
            if (i === 3) fillColor = highlightColor;

            return <rect key={\`r-arm-\${idx}\`} x={18 + p.dx} y={11 + p.dy} width={1.05} height={1.05} fill={fillColor} />;
          })}
        </svg>
      ))}
    </div>
  );

  const renderLeftLeg3D = () => (
    <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg 
          key={\`ll-\${i}\`} 
          viewBox="0 0 24 24" 
          className="absolute inset-0 w-full h-full" 
          style={{ transform: \`translateZ(\${-1.5 + i * 1}px)\` }} 
          shapeRendering="crispEdges"
        >
          {leftLegPixels.map((p, idx) => {
            let fillColor = color;
            if (p.type === 'H') fillColor = highlightColor;
            if (p.type === 'S') fillColor = shadowColor;

            if (i === 0) fillColor = shadowColor;
            if (i === 3) fillColor = highlightColor;

            return <rect key={\`l-leg-\${idx}\`} x={p.x} y={p.y} width={1.05} height={1.05} fill={fillColor} />;
          })}
        </svg>
      ))}
    </div>
  );

  const renderRightLeg3D = () => (
    <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg 
          key={\`rl-\${i}\`} 
          viewBox="0 0 24 24" 
          className="absolute inset-0 w-full h-full" 
          style={{ transform: \`translateZ(\${-1.5 + i * 1}px)\` }} 
          shapeRendering="crispEdges"
        >
          {rightLegPixels.map((p, idx) => {
            let fillColor = color;
            if (p.type === 'H') fillColor = highlightColor;
            if (p.type === 'S') fillColor = shadowColor;

            if (i === 0) fillColor = shadowColor;
            if (i === 3) fillColor = highlightColor;

            return <rect key={\`r-leg-\${idx}\`} x={p.x} y={p.y} width={1.05} height={1.05} fill={fillColor} />;
          })}
        </svg>
      ))}
    </div>
  );

  return (
    <div 
      className={\`relative inline-flex items-center justify-center \${isHovered ? 'z-50' : 'z-10'} \${className}\`}
      style={{ 
        width: size, 
        height: size,
        perspective: '140px', // Creates real 3D depth perspective for the stacked layers
        imageRendering: 'pixelated' as any,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Speech bubble: modern glassmorphic action selector panel */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: -65 }}
            exit={{ opacity: 0, scale: 0.8, y: -80 }}
            className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-[#2D3027] dark:text-stone-100 border border-[#AE5B34]/20 rounded-2xl p-3 text-xs font-semibold shadow-2xl w-56 text-center select-none z-50 leading-relaxed ring-1 ring-black/5"
          >
            <p className="mb-2.5 text-[#2D3027] dark:text-stone-200 font-medium">
              {bubbleText}
            </p>
            
            {/* Elegant action selector buttons with micro-interactions */}
            <div className="flex items-center justify-between gap-1 border-t border-[#AE5B34]/10 pt-2">
              {[
                { id: 'idle', icon: '🧘', label: 'Idle' },
                { id: 'walk', icon: '🚶', label: 'Walk' },
                { id: 'run', icon: '🏃', label: 'Run' },
                { id: 'wave', icon: '👋', label: 'Wave' },
                { id: 'backflip', icon: '🤸', label: 'Flip' },
              ].map((act) => {
                const isCurrent = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    title={act.label}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dismissing bubble when selecting action
                      setSelectedAction(act.id as any);
                      const actionResponses: Record<string, string> = {
                        idle: "Relaxing with you! 🧘",
                        walk: "Taking a nice stroll! 🚶",
                        run: "Sprint time! Let's study! 🏃",
                        wave: "Hi Mohamed! Happy coding! 👋",
                        backflip: "Check out this acrobatics! 🤸",
                      };
                      setBubbleText(actionResponses[act.id]);
                    }}
                    className={\`p-1.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center cursor-pointer \${
                      isCurrent 
                        ? 'bg-[#AE5B34] text-white shadow-md scale-110' 
                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 hover:scale-105'
                    }\`}
                  >
                    {act.icon}
                  </button>
                );
              })}
            </div>

            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-stone-900 border-r border-b border-[#AE5B34]/20 rotate-45 -translate-y-[8px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              opacity: 1, 
              scale: 0 
            }}
            animate={{ 
              y: p.y - 100, 
              x: p.x + (Math.sin(p.id) * 25), 
              opacity: 0, 
              scale: p.scale 
            }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2"
            style={{ color: p.color }}
          >
            {p.type === 'heart' ? (
              <svg width="12" height="12" viewBox="0 0 8 8" shapeRendering="crispEdges">
                <path d="M1,1 h2 v1 h-2 z M5,1 h2 v1 h-2 z M0,2 h8 v2 h-8 z M1,4 h6 v1 h-6 z M2,5 h4 v1 h-4 z M3,6 h2 v1 h-2 z" fill="currentColor" />
              </svg>
            ) : p.type === 'star' ? (
              <svg width="10" height="10" viewBox="0 0 5 5" shapeRendering="crispEdges">
                <path d="M2,0 h1 v1 h-1 z M1,1 h3 v1 h-3 z M0,2 h5 v1 h-5 z M1,3 h3 v1 h-3 z M2,4 h1 v1 h-1 z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 3 3" shapeRendering="crispEdges">
                <path d="M1,0 h1 v1 h-1 z M0,1 h3 v1 h-3 z M1,2 h1 v1 h-1 z" fill="currentColor" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      {/* 3D Volumetric Rig Stack - mathematically perfected, 100% attached limbs */}
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%', // Centered backflips perfectly in-place!
        }}
        animate={
          currentAction === 'fly' ? {
            scale: 1.15,
            y: [0, -5, 0, -5, 0], // Aerodynamic smooth rising/falling bobs
            rotateX: 42, // Tilts aggressively forward into flight path
            rotateY: [-15, 15, -15], // Banks left-to-right naturally
            rotateZ: [-12, 12, -12], // Physical roll aligned to banks
          } : currentAction === 'backflip' ? {
            scale: 1.25,
            y: [0, 4, -18, -20, -14, 2, 0], // Center-locked vertical backflip jump arc
            rotateX: [0, 10, -135, -225, -360, -360, -360], // Perfectly centered physical 3D backflip
            rotateY: [0, 0, 0, 0, 0, 0, 0],
            scaleY: [1, 0.72, 1.25, 1.1, 0.95, 0.72, 1], // Smooth squash and stretch
            scaleX: [1, 1.22, 0.8, 0.95, 1.05, 1.22, 1],
          } : currentAction === 'walk' ? {
            scale: 1.05,
            y: [0, -2, 0, -2, 0], // Walking bobs
            rotateY: [-10, 10, -10], // Show off beautiful 3D side voxel depth while walking
            rotateX: [4, 6, 4], // Slight forward lean
          } : currentAction === 'run' ? {
            scale: 1.1,
            y: [0, -4, 0, -4, 0], // Faster running bobs
            rotateY: [-5, 5, -5],
            rotateX: [12, 16, 12], // Deeper forward lean for running speed
          } : currentAction === 'wave' ? {
            scale: 1.08,
            y: [0, -1.5, 0],
            rotateY: [-8, 8, -8],
            rotateX: [-2, 2, -2],
          } : { // 'idle'
            scale: 1,
            y: [0, 1.2, 0], // Delicate, relaxing breath bobs
            rotateY: [-12, 12, -12], // Seamless organic 3D rotation showing off depth
            rotateX: [-4, 4, -4],
          }
        }
        transition={
          currentAction === 'fly' ? {
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          } : currentAction === 'backflip' ? {
            duration: 1.5,
            ease: "easeInOut",
          } : currentAction === 'walk' ? {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          } : currentAction === 'run' ? {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          } : currentAction === 'wave' ? {
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          } : {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }
        }
      >

        {/* PHYSICAL 3D CONTACT FLOOR SHADOW */}
        <motion.div
          className="absolute left-1/2 bottom-[-2px] -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: '24px',
            height: '4px',
            background: 'rgba(0,0,0,0.16)',
            transform: 'translateZ(-10px)',
          }}
          animate={currentAction === 'backflip' ? {
            scale: [1, 1.2, 0.3, 0.2, 0.6, 1.1, 1],
            opacity: [0.8, 0.9, 0.1, 0.05, 0.4, 0.85, 0.8],
          } : currentAction === 'fly' ? {
            scale: [0.7, 0.9, 0.7],
            opacity: [0.3, 0.4, 0.3],
          } : {
            scale: [0.95, 1.05, 0.95],
            opacity: [0.8, 0.9, 0.8],
          }}
          transition={currentAction === 'backflip' ? {
            duration: 1.5,
            ease: "easeInOut",
          } : currentAction === 'fly' ? {
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          } : {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 1. LAYERED 3D CODES: Exact shape and pixel map stacked sequentially along Z-axis */}
        <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          {renderBodySlice(-5, 'shadow')}
          {renderBodySlice(-4, 'shadow')}
          {renderBodySlice(-3, 'normal')}
          {renderBodySlice(-2, 'normal')}
          {renderBodySlice(-1, 'normal')}
          {renderBodySlice(0, 'normal')}
          {renderBodySlice(1, 'normal')}
          {renderBodySlice(2, 'normal')}
          {renderBodySlice(3, 'highlight')}
          {renderBodySlice(4, 'highlight')}
          {renderFaceSlice(4.5)}
        </div>

        {/* 2. RIGGED LIMBS - Coordinated swing timing, attached properly in 3D depth */}

        {/* LEFT ARM JOINT */}
        <motion.div
          className="absolute inset-0 w-full h-full block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: '20.83% 45.83%', // Perfect shoulder coordinate
          }}
          animate={
            currentAction === 'fly' ? {
              rotateZ: 42, // Tucked tight flat against body core for aerodynamics
              rotateX: 25,
            } : currentAction === 'backflip' ? {
              rotateZ: [0, 60, 130, 130, 40, 0, 0], // Tucking arms tight
              rotateX: 0,
            } : currentAction === 'walk' ? {
              rotateZ: [-25, 25, -25], // Swings forward and backward in 2D plane
              rotateX: 0,
            } : currentAction === 'run' ? {
              rotateZ: [-45, 45, -45], // High intensity swing
              rotateX: 0,
            } : currentAction === 'wave' ? {
              rotateZ: [5, 12, 5],
              rotateX: 0,
            } : {
              rotateZ: [3, -3, 3], // Gentle breathing sway
              rotateX: 0,
            }
          }
          transition={
            currentAction === 'fly' ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'backflip' ? { duration: 1.5, ease: "easeInOut" } :
            currentAction === 'walk' ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'run' ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'wave' ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } :
            { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {renderLeftArm3D()}
        </motion.div>

        {/* RIGHT ARM JOINT */}
        <motion.div
          className="absolute inset-0 w-full h-full block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: '75% 45.83%', // Perfect shoulder coordinate
          }}
          animate={
            currentAction === 'fly' ? {
              rotateZ: -42, // Tucked tight flat against body core for aerodynamics
              rotateX: 25,
            } : currentAction === 'backflip' ? {
              rotateZ: [0, -60, -130, -130, -40, 0, 0],
              rotateX: 0,
            } : currentAction === 'walk' ? {
              rotateZ: [25, -25, 25], // Opposite phase swing
              rotateX: 0,
            } : currentAction === 'run' ? {
              rotateZ: [45, -45, 45], // Opposite intensity run swing
              rotateX: 0,
            } : currentAction === 'wave' ? {
              rotateZ: [-40, -100, -50, -100, -50, -100, -40], // Fast, continuous waving in 2D plane
              rotateX: 0,
            } : {
              rotateZ: [-3, 3, -3],
              rotateX: 0,
            }
          }
          transition={
            currentAction === 'fly' ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'backflip' ? { duration: 1.5, ease: "easeInOut" } :
            currentAction === 'walk' ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'run' ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'wave' ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } :
            { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {renderRightArm3D()}
        </motion.div>

        {/* LEFT LEG JOINT */}
        <motion.div
          className="absolute inset-0 w-full h-full block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: '39.58% 72.92%', // Perfect hip coordinate
          }}
          animate={
            currentAction === 'fly' ? {
              rotateZ: -8, // Swept backward elegantly
              rotateX: -20,
            } : currentAction === 'backflip' ? {
              rotateZ: [0, -35, -85, -85, -25, 0, 0], // Tucking legs
              rotateX: 0,
            } : currentAction === 'walk' ? {
              rotateZ: [22, -22, 22], // Alternating leg strides
              rotateX: 0,
            } : currentAction === 'run' ? {
              rotateZ: [38, -38, 38], // Running stride
              rotateX: 0,
            } : currentAction === 'wave' ? {
              rotateZ: [0, 2, -2, 0],
              rotateX: 0,
            } : {
              rotateZ: [0, 1.5, -1.5, 0],
              rotateX: 0,
            }
          }
          transition={
            currentAction === 'fly' ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'backflip' ? { duration: 1.5, ease: "easeInOut" } :
            currentAction === 'walk' ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'run' ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'wave' ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } :
            { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {renderLeftLeg3D()}
        </motion.div>

        {/* RIGHT LEG JOINT */}
        <motion.div
          className="absolute inset-0 w-full h-full block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: '60.42% 72.92%', // Perfect hip coordinate
          }}
          animate={
            currentAction === 'fly' ? {
              rotateZ: 8, // Swept backward elegantly
              rotateX: -20,
            } : currentAction === 'backflip' ? {
              rotateZ: [0, 35, 85, 85, 20, 0, 0],
              rotateX: 0,
            } : currentAction === 'walk' ? {
              rotateZ: [-22, 22, -22], // Opposite leg strides
              rotateX: 0,
            } : currentAction === 'run' ? {
              rotateZ: [-38, 38, -38],
              rotateX: 0,
            } : currentAction === 'wave' ? {
              rotateZ: [0, -2, 2, 0],
              rotateX: 0,
            } : {
              rotateZ: [0, -1.5, 1.5, 0],
              rotateX: 0,
            }
          }
          transition={
            currentAction === 'fly' ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'backflip' ? { duration: 1.5, ease: "easeInOut" } :
            currentAction === 'walk' ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'run' ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } :
            currentAction === 'wave' ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } :
            { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {renderRightLeg3D()}
        </motion.div>

      </motion.div>
    </div>
  );
};
`
fs.writeFileSync('/workspace/src/components/PixelMascot.tsx', code);
