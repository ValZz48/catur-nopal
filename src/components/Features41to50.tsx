import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Award, Shield, MessageSquare, ShoppingBag, User, Settings, Check, Lock, Star, 
  HelpCircle, Sparkles, Flame, Play, Trophy, Users, Eye, EyeOff, BookOpen, Clock, 
  AlertTriangle, Ban, Coins, Gem, Crown, Volume2, ShieldAlert, Heart, RefreshCw, ChevronRight, X, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// =========================================================================
// TYPES & PROPS
// =========================================================================

interface Features41to50Props {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  membershipStatus: 'free' | 'premium';
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, customMessage: string, type?: 'success' | 'success_no_xp' | 'level_up' | 'info' | 'premium' | 'error') => void;
  unlockedSkins: string[];
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedThemes: string[];
  setUnlockedThemes: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedFrames: string[];
  setUnlockedFrames: React.Dispatch<React.SetStateAction<string[]>>;
  username: string;
  onlineRating: number;
}

// =========================================================================
// MOCK APPS DATA CONSTANTS
// =========================================================================

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const CATUR_QUIZNODES = [
  { id: 'lv1', name: 'Dasar Garpu Kuda', type: 'quiz', x: 120, y: 700, solved: true },
  { id: 'lv2', name: 'Pin Sakti Gajah', type: 'quiz', x: 200, y: 620, solved: true },
  { id: 'pt1', name: 'Peti Taktis Menengah', type: 'chest', x: 140, y: 530, solved: false, stars: 0 },
  { id: 'lv3', name: 'Skak Ster Membuka', type: 'quiz', x: 70, y: 440, solved: false },
  { id: 'lv4', name: 'Pola Skakmat Koridor', type: 'quiz', x: 160, y: 350, solved: false },
  { id: 'pt2', name: 'Peti Kerajaan Rahasia', type: 'chest', x: 240, y: 260, solved: false, stars: 0 },
  { id: 'lv5', name: 'Taktik Pengorbanan Benteng', type: 'quiz', x: 110, y: 170, solved: false },
  { id: 'lv6', name: 'Teori Akhir Raja & Pion', type: 'quiz', x: 180, y: 80, solved: false },
];

const CATUR_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  lv1: [
    {
      id: 'q1_1',
      question: 'Manakah dari perwira berikut yang paling mahir melakukan taktik Garpu (ForkL / menusuk dua perwira sekaligus)?',
      options: ['Kuda', 'Benteng', 'Gajah', 'Pion'],
      correctIdx: 0,
      explanation: 'Kuda memiliki arah pergerakan berbentuk L yang tidak dapat dihalangi oleh perwira lain, menjadikannya perwira terbaik untuk melakukan garpu taktis.'
    },
    {
      id: 'q1_2',
      question: 'Apa tujuan utama dari taktik Garpu (Fork)?',
      options: ['Melindungi Raja', 'Menyerang dua atau lebih perwira musuh sekaligus', 'Menukar Benteng', 'Melakukan rokade'],
      correctIdx: 1,
      explanation: 'Taktik garpu menyerang beberapa aset musuh secara serentak sehingga musuh terpaksa mengorbankan salah satunya.'
    }
  ],
  lv2: [
    {
      id: 'q2_1',
      question: 'Taktik Pin (Kuncian) terjadi saat perwira yang diserang tidak bisa bergerak demi melindungi perwira bernilai lebih tinggi di belakangnya. Perwira mana saja yang bisa melakukan pin?',
      options: ['Kuda & Raja', 'Gajah, Benteng, & Menteri', 'Pion & Raja', 'Kuda saja'],
      correctIdx: 1,
      explanation: 'Hanya perwira penyerang jarak jauh lurus atau diagonal (Gajah, Benteng, Menteri) yang mampu membuat kuncian atau pin.'
    }
  ],
  lv3: [
    {
      id: 'q3_1',
      question: 'Apa arti dari taktik Skak Ster Membuka (Discovered Check)?',
      options: ['Menyerang Menteri musuh dengan meloncat', 'Melangkah satu perwira yang membuka jalur serangan perwira lain untuk menskak Raja lawan', 'Melindungi Menteri sendiri', 'Menukar bidak secara acak'],
      correctIdx: 1,
      explanation: 'Discovered check terjadi ketika kita melangkahkan satu perwira, lalu secara otomatis membuka jalur serangan perwira lain di belakangnya untuk memberi skak.'
    }
  ],
  lv4: [
    {
      id: 'q4_1',
      question: 'Skakmat Koridor (Back-Rank Mate) biasanya terjadi di baris paling belakang akibat Raja lawan terkurung oleh...',
      options: ['Bentengnya sendiri', 'Pion-pion pelindungnya sendiri', 'Area kosong yang luas', 'Serangan Kuda berputar'],
      correctIdx: 1,
      explanation: 'Back-Rank Mate mengeksploitasi barisan belakang yang sempit di mana Raja terhalang untuk lari ke depan oleh jajaran pion pelindungnya sendiri.'
    }
  ],
  lv5: [
    {
      id: 'q5_1',
      question: 'Mengapa taktik Pengorbanan (Sacrifice) dilakukan dalam permainan catur?',
      options: ['Karena putus asa', 'Untuk memancing Raja lawan keluar ke posisi terbuka atau demi skakmat cepat', 'Untuk mengurangi jumlah bidak di papan', 'Agar permainan lebih singkat'],
      correctIdx: 1,
      explanation: 'Pengorbanan taktis memberikan perwira berharga tinggi secara sengaja demi mendapatkan kompensasi yang jauh lebih besar seperti skakmat atau keunggulan posisi prima.'
    }
  ],
  lv6: [
    {
      id: 'q6_1',
      question: 'Dalam permainan akhir (Endgame) Raja & Pion melawan Raja tunggal, posisi di mana kedua Raja saling berhadapan langsung terhalang 1 kotak disebut...',
      options: ['Oposisi (Opposition)', 'Rokade Tambahan', 'Zugzwang Pion', 'Stalemate Total'],
      correctIdx: 0,
      explanation: 'Oposisi adalah kondisi strategis krusial di akhir laga di mana satu Raja berhadapan langsung dengan Raja lain, guna membatasi ruang melompat lawan.'
    }
  ]
};

const STATS_MEDALS = [
  { id: 'm1', name: 'Pendekar Benteng', desc: 'Selesaikan 20 laga dengan Benteng kokoh', badge: '🛡️', rarity: 'Common', value: 10, target: 20, progress: 12, level: 2 },
  { id: 'm2', name: 'Penguasa Kavaleri Kuda', desc: 'Lakukan taktik garpu kuda sebanyak 10 kali', badge: '🐴', rarity: 'Uncommon', value: 25, target: 10, progress: 8, level: 1 },
  { id: 'm3', name: 'Pion Pahlawan', desc: 'Mempromosikan pion menjadi Menteri sebanyak 15 kali', badge: '♟️', rarity: 'Rare', value: 50, target: 15, progress: 15, level: 3, unlocked: true },
  { id: 'm4', name: 'Master Skakmat Kilat', desc: 'Menangkan laga dalam kurun waktu kurang dari 12 langkah', badge: '⚡', rarity: 'Epic', value: 100, target: 1, progress: 1, level: 1, unlocked: true },
  { id: 'm5', name: 'Mahkota Kaisar Agung', desc: 'Capai peringkat Master ELO melampaui 1800', badge: '👑', rarity: 'Legendary', value: 250, target: 1800, progress: 1250, level: 1 },
  { id: 'm6', name: 'Kunci Kegelapan Void', desc: 'Achievement Rahasia: Kalahkan Guru Bot tersulit tanpa kehilangan Menteri', badge: '🌀', rarity: 'Mythic', value: 500, target: 1, progress: 0, level: 1, isSecret: true },
];

const GACHA_ITEMS_POOL = [
  // Piece Skins
  { id: 'skin_anime', name: 'Classic Anime Hero Warrior', type: 'Bidak', rarity: 'Epic', isEquipped: false },
  { id: 'skin_cyberpunk', name: 'Cyberpunk Neon Matrix Piece', type: 'Bidak', rarity: 'Legendary', isEquipped: false },
  { id: 'skin_classic', name: 'Classic Matte Wooden Chess', type: 'Bidak', rarity: 'Common', isEquipped: true },
  { id: 'skin_crystal', name: 'Glorious Diamond Crystal Chess', type: 'Bidak', rarity: 'Mythic', isEquipped: false },
  // Board Themes
  { id: 'board_magma_lava', name: 'Lava Magma Volcanic Core Animated', type: 'Papan', rarity: 'Legendary', isEquipped: false },
  { id: 'board_ice_freeze', name: 'Iceland Glacial Freeze Magic Frame', type: 'Papan', rarity: 'Epic', isEquipped: false },
  { id: 'board_cosmic', name: 'Celestial Cosmos Void Space', type: 'Papan', rarity: 'Rare', isEquipped: false },
  { id: 'board_forest', name: 'Forest Wood Eco Frame', type: 'Papan', rarity: 'Uncommon', isEquipped: false },
  // Frames
  { id: 'frame_gold_dragon', name: 'Golden Dragon Suku Border Frame', type: 'Bingkai', rarity: 'Mythic', isEquipped: false },
  { id: 'frame_neon_glitch', name: 'Cyber Neon Glitch Frame Overlay', type: 'Bingkai', rarity: 'Epic', isEquipped: false },
  { id: 'frame_wooden', name: 'Simple Oakwood Border Cover', type: 'Bingkai', rarity: 'Common', isEquipped: false },
  // Titles / Gelar
  { id: 'title_shadow', name: 'Gelar: Pengendali Bayangan Tersembunyi', type: 'Gelar', rarity: 'Rare', isEquipped: false },
  { id: 'title_gm', name: 'Gelar: Legenda Catur Suku Nusantara', type: 'Gelar', rarity: 'Special', isEquipped: false },
];

