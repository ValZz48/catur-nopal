import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Users, Swords, MessageSquare, Shield, Trophy, Activity, Flame, ChevronLeft, Check, Sparkles, Gift, Gem, Coins } from 'lucide-react';

interface SukuActivitiesProps {
  activityDetail: 'list' | 'fragments' | 'bonus' | 'war' | 'chat';
  setActivityDetail: (v: any) => void;
  guildMembers: any[];
  setGuildMembers: React.Dispatch<React.SetStateAction<any[]>>;
  username: string;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  clanCheckedIn: boolean;
  setClanCheckedIn: (v: boolean) => void;
  claimedWeeklyMilestones: number[];
  setClaimedWeeklyMilestones: React.Dispatch<React.SetStateAction<number[]>>;
  guildLogs: string[];
  setGuildLogs: React.Dispatch<React.SetStateAction<string[]>>;
  guildChatMessages: any[];
  setGuildChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  conqueredBoards: string[];
  setConqueredBoards: React.Dispatch<React.SetStateAction<string[]>>;
  activeWarStage: number | null;
  setActiveWarStage: (v: number | null) => void;
  selectedPuzzlePiece: { r: number; c: number } | null;
  setSelectedPuzzlePiece: (v: any) => void;
  wrongPuzzleAttempt: boolean;
  setWrongPuzzleAttempt: (v: boolean) => void;
  myFragments: any;
  setMyFragments: React.Dispatch<React.SetStateAction<any>>;
  fragmentRequests: any[];
  setFragmentRequests: React.Dispatch<React.SetStateAction<any[]>>;
  fragmentRequestCooldown: number;
  setFragmentRequestCooldown: React.Dispatch<React.SetStateAction<number>>;
  todayFragmentDonationCount: number;
  setTodayFragmentDonationCount: React.Dispatch<React.SetStateAction<number>>;
  requestedFragmentSkin: string;
  setRequestedFragmentSkin: (v: string) => void;
  hasActiveFragmentReq: boolean;
  setHasActiveFragmentReq: (v: boolean) => void;
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, msg: string, type?: any) => void;
  prefLang?: 'id' | 'en';
}

