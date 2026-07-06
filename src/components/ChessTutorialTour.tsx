import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ChevronRight, ChevronLeft, Award, Sparkles, 
  Play, Users, Gift, MessageSquare
} from 'lucide-react';

interface ChessTutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
  setMode: (mode: any) => void;
  setProfileActiveTab?: (tab: any) => void;
  lang: 'id' | 'en';
  triggerAudio?: (type: string) => void;
}

interface StepType {
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  highlightTextId: string;
  highlightTextEn: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  badge: string;
  isInteractiveChess?: boolean;
}

const TOUR_STEPS: StepType[] = [
  {
    titleId: "Selamat Datang di Pal Mate!",
    titleEn: "Welcome to Pal Mate!",
    descId: "Arena Catur premium tempat Anda bisa bertanding catur taktis, naik level, mengumpulkan koin & diamond secara digital, mengoleksi anime skin kustom, dan memperkuat Suku Anda!",
    descEn: "The premium chess arena where you can contest high-stakes ELO duels, gain XP levels, collect shiny virtual coins & diamonds, unlock custom anime piece skins, and empower your Suku!",
    highlightTextId: "Sentuhan modern catur klasik ala klan lokal.",
    highlightTextEn: "A modern touch to the classic game of chess.",
    icon: Sparkles,
    iconColor: "text-amber-400",
    badge: "Welcome"
  },
  {
    titleId: "HUD Utama & Sistem Kemajuan (Progression)",
    titleEn: "Main HUD & Progression System",
    descId: "Tengok bagian atas layar! Di sana tercatat Nama, Judul (Title), Level, XP, Koin, dan jumlah Diamond Anda. Dapatkan koin melimpah dari hasil memenangkan catur atau memecahkan puzzle taktis harian.",
    descEn: "Look at the top header! That is the player HUD. It keeps track of your unique Name, Title, XP progression bar, active Coins, and Diamonds. Earn virtual coins by matching or winning puzzles.",
    highlightTextId: "Main rutin = Level naik & lencana bertambah!",
    highlightTextEn: "Play daily = Gain XP and rise to the grandmaster level!",
    icon: Award,
    iconColor: "text-emerald-400",
    badge: "HUD & XP"
  },
  {
    titleId: "Latihan Tempur Interaktif (Skakmat!)",
    titleEn: "Interactive Combat Training (Checkmate!)",
    descId: "Ayo latih taktik tempur pertama Anda secara langsung! Ini adalah skenario simulasi nyata. Gerakkan RATU (♕) Anda untuk merebut pion pertahanan hitam di f7 dan raih SKAKMAT instan!",
    descEn: "Let's test your direct combat instincts! This is a real battlefield scenario. Move your QUEEN (♕) to strike the defender pawn on f7 and claim an immediate CHECKMATE!",
    highlightTextId: "Ketuk Ratu Putih (♕) lalu ketuk Pion Hitam (f7) sebagai sasaran!",
    highlightTextEn: "Tap the White Queen (♕) then tap the Black Pawn (f7) to checkmate!",
    icon: Play,
    iconColor: "text-amber-400",
    badge: "Interactive Combat",
    isInteractiveChess: true
  },
  {
    titleId: "Mode Laga Catur Taktis (Arena Lobi)",
    titleEn: "Tactical Arena Match Modes",
    descId: "Pilih mode bermain Anda! Rasakan sensasi simulasi Bot AI (250 s.d 2850 ELO) dengan saran real-time, teka-teki taktik skakmat instan, pelajaran teori (pembukaan Ruy Lopez, dll), atau duel online PvP langsung!",
    descEn: "Select your battlefield! Experience high-fidelity AI bots (ranging from 250 to 2850 ELO) with instant strategic tips, weekly tactical mate puzzles, lessons (Ruy Lopez openings), or real-time online matchmaking!",
    highlightTextId: "Melatih otak taktis & merebut bonus koin.",
    highlightTextEn: "Sharpen your mind and harvest golden coins.",
    icon: Play,
    iconColor: "text-sky-400",
    badge: "Match Modes"
  },
  {
    titleId: "Klub Suku & Kolaborasi Klan",
    titleEn: "Chess Suku & Clan Cooperation",
    descId: "Mari berkolaborasi! Bergabunglah ke Suku Klan, klik absen harian tim untuk mengklaim chest akumulatif mingguan, dan bincang-bincang taktik di Ruang Obrolan Suku!",
    descEn: "Team up in Chess Suku (Clubs)! Complete daily team check-ins to build up milestone chest points, perform guild wars against rival clans, and coordinate strategies in the Chat Room!",
    highlightTextId: "Diskusikan taktik & bangun kejayaan suku bersama partner.",
    highlightTextEn: "Discuss tactics and conquer the ranks with partners.",
    icon: Users,
    iconColor: "text-purple-400",
    badge: "Suku Klan"
  },
  {
    titleId: "Toko Kosmetik & Gacha Legendaris",
    titleEn: "Cosmetics Store & Legendary Gacha",
    descId: "Ekspresikan dirimu! Gunakan koin dan diamond terkumpul untuk membuka Skin Bidak Catur kustom (seperti set anime atau kayu), membeli bingkai profil naga premium, atau mencoba peruntungan Gacha berhadiah kosmetik bernilai tinggi!",
    descEn: "Express your style! Spend accumulated coins and diamonds to unlock custom visual chess piece themes, premium frame profiles, or try your luck in our high-rewards Gacha Draw system!",
    highlightTextId: "Koleksi skin dan kustomisasi papan catur unik Anda sekarang.",
    highlightTextEn: "Collect custom pieces and showcase individual aesthetic styles.",
    icon: Gift,
    iconColor: "text-red-400",
    badge: "Katalog & Gacha"
  },
  {
    titleId: "Social Feed & Rekan Mabar",
    titleEn: "Social Feed & Chess Friends",
    descId: "Media sosial internal khusus pecatur! Bagikan unggahan, berikan suka pada status kawan, tambah rekan mabar baru, dan ketahui siapa saja yang mampir melihat-lihat profil kustom Anda melalui fitur real-time Visitor Log!",
    descEn: "Our special built-in social network! Upload status posts, like friend updates, invite active chess buddies, and see exactly who visited your beautiful profile panel in the live Visitor Log!",
    highlightTextId: "Membangun ikatan mabar taktis terbaik Anda.",
    highlightTextEn: "Build your perfect list of cooperative match friends.",
    icon: Users,
    iconColor: "text-pink-400",
    badge: "Social Feed"
  },
  {
    titleId: "Forum Diskusi & Analisis Komunitas",
    titleEn: "Discussion Forum & Chess Analysis",
    descId: "Ingin berbagi teori catur matang? Buatlah postingan di Forum Komunitas! Peroleh ribuan umpan balik taktis dari sesama master klan, serta diskusikan aneka perangkap pembukaan catur terpopuler saat ini.",
    descEn: "Have an elite opening blueprint to display? Share your guides in the Community Discussion Forum! Gain tactical reviews from master players and discuss opening traps or middle-game strategies in detail.",
    highlightTextId: "Aktif berkontribusi menumbuhkan status reputasi Anda.",
    highlightTextEn: "Contribute actively to establish high server reputation.",
    icon: MessageSquare,
    iconColor: "text-rose-400",
    badge: "Forum"
  },
  {
    titleId: "Semua Sistem Siap! Selamat Bertanding!",
    titleEn: "Awesome! You are Ready to Duel!",
    descId: "Selamat, pemahaman taktis Anda kini lengkap! Kami telah menyematkan hadiah selamat datang sebesar +1,000 KOIN dan +100 XP awal untuk mengawali perjalanan legendaris Anda di Pal Mate!",
    descEn: "Congratulations, you are now fully oriented! We have awarded your account a starting balance of +1,000 COINS and +100 XP to kickstart your legendary career!",
    highlightTextId: "Semoga kemenangan beruntun (win streak) selalu berpihak pada Anda!",
    highlightTextEn: "May checkmates and clean victories follow your pawns!",
    icon: Check,
    iconColor: "text-emerald-400",
    badge: "Selesai / Finished"
  }
];

