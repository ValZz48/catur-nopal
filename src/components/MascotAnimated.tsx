import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { CatMascotSvg } from './CatMascotSvg';

export type MascotState = 'idle' | 'correct' | 'wrong';

interface MascotAnimatedProps {
  state?: MascotState;
  imageSrc?: string;
  useCatSvg?: boolean;
  size?: number;
  className?: string;
  alt?: string;
}

export const MascotAnimated: React.FC<MascotAnimatedProps> = ({
  state = 'idle',
  imageSrc,
  useCatSvg = true,
  size = 100,
  className = '',
  alt = 'Mascot',
}) => {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    const runAnimation = async () => {
      if (state === 'correct') {
        await controls.start({
          y: [0, -20, 0],
          rotate: [0, 5, 0],
          x: 0,
          transition: { duration: 0.3, ease: 'easeOut' },
        });
        if (isMounted) {
          controls.start({
            y: [0, -8, 0],
            rotate: 0,
            x: 0,
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          });
        }
      } else if (state === 'wrong') {
        await controls.start({
          x: [0, -8, 8, -8, 8, 0],
          y: 0,
          rotate: 0,
          transition: { duration: 0.4, ease: 'easeInOut' },
        });
        if (isMounted) {
          controls.start({
            y: [0, -8, 0],
            rotate: 0,
            x: 0,
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          });
        }
      } else {
        // 'idle'
        controls.start({
          y: [0, -8, 0],
          x: 0,
          rotate: 0,
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        });
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, [state, controls]);

  return (
    <motion.div
      animate={controls}
      className={`relative inline-block select-none bg-transparent ${className}`}
      style={{ width: size, height: size, background: 'transparent' }}
    >
      {useCatSvg && !imageSrc ? (
        <CatMascotSvg state={state} size={size} className="w-full h-full object-contain" />
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}
          referrerPolicy="no-referrer"
        />
      )}
    </motion.div>
  );
};
