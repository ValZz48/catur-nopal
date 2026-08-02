import React from 'react';
import { MascotState } from './MascotAnimated';
import orangeCatNeutralSvg from '../assets/images/orange_cat_2.svg';
import orangeCatWrongSvg from '../assets/images/orange_cat_1.svg';
import celebrationCatCorrectSvg from '../assets/images/celebration_cat.svg';

interface CatMascotSvgProps {
  state: MascotState;
  size?: number;
  className?: string;
}

export const CatMascotSvg: React.FC<CatMascotSvgProps> = ({
  state,
  size = 100,
  className = '',
}) => {
  let src = orangeCatNeutralSvg;
  let alt = 'Orange Cat Neutral';

  if (state === 'wrong') {
    src = orangeCatWrongSvg;
    alt = 'Orange Cat Wrong';
  } else if (state === 'correct') {
    src = celebrationCatCorrectSvg;
    alt = 'Celebration Cat Correct';
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  );
};

