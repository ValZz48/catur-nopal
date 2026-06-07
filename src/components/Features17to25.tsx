import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { 
  History, Crown, Heart, Sparkles, Award, Shield, Gift, MessageSquare, 
  Play, Pause, SkipBack, SkipForward, ChevronRight, Trophy, Coins, Gem, 
  RotateCcw, Check, Bookmark, Lock, ArrowRight, Star, HeartCrack, Users, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChessPiece } from './ChessPieces';
import { toSquare } from '../utils';

// ==========================================
// TYPES & CONSTELLATIONS FOR FEATURES 17-25
// ==========================================

export interface BookmarkedStep {
  id: string;
  matchId: string;
  opponentName: string;
  movesBefore: string[];
  currentMove: string;
  note: string;
  timestamp: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'offline' | 'online-idle' | 'online-playing';
  gameSnippet?: {
    playerColor: 'w' | 'b';
    moves: string[];
    opponent: string;
  };
  affinityXp: number;
  affinityLevel: number;
}

export interface SeasonPassReward {
  level: number;
  freeReward: { type: 'coins' | 'diamonds' | 'title'; amount: number; name: string };
  premiumReward: { type: 'coins' | 'diamonds' | 'title'; amount: number; name: string };
}

export interface RankTier {
  name: string;
  minElo: number;
  maxElo: number;
  color: string;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardTitle: string;
}

const RANK_TIERS: RankTier[] = [
  { name: "Warrior Chess", minElo: 400, maxElo: 499, color: "text-amber-700", rewardCoins: 150, rewardDiamonds: 8, rewardTitle: "Warrior Arena" },
  { name: "Elite Chess", minElo: 500, maxElo: 799, color: "text-slate-400", rewardCoins: 400, rewardDiamonds: 20, rewardTitle: "Perwira Elite" },
  { name: "Master Chess", minElo: 800, maxElo: 1099, color: "text-yellow-500", rewardCoins: 800, rewardDiamonds: 40, rewardTitle: "Master Taktik" },
  { name: "Grandmaster Chess", minElo: 1100, maxElo: 1399, color: "text-cyan-400", rewardCoins: 1500, rewardDiamonds: 80, rewardTitle: "Grandmaster Akbar" },
  { name: "Epic Chess", minElo: 1400, maxElo: 1699, color: "text-[#4dabf7]", rewardCoins: 2500, rewardDiamonds: 120, rewardTitle: "Epic Catur Legenda" },
  { name: "Legend Chess", minElo: 1700, maxElo: 1999, color: "text-purple-400", rewardCoins: 4000, rewardDiamonds: 200, rewardTitle: "Penguasa Arena Legend" },
  { name: "Mythic Glory Chess", minElo: 2000, maxElo: 9999, color: "text-rose-500 font-extrabold animate-pulse", rewardCoins: 6000, rewardDiamonds: 350, rewardTitle: "Dewa Mythic Glory" }
];

const SEASON_PASS_REWARDS: SeasonPassReward[] = [
  { level: 1, freeReward: { type: 'coins', amount: 120, name: "120 Koin Pemula" }, premiumReward: { type: 'diamonds', amount: 15, name: "15 Berlian + Akses Lintasan Elite (Bintang)" } },
  { level: 2, freeReward: { type: 'coins', amount: 180, name: "180 Koin Latihan" }, premiumReward: { type: 'title', amount: 0, name: "Bingkai Profil: Penantang Pass Kehormatan" } },
  { level: 3, freeReward: { type: 'diamonds', amount: 8, name: "8 Berlian Berkilau" }, premiumReward: { type: 'coins', amount: 1000, name: "1000 Koin Emas Penakluk (Emas)" } },
  { level: 4, freeReward: { type: 'coins', amount: 250, name: "250 Koin Tempur" }, premiumReward: { type: 'diamonds', amount: 30, name: "30 Berlian Elite Master" } },
  { level: 5, freeReward: { type: 'title', amount: 0, name: "Gelar: Pejuang Catur Nopal (Lencana)" }, premiumReward: { type: 'coins', amount: 1500, name: "1500 Koin + Gelembung Chat Kustom" } },
  { level: 6, freeReward: { type: 'coins', amount: 350, name: "350 Koin Tabungan" }, premiumReward: { type: 'diamonds', amount: 45, name: "45 Berlian Legendaris King" } },
  { level: 7, freeReward: { type: 'diamonds', amount: 12, name: "12 Berlian Berkilau" }, premiumReward: { type: 'title', amount: 0, name: "Gelar Elite: Panglima Perang Catur" } },
  { level: 8, freeReward: { type: 'coins', amount: 500, name: "500 Koin Tabungan" }, premiumReward: { type: 'coins', amount: 2500, name: "2500 Koin Emas Premium (Logam)" } },
  { level: 9, freeReward: { type: 'coins', amount: 650, name: "650 Koin Tabungan" }, premiumReward: { type: 'diamonds', amount: 75, name: "75 Berlian Elite Dewa Permata" } },
  { level: 10, freeReward: { type: 'title', amount: 0, name: "Gelar: Penguasa Arena Catur (Mahkota)" }, premiumReward: { type: 'title', amount: 0, name: "Skin Arena: Istana Catur Kerajaan Nopal" } }
];

export const getAffinityTitle = (lvl: number) => {
  switch (lvl) {
    case 1: return "Hubungan: Kenalan Catur";
    case 2: return "Hubungan: Teman Sparing";
    case 3: return "Hubungan: Teman Akrab";
    case 4: return "Hubungan: Rekan Terpercaya";
    case 5: return "Hubungan: Belahan Jiwa Catur";
    default: return "Hubungan: Kenalan Baru";
  }
};

interface FeaturesProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  membershipStatus: 'regular' | 'premium';
  onlineHistory: any[];
  setOnlineHistory: React.Dispatch<React.SetStateAction<any[]>>;
  onlineRating: number;
  setOnlineRating: React.Dispatch<React.SetStateAction<number>>;
  triggerAudio: (type: 'move' | 'capture' | 'win' | 'lose' | 'check' | 'castle') => void;
  triggerReward: (amount: number, message: string, type?: 'reward' | 'premium' | 'info' | 'success_no_xp' | 'level_up') => void;
  user: any;
  syncUserStats: (newElo: number, newXp: number, unlockedThs: string[], played: number, won: number) => void;
  
  passLevel: number;
  setPassLevel: React.Dispatch<React.SetStateAction<number>>;
  passXp: number;
  setPassXp: React.Dispatch<React.SetStateAction<number>>;
  passStatus: 'free' | 'premium' | 'deluxe';
  setPassStatus: React.Dispatch<React.SetStateAction<'free' | 'premium' | 'deluxe'>>;
  claimedPassRewards: string[];
  setClaimedPassRewards: React.Dispatch<React.SetStateAction<string[]>>;
  claimedRankRewards: string[];
  setClaimedRankRewards: React.Dispatch<React.SetStateAction<string[]>>;
  diamondSavings: number;
  setDiamondSavings: React.Dispatch<React.SetStateAction<number>>;
  friendsList: any[];
  setFriendsList: React.Dispatch<React.SetStateAction<any[]>>;
}

