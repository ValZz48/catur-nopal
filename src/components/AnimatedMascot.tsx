import React from 'react';
import { motion } from 'motion/react';

export type MascotExpression = 'neutral' | 'thinking' | 'happy' | 'worried';

interface AnimatedMascotProps {
  type?: 'oscar' | 'duo' | 'junior' | 'lily';
  expression?: MascotExpression;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  type = 'oscar',
  expression = 'neutral',
  size = 120,
  className = '',
  onClick,
}) => {
  // Animation variants for floating bob
  const floatAnimation = {
    animate: {
      y: [0, -5, 0],
      rotate: expression === 'happy' ? [0, 2, -2, 0] : [0, 1, -1, 0],
    },
    transition: {
      duration: expression === 'happy' ? 1.5 : 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Eye blink animation
  const blinkAnimation = {
    animate: {
      scaleY: [1, 1, 0.1, 1, 1],
    },
    transition: {
      duration: 3.5,
      repeat: Infinity,
      times: [0, 0.9, 0.93, 0.96, 1],
    },
  };

  // Mouth talking animation for thinking/speaking
  const mouthTalkAnimation = {
    animate: expression === 'thinking' ? {
      scaleY: [1, 1.4, 0.8, 1.2, 1],
    } : {},
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  if (type === 'duo') {
    return (
      <motion.div
        className={`relative inline-block cursor-pointer select-none ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
        {...floatAnimation}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          {/* Duo Owl Body */}
          <ellipse cx="60" cy="65" rx="42" ry="40" fill="#78C800" />
          <path d="M 25,35 Q 35,15 50,30 Q 30,30 25,35 Z" fill="#58A700" />
          <path d="M 95,35 Q 85,15 70,30 Q 90,30 95,35 Z" fill="#58A700" />
          
          {/* Belly */}
          <ellipse cx="60" cy="72" rx="28" ry="26" fill="#FFF4D1" />
          <path d="M 50,60 L 55,68 L 60,60 L 65,68 L 70,60" fill="none" stroke="#FFC800" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eye Glasses / Circles */}
          <circle cx="44" cy="50" r="15" fill="#FFFFFF" stroke="#58A700" strokeWidth="3" />
          <circle cx="76" cy="50" r="15" fill="#FFFFFF" stroke="#58A700" strokeWidth="3" />

          {/* Pupils with Blink */}
          <motion.g style={{ transformOrigin: '44px 50px' }} {...blinkAnimation}>
            {expression === 'happy' ? (
              <path d="M 37,52 Q 44,43 51,52" fill="none" stroke="#2B2B2B" strokeWidth="3.5" strokeLinecap="round" />
            ) : expression === 'worried' ? (
              <circle cx="44" cy="52" r="5" fill="#2B2B2B" />
            ) : (
              <circle cx="44" cy="50" r="6" fill="#2B2B2B" />
            )}
          </motion.g>

          <motion.g style={{ transformOrigin: '76px 50px' }} {...blinkAnimation}>
            {expression === 'happy' ? (
              <path d="M 69,52 Q 76,43 83,52" fill="none" stroke="#2B2B2B" strokeWidth="3.5" strokeLinecap="round" />
            ) : expression === 'worried' ? (
              <circle cx="76" cy="52" r="5" fill="#2B2B2B" />
            ) : (
              <circle cx="76" cy="50" r="6" fill="#2B2B2B" />
            )}
          </motion.g>

          {/* Beak */}
          <path d="M 54,56 L 66,56 L 60,67 Z" fill="#FF9600" />

          {/* Feet */}
          <ellipse cx="48" cy="103" rx="8" ry="4" fill="#FF9600" />
          <ellipse cx="72" cy="103" rx="8" ry="4" fill="#FF9600" />
        </svg>
      </motion.div>
    );
  }

  // DEFAULT: Oscar (The Mustache Maestro - as seen in Duolingo Chess screenshot!)
  return (
    <motion.div
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      {...floatAnimation}
    >
      <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-lg">
        {/* Hair Back */}
        <path d="M 30,65 Q 22,25 70,20 Q 118,25 110,65 Q 115,100 100,105 Q 70,110 40,105 Z" fill="#3D3A37" />
        
        {/* Hair Top Volume (Stylized Afro / Wavy) */}
        <path d="M 32,55 C 20,35 40,15 70,15 C 100,15 120,35 108,55 C 122,70 115,95 98,98 C 85,100 55,100 42,98 C 25,95 18,70 32,55 Z" fill="#423E3B" />

        {/* Face Shape */}
        <path d="M 40,55 C 40,42 100,42 100,55 L 100,85 C 100,102 40,102 40,85 Z" fill="#E89B74" />
        
        {/* Ears */}
        <ellipse cx="37" cy="68" rx="6" ry="8" fill="#D88A63" />
        <ellipse cx="103" cy="68" rx="6" ry="8" fill="#D88A63" />

        {/* Eyebrows */}
        {expression === 'worried' ? (
          <>
            <path d="M 46,50 Q 55,54 62,49" fill="none" stroke="#2D2825" strokeWidth="4" strokeLinecap="round" />
            <path d="M 78,49 Q 85,54 94,50" fill="none" stroke="#2D2825" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : expression === 'happy' ? (
          <>
            <path d="M 46,47 Q 54,42 62,47" fill="none" stroke="#2D2825" strokeWidth="4" strokeLinecap="round" />
            <path d="M 78,47 Q 86,42 94,47" fill="none" stroke="#2D2825" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 46,48 Q 54,46 62,49" fill="none" stroke="#2D2825" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 78,49 Q 86,46 94,48" fill="none" stroke="#2D2825" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}

        {/* Eyes with Blink */}
        <motion.g style={{ transformOrigin: '54px 58px' }} {...blinkAnimation}>
          {expression === 'happy' ? (
            <path d="M 48,60 Q 54,52 60,60" fill="none" stroke="#211E1C" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="54" cy="58" rx="6" ry="6.5" fill="#211E1C" />
              <circle cx="56" cy="56" r="2" fill="#FFFFFF" />
            </>
          )}
        </motion.g>

        <motion.g style={{ transformOrigin: '86px 58px' }} {...blinkAnimation}>
          {expression === 'happy' ? (
            <path d="M 80,60 Q 86,52 92,60" fill="none" stroke="#211E1C" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="86" cy="58" rx="6" ry="6.5" fill="#211E1C" />
              <circle cx="88" cy="56" r="2" fill="#FFFFFF" />
            </>
          )}
        </motion.g>

        {/* Nose */}
        <path d="M 67,61 Q 70,66 73,61" fill="none" stroke="#C77852" strokeWidth="3" strokeLinecap="round" />

        {/* Iconic Duolingo Oscar Mustache */}
        <path
          d="M 42,70 C 50,67 68,73 70,75 C 72,73 90,67 98,70 C 102,76 92,86 70,83 C 48,86 38,76 42,70 Z"
          fill="#312C28"
        />

        {/* Mouth / Chin beneath mustache */}
        <motion.g style={{ transformOrigin: '70px 84px' }} {...mouthTalkAnimation}>
          {expression === 'happy' ? (
            <path d="M 62,84 Q 70,91 78,84" fill="none" stroke="#A85732" strokeWidth="3" strokeLinecap="round" />
          ) : expression === 'worried' ? (
            <path d="M 63,88 Q 70,83 77,88" fill="none" stroke="#A85732" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path d="M 64,84 Q 70,87 76,84" fill="none" stroke="#A85732" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </motion.g>

        {/* Pink / Magenta Shirt & Hands folded (as in Duolingo Chess screenshot!) */}
        <path d="M 32,102 Q 70,92 108,102 L 115,135 L 25,135 Z" fill="#EC729C" />
        {/* Collar / Neck Trim */}
        <path d="M 58,100 L 70,112 L 82,100 Z" fill="#69D7A5" />

        {/* Folded Hands in front */}
        <ellipse cx="70" cy="120" rx="14" ry="9" fill="#E89B74" stroke="#D88A63" strokeWidth="2" />
        <path d="M 60,118 Q 70,123 80,118" fill="none" stroke="#C77852" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
};