export const SukuActivities: React.FC<SukuActivitiesProps> = ({
  activityDetail,
  setActivityDetail,
  guildMembers,
  setGuildMembers,
  username,
  coins,
  setCoins,
  diamonds,
  setDiamonds,
  clanCheckedIn,
  setClanCheckedIn,
  claimedWeeklyMilestones,
  setClaimedWeeklyMilestones,
  guildLogs,
  setGuildLogs,
  guildChatMessages,
  setGuildChatMessages,
  conqueredBoards,
  setConqueredBoards,
  activeWarStage,
  setActiveWarStage,
  selectedPuzzlePiece,
  setSelectedPuzzlePiece,
  wrongPuzzleAttempt,
  setWrongPuzzleAttempt,
  myFragments,
  setMyFragments,
  fragmentRequests,
  setFragmentRequests,
  fragmentRequestCooldown,
  setFragmentRequestCooldown,
  todayFragmentDonationCount,
  setTodayFragmentDonationCount,
  requestedFragmentSkin,
  setRequestedFragmentSkin,
  hasActiveFragmentReq,
  setHasActiveFragmentReq,
  setUnlockedSkins,
  triggerAudio,
  triggerReward,
  prefLang
}) => {
  const isEng = prefLang === 'en';
  // Activity A - Fragments: state hooks
  const [activeFragReq, setActiveFragReq] = useState(false);

  // Milestone Chest Gacha opening state
  const [openingChest, setOpeningChest] = useState<{
    tier: number;
    requirement: number;
    label: string;
    coins: number;
    diamonds: number;
    isShaking: boolean;
    isOpened: boolean;
    finalCoins: number;
    finalDiamonds: number;
  } | null>(null);

  // Activiy B - Milestones & Checkins
  const totalClanContribution = guildMembers.reduce((sum, m) => sum + (m.contribution || 0), 0);

  // Dedicated Tactical Combat Minigame States
  interface CombatMove {
    name: string;
    power: number;
    type: 'Api' | 'Air' | 'Tanah' | 'Petir' | 'Cahaya' | 'Kegelapan';
    category: 'attack' | 'support' | 'defend' | 'ultimate';
    desc: string;
    pp?: number;
    maxPp?: number;
  }

  interface CombatUnit {
    id: string;
    name: string;
    symbol: string;
    hp: number;
    maxHp: number;
    atk: number; // Multiplier (e.g. 1.0, 1.2)
    element: 'Api' | 'Air' | 'Tanah' | 'Petir' | 'Cahaya' | 'Kegelapan';
    color: 'white' | 'black';
    moves: CombatMove[];
    shield: number;
    invulnerable?: boolean;
    atkBuff?: number;
  }

  const PLAYER_ROSTER_TEMPLATES: Omit<CombatUnit, 'id' | 'shield'>[] = [
    {
      name: 'Pion Perkasa',
      symbol: '♙',
      hp: 120,
      maxHp: 120,
      atk: 1.0,
      element: 'Petir',
      color: 'white',
      moves: [
        { name: 'Spark Strike', power: 40, type: 'Petir', category: 'attack', desc: 'Serangan sengatan listrik cepat.' },
        { name: 'Volt Charge', power: 65, type: 'Petir', category: 'attack', desc: 'Serangan petir penembus baja.' },
        { name: 'Pion Barrier', power: 0, type: 'Tanah', category: 'defend', desc: 'Memulihkan 25 HP dan menambah 25 Shield.' },
        { name: 'Overload Thunder', power: 100, type: 'Petir', category: 'ultimate', desc: 'Ledakan listrik dahsyat yang melumpuhkan.' }
      ]
    },
    {
      name: 'Ksatria Sakti',
      symbol: '♘',
      hp: 150,
      maxHp: 150,
      atk: 1.2,
      element: 'Api',
      color: 'white',
      moves: [
        { name: 'Tusukan Bara', power: 45, type: 'Api', category: 'attack', desc: 'Tusukan tombak dilapisi api membara.' },
        { name: 'Knight Jump', power: 70, type: 'Api', category: 'attack', desc: 'Melompati rintangan menghantam target.' },
        { name: 'Semangat Juang', power: 0, type: 'Api', category: 'support', desc: 'Meningkatkan Attack kawan sebesar 25%.' },
        { name: 'Blazing Meteor', power: 110, type: 'Api', category: 'ultimate', desc: 'Meteor api menghanguskan pertahanan musuh.' }
      ]
    },
    {
      name: 'Gajah Taktis',
      symbol: '♗',
      hp: 130,
      maxHp: 130,
      atk: 1.1,
      element: 'Air',
      color: 'white',
      moves: [
        { name: 'Pancaran Aqua', power: 40, type: 'Air', category: 'attack', desc: 'Semburan air bertekanan tinggi secara diagonal.' },
        { name: 'Tsunami Swell', power: 65, type: 'Air', category: 'attack', desc: 'Gulungan air pasang besar menerjang target.' },
        { name: 'Air Berkat', power: 0, type: 'Air', category: 'support', desc: 'Menyembuhkan 45 HP kawan aktif.' },
        { name: 'Holy Storm Rain', power: 95, type: 'Air', category: 'ultimate', desc: 'Serang musuh & pulihkan kawan 20 HP.' }
      ]
    },
    {
      name: 'Benteng Kokoh',
      symbol: '♖',
      hp: 210,
      maxHp: 210,
      atk: 0.9,
      element: 'Tanah',
      color: 'white',
      moves: [
        { name: 'Hantaman Batu', power: 50, type: 'Tanah', category: 'attack', desc: 'Hantaman tembok batu keras.' },
        { name: 'Gempa Kastil', power: 75, type: 'Tanah', category: 'attack', desc: 'Guncangan gempa bumi menghancurkan lawan.' },
        { name: 'Fortress Shell', power: 0, type: 'Tanah', category: 'defend', desc: 'Memperoleh perisai pelindung 50 Shield.' },
        { name: 'Continental Crush', power: 105, type: 'Tanah', category: 'ultimate', desc: 'Hantamkan bongkahan benua masif.' }
      ]
    },
    {
      name: 'Ratu Agung',
      symbol: '♕',
      hp: 140,
      maxHp: 140,
      atk: 1.3,
      element: 'Cahaya',
      color: 'white',
      moves: [
        { name: 'Sinar Suci', power: 55, type: 'Cahaya', category: 'attack', desc: 'Serangan laser sinar kosmik murni.' },
        { name: 'Tebasan Dirgantara', power: 80, type: 'Cahaya', category: 'attack', desc: 'Tebasan bersayap cahaya mulia.' },
        { name: 'Aura Kesembuhan', power: 0, type: 'Cahaya', category: 'support', desc: 'Pulihkan 40 HP kawan & naikkan Atk kawan 15%.' },
        { name: 'Supernova Burst', power: 120, type: 'Cahaya', category: 'ultimate', desc: 'Ledakan energi cahaya supernova dahsyat.' }
      ]
    },
    {
      name: 'Raja Agung',
      symbol: '♔',
      hp: 180,
      maxHp: 180,
      atk: 1.1,
      element: 'Kegelapan',
      color: 'white',
      moves: [
        { name: 'Cakar Bayangan', power: 50, type: 'Kegelapan', category: 'attack', desc: 'Tebasan cakar bayangan gelap.' },
        { name: 'Hisapan Jiwa', power: 70, type: 'Kegelapan', category: 'attack', desc: 'Menyerang musuh dan menyerap 50% damage jadi HP.' },
        { name: 'Dekret Mutlak', power: 0, type: 'Kegelapan', category: 'defend', desc: 'Membuat diri kebal (Invulnerable) selama 1 giliran.' },
        { name: 'Apocalypse Reign', power: 115, type: 'Kegelapan', category: 'ultimate', desc: 'Memanggil kiamat kegelapan absolut.' }
      ]
    }
  ];

  const ENEMY_PIECE_TEMPLATES: Record<string, Omit<CombatUnit, 'id' | 'color' | 'shield'>> = {
    pion_rival: {
      name: 'Pion Hitam', symbol: '♟', hp: 100, maxHp: 100, atk: 0.8, element: 'Petir',
      moves: [
        { name: 'Spark Strike', power: 40, type: 'Petir', category: 'attack', desc: 'Serangan sengatan listrik.' },
        { name: 'Volt Charge', power: 60, type: 'Petir', category: 'attack', desc: 'Serangan petir bertegangan tinggi.' }
      ]
    },
    ksatria_rival: {
      name: 'Ksatria Hitam', symbol: '♞', hp: 130, maxHp: 130, atk: 1.0, element: 'Api',
      moves: [
        { name: 'Tusukan Bara', power: 45, type: 'Api', category: 'attack', desc: 'Tusukan pedang api.' },
        { name: 'Knight Jump', power: 65, type: 'Api', category: 'attack', desc: 'Lompatan menghantam target.' }
      ]
    },
    gajah_rival: {
      name: 'Gajah Hitam', symbol: '♝', hp: 120, maxHp: 120, atk: 1.0, element: 'Air',
      moves: [
        { name: 'Pancaran Aqua', power: 40, type: 'Air', category: 'attack', desc: 'Semburan air bertekanan tinggi.' },
        { name: 'Air Berkat', power: 0, type: 'Air', category: 'support', desc: 'Menyembuhkan 35 HP.' }
      ]
    },
    benteng_rival: {
      name: 'Benteng Hitam', symbol: '♜', hp: 170, maxHp: 170, atk: 0.9, element: 'Tanah',
      moves: [
        { name: 'Hantaman Batu', power: 50, type: 'Tanah', category: 'attack', desc: 'Hantaman dinding batu keras.' },
        { name: 'Fortress Shell', power: 0, type: 'Tanah', category: 'defend', desc: 'Memperoleh perisai +40 HP.' }
      ]
    },
    ratu_rival: {
      name: 'Ratu Kegelapan', symbol: '♛', hp: 160, maxHp: 160, atk: 1.2, element: 'Kegelapan',
      moves: [
        { name: 'Sinar Kelam', power: 50, type: 'Kegelapan', category: 'attack', desc: 'Semburan laser energi kegelapan murni.' },
        { name: 'Kiamat Bayang', power: 105, type: 'Kegelapan', category: 'ultimate', desc: 'Ledakan dahsyat badai kegelapan abadi.' }
      ]
    },
    raja_rival: {
      name: 'Raja Kegelapan', symbol: '♚', hp: 200, maxHp: 200, atk: 1.1, element: 'Kegelapan',
      moves: [
        { name: 'Cakar Bayangan', power: 45, type: 'Kegelapan', category: 'attack', desc: 'Cakar bayangan gelap.' },
        { name: 'Apocalypse Reign', power: 110, type: 'Kegelapan', category: 'ultimate', desc: 'Kiamat kegelapan absolut.' }
      ]
    }
  };

  const getElementMultiplier = (moveType: 'Api' | 'Air' | 'Tanah' | 'Petir' | 'Cahaya' | 'Kegelapan', targetElement: 'Api' | 'Air' | 'Tanah' | 'Petir' | 'Cahaya' | 'Kegelapan'): { multiplier: number; text: string; label: string } => {
    // 5-Tier Elemental Effectiveness based strictly on the uploaded Pokémon Go (GOHUB) type chart:
    // Api = Fire, Air = Water, Tanah = Ground, Petir = Electric, Cahaya = Fairy, Kegelapan = Dark

    // --- 1. Petir (Electric) ---
    if (moveType === 'Petir') {
      if (targetElement === 'Air') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
      if (targetElement === 'Tanah') return { multiplier: 0.0, text: isEng ? 'No Effect! (0%)' : ' Tidak Berefek! (0%) ', label: isEng ? 'no effect on opponent' : 'tidak berefek ke lawannya' };
      if (targetElement === 'Petir') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
    }

    // --- 2. Cahaya (Fairy) ---
    if (moveType === 'Cahaya') {
      if (targetElement === 'Kegelapan') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
      if (targetElement === 'Api') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
    }

    // --- 3. Api (Fire) ---
    if (moveType === 'Api') {
      if (targetElement === 'Api') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
      if (targetElement === 'Air') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
      if (targetElement === 'Cahaya') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
    }

    // --- 4. Kegelapan (Dark) ---
    if (moveType === 'Kegelapan') {
      if (targetElement === 'Cahaya') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
      if (targetElement === 'Kegelapan') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
    }

    // --- 5. Tanah (Ground) ---
    if (moveType === 'Tanah') {
      if (targetElement === 'Petir') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
      if (targetElement === 'Api') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
    }

    // --- 6. Air (Water) ---
    if (moveType === 'Air') {
      if (targetElement === 'Api') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
      if (targetElement === 'Tanah') return { multiplier: 2.0, text: isEng ? 'Extremely Effective! (+100%)' : ' Extremely Efektif! (+100%) ', label: isEng ? 'extremely effective' : 'extremely efektif' };
      if (targetElement === 'Air') return { multiplier: 0.5, text: isEng ? 'Not Very Effective... (-50%)' : ' Kurang Efektif... (-50%) ', label: isEng ? 'not very effective' : 'kurang efektif' };
    }

    return { multiplier: 1.0, text: 'Efektif', label: 'efektif' };
  };

  const [myUnits, setMyUnits] = useState<CombatUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([]);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [selectedMyUnitId, setSelectedMyUnitId] = useState<string | null>(null);
  const [isBattleOver, setIsBattleOver] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // New states for the Pokémon-like battle mechanics
  const [battleMode, setBattleMode] = useState<'1v1' | '2v2'>('1v1');
  const [isSelectingRoster, setIsSelectingRoster] = useState<boolean>(false);
  const [selectedRosterTemplateNames, setSelectedRosterTemplateNames] = useState<string[]>([]);
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>([]);
  const [activeEnemyIds, setActiveEnemyIds] = useState<string[]>([]);
  const [selectedMove, setSelectedMove] = useState<CombatMove | null>(null);
  const [hoveredMove, setHoveredMove] = useState<CombatMove | null>(null);
  const [currentTurnOwner, setCurrentTurnOwner] = useState<'player' | 'enemy'>('player');
  const [hasMovedThisTurn, setHasMovedThisTurn] = useState<string[]>([]); // unit IDs that have acted in the current phase

  // Streak days state for daily checkin - Fix: start at Day 1 (0 days completed)
  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('clan_checkin_streak');
    return saved !== null ? Number(saved) : 0;
  });

  const handleSimulateNewDay = () => {
    setClanCheckedIn(false);
    localStorage.setItem('clan_checked_in', 'false');
    if (streakDays >= 7) {
      setStreakDays(0);
      localStorage.setItem('clan_checkin_streak', '0');
    }
    triggerAudio('move');
    triggerReward(0, "Simulasi Hari Baru Berhasil! Anda kini dapat melakukan absensi lagi.", "info");
  };

  // Activity C - Chess War Campaigns List
  const puzzlesList = [
    {
      id: 1,
      title: 'Pertempuran Suku Nusa Tenggara (Board 1 - Easy)',
      desc: 'Tantang klan catur Nusa Tenggara dalam arena pertempuran taktis! Hancurkan pertahanan Pion & Ksatria mereka untuk memenangkan wilayah strategis.'
    },
    {
      id: 2,
      title: 'Kampanye Sayap Kalimantan (Board 2 - Medium)',
      desc: 'Menembus benteng sayap pertahanan klan Kalimantan! Kalahkan Pion Elit, Gajah, dan Benteng kokoh mereka menggunakan taktik bidak Anda.'
    },
    {
      id: 3,
      title: 'Penaklukan Suku Sumatra (Board 3 - Hard)',
      desc: 'Hadapi pasukan elit klan Sumatra dipimpin oleh Ratu Suku mereka yang sangat kuat! Atur strategi tempur terbaik untuk kemenangan mutlak.'
    },
    {
      id: 4,
      title: 'Kampanye Lembah Sulawesi (Board 4 - Medium)',
      desc: 'Hadapi taktik sayap gesit dari suku Sulawesi! Tembus formasi Pion Elit, Ksatria Lembah, dan Gajah Pelindung mereka.'
    },
    {
      id: 5,
      title: 'Puncak Jayawijaya Papua (Board 5 - Hard)',
      desc: 'Tantang klan gunung salju Papua! Pertahanan beku yang dipimpin oleh Ratu Es Papua membutuhkan ketelitian taktis tinggi.'
    },
    {
      id: 6,
      title: 'Benteng Keraton Jawa Agung (Board 6 - Insane)',
      desc: 'Uji batas kemampuan catur klan Anda melawan pasukan Keraton Agung Jawa! Boss penutup: Raja Perang Jawa legendaris dengan damage luar biasa!'
    }
  ];

  const handleStartCombat = (boardId: number) => {
    setActiveWarStage(boardId);
    setIsBattleOver(false);
    setBattleResult(null);
    setSelectedMyUnitId(null);
    setSelectedMove(null);
    setHoveredMove(null);
    setIsAutoPlaying(false);
    setIsSelectingRoster(true);
    setSelectedRosterTemplateNames([]);
    setActivePlayerIds([]);
    setActiveEnemyIds([]);
    setHasMovedThisTurn([]);
    setCurrentTurnOwner('player');
    triggerAudio('move');
  };

  const handleSelectRosterPiece = (name: string) => {
    const limit = battleMode === '1v1' ? 3 : 4;
    const isIncluded = selectedRosterTemplateNames.includes(name);
    
    if (isIncluded) {
      triggerAudio('move');
      setSelectedRosterTemplateNames(prev => prev.filter(n => n !== name));
    } else {
      if (selectedRosterTemplateNames.length >= limit) {
        triggerAudio('error');
        triggerReward(0, `Maksimal memilih ${limit} bidak untuk tanding ${battleMode}!`, 'info');
      } else {
        triggerAudio('move');
        setSelectedRosterTemplateNames(prev => [...prev, name]);
      }
    }
  };

  const handleLaunchBattle = () => {
    const limit = battleMode === '1v1' ? 3 : 4;
    if (selectedRosterTemplateNames.length !== limit) {
      triggerAudio('error');
      triggerReward(0, `Silakan pilih tepat ${limit} bidak untuk tanding ${battleMode}!`, 'info');
      return;
    }

    const initializeMovesWithPP = (moves: CombatMove[]): CombatMove[] => {
      return moves.map(m => {
        let maxPp = 12;
        if (m.category === 'defend') maxPp = 8;
        else if (m.category === 'support') maxPp = 6;
        else if (m.category === 'ultimate') maxPp = 3;
        return {
          ...m,
          maxPp,
          pp: maxPp
        };
      });
    };

    // Initialize player team from templates
    const playerTeam: CombatUnit[] = selectedRosterTemplateNames.map((name, index) => {
      const t = PLAYER_ROSTER_TEMPLATES.find(x => x.name === name)!;
      return {
        id: `p-${index}-${Date.now()}`,
        name: t.name,
        symbol: t.symbol,
        hp: t.hp,
        maxHp: t.hp,
        atk: t.atk,
        element: t.element,
        color: 'white',
        moves: initializeMovesWithPP(JSON.parse(JSON.stringify(t.moves))),
        shield: 0
      };
    });

    // Initialize enemy team based on difficulty & battleMode
    let enemyTeam: CombatUnit[] = [];
    const getEnemy = (key: string, idx: number): CombatUnit => {
      const t = ENEMY_PIECE_TEMPLATES[key];
      // Boss boost on higher boards
      const hpMultiplier = activeWarStage && activeWarStage >= 5 ? 1.4 : activeWarStage === 3 ? 1.25 : 1.0;
      const finalHp = Math.floor(t.hp * hpMultiplier);
      return {
        id: `e-${idx}-${Date.now()}`,
        name: t.name,
        symbol: t.symbol,
        hp: finalHp,
        maxHp: finalHp,
        atk: t.atk * (activeWarStage && activeWarStage >= 5 ? 1.2 : 1.0),
        element: t.element,
        color: 'black',
        moves: initializeMovesWithPP(JSON.parse(JSON.stringify(t.moves))),
        shield: 0
      };
    };

    if (battleMode === '1v1') {
      if (activeWarStage === 1) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('pion_rival', 1), getEnemy('gajah_rival', 2)];
      } else if (activeWarStage === 2) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('gajah_rival', 1), getEnemy('benteng_rival', 2)];
      } else if (activeWarStage === 3) {
        enemyTeam = [getEnemy('ksatria_rival', 0), getEnemy('gajah_rival', 1), getEnemy('ratu_rival', 2)];
      } else if (activeWarStage === 4) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('ksatria_rival', 1), getEnemy('gajah_rival', 2)];
      } else if (activeWarStage === 5) {
        enemyTeam = [getEnemy('benteng_rival', 0), getEnemy('gajah_rival', 1), getEnemy('ratu_rival', 2)];
      } else {
        enemyTeam = [getEnemy('ksatria_rival', 0), getEnemy('ratu_rival', 1), getEnemy('raja_rival', 2)];
      }
    } else {
      // 2v2 Doubles Teams
      if (activeWarStage === 1) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('pion_rival', 1), getEnemy('gajah_rival', 2), getEnemy('benteng_rival', 3)];
      } else if (activeWarStage === 2) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('gajah_rival', 1), getEnemy('benteng_rival', 2), getEnemy('ksatria_rival', 3)];
      } else if (activeWarStage === 3) {
        enemyTeam = [getEnemy('ksatria_rival', 0), getEnemy('gajah_rival', 1), getEnemy('ratu_rival', 2), getEnemy('raja_rival', 3)];
      } else if (activeWarStage === 4) {
        enemyTeam = [getEnemy('pion_rival', 0), getEnemy('ksatria_rival', 1), getEnemy('gajah_rival', 2), getEnemy('benteng_rival', 3)];
      } else if (activeWarStage === 5) {
        enemyTeam = [getEnemy('benteng_rival', 0), getEnemy('gajah_rival', 1), getEnemy('ratu_rival', 2), getEnemy('raja_rival', 3)];
      } else {
        enemyTeam = [getEnemy('ksatria_rival', 0), getEnemy('benteng_rival', 1), getEnemy('ratu_rival', 2), getEnemy('raja_rival', 3)];
      }
    }

    setMyUnits(playerTeam);
    setEnemyUnits(enemyTeam);

    // Setup active slots
    const initialPlayerActive = battleMode === '1v1' ? [playerTeam[0].id] : [playerTeam[0].id, playerTeam[1].id];
    const initialEnemyActive = battleMode === '1v1' ? [enemyTeam[0].id] : [enemyTeam[0].id, enemyTeam[1].id];

    setActivePlayerIds(initialPlayerActive);
    setActiveEnemyIds(initialEnemyActive);

    setCombatLogs([
      `️ Tanding Pokémon Suku [${battleMode}] Dimulai!`,
      ` Bidak Aktif Anda: ${playerTeam.filter(u => initialPlayerActive.includes(u.id)).map(u => `${u.name} [${u.element}]`).join(', ')}`,
      ` Bidak Aktif Musuh: ${enemyTeam.filter(u => initialEnemyActive.includes(u.id)).map(u => `${u.name} [${u.element}]`).join(', ')}`,
      `Silakan pilih bidak READY Anda lalu ketuk salah satu Moveset serangan atau support di bawah!`
    ]);

    setIsSelectingRoster(false);
    setHasMovedThisTurn([]);
    setCurrentTurnOwner('player');
    triggerAudio('move');
  };

  const handleCombatVictory = () => {
    setIsBattleOver(true);
    setBattleResult('win');
    triggerAudio('win');

    // Claim rewards
    const nextConquered = [...conqueredBoards, String(activeWarStage)];
    setConqueredBoards(nextConquered);
    localStorage.setItem('conquered_boards_list', JSON.stringify(nextConquered));

    setCoins(prev => {
      const next = prev + 300;
      localStorage.setItem('coins', String(next));
      return next;
    });

    // Add Suku contribution points
    const pointsGranted = 200; // menyumbang +200 Poin Suku
    let userFound = false;
    let updatedMembers = guildMembers.map(m => {
      const cleanMemberName = m.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      if (cleanMemberName === cleanUsername || m.name === username) {
        userFound = true;
        return { ...m, contribution: (m.contribution || 0) + pointsGranted };
      }
      return m;
    });

    if (!userFound && updatedMembers.length > 0) {
      updatedMembers = updatedMembers.map((m, idx) => {
        if (idx === 0) {
          return { ...m, contribution: (m.contribution || 0) + pointsGranted };
        }
        return m;
      });
    }

    localStorage.setItem('guild_members', JSON.stringify(updatedMembers));
    setGuildMembers(updatedMembers);

    setGuildLogs(prev => [`Perang Tanding Taktis Suku Board ${activeWarStage} dimenangkan oleh @${username}! (+300 Koin, +${pointsGranted} Poin Suku)`, ...prev]);
    triggerReward(200, `KEMENANGAN TELAK! Suku Anda menguasai Board ${activeWarStage}! Hadiah: +300 Koin dan +${pointsGranted} Poin Suku!`, 'level_up');
  };

  const handleCombatDefeat = (currentLogs: string[]) => {
    setIsBattleOver(true);
    setBattleResult('lose');
    triggerAudio('error');
    setCombatLogs([` Suku Anda terpukul mundur! Seluruh bidak pilihan Anda telah tumbang. Gunakan kepingan lain atau coba lagi!`, ...currentLogs]);
  };

  const handleSwitchBenchedUnit = (oldActiveId: string, newBenchedId: string) => {
    if (isBattleOver || currentTurnOwner === 'enemy') return;

    const benched = myUnits.find(u => u.id === newBenchedId);
    if (!benched || benched.hp <= 0) return;

    triggerAudio('move');

    // Swap ID inside activePlayerIds
    setActivePlayerIds(prev => prev.map(id => id === oldActiveId ? newBenchedId : id));
    
    // Switch action consumes turn of the slot
    setHasMovedThisTurn(prev => [...prev, newBenchedId]);

    const oldActive = myUnits.find(u => u.id === oldActiveId);
    const switchMsg = ` ${oldActive ? oldActive.name : 'Bidak'} ditarik mundur. ${benched.name} memasuki medan tempur!`;
    const nextLogs = [switchMsg, ...combatLogs];
    setCombatLogs(nextLogs);

    // Reset selection states
    setSelectedMyUnitId(null);
    setSelectedMove(null);

    // If all active players completed action, go to enemy turn
    const aliveActives = activePlayerIds.map(id => id === oldActiveId ? newBenchedId : id).map(id => myUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
    const movedIds = [...hasMovedThisTurn, newBenchedId];
    const allMoved = aliveActives.every(u => movedIds.includes(u!.id));

    if (allMoved && aliveActives.length > 0) {
      setTimeout(() => {
        handleEnemyPhaseRun(nextLogs, myUnits, enemyUnits, activePlayerIds.map(id => id === oldActiveId ? newBenchedId : id), activeEnemyIds);
      }, 700);
    }
  };

  const executePlayerAction = (attackerId: string, move: CombatMove, targetId: string) => {
    if (isBattleOver || currentTurnOwner === 'enemy') return;

    const attacker = myUnits.find(u => u.id === attackerId);
    if (!attacker || attacker.hp <= 0) return;

    // Check PP limit
    if (move.pp !== undefined && move.pp <= 0) {
      triggerAudio('error');
      triggerReward(0, `Jurus "${move.name}" telah habis batas penggunaannya (PP 0)!`, 'info');
      return;
    }

    // Decrement PP for the used move
    let updatedMyUnits = myUnits.map(u => {
      if (u.id === attackerId) {
        return {
          ...u,
          moves: u.moves.map(m => {
            if (m.name === move.name) {
              return { ...m, pp: m.pp !== undefined ? Math.max(0, m.pp - 1) : undefined };
            }
            return m;
          })
        };
      }
      return u;
    });

    let updatedEnemyUnits = [...enemyUnits];
    let nextLogs = [...combatLogs];

    triggerAudio(move.category === 'ultimate' ? 'level_up' : 'hit');

    if (move.category === 'attack' || move.category === 'ultimate') {
      const target = enemyUnits.find(u => u.id === targetId);
      if (!target || target.hp <= 0) return;

      // Base damage calculation with ATK buff scaling
      let baseDmg = Math.floor(move.power * attacker.atk);
      if (attacker.atkBuff) {
        baseDmg = Math.floor(baseDmg * attacker.atkBuff);
      }

      // Element calculation
      const elemRes = getElementMultiplier(move.type, target.element);
      const finalDmg = Math.floor(baseDmg * elemRes.multiplier);

      // Apply Shield reduction
      let finalDamageDealt = finalDmg;
      let targetShield = target.shield || 0;
      let shieldMsg = '';

      if (target.invulnerable) {
        finalDamageDealt = 0;
        shieldMsg = ` (Kebal Mutlak!)`;
      } else if (targetShield > 0) {
        if (targetShield >= finalDmg) {
          targetShield -= finalDmg;
          finalDamageDealt = 0;
          shieldMsg = ` (Terabsorbsi penuh oleh Shield!)`;
        } else {
          finalDamageDealt -= targetShield;
          targetShield = 0;
          shieldMsg = ` (Shield Hancur! sisa ${finalDamageDealt} DMG)`;
        }
      }

      // Update target HP and Shield
      const nextHp = Math.max(0, target.hp - finalDamageDealt);
      updatedEnemyUnits = updatedEnemyUnits.map(u => {
        if (u.id === targetId) {
          return { ...u, hp: nextHp, shield: targetShield };
        }
        return u;
      });

      // Special life-steal effect for Raja (Hisapan Jiwa)
      if (move.name === 'Hisapan Jiwa' && finalDamageDealt > 0) {
        const healAmt = Math.floor(finalDamageDealt * 0.5);
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === attackerId) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + healAmt) };
          }
          return u;
        });
        nextLogs = [`️ [${attacker.name}] menyerap +${healAmt} HP dari lawan!`, ...nextLogs];
      }

      // Special double heal for Holy Storm Rain
      if (move.name === 'Holy Storm Rain') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (activePlayerIds.includes(u.id) && u.hp > 0) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + 20) };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] memulihkan +20 HP seluruh kawan aktif!`, ...nextLogs];
      }

      let logMsg = `️ [${attacker.name}] menggunakan [${move.name}] (${move.type}) -> [${target.name}]! ${elemRes.text} -${finalDamageDealt} HP!${shieldMsg}`;
      if (nextHp === 0) {
        logMsg += `  [${target.name}] gugur!`;
      }
      nextLogs = [logMsg, ...nextLogs];

    } else if (move.category === 'support' || move.category === 'defend') {
      // Support targeting a friendly active unit
      const target = updatedMyUnits.find(u => u.id === targetId);
      if (!target || target.hp <= 0) return;

      if (move.name === 'Air Berkat') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + 45) };
          }
          return u;
        });
        nextLogs = [`️ [${attacker.name}] menggunakan [Air Berkat] menyembuhkan [${target.name}] sebesar +45 HP!`, ...nextLogs];
      } else if (move.name === 'Aura Kesembuhan') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + 40), atkBuff: 1.15 };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] memberi [Aura Kesembuhan] ke [${target.name}]: +40 HP & meningkatkan ATK +15%!`, ...nextLogs];
      } else if (move.name === 'Semangat Juang') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, atkBuff: 1.25 };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] menyulut [Semangat Juang]: ATK kawan [${target.name}] meningkat +25%!`, ...nextLogs];
      } else if (move.name === 'Pion Barrier') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + 25), shield: (u.shield || 0) + 25 };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] memasang [Pion Barrier]: +25 HP & +25 Shield ke [${target.name}]!`, ...nextLogs];
      } else if (move.name === 'Fortress Shell') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, shield: (u.shield || 0) + 50 };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] merilis [Fortress Shell]: memberi +50 Shield pelindung ke [${target.name}]!`, ...nextLogs];
      } else if (move.name === 'Dekret Mutlak') {
        updatedMyUnits = updatedMyUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, invulnerable: true };
          }
          return u;
        });
        nextLogs = [` [${attacker.name}] menetapkan [Dekret Mutlak]: [${target.name}] kebal mutlak terhadap serangan selama 1 putaran!`, ...nextLogs];
      }
    }

    // Set updated state
    setMyUnits(updatedMyUnits);
    setEnemyUnits(updatedEnemyUnits);
    setCombatLogs(nextLogs);

    // Register active as moved
    const newMoved = [...hasMovedThisTurn, attackerId];
    setHasMovedThisTurn(newMoved);

    // Clear UI selections
    setSelectedMyUnitId(null);
    setSelectedMove(null);

    // Auto switch enemy active slots if fainted
    let finalEnemyActive = [...activeEnemyIds];
    let enemyNeedsBackup = false;

    finalEnemyActive.forEach((id, index) => {
      const u = updatedEnemyUnits.find(x => x.id === id);
      if (!u || u.hp <= 0) {
        // Find first alive benched enemy
        const benched = updatedEnemyUnits.find(x => x.hp > 0 && !finalEnemyActive.includes(x.id));
        if (benched) {
          finalEnemyActive[index] = benched.id;
          nextLogs = [` Bidak Rival tumbang! ${benched.name} dikerahkan masuk arena!`, ...nextLogs];
          enemyNeedsBackup = true;
        }
      }
    });

    if (enemyNeedsBackup) {
      setActiveEnemyIds(finalEnemyActive);
      setCombatLogs(nextLogs);
    }

    // Check if enemies are all dead
    const aliveEnemies = updatedEnemyUnits.filter(u => u.hp > 0);
    if (aliveEnemies.length === 0) {
      setTimeout(() => {
        handleCombatVictory();
      }, 500);
      return;
    }

    // If player has dead active units, they can swap during turn, but let's check if they need backup right now
    let finalPlayerActive = [...activePlayerIds];
    let playerNeedsBackup = false;

    finalPlayerActive.forEach((id, index) => {
      const u = updatedMyUnits.find(x => x.id === id);
      if (!u || u.hp <= 0) {
        // Find first alive benched player
        const benched = updatedMyUnits.find(x => x.hp > 0 && !finalPlayerActive.includes(x.id));
        if (benched) {
          finalPlayerActive[index] = benched.id;
          nextLogs = [` Bidak Anda tumbang! ${benched.name} melangkah masuk arena!`, ...nextLogs];
          playerNeedsBackup = true;
        }
      }
    });

    if (playerNeedsBackup) {
      setActivePlayerIds(finalPlayerActive);
      setCombatLogs(nextLogs);
    }

    // Check if player team is fully wiped
    const alivePlayersNow = updatedMyUnits.filter(u => u.hp > 0);
    if (alivePlayersNow.length === 0) {
      handleCombatDefeat(nextLogs);
      return;
    }

    // Determine if player phase is complete: all alive active player units have taken action
    const aliveActives = finalPlayerActive.map(id => updatedMyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
    const allMoved = aliveActives.every(u => newMoved.includes(u!.id));

    if (allMoved && aliveActives.length > 0) {
      setTimeout(() => {
        handleEnemyPhaseRun(nextLogs, updatedMyUnits, updatedEnemyUnits, finalPlayerActive, finalEnemyActive);
      }, 700);
    }
  };

  const handleEnemyPhaseRun = (
    currentLogs: string[], 
    currentMyUnits: CombatUnit[], 
    currentEnemyUnits: CombatUnit[],
    finalPlayerActive: string[],
    finalEnemyActive: string[]
  ) => {
    setCurrentTurnOwner('enemy');
    let workingLogs = [...currentLogs];
    let workingMyUnits = [...currentMyUnits];
    let workingEnemyUnits = [...currentEnemyUnits];

    // Find alive enemy active units
    const aliveEnemyActives = finalEnemyActive.map(id => workingEnemyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
    const alivePlayerActives = finalPlayerActive.map(id => workingMyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);

    if (aliveEnemyActives.length === 0 || alivePlayerActives.length === 0) {
      // Return turn to player immediately
      setCurrentTurnOwner('player');
      setHasMovedThisTurn([]);
      return;
    }

    // Execute actions sequentially for each enemy active
    let i = 0;
    const executeNextEnemyAction = () => {
      if (i >= aliveEnemyActives.length) {
        // Complete Enemy Turn Phase: Return to Player
        // Decrement buffs/invulnerability and shields for players
        workingMyUnits = workingMyUnits.map(u => {
          return {
            ...u,
            invulnerable: false, // wears off after 1 turn
            atkBuff: u.atkBuff && u.atkBuff > 1.0 ? parseFloat((u.atkBuff - 0.05).toFixed(2)) : undefined
          };
        });
        setMyUnits(workingMyUnits);
        setHasMovedThisTurn([]);
        setCurrentTurnOwner('player');
        workingLogs = [isEng ? "Your clan's turn! Select one of your active pieces marked as READY." : "Giliran klan Anda! Pilih salah satu kepingan aktif Anda yang bertanda READY.", ...workingLogs];
        setCombatLogs(workingLogs);
        return;
      }

      const enemy = aliveEnemyActives[i];
      // Pick random move with available PP
      const availableEnemyMoves = enemy.moves.filter(m => m.pp === undefined || m.pp > 0);
      const move = availableEnemyMoves.length > 0 
        ? availableEnemyMoves[Math.floor(Math.random() * availableEnemyMoves.length)]
        : enemy.moves[0]; // fallback

      // Decrement PP for this enemy's chosen move
      workingEnemyUnits = workingEnemyUnits.map(u => {
        if (u.id === enemy.id) {
          return {
            ...u,
            moves: u.moves.map(m => {
              if (m.name === move.name) {
                return { ...m, pp: m.pp !== undefined ? Math.max(0, m.pp - 1) : undefined };
              }
              return m;
            })
          };
        }
        return u;
      });

      triggerAudio('hit');

      if (move.category === 'attack' || move.category === 'ultimate') {
        // Target random player active unit
        const alivePlayers = finalPlayerActive.map(id => workingMyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
        if (alivePlayers.length > 0) {
          const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          
          let baseDmg = Math.floor(move.power * enemy.atk);
          const elemRes = getElementMultiplier(move.type, target.element);
          let finalDmg = Math.floor(baseDmg * elemRes.multiplier);

          let finalDamageDealt = finalDmg;
          let targetShield = target.shield || 0;
          let shieldMsg = '';

          if (target.invulnerable) {
            finalDamageDealt = 0;
            shieldMsg = ` (Terhalang oleh Dekret Kebal!)`;
          } else if (targetShield > 0) {
            if (targetShield >= finalDmg) {
              targetShield -= finalDmg;
              finalDamageDealt = 0;
              shieldMsg = ` (Shield kawan menyerap DMG!)`;
            } else {
              finalDamageDealt -= targetShield;
              targetShield = 0;
              shieldMsg = ` (Shield kawan pecah! sisa ${finalDamageDealt} DMG)`;
            }
          }

          const nextHp = Math.max(0, target.hp - finalDamageDealt);
          workingMyUnits = workingMyUnits.map(u => {
            if (u.id === target.id) {
              return { ...u, hp: nextHp, shield: targetShield };
            }
            return u;
          });

          let logMsg = ` [${enemy.name}] menggunakan [${move.name}] (${move.type}) -> [${target.name}] kawan! ${elemRes.text} -${finalDamageDealt} HP!${shieldMsg}`;
          if (nextHp === 0) {
            logMsg += `  [${target.name}] gugur!`;
          }
          workingLogs = [logMsg, ...workingLogs];
        }

      } else if (move.category === 'support' || move.category === 'defend') {
        // Target self or teammate
        const teammates = finalEnemyActive.map(id => workingEnemyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
        if (teammates.length > 0) {
          const target = teammates[Math.floor(Math.random() * teammates.length)];
          if (move.name === 'Air Berkat') {
            workingEnemyUnits = workingEnemyUnits.map(u => {
              if (u.id === target.id) return { ...u, hp: Math.min(u.maxHp, u.hp + 35) };
              return u;
            });
            workingLogs = [`️ [${enemy.name}] menyembuhkan kawan [${target.name}] +35 HP!`, ...workingLogs];
          } else if (move.name === 'Fortress Shell') {
            workingEnemyUnits = workingEnemyUnits.map(u => {
              if (u.id === target.id) return { ...u, shield: (u.shield || 0) + 40 };
              return u;
            });
            workingLogs = [` [${enemy.name}] melindungi kawan [${target.name}] dengan +40 Shield!`, ...workingLogs];
          }
        }
      }

      setMyUnits(workingMyUnits);
      setEnemyUnits(workingEnemyUnits);
      setCombatLogs(workingLogs);

      // Auto backup if active player fainted
      let finalPlayerBackup = [...finalPlayerActive];
      let playerNeedsBackup = false;

      finalPlayerBackup.forEach((id, idx) => {
        const u = workingMyUnits.find(x => x.id === id);
        if (!u || u.hp <= 0) {
          const benched = workingMyUnits.find(x => x.hp > 0 && !finalPlayerBackup.includes(x.id));
          if (benched) {
            finalPlayerBackup[idx] = benched.id;
            workingLogs = [` Bidak Anda gugur! ${benched.name} memasuki medan perang!`, ...workingLogs];
            playerNeedsBackup = true;
          }
        }
      });

      if (playerNeedsBackup) {
        setActivePlayerIds(finalPlayerBackup);
        setCombatLogs(workingLogs);
      }

      // Check if player team is wiped
      const alivePlayers = workingMyUnits.filter(u => u.hp > 0);
      if (alivePlayers.length === 0) {
        handleCombatDefeat(workingLogs);
        return;
      }

      i++;
      setTimeout(executeNextEnemyAction, 900);
    };

    executeNextEnemyAction();
  };

  const handleAutoClash = () => {
    if (isBattleOver || isAutoPlaying || currentTurnOwner === 'enemy') return;
    setIsAutoPlaying(true);

    const runAutoTurn = () => {
      if (isBattleOver || currentTurnOwner === 'enemy') {
        setIsAutoPlaying(false);
        return;
      }

      // Find players who haven't moved yet
      const aliveActives = activePlayerIds.map(id => myUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
      const readyUnits = aliveActives.filter(u => !hasMovedThisTurn.includes(u!.id));

      if (readyUnits.length === 0) {
        setIsAutoPlaying(false);
        return;
      }

      // Pick first ready unit
      const attacker = readyUnits[0]!;
      // Pick random move
      const move = attacker.moves[Math.floor(Math.random() * attacker.moves.length)];

      if (move.category === 'attack' || move.category === 'ultimate') {
        // Pick random alive enemy active target
        const aliveEnemies = activeEnemyIds.map(id => enemyUnits.find(u => u.id === id)).filter(Boolean).filter(u => u!.hp > 0);
        if (aliveEnemies.length > 0) {
          const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]!;
          executePlayerAction(attacker.id, move, target.id);
        } else {
          // No targets
          setHasMovedThisTurn(prev => [...prev, attacker.id]);
        }
      } else {
        // Support move targets random alive friendly active
        executePlayerAction(attacker.id, move, attacker.id);
      }

      // Chain next action after short delay if still playing
      setTimeout(() => {
        if (!isBattleOver && isAutoPlaying) {
          runAutoTurn();
        } else {
          setIsAutoPlaying(false);
        }
      }, 1000);
    };

    runAutoTurn();
  };

  const handleClaimMilestone = (tier: number, requirement: number, label: string) => {
    if (totalClanContribution < requirement) {
      triggerAudio('error');
      triggerReward(0, `Kontribusi Suku belum mencukupi! Butuh ${requirement} Poin untuk mengklaim chest ini.`, 'info');
      return;
    }
    if (claimedWeeklyMilestones.includes(tier)) {
      triggerAudio('error');
      triggerReward(0, 'Anda sudah mengklaim hadiah dari Milestone Chest ini!', 'info');
      return;
    }

    let finalCoins = 150;
    let finalDiamonds = 0;

    if (tier === 1) {
      finalCoins = Math.floor(Math.random() * (220 - 120 + 1)) + 120;
      finalDiamonds = Math.random() < 0.3 ? 1 : 0;
    } else if (tier === 2) {
      finalCoins = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
      finalDiamonds = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
    } else if (tier === 3) {
      finalCoins = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;
      finalDiamonds = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
    }

    triggerAudio('move');
    setOpeningChest({
      tier,
      requirement,
      label,
      coins: finalCoins, // base container, we will show final
      diamonds: finalDiamonds,
      isShaking: false,
      isOpened: false,
      finalCoins,
      finalDiamonds
    });
  };

  const executeOpenChest = () => {
    if (!openingChest || openingChest.isOpened) return;

    // Start shaking animation
    setOpeningChest(prev => prev ? { ...prev, isShaking: true } : null);
    triggerAudio('move');

    setTimeout(() => {
      if (!openingChest) return;

      const finalCoins = openingChest.finalCoins;
      const finalDiamonds = openingChest.finalDiamonds;
      const tier = openingChest.tier;
      const label = openingChest.label;

      // Apply rewards!
      setCoins(c => {
        const next = c + finalCoins;
        localStorage.setItem('coins', String(next));
        return next;
      });

      if (finalDiamonds > 0) {
        setDiamonds(d => {
          const next = d + finalDiamonds;
          localStorage.setItem('diamonds', String(next));
          return next;
        });
      }

      const nextMilestones = [...claimedWeeklyMilestones, tier];
      setClaimedWeeklyMilestones(nextMilestones);
      localStorage.setItem('clan_weekly_milestones', JSON.stringify(nextMilestones));

      let rewardDesc = `+${finalCoins} Koin`;
      if (finalDiamonds > 0) rewardDesc += `, +${finalDiamonds} Diamond`;

      setGuildLogs(logs => [
        `${username} membuka ${label} dan memperoleh: ${rewardDesc}!`,
        ...logs
      ]);

      triggerAudio('level_up');
      triggerReward(100, `SELAMAT! Anda mendapatkan: ${rewardDesc}!`, 'level_up');

      setOpeningChest(prev => prev ? {
        ...prev,
        isShaking: false,
        isOpened: true
      } : null);
    }, 1000);
  };

  const handleAbsensiCheckIn = () => {
    if (clanCheckedIn) return;

    let nextStreak = streakDays + 1;
    if (nextStreak > 7) {
      nextStreak = 1;
    }
    setStreakDays(nextStreak);
    localStorage.setItem('clan_checkin_streak', String(nextStreak));

    const rewardsMap: Record<number, { coins: number; diamonds: number; points: number }> = {
      1: { coins: 120, diamonds: 0, points: 50 },
      2: { coins: 150, diamonds: 0, points: 70 },
      3: { coins: 185, diamonds: 0, points: 90 },
      4: { coins: 200, diamonds: 0, points: 100 },
      5: { coins: 250, diamonds: 0, points: 120 },
      6: { coins: 300, diamonds: 0, points: 140 },
      7: { coins: 500, diamonds: 10, points: 200 }
    };

    const currentReward = rewardsMap[nextStreak] || { coins: 120, diamonds: 0, points: 50 };

    setCoins(prev => {
      const next = prev + currentReward.coins;
      localStorage.setItem('coins', String(next));
      return next;
    });

    if (currentReward.diamonds > 0) {
      setDiamonds(prev => {
        const next = prev + currentReward.diamonds;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
    }

    setClanCheckedIn(true);
    localStorage.setItem('clan_checked_in', 'true');

    // Update active user's contribution points
    let userFound = false;
    let updatedMembers = guildMembers.map(m => {
      const cleanMemberName = m.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      if (cleanMemberName === cleanUsername || m.name === username) {
        userFound = true;
        return { ...m, contribution: (m.contribution || 0) + currentReward.points };
      }
      return m;
    });

    if (!userFound && updatedMembers.length > 0) {
      updatedMembers = updatedMembers.map((m, idx) => {
        if (idx === 0) {
          return { ...m, contribution: (m.contribution || 0) + currentReward.points };
        }
        return m;
      });
    }

    localStorage.setItem('guild_members', JSON.stringify(updatedMembers));
    setGuildMembers(updatedMembers);

    setGuildLogs(prev => [`${username} melakukan absensi harian klan catur dan memperoleh +${currentReward.points} Poin Kontribusi suku.`, ...prev]);
    triggerAudio('win');

    let rewardMsg = `Absensi Suku Berhasil! Anda mendapatkan +${currentReward.coins} Koin`;
    if (currentReward.diamonds > 0) {
      rewardMsg += ` dan +${currentReward.diamonds} Berlian`;
    }
    rewardMsg += ` serta +${currentReward.points} Poin Kontribusi Suku!`;

    triggerReward(120, rewardMsg, 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {activityDetail === 'list' ? (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-stone-900 border border-stone-850 rounded-2xl">
            <span className="text-[10px] text-[#81b64c] font-black uppercase tracking-wider block">サークル活動 / Circle Activities</span>
            <h4 className="text-xs font-black text-white uppercase mt-0.5">Daftar Aktivitas Bersama Suku</h4>
            <p className="text-[10px] text-slate-450 mt-1 leading-normal font-medium">Bekerjasamalah dengan sesama pecatur dalam klan untuk mengumpulkan target bonus atau memenangkan perang tanding taktis!</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Card 2: Check-in / Absen & Bonus */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-yellow-500/15 text-yellow-500 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Bonus & Absen</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Papan Absensi & Bonus Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Klaim absensi harian dan chest milestone mingguan suku klan Anda.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('bonus'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Klaim
              </button>
            </div>

            {/* Card 3: Perang Tanding Suku */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Perang PvP</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Perang Tanding Taktis Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5 font-sans">Selesaikan tantangan papan taktis untuk merebut kejayaan wilayah suku.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('war'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Perang
              </button>
            </div>

            {/* Card 4: Obrolan Tim */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Room Obrolan</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Ruang Forum Chat Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Diskusi taktik, janjian tanding, dan bincang-bincang seru klan catur.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('chat'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-purple-650 hover:bg-purple-500 text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => { setActivityDetail('list'); triggerAudio('move'); }}
            className="flex items-center gap-1 px-3.5 py-2 bg-stone-900 border border-stone-800 hover:bg-[#81b64c] hover:text-white rounded-xl text-[10px] font-black uppercase text-slate-400 cursor-pointer mb-2 transition-all w-fit"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Aktivitas Suku
          </button>

          {/* VIEW: FRAGMENTS REMOVED */}
          {false && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-900 border border-stone-850 rounded-2xl">
                <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-wider block">Permohonan Kepingan Fragment Catur</span>
                <h4 className="text-xs font-black text-white uppercase mt-0.5">Donasi & Tukar Kepingan Skin</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">Kumpulkan 5 kepingan fragment catur yang disumbangkan oleh teman satu klan untuk merakit skin catur eksklusif Anda secara permanen!</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Request form or details */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-stone-850 pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" /> Permintaan Fragment Anda
                  </h4>

                  {hasActiveFragmentReq ? (
                    <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850 text-center space-y-3">
                      <div>
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Status Aktif</span>
                        <h5 className="text-white font-extrabold text-xs uppercase mt-0.5">Target: Fragment keping {requestedFragmentSkin}</h5>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>Donasi Terkumpul:</span>
                          <span className="text-[#81b64c]">{todayFragmentDonationCount} / 5 Keping</span>
                        </div>
                        <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800">
                          <div 
                            style={{ width: `${(todayFragmentDonationCount / 5) * 100}%` }} 
                            className="bg-indigo-500 h-full transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <button 
                          onClick={() => {
                            if (todayFragmentDonationCount >= 5) {
                              const finalSkinKey = requestedFragmentSkin === 'Golden' ? 'royal' : (requestedFragmentSkin === 'Retro' ? 'retro' : (requestedFragmentSkin === 'Cosmosis' ? 'cosmic' : 'neon'));
                              setUnlockedSkins(prev => prev.includes(finalSkinKey) ? prev : [...prev, finalSkinKey]);
                              setHasActiveFragmentReq(false);
                              setRequestedFragmentSkin('');
                              setTodayFragmentDonationCount(0);
                              setGuildLogs(prev => [`Pimpinan merakit skin kustom resmi dari fragment klan.`, ...prev]);
                              triggerAudio('level_up');
                              triggerReward(150, `LUAR BIASA! Anda berhasil merakit Skin Catur Kustom ${requestedFragmentSkin.toUpperCase()}!`, 'level_up');
                            } else {
                              if (fragmentRequestCooldown > 0) {
                                triggerAudio('error');
                                triggerReward(0, `Mohon tunggu ${fragmentRequestCooldown} detik cooldown.`, 'info');
                                return;
                              }
                              setFragmentRequestCooldown(12);
                              const nextCount = Math.min(5, todayFragmentDonationCount + 1);
                              setTodayFragmentDonationCount(nextCount);
                              setGuildLogs(prev => [`Teman klub mendonasikan fragment catur ke Anda.`, ...prev]);
                              setGuildChatMessages(prev => [
                                ...prev,
                                { sender: 'Naufal_Catur', text: `Ini kepingan fragment @${username}, semoga cepat terkumpul skin idamanmu ya.`, time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' }) }
                              ]);
                              triggerAudio('win');
                              triggerReward(0, 'Sobat klan Naufal_Catur mendonasikan +1 Fragment ke Anda!', 'success_no_xp');
                            }
                          }}
                          className="w-full py-2 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg transition shadow cursor-pointer border-none"
                        >
                          {todayFragmentDonationCount >= 5 ? 'RAKIT SKIN GRATIS SEKARANG!' : fragmentRequestCooldown > 0 ? `TUNTUT ULANG (${fragmentRequestCooldown}s)` : 'MINTA KEPINGAN DONASI'}
                        </button>

                        <button 
                          onClick={() => {
                            setHasActiveFragmentReq(false);
                            setRequestedFragmentSkin('');
                            setTodayFragmentDonationCount(0);
                            triggerAudio('move');
                          }}
                          className="w-full py-1 text-[8.5px] font-black uppercase text-slate-450 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition"
                        >
                          Batalkan Permintaan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-500 block uppercase">PILIH SKIN YANG INGIN DIKUMPULKAN:</span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: 'Neon Grid (Epic)', target: 'Neon' },
                          { key: 'Golden Knight (Legendary)', target: 'Golden' },
                          { key: 'Retro Pixel (Rare Edition)', target: 'Retro' },
                          { key: 'Cosmosis Stars (Mythic)', target: 'Cosmosis' }
                        ].map((sk) => (
                          <button 
                            key={sk.key}
                            onClick={() => {
                              setRequestedFragmentSkin(sk.target);
                              setHasActiveFragmentReq(true);
                              setTodayFragmentDonationCount(0);
                              setGuildLogs(prev => [`Pimpinan meminta donasi pecahan fragment ${sk.target}.`, ...prev]);
                              triggerAudio('move');
                              triggerReward(15, `Meminta bantuan fragment ${sk.target}!`, 'success');
                            }}
                            className="w-full p-2.5 bg-stone-900 hover:bg-[#81b64c]/15 text-slate-300 hover:text-white text-left text-[10.5px] font-bold uppercase rounded-xl transition cursor-pointer border border-stone-850 flex justify-between items-center"
                          >
                            <span>{sk.key}</span>
                            <span className="text-[9px] bg-stone-800 px-2 py-0.5 rounded text-[#81b64c] font-black uppercase">+ Minta</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory & Purchase */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider flex items-center justify-between border-b border-stone-850 pb-2">
                    <span>Inventori Suku Fragment Anda</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-mono font-black text-slate-400">
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Gold Knight:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Golden Knight'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Retro Pixel:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Retro 8-bit'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Neon Epic:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Neon Skin'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Cosmosis:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Cosmosis Nebula'] || 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (coins < 250) {
                        triggerAudio('error');
                        triggerReward(0, 'Koin Anda tidak cukup untuk membeli Kotak Fragment! Butuh 250 Koin.', 'info');
                        return;
                      }
                      setCoins(c => c - 250);
                      const frags = ['Golden Knight', 'Retro 8-bit', 'Neon Skin', 'Cosmosis Nebula'];
                      const choice = frags[Math.floor(Math.random() * frags.length)];
                      setMyFragments(prev => {
                        const next = { ...prev, [choice]: (prev[choice] || 0) + 1 };
                        localStorage.setItem('my_fragment_inventory', JSON.stringify(next));
                        return next;
                      });
                      triggerAudio('win');
                      triggerReward(0, `Sukses beli Kotak Fragment Klan! Menemukan +1 Fragment ${choice.toUpperCase()}!`, 'success_no_xp');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase rounded-xl transition text-center cursor-pointer border-none"
                  >
                    Beli Kotak Fragment (+1 Frag) — 250 Coins
                  </button>
                </div>

                {/* Help other members requests list */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex gap-1.5 border-b border-stone-850 pb-2">
                    <span>Membantu Kebantuan Fragment Teman Suku</span>
                  </h4>

                  <div className="space-y-3">
                    {fragmentRequests
                      .filter(req => guildMembers.some(member => member.name === req.name))
                      .map((item) => {
                        const progressPercent = Math.min(100, (item.currentProgress / item.maxProgress) * 100);
                        return (
                          <div key={item.id} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-white">{item.name}</span>
                              <span className="text-[10px] text-green-500 font-black">{item.currentProgress} / {item.maxProgress}</span>
                            </div>
                            <span className="text-[10.5px] text-indigo-400 font-black uppercase">
                              MEMINTA: FRAGMENT {item.skin.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                              Hadiah koin atas bantuan: <span className="text-yellow-500">+{item.coinsVal} Koin</span>
                            </span>

                            <button 
                              onClick={() => {
                                const hasItem = (myFragments[item.skin] || 0) > 0;
                                if (!hasItem) {
                                  triggerAudio('error');
                                  triggerReward(0, `Donasi Gagal! Anda tidak memiliki Kepingan Fragment "${item.skin.toUpperCase()}"`, 'error');
                                  return;
                                }

                                setMyFragments(prev => {
                                  const next = { ...prev, [item.skin]: prev[item.skin] - 1 };
                                  localStorage.setItem('my_fragment_inventory', JSON.stringify(next));
                                  return next;
                                });

                                setCoins(c => {
                                  const next = c + item.coinsVal;
                                  localStorage.setItem('coins', String(next));
                                  return next;
                                });

                                setFragmentRequests(prev => {
                                  const updated = prev.map(r => {
                                    if (r.id === item.id) {
                                      return { ...r, currentProgress: Math.min(r.maxProgress, r.currentProgress + 1) };
                                    }
                                    return r;
                                  });
                                  localStorage.setItem('active_fragment_requests', JSON.stringify(updated));
                                  return updated;
                                });

                                setGuildLogs(prev => [`${username} mendonasikan 1 fragment kepingan ke ${item.name}.`, ...prev]);
                                triggerAudio('win');
                                triggerReward(item.coinsVal, `Donasi sukses! Anda membantu ${item.name} dan memenangkan +${item.coinsVal} Coins!`, 'success');
                              }}
                              className="w-full py-1.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg transition cursor-pointer border-none mt-1"
                            >
                              Donasikan 1 Keping
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: BONUS & ABSENSI */}
            {activityDetail === 'bonus' && (
            <div className="space-y-6">
              {/* Absensi Checkin */}
              <div className="bg-[#262421] p-6 rounded-3xl border border-stone-800 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#81b64c]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="text-center space-y-1">
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none inline-block mb-1">
                    Buku Absen Harian Suku
                  </span>
                  <h4 className="text-base font-black text-white uppercase">Papan Presensi Stamp Suku Catur</h4>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-normal">
                    Lakukan absen stamp harian untuk mendapatkan tunjangan koin, diamond klan, serta poin reputasi klan mingguan Anda!
                  </p>
                </div>
 
                {/* 7-DAY STREAK CALENDAR GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-1">
                  {[
                    { day: 1, label: 'Hari 1', reward: '+120 Koin', points: '+50 Poin Suku', coins: 120, diamonds: 0 },
                    { day: 2, label: 'Hari 2', reward: '+150 Koin', points: '+70 Poin Suku', coins: 150, diamonds: 0 },
                    { day: 3, label: 'Hari 3', reward: '+185 Koin', points: '+90 Poin Suku', coins: 185, diamonds: 0 },
                    { day: 4, label: 'Hari 4', reward: '+200 Koin', points: '+100 Poin Suku', coins: 200, diamonds: 0 },
                    { day: 5, label: 'Hari 5', reward: '+250 Koin', points: '+120 Poin Suku', coins: 250, diamonds: 0 },
                    { day: 6, label: 'Hari 6', reward: '+300 Koin', points: '+140 Poin Suku', coins: 300, diamonds: 0 },
                    { day: 7, label: 'Hari 7', reward: '+500 K +10 Dia', points: '+200 Poin Suku', coins: 500, diamonds: 10, isChest: true }
                  ].map((d) => {
                    const activeDay = clanCheckedIn ? streakDays : (streakDays >= 7 ? 7 : streakDays + 1);
                    const isPassedAndClaimed = d.day < activeDay || (d.day === activeDay && clanCheckedIn);
                    const isCurrentlyActiveToday = d.day === activeDay && !clanCheckedIn;
                    const isCheckedInToday = d.day === activeDay && clanCheckedIn;
 
                    return (
                      <div 
                        key={d.day} 
                        className={`p-3 rounded-2xl flex flex-col items-center justify-between transition-all border text-center relative min-h-[110px] ${
                          isCheckedInToday || isPassedAndClaimed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 font-bold'
                            : isCurrentlyActiveToday
                              ? 'bg-yellow-950/20 border-yellow-500 animate-pulse-slow text-yellow-400 font-extrabold shadow-lg shadow-yellow-950/35'
                              : 'bg-[#1c1a19] border-stone-850 text-slate-500 font-medium'
                        }`}
                      >
                        <span className="text-[9px] font-black tracking-wider uppercase mb-1">{d.label}</span>
                        
                        <div className="my-2 flex items-center justify-center">
                          {isCheckedInToday || isPassedAndClaimed ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-inner">
                              <Check className="w-4 h-4 text-emerald-400 font-black" />
                            </div>
                          ) : d.isChest ? (
                            <Trophy className={`w-6 h-6 ${isCurrentlyActiveToday ? 'text-yellow-400 animate-bounce' : 'text-stone-600'}`} />
                          ) : (
                            <Award className={`w-6 h-6 ${isCurrentlyActiveToday ? 'text-yellow-400' : 'text-stone-600'}`} />
                          )}
                        </div>
 
                        <div className="space-y-0.5">
                          <span className={`text-[9px] font-black block leading-tight ${isCheckedInToday || isPassedAndClaimed ? 'text-emerald-400' : isCurrentlyActiveToday ? 'text-yellow-400' : 'text-slate-350'}`}>{d.reward}</span>
                          <span className="text-[7.5px] font-bold text-slate-500 block uppercase font-mono">{d.points}</span>
                        </div>
 
                        {/* Visual indicator ribbon */}
                        {isCurrentlyActiveToday && (
                          <span className="absolute -top-1.5 -right-1 text-[7px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                            Hari Ini
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
 
                <div className="pt-2 w-full flex flex-col sm:flex-row gap-2">
                  {clanCheckedIn ? (
                    <div className="flex-1 py-3 bg-emerald-950/15 text-emerald-400 rounded-xl font-black text-xs uppercase border border-emerald-900/30 text-center tracking-wide flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Absensi Selesai! Hari ke-{streakDays} Berhasil Ditandai & Klaim!
                    </div>
                  ) : (
                    <button 
                      onClick={handleAbsensiCheckIn}
                      className="flex-1 py-3 bg-[#81b64c] hover:bg-green-500 hover:scale-[1.005] active:scale-[0.995] text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer border-none shadow-md shadow-emerald-950/45 flex items-center justify-center gap-2 tracking-wide"
                    >
                      <Check className="w-4 h-4 text-white" /> KLAIM & STEMPEL ABSEN SEKARANG (HADIAH HARI KE-{streakDays >= 7 ? 1 : streakDays + 1})
                    </button>
                  )}
                  
                  <button
                    onClick={handleSimulateNewDay}
                    className="py-3 px-4 bg-stone-900 hover:bg-stone-850 text-slate-450 border border-stone-800 text-[9px] font-black uppercase rounded-xl transition cursor-pointer"
                    title="Simulasikan hari berikutnya untuk mengklaim absen baru"
                  >
                    Simulasikan Hari Baru ➔
                  </button>
                </div>
              </div>
 
              {/* Weekly Chest targets milestones */}
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Chest Target Milestones Suku</span>
                    <span className="text-[10.5px] font-mono font-black text-yellow-500 bg-stone-900 border border-stone-850 px-2 py-0.5 rounded">
                      {totalClanContribution} Poin Suku
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Target kontribusi mingguan seluruh anggota suku gabungan. Kunci dan menangkan chest hadiah emas!
                  </p>
                </div>
 
                {/* Panduan Perolehan Poin Suku (Clear Explanation) */}
                <div className="bg-[#1c1a19] p-3.5 rounded-xl border border-stone-850/60 space-y-2">
                  <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-wider block"> Cara Memperoleh Poin Milestone Suku:</span>
                  <ul className="text-[10px] text-slate-400 space-y-2 list-none pl-0">
                    <li className="flex items-start gap-2">
                      <span className="text-[#81b64c] font-black">✓</span>
                      <span><strong>Absensi Harian Suku</strong>: Mengklaim stamp harian memberikan <strong>+50 s/d +200 Poin Suku</strong> (semakin panjang streak Anda, semakin melimpah koin & poin!).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#81b64c] font-black">✓</span>
                      <span><strong>Perang Tanding Taktis Suku</strong>: Menang di medan tempur taktis suku menyumbang kontribusi instan sebesar <strong>+200 Poin Suku</strong> per kemenangan!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#81b64c] font-black">✓</span>
                      <span><strong>Keanggotaan Suku Aktif</strong>: Undang teman klub baru dan berpartisipasi dalam obrolan tim harian untuk menjaga sinergi poin klan tetap maksimal.</span>
                    </li>
                  </ul>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800">
                    <div 
                      style={{ width: `${Math.min(100, (totalClanContribution / 2000) * 100)}%` }} 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all" 
                    />
                  </div>
                </div>
 
                <div className="grid grid-cols-1 gap-3.5 pt-1">
                  {[
                    { tier: 1, requirement: 500, label: 'Milestone Bronze Chest', rangeDesc: isEng ? '120-220 Coins | Gacha Chance' : '120-220 Koin | Peluang ' },
                    { tier: 2, requirement: 1200, label: 'Milestone Silver Chest', rangeDesc: isEng ? '300-500 Coins | 1-3 Fragments' : '300-500 Koin | 1-3 ' },
                    { tier: 3, requirement: 2000, label: 'Milestone Epic Gold Chest', rangeDesc: isEng ? '600-1200 Coins | 3-8 Fragments (Guaranteed!)' : '600-1200 Koin | 3-8  (Pasti!)' }
                  ].map((x) => {
                    const achieved = totalClanContribution >= x.requirement;
                    const claimed = claimedWeeklyMilestones.includes(x.tier);
 
                    return (
                      <div key={x.tier} className="bg-stone-900 border border-stone-850 p-3.5 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9.5px] font-black text-slate-450 block uppercase tracking-wide">
                            {x.label}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-350 block mt-0.5">
                            Syarat: {x.requirement} Poin
                          </span>
                          <div className="text-[9.5px] font-bold text-yellow-500 mt-1 flex items-center gap-1 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            <span>Hadiah Gacha: {x.rangeDesc}</span>
                          </div>
                        </div>
 
                        <button 
                          onClick={() => handleClaimMilestone(x.tier, x.requirement, x.label)}
                          disabled={claimed || !achieved}
                          className={`px-3 py-2 text-[9.5px] font-black uppercase rounded-lg border-none cursor-pointer transition ${
                            claimed 
                              ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                              : achieved 
                                ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow animate-pulse'
                                : 'bg-stone-850 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {claimed ? 'DIKLAIM' : achieved ? 'KLAIM' : 'BELUM'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suku leaderboards */}
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-850 pb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Peringkat Kontribusi Aktif Anggota
                </h4>

                <div className="space-y-2.5">
                  {[...guildMembers]
                    .sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
                    .map((item, index) => {
                      return (
                        <div key={item.name} className="flex justify-between items-center text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 font-bold font-mono text-slate-500 text-center">
                              {index + 1}.
                            </span>
                            <span className="text-white font-bold">{item.name}</span>
                          </div>
                          <span className="text-yellow-500 font-mono font-black">
                            {item.contribution || 0} Poin
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CHESS WAR */}
          {activityDetail === 'war' && (
            <div className="space-y-6">
              {/* Campaign War Map Banner */}
              <div className="relative overflow-hidden p-6 rounded-3xl border border-red-950/40 bg-gradient-to-br from-[#1a1110] via-[#1f1615] to-[#120a09] space-y-4 shadow-xl">
                <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full font-black uppercase tracking-widest leading-none inline-block">
                       Kampanye Militer Suku (Active Season)
                    </span>
                    <h4 className="text-lg font-black text-white uppercase mt-1.5 tracking-wide flex items-center gap-2">
                      ️ Perang Tanding Taktis Suku
                    </h4>
                    <p className="text-[10.5px] text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Selesaikan teka-teki catur strategis di papan tanding wilayah musuh untuk mendominasi teritori dan memenangkan tunjangan koin suku harian yang melimpah!
                    </p>
                  </div>
                  
                  <div className="bg-[#1c1a19] border border-stone-850 p-3 rounded-2xl text-center shrink-0 min-w-[120px]">
                    <span className="text-[8px] text-slate-500 font-black uppercase block">Bonus Suku Aktif</span>
                    <span className="text-sm font-mono font-black text-[#81b64c] block mt-0.5">+300 Koin / Board</span>
                    <span className="text-[8px] text-slate-400 block font-bold">1x Klaim Harian</span>
                  </div>
                </div>

                <div className="border-t border-stone-800/60 pt-3 flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Target: Suku Rival Nusantara</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                    <span>Status: Zona Tempur Aktif</span>
                  </div>
                </div>
              </div>

              {activeWarStage === null ? (
                <div className="space-y-4">
                  {puzzlesList.map((puzzle) => {
                    const isConquered = conqueredBoards.includes(String(puzzle.id));
                    return (
                      <div key={puzzle.id} className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[8px] bg-stone-900 text-[#81b64c] px-2 py-0.5 rounded font-black uppercase">Board {puzzle.id}</span>
                          <h5 className="text-xs font-black text-white uppercase mt-1">{puzzle.title}</h5>
                          <p className="text-[10px] text-slate-400 pr-1 mt-0.5 leading-normal">{puzzle.desc}</p>
                        </div>

                        <button 
                          onClick={() => {
                            if (isConquered) {
                              triggerAudio('error');
                              triggerReward(0, 'Papan taktis ini sudah berhasil Anda taklukkan hari ini!', 'info');
                              return;
                            }
                            handleStartCombat(puzzle.id);
                          }}
                          className={`px-4.5 py-2.5 rounded-xl font-black text-[10px] uppercase border-none text-center cursor-pointer transition whitespace-nowrap ${
                            isConquered 
                              ? 'bg-stone-900 text-stone-500 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-500 text-white shadow'
                          }`}
                        >
                          {isConquered ? 'SELESAI' : 'TANTANG'}
                        </button>
                      </div>
                    );
                  })}

                  {/* Reset Button to allow replay/testing of all boards */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => {
                        setConqueredBoards([]);
                        localStorage.setItem('conquered_boards_list', JSON.stringify([]));
                        triggerAudio('win');
                        triggerReward(0, 'Semua papan taktis klan telah berhasil di-reset! Anda dapat menantang dan mengetesnya kembali.', 'info');
                      }}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-red-400 hover:text-red-300 border border-red-950/40 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                       Reset Semua Kemajuan & Ulangi Papan Taktis Suku
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934] space-y-5">
                  {(() => {
                    const activePuzzle = puzzlesList.find(p => p.id === activeWarStage)!;

                    if (isSelectingRoster) {
                      const limit = battleMode === '1v1' ? 3 : 4;
                      const selectedCount = selectedRosterTemplateNames.length;

                      return (
                        <div className="space-y-5 text-left">
                          {/* Selection Header */}
                          <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-yellow-500 px-2.5 py-1 rounded font-black uppercase tracking-wider">
                                PENYUSUNAN SKUAD BATTLE
                              </span>
                              <h5 className="text-sm font-black text-white uppercase mt-1">Roster Suku Board {activeWarStage}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                Pilih bidak Pokémon-mu untuk mengarungi pertempuran taktis klan.
                              </p>
                            </div>
                            <button 
                              onClick={() => { setActiveWarStage(null); triggerAudio('move'); }}
                              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-xl text-[9px] font-black uppercase text-slate-450 hover:text-white cursor-pointer transition self-start sm:self-auto"
                            >
                              Batal Tanding
                            </button>
                          </div>

                          {/* Battle Mode Toggle */}
                          <div className="bg-[#1c1a19] p-4 rounded-xl border border-stone-850 space-y-3">
                            <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-wider block">️ Tentukan Mode Pertandingan:</span>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { mode: '1v1', slots: '1 Aktif + 2 Cadangan (Bawa 3 Bidak)', desc: 'Fokus tanding satu lawan satu layaknya duel Pokémon klasik.' },
                                { mode: '2v2', slots: '2 Aktif + 2 Cadangan (Bawa 4 Bidak)', desc: 'Pertandingan tim ganda penuh sinergi element & support.' }
                              ].map(item => (
                                <button
                                  key={item.mode}
                                  onClick={() => {
                                    setBattleMode(item.mode as '1v1' | '2v2');
                                    setSelectedRosterTemplateNames([]);
                                    triggerAudio('move');
                                  }}
                                  className={`p-3 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between min-h-[85px] ${
                                    battleMode === item.mode
                                      ? 'bg-amber-950/20 border-amber-500 shadow shadow-amber-950/35'
                                      : 'bg-stone-900/60 border-stone-850 hover:bg-stone-900'
                                  }`}
                                >
                                  <div>
                                    <span className={`text-[10px] font-black uppercase ${battleMode === item.mode ? 'text-amber-400' : 'text-slate-300'}`}>
                                      Format {item.mode}
                                    </span>
                                    <p className="text-[9px] text-slate-450 mt-1 leading-snug font-medium">{item.desc}</p>
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-500 uppercase mt-2 block font-bold">{item.slots}</span>
                                  {battleMode === item.mode && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Roster Pick Grid */}
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <span>Pilih Pokémon Bidak Suku ({selectedCount} / {limit}):</span>
                              <span className={selectedCount === limit ? 'text-[#81b64c]' : 'text-amber-500'}>
                                {selectedCount === limit ? '✓ SKUAD LENGKAP' : `KURANG ${limit - selectedCount} BIDAK`}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {PLAYER_ROSTER_TEMPLATES.map(t => {
                                const isPicked = selectedRosterTemplateNames.includes(t.name);
                                return (
                                  <div
                                    key={t.name}
                                    onClick={() => handleSelectRosterPiece(t.name)}
                                    className={`p-3 rounded-xl border text-left transition cursor-pointer select-none relative flex justify-between gap-3 ${
                                      isPicked
                                        ? 'bg-amber-950/20 border-amber-500 shadow-sm shadow-amber-950/25'
                                        : 'bg-stone-900 border-stone-850 hover:bg-stone-850'
                                    }`}
                                  >
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-white text-xs">{t.name}</span>
                                        <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded ${
                                          t.element === 'Api' ? 'bg-red-500/15 text-red-400' :
                                          t.element === 'Air' ? 'bg-blue-500/15 text-blue-400' :
                                          t.element === 'Tanah' ? 'bg-green-500/15 text-green-400' :
                                          t.element === 'Petir' ? 'bg-yellow-500/15 text-yellow-400' :
                                          t.element === 'Cahaya' ? 'bg-amber-500/15 text-amber-400' :
                                          'bg-purple-500/15 text-purple-400'
                                        }`}>
                                          {t.element}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-mono">
                                        HP: <span className="text-white">{t.hp}</span> | ATK: <span className="text-amber-500">{t.atk}</span>
                                      </p>
                                      {/* Mini Moves Preview */}
                                      <div className="flex gap-1 pt-1 flex-wrap">
                                        {t.moves.map(m => (
                                          <span key={m.name} className="text-[7.5px] bg-black/35 px-1 rounded text-slate-350" title={m.desc}>
                                            {m.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-between shrink-0">
                                      <span className="text-2xl leading-none select-none filter drop-shadow">{t.symbol}</span>
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                        isPicked ? 'bg-amber-500 border-amber-400' : 'bg-black/30 border-stone-700'
                                      }`}>
                                        {isPicked && <span className="text-[10px] text-slate-950 font-black leading-none">✓</span>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            <button
                              onClick={handleLaunchBattle}
                              disabled={selectedCount !== limit}
                              className={`w-full py-3 text-xs font-black uppercase rounded-xl transition-all shadow border-none tracking-wider ${
                                selectedCount === limit
                                  ? 'bg-[#81b64c] hover:bg-green-500 text-white cursor-pointer hover:scale-[1.002]'
                                  : 'bg-stone-900 text-stone-550 cursor-not-allowed border border-stone-850'
                              }`}
                            >
                               LANTAIKAN PERANG TANDING TAKTIS! 
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // ELSE: Battle Gameplay Stage
                    return (
                      <div className="space-y-4 text-left">
                        {/* Battle Header */}
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <div>
                            <span className="text-[8px] bg-red-600/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              DUEL ARENA TAKTIS — {battleMode} MODE
                            </span>
                            <h5 className="text-xs font-black text-white uppercase mt-0.5">Suku {activePuzzle.title}</h5>
                          </div>
                          <button 
                            onClick={() => { setActiveWarStage(null); triggerAudio('move'); }}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-lg text-[9px] font-black uppercase text-slate-450 hover:text-white cursor-pointer transition"
                          >
                            Keluar Arena
                          </button>
                        </div>

                        {/* ARENA LAYOUT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* LEFT: PLAYER TEAM (White Active Units) */}
                          <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-850/60 space-y-2.5">
                            <h6 className="text-[10px] font-black text-[#81b64c] uppercase tracking-wider flex items-center justify-between border-b border-stone-850/60 pb-1">
                              <span> Bidak Aktif Anda</span>
                              <span className="text-[8.5px] font-mono text-slate-500 font-bold">GILIRAN ANDA</span>
                            </h6>

                            <div className="space-y-2">
                              {activePlayerIds.map(id => {
                                const u = myUnits.find(x => x.id === id);
                                if (!u) return null;

                                const isDead = u.hp <= 0;
                                const isSelected = selectedMyUnitId === u.id;
                                const hasMoved = hasMovedThisTurn.includes(u.id);
                                const isReady = !isDead && !hasMoved && currentTurnOwner === 'player' && !isBattleOver;

                               const isEligibleFriendlyTarget = selectedMyUnitId && selectedMove && (selectedMove.category === 'support' || selectedMove.category === 'defend') && !isDead && !isBattleOver;

                               return (
                                  <div
                                    key={u.id}
                                    onClick={() => {
                                      if (isDead || isBattleOver || isAutoPlaying || currentTurnOwner === 'enemy') return;
                                      if (isEligibleFriendlyTarget) {
                                        executePlayerAction(selectedMyUnitId!, selectedMove!, u.id);
                                      } else {
                                        setSelectedMyUnitId(isSelected ? null : u.id);
                                        setSelectedMove(null);
                                        triggerAudio('move');
                                      }
                                    }}
                                    className={`p-3 rounded-xl border transition relative flex items-center justify-between gap-3 ${
                                      isDead
                                        ? 'bg-black/60 border-stone-900 opacity-40 grayscale'
                                        : isEligibleFriendlyTarget
                                          ? 'bg-green-950/20 border-green-500 cursor-pointer hover:bg-green-950/30 shadow-md shadow-green-950/25 animate-pulse'
                                          : isSelected
                                            ? 'bg-amber-950/20 border-amber-500 shadow shadow-amber-950/35 animate-pulse-slow cursor-pointer select-none'
                                            : isReady
                                              ? 'bg-stone-900 hover:bg-stone-850 border-stone-750 cursor-pointer select-none'
                                              : 'bg-stone-900/40 border-stone-850 opacity-75'
                                    }`}
                                  >
                                    <div className="flex-1 space-y-1.5">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-white text-xs">{u.name}</span>
                                        <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded ${
                                          u.element === 'Api' ? 'bg-red-500/15 text-red-400' :
                                          u.element === 'Air' ? 'bg-blue-500/15 text-blue-400' :
                                          u.element === 'Tanah' ? 'bg-green-500/15 text-green-400' :
                                          u.element === 'Petir' ? 'bg-yellow-500/15 text-yellow-400' :
                                          u.element === 'Cahaya' ? 'bg-amber-500/15 text-amber-400' :
                                          'bg-purple-500/15 text-purple-400'
                                        }`}>
                                          {u.element}
                                        </span>
                                        {u.shield > 0 && (
                                          <span className="text-[7.5px] bg-blue-600 text-white font-mono px-1 py-0.5 rounded font-black">
                                             {u.shield} SHIELD
                                          </span>
                                        )}
                                        {u.atkBuff && (
                                          <span className="text-[7px] bg-rose-600 text-white font-mono px-1 py-0.5 rounded font-black uppercase">
                                            ️ ATK +{Math.round((u.atkBuff - 1) * 100)}%
                                          </span>
                                        )}
                                      </div>

                                      {/* Health and Shield Bars */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800 relative">
                                          <div 
                                            style={{ width: `${(u.hp / u.maxHp) * 100}%` }} 
                                            className={`h-full transition-all ${
                                              u.hp > u.maxHp * 0.45 ? 'bg-[#81b64c]' : 'bg-red-600'
                                            }`}
                                          />
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] font-mono text-slate-450 font-bold">
                                          <span>HP: {u.hp} / {u.maxHp}</span>
                                          <span>ATK BASE: {u.atk}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-between gap-1 shrink-0">
                                      <span className="text-2xl drop-shadow filter text-white select-none">{u.symbol}</span>
                                      {isReady ? (
                                        <span className="text-[7px] font-black bg-amber-500 text-stone-950 px-1 py-0.5 rounded uppercase tracking-wider animate-bounce">
                                          READY
                                        </span>
                                      ) : hasMoved ? (
                                        <span className="text-[7px] font-black bg-stone-800 text-slate-500 px-1 py-0.5 rounded uppercase">
                                          MOVED
                                        </span>
                                      ) : null}
                                    </div>

                                    {/* Support target blinking pointer */}
                                    {isEligibleFriendlyTarget && (
                                      <span className="absolute -top-1.5 -right-1 text-[7px] font-black bg-green-600 text-white px-1.5 py-0.5 rounded uppercase animate-bounce tracking-wider shadow">
                                        TAP REKAN!
                                      </span>
                                    )}

                                    {/* Action highlight borders */}
                                    {isEligibleFriendlyTarget && (
                                      <div className="absolute inset-0 rounded-xl border-2 border-green-500 animate-pulse pointer-events-none" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* RIGHT: ENEMY TEAM (Black Active Units) */}
                          <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-850/60 space-y-2.5">
                            <h6 className="text-[10px] font-black text-red-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-850/60 pb-1">
                              <span> Skuad Rival Aktif</span>
                              <span className="text-[8.5px] font-mono text-slate-500 font-bold">RIVAL TEAM</span>
                            </h6>

                            <div className="space-y-2">
                              {activeEnemyIds.map(id => {
                                const u = enemyUnits.find(x => x.id === id);
                                if (!u) return null;

                                const isDead = u.hp <= 0;
                                const isEligibleTarget = selectedMyUnitId && selectedMove && (selectedMove.category === 'attack' || selectedMove.category === 'ultimate') && !isDead && !isBattleOver;

                                return (
                                  <div
                                    key={u.id}
                                    onClick={() => {
                                      if (isEligibleTarget) {
                                        executePlayerAction(selectedMyUnitId!, selectedMove!, u.id);
                                      }
                                    }}
                                    className={`p-3 rounded-xl border transition relative flex items-center justify-between gap-3 ${
                                      isDead
                                        ? 'bg-black/60 border-stone-900 opacity-40 grayscale'
                                        : isEligibleTarget
                                          ? 'bg-red-950/20 border-red-500 cursor-pointer hover:bg-red-950/30 shadow-md shadow-red-950/25 animate-pulse'
                                          : 'bg-stone-900 border-stone-850'
                                    }`}
                                  >
                                    <div className="flex-1 space-y-1.5">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-white text-xs">{u.name}</span>
                                        <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded ${
                                          u.element === 'Api' ? 'bg-red-500/15 text-red-400' :
                                          u.element === 'Air' ? 'bg-blue-500/15 text-blue-400' :
                                          u.element === 'Tanah' ? 'bg-green-500/15 text-green-400' :
                                          u.element === 'Petir' ? 'bg-yellow-500/15 text-yellow-400' :
                                          u.element === 'Cahaya' ? 'bg-amber-500/15 text-amber-400' :
                                          'bg-purple-500/15 text-purple-400'
                                        }`}>
                                          {u.element}
                                        </span>
                                        {u.shield > 0 && (
                                          <span className="text-[7.5px] bg-blue-600 text-white font-mono px-1 py-0.5 rounded font-black">
                                             {u.shield} SHIELD
                                          </span>
                                        )}
                                      </div>

                                      {/* Health and Shield Bars */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800 relative">
                                          <div 
                                            style={{ width: `${(u.hp / u.maxHp) * 100}%` }} 
                                            className={`h-full transition-all ${
                                              u.hp > u.maxHp * 0.45 ? 'bg-red-500' : 'bg-red-800'
                                            }`}
                                          />
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] font-mono text-slate-450 font-bold">
                                          <span>HP: {u.hp} / {u.maxHp}</span>
                                          <span>ATK BASE: {u.atk}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-between shrink-0">
                                      <span className="text-2xl drop-shadow filter text-red-500 select-none">{u.symbol}</span>
                                    </div>

                                    {/* Attack target blinking pointer */}
                                    {isEligibleTarget && (
                                      <span className="absolute -top-1.5 -right-1 text-[7px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase animate-bounce tracking-wider shadow">
                                        TAP TARGET!
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* BENCHED UNITS ROW (Cadangan) */}
                        <div className="bg-[#1c1a19]/80 p-3 rounded-xl border border-stone-850/60 space-y-2 text-left">
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">
                             Bidak Cadangan Suku (Benched Pokemon):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {myUnits
                              .filter(u => !activePlayerIds.includes(u.id))
                              .map(u => {
                                const isDead = u.hp <= 0;
                                const isPlayerTurn = currentTurnOwner === 'player' && !isBattleOver && !isAutoPlaying;
                                const canSwapIn = isPlayerTurn && !isDead;

                                return (
                                  <div
                                    key={u.id}
                                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between min-h-[65px] ${
                                      isDead
                                        ? 'bg-black/50 border-stone-900 opacity-40 grayscale'
                                        : 'bg-stone-900 border-stone-800'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black text-white truncate max-w-[70px]">{u.name}</span>
                                      <span className="text-sm">{u.symbol}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-[8px] text-slate-400 font-mono">HP: {u.hp}/{u.maxHp}</span>
                                      {canSwapIn && selectedMyUnitId ? (
                                        <button
                                          onClick={() => handleSwitchBenchedUnit(selectedMyUnitId, u.id)}
                                          className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[7px] font-black uppercase rounded transition cursor-pointer border-none"
                                        >
                                           Tukar
                                        </button>
                                      ) : (
                                        <span className="text-[7px] text-slate-500 font-black uppercase">CADANGAN</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* MOVESET INTERACTIVE PANEL (The Pokemon Battle Control Board) */}
                        <div className="bg-[#1a1817] p-4 rounded-xl border border-stone-800 space-y-3">
                          {(() => {
                            if (isBattleOver) {
                              return (
                                <div className="text-center py-2 space-y-1">
                                  <h6 className="text-xs font-black uppercase tracking-wider text-[#81b64c]">
                                    {battleResult === 'win' ? ' KEMENANGAN MUTLAK! ' : ' SKUAD ANDA GUGUR! '}
                                  </h6>
                                  <p className="text-[10px] text-slate-400">
                                    {battleResult === 'win' 
                                      ? 'Suku Anda sukses mengalahkan pertahanan rival klan!' 
                                      : 'Gunakan tombol Reset Suku atau atur formasi cadangan baru.'}
                                  </p>
                                </div>
                              );
                            }

                            if (currentTurnOwner === 'enemy') {
                              return (
                                <div className="flex flex-col items-center justify-center py-5 space-y-2">
                                  <div className="w-5 h-5 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
                                  <p className="text-[10.5px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                                     RIVAL SEDANG MENYUSUN BALASAN SERANGAN... 
                                  </p>
                                </div>
                              );
                            }

                            if (!selectedMyUnitId) {
                              return (
                                <div className="text-center py-6 border border-dashed border-stone-800 rounded-xl">
                                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                     SILAKAN TAP SALAH SATU BIDAK AKTIF ANDA YANG BERTANDA "READY" UNTUK MELIHAT MOVESET BATTLE!
                                  </p>
                                </div>
                              );
                            }

                            const selectedUnit = myUnits.find(u => u.id === selectedMyUnitId)!;
                            return (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-stone-850 pb-2">
                                  <div>
                                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                                      PILOTING: {selectedUnit.name} [{selectedUnit.element}]
                                    </span>
                                    <h6 className="text-xs font-black text-white uppercase mt-1">Daftar Jurus Bawaan Pokémon Bidak:</h6>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-bold">
                                    Pilih move lalu ketuk target kawan/musuh di atas!
                                  </span>
                                </div>

                                {/* Moves Button Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  {selectedUnit.moves.map(move => {
                                    const isChosen = selectedMove?.name === move.name;
                                    const isOutOfPP = move.pp !== undefined && move.pp <= 0;
                                    return (
                                      <button
                                        key={move.name}
                                        onClick={() => {
                                          if (isOutOfPP) {
                                            triggerAudio('error');
                                            triggerReward(0, `Jurus "${move.name}" telah habis batas penggunaannya (PP 0)!`, 'info');
                                            return;
                                          }
                                          setSelectedMove(move);
                                          triggerAudio('move');
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between min-h-[115px] h-auto ${
                                          isOutOfPP
                                            ? 'opacity-40 bg-stone-950 border-stone-900 cursor-not-allowed'
                                            : isChosen
                                              ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-950/40'
                                              : 'bg-stone-900 border-stone-850 hover:bg-stone-850'
                                        }`}
                                      >
                                        <div className="space-y-1 w-full">
                                          <div className="flex justify-between items-center flex-wrap gap-1">
                                            <span className="text-[11px] font-black text-white truncate max-w-[100px]">{move.name}</span>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <span className={`text-[7px] font-mono uppercase px-1 rounded ${
                                                move.category === 'attack' ? 'bg-red-500/15 text-red-400' :
                                                move.category === 'defend' ? 'bg-blue-500/15 text-blue-400' :
                                                move.category === 'support' ? 'bg-green-500/15 text-green-400' :
                                                'bg-purple-500/15 text-purple-400'
                                              }`}>
                                                {move.category}
                                              </span>
                                              {move.pp !== undefined && move.maxPp !== undefined && (
                                                <span className={`text-[8px] px-1 font-mono font-bold rounded ${
                                                  move.pp === 0 
                                                    ? 'bg-red-500/25 text-red-400 border border-red-500/30' 
                                                    : 'bg-stone-850 text-slate-300'
                                                }`}>
                                                  {move.pp}/{move.maxPp}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-[9px] text-slate-400 leading-snug">{move.desc}</p>
                                        </div>

                                        {/* Dynamic Element Effectiveness Display */}
                                        {(move.category === 'attack' || move.category === 'ultimate') && activeEnemyIds.length > 0 && (
                                          <div className="mt-2.5 pt-2 border-t border-stone-850/60 space-y-1 w-full">
                                            <div className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Efektivitas vs Musuh:</div>
                                            {activeEnemyIds.map(enemyId => {
                                              const enemy = enemyUnits.find(e => e.id === enemyId);
                                              if (!enemy || enemy.hp <= 0) return null;
                                              
                                              const elemResult = getElementMultiplier(move.type, enemy.element);
                                              
                                              let badgeColor = 'bg-stone-900 text-slate-400 border-stone-800';
                                              let displayLabel = elemResult.label;

                                              if (elemResult.label === 'extremely efektif') {
                                                badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                                                displayLabel = 'Extremely Efektif ';
                                              } else if (elemResult.label === 'super efektif') {
                                                badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                                                displayLabel = 'Super Efektif ';
                                              } else if (elemResult.label === 'kurang efektif') {
                                                badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                                displayLabel = 'Kurang Efektif ';
                                              } else if (elemResult.label === 'tidak berefek ke lawannya') {
                                                badgeColor = 'bg-rose-950/20 text-rose-500 border-rose-900/30 line-through';
                                                displayLabel = 'Tidak Berefek ';
                                              } else {
                                                badgeColor = 'bg-[#81b64c]/10 text-[#81b64c] border-[#81b64c]/20';
                                                displayLabel = 'Efektif ✓';
                                              }

                                              return (
                                                <div key={enemyId} className="flex justify-between items-center text-[8px] gap-2 font-mono">
                                                  <span className="text-slate-400 truncate max-w-[65px]">{enemy.name}</span>
                                                  <span className={`px-1 py-0.5 rounded border font-black uppercase text-[7px] shrink-0 ${badgeColor}`}>
                                                    {displayLabel}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-500 uppercase mt-2.5 font-mono w-full pt-1">
                                          <span>Elemen: {move.type}</span>
                                          {move.power > 0 && <span className="text-amber-500">Power: x{move.power}</span>}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Target Selection Prompt */}
                                {selectedMove && (
                                  <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-850 flex items-center justify-between text-left animate-pulse">
                                    <div className="space-y-0.5">
                                      <span className="text-[8.5px] text-amber-500 font-black uppercase tracking-wider block">
                                         TAHAP TARGETING AKTIF:
                                      </span>
                                      <p className="text-[10px] text-slate-350 leading-relaxed font-bold">
                                        {selectedMove.category === 'attack' || selectedMove.category === 'ultimate'
                                          ? `Pilihlah salah satu Bidak Rival Aktif di atas untuk melancarkan serangan "${selectedMove.name}"!`
                                          : `Pilihlah salah satu kawan Bidak Aktif Anda di atas untuk menyalurkan buff/heal "${selectedMove.name}"!`}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => { setSelectedMove(null); triggerAudio('move'); }}
                                      className="px-2 py-1 bg-stone-850 hover:bg-stone-800 border border-stone-800 text-[8px] font-black text-slate-400 hover:text-white rounded"
                                    >
                                      Batal Move
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Mid Controls row */}
                        <div className="bg-[#1c1a19] p-3 rounded-xl border border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                          <div className="space-y-0.5 max-w-sm">
                            <span className="text-[9px] text-yellow-500 font-black uppercase tracking-wider block"> Info Ringkasan Multiplier Elemen:</span>
                            <p className="text-[9px] text-slate-450 leading-relaxed font-medium">
                              <strong>Fire</strong> unggul vs <strong>Grass</strong> | <strong>Grass</strong> unggul vs <strong>Water</strong> | <strong>Water</strong> unggul vs <strong>Fire</strong> | <strong>Electric</strong> unggul vs <strong>Water</strong> | <strong>Dark</strong> unggul vs <strong>Light</strong>. Serangan unggul melipatgandakan damage 1.5x!
                            </p>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            {!isBattleOver && (
                              <button
                                onClick={handleAutoClash}
                                disabled={isAutoPlaying || currentTurnOwner === 'enemy'}
                                className={`px-3 py-2 text-[9.5px] font-black uppercase rounded-lg border-none cursor-pointer transition ${
                                  isAutoPlaying 
                                    ? 'bg-amber-600/20 text-amber-500 cursor-not-allowed animate-pulse' 
                                    : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                                }`}
                              >
                                {isAutoPlaying ? (isEng ? 'Auto Clashing...' : 'Auto Clashing...') : (isEng ? 'Auto Clash' : 'Auto Clash')}
                              </button>
                            )}

                            <button 
                              onClick={() => { handleStartCombat(activeWarStage); }}
                              className="px-3 py-2 bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-lg text-[9.5px] font-black uppercase text-slate-350 hover:text-white cursor-pointer"
                            >
                               Reset Roster Skuad
                            </button>
                          </div>
                        </div>

                        {/* Logs section */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider"> Kronologi Pertempuran Suku:</span>
                          <div className="bg-black/35 p-3 rounded-xl border border-stone-850 h-28 overflow-y-auto space-y-1.5 font-mono">
                            {combatLogs.map((log, idx) => (
                              <p key={idx} className="text-[10px] text-slate-300 leading-normal border-b border-stone-900/45 pb-1 last:border-none">
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Back block */}
                        <div className="pt-2">
                          <button 
                            onClick={() => { setActiveWarStage(null); triggerAudio('move'); }}
                            className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 text-slate-450 text-[10px] font-black uppercase rounded-xl border border-stone-800 cursor-pointer text-center"
                          >
                            Keluar Ke Kampanye Map Suku
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CHAT ROOM */}
          {activityDetail === 'chat' && (
            <div className="space-y-4">
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-stone-850 pb-2">
                  <span>Obrolan Suku Aktif ({guildMembers.length} Orang)</span>
                </h4>

                <div className="space-y-3 max-h-[16rem] overflow-y-auto pr-1 bg-black/15 p-3 rounded-xl border border-stone-850 divide-y divide-stone-850">
                  {guildChatMessages.map((msg, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed pt-2.5 first:pt-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#81b64c] text-xs">{msg.sender}</span>
                        <span className="text-[8px] text-slate-500 font-mono italic">{msg.time}</span>
                      </div>
                      <span className="text-slate-350 font-medium mt-0.5 block">{msg.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ketik pesan obrolan suku klan..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value;
                        if (!val.trim()) return;

                        const timeNow = new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' });
                        setGuildChatMessages(prev => [...prev, { sender: username, text: val, time: timeNow }]);
                        e.currentTarget.value = '';
                        triggerAudio('move');

                        setTimeout(() => {
                          const replies = [
                            "Kerjasama klan catur kita mantap sekali!",
                            "Ayo klaim absensi harian ya teman-teman agar poin target chest kita tercapai.",
                            "Taktik puzzle board tadi seru banget, silakan diselesaikan.",
                            "Apakah ada yang perlu kepingan fragment Gold Knight? Saya bersedia mendonasikan.",
                            "Mabar catur santai sore ini kuy!"
                          ];
                          const senders = ['Naufal_Catur', 'Isna Caturia', 'Martin_Pratama'];
                          const randRep = replies[Math.floor(Math.random() * replies.length)];
                          const randSender = senders[Math.floor(Math.random() * senders.length)];

                          setGuildChatMessages(prev => [...prev, {
                            sender: randSender,
                            text: randRep,
                            time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })
                          }]);
                          triggerAudio('win');
                        }, 1200);
                      }
                    }}
                    className="flex-1 bg-[#1a1817] border border-stone-800 p-2.5 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#81b64c]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHEST OPENING GACHA MODAL */}
      <AnimatePresence>
        {openingChest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#262421] border-2 border-amber-500/30 w-full max-w-md rounded-3xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Radial Ambient Backlight Glow */}
              <div className={`absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none transition-opacity duration-700 ${openingChest.isOpened ? 'opacity-100' : 'opacity-40'}`} />

              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/30">
                  {openingChest.label}
                </span>
                <h3 className="text-lg font-black text-white mt-3 uppercase tracking-wider">
                  {openingChest.isOpened ? 'KLAIM REWARD SUKU!' : 'PETI REWARD DIKUNCI'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {openingChest.isOpened 
                    ? 'Hasil tarikan gacha keberuntungan dari chest milestone!' 
                    : 'Silakan ketuk peti di bawah ini untuk membuka dan melakukan gacha reward!'}
                </p>
              </div>

              {/* Central Chest Render Area */}
              <div className="py-6 flex flex-col items-center justify-center relative min-h-[180px]">
                {!openingChest.isOpened ? (
                  /* CLOSED CHEST STAGE */
                  <motion.div
                    onClick={executeOpenChest}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={openingChest.isShaking ? {
                      x: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0],
                      y: [0, -4, 4, -4, 4, -2, 2, -1, 1, 0],
                      rotate: [0, -6, 6, -6, 6, -3, 3, -1, 1, 0]
                    } : {
                      y: [0, -8, 0]
                    }}
                    transition={openingChest.isShaking ? {
                      duration: 0.8,
                      ease: "easeInOut"
                    } : {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative cursor-pointer select-none"
                  >
                    {/* Pulsing light ring behind chest */}
                    <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-2xl animate-pulse scale-150" />
                    
                    {/* Big stylized chest body */}
                    <div className="flex items-center justify-center filter drop-shadow-[0_10px_15px_rgba(245,158,11,0.25)] text-amber-500 py-4">
                      {openingChest.tier === 1 ? (
                        <Gift className="w-20 h-20 stroke-[1.5]" />
                      ) : openingChest.tier === 2 ? (
                        <Award className="w-20 h-20 stroke-[1.5]" />
                      ) : (
                        <Trophy className="w-20 h-20 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow whitespace-nowrap animate-bounce">
                      KETUK UNTUK MEMBUKA!
                    </div>
                  </motion.div>
                ) : (
                  /* OPENED / REVEALED LOOT STAGE */
                  <div className="space-y-4 w-full">
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                      animate={{ scale: [0.5, 1.2, 1], rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className="text-[90px] mb-2 filter drop-shadow-[0_15px_20px_rgba(245,158,11,0.45)]"
                    >
                      
                    </motion.div>

                    {/* Reward Floating Cards */}
                    <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                      {/* Coins Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-stone-900 border border-stone-800 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 relative group hover:border-amber-500/35 transition"
                      >
                        <Coins className="w-8 h-8 text-yellow-500 animate-bounce" />
                        <span className="text-[10px] uppercase font-black text-slate-400">KOIN EMAS</span>
                        <span className="text-sm font-black font-mono text-yellow-500">+{openingChest.finalCoins}</span>
                      </motion.div>

                      {/* Diamonds Card */}
                      {openingChest.finalDiamonds > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-stone-900 border border-stone-800 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-blue-500/35 transition"
                        >
                          <Gem className="w-8 h-8 text-blue-400 animate-pulse" />
                          <span className="text-[10px] uppercase font-black text-slate-400">DIAMONDS</span>
                          <span className="text-sm font-black font-mono text-blue-400">+{openingChest.finalDiamonds}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-stone-900/50 border border-stone-850 p-3 rounded-2xl flex flex-col items-center justify-center opacity-40 space-y-1"
                        >
                          <Gem className="w-8 h-8 text-stone-500" />
                          <span className="text-[9px] uppercase font-black text-stone-500">DIAMONDS</span>
                          <span className="text-xs font-bold text-stone-600">Belum Beruntung</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {openingChest.isOpened ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerAudio('win');
                      setOpeningChest(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer hover:shadow-lg transition-all border-none"
                  >
                    AMBIL REWARD & KEMBALI 
                  </motion.button>
                ) : (
                  <button
                    onClick={executeOpenChest}
                    disabled={openingChest.isShaking}
                    className="w-full py-3 bg-stone-800 hover:bg-stone-750 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition border border-stone-700/50"
                  >
                    {openingChest.isShaking ? 'SEDANG MEMBUKA...' : 'BUKA PETI REWARD'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