export const Features17to25: React.FC<FeaturesProps & { subTab: 'replay' | 'social' | 'rank' | 'pass' }> = ({
  coins, setCoins, diamonds, setDiamonds, xp, setXp, membershipStatus,
  onlineHistory, setOnlineHistory, onlineRating, setOnlineRating,
  triggerAudio, triggerReward, user, syncUserStats, subTab,
  passLevel, setPassLevel, passXp, setPassXp, passStatus, setPassStatus,
  claimedPassRewards, setClaimedPassRewards, claimedRankRewards, setClaimedRankRewards,
  diamondSavings, setDiamondSavings, friendsList, setFriendsList
}) => {

  // --- REPLAY CHESSBOARD STATES ---
  const [activeReplay, setActiveReplay] = useState<any | null>(null);
  const [replayMoveIdx, setReplayMoveIdx] = useState<number>(-1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [bookmarkedSteps, setBookmarkedSteps] = useState<BookmarkedStep[]>(() => {
    const saved = localStorage.getItem('chessBookmarkedSteps');
    return saved ? JSON.parse(saved) : [];
  });
  const [botAnalysis, setBotAnalysis] = useState<Record<string, string>>({});
  const [analyzingMove, setAnalyzingMove] = useState<boolean>(false);

  // --- SOCIAL STATES MAP TO ACTUAL friendsList ---
  const friends: Friend[] = friendsList.map((f: any, idx: number) => {
    // Determine a status based on map index
    const statusOpts: ('offline' | 'online-idle' | 'online-playing')[] = ['online-playing', 'online-idle', 'offline'];
    const simulatedStatus = statusOpts[idx % statusOpts.length];
    
    // Read local affinity states synchronized by friends username
    const simulatedAffinityKey = `affinity_${f.username}`;
    const savedAffinity = localStorage.getItem(simulatedAffinityKey);
    const parsedAffinity = savedAffinity ? JSON.parse(savedAffinity) : { xp: 120 * (idx + 1), level: (idx % 3) + 1 };

    const gameSnippet = simulatedStatus === 'online-playing' ? {
      playerColor: (idx % 2 === 0 ? 'w' : 'b') as 'w' | 'b',
      opponent: idx % 2 === 0 ? "Bot Catur Pro" : "Rival Sejati",
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3']
    } : undefined;

    return {
      id: f.username,
      name: f.username,
      avatar: f.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      status: simulatedStatus,
      affinityXp: parsedAffinity.xp,
      affinityLevel: parsedAffinity.level,
      gameSnippet
    };
  });

  const [activeSpectating, setActiveSpectating] = useState<Friend | null>(null);
  const [spectatorChat, setSpectatorChat] = useState<{ sender: string; text: string; isWhisper?: boolean }[]>([]);
  const [spectatorInput, setSpectatorInput] = useState<string>('');
  const [whisperTarget, setWhisperTarget] = useState<string>('semua');
  const [boardAnimMovesCount, setBoardAnimMovesCount] = useState<number>(0);

  // Simulated static received gifts in state - dynamically assigned to real friends to eliminate bots!
  const [receivedGifts, setReceivedGifts] = useState<{ id: string; sender: string; giftName: string; type: 'premium'; worth: 'coins' | 'diamonds'; worthAmount: number; claimed: boolean }[]>(() => {
    const saved = localStorage.getItem('receivedGifts');
    if (saved) return JSON.parse(saved);
    if (friendsList && friendsList.length > 0) {
      const realFriend = friendsList[0].username;
      return [
        { id: 'rg1', sender: realFriend, giftName: "Mahkota Kehormatan", type: 'premium', worth: 'coins', worthAmount: 1000, claimed: false },
        { id: 'rg2', sender: realFriend, giftName: "Kristal Raksasa", type: 'premium', worth: 'diamonds', worthAmount: 30, claimed: false },
      ];
    }
    return [];
  });

  const seasonTimer = "14 Hari, 5 Jam";

  // Replay Autoplay loop
  useEffect(() => {
    let timer: any = null;
    if (isPlayingAuto && activeReplay) {
      const moves = activeReplay.moves || ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'];
      timer = setInterval(() => {
        setReplayMoveIdx(prev => {
          if (prev >= moves.length - 1) {
            setIsPlayingAuto(false);
            return prev;
          }
          triggerAudio('move');
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlayingAuto, activeReplay]);

  // Spectator simulation movements loop
  useEffect(() => {
    let specTimer: any = null;
    if (activeSpectating) {
      specTimer = setInterval(() => {
        setBoardAnimMovesCount(prev => prev + 1);
        const remarks = [
          "Langkah posisional yang indah.",
          "Apakah benteng siap meluncur?",
          "Raja terlihat sangat terlindungi.",
          "Pion mulai merangsek perlahan.",
          "Menunggu kombinasi taktik serang.",
          "Langkah yang solid!"
        ];
        if (Math.random() > 0.6) {
          const names = ["PenasihatCatur", "SaksiBisu", "RookMaster", "KsatriaPion"];
          setSpectatorChat(prev => [
            ...prev,
            { sender: names[Math.floor(Math.random() * names.length)], text: remarks[Math.floor(Math.random() * remarks.length)] }
          ]);
        }
      }, 3500);
    }
    return () => clearInterval(specTimer);
  }, [activeSpectating]);

  // Replay board representation derived from Chess.js instance
  const getReplayBoard = () => {
    const chess = new Chess();
    if (!activeReplay) return chess.board();
    const moves = activeReplay.moves || ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'];
    for (let i = 0; i <= replayMoveIdx; i++) {
      try {
        chess.move(moves[i]);
      } catch (e) {
        // Fallback for custom notation errors
      }
    }
    return chess.board();
  };

  const getMoveCommentaryLocal = (move: string, index: number): string => {
    if (!move) return "Langkah sedang diperiksa...";
    if (move.includes('#')) return "Skakmat mutlak di papan, permainan berakhir dengan kemenangan telak!";
    if (move.includes('+')) return "Peringatan skak diberikan, Raja dalam keadaan terdesak.";
    if (move.includes('x')) return "Aksi makan perwira terjadi, tempo pertempuran semakin meningkat.";
    if (move.includes('O-O')) return "Pertahanan kokoh, Raja mengamankan diri di sudut papan catur.";
    if (move.startsWith('Q') || move.startsWith('q')) return "Menteri bergeser secara strategis mengontrol lajur krusial.";
    if (move.startsWith('N') || move.startsWith('n')) return "Kuda melompat melangkahi pion, menargetkan petak kunci.";
    if (move.startsWith('B') || move.startsWith('b')) return "Gajah memotong diagonal panjang menekan sayap pertahanan.";
    if (move.startsWith('R') || move.startsWith('r')) return "Benteng merayap masuk menduduki lajur vertikal sentral.";
    if (index === 0) return "Langkah pembuka menguasai ruang tengah papan.";
    if (index < 6) return "Pengembangan perwira minor dipersiapkan dengan matang.";
    return "Gerakan posisional penting untuk memperkuat dominasi teritorial.";
  };

  const fetchDeepAiCommentary = async (move: string, index: number) => {
    setAnalyzingMove(true);
    try {
      const response = await fetch('/api/chess/analyze-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move, moveIndex: index, opponent: activeReplay?.opponent })
      });
      const data = await response.json();
      if (data.commentary) {
        setBotAnalysis(prev => ({ ...prev, [`${index}_${move}`]: data.commentary }));
      } else {
        throw new Error();
      }
    } catch (e) {
      const fallback = getMoveCommentaryLocal(move, index) + " [Sistem Analis Cadangan Bergerak]";
      setBotAnalysis(prev => ({ ...prev, [`${index}_${move}`]: fallback }));
    } finally {
      setAnalyzingMove(false);
    }
  };

  const handleBookmarkStep = () => {
    if (!activeReplay) return;
    const moves = activeReplay.moves || [];
    const currentMove = moves[replayMoveIdx] || "Awal";
    const note = prompt("Tulis catatan atau label untuk langkah taktis catur ini:", "Langkah Kunci");
    if (note === null) return;
    
    const newBookmark: BookmarkedStep = {
      id: 'bm_' + Math.random().toString(36).substring(2, 9),
      matchId: activeReplay.id,
      opponentName: activeReplay.opponent,
      movesBefore: moves.slice(0, replayMoveIdx),
      currentMove,
      note: note.trim() || 'Tanda Khusus',
      timestamp: Date.now()
    };
    
    const nextBm = [...bookmarkedSteps, newBookmark];
    setBookmarkedSteps(nextBm);
    localStorage.setItem('chessBookmarkedSteps', JSON.stringify(nextBm));
    triggerReward(0, "Langkah taktis berhasil disimpan ke bookmark", "success_no_xp");
  };

  const getSpectateBoard = () => {
    if (!activeSpectating) return new Chess().board();
    const snippet = activeSpectating.gameSnippet || { playerColor: 'w', opponent: 'Guest', moves: ['e4'] };
    const specGame = new Chess();
    snippet.moves.forEach(m => {
      try { specGame.move(m); } catch(e){}
    });
    const simulatedExtra = ['a6', 'Bc4', 'h6', 'O-O', 'd6', 'h3', 'Be7', 'Be3'];
    for (let i = 0; i < Math.min(boardAnimMovesCount, simulatedExtra.length); i++) {
      try { specGame.move(simulatedExtra[i]); } catch(e){}
    }
    return specGame.board();
  };

  // Affinity gift handler using real global money and syncing with Simulated keys
  const handleSendGift = (gift: { name: string; cost: number; type: 'coins' | 'diamonds'; affinityXp: number }) => {
    if (gift.type === 'coins') {
      if (coins < gift.cost) {
        triggerReward(0, "Koin Anda tidak mencukupi untuk hadiah ini.", "info");
        return;
      }
      setCoins(prev => prev - gift.cost);
      localStorage.setItem('coins', String(coins - gift.cost));
    } else {
      if (diamonds < gift.cost) {
        triggerReward(0, "Berlian Anda tidak mencukupi untuk hadiah ini.", "info");
        return;
      }
      setDiamonds(prev => prev - gift.cost);
      localStorage.setItem('diamonds', String(diamonds - gift.cost));
    }

    if (activeSpectating) {
      const simulatedAffinityKey = `affinity_${activeSpectating.name}`;
      const savedAffinity = localStorage.getItem(simulatedAffinityKey);
      const parsedAffinity = savedAffinity ? JSON.parse(savedAffinity) : { xp: 120, level: 1 };
      
      const nextXp = parsedAffinity.xp + gift.affinityXp;
      const rawLvl = Math.floor(nextXp / 300) + 1;
      const nextLvl = Math.min(5, rawLvl);
      
      localStorage.setItem(simulatedAffinityKey, JSON.stringify({ xp: nextXp, level: nextLvl }));
      
      if (nextLvl > parsedAffinity.level) {
        setTimeout(() => {
          triggerReward(0, `Tingkat Hubungan Afinitas dengan ${activeSpectating.name} berhasil naik ke Level ${nextLvl}`, 'success_no_xp');
        }, 1000);
      }

      setSpectatorChat(prev => [
        ...prev,
        { sender: "Sistem", text: `Anda mengirimkan ${gift.name} kepada @${activeSpectating.name} (+${gift.affinityXp} Afinitas)` }
      ]);
      triggerAudio('capture');
    }
  };

  const handleClaimGiftCell = (id: string) => {
    const fGift = receivedGifts.find(g => g.id === id);
    if (!fGift || fGift.claimed) return;

    setReceivedGifts(prev => prev.map(g => g.id === id ? { ...g, claimed: true } : g));
    if (fGift.worth === 'coins') {
      setCoins(prev => prev + fGift.worthAmount);
      localStorage.setItem('coins', String(coins + fGift.worthAmount));
      triggerReward(0, `Berhasil mencairkan hadiah: Tambahan ${fGift.worthAmount} Koin ditambahkan ke saldo.`, 'success_no_xp');
    } else {
      setDiamonds(prev => prev + fGift.worthAmount);
      localStorage.setItem('diamonds', String(diamonds + fGift.worthAmount));
      triggerReward(0, `Berhasil mencairkan hadiah: Tambahan ${fGift.worthAmount} Berlian ditambahkan ke saldo.`, 'success_no_xp');
    }
  };

  const getCurrentRank = (elo: number): RankTier => {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (elo >= RANK_TIERS[i].minElo) return RANK_TIERS[i];
    }
    return RANK_TIERS[0];
  };

  const myRank = getCurrentRank(onlineRating);

  const handleClaimRankReward = (tier: RankTier) => {
    if (claimedRankRewards.includes(tier.name)) return;
    
    setClaimedRankRewards(prev => [...prev, tier.name]);
    setCoins(prev => prev + tier.rewardCoins);
    setDiamonds(prev => prev + tier.rewardDiamonds);
    localStorage.setItem('coins', String(coins + tier.rewardCoins));
    localStorage.setItem('diamonds', String(diamonds + tier.rewardDiamonds));

    triggerReward(0, `Kehormatan "${tier.rewardTitle}" diklaim: +${tier.rewardCoins} Koin dan +${tier.rewardDiamonds} Berlian.`, 'success_no_xp');
  };

  const simulateSeasonReset = () => {
    const bonusCoins = myRank.rewardCoins * 2;
    const bonusDiamonds = myRank.rewardDiamonds * 2;

    setCoins(prev => prev + bonusCoins);
    setDiamonds(prev => prev + bonusDiamonds);
    localStorage.setItem('coins', String(coins + bonusCoins));
    localStorage.setItem('diamonds', String(diamonds + bonusDiamonds));

    let nextElo = 400;
    if (onlineRating >= 200) {
      nextElo = Math.max(500, Math.floor(onlineRating * 0.65));
    }
    setOnlineRating(nextElo);
    localStorage.setItem('onlineRating', String(nextElo));

    triggerReward(0, `Season Berakhir! Pangkat catur ditata ulang ke ${getCurrentRank(nextElo).name}. Hadiah kotak akhir season diperoleh: +${bonusCoins} Koin dan +${bonusDiamonds} Berlian.`, 'level_up');
  };

  const handleBuyPass = (type: 'premium' | 'deluxe') => {
    const cost = type === 'premium' ? 150 : 250;
    if (diamonds < cost) {
      triggerReward(0, "Saldo Berlian Anda tidak mencukupi untuk mengaktifkan Season Pass.", "info");
      return;
    }
    
    setDiamonds(prev => prev - cost);
    localStorage.setItem('diamonds', String(diamonds - cost));
    setPassStatus(type);

    if (type === 'deluxe') {
      setPassLevel(10);
      triggerReward(0, "Deluxe Pass diaktifkan! Level langsung ditingkatkan ke 10 dan lintasan hadiah eksklusif terbuka penuh.", "level_up");
    } else {
      triggerReward(0, "Premium Pass berhasil diaktifkan! Dapatkan item kosmetik dan hadiah khusus catur.", "level_up");
    }
  };

  const simulateAddPassXp = () => {
    const nextXp = passXp + 50;
    if (nextXp >= 100) {
      setPassXp(nextXp - 100);
      setPassLevel(prev => Math.min(10, prev + 1));
      triggerReward(0, "Season Pass naik Level! Hadiah baru tersedia untuk diambil.", "level_up");
    } else {
      setPassXp(nextXp);
    }
  };

  const handleClaimPassReward = (lvl: number, type: 'free' | 'premium') => {
    const rewardId = `${lvl}_${type}`;
    if (claimedPassRewards.includes(rewardId)) return;

    const matchedReward = SEASON_PASS_REWARDS.find(r => r.level === lvl);
    if (!matchedReward) return;

    const rObj = type === 'free' ? matchedReward.freeReward : matchedReward.premiumReward;

    setClaimedPassRewards(prev => [...prev, rewardId]);
    if (rObj.type === 'coins') {
      setCoins(prev => prev + rObj.amount);
      localStorage.setItem('coins', String(coins + rObj.amount));
    } else if (rObj.type === 'diamonds') {
      setDiamonds(prev => prev + rObj.amount);
      localStorage.setItem('diamonds', String(diamonds + rObj.amount));
    }

    triggerReward(0, `Hadiah berhasil diperoleh: ${rObj.name}`, "success_no_xp");
  };

  const claimAllEligiblePassRewards = () => {
    let count = 0;
    SEASON_PASS_REWARDS.forEach(reward => {
      if (passLevel >= reward.level) {
        const freeId = `${reward.level}_free`;
        if (!claimedPassRewards.includes(freeId)) {
          handleClaimPassReward(reward.level, 'free');
          count++;
        }
        if (passStatus !== 'free') {
          const premId = `${reward.level}_premium`;
          if (!claimedPassRewards.includes(premId)) {
            handleClaimPassReward(reward.level, 'premium');
            count++;
          }
        }
      }
    });
    if (count > 0) {
      triggerReward(0, `Berhasil mengambil semua ${count} hadiah Season Pass sekaligus.`, 'success_no_xp');
    } else {
      triggerReward(0, `Belum ada hadiah baru yang bisa diambil saat ini.`, 'info');
    }
  };

  // --- AUTHENTIC TABUNGAN DIAMOND SYSTEM ---
  const tabunganLimit = 150; // Price of Premium Season Pass
  const thresholdClaim = tabunganLimit * 0.50; // 75 Berlian (50% rule)

  const currentPassMultiplier = passStatus === 'deluxe' ? 2.35 : (passStatus === 'premium' ? 1.75 : 1.0);

  // Take 20% limit of savings
  const dailyClaimAmount20 = Math.floor(diamondSavings * 0.20);

  const handleWithdrawSavings20 = () => {
    if (diamondSavings < thresholdClaim) {
      triggerReward(0, `Gagal menarik: Tabungan Diamond harus mencapai minimal 50% (${thresholdClaim} Berlian) dari batas maksimum.`, 'info');
      return;
    }
    if (dailyClaimAmount20 <= 0) {
      triggerReward(0, `Jumlah penarikan terlalu kecil.`, 'info');
      return;
    }

    // Confirm daily claim and execute
    setDiamonds(prev => prev + dailyClaimAmount20);
    setDiamondSavings(prev => prev - dailyClaimAmount20);
    triggerReward(0, `Berhasil dicairkan! Penarikan harian 20% sebanyak +${dailyClaimAmount20} Berlian telah ditransfer ke saldo utama Anda.`, 'success_no_xp');
  };

  const handleSimulateSeasonCairkan100 = () => {
    if (diamondSavings <= 0) {
      triggerReward(0, `Tabungan Diamond dalam keadaan kosong saat ini.`, 'info');
      return;
    }

    // Season reset grants 100% savings, reset pass parameters to simulate ganti season
    const totalClaimValue = diamondSavings;
    setDiamonds(prev => prev + totalClaimValue);
    setDiamondSavings(0);
    setPassLevel(1);
    setPassXp(0);
    triggerReward(0, `Simulasi Season Baru Berhasil! 100% isi tabungan sebanyak +${totalClaimValue} Berlian dicairkan penuh, level pass diatur ulang ke 1.`, 'level_up');
  };

  const simulateAccreteSavings = () => {
    const baseIncrement = 6;
    const finalIncrement = Math.round(baseIncrement * currentPassMultiplier);
    
    setDiamonds(prev => {
      const nextD = prev + finalIncrement;
      localStorage.setItem('diamonds', String(nextD));
      return nextD;
    });
    triggerReward(0, `Hasil tanding: +${finalIncrement} Berlian langsung ditambahkan ke saldo utama Anda!`, 'success_no_xp');
  };

  return (
    <div className="w-full text-slate-100 bg-[#1c1a19] p-4 rounded-3xl border border-[#3c3934]/65">
      
      {/* ----------------- REPLAY MATCH SECTION ----------------- */}
      {subTab === 'replay' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#3c3934] pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <History className="w-4 h-4 text-[#81b64c]" /> Replay dan Analisis Duel Pertandingan
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Tonton kembali pertandingan mabar Anda, ulas langkah terbaik, dan pelajari taktik jitu.</p>
            </div>
            {bookmarkedSteps.length > 0 && (
              <div className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
                <Bookmark className="w-3 h-3" /> {bookmarkedSteps.length} Bookmark
              </div>
            )}
          </div>

          {activeReplay ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#262421] p-4 rounded-2xl border border-[#3c3934]">
              {/* Board and layout */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center gap-3">
                <div className="w-full flex justify-between items-center px-2 py-1.5 bg-black/25 rounded-lg border border-[#3c3934]/40">
                  <span className="text-xs font-mono font-bold flex items-center gap-1">
                    Lawan: <span className="text-[#81b64c] font-black">{activeReplay.opponent}</span>
                  </span>
                  <span className="text-[10px] bg-[#3c3934] px-2 py-0.5 rounded text-slate-400 font-bold font-mono">
                    ELO {activeReplay.opponentElo}
                  </span>
                </div>

                <div className="w-full max-w-[320px] aspect-square relative border border-black/50 rounded-xl overflow-hidden shadow-inner bg-[#b58863]">
                  <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {getReplayBoard().map((rowArr, rIdx) => 
                      rowArr.map((cell, cIdx) => {
                        const isDark = (rIdx + cIdx) % 2 !== 0;
                        const squareName = toSquare(rIdx, cIdx);
                        return (
                          <div 
                            key={squareName} 
                            style={{ backgroundColor: isDark ? '#b58863' : '#f0d9b5' }}
                            className="relative flex items-center justify-center select-none"
                          >
                            {cell && (
                              <ChessPiece type={cell.type} color={cell.color} className="w-[85%] h-[85%]" skin="standard" />
                            )}
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] opacity-25 font-mono select-none">{squareName}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Replay board play controls */}
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  <button 
                    onClick={() => { setReplayMoveIdx(-1); setIsPlayingAuto(false); triggerAudio('move'); }}
                    disabled={replayMoveIdx < 0}
                    className="p-2.5 bg-[#312e2b] hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold transition-all border border-[#3c3934] cursor-pointer"
                  >
                    Awal
                  </button>
                  <button 
                    onClick={() => { setReplayMoveIdx(prev => Math.max(-1, prev - 1)); setIsPlayingAuto(false); triggerAudio('move'); }}
                    disabled={replayMoveIdx < 0}
                    className="p-2.5 bg-[#312e2b] hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold transition-all border border-[#3c3934] cursor-pointer"
                  >
                    Mundur
                  </button>
                  <button 
                    onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                    className="p-2.5 bg-[#81b64c] hover:bg-[#96cc5c] text-white rounded-lg font-black px-4 text-xs flex items-center gap-1 border border-[#5b8c34] cursor-pointer"
                  >
                    {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlayingAuto ? 'Jeda' : 'Mulai Replay'}
                  </button>
                  <button 
                    onClick={() => { 
                      const moves = activeReplay.moves || [];
                      setReplayMoveIdx(prev => Math.min(moves.length - 1, prev + 1)); 
                      setIsPlayingAuto(false); 
                      triggerAudio('move'); 
                    }}
                    disabled={replayMoveIdx >= (activeReplay.moves || []).length - 1}
                    className="p-2.5 bg-[#312e2b] hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold transition-all border border-[#3c3934] cursor-pointer"
                  >
                    Maju
                  </button>
                  <button 
                    onClick={() => { 
                      const moves = activeReplay.moves || [];
                      setReplayMoveIdx(moves.length - 1); 
                      setIsPlayingAuto(false); 
                      triggerAudio('move'); 
                    }}
                    disabled={replayMoveIdx >= (activeReplay.moves || []).length - 1}
                    className="p-2.5 bg-[#312e2b] hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold transition-all border border-[#3c3934] cursor-pointer"
                  >
                    Akhir
                  </button>
                </div>
              </div>

              {/* Steps details and Bot Commentary */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex justify-between items-center bg-black/15 p-2 rounded-xl">
                  <h4 className="text-xs font-black uppercase text-slate-350 tracking-wide">Daftar Langkah Duel</h4>
                  <button 
                    onClick={() => { setActiveReplay(null); setIsPlayingAuto(false); }}
                    className="text-[10px] text-red-400 font-extrabold hover:underline"
                  >
                    Keluar Replay
                  </button>
                </div>

                <div className="bg-[#1c1a19] p-3 rounded-xl border border-[#3c3934] max-h-[160px] overflow-y-auto font-mono text-2xs space-y-1 scrollbar-thin">
                  {activeReplay.moves && activeReplay.moves.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 grid-flow-row">
                      {activeReplay.moves.map((mv: string, idx: number) => {
                        const isCurrent = replayMoveIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => { setReplayMoveIdx(idx); setIsPlayingAuto(false); triggerAudio('move'); }}
                            className={`p-1.5 text-left rounded font-bold transition-colors truncate ${
                              isCurrent 
                                ? 'bg-[#81b64c] text-slate-950 font-black' 
                                : 'bg-[#262421] text-slate-300 hover:bg-[#312e2b]'
                            }`}
                          >
                            {idx + 1}. {mv}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-500 font-semibold italic text-center py-4">Langkah tidak ditemukan.</div>
                  )}
                </div>

                {/* Analysis commentary */}
                <div className="p-3.5 bg-black/20 rounded-xl border border-[#3c3934] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Analisis Papan Catur Nopal Bot
                    </span>
                    {replayMoveIdx >= 0 && (
                      <button
                        onClick={() => fetchDeepAiCommentary(activeReplay.moves[replayMoveIdx], replayMoveIdx)}
                        disabled={analyzingMove}
                        className="px-2 py-0.5 bg-[#81b64c] hover:bg-[#72a343] text-black text-[9px] font-black uppercase rounded-md transition-all"
                      >
                        {analyzingMove ? 'Berpikir...' : 'Analisis AI'}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {replayMoveIdx === -1 ? (
                      "Pilih langkah untuk memulai simulasi penelaahan bot taktis."
                    ) : (
                      botAnalysis[`${replayMoveIdx}_${activeReplay.moves[replayMoveIdx]}`] || 
                      getMoveCommentaryLocal(activeReplay.moves[replayMoveIdx], replayMoveIdx)
                    )}
                  </p>

                  {replayMoveIdx >= 0 && (
                    <button
                      onClick={handleBookmarkStep}
                      className="w-full py-1.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] text-slate-200 text-[10px] font-black uppercase rounded-lg tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-yellow-500" /> Bookmark Langkah Ini
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-10 bg-[#262421] rounded-2xl border border-[#3c3934] text-center space-y-3">
                <History className="w-12 h-12 text-slate-500 mx-auto" />
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-300">Belum ada tayangan replay yang aktif</h4>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto font-semibold">Pilih salah satu hasil duel di bawah untuk memuat tayangan papan interaktif dan langkah taktis analisis bot catur.</p>
              </div>

              {/* LIST OF HISTORICAL DUELS */}
              <div className="bg-[#262421] rounded-2xl p-4 border border-[#3c3934] space-y-3.5">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Riwayat Pertandingan Sebelumnya</h4>
                {onlineHistory && onlineHistory.length > 0 ? (
                  <div className="space-y-2">
                    {onlineHistory.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#1c1a19] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-200">Lawan @{m.opponent}</span>
                            <span className={`text-[9.5px] uppercase font-black px-1.5 rounded-md ${
                              m.outcome === 'win' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : m.outcome === 'lose' 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {m.outcome === 'win' ? 'MENANG' : m.outcome === 'lose' ? 'KALAH' : 'REMIS'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold font-mono mt-0.5">ELO: {m.opponentElo} | {m.movesCount || m.moves?.length} Langkah | {m.date}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveReplay(m);
                            setReplayMoveIdx(-1);
                            setIsPlayingAuto(false);
                            triggerAudio('move');
                          }}
                          className="px-4 py-2 bg-[#81b64c] hover:bg-[#6e9e3e] text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Putar Ulang
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[11px] text-zinc-500 font-bold bg-[#1c1a19] rounded-xl border border-[#3c3934]/35">
                    Tidak ada riwayat duel terdaftar. Mainkan pertandingan online atau duel lokal di menu Arena terlebih dahulu!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookmarks manager list */}
          {bookmarkedSteps.length > 0 && !activeReplay && (
            <div className="p-4 bg-[#262421] border border-[#3c3934] rounded-2xl space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-yellow-500" /> Kumpulan Simpanan Bookmark Taktis
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                {bookmarkedSteps.map((bm) => (
                  <div key={bm.id} className="p-2.5 bg-[#1c1a19] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3 text-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-slate-200">Lawan @{bm.opponentName}</span>
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1 rounded">Langkah: {bm.currentMove}</span>
                      </div>
                      <p className="text-slate-400 text-[10px] italic mt-0.5">Catatan: "{bm.note}"</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const mockReplay = {
                            id: bm.matchId,
                            opponent: bm.opponentName,
                            opponentElo: 1200,
                            moves: [...bm.movesBefore, bm.currentMove],
                            outcome: 'win',
                            date: new Date(bm.timestamp).toLocaleDateString('id-ID')
                          };
                          setActiveReplay(mockReplay);
                          setReplayMoveIdx(bm.movesBefore.length);
                          triggerAudio('move');
                        }}
                        className="p-1 px-2.5 bg-yellow-500 text-slate-950 font-extrabold uppercase rounded-lg text-[9px] tracking-wide hover:bg-yellow-400"
                      >
                        Buka
                      </button>
                      <button
                        onClick={() => {
                          const filtered = bookmarkedSteps.filter(b => b.id !== bm.id);
                          setBookmarkedSteps(filtered);
                          localStorage.setItem('chessBookmarkedSteps', JSON.stringify(filtered));
                        }}
                        className="p-1 px-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/25 text-red-400 font-extrabold rounded-lg text-[9px]"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- HUB SOCIAL & SPECTATE LIVE SECTION ----------------- */}
      {subTab === 'social' && (
        <div className="space-y-4">
          <div className="border-b border-[#3c3934] pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="w-4 h-4 text-[#81b64c]" /> Hub Hubungan Sosial dan Interaksi Teman
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Berinteraksi secara langsung bersama relasi kawan mabar catur, kirim afinitas hadiah, atau tonton laga mabar mereka.</p>
            </div>
          </div>

          {activeSpectating ? (
            <div className="p-4 bg-[#262421] rounded-2xl border border-[#3c3934] space-y-4">
              <div className="flex justify-between items-center border-b border-[#3c3934]/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-200">Menonton Langsung: @{activeSpectating.name}</span>
                </div>
                <button 
                  onClick={() => { setActiveSpectating(null); setSpectatorChat([]); }}
                  className="text-[10px] font-black uppercase text-red-400 hover:underline cursor-pointer"
                >
                  Tutup Tayangan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Simulated live board */}
                <div className="md:col-span-6 flex flex-col items-center justify-center gap-2">
                  <div className="w-full max-w-[280px] aspect-square relative border border-zinc-750 rounded-xl overflow-hidden shadow-inner bg-[#b58863]">
                    <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                      {getSpectateBoard().map((rowArr, rIdx) => 
                        rowArr.map((cell, cIdx) => {
                          const isDark = (rIdx + cIdx) % 2 !== 0;
                          const sqName = toSquare(rIdx, cIdx);
                          return (
                            <div 
                              key={sqName} 
                              style={{ backgroundColor: isDark ? '#b58863' : '#f0d9b5' }}
                              className="relative flex items-center justify-center select-none"
                            >
                              {cell && (
                                <ChessPiece type={cell.type} color={cell.color} className="w-[85%] h-[85%]" skin="standard" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <span className="text-2xs text-slate-400 font-mono font-bold mt-1 text-center">Menonton mabar melawan {activeSpectating.gameSnippet?.opponent || 'Bot Pro'}</span>
                </div>

                {/* Spectating chats, logs, gifts */}
                <div className="md:col-span-6 flex flex-col justify-between h-full space-y-3 min-h-[260px]">
                  {/* Chat feed */}
                  <div className="bg-[#1c1a19] p-2.5 rounded-xl border border-[#3c3934] flex-1 max-h-[140px] overflow-y-auto font-mono text-[9.5px] space-y-1 scrollbar-thin">
                    <span className="text-slate-500 font-bold block border-b border-[#3c3934]/30 pb-1 mb-1 bg-black/10 px-1 text-2xs uppercase">Penonton Live Chat</span>
                    {spectatorChat.length === 0 && (
                      <span className="text-slate-500 italic block py-4 text-center">Obrolan penonton belum dimulai.</span>
                    )}
                    {spectatorChat.map((ch, cidx) => (
                      <div key={cidx} className={`leading-relaxed px-1 ${ch.sender === 'Sistem' ? 'text-amber-500 bg-amber-500/5 py-0.5 rounded' : 'text-slate-300'}`}>
                        <span className="font-extrabold text-[#81b64c]">@{ch.sender}:</span> {ch.text}
                      </div>
                    ))}
                  </div>

                  {/* Send chat message */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tulis saran langkah atau tanggapan..."
                      value={spectatorInput}
                      onChange={(e) => setSpectatorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && spectatorInput.trim()) {
                          setSpectatorChat(prev => [...prev, { sender: 'Pemain Utama', text: spectatorInput.trim() }]);
                          setSpectatorInput('');
                          triggerAudio('move');
                        }
                      }}
                      className="flex-1 bg-[#211f1d] border border-[#3c3934] rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-[#81b64c]"
                    />
                    <button
                      onClick={() => {
                        if (spectatorInput.trim()) {
                          setSpectatorChat(prev => [...prev, { sender: 'Pemain Utama', text: spectatorInput.trim() }]);
                          setSpectatorInput('');
                          triggerAudio('move');
                        }
                      }}
                      className="px-3.5 py-2 bg-[#81b64c] hover:bg-[#72a343] text-black font-extrabold uppercase rounded-lg text-xs"
                    >
                      Kirim
                    </button>
                  </div>

                  {/* Affinity interactive gift chest */}
                  <div className="p-2.5 bg-black/15 border border-[#3c3934] rounded-xl space-y-2">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Kirim Bingkisan Afinitas Hubungan</span>
                    <p className="text-[10px] text-slate-400 leading-normal font-semibold">Berikan bingkisan spesial untuk menaikkan point status afinitas mabar Anda kepada kawan.</p>
                    
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleSendGift({ name: 'Strategi Pemuka', cost: 120, type: 'coins', affinityXp: 40 })}
                        className="py-1.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] rounded-lg text-2xs font-extrabold text-slate-300 uppercase tracking-tight text-center"
                      >
                        E-Book Catur (120 Koin)
                      </button>
                      <button
                        onClick={() => handleSendGift({ name: 'Kunci Sukses', cost: 10, type: 'diamonds', affinityXp: 120 })}
                        className="py-1.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] rounded-lg text-2xs font-extrabold text-slate-300 uppercase tracking-tight text-center"
                      >
                        Piala Elite (10 Berlian)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* REAL USER ADDED FRIENDS AND SIMULATED DIRECT STATUS */}
              <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] space-y-3">
                <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider block">Kawan Catur Mabar Anda ({friends.length})</span>
                
                {friends.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-bold text-xs bg-[#1c1a19] rounded-xl border border-[#3c3934]/35 p-4">
                    Belum ada kawan yang ditambahkan. Gunakan kolom pencarian kawan di menu Arena untuk menambah rekan sparring catur mabar sejati! (Tidak ada kawan simulasi buatan).
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {friends.map((f) => {
                      const affLvlText = getAffinityTitle(f.affinityLevel);
                      return (
                        <div key={f.name} className="p-3 bg-[#1c1a19] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={f.avatar}
                                alt="Avatar"
                                className="w-8 h-8 rounded-lg border border-[#3c3934] object-cover bg-neutral-900"
                              />
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#1c1a19] rounded-full ${
                                f.status === 'online-playing' ? 'bg-red-500' : (f.status === 'online-idle' ? 'bg-emerald-500' : 'bg-slate-500')
                              }`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-200">@{f.name}</h4>
                              <p className="text-[9px] text-[#81b64c] font-bold uppercase mt-0.5 font-mono">{affLvlText} | Level {f.affinityLevel}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.status === 'online-playing' ? (
                              <button
                                onClick={() => {
                                  setActiveSpectating(f);
                                  setSpectatorChat([
                                    { sender: "Sistem", text: `Anda bergabung menonton mabar laga melawan ${f.gameSnippet?.opponent || 'Penantang'} secara real-time.` }
                                  ]);
                                  setBoardAnimMovesCount(0);
                                  triggerAudio('move');
                                }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wide cursor-pointer transition-all border border-red-700 shadow-sm shadow-red-900/35"
                              >
                                Tonton Live
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 bg-[#262421] border border-[#3c3934] rounded-lg text-[9px] text-slate-500 font-extrabold uppercase">
                                {f.status === 'online-idle' ? 'Aktif' : 'Offline'}
                              </div>
                            )}

                            {/* Gift Action direct quick menu */}
                            <button
                              onClick={() => {
                                setActiveSpectating(f);
                                setSpectatorChat([
                                  { sender: "Sistem", text: `Menu interaksi khusus diaktifkan bersama kawan @${f.name}.` }
                                ]);
                                setBoardAnimMovesCount(0);
                                triggerAudio('move');
                              }}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wide transition-all cursor-pointer"
                            >
                              Interaksi
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Received gifts bag cashing out */}
              <div className="p-4 bg-[#262421] rounded-2xl border border-[#3c3934] space-y-3">
                <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-yellow-500" /> Kantong Bingkisan Masuk dari Teman Anda
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Simulasi kiriman hadiah dari relasi sparring Anda. Cairkan untuk menambah pundi Coin atau Berlian!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {receivedGifts.map((rg) => (
                    <div key={rg.id} className="p-2.5 bg-[#1c1a19] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3 text-2xs">
                      <div className="min-w-0">
                        <span className="text-[8px] text-[#81b64c] font-black uppercase block tracking-wider font-mono">DARI @{rg.sender}</span>
                        <h4 className="font-extrabold text-slate-200 mt-0.5">{rg.giftName}</h4>
                        <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Nilai cair: <span className="font-black text-yellow-500">+{rg.worthAmount} {rg.worth === 'coins' ? 'Koin' : 'Berlian'}</span></p>
                      </div>

                      {rg.claimed ? (
                        <span className="text-[9.5px] font-black text-slate-500 uppercase px-1.5 select-none">Sudah Dicairkan</span>
                      ) : (
                        <button
                          onClick={() => handleClaimGiftCell(rg.id)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider"
                        >
                          Cairkan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- ML CHESS RANK JOURNEY SECTION ----------------- */}
      {subTab === 'rank' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#3c3934] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Shield className="w-4 h-4 text-[#81b64c]" /> Lintasan Perjalanan Rank Mobile Legends Chess
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Selesaikan permainan, naikkan nilai ELO di pertandingan online arena, dapatkan pangkat terkuat, dan menangkan peti hadiah season catur.</p>
            </div>
            <button
              onClick={simulateSeasonReset}
              className="px-3 py-1.5 text-[9.5px] bg-red-600/10 hover:bg-red-600/20 border border-red-500/25 text-red-400 font-extrabold uppercase rounded-lg cursor-pointer transition-colors"
            >
              Simulasi Reset Season Baru
            </button>
          </div>

          <div className="p-4 bg-[#262421] rounded-2xl border border-yellow-500/15 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black/35 rounded-full flex items-center justify-center border-2 border-[#81b64c]/40">
                <Trophy className="w-6 h-6 text-[#81b64c]" />
              </div>
              <div>
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Pangkat Saat Ini</span>
                <h4 className={`text-base font-black ${myRank.color}`}>{myRank.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Skor Penilaian ELO: <span className="text-[#81b64c] font-black">{onlineRating} ELO</span></p>
              </div>
            </div>

            <div className="bg-black/20 p-2.5 px-3.5 rounded-xl text-right md:-mt-1 text-[11px] space-y-0.5 font-bold border border-[#3c3934]/30">
              <div className="text-slate-500 text-[8.5px] uppercase font-bold tracking-wider font-mono">Season Berjalan</div>
              <div className="text-[#81b64c] uppercase text-[9.5px]">Musim Laga Pertarungan Kehormatan</div>
              <div className="text-[10px] text-slate-400 font-mono font-black mt-0.5">Sisa Durasi: {seasonTimer}</div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal font-semibold">Tantang dan menang kalahkan rival di online arena untuk melangkahkan kaki pada anak tangga ksatria pangkat legendaris, dapatkan penghargaan dan kekayaan koin melimpah saat batas akhir musim tercapai.</p>

          <div className="p-4 bg-[#262421] border border-[#3c3934] rounded-2xl">
            <h4 className="text-2xs font-extrabold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1">
              Daftar Tingkat Pangkat Mobile Legends Chess Kemajuan Hadiah
            </h4>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin">
              {RANK_TIERS.map((tier) => {
                const isUnlocked = onlineRating >= tier.minElo;
                const isClaimed = claimedRankRewards.includes(tier.name);
                
                let boxBorder = "border-[#3c3934] opacity-55";
                let statusMsg = "Terkunci";
                
                if (isUnlocked) {
                  if (isClaimed) {
                    boxBorder = "border-emerald-500 bg-[#1f281e]/30 opacity-100";
                    statusMsg = "Klaim Selesai";
                  } else {
                    boxBorder = "border-yellow-500 bg-[#2d2a27] opacity-100 ring-2 ring-yellow-500/10 animate-pulse";
                    statusMsg = "Siap Diambil!";
                  }
                }

                return (
                  <div key={tier.name} className={`min-w-[160px] snap-start bg-[#1c1a19] p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-center transition-all ${boxBorder}`}>
                    <div>
                      <span className={`text-[10.5px] font-black ${tier.color} block`}>{tier.name}</span>
                      <span className="text-[8.5px] text-slate-500 block font-mono font-bold mt-0.5">Syarat: {tier.minElo} ELO</span>
                    </div>

                    <div className="bg-black/25 py-2 px-1 rounded-lg text-left text-[9px] space-y-1 font-bold border border-[#3c3934]/30">
                      <div className="flex items-center gap-1 text-slate-300 px-1">
                        <Coins className="w-3.5 h-3.5 text-[#81b64c]" />
                        <span>+{tier.rewardCoins} Koin</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300 px-1">
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        <span>+{tier.rewardDiamonds} Berlian</span>
                      </div>
                      <div className="text-[8.5px] text-yellow-500 truncate mt-1 border-t border-[#3c3934]/40 pt-1 px-1 font-sans">
                        Gelar: {tier.rewardTitle}
                      </div>
                    </div>

                    <div>
                      {isUnlocked && !isClaimed ? (
                        <button
                          onClick={() => handleClaimRankReward(tier)}
                          className="w-full py-1.5 text-[9.5px] bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          Klaim Emas
                        </button>
                      ) : (
                        <div className="w-full py-1.5 text-center bg-[#3c3934] text-slate-500 text-[9px] uppercase rounded-lg font-black select-none">
                          {statusMsg}
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

      {/* ----------------- BATTLE PASS & TABUNGAN DIAMOND SECTION ----------------- */}
      {subTab === 'pass' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#3c3934] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Crown className="w-4 h-4 text-yellow-500" /> Chess Battle Pass dan Sistem Tabungan Diamond
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Naikkan tingkatan level Battle Pass melalui duel catur taktis, buka lintasan eksklusif, dan cairkan Diamond hasil menabung.</p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={simulateAddPassXp}
                className="px-2.5 py-1.5 text-[9px] bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/25 text-sky-400 font-extrabold uppercase rounded-lg cursor-pointer transition-colors"
                title="Menambahkan 50 Pass XP secara lokal untuk simulasi naik level"
              >
                Kirim +50 Pass XP
              </button>
              <button
                onClick={simulateAccreteSavings}
                className="px-2.5 py-1.5 text-[9px] bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 font-extrabold uppercase rounded-lg cursor-pointer transition-colors"
                title="Simulasi memenangkan pertandingan catur dan mendapatkan saldo berlian"
              >
                Simulasi Main Arena (+Bonus Berlian)
              </button>
            </div>
          </div>

          {/* THREE-COLUMN BATTLE PASS & TABUNGAN DIAMOND HYBRID ENGINE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CARD 1 [UPPER LEFT]: KANTUNG TABUNGAN DIAMOND */}
            <div className="p-4 bg-gradient-to-br from-[#1c1a19] to-[#262421] border border-[#3c3934] rounded-2xl flex flex-col justify-between gap-3 shadow-xl">
              <div>
                <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-wider block font-mono">Penyimpanan Terpusat</span>
                <h4 className="text-xs font-black uppercase text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Gem className="w-4 h-4 text-cyan-400" /> Celengan Diamond
                </h4>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Kas Terkumpul</span>
                  <span className="text-xs font-mono font-black text-cyan-400">{diamondSavings} / {tabunganLimit} Berlian</span>
                </div>
                {/* Visual Progress bar */}
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-1 border border-stone-800">
                  <div style={{ width: `${Math.min(100, (diamondSavings / tabunganLimit) * 100)}%` }} className="bg-cyan-400 h-full transition-all" />
                </div>
                <p className="text-[9px] text-slate-500 font-semibold mt-1.5 leading-tight">Dapatkan bonus Berlian setiap kali mabar arena, cairkan berkala!</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-800/60">
                <button
                  type="button"
                  onClick={handleWithdrawSavings20}
                  className="w-full py-1.5 bg-gradient-to-r from-cyan-600/20 to-indigo-600/25 border border-cyan-500/25 hover:border-cyan-400 text-cyan-400 hover:text-white font-black text-[9px] uppercase rounded-lg transition-all cursor-pointer"
                >
                  Tarik 20% Harian (+{dailyClaimAmount20})
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSeasonCairkan100}
                  className="w-full py-1 bg-stone-900 border border-stone-800 hover:bg-[#81b64c] hover:text-slate-950 text-slate-400 font-black text-[8px] uppercase rounded-md transition-all cursor-pointer"
                >
                  Cairkan 100% (Simulasi Season Baru)
                </button>
              </div>
            </div>

            {/* CARD 2: STATUS & PROGRES BATTLE PASS */}
            <div className="p-4 bg-[#262421] border border-[#3c3934] rounded-2xl flex flex-col justify-between gap-3.5 shadow-xl">
              <div>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Keanggotaan Battle Pass</span>
                <h4 className="text-xs font-black uppercase text-slate-350">
                  Status Lintasan: {passStatus === 'free' ? (
                    <span className="text-slate-400 uppercase">Dasar Gratis</span>
                  ) : passStatus === 'premium' ? (
                    <span className="text-yellow-500 font-black uppercase tracking-wider">Premium Elite</span>
                  ) : (
                    <span className="text-cyan-400 font-black uppercase tracking-wider">Deluxe King</span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Tingkatan Pass Level: <span className="text-[#81b64c] font-black">{passLevel}</span></p>
              </div>

              {/* Progress and xp slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400">
                  <span>Progres Level {passLevel}</span>
                  <span className="font-mono">{passXp} / 100 XP</span>
                </div>
                <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-[#3c3934]/45">
                  <div style={{ width: `${passXp}%` }} className="bg-[#81b64c] h-full" />
                </div>
              </div>

              <div className="flex gap-1.5 pt-2 border-t border-stone-800/60">
                <button
                  onClick={simulateAddPassXp}
                  className="flex-1 py-1 text-[8.5px] bg-[#3c3934] hover:bg-stone-800 text-slate-300 font-black uppercase rounded-md transition-colors"
                >
                  +50 XP Mabar
                </button>
                <button
                  onClick={simulateAccreteSavings}
                  className="flex-1 py-1 text-[8.5px] bg-[#3c3934] hover:bg-stone-800 text-slate-300 font-black uppercase rounded-md transition-colors"
                >
                  Main Arena
                </button>
              </div>
            </div>

            {/* CARD 3: UPGRADE LINTASAN / KLAIM HADIAH */}
            {passStatus === 'free' ? (
              <div className="p-4 border border-yellow-500/25 bg-yellow-500/5 rounded-2xl flex flex-col justify-between gap-3 shadow-xl">
                <div>
                  <h4 className="text-2xs font-black text-yellow-550 uppercase tracking-wider flex items-center gap-1">
                    Beli Lintasan Elite
                  </h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400 font-semibold mt-1">Buka segudang hadiah, bonus gelar, serta lipatgandakan laju tabungan Berlian mabar Anda x1.75!</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 py-1">
                  <button
                    onClick={() => handleBuyPass('premium')}
                    className="py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[9px] uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    Premium (150 Berlian)
                  </button>
                  <button
                    onClick={() => handleBuyPass('deluxe')}
                    className="py-1.5 bg-gradient-to-r from-cyan-500 to-[#ff007f] text-white font-black text-[9px] uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                  >
                    Deluxe (250 Berlian)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-[#81b64c]/20 bg-emerald-900/5 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <h4 className="text-2xs font-extrabold text-[#81b64c] uppercase tracking-widest flex items-center gap-1">
                    Lintasan Elite Diaktifkan
                  </h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal font-semibold mt-1">
                    Akumulator tabungan Diamond aktif dengan kecepatan x{currentPassMultiplier}. Raih semua komoditas level dengan cepat.
                  </p>
                </div>
                <button
                  onClick={claimAllEligiblePassRewards}
                  className="mt-3.5 w-full py-2 bg-[#81b64c] hover:bg-[#6e9e3e] text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Ambil Semua Hadiah Unlocked
                </button>
              </div>
            )}
          </div>

          {/* DUAL STREAM EXPANSIVE JOURNEY TIMELINE */}
          <div className="p-4 bg-[#262421] border border-[#3c3934] rounded-2xl font-sans">
            <h4 className="text-2xs font-extrabold text-slate-300 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Garis Waktu Perjalanan Reward Battle Pass (Level 1 - 10)</span>
              <button 
                onClick={claimAllEligiblePassRewards}
                className="text-[9.5px] text-yellow-500 font-extrabold underline cursor-pointer hover:text-yellow-400"
              >
                Ambil Semua Hadiah Terbuka
              </button>
            </h4>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              {SEASON_PASS_REWARDS.map((reward) => {
                const isLevelReached = passLevel >= reward.level;
                const freeId = `${reward.level}_free`;
                const premId = `${reward.level}_premium`;
                const isFreeClaimed = claimedPassRewards.includes(freeId);
                const isPremClaimed = claimedPassRewards.includes(premId);

                return (
                  <div key={reward.level} className={`p-3 bg-[#1c1a19] border rounded-xl flex items-center justify-between gap-3 text-2xs ${
                    isLevelReached ? 'border-[#3c3934]' : 'border-[#3c3934]/30 opacity-40'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 bg-[#3c3934]/60 text-white flex items-center justify-center rounded-lg font-mono font-black border border-[#3c3934]">
                        L{reward.level}
                      </span>
                      <div className="space-y-1">
                        {/* Free reward details */}
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-700 text-slate-300 text-[8px] font-black px-1 rounded uppercase font-mono">GRATIS</span>
                          <span className="text-slate-200 font-bold">{reward.freeReward.name}</span>
                          {isLevelReached && !isFreeClaimed && (
                            <button 
                              onClick={() => handleClaimPassReward(reward.level, 'free')}
                              className="text-[8px] bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-md cursor-pointer"
                            >
                              Ambil
                            </button>
                          )}
                          {isLevelReached && isFreeClaimed && (
                            <span className="text-[8px] text-slate-500 font-bold font-mono">Sudah Klaim</span>
                          )}
                        </div>

                        {/* Premium reward details */}
                        <div className="flex items-center gap-1.5">
                          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] font-black px-1 rounded uppercase font-mono">ELITE</span>
                          <span className="text-yellow-500 font-bold">{reward.premiumReward.name}</span>
                          {isLevelReached && passStatus !== 'free' && !isPremClaimed && (
                            <button 
                              onClick={() => handleClaimPassReward(reward.level, 'premium')}
                              className="text-[8px] bg-cyan-500 hover:bg-cyan-400 text-white font-black px-2 py-0.5 rounded-md cursor-pointer"
                            >
                              Ambil
                            </button>
                          )}
                          {isLevelReached && passStatus !== 'free' && isPremClaimed && (
                            <span className="text-[8px] text-slate-500 font-bold font-mono">Sudah Klaim</span>
                          )}
                          {(!isLevelReached || passStatus === 'free') && (
                            <span className="text-[8.5px] text-slate-500 flex items-center gap-0.5 font-mono"><Lock className="w-2.5 h-2.5 shrink-0" /> Terkunci</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isLevelReached && (
                      <span className="text-[8.5px] text-slate-500 font-mono font-black uppercase shrink-0">LOCKED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
