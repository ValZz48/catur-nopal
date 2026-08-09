import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Crosshair, 
  Scale, 
  Target, 
  BarChart3, 
  Clock, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  RotateCcw, 
  Search,
  Sparkles,
  Swords,
  Share2,
  Copy,
  Check
} from 'lucide-react';

export interface MoveAnalysisItem {
  fen: string;
  san: string;
  from: string;
  to: string;
  type: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder';
  color: 'w' | 'b';
}

interface AfterMatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameOutcome: 'win' | 'lose' | 'draw' | 'win-time' | 'lose-time' | string;
  mode: 'online-match' | 'play' | 'local-friend' | string;
  playerColor?: 'w' | 'b';
  whitePlayer: { name: string; avatar?: string; elo?: number };
  blackPlayer: { name: string; avatar?: string; elo?: number };
  eloChange?: number;
  analysisHistory?: MoveAnalysisItem[];
  moveHistory?: string[];
  openingName?: string;
  onPlayAgain?: () => void;
  onAnalyzeBoard?: () => void;
}

export const AfterMatchReportModal: React.FC<AfterMatchReportModalProps> = ({
  isOpen,
  onClose,
  gameOutcome,
  mode,
  playerColor = 'w',
  whitePlayer,
  blackPlayer,
  eloChange = 0,
  analysisHistory = [],
  moveHistory = [],
  openingName,
  onPlayAgain,
  onAnalyzeBoard
}) => {
  if (!isOpen) return null;

  // Outcome flags
  const isWin = gameOutcome === 'win' || gameOutcome === 'win-time';
  const isLose = gameOutcome === 'lose' || gameOutcome === 'lose-time';
  const isTimeOut = gameOutcome === 'win-time' || gameOutcome === 'lose-time';

  // Calculate move scores and accuracy for White and Black
  const getMoveScore = (type: MoveAnalysisItem['type']): number => {
    switch (type) {
      case 'brilliant': return 100;
      case 'best':
      case 'great': return 98;
      case 'excellent': return 90;
      case 'good':
      case 'book': return 80;
      case 'inaccuracy': return 55;
      case 'mistake': return 30;
      case 'blunder': return 0;
      default: return 75;
    }
  };

  const whiteMoves = analysisHistory.filter(m => m.color === 'w');
  const blackMoves = analysisHistory.filter(m => m.color === 'b');

  const whiteAccuracy = whiteMoves.length > 0 
    ? Math.round(whiteMoves.reduce((acc, m) => acc + getMoveScore(m.type), 0) / whiteMoves.length)
    : 100;

  const blackAccuracy = blackMoves.length > 0 
    ? Math.round(blackMoves.reduce((acc, m) => acc + getMoveScore(m.type), 0) / blackMoves.length)
    : 100;

  // Breakdown helper counts
  const countType = (moves: MoveAnalysisItem[], types: MoveAnalysisItem['type'][]) => 
    moves.filter(m => types.includes(m.type)).length;

  const totalMovesCount = moveHistory.length > 0 ? Math.ceil(moveHistory.length / 2) : Math.max(whiteMoves.length, blackMoves.length);

  const [isCopied, setIsCopied] = React.useState(false);

  // Derive outcome description without any emojis
  const getOutcomeText = () => {
    if (isWin) {
      return isTimeOut 
        ? "Kemenangan diperoleh karena waktu lawan telah habis." 
        : "Skakmat sempurna! Strategi Anda mendominasi pertempuran.";
    }
    if (isLose) {
      return isTimeOut 
        ? "Kekalahan terjadi karena kehabisan sisa waktu pertandingan." 
        : "Skakmat terdeteksi. Evaluasi kombinasi dan perbaiki pertahanan.";
    }
    return "Pertandingan berakhir imbang (Remis) sesuai aturan resmi Catur.";
  };

  const getEndReasonLabel = () => {
    if (isTimeOut) return "Kehabisan Waktu";
    if (gameOutcome === 'win' || gameOutcome === 'lose') return "Skakmat / Menyerah";
    return "Draw / Remis";
  };

  const handleShareMatch = () => {
    const modeText = mode === 'online-match' ? 'Online Match' : mode === 'local-friend' ? 'Lokal Teman' : 'Bermain AI';
    const outcomeSummary = isWin ? 'Kemenangan' : isLose ? 'Kekalahan' : 'Seri (Remis)';
    const shareText = `[Laporan Hasil Pertandingan Pal Mate Chess]
Mode: ${modeText}
Hasil: ${outcomeSummary}
Pemain Putih: ${whitePlayer.name} (Akurasi: ${whiteAccuracy}%)
Pemain Hitam: ${blackPlayer.name} (Akurasi: ${blackAccuracy}%)
Total Langkah: ${totalMovesCount}
Sistem Pembukaan: ${openingName || 'Standard'}
Sebab Selesai: ${getEndReasonLabel()}
Mainkan catur gratis di Pal Mate Chess!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }).catch(() => {});
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="bg-[#211f1c] border-2 border-[#3c3934] rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl text-white space-y-5 my-auto"
        >
          {/* HEADER / CLOSE BUTTON */}
          <div className="flex items-center justify-between border-b border-[#3c3934] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2b2824] border border-[#3c3934] text-[#81b64c]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">
                  Laporan Hasil Pertandingan
                </h2>
                <p className="text-[10px] font-semibold text-[#9babaf]">
                  Analisis Akurat Statistik & Kinerja Langkah Pemain
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#2b2824] hover:bg-[#38342f] text-slate-400 hover:text-white border border-[#3c3934] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* GAME OUTCOME HERO BANNER */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
            isWin 
              ? 'bg-[#212f1a] border-[#5d8a32] text-[#a2e564]' 
              : isLose 
              ? 'bg-[#331818] border-[#8a2d2d] text-[#f87171]' 
              : 'bg-[#2d281a] border-[#8a722d] text-[#fbbf24]'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isWin 
                ? 'bg-[#81b64c]/20 border-[#81b64c]/50 text-[#81b64c]' 
                : isLose 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            }`}>
              {isWin ? <Trophy className="w-6 h-6 stroke-[2.5]" /> : isLose ? <Crosshair className="w-6 h-6 stroke-[2.5]" /> : <Scale className="w-6 h-6 stroke-[2.5]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black uppercase tracking-wide leading-tight">
                  {isWin ? "Kemenangan Multi-Taktis!" : isLose ? "Kekalahan Pertandingan" : "Hasil Akhir Imbang"}
                </h3>
                {mode === 'online-match' && eloChange !== 0 && (
                  <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border uppercase ${
                    eloChange > 0 
                      ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                      : 'bg-red-500/20 border-red-500/40 text-red-400'
                  }`}>
                    {eloChange > 0 ? `+${eloChange}` : eloChange} ELO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">
                {getOutcomeText()}
              </p>
            </div>
          </div>

          {/* PLAYERS & ACCURACY COMPARISON ROW */}
          <div className="grid grid-cols-2 gap-3">
            {/* WHITE SIDE */}
            <div className="p-3.5 bg-[#181614] border border-[#3c3934] rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-black text-black text-xs shrink-0 shadow-sm">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white truncate block">
                    {whitePlayer.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Putih {whitePlayer.elo ? `(${whitePlayer.elo} ELO)` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2b2824] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#81b64c]" /> Akurasi:
                </span>
                <span className="text-base font-black font-mono text-[#81b64c]">
                  {whiteAccuracy}%
                </span>
              </div>
            </div>

            {/* BLACK SIDE */}
            <div className="p-3.5 bg-[#181614] border border-[#3c3934] rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
                  H
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-white truncate block">
                    {blackPlayer.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Hitam {blackPlayer.elo ? `(${blackPlayer.elo} ELO)` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2b2824] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-cyan-400" /> Akurasi:
                </span>
                <span className="text-base font-black font-mono text-cyan-400">
                  {blackAccuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* ACCURATE ANALYTICS BREAKDOWN TABLE */}
          <div className="p-4 bg-[#181614] border border-[#3c3934] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#81b64c]" /> Distribusi Kualitas Langkah
              </span>
              <span className="text-[10px] font-mono text-slate-400">Putih vs Hitam</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Brilian */}
              <div className="flex items-center justify-between p-2 bg-[#211f1c] rounded-xl border border-[#2b2824]">
                <span className="font-extrabold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> Brilian
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(whiteMoves, ['brilliant'])}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(blackMoves, ['brilliant'])}</span>
                </div>
              </div>

              {/* Terbaik & Hebat */}
              <div className="flex items-center justify-between p-2 bg-[#211f1c] rounded-xl border border-[#2b2824]">
                <span className="font-extrabold text-[#81b64c] flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terbaik / Hebat
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(whiteMoves, ['best', 'great'])}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(blackMoves, ['best', 'great'])}</span>
                </div>
              </div>

              {/* Bagus / Teori */}
              <div className="flex items-center justify-between p-2 bg-[#211f1c] rounded-xl border border-[#2b2824]">
                <span className="font-extrabold text-sky-400 flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> Bagus / Buku Teori
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(whiteMoves, ['excellent', 'good', 'book'])}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(blackMoves, ['excellent', 'good', 'book'])}</span>
                </div>
              </div>

              {/* Inakurasi & Mistake */}
              <div className="flex items-center justify-between p-2 bg-[#211f1c] rounded-xl border border-[#2b2824]">
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Inakurasi / Minor Error
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(whiteMoves, ['inaccuracy', 'mistake'])}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(blackMoves, ['inaccuracy', 'mistake'])}</span>
                </div>
              </div>

              {/* Blunder */}
              <div className="flex items-center justify-between p-2 bg-[#211f1c] rounded-xl border border-[#2b2824]">
                <span className="font-extrabold text-red-400 flex items-center gap-1.5 text-[11px]">
                  <X className="w-3.5 h-3.5" /> Blunder Fatal
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(whiteMoves, ['blunder'])}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-white px-2 py-0.5 bg-[#2b2824] rounded">{countType(blackMoves, ['blunder'])}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EXTRA STATS METRICS GRID */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-[#181614] border border-[#3c3934] rounded-xl">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase mb-0.5">Total Langkah</span>
              <span className="font-mono font-black text-white text-sm">{totalMovesCount}</span>
            </div>
            <div className="p-2.5 bg-[#181614] border border-[#3c3934] rounded-xl truncate">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase mb-0.5">Sistem Pembukaan</span>
              <span className="font-mono font-bold text-amber-300 text-[11px] truncate block" title={openingName || "Standard Opening"}>
                {openingName || "Standard"}
              </span>
            </div>
            <div className="p-2.5 bg-[#181614] border border-[#3c3934] rounded-xl">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase mb-0.5">Sebab Selesai</span>
              <span className="font-mono font-bold text-slate-200 text-[11px]">{getEndReasonLabel()}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleShareMatch}
              className="w-full sm:flex-1 py-3 px-4 bg-[#2b2824] hover:bg-[#38342f] text-cyan-400 hover:text-cyan-300 font-extrabold text-xs uppercase rounded-xl border border-cyan-500/30 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              {isCopied ? "Tersalin ke Clipboard" : "Bagikan Hasil"}
            </button>

            {onAnalyzeBoard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAnalyzeBoard();
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-[#81b64c] hover:bg-[#6f9e41] text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Tinjau Analisis
              </button>
            )}

            {onPlayAgain && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlayAgain();
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-[#2b2824] hover:bg-[#38342f] text-white font-extrabold text-xs uppercase rounded-xl border border-[#3c3934] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#81b64c]" />
                Main Lagi
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
