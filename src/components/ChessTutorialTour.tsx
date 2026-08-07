import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ChevronRight, ChevronLeft, Award, Sparkles, 
  Play, Users, Gift, MessageSquare, ArrowUp, ArrowDown, Compass
} from 'lucide-react';
import juniorAvatar from '../assets/images/junior_bot_cartoon_1786094967966.jpg';
import { ChessPiece } from './ChessPieces';

interface ChessTutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (coinsAward: number, xpAward: number) => void;
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
  targetId: string | null;
}

const TOUR_STEPS: StepType[] = [
  {
    titleId: "Selamat Datang di Pal Mate!",
    titleEn: "Welcome to Pal Mate!",
    descId: "Arena Catur tempat Anda bisa bertanding catur taktis, naik level, mengumpulkan koin & diamond secara digital, mengoleksi anime skin kustom, dan memperkuat Suku Anda!",
    descEn: "The tactical chess arena where you can contest high-stakes ELO duels, gain XP levels, collect shiny virtual coins & diamonds, unlock custom anime piece skins, and empower your Suku!",
    highlightTextId: "Sentuhan modern catur klasik ala klan lokal.",
    highlightTextEn: "A modern touch to the classic game of chess.",
    icon: Sparkles,
    iconColor: "text-amber-400",
    badge: "Welcome",
    targetId: null
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
    badge: "HUD & XP",
    targetId: "hud-nav"
  },
  {
    titleId: "Mode Laga Catur Taktis (Arena Lobi)",
    titleEn: "Tactical Arena Match Modes",
    descId: "Pilih mode bermain Anda! Rasakan sensasi simulasi Bot AI (250 s.d 2850 ELO) dengan saran real-time, teka-teki taktik skakmat instan, pelajaran teori, atau duel online PvP langsung!",
    descEn: "Select your battlefield! Experience high-fidelity AI bots (ranging from 250 to 2850 ELO) with instant strategic tips, weekly tactical mate puzzles, lessons, or real-time online matchmaking!",
    highlightTextId: "Ketuk tombol Arena untuk membuka lobi bermain!",
    highlightTextEn: "Tap the Arena button to open play lobby!",
    icon: Play,
    iconColor: "text-sky-400",
    badge: "Match Modes",
    targetId: "menu"
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
    isInteractiveChess: true,
    targetId: null
  },
  {
    titleId: "Klub Suku & Kolaborasi Klan",
    titleEn: "Chess Suku & Clan Cooperation",
    descId: "Mari berkolaborasi! Bergabunglah ke Suku Klan, klik absen harian tim untuk mengklaim chest akumulatif mingguan, dan bincang-bincang taktik di Ruang Obrolan Suku!",
    descEn: "Team up in Chess Suku (Clubs)! Complete daily team check-ins to build up milestone chest points, perform guild wars against rival clans, and coordinate strategies in the Chat Room!",
    highlightTextId: "Ketuk Suku untuk berkolaborasi dan mabar klan!",
    highlightTextEn: "Tap Suku to collaborate and team up!",
    icon: Users,
    iconColor: "text-purple-400",
    badge: "Suku Klan",
    targetId: "guild-suku"
  },
  {
    titleId: "Toko Kosmetik & Koleksi Skin",
    titleEn: "Cosmetics & Piece Skins Store",
    descId: "Ekspresikan dirimu! Gunakan koin dan diamond terkumpul untuk membuka Skin Bidak Catur kustom (seperti set anime atau kayu) dan membeli bingkai profil naga premium!",
    descEn: "Express your style! Spend accumulated coins and diamonds to unlock custom visual chess piece themes and premium frame profiles!",
    highlightTextId: "Ketuk Shop untuk memburu skin bidak & bingkai maut!",
    highlightTextEn: "Tap Shop to browse custom piece skins!",
    icon: Gift,
    iconColor: "text-red-400",
    badge: "Katalog & Toko",
    targetId: "store"
  },
  {
    titleId: "Social Feed & Rekan Mabar",
    titleEn: "Social Feed & Chess Friends",
    descId: "Media sosial internal khusus pecatur! Bagikan unggahan, berikan suka pada status kawan, tambah rekan mabar baru, dan ketahui siapa saja yang mampir melihat-lihat profil kustom Anda melalui fitur real-time Visitor Log!",
    descEn: "Our special built-in social network! Upload status posts, like friend updates, invite active chess buddies, and see exactly who visited your beautiful profile panel in the live Visitor Log!",
    highlightTextId: "Ketuk Profil untuk melihat feed sosial & inventori!",
    highlightTextEn: "Tap Profil to view social feed & active inventory!",
    icon: Users,
    iconColor: "text-pink-400",
    badge: "Social Feed",
    targetId: "profile"
  },
  {
    titleId: "Forum Diskusi & Analisis Komunitas",
    titleEn: "Discussion Forum & Chess Analysis",
    descId: "Ingin berbagi teori catur matang? Buatlah postingan di Forum Komunitas! Peroleh ribuan umpan balik taktis dari sesama master klan, serta diskusikan aneka perangkap pembukaan catur terpopuler saat ini.",
    descEn: "Have an elite opening blueprint to display? Share your guides in the Community Discussion Forum! Gain tactical reviews from master players and discuss opening traps or middle-game strategies in detail.",
    highlightTextId: "Membuka obrolan catur interaktif bersama ratusan player.",
    highlightTextEn: "Opening interactive chess discussions with hundreds of active players.",
    icon: MessageSquare,
    iconColor: "text-rose-400",
    badge: "Forum",
    targetId: null
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
    badge: "Selesai / Finished",
    targetId: null
  }
];

