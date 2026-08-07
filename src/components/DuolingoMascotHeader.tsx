import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Heart, Sparkles } from 'lucide-react';
import { MascotAnimated, MascotState } from './MascotAnimated';
import duoPng from '../assets/images/duo_avatar_1779707455306.png';
import oscarPng from '../assets/images/oscar_bot_cartoon_1786094737765.jpg';
import lilyPng from '../assets/images/lily_bot_cartoon_1786094757281.jpg';
import zariPng from '../assets/images/zari_avatar_1779707508891.png';
import nopalPng from '../assets/images/nopal_mascot_1781082233948.png';
import chessCatSvg from '../assets/images/chesscat.svg';

interface DuolingoMascotHeaderProps {
  badgeText?: string;
  titleText: string;
  speechBubbleText: string | React.ReactNode;
  mascotType?: 'oscar' | 'duo' | 'junior' | 'lily' | 'nopal' | 'cat' | 'chesscat';
  mascotState?: MascotState;
  progressPercent?: number; // 0 to 100
  energyCount?: number;
  energyType?: 'zap' | 'heart';
  onClose?: () => void;
  className?: string;
}

const mascotImageMap: Record<string, string | undefined> = {
  duo: duoPng,
  oscar: oscarPng,
  lily: lilyPng,
  junior: zariPng,
  nopal: nopalPng,
  cat: undefined, // Uses CatMascotSvg by default
  chesscat: chessCatSvg,
};

export const DuolingoMascotHeader: React.FC<DuolingoMascotHeaderProps> = ({
  badgeText = 'KONSEP BARU',
  titleText,
  speechBubbleText,
  mascotType = 'cat',
  mascotState = 'idle',
  progressPercent = 50,
  energyCount = 24,
  energyType = 'heart',
  onClose,
  className = '',
}) => {
  const mascotImg = mascotImageMap[mascotType];

  return (
    <div className={`w-full bg-[#131f28] text-white rounded-3xl p-5 md:p-6 border border-[#243542] shadow-2xl ${className}`}>
      {/* 1. TOP NAV BAR */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-[#1c2c37] hover:bg-[#253947] border border-[#2c404f] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 shadow-xs"
          title="Tutup / Kembali"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Fluid Progress Bar */}
        <div className="flex-1 bg-[#1a2631] h-3.5 rounded-full overflow-hidden border border-[#2a3c4a] p-[1.5px] max-w-md mx-auto">
          <motion.div
            className="bg-gradient-to-r from-[#2da6f8] to-[#1cb0f6] h-full rounded-full shadow-[0_0_10px_rgba(28,176,246,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Energy / Hearts Indicator */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1c2c37] border border-[#2d4252] rounded-2xl shrink-0 shadow-xs">
          {energyType === 'zap' ? (
            <Zap className="w-4 h-4 text-[#ffb800] fill-[#ffb800] animate-pulse" />
          ) : (
            <Heart className="w-4 h-4 text-[#ff4b4b] fill-[#ff4b4b] animate-bounce" />
          )}
          <span className="font-extrabold text-xs tracking-wider text-slate-100">
            {energyCount}
          </span>
        </div>
      </div>

      {/* 2. SUB-HEADER BADGE & MAIN QUESTION TITLE */}
      <div className="space-y-1 mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#233543] border border-[#31485a] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#c084fc]">
          <Sparkles className="w-3 h-3 text-[#c084fc]" />
          <span>{badgeText}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-snug">
          {titleText}
        </h2>
      </div>

      {/* 3. MASCOT & SPEECH BUBBLE ROW */}
      <div className="flex flex-row items-center gap-2.5 sm:gap-4 my-2 w-full max-w-full">
        {/* Animated Mascot */}
        <div className="shrink-0 flex items-center justify-center">
          <MascotAnimated
            state={mascotState}
            imageSrc={mascotImg}
            useCatSvg={mascotType === 'cat'}
            size={mascotType === 'chesscat' ? 140 : 100}
            className="drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Duolingo Dark Speech Bubble */}
        <div className="relative flex-1 min-w-0 bg-[#1c2c38] border border-[#2c4354] p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl shadow-xl">
          {/* Speech Bubble Arrow pointing left toward mascot */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-r-[8px] border-r-[#1c2c38] border-b-[7px] border-b-transparent" />
          <div className="text-xs sm:text-sm md:text-base font-bold text-slate-100 leading-relaxed font-sans break-words">
            {typeof speechBubbleText === 'string' ? (
              <span>{speechBubbleText}</span>
            ) : (
              speechBubbleText
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
