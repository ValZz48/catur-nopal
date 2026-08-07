import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, MessageSquare, Clock, Compass, EyeOff, LineChart, 
  Calendar, Gift, Percent, Coins, Gem, Crown, Shield, ArrowRight, 
  Lock, Plus, Search, Award, Flame, UserCheck, ThumbsUp, Check, 
  Settings, Activity, Sparkles, Timer, Bookmark, Trash, Heart, Mail, Swords,
  ChevronLeft, ShieldAlert, UserPlus, RotateCw, Filter, PlusCircle, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SukuDashboard } from './SukuDashboard';
import { SukuMembers } from './SukuMembers';
import { SukuActivities } from './SukuActivities';
import { getLevelFromXP } from '../utils';
import { AvatarWithFrame } from './AvatarWithFrame';

// =========================================================================
// INTERFACES & PROPS
// =========================================================================

interface Features31to40Props {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  onlineRating: number;
  setOnlineRating: React.Dispatch<React.SetStateAction<number>>;
  membershipStatus: 'free' | 'premium';
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, customMessage: string, type?: 'success' | 'success_no_xp' | 'level_up' | 'info' | 'premium' | 'error') => void;
  setMode?: (mode: any) => void;
  startAiGameWithTimerAndCasual?: (charId: string, limitSec: number, isCasual: boolean) => void;
  streak: number;
  receivedGifts: any[];
  setReceivedGifts: React.Dispatch<React.SetStateAction<any[]>>;
  unlockedSkins: string[];
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedThemes: string[];
  setUnlockedThemes: React.Dispatch<React.SetStateAction<any[]>>;
  unlockedFrames: string[];
  setUnlockedFrames: React.Dispatch<React.SetStateAction<string[]>>;
  initialTab?: 'guild' | 'tournament' | 'posts' | 'deals' | 'stats';
  hideTabsSelector?: boolean;
  diamondSavings?: number;
  setDiamondSavings?: React.Dispatch<React.SetStateAction<number>>;
  friendsList?: any[];
  prefLang?: 'id' | 'en';
  onlineHistory?: any[];
}

// -------------------------------------------------------------------------
// TOURNAMENT MOCK DATA & BOT SEED
// -------------------------------------------------------------------------
interface TourneyMatch {
  p1: string;
  p2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  isUserMatch: boolean;
  round: 'quarter' | 'semi' | 'final';
  id: string;
}

export const renderGuildLogo = (logoKey: string) => {
  const norm = String(logoKey);
  if (norm.startsWith('data:') || norm.startsWith('http') || norm.startsWith('/')) {
    return <img src={norm} alt="Suku Logo" className="absolute inset-0 w-full h-full object-cover rounded-[inherit] shrink-0" referrerPolicy="no-referrer" />;
  }
  const normLower = norm.toLowerCase();
  if (normLower === 'pedang') return <Swords className="w-11 h-11 text-amber-500 shrink-0" />;
  if (normLower === 'mahkota') return <Crown className="w-11 h-11 text-yellow-500 shrink-0" />;
  if (normLower === 'medali') return <Award className="w-11 h-11 text-orange-400 shrink-0" />;
  if (normLower === 'piala') return <Trophy className="w-11 h-11 text-yellow-450 shrink-0" />;
  return <Shield className="w-11 h-11 text-[#81b64c] shrink-0" />;
};

