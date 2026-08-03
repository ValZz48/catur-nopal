import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Share2, Zap, Target, Clock } from 'lucide-react';
import coolCatSvg from '../assets/images/cool cat.svg';
import coolCatUnderscoreSvg from '../assets/images/cool_cat.svg';

interface LaporanPembelajaranProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  comboCount: number;
  xpEarned: number;
  elapsedSeconds: number;
  onClaimXp: () => void;
  onShare?: () => void;
}

export const LaporanPembelajaranModal: React.FC<LaporanPembelajaranProps> = ({
  isOpen,
  score,
  totalQuestions,
  comboCount,
  xpEarned,
  elapsedSeconds,
  onClaimXp,
  onShare,
}) => {
  const MASCOT_SOURCES = [
    coolCatSvg,
    coolCatUnderscoreSvg,
    '/cool%20cat.svg',
    '/cool_cat.svg',
    '/cool cat.svg',
    '/Cool%20Cat.svg',
    '/Cool_Cat.svg',
  ];

  const [mascotIdx, setMascotIdx] = React.useState(0);

  if (!isOpen) return null;

  // Format seconds into MM:SS (e.g. 109 -> "1:49")
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-[#0c1722]/98 backdrop-blur-lg flex flex-col items-center justify-between p-6 text-white text-center font-sans select-none overflow-y-auto">
        {/* Top Space */}
        <div className="pt-2" />

        {/* CENTER CONTENT */}
        <div className="w-full max-w-md my-auto flex flex-col items-center space-y-6">
          {/* MASCOT WITH SPARKLING STARS */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            {/* Sparkle Icons Positioned Around Cat */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 right-4 text-cyan-300"
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 0.7, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 left-2 text-sky-200"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-4 text-amber-300"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>

            {/* Mascot Image with Float Motion */}
            <motion.img
              src={MASCOT_SOURCES[mascotIdx] || coolCatSvg || '/cool_cat.svg'}
              alt="Mascot Cool Cat"
              onError={() => {
                setMascotIdx((prev) => (prev + 1) % MASCOT_SOURCES.length);
              }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
              transition={{
                scale: { duration: 0.4, ease: 'backOut' },
                y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* HEADINGS */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-[#1cb0f6] tracking-tight uppercase leading-snug">
              Laporan Pembelajaran Catur
            </h2>
            <div className="inline-flex items-center gap-2 bg-[#14222e] border border-[#1cb0f6]/40 px-3 py-1 rounded-full text-xs font-mono font-black text-[#1cb0f6]">
              <span>Skor: {score} / {totalQuestions} Soal Benar ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)</span>
            </div>
            <p className="text-xs md:text-sm font-extrabold text-slate-300 leading-relaxed max-w-xs mx-auto">
              {comboCount > 0 ? `${comboCount} jawaban benar berturut-turut! Kombo hebat!` : 'Latihan kuis catur berhasil diselesaikan! Bagus sekali!'}
            </p>
          </div>

          {/* 3 STAT CARDS */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            {/* CARD 1: TOTAL XP */}
            <div className="bg-[#14222e] border-2 border-[#e6a100]/60 rounded-2xl p-3 flex flex-col items-center shadow-lg relative overflow-hidden">
              <div className="w-full bg-[#fbc02d] text-[#1e1700] text-[9.5px] font-black uppercase tracking-wider py-1 rounded-lg mb-2 text-center">
                TOTAL XP
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-black text-lg md:text-xl font-mono">
                <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{xpEarned}</span>
              </div>
            </div>

            {/* CARD 2: KOMBO */}
            <div className="bg-[#14222e] border-2 border-[#1cb0f6]/60 rounded-2xl p-3 flex flex-col items-center shadow-lg relative overflow-hidden">
              <div className="w-full bg-[#1cb0f6] text-[#002130] text-[9.5px] font-black uppercase tracking-wider py-1 rounded-lg mb-2 text-center">
                KOMBO
              </div>
              <div className="flex items-center gap-1 text-[#1cb0f6] font-black text-lg md:text-xl font-mono">
                <Target className="w-5 h-5 text-[#1cb0f6]" />
                <span>x{comboCount}</span>
              </div>
            </div>

            {/* CARD 3: PESAT / WAKTU */}
            <div className="bg-[#14222e] border-2 border-[#22c55e]/60 rounded-2xl p-3 flex flex-col items-center shadow-lg relative overflow-hidden">
              <div className="w-full bg-[#22c55e] text-[#00290e] text-[9.5px] font-black uppercase tracking-wider py-1 rounded-lg mb-2 text-center">
                WAKTU
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-black text-lg md:text-xl font-mono">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="w-full max-w-md flex items-center gap-3 pt-4 pb-2">
          {/* Share Button */}
          <button
            onClick={onShare || (() => alert('Hasil latihan berhasil disalin!'))}
            className="p-4 bg-[#1e2f3d] hover:bg-[#283c4e] border border-[#2e4558] rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title="Bagikan Hasil"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Claim XP Button */}
          <button
            onClick={onClaimXp}
            className="flex-1 py-4 bg-[#1cb0f6] hover:bg-[#1899d6] active:translate-y-1 active:shadow-none text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl shadow-[0_5px_0_0_#1899d6] transition-all cursor-pointer"
          >
            KLAIM XP & DAPATKAN PETI
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
