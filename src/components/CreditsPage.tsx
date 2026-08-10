import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Shield, Sparkles, Code, Volume2, Cpu, Users, Trophy, Star, BookOpen, Layers, Award, Crown, Compass, Swords, Radio, History, CheckCircle2, Heart, Flag, ShieldCheck, Terminal, Disc, Zap, Smartphone, Globe, Monitor, Wrench } from 'lucide-react';

import palmateBannerHero from '../assets/images/palmate_banner_16_9_1782894241833.jpg';

import martinAvatar from '../assets/images/avatar_martin_1779709510230.png';
import nelsonAvatar from '../assets/images/nelson_avatar_1779712159293.png';
import wallyAvatar from '../assets/images/wally_avatar_1779712178593.png';
import magnusAvatar from '../assets/images/magnus_avatar_1779712198066.png';
import lilyAvatar from '../assets/images/lily_bot_cartoon_1786094757281.jpg';
import oscarAvatar from '../assets/images/oscar_bot_cartoon_1786094737765.jpg';
import juniorAvatar from '../assets/images/junior_bot_cartoon_1786094967966.jpg';
import vikramAvatar from '../assets/images/vikram_duo_style_1784811297014.jpg';

interface CreditsPageProps {
  onBack: () => void;
  prefLang?: string;
}

