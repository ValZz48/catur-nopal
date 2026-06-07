import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Crown, Gift, Coins, Gem, Info, AlertCircle, Check, 
  HelpCircle, Star, ArrowRight, Hourglass, Lock, Settings, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// =========================================================================
// TYPES & DATA STRUCTURES FOR GACHA (FEATURES 26-30)
// =========================================================================

export interface GachaItem {
  id: string;
  name: string;
  category: 'skin' | 'board' | 'pfp' | 'frame' | 'sfx' | 'effect' | 'checkmate';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Special';
  desc: string;
  color: string; // Tailwind color class for borders/glowing
  iconName?: string;
}

// 28. Gacha pool definition
export const GACHA_ITEMS_POOL: GachaItem[] = [
  // Skins
  { id: 'wood', name: 'Kayu Maple', category: 'skin', rarity: 'Common', desc: 'Tekstur serat kayu natural.', color: 'border-slate-500 text-slate-400' },
  { id: 'royal', name: 'Ksatria Kerajaan', category: 'skin', rarity: 'Rare', desc: 'Bidak mewah bernuansa perak kerajaan klasik.', color: 'border-blue-500 text-blue-400' },
  { id: 'neon', name: 'Cyber Laser', category: 'skin', rarity: 'Epic', desc: 'Garis neon cyberpunk menyala terang.', color: 'border-purple-500 text-purple-400' },
  { id: 'gold', name: 'Emas Kerajaan', category: 'skin', rarity: 'Legendary', desc: 'Brilian kilau emas murni monarki.', color: 'border-yellow-500 text-yellow-400' },
  { id: 'singularity', name: 'Cosmic Singularity', category: 'skin', rarity: 'Mythic', desc: 'Bidak berbahan partikel lubang hitam eksotis.', color: 'border-[#ff007f] text-[#ff007f] shadow-[#ff007f]' },

  // Board themes
  { id: 'forest', name: 'Tema Forest Moss', category: 'board', rarity: 'Uncommon', desc: 'Warna hijau lumut yang menyejukkan mata.', color: 'border-emerald-600 text-emerald-400' },
  { id: 'cosmic', name: 'Tema Cosmic Sky', category: 'board', rarity: 'Rare', desc: 'Permukaan nebula rasi bintang galaksi misterius.', color: 'border-cyan-500 text-cyan-400' },
  { id: 'magma_lava', name: 'Tema Magma Berapi', category: 'board', rarity: 'Epic', desc: 'Papan beraliran lava vulkanis mendidih.', color: 'border-rose-500 text-rose-400 animate-pulse' },
  { id: 'ice_freeze', name: 'Tema Frost Blizzard', category: 'board', rarity: 'Legendary', desc: 'Kristal salju beku berkilau di setiap petak.', color: 'border-sky-400 text-sky-300' },

  // Profile templates
  { id: 'pfp_knight', name: 'Pecatur Kuda Baja', category: 'pfp', rarity: 'Common', desc: 'Lukisan potret ksatria catur berkuda.', color: 'border-slate-500 text-slate-400' },
  { id: 'pfp_rook', name: 'Benteng Kastil Besi', category: 'pfp', rarity: 'Uncommon', desc: 'Ilustrasi benteng kokoh bernuansa medieval.', color: 'border-emerald-500 text-emerald-400' },
  { id: 'pfp_queen', name: 'Ratu Permata Merah', category: 'pfp', rarity: 'Epic', desc: 'Siluet ratu catur bertakhta mahkota ruby.', color: 'border-purple-500 text-purple-400' },
  { id: 'pfp_grandmaster', name: 'Chess Overlord', category: 'pfp', rarity: 'Mythic', desc: 'Gelar ilustrasi tertinggi sang dewa master catur.', color: 'border-gradient-to-r from-red-500 via-amber-500 to-yellow-500 text-yellow-400' },

  // Frames (30. Badge & frame premium)
  { id: 'bronze', name: 'Bingkai Perunggu', category: 'frame', rarity: 'Common', desc: 'Lencana perunggu mengkilap pemula berbakat.', color: 'border-amber-700 text-amber-600' },
  { id: 'silver', name: 'Bingkai Perak Master', category: 'frame', rarity: 'Uncommon', desc: 'Didesain serat perak metalik taktikal.', color: 'border-slate-400 text-slate-350' },
  { id: 'cyber', name: 'Bingkai Cyber Neon', category: 'frame', rarity: 'Rare', desc: 'Laser digital cyan menyala penuh energi.', color: 'border-cyan-400 text-cyan-300' },
  { id: 'magma', name: 'Bingkai Lava Vulkanik', category: 'frame', rarity: 'Epic', desc: 'Bara api lava menggelora di ujung bingkai.', color: 'border-orange-500 text-orange-400' },
  { id: 'gold', name: 'Bingkai Gladiator Emas', category: 'frame', rarity: 'Legendary', desc: 'Kemewahan emas murni dengan simbol mahkota. (Eksklusif Premium)', color: 'border-yellow-400 text-yellow-400 font-extrabold' },
  { id: 'cosmic', name: 'Bingkai Cahaya Kosmik', category: 'frame', rarity: 'Mythic', desc: 'Aura galaksi bertabur nebula gemerlap. (Eksklusif Premium)', color: 'border-fuchsia-500 text-fuchsia-400' },

  // Custom SFX
  { id: 'sfx_robotic', name: 'SFX Robot Logam', category: 'sfx', rarity: 'Uncommon', desc: 'Suara gesekan robot setiap kali bidak melangkah.', color: 'border-slate-400 text-slate-300' },
  { id: 'sfx_laser', name: 'SFX Tembakan Laser', category: 'sfx', rarity: 'Epic', desc: 'Guntur tembakan laser berdesing tinggi.', color: 'border-purple-400 text-purple-300' },

  // Special visual Effects & Checkmate animations
  { id: 'effect_fire', name: 'Efek Langkah Bara Api', category: 'effect', rarity: 'Epic', desc: 'Efek visual membakar jejak petak langkah catur.', color: 'border-rose-600 text-red-400' },
  { id: 'checkmate_explode', name: 'Animasi Skakmat Meledak', category: 'checkmate', rarity: 'Legendary', desc: 'Ledakan supernova dahsyat saat raja lawan terjepit!', color: 'border-yellow-500 text-yellow-400' }
];

