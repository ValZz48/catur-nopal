import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Check, Sparkles, Send } from 'lucide-react';
import catRatingGif from '../assets/images/cat_rating.gif';

interface GameRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating?: (rating: number, feedback: string) => void;
}

const FEEDBACK_TAGS = [
  'Taktik Menantang',
  'Maskot Kucing Lucu',
  'Materi Mudah Dipahami',
  'Gaya Duolingo Keren',
  'Variasi Kuis Banyak',
  'Desain & Animasi Rapi'
];

export const GameRatingModal: React.FC<GameRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmitRating
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (onSubmitRating) {
      onSubmitRating(rating, [...selectedTags, comment].filter(Boolean).join(', '));
    }
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Kurang Memuaskan';
      case 2:
        return 'Cukup Bagus';
      case 3:
        return 'Bagus & Menarik';
      case 4:
        return 'Sangat Bagus!';
      case 5:
        return 'Luar Biasa / Suka Banget!';
      default:
        return 'Pilih Rating Anda';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-4 font-sans select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#131f28] border-2 border-[#2b3d4f] rounded-3xl p-5 md:p-6 text-white shadow-2xl max-h-[88vh] overflow-y-auto custom-scrollbar"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#1e2f3d] hover:bg-[#283c4e] text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              {/* Badge Header */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1c2d3a] border border-[#2e4558] rounded-full text-[11px] font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Beri Nilai Catur Akademik</span>
              </div>

              {/* CAT MASCOT ANIMATED DISPLAY */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] bg-[#0b1319] flex items-center justify-center">
                <img
                  src={catRatingGif}
                  alt="Cat Rating Mascot"
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                  Suka Dengan Game Ini?
                </h3>
                <p className="text-xs text-slate-300 font-semibold max-w-xs leading-relaxed">
                  Bantu kami meningkatkan kualitas materi & taktik catur akademik!
                </p>
              </div>

              {/* Rating Stars Selection */}
              <div className="space-y-1.5 w-full pt-1">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                            active
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                              : 'text-slate-600 fill-slate-800'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-black text-amber-400 tracking-wide font-mono h-5">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              </div>

              {/* Feedback Chip Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center max-w-sm pt-1">
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-[#1a2936] border-[#293d4e] text-slate-300 hover:bg-[#233545] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Optional Textarea */}
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis ulasan atau saran tambahan (opsional)..."
                className="w-full bg-[#0d1720] border border-[#25394a] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              {/* Submit Buttons */}
              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={handleSubmit}
                  className="w-full py-3.5 bg-[#58cc02] hover:bg-[#46a302] active:translate-y-1 active:shadow-none text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_5px_0_0_#46a302] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Ulasan & Rating</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          ) : (
            /* Success Feedback View */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Terima Kasih Atas Ulasannya!
              </h3>
              <p className="text-xs text-slate-300 font-semibold max-w-xs leading-relaxed">
                Rating 5 bintang dari Anda memotivasi maskot kucing kami untuk terus beraksi!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