export const Features31to40: React.FC<Features31to40Props> = ({
  coins, setCoins, diamonds, setDiamonds, xp, setXp, onlineRating, setOnlineRating,
  membershipStatus, triggerAudio, triggerReward, setMode, startAiGameWithTimerAndCasual,
  streak,
  receivedGifts, setReceivedGifts,
  unlockedSkins, setUnlockedSkins,
  unlockedThemes, setUnlockedThemes,
  unlockedFrames, setUnlockedFrames,
  initialTab,
  hideTabsSelector = false,
  diamondSavings,
  setDiamondSavings,
  friendsList,
  prefLang,
  onlineHistory
}) => {
  // Navigation for Features 31-40 tabs
  const [activeTab, setActiveTab] = useState<'guild' | 'tournament' | 'posts' | 'deals' | 'stats'>(initialTab || 'guild');

  // Tracing ELO history backwards from the current onlineRating dynamically to prevent hardcoding leakage
  const eloPoints = React.useMemo(() => {
    const points = [onlineRating];
    let current = onlineRating;
    const historyToUse = onlineHistory || [];
    for (let i = 0; i < Math.min(7, historyToUse.length); i++) {
      const diff = historyToUse[i]?.eloDiff || 0;
      current = current - diff;
      points.push(current);
    }
    points.reverse();
    
    const targetLength = 8;
    if (points.length < targetLength) {
      const firstComputed = points[0];
      const gap = targetLength - points.length;
      const padding = [];
      for (let i = 0; i < gap; i++) {
        const val = Math.round(400 + (firstComputed - 400) * (i / gap));
        padding.push(val);
      }
      return [...padding, ...points];
    }
    return points.slice(-8);
  }, [onlineRating, onlineHistory]);

  const chartData = React.useMemo(() => {
    const minRating = Math.min(...eloPoints);
    const maxRating = Math.max(...eloPoints);
    const xCoords = [10, 80, 150, 220, 290, 360, 430, 490];
    const minYCoord = 30;
    const maxYCoord = 145;
    
    return eloPoints.map((val, idx) => {
      const x = xCoords[idx];
      const y = maxRating === minRating 
        ? 110 
        : maxYCoord - ((val - minRating) / (maxRating - minRating)) * (maxYCoord - minYCoord);
      return { x, y, val };
    });
  }, [eloPoints]);

  const svgPathD = React.useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [chartData]);

  useEffect(() => {
    if (initialTab && activeTab !== initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load username
  const [username, setUsername] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const uObj = JSON.parse(saved);
        return uObj.username || 'Pecatur Handal';
      }
    } catch (e) {}
    return localStorage.getItem('guestUsername') || 'Pecatur Handal';
  });

  // Keep values updated in case user profile shifts
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const uObj = JSON.parse(saved);
          setUsername(uObj.username || 'Pecatur Handal');
        } else {
          setUsername(localStorage.getItem('guestUsername') || 'Pecatur Handal');
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getUserDetails = (name: string) => {
    if (!name) {
      return {
        avatar: '/src/assets/images/avatar_martin_1779709510230.png',
        frameId: 'none',
        lvl: 10
      };
    }
    const cleanName = name.trim().toLowerCase();
    const cleanUsername = (username || '').trim().toLowerCase();

    let savedUserObj: any = null;
    try {
      const saved = localStorage.getItem('user');
      if (saved) savedUserObj = JSON.parse(saved);
    } catch (e) {}

    const savedUsername = (savedUserObj?.username || '').trim().toLowerCase();

    if (cleanName === cleanUsername || (savedUsername && cleanName === savedUsername) || cleanName === 'nopal' || cleanName === 'pecatur handal') {
      let activeAvatar = savedUserObj?.profileAvatar || savedUserObj?.avatar || '';
      let activeFrame = savedUserObj?.selectedFrame || 'none';
      let activeLvl = savedUserObj?.level || (typeof xp === 'number' ? getLevelFromXP(xp) : 15);

      if (!activeAvatar) {
        activeAvatar = localStorage.getItem('profileAvatar') || localStorage.getItem('guestAvatar') || '';
      }
      if (!activeFrame || activeFrame === 'none') {
        activeFrame = localStorage.getItem('selectedFrame') || 'none';
      }
      return {
        avatar: activeAvatar || '/src/assets/images/avatar_martin_1779709510230.png',
        frameId: activeFrame,
        lvl: activeLvl
      };
    }

    const member = guildMembers.find(m => m && m.name && m.name.toLowerCase() === name.toLowerCase());
    if (member) {
      return {
        avatar: member.avatar || member.profileAvatar || '/src/assets/images/avatar_martin_1779709510230.png',
        frameId: member.frameId || member.selectedFrame || 'none',
        lvl: member.lvl || member.level || 10
      };
    }
    
    if (name === 'Isna Caturia') {
      return {
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150',
        frameId: 'gold',
        lvl: 34
      };
    }
    if (name === 'Naufal_Catur') {
      return {
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
        frameId: 'bronze',
        lvl: 28
      };
    }

    return {
      avatar: '/src/assets/images/avatar_martin_1779709510230.png',
      frameId: 'none',
      lvl: 10
    };
    if (name === 'Grandmaster_X' || name === 'Martin_Pratama') {
      return {
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
        frameId: 'cyber',
        lvl: 50
      };
    }

    return {
      avatar: '/src/assets/images/avatar_martin_1779709510230.png',
      frameId: 'none',
      lvl: 10
    };
  };

  const [realPlayers, setRealPlayers] = useState<any[]>([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [customConfirm, setCustomConfirm] = useState<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  useEffect(() => {
    fetch('/api/online/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const others = data.filter((p: any) => p && p.name && p.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase() !== username.trim().toLowerCase());
          setRealPlayers(others);
        }
      })
      .catch(err => console.warn("Failed to fetch leaderboard/real-players:", err));
  }, [username]);

  // -------------------------------------------------------------------------
  // FEATURE 35: FRIENDLY CASUAL PLAY STATE
  // -------------------------------------------------------------------------
  const [isCasualMatch, setIsCasualMatch] = useState<boolean>(() => {
    return localStorage.getItem('casual_match_mode') === 'true';
  });

  const toggleCasualMatch = () => {
    const next = !isCasualMatch;
    setIsCasualMatch(next);
    localStorage.setItem('casual_match_mode', String(next));
    triggerAudio('move');
    triggerReward(0, next 
      ? 'Mode Pertandingan Kausal Aktif! Tanding berikutnya tidak akan memodifikasi ELO rating Anda.' 
      : 'Mode Kompetitif Aktif! Tanding online atau vs bot akan memodifikasi rating ELO Anda secara resmi.', 
      'info'
    );
  };

  // -------------------------------------------------------------------------
  // FEATURE 34: SPEED CONTROLLER
  // -------------------------------------------------------------------------
  const [gameSpeedType, setGameSpeedType] = useState<'blitz' | 'bullet' | 'rapid'>(() => {
    return (localStorage.getItem('chess_speed_type') as any) || 'rapid';
  });

  const changeGameSpeed = (type: 'blitz' | 'bullet' | 'rapid') => {
    setGameSpeedType(type);
    localStorage.setItem('chess_speed_type', type);
    // Set matching timer limit
    const matchingLimit = type === 'bullet' ? 60 : type === 'blitz' ? 180 : 600;
    localStorage.setItem('timerLimit', String(matchingLimit));
    localStorage.setItem('timerEnabled', 'true');
    triggerAudio('move');
    triggerReward(0, `Format bermain disetel ke ${type.toUpperCase()} (${matchingLimit / 60} Menit). Jam catur otomatis aktif!`, 'success_no_xp');
    
    // Dispatch event to sync App.tsx states
    window.dispatchEvent(new Event('storage'));
  };

  // -------------------------------------------------------------------------
  // FEATURE 31: WEEKLY TOURNAMENT STATES
  // -------------------------------------------------------------------------
  const [tourneyHistory, setTourneyHistory] = useState<number>(() => {
    return Number(localStorage.getItem('tourney_wins_count')) || 0;
  });

  interface HiddenAchievement {
    id: string;
    title: string;
    hint: string;
    requirement: string;
    reward: string;
    unlocked: boolean;
  }

  const [secretAchievements, setSecretAchievements] = useState<HiddenAchievement[]>(() => {
    const list = [
      { id: 'ach_quick_win', title: 'Kilat Singkat', hint: 'Menang tanding AI di bawah 10 langkah.', requirement: 'Win bot under 10 moves', reward: '+150 Xp & +5 Diamond', unlocked: false },
      { id: 'ach_treasury_lord', title: 'Juragan Donatur Klan', hint: 'Melakukan sumbangan Treasury klan sebesar 500 koin.', requirement: 'Donate 500 gold at once', reward: '+100 Xp & +5 Diamond', unlocked: false },
      { id: 'ach_tourney_conqueror', title: 'Penakluk Liga Kerajaan', hint: 'Menjuarai Turnamen Mingguan minimal 1 kali.', requirement: 'Win 8-player knockout', reward: '+200 Xp & +10 Diamond', unlocked: false },
      { id: 'ach_spammer', title: 'Sahabat Karib', hint: 'Kirim hadiah Gift sosial kepada pemain lain.', requirement: 'Gifting coins to players', reward: '+75 Xp & +2 Diamond', unlocked: false }
    ];

    try {
      const saved = localStorage.getItem('hidden_achievements_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return list.map(item => {
          const matched = parsed.find((p: any) => p.id === item.id);
          return matched ? { ...item, unlocked: matched.unlocked } : item;
        });
      }
    } catch(e) {}
    return list;
  });

  const triggerHiddenAchievement = (achId: string) => {
    let newlyUnlocked = false;
    setSecretAchievements(prev => {
      const existing = prev.find(item => item.id === achId);
      if (existing && existing.unlocked) return prev;
      newlyUnlocked = true;
      const updated = prev.map(item => {
        if (item.id === achId) {
          return { ...item, unlocked: true };
        }
        return item;
      });
      localStorage.setItem('hidden_achievements_v1', JSON.stringify(updated));
      return updated;
    });

    if (newlyUnlocked) {
      triggerAudio('win');
      const addDiamondsWithSavings = (amt: number) => {
        if (setDiamondSavings) {
          setDiamondSavings(prev => {
            const next = prev + amt;
            return next > 150 ? 150 : next;
          });
        } else {
          setDiamonds(d => d + amt);
        }
      };

      if (achId === 'ach_quick_win') {
        setXp(x => x + 150);
        addDiamondsWithSavings(5);
        triggerReward(150, 'Bonus RAHASIA TERBONGKAR! Achievement Tersembunyi [Kilat Singkat] terbuka! Hadiah: +150 XP & +5 Diamond (Dipindahkan ke Tabungan)!', 'level_up');
      } else if (achId === 'ach_treasury_lord') {
        setXp(x => x + 100);
        addDiamondsWithSavings(5);
        triggerReward(100, 'Bonus RAHASIA TERBONGKAR! Achievement Tersembunyi [Juragan Donatur] terbuka! Hadiah: +100 XP & +5 Diamond (Dipindahkan ke Tabungan)!', 'level_up');
      } else if (achId === 'ach_tourney_conqueror') {
        setXp(x => x + 200);
        addDiamondsWithSavings(10);
        triggerReward(200, 'Bonus RAHASIA TERBONGKAR! Achievement Tersembunyi [Penakluk Liga] terbuka! Hadiah: +200 XP & +10 Diamond (Dipindahkan ke Tabungan)!', 'level_up');
      } else if (achId === 'ach_spammer') {
        setXp(x => x + 75);
        addDiamondsWithSavings(2);
        triggerReward(75, 'Bonus RAHASIA TERBONGKAR! Achievement Tersembunyi [Sahabat Karib] terbuka! Hadiah: +75 XP & +2 Diamond (Dipindahkan ke Tabungan)!', 'level_up');
      }
    }
  };

  const [tourneyActive, setTourneyActive] = useState<boolean>(() => {
    return localStorage.getItem('tourney_is_active') === 'true';
  });

  const [tourneyRound, setTourneyRound] = useState<'quarter' | 'semi' | 'final' | 'winner'>(() => {
    return (localStorage.getItem('tourney_round') as any) || 'quarter';
  });

  const [tourneyMatches, setTourneyMatches] = useState<TourneyMatch[]>(() => {
    try {
      const saved = localStorage.getItem('tourney_matches');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tourney_is_active', String(tourneyActive));
    localStorage.setItem('tourney_round', tourneyRound);
    localStorage.setItem('tourney_matches', JSON.stringify(tourneyMatches));
  }, [tourneyActive, tourneyRound, tourneyMatches]);

  const startTournament = () => {
    if (realPlayers.length < 7) {
      triggerAudio('error');
      triggerReward(0, 'Menunggu pemain nyata bergabung... Dibutuhkan minimal 7 pemain nyata terdaftar di server untuk memulai turnamen besar!', 'info');
      return;
    }

    if (coins < 200) {
      triggerAudio('error');
      triggerReward(0, 'Koin Anda tidak cukup untuk pendaftaran turnamen (Biaya masuk: 200 Koin)!', 'info');
      return;
    }
    setCoins(c => {
      const next = c - 200;
      localStorage.setItem('coins', String(next));
      return next;
    });

    // Extract real registered users for opponents
    const p2 = realPlayers[0].name;
    const p3 = realPlayers[1].name;
    const p4 = realPlayers[2].name;
    const p5 = realPlayers[3].name;
    const p6 = realPlayers[4].name;
    const p7 = realPlayers[5].name;
    const p8 = realPlayers[6].name;

    const initial: TourneyMatch[] = [
      { id: 'q1', p1: username, p2: p2, score1: undefined, score2: undefined, winner: undefined, isUserMatch: true, round: 'quarter' },
      { id: 'q2', p1: p3, p2: p4, score1: 0, score2: 1, winner: p4, isUserMatch: false, round: 'quarter' },
      { id: 'q3', p1: p5, p2: p6, score1: 1, score2: 0, winner: p5, isUserMatch: false, round: 'quarter' },
      { id: 'q4', p1: p7, p2: p8, score1: 1, score2: 0, winner: p7, isUserMatch: false, round: 'quarter' },
    ];
    setTourneyMatches(initial);
    setTourneyRound('quarter');
    setTourneyActive(true);
    triggerAudio('win');
    triggerReward(15, 'Lencana Selamat! Pendaftaran Turnamen Mingguan Berhasil. Biaya: 200 Koin. Kalahkan lawan-lawan tangguh untuk merajai podium!', 'success');
  };

  const cancelTournament = () => {
    setTourneyActive(false);
    setTourneyRound('quarter');
    triggerAudio('move');
  };

  const handlePlayTournamentMatch = (match: TourneyMatch) => {
    triggerAudio('move');
    
    // Choose simulation or real game mode selection
    const proceedWithMatchResult = (userWon: boolean) => {
      if (userWon) {
        // Advance round
        if (tourneyRound === 'quarter') {
          // Setup Semifinal matches
          const updated = tourneyMatches.map(m => {
            if (m.id === 'q1') {
              return { ...m, score1: 1, score2: 0, winner: username };
            }
            return m;
          });
          
          const q2Winner = updated.find(m => m.id === 'q2')?.winner || 'Slot_Kosong_Semi';
          const q3Winner = updated.find(m => m.id === 'q3')?.winner || 'Slot_Kosong_Semi';
          const q4Winner = updated.find(m => m.id === 'q4')?.winner || 'Slot_Kosong_Semi';

          const semis: TourneyMatch[] = [
            { id: 's1', p1: username, p2: q2Winner, score1: undefined, score2: undefined, winner: undefined, isUserMatch: true, round: 'semi' },
            { id: 's2', p1: q3Winner, p2: q4Winner, score1: q3Winner !== 'Slot_Kosong_Semi' && q4Winner !== 'Slot_Kosong_Semi' ? 1 : undefined, score2: q3Winner !== 'Slot_Kosong_Semi' && q4Winner !== 'Slot_Kosong_Semi' ? 0 : undefined, winner: q3Winner !== 'Slot_Kosong_Semi' && q4Winner !== 'Slot_Kosong_Semi' ? q3Winner : q4Winner, isUserMatch: false, round: 'semi' }
          ];

          setTourneyMatches([...updated, ...semis]);
          setTourneyRound('semi');
          triggerAudio('win');
          triggerReward(30, 'Kemenangan Brilian! Anda resmi melaju ke babak Semi Final Turnamen Catur Mingguan!', 'success');
        } else if (tourneyRound === 'semi') {
          // Setup Final matches
          const updated = tourneyMatches.map(m => {
            if (m.id === 's1') {
              return { ...m, score1: 1, score2: 0, winner: username };
            }
            return m;
          });

          const s2Winner = updated.find(m => m.id === 's2')?.winner || 'Slot_Kosong_Final';

          const finals: TourneyMatch[] = [
            { id: 'f1', p1: username, p2: s2Winner, score1: undefined, score2: undefined, winner: undefined, isUserMatch: true, round: 'final' }
          ];

          setTourneyMatches([...updated, ...finals]);
          setTourneyRound('final');
          triggerAudio('win');
          triggerReward(50, 'Pertarungan Sengit! Anda mengamankan kursi emas di babak Grand Final Turnamen!', 'success');
        } else if (tourneyRound === 'final') {
          // User wins Champion!
          const updated = tourneyMatches.map(m => {
            if (m.id === 'f1') {
              return { ...m, score1: 1, score2: 0, winner: username };
            }
            return m;
          });
          setTourneyMatches(updated);
          setTourneyRound('winner');
          
          // Grand Prizes
          setCoins(c => {
            const val = c + 500;
            localStorage.setItem('coins', String(val));
            return val;
          });
          setDiamonds(d => {
            const val = d + 15;
            localStorage.setItem('diamonds', String(val));
            return val;
          });
          setTourneyHistory(th => {
            const val = th + 1;
            localStorage.setItem('tourney_wins_count', String(val));
            return val;
          });

          triggerAudio('win');
          triggerReward(100, 'KAMPION UTAMA! Anda meledakkan grand final dan menjuarai Turnamen Mingguan Pal Mate: +500 Koin dan +15 Diamond!', 'level_up');
          
          // Increment hidden achievement checker
          triggerHiddenAchievement('ach_tourney_conqueror');
        }
      } else {
        // User lost match
        triggerAudio('lose');
        triggerReward(0, 'Sakitnya kekalahan! Anda tersingkir dari braket turnamen kali ini. Coba kembali di braket turnamen baru!', 'error');
        cancelTournament();
      }
    };

    // Ask user or simulate
    setCustomConfirm({
      show: true,
      title: "Pilih Mode Pertandingan",
      message: "Apakah Anda ingin melakukan Simulasi Cepat (instan berdasarkan ELO) atau bermain Tanding Klasik AI Nelson (Papan Interaktif)?",
      confirmText: "Simulasi Cepat",
      cancelText: "Tanding Klasik",
      onConfirm: () => {
        // Simulate by ELO probability
        const winPr = onlineRating / (onlineRating + 800); 
        const result = Math.random() < winPr;
        proceedWithMatchResult(result);
      },
      onCancel: () => {
        // Direct integration
        if (startAiGameWithTimerAndCasual) {
          startAiGameWithTimerAndCasual('nelson', 300, isCasualMatch);
          // Put simulated result for developer testing safety
          proceedWithMatchResult(true);
        } else {
          proceedWithMatchResult(true);
        }
      }
    });
  };

  // -------------------------------------------------------------------------
  // FEATURE 32: KLUB & GUILD STATES
  // -------------------------------------------------------------------------
  const [hasGuild, setHasGuild] = useState<boolean>(() => {
    const saved = localStorage.getItem('guild_has_owner');
    if (saved !== null) return saved === 'true';
    return false;
  });

  const [guildProfile, setGuildProfile] = useState<{
    name: string;
    description: string;
    tag: string;
    logo: string;
    frame: string;
    minRating: number;
    joinSystem: 'Bebas' | 'Persetujuan' | 'Undangan';
  }>(() => {
    try {
      const saved = localStorage.getItem('guild_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) return parsed;
      }
    } catch(e) {}
    return {
      name: 'Klub Pal Mate Mandiri',
      description: 'Markas para ksatria papan hitam putih taktis Indonesia! Tempat mabar santai tapi ber-bintang.',
      tag: 'Kompetitif',
      logo: 'perisai',
      frame: 'gold',
      minRating: 600,
      joinSystem: 'Bebas'
    };
  });

  // --- RECONSTRUCTED GUILD SUB-PAGE NAVIGATION ---
  const [guildSubPage, setGuildSubPage] = useState<'dashboard' | 'members' | 'activities'>('dashboard');
  const [activityDetail, setActivityDetail] = useState<'list' | 'fragments' | 'bonus' | 'war' | 'chat'>('list');
  const [clanCheckedIn, setClanCheckedIn] = useState<boolean>(() => {
    return localStorage.getItem('clan_checked_in') === 'true';
  });
  const [claimedWeeklyMilestones, setClaimedWeeklyMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('clan_weekly_milestones');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  // --- Inline Guild profile edit states ---
  const [isEditingGuild, setIsEditingGuild] = useState(false);
  const [editName, setEditName] = useState(guildProfile.name);
  const [editDesc, setEditDesc] = useState(guildProfile.description);
  const [editTag, setEditTag] = useState(guildProfile.tag);
  const [editLogo, setEditLogo] = useState(guildProfile.logo || 'perisai');
  const [editMinRating, setEditMinRating] = useState(guildProfile.minRating);
  const [editJoinSystem, setEditJoinSystem] = useState(guildProfile.joinSystem);

  const [guildMembers, setGuildMembers] = useState<Array<{ name: string; role: string; rating: number; status: string; contribution: number; level: number }>>(() => {
    const playerLevel = getLevelFromXP(xp);
    try {
      const saved = localStorage.getItem('guild_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => {
            const cleanMemberName = m.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
            const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
            const isMe = cleanMemberName === cleanUsername || m.name === username;
            return {
              ...m,
              contribution: m.contribution !== undefined ? m.contribution : 0,
              level: isMe ? playerLevel : (m.level !== undefined ? m.level : Math.floor((m.rating || 600) / 30) + 1)
            };
          });
        }
      }
    } catch(e) {}
    return [
      { name: username, role: 'Founder', rating: onlineRating, status: 'Online', contribution: 1250, level: playerLevel }
    ];
  });

  useEffect(() => {
    const playerLevel = getLevelFromXP(xp);
    const hasWrongLevel = guildMembers.some(m => {
      const cleanMemberName = m.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
      return (cleanMemberName === cleanUsername || m.name === username) && m.level !== playerLevel;
    });

    if (hasWrongLevel) {
      setGuildMembers(prev => prev.map(m => {
        const cleanMemberName = m.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
        const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
        if (cleanMemberName === cleanUsername || m.name === username) {
          return { ...m, level: playerLevel };
        }
        return m;
      }));
    }
  }, [xp, username]);

  const [guildJoinRequests, setGuildJoinRequests] = useState<Array<{ name: string; rating: number; role: string }>>(() => {
    try {
      const saved = localStorage.getItem('guild_join_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [guildLevel, setGuildLevel] = useState<number>(() => {
    return Number(localStorage.getItem('guild_lvl')) || 1;
  });

  const [guildTreasury, setGuildTreasury] = useState<number>(() => {
    return Number(localStorage.getItem('guild_treasury_gold')) || 250;
  });

  const [guildBlacklist, setGuildBlacklist] = useState<string[]>(() => {
    try {
      const bObj = localStorage.getItem('guild_blacklist_list');
      if (bObj) return JSON.parse(bObj);
    } catch (e) {}
    return [];
  });

  const [guildLogs, setGuildLogs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('guild_action_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      'Klub Catur didirikan secara resmi.',
      'Sistem donasi treasury dan sumbangan fragment diaktifkan.'
    ];
  });

  // Fragment sumbangan states
  const [requestedFragmentSkin, setRequestedFragmentSkin] = useState<string>(() => {
    return localStorage.getItem('requested_fragment_skin') || '';
  });
  const [hasActiveFragmentReq, setHasActiveFragmentReq] = useState<boolean>(() => {
    return localStorage.getItem('has_active_fragment_req') === 'true';
  });
  const [todayFragmentDonationCount, setTodayFragmentDonationCount] = useState<number>(() => {
    return Number(localStorage.getItem('today_fragment_donation_count')) || 0;
  });

  // FRAGMENT INVENTORY STATE
  const [myFragments, setMyFragments] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('my_fragment_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'Golden Knight': 2,
      'Retro 8-bit': 1,
      'Neon Skin': 0,
      'Cosmosis Nebula': 3
    };
  });

  useEffect(() => {
    localStorage.setItem('my_fragment_inventory', JSON.stringify(myFragments));
  }, [myFragments]);

  // DYNAMIC MEMBER FRAGMENT REQUESTS STATE
  interface FragmentRequestItem {
    id: string;
    name: string;
    skin: string;
    coinsVal: number;
    currentProgress: number;
    maxProgress: number;
  }

  const [fragmentRequests, setFragmentRequests] = useState<FragmentRequestItem[]>(() => {
    try {
      const saved = localStorage.getItem('guild_fragment_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('guild_fragment_requests', JSON.stringify(fragmentRequests));
  }, [fragmentRequests]);

  // Request help button cooldown (prevents gift/button spam)
  const [fragmentRequestCooldown, setFragmentRequestCooldown] = useState<number>(0);

  useEffect(() => {
    if (fragmentRequestCooldown > 0) {
      const t = setTimeout(() => setFragmentRequestCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [fragmentRequestCooldown]);

  const [guildChatMessages, setGuildChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>(() => {
    try {
      const saved = localStorage.getItem('guild_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('guild_chat_messages', JSON.stringify(guildChatMessages));
  }, [guildChatMessages]);

  // Guild War states & Minigame
  const [conqueredBoards, setConqueredBoards] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('conquered_boards_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [activeWarStage, setActiveWarStage] = useState<number | null>(null);
  const [conquestRates, setConquestRates] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [selectedPuzzlePiece, setSelectedPuzzlePiece] = useState<{ r: number; c: number } | null>(null);
  const [wrongPuzzleAttempt, setWrongPuzzleAttempt] = useState<boolean>(false);
  const [completedStageMessage, setCompletedStageMessage] = useState<string>('');

  useEffect(() => {
    if (hasGuild) {
      localStorage.setItem('guild_has_owner', 'true');
      localStorage.removeItem('guild_explicitly_left');
      localStorage.setItem('guild_profile_data', JSON.stringify(guildProfile));
      localStorage.setItem('guild_lvl', String(guildLevel));
      localStorage.setItem('guild_treasury_gold', String(guildTreasury));
      localStorage.setItem('guild_blacklist_list', JSON.stringify(guildBlacklist));
      localStorage.setItem('guild_action_history', JSON.stringify(guildLogs));
      localStorage.setItem('guild_members', JSON.stringify(guildMembers));
      localStorage.setItem('guild_join_requests', JSON.stringify(guildJoinRequests));
      localStorage.setItem('requested_fragment_skin', requestedFragmentSkin);
      localStorage.setItem('has_active_fragment_req', String(hasActiveFragmentReq));
      localStorage.setItem('today_fragment_donation_count', String(todayFragmentDonationCount));
      localStorage.setItem('conquered_boards_list', JSON.stringify(conqueredBoards));

      if (guildProfile?.name) {
        let ownerName = username || 'Ketua Klan';
        const activeUser = localStorage.getItem('user');
        if (activeUser) {
          try {
            const parsed = JSON.parse(activeUser);
            if (parsed && parsed.username) ownerName = parsed.username;
          } catch (_) {}
        }
        const totalElo = (guildMembers || []).reduce((sum: number, m: any) => sum + (m.rating || m.elo || 600), 0);
        fetch('/api/guilds/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guild: {
              id: (guildProfile as any).id || guildProfile.name,
              name: guildProfile.name,
              tag: guildProfile.tag || 'ELIT',
              leader: (guildProfile as any).leader || ownerName,
              ownerUsername: ownerName,
              level: guildLevel || 1,
              totalElo: totalElo || 1200,
              membersCount: (guildMembers || []).length || 1,
              maxMembers: 30,
              motto: (guildProfile as any).motto || guildProfile.description || 'Klan Catur Sejati',
              logo: guildProfile.logo || 'perisai'
            }
          })
        }).catch(() => {});
      }
    }
  }, [hasGuild, guildProfile, guildLevel, guildTreasury, guildBlacklist, guildLogs, guildMembers, guildJoinRequests, requestedFragmentSkin, hasActiveFragmentReq, todayFragmentDonationCount, conqueredBoards]);

  useEffect(() => {
    const savedHasOwner = localStorage.getItem('guild_has_owner');
    if (savedHasOwner === null) {
      setHasGuild(false);
      setGuildProfile({
        name: 'Klub Pal Mate Mandiri',
        description: 'Markas para ksatria papan hitam putih taktis Indonesia! Tempat mabar santai tapi ber-bintang.',
        tag: 'Kompetitif',
        logo: 'perisai',
        frame: 'gold',
        minRating: 600,
        joinSystem: 'Bebas'
      });
      const playerLevel = getLevelFromXP(xp);
      setGuildMembers([
        { name: username, role: 'Founder', rating: onlineRating, status: 'Online', contribution: 1250, level: playerLevel }
      ]);
      setGuildJoinRequests([]);
      setGuildLevel(1);
      setGuildTreasury(250);
      setGuildBlacklist([]);
      setGuildLogs([
        'Klub Catur didirikan secara resmi.',
        'Sistem donasi treasury dan sumbangan fragment diaktifkan.'
      ]);
      setRequestedFragmentSkin('');
      setHasActiveFragmentReq(false);
      setTodayFragmentDonationCount(0);
      setConqueredBoards([]);
    } else {
      setHasGuild(savedHasOwner === 'true');
      try {
        const pObj = localStorage.getItem('guild_profile_data');
        if (pObj) {
          const parsed = JSON.parse(pObj);
          if (parsed && typeof parsed === 'object' && parsed.name) {
            setGuildProfile(parsed);
          }
        }
      } catch (e) {}
      try {
        const mObj = localStorage.getItem('guild_members');
        if (mObj) setGuildMembers(JSON.parse(mObj));
      } catch (e) {}
      try {
        const rObj = localStorage.getItem('guild_join_requests');
        if (rObj) setGuildJoinRequests(JSON.parse(rObj));
      } catch (e) {}
      setGuildLevel(Number(localStorage.getItem('guild_lvl')) || 1);
      setGuildTreasury(Number(localStorage.getItem('guild_treasury_gold')) || 250);
      try {
        const bObj = localStorage.getItem('guild_blacklist_list');
        if (bObj) setGuildBlacklist(JSON.parse(bObj));
      } catch (e) {}
      try {
        const lObj = localStorage.getItem('guild_action_history');
        if (lObj) setGuildLogs(JSON.parse(lObj));
      } catch (e) {}
      setRequestedFragmentSkin(localStorage.getItem('requested_fragment_skin') || '');
      setHasActiveFragmentReq(localStorage.getItem('has_active_fragment_req') === 'true');
      setTodayFragmentDonationCount(Number(localStorage.getItem('today_fragment_donation_count')) || 0);
      try {
        const cObj = localStorage.getItem('conquered_boards_list');
        if (cObj) setConqueredBoards(JSON.parse(cObj));
      } catch (e) {}
    }

    const handleGuildStateUpdated = () => {
      const isOwner = localStorage.getItem('guild_has_owner') === 'true';
      setHasGuild(isOwner);
      if (isOwner) {
        try {
          const pObj = localStorage.getItem('guild_profile_data');
          if (pObj) {
            const parsed = JSON.parse(pObj);
            if (parsed && parsed.name) setGuildProfile(parsed);
          }
        } catch (e) {}
        try {
          const mObj = localStorage.getItem('guild_members');
          if (mObj) setGuildMembers(JSON.parse(mObj));
        } catch (e) {}
        const savedTreasury = localStorage.getItem('guild_treasury_gold');
        if (savedTreasury) setGuildTreasury(Number(savedTreasury));
      } else {
        setGuildMembers([]);
        setGuildTreasury(250);
      }
    };

    window.addEventListener('guild_state_updated', handleGuildStateUpdated);
    return () => {
      window.removeEventListener('guild_state_updated', handleGuildStateUpdated);
    };
  }, [username]);

  // Real-time polling for guild details & online member statuses
  useEffect(() => {
    if (!hasGuild || !guildProfile?.name) return;

    const syncRealtimeClanDetails = async () => {
      try {
        const activeUser = username || localStorage.getItem('username') || '';
        const res = await fetch(`/api/guilds/details?name=${encodeURIComponent(guildProfile.name)}&username=${encodeURIComponent(activeUser)}`);
        const data = await res.json();
        if (data.success && data.guild) {
          const g = data.guild;
          const updatedProf = {
            ...guildProfile,
            name: g.name || guildProfile.name,
            description: g.motto || g.description || guildProfile.description,
            tag: g.tag || guildProfile.tag,
            logo: g.logo || guildProfile.logo,
            minRating: g.minRating || guildProfile.minRating,
            joinSystem: g.joinSystem || guildProfile.joinSystem
          };
          setGuildProfile(updatedProf);
          localStorage.setItem('guild_profile_data', JSON.stringify(updatedProf));

          if (Array.isArray(g.members) && g.members.length > 0) {
            setGuildMembers(g.members);
            localStorage.setItem('guild_members', JSON.stringify(g.members));
          }
          if (g.level) {
            setGuildLevel(g.level);
            localStorage.setItem('guild_lvl', String(g.level));
          }
          if (g.treasury !== undefined) {
            const serverTreasury = Number(g.treasury);
            setGuildTreasury(serverTreasury);
            localStorage.setItem('guild_treasury_gold', String(serverTreasury));
          }
        } else if (res.status === 404) {
          // If server returned 404 (e.g. restart or cache miss), auto re-sync local guild to server
          if (guildProfile && guildProfile.name) {
            const activeUserStr = username || localStorage.getItem('username') || 'Member';
            const guildToSync = {
              id: guildProfile.name,
              name: guildProfile.name,
              motto: guildProfile.description,
              description: guildProfile.description,
              tag: guildProfile.tag,
              logo: guildProfile.logo,
              frame: guildProfile.frame || 'gold',
              minRating: guildProfile.minRating || 600,
              joinSystem: guildProfile.joinSystem || 'Bebas',
              leader: activeUserStr,
              ownerUsername: activeUserStr,
              level: guildLevel || 1,
              treasury: guildTreasury || 250,
              members: guildMembers && guildMembers.length > 0 ? guildMembers : [
                { name: activeUserStr, role: 'Founder', rating: onlineRating || 600, status: 'Online', contribution: 1250, level: Math.floor((onlineRating || 600) / 30) + 1 }
              ],
              membersCount: guildMembers?.length || 1,
              totalElo: onlineRating || 600
            };
            await fetch('/api/guilds/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guild: guildToSync })
            }).catch(() => {});
          }
        }
      } catch (err) {}
    };

    syncRealtimeClanDetails();
    const interval = setInterval(syncRealtimeClanDetails, 5000);
    return () => clearInterval(interval);
  }, [hasGuild, guildProfile?.name, username, guildLevel, guildTreasury, guildMembers, onlineRating]);

  // Guild Form State
  const [formName, setFormName] = useState('Klub Pal Mate Mandiri');
  const [formDesc, setFormDesc] = useState('Markas para ksatria papan hitam putih taktis Indonesia!');
  const [formTag, setFormTag] = useState('Kompetitif');
  const [formJoin, setFormJoin] = useState<'Bebas' | 'Persetujuan' | 'Undangan'>('Bebas');
  const [formMinRating, setFormMinRating] = useState(600);

  // --- JOIN & RECOMMENDATION CLAN STATES ---
  const [noGuildTab, setNoGuildTab] = useState<'search' | 'create'>('search');
  const [availableClans, setAvailableClans] = useState<any[]>([]);
  const [isFetchingClans, setIsFetchingClans] = useState<boolean>(false);
  const [clanSearchQuery, setClanSearchQuery] = useState<string>('');
  const [selectedClanFilterTag, setSelectedClanFilterTag] = useState<string>('Semua');
  const [joiningClanName, setJoiningClanName] = useState<string | null>(null);

  const fetchAvailableClans = () => {
    setIsFetchingClans(true);
    fetch('/api/guilds/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.guilds)) {
          setAvailableClans(data.guilds);
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingClans(false));
  };

  useEffect(() => {
    if (!hasGuild) {
      fetchAvailableClans();
    }
  }, [hasGuild, noGuildTab]);

  const handleJoinClan = async (clan: any) => {
    const userRating = onlineRating || 600;
    if (userRating < (clan.minRating || 0)) {
      triggerAudio('error');
      triggerReward(0, `Rating ELO Anda (${userRating}) belum memenuhi syarat minimal (${clan.minRating} ELO) klan ${clan.name}!`, 'error');
      return;
    }

    setJoiningClanName(clan.name);
    try {
      const activeUsername = username || localStorage.getItem('username') || 'Guest';
      const playerLevel = getLevelFromXP(xp);
      const res = await fetch('/api/guilds/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          guildName: clan.name,
          userRating: userRating,
          userLevel: playerLevel
        })
      });
      const data = await res.json();
      if (data.success && data.guild) {
        const g = data.guild;
        setHasGuild(true);
        const newProf = {
          name: g.name,
          description: g.motto || g.description || 'Klan Catur Sejati',
          tag: g.tag || 'ELIT',
          logo: g.logo || 'perisai',
          frame: 'gold',
          minRating: g.minRating || 600,
          joinSystem: g.joinSystem || 'Bebas'
        };
        setGuildProfile(newProf);
        const membersList = Array.isArray(data.members) && data.members.length > 0
          ? data.members
          : [
              { name: g.leader || 'Ketua Klan', role: 'Founder', rating: g.totalElo || 1200, status: 'Online', contribution: 1000, level: g.level || 1 },
              { name: activeUsername, role: 'Member', rating: userRating, status: 'Online', contribution: 100, level: playerLevel }
            ];
        setGuildMembers(membersList);
        setGuildLevel(g.level || 1);
        const joinTreasury = g.treasury !== undefined ? Number(g.treasury) : 250;
        setGuildTreasury(joinTreasury);
        const newLogs = [
          `Anda resmi bergabung dengan klan ${g.name}!`,
          'Sistem donasi treasury dan sumbangan fragment diaktifkan.'
        ];
        setGuildLogs(newLogs);

        // Persist to localStorage
        localStorage.setItem('guild_has_owner', 'true');
        localStorage.setItem('guild_profile_data', JSON.stringify(newProf));
        localStorage.setItem('guild_members', JSON.stringify(membersList));
        localStorage.setItem('guild_lvl', String(g.level || 1));
        localStorage.setItem('guild_treasury_gold', String(joinTreasury));
        localStorage.setItem('guild_action_history', JSON.stringify(newLogs));
        window.dispatchEvent(new Event('guild_state_updated'));

        triggerAudio('win');
        triggerReward(0, `Selamat! Anda berhasil bergabung dengan klan ${g.name}.`, 'level_up');
      } else {
        triggerAudio('error');
        triggerReward(0, data.error || 'Gagal bergabung dengan klan.', 'error');
      }
    } catch (err) {
      triggerAudio('error');
      triggerReward(0, 'Terjadi kesalahan koneksi ke server.', 'error');
    } finally {
      setJoiningClanName(null);
    }
  };

  const handleCreateGuild = async () => {
    if (coins < 2000) {
      triggerAudio('error');
      triggerReward(0, 'Koin Anda tidak cukup! Pembentukan Guild memerlukan investasi 2,000 Koin Tabungan.', 'info');
      return;
    }

    setCoins(c => {
      const next = c - 2000;
      localStorage.setItem('coins', String(next));
      return next;
    });

    const activeUserStr = username || localStorage.getItem('username') || 'Member';
    const playerRating = onlineRating || 600;
    const playerLevel = Math.floor(playerRating / 30) + 1;

    const newProfile = {
      name: formName,
      description: formDesc,
      tag: formTag,
      logo: 'perisai',
      frame: 'gold',
      minRating: formMinRating,
      joinSystem: formJoin
    };

    const initialMembers = [
      { name: activeUserStr, role: 'Founder', rating: playerRating, status: 'Online', contribution: 1250, level: playerLevel }
    ];

    setGuildProfile(newProfile);
    setGuildMembers(initialMembers);
    setGuildJoinRequests([]);
    setGuildLevel(1);
    setGuildTreasury(250);
    setHasGuild(true);

    const dateObj = new Date().toLocaleDateString('id-ID');
    const logs = [`Klub "${formName}" didirikan tanggal ${dateObj}`, ...guildLogs];
    setGuildLogs(logs);

    // Persist to localStorage
    localStorage.setItem('guild_has_owner', 'true');
    localStorage.setItem('guild_profile_data', JSON.stringify(newProfile));
    localStorage.setItem('guild_members', JSON.stringify(initialMembers));
    localStorage.setItem('guild_lvl', '1');
    localStorage.setItem('guild_treasury_gold', '250');
    localStorage.setItem('guild_action_history', JSON.stringify(logs));
    window.dispatchEvent(new Event('guild_state_updated'));

    // Sync to backend database
    try {
      await fetch('/api/guilds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild: {
            id: formName,
            name: formName,
            motto: formDesc,
            description: formDesc,
            tag: formTag,
            logo: 'perisai',
            frame: 'gold',
            minRating: formMinRating,
            joinSystem: formJoin,
            leader: activeUserStr,
            ownerUsername: activeUserStr,
            level: 1,
            treasury: 250,
            members: initialMembers,
            membersCount: 1,
            totalElo: playerRating
          }
        })
      });
    } catch (err) {}

    triggerAudio('win');
    triggerReward(100, `Spesial Selamat! Klub Catur "${formName}" Berhasil Didirikan sebesar 2,000 Koin! Kelola klan catur Anda sekarang.`, 'level_up');
  };

  const handleGuildDonate = async (amount: number) => {
    const numAmt = Math.floor(Number(amount));
    if (isNaN(numAmt) || numAmt <= 0) {
      triggerAudio('error');
      triggerReward(0, 'Masukkan jumlah koin donasi yang valid!', 'info');
      return;
    }
    if (coins < numAmt) {
      triggerAudio('error');
      triggerReward(0, 'Koin Anda tidak mencukupi untuk sumbangan ini!', 'info');
      return;
    }

    const nextCoins = Math.max(0, coins - numAmt);
    setCoins(nextCoins);
    localStorage.setItem('coins', String(nextCoins));

    const nextTreasury = (Number(guildTreasury) || 0) + numAmt;
    setGuildTreasury(nextTreasury);
    localStorage.setItem('guild_treasury_gold', String(nextTreasury));

    const calcLevel = Math.max(1, Math.floor(nextTreasury / 1200) + 1);
    if (calcLevel > guildLevel) {
      setGuildLevel(calcLevel);
      localStorage.setItem('guild_lvl', String(calcLevel));
      triggerReward(50, `MAKSIMAL! Level Klub Catur meningkat ke LEVEL ${calcLevel}! Anggota baru kini bertambah.`, 'level_up');
    }

    const activeUserStr = username || 'Anggota';
    const cleanUser = activeUserStr.trim().toLowerCase();
    let found = false;
    const updatedMembers = (guildMembers || []).map(m => {
      if (m && m.name && m.name.trim().toLowerCase() === cleanUser) {
        found = true;
        return { ...m, contribution: (Number(m.contribution) || 0) + numAmt };
      }
      return m;
    });

    if (!found) {
      updatedMembers.unshift({
        name: activeUserStr,
        role: 'Founder',
        rating: onlineRating || 600,
        status: 'Online',
        contribution: numAmt,
        level: Math.floor((onlineRating || 600) / 30) + 1
      });
    }

    setGuildMembers(updatedMembers);
    localStorage.setItem('guild_members', JSON.stringify(updatedMembers));

    const logMsg = `Anggota ${activeUserStr} berkontribusi +${numAmt} Coin ke brankas klan.`;
    const logs = [logMsg, ...(guildLogs || [])];
    setGuildLogs(logs);
    localStorage.setItem('guild_action_history', JSON.stringify(logs));

    if (numAmt >= 500) {
      try {
        triggerHiddenAchievement('ach_treasury_lord');
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/guilds/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUserStr,
          guildName: guildProfile?.name || 'Klub Pal Mate Mandiri',
          amount: numAmt
        })
      });
      const data = await res.json();
      if (data && data.success && data.treasury !== undefined) {
        const sTreasury = Number(data.treasury);
        setGuildTreasury(sTreasury);
        localStorage.setItem('guild_treasury_gold', String(sTreasury));
        if (data.level) {
          setGuildLevel(Number(data.level));
          localStorage.setItem('guild_lvl', String(data.level));
        }
        if (Array.isArray(data.members)) {
          setGuildMembers(data.members);
          localStorage.setItem('guild_members', JSON.stringify(data.members));
        }
      }
    } catch (e) {}

    setTimeout(() => {
      window.dispatchEvent(new Event('guild_state_updated'));
    }, 0);

    triggerAudio('win');
    triggerReward(15, `Terimakasih! Sumbangan +${numAmt} Koin berhasil disalurkan ke Treasury Klub (+${numAmt} Poin Suku)!`, 'success');
  };

  const handleGuildWithdraw = async (amount: number) => {
    const numAmt = Math.floor(Number(amount));
    if (isNaN(numAmt) || numAmt <= 0) {
      triggerAudio('error');
      triggerReward(0, 'Masukkan jumlah koin yang valid untuk penarikan!', 'info');
      return;
    }
    const currentTreasury = Number(guildTreasury) || 0;
    if (currentTreasury < numAmt) {
      triggerAudio('error');
      triggerReward(0, 'Saldo koin di Brankas Klan tidak mencukupi untuk pencairan ini!', 'info');
      return;
    }

    const nextTreasury = Math.max(0, currentTreasury - numAmt);
    const nextCoins = coins + numAmt;
    const calcLevel = Math.max(1, Math.floor(nextTreasury / 1200) + 1);

    setGuildTreasury(nextTreasury);
    localStorage.setItem('guild_treasury_gold', String(nextTreasury));

    setCoins(nextCoins);
    localStorage.setItem('coins', String(nextCoins));

    if (calcLevel !== guildLevel) {
      setGuildLevel(calcLevel);
      localStorage.setItem('guild_lvl', String(calcLevel));
    }

    const activeUserStr = username || 'Anggota';
    const logMsg = `Anggota ${activeUserStr} mencairkan ${numAmt} Coin dari brankas klan.`;
    const logs = [logMsg, ...(guildLogs || [])];
    setGuildLogs(logs);
    localStorage.setItem('guild_action_history', JSON.stringify(logs));

    try {
      const res = await fetch('/api/guilds/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUserStr,
          guildName: guildProfile?.name || 'Klub Pal Mate Mandiri',
          amount: numAmt
        })
      });
      const data = await res.json();
      if (data && data.success && data.treasury !== undefined) {
        const sTreasury = Number(data.treasury);
        setGuildTreasury(sTreasury);
        localStorage.setItem('guild_treasury_gold', String(sTreasury));
        if (data.level) {
          setGuildLevel(Number(data.level));
          localStorage.setItem('guild_lvl', String(data.level));
        }
      }
    } catch (e) {}

    setTimeout(() => {
      window.dispatchEvent(new Event('guild_state_updated'));
    }, 0);

    triggerAudio('win');
    triggerReward(10, `Sukses! Berhasil mencairkan +${numAmt} Koin dari Brankas Klan ke dompet Anda!`, 'success');
  };

  const handleTransferOwnership = () => {
    const updatedMembers = guildMembers.map(m => {
      if (m.name === username) return { ...m, role: 'Co-Leader' };
      if (m.name === 'Isna Caturia') return { ...m, role: 'Founder' };
      return m;
    });
    setGuildMembers(updatedMembers);
    
    const logs = ['Kepemilikan klan dialihkan kepada Isna Caturia.', ...guildLogs];
    setGuildLogs(logs);

    triggerAudio('move');
    triggerReward(0, 'Kepemilikan klan berhasil beralih. Anda kini berperan sebagai Co-Leader klan!', 'info');
  };

  const handleKickAndBlacklist = (memberName: string) => {
    if (memberName === username) return;
    setGuildMembers(prev => prev.filter(m => m.name !== memberName));
    setGuildBlacklist(b => {
      const next = [...b, `${memberName} (Dikeluarkan pada ${new Date().toLocaleTimeString()})`];
      return next;
    });
    
    const logs = [`${memberName} di-blacklist secara konstan oleh pimpinan.`, ...guildLogs];
    setGuildLogs(logs);

    triggerAudio('lose');
    triggerReward(0, `${memberName} didepak keluar dan dilarang mendaftar kembali ke klub!`, 'error');
  };

  const handleRemoveFromBlacklist = (blacked: string) => {
    setGuildBlacklist(prev => prev.filter(b => b !== blacked));
    triggerAudio('move');
    triggerReward(0, `Status cekal diangkat untuk pemain terpilih.`, 'success_no_xp');
  };

  const handleRequestFragment = (skinType: string) => {
    setRequestedFragmentSkin(skinType);
    setHasActiveFragmentReq(true);
    triggerAudio('move');
    triggerReward(10, `Pemberitahuan bantuan dikirim ke klan: Meminta kepingan Fragment Skin ${skinType.toUpperCase()}!`, 'success');

    // Simulate co-members donating after short time
    setTimeout(() => {
      setTodayFragmentDonationCount(p => Math.min(5, p + 2));
      triggerAudio('win');
      triggerReward(0, `Isna Caturia dan Naufal_Catur mengirimkan +2 Fragment Skin ${skinType.toUpperCase()} untuk tabungan Anda!`, 'success_no_xp');
      
      // Add thank you message
      setGuildChatMessages(prev => [
        ...prev,
        { sender: username, text: `Terimakasih banyak @Isna Caturia @Naufal_Catur atas donasinya, top sekali kawan.`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 4500);
  };

  // -------------------------------------------------------------------------
  // FEATURE 33: FORUM / FEED CHESS ANALYSIS
  // -------------------------------------------------------------------------
  const [chessPosts, setChessPosts] = useState<Array<{
    id: string;
    author: string;
    lvl: number;
    title: string;
    category: 'Analisa Match' | 'Pembukaan Catur' | 'Tips Taktik';
    content: string;
    likes: number;
    hasLiked?: boolean;
    comments: Array<{ user: string; text: string }>;
    frameId?: string;
    avatar?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('chess_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            id: p.id || `p-${Date.now()}-${Math.random()}`,
            author: p.author || 'Pecatur',
            lvl: typeof p.lvl === 'number' ? p.lvl : 1,
            title: p.title || 'Tanpa Judul',
            category: p.category || 'Analisa Match',
            content: p.content || '',
            likes: typeof p.likes === 'number' && !isNaN(p.likes) ? p.likes : 0,
            hasLiked: !!p.hasLiked,
            comments: Array.isArray(p.comments) ? p.comments.map((c: any) => ({
              user: c?.user || 'Guest',
              text: c?.text || ''
            })) : [],
            frameId: p.frameId || 'none',
            avatar: p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
          }));
        }
      }
    } catch (e) {}
    return [
      {
        id: 'p-default-1',
        author: 'Isna Caturia',
        lvl: 34,
        title: 'Pembukaan Ruy Lopez - Varian Marshall Attack',
        category: 'Pembukaan Catur',
        content: 'Bagi teman-teman yang bermain hitam, Marshall Attack adalah senjata taktis luar biasa untuk melawan Ruy Lopez. Setelah 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d5! Kita mengorbankan bidak d5 untuk mendapatkan inisiatif serangan yang luar biasa di sayap raja. Bagaimana tanggapan kalian?',
        likes: 18,
        hasLiked: false,
        comments: [],
        frameId: 'gold',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150'
      },
      {
        id: 'p-default-2',
        author: 'Naufal_Catur',
        lvl: 28,
        title: 'Tips Taktik: Garpu Kuda di Petak c2/c7',
        category: 'Tips Taktik',
        content: 'Selalu awasi petak c2 (untuk putih) dan c7 (untuk hitam). Seringkali pemula lupa melindunginya sehingga terkena garpu dari kuda lawan yang mengancam Raja dan Benteng sekaligus. Cara terbaik melindunginya adalah dengan menempatkan menteri atau perwira ringan secara aktif.',
        likes: 12,
        hasLiked: false,
        comments: [],
        frameId: 'cyber',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150'
      }
    ];
  });

  useEffect(() => {
    try {
      if (!Array.isArray(chessPosts)) return;
      const sanitized = chessPosts.slice(0, 30).map((p: any) => ({
        ...p,
        avatar: (p?.avatar && p.avatar.length > 500)
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
          : (p?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150')
      }));
      localStorage.setItem('chess_posts', JSON.stringify(sanitized));
    } catch (e) {
      try {
        const slim = (Array.isArray(chessPosts) ? chessPosts : []).slice(0, 10).map((p: any) => ({
          ...p,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
          content: (p?.content || '').slice(0, 500)
        }));
        localStorage.setItem('chess_posts', JSON.stringify(slim));
      } catch (err2) {
        // Fail silently if localStorage is completely full, app remains responsive
      }
    }
  }, [chessPosts]);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCat, setNewPostCat] = useState<'Analisa Match' | 'Pembukaan Catur' | 'Tips Taktik'>('Analisa Match');
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanTitle = (newPostTitle || '').trim();
      const cleanContent = (newPostContent || '').trim();
      if (!cleanTitle || !cleanContent) {
        triggerAudio('error');
        triggerReward(0, 'Judul dan Deskripsi strategi/taktik wajib diisi!', 'info');
        return;
      }

      if (cleanTitle.length > 150) {
        triggerAudio('error');
        triggerReward(0, 'Judul terlalu panjang (maksimal 150 karakter)', 'info');
        return;
      }

      if (cleanContent.length > 3000) {
        triggerAudio('error');
        triggerReward(0, 'Deskripsi postingan terlalu panjang (maksimal 3000 karakter)', 'info');
        return;
      }

      // Load active frame/avatar to save
      let activeFrame = 'none';
      let activeAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150';
      try {
        const savedU = localStorage.getItem('user');
        if (savedU) {
          const parsed = JSON.parse(savedU);
          activeFrame = parsed.selectedFrame || 'none';
          activeAvatar = parsed.profileAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150';
        } else {
          activeFrame = localStorage.getItem('selectedFrame') || 'none';
          activeAvatar = localStorage.getItem('guestAvatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150';
        }
      } catch (err) {}

      const safeAvatar = (activeAvatar && activeAvatar.length > 500)
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
        : activeAvatar;

      const newPost = {
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        author: username || 'Pecatur',
        lvl: typeof xp === 'number' ? getLevelFromXP(xp) : 1,
        title: cleanTitle,
        category: newPostCat || 'Analisa Match',
        content: cleanContent,
        likes: 0,
        hasLiked: false,
        comments: [],
        frameId: activeFrame,
        avatar: safeAvatar
      };

      setChessPosts(prev => [newPost, ...(Array.isArray(prev) ? prev : [])]);
      setNewPostTitle('');
      setNewPostContent('');
      triggerAudio('win');
      triggerReward(25, 'Catatan Kontribusi Forum Cemerlang! Postingan strategi catur diunggah. Dapatkan feedback dari master yang lain!', 'success');
    } catch (err) {
      console.error("Error creating post:", err);
      triggerAudio('error');
      triggerReward(0, 'Terjadi kesalahan saat mempublikasikan postingan. Silakan coba lagi!', 'error');
    }
  };

  const handleLikePost = (postId: string) => {
    let isNowLiked = false;
    let targetPostAuthor = '';

    setChessPosts(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const updatedList = list.map(p => {
        if (p.id === postId) {
          const currentlyLiked = !!p.hasLiked;
          const currentLikes = typeof p.likes === 'number' && !isNaN(p.likes) ? p.likes : 0;
          const nextLiked = !currentlyLiked;
          const nextLikesCount = nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
          
          isNowLiked = nextLiked;
          targetPostAuthor = p.author || '';

          return {
            ...p,
            likes: nextLikesCount,
            hasLiked: nextLiked
          };
        }
        return p;
      });

      try {
        localStorage.setItem('chess_posts', JSON.stringify(updatedList));
      } catch (e) {}

      return updatedList;
    });

    // Update profile likes count if liking own post or syncing stats
    try {
      const savedU = localStorage.getItem('user');
      let userObj = savedU ? JSON.parse(savedU) : null;
      
      if (userObj) {
        // If user liked a post authored by themselves or general forum activity
        const currentLikes = typeof userObj.likesCount === 'number' ? userObj.likesCount : 0;
        const newLikes = isNowLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        userObj = { ...userObj, likesCount: newLikes };
        localStorage.setItem('user', JSON.stringify(userObj));
        const uScope = userObj.username.trim().toLowerCase();
        localStorage.setItem(`likesCount:${uScope}`, String(newLikes));
        localStorage.setItem('likesCount', String(newLikes));
        window.dispatchEvent(new Event('user_updated'));

        // Sync with backend without toggling profile likedBy array
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userObj.username, likesCount: newLikes })
        }).catch(() => {});
      } else {
        const savedLikes = Number(localStorage.getItem('guest_profile_likes') || '0');
        const nextGuestLikes = isNowLiked ? savedLikes + 1 : Math.max(0, savedLikes - 1);
        localStorage.setItem('guest_profile_likes', String(nextGuestLikes));
        window.dispatchEvent(new Event('user_updated'));
      }
    } catch (err) {}

    triggerAudio('move');
  };

  // -------------------------------------------------------------------------
  // FEATURE 36: HIDDEN ACHIEVEMENTS STATES
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // FEATURE 37: STATISTICS ELO TIMELINE CHART (SVG BASED FULL FIDELITY)
  // -------------------------------------------------------------------------
  const ratingHistoryPoints = [400, 420, 480, 460, 510, 540, 530, onlineRating];

  // -------------------------------------------------------------------------
  // FEATURE 39: GIFT FRIEND SOCIAL & AFFINITY SYSTEM (NO EMOJIS IN UI)
  // -------------------------------------------------------------------------
  const [giftTargetUser, setGiftTargetUser] = useState('');
  const [selectedGiftId, setSelectedGiftId] = useState<'coffee' | 'book' | 'crystal' | 'crown'>('coffee');
  const [giftMsgCustom, setGiftMsgCustom] = useState('Tetap semangat mengasah otak kawan!');

  useEffect(() => {
    if (!giftTargetUser) {
      if (friendsList && friendsList.length > 0) {
        setGiftTargetUser(friendsList[0].username || friendsList[0].name || '');
      } else if (realPlayers && realPlayers.length > 0) {
        setGiftTargetUser(realPlayers[0].name || '');
      }
    }
  }, [friendsList, realPlayers]);

  const [friendAffinities, setFriendAffinities] = useState<{ [key: string]: { points: number; level: number } }>(() => {
    try {
      const saved = localStorage.getItem('friend_affinities');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'Isna Caturia': { points: 280, level: 3 },
      'Rizky Hidayat': { points: 120, level: 2 },
      'Siti Caturia': { points: 60, level: 1 },
      'Dewi Saraswati': { points: 15, level: 1 }
    };
  });

  interface ReceivedGift {
    id: string;
    from: string;
    giftName: string;
    msg: string;
    isPremium: boolean;
    cashValueCoins: number;
    cashValueDiamonds: number;
    affinityPoints: number;
  }

  // receivedGifts and setReceivedGifts are now passed as props from parent App.tsx to enable total sync!

  const handleSendGift = () => {
    const giftProps = {
      coffee: { name: 'Paket Kopi Hangat', costType: 'coins', cost: 50, points: 50, isPremium: false },
      book: { name: 'Buku Taktik Catur', costType: 'coins', cost: 120, points: 120, isPremium: false },
      crystal: { name: 'Piala Kristal Master', costType: 'diamonds', cost: 15, points: 400, isPremium: true },
      crown: { name: 'Mahkota Emas Elite', costType: 'diamonds', cost: 35, points: 1000, isPremium: true }
    };

    const gift = giftProps[selectedGiftId];
    if (!gift) return;

    if (gift.costType === 'coins') {
      if (coins < gift.cost) {
        triggerAudio('error');
        triggerReward(0, 'Koin Anda tidak mencukupi untuk melakukan Gifting ini!', 'info');
        return;
      }
      setCoins(c => {
        const next = c - gift.cost;
        localStorage.setItem('coins', String(next));
        return next;
      });
    } else {
      if (diamonds < gift.cost) {
        triggerAudio('error');
        triggerReward(0, 'Diamond Anda tidak mencukupi untuk melakukan Gifting ini!', 'info');
        return;
      }
      setDiamonds(d => {
        const next = d - gift.cost;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
    }

    // Apply Affinity tracking
    setFriendAffinities(prev => {
      const current = prev[giftTargetUser] || { points: 0, level: 1 };
      const nextPoints = current.points + gift.points;
      
      let newLevel = current.level;
      let req = newLevel * 100;
      let leveledUp = false;
      while (nextPoints >= req) {
        newLevel += 1;
        req = newLevel * 100;
        leveledUp = true;
      }

      if (leveledUp) {
        triggerAudio('win');
        triggerReward(50, `Tingkat afinitas Anda dengan ${giftTargetUser} meningkat ke Level ${newLevel}! Benefit baru terbuka!`, 'level_up');
        
        if (newLevel === 2) {
          try {
            const unlocked = JSON.parse(localStorage.getItem('unlockedFrames') || '[]');
            if (!unlocked.includes('magma')) unlocked.push('magma');
            localStorage.setItem('unlockedFrames', JSON.stringify(unlocked));
            localStorage.setItem('unlockedFrames:' + username.trim().toLowerCase(), JSON.stringify(unlocked));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}
        } else if (newLevel === 3) {
          setCoins(c => {
            const next = c + 150;
            localStorage.setItem('coins', String(next));
            return next;
          });
        }
      }

      const updated = {
        ...prev,
        [giftTargetUser]: { points: nextPoints, level: newLevel }
      };
      localStorage.setItem('friend_affinities', JSON.stringify(updated));
      return updated;
    });

    triggerAudio('win');
    triggerReward(20, `Sukses Terkirim! Bingkisan ${gift.name} berhasil diserahkan kepada ${giftTargetUser}. Poin afinitas +${gift.points}!`, 'success');

    if (giftTargetUser !== username) {
      triggerHiddenAchievement('ach_spammer');
    }
  };

  const handleCashOutGift = (gift: ReceivedGift, cashType: 'coins' | 'diamonds') => {
    if (cashType === 'coins') {
      const rewardAmt = gift.cashValueCoins > 0 ? gift.cashValueCoins : 50;
      setCoins(c => {
        const next = c + rewardAmt;
        localStorage.setItem('coins', String(next));
        return next;
      });
      triggerReward(0, `Berhasil mencairkan ${gift.giftName} dari ${gift.from} menjadi +${rewardAmt} Koin ke tabungan Anda!`, 'success_no_xp');
    } else {
      const rewardAmt = gift.cashValueDiamonds > 0 ? gift.cashValueDiamonds : 3;
      setDiamonds(d => {
        const next = d + rewardAmt;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
      triggerReward(0, `Berhasil mencairkan ${gift.giftName} dari ${gift.from} menjadi +${rewardAmt} Diamond ke saldo Anda!`, 'success_no_xp');
    }

    setReceivedGifts(prev => {
      const next = prev.filter(g => g.id !== gift.id);
      localStorage.setItem('received_gifts', JSON.stringify(next));
      return next;
    });
    triggerAudio('win');
  };

  const handleOpenOrdinaryGift = (gift: ReceivedGift) => {
    setFriendAffinities(prev => {
      const current = prev[gift.from] || { points: 0, level: 1 };
      const nextPoints = current.points + gift.affinityPoints;
      let newLevel = current.level;
      let req = newLevel * 100;
      while (nextPoints >= req) {
        newLevel += 1;
        req = newLevel * 100;
      }
      const updated = {
        ...prev,
        [gift.from]: { points: nextPoints, level: newLevel }
      };
      localStorage.setItem('friend_affinities', JSON.stringify(updated));
      return updated;
    });

    setCoins(c => {
      const next = c + 40;
      localStorage.setItem('coins', String(next));
      return next;
    });

    setReceivedGifts(prev => {
      const next = prev.filter(g => g.id !== gift.id);
      localStorage.setItem('received_gifts', JSON.stringify(next));
      return next;
    });

    triggerAudio('win');
    triggerReward(15, `Berhasil membuka ${gift.giftName}! Afinitas dengan ${gift.from} bertambah +${gift.affinityPoints} poin dan koin +40!`);
  };

  // -------------------------------------------------------------------------
  // FEATURE 40: FRIDAY FLASH SALE WITH PERSONALIZED UNIQUE DAILY ITEMS
  // -------------------------------------------------------------------------
  const [forceFriday, setForceFriday] = useState(true);
  const isCurrentlyFriday = new Date().getDay() === 5 || forceFriday;

  interface FlashSaleItem {
    id: string;
    name: string;
    originalCost: number;
    discountedCost: number;
    currency: 'coins' | 'diamonds';
    rewardType: 'xp' | 'frame_magma' | 'frame_cosmic' | 'board_ice' | 'piece_royal' | 'diamond_sack' | 'gold_heavy' | 'title_gm';
    desc: string;
  }

  const [flashDeals, setFlashDeals] = useState<FlashSaleItem[]>(() => {
    try {
      const saved = localStorage.getItem('personalized_flash_deals');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const pool: FlashSaleItem[] = [
      { id: 'fs_xp', name: 'Paket Bundling Stamina dan XP', originalCost: 350, discountedCost: 99, currency: 'coins', rewardType: 'xp', desc: 'Isi Paket: +150 XP instan untuk mempercepat kenaikan level catur.' },
      { id: 'fs_magma', name: 'Bingkai Merah Lava Vulkanik', originalCost: 600, discountedCost: 199, currency: 'coins', rewardType: 'frame_magma', desc: 'Bingkai profile magma oranye mengkilap khusus.' },
      { id: 'fs_cosmic', name: 'Bingkai Nebula Kosmik Galactic', originalCost: 800, discountedCost: 240, currency: 'coins', rewardType: 'frame_cosmic', desc: 'Bingkai profile luar angkasa nebula bersinar terang.' },
      { id: 'fs_ice', name: 'Desain Papan Es Beku Antartika', originalCost: 500, discountedCost: 150, currency: 'coins', rewardType: 'board_ice', desc: 'Skin arena papan catur selembut salju musim dingin.' },
      { id: 'fs_royal', name: 'Tampilan Bidak Ksatria Kerajaan', originalCost: 600, discountedCost: 180, currency: 'coins', rewardType: 'piece_royal', desc: 'Desain bidak catur beraliansi bangsawan klasik berlapis emas.' },
      { id: 'fs_sack', name: 'Kantung Hasil Pekan Diamond', originalCost: 150, discountedCost: 45, currency: 'diamonds', rewardType: 'diamond_sack', desc: 'Bypass brankas untuk mencairkan +50 Koin tambahan secara gratis!' },
      { id: 'fs_gold', name: 'Brankas Koin Kemakmuran Jumat', originalCost: 100, discountedCost: 30, currency: 'diamonds', rewardType: 'gold_heavy', desc: 'Buka brankas koin darurat: Dapatkan +1200 Koin Tabunan instan!' },
      { id: 'fs_gm', name: 'Piala Kejuaraan Grandmaster', originalCost: 120, discountedCost: 35, currency: 'diamonds', rewardType: 'title_gm', desc: 'Sematkan piala kehormatan "Grandmaster" permanen pada kartu profil!' }
    ];

    const seed = (username || 'User').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...pool].sort((a, b) => {
      const ra = Math.sin(seed + a.name.charCodeAt(0)) * 1000;
      const rb = Math.sin(seed + b.name.charCodeAt(0)) * 1000;
      return (ra - Math.floor(ra)) - (rb - Math.floor(rb));
    });

    const selected = shuffled.slice(0, 3);
    localStorage.setItem('personalized_flash_deals', JSON.stringify(selected));
    return selected;
  });

  const handleBuyFlashItem = (deal: FlashSaleItem) => {
    if (deal.currency === 'coins') {
      if (coins < deal.discountedCost) {
        triggerAudio('error');
        triggerReward(0, 'Koin Anda tidak cukup untuk promo Friday Flash Sale ini!', 'info');
        return;
      }
      setCoins(coins - deal.discountedCost);
    } else {
      if (diamonds < deal.discountedCost) {
        triggerAudio('error');
        triggerReward(0, 'Diamond Anda tidak cukup untuk promo Friday Flash Sale ini!', 'info');
        return;
      }
      setDiamonds(diamonds - deal.discountedCost);
    }

    if (deal.rewardType === 'xp') {
      setXp(x => x + 150);
      triggerReward(150, 'Pembelian Berhasil! Anda mendapat +150 XP tambahan!', 'success');
    } else if (deal.rewardType === 'frame_magma' || deal.rewardType === 'frame_cosmic') {
      const frameId = deal.rewardType === 'frame_magma' ? 'magma' : 'cosmic';
      setUnlockedFrames(prev => {
        const next = prev.includes(frameId) ? prev : [...prev, frameId];
        localStorage.setItem('unlockedFrames', JSON.stringify(next));
        localStorage.setItem('unlockedFrames:' + username.trim().toLowerCase(), JSON.stringify(next));
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          try {
            const userObj = JSON.parse(userRaw);
            userObj.unlockedFrames = next;
            localStorage.setItem('user', JSON.stringify(userObj));
          } catch (e) {}
        }
        return next;
      });
      triggerReward(0, `Pembelian Berhasil! Bingkai "${frameId === 'magma' ? 'Lava Vulkanik' : 'Nebula Kosmik'}" berhasil dibeli! Silakan cek di profil Anda.`, 'success_no_xp');
    } else if (deal.rewardType === 'board_ice') {
      setUnlockedThemes(prev => {
        const next = prev.includes('ice') ? prev : [...prev, 'ice'];
        localStorage.setItem('unlockedThemes', JSON.stringify(next));
        return next;
      });
      triggerReward(0, 'Pembelian Berhasil! Tema papan "Es Antartika" berhasil dipasang di menu pengaturan papan!', 'success_no_xp');
    } else if (deal.rewardType === 'piece_royal') {
      setUnlockedSkins(prev => {
        const next = prev.includes('royal') ? prev : [...prev, 'royal'];
        localStorage.setItem('unlockedSkins', JSON.stringify(next));
        localStorage.setItem('unlockedSkins:' + username.trim().toLowerCase(), JSON.stringify(next));
        return next;
      });
      triggerReward(0, 'Pembelian Berhasil! Tampilan bidak kustom "Ksatria Kerajaan" berhasil dibuka!', 'success_no_xp');
    } else if (deal.rewardType === 'diamond_sack') {
      if (setDiamondSavings) {
        setDiamondSavings(prev => {
          const next = prev + 50;
          return next > 150 ? 150 : next;
        });
        triggerReward(0, 'Tarik Berhasil! Karung Diamond dibuka, +50 Diamond berhasil dipindahkan ke Tabungan!', 'success_no_xp');
      } else {
        setDiamonds(d => d + 50);
        triggerReward(0, 'Tarik Berhasil! Karung Diamond dibuka, +50 Diamond berhasil masuk ke saldo!', 'success_no_xp');
      }
    } else if (deal.rewardType === 'gold_heavy') {
      setCoins(c => c + 1200);
      triggerReward(0, 'Penarikan Koin sukses! +1200 Koin Tabunan berhasil ditambahkan.', 'success_no_xp');
    } else if (deal.rewardType === 'title_gm') {
      try {
        const titles = JSON.parse(localStorage.getItem('unlockedTitles') || '[]');
        if (!titles.includes('Grandmaster')) titles.push('Grandmaster');
        localStorage.setItem('unlockedTitles', JSON.stringify(titles));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      triggerReward(0, 'Pembelian Berhasil! Status elit "Grandmaster" Anda sekarang aktif!', 'success_no_xp');
    }

    const nextDeals = flashDeals.filter(d => d.id !== deal.id);
    setFlashDeals(nextDeals);
    localStorage.setItem('personalized_flash_deals', JSON.stringify(nextDeals));
    triggerAudio('win');
  };

  return (
    <div className="space-y-8 pb-10">
      
      {!hideTabsSelector && (
        <>
          {/* Main Feature Menu Navigation Tabs */}
          <div className="flex border-b border-[#3c3934] overflow-x-auto scroller-hidden gap-1.5">
            {[
              { id: 'guild', label: prefLang === 'en' ? 'Club Arena' : 'Arena Klub', desc: prefLang === 'en' ? 'Community & War' : 'Komunitas & War', Icon: Shield },
              { id: 'tournament', label: prefLang === 'en' ? 'Tournament' : 'Turnamen', desc: prefLang === 'en' ? 'Weekly League Bracket' : 'Braket Liga Mingguan', Icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); triggerAudio('move'); }}
                className={`px-5 py-3 text-left border-b-2 transition-all cursor-pointer min-w-[9.5rem] flex-1 ${
                  activeTab === tab.id 
                    ? 'border-[#81b64c] bg-stone-900/10 text-white' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-stone-900/5'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide mb-0.5">
                  <tab.Icon className="w-4 h-4 text-[#81b64c]" />
                  {tab.label}
                </span>
                <span className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">{tab.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {/* =========================================================================
            TAB: GUILD / KLUB (FEATURE 32)
            ========================================================================= */}
        {activeTab === 'guild' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {!hasGuild ? (
              // BUILD NO GUILD INITIAL DISPLAY WITH DUAL MODE (JOIN/RECOMMENDED vs CREATE)
              <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-6">
                <div className="text-center max-w-lg mx-auto py-2 space-y-3">
                  <div className="w-16 h-16 bg-[#262421] border border-[#3c3934] text-yellow-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Gabung / Dirikan Klub Catur Elit!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Klub Catur mendatangkan relasi, Fragment skin, bonus XP, obrolan tim interaktif, 
                    serta turnamen eksklusif antar guild catur (Perang Klan/Guild War) mingguan!
                  </p>
                </div>

                {/* Segmented Mode Selector: Cari & Rekomendasi vs Buat Baru */}
                <div className="flex justify-center max-w-md mx-auto bg-[#1c1a19] p-1.5 rounded-2xl border border-[#3c3934]">
                  <button
                    onClick={() => { setNoGuildTab('search'); triggerAudio('move'); }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      noGuildTab === 'search'
                        ? 'bg-[#81b64c] text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-[#262421]'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Cari & Rekomendasi Klan
                  </button>
                  <button
                    onClick={() => { setNoGuildTab('create'); triggerAudio('move'); }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      noGuildTab === 'create'
                        ? 'bg-yellow-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-[#262421]'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Buat Klan Baru
                  </button>
                </div>

                {noGuildTab === 'search' ? (
                  /* SEARCH & RECOMMENDATIONS PANEL */
                  <div className="space-y-5 max-w-4xl mx-auto">
                    {/* Search & Filter Controls */}
                    <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934]/60 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={clanSearchQuery}
                            onChange={(e) => setClanSearchQuery(e.target.value)}
                            placeholder="Cari nama klan, slogan, atau nama pimpinan..."
                            className="w-full bg-[#1c1a19] border border-[#3c3934] pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#81b64c]"
                          />
                        </div>
                        <button
                          onClick={fetchAvailableClans}
                          className="px-4 py-2.5 bg-[#1c1a19] hover:bg-[#312e2b] border border-[#3c3934] text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                          title="Perbarui daftar klan"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isFetchingClans ? 'animate-spin text-yellow-500' : ''}`} />
                          Refresh
                        </button>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-bold">
                        <span className="text-slate-500 text-[10px] uppercase font-black shrink-0 mr-1">Tag:</span>
                        {['Semua', 'Kompetitif', 'Agresif', 'Defensif', 'Santai'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedClanFilterTag(tag)}
                            className={`px-3 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                              selectedClanFilterTag === tag
                                ? 'bg-[#81b64c]/20 border-[#81b64c] text-[#81b64c]'
                                : 'bg-[#1c1a19] border-[#3c3934] text-slate-400 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Real Clans List */}
                    {isFetchingClans ? (
                      <div className="text-center py-12 space-y-3">
                        <RotateCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-medium">Memuat rekomendasi klan asli dari server...</p>
                      </div>
                    ) : (() => {
                      const filteredClans = availableClans.filter((c: any) => {
                        if (!c || !c.name) return false;
                        const matchesQuery = 
                          c.name.toLowerCase().includes(clanSearchQuery.toLowerCase()) ||
                          (c.leader && c.leader.toLowerCase().includes(clanSearchQuery.toLowerCase())) ||
                          (c.motto && c.motto.toLowerCase().includes(clanSearchQuery.toLowerCase()));
                        const matchesTag = selectedClanFilterTag === 'Semua' || (c.tag && c.tag.toLowerCase() === selectedClanFilterTag.toLowerCase());
                        return matchesQuery && matchesTag;
                      });

                      if (filteredClans.length === 0) {
                        return (
                          <div className="bg-[#262421] p-8 rounded-2xl border border-[#3c3934]/60 text-center space-y-4">
                            <div className="w-12 h-12 bg-[#1c1a19] rounded-2xl flex items-center justify-center mx-auto text-slate-500 border border-[#3c3934]">
                              <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-extrabold text-white">Tidak Ada Klan Ditemukan</h4>
                              <p className="text-xs text-slate-400 max-w-md mx-auto">
                                {clanSearchQuery || selectedClanFilterTag !== 'Semua' 
                                  ? 'Tidak ada klan yang cocok dengan kriteria pencarian Anda.' 
                                  : 'Belum ada klan asli yang terdaftar di server. Jadilah ketua pertama yang mendirikan klan!'}
                              </p>
                            </div>
                            <button
                              onClick={() => { setNoGuildTab('create'); triggerAudio('move'); }}
                              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Mulai Buat Klan Sekarang
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredClans.map((clan: any, idx: number) => {
                            const userRating = onlineRating || 600;
                            const minRating = clan.minRating || 600;
                            const meetsMinRating = userRating >= minRating;
                            const isJoiningThis = joiningClanName === clan.name;

                            return (
                              <div 
                                key={clan.id || clan.name || idx}
                                className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934]/70 hover:border-[#81b64c]/40 transition-all space-y-4 relative flex flex-col justify-between"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-[#1c1a19] border border-yellow-500/50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                        {renderGuildLogo(clan.logo || 'perisai')}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-black text-white uppercase tracking-wider">{clan.name}</h4>
                                          <span className="text-[9px] font-extrabold px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-md">
                                            LVL {clan.level || 1}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">
                                          "{clan.motto || 'Klan Catur Sejati'}"
                                        </p>
                                      </div>
                                    </div>

                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-[#1c1a19] border border-[#3c3934] text-indigo-400 rounded-md shrink-0">
                                      {clan.tag || 'ELIT'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#1c1a19] rounded-xl border border-[#3c3934]/40 text-[10px] text-slate-300 font-sans">
                                    <div>
                                      <span className="text-slate-500 block text-[9px] font-black uppercase">Pimpinan:</span>
                                      <span className="font-bold text-slate-200">@{clan.leader || 'Ketua Klan'}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] font-black uppercase">Anggota:</span>
                                      <span className="font-bold text-slate-200">{clan.membersCount || 1} / 30</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] font-black uppercase">Syarat ELO:</span>
                                      <span className={`font-mono font-bold ${meetsMinRating ? 'text-[#81b64c]' : 'text-amber-400'}`}>
                                        {minRating}+ ELO
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px] font-black uppercase">Sistem Join:</span>
                                      <span className="font-bold text-slate-200">{clan.joinSystem || 'Bebas'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-[#3c3934]/40 flex items-center justify-between gap-3">
                                  <div className="text-[10px] font-mono text-slate-400">
                                    Total ELO: <span className="font-bold text-yellow-400">{(clan.totalElo || 1200).toLocaleString('id-ID')}</span>
                                  </div>

                                  <button
                                    onClick={() => handleJoinClan(clan)}
                                    disabled={isJoiningThis}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                      isJoiningThis
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        : meetsMinRating
                                        ? 'bg-gradient-to-r from-[#81b64c] to-emerald-600 hover:from-[#92ca59] hover:to-emerald-500 text-slate-950'
                                        : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50'
                                    }`}
                                  >
                                    {isJoiningThis ? (
                                      <>
                                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                        Bergabung...
                                      </>
                                    ) : meetsMinRating ? (
                                      <>
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Gabung Klan
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="w-3.5 h-3.5" />
                                        Syarat ELO
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* CREATE GUILD FORM PANEL */
                  <div className="p-6 bg-[#262421] rounded-2xl border border-[#3c3934]/60 space-y-4 max-w-2xl mx-auto">
                    <h4 className="text-xs font-black uppercase text-[#81b64c] tracking-wider">Formulir Pendaftaran Klub Catur Baru</h4>
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Nama Klub</label>
                          <input 
                            type="text" 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full bg-[#1c1a19] border border-[#3c3934] p-2.5 rounded-xl text-xs text-white uppercase tracking-wider font-extrabold focus:outline-none focus:border-[#81b64c]" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Kategori Tag Klub</label>
                          <select 
                            value={formTag}
                            onChange={(e) => setFormTag(e.target.value)}
                            className="w-full bg-[#1c1a19] border border-[#3c3934] p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none focus:border-[#81b64c]"
                          >
                            <option value="Agresif">Agresif dan Serbu</option>
                            <option value="Defensif">Defensif dan Kokoh</option>
                            <option value="Santai">Santai dan Diskusi</option>
                            <option value="Kompetitif">Kompetitif Tinggi</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Slogan & Deskripsi Klan</label>
                        <input 
                          type="text" 
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          className="w-full bg-[#1c1a19] border border-[#3c3934] p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#81b64c]" 
                          placeholder="Masukkan deskripsi misi tim catur kalian..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Minimal ELO</label>
                          <input 
                            type="number" 
                            value={formMinRating}
                            onChange={(e) => setFormMinRating(Number(e.target.value))}
                            className="w-full bg-[#1c1a19] border border-[#3c3934] p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#81b64c] font-mono" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Sistem Penerimaan Anggota</label>
                          <select 
                            value={formJoin}
                            onChange={(e) => setFormJoin(e.target.value as any)}
                            className="w-full bg-[#1c1a19] border border-[#3c3934] p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none"
                          >
                            <option value="Bebas">Terbuka Untuk Siapa Saja (Bebas)</option>
                            <option value="Persetujuan">Persetujuan Founder/Officer</option>
                            <option value="Undangan">Hanya Undangan (Closed)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#3c3934]/35 gap-4">
                      <div className="text-left font-sans">
                        <span className="text-[9px] uppercase font-black text-slate-450 block">Biaya Pendirian Legal Hukum Klub:</span>
                        <span className="text-white font-black text-sm block flex items-center gap-1.5"><Coins className="w-4 h-4 text-yellow-500" /> 2,000 Coin Tabungan</span>
                      </div>
                      <button 
                        onClick={handleCreateGuild}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 font-black uppercase text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        Bentuk Klub Sekarang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // =========================================================================
              // ACTIVE GUILD CONTROL COGNITIVE HUB
              // =========================================================================
              <div className="space-y-6">
                
                {/* Visual Header Banner */}
                <div className="bg-gradient-to-r from-stone-900 via-[#262421] to-stone-900 p-6 rounded-3xl border border-[#3c3934] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#81b64c]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#1c1a19] border-2 border-yellow-500 rounded-2xl flex items-center justify-center shadow-xl shrink-0 overflow-hidden relative">
                        {renderGuildLogo(guildProfile.logo || 'perisai')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-extrabold text-white uppercase tracking-wider">{guildProfile.name}</h3>
                          <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-yellow-500 text-slate-900 rounded-full">
                            KLAN LVL {guildLevel}
                          </span>
                          <span className="text-[9.5px] font-bold px-2 py-0.5 bg-stone-900 border border-[#3c3934] text-indigo-400 rounded-md">
                            Label {guildProfile.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-455 italic mt-1 font-medium">"{guildProfile.description}"</p>
                        <div className="flex gap-4 text-[9px] font-mono text-slate-400 font-extrabold uppercase mt-1.5">
                          <span>Anggota {guildMembers.length} Anggota</span>
                          <span> Syarat: {guildProfile.minRating} ELO</span>
                          <span>Terkunci Join: {guildProfile.joinSystem}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(() => {
                        const activeUserLower = (username || localStorage.getItem('username') || '').toLowerCase();
                        const isFounder = (guildMembers || []).some(m => m.name?.toLowerCase() === activeUserLower && (m.role === 'Founder' || m.role === 'Leader' || m.role === 'Ketua Klan')) || (guildProfile.leader?.toLowerCase() === activeUserLower);

                        if (isFounder) {
                          return (
                            <button 
                              onClick={() => {
                                setCustomConfirm({
                                  show: true,
                                  title: "Bubarkan Klub Suku",
                                  message: "Apakah Anda yakin ingin membubarkan Klub Catur Anda? Seluruh koin di brankas akan hangus dan data klan direset.",
                                  confirmText: "Bubarkan Suku",
                                  cancelText: "Batal",
                                  onConfirm: async () => {
                                    const activeUser = username || localStorage.getItem('username') || 'Guest';
                                    try {
                                      await fetch('/api/guilds/disband', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          username: activeUser,
                                          guildName: guildProfile.name
                                        })
                                      });
                                    } catch (err) {}

                                    setHasGuild(false);
                                    setGuildMembers([]);
                                    setGuildJoinRequests([]);
                                    setConqueredBoards([]);
                                    setGuildTreasury(250);
                                    localStorage.setItem('guild_explicitly_left', 'true');
                                    localStorage.setItem('guild_has_owner', 'false');
                                    localStorage.removeItem('guild_members');
                                    localStorage.removeItem('guild_profile_data');
                                    localStorage.removeItem('guild_treasury_gold');
                                    setTimeout(() => window.dispatchEvent(new Event('guild_state_updated')), 0);
                                    triggerAudio('lose');
                                    triggerReward(0, 'Klub Catur Anda dibubarkan secara permanen.', 'error');
                                  }
                                });
                              }}
                              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-300 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                            >
                              Bubarkan Suku
                            </button>
                          );
                        } else {
                          return (
                            <button 
                              onClick={() => {
                                setCustomConfirm({
                                  show: true,
                                  title: "Keluar dari Klan",
                                  message: `Apakah Anda yakin ingin keluar dari klan ${guildProfile.name}?`,
                                  confirmText: "Keluar Klan",
                                  cancelText: "Batal",
                                  onConfirm: async () => {
                                    const activeUser = username || localStorage.getItem('username') || 'Guest';
                                    try {
                                      await fetch('/api/guilds/leave', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          username: activeUser,
                                          guildName: guildProfile.name
                                        })
                                      });
                                    } catch (err) {}

                                    setHasGuild(false);
                                    setGuildMembers([]);
                                    setGuildJoinRequests([]);
                                    setConqueredBoards([]);
                                    setGuildTreasury(250);
                                    localStorage.setItem('guild_explicitly_left', 'true');
                                    localStorage.setItem('guild_has_owner', 'false');
                                    localStorage.removeItem('guild_members');
                                    localStorage.removeItem('guild_profile_data');
                                    localStorage.removeItem('guild_treasury_gold');
                                    setTimeout(() => window.dispatchEvent(new Event('guild_state_updated')), 0);
                                    triggerAudio('lose');
                                    triggerReward(0, `Anda telah keluar dari klan ${guildProfile.name}.`, 'info');
                                  }
                                });
                              }}
                              className="px-3.5 py-2 bg-amber-950/40 hover:bg-amber-900 border border-amber-900/40 text-amber-300 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <LogOut className="w-3 h-3" />
                              Keluar dari Klan
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* SubPage Tab Navigation Bar */}
                <div className="flex border-b border-[#3c3934]/60 overflow-x-auto scroller-hidden gap-1.5 pb-1 font-sans">
                  {[
                    { id: 'dashboard', label: 'Dasbor Informasi Suku', Icon: Shield },
                    { id: 'members', label: `Daftar Anggota (${guildMembers.length})`, Icon: Users },
                    { id: 'activities', label: 'Aktivitas Suku', Icon: Trophy }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setGuildSubPage(sub.id as any); triggerAudio('move'); }}
                      className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        guildSubPage === sub.id 
                          ? 'bg-[#81b64c] text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white bg-[#1c1a19]/50 hover:bg-stone-900/40'
                      }`}
                    >
                      <sub.Icon className="w-4 h-4 shrink-0" />
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* SUBPAGE CONTENTS CONTAINER */}
                <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] shadow-inner font-sans">
                  <AnimatePresence mode="wait">
                    {guildSubPage === 'dashboard' && (
                      <motion.div 
                        key="dashboard-sub"
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                      >
                        <SukuDashboard
                          guildProfile={guildProfile}
                          guildLevel={guildLevel}
                          guildMembers={guildMembers}
                          guildTreasury={guildTreasury}
                          guildLogs={guildLogs}
                          username={username}
                          coins={coins}
                          isEditingGuild={isEditingGuild}
                          setIsEditingGuild={setIsEditingGuild}
                          setGuildProfile={setGuildProfile}
                          setGuildLogs={setGuildLogs}
                          handleGuildDonate={handleGuildDonate}
                          handleGuildWithdraw={handleGuildWithdraw}
                          triggerAudio={triggerAudio}
                          triggerReward={triggerReward}
                        />
                      </motion.div>
                    )}

                    {guildSubPage === 'members' && (
                      <motion.div 
                        key="members-sub"
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                      >
                        <SukuMembers
                          guildMembers={guildMembers}
                          username={username}
                          guildJoinRequests={guildJoinRequests}
                          guildBlacklist={guildBlacklist}
                          setGuildMembers={setGuildMembers}
                          setGuildJoinRequests={setGuildJoinRequests}
                          setGuildLogs={setGuildLogs}
                          triggerAudio={triggerAudio}
                          triggerReward={triggerReward}
                          realPlayers={realPlayers}
                          inviteQuery={inviteQuery}
                          setInviteQuery={setInviteQuery}
                          setHasGuild={setHasGuild}
                        />
                      </motion.div>
                    )}

                    {guildSubPage === 'activities' && (
                      <motion.div 
                        key="activities-sub"
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }}  
                        exit={{ opacity: 0 }}
                      >
                        <SukuActivities
                          activityDetail={activityDetail}
                          setActivityDetail={setActivityDetail}
                          guildMembers={guildMembers}
                          setGuildMembers={setGuildMembers}
                          username={username}
                          coins={coins}
                          setCoins={setCoins}
                          diamonds={diamonds}
                          setDiamonds={setDiamonds}
                          clanCheckedIn={clanCheckedIn}
                          setClanCheckedIn={setClanCheckedIn}
                          claimedWeeklyMilestones={claimedWeeklyMilestones}
                          setClaimedWeeklyMilestones={setClaimedWeeklyMilestones}
                          guildLogs={guildLogs}
                          setGuildLogs={setGuildLogs}
                          guildChatMessages={guildChatMessages}
                          setGuildChatMessages={setGuildChatMessages}
                          conqueredBoards={conqueredBoards}
                          setConqueredBoards={setConqueredBoards}
                          activeWarStage={activeWarStage}
                          setActiveWarStage={setActiveWarStage}
                          selectedPuzzlePiece={selectedPuzzlePiece}
                          setSelectedPuzzlePiece={setSelectedPuzzlePiece}
                          wrongPuzzleAttempt={wrongPuzzleAttempt}
                          setWrongPuzzleAttempt={setWrongPuzzleAttempt}
                          myFragments={myFragments}
                          setMyFragments={setMyFragments}
                          fragmentRequests={fragmentRequests}
                          setFragmentRequests={setFragmentRequests}
                          fragmentRequestCooldown={fragmentRequestCooldown}
                          setFragmentRequestCooldown={setFragmentRequestCooldown}
                          todayFragmentDonationCount={todayFragmentDonationCount}
                          setTodayFragmentDonationCount={setTodayFragmentDonationCount}
                          requestedFragmentSkin={requestedFragmentSkin}
                          setRequestedFragmentSkin={setRequestedFragmentSkin}
                          hasActiveFragmentReq={hasActiveFragmentReq}
                          setHasActiveFragmentReq={setHasActiveFragmentReq}
                          setUnlockedSkins={setUnlockedSkins}
                          triggerAudio={triggerAudio}
                          triggerReward={triggerReward}
                          prefLang={prefLang}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BYPASSED DETACHED BLOCK FOR DEPRECATED PAGES - DO NOT EXECUTE OUTSIDE ORIGINAL STRUCTURE */}
                {false && (
                  <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] shadow-inner font-sans">
                    <AnimatePresence mode="wait">
                      {guildSubPage === 'dashboard' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Edit Profile Form Inline toggle */}
                        {isEditingGuild ? (
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                            <h4 className="text-xs font-black uppercase text-[#81b64c] tracking-wider">Ubah Data & Profil Klub Catur Kamu</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Nama Klub</label>
                                <input 
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white uppercase tracking-wider font-extrabold focus:outline-none focus:border-[#81b64c]"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Lambang Klub</label>
                                <select 
                                  value={editLogo}
                                  onChange={(e) => setEditLogo(e.target.value)}
                                  className="w-full bg-[#1c1a19] border border-stone-805 p-2.5 rounded-xl text-xs text-white focus:outline-none font-bold"
                                >
                                  <option value="perisai">Lambang Perisai</option>
                                  <option value="pedang">Lambang Duel Pedang</option>
                                  <option value="mahkota">Lambang Mahkota</option>
                                  <option value="medali">Lambang Medali Kehormatan</option>
                                  <option value="piala">Lambang Piala Kampiun</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Kategori Tag Klan</label>
                                <select 
                                  value={editTag}
                                  onChange={(e) => setEditTag(e.target.value)}
                                  className="w-full bg-[#1c1a19] border border-stone-805 p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none"
                                >
                                  <option value="Agresif">Agresif & Ofensif</option>
                                  <option value="Defensif">Defensif & Kokoh</option>
                                  <option value="Santai">Mabar Santai & Kopi</option>
                                  <option value="Kompetitif">Kompetitif Tinggi / ELO</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Minimal ELO Calon Anggota</label>
                                <input 
                                  type="number" 
                                  value={editMinRating}
                                  onChange={(e) => setEditMinRating(Number(e.target.value))}
                                  className="w-full bg-[#1c1a19] border border-stone-805 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#81b64c]"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Slogan & Deskripsi Visi Suku</label>
                                <input 
                                  type="text"
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="w-full bg-[#1c1a19] border border-stone-850 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#81b64c]"
                                  placeholder="Contoh: Markas para ksatria papan hitam putih taktis!"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Sistem Persetujuan Anggota</label>
                                <select 
                                  value={editJoinSystem}
                                  onChange={(e) => setEditJoinSystem(e.target.value as any)}
                                  className="w-full bg-[#1c1a19] border border-stone-850 p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none"
                                >
                                  <option value="Bebas">Bebas Bergabung (Bebas)</option>
                                  <option value="Persetujuan">Butuh Persetujuan Founder</option>
                                  <option value="Undangan">Tertutup / Hanya Undangan</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                              <button 
                                onClick={() => setIsEditingGuild(false)}
                                className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-slate-400 hover:text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => {
                                  setGuildProfile({
                                    name: editName,
                                    description: editDesc,
                                    tag: editTag,
                                    logo: editLogo,
                                    frame: guildProfile.frame,
                                    minRating: editMinRating,
                                    joinSystem: editJoinSystem
                                  });
                                  setIsEditingGuild(false);
                                  setGuildLogs([`Profil klan dimodifikasi oleh Admin pada ${new Date().toLocaleTimeString()}.`, ...guildLogs]);
                                  triggerAudio('win');
                                  triggerReward(0, 'Spesial Profil klan catur berhasil disimpan!', 'success_no_xp');
                                }}
                                className="px-5 py-2 bg-[#81b64c] hover:bg-green-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow"
                              >
                                Simpan Profil Baru
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Normal profile display with Edit Profile click
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 flex flex-col sm:flex-row justify-between items-start gap-4/5">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#81b64c] block">Slogan & Catatan Resmi Klan</span>
                              <p className="text-white text-xs font-medium leading-relaxed mt-1">"{guildProfile.description}"</p>
                              <div className="flex gap-4 text-[9px] font-mono text-slate-400 mt-3 font-extrabold uppercase">
                                <span>Perisai Batas ELO: {guildProfile.minRating}+</span>
                                <span>Sistem Sistem: {guildProfile.joinSystem}</span>
                                <span>Label Tema: {guildProfile.tag}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setEditName(guildProfile.name);
                                setEditDesc(guildProfile.description);
                                setEditTag(guildProfile.tag);
                                setEditMinRating(guildProfile.minRating);
                                setEditJoinSystem(guildProfile.joinSystem);
                                setEditLogo(guildProfile.logo || 'perisai');
                                setIsEditingGuild(true);
                                triggerAudio('move');
                              }}
                              className="px-4 py-2.5 bg-[#3c3934] hover:bg-[#81b64c] text-slate-350 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-stone-700"
                            >
                              Ubah Profil Klan
                            </button>
                          </div>
                        )}

                        {/* Treasury Bank info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
                            <div>
                              <span className="text-[9.5px] font-black text-yellow-500 uppercase block tracking-wider">Brankas Lembaga Klan (Treasury)</span>
                              <h4 className="text-white font-mono font-black text-2xl mt-1 flex flex-row items-center gap-2">
                                <Coins className="w-6 h-6 text-yellow-500 shrink-0 inline-block" />
                                <span>{guildTreasury}</span>
                                <span className="text-xs text-slate-450 font-sans font-bold">/ {guildLevel * 1200} Koin</span>
                              </h4>
                              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Tingkatkan Coin di dalam Brankas bersama anggota klan untuk menaikkan Level Suku klub secara otomatis. Level tinggi membuka bonus XP tanding!</p>
                              
                              <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden mt-4 border border-stone-800">
                                <div 
                                  style={{ width: `${Math.min(100, (guildTreasury / (guildLevel * 1200)) * 100)}%` }} 
                                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all" 
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 block uppercase font-bold mt-1">Batas Naik Level Berikutnya: {guildLevel * 1200} Coins</span>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-stone-800/60 mt-4">
                              <button 
                                onClick={() => handleGuildDonate(100)}
                                className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-805"
                              >
                                Donasi +100 Coin
                              </button>
                              <button 
                                onClick={() => handleGuildDonate(500)}
                                className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-805"
                              >
                                Donasi +500 Coin
                              </button>
                            </div>
                          </div>

                          {/* Action Log Box */}
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
                            <div>
                              <span className="text-[9.5px] font-black text-[#81b64c] uppercase block tracking-wider">Log Kegiatan Utama Suku</span>
                              <div className="space-y-2 max-h-36 overflow-y-auto mt-2 pr-1 divide-y divide-stone-800/40">
                                {guildLogs.map((log, i) => (
                                  <div key={i} className="text-[10px] font-mono text-slate-350 py-1.5 leading-relaxed flex items-start gap-1.5">
                                    <span className="text-green-500 font-extrabold shrink-0">•</span>
                                    <span>{log}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* SUBPAGE: MEMBERS */}
                    {guildSubPage === 'members' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Member management list */}
                        <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                          <div className="flex justify-between items-center border-b border-stone-800/50 pb-2 flex-wrap gap-2">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Aktivitas Anggota Suku ({guildMembers.length})</h4>
                            <button 
                              onClick={() => {
                                setCustomConfirm({
                                  show: true,
                                  title: "Transfer Kepemilikan",
                                  message: "Apakah Anda yakin ingin memindahkan kepemilikan utama (Founder) klan ke Isna Caturia? Anda akan diturunkan menjadi Co-Leader.",
                                  confirmText: "Transfer",
                                  cancelText: "Batal",
                                  onConfirm: () => {
                                    const updatedMembers = guildMembers.map(m => {
                                      if (m.name === username) return { ...m, role: 'Co-Leader' };
                                      if (m.name === 'Isna Caturia') return { ...m, role: 'Founder' };
                                      return m;
                                    });
                                    setGuildMembers(updatedMembers);
                                    setGuildLogs(['Kepemilikan klan dialihkan kepada Isna Caturia.', ...guildLogs]);
                                    triggerAudio('move');
                                    triggerReward(0, 'Kepemilikan klan berhasil beralih!', 'info');
                                  }
                                });
                              }}
                              className="px-3 py-1 bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-300 text-[8.5px] font-black uppercase rounded-lg transition-all cursor-pointer"
                            >
                              Transfer Kepemilikan (Founder)
                            </button>
                          </div>

                          <div className="divide-y divide-stone-800/40 font-sans">
                            {guildMembers.map((member) => {
                              const cleanMemberName = member.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
                              const cleanUsername = username.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
                              const isMe = cleanMemberName === cleanUsername || member.name === username;

                              let memberAvatar = (member as any).profileAvatar || (member as any).avatar;
                              let memberFrame = (member as any).selectedFrame || 'none';
                              if (isMe) {
                                try {
                                  const savedUser = localStorage.getItem('user');
                                  if (savedUser) {
                                    const u = JSON.parse(savedUser);
                                    if (u.profileAvatar || u.avatar) memberAvatar = u.profileAvatar || u.avatar;
                                    if (u.selectedFrame) memberFrame = u.selectedFrame;
                                  }
                                } catch(e) {}
                                if (!memberAvatar) memberAvatar = localStorage.getItem('guestAvatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                              }
                              if (!memberAvatar) memberAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

                              let memberLevel = member.level;
                              if (isMe) {
                                try {
                                  const xpVal = Number(localStorage.getItem('xp')) || 0;
                                  memberLevel = getLevelFromXP(xpVal);
                                } catch(e) {
                                  memberLevel = member.level || 1;
                                }
                              } else if (typeof member.xp === 'number' && member.xp > 0) {
                                memberLevel = getLevelFromXP(member.xp);
                              } else if (member.level) {
                                memberLevel = member.level;
                              } else {
                                memberLevel = Math.max(1, Math.floor((member.rating || 600) / 200) + 1);
                              }

                              return (
                                <div key={member.name} className="py-3 flex sm:flex-row flex-col justify-between items-start sm:items-center gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                      <AvatarWithFrame src={memberAvatar} frameId={memberFrame} size="sm" />
                                      <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-slate-900 text-[8px] px-1.5 py-0.5 rounded-full font-black scale-90 z-10 shadow border border-yellow-300/50">
                                        Lv.{memberLevel}
                                      </span>
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                                        {member.name} {isMe ? '(Kamu)' : ''}
                                        {member.role === 'Founder' && <Crown className="w-3" />}
                                      </h5>
                                      <span className="text-[9px] text-[#81b64c] font-black uppercase leading-none font-mono">rating: {member.rating} ELO</span>
                                    </div>
                                  </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Role Display Tag */}
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    member.role === 'Founder' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/10' :
                                    member.role === 'Co-Leader' ? 'bg-blue-500/20 text-blue-400 border border-stone-800' :
                                    member.role === 'Officer' ? 'bg-purple-500/20 text-purple-400 border border-stone-800' :
                                    member.role === 'Member' ? 'bg-zinc-800/30 text-emerald-400 border border-zinc-800' :
                                    'bg-zinc-800 text-zinc-400'
                                  }`}>
                                    {member.role === 'Founder' ? 'Leader Leader' : member.role}
                                  </span>

                                  {/* Leader Maintenance Options for others */}
                                  {member.name !== username && (
                                    <div className="flex items-center gap-1">
                                      {/* Promote button */}
                                      <button 
                                        onClick={() => {
                                          let nextRole = 'Member';
                                          if (member.role === 'Recruit') nextRole = 'Member';
                                          else if (member.role === 'Member') nextRole = 'Officer';
                                          else if (member.role === 'Officer') nextRole = 'Co-Leader';
                                          else return;
                                          setGuildMembers(guildMembers.map(m => m.name === member.name ? { ...m, role: nextRole } : m));
                                          setGuildLogs([`Pangkat ${member.name} dinaikkan menjadi ${nextRole} oleh pimpinan.`, ...guildLogs]);
                                          triggerAudio('win');
                                          triggerReward(0, `▲ Jabatan ${member.name} dinaikkan ke ${nextRole}!`, 'success_no_xp');
                                        }}
                                        disabled={member.role === 'Co-Leader'}
                                        title="Promosikan Jabatan"
                                        className="px-2 py-1 bg-green-950/50 hover:bg-green-905 border border-green-800/20 text-green-300 font-extrabold text-[8.5px] rounded-md uppercase disabled:opacity-30 disabled:pointer-events-none transition"
                                      >
                                        ▲ Naik
                                      </button>

                                      {/* Demote button */}
                                      <button 
                                        onClick={() => {
                                          let nextRole = 'Recruit';
                                          if (member.role === 'Co-Leader') nextRole = 'Officer';
                                          else if (member.role === 'Officer') nextRole = 'Member';
                                          else if (member.role === 'Member') nextRole = 'Recruit';
                                          else return;
                                          setGuildMembers(guildMembers.map(m => m.name === member.name ? { ...m, role: nextRole } : m));
                                          setGuildLogs([`Pangkat ${member.name} diturunkan menjadi ${nextRole} oleh pimpinan.`, ...guildLogs]);
                                          triggerAudio('lose');
                                          triggerReward(0, `▼ Jabatan ${member.name} diturunkan ke ${nextRole}!`, 'info');
                                        }}
                                        disabled={member.role === 'Recruit'}
                                        title="Turunkan Jabatan"
                                        className="px-2 py-1 bg-orange-950/50 hover:bg-orange-905 border border-orange-850/20 text-orange-405 font-extrabold text-[8.5px] rounded-md uppercase disabled:opacity-30 disabled:pointer-events-none transition"
                                      >
                                        ▼ Turun
                                      </button>

                                      {/* Kick/blacklist */}
                                      <button
                                        onClick={() => handleKickAndBlacklist(member.name)}
                                        className="p-1 px-2 bg-red-950/20 hover:bg-red-950 rounded border border-transparent hover:border-red-900/30 text-slate-500 hover:text-red-400 transition"
                                        title="Keluarkan / Blacklist"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </div>

                        {/* Join Applications Screen */}
                        <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3">
                          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            <UserCheck className="w-4 h-4" /> Permintaan Bergabung Calon Anggota ({guildJoinRequests.length})
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-normal">Berikut adalah pendaftar baru yang menunggu persetujuan Anda sebagai pendiri klub untuk ikut bergabung dalam klan catur Anda:</p>
                          
                          {guildJoinRequests.length === 0 ? (
                            <div className="text-center py-4 bg-[#1c1a19] rounded-xl text-stone-500 italic text-xs border border-transparent">
                              Tidak ada permintaan bergabung baru. Semua bersih!
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {guildJoinRequests.map((req) => (
                                <div key={req.name} className="p-3 bg-[#1c1a19] rounded-xl border border-stone-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                    <span className="font-extrabold text-white text-xs block">{req.name}</span>
                                    <span className="text-[9.5px] text-[#81b64c] font-black font-mono">Rating: {req.rating} ELO</span>
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button 
                                      onClick={() => {
                                        setGuildJoinRequests(prev => prev.filter(r => r.name !== req.name));
                                        setGuildMembers(prev => [...prev, { name: req.name, role: 'Member', rating: req.rating, status: 'Online' }]);
                                        setGuildLogs([`${req.name} disetujui bergabung ke klan oleh Founder.`, ...guildLogs]);
                                        triggerAudio('win');
                                        triggerReward(50, `Sukses ${req.name} Berhasil Bergabung ke Suku! +50 XP klan diraih.`, 'level_up');
                                      }}
                                      className="px-3.5 py-1.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition shadow"
                                    >
                                      Setujui
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setGuildJoinRequests(prev => prev.filter(r => r.name !== req.name));
                                        setGuildLogs([`Aplikasi bergabung dari ${req.name} ditolak.`, ...guildLogs]);
                                        triggerAudio('move');
                                        triggerReward(0, `Aplikasi ${req.name} ditolak.`, 'info');
                                      }}
                                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-400 font-black text-[9px] uppercase rounded-lg cursor-pointer transition"
                                    >
                                      Tolak
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dynamic Real Member Invitation Hub */}
                        <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3">
                          <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            <Plus className="w-4 h-4 text-[#81b64c]" /> Cari & Undang Pecatur Online (Pemain Nyata)
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-normal">
                            Undang para pecatur sungguhan dari database server game online untuk memperkuat barisan Suku Anda:
                          </p>
                          
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Ketik nama pecatur..." 
                              value={inviteQuery}
                              onChange={(e) => setInviteQuery(e.target.value)}
                              className="w-full bg-[#1c1a19] text-xs font-semibold text-white px-3.5 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-[#81b64c]/50 transition placeholder-stone-650"
                            />
                            <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5 pointer-events-none" />
                          </div>

                          {(() => {
                            const availableInvitees = realPlayers.filter(p => {
                              const inMembers = guildMembers.some(m => m.name.toLowerCase() === p.name.toLowerCase());
                              const inApplications = guildJoinRequests.some(r => r.name.toLowerCase() === p.name.toLowerCase());
                              const matchesSearch = p.name.toLowerCase().includes(inviteQuery.toLowerCase());
                              return p.name.toLowerCase() !== username.toLowerCase() && !inMembers && !inApplications && matchesSearch;
                            });

                            if (availableInvitees.length === 0) {
                              return (
                                <div className="text-center py-4 bg-[#1c1a19] rounded-xl text-stone-500 italic text-xs border border-transparent">
                                  Tidak ada pecatur lain yang ditemukan untuk kata kunci ini.
                                </div>
                              );
                            }

                            return (
                              <div className="max-h-51 overflow-y-auto divide-y divide-stone-850 bg-black/10 rounded-xl px-2">
                                {availableInvitees.map((invitee) => (
                                  <div key={invitee.name} className="py-2.5 flex justify-between items-center gap-2">
                                    <div>
                                      <span className="text-xs font-bold text-white block">{invitee.name}</span>
                                      <span className="text-[9px] text-yellow-500 font-extrabold font-mono uppercase tracking-tight">{invitee.badge} • {invitee.elo} ELO</span>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setGuildMembers(prev => [...prev, { name: invitee.name, role: 'Member', rating: invitee.elo, status: 'Online' }]);
                                        setGuildLogs([`${invitee.name} diundang dan bergabung ke klan oleh Founder.`, ...guildLogs]);
                                        triggerAudio('win');
                                        triggerReward(30, `Sukses mengundang @${invitee.name}! Dia resmi bergabung ke klub catur Anda.`, 'success');
                                      }}
                                      className="px-3 py-1.5 bg-[#81b64c]/15 hover:bg-[#81b64c] border border-[#81b64c]/30 text-[#81b64c] hover:text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition shadow"
                                    >
                                      + Undang
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Blacklist block */}
                        {guildBlacklist.length > 0 && (
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3">
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                              <EyeOff className="w-4 h-4 text-red-400" /> Daftar Blacklist / Blokir Anggota
                            </h4>
                            <div className="bg-black/15 p-3 rounded-xl border border-stone-850 space-y-2">
                              {guildBlacklist.map((target) => (
                                <div key={target} className="flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
                                  <span>{target}</span>
                                  <button 
                                    onClick={() => handleRemoveFromBlacklist(target)}
                                    className="text-[9px] font-black uppercase text-indigo-400 hover:underline cursor-pointer"
                                  >
                                    Hapus Cekal
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* SUBPAGE: WAR */}
                    {guildSubPage === 'war' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Interactive War details */}
                        <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-orange-950/20 border border-orange-500/10 rounded-2xl flex flex-col justify-between gap-4">
                          <div>
                            <span className="text-[8px] font-black text-[#81b64c] uppercase tracking-wider block">Turnamen Perang Klan Musim Ini</span>
                            <h4 className="text-md font-black text-white uppercase mt-0.5">Bonus SERBU BINTANG vs COSMIC STORM UNITED</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">Gunakan kecerdasan Anda untuk memecahkan Taktik Catur instan di 3 Board pertahanan musuh. Menangkan Board untuk meraup Koin Tabungan tebal dan Bintang Klan guna menaikkan peringkat tim catur Anda!</p>
                            
                            <div className="flex gap-4 text-[9.5px] font-mono text-slate-400 uppercase font-black mt-2">
                              <span>Bintang Score Suku: <span className="text-yellow-500 font-bold">{conqueredBoards.length * 2}</span> / 6 Bintang</span>
                              <span>Tanding Status: {conqueredBoards.length === 3 ? 'Kemenangan Mutlak!' : 'Sebab Tempur Aktif'}</span>
                            </div>
                          </div>
                        </div>

                        {/* MINIGAME CHESS STRATEGY OVERLAY IF ACTIVE */}
                        {activeWarStage !== null ? (
                          <div className="bg-[#1c1a19] p-6 rounded-2xl border border-orange-500/20 space-y-5 font-sans">
                            <div className="flex justify-between items-center border-b border-stone-850 pb-3">
                              <div>
                                <span className="text-[9px] uppercase tracking-widest text-[#81b64c] font-black block">Ruang Komando Perang Suku</span>
                                <h4 className="text-sm font-black text-white uppercase mt-0.5">
                                  {activeWarStage === 1 ? 'Medan Pertempuran 1: Outpost Kavaleri Mandiri' :
                                   activeWarStage === 2 ? 'Medan Pertempuran 2: Penepungan Benteng Musuh' :
                                   'Medan Pertempuran 3: Penaklukan Istana Utama'}
                                </h4>
                              </div>
                              <button 
                                onClick={() => { setActiveWarStage(null); setCombatLogs([]); }}
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-slate-300 hover:text-white rounded-lg text-[9.5px] uppercase font-black cursor-pointer transition-all border border-stone-700"
                              >
                                Mundur ke Markas
                              </button>
                            </div>

                            {/* War Stats / Progress bar */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2 p-4 bg-stone-900 rounded-xl border border-stone-800 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center text-xs font-bold uppercase mb-1">
                                    <span className="text-slate-400">Tingkat Penaklukan Wilayah</span>
                                    <span className="text-[#81b64c]">{conquestRates[activeWarStage] || 0}%</span>
                                  </div>
                                  <div className="w-full bg-[#3c3934] h-3 rounded-full overflow-hidden border border-[#4d4a44]">
                                    <div 
                                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300" 
                                      style={{ width: `${Math.min(100, conquestRates[activeWarStage] || 0)}%` }} 
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold mt-3 italic leading-normal font-sans">
                                  {(conquestRates[activeWarStage] || 0) === 0 ? 'Pilih perintah taktis di bawah untuk mulai menyusup ke wilayah pertahanan lawan.' :
                                   (conquestRates[activeWarStage] || 0) < 50 ? 'Serangan awal berhasil ditembus! Teruskan pengerahan taktis untuk mengamankan wilayah.' :
                                   (conquestRates[activeWarStage] || 0) < 100 ? 'Pertahanan musuh hampir hancur! Lancarkan serangan pemungkas untuk menguasai peta tanding!' :
                                   'Kemenangan Mutlak! Wilayah tanding berhasil dikendalikan.'}
                                </p>
                              </div>

                              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-center flex flex-col justify-center">
                                <span className="text-[9px] uppercase tracking-widest text-[#bab9b8] font-black block">Kekuatan Lawan</span>
                                <span className="text-lg font-black text-red-500 font-mono">
                                  {activeWarStage === 1 ? '1200 ELO' :
                                   activeWarStage === 2 ? '1500 ELO' :
                                   '1800 ELO'}
                                </span>
                                <span className="text-[9px] text-[#9babaf] font-bold block uppercase">Garnisun Pelindung</span>
                              </div>
                            </div>

                            {/* Interactive Deploy Panel */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {[
                                {
                                  name: 'Taktik Kuda Pelompat',
                                  desc: 'Picu lompatan kavaleri kuda ke E5/F7 untuk melompati barisan pertahanan.',
                                  pct: 25,
                                  logMsg: 'Kavaleri Kuda meluncur ke E5 membuat kepanikan di barisan belakang musuh! +25% Wilayah.',
                                  Icon: Swords
                                },
                                {
                                  name: 'Invasi Benteng Besi',
                                  desc: 'Kerahkan artileri berat benteng pertahanan menyapu baris akhir musuh.',
                                  pct: 35,
                                  logMsg: 'Benteng Besi ditarik ke A8 menghancurkan tembok pertahanan benteng lawan! +35% Wilayah.',
                                  Icon: ShieldAlert
                                },
                                {
                                  name: 'Serbuan Elit Ratu',
                                  desc: 'Gencarkan langkah takdir mengorbankan menteri untuk mengancam Istana Raja.',
                                  pct: 50,
                                  logMsg: 'Serbuan Elit Ratu diluncurkan langsung menghancurkan garda depan Raja musuh! +50% Wilayah.',
                                  Icon: Award
                                },
                                {
                                  name: 'Kalkulasi Taktisi Catur',
                                  desc: 'Kalkulasikan visual pembukaan catur terbaik untuk mencari celah musuh.',
                                  pct: 15,
                                  logMsg: 'Analisis taktis komputer mendeteksi celah pada files catur lawan! +15% Wilayah.',
                                  Icon: Search
                                }
                              ].map((action, i) => {
                                const currentRate = conquestRates[activeWarStage] || 0;
                                const isFull = currentRate >= 100;
                                return (
                                  <button
                                    key={i}
                                    disabled={isFull}
                                    type="button"
                                    onClick={() => {
                                      const nextRate = Math.min(100, currentRate + action.pct);
                                      setConquestRates(prev => ({
                                        ...prev,
                                        [activeWarStage]: nextRate
                                      }));
                                      
                                      const nextLogs = [action.logMsg, ...combatLogs].slice(0, 4);
                                      setCombatLogs(nextLogs);
                                      triggerAudio('move');

                                      if (nextRate >= 100) {
                                        // Trigger Victory immediately!
                                        setConqueredBoards(prevSet => {
                                          const nextSet = [...prevSet, `board${activeWarStage}`];
                                          return nextSet;
                                        });

                                        const rewardCoins = activeWarStage === 1 ? 150 : activeWarStage === 2 ? 250 : 400;
                                        const rewardStars = activeWarStage === 1 ? 1 : activeWarStage === 2 ? 2 : 3;

                                        setCoins(curr => {
                                          const next = curr + rewardCoins;
                                          localStorage.setItem('coins', String(next));
                                          return next;
                                        });

                                        setGuildLogs([`Medan Tempur No. ${activeWarStage} berhasil ditaklukan secara mutlak! +${rewardCoins} Coin & +${rewardStars} Bintang Suku!`, ...guildLogs]);
                                        triggerAudio('win');
                                        triggerReward(60 * activeWarStage, `KEMENANGAN MUTLAK! Merebut Board #${activeWarStage} Taktis: +${rewardCoins} Koin & +${rewardStars} Bintang!`, 'level_up');
                                        
                                        // Instantly clear for next reset tanding
                                        setConquestRates(prev => ({
                                          ...prev,
                                          [activeWarStage]: 0
                                        }));
                                        setActiveWarStage(null);
                                        setCombatLogs([]);
                                      }
                                    }}
                                    className="p-4 bg-stone-900 border border-stone-850 text-left rounded-xl hover:bg-stone-850 hover:border-orange-500/20 transition-all flex items-start gap-4 group cursor-pointer disabled:opacity-40"
                                  >
                                    <div className="p-2 bg-stone-800 rounded-xl text-orange-500 group-hover:text-orange-400 group-hover:scale-105 transition-transform shrink-0">
                                      <action.Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h5 className="text-[11px] font-black text-white uppercase group-hover:text-orange-450 transition-colors leading-snug">{action.name}</h5>
                                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold font-sans">{action.desc}</p>
                                      <div className="mt-2 text-[9px] font-mono text-[#81b64c] font-black uppercase">Daya Gedor: +{action.pct}% wilayah</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Battle Output Logs */}
                            <div className="p-4 bg-stone-950 rounded-xl border border-stone-900 space-y-2">
                              <span className="text-[9px] uppercase tracking-widest text-[#81b64c] font-black block">Konstanta Laporan Jurnal Tempur</span>
                              <div className="space-y-1.5 min-h-[5rem]">
                                {combatLogs.length === 0 ? (
                                  <div className="text-slate-550 text-[10.5px] italic font-semibold leading-relaxed font-sans">Menunggu instruksi komandir suku... Memindai posisi koordinat catur musuh...</div>
                                ) : (
                                  combatLogs.map((log, index) => (
                                    <div key={index} className="text-[10.5px] text-slate-300 font-medium font-sans flex items-start gap-1.5 animate-fade-in">
                                      <span className="text-orange-500 shrink-0 font-bold">&#11162;</span>
                                      <span>{log}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Normal active boards map
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                            {[
                              { id: 1, title: 'Board 1: Benteng Kuda (Knight Outpost)', reward: 150, stars: 1, eObj: ' N' },
                              { id: 2, title: 'Board 2: Defensif Benteng (Backrank Mate)', reward: 250, stars: 2, eObj: ' R' },
                              { id: 3, title: 'Board 3: Istana Mentri (Queen Checkmate)', reward: 400, stars: 3, eObj: ' Q' }
                            ].map((board) => {
                              const isConquered = conqueredBoards.includes(`board${board.id}`);
                              return (
                                <div key={board.id} className="p-4 bg-[#262421] border border-stone-800 rounded-xl relative flex flex-col justify-between min-h-[10.5rem]">
                                  <div>
                                    <div className="flex justify-between items-center sm:items-start">
                                      <div className="w-9 h-9 bg-stone-900 border border-stone-800 text-[#81b64c] text-md font-bold rounded-lg flex items-center justify-center">
                                        {board.eObj}
                                      </div>
                                      {isConquered ? (
                                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-green-500 text-black rounded uppercase">
                                          Terkuasai
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-600 text-white rounded uppercase">
                                          Aktif
                                        </span>
                                      )}
                                    </div>
                                    <h5 className="text-[11px] font-black text-white uppercase mt-4 leading-normal">{board.title}</h5>
                                    <div className="text-[9.5px] text-slate-455 mt-2 space-y-0.5 font-sans leading-none font-medium">
                                      <div>Koin Hadiah: +{board.reward} Coins</div>
                                      <div>Bintang Bintang: +{board.stars} Klan</div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-stone-800/40 mt-3">
                                    {isConquered ? (
                                      <button 
                                        disabled
                                        className="w-full py-2 bg-stone-850 text-stone-550 font-extrabold text-[9px] uppercase rounded-lg disabled:opacity-45"
                                      >
                                         Selesai
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => { setActiveWarStage(board.id); triggerAudio('move'); }}
                                        className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-[9px] uppercase rounded-lg transition-all cursor-pointer shadow-md tracking-wider"
                                      >
                                        Serbu Board #{board.id}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {conqueredBoards.length === 3 && (
                          <div className="p-4 bg-green-950/20 border border-green-500/20 rounded-xl text-center space-y-2">
                            <span className="text-xl"></span>
                            <h5 className="text-xs font-black text-white uppercase">VICTORY ROUND! Semua Board Berhasil Dikuasai</h5>
                            <p className="text-[10px] text-slate-400 font-medium font-sans">Tim Anda menyapu bersih musuh minggu ini. Anda dapat me-reset papan perang klan untuk tanding ulang melatih kemampuan taktis kembali!</p>
                            <button
                              onClick={() => {
                                setConqueredBoards([]);
                                triggerAudio('win');
                                triggerReward(0, 'Papan Perang Klan di-reset. Tantang kembali rival klan Anda!', 'info');
                              }}
                              className="px-4 py-1.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition shadow"
                            >
                              Reset Tantangan Perang
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* SUBPAGE: FRAGMENTS */}
                    {guildSubPage === 'fragments' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Explanatory introduction */}
                        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                          <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-wider block">Program Donasi & Penukaran Kepingan Fragment</span>
                          <h4 className="text-xs font-black text-white uppercase mt-0.5">Sumbangan Kepingan Hero / Skin Catur</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">Bantu donasikan duplikat fragment skin catur miliki Anda ke teman satu klan untuk mendapatkan Koin Tabungan tebal secara instan, atau kirim Permintaan Bantuan Fragment Skin idamanmu untuk dirakit menjadi skin kustom prestisius gratis!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          
                          {/* Left column: My own requests */}
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-800 pb-2">
                              <Award className="w-4 h-4 text-yellow-500" /> Permintaan Fragment Kamu
                            </h4>

                            {hasActiveFragmentReq ? (
                              <div className="bg-stone-900 p-4 rounded-xl border border-stone-850 text-center space-y-3">
                                <div>
                                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Permohonan Aktif</span>
                                  <h5 className="text-white font-extrabold text-xs uppercase mt-0.5">Kepingan Fragment: {requestedFragmentSkin.toUpperCase()}</h5>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-mono font-bold text-slate-450">
                                    <span>Kemajuan Donasi:</span>
                                    <span className="text-[#81b64c]">{todayFragmentDonationCount} / 5 Keping</span>
                                  </div>
                                  <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800">
                                    <div 
                                      style={{ width: `${(todayFragmentDonationCount / 5) * 100}%` }} 
                                      className="bg-indigo-500 h-full transition-all" 
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                  <button 
                                    onClick={() => {
                                      if (todayFragmentDonationCount >= 5) {
                                        const finalSkinKey = requestedFragmentSkin === 'Golden' ? 'royal' : (requestedFragmentSkin === 'Retro' ? 'retro' : (requestedFragmentSkin === 'Cosmosis' ? 'cosmic' : 'neon'));
                                        setUnlockedSkins(prev => prev.includes(finalSkinKey) ? prev : [...prev, finalSkinKey]);
                                        setHasActiveFragmentReq(false);
                                        setRequestedFragmentSkin('');
                                        setTodayFragmentDonationCount(0);
                                        setGuildLogs([`Pimpinan merakit skin kustom resmi dari fragment klan.`, ...guildLogs]);
                                        triggerAudio('level_up');
                                        triggerReward(150, `LUAR BIASA! Anda berhasil merakit Skin Catur Kustom ${requestedFragmentSkin.toUpperCase()}: +150 XP dan Skin kini siap digunakan di pengaturan bidak catur!`, 'level_up');
                                      } else {
                                        if (fragmentRequestCooldown > 0) {
                                          triggerAudio('error');
                                          triggerReward(0, `Mohon tunggu ${fragmentRequestCooldown} detik cooldown untuk meminta bantuan donasi lagi.`, 'info');
                                          return;
                                        }
                                        // Speed donation
                                        setFragmentRequestCooldown(12);
                                        const nextCount = Math.min(5, todayFragmentDonationCount + 1);
                                        setTodayFragmentDonationCount(nextCount);
                                        setGuildLogs([`Anggota klub donasi fragment catur ke Anda.`, ...guildLogs]);
                                        setGuildChatMessages(prev => [
                                          ...prev,
                                          { sender: 'Naufal_Catur', text: `Ini kepingan fragment @${username}, semoga cepat terkumpul skin idamanmu ya.`, time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' }) }
                                        ]);
                                        triggerAudio('win');
                                        triggerReward(0, 'Sobat klan Naufal_Catur mendonasikan +1 Fragment ke Anda!', 'success_no_xp');
                                      }
                                    }}
                                    className="w-full py-2 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg transition shadow cursor-pointer"
                                  >
                                    {todayFragmentDonationCount >= 5 ? 'RAKIT SKIN GRATIS SEKARANG!' : fragmentRequestCooldown > 0 ? `COOLDOWN (${fragmentRequestCooldown}s)` : 'TARIK PERHATIAN (Minta Donasi Teman Klan)'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setHasActiveFragmentReq(false);
                                      setRequestedFragmentSkin('');
                                      setTodayFragmentDonationCount(0);
                                      triggerAudio('move');
                                    }}
                                    className="w-full py-1.5 text-[8.5px] font-black uppercase text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition cursor-pointer"
                                  >
                                    Batalkan Bantuan Skin ini
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <span className="text-[9px] font-black text-slate-455 block uppercase">PILIH SKIN YANG INGIN DIKUMPULKAN:</span>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { key: 'Neon Skin (Epic)', target: 'Neon' },
                                    { key: 'Golden Knight (Legendary)', target: 'Golden' },
                                    { key: 'Retro 8-bit (Rare Edition)', target: 'Retro' },
                                    { key: 'Cosmosis Nebula (Mythic)', target: 'Cosmosis' }
                                  ].map((sk) => (
                                    <button 
                                      key={sk.key}
                                      onClick={() => {
                                        setRequestedFragmentSkin(sk.target);
                                        setHasActiveFragmentReq(true);
                                        setTodayFragmentDonationCount(0);
                                        setGuildLogs([`Pimpinan meminta sumbangan fragment ${sk.target}.`, ...guildLogs]);
                                        triggerAudio('move');
                                        triggerReward(15, `Meminta bantuan fragment ${sk.target}! Teman klan akan segera berdonasi lewat chat room.`, 'success');
                                      }}
                                      className="w-full p-3 bg-stone-900 hover:bg-[#81b64c]/20 text-slate-300 hover:text-white text-left text-[10.5px] font-bold uppercase rounded-xl transition cursor-pointer border border-stone-850 hover:border-emerald-500/30 flex justify-between items-center"
                                    >
                                      <span>MINTA KEPING {sk.key}</span>
                                      <span className="text-[8px] bg-stone-800 px-2 py-0.5 rounded text-indigo-400 font-extrabold uppercase">+ Minta</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right column: Donate to members */}
                          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                            <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-800 pb-2">
                              Bantu Kirim Fragment Ke Teman Klan
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold font-sans">Lihat permohonan aktif kawan satu klub Anda. Donasikan fragment yang tidak Anda pakai untuk mendapatkan imbal balik Coin Suku secara instan!</p>
                            
                            {/* MY INV ACCENT BOX */}
                            <div className="p-3 bg-stone-900 rounded-xl border border-stone-850 space-y-2">
                              <span className="text-[9.5px] text-[#81b64c] font-black uppercase font-mono tracking-wider block">Inventori Kepingan Fragment Anda:</span>
                              <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-mono font-bold text-slate-350">
                                <div className="bg-[#1c1a19] p-2 rounded flex justify-between border border-stone-800">
                                  <span>Ksatria Emas:</span>
                                  <span className="text-amber-400 font-extrabold">{myFragments['Golden Knight'] || 0}</span>
                                </div>
                                <div className="bg-[#1c1a19] p-2 rounded flex justify-between border border-stone-800">
                                  <span>Retro 8-Bit:</span>
                                  <span className="text-amber-400 font-extrabold">{myFragments['Retro 8-bit'] || 0}</span>
                                </div>
                                <div className="bg-[#1c1a19] p-2 rounded flex justify-between border border-stone-805">
                                  <span>Neon Epic:</span>
                                  <span className="text-amber-400 font-extrabold">{myFragments['Neon Skin'] || 0}</span>
                                </div>
                                <div className="bg-[#1c1a19] p-2 rounded flex justify-between border border-stone-805">
                                  <span>Cosmosis Mythic:</span>
                                  <span className="text-amber-400 font-extrabold">{myFragments['Cosmosis Nebula'] || 0}</span>
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
                                className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-black text-[8.5px] uppercase rounded-lg transition text-center cursor-pointer block border-none font-sans"
                              >
                                BELI KOTAK FRAGMENT ACAL (+1 FRAGMENT) - 250 KOIN
                              </button>
                            </div>

                            <div className="space-y-3.5">
                              {fragmentRequests
                                .filter(req => guildMembers.some(member => member.name === req.name))
                                .map((item) => {
                                  const progressPercent = Math.min(100, (item.currentProgress / item.maxProgress) * 100);
                                  return (
                                    <div key={item.id} className="p-4 bg-[#262421] hover:bg-[#2c2925] border border-stone-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                                      <div className="space-y-2 w-full sm:w-auto">
                                        <div className="flex items-center gap-2">
                                          <span className="font-extrabold text-white text-xs">{item.name}</span>
                                          <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 bg-stone-900 text-[#81b64c] rounded-md font-mono">
                                            {item.currentProgress}/{item.maxProgress}
                                          </span>
                                        </div>

                                        {/* Graphic Progress Bar */}
                                        <div className="w-48 bg-stone-900 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-[#81b64c] h-full rounded-full transition-all duration-300" 
                                            style={{ width: `${progressPercent}%` }}
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[10px] text-indigo-400 font-extrabold block uppercase tracking-wide">
                                            Meminta: Fragment {item.skin}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                                            Hadiah Imbalan Akurasi: <span className="text-[#81b64c] font-bold">+{item.coinsVal} Koin</span>
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          const hasItem = (myFragments[item.skin] || 0) > 0;
                                          if (!hasItem) {
                                            triggerAudio('error');
                                            triggerReward(0, `Donasi Gagal! Anda tidak memiliki Kepingan Fragment "${item.skin.toUpperCase()}" di bagasi Anda. Silakan beli Kotak Fragment terlebih dahulu.`, 'error');
                                            return;
                                          }

                                          // Deduct inventory
                                          setMyFragments(prev => {
                                            const next = { ...prev, [item.skin]: prev[item.skin] - 1 };
                                            localStorage.setItem('my_fragment_inventory', JSON.stringify(next));
                                            return next;
                                          });

                                          // Reward Coins
                                          setCoins(c => {
                                            const next = c + item.coinsVal;
                                            localStorage.setItem('coins', String(next));
                                            return next;
                                          });

                                          // Increment Request Progress
                                          setFragmentRequests(prev => {
                                            const updated = prev.map(r => {
                                              if (r.id === item.id) {
                                                return { ...r, currentProgress: Math.min(r.maxProgress, r.currentProgress + 1) };
                                              }
                                              return r;
                                            }).filter(r => r.currentProgress < r.maxProgress); // Auto remove if fulfilled!
                                            return updated;
                                          });

                                          // Log
                                          setGuildLogs([`Anda mendonasikan kepingan fragment ke ${item.name}. +${item.coinsVal} Coins!`, ...guildLogs]);

                                          // Chat confirmation
                                          setGuildChatMessages(prev => [
                                            ...prev,
                                            { 
                                              sender: item.name, 
                                              text: `Terimakasih banyak pimpinan @${username} atas donasi fragmentnya! Sangat membantu perjuangan saya.`, 
                                              time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' }) 
                                            }
                                          ]);

                                          triggerAudio('win');
                                          triggerReward(20, `Donasi Sukses! Dikirim ke ${item.name}: +${item.coinsVal} Coins Tabungan!`, 'success');
                                        }}
                                        className="px-4 py-2 bg-[#81b64c] hover:bg-[#6c9c3e] text-white font-black text-[9px] uppercase rounded-xl transition duration-150 shadow-md transform hover:translate-y-[-1px] active:translate-y-[1px] shrink-0 cursor-pointer text-center font-sans border-none"
                                      >
                                        Bantu Donasi
                                      </button>
                                    </div>
                                  );
                                })}

                              {fragmentRequests.filter(req => guildMembers.some(member => member.name === req.name)).length === 0 && (
                                <div className="text-center py-6 text-xs text-slate-500 uppercase font-black tracking-wider font-mono">
                                  Tidak ada permintaan fragment yang aktif saat ini dari anggota klan Anda.
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* SUBPAGE: CHAT */}
                    {guildSubPage === 'chat' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 7 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-4 font-sans"
                      >
                        <div className="bg-[#262421] p-5 rounded-2xl border border-stone-850 space-y-3.5">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-stone-850 pb-2.5 leading-none">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Pesan Ruang Obrolan Interaktif Suku Klan ({Math.max(1, (guildMembers || []).length)} Online)
                            </span>
                            <span className="text-[9px] font-mono text-[#81b64c] font-black uppercase">● ONLINE REALTIME</span>
                          </h4>
                          <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1 bg-[#161514] p-3.5 rounded-2xl border border-stone-850">
                            {guildChatMessages.length === 0 ? (
                              <div className="text-center py-6 text-stone-500 text-xs italic">
                                Belum ada obrolan suku. Mulai sapa klan Anda sekarang!
                              </div>
                            ) : (
                              guildChatMessages.map((msg, idx) => {
                                const details = getUserDetails(msg.sender);
                                const isSelf = msg.sender?.toLowerCase() === username?.toLowerCase();

                                return (
                                  <div 
                                    key={idx} 
                                    className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                                  >
                                    <AvatarWithFrame
                                      src={details.avatar}
                                      frameId={details.frameId}
                                      size="xs"
                                    />
                                    <div className={`max-w-[80%] space-y-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                                      <div className={`flex items-center gap-1.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                        <span className={`font-extrabold text-[11px] ${isSelf ? 'text-[#81b64c]' : 'text-amber-400'}`}>
                                          {isSelf ? 'Anda (Kamu)' : msg.sender}
                                        </span>
                                        <span className="text-[8px] text-stone-500 font-mono">{msg.time}</span>
                                      </div>
                                      <div className={`p-3 rounded-2xl text-xs font-sans leading-relaxed text-white inline-block text-left shadow-sm ${
                                        isSelf 
                                          ? 'bg-gradient-to-r from-[#81b64c]/20 to-[#81b64c]/10 border border-[#81b64c]/40 rounded-tr-none' 
                                          : 'bg-[#1c1a19] border border-stone-800 rounded-tl-none'
                                      }`}>
                                        {msg.text}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Message input */}
                          <div className="flex gap-2">
                            <input 
                              id="f3140-chat-input"
                              type="text"
                              placeholder="Ketik pesan chat klan..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const text = e.currentTarget.value;
                                  if (!text.trim()) return;
                                  
                                  const timeStr = new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' });
                                  setGuildChatMessages(prev => [...prev, { sender: username, text: text, time: timeStr }]);
                                  e.currentTarget.value = '';
                                  triggerAudio('move');
                                }
                              }}
                              className="flex-1 bg-[#1a1817] border border-stone-800 p-2.5 px-3.5 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#81b64c] transition"
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById('f3140-chat-input') as HTMLInputElement;
                                if (el && el.value.trim()) {
                                  const timeStr = new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' });
                                  setGuildChatMessages(prev => [...prev, { sender: username, text: el.value.trim(), time: timeStr }]);
                                  el.value = '';
                                  triggerAudio('move');
                                }
                              }}
                              className="px-4 py-2.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer shadow flex items-center justify-center shrink-0"
                            >
                              Kirim
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )} {/* Closes legacy hidden wrapper */}

              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            TAB: TOURNAMENT MINGGUAN (FEATURE 31)
            ========================================================================= */}
        {activeTab === 'tournament' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2">
                <span className="text-[9px] font-black tracking-wider text-yellow-500 uppercase block font-mono">
                  {prefLang === 'en' ? 'PAL MATE NATIONAL CHESS LEAGUE' : 'LIGA CATUR NASIONAL PAL MATE'}
                </span>
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-1.5">
                  <Trophy className="w-5.5 h-5.5 text-yellow-500" /> Turnamen Catur Braket Mingguan
                </h3>
                <p className="text-xs text-slate-400 max-w-xl font-medium">
                  Masuki panggung kejuaraan turnamen sistem eliminasi gugur knockout 8 pemain. 
                  Lawan bots catur elite dan rebut tahta kura master untuk mengantongi koin saku dan berlian melimpah!
                </p>
                <div className="flex gap-4 pt-1 text-[10px] text-slate-400 font-bold uppercase font-mono">
                  <span> Gelar Juara: {tourneyHistory} Kali</span>
                  <span>Koin Hadiah: +500 Coin & +15 Diamond</span>
                </div>
              </div>

              {!tourneyActive ? (
                <button
                  onClick={startTournament}
                  className="px-6 py-3 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold text-xs rounded-xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 uppercase tracking-wide cursor-pointer text-center shrink-0"
                >
                  Daftar Turnamen (200 Coin)
                </button>
              ) : (
                <button
                  onClick={cancelTournament}
                  className="px-5 py-2.5 bg-red-950 hover:bg-red-900 border border-red-900/40 text-red-200 font-extrabold text-xs rounded-xl cursor-not-allowed uppercase shrink-0"
                >
                  Batalkan & Gugur
                </button>
              )}
            </div>

            {tourneyActive && (
              <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-6">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Visualisasi Braket Gugur Turnamen</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Babak Saat Ini: <span className="text-white font-extrabold uppercase">{tourneyRound}</span>. Klik tombol Tanding di bawah lawan tangguh Anda.</p>
                </div>

                {/* Tournament tree graphics mock mockup lines */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  
                  {/* QUARTER FINALS COLUMN */}
                  <div className="space-y-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider text-center border-b border-[#3c3934]/40 pb-1">Quarterfinals (Babak 8)</span>
                    {tourneyMatches.filter(m => m.round === 'quarter').map((m, i) => {
                      const isUserTurn = m.isUserMatch && tourneyRound === 'quarter';
                      return (
                        <div key={m.id} className={`p-3 rounded-xl border ${isUserTurn ? 'border-yellow-500 bg-[#262421]/90 shadow-md animate-pulse' : 'border-[#3c3934] bg-black/10'}`}>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-300">
                              <span className={m.winner === m.p1 ? 'text-[#81b64c]' : ''}>{m.p1}</span>
                              <span className="font-mono text-slate-400">{m.score1 !== undefined ? m.score1 : '-'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-300 border-t border-[#3c3934]/30 pt-1">
                              <span className={m.winner === m.p2 ? 'text-[#81b64c]' : ''}>{m.p2}</span>
                              <span className="font-mono text-slate-400">{m.score2 !== undefined ? m.score2 : '-'}</span>
                            </div>
                          </div>
                          {isUserTurn && !m.winner && (
                            <button
                              onClick={() => handlePlayTournamentMatch(m)}
                              className="w-full mt-2 py-1 bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-black text-[9px] uppercase tracking-wide rounded-md cursor-pointer"
                            >
                              Tanding Dewa Kipas
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* SEMI FINALS COLUMN */}
                  <div className="space-y-4 md:mt-8">
                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider text-center border-b border-[#3c3934]/40 pb-1">Semifinals (Babak 4)</span>
                    {tourneyMatches.filter(m => m.round === 'semi').map((m, i) => {
                      const isUserTurn = m.isUserMatch && tourneyRound === 'semi';
                      return (
                        <div key={m.id} className={`p-3 rounded-xl border ${isUserTurn ? 'border-yellow-500 bg-[#262421]/90 shadow-md animate-pulse' : 'border-[#3c3934] bg-black/10'}`}>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-305">
                              <span className={m.winner === m.p1 ? 'text-[#81b64c]' : ''}>{m.p1}</span>
                              <span className="font-mono text-slate-400">{m.score1 !== undefined ? m.score1 : '-'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-305 border-t border-[#3c3934]/30 pt-1">
                              <span className={m.winner === m.p2 ? 'text-[#81b64c]' : ''}>{m.p2}</span>
                              <span className="font-mono text-slate-400">{m.score2 !== undefined ? m.score2 : '-'}</span>
                            </div>
                          </div>
                          {isUserTurn && !m.winner && (
                            <button
                              onClick={() => handlePlayTournamentMatch(m)}
                              className="w-full mt-2 py-1 bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-black text-[9px] uppercase tracking-wide rounded-md cursor-pointer"
                            >
                              Tanding Naufal Catur
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {tourneyMatches.filter(m => m.round === 'semi').length === 0 && (
                      <span className="text-[9px] text-center italic block text-slate-500 pt-6">Menunggu babak perempat selesai...</span>
                    )}
                  </div>

                  {/* GRAND FINAL COLUMN */}
                  <div className="space-y-4 md:mt-16">
                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider text-center border-b border-[#3c3934]/40 pb-1">Grand Final (Juara 1)</span>
                    {tourneyMatches.filter(m => m.round === 'final').map((m, i) => {
                      const isUserTurn = m.isUserMatch && tourneyRound === 'final';
                      return (
                        <div key={m.id} className={`p-3 rounded-xl border ${isUserTurn ? 'border-yellow-500 bg-[#262421]/90 shadow-md animate-pulse' : 'border-[#3c3934] bg-black/10'}`}>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-305">
                              <span className={m.winner === m.p1 ? 'text-[#81b64c]' : ''}>{m.p1}</span>
                              <span className="font-mono text-slate-400">{m.score1 !== undefined ? m.score1 : '-'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-305 border-t border-[#3c3934]/30 pt-1">
                              <span className={m.winner === m.p2 ? 'text-[#81b64c]' : ''}>{m.p2}</span>
                              <span className="font-mono text-slate-400">{m.score2 !== undefined ? m.score2 : '-'}</span>
                            </div>
                          </div>
                          {isUserTurn && !m.winner && (
                            <button
                              onClick={() => handlePlayTournamentMatch(m)}
                              className="w-full mt-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-md cursor-pointer"
                            >
                              Tanding Catur Overlord
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {tourneyMatches.filter(m => m.round === 'final').length === 0 && (
                      <span className="text-[9px] text-center italic block text-slate-500 pt-10">Menunggu babak semifinal selesai...</span>
                    )}

                    {/* CHAMPION HOOD */}
                    {tourneyRound === 'winner' && (
                      <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500 rounded-2xl text-center space-y-2">
                        <Trophy className="w-8 h-8 text-yellow-500 animate-bounce mx-auto" />
                        <h5 className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">KAMPION MAHADESA</h5>
                        <p className="text-[10px] text-white font-extrabold">{username}</p>
                        <button
                          onClick={cancelTournament}
                          className="px-4 py-1.5 bg-[#81b64c] hover:bg-[#9cbd82] text-white text-[9px] uppercase font-black rounded-lg transition-all cursor-pointer"
                        >
                          Selesai & Tutup
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            TAB: DISCUSSION FORUM (FEATURE 33)
            ========================================================================= */}
        {activeTab === 'posts' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
          >
            
            {/* LEFT COLUMN: ACTIVE DISCUSSION FORM */}
            <div className="md:col-span-4 bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {prefLang === 'en' ? 'Share Strategy & Analysis' : 'Bagikan Strategi & Analisa'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  {prefLang === 'en' ? 'Post tactics, ask for visual analysis, or share your opening tips.' : 'Kirim taktik jitu, minta umpan balik visual analisis, atau bagikan tip opening catur Anda.'}
                </p>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                    {prefLang === 'en' ? 'Strategy Title' : 'Judul Strategi'}
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder={prefLang === 'en' ? 'Example: Queens Gambit for 1200 ELO' : 'Contoh: Gambit Menteri Untuk ELO 1200'}
                    className="w-full p-2.5 bg-[#1c1a19] border border-[#3c3934] focus:border-[#81b64c] text-xs text-white rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                    {prefLang === 'en' ? 'Tactics Category' : 'Kategori Taktik'}
                  </label>
                  <select
                    value={newPostCat}
                    onChange={(e: any) => setNewPostCat(e.target.value)}
                    className="w-full p-2.5 bg-[#1c1a19] border border-[#3c3934] text-xs text-slate-300 font-extrabold rounded-xl focus:outline-none"
                  >
                    <option value="Analisa Match">
                      {prefLang === 'en' ? 'Match Analysis' : 'Cari Analisa Tanding Board'}
                    </option>
                    <option value="Pembukaan Catur">
                      {prefLang === 'en' ? 'Chess Openings' : 'Buku Pembukaan Catur Klasik'}
                    </option>
                    <option value="Tips Taktik">
                      {prefLang === 'en' ? 'Tactics & Traps' : 'Otak Tips Taktik & Jebakan'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                    {prefLang === 'en' ? 'Tactics Description' : 'Narasi Deskripsi Taktik'}
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={prefLang === 'en' ? 'Write detailed chess coordinate steps here...' : 'Tulis detail langkah koordinat catur di sini...'}
                    rows={4}
                    className="w-full p-2.5 bg-[#1c1a19] border border-[#3c3934] focus:border-[#81b64c] text-xs text-slate-205 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white text-xs font-black uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {prefLang === 'en' ? 'Submit Forum Post' : 'Kirim Postingan Forum'}
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: DISCUSSION BOARD CHANNELS */}
            <div className="md:col-span-8 space-y-4">
              {!Array.isArray(chessPosts) || chessPosts.length === 0 ? (
                <div className="bg-[#312e2b] p-8 rounded-3xl border border-[#3c3934] text-center space-y-3">
                  <MessageSquare className="w-10 h-10 text-[#81b64c] mx-auto" />
                  <h4 className="text-white text-xs font-black uppercase tracking-wider">
                    {prefLang === 'en' ? 'Chess Analysis Forum is Empty' : 'Forum Analisis Catur Kosong'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal max-w-sm mx-auto">
                    {prefLang === 'en' ? 'No theory, tactics, or opening posts in this forum yet. Be the first to share!' : 'Belum ada postingan teori, taktik, atau pembukaan catur di forum ini. Jadilah pemain pertama yang membagikan analisamu menggunakan formulir di sebelah kiri!'}
                  </p>
                </div>
              ) : (
                (Array.isArray(chessPosts) ? chessPosts : []).map((post) => {
                  const authorDetails = getUserDetails(post.author);
                  return (
                    <div key={post.id} className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <AvatarWithFrame
                            src={authorDetails.avatar}
                            frameId={authorDetails.frameId}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-white">{post.author}</h4>
                              <span className="text-[8px] font-black bg-stone-900 border border-stone-800 text-yellow-500 px-1.5 py-0.5 rounded">
                                LVL {authorDetails.lvl || post.lvl}
                              </span>
                            </div>
                            <span className="text-[8.5px] text-[#81b64c] font-black tracking-wider uppercase font-mono">{post.category}</span>
                          </div>
                        </div>

                      <div className="flex items-center gap-2">
                        {/* Display count badge (read-only indicator) */}
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black text-amber-400 bg-black/30 border border-stone-800 flex items-center gap-1.5 shrink-0">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span>{post.likes} Suka</span>
                        </div>

                        {/* Interactive Like Toggle Button */}
                        <button 
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                            post.hasLiked 
                              ? 'bg-[#81b64c]/20 border-[#81b64c] text-[#81b64c] hover:bg-[#81b64c]/30 shadow-sm' 
                              : 'bg-[#1c1a19] border-[#3c3934] text-slate-400 hover:text-white hover:border-slate-500'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-[#81b64c]' : ''}`} />
                          <span>{post.hasLiked ? 'Disukai' : 'Suka'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-black text-white">{post.title}</h5>
                      <p className="text-[11.5px] text-slate-350 leading-relaxed font-medium font-sans whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* COMMENTS BOX */}
                    <div className="border-t border-[#3c3934]/40 pt-4 space-y-2">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wide">Umpan Balik Taktis Master ({(Array.isArray(post.comments) ? post.comments : []).length})</span>
                      <div className="space-y-2">
                        {(Array.isArray(post.comments) ? post.comments : []).map((comment, cIndex) => {
                          const details = getUserDetails(comment.user);
                          return (
                            <div key={cIndex} className="p-2.5 bg-black/15 rounded-xl border border-stone-800/80 text-[10.5px] flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <AvatarWithFrame
                                  src={details.avatar}
                                  frameId={details.frameId}
                                  size="xs"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-[#cdc2af]">{comment.user}</span>
                                    <span className="text-[7px] font-black bg-stone-900 border border-stone-800 text-yellow-500 px-1.5 py-0.2 rounded font-mono">
                                      LVL {details.lvl}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 font-semibold mt-0.5">{comment.text}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Append mock comment */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Tambahkan umpan balik taktis..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              if (!input.value.trim()) return;
                              
                              const updatedPosts = chessPosts.map(p => {
                                if (p.id === post.id) {
                                  const existingComments = Array.isArray(p.comments) ? p.comments : [];
                                  return {
                                    ...p,
                                    comments: [...existingComments, { user: username || 'Guest', text: input.value.trim() }]
                                  };
                                }
                                return p;
                              });
                              setChessPosts(updatedPosts);
                              input.value = '';
                              triggerAudio('move');
                            }
                          }}
                          className="flex-1 bg-[#1c1a19] border border-[#3c3934] text-[10px] p-2 rounded-lg text-white focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>
                );
              })
              )}
            </div>

          </motion.div>
        )}

        {/* =========================================================================
            TAB: FLASH SALES & GIFT FRIEND (FEATURE 40 & 39)
            ========================================================================= */}
        {activeTab === 'deals' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* DIRECT FRIEND GIFTING & AFFINITY SYSTEM (FEATURE 39) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT HALF: Gifting form & Friend selection */}
              <div className="lg:col-span-7 bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-5">
                <div>
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Gift className="w-4.5 h-4.5 text-indigo-400" /> Kirim Hadiah Sosial (Gifting)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Salurkan koin persahabatan atau item berharga kepada sahabat catur untuk mempererat sportivitas!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-450 block mb-1">Teman Penerima</label>
                    <select
                      value={giftTargetUser}
                      onChange={(e) => setGiftTargetUser(e.target.value)}
                      className="w-full bg-[#1c1a19] border border-[#3c3934] text-xs p-2.5 rounded-xl text-slate-200 font-extrabold focus:outline-none focus:border-indigo-400"
                    >
                      {friendsList && friendsList.length > 0 ? (
                        friendsList.map(f => (
                          <option key={f.username || f.name} value={f.username || f.name}>
                            {f.username || f.name} (Rekan Duel)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Belum ada rekan duel terhubung</option>
                      )}
                      {realPlayers && realPlayers.length > 0 && (
                        <optgroup label="Pemain Online Teraktif">
                          {realPlayers.map(p => (
                            <option key={p.name} value={p.name}>{p.name} (Pemain Online)</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-455 block mb-1">Pilih Item Hadiah</label>
                    <select
                      value={selectedGiftId}
                      onChange={(e: any) => setSelectedGiftId(e.target.value)}
                      className="w-full bg-[#1c1a19] border border-[#3c3934] text-xs p-2.5 rounded-xl text-slate-200 font-extrabold focus:outline-none focus:border-indigo-400"
                    >
                      <option value="coffee">Paket Kopi Hangat (Cost: 50 Coin / +50 Afinitas)</option>
                      <option value="book">Buku Taktik Catur (Cost: 120 Coin / +120 Afinitas)</option>
                      <option value="crystal">Piala Kristal Master (Cost: 15 Diamond / +400 Afinitas)</option>
                      <option value="crown">Mahkota Emas Elite (Cost: 35 Diamond / +1000 Afinitas)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-black text-slate-450 block mb-1">Pesan Sahabat</label>
                  <input
                    type="text"
                    value={giftMsgCustom}
                    onChange={(e) => setGiftMsgCustom(e.target.value)}
                    className="w-full bg-[#1c1a19] border border-[#3c3934] text-xs p-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-400"
                    placeholder="Ketik salam hangat atau kalimat penyemangat..."
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#3c3934]/35 gap-4">
                  <span className="text-[9px] text-slate-400 italic">Kirim ke Isna Caturia atau Rizky Hidayat untuk meningkatkan poin afinitas klan bersama!</span>
                  <button
                    onClick={handleSendGift}
                    className="px-5 py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-black uppercase text-[10px] rounded-xl cursor-pointer shadow-md transition-all active:translate-y-0.5"
                  >
                    Kirim Hadiah
                  </button>
                </div>

                {/* FRIEND AFFINITY DIRECTORIES */}
                <div className="pt-4 border-t border-[#3c3934]/30 space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Daftar Reputasi Pertemanan (Affinity Level)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(friendAffinities).map(([name, aff]) => {
                      const typedAff = aff as { points: number; level: number };
                      const nextLvlReq = typedAff.level * 100;
                      const progressPct = Math.min(100, (typedAff.points / nextLvlReq) * 100);
                      return (
                        <div key={name} className="p-3 bg-black/10 rounded-xl border border-stone-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">{name}</h4>
                              <span className="text-[8.5px] text-indigo-400 font-extrabold font-mono text-[9px]">Lvl {typedAff.level}</span>
                            </div>
                            <span className="text-[8.5px] text-slate-400 font-mono">{typedAff.points} / {nextLvlReq} Poin</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-[#1c1a19] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-350" style={{ width: `${progressPct}%` }} />
                          </div>
                          <span className="text-[8px] text-slate-455 font-medium block leading-normal">
                            {typedAff.level === 1 ? 'Mencapai Lvl 2 membuka: Bingkai Lava Magma' : 'Mencapai Lvl 3 membuka: Bonus Tabungan +150 Coin'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT HALF: Received Gifts / Kotak Masuk (CASH OUT SYSTEM) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
                <div>
                  <h3 className="text-xs font-black text-[#81b64c] uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-4.5 h-4.5 text-[#81b64c]" /> Kotak Masuk Hadiah (Redeem)
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1 font-semibold">Tunjangan hadiah dari rekan bermain. Cairkan hadiah premium langsung ke saldo koin atau diamond!</p>
                </div>

                <div className="space-y-3">
                  {receivedGifts.map((gift) => (
                    <div key={gift.id} className="p-3.5 bg-[#262421] rounded-2xl border border-stone-800/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-stone-900 border border-stone-800 text-yellow-400 font-mono">
                            {gift.isPremium ? 'Premium' : 'Biasa'}
                          </span>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono">Dari: {gift.from}</span>
                        </div>
                        <h4 className="text-xs font-black text-white mt-1.5">{gift.giftName}</h4>
                        <p className="text-[10px] italic text-slate-400 mt-1">"{gift.msg}"</p>
                      </div>

                      {/* Cash out buttons depending on gift type */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#3c3934]/30">
                        {gift.isPremium ? (
                          <>
                            <button
                              onClick={() => handleCashOutGift(gift, 'coins')}
                              className="flex-1 px-2 py-1.5 bg-[#3c3934] hover:bg-[#81b64c] text-[#81b64c] hover:text-white border border-[#4d4a44] text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                            >
                              Tukar Jadi Coin (+{gift.cashValueCoins})
                            </button>
                            <button
                              onClick={() => handleCashOutGift(gift, 'diamonds')}
                              className="flex-1 px-2 py-1.5 bg-indigo-950/40 hover:bg-indigo-600 text-indigo-450 hover:text-white border border-indigo-900 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                            >
                              Tukar Jadi Diamond (+{gift.cashValueDiamonds})
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenOrdinaryGift(gift)}
                            className="w-full px-2 py-1.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer text-center"
                          >
                            Buka Bingkisan (+{gift.affinityPoints} Afinitas)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {receivedGifts.length === 0 && (
                    <div className="p-8 text-center bg-black/10 rounded-2xl border border-dashed border-[#3c3934]/60 text-slate-500 uppercase text-[9px] font-black tracking-wider">
                      Kotak masuk Anda kosong. Sering bersosial dengan teman agar dikirimi balik beruntun!
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB: DETAILED STATS & HIDDEN ACHIEVEMENTS (FEATURE 37 & 36)
            ========================================================================= */}
        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* HISTORICAL TIMELINE SVG CHART (FEATURE 37) */}
            <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
              <div>
                <h3 className="text-xs font-black text-[#81b64c] uppercase tracking-widest flex items-center gap-1.5 leading-none">
                  <LineChart className="w-4.5 h-4.5 text-[#81b64c]" /> Telemetry & Perkembangan ELO Bersejarah
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Grafik kurva progression timeline performa ELO catur Anda sejak akun diaktivasi.</p>
              </div>

              {/* Dynamic SVG Drawing Path representation */}
              <div className="bg-[#262421] p-4 rounded-2xl border border-stone-800/80 relative">
                
                {/* SVG Curves Graph */}
                <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#3c3934" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#3c3934" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#3c3934" strokeWidth="0.8" strokeDasharray="3 3" />

                  {/* Rating Coordinates Path line */}
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="#81b64c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Glowing gradient indicators on dots */}
                  {chartData.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" className="fill-[#81b64c] stroke-white stroke-2" />
                      <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="fill-white font-mono font-black text-[9px]">{pt.val}</text>
                    </g>
                  ))}
                </svg>

                <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-bold uppercase mt-3">
                  <span>Start (Tgl Gabung)</span>
                  <span>Match Ke-5</span>
                  <span>Tanding Ke-10</span>
                  <span>Papan Saat Ini</span>
                </div>
              </div>

              {/* SPECIAL OPENING CHARACTER PLAYSTYLE TELEMETRIC INSIGHTS */}
              <div className="p-4 bg-black/10 rounded-2xl border border-[#3c3934]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] text-indigo-400 font-black uppercase tracking-wider block">Strategi Opening Terunggul</span>
                  <p className="text-sm font-black text-white mt-1">Salianan Sicilian Defense Perisai</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pertahanan sayap menteri yang sangat tangguh melunakkan tekanan serangan bot taktis.</p>
                </div>
                <div>
                  <span className="text-[8px] text-yellow-500 font-black uppercase tracking-wider block">Gaya Tanding Dominan</span>
                  <p className="text-sm font-black text-white mt-1">Aggressive Tactical Striker Serang</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Tercatat melakukan penekanan menteri dan pemotongan perwira sayap kanan terbanyak.</p>
                </div>
              </div>
            </div>

            {/* FEATURE 38: STREAK BONUS CONTINUOUS LOGINS VISUAL TRACKER CARDS */}
            <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3c3934]/60 pb-3">
                <div>
                  <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500/10" /> Evaluasi Streak & Akumulasi Bonus Harian
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Keaktifan masuk hari beruntun Anda. Login tanpa bolong untuk meledakkan pengganda reward!</p>
                </div>
                <div className="px-3 py-1 bg-orange-950/30 border border-orange-500/20 text-orange-400 font-extrabold text-[10px] font-mono rounded-lg uppercase flex items-center gap-1 shrink-0">
                  Konsistensi: {streak} Hari Beruntun
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Active Multiplier Reward Stat Block */}
                <div className="p-4 bg-[#262421] border border-stone-800 rounded-2xl space-y-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider">Aktif Pengganda XP</span>
                  <div className="text-xl font-black text-white flex items-baseline gap-1">
                    +{streak * 10} <span className="text-xs text-[#81b64c] font-extrabold uppercase font-sans">XP Bonus</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-relaxed font-semibold">Setiap Anda menekan tombol absensi harian, Anda langsung mengantongi {streak * 10} XP ekstra secara gratis.</p>
                </div>

                {/* Active Multiplier Coins Stat Block */}
                <div className="p-4 bg-[#262421] border border-stone-800 rounded-2xl space-y-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider">Aktif Dividen Koin</span>
                  <div className="text-xl font-black text-white flex items-baseline gap-1">
                    +{streak * 25} <span className="text-xs text-yellow-450 font-extrabold uppercase font-sans">Koin Bonus</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-relaxed font-semibold">Tunjangan koin harian Anda meningkat hingga +{streak * 25} Koin gratis seiring bertambahnya streak beruntun Anda.</p>
                </div>

                {/* Next Streak Milestone Reward Block */}
                <div className="p-4 bg-gradient-to-br from-indigo-950/20 to-orange-950/20 border border-yellow-500/10 rounded-2xl space-y-2">
                  <span className="text-[8px] font-bold text-amber-400 uppercase block tracking-wider">Milestone Keaktifan Berikutnya</span>
                  <div className="text-xs font-black text-white flex items-center gap-1 uppercase">
                    Milestone 7 Hari Beruntun
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal font-semibold">
                    Klaim absensi hingga hari ke-7 berturut-turut untuk auto-unlock Keanggotaan Akun Premium Elit selama 7 hari + Refill koin bonus ganda!
                  </p>
                </div>

              </div>
            </div>

            {/* HIDDEN SECRET COMPLETION ACHIEVEMENTS (FEATURE 36) */}
            <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] space-y-4">
              <div>
                <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                  <Compass className="w-4.5 h-4.5 text-orange-400" /> Pencapaian Tersembunyi (Hidden Achievements)
                </h3>
                <p className="text-[10px] text-slate-450 mt-1 font-semibold">Misi misterius istimewa catur yang detail kelayakannya dirahasiakan penuh sampai sukses terbuka.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secretAchievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[9rem] relative overflow-hidden ${
                      ach.unlocked 
                        ? 'bg-gradient-to-br from-indigo-950/20 to-orange-950/20 border-yellow-500/50 shadow-md shadow-yellow-500/5' 
                        : 'bg-black/10 border-dashed border-[#3c3934]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                          ach.unlocked 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                            : 'bg-stone-900 text-stone-500 border-transparent'
                        }`}>
                          {ach.unlocked ? ' TERBUKA' : 'Terkunci TERKUNCI'}
                        </span>
                        {ach.unlocked ? (
                          <Sparkles className="w-4.5 h-4.5 text-yellow-500" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>

                      {ach.unlocked ? (
                        <>
                          <h4 className="font-extrabold text-white text-xs mt-3">{ach.title}</h4>
                          <p className="text-[9.5px] text-slate-350 leading-relaxed mt-1 font-semibold">{ach.hint}</p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-extrabold text-[#7c776e] text-xs mt-3">Terkunci INFORMASI SANGAT RAHASIA</h4>
                          <p className="text-[9px] text-[#555149] leading-relaxed mt-1 font-mono">{ach.hint.replace(/[a-zA-Z]/g, '*')}</p>
                        </>
                      )}
                    </div>

                    <div className="mt-3.5 pt-2 border-t border-[#3c3934]/30 flex justify-between items-center text-[8.5px]">
                      <span className="text-slate-500 font-mono">Hadiah Klaim</span>
                      <span className={ach.unlocked ? 'text-yellow-400 font-black' : 'text-[#7c776e] font-bold'}>{ach.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled custom confirm modal inside iframe */}
      {customConfirm && customConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#262421] border-2 border-[#3c3934] rounded-2xl p-6 max-w-sm w-full text-center shadow-xl space-y-4">
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">{customConfirm.title}</h3>
            <p className="text-xs text-stone-300 leading-relaxed font-semibold leading-[1.3]">{customConfirm.message}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition-all min-w-[100px]"
              >
                {customConfirm.confirmText || "Ya"}
              </button>
              <button
                onClick={() => {
                  if (customConfirm.onCancel) {
                    customConfirm.onCancel();
                  }
                  setCustomConfirm(null);
                }}
                className="px-4 py-2 bg-[#1c1a19] hover:bg-[#3c3934] text-slate-400 border border-[#3c3934] font-black text-[10px] uppercase rounded-lg cursor-pointer transition-all min-w-[100px]"
              >
                {customConfirm.cancelText || "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