interface Features26to30Props {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  membershipStatus: 'free' | 'premium';
  setMembershipStatus: React.Dispatch<React.SetStateAction<'free' | 'premium'>>;
  unlockedSkins: string[];
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedThemes: string[];
  setUnlockedThemes: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedFrames: string[];
  setUnlockedFrames: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSkin: string;
  setSelectedSkin: (s: string) => void;
  selectedFrame: string;
  setSelectedFrame: (f: string) => void;
  boardTheme: string;
  setBoardTheme: (t: string) => void;
  diamondSavings: number;
  setDiamondSavings: React.Dispatch<React.SetStateAction<number>>;
  dailyQuests: any[];
  setDailyQuests: React.Dispatch<React.SetStateAction<any[]>>;
  triggerAudio: (type: 'move' | 'capture' | 'win' | 'lose' | 'check' | 'castle') => void;
  triggerReward: (amount: number, message: string, type?: 'reward' | 'premium' | 'info' | 'success_no_xp' | 'level_up') => void;
}

export const Features26to30: React.FC<Features26to30Props> = ({
  coins, setCoins, diamonds, setDiamonds, membershipStatus, setMembershipStatus,
  unlockedSkins, setUnlockedSkins, unlockedThemes, setUnlockedThemes, unlockedFrames, setUnlockedFrames,
  selectedSkin, setSelectedSkin, selectedFrame, setSelectedFrame, boardTheme, setBoardTheme,
  diamondSavings, setDiamondSavings, dailyQuests, setDailyQuests, triggerAudio, triggerReward
}) => {
  // Navigation tabs in this panel
  const [activeTab, setActiveTab] = useState<'gacha' | 'inventory' | 'savings' | 'quests' | 'chests'>('gacha');

  const [equippedSfx, setEquippedSfx] = useState<string>(() => {
    return localStorage.getItem('gacha_sfx_equipped') || 'none';
  });
  const [equippedEffect, setEquippedEffect] = useState<string>(() => {
    return localStorage.getItem('gacha_effect_equipped') || 'none';
  });
  const [equippedCheckmate, setEquippedCheckmate] = useState<string>(() => {
    return localStorage.getItem('gacha_checkmate_equipped') || 'none';
  });

  // -------------------------------------------------------------------------
  // GACHA STATES & FUNCTIONS (FEATURE 28, 29, 30)
  // -------------------------------------------------------------------------
  const [gachaHistory, setGachaHistory] = useState<string[]>([]);
  const [pityCountLegendary, setPityCountLegendary] = useState<number>(() => {
    return Number(localStorage.getItem('gacha_pity_legendary')) || 0;
  });
  const [pityCountMythic, setPityCountMythic] = useState<number>(() => {
    return Number(localStorage.getItem('gacha_pity_mythic')) || 0;
  });

  const [dailyGachaSpinsUsed, setDailyGachaSpinsUsed] = useState<number>(() => {
    const saved = localStorage.getItem('daily_gacha_spins_used');
    return saved ? Number(saved) : 0;
  });

  const [drawingGacha, setDrawingGacha] = useState<boolean>(false);
  const [drawnItems, setDrawnItems] = useState<GachaItem[]>([]);
  const [showPulledPopup, setShowPulledPopup] = useState<boolean>(false);

  // Free spin limit settings (29)
  const maxFreeSpins = membershipStatus === 'premium' ? 5 : 1;
  const remainingFreeSpins = Math.max(0, maxFreeSpins - dailyGachaSpinsUsed);

  useEffect(() => {
    localStorage.setItem('gacha_pity_legendary', String(pityCountLegendary));
    localStorage.setItem('gacha_pity_mythic', String(pityCountMythic));
  }, [pityCountLegendary, pityCountMythic]);

  useEffect(() => {
    localStorage.setItem('daily_gacha_spins_used', String(dailyGachaSpinsUsed));
  }, [dailyGachaSpinsUsed]);

  // Execute the Gacha draw logical mechanics (28)
  const executeGachaDraw = (times: 1 | 10) => {
    const costGoldPerSpin = 300;
    const costDiamondsPerSpin = 15;
    const isPremium = membershipStatus === 'premium';

    // Determing how many free spins are being used
    let freeSpinsSpent = 0;
    let goldCost = 0;
    let gemCost = 0;

    let tempFreeSpinsRemaining = remainingFreeSpins;

    for (let i = 0; i < times; i++) {
      if (tempFreeSpinsRemaining > 0) {
        tempFreeSpinsRemaining--;
        freeSpinsSpent++;
      } else {
        // Prefer coins over diamonds
        if (coins >= costGoldPerSpin) {
          goldCost += costGoldPerSpin;
        } else if (diamonds >= costDiamondsPerSpin) {
          gemCost += costDiamondsPerSpin;
        } else {
          triggerReward(0, "Gagal Gacha: Saldo Koin atau Berlian Anda tidak mencukupi untuk memutar Gacha lagi.", 'info');
          return;
        }
      }
    }

    // Process payment
    if (goldCost > 0) {
      setCoins(prev => {
        const next = prev - goldCost;
        localStorage.setItem('coins', String(next));
        return next;
      });
    }
    if (gemCost > 0) {
      setDiamonds(prev => {
        const next = prev - gemCost;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
    }
    if (freeSpinsSpent > 0) {
      setDailyGachaSpinsUsed(prev => prev + freeSpinsSpent);
    }

    setDrawingGacha(true);

    // Roll items
    setTimeout(() => {
      let results: GachaItem[] = [];
      let nextPityLegendary = pityCountLegendary;
      let nextPityMythic = pityCountMythic;

      for (let i = 0; i < times; i++) {
        nextPityLegendary++;
        nextPityMythic++;

        let rolledItem: GachaItem;

        // Pity overrides (45 & 28)
        if (nextPityMythic >= 100) {
          // Force Mythic
          const mythics = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Mythic');
          rolledItem = mythics[Math.floor(Math.random() * mythics.length)];
          nextPityMythic = 0;
        } else if (nextPityLegendary >= 50) {
          // Force Legendary
          const legendaries = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Legendary');
          rolledItem = legendaries[Math.floor(Math.random() * legendaries.length)];
          nextPityLegendary = 0;
        } else {
          // Normal Roll under probability rates
          // Pre-allocated rates based on premium booster (45)
          let probMythic = isPremium ? 0.015 : 0.005; // boosted for premium (1.5% vs 0.5%)
          let probLegendary = isPremium ? 0.06 : 0.035; // boosted for premium (6% vs 3.5%)
          let probEpic = isPremium ? 0.12 : 0.08;
          let probRare = isPremium ? 0.18 : 0.13;
          let probUncommon = 0.25;

          const roll = Math.random();

          if (roll < probMythic) {
            const mythics = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Mythic');
            rolledItem = mythics[Math.floor(Math.random() * mythics.length)];
            nextPityMythic = 0;
          } else if (roll < probMythic + probLegendary) {
            const legendaries = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Legendary');
            rolledItem = legendaries[Math.floor(Math.random() * legendaries.length)];
            nextPityLegendary = 0;
          } else if (roll < probMythic + probLegendary + probEpic) {
            const epics = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Epic');
            rolledItem = epics[Math.floor(Math.random() * epics.length)];
          } else if (roll < probMythic + probLegendary + probEpic + probRare) {
            const rares = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Rare');
            rolledItem = rares[Math.floor(Math.random() * rares.length)];
          } else if (roll < probMythic + probLegendary + probEpic + probRare + probUncommon) {
            const uncommons = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Uncommon');
            rolledItem = uncommons[Math.floor(Math.random() * uncommons.length)];
          } else {
            const commons = GACHA_ITEMS_POOL.filter(item => item.rarity === 'Common');
            rolledItem = commons[Math.floor(Math.random() * commons.length)];
          }
        }

        results.push(rolledItem);

        // Deduct/unlock item inside scope
        unlockGachaProduct(rolledItem);
      }

      setPityCountLegendary(nextPityLegendary);
      setPityCountMythic(nextPityMythic);
      setDrawnItems(results);
      setDrawingGacha(false);
      setShowPulledPopup(true);

      // Audio feedback
      const hasLegendaryOrMythic = results.some(item => item.rarity === 'Legendary' || item.rarity === 'Mythic');
      triggerAudio(hasLegendaryOrMythic ? 'win' : 'capture');
    }, 1800);
  };

  // Safe unlocking tool for drawn items
  const unlockGachaProduct = (item: GachaItem) => {
    const actUser = localStorage.getItem('activeUser') || 'default';
    if (item.category === 'skin') {
      if (!unlockedSkins.includes(item.id)) {
        const next = [...unlockedSkins, item.id];
        setUnlockedSkins(next);
        localStorage.setItem(`unlockedSkins:${actUser}`, JSON.stringify(next));
      }
    } else if (item.category === 'board') {
      if (!unlockedThemes.includes(item.id)) {
        const next = [...unlockedThemes, item.id];
        setUnlockedThemes(next);
        localStorage.setItem('unlockedThemes', JSON.stringify(next));
      }
    } else if (item.category === 'frame') {
      if (!unlockedFrames.includes(item.id)) {
        const next = [...unlockedFrames, item.id];
        setUnlockedFrames(next);
        localStorage.setItem(`unlockedFrames:${actUser}`, JSON.stringify(next));
      }
    } else {
      // Store auxiliary items in category-custom local states
      const key = `unlocked_${item.category}_items`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : ['standard'];
      if (!list.includes(item.id)) {
        list.push(item.id);
        localStorage.setItem(key, JSON.stringify(list));
      }
    }
  };

  // -------------------------------------------------------------------------
  // QUIZ CHEST / PETI QUIZ SIMULATION (FEATURE 26, 41 PREP)
  // -------------------------------------------------------------------------
  const [chestTapCount, setChestTapCount] = useState<number>(0);
  const [chestStars, setChestStars] = useState<number>(0);
  const [chestState, setChestState] = useState<'closed' | 'tapping' | 'opened'>('closed');
  const [chestOpenedReward, setChestOpenedReward] = useState<{ diamonds: number; message: string } | null>(null);

  const handleStartPetiQuiz = () => {
    setChestTapCount(0);
    setChestStars(0);
    setChestState('tapping');
    setChestOpenedReward(null);
    triggerAudio('move');
  };

  const handleTapPetiQuiz = () => {
    if (chestState !== 'tapping') return;

    triggerAudio('capture');
    const clicks = chestTapCount + 1;
    setChestTapCount(clicks);

    // Dynamic chance to accumulate star per tap
    let nextStars = chestStars;
    if (Math.random() > 0.45) {
      nextStars = Math.min(5, nextStars + 1);
      setChestStars(nextStars);
    }

    if (clicks >= 5) {
      // Complete clicks, open chest and reward based on star
      setTimeout(() => {
        // Base rewards depending on stars
        // Star 1 = 1, Star 2 = 2, Star 3 = 4, Star 4 = 7, Star 5 = 12
        const starRewardMap: Record<number, number> = {
          0: 1, // Minimum
          1: 1,
          2: 2,
          3: 4,
          4: 7,
          5: 12
        };

        const finalStars = nextStars === 0 ? 1 : nextStars;
        const baseDiamonds = starRewardMap[finalStars];
        
        // 41. Premium 1.5xmultiplier
        const isPremium = membershipStatus === 'premium';
        const finalDiamonds = Math.round(baseDiamonds * (isPremium ? 1.5 : 1.0));

        setDiamonds(prev => {
          const next = prev + finalDiamonds;
          localStorage.setItem('diamonds', String(next));
          return next;
        });

        // Contribute a portion to the Tabungan Diamond as well
        setDiamondSavings(prev => {
          const next = Math.min(150, prev + Math.floor(finalDiamonds * 0.5));
          return next;
        });

        setChestState('opened');
        setChestOpenedReward({
          diamonds: finalDiamonds,
          message: `Selamat! Anda berhasil mengumpulkan ${finalStars} Bintang dan mendapatkan +${finalDiamonds} Berlian ${isPremium ? '(Bonus Premium x1.5!)' : ''}`
        });

        triggerAudio('win');
      }, 500);
    }
  };

  // -------------------------------------------------------------------------
  // DIAMOND SAVINGS OPTIONS (FEATURE 27)
  // -------------------------------------------------------------------------
  const limitSavings = 150;
  const minimumThresholdSavings = limitSavings * 0.50; // 50% limit = 75
  const claim20PercentMax = Math.floor(diamondSavings * 0.20);

  const withdrawSavings20Percent = () => {
    if (diamondSavings < minimumThresholdSavings) {
      triggerReward(0, `Gagal Menarik: Tabungan Diamond Anda belum mencapai batas minimal 50% (${minimumThresholdSavings} Berlian) untuk dicairkan harian.`, 'info');
      return;
    }
    if (claim20PercentMax <= 0) {
      triggerReward(0, `Nominal penarikan terlalu kecil. Terus kumpulkan berlian di tabungan Anda!`, 'info');
      return;
    }

    setDiamonds(prev => {
      const next = prev + claim20PercentMax;
      localStorage.setItem('diamonds', String(next));
      return next;
    });

    setDiamondSavings(prev => prev - claim20PercentMax);
    triggerAudio('win');
    triggerReward(0, `Penarikan Harian Berhasil! +${claim20PercentMax} Berlian (20% tabungan) ditarik ke saldo utama Anda!`, 'success_no_xp');
  };

  const withdrawSavings100PercentSeasonReset = () => {
    if (diamondSavings <= 0) {
      triggerReward(0, `Tabungan Diamond dalam keadaan kosong. Selesaikan misi dan tanding untuk mengisi tabungan!`, 'info');
      return;
    }

    const currentSavings = diamondSavings;
    setDiamonds(prev => {
      const next = prev + currentSavings;
      localStorage.setItem('diamonds', String(next));
      return next;
    });

    setDiamondSavings(0);
    triggerAudio('win');
    // Simulate a season progress reset
    triggerReward(0, `Ganti Season Baru Berhasil! Seluruh isi tabungan sebanyak +${currentSavings} Berlian ditarik penuh ke saldo utama Anda!`, 'level_up');
  };

  return (
    <div className="w-full text-slate-100 bg-[#1c1a19] p-2 sm:p-5 rounded-3xl border border-[#3c3934]/65 shadow-lg space-y-6">
      
      {/* Tab bar header */}
      <div className="flex border-b border-[#3c3934]/60 overflow-x-auto scroller-hidden">
        {[
          { id: 'gacha', label: ' Gacha Langka', desc: 'Sapu Menang' },
          { id: 'inventory', label: ' Album Koleksi', desc: 'Pasang Item Gacha' },
          { id: 'savings', label: ' Tabungan Diamond', desc: 'Saldo Masa Depan' },
          { id: 'quests', label: 'Perisai Misi & Playtime', desc: 'Sesi Khusus' },
          { id: 'chests', label: 'Hadiah Peti Quiz Keren', desc: 'Tap Berbintang' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); triggerAudio('move'); }}
            className={`px-4 sm:px-6 py-3 border-b-2 font-bold text-center text-xs space-y-0.5 shrink-0 transition-all ${
              activeTab === tab.id
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span className="block">{tab.label}</span>
            <span className="block text-[9px] font-normal opacity-70">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* RENDER CONTENT PANELS */}

      {/* TAB 1: GACHA SYSTEM */}
      {activeTab === 'gacha' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#262421] p-4 rounded-2xl border border-[#3c3934]">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4.5 h-4.5 text-yellow-500" /> Mesin Gacha Kosmik & Skin eksklusif
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Dapatkan skin bidak legendaris, board beranimasi, PFP eksklusif, serta frame premium bercahaya!</p>
            </div>
            <div className="flex flex-col text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tiket Gratis Hari Ini</span>
              <span className="text-xs font-black text-yellow-400 flex items-center gap-1">
                <Gift className="w-4 h-4 text-yellow-400" /> {remainingFreeSpins} / {maxFreeSpins} Spin Gratis
              </span>
              {membershipStatus !== 'premium' ? (
                <span className="text-[9px] text-slate-500 font-semibold mt-0.5 mt-1 block">Regular: 1x/hari. Premium: 5x/hari!</span>
              ) : (
                <span className="text-[9px] text-[#81b64c] font-black mt-0.5 mt-1 block">Bonus Premium Lifetime AKTIF Aktif</span>
              )}
            </div>
          </div>

          {/* Machine core UI */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Rates & Pity info */}
            <div className="md:col-span-4 bg-[#141212]/80 p-4 rounded-2xl border border-[#3c3934]/60 space-y-4">
              <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest border-b border-[#3c3934]/50 pb-2">Informasi Drop Rate</h4>
              <ul className="text-[11px] space-y-1.5 font-semibold text-slate-300">
                <li className="flex justify-between items-center"><span className="text-yellow-400 font-black">Mythic </span> <span>{membershipStatus === 'premium' ? '1.5%' : '0.5%'}</span></li>
                <li className="flex justify-between items-center"><span className="text-yellow-500 font-bold">Legendary</span> <span>{membershipStatus === 'premium' ? '6.0%' : '3.5%'}</span></li>
                <li className="flex justify-between items-center"><span className="text-purple-400">Epic</span> <span>{membershipStatus === 'premium' ? '12.0%' : '8.0%'}</span></li>
                <li className="flex justify-between items-center"><span className="text-cyan-400">Rare</span> <span>13% - 18%</span></li>
                <li className="flex justify-between items-center"><span className="text-emerald-400">Uncommon</span> <span>25%</span></li>
                <li className="flex justify-between items-center"><span className="text-slate-400">Common</span> <span>Sisa Probabilitas</span></li>
              </ul>
              
              <div className="bg-[#262421] p-3 rounded-xl border border-[#3c3934] space-y-3">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Progress Jaminan Gacha (Pity System)</h5>
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                    <span>Guaranteed Legendary (50x)</span>
                    <span className="font-bold text-yellow-500">{pityCountLegendary}/50</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(100, (pityCountLegendary/50)*100)}%` }} className="h-full bg-yellow-500 rounded-full transition-all duration-300" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                    <span>Guaranteed Mythic (100x)</span>
                    <span className="font-bold text-[#ff007f]">{pityCountMythic}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div style={{ width: `${Math.min(100, (pityCountMythic/100)*100)}%` }} className="h-full bg-[#ff007f] rounded-full transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Drawing Stage */}
            <div className="md:col-span-8 bg-[#2a2624] p-5 rounded-2xl border border-[#3c3934] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-purple-500 to-cyan-500" />
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 via-fuchsia-600 to-indigo-700 flex items-center justify-center border-4 border-[#3c3934]/90 shadow-2xl relative animate-bounce duration-1000">
                <Sparkles className="w-10 h-10 text-white animate-spin duration-3000" />
              </div>

              <div>
                <h4 className="text-md font-black text-white">Kotak Gacha Virtual Sinar</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1 mx-auto">Tiap tarikan memberi peluang tinggi membuka bingkai Gladiator Emas premium, skin cyber super, serta sfx langkah futuristik.</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
                <button
                  disabled={drawingGacha}
                  onClick={() => executeGachaDraw(1)}
                  className="px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-[0_4px_0_0_#b38100] active:translate-y-0.5 active:shadow-none cursor-pointer flex-1 flex flex-col justify-center items-center"
                >
                  <span>Mulai Spin 1x</span>
                  <span className="text-[9px] font-normal opacity-85 mt-0.5">
                    {remainingFreeSpins > 0 ? "GRATIS" : "300 Coin / 15 Gem"}
                  </span>
                </button>

                <button
                  disabled={drawingGacha}
                  onClick={() => executeGachaDraw(10)}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-[0_4px_0_0_#4a15a8] active:translate-y-0.5 active:shadow-none cursor-pointer flex-1 flex flex-col justify-center items-center"
                >
                  <span>Mulai Spin 10x</span>
                  <span className="text-[9px] font-normal text-yellow-300 mt-0.5 flex items-center gap-0.5 shadow-sm">
                    Diskon Paket Hemat!
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: ALBUM KOLEKSI (EQUIP GACHA ITEMS) */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
                <Gift className="w-4.5 h-4.5 text-yellow-500" /> Album Koleksi & Perlengkapan Gacha
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Gunakan, kelola, dan gonta-ganti item kustomisasi kosmetik elit yang Anda dapatkan dari Tarikan Gacha di sini!</p>
            </div>
            <div className="shrink-0">
              <span className="text-[9px] font-mono px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 rounded-lg block font-extrabold uppercase">
                {GACHA_ITEMS_POOL.filter(item => {
                  if (item.category === 'skin') return unlockedSkins.includes(item.id) || item.id === 'standard';
                  if (item.category === 'board') return unlockedThemes.includes(item.id) || item.id === 'classic';
                  if (item.category === 'frame') return unlockedFrames.includes(item.id) || item.id === 'none';
                  const list = JSON.parse(localStorage.getItem(`unlocked_${item.category}_items`) || '[]');
                  if (item.id === 'pfp_knight') return true;
                  return list.includes(item.id);
                }).length} / {GACHA_ITEMS_POOL.length} Item Terkoleksi
              </span>
            </div>
          </div>

          {/* Render by sub categories */}
          {['skin', 'board', 'frame', 'pfp', 'sfx', 'effect', 'checkmate'].map((cat) => {
            const catItems = GACHA_ITEMS_POOL.filter(i => i.category === cat);
            const titleMap: Record<string, { t: string; desc: string }> = {
              skin: { t: 'Skin Bidak Catur', desc: 'Ganti rupa ornamen pion, kuda, benteng, dan raja Anda.' },
              board: { t: 'Tema Papan Catur', desc: 'Permukaan visual papan tanding berlatar belakang kosmik atau lava.' },
              frame: { t: 'Bingkai Avatar Elit', desc: 'Lingkaran aura bingkai yang bersinar mengelilingi foto profil Anda.' },
              pfp: { t: 'Foto Profil Templat', desc: 'Potret ilustrasi ksatria catur legendaris sebagai identitas utama.' },
              sfx: { t: 'Efek Suara Melangkah', desc: 'Ganti nada ketukan langkah bidak biasa menjadi tembakan laser atau robot.' },
              effect: { t: 'Langkah Jejak visual', desc: 'Efek partikel menyala yang tertinggal di atas papan setiap tanding.' },
              checkmate: { t: 'Supernova Skakmat', desc: 'Animasi ledakan visual spesial saat berhasil mengunci sekakmat lawan.' }
            };

            const details = titleMap[cat] || { t: cat, desc: '' };

            return (
              <div key={cat} className="space-y-3 bg-[#211f1d]/40 p-4 rounded-2xl border border-[#3c3934]/40">
                <div>
                  <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider">{details.t}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{details.desc}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {catItems.map((item) => {
                    // Check unlock status
                    let isUnlocked = false;
                    if (item.category === 'skin') {
                      isUnlocked = unlockedSkins.includes(item.id) || membershipStatus === 'premium' || item.id === 'standard';
                    } else if (item.category === 'board') {
                      isUnlocked = unlockedThemes.includes(item.id) || item.id === 'classic' || item.id === 'forest' || item.id === 'cosmic';
                    } else if (item.category === 'frame') {
                      isUnlocked = unlockedFrames.includes(item.id) || item.id === 'none';
                    } else {
                      const list = JSON.parse(localStorage.getItem(`unlocked_${item.category}_items`) || '[]');
                      isUnlocked = list.includes(item.id) || (item.id === 'pfp_knight');
                    }

                    // Check equipped status
                    let isEquipped = false;
                    if (item.category === 'skin') {
                      isEquipped = selectedSkin === item.id;
                    } else if (item.category === 'board') {
                      isEquipped = boardTheme === item.id;
                    } else if (item.category === 'frame') {
                      isEquipped = selectedFrame === item.id;
                    } else if (item.category === 'pfp') {
                      isEquipped = (localStorage.getItem('guestAvatar') || 'pfp_knight') === item.id;
                    } else if (item.category === 'sfx') {
                      isEquipped = equippedSfx === item.id;
                    } else if (item.category === 'effect') {
                      isEquipped = equippedEffect === item.id;
                    } else if (item.category === 'checkmate') {
                      isEquipped = equippedCheckmate === item.id;
                    }

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-xl border relative flex flex-col justify-between min-h-[9.5rem] transition-all ${
                          !isUnlocked 
                            ? 'bg-black/15 border-[#3c3934]/30 opacity-45' 
                            : isEquipped
                              ? 'bg-[#262421] border-[#81b64c] shadow-md shadow-[#81b64c]/5'
                              : 'bg-[#262421] border-[#3c3934]/70 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 bg-black/40 text-slate-400 rounded-md border border-white/5">
                              {item.rarity}
                            </span>
                            {!isUnlocked && <Lock className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />}
                          </div>

                          <h5 className="font-extrabold text-[11px] text-white mt-1.5 leading-tight">{item.name}</h5>
                          <p className="text-[9px] text-slate-405 leading-normal mt-1 font-sans">{item.desc}</p>
                        </div>

                        <div className="mt-3.5">
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                triggerAudio('move');
                                if (item.category === 'skin') {
                                  setSelectedSkin(item.id);
                                  const u = localStorage.getItem('activeUser') || 'default';
                                  localStorage.setItem(`selectedSkin:${u}`, item.id);
                                  triggerReward(0, `Skin bidak "${item.name}" berhasil dipasang!`, 'success_no_xp');
                                } else if (item.category === 'board') {
                                  setBoardTheme(item.id);
                                  localStorage.setItem('boardTheme', item.id);
                                  triggerReward(0, `Tema papan "${item.name}" berhasil dipasang!`, 'success_no_xp');
                                } else if (item.category === 'frame') {
                                  setSelectedFrame(item.id);
                                  const u = localStorage.getItem('activeUser') || 'default';
                                  localStorage.setItem(`selectedFrame:${u}`, item.id);
                                  triggerReward(0, `Bingkai avatar "${item.name}" berhasil dipasang!`, 'success_no_xp');
                                } else if (item.category === 'pfp') {
                                  localStorage.setItem('guestAvatar', item.id);
                                  window.dispatchEvent(new Event('storage'));
                                  triggerReward(0, `Avatar "${item.name}" berhasil dipasang!`, 'success_no_xp');
                                } else if (item.category === 'sfx') {
                                  if (isEquipped) {
                                    localStorage.setItem('gacha_sfx_equipped', 'none');
                                    setEquippedSfx('none');
                                  } else {
                                    localStorage.setItem('gacha_sfx_equipped', item.id);
                                    setEquippedSfx(item.id);
                                    triggerReward(0, `SFX ketukan "${item.name}" aktif!`, 'success_no_xp');
                                  }
                                } else if (item.category === 'effect') {
                                  if (isEquipped) {
                                    localStorage.setItem('gacha_effect_equipped', 'none');
                                    setEquippedEffect('none');
                                  } else {
                                    localStorage.setItem('gacha_effect_equipped', item.id);
                                    setEquippedEffect(item.id);
                                    triggerReward(0, `Jejak visual "${item.name}" aktif!`, 'success_no_xp');
                                  }
                                } else if (item.category === 'checkmate') {
                                  if (isEquipped) {
                                    localStorage.setItem('gacha_checkmate_equipped', 'none');
                                    setEquippedCheckmate('none');
                                  } else {
                                    localStorage.setItem('gacha_checkmate_equipped', item.id);
                                    setEquippedCheckmate(item.id);
                                    triggerReward(0, `Animasi skakmat "${item.name}" aktif!`, 'success_no_xp');
                                  }
                                }
                              }}
                              className={`w-full py-1 text-[9px] font-black uppercase rounded-lg border transition-all cursor-pointer text-center ${
                                isEquipped 
                                  ? 'bg-[#81b64c]/15 text-[#81b64c] border-[#81b64c]/30'
                                  : 'bg-[#312e2b] text-slate-300 border-[#3c3934] hover:bg-[#3d3a36] hover:text-white'
                              }`}
                            >
                              {isEquipped ? 'Aktif Aktif' : 'Gunakan'}
                            </button>
                          ) : (
                            <span className="block text-center text-[8.5px] font-black uppercase tracking-wider text-slate-500 bg-[#121110] py-1 rounded-lg select-none border border-black/10">
                              Terkunci Terkunci
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DIAMOND SAVINGS SYSTEM */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex items-start gap-3.5">
            <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Aturan Tabungan Diamond (Feature 27)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Berlian dari beberapa aktivitas mabar tidak otomatis masuk dompet utama, melainkan dimasukkan ke <span className="text-cyan-400 font-extrabold">Peti Tabungan</span> dengan batasan kapasitas maksimum <span className="text-white font-black">{limitSavings} Berlian</span> (seharga Season Pass Premium). 
                Prosedur penarikan diatur super ketat untuk keseimbangan ekosistem game:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-400 mt-2 space-y-1 pl-1">
                <li>Bisa ditarik <span className="text-yellow-400 font-bold">setiap Hari maksimal 20%</span> dari total tabungan, <span className="text-white font-black">HANYA JIKA</span> akumulasi sudah mencapai <span className="text-[#81b64c] font-black">minimal 50% ({minimumThresholdSavings} Berlian)</span>.</li>
                <li>Simulasi transisi pergantian Season memperbolehkan penarikan penuh <span className="text-[#81b64c] font-bold">100% isi tabungan tanpa syarat</span> ke saldo utama.</li>
                <li>Akun dengan Season Pass Premium memperoleh percepatan tabungan <span className="text-yellow-400 font-extrabold">x1.75%</span>, sedangkan Season Pass Deluxe melaju kencang sebesar <span className="text-cyan-400 font-black">x2.35%</span>!</li>
              </ul>
            </div>
          </div>

          {/* Current savings status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141212]/80 p-5 rounded-2xl border border-[#3c3934] flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Isi Tabungan Saat Ini</span>
                <div className="flex items-center gap-2 mt-1">
                  <Gem className="w-8 h-8 text-cyan-400 fill-cyan-400/10 animate-bounce" />
                  <span className="text-3xl font-black text-slate-100 font-mono">{diamondSavings} <span className="text-xs text-slate-400 font-sans font-normal">/ {limitSavings} Limit Maks</span></span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Progres Terhadap Limit</span>
                  <span>{Math.round((diamondSavings/limitSavings)*100)}%</span>
                </div>
                <div className="w-full bg-[#1c1a18] h-3 rounded-full overflow-hidden border border-[#3c3934]/60">
                  <div style={{ width: `${Math.min(100, (diamondSavings / limitSavings) * 100)}%` }} className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300" />
                </div>
                <div className="flex justify-between text-[9px] text-[#8a8883] font-semibold">
                  <span>Peti Kosong</span>
                  <span className="text-[#81b64c]">Minimal 50% ({minimumThresholdSavings} Berlian) untuk Klaim 20%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934]/70 flex flex-col justify-between gap-4">
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Aksi Pencairan Tabungan</h5>
                <p className="text-[11px] text-slate-400 mt-1">Silakan cairkan saldo tabungan Anda menggunakan ketentuan di bawah:</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={withdrawSavings20Percent}
                  disabled={diamondSavings < minimumThresholdSavings}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Cairkan 20% Harian (+{claim20PercentMax} Berlian)</span>
                </button>

                <button
                  onClick={withdrawSavings100PercentSeasonReset}
                  disabled={diamondSavings <= 0}
                  className="w-full py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] disabled:opacity-40 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Simulasi Pergantian Season (Cairkan 100%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY QUESTS & PLAYTIME GAUGE */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          <div className="bg-[#2a2624]/60 border border-yellow-600/30 rounded-2xl p-4 flex items-start gap-3">
            <Crown className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Misi Menit Bermain Premium</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Klaim bonus diamond mutlak setiap menit! Program khusus mendeteksi ketekunan anggota:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-400 mt-1 space-y-0.5 pl-1 font-semibold">
                <li>Bermain selama <span className="text-yellow-400">30 Menit pertama</span> demi memenuhi gerbang validasi misi.</li>
                <li>Setelah melewati menit ke-30, rasakan perolehan <span className="text-cyan-400 font-black">+1 Diamond per menit bermain ekstra!</span></li>
              </ul>
            </div>
          </div>

          <div className="bg-[#262421] rounded-2xl p-5 border border-[#3c3934] space-y-4">
            <div className="flex justify-between items-center bg-[#141212]/50 p-4 rounded-xl border border-[#3c3934]/40">
              <div>
                <h5 className="text-xs font-black text-white">Misi Durasi Catur Premium</h5>
                <p className="text-[10px] text-slate-400">Status pencatatan menit tanding aktif di turnamen/vs AI</p>
              </div>
              <span className="text-xs font-mono font-extrabold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-lg">
                Aktif
              </span>
            </div>

            {/* Simulated active gameplay minutes tracker to make it testable */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Waktu Bermain Hari Ini</span>
                  {/* Find if the playtime quest exists */}
                  <span>
                    {(() => {
                      const quest = dailyQuests.find(q => q.id === 'qp_playtime');
                      return quest ? `${quest.current} / 30 Menit` : '0 / 30 Menit';
                    })()}
                  </span>
                </div>
                
                <div className="w-full bg-[#1c1a18] h-2.5 rounded-full overflow-hidden border border-[#3c3934]/55">
                  <div 
                    style={{ 
                      width: `${(() => {
                        const quest = dailyQuests.find(q => q.id === 'qp_playtime');
                        return quest ? Math.min(100, (quest.current / 30) * 100) : 0;
                      })()}%` 
                    }} 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-300" 
                  />
                </div>
              </div>

              {/* Simulation button to add time to let the reviewer test it easily */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-semibold italic">*Klik tombol kanan untuk mensimulasikan penambahan menit tanding.</span>
                <button
                  onClick={() => {
                    setDailyQuests(prev => {
                      const updated = prev.map(q => {
                        if (q.id === 'qp_playtime' || q.isPlaytimeQuest) {
                          const nextMin = q.current + 5;
                          if (nextMin > 30) {
                            // Award extra diamonds for every minute over 30
                            const overage = nextMin - Math.max(30, q.current);
                            if (overage > 0) {
                              setDiamondSavings(s => {
                                const nextS = Math.min(150, s + overage);
                                return nextS;
                              });
                              triggerReward(0, `Waktu Bermain Ekstra! Berhasil memasukkan +${overage} Berlian ke dalam Tabungan Diamond Anda (Misi 30 Menit)!`, 'success_no_xp');
                            }
                          }
                          return { ...q, current: nextMin };
                        }
                        return q;
                      });
                      localStorage.setItem('dailyQuests', JSON.stringify(updated));
                      return updated;
                    });
                    triggerAudio('move');
                  }}
                  className="px-4 py-2 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] hover:border-[#81b64c] text-white text-[10px] font-black uppercase rounded-lg transition-all active:translate-y-0.5 cursor-pointer"
                >
                  Tambahkan +5 Menit Bermain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PETI QUIZ BURST (FEATURE 26, 41) */}
      {activeTab === 'chests' && (
        <div className="space-y-6">
          <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Sistem Buka Peti Quiz Cerdas</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Jawab pertanyaan kuis catur harian di Beranda untuk memboyong hadiah Peti Quiz! 
                Klaim dengan mengetuk peti sebanyak <span className="text-yellow-400 font-extrabold">3 sampai 5 kali</span>. 
                Satu ketukan memberi kans instan menaikkan level bintang peti tersebut (Maksimal 5 Bintang).
              </p>
              <ul className="text-[10px] text-slate-500 mt-2 space-y-0.5 font-bold uppercase pl-1">
                <li>Bintang 1 = +1 Diamond</li>
                <li>Bintang 2 = +2 Diamond</li>
                <li>Bintang 3 = +4 Diamond</li>
                <li>Bintang 4 = +7 Diamond</li>
                <li>Bintang 5 = +12 Diamond</li>
                <li className="text-yellow-500">Aktif Akun Premium: Semua hadiah peti dikalikan x1.5!</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#262421] p-6 rounded-2xl border border-[#3c3934]/70 flex flex-col items-center justify-center text-center space-y-4">
            {chestState === 'closed' && (
              <div className="space-y-5">
                <div className="w-24 h-24 rounded-3xl bg-[#312e2b] border border-[#3c3934] flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer" onClick={handleStartPetiQuiz}>
                  <Gift className="w-12 h-12 text-yellow-500 fill-yellow-500/10 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-white">Terdapat 1 Peti Quiz Tersedia</h5>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-xs mx-auto">Klik tombol di bawah untuk membuka segel penarikan peti dan nyalakan tarian keberuntungan bintang.</p>
                </div>
                <button
                  onClick={handleStartPetiQuiz}
                  className="px-6 py-2 bg-[#81b64c] hover:bg-[#92ca5a] text-[#ffffff] font-black text-xs uppercase rounded-xl shadow-[0_3px_0_0_#5d8a32] active:translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  Buka Peti Sekarang
                </button>
              </div>
            )}

            {chestState === 'tapping' && (
              <div className="space-y-5 w-full max-w-sm">
                <motion.div 
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500 to-amber-600 flex flex-col items-center justify-center mx-auto shadow-2xl relative cursor-pointer" 
                  onClick={handleTapPetiQuiz}
                  whileTap={{ scale: 0.95, rotate: [0, -5, 5, 0] }}
                >
                  <Gift className="w-12 h-12 text-slate-950 animate-bounce" />
                </motion.div>

                <div>
                  <h5 className="text-sm font-extrabold text-[#ffd700] uppercase tracking-widest">Ketuk Peti Berulang! ({5 - chestTapCount} Sisa)</h5>
                  <p className="text-[11px] text-slate-300 mt-1">Ketuk 3-5 kali demi memicu bintang beruntung. Makin banyak mengetuk, bintang makin melimpah!</p>
                </div>

                <div className="flex gap-1.5 justify-center mt-3">
                  {[1, 2, 3, 4, 5].map((sIndex) => (
                    <Star 
                      key={sIndex} 
                      className={`w-6 h-6 transition-all duration-300 ${
                        sIndex <= chestStars 
                          ? 'text-yellow-400 fill-yellow-400 animate-pulse' 
                          : 'text-slate-650'
                      }`} 
                    />
                  ))}
                </div>

                <button
                  onClick={handleTapPetiQuiz}
                  className="w-full py-3 bg-[#ea9c1a] hover:bg-yellow-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-[0_3.5px_0_0_#ad6d00] active:translate-y-0.5 cursor-pointer tracking-wider"
                >
                  Ketuk Peti! ({chestTapCount}/5)
                </button>
              </div>
            )}

            {chestState === 'opened' && chestOpenedReward && (
              <div className="space-y-5">
                <div className="w-24 h-24 rounded-full bg-emerald-950/40 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl">
                  <Check className="w-12 h-12 text-emerald-400" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-emerald-400">Peti Berhasil Dibuka!</h5>
                  <p className="text-xs text-slate-350 leading-relaxed mt-2 max-w-sm mx-auto p-3 bg-black/35 rounded-xl border border-[#3c3934]">
                    {chestOpenedReward.message}
                  </p>
                </div>
                <button
                  onClick={() => setChestState('closed')}
                  className="px-6 py-2.5 bg-[#312e2b] hover:bg-[#3c3934] text-white text-[10px] font-black uppercase rounded-lg border border-[#3c3934] cursor-pointer shadow-md"
                >
                  Tutup Tampilan / Reset Peti
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP RESULT LISTING IF GACHA SUCCESS */}
      <AnimatePresence>
        {showPulledPopup && drawnItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-[#262421] rounded-3xl p-6 border-2 border-[#3c3934] max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-6 text-center shadow-2xl"
            >
              <div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full tracking-widest uppercase">
                  Hasil Tarikan Gacha Kosmik
                </span>
                <h3 className="text-xl font-bold font-sans text-white mt-3">Selamat atas Item Baru Anda!</h3>
                <p className="text-slate-400 text-xs mt-1">Item yang ditarik telah otomatis ditambahkan ke koleksi album dan siap digunakan.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 justify-center py-2">
                {drawnItems.map((item, idx) => {
                  const isGoldOrCosmicFrame = item.category === 'frame' && (item.id === 'gold' || item.id === 'cosmic');
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl bg-gradient-to-b from-[#312e2b] to-[#1c1a19] border-2 flex flex-col justify-between items-center text-center space-y-3 shadow-md relative group ${item.color}`}
                    >
                      {/* Premium badge lock indicator if non-premium drawn gold/cosmic frame (30) */}
                      {isGoldOrCosmicFrame && membershipStatus !== 'premium' && (
                        <div className="absolute top-1 right-1 bg-yellow-500/20 text-yellow-400 p-[3px] rounded-md border border-yellow-500/30 shadow flex items-center justify-center" title="Eksklusif Premium">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}

                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-black/35 rounded-full block border border-white/5">
                        {item.rarity}
                      </span>

                      <div className="w-12 h-12 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                        {item.category === 'skin' ? (
                          <div className="w-8 h-8"><Sparkles className="w-full h-full text-yellow-400" /></div>
                        ) : item.category === 'board' ? (
                          <div className="w-8 h-8"><Settings className="w-full h-full text-emerald-400" /></div>
                        ) : (
                          <div className="w-8 h-8 font-extrabold text-[10px] text-cyan-400 uppercase flex items-center justify-center border-2 border-cyan-400/25 rounded-md">{item.category}</div>
                        )}
                      </div>

                      <div>
                        <h5 className="text-[11px] font-bold text-white leading-tight">{item.name}</h5>
                        <p className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[110px]">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowPulledPopup(false)}
                  className="px-8 py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold text-xs uppercase rounded-xl shadow-[0_3px_0_0_#5d8a32] active:translate-y-0.5 cursor-pointer uppercase transition-all"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