const THEME_SETS = [
  {
    id: 'set_cosmic',
    name: 'Set Galaksi Void Kosmis',
    parts: { piecSkin: 'skin_crystal', boardTheme: 'board_cosmic', frame: 'frame_neon_glitch' },
    reward: 'Dapatkan gelar legendaris "Reruntuhan Bintang Void" + Bonus 50 Diamond & Visual Sparkle Cosmos!',
    titleReward: 'Reruntuhan Bintang Void',
    diamondBonus: 50
  },
  {
    id: 'set_magma',
    name: 'Set Kaisar Gunung Api Volkanik',
    parts: { piecSkin: 'skin_cyberpunk', boardTheme: 'board_magma_lava', frame: 'frame_gold_dragon' },
    reward: 'Dapatkan gelar mistis "Dewa Magma Penghancur" + Bonus 100 Diamond & Efek Suara Langkah Laser!',
    titleReward: 'Dewa Magma Penghancur',
    diamondBonus: 100
  }
];

export const Features41to50: React.FC<Features41to50Props> = ({
  coins,
  setCoins,
  diamonds,
  setDiamonds,
  xp,
  setXp,
  membershipStatus,
  triggerAudio,
  triggerReward,
  unlockedSkins,
  setUnlockedSkins,
  unlockedThemes,
  setUnlockedThemes,
  unlockedFrames,
  setUnlockedFrames,
  username,
  onlineRating
}) => {
  // Active Navigation inside features
  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'ritual' | 'settings' | 'medals' | 'gacha' | 'fashion' | 'pokedex' | 'block-report' | 'notif'>('quiz');

  // Load state from local storage or default
  const [solvedNodes, setSolvedNodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('solved_nodes');
    return saved ? JSON.parse(saved) : ['lv1', 'lv2'];
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('blocked_users');
    return saved ? JSON.parse(saved) : ['PecaturToxic69', 'BotsSpammer2024'];
  });

  const [unlockedInventory, setUnlockedInventory] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlocked_pokedex_inv');
    if (saved) return JSON.parse(saved);
    // Sync with App's props defaults
    const initial = ['skin_classic', ...unlockedSkins, ...unlockedThemes, ...unlockedFrames];
    return Array.from(new Set(initial));
  });

  const [pinnedMedals, setPinnedMedals] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinned_medals_ids');
    return saved ? JSON.parse(saved) : ['m3', 'm4'];
  });

  const [notificationLog, setNotificationLog] = useState<any[]>(() => {
    const saved = localStorage.getItem('social_noti_log');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: 'Teman Online', message: 'Sobat Catur Martin baru saja masuk ke arena catur!', time: '1 menit lalu', read: false },
      { id: 'n2', title: 'Tantangan Masuk', message: 'Karakter Zari menantang Anda bertarung adu cepat ELO!', time: '10 menit lalu', read: true },
      { id: 'n3', title: 'Bingkisan Terkirim', message: 'Anda menerima bingkisan Paket Kopi Hangat dari Sobat Catur!', time: '1 jam lalu', read: true },
    ];
  });

  // Local state temporary
  const [activeQuizNode, setActiveQuizNode] = useState<any>(null);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Chest Buka state
  const [activeChestNode, setActiveChestNode] = useState<any>(null);
  const [chestTapsCount, setChestTapsCount] = useState(0);
  const [chestStarsEarned, setChestStarsEarned] = useState(1);
  const [isOpeningChestProgress, setIsOpeningChestProgress] = useState(false);

  // Pre-match Ritual state
  const [selectedRitualType, setSelectedRitualType] = useState<'dice' | 'suit' | 'coin'>('dice');
  const [ritualChoice, setRitualChoice] = useState<string>(''); // Rock/Paper/Scissor, or Coin Side, or Number range
  const [isRitualRunning, setIsRitualRunning] = useState(false);
  const [ritualResult, setRitualResult] = useState<any>(null);
  const [ritualPrefColor, setRitualPrefColor] = useState<'w' | 'b' | null>(null);

  // Gacha states
  const [isGachaSpinning, setIsGachaSpinning] = useState(false);
  const [gachaPullResults, setGachaPullResults] = useState<any[]>([]);
  const [gachaPityLegendary, setGachaPityLegendary] = useState(() => {
    return Number(localStorage.getItem('gacha_pity_legend') || '0');
  });
  const [gachaPityMythic, setGachaPityMythic] = useState(() => {
    return Number(localStorage.getItem('gacha_pity_mythic') || '0');
  });
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(() => {
    return Number(localStorage.getItem('free_spins_today') ?? (membershipStatus === 'premium' ? '5' : '1'));
  });

  // Settings states
  const [settingsTheme, setSettingsTheme] = useState(() => {
    return localStorage.getItem('pref_theme') || 'dark';
  });
  const [settingsLang, setSettingsLang] = useState(() => {
    return localStorage.getItem('pref_lang') || 'id';
  });

  // Block/Report input
  const [userToBlock, setUserToBlock] = useState('');
  const [reportTargetName, setReportTargetName] = useState('');
  const [reportReason, setReportReason] = useState('toxic-chat');
  const [reportDesc, setReportDesc] = useState('');

  // Live Toast simulators
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  // Persists states in useEffect
  useEffect(() => {
    localStorage.setItem('solved_nodes', JSON.stringify(solvedNodes));
  }, [solvedNodes]);

  useEffect(() => {
    localStorage.setItem('blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    localStorage.setItem('unlocked_pokedex_inv', JSON.stringify(unlockedInventory));
  }, [unlockedInventory]);

  useEffect(() => {
    localStorage.setItem('pinned_medals_ids', JSON.stringify(pinnedMedals));
  }, [pinnedMedals]);

  useEffect(() => {
    localStorage.setItem('social_noti_log', JSON.stringify(notificationLog));
  }, [notificationLog]);

  useEffect(() => {
    localStorage.setItem('gacha_pity_legend', String(gachaPityLegendary));
    localStorage.setItem('gacha_pity_mythic', String(gachaPityMythic));
  }, [gachaPityLegendary, gachaPityMythic]);

  useEffect(() => {
    localStorage.setItem('free_spins_today', String(freeSpinsLeft));
  }, [freeSpinsLeft]);

  // General audio trigger wrapper
  const playTabChangeSound = () => {
    triggerAudio('move');
  };

  // Toast Helper
  const spawnToast = (title: string, message: string, type: string = 'info') => {
    const id = String(Math.random());
    setActiveToast({ id, title, message, type });
    setTimeout(() => {
      setActiveToast(prev => prev?.id === id ? null : prev);
    }, 4500);
  };

  // Simulated Friend online trigger
  const triggerSimulatedFriendNotification = () => {
    triggerAudio('check');
    const newNotif = {
      id: String(Date.now()),
      title: 'Tantangan Masuk',
      message: 'Martin mengirimi Anda tantangan Match Persahabatan dengan ELO 1500!',
      time: 'Baru saja',
      read: false
    };
    setNotificationLog(p => [newNotif, ...p]);
    spawnToast('💌 Undangan Duel', 'Teman Martin menantang Anda bermain catur langsung!', 'success');
  };

  // -------------------------------------------------------------------------
  // 1. QUIZ DUOLINGO STYLE FUNCTIONS
  // -------------------------------------------------------------------------
  const startQuizForNode = (node: any) => {
    triggerAudio('move');
    const questions = CATUR_QUIZ_QUESTIONS[node.id];
    if (questions && questions.length > 0) {
      setActiveQuizNode(node);
      setCurrentQuizIdx(0);
      setSelectedOptIdx(null);
      setQuizFinished(false);
      setQuizScore(0);
    } else {
      spawnToast('Info Kuis', 'Pertanyaan untuk level ini sedang dikomposisi oleh kakek catur!', 'info');
    }
  };

  const handleSelectQuizOption = (optIdx: number) => {
    triggerAudio('move');
    setSelectedOptIdx(optIdx);
  };

  const submitQuizAnswer = () => {
    const questions = CATUR_QUIZ_QUESTIONS[activeQuizNode.id];
    const currentQ = questions[currentQuizIdx];
    
    if (selectedOptIdx === null) return;

    if (selectedOptIdx === currentQ.correctIdx) {
      triggerAudio('win');
      setQuizScore(prev => prev + 1);
    } else {
      triggerAudio('error');
    }

    if (currentQuizIdx + 1 < questions.length) {
      setTimeout(() => {
        setCurrentQuizIdx(prev => prev + 1);
        setSelectedOptIdx(null);
      }, 1500);
    } else {
      // Finished
      setQuizFinished(true);
      const isSuccess = quizScore + (selectedOptIdx === currentQ.correctIdx ? 1 : 0) >= questions.length;
      if (isSuccess) {
        if (!solvedNodes.includes(activeQuizNode.id)) {
          setSolvedNodes(prev => [...prev, activeQuizNode.id]);
          // Award XP & Coins
          setXp(p => p + 65);
          setCoins(p => p + 120);
          triggerReward(65, 'Selamat! Anda menyelesaikan level kuis taktis bergaya Duolingo ini dengan cemerlang! Poin XP +65, Koin +120! 🏆', 'success');
        }
      }
    }
  };

  // 3-5 Taps Mini-Game for Chess Chest (Peti Quiz)
  const interactWithChestNode = (node: any) => {
    triggerAudio('move');
    setActiveChestNode(node);
    setChestTapsCount(0);
    setChestStarsEarned(1);
    setIsOpeningChestProgress(false);
  };

  const tapChestBox = () => {
    if (chestTapsCount >= 5) return;
    
    triggerAudio('capture');
    const newTaps = chestTapsCount + 1;
    setChestTapsCount(newTaps);
    
    // 65% chance to increase stars on each tap, up to 5 stars max
    const luckyChance = Math.random() < 0.68;
    if (luckyChance && chestStarsEarned < 5) {
      setChestStarsEarned(prev => prev + 1);
    }

    if (newTaps >= 5) {
      setIsOpeningChestProgress(true);
      setTimeout(() => {
        triggerAudio('win');
        // Diamond formula base
        let basePrizes = 1;
        if (chestStarsEarned === 2) basePrizes = 2;
        else if (chestStarsEarned === 3) basePrizes = 4;
        else if (chestStarsEarned === 4) basePrizes = 7;
        else if (chestStarsEarned === 5) basePrizes = 12;

        const premiumMult = membershipStatus === 'premium' ? 1.5 : 1;
        const totalAwarded = Math.floor(basePrizes * premiumMult);

        setDiamonds(prev => prev + totalAwarded);
        // Mark solved
        if (!solvedNodes.includes(activeChestNode.id)) {
          setSolvedNodes(prev => [...prev, activeChestNode.id]);
        }
        
        triggerReward(0, `Petak Peti Berhasil Dibuka! Anda mengamankan Peti Bintang ${chestStarsEarned}! Diperoleh ${totalAwarded} Diamond kustom! ${membershipStatus === 'premium' ? '(Dilipatgandakan Premium x1.5!)' : ''}`, 'premium');
        setActiveChestNode(null);
        setIsOpeningChestProgress(false);
      }, 1600);
    }
  };

  // -------------------------------------------------------------------------
  // 2. PRE-MATCH RITUAL CEREMONY
  // -------------------------------------------------------------------------
  const startRitualSpin = () => {
    if (!ritualChoice) {
      spawnToast('Pilih Tebakan', 'Harap lakukan tebakan ritual terlebih dahulu sebelum memutar roda keberuntungan!', 'error');
      return;
    }
    triggerAudio('move');
    setIsRitualRunning(true);
    setRitualResult(null);
    setRitualPrefColor(null);

    setTimeout(() => {
      let isWin = false;
      let finalValStr = '';

      if (selectedRitualType === 'dice') {
        const roll = Math.floor(Math.random() * 6) + 1;
        finalValStr = `Dadu mendarat pada angka ${roll}`;
        isWin = ritualChoice === (roll % 2 === 0 ? 'even' : 'odd');
      } else if (selectedRitualType === 'suit') {
        const options = ['gunting', 'batu', 'kertas'];
        const aiRoll = options[Math.floor(Math.random() * 3)];
        
        if (ritualChoice === aiRoll) {
          finalValStr = `Seri! Anda bersalaman suit ${ritualChoice.toUpperCase()} dengan Bot.`;
          isWin = Math.random() < 0.5; // resolve tie break randomly
        } else if (
          (ritualChoice === 'batu' && aiRoll === 'gunting') ||
          (ritualChoice === 'gunting' && aiRoll === 'kertas') ||
          (ritualChoice === 'kertas' && aiRoll === 'batu')
        ) {
          finalValStr = `Menang! Pilihan Anda ${ritualChoice.toUpperCase()} meredam ${aiRoll.toUpperCase()} kepunyaan Bot.`;
          isWin = true;
        } else {
          finalValStr = `Kalah! Pilihan Anda ${ritualChoice.toUpperCase()} remuk digilas ${aiRoll.toUpperCase()} milik Bot.`;
          isWin = false;
        }
      } else {
        // Coin flip
        const side = Math.random() < 0.5 ? 'garuda' : 'angka';
        finalValStr = `Koin berputar dan mendarat di sisi ${side.toUpperCase()}`;
        isWin = ritualChoice === side;
      }

      setIsRitualRunning(false);
      setRitualResult({ isWin, details: finalValStr });

      if (isWin) {
        triggerAudio('win');
        spawnToast('Ritual Sukses!', 'Anda memenangkan hak eksklusif memilih warna bidak catur!', 'success');
      } else {
        triggerAudio('error');
        spawnToast('Ritual Gagal', 'Raja Bot memenangkan ritual sebelum laga dan memilih memboyong bidak Putih!', 'info');
        setRitualPrefColor('b');
      }
    }, 2000);
  };

  // -------------------------------------------------------------------------
  // 4. UNLOCKED MEDALS & PROGRESS (PORTED TO DUOLINGO THEME)
  // -------------------------------------------------------------------------
  const togglePinMedalToProfile = (medalId: string) => {
    triggerAudio('move');
    if (pinnedMedals.includes(medalId)) {
      setPinnedMedals(prev => prev.filter(m => m !== medalId));
      spawnToast('Medal Dicopot', 'Medali kehormatan dilepaskan dari pameran profil Anda.', 'info');
    } else {
      if (pinnedMedals.length >= 3) {
        spawnToast('Slot Penuh', 'Maksimal memamerkan 3 medali sekaligus di galeri profil catur!', 'error');
        return;
      }
      setPinnedMedals(prev => [...prev, medalId]);
      spawnToast('Medal Terpasang', 'Medali resmi terpajang anggun di kartu profil catur publik Anda!', 'success');
    }
  };

  // -------------------------------------------------------------------------
  // 5. DETAIL GACHA Engine WITH PITY TRACKERS & FULL COLOR ANIMS
  // -------------------------------------------------------------------------
  const playGachaSpin = (spinsCount: number) => {
    const cost = spinsCount === 5 ? 100 : 25;
    
    // Check free spins first
    const usingFree = spinsCount === 1 && freeSpinsLeft > 0;
    if (!usingFree && coins < cost) {
      triggerAudio('error');
      spawnToast('Koin Kurang', `Butuh ${cost} keping Koin emas untuk memutar roda gacha!`, 'error');
      return;
    }

    triggerAudio('move');
    setIsGachaSpinning(true);
    setGachaPullResults([]);

    if (usingFree) {
      setFreeSpinsLeft(prev => prev - 1);
    } else {
      setCoins(p => p - cost);
    }

    setTimeout(() => {
      const results: any[] = [];
      let newPityL = gachaPityLegendary;
      let newPityM = gachaPityMythic;

      for (let i = 0; i < spinsCount; i++) {
        newPityL += 1;
        newPityM += 1;

        let landedRarity = 'Common';
        let forcePity = false;

        // Force pity threshold checks
        if (newPityM >= 100) {
          landedRarity = 'Mythic';
          newPityM = 0;
          forcePity = true;
        } else if (newPityL >= 50) {
          landedRarity = 'Legendary';
          newPityL = 0;
          forcePity = true;
        } else {
          // Standard roll probabilities with premium rate boost
          const premiumBonus = membershipStatus === 'premium' ? 2 : 1;
          const mapChance = Math.random();

          if (mapChance < 0.008 * premiumBonus) {
            landedRarity = 'Mythic';
            newPityM = 0;
          } else if (mapChance < 0.02 * premiumBonus) {
            landedRarity = 'Legendary';
            newPityL = 0;
          } else if (mapChance < 0.05 * premiumBonus) {
            landedRarity = 'Epic';
          } else if (mapChance < 0.12 * premiumBonus) {
            landedRarity = 'Rare';
          } else if (mapChance < 0.25) {
            landedRarity = 'Uncommon';
          } else {
            landedRarity = 'Common';
          }
        }

        // Pick matching item pool
        let pool = GACHA_ITEMS_POOL.filter(item => item.rarity === landedRarity);
        if (pool.length === 0) pool = GACHA_ITEMS_POOL; // fallback

        const landedItem = pool[Math.floor(Math.random() * pool.length)];
        results.push({ ...landedItem, forcePity, timestamp: Date.now() + i });

        // Unlock item globally if not owned
        if (!unlockedInventory.includes(landedItem.id)) {
          setUnlockedInventory(prev => [...prev, landedItem.id]);
          // Also append to respective App system triggers
          if (landedItem.type === 'Bidak') {
            setUnlockedSkins(prev => Array.from(new Set([...prev, landedItem.id])));
          } else if (landedItem.type === 'Papan') {
            setUnlockedThemes(prev => Array.from(new Set([...prev, landedItem.id])));
          } else if (landedItem.type === 'Bingkai') {
            setUnlockedFrames(prev => Array.from(new Set([...prev, landedItem.id])));
          }
        }
      }

      setGachaPityLegendary(newPityL);
      setGachaPityMythic(newPityM);
      setGachaPullResults(results);
      setIsGachaSpinning(false);
      triggerAudio('win');

      // Check if pulled heavy rare
      const hasHeavyPull = results.some(r => r.rarity === 'Legendary' || r.rarity === 'Mythic');
      if (hasHeavyPull) {
        setXp(p => p + 50);
        triggerReward(50, `Luar Biasa Spektakuler! Anda berhasil menarik item ${results.find(r => r.rarity === 'Legendary' || r.rarity === 'Mythic').rarity} dalam putaran catur gacha ini! Progress Pity di-reset! EXP+50`, 'level_up');
      } else {
        setXp(p => p + 10);
        triggerReward(10, `Gacha Berhasil diputar! Dapat item menarik untuk mempercantik Busana Ksatria Anda! Koin Terpakai.`, 'success');
      }
    }, 2200);
  };

  // -------------------------------------------------------------------------
  // 6. FASHION POINTS CALCULATOR & LEADERBOARD
  // -------------------------------------------------------------------------
  const fashionPointsScore = useMemo(() => {
    let score = 0;
    unlockedInventory.forEach(itemId => {
      const item = GACHA_ITEMS_POOL.find(g => g.id === itemId);
      if (!item) return;
      if (item.rarity === 'Common') score += 10;
      else if (item.rarity === 'Uncommon') score += 25;
      else if (item.rarity === 'Rare') score += 50;
      else if (item.rarity === 'Epic') score += 100;
      else if (item.rarity === 'Legendary') score += 250;
      else if (item.rarity === 'Mythic') score += 500;
      else if (item.rarity === 'Special') score += 350;
    });
    return score;
  }, [unlockedInventory]);

  const fashionRankGelar = useMemo(() => {
    if (fashionPointsScore >= 1800) return 'Maharaja Busana Kosmik (Mythic God)';
    if (fashionPointsScore >= 1000) return 'Ikon Trendsetter Elite (Legendary)';
    if (fashionPointsScore >= 500) return 'Kolektor Sayap Berpakaian (Epic)';
    if (fashionPointsScore >= 200) return 'Gaya Modis Menawan (Rare)';
    if (fashionPointsScore >= 50) return 'Pemula Santun Berbusana (Common)';
    return 'Pelopor Minimalis';
  }, [fashionPointsScore]);

  // Simulated Fashion Leaderboard list
  const fashionLeaderboard = useMemo(() => {
    const list = [
      { name: 'Kaisar_Martin_Premium', score: 2850, title: 'Dewa Busana Abadi', isMe: false, avatar: '👑' },
      { name: `${username} (Anda)`, score: fashionPointsScore, title: fashionRankGelar, isMe: true, avatar: '👤' },
      { name: 'SukuGrandmaster_Nusa', score: 1200, title: 'Ikon Trendsetter Elite', isMe: false, avatar: '🛡️' },
      { name: 'ZariTaktis_AI', score: 750, title: 'Kolektor Sayap Berpakaian', isMe: false, avatar: '⚡' },
      { name: 'BotPionMerayap', score: 150, title: 'Pemula Santun Berbusana', isMe: false, avatar: '♟️' },
    ];
    return list.sort((a, b) => b.score - a.score);
  }, [fashionPointsScore, fashionRankGelar, username]);

  // -------------------------------------------------------------------------
  // 8. THEME SET BONUS SYNERGY CHECKER
  // -------------------------------------------------------------------------
  const setBonusUnlockedStatus = (set: any) => {
    const skinsOwned = unlockedInventory.includes(set.parts.piecSkin);
    const themeOwned = unlockedInventory.includes(set.parts.boardTheme);
    const frameOwned = unlockedInventory.includes(set.parts.frame);
    return skinsOwned && themeOwned && frameOwned;
  };

  const claimSetBonusReward = (set: any) => {
    triggerAudio('win');
    setDiamonds(prev => prev + set.diamondBonus);
    
    // Grant special title & trigger
    const customTitleId = `title_${set.id}`;
    if (!unlockedInventory.includes(customTitleId)) {
      setUnlockedInventory(prev => [...prev, customTitleId]);
    }
    triggerReward(100, `Luar Biasa! Set Sinergi Eksklusif "${set.name}" terpasang utuh! Anda dianugerahi Gelar "${set.titleReward}" dan bonus instan +${set.diamondBonus} Diamond!`, 'premium');
  };

  // -------------------------------------------------------------------------
  // 9. BLOK & LAPORKAN PLAYER SYSTEM (BLOCK & REPORT)
  // -------------------------------------------------------------------------
  const handleBlockUser = () => {
    const target = userToBlock.trim();
    if (!target) return;
    if (blockedUsers.includes(target)) {
      spawnToast('Sudah Diblokir', `Pemain "${target}" sudah terdaftar dalam daftar blok hitam Anda.`, 'error');
      return;
    }
    triggerAudio('error');
    setBlockedUsers(p => [...p, target]);
    spawnToast('Daftar Hitam Terbentuk', `Pemain toxic "${target}" resmi diblokir dari semua interaksi klan & guild!`, 'success');
    setUserToBlock('');
  };

  const handleUnblockUser = (name: string) => {
    triggerAudio('move');
    setBlockedUsers(p => p.filter(u => u !== name));
    spawnToast('Blokir Dibuka', `Akses komunikasi untuk pemain "${name}" resmi diaktifkan kembali.`, 'info');
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    const target = reportTargetName.trim();
    if (!target) {
      spawnToast('Isian Kurang', 'Harap masukkan nama username terduga pelaku kecurangan atau perkataan kasar!', 'error');
      return;
    }
    triggerAudio('capture');
    spawnToast('Laporan Terkirim', `Laporan pelanggaran ${reportReason.toUpperCase()} terhadap "${target}" berhasil dikirim ke Dewan Administrator Catur Nopal. Tindakan penyelidikan segera dieksekusi!`, 'success');
    setReportTargetName('');
    setReportDesc('');
  };

  return (
    <div className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-2xl overflow-hidden shadow-xl select-none text-slate-100 font-sans">
      
      {/* LOCAL LIVE TOAST SIMULATOR INDICATOR */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-55 max-w-sm bg-[#262421] border-l-4 border-l-[#81b64c] border border-[#3c3934] p-4 rounded-xl shadow-2xl flex gap-3 pointer-events-auto"
          >
            <div className="shrink-0 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-rose-400 uppercase tracking-widest">{activeToast.title}</h5>
              <p className="text-[11px] text-[#9babaf] mt-1 font-semibold leading-relaxed">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-slate-500 hover:text-white shrink-0 self-start">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR FOR 81 FEATURES HUB RANGE (41 TO 50) */}
      <div className="bg-[#262421] p-5 border-b border-[#3c3934]/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-black tracking-widest uppercase text-[#81b64c] block font-mono">Modul Reruntuhan Arena Catur</span>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
            🎯 Modul Fitur Berkelas (41-50)
          </h2>
          <p className="text-xs text-[#9babaf] font-medium mt-0.5">Sistem Kuis Duolingo, Ritual Pre-Match, Gacha Rarity Terbuka, Medali Showroom, Poin Busana, Koleksi Pokedex & Manajemen Moderasi!</p>
        </div>
        
        {/* QUICK USER STAT BAR */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1e1c1b] p-2.5 px-4 rounded-xl border border-[#3c3934]">
          <div className="flex items-center gap-1.5" title="Koin Catur">
            <Coins className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-black text-white">{coins}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Diamond Catur">
            <Gem className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-black text-white">{diamonds}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Membership Akun">
            <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-[10px] font-extrabold uppercase text-yellow-400">{membershipStatus === 'premium' ? 'PREMIUM' : 'GRATIS'}</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CUSTOM NAVIGATION TABS FOR FEATURES 41 TO 50 */}
      <div className="bg-[#262421]/65 border-b border-[#3c3934]/60 p-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        {[
          { id: 'quiz', label: 'Duolingo Quiz', badge: '📝' },
          { id: 'ritual', label: 'Ritual Sebelum Laga', badge: '🎲' },
          { id: 'gacha', label: 'Mesin Gacha Rarity', badge: '🔮' },
          { id: 'medals', label: 'Medali & Rekor', badge: '🎖️' },
          { id: 'fashion', label: 'Fashion Poin', badge: '🧥' },
          { id: 'pokedex', label: 'Koleksi Pokedex', badge: '📖' },
          { id: 'settings', label: 'Preferensi Settings', badge: '⚙️' },
          { id: 'block-report', label: 'Daftar Blok & Lapor', badge: '🛡️' },
          { id: 'notif', label: 'Notifikasi Center', badge: '🔔' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              playTabChangeSound();
            }}
            className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-wider cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#81b64c]/10 border-[#81b64c]/40 text-[#81b64c]'
                : 'bg-transparent border-[#3c3934]/30 text-slate-400 hover:text-white hover:bg-[#3c3934]/25'
            }`}
          >
            <span>{tab.badge}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER DYNAMIC SUB PANELS */}
      <div className="p-6">
        
        {/* =========================================================================
            FEATURE 41: DUOLINGO QUIZ ROUTE & INTERACTIVE MAP
           ========================================================================= */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-6">
            <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex flex-col md:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-3xl shrink-0">
                🦉
              </div>
              <div>
                <h4 className="text-sm font-black text-[#81b64c] uppercase tracking-wide">Peta Jalur Kuis Bertema Catur (Duolingo Style!)</h4>
                <p className="text-xs text-[#9babaf] mt-1 leading-relaxed">
                  Lompat dari petak trivia ke petak catur berikutnya untuk mengasah pengetahuan kognitif pembukaan, endgame, garpu kuda, dan pin sakti! Di beberapa perhentian jalan terdapat <b>Peti Diamond Quiz</b> spesial yang siap Anda ketuk berulang kali!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* THE VERTICAL MAP PATH */}
              <div className="lg:col-span-7 bg-[#262421]/40 border border-[#3c3934]/70 p-4 rounded-2xl relative min-h-[500px] overflow-hidden flex flex-col justify-between">
                
                {/* SVG Connecting Path Line */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 170 700 Q 210 660 200 620 T 140 530 T 70 440 T 160 350 T 240 260 T 110 170 T 180 80"
                    fill="none"
                    stroke="#34312e"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 170 700 Q 210 660 200 620 T 140 530 T 70 440 T 160 350 T 240 260 T 110 170 T 180 80"
                    fill="none"
                    stroke="#81b64c"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="14 14"
                    className="animate-[dash_25s_linear_infinite]"
                  />
                </svg>

                {/* Real-time interactive nodes */}
                <div className="relative w-full h-[760px] select-none">
                  
                  {/* Mascot Speech Bubble standing along the track */}
                  <div className="absolute top-[480px] left-[190px] z-10 w-44 bg-[#262421] border border-[#3c3934] p-2.5 rounded-xl text-center shadow-lg animate-bounce">
                    <span className="text-[10px] font-black text-rose-400 block uppercase">Nopal si Mascot Burung</span>
                    <p className="text-[9px] text-[#9babaf] font-semibold mt-1">"Rook kokoh pantang menyerah sebelum skakmat!"</p>
                    <span className="text-xs mt-0.5 block">🦉</span>
                  </div>

                  {CATUR_QUIZNODES.map((node, idx) => {
                    const isSolved = solvedNodes.includes(node.id);
                    const isCurrentActive = solvedNodes.length === idx; 
                    const isLocked = !isSolved && !isCurrentActive;

                    return (
                      <div
                        key={node.id}
                        style={{ left: `${node.x}px`, top: `${node.y}px` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      >
                        {node.type === 'chest' ? (
                          <button
                            onClick={() => !isLocked && interactWithChestNode(node)}
                            disabled={isLocked}
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                              isSolved 
                                ? 'bg-[#312e2b] border-2 border-dashed border-[#3c3934] text-slate-500 opacity-60' 
                                : isLocked
                                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 scale-90 cursor-not-allowed'
                                : 'bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-300 text-[#312e2b] font-black hover:scale-110 shadow-lg text-lg animate-pulse'
                            }`}
                            title={node.name}
                          >
                            <span>📦</span>
                            <span className="text-[8px] uppercase tracking-wide leading-none select-none">Peti</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => !isLocked && startQuizForNode(node)}
                            disabled={isLocked}
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all relative ${
                              isSolved
                                ? 'bg-[#81b64c] border-2 border-[#81b64c]/20 text-white hover:scale-105'
                                : isCurrentActive
                                ? 'bg-cyan-500 border-4 border-cyan-400 text-slate-900 font-extrabold hover:scale-115 shadow-cyan-500/20 shadow-md scale-105'
                                : 'bg-[#312e2b] border border-[#3c3934] text-slate-500 scale-90 cursor-not-allowed'
                            }`}
                            title={node.name}
                          >
                            {isSolved ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            
                            {/* Node name badge */}
                            <span className="absolute left-1/2 -translate-x-1/2 -top-6 whitespace-nowrap text-[8px] font-black tracking-wider uppercase bg-[#262421] p-1 px-1.5 rounded-md border border-[#3c3934] text-slate-300 pointer-events-none">
                              {node.name}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QUIZ INTERACTIVE DIALOG PANE */}
              <div className="lg:col-span-5 flex flex-col justify-start">
                
                {/* 1. If active interactive question quiz is working */}
                {activeQuizNode && !quizFinished && (
                  <div className="bg-[#262421] border border-cyan-500/20 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase">KUIS AKTIF: {activeQuizNode.name}</span>
                      <button onClick={() => setActiveQuizNode(null)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full bg-[#1e1c1b] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#81b64c] h-full transition-all" 
                        style={{ width: `${((currentQuizIdx) / CATUR_QUIZ_QUESTIONS[activeQuizNode.id].length) * 100}%` }} 
                      />
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold text-amber-500">PERTANYAAN KE-{currentQuizIdx + 1} DARI {CATUR_QUIZ_QUESTIONS[activeQuizNode.id].length}</span>
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {CATUR_QUIZ_QUESTIONS[activeQuizNode.id][currentQuizIdx].question}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      {CATUR_QUIZ_QUESTIONS[activeQuizNode.id][currentQuizIdx].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedOptIdx === oIdx
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                              : 'bg-[#1e1c1b] border-[#3c3934]/60 text-[#9babaf] hover:text-white hover:bg-[#3c3934]/30'
                          }`}
                        >
                          <span className="inline-block w-5 h-5 rounded-md bg-[#262421] border border-[#3c3934] text-center leading-5 text-[9px] font-black mr-2">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={submitQuizAnswer}
                      disabled={selectedOptIdx === null}
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                        selectedOptIdx !== null
                          ? 'bg-[#81b64c] text-[#1e1c1b] hover:scale-[1.02] shadow-lg'
                          : 'bg-[#312e2b] text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Kirim Jawaban
                    </button>
                  </div>
                )}

                {/* 2. If quiz finished successfully */}
                {quizFinished && (
                  <div className="bg-[#262421] border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner">
                      🏆
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Kuis Selesai Terpecahkan!</h4>
                    <p className="text-xs text-[#9babaf] leading-relaxed">
                      Sesi cerdas teori catur "{activeQuizNode?.name}" berhasil ditaklukkan! Pengetahuan taktis Anda bertambah kokoh.
                    </p>
                    <button
                      onClick={() => {
                        setActiveQuizNode(null);
                        setQuizFinished(false);
                      }}
                      className="w-full bg-[#81b64c] text-[#1e1c1b] py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
                    >
                      Buka Peta Kembali
                    </button>
                  </div>
                )}

                {/* 3. If chest node is selected */}
                {activeChestNode && (
                  <div className="bg-[#262421] border border-amber-500/30 p-5 rounded-2xl text-center space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase">COBA KETUK PETI</span>
                      <button onClick={() => setActiveChestNode(null)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#9babaf] leading-relaxed">
                      Ketuk peti harta catur sebanyak 5 kali untuk mengumpulkan bintang keberuntungan! Lebih beruntung mendapatkan Diamond berlipat!
                    </p>

                    {/* STARS VISUAL DISPLAY */}
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      {[1, 2, 3, 4, 5].map(starNum => (
                        <Star
                          key={starNum}
                          className={`w-6 h-6 transition-all ${
                            starNum <= chestStarsEarned 
                              ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md' 
                              : 'text-zinc-650'
                          }`}
                        />
                      ))}
                    </div>

                    {/* TAP AREA CHEST BOX */}
                    <button
                      onClick={tapChestBox}
                      disabled={isOpeningChestProgress}
                      className="w-28 h-28 rounded-3xl bg-[#1e1c1b] hover:bg-[#312e2b] border border-[#3c3934] mx-auto flex items-center justify-center relative focus:outline-none cursor-pointer transform hover:scale-105 active:scale-95 transition-all shadow-inner group"
                    >
                      <span className="text-5xl group-hover:animate-bounce select-none">
                        {chestTapsCount >= 5 ? '🔓' : '📦'}
                      </span>
                      <div className="absolute bottom-1 bg-[#262421] border border-[#3c3934] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-amber-500">
                        {chestTapsCount}/5 KETUKAN
                      </div>
                    </button>

                    <p className="text-[10px] font-mono text-amber-500 uppercase font-black">
                      Hadiah Menanti: Bintang {chestStarsEarned} = {
                        chestStarsEarned === 5 ? '12' : chestStarsEarned === 4 ? '7' : chestStarsEarned === 3 ? '4' : chestStarsEarned === 2 ? '2' : '1'
                      } Diamond {membershipStatus === 'premium' ? 'x1.5 (Premium!)' : ''}
                    </p>
                  </div>
                )}

                {!activeQuizNode && !activeChestNode && (
                  <div className="bg-[#262421]/60 border border-[#3c3934]/40 p-6 rounded-2xl text-center space-y-3">
                    <span className="text-3xl">🧩</span>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Pilih Node Kuis & Peti</h5>
                    <p className="text-[11px] text-[#9babaf] leading-relaxed">
                      Silakan ketuk bulatan kuis berwarna hijau/cyan, atau peti emas yang berkilauan di peta sebelah kiri untuk memulai ujian teori catur berhadiah mutlak!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 42: PRE-MATCH RITUAL CEREMONY
           ========================================================================= */}
        {activeSubTab === 'ritual' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934] space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Ritual Keberuntungan Sebelum Bertanding</h4>
              <p className="text-xs text-[#9babaf] leading-relaxed">
                Di Catur Nopal, Anda dapat melakukan upacara adat sebelum melakoni duel sengit dengan AI Bot atau Teman! Pilih ritual andalan Anda, buat tebakan jitu, lalu putar asalnya. <b>Siapa pemenang ritual ini berhak menetapkan formasi warna bidak (Putih / Hitam) sesuka hatinya!</b>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CONFIG PANEL */}
              <div className="bg-[#262421]/30 p-5 rounded-2xl border border-[#3c3934]/60 space-y-4">
                <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">1. Pilih Opsi Ritual</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dice', label: 'Dadu Kembar', icon: '🎲' },
                    { id: 'suit', label: 'Suit Jari', icon: '✌️' },
                    { id: 'coin', label: 'Lempar Koin', icon: '🪙' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedRitualType(item.id as any);
                        setRitualChoice('');
                        setRitualResult(null);
                        triggerAudio('move');
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedRitualType === item.id
                          ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c] font-black scale-105 shadow-md'
                          : 'bg-[#1e1c1b] border-[#3c3934] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-center">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-black tracking-widest text-[#9babaf] uppercase block mb-2">2. Masukkan Tebakan Anda</span>
                  
                  {selectedRitualType === 'dice' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setRitualChoice('odd'); triggerAudio('move'); }}
                        className={`p-3 rounded-xl border text-xs font-black uppercase ${
                          ritualChoice === 'odd' ? 'bg-[#81b64c] text-slate-900 border-[#81b64c]' : 'bg-[#1e1c1b] border-[#3c3934]'
                        }`}
                      >
                        GANJIL (1, 3, 5)
                      </button>
                      <button
                        onClick={() => { setRitualChoice('even'); triggerAudio('move'); }}
                        className={`p-3 rounded-xl border text-xs font-black uppercase ${
                          ritualChoice === 'even' ? 'bg-[#81b64c] text-slate-900 border-[#81b64c]' : 'bg-[#1e1c1b] border-[#3c3934]'
                        }`}
                      >
                        GENAP (2, 4, 6)
                      </button>
                    </div>
                  )}

                  {selectedRitualType === 'suit' && (
                    <div className="grid grid-cols-3 gap-2">
                      {['batu', 'gunting', 'kertas'].map(suitOpt => (
                        <button
                          key={suitOpt}
                          onClick={() => { setRitualChoice(suitOpt); triggerAudio('move'); }}
                          className={`p-2.5 rounded-xl border text-[10px] font-black uppercase ${
                            ritualChoice === suitOpt ? 'bg-[#81b64c] text-slate-900 border-[#81b64c]' : 'bg-[#1e1c1b] border-[#3c3934]'
                          }`}
                        >
                          {suitOpt}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedRitualType === 'coin' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setRitualChoice('garuda'); triggerAudio('move'); }}
                        className={`p-3 rounded-xl border text-xs font-black uppercase ${
                          ritualChoice === 'garuda' ? 'bg-[#81b64c] text-slate-900 border-[#81b64c]' : 'bg-[#1e1c1b] border-[#3c3934]'
                        }`}
                      >
                        Sisi Garuda
                      </button>
                      <button
                        onClick={() => { setRitualChoice('angka'); triggerAudio('move'); }}
                        className={`p-3 rounded-xl border text-xs font-black uppercase ${
                          ritualChoice === 'angka' ? 'bg-[#81b64c] text-slate-900 border-[#81b64c]' : 'bg-[#1e1c1b] border-[#3c3934]'
                        }`}
                      >
                        Sisi Angka
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={startRitualSpin}
                  disabled={isRitualRunning}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${
                    isRitualRunning ? 'bg-amber-600 text-white animate-pulse' : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900'
                  }`}
                >
                  {isRitualRunning ? 'Sihir Ritual Berputar...' : 'Nyalakan Upacara Ritual'}
                </button>
              </div>

              {/* LIVE PLAYGROUND DISPLAY */}
              <div className="bg-[#262421]/30 p-5 rounded-2xl border border-[#3c3934]/60 flex flex-col justify-between min-h-[290px]">
                <div className="text-center space-y-4 my-auto">
                  
                  {isRitualRunning ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-amber-500 border-t-transparent animate-spin mx-auto" />
                      <span className="text-xs font-black uppercase text-amber-500 tracking-wider">Roda Hasil Diputar...</span>
                    </div>
                  ) : ritualResult ? (
                    <div className="space-y-3">
                      <span className="text-5xl">{ritualResult.isWin ? '👑' : '🤖'}</span>
                      <h5 className={`text-sm font-black uppercase tracking-wider ${
                        ritualResult.isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {ritualResult.isWin ? 'ANDA MENANG RITUAL!' : 'BOT MENANG RITUAL!'}
                      </h5>
                      <p className="text-xs text-[#9babaf] font-medium leading-relaxed">{ritualResult.details}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-500">
                      <HelpCircle className="w-12 h-12 mx-auto stroke-[1.5]" />
                      <h5 className="text-xs font-black uppercase">Hasil Ritual Belum Terbit</h5>
                      <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto">
                        Harap selesaikan tebakan dan picu upacara adat untuk melihat hasil mendarat.
                      </p>
                    </div>
                  )}

                  {/* CHOOSE PIECE COLOR DIALOG IF WIN */}
                  {ritualResult && ritualResult.isWin && !ritualPrefColor && (
                    <div className="pt-4 border-t border-[#3c3934]/50 space-y-2">
                      <p className="text-[10px] uppercase font-black tracking-wider text-amber-500">Silakan pilih posisi bidak catur Anda:</p>
                      <div className="grid grid-cols-2 gap-2 max-w-[220px] mx-auto">
                        <button
                          onClick={() => { setRitualPrefColor('w'); triggerAudio('win'); spawnToast('Pilihan Mantap', 'Anda akan bertanding memegang bidak Putih!', 'success'); }}
                          className="bg-white border-2 border-slate-300 text-slate-900 font-extrabold text-[10px] py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer uppercase"
                        >
                          Bidak Putih
                        </button>
                        <button
                          onClick={() => { setRitualPrefColor('b'); triggerAudio('win'); spawnToast('Pilihan Agresif', 'Anda akan bertanding memegang bidak Hitam!', 'success'); }}
                          className="bg-zinc-950 border-2 border-zinc-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer uppercase"
                        >
                          Bidak Hitam
                        </button>
                      </div>
                    </div>
                  )}

                  {ritualPrefColor && (
                    <div className="pt-2 text-center">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                        Warna Utama Siap Diluncurkan: {ritualPrefColor === 'w' ? 'PUTIH (Fighter-1)' : 'HITAM (Fighter-2)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 45: EXACT GACHA MACHINE WITH PITY ODDS & ANIMS
           ========================================================================= */}
        {activeSubTab === 'gacha' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SPIN ZONE */}
              <div className="lg:col-span-8 bg-[#262421]/40 border border-[#3c3934]/70 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#81b64c] block font-mono">Modul Gacha Catur</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mt-1">Gacha Kosmetik Kemakmuran Catur</h4>
                  <p className="text-xs text-[#9babaf] mt-1 leading-relaxed">
                    Putar roda kosmetik guna memboyong skin bidak epik, board berapi/salju, bingkai naga premium, dan gelar mulia! Pity terjamin untuk menghentikan rekor kesialan Anda!
                  </p>
                </div>

                {/* VISUAL WHEEL CONTAINER */}
                <div className="my-8 py-4 relative flex flex-col items-center justify-center min-h-[180px] bg-[#1e1c1b] border-2 border-[#3c3934]/65 rounded-2xl overflow-hidden">
                  
                  {isGachaSpinning ? (
                    <div className="text-center space-y-4">
                      {/* Spinning core */}
                      <div className="w-16 h-16 rounded-full border-4 border border-[#81b64c] border-b-transparent border-t-transparent animate-spin mx-auto text-center" />
                      <span className="text-xs font-black uppercase text-amber-500 tracking-widest block animate-pulse">Menarik Bintang Kosmik...</span>
                    </div>
                  ) : gachaPullResults.length > 0 ? (
                    <div className="p-3 w-full space-y-4">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center block">HASIL PENARIKAN GACHA TERBARU:</span>
                      <div className="flex flex-wrap gap-2 items-center justify-center">
                        {gachaPullResults.map((pulled, idx) => {
                          const isHigh = pulled.rarity === 'Legendary' || pulled.rarity === 'Mythic';
                          return (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: idx * 0.1 }}
                              key={idx}
                              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 min-w-[120px] text-center max-w-[150px] ${
                                pulled.rarity === 'Mythic' ? 'bg-gradient-to-tr from-purple-950 to-[#262421] border-[#FFC800] ring-4 ring-[#FFC800]/15 animate-pulse' :
                                pulled.rarity === 'Legendary' ? 'bg-gradient-to-br from-amber-950 to-[#262421] border-yellow-500 ring-2 ring-yellow-500/10' :
                                pulled.rarity === 'Epic' ? 'border-purple-600 bg-purple-950/20' :
                                pulled.rarity === 'Rare' ? 'border-blue-500 bg-blue-950/20' : 'border-[#3c3934] bg-[#262421]'
                              }`}
                            >
                              <span className="text-2xl">
                                {pulled.type === 'Bidak' ? '♟️' : pulled.type === 'Papan' ? '🗺️' : pulled.type === 'Bingkai' ? '🖼️' : '🎗️'}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-wider text-[#9babaf] block leading-none">{pulled.type}</span>
                              <h5 className="text-[10px] font-bold text-white truncate w-24 leading-snug">{pulled.name}</h5>
                              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                pulled.rarity === 'Mythic' ? 'bg-[#FFC800] text-black' :
                                pulled.rarity === 'Legendary' ? 'bg-amber-500 text-black' :
                                pulled.rarity === 'Epic' ? 'bg-purple-600 text-white' :
                                pulled.rarity === 'Rare' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                              }`}>
                                {pulled.rarity}
                              </span>
                              {pulled.forcePity && (
                                <span className="text-[8px] font-extrabold text-red-500 animate-[bounce_1.5s_infinite]">GUARANTEED PITY DIJAMIN!</span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <HelpCircle className="w-12 h-12 mx-auto text-slate-650" />
                      <h5 className="text-xs font-black text-[#9babaf] uppercase">Kotak Kosmetik Masih Tersegel</h5>
                      <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed mx-auto">
                        Gunakan koin Anda atau jatah spin gratis harian untuk menarik aneka hadiah visual fantastis.
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIVATE SPIN BUTTONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Single Spin Button */}
                  <div className="space-y-1">
                    <button
                      onClick={() => playGachaSpin(1)}
                      disabled={isGachaSpinning}
                      className="w-full bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-all text-center"
                    >
                      {freeSpinsLeft > 0 ? `1x Putaran Gratis (Sisa ${freeSpinsLeft})` : '1x Tarik (Harga: 25 Koin)'}
                    </button>
                    <span className="text-[8.5px] uppercase font-mono text-center block text-slate-500">
                      Gacha harian gratis: sisa {freeSpinsLeft} kali hari ini
                    </span>
                  </div>

                  {/* Multi (5x) Spin Button */}
                  <div className="space-y-1">
                    <button
                      onClick={() => playGachaSpin(5)}
                      disabled={isGachaSpinning}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-all text-center"
                    >
                      5x Spin Beruntun (Harga: 100 Koin)
                    </button>
                    <span className="text-[8.5px] uppercase font-mono text-center block text-amber-500/80 font-black">
                      DISKON HEMAT 20 Koin!
                    </span>
                  </div>

                </div>
              </div>

              {/* ODDS & PITY SYSTEM DETAILS */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* PITY SYSTEM SLOTS */}
                <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] space-y-3">
                  <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">🤖 Sistem Pity Bergaransi</span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300">Pity Rarity LEGENDARY</span>
                      <span className="font-mono text-amber-500 font-extrabold">{gachaPityLegendary}/50</span>
                    </div>
                    <div className="w-full bg-[#1e1c1b] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full transition-all" 
                        style={{ width: `${(gachaPityLegendary / 50) * 100}%` }} 
                      />
                    </div>
                    <p className="text-[8px] text-[#9babaf] leading-normal font-medium mt-0.5">
                      Suku perlindungan catur: dijamin mendapat item berperingkat Legendary seutuhnya pada putaran ke-50!
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#3c3934]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300">Pity Rarity MYTHIC</span>
                      <span className="font-mono text-purple-400 font-extrabold">{gachaPityMythic}/100</span>
                    </div>
                    <div className="w-full bg-[#1e1c1b] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full transition-all" 
                        style={{ width: `${(gachaPityMythic / 100) * 100}%` }} 
                      />
                    </div>
                    <p className="text-[8px] text-[#9babaf] leading-normal font-medium mt-0.5">
                      Dewa gacha mengabulkan doa: dijamin mendapat item berperingkat Mythic mutlak pada putaran ke-100!
                    </p>
                  </div>
                </div>

                {/* DROP ODDS CHART CARD */}
                <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-slate-300 uppercase block">📊 Persentase Keberuntungan Drop Rate</span>
                  
                  <div className="space-y-1.5 text-[9px] uppercase font-bold font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Common</span> <span>55.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>Uncommon</span> <span>25.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-400">
                      <span>Rare (Langka)</span> <span>12.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-purple-400">
                      <span>Epic (Esensial)</span> <span>5.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-500">
                      <span>Legendary (Agung)</span> <span>2.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-500">
                      <span>Mythic (Dewa)</span> <span>0.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-yellow-500 animate-pulse">
                      <span>Special (Limited)</span> <span>0.2%</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-[#9babaf] font-medium leading-normal pt-1.5 border-t border-[#3c3934] mt-1.5">
                    *<b>HAK ISTIMEWA PREMIUM:</b> Akun berstatus Premium lifetime memiliki bonus drop rate rarity tinggi x2.0 lebih beruntung dibanding akun standar!
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 44: DUOLINGO MEDALS & ACHIEVEMENTS UPGRADE
           ========================================================================= */}
        {activeSubTab === 'medals' && (
          <div className="space-y-6">
            
            {/* PERSONAL TOP STATS BOX */}
            <div className="bg-[#262421]/45 p-4 rounded-2xl border border-[#3c3934] space-y-3">
              <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">👑 Rekor Catur Personal Anda</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">Puncak XP Sehari</span>
                  <div className="text-sm font-black text-white mt-1">2,450 XP</div>
                </div>
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">Streak Beruntun</span>
                  <div className="text-sm font-black text-amber-400 mt-1">14 Hari 🔥</div>
                </div>
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">Menang Beruntun</span>
                  <div className="text-sm font-black text-emerald-400 mt-1">9 Match ♟️</div>
                </div>
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">Pertahanan Terlama</span>
                  <div className="text-sm font-black text-cyan-400 mt-1">82 Langkah</div>
                </div>
              </div>
            </div>

            {/* EXPANDED MEDAL GRID */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Showroom Medali Karakter Unik</h4>
                  <p className="text-xs text-[#9babaf] font-medium">Buka aneka level medali unik bergaya ilustrasi Duolingo dan pamerkan hingga 3 medali di kartu profilmu!</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#81b64c] bg-[#81b64c]/10 border border-[#81b64c]/20 p-1.5 px-3 rounded-lg">
                  Terpajang: {pinnedMedals.length}/3 Slot
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STATS_MEDALS.map(medal => {
                  const isUnlocked = medal.unlocked || medal.progress >= medal.target;
                  const isPinned = pinnedMedals.includes(medal.id);
                  const showSecretMask = medal.isSecret && !isUnlocked;

                  return (
                    <div
                      key={medal.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 relative ${
                        isUnlocked 
                          ? 'bg-[#262421] border-[#3c3934] hover:shadow-lg' 
                          : 'bg-[#1e1c1b] border-[#3c3934]/40 opacity-75'
                      }`}
                    >
                      {/* Left Badge Icon inside background circle */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked
                          ? 'bg-[#81b64c]/10 border-2 border-[#81b64c]/30 animate-pulse'
                          : 'bg-zinc-800 border border-zinc-700 filter grayscale'
                      }`}>
                        <span>{showSecretMask ? '❓' : medal.badge}</span>
                      </div>

                      {/* Info core */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-black text-white uppercase truncate">
                            {showSecretMask ? 'Rahasia Tersembunyi' : medal.name}
                          </h5>
                          <span className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                            medal.rarity === 'Mythic' ? 'bg-[#FFC800] text-black animate-bounce' :
                            medal.rarity === 'Legendary' ? 'bg-amber-500 text-black' :
                            medal.rarity === 'Epic' ? 'bg-purple-600 text-white' : 'bg-[#3c3934] text-[#9babaf]'
                          }`}>
                            {medal.rarity}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#9babaf] leading-normal font-semibold">
                          {showSecretMask ? 'Persyaratan tidak tertera publik. Selesaikan misi aneh untuk melihat kejutan.' : medal.desc}
                        </p>

                        {!showSecretMask && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[8px] font-mono text-slate-400 font-bold">
                              <span>PROGRESS KATALIS</span>
                              <span>{Math.min(medal.progress, medal.target)} / {medal.target}</span>
                            </div>
                            <div className="w-full bg-[#1e1c1b] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${isUnlocked ? 'bg-[#81b64c]' : 'bg-zinc-650'}`} 
                                style={{ width: `${Math.min((medal.progress / medal.target) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                        )}

                        {isUnlocked && (
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[8px] font-mono text-[#81b64c] font-black uppercase">Level {medal.level} Maks</span>
                            <button
                              onClick={() => togglePinMedalToProfile(medal.id)}
                              className={`p-1 px-2 text-[8px] font-black uppercase rounded transition-all cursor-pointer ${
                                isPinned
                                  ? 'bg-rose-650 text-white border border-rose-500/30'
                                  : 'bg-[#81b64c] text-slate-900'
                              }`}
                            >
                              {isPinned ? 'Copot Pajangan' : 'Pajang di Profil'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 46: FASHION POWER POINT SYSTEM & LEADERBOARD
           ========================================================================= */}
        {activeSubTab === 'fashion' && (
          <div className="space-y-6">
            
            {/* USER SCORE OVERVIEW */}
            <div className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-4 text-center space-y-1.5 border-b md:border-b-0 md:border-r border-[#3c3934] pb-4 md:pb-0 pr-0 md:pr-4">
                <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">Skor Kemewahan Busana</span>
                <div className="text-4xl font-black text-amber-500 drop-shadow">{fashionPointsScore} FP</div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 p-1 px-2 rounded-lg inline-block">
                  {fashionRankGelar}
                </span>
              </div>

              <div className="md:col-span-8 space-y-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Hukum & Penilaian Poin Busana</h4>
                <p className="text-[11px] text-[#9babaf] leading-relaxed font-semibold">
                  Tiap koleksi visual catur yang di-unlock melalui sistem gacha atau flash sale harian Jumat akan menyuntikkan Poin Busana secara permanen ke galeri klan Anda!
                </p>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono font-bold">
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-slate-400 border border-[#3c3934]">Common: +10 FP</span>
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-emerald-400 border border-[#3c3934]">Uncommon: +25 FP</span>
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-blue-400 border border-[#3c3934]">Rare: +50 FP</span>
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-purple-400 border border-[#3c3934]">Epic: +100 FP</span>
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-amber-500 border border-[#3c3934]">Legendary: +250 FP</span>
                  <span className="bg-[#1e1c1b] px-2 py-1 rounded text-rose-500 border border-[#3c3934] animate-pulse">Mythic: +500 FP</span>
                </div>
              </div>
            </div>

            {/* COMBINED LEADERBOARD & THEME BONUS SETS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Leaderboard Table list */}
              <div className="lg:col-span-6 bg-[#262421]/45 p-4 rounded-2xl border border-[#3c3934] space-y-3">
                <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">🏆 Tangga Klasemen Poin Busana Global</span>
                
                <div className="space-y-1.5">
                  {fashionLeaderboard.map((player, pIdx) => (
                    <div
                      key={pIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        player.isMe
                          ? 'bg-[#81b64c]/10 border-[#81b64c]/30'
                          : 'bg-[#1e1c1b] border-[#3c3934]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-slate-500 w-4 block text-center">{pIdx + 1}</span>
                        <span className="text-lg">{player.avatar}</span>
                        <div>
                          <span className={`font-black uppercase tracking-wide block ${player.isMe ? 'text-[#81b64c]' : 'text-white'}`}>
                            {player.name}
                          </span>
                          <span className="text-[8px] text-[#9babaf] font-semibold">{player.title}</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-amber-500">{player.score} FP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEATURE 48: THEME SET BONUS */}
              <div className="lg:col-span-6 bg-[#262421]/45 p-4 rounded-2xl border border-[#3c3934] space-y-3">
                <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase block">🧱 Sinergi Bonus Set Suku Tematis</span>
                
                <div className="space-y-4">
                  {THEME_SETS.map(set => {
                    const isFullyUnlocked = setBonusUnlockedStatus(set);
                    return (
                      <div
                        key={set.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isFullyUnlocked
                            ? 'bg-gradient-to-tr from-[#3c3934]/30 to-[#262421] border-cyan-500'
                            : 'bg-[#1e1c1b] border-[#3c3934] opacity-80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-extrabold text-white uppercase tracking-wider">{set.name}</h5>
                            <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded leading-none ${
                              isFullyUnlocked ? 'bg-cyan-500 text-[#1e1c1b]' : 'bg-[#3c3934] text-slate-500'
                            }`}>
                              {isFullyUnlocked ? 'TERBENTUK!' : 'BELUM LENGKAP'}
                            </span>
                          </div>
                          <p className="text-[9p] text-[#9babaf] leading-normal font-semibold">
                            {set.reward}
                          </p>
                        </div>

                        {/* Inventory items checklist */}
                        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-[#3c3934]/60 text-[9px] font-mono">
                          <div className="flex items-center gap-1">
                            <span>{unlockedInventory.includes(set.parts.piecSkin) ? '✅' : '❌'}</span>
                            <span className="text-slate-400 truncate">Skin Bidak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{unlockedInventory.includes(set.parts.boardTheme) ? '✅' : '❌'}</span>
                            <span className="text-slate-400 truncate">Tema Papan</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{unlockedInventory.includes(set.parts.frame) ? '✅' : '❌'}</span>
                            <span className="text-slate-400 truncate">Suku Frame</span>
                          </div>
                        </div>

                        {isFullyUnlocked && (
                          <button
                            onClick={() => claimSetBonusReward(set)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-[9px] py-2 rounded-lg mt-3.5 uppercase tracking-wider transition-all"
                          >
                            Klaim Hadiah Set Sinergi
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 47: CHESS DEX / KOLEKSIPOLIS (CHESS INDEX SYSTEM)
           ========================================================================= */}
        {activeSubTab === 'pokedex' && (
          <div className="space-y-4">
            <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider">Chess Pokedex (Indeks Koleksi Kosmetik)</h4>
                <p className="text-[10px] text-[#9babaf] mt-0.5">Pantau kesempurnaan koleksi Anda! Item yang sudah dimiliki tampil berwarna, yang belum tampil dalam siluet kunci hitam abu-abu.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#81b64c]/10 border border-[#81b64c]/20 p-2 rounded-lg text-[#81b64c]">
                Kelengkapan Indeks: {unlockedInventory.length} / {GACHA_ITEMS_POOL.length + STATS_MEDALS.length} Item
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {GACHA_ITEMS_POOL.map(item => {
                const isOwned = unlockedInventory.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 relative transition-all ${
                      isOwned
                        ? 'bg-[#262421] border-[#3c3934]'
                        : 'bg-[#1e1c1b] border-dashed border-[#3c3934]/40 select-none'
                    }`}
                  >
                    {!isOwned && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-xl z-10">
                        <Lock className="w-5 h-5 text-slate-500" />
                      </div>
                    )}

                    <span className={`text-2xl ${!isOwned ? 'filter grayscale blur-xs' : ''}`}>
                      {item.type === 'Bidak' ? '♟️' : item.type === 'Papan' ? '🗺️' : item.type === 'Bingkai' ? '🖼️' : '🎗️'}
                    </span>
                    
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">{item.type}</span>
                      <h5 className="text-[10px] font-extrabold text-white truncate w-24 block leading-none">{item.name}</h5>
                    </div>

                    <span className={`text-[7.5px] font-mono font-black px-1.5 py-0.5 rounded leading-none ${
                        item.rarity === 'Mythic' ? 'bg-[#FFC800] text-black' :
                        item.rarity === 'Legendary' ? 'bg-amber-500 text-black' :
                        item.rarity === 'Epic' ? 'bg-purple-600 text-white' : 'bg-[#3c3934] text-slate-400'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 43: SETTINGS PANE WITH DARK/LIGHT & LANGAUGE SELECTION
           ========================================================================= */}
        {activeSubTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto bg-[#262421] p-6 rounded-2xl border border-[#3c3934] shadow-xl">
            <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">⚙️ Panel Preferensi Konfigurasi Sistem</span>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Pengaturan Visual & Linguistik</h4>
            <div className="w-full h-px bg-[#3c3934]/60" />

            {/* LIGHT/DARK THEME SWITCHER */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[#3c3934]/50">
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Pilihan Nuansa Tema Visual</h5>
                <p className="text-[10px] text-[#9babaf] mt-0.5">Pilih pencahayaan mata yang paling sesuai dengan durasi tanding catur Anda.</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setSettingsTheme('dark');
                    localStorage.setItem('pref_theme', 'dark');
                    triggerAudio('move');
                    spawnToast('Tema Kegelapan', 'Mode Gelap Abyss berhasil disematkan untuk kenyamanan mata.', 'info');
                  }}
                  className={`p-2 px-4 rounded-xl border text-[10px] uppercase font-black cursor-pointer transition-all ${
                    settingsTheme === 'dark'
                      ? 'bg-zinc-950 border-[#81b64c] text-white font-black'
                      : 'bg-[#1e1c1b] border-transparent text-slate-400'
                  }`}
                >
                  Dark Core
                </button>
                <button
                  onClick={() => {
                    setSettingsTheme('light');
                    localStorage.setItem('pref_theme', 'light');
                    triggerAudio('move');
                    spawnToast('Tema Terang', 'Mode Terang Sun-Rise berhasil disematkan pada panel.', 'info');
                  }}
                  className={`p-2 px-4 rounded-xl border text-[10px] uppercase font-black cursor-pointer transition-all ${
                    settingsTheme === 'light'
                      ? 'bg-[#eae8e4] border-amber-600 text-[#1e1c1b] font-black'
                      : 'bg-[#1e1c1b] border-transparent text-slate-400'
                  }`}
                >
                  Light Cream
                </button>
              </div>
            </div>

            {/* LANGUAGE CHANGER */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[#3c3934]/50">
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Aksen Komunikasi Bahasa</h5>
                <p className="text-[10px] text-[#9babaf] mt-0.5">Format instruksi menu arena dan saran canggih Bot AI.</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setSettingsLang('id');
                    localStorage.setItem('pref_lang', 'id');
                    triggerAudio('move');
                    spawnToast('Bahasa Diubah', 'Bahasa pengantar kini dalam Bahasa Indonesia.', 'info');
                  }}
                  className={`p-2 px-4 rounded-xl border text-[10px] uppercase font-black cursor-pointer transition-all ${
                    settingsLang === 'id'
                      ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c]'
                      : 'bg-[#1e1c1b] border-transparent text-slate-400'
                  }`}
                >
                  Indonesia
                </button>
                <button
                  onClick={() => {
                    setSettingsLang('en');
                    localStorage.setItem('pref_lang', 'en');
                    triggerAudio('move');
                    spawnToast('Language Updated', 'Standard communication is now set to English style.', 'info');
                  }}
                  className={`p-2 px-4 rounded-xl border text-[10px] uppercase font-black cursor-pointer transition-all ${
                    settingsLang === 'en'
                      ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c]'
                      : 'bg-[#1e1c1b] border-transparent text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* STAMINA SUMMARY */}
            <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Suku Versi Server</span>
              <span className="font-bold text-white text-[10px]">Catur Nopal v2.0 - Free Edition Enabled</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 49: MODERATION FOR REports & BLOCKED USERS
           ========================================================================= */}
        {activeSubTab === 'block-report' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BLOCK MANAGEMENT ZONE */}
              <div className="bg-[#262421] p-5 rounded-xl border border-[#3c3934] space-y-4">
                <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">🚫 Manajemen Daftar Blokir Anda</span>
                <p className="text-xs text-[#9babaf] leading-normal font-medium">Masukkan nama player toxic yang menyepam atau bersikap tidak suportif untuk memblokir chat, invite klan, ataupun tantangan laga secara utuh.</p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userToBlock}
                    onChange={(e) => setUserToBlock(e.target.value)}
                    placeholder="Contoh: PecaturSpam99"
                    className="flex-1 bg-[#1e1c1b] border border-[#3c3934] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#81b64c]"
                  />
                  <button
                    onClick={handleBlockUser}
                    className="p-2.5 px-4 bg-rose-650 hover:bg-rose-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Tambah Blokir
                  </button>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">Daftar Player Terblokir ({blockedUsers.length}):</span>
                  {blockedUsers.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">Daftar blokir bersih. Anda ramah bersosialisasi!</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {blockedUsers.map(name => (
                        <div key={name} className="flex items-center justify-between bg-[#1e1c1b] p-2.5 rounded-lg border border-[#3c3934]/60 text-xs text-slate-300">
                          <span className="font-mono">{name}</span>
                          <button
                            onClick={() => handleUnblockUser(name)}
                            className="text-[9px] font-black uppercase tracking-wider text-green-500 hover:text-white"
                          >
                            Buka Blokir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* REPORT PLAYER CENTER */}
              <form onSubmit={handleSendReport} className="bg-[#262421] p-5 rounded-xl border border-[#3c3934] space-y-4">
                <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">🛡️ Pusat Pengaduan & Laporan Pelanggaran</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">Nama Pelaku Kecurangan / Toxic:</label>
                  <input
                    type="text"
                    required
                    value={reportTargetName}
                    onChange={(e) => setReportTargetName(e.target.value)}
                    placeholder="Contoh: PecaturCurangBot"
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">Kategori Pelanggaran:</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-[#9babaf] focus:outline-none focus:border-[#81b64c]"
                  >
                    <option value="toxic-chat">Komunikasi Toxic / Spam Kasar</option>
                    <option value="engine-cheat">Penggunaan Bot Engine (Modding/Cheat)</option>
                    <option value="stalling-time">Mengulur-ulur Waktu Secara Sengaja</option>
                    <option value="fake-id">Nama Profil Provokatif / Kurang Pantas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">Keterangan Bukti (Opsional):</label>
                  <textarea
                    rows={2}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Sebutkan langkah pertandingan atau kata-kata kasarnya..."
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Kirim Pengaduan Resmi
                </button>
              </form>

            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 50: NOTIFICATION CENTER & NOTIFIATION HISTORIES LOG
           ========================================================================= */}
        {activeSubTab === 'notif' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Pusat Riwayat Notifikasi</h4>
                <p className="text-[10px] text-[#9babaf] mt-0.5">Semua peringatan masuk, tantangan duel online, dan kado masuk diarsipkan di sini.</p>
              </div>

              <button
                onClick={triggerSimulatedFriendNotification}
                className="bg-[#81b64c] hover:bg-[#81b64c]/90 text-slate-900 font-black text-[9px] py-2 px-3 rounded-lg transition-all"
              >
                Picu Test Notif Live
              </button>
            </div>

            <div className="space-y-2">
              {notificationLog.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic bg-[#262421]/20 rounded-xl border border-[#3c3934]/40">
                  Belum ada notifikasi atau sapaan masuk terdeteksi.
                </div>
              ) : (
                notificationLog.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      notif.read ? 'bg-[#262421]/40 border-[#3c3934]/65' : 'bg-[#262421] border-[#81b64c]/20'
                    }`}
                  >
                    <div className="mt-0.5 text-cyan-400 shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-white uppercase">{notif.title}</h5>
                        <span className="text-[8px] font-mono text-slate-500">{notif.time}</span>
                      </div>
                      <p className="text-[10px] text-[#9babaf] font-semibold leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={() => {
                triggerAudio('move');
                setNotificationLog([]);
                spawnToast('Riwayat Dibersihkan', 'Semua riwayat notifikasi sosial berhasil dihapus bersih!', 'info');
              }}
              className="w-full text-center text-[9px] font-extrabold uppercase text-rose-500 hover:text-white pt-2.5 transition-colors"
            >
              Kosongkan Semua Log Notifikasi
            </button>
          </div>
        )}

      </div>

      <div className="bg-[#262421] p-3 border-t border-[#3c3934]/80 text-center font-mono text-[8px] uppercase tracking-widest text-[#9babaf]">
        Modul Multi-Fitur v2.0 • Suku Catur Pilihan Cerdas Google AI Studio
      </div>
    </div>
  );
};

// =========================================================================
// AVATAR COMPONENT HELPER TO AVOID BREAKAGES
// =========================================================================
import martinAvatar from '../assets/images/avatar_martin_1779709510230.png';

interface AvatarWithFrameProps {
  src: string;
  frameId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({ src, frameId, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const borderFrame = frameId === 'frame_gold_dragon' ? 'border-4 border-yellow-500 shadow-yellow-500/10' :
                      frameId === 'frame_neon_glitch' ? 'border-2 border-purple-500 shadow-purple-500/10' :
                      frameId === 'frame_wooden' ? 'border-3 border-amber-800' : 'border border-[#3c3934]/70';

  return (
    <div className={`relative ${sizeClass} rounded-full overflow-hidden shrink-0 ${borderFrame}`}>
      <img 
        src={src || martinAvatar} 
        alt="Avatar" 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