export function ChessTutorialTour({
  isOpen,
  onClose,
  mode,
  setMode,
  setProfileActiveTab,
  lang,
  triggerAudio
}: ChessTutorialTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Interactive chess board tutorial states
  const [puzzleBoard, setPuzzleBoard] = useState<string[][]>([
    ['r', '.', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', '.', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', 'p', '.', '.', '.'],
    ['.', '.', 'B', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', 'Q', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', '.', 'K', '.', 'N', 'R']
  ]);
  const [selectedSquare, setSelectedSquare] = useState<{ r: number; c: number } | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [wrongAttempt, setWrongAttempt] = useState<boolean>(false);

  // Helper to render chess pieces with elegant styles
  const renderTutorPiece = (val: string) => {
    switch (val) {
      case 'r': return <span className="text-stone-900 text-2xl font-bold select-none drop-shadow-sm">♜</span>;
      case 'n': return <span className="text-stone-900 text-2xl font-bold select-none drop-shadow-sm">♞</span>;
      case 'b': return <span className="text-stone-900 text-2xl font-bold select-none drop-shadow-sm">♝</span>;
      case 'q': return <span className="text-stone-900 text-2xl font-bold select-none drop-shadow-sm">♛</span>;
      case 'k': return <span className="text-stone-900 text-2xl font-bold select-none drop-shadow-sm">♚</span>;
      case 'p': return <span className="text-stone-900 text-xl font-bold select-none drop-shadow-sm">♟</span>;
      
      case 'R': return <span className="text-white text-2xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♖</span>;
      case 'N': return <span className="text-white text-2xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♘</span>;
      case 'B': return <span className="text-white text-2xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♗</span>;
      case 'Q': return <span className="text-white text-3xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♕</span>;
      case 'K': return <span className="text-white text-2xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♔</span>;
      case 'P': return <span className="text-white text-xl font-bold select-none drop-shadow" style={{ WebkitTextStroke: '1px #444' }}>♙</span>;
      default: return null;
    }
  };

  // Reset interactive puzzle state if they go back and forth
  useEffect(() => {
    if (currentStep === 2) {
      setPuzzleBoard([
        ['r', '.', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', '.', 'p', 'p', 'p'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'p', '.', '.', '.'],
        ['.', '.', 'B', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'Q', '.', '.'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', '.', 'K', '.', 'N', 'R']
      ]);
      setSelectedSquare(null);
      setIsSolved(false);
      setWrongAttempt(false);
    }
  }, [currentStep]);

  // If tour tab changes, dynamically guide user to the respective page context
  useEffect(() => {
    if (!isOpen) return;

    switch (currentStep) {
      case 0:
      case 1:
      case 2:
      case 3:
        setMode('menu');
        break;
      case 4:
        setMode('guild-suku');
        break;
      case 5:
        // Shop & Gacha tab inside Main / Cosmetics subtab
        setMode('menu');
        break;
      case 6:
        if (setProfileActiveTab) {
          setMode('profile');
          setProfileActiveTab('social');
        } else {
          setMode('profile');
        }
        break;
      case 7:
        setMode('forum-diskusi');
        break;
      case 8:
        setMode('menu');
        break;
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (triggerAudio) triggerAudio('move');
    if (step.isInteractiveChess && !isSolved) {
      if (triggerAudio) triggerAudio('error');
      setWrongAttempt(true);
      return;
    }
    if (isLast) {
      // Claim initial tutor award & persist completion state
      localStorage.setItem('chess_tutorial_completed_v2', 'true');
      
      // Auto award initial balance if newly completed
      const coinsBefore = Number(localStorage.getItem('coins')) || 500;
      const xpBefore = Number(localStorage.getItem('xp')) || 0;
      localStorage.setItem('coins', String(coinsBefore + 1000));
      localStorage.setItem('xp', String(xpBefore + 100));
      
      // Trigger a clean reload to sync values easily
      window.location.reload();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (triggerAudio) triggerAudio('move');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (triggerAudio) triggerAudio('win');
    localStorage.setItem('chess_tutorial_completed_v2', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Ambient Blurred Dark Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
          className="absolute inset-0 bg-stone-950/85 backdrop-blur-md"
        />

        {/* Modal Panel Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-lg bg-[#211f1d] border-2 border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans flex flex-col max-h-[92vh]"
        >
          {/* Neon Grid Effect Decorator */}
          <div className="absolute inset-0 bg-[radial-gradient(#81b64c_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

          {/* Golden Corner Trim Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/40 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/40 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-3xl pointer-events-none" />

          {/* Close/Skip Button top right */}
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-full cursor-pointer transition-all hover:rotate-90 duration-300 z-10"
            title={lang === 'en' ? "Skip tutorial" : "Lewati panduan"}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Content Scrollable area */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col items-center text-center mt-2">
              <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/15 uppercase mb-3">
                {step.badge} • Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>

              {/* Step Header titles */}
              <h3 className="text-md sm:text-lg font-black text-white uppercase tracking-tight leading-snug px-4">
                {lang === 'id' ? step.titleId : step.titleEn}
              </h3>

              {/* Description context */}
              <p className="text-slate-350 text-[11px] sm:text-xs font-medium leading-relaxed mt-2 max-w-sm">
                {lang === 'id' ? step.descId : step.descEn}
              </p>

              {/* Glowing Large Icon Wrapper for static slots or CUSTOM INTERACTIVE CHESS BOARD */}
              {step.isInteractiveChess ? (
                <div className="w-full flex flex-col items-center my-3 space-y-3 shrink-0">
                  {/* Isolated shake and pulsing keyframes */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes shake {
                      0%, 100% { transform: translateX(0); }
                      20%, 60% { transform: translateX(-4px); }
                      40%, 80% { transform: translateX(4px); }
                    }
                    .animate-shake {
                      animation: shake 0.4s ease-in-out;
                    }
                  `}} />

                  {/* Opponent AI Card */}
                  <div className="w-full max-w-sm bg-stone-950/60 rounded-2xl px-3 py-2 border border-stone-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-xs text-red-400 font-bold select-none">
                        🤖
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-white font-extrabold uppercase tracking-wide">Nopal Jr (AI)</div>
                        <div className="text-[8px] text-red-450 font-bold font-mono tracking-wider">MENGUNCI f7</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-900/50 px-2 py-0.5 rounded-md border border-stone-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[8px] font-mono text-slate-400 font-bold">600 ELO</span>
                    </div>
                  </div>

                  {/* Chessboard Grid */}
                  <div className="relative">
                    {/* CONFETTI SPARKS WHEN SOLVED */}
                    {isSolved && (
                      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-emerald-950/30 backdrop-blur-[1px] rounded-xl overflow-hidden border border-emerald-500/30">
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-emerald-900/90 border border-emerald-400/40 text-white font-black uppercase text-xs px-4 py-2.5 rounded-full shadow-2xl tracking-wider flex items-center gap-1.5"
                        >
                           SKAKMAT BERHASIL! (+500 KOIN & +50 XP)
                        </motion.div>
                      </div>
                    )}

                    <div className="w-64 h-64 sm:w-72 sm:h-72 border-4 border-stone-950 bg-stone-900 rounded-xl overflow-hidden grid grid-cols-8 grid-rows-8 shadow-2xl select-none relative">
                      {puzzleBoard.map((rowArr, rowIndex) => {
                        return rowArr.map((cellValue, colIndex) => {
                          const isDark = (rowIndex + colIndex) % 2 === 1;
                          const isSelected = selectedSquare?.r === rowIndex && selectedSquare?.c === colIndex;
                          const isWhiteQueenSelected = selectedSquare?.r === 5 && selectedSquare?.c === 5;
                          
                          // Highlight target square on f7
                          const isTargetf7 = !isSolved && rowIndex === 1 && colIndex === 5;
                          const isPathSquare = isWhiteQueenSelected && rowIndex === 1 && colIndex === 5;

                          return (
                            <div 
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() => {
                                if (isSolved) return;
                                
                                // User clicks White Queen (Q) at (5,5)
                                if (cellValue === 'Q') {
                                  setSelectedSquare({ r: rowIndex, c: colIndex });
                                  setWrongAttempt(false);
                                  if (triggerAudio) triggerAudio('move');
                                } else if (selectedSquare) {
                                  // User moves Queen from (5,5) to (1,5)
                                  if (selectedSquare.r === 5 && selectedSquare.c === 5 && rowIndex === 1 && colIndex === 5) {
                                    const nextBoard = puzzleBoard.map(row => [...row]);
                                    nextBoard[5][5] = '.';
                                    nextBoard[1][5] = 'Q';
                                    setPuzzleBoard(nextBoard);
                                    setSelectedSquare(null);
                                    setIsSolved(true);
                                    
                                    // Reward user
                                    const cCoins = Number(localStorage.getItem('coins')) || 500;
                                    const cXP = Number(localStorage.getItem('xp')) || 0;
                                    localStorage.setItem('coins', String(cCoins + 500));
                                    localStorage.setItem('xp', String(cXP + 50));
                                    
                                    if (triggerAudio) triggerAudio('win');
                                  } else {
                                    // Invalid move inside tutor
                                    setWrongAttempt(true);
                                    if (triggerAudio) triggerAudio('error');
                                  }
                                }
                              }}
                              className={`aspect-square flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-amber-400/50 z-10 border-2 border-amber-300 shadow-inner' 
                                  : isDark 
                                  ? 'bg-[#b58863]' 
                                  : 'bg-[#f0d9b5]'
                              }`}
                            >
                              {/* RENDER THE PIECE */}
                              {renderTutorPiece(cellValue)}

                              {/* RED PULSING TARGET FOR f7 PAWN */}
                              {isTargetf7 && (
                                <div className="absolute inset-0 border-2 border-red-500 animate-pulse rounded-sm z-10 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                </div>
                              )}

                              {/* GREEN DOT INDICATORS SHOWING PATHWAY IF QUEEN IS SELECTED */}
                              {isPathSquare && (
                                <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white z-20 animate-pulse" />
                              )}
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>

                  {/* Player Info Bar */}
                  <div className="w-full max-w-sm bg-stone-950/60 rounded-2xl px-3 py-2 border border-stone-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center text-[9px] text-emerald-400 font-black select-none uppercase">
                        YOU
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-white font-extrabold uppercase tracking-wide">Anda (Pecatur)</div>
                        <div className="text-[8px] text-emerald-400 font-bold font-mono tracking-wider">PUTIH JALAN & MENANG</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-900/50 px-2 py-0.5 rounded-md border border-stone-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-mono text-emerald-400 font-bold">WHITE SIDE</span>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {wrongAttempt && (
                    <div className="w-full max-w-sm text-center text-[9px] font-black text-red-400 bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-xl uppercase tracking-wide animate-shake">
                      {lang === 'en' ? 'Incorrect Move! Tap the Queen (♕) first, then attack the f7 Pawn (red circle)!' : 'Gerakan Salah! Ketuk Ratu (♕) terlebih dahulu, lalu serang Pion f7 (lingkaran merah)!'}
                    </div>
                  )}

                  {/* Action ribbon */}
                  {isSolved ? (
                    <div className="w-full max-w-sm bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-900/40 text-[10px] font-black text-emerald-400 flex items-center justify-center gap-1.5 animate-bounce">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span className="text-center font-bold">{lang === 'en' ? 'CHECKMATE! +500 starting Coins claimed! Click Next below!' : 'SKAKMAT! +500 Koin awal diklaim! Klik Lanjut di bawah!'}</span>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm bg-stone-950/30 p-2 rounded-2xl border border-stone-900/40 text-[9.5px] font-semibold text-amber-400 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span className="text-center">{lang === 'en' ? 'Tactical Hint: Tap the Queen on f3, then attack the f7 Pawn!' : 'Saran Taktis: Ketuk Ratu f3, lalu serang Pion f7!'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative my-4 shrink-0">
                  <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl pointer-events-none animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-850 flex items-center justify-center relative shadow-inner">
                    <StepIcon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                </div>
              )}

              {/* Tip highlight text */}
              <div className="w-full bg-stone-950/40 p-2.5 rounded-2xl border border-stone-900/60 mt-3 text-[10.5px] font-bold text-emerald-400 flex items-center justify-center gap-1.5 px-4 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
                <span className="text-center font-semibold text-emerald-300">
                  {lang === 'id' ? step.highlightTextId : step.highlightTextEn}
                </span>
              </div>
            </div>
          </div>

          {/* Dot Map Progress */}
          <div className="flex justify-center gap-1.5 mt-4 mb-4 shrink-0">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full duration-300 ${
                  idx === currentStep 
                    ? 'w-6 bg-amber-500' 
                    : idx < currentStep 
                    ? 'w-2 bg-[#81b64c]/40' 
                    : 'w-1.5 bg-stone-800'
                }`}
              />
            ))}
          </div>

          {/* Interactive Navigation Panel buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-850 shrink-0">
            {/* Prev button */}
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-slate-300 hover:text-white border border-stone-800 hover:border-stone-750 text-xs font-extrabold uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {lang === 'en' ? "Back" : "Kembali"}
              </button>
            ) : (
              <div className="w-16" />
            )}

            {/* Skip button for lazy readers */}
            {!isLast && (
              <button 
                onClick={handleSkip}
                className="text-[10px] text-zinc-500 hover:text-zinc-400 font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                {lang === 'en' ? "Skip Tour" : "Lewati Tur"}
              </button>
            )}

            {/* Next/Finish button */}
            <button
              onClick={handleNext}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 duration-150 bg-gradient-to-r ${
                step.isInteractiveChess && !isSolved
                  ? 'from-stone-700 to-stone-600 border border-stone-600 text-stone-400'
                  : isLast 
                  ? 'from-[#81b64c] to-green-500 hover:brightness-110 text-white border border-[#81b64c]/20' 
                  : 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border border-amber-400/20'
              }`}
            >
              {isLast ? (
                <>
                  {lang === 'en' ? "Let's Go!" : "Mulai Bermain!"}
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : step.isInteractiveChess && !isSolved ? (
                <>
                  {lang === 'en' ? "Solve First" : "Selesaikan"}
                  <X className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {lang === 'en' ? "Next" : "Lanjut"}
                  <ChevronRight className="w-3.5 h-3.5 active:translate-x-1 duration-150" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
