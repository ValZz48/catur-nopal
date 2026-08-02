import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import magnifyingGlassesSvg from '../assets/images/magnifying_glasses.svg';
import orangeCatSvg from '../assets/images/orangeCat.svg';
import { Sparkles, Quote } from 'lucide-react';

interface PageLoadingScreenProps {
  isVisible: boolean;
}

const CHESS_QUOTES = [
  "\"Pion adalah jiwa dari permainan catur.\" — François-André Danican Philidor",
  "\"Setiap master catur dulunya adalah seorang pemula.\" — Irving Chernev",
  "\"Catur adalah pertarungan melawan kesalahan diri sendiri.\" — Johannes Zukertort",
  "\"Taktik adalah mengetahui apa yang harus dilakukan saat ada yang harus dilakukan.\" — Savielly Tartakower",
  "\"Langkah terbaik lahir dari analisis yang tenang dan teliti.\"",
  "\"Fokus dan kesabaran adalah kunci utama menguasai 64 petak catur.\"",
  "\"Belajar dari kekalahan adalah batu loncatan menuju kemenangan sejati.\"",
  "\"Strategi membutuhkan visi jangka panjang dan kesabaran ekstra.\"",
  "\"Dalam catur, rencana selalu lebih baik daripada tanpa rencana sama sekali.\" — Garry Kasparov",
  "\"Mengevaluasi posisi dengan cermat akan membuka celah taktis musuh.\""
];

export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({ isVisible }) => {
  const [svgState, setSvgState] = useState<number>(0); // 0 = magnifying_glasses, 1 = orangeCat
  const [quoteIdx, setQuoteIdx] = useState<number>(0);

  // Set selected SVG and quote when loading screen triggers
  useEffect(() => {
    if (!isVisible) return;

    setSvgState((prev) => (Math.random() > 0.5 ? 0 : prev === 0 ? 1 : 0));
    setQuoteIdx(Math.floor(Math.random() * CHESS_QUOTES.length));
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[99999] bg-[#0c161e]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center select-none font-sans"
      >
        {/* Background Ambient Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/15 via-blue-500/15 to-purple-500/15 blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 max-w-md w-full flex flex-col items-center">
          {/* TOP BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#182836] border border-[#2c4154] rounded-full text-xs font-black uppercase tracking-widest text-amber-400 mb-8 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Memuat Mode Game...</span>
          </div>

          {/* SVG DISPLAY AREA */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full bg-[#13202c] border border-[#253748] shadow-2xl flex items-center justify-center" />

            <motion.img
              src={svgState === 0 ? magnifyingGlassesSvg : orangeCatSvg}
              alt={svgState === 0 ? 'Magnifying Glasses' : 'Orange Cat'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: [0, -8, 0] 
              }}
              transition={{
                scale: { duration: 0.4, ease: 'easeOut' },
                opacity: { duration: 0.3 },
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative z-10 w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* PROGRESS BAR ANIMATION */}
          <div className="w-56 h-2 bg-[#172533] rounded-full overflow-hidden border border-[#283b4c] mb-8 p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            />
          </div>

          {/* ROTATING QUOTE CARD FOR THIS SESSION */}
          <div className="w-full bg-[#13212e]/90 border border-[#253748] p-5 rounded-2xl shadow-2xl relative">
            <Quote className="w-5 h-5 text-amber-400/40 absolute top-3 left-3" />
            <p className="text-xs md:text-sm font-bold text-slate-200 leading-relaxed italic px-3 pt-1">
              {CHESS_QUOTES[quoteIdx]}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