export function ChessTutorialTour({
  isOpen,
  onClose,
  onComplete,
  mode,
  setMode,
  setProfileActiveTab,
  lang,
  triggerAudio
}: ChessTutorialTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

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

  // Track the spotlight target coordinates
  useEffect(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStep];
    if (step.targetId) {
      const updateRect = () => {
        const el = document.getElementById(step.targetId!);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      };
      
      updateRect();
      const interval = setInterval(updateRect, 250); // polling to handle dynamic loading
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen, mode]);

  // Helper to render chess pieces with elegant classic skin styles
  const renderTutorPiece = (val: string) => {
    if (!val || val === '.') return null;
    const color = val === val.toUpperCase() ? 'w' : 'b';
    const type = val.toLowerCase();
    return <ChessPiece type={type} color={color} skin="standard" className="w-[82%] h-[82%] select-none drop-shadow-md" />;
  };

  // Reset interactive puzzle state if they go back and forth
  useEffect(() => {
    if (currentStep === 3) {
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

  // If tour tab changes, dynamically guide user to the respective page context in background
  useEffect(() => {
    if (!isOpen) return;

    switch (currentStep) {
      case 0:
      case 1:
        setMode('home');
        break;
      case 2:
        setMode('home'); // start on home, look at 'Arena'
        break;
      case 3:
        setMode('menu'); // open interactive chess arena
        break;
      case 4:
        setMode('menu'); // look at 'Suku'
        break;
      case 5:
        setMode('guild-suku'); // look at 'Shop/Store'
        break;
      case 6:
        setMode('store'); // look at 'Profil'
        break;
      case 7:
        setMode('forum-diskusi');
        break;
      case 8:
        setMode('home');
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
      const activeUser = (localStorage.getItem('username') || 'guest').trim().toLowerCase();
      localStorage.setItem(`chess_tutorial_completed_${activeUser}`, 'true');
      localStorage.setItem('chess_tutorial_completed_v2', 'true');
      localStorage.setItem('chess_tutorial_completed_guest', 'true');
      
      // Auto award initial balance if newly completed
      const coinsBefore = Number(localStorage.getItem('coins')) || 500;
      const xpBefore = Number(localStorage.getItem('xp')) || 0;
      localStorage.setItem('coins', String(coinsBefore + 1000));
      localStorage.setItem('xp', String(xpBefore + 100));
      
      if (onComplete) {
        onComplete(1000, 100);
      } else {
        onClose();
      }
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
    const activeUser = (localStorage.getItem('username') || 'guest').trim().toLowerCase();
    localStorage.setItem(`chess_tutorial_completed_${activeUser}`, 'true');
    localStorage.setItem('chess_tutorial_completed_v2', 'true');
    localStorage.setItem('chess_tutorial_completed_guest', 'true');
    onClose();
  };

  // Determine pointer direction and card placement based on target position
  const isTargetAtBottom = targetRect ? (targetRect.top + targetRect.height / 2 > window.innerHeight / 2) : false;
  const isTargetAtTop = targetRect ? (targetRect.top + targetRect.height / 2 <= window.innerHeight / 2) : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] font-sans overflow-hidden">
        {/* SVG Dynamic Spotlight Mask */}
        {targetRect ? (
          <svg className="fixed inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 101 }}>
            <defs>
              <mask id="spotlight-tutorial-mask">
                {/* White covers all (blocks light, keeps screen fully dark) */}
                <rect width="100%" height="100%" fill="white" />
                {/* Black cuts hole (makes it transparent and illuminated) */}
                <rect 
                  x={targetRect.left - 6} 
                  y={targetRect.top - 6} 
                  width={targetRect.width + 12} 
                  height={targetRect.height + 12} 
                  rx={step.targetId === 'hud-nav' ? "12" : "20"} 
                  fill="black" 
                />
              </mask>
            </defs>
            {/* The actual dark backdrop using the mask */}
            <rect 
              width="100%" 
              height="100%" 
              fill="rgba(0, 0, 0, 0.85)" 
              mask="url(#spotlight-tutorial-mask)" 
              className="cursor-not-allowed"
              onClick={handleSkip} 
            />
          </svg>
        ) : (
          /* Normal simple full screen dark overlay */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute inset-0 bg-stone-950/90 backdrop-blur-md"
            style={{ zIndex: 101 }}
          />
        )}

        {/* CLICKABLE TRIGGER ELEMENT OVER THE SPOTLIGHT ZONE */}
        {targetRect && step.targetId && (
          <div 
            style={{
              position: 'fixed',
              left: targetRect.left - 6,
              top: targetRect.top - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              zIndex: 104,
            }}
            className="cursor-pointer rounded-2xl border-[3px] border-yellow-400 animate-pulse shadow-[0_0_25px_#eab308]"
            onClick={(e) => {
              e.stopPropagation();
              const el = document.getElementById(step.targetId!);
              if (el) {
                el.click(); // Trigger actual component navigation/action
              }
              handleNext(); // Advance step
            }}
            title="Ketuk di sini untuk lanjut!"
          />
        )}

        {/* BOUNCING POINTER ARROW WITH "TAP DI SINI!" BANNER */}
        {targetRect && (
          <div
            style={{
              position: 'fixed',
              left: targetRect.left + targetRect.width / 2 - 40, // centered
              top: isTargetAtBottom ? targetRect.top - 70 : targetRect.bottom + 12,
              zIndex: 105,
              width: '80px'
            }}
            className="flex flex-col items-center gap-1 pointer-events-none"
          >
            {isTargetAtBottom && (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                className="text-yellow-400 flex flex-col items-center"
              >
                <span className="text-[9px] font-black uppercase bg-yellow-500 text-black px-2 py-0.5 rounded-md tracking-wider shadow-md whitespace-nowrap">TAP DI SINI!</span>
                <ArrowDown className="w-8 h-8 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.9)] fill-current mt-0.5" />
              </motion.div>
            )}
            {isTargetAtTop && (
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                className="text-yellow-400 flex flex-col items-center"
              >
                <ArrowUp className="w-8 h-8 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.9)] fill-current mb-0.5" />
                <span className="text-[9px] font-black uppercase bg-yellow-500 text-black px-2 py-0.5 rounded-md tracking-wider shadow-md whitespace-nowrap">TAP DI SINI!</span>
              </motion.div>
            )}
          </div>
        )}

        {/* FLOATING DIALOG BOX OR STATIC CENTERED PANEL */}
        <div 
          className={`fixed inset-0 flex p-4 transition-all duration-300 ${
            targetRect 
              ? isTargetAtBottom 
                ? 'items-start justify-center pt-16 sm:pt-20 md:pt-24 pb-4' 
                : 'items-end justify-center pb-24 sm:pb-28 md:pb-32 pt-4'
              : 'items-center justify-center'
          }`}
          style={{ zIndex: 102, pointerEvents: 'none' }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              pointerEvents: 'auto',
            }}
            className={`relative w-full max-w-md bg-[#211f1d] border-2 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[70vh] transition-all duration-300 ${
              targetRect ? 'border-yellow-500/35 shadow-yellow-950/20' : 'border-amber-500/30'
            }`}
          >
            {/* Neon Grid Decorative backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#81b64c_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

            {/* Corner visual trims */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 rounded-tl-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/40 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/40 rounded-bl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-3xl pointer-events-none" />

            {/* Close top right button */}
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-full cursor-pointer transition-all hover:rotate-90 duration-300 z-10 pointer-events-auto"
              title={lang === 'en' ? "Skip tutorial" : "Lewati panduan"}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Scrollable area */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col items-center text-center mt-1">
                <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/15 uppercase mb-3">
                  {step.badge} • Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>

                {/* Step Title */}
                <h3 className="text-md sm:text-base font-black text-white uppercase tracking-tight leading-snug px-3">
                  {lang === 'id' ? step.titleId : step.titleEn}
                </h3>

                {/* Step Description */}
                <p className="text-slate-350 text-[11px] sm:text-xs font-semibold leading-relaxed mt-2 max-w-sm px-2">
                  {lang === 'id' ? step.descId : step.descEn}
                </p>

                {/* DYNAMIC INTERACTIVE MINI CHESSBOARD AREA (STEP 4) */}
                {step.isInteractiveChess ? (
                  <div className="w-full flex flex-col items-center my-3 space-y-3 shrink-0 pointer-events-auto">
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

                    {/* Bot Title card */}
                    <div className="w-full max-w-sm bg-stone-950/60 rounded-2xl px-3 py-1.5 border border-stone-850 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center overflow-hidden select-none">
                          <img src={juniorAvatar} alt="Junior AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-left">
                          <div className="text-[9px] text-white font-extrabold uppercase tracking-wide">Junior (AI)</div>
                          <div className="text-[8px] text-red-400 font-bold font-mono tracking-wider">MENGUNCI f7</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-stone-900/50 px-2 py-0.5 rounded-md border border-stone-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-slate-400 font-bold">600 ELO</span>
                      </div>
                    </div>

                    {/* Small Board */}
                    <div className="relative">
                      {isSolved && (
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-emerald-950/40 backdrop-blur-[1px] rounded-xl overflow-hidden border border-emerald-500/30">
                          <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-emerald-900/95 border border-emerald-400/40 text-white font-black uppercase text-[10px] px-3.5 py-2 rounded-full shadow-2xl tracking-wider flex items-center gap-1"
                          >
                             SKAKMAT BERHASIL! (+500 KOIN)
                          </motion.div>
                        </div>
                      )}

                      <div className="w-60 h-60 border-4 border-stone-950 bg-stone-900 rounded-xl overflow-hidden grid grid-cols-8 grid-rows-8 shadow-2xl select-none relative">
                        {puzzleBoard.map((rowArr, rowIndex) => {
                          return rowArr.map((cellValue, colIndex) => {
                            const isDark = (rowIndex + colIndex) % 2 === 1;
                            const isSelected = selectedSquare?.r === rowIndex && selectedSquare?.c === colIndex;
                            const isWhiteQueenSelected = selectedSquare?.r === 5 && selectedSquare?.c === 5;
                            
                            // f7 target indicator
                            const isTargetf7 = !isSolved && rowIndex === 1 && colIndex === 5;
                            const isPathSquare = isWhiteQueenSelected && rowIndex === 1 && colIndex === 5;

                            return (
                              <div 
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => {
                                  if (isSolved) return;
                                  
                                  // Click white queen at (5,5)
                                  if (cellValue === 'Q') {
                                    setSelectedSquare({ r: rowIndex, c: colIndex });
                                    setWrongAttempt(false);
                                    if (triggerAudio) triggerAudio('move');
                                  } else if (selectedSquare) {
                                    // Move queen to (1,5)
                                    if (selectedSquare.r === 5 && selectedSquare.c === 5 && rowIndex === 1 && colIndex === 5) {
                                      const nextBoard = puzzleBoard.map(row => [...row]);
                                      nextBoard[5][5] = '.';
                                      nextBoard[1][5] = 'Q';
                                      setPuzzleBoard(nextBoard);
                                      setSelectedSquare(null);
                                      setIsSolved(true);
                                      
                                      // Add starting coins
                                      const cCoins = Number(localStorage.getItem('coins')) || 500;
                                      const cXP = Number(localStorage.getItem('xp')) || 0;
                                      localStorage.setItem('coins', String(cCoins + 500));
                                      localStorage.setItem('xp', String(cXP + 50));
                                      
                                      if (triggerAudio) triggerAudio('win');
                                    } else {
                                      setWrongAttempt(true);
                                      if (triggerAudio) triggerAudio('error');
                                    }
                                  }
                                }}
                                className={`aspect-square flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-400/50 z-10 border border-amber-300 shadow-inner' 
                                    : isDark 
                                    ? 'bg-[#b58863]' 
                                    : 'bg-[#f0d9b5]'
                                }`}
                              >
                                {renderTutorPiece(cellValue)}

                                {isTargetf7 && (
                                  <div className="absolute inset-0 border border-red-500 animate-pulse rounded-sm z-10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                  </div>
                                )}

                                {isPathSquare && (
                                  <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white z-20 animate-pulse" />
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    </div>

                    {/* Player Info Bar */}
                    <div className="w-full max-w-sm bg-stone-950/60 rounded-2xl px-3 py-1.5 border border-stone-850 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center text-[8px] text-emerald-400 font-black select-none uppercase">
                          YOU
                        </div>
                        <div className="text-left">
                          <div className="text-[9px] text-white font-extrabold uppercase tracking-wide">Anda (Pecatur)</div>
                          <div className="text-[8px] text-emerald-400 font-bold font-mono tracking-wider">PUTIH JALAN & MENANG</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-stone-900/50 px-2 py-0.5 rounded-md border border-stone-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-emerald-400 font-bold">WHITE SIDE</span>
                      </div>
                    </div>

                    {wrongAttempt && (
                      <div className="w-full max-w-sm text-center text-[8px] font-black text-red-400 bg-red-950/40 border border-red-900/40 px-3 py-1 rounded-xl uppercase tracking-wide animate-shake">
                        {lang === 'en' ? 'Incorrect! Tap the Queen () then strike the f7 Pawn!' : 'Salah! Ketuk Ratu () lalu serang Pion f7!'}
                      </div>
                    )}

                    {isSolved ? (
                      <div className="w-full max-w-sm bg-emerald-950/40 p-2 rounded-2xl border border-emerald-900/40 text-[9px] font-black text-emerald-400 flex items-center justify-center gap-1 animate-bounce">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>{lang === 'en' ? 'MATE! Click Next below!' : 'SKAKMAT! Klik Lanjut di bawah!'}</span>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm bg-stone-950/30 p-1.5 rounded-2xl border border-stone-900/40 text-[9px] font-bold text-amber-400 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <span>{lang === 'en' ? 'Tactic: Tap Queen on f3, attack f7!' : 'Taktik: Ketuk Ratu f3, serang f7!'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Large Glowing Icon */
                  <div className="relative my-4 shrink-0 pointer-events-auto">
                    <div className="absolute inset-0 rounded-3xl bg-amber-500/15 blur-xl pointer-events-none animate-pulse" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-850 flex items-center justify-center relative shadow-inner">
                      <StepIcon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>
                  </div>
                )}

                {/* Bouncing Hint/Tip Label */}
                <div className="w-full bg-stone-950/50 p-2.5 rounded-2xl border border-stone-900/60 mt-2 text-[10.5px] font-bold text-emerald-400 flex items-center justify-center gap-1.5 px-3 shrink-0 pointer-events-auto">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
                  <span className="text-center text-emerald-300">
                    {lang === 'id' ? step.highlightTextId : step.highlightTextEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Pagination dots indicator */}
            <div className="flex justify-center gap-1.5 mt-3 mb-3 shrink-0 pointer-events-auto">
              {TOUR_STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full duration-300 ${
                    idx === currentStep 
                      ? 'w-5 bg-amber-500' 
                      : idx < currentStep 
                      ? 'w-1.5 bg-[#81b64c]/40' 
                      : 'w-1.5 bg-stone-800'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-stone-850 shrink-0 pointer-events-auto">
              {/* Back btn */}
              {currentStep > 0 ? (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-slate-300 hover:text-white border border-stone-800 hover:border-stone-750 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  {lang === 'en' ? "Back" : "Kembali"}
                </button>
              ) : (
                <div className="w-12" />
              )}

              {/* Skip btn */}
              {!isLast && (
                <button 
                  onClick={handleSkip}
                  className="text-[9px] text-zinc-500 hover:text-zinc-400 font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {lang === 'en' ? "Skip Tour" : "Lewati"}
                </button>
              )}

              {/* Next/Solve btn */}
              <button
                onClick={handleNext}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-md active:scale-95 duration-150 bg-gradient-to-r ${
                  step.isInteractiveChess && !isSolved
                    ? 'from-stone-700 to-stone-600 border border-stone-600 text-stone-400'
                    : isLast 
                    ? 'from-[#81b64c] to-green-500 hover:brightness-110 text-white' 
                    : 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                }`}
              >
                {isLast ? (
                  <>
                    {lang === 'en' ? "Let's Go!" : "Mulai!"}
                    <Check className="w-3.5 h-3.5" />
                  </>
                ) : step.isInteractiveChess && !isSolved ? (
                  <>
                    {lang === 'en' ? "Solve first" : "Selesaikan"}
                    <X className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    {lang === 'en' ? "Next" : "Lanjut"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
