import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PixelMascotProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  isFlying?: boolean;
  actionOverride?: 'idle' | 'walk' | 'run' | 'wave' | 'backflip' | 'fly';
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
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');

  // Determine if it is day or night based on current time
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= 6 && hour < 18);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const messages = isDay ? [
    'Good morning! Ready to shine today? ☀️',
    'Keep up the bright work! ✨',
    'Have a radiant day! 🌻'
  ] : [
    'Good evening! Time to relax. 🌙',
    'Sweet dreams! 💫',
    'The stars are proud of you today. ✨'
  ];

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsClicked(true);

    if (!showBubble) {
      const text = messages[Math.floor(Math.random() * messages.length)];
      setBubbleText(text);
      setShowBubble(true);
    } else {
      setShowBubble(false);
    }
    setTimeout(() => setIsClicked(false), 800);
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${isHovered ? 'z-50' : 'z-10'} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: -65 }}
            exit={{ opacity: 0, scale: 0.8, y: -80 }}
            className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-[#2D3027] dark:text-stone-100 border border-[#FCD34D]/20 rounded-2xl p-3 text-xs font-semibold shadow-2xl w-48 text-center select-none z-50 leading-relaxed ring-1 ring-black/5"
          >
            <p className="text-[#2D3027] dark:text-stone-200 font-medium">
              {bubbleText}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-stone-900 border-r border-b border-[#FCD34D]/20 rotate-45 -translate-y-[8px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="w-full h-full relative flex items-center justify-center cursor-pointer"
        style={{ transformOrigin: '50% 50%' }}
        animate={
          isHovered ? {
            y: [0, -8, 0],
            scale: 1.1,
          } : isFlying || actionOverride === 'walk' || actionOverride === 'run' ? {
            y: [0, -5, 0],
          } : {
            y: [0, 2, 0],
          }
        }
        transition={
          isHovered ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
          : isFlying || actionOverride === 'walk' || actionOverride === 'run' ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {isDay ? (
          // --- SUN ---
          <svg viewBox="0 0 100 100" width="100%" height="100%" className="drop-shadow-lg">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '50% 50%' }}
            >
              <circle cx="50" cy="50" r="28" fill="#FBBF24" />
              {/* Sun Rays */}
              {Array.from({ length: 8 }).map((_, i) => (
                <rect 
                  key={i} 
                  x="46" 
                  y="5" 
                  width="8" 
                  height="12" 
                  rx="4" 
                  fill="#F59E0B" 
                  transform={`rotate(${i * 45} 50 50)`} 
                />
              ))}
            </motion.g>
            {/* Friendly Face */}
            <circle cx="40" cy="46" r="4" fill="#78350F" />
            <circle cx="60" cy="46" r="4" fill="#78350F" />
            {isHovered ? (
               <path d="M 44 54 Q 50 62 56 54" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : (
               <path d="M 44 54 Q 50 58 56 54" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            <circle cx="34" cy="52" r="3" fill="#FCD34D" opacity="0.6" />
            <circle cx="66" cy="52" r="3" fill="#FCD34D" opacity="0.6" />
          </svg>
        ) : (
          // --- MOON ---
          <svg viewBox="0 0 100 100" width="100%" height="100%" className="drop-shadow-lg">
            <motion.g
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: '50% 50%' }}
            >
              {/* Crescent Moon */}
              <path 
                d="M 65 20 A 35 35 0 1 0 75 80 A 40 40 0 0 1 65 20 Z" 
                fill="#FDF2F8" 
              />
              <path 
                d="M 65 20 A 35 35 0 1 0 75 80 A 40 40 0 0 1 65 20 Z" 
                fill="url(#moonGlow)" 
                opacity="0.5"
              />
              
              {/* Friendly Face */}
              {isHovered ? (
                <>
                  <path d="M 38 46 Q 42 42 46 46" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 52 48 Q 56 44 60 48" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 45 56 Q 50 62 54 55" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="42" cy="48" r="3.5" fill="#475569" />
                  <circle cx="56" cy="50" r="3.5" fill="#475569" />
                  <path d="M 45 58 Q 50 62 54 57" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              )}
              <circle cx="36" cy="54" r="3" fill="#FCE7F3" opacity="0.6" />
              <circle cx="62" cy="56" r="3" fill="#FCE7F3" opacity="0.6" />
            </motion.g>

            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#DBEAFE" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Floating Stars */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={20 + (i * 30)}
                cy={20 + (i * 15 % 40)}
                r="1.5"
                fill="#FDE047"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </svg>
        )}
      </motion.div>
    </div>
  );
};