export const CreditsPage: React.FC<CreditsPageProps> = ({ onBack, prefLang = 'id' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedLevel, setSpeedLevel] = useState<number>(1); // 0 = Pelan, 1 = Sedang, 2 = Cepat
  const [isPausedByUser, setIsPausedByUser] = useState<boolean>(false);

  // Auto-scroll loop using requestAnimationFrame
  useEffect(() => {
    let animId: number;
    let lastTime: number | null = null;

    const getPxPerSec = () => {
      if (speedLevel === 0) return 35;
      if (speedLevel === 1) return 70;
      return 130;
    };

    const loop = (time: number) => {
      if (lastTime !== null) {
        const delta = (time - lastTime) / 1000;
        if (isPlaying && !isPausedByUser && containerRef.current) {
          const el = containerRef.current;
          el.scrollTop += getPxPerSec() * delta;

          // Rewind when reaching bottom
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            setTimeout(() => {
              if (containerRef.current) containerRef.current.scrollTop = 0;
            }, 2000);
          }
        }
      }
      lastTime = time;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPausedByUser, speedLevel]);

  const handleReset = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setIsPlaying(true);
  };

  const getSpeedText = () => {
    if (speedLevel === 0) return prefLang === 'en' ? 'Slow' : 'Pelan';
    if (speedLevel === 1) return prefLang === 'en' ? 'Normal' : 'Sedang';
    return prefLang === 'en' ? 'Fast' : 'Cepat';
  };

  // Strictly the 8 Bot Simulation Characters from CHARACTERS in data.ts
  const simulationBots = [
    { name: 'Martin Bot', rank: '250 ELO', avatar: martinAvatar, desc: 'Mentor pemula ramah yang suka blunder ringan untuk latihan awal.' },
    { name: 'Junior Bot', rank: '500 ELO', avatar: juniorAvatar, desc: 'Talenta cilik serba bisa dengan gaya main penuh ide kreatif.' },
    { name: 'Oscar Bot', rank: '800 ELO', avatar: oscarAvatar, desc: 'Pemain taktis menengah dengan jebakan kombinasi perwira seimbang.' },
    { name: 'Nelson Bot', rank: '1100 ELO', avatar: nelsonAvatar, desc: 'Pemain penyerang agresif yang selalu menerjunkan Menteri sejak awal.' },
    { name: 'Lily Bot', rank: '1400 ELO', avatar: lilyAvatar, desc: 'Pemain posisional tenang yang fokus pada struktur benteng & bidak.' },
    { name: 'Wally Bot', rank: '1700 ELO', avatar: wallyAvatar, desc: 'Pertahanan kokoh bak benteng batu, mengandalkan konter taktis cepat.' },
    { name: 'Vikram Bot', rank: '2100 ELO', avatar: vikramAvatar, desc: 'Pemain berkelas raja dengan penguasaan babak akhir (endgame) sempurna.' },
    { name: 'Magnus Bot', rank: '2500 ELO', avatar: magnusAvatar, desc: 'Master Agung tingkat tertinggi dengan akurasi perwira tanpa celah.' }
  ];

  return (
    <div className="relative h-[85vh] min-h-[550px] max-h-[920px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#23201a] via-[#121110] to-[#0a0908] text-slate-200 rounded-3xl border border-[#3c3832] shadow-2xl overflow-hidden flex flex-col">
      
      {/* ATMOSPHERIC AMBIENT GLOW & GRID PATTERN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-40" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#81b64c]/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR CONTROLS - NEATLY CONTAINED & RESPONSIVE */}
      <div className="p-3 sm:p-4 bg-[#181614]/95 backdrop-blur-md border-b border-[#322f2b] flex flex-wrap items-center justify-between gap-2 z-30 shrink-0">
        
        {/* LEFT: BACK BUTTON */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#262320] hover:bg-[#332f2b] text-slate-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-[#3f3b35] shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-[#81b64c]" />
          <span>{prefLang === 'en' ? 'Back' : 'Kembali'}</span>
        </button>

        {/* CENTER: TITLE */}
        <div className="flex items-center gap-2 min-w-0 px-2">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
            {prefLang === 'en' ? 'Grand Game Credits' : 'Kredit Pengembang Arena Grand Masterpiece'}
          </h2>
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#262320] hover:bg-[#332f2b] text-xs font-black text-white transition-all cursor-pointer border border-[#3f3b35]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">{prefLang === 'en' ? 'Pause' : 'Jeda'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">{prefLang === 'en' ? 'Play' : 'Mulai'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSpeedLevel((prev) => (prev + 1) % 3)}
            className="px-3 py-1.5 rounded-xl bg-[#262320] hover:bg-[#332f2b] text-xs font-black text-slate-300 transition-all cursor-pointer border border-[#3f3b35]"
          >
            {getSpeedText()}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#262320] hover:bg-[#332f2b] text-white transition-all cursor-pointer border border-[#3f3b35]"
            title="Reset Scroll"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* AUTO-SCROLLING ROLL CONTAINER */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPausedByUser(true)}
        onMouseLeave={() => setIsPausedByUser(false)}
        onTouchStart={() => setIsPausedByUser(true)}
        onTouchEnd={() => setTimeout(() => setIsPausedByUser(false), 2500)}
        className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-14 space-y-24 text-center select-none relative z-10"
      >
        {/* INITIAL TOP MARGIN */}
        <div className="h-12 sm:h-20" />

        {/* HERO BANNER SECTION - USING REAL PAL MATE HERO BANNER */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#81b64c]/40 shadow-2xl group">
            <img 
              src={palmateBannerHero} 
              alt="Pal Mate Chess Arena Banner" 
              className="w-full h-48 sm:h-80 object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/60 to-transparent flex flex-col justify-end p-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-[#81b64c] text-white text-[10px] font-black uppercase tracking-widest mx-auto mb-2 shadow-lg">
                <Crown className="w-3.5 h-3.5 text-amber-300" /> OFFICIAL ARENA MASTERPIECE
              </div>
              <h1 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tight drop-shadow-md">
                PAL MATE CHESS ARENA
              </h1>
              <p className="text-xs sm:text-base font-black text-[#81b64c] uppercase tracking-widest mt-2">
                A Game Created, Engineered & Orchestrated By Nopal Ganteng
              </p>
            </div>
          </div>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#81b64c] to-transparent mx-auto mt-6" />
        </div>

        {/* SECTION 1: EXECUTIVE LEADERSHIP & CREATOR */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-amber-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Executive Production & Leadership</span>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#24201a] via-[#1a1714] to-[#121110] border border-[#423d34] shadow-2xl space-y-4 text-center">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Game Director, Executive Producer & Principal Architect
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider text-[#81b64c]">
              NOPAL GANTENG
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed pt-4 border-t border-[#36322b] max-w-xl mx-auto">
              Memrakarsai, merancang, dan mengeksekusi seluruh arsitektur Pal Mate Chess Arena secara mandiri. Bertanggung jawab atas ideasi permainan, mekanik catur, kecerdasan buatan, visual studio, dan infrastruktur arena.
            </p>
          </div>
        </div>

        {/* SECTION 2: SOFTWARE & GAME ENGINE ARCHITECTURE */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-cyan-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Terminal className="w-4 h-4" />
            <span>Game Engine & Core Logic Engineering</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>Core Chess Rules & Board Engine</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Pengembangan logika legalitas langkah, FEN string parser, PGN move generator, deteksi skakmat, remis, serta aturan khusus En Passant & Rokade.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>Real-Time Multiplayer & Matchmaking</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Arsitektur komunikasi jaringan dua arah, sistem lobby PIN kamar, kalkulasi ELO rating nasional, serta mekanisme spectator mode.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>Full-Stack REST API & Database</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Sistem autentikasi user, otorisasi profil, sinkronisasi cloud Firestore, penyimpanan inventaris item, dan histori pertandingan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>UI/UX & Responsive Layout System</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Desain antarmuka fleksibel untuk HP Android, Tablet, & Desktop dengan tema gelap arena yang nyaman di mata.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>PWA & Push Notifications Service Worker</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Pengembangan Service Worker offline PWA, pemicu notifikasi pengingat streak harian, dan respons tombol check-in instan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2">
              <div className="text-xs font-black text-white uppercase flex items-center justify-between">
                <span>Evaluation & Move Analysis Engine</span>
                <span className="text-[10px] text-[#81b64c] font-bold">NOPAL GANTENG</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Modul kalkulasi blunder, temuan taktik terbaik, bar evaluasi keunggulan perwira, serta ringkasan usai laga.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: SIMULATION BOT ROSTER (STRICTLY THE 8 SIMULATION BOTS WITH AVATAR IMAGES) */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-emerald-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Cpu className="w-4 h-4" />
            <span>AI Bot Simulation Roster</span>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Bot Personality Architecture & Difficulty Scaling By NOPAL GANTENG
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {simulationBots.map((bot, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] space-y-2.5 hover:border-[#81b64c]/50 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={bot.avatar} alt={bot.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#81b64c] shadow-md shrink-0" />
                    <div>
                      <div className="text-xs font-black text-white uppercase">{bot.name}</div>
                      <div className="text-[10px] font-extrabold text-[#81b64c] bg-[#81b64c]/10 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-[#81b64c]/20">{bot.rank}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{bot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: VISUAL ART, GRAPHICS & COSMETICS DIRECTION */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-purple-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Visual Art & Cosmetics Studio</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#181614] border border-[#33302b] text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-3">
              <span className="text-xs font-black text-white uppercase">Lead Visual Artist & Animator</span>
              <span className="text-xs font-black text-[#81b64c]">NOPAL GANTENG</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <h5 className="text-xs font-bold text-amber-400 uppercase mb-1">Papan & Set Bidak Arena</h5>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Papan Classic Wood, Emerald Forest, Cosmic Nebula, Magma Lava, Ice Freeze. Set Bidak Neon Cyber, Gold Royal, & Glass Frost.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-cyan-400 uppercase mb-1">Aksesori & Bingkai Profil</h5>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Efek ledakan visual skakmat, bingkai aura master, avatar perwira kustom, serta gelar kehormatan klan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: AUDIO SYNTHESIS & SOUND SYSTEM */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-rose-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Volume2 className="w-4 h-4" />
            <span>Audio & Sound Synthesis Studio</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#181614] border border-[#33302b] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-3">
              <span className="text-xs font-black text-white uppercase">Sound Designer & Audio Synthesizer Architect</span>
              <span className="text-xs font-black text-[#81b64c]">NOPAL GANTENG</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Arsitektur suara instan tanpa sampel berat menggunakan Web Audio API Synthesizer. Menghasilkan bunyi kayu bidak, chimes kemenangan, peringatan skak, dan ambience lobi arena.
            </p>
          </div>
        </div>

        {/* SECTION 6: GAMEPLAY FEATURES & COMMUNITY SYSTEMS */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-yellow-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Trophy className="w-4 h-4" />
            <span>Gameplay Systems & Community Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] space-y-1">
              <div className="text-xs font-black text-white uppercase">Sistem Suku & Klan Catur</div>
              <div className="text-[10px] text-[#81b64c] font-bold">Designer: NOPAL GANTENG</div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Sistem pembentukan klan, pertarungan klan vs klan, papan peringkat suku, dan kontribusi anggota.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] space-y-1">
              <div className="text-xs font-black text-white uppercase">Taktik Puzzle & Evaluasi</div>
              <div className="text-[10px] text-[#81b64c] font-bold">Designer: NOPAL GANTENG</div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Modul puzzle catur harian, evaluasi blunder, materi pelajaran bertahap, dan sistem replay.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] space-y-1">
              <div className="text-xs font-black text-white uppercase">Season Pass & Liga ELO</div>
              <div className="text-[10px] text-[#81b64c] font-bold">Designer: NOPAL GANTENG</div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Mekanisme riset musim global, hadiah leveling, gacha pasar koin, dan kualifikasi turnamen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] space-y-1">
              <div className="text-xs font-black text-white uppercase">Sistem Forum & Pasar Deals</div>
              <div className="text-[10px] text-[#81b64c] font-bold">Designer: NOPAL GANTENG</div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Diskusi taktik antar pecatur, penawaran item eksklusif, dan pasar gacha bergaransi.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 7: LOCALIZATION & LANGUAGE SUPPORT */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-indigo-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Globe className="w-4 h-4" />
            <span>Localization & Language Support</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#181614] border border-[#33302b] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-2">
              <span className="text-xs font-black text-white uppercase">Primary Language Support</span>
              <span className="text-xs font-black text-[#81b64c]">Bahasa Indonesia (Full Native)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-2">
              <span className="text-xs font-black text-white uppercase">Indonesian Chess Terminology & Localization Lead</span>
              <span className="text-xs font-black text-[#81b64c]">NOPAL GANTENG</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">
              Seluruh istilah catur, narasi tutorial, petunjuk taktik, dialog bot AI, dan antarmuka arena dirancang khusus secara mendalam dalam Bahasa Indonesia untuk kenyamanan pencatur tanah air.
            </p>
          </div>
        </div>

        {/* SECTION 8: QUALITY ASSURANCE & TESTING */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-cyan-400 text-xs font-black uppercase tracking-wider shadow-md">
            <ShieldCheck className="w-4 h-4" />
            <span>Quality Assurance & Testing</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#181614] border border-[#33302b] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-3">
              <span className="text-xs font-black text-white uppercase">Lead QA Engineer & Bug Hunting</span>
              <span className="text-xs font-black text-[#81b64c]">NOPAL GANTENG</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#2e2b27] pb-3">
              <span className="text-xs font-black text-white uppercase">Community Beta Testing Team</span>
              <span className="text-xs font-black text-amber-400">Pecatur Komunitas Pal Mate</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">
              Pengujian ekstensif terhadap ribuan simulasi langkah catur, kestabilan jaringan multiplayer, integritas ELO, serta perlindungan dari bug mekanis.
            </p>
          </div>
        </div>

        {/* SECTION 9: TECHNICAL STACK & TOOLS */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-blue-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Wrench className="w-4 h-4" />
            <span>Technology Stack & Frameworks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-[#181614] border border-[#33302b]">
              <div className="text-xs font-black text-white">React 18 & Vite</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Frontend Runtime</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181614] border border-[#33302b]">
              <div className="text-xs font-black text-white">Tailwind CSS</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Styling Engine</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181614] border border-[#33302b]">
              <div className="text-xs font-black text-white">Google Firestore</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Cloud Database</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181614] border border-[#33302b]">
              <div className="text-xs font-black text-white">Web Audio API</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Sound Synthesizer</div>
            </div>
          </div>
        </div>

        {/* SECTION 10: PATCH HISTORY & ROADMAP */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-amber-400 text-xs font-black uppercase tracking-wider shadow-md">
            <History className="w-4 h-4" />
            <span>Roadmap & Version Evolution</span>
          </div>

          <div className="space-y-3 text-left">
            {[
              { version: 'v1.0', title: 'Fondasi Utama Arena', desc: 'Papan catur interaktif, bot AI pemula, dan aturan catur FIDE standar.' },
              { version: 'v1.2', title: 'Mode Duel Online & PIN', desc: 'Sistem matchmaking real-time, kamar duel teman, & peringkat ELO.' },
              { version: 'v1.5', title: 'Ekosistem Suku Klan', desc: 'Pembentukan klan catur, perang klan vs klan, & pasar koin.' },
              { version: 'v1.8', title: 'Season Pass & Kosmetik', desc: 'Sistem riset musim global, bingkai profil, & efek skakmat.' },
              { version: 'v2.0', title: 'Masterpiece Edition', desc: 'Roster Bot AI lengkap, analisis evaluasi langkah, & PWA Widget.' },
              { version: 'v2.5', title: 'Grand Masterpiece Roll', desc: 'Notifikasi push Service Worker, fitur streak pengingat, & Kredit Pengembang Akurat.' }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#181614] border border-[#33302b] flex items-start gap-4">
                <span className="px-2.5 py-1 rounded-lg bg-[#81b64c]/20 text-[#81b64c] text-xs font-black border border-[#81b64c]/30 shrink-0">
                  {item.version}
                </span>
                <div>
                  <div className="text-xs font-black text-white uppercase">{item.title}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 11: ACKNOWLEDGMENTS & SPECIAL THANKS */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1c19] border border-[#3a3733] text-rose-400 text-xs font-black uppercase tracking-wider shadow-md">
            <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
            <span>Special Thanks & Dedication</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#181614] border border-[#33302b] space-y-3 text-xs text-slate-300">
            <p className="font-bold text-white uppercase tracking-wider">Seluruh Komunitas Pecatur Indonesia</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Terima kasih sebesar-besarnya kepada seluruh pencatur, ketua klan, penguji beta, dan penikmat catur di seluruh Indonesia yang telah mendukung Pal Mate Chess Arena hingga berkembang menjadi arena digital seutuhnya.
            </p>
          </div>
        </div>

        {/* FOOTER & COPYRIGHT */}
        <div className="pt-12 pb-16 border-t border-[#33302b] max-w-md mx-auto space-y-3">
          <div className="text-sm font-black text-white uppercase tracking-widest">
            PAL MATE CHESS ARENA
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Copyright (c) 2026 Pal Mate Chess Studio. All Rights Reserved.
          </p>
          <p className="text-[10px] font-black text-[#81b64c] uppercase tracking-wider pt-2">
            Masterpiece Game Catur Oleh Nopal Ganteng Untuk Indonesia
          </p>
        </div>

        {/* EXTRA SPACER TO COMPLETE SCROLL ROLL */}
        <div className="h-40" />
      </div>
    </div>
  );
};
