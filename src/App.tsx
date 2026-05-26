import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { 
  Flame, 
  Heart, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Home, 
  ShoppingBag, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  Award, 
  Check, 
  RefreshCw,
  MessageSquare,
  Search,
  Users,
  Send,
  UserPlus,
  User,
  Crown,
  History,
  GraduationCap,
  Globe,
  Target,
  Swords,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, GameMode, Puzzle, Lesson, PurchaseableTheme, BoardTheme } from './types';
import { CHARACTERS, PUZZLES, LESSONS, THEMES } from './data';
import { ChessPiece } from './components/ChessPieces';
import { playSound, toSquare, fromSquare, getAIMove, evaluateMoveQuality } from './utils';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const EVALUATION_LABELS: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  brilliant: { label: 'Brilian', bg: 'bg-emerald-950/80 border-emerald-500', text: 'text-emerald-400', icon: '✨' },
  great: { label: 'Hebat', bg: 'bg-blue-950/80 border-blue-500', text: 'text-blue-400', icon: '🚀' },
  best: { label: 'Terbaik', bg: 'bg-[#263121] border-[#81b64c]', text: 'text-[#81b64c]', icon: '⭐' },
  excellent: { label: 'Sangat Baik', bg: 'bg-teal-950/80 border-teal-500', text: 'text-teal-400', icon: '🌟' },
  good: { label: 'Baik', bg: 'bg-sky-950/80 border-sky-500', text: 'text-sky-400', icon: '👍' },
  book: { label: 'Teori Buku', bg: 'bg-amber-950/80 border-amber-500', text: 'text-amber-400', icon: '📖' },
  inaccuracy: { label: 'Kurang Tepat', bg: 'bg-zinc-950/80 border-zinc-500', text: 'text-zinc-400', icon: '❓' },
  mistake: { label: 'Kesalahan', bg: 'bg-orange-950/80 border-orange-500', text: 'text-orange-400', icon: '❌' },
  blunder: { label: 'Blunder', bg: 'bg-red-950/80 border-red-500', text: 'text-red-400', icon: '🚨' }
};

export default function App() {
  // Navigation / Gamification States which persist in localStorage
  const [mode, setMode] = useState<GameMode>(() => {
    return (localStorage.getItem('mode') as GameMode) || 'menu';
  });
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('xp')) || 0;
  });
  const [hearts, setHearts] = useState<number>(() => {
    const saved = localStorage.getItem('hearts');
    return saved !== null ? Number(saved) : 5;
  });
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('streak');
    return saved !== null ? Number(saved) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sound');
    return saved !== 'false';
  });
  const [unlockedThemes, setUnlockedThemes] = useState<BoardTheme[]>(() => {
    const saved = localStorage.getItem('unlockedThemes');
    return saved ? JSON.parse(saved) : ['classic'];
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => {
    return (localStorage.getItem('boardTheme') as BoardTheme) || 'classic';
  });

  // Game Logic States (AI Match)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(() => {
    const saved = localStorage.getItem('selectedCharacter');
    return saved ? JSON.parse(saved) : null;
  });
  const [dashboardCoachId, setDashboardCoachId] = useState<'martin' | 'nelson' | 'wally' | 'magnus'>('martin');

  // Chess Clock States for VS AI Mode
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    return localStorage.getItem('timerEnabled') !== 'false';
  });
  const [timerLimit, setTimerLimit] = useState<number>(() => {
    return Number(localStorage.getItem('timerLimit')) || 600; // 10 minutes default
  });
  const [playerTime, setPlayerTime] = useState<number>(600);
  const [aiTime, setAiTime] = useState<number>(600);
  
  // Instantiating Chess with useRef to maintain state across renders
  const chessRef = useRef(new Chess());
  const [board, setBoard] = useState<(any | null)[][]>(() => chessRef.current.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSpeech, setAiSpeech] = useState<string>('');
  const [gameResult, setGameResult] = useState<string | null>(null); // 'win' | 'lose' | 'draw' | null
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{
    from: string;
    to: string;
    type: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder' | null;
  } | null>(null);
  
  // Lessons Mode States
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonStepIndex, setLessonStepIndex] = useState<number>(0);
  const [lessonStatus, setLessonStatus] = useState<'playing' | 'step-success' | 'completed'>('playing');

  // Puzzles Mode States
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [puzzleMovesPlayed, setPuzzleMovesPlayed] = useState<number>(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'failed' | 'solved'>('playing');

  // Interactive feedback triggers
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [rewardMessage, setRewardMessage] = useState<string>('');

  // --- ONLINE MULTIPLAYER MATCHMAKING STATE & LOGIC ---
  const [onlineStatus, setOnlineStatus] = useState<'idle' | 'searching' | 'playing' | 'game-over'>('idle');
  const [onlinePlayerColor, setOnlinePlayerColor] = useState<'w' | 'b' | null>(null);
  const [onlineOpponent, setOnlineOpponent] = useState<{ name: string; elo: number; isAi: boolean } | null>(null);
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null);
  const [onlineGameResult, setOnlineGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [onlineRating, setOnlineRating] = useState<number>(() => {
    const saved = localStorage.getItem('onlineRating');
    if (!saved) return 400;
    const num = Number(saved);
    if (num === 1200 || num === 1188) return 400;
    return num;
  });
  const [onlineHistory, setOnlineHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('onlineHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [onlineChats, setOnlineChats] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [searchTime, setSearchTime] = useState<number>(0);
  const [rankingList, setRankingList] = useState<any[]>([]);
  const [playerId] = useState(() => {
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('playerId', id);
    }
    return id;
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || `Pecatur_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  });

  const [invalidSquareFlash, setInvalidSquareFlash] = useState<string | null>(null);
  const [draggingSquare, setDraggingSquare] = useState<string | null>(null);

  // Sync user profile username inside input
  const handleSaveUsername = (newName: string) => {
    setUsername(newName);
    localStorage.setItem('username', newName);
  };

  // Persists core stats inside localStorage
  useEffect(() => {
    localStorage.setItem('mode', mode);
    localStorage.setItem('xp', String(xp));
    localStorage.setItem('hearts', String(hearts));
    localStorage.setItem('streak', String(streak));
    localStorage.setItem('sound', String(soundEnabled));
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
    localStorage.setItem('boardTheme', boardTheme);
    localStorage.setItem('onlineRating', String(onlineRating));
    localStorage.setItem('onlineHistory', JSON.stringify(onlineHistory));
    localStorage.setItem('username', username);
    if (selectedCharacter) {
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    } else {
      localStorage.removeItem('selectedCharacter');
    }
  }, [mode, xp, hearts, streak, soundEnabled, unlockedThemes, boardTheme, selectedCharacter, onlineRating, onlineHistory, username]);

  // Check and update streak validity on mount
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastStreakDate = localStorage.getItem('lastStreakDate');
    if (lastStreakDate) {
      const lastDate = new Date(lastStreakDate + 'T00:00:00');
      const todayDate = new Date(todayStr + 'T00:00:00');
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Reset streak to 0 since yesterday was missed
        setStreak(0);
        localStorage.setItem('streak', '0');
      }
    } else {
      // First time
      setStreak(0);
      localStorage.setItem('streak', '0');
    }
  }, []);

  // Fetch online leaderboard ranks
  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/online/leaderboard');
      if (res.ok) {
        const seedData = await res.json();
        const allRanks = [...seedData, { name: `${username.trim() || 'Pecatur'} (Kamu)`, elo: onlineRating, badge: getRatingBadge(onlineRating), isUser: true }]
          .sort((a, b) => b.elo - a.elo);
        setRankingList(allRanks);
      }
    } catch (err) {
      console.warn("Gagal mengambil peringkat leaderboard");
    }
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 2000) return "Grandmaster";
    if (rating >= 1800) return "Master Nasional";
    if (rating >= 1500) return "Pakar";
    if (rating >= 1200) return "Wira Taktis";
    return "Pemula Berbakat";
  };

  // Run rankings retrieval when displaying online-match mode
  useEffect(() => {
    if (mode === 'online-match') {
      fetchRankings();
    }
  }, [mode, onlineRating]);

  // Handle Online Matchmaking search requests
  useEffect(() => {
    let lobbyInterval: any = null;
    let secondsCounter: any = null;

    if (mode === 'online-match' && onlineStatus === 'searching') {
      setSearchTime(0);
      
      secondsCounter = setInterval(() => {
        setSearchTime(t => t + 1);
      }, 1000);

      const requestMatch = async () => {
        try {
          const res = await fetch('/api/online/matchmaking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId,
              username: username.trim() || 'Pecatur',
              elo: onlineRating
            })
          });
          const data = await res.json();
          if (data && data.status === 'matched') {
            setOnlineGameId(data.gameId);
            setOnlinePlayerColor(data.color);
            setOnlineOpponent({ ...data.opponent, isAi: false });
            setOnlineStatus('playing');
            setOnlineGameResult(null);
            
            chessRef.current = new Chess();
            setBoard(chessRef.current.board());
            setSelectedSquare(null);
            
            clearInterval(lobbyInterval);
            clearInterval(secondsCounter);
          }
        } catch (e) {
          console.warn("Gagal matchmaking, mengulangi...");
        }
      };

      requestMatch();
      lobbyInterval = setInterval(requestMatch, 2500);
    }

    return () => {
      clearInterval(lobbyInterval);
      clearInterval(secondsCounter);
    };
  }, [mode, onlineStatus]);

  // Search Timeout (Fallback after 5 seconds to instant simulated opponent)
  useEffect(() => {
    if (onlineStatus === 'searching' && searchTime >= 5) {
      const simulatedOpponents = [
        { name: "CaturMania99", elo: onlineRating + Math.floor(Math.random() * 80 - 40) },
        { name: "Dian_Laksana", elo: onlineRating + Math.floor(Math.random() * 60 - 30) },
        { name: "ChessKingPro", elo: onlineRating + Math.floor(Math.random() * 120 - 40) },
        { name: "Rani_Gajah_Liar", elo: onlineRating + Math.floor(Math.random() * 100 - 50) },
        { name: "StudiCaturID", elo: onlineRating + Math.floor(Math.random() * 50 - 25) }
      ];
      const matched = simulatedOpponents[Math.floor(Math.random() * simulatedOpponents.length)];
      
      const gameId = 'online_sim_' + Math.random().toString(36).substring(2, 9);
      setOnlineGameId(gameId);
      setOnlinePlayerColor('w'); // White first
      setOnlineOpponent({ name: matched.name, elo: matched.elo, isAi: true });
      setOnlineStatus('playing');
      setOnlineGameResult(null);
      
      chessRef.current = new Chess();
      setBoard(chessRef.current.board());
      setSelectedSquare(null);
      
      setOnlineChats([
        { sender: 'Sistem', text: `Pertandingan dimulai! Anda bermain sebagai Putih melawan ${matched.name} (ELO ${matched.elo}).` },
        { sender: matched.name, text: 'Halo! Salam kenal, mari kita main sportif! Semoga beruntung ya 🤝✨' }
      ]);
      triggerAudio('win');
    }
  }, [onlineStatus, searchTime]);

  // Live polling for online game moves & chat logs
  useEffect(() => {
    let interval: any = null;
    if (mode === 'online-match' && onlineStatus === 'playing' && onlineGameId && onlineOpponent && !onlineOpponent.isAi) {
      interval = setInterval(async () => {
        try {
          const r = await fetch(`/api/online/game/updates?gameId=${onlineGameId}`);
          if (r.ok) {
            const data = await r.json();
            
            if (data.fen !== chessRef.current.fen()) {
              chessRef.current = new Chess(data.fen);
              setBoard(chessRef.current.board());
              setSelectedSquare(null);
              triggerAudio('move');
              
              if (chessRef.current.isCheckmate()) {
                const turn = chessRef.current.turn();
                const lostColor = turn;
                const won = (lostColor === 'w' ? 'b' : 'w');
                finishOnlineGame(won === onlinePlayerColor ? 'win' : 'lose');
              } else if (chessRef.current.isGameOver()) {
                finishOnlineGame('draw');
              }
            }
            
            setOnlineChats(data.chats || []);
            
            if (data.winner) {
              setOnlineStatus('game-over');
              const outcome = data.winner === onlinePlayerColor ? 'win' : (data.winner === 'draw' ? 'draw' : 'lose');
              setOnlineGameResult(outcome);
            }
          }
        } catch (e) {
          console.warn("Gagal sinkronisasi data online");
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [mode, onlineStatus, onlineGameId, onlinePlayerColor, onlineOpponent]);

  // AI Opponent Simulated Game loop (triggers when opponent is AI and it's their turn)
  useEffect(() => {
    if (mode === 'online-match' && onlineStatus === 'playing' && onlineOpponent?.isAi && chessRef.current.turn() === 'b' && !gameResult && !onlineGameResult) {
      const waitTime = 2000 + Math.random() * 2000;
      const timeoutId = setTimeout(() => {
        const chess = chessRef.current;
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) return;

        const difficulty = onlineOpponent.elo < 1100 ? 'Sangat Mudah' : (onlineOpponent.elo < 1450 ? 'Sedang' : 'Sulit');
        const aiMove = getAIMove(chess, difficulty);

        if (aiMove) {
          try {
            const moveRes = chess.move(aiMove);
            setBoard(chess.board());
            setSelectedSquare(null);
            
            if (chess.isCheckmate()) {
              triggerAudio('lose');
              finishOnlineGame('lose');
            } else if (chess.isCheck()) {
              triggerAudio('check');
            } else if (moveRes.captured) {
              triggerAudio('capture');
            } else {
              triggerAudio('move');
            }

            const chatChance = Math.random();
            if (chatChance < 0.25) {
              const friendlyChats = [
                "Langkah yang kokoh dari Anda!",
                "Waduh, pertahanan menterimu tangguh sekali.",
                "Hmm, haruskah saya rokade atau menyerang di sayap menteri?",
                "Ini benar-benar pertandingan yang menakjubkan! 👍",
                "Permainan yang seru! Tetap berkonsentrasi ya."
              ];
              setOnlineChats(prev => [
                ...prev,
                { sender: onlineOpponent.name, text: friendlyChats[Math.floor(Math.random() * friendlyChats.length)], time: Date.now() }
              ]);
            }

            if (chess.isGameOver() && !chess.isCheckmate()) {
              finishOnlineGame('draw');
            }
          } catch (e) {
            console.error("Opponent move execution failure", e);
          }
        }
      }, waitTime);

      return () => clearTimeout(timeoutId);
    }
  }, [mode, onlineStatus, onlineOpponent, board]);

  // Chess Clock Countdown Effect (VS AI Mode)
  useEffect(() => {
    if (mode !== 'play' || !timerEnabled || gameResult) {
      return;
    }

    const interval = setInterval(() => {
      const chess = chessRef.current;
      if (chess.isGameOver()) return;

      const currentTurn = chess.turn();
      if (currentTurn === 'w' && !isAiThinking) {
        // Player's turn
        setPlayerTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameResult('lose-time');
            triggerAudio('lose');
            if (selectedCharacter) {
              setAiSpeech(`Haha! Waktumu habis! Aku menang secara waktu.`);
            }
            return 0;
          }

          const nextVal = prev - 1;
          // Reminders and warning commentaries!
          if (nextVal === 60) {
            triggerAudio('check');
            setAiSpeech(`Awas! Waktumu sisa 1 menit lagi! Berpikir lebih cepat ya!`);
          } else if (nextVal === 30) {
            triggerAudio('check');
            setAiSpeech(`Bahaya! Sisa waktumu tinggal 30 detik lagi. Konsentrasi penuh!`);
          } else if (nextVal === 10) {
            triggerAudio('error');
            setAiSpeech(`10 detik terakhir! Segera jalankan langkahmu!`);
          }
          return nextVal;
        });
      } else if (currentTurn === 'b' || isAiThinking) {
        // AI's turn
        setAiTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameResult('win-time');
            triggerAudio('win');
            if (selectedCharacter) {
              setAiSpeech(`Aduh! Aku terlalu lama menghitung kalkulasi langkah hingga kehabisan waktu caturku. Selamat, kamu menang! 🎉`);
              triggerReward(40, `Kamu mengalahkan ${selectedCharacter.name} secara waktu!`);
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, timerEnabled, gameResult, selectedCharacter, isAiThinking]);

  // Online game actions
  const makeOnlineMove = async (from: string, to: string) => {
    const chess = chessRef.current;
    if (onlineStatus !== 'playing') return;

    try {
      const moveResult = chess.move({
        from,
        to,
        promotion: 'q'
      });

      setBoard(chess.board());
      setSelectedSquare(null);

      if (chess.isCheckmate()) {
        triggerAudio('win');
        finishOnlineGame('win');
      } else if (chess.isCheck()) {
        triggerAudio('check');
      } else if (moveResult.captured) {
        triggerAudio('capture');
      } else {
        triggerAudio('move');
      }

      if (chess.isGameOver() && !chess.isCheckmate()) {
        finishOnlineGame('draw');
      }

      // Sync user move to Backend
      if (onlineOpponent && !onlineOpponent.isAi && onlineGameId) {
        await fetch('/api/online/game/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: onlineGameId,
            from,
            to,
            fen: chess.fen(),
            moveSan: moveResult.san,
            color: onlinePlayerColor
          })
        });
      }
    } catch (e) {
      triggerAudio('error');
    }
  };

  const sendOnlineChat = async () => {
    if (!chatInput.trim() || !onlineGameId) return;
    const msg = chatInput.trim();
    setChatInput('');

    const finalSender = username.trim() || 'Pecatur';
    setOnlineChats(prev => [
      ...prev,
      { sender: finalSender, text: msg, time: Date.now() }
    ]);

    if (onlineOpponent && !onlineOpponent.isAi) {
      try {
        await fetch('/api/online/game/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: onlineGameId,
            sender: finalSender,
            text: msg
          })
        });
      } catch (e) {
        console.warn("Gagal mengirim kargo chat");
      }
    } else if (onlineOpponent?.isAi) {
      setTimeout(() => {
        const reactions = [
          "Mantap sekali! Teruskan perjuanganmu.",
          "Santai saja, catur adalah harmoni pikiran. Hehe🤝",
          "Hahaha, langkah perwiramu membuatku ketar-ketir.",
          "Semoga pemain terbaik yang sukses menggenggam trofi! 🤩",
          "Sungguh asyik bertanding denganmu!"
        ];
        setOnlineChats(prev => [
          ...prev,
          { sender: onlineOpponent.name, text: reactions[Math.floor(Math.random() * reactions.length)], time: Date.now() }
        ]);
      }, 1000);
    }
  };

  const finishOnlineGame = async (outcome: 'win' | 'lose' | 'draw') => {
    setOnlineStatus('game-over');
    setOnlineGameResult(outcome);

    let eloChange = 0;
    if (outcome === 'win') {
      eloChange = 15 + Math.floor(Math.random() * 8);
      triggerReward(30, `Kemenangan Online luar biasa! +${eloChange} ELO`);
    } else if (outcome === 'lose') {
      eloChange = -8 - Math.floor(Math.random() * 5);
      triggerAudio('lose');
    } else {
      eloChange = 2;
    }

    const nextElo = Math.max(400, onlineRating + eloChange);
    setOnlineRating(nextElo);

    const newHistoryEntry = {
      id: onlineGameId || Math.random().toString(),
      opponent: onlineOpponent?.name || 'Lawan Anonim',
      opponentElo: onlineOpponent?.elo || 1200,
      outcome,
      eloDiff: eloChange,
      date: new Date().toLocaleDateString('id-ID'),
      movesCount: chessRef.current.history().length
    };
    setOnlineHistory(prev => [newHistoryEntry, ...prev]);

    if (onlineGameId && onlineOpponent && !onlineOpponent.isAi) {
      try {
        await fetch('/api/online/game/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: onlineGameId,
            winner: outcome === 'win' ? onlinePlayerColor : (outcome === 'lose' ? (onlinePlayerColor === 'w' ? 'b' : 'w') : 'draw')
          })
        });
      } catch (err) {
        console.warn("Gagal menyimpan hasil online ke server");
      }
    }
  };

  // --- DRAG & DROP EVENT IMPLEMENTATIONS ---
  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (isAiThinking || gameResult || onlineGameResult) return;
    const piece = chessRef.current.get(square as any);
    const turn = chessRef.current.turn();
    
    // Check turn constraints based on active Mode
    const allowedColor = mode === 'online-match' ? onlinePlayerColor : 'w';
    if (piece && piece.color === allowedColor && piece.color === turn) {
      setDraggingSquare(square);
      setSelectedSquare(square);
      e.dataTransfer.setData("text/plain", square);
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent, square: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData("text/plain") || draggingSquare;
    setDraggingSquare(null);

    if (!sourceSquare || sourceSquare === targetSquare) return;

    const activeMoves = chessRef.current.moves({ verbose: true });
    const isValid = activeMoves.some((m: any) => m.from === sourceSquare && m.to === targetSquare);

    if (isValid) {
      if (mode === 'puzzles') {
        executePuzzleStep(sourceSquare, targetSquare);
      } else if (mode === 'lessons') {
        executeLessonStep(sourceSquare, targetSquare);
      } else if (mode === 'online-match') {
        makeOnlineMove(sourceSquare, targetSquare);
      } else {
        makeMove(sourceSquare, targetSquare);
      }
    } else {
      triggerAudio('error');
      setInvalidSquareFlash(targetSquare);
      setTimeout(() => setInvalidSquareFlash(null), 600);
    }
  };

  // Syncs sound toggle
  const triggerAudio = (type: 'move' | 'capture' | 'check' | 'win' | 'lose' | 'error') => {
    if (soundEnabled) {
      playSound(type);
    }
  };

  // Triggers visual reward overlays
  const triggerReward = (amount: number, message: string) => {
    setXp(prev => prev + amount);
    setRewardAmount(amount);
    setRewardMessage(message);
    setShowRewardModal(true);
    triggerAudio('win');
    if (amount > 0) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const lastStreakDate = localStorage.getItem('lastStreakDate');
      if (!lastStreakDate) {
        setStreak(1);
        localStorage.setItem('streak', '1');
        localStorage.setItem('lastStreakDate', todayStr);
      } else {
        const lastDate = new Date(lastStreakDate + 'T00:00:00');
        const todayDate = new Date(todayStr + 'T00:00:00');
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Played on consecutive day!
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('streak', String(newStreak));
          localStorage.setItem('lastStreakDate', todayStr);
        } else if (diffDays > 1) {
          // Missed one or more days, start new streak from 1
          setStreak(1);
          localStorage.setItem('streak', '1');
          localStorage.setItem('lastStreakDate', todayStr);
        } else if (diffDays === 0) {
          // Already played today, maintain streak (if streak was 0, initialize to 1)
          if (streak === 0) {
            setStreak(1);
            localStorage.setItem('streak', '1');
          }
        }
      }
    }
  };

  // Resets standard AI Chess Board
  const resetAiGame = (char: Character, chosenLimit = timerLimit) => {
    chessRef.current = new Chess();
    setBoard(chessRef.current.board());
    setSelectedSquare(null);
    setGameResult(null);
    setMoveHistory([]);
    setLastMove(null);
    setIsAiThinking(false);
    setAiSpeech(char.welcomeMsg);
    setPlayerTime(chosenLimit);
    setAiTime(chosenLimit);
  };

  // Activates a selected Character to play against
  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setMode('play');
    resetAiGame(char);
  };

  // Computes valid target moves for the selected source square
  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    const moves = chessRef.current.moves({ verbose: true });
    return moves
      .filter((m: any) => m.from === selectedSquare)
      .map((m: any) => m.to);
  }, [selectedSquare, board]);

  // Generates character commentary via server-side Gemini Proxy API
  const fetchCharacterReply = async (char: Character, playerMove: string, aiMove: string, customFen: string) => {
    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: char,
          playerMove: playerMove,
          aiMove: aiMove,
          boardState: customFen
        })
      });
      const data = await response.json();
      if (data && data.text) {
        setAiSpeech(data.text);
      }
    } catch (err) {
      console.warn('Gagal memanggil Gemini Commentary API:', err);
    }
  };

  // Handles AI response moves in background
  const triggerAiResponse = (char: Character, playerMove: string) => {
    setIsAiThinking(true);
    
    // Smooth delay simulating "Duo is typing..."
    setTimeout(async () => {
      const chess = chessRef.current;
      if (chess.isGameOver()) {
        setIsAiThinking(false);
        return;
      }

      // 1. Get strategic move from our client minimax evaluator
      const aiMove = getAIMove(chess, char.difficulty);

      if (aiMove) {
        try {
          const result = chess.move(aiMove);
          setBoard(chess.board());
          
          setMoveHistory(prev => {
            const currentHistory = [...prev, result.san];
            // Set last move with quality estimation
            const isOpening = currentHistory.length < 16;
            const isRepeated = prev.slice(-4).includes(result.san);
            let q = evaluateMoveQuality(result, isOpening, isRepeated);
            // Martin is specialized in Blunders! Nelson is aggressive, etc.
            if (char.id === 'martin' && Math.random() < 0.35) {
              q = 'blunder';
            } else if (char.id === 'martin' && Math.random() < 0.15) {
              q = 'mistake';
            }
            setLastMove({
              from: result.from,
              to: result.to,
              type: q
            });
            return currentHistory;
          });

          // Handle audio feedback
          if (chess.isCheckmate()) {
            triggerAudio('lose');
            setGameResult('lose');
            setAiSpeech(char.checkmateMsg);
          } else if (chess.isCheck()) {
            triggerAudio('check');
          } else if (result.captured) {
            triggerAudio('capture');
          } else {
            triggerAudio('move');
          }

          // Fetch fresh sassy speech commentary from Gemini or local fallback!
          await fetchCharacterReply(char, playerMove, result.san, chess.fen());

        } catch (error) {
          console.error('Computer move error:', error);
        }
      }
      setIsAiThinking(false);
      
      // Update checkout states for game over
      if (chess.isGameOver() && !chess.isCheckmate()) {
        setGameResult('draw');
      }
    }, 1200);
  };

  // Executing user selected moves
  const makeMove = async (from: string, to: string) => {
    const chess = chessRef.current;
    
    // Guard game state
    if (gameResult) return;

    try {
      // Create user move
      const moveResult = chess.move({
        from,
        to,
        promotion: 'q' // Auto promote to Queen for simplified user experience
      });

      // Update board view
      setBoard(chess.board());
      setSelectedSquare(null);

      setMoveHistory(prev => {
        const currentHistory = [...prev, moveResult.san];
        // Set last move with quality estimation
        const isOpening = currentHistory.length < 16;
        const isRepeated = prev.slice(-4).includes(moveResult.san);
        const q = evaluateMoveQuality(moveResult, isOpening, isRepeated);
        setLastMove({
          from: moveResult.from,
          to: moveResult.to,
          type: q
        });
        return currentHistory;
      });

      // Checks logic triggers
      if (chess.isCheckmate()) {
        triggerAudio('win');
        setGameResult('win');
        if (selectedCharacter) {
          setAiSpeech(selectedCharacter.checkmateMsg);
          triggerReward(40, `Kamu mengalahkan ${selectedCharacter.name}!`);
        }
        return;
      } else if (chess.isCheck()) {
        triggerAudio('check');
      } else if (moveResult.captured) {
        triggerAudio('capture');
      } else {
        triggerAudio('move');
      }

      // Check remaining game results
      if (chess.isGameOver()) {
        setGameResult('draw');
        return;
      }

      // Standard AI Turn loop
      if (selectedCharacter && mode === 'play') {
        triggerAiResponse(selectedCharacter, moveResult.san);
      }
    } catch (e) {
      // Play brief thud audio for invalid moves
      triggerAudio('error');
    }
  };

  // Click handler for Chess Board squares
  const handleSquareClick = (square: string) => {
    if (isAiThinking || gameResult || onlineGameResult) return;

    const chess = chessRef.current;

    // Mode: Puzzles Click logic
    if (mode === 'puzzles' && activePuzzle && puzzleStatus === 'playing') {
      if (selectedSquare) {
        if (validMoves.includes(square)) {
          executePuzzleStep(selectedSquare, square);
        } else {
          // Change selection if clicking own piece
          const piece = chess.get(square as any);
          if (piece && piece.color === 'w') {
            setSelectedSquare(square);
          } else {
            triggerAudio('error');
            setInvalidSquareFlash(square);
            setTimeout(() => setInvalidSquareFlash(null), 500);
            setSelectedSquare(null);
          }
        }
      } else {
        const piece = chess.get(square as any);
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
        }
      }
      return;
    }

    // Mode: Lessons Click Logic
    if (mode === 'lessons' && activeLesson && lessonStatus === 'playing') {
      if (selectedSquare) {
        if (validMoves.includes(square)) {
          executeLessonStep(selectedSquare, square);
        } else {
          const piece = chess.get(square as any);
          if (piece && piece.color === 'w') {
            setSelectedSquare(square);
          } else {
            triggerAudio('error');
            setInvalidSquareFlash(square);
            setTimeout(() => setInvalidSquareFlash(null), 500);
            setSelectedSquare(null);
          }
        }
      } else {
        const piece = chess.get(square as any);
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
        }
      }
      return;
    }

    // Mode: Online Match Logic
    if (mode === 'online-match' && onlineStatus === 'playing') {
      const currentTurn = chess.turn(); // 'w' or 'b'
      const matchesColor = (currentTurn === 'w' && onlinePlayerColor === 'w') || (currentTurn === 'b' && onlinePlayerColor === 'b');
      if (!matchesColor) return; // Not your turn

      if (selectedSquare) {
        if (validMoves.includes(square)) {
          makeOnlineMove(selectedSquare, square);
        } else {
          const piece = chess.get(square as any);
          if (piece && piece.color === onlinePlayerColor) {
            setSelectedSquare(square);
          } else {
            triggerAudio('error');
            setInvalidSquareFlash(square);
            setTimeout(() => setInvalidSquareFlash(null), 500);
            setSelectedSquare(null);
          }
        }
      } else {
        const piece = chess.get(square as any);
        if (piece && piece.color === onlinePlayerColor) {
          setSelectedSquare(square);
        }
      }
      return;
    }

    // Mode: Versus Play AI Logic
    if (selectedSquare) {
      if (validMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else {
        // Change selection
        const piece = chess.get(square as any);
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
        } else {
          triggerAudio('error');
          setInvalidSquareFlash(square);
          setTimeout(() => setInvalidSquareFlash(null), 500);
          setSelectedSquare(null);
        }
      }
    } else {
      const piece = chess.get(square as any);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
    }
  };

  // Integrated, fully responsive Chess Board component supporting drag and drop
  const renderChessboard = (clickHandler: (sq: string) => void = handleSquareClick) => {
    const highlightSquares = (mode === 'lessons' && activeLesson) 
      ? activeLesson.steps[lessonStepIndex]?.highlightSquares || [] 
      : [];

    return (
      <div id="unified-chessboard-grid" className="grid grid-cols-8 grid-rows-8 aspect-square w-full rounded-2xl overflow-hidden border-2 border-black/40 shadow-inner">
        {board.map((rowArr, rowIndex) => 
          rowArr.map((piece, colIndex) => {
            const squareName = toSquare(rowIndex, colIndex);
            const isDark = (rowIndex + colIndex) % 2 !== 0;
            
            const isSelected = selectedSquare === squareName;
            const isValidTarget = validMoves.includes(squareName);
            const isFlashingRed = invalidSquareFlash === squareName;
            const isHighlighted = highlightSquares.includes(squareName);

            // Theme color setup
            const tileColorStyle = isDark 
              ? activeThemeConfig.secondaryColor 
              : activeThemeConfig.primaryColor;

            return (
              <div
                key={squareName}
                onClick={() => clickHandler(squareName)}
                onDragOver={(e) => handleDragOver(e, squareName)}
                onDrop={(e) => handleDrop(e, squareName)}
                style={{ backgroundColor: isFlashingRed ? '#FF4B4B' : tileColorStyle }}
                className={`relative aspect-square flex items-center justify-center cursor-pointer select-none group transition-colors duration-200 ${
                  isFlashingRed ? 'animate-pulse' : ''
                }`}
              >
                {/* Selected Square Highlight overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-yellow-250/30 animate-pulse z-1" />
                )}

                {/* Last Move Highlight overlay */}
                {lastMove && (lastMove.from === squareName || lastMove.to === squareName) && (
                  <div className="absolute inset-0 bg-yellow-500/15 border border-yellow-500/30 pointer-events-none z-1" />
                )}

                {/* Training highlight suggestions */}
                {isHighlighted && !isSelected && (
                  <div className="absolute inset-0 bg-blue-400/20 border border-blue-400 pointer-events-none animate-pulse z-1" />
                )}

                {/* Valid Destination Spot marker */}
                {isValidTarget && (
                  <div className="absolute w-4 h-4 bg-[#58CC02]/55 rounded-full border border-white pointer-events-none z-10" />
                )}

                {/* Chess piece display */}
                {piece && (
                  <div 
                    draggable={!isAiThinking && !gameResult && !onlineGameResult}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    className="w-[74%] h-[74%] transform group-hover:scale-[1.06] duration-100 transition-transform flex items-center justify-center z-5 cursor-grab active:cursor-grabbing"
                  >
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Chess Move Evaluation mini bubble badge */}
                {lastMove && lastMove.to === squareName && lastMove.type && (
                  <div 
                    className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black z-20 shadow-md transition-all select-none ${
                      lastMove.type === 'brilliant' ? 'bg-emerald-500 text-white animate-bounce' :
                      lastMove.type === 'great' ? 'bg-blue-500 text-white' :
                      lastMove.type === 'best' ? 'bg-[#81b64c] text-white' :
                      lastMove.type === 'excellent' ? 'bg-teal-500 text-white' :
                      lastMove.type === 'good' ? 'bg-sky-500 text-white' :
                      lastMove.type === 'book' ? 'bg-amber-500 text-white' :
                      lastMove.type === 'inaccuracy' ? 'bg-zinc-500 text-white' :
                      lastMove.type === 'mistake' ? 'bg-orange-500 text-white' :
                      'bg-red-500 text-white animate-pulse'
                    }`}
                    title={EVALUATION_LABELS[lastMove.type]?.label || lastMove.type}
                  >
                    {EVALUATION_LABELS[lastMove.type]?.icon || '•'}
                  </div>
                )}

                {/* Coordinate labels */}
                {colIndex === 0 && (
                  <span className={`absolute top-1 left-1.5 text-[9px] font-extrabold pointer-events-none select-none z-10 ${
                    isDark ? 'text-white/55' : 'text-slate-800/55'
                  }`}>
                    {8 - rowIndex}
                  </span>
                )}
                {rowIndex === 7 && (
                  <span className={`absolute bottom-0.5 right-1.5 text-[9px] font-extrabold pointer-events-none select-none z-10 ${
                    isDark ? 'text-white/55' : 'text-slate-800/55'
                  }`}>
                    {toSquare(7, colIndex)[0].toUpperCase()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Hint recommendation engine
  const handleAskHint = () => {
    const moves = chessRef.current.moves({ verbose: true });
    if (moves.length === 0) return;
    
    // Choose simple center control or capture move as hint recommendation
    const captureMove = moves.find((m: any) => m.captured);
    const centerMove = moves.find((m: any) => ['d4', 'e4', 'd5', 'e5', 'Nf3', 'Nc3'].includes(m.san));
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    
    const hintMove = captureMove || centerMove || randomMove;
    if (hintMove) {
      setSelectedSquare(hintMove.from);
      triggerAudio('move');
      if (selectedCharacter) {
        setAiSpeech(`Cobalah jalankan bidakmu dari kotak ${hintMove.from.toUpperCase()} ke ${hintMove.to.toUpperCase()}! Pasti manjur! 🔥`);
      }
    }
  };

  // Undo move tracker (cost 10 XP to keep game balanced!)
  const handleUndoMove = () => {
    if (board.length === 0 || moveHistory.length < 2 || isAiThinking || gameResult) return;
    
    const chess = chessRef.current;
    chess.undo(); // Undo AI move
    chess.undo(); // Undo Player move
    setBoard(chess.board());
    setMoveHistory(prev => prev.slice(0, -2));
    setSelectedSquare(null);
    triggerAudio('move');
    if (selectedCharacter) {
      setAiSpeech("Aha! Kutarik kembali kata-kataku! Silakan coba lagi langkah hebatmu.");
    }
  };

  // Executing puzzle step validation
  const executePuzzleStep = (from: string, to: string) => {
    if (!activePuzzle) return;
    const chess = chessRef.current;
    
    try {
      // Execute the test move on board
      const attemptMove = chess.move({ from, to, promotion: 'q' });
      setBoard(chess.board());
      setSelectedSquare(null);

      // Simple FEN comparative solution, or checkmate condition!
      const targetSolutionMove = activePuzzle.solution[puzzleMovesPlayed];
      
      // Checking algebraic notations or matching target
      const playedMoveSan = attemptMove.san;
      const isCorrect = playedMoveSan === targetSolutionMove || 
                        (from + to) === targetSolutionMove ||
                        chess.isCheckmate();

      if (isCorrect) {
        const nextStepIndex = puzzleMovesPlayed + 1;
        if (nextStepIndex >= activePuzzle.solution.length) {
          // Fully solved!
          setPuzzleStatus('solved');
          triggerReward(activePuzzle.points, `Sukses menyelesaikan: ${activePuzzle.title}!`);
        } else {
          // Advance intermediate step
          setPuzzleMovesPlayed(nextStepIndex);
          triggerAudio('move');
        }
      } else {
        // Wrong Move! Lose 1 Heart!
        triggerAudio('error');
        chess.undo();
        setBoard(chess.board());
        setHearts(prev => Math.max(0, prev - 1));
        setPuzzleStatus('failed');
      }
    } catch (err) {
      triggerAudio('error');
    }
  };

  // Activates a selected tactic Puzzle
  const handleSelectPuzzle = (p: Puzzle) => {
    if (hearts <= 0) {
      triggerReward(0, "Aduh! Nyawamu habis. Ke Toko dulu untuk membeli nyawa!");
      return;
    }
    setActivePuzzle(p);
    setPuzzleMovesPlayed(0);
    setPuzzleStatus('playing');
    chessRef.current = new Chess(p.fen);
    setBoard(chessRef.current.board());
    setSelectedSquare(null);
  };

  // Executing basic lesson actions
  const executeLessonStep = (from: string, to: string) => {
    if (!activeLesson) return;
    const step = activeLesson.steps[lessonStepIndex];
    const chess = chessRef.current;

    try {
      if (step.requiredMove) {
        const isMatch = (from === step.requiredMove.from && to === step.requiredMove.to);
        
        if (isMatch) {
          chess.move({ from, to, promotion: 'q' });
          setBoard(chess.board());
          setSelectedSquare(null);
          
          if (lessonStepIndex + 1 < activeLesson.steps.length) {
            setLessonStatus('step-success');
            triggerAudio('win');
          } else {
            setLessonStatus('completed');
            triggerReward(activeLesson.points, `Hebat! Selesai Mempelajari: ${activeLesson.title}!`);
          }
        } else {
          triggerAudio('error');
        }
      } else {
        // Any move is fine
        chess.move({ from, to, promotion: 'q' });
        setBoard(chess.board());
        setSelectedSquare(null);
        setLessonStatus('step-success');
        triggerAudio('win');
      }
    } catch (e) {
      triggerAudio('error');
    }
  };

  // Deploys selected lessons state
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setLessonStepIndex(0);
    setLessonStatus('playing');
    chessRef.current = new Chess(lesson.steps[0].fen || '8/8/8/8/8/8/8/8 w - - 0 1');
    setBoard(chessRef.current.board());
    setSelectedSquare(null);
  };

  const handleNextLessonStep = () => {
    if (!activeLesson) return;
    const nextIdx = lessonStepIndex + 1;
    setLessonStepIndex(nextIdx);
    setLessonStatus('playing');
    chessRef.current = new Chess(activeLesson.steps[nextIdx].fen || '8/8/8/8/8/8/8/8 w - - 0 1');
    setBoard(chessRef.current.board());
    setSelectedSquare(null);
  };

  // cosmetic theme shop purchasing
  const buyTheme = (theme: PurchaseableTheme) => {
    if (xp >= theme.cost) {
      setXp(prev => prev - theme.cost);
      setUnlockedThemes(prev => [...prev, theme.id]);
      setBoardTheme(theme.id);
      triggerAudio('win');
    } else {
      triggerAudio('error');
    }
  };

  // Refilling hearts
  const buyHeartRefill = () => {
    if (xp >= 50) {
      setXp(prev => prev - 50);
      setHearts(5);
      triggerAudio('win');
    } else {
      triggerAudio('error');
    }
  };

  const activeThemeConfig = THEMES.find(t => t.id === boardTheme) || THEMES[0];

  return (
    <div className="min-h-screen bg-[#262421] text-[#bab9b8] flex flex-col font-sans selection:bg-emerald-950 antialiased">
      {/* HUD HEADER/TOP STATUS BAR (NATURAL TONES STYLED PANEL) */}
      <nav id="hud-nav" className="sticky top-0 z-40 bg-[#312e2b] border-b border-[#3c3934] px-3 py-3 sm:px-6 sm:py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-1.5">
          <div onClick={() => setMode('menu')} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#81b64c] shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 22H5v-2h14v2M17 10c0-1.35-.83-2.5-2-3c0-2-2-4-3-4s-3 2-3 4c-1.17.5-2 1.65-2 3c0 1.35.83 2.5 2 3h6c1.17-.5 2-1.35 2-3M18 18H6v-3h12v3m-7-3v-2h2v2h-2z" />
            </svg>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-[#81b64c] transition-colors uppercase">
                Catur<span className="text-[#81b64c]"> Nopal</span>
              </h1>
              <p className="text-[9px] font-mono font-bold tracking-wider text-[#9babaf] uppercase hidden sm:block">Arena Catur & Taktik Premium</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* STREAK */}
            <div className="flex items-center gap-1 cursor-default group" title="Streak harian permainanmu">
              <Flame className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-[#55534e]'}`} />
              <span className={`text-xs sm:text-sm font-black transition-all ${streak > 0 ? 'text-orange-400' : 'text-[#8a8883]'}`}>
                {streak}<span className="hidden xs:inline"> Hari</span>
              </span>
            </div>

            {/* HEARTS */}
            <button 
              onClick={() => {
                if (hearts < 5) {
                  setMode('store');
                  triggerAudio('move');
                }
              }}
              className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#3c3934] hover:border-[#81b64c] cursor-pointer hover:scale-105 transition-all group shrink-0" 
              title="Kesempatan Analisis / Nyawa. Klik untuk isi ulang di Store!"
            >
              <Heart className={`w-3.5 h-3.5 text-red-500 fill-red-500 ${hearts === 0 ? 'animate-ping' : ''}`} />
              <span className="text-[11px] sm:text-xs font-black text-white">
                {hearts}/5<span className="hidden sm:inline"> Kesempatan</span>
              </span>
            </button>

            {/* TOTAL POINTS XP/TROPHY */}
            <div className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0" title="Skor Keahlian (XP)">
              <Trophy className="w-3.5 h-3.5 text-[#FFC800] fill-yellow-500" />
              <span className="text-[11px] sm:text-xs font-black text-white">{xp} <span className="text-[9px] font-semibold text-slate-400">XP</span></span>
            </div>

            {/* SOUND SELECTOR */}
            <button
              id="sound-toggle-btn"
              onClick={() => {
                const updated = !soundEnabled;
                setSoundEnabled(updated);
                localStorage.setItem('sound', String(updated));
                if (updated) playSound('move');
              }}
              className="p-1.5 sm:p-2 text-[#9babaf] hover:text-white rounded-lg hover:bg-[#3c3934] cursor-pointer transition-colors"
              title={soundEnabled ? "Matikan Efek Suara" : "Aktifkan Efek Suara"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
            </button>
          </div>
        </div>
      </nav>

      {/* REWARD / CONFETTI MODAL POPUP */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#312e2b] rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border-2 border-[#81b64c]"
            >
              <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3c3934]">
                <Trophy className="w-9 h-9 text-yellow-500 fill-yellow-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">LUAR BIASA!</h3>
              <p className="text-xs text-slate-400 font-bold tracking-wide uppercase mb-4">Skor catur Anda bertambah!</p>
              
              <div className="bg-[#262421] rounded-xl py-3 px-4 border border-[#3c3934] mb-6 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#81b64c] fill-emerald-500" />
                <span className="text-[#81b64c] font-black text-lg">+{rewardAmount} XP Diperoleh</span>
              </div>
              
              <p className="text-[#bab9b8] font-semibold mb-6 text-sm">{rewardMessage}</p>
              
              <button
                id="close-reward-modal"
                onClick={() => setShowRewardModal(false)}
                className="w-full py-3 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold text-md rounded-xl shadow-lg cursor-pointer transition-colors uppercase border-b-4 border-[#5d8a32]"
              >
                Lanjutkan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col justify-start">
        {/* =========================================
             1. CORE DASHBOARD / MAIN MENU VIEW 
           ========================================= */}
        {mode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* HERO MOTIVATIONAL CARD */}
            <div className="md:col-span-12 bg-[#312e2b] rounded-3xl p-6 sm:p-8 border border-[#3c3934] flex flex-col md:flex-row items-center gap-6 justify-between shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500/10 animate-pulse shrink-0" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Tingkatkan ELO Catur Anda Hari Ini!</h2>
                  <p className="text-[#bab9b8] text-sm mt-1.5 font-semibold max-w-xl">
                    Asah taktik tanding, kuasai teori pembukaan legendaris, dan tantang bot mesin AI catur berkarakter yang dilatih khusus dengan kecerdasan Gemini AI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMode('select-character');
                  triggerAudio('move');
                }}
                className="px-8 py-4 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold text-lg rounded-2xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 active:shadow-none cursor-pointer transition-all uppercase shrink-0"
              >
                Lawan Komputer
              </button>
            </div>

            {/* FOUR COLUMN GRID CARD CHOICES */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-6">
              
              {/* CARD 1: CHARACTER MATCH ZONE */}
              <div 
                onClick={() => {
                  setMode('select-character');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-[#81b64c] hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5d8a32] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 fill-white/20 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Simulasi Bot AI</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Pilih bot catur legendaris dengan tingkat kesulitan 250 hingga 2850 ELO. Dapatkan analisis langkah langsung!
                </p>
                <div className="mt-5 flex items-center text-[#81b64c] font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  MAIN SEKARANG <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 2: TACTICS PUZZLE */}
              <div 
                onClick={() => {
                  setMode('puzzles');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-amber-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 fill-white/20 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Teka-Teki Taktis</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Latih kalkulasi langkah skakmat instan, tusukan sate (skewer), garpu ganda (fork) harian dan raih bonus XP!
                </p>
                <div className="mt-5 flex items-center text-amber-500 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  Pecahkan Taktik <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 3: BASIC TUTORIAL LESSONS */}
              <div 
                onClick={() => {
                  setMode('lessons');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-blue-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 fill-white/20 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Pelajari Teori</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Kuasai langkah penting seperti rokade aman, pergerakan kuda L, hingga pembukaan Ruy Lopez dan Italian Game.
                </p>
                <div className="mt-5 flex items-center text-blue-500 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  Mulai Pelajaran <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 4: ONLINE MULTIPLAYER */}
              <div 
                onClick={() => {
                  setMode('online-match');
                  setOnlineStatus('idle');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-emerald-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Catur Online</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Duel langsung dengan kawan catur di Arena Utama. Naikkan peringkat ELO-mu, nikmati obrolan interaktif langsung!
                </p>
                <div className="mt-5 flex items-center text-emerald-500 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  Main Online <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* LOWER STATS AND ACCESSORY ROW */}
            <div className="md:col-span-4 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#81b64c] fill-[#81b64c]" />
                Klub Statistik Premium
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#3c3934] pb-3">
                  <span className="text-[#9babaf] text-sm font-bold">Aktivitas Beruntun</span>
                  <span className="text-white font-extrabold">{streak} Hari</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#3c3934] pb-3">
                  <span className="text-[#9babaf] text-sm font-bold">Poin Keahlian</span>
                  <span className="text-white font-extrabold">{xp} XP</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#3c3934] pb-3">
                  <span className="text-[#9babaf] text-sm font-bold">Status Keanggotaan</span>
                  <span className="text-[#81b64c] font-black uppercase text-[10px] px-2.5 py-1 bg-[#262421] rounded-lg border border-[#3c3934]">Gold Member</span>
                </div>
                <button
                  onClick={() => { setMode('store'); triggerAudio('move'); }}
                  className="w-full mt-2 py-3 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] shadow-[0_4px_0_0_#211f1d] active:translate-y-1 active:shadow-none transition-all font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#81b64c]" /> Buka Toko Board & Tema
                </button>
              </div>
            </div>

            <div className="md:col-span-8 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Saran AI Coach Hari Ini
                </h3>
                {/* Dynamic Coach Advisor Toggle Buttons */}
                <div className="flex items-center gap-2 bg-[#2d2a27] p-1.5 rounded-2xl border border-[#3c3934]">
                  {[
                    { id: 'martin', elo: 250, name: 'Martin', avatar: '/src/assets/images/avatar_martin_1779709510230.png', tip: 'Menguasai lajur tengah papan catur dengan pion di fase awal pembukaan akan memberikan ruang gerak luas bagi perwira utamamu. Selalu pastikan Raja Anda terlindungi melalui rokade cepat sebelum menginisiasi serangan!' },
                    { id: 'nelson', elo: 1300, name: 'Nelson', avatar: '/src/assets/images/nelson_avatar_1779712159293.png', tip: 'Jangan panik jika lawan menyerang dengan Ratu terlalu awal. Amankan koordinat f7 dan f2 dengan baik, kemudian kembangkan perwira kecilmu untuk mengejar Ratu yang terlalu aktif.' },
                    { id: 'wally', elo: 1800, name: 'Wally', avatar: '/src/assets/images/wally_avatar_1779712178593.png', tip: 'Struktur pion kokoh adalah kunci sukses posisi taktis catur solid. Jaga keutuhan barisan pionmu, lakukan manuver perlahan untuk mendominasi jalur-terbuka dengan Benteng.' },
                    { id: 'magnus', elo: 2850, name: 'Magnus', avatar: '/src/assets/images/magnus_avatar_1779712198066.png', tip: 'Setiap langkah harus dijalankan dengan presisi kalkulatif tingkat tinggi. Di fase permainan akhir (endgame), aktifkan Rajamu ke baris tengah untuk menyokong penetrasi pion promosi.' }
                  ].map((coach) => {
                    const isActive = dashboardCoachId === coach.id;
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => {
                          setDashboardCoachId(coach.id as any);
                          triggerAudio('move');
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          isActive 
                            ? 'border-[#81b64c] scale-110 shadow-[0_0_10px_rgba(129,182,76,0.3)] bg-[#81b64c]/20' 
                            : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'
                        }`}
                        title={`Saran dari Coach ${coach.name}`}
                      >
                        <img src={coach.avatar} alt={coach.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {[
                { id: 'martin', elo: 250, name: 'Martin', avatar: '/src/assets/images/avatar_martin_1779709510230.png', tip: 'Menguasai lajur tengah papan catur dengan pion di fase awal pembukaan akan memberikan ruang gerak luas bagi perwira utamamu. Selalu pastikan Raja Anda terlindungi melalui rokade cepat sebelum menginisiasi serangan!' },
                { id: 'nelson', elo: 1300, name: 'Nelson', avatar: '/src/assets/images/nelson_avatar_1779712159293.png', tip: 'Jangan panik jika lawan menyerang dengan Ratu terlalu awal. Amankan koordinat f7 dan f2 dengan baik, kemudian kembangkan perwira kecilmu untuk mengejar Ratu yang terlalu aktif.' },
                { id: 'wally', elo: 1800, name: 'Wally', avatar: '/src/assets/images/wally_avatar_1779712178593.png', tip: 'Struktur pion kokoh adalah kunci sukses posisi taktis catur solid. Jaga keutuhan barisan pionmu, lakukan manuver perlahan untuk mendominasi jalur-terbuka dengan Benteng.' },
                { id: 'magnus', elo: 2850, name: 'Magnus', avatar: '/src/assets/images/magnus_avatar_1779712198066.png', tip: 'Setiap langkah harus dijalankan dengan presisi kalkulatif tingkat tinggi. Di fase permainan akhir (endgame), aktifkan Rajamu ke baris tengah untuk menyokong penetrasi pion promosi.' }
              ].filter(c => c.id === dashboardCoachId).map(coach => (
                <div key={coach.id} className="flex gap-4 items-start p-4 bg-[#262421] rounded-2xl border border-[#3c3934] relative animate-fade-in">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#81b64c] shadow-md shrink-0 bg-[#312e2b] flex items-center justify-center">
                    <img src={coach.avatar} alt={coach.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#81b64c] uppercase tracking-wide">Tips Strategis Coach {coach.name} ({coach.elo} ELO):</h4>
                    <p className="text-[#bab9b8] italic text-sm mt-1.5 leading-relaxed">
                      "{coach.tip}"
                    </p>
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#81b64c] rounded-full flex items-center justify-center font-bold text-white shadow-[0_2px_0_0_#5d8a32]">!</div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================
             2. CHARACTER SELECTOR VIEW (VERSUS AI)
           ========================================= */}
        {mode === 'select-character' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-4 px-4 py-2 flex items-center gap-2 text-xs font-extrabold text-white bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] hover:border-[#81b64c] rounded-xl shadow-[0_3px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Menu Utama
                </button>
                <h2 className="text-3xl font-extrabold tracking-tight text-white animate-fade-in">Pilih Lawan Bot AI Kamu!</h2>
                <p className="text-[#9babaf] font-semibold text-sm mt-1">Pilih bot engine catur dengan kepribadian taktis unik, tingkat ELO, dan komentar interaktif bertenaga Gemini AI!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {CHARACTERS.map((char) => (
                <div 
                  key={char.id}
                  className="bg-[#312e2b] rounded-3xl overflow-hidden border border-[#3c3934] hover:border-[#81b64c] hover:bg-[#3c3934] transition-all cursor-pointer flex flex-col h-full group pb-1"
                  onClick={() => handleSelectCharacter(char)}
                >
                  {/* Avatar Section */}
                  <div className={`p-6 bg-gradient-to-b ${char.color} flex justify-center items-center h-44 relative overflow-hidden shrink-0`}>
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <span className="text-[10px] font-black tracking-wider uppercase text-white font-mono">ELO {char.elo}</span>
                    </div>

                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#312e2b] shadow-lg transform group-hover:scale-105 transition-transform">
                      <img 
                        src={char.avatar} 
                        alt={char.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                  </div>

                  {/* Character Meta */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-white">{char.name}</h3>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-[#262421] text-[#9babaf] border border-[#3c3934]">
                          {char.difficulty}
                        </span>
                      </div>
                      <p className="text-[#81b64c] text-xs font-bold mb-3 uppercase tracking-wider">{char.playstyle}</p>
                      <p className="text-[#bab9b8] text-sm font-semibold leading-relaxed mb-4">{char.bio}</p>
                    </div>

                    <button 
                      className="w-full py-3 bg-[#81b64c] group-hover:bg-[#92ca5a] text-white font-extrabold rounded-xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 active:shadow-none cursor-pointer transition-all uppercase text-xs"
                    >
                      Bermain Bersama
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
             3. PLAY AGAINST AI (CHESS ENGINE + GEMINI COMM)
           ========================================= */}
        {mode === 'play' && selectedCharacter && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* IN-GAME TOP LEFT BAR */}
            <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#312e2b] p-4 rounded-2xl border border-[#3c3934] shadow-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setMode('select-character');
                    triggerAudio('move');
                  }}
                  className="py-2.5 px-4 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] hover:border-[#81b64c] font-extrabold rounded-xl shadow-[0_3px_0_0_#1d1b19] active:translate-y-0.5 active:shadow-none transition-all text-xs uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Ganti Lawan
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#3c3934]">
                    <img 
                      src={selectedCharacter.avatar} 
                      alt={selectedCharacter.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white leading-tight">Melawan {selectedCharacter.name}</h3>
                    <p className="text-[10px] font-mono font-bold text-[#9babaf] uppercase">Gaya: {selectedCharacter.playstyle}</p>
                  </div>
                </div>
              </div>

              {/* GAME STATE NOTIFICATION HEADLINE */}
              {gameResult && (
                <div className={`px-4 py-1.5 rounded-xl border font-extrabold text-xs uppercase flex items-center gap-2 ${
                  (gameResult === 'win' || gameResult === 'win-time') ? 'bg-[#263121] text-[#81b64c] border-[#81b64c]' :
                  (gameResult === 'lose' || gameResult === 'lose-time') ? 'bg-red-950/50 text-red-400 border-red-900' :
                  'bg-amber-950/50 text-amber-500 border-amber-900'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  {gameResult === 'win' && 'Skakmat! Kamu menang!'}
                  {gameResult === 'win-time' && 'Waktu AI habis! Kamu menang secara waktu! ⏱️'}
                  {gameResult === 'lose' && 'Skakmat! Kamu kalah dari AI.'}
                  {gameResult === 'lose-time' && 'Waktumu habis! Kamu kalah secara waktu. ⏱️'}
                  {gameResult === 'draw' && 'Seri (Draw) ! Papan terkunci.'}
                </div>
              )}

              {/* LAST MOVE ANALYSIS BADGE */}
              {lastMove && lastMove.type && (
                <div className={`px-4 py-2 rounded-xl border flex items-center justify-between gap-3 text-[11px] w-full max-w-md ${EVALUATION_LABELS[lastMove.type]?.bg} shadow-md animate-fade-in select-none`}>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="text-sm">{EVALUATION_LABELS[lastMove.type]?.icon}</span>
                    <span>Langkah Terakhir:</span>
                    <span className="font-extrabold font-mono bg-black/40 px-1.5 py-0.5 rounded text-[#81b64c]">
                      {moveHistory[moveHistory.length - 1] || '-'}
                    </span>
                  </div>
                  <div className={`font-black uppercase tracking-wider text-[10px] ${EVALUATION_LABELS[lastMove.type]?.text}`}>
                    {EVALUATION_LABELS[lastMove.type]?.label}
                  </div>
                </div>
              )}

              {/* ACTION RESET ROW & CHESS CLOCK CONFIG */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Chess Clock Selector */}
                <div className="flex items-center gap-1.5 bg-[#262421] border border-[#3c3934] p-1 rounded-xl">
                  <button
                    onClick={() => {
                      const next = !timerEnabled;
                      setTimerEnabled(next);
                      localStorage.setItem('timerEnabled', String(next));
                      triggerAudio('move');
                    }}
                    type="button"
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      timerEnabled 
                        ? 'bg-[#81b64c] text-white shadow-[0_2px_0_0_#5d8a32]' 
                        : 'bg-transparent text-[#9babaf] hover:text-white'
                    }`}
                    title="Aktifkan/Matikan Jam Catur"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {timerEnabled ? 'Waktu Aktif' : 'Tanpa Waktu'}
                  </button>

                  {timerEnabled && (
                    <select
                      value={timerLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setTimerLimit(newLimit);
                        localStorage.setItem('timerLimit', String(newLimit));
                        resetAiGame(selectedCharacter, newLimit);
                        triggerAudio('move');
                      }}
                      className="bg-[#262421] text-white text-[10px] font-extrabold border border-[#3c3934] rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-[#81b64c] max-w-[85px]"
                    >
                      <option value={60}>1 Menit</option>
                      <option value={180}>3 Menit</option>
                      <option value={300}>5 Menit</option>
                      <option value={600}>10 Menit</option>
                      <option value={900}>15 Menit</option>
                      <option value={1800}>30 Menit</option>
                    </select>
                  )}
                </div>

                <button
                  onClick={() => resetAiGame(selectedCharacter)}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] font-extrabold rounded-xl shadow-[0_3px_0_0_#1d1b19] active:translate-y-0.5 active:shadow-none transition-all text-xs uppercase cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Papan
                </button>
              </div>
            </div>

            {/* CHESSBOARD GRAPHICS SYSTEM */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className={`w-full max-w-md p-3.5 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                
                {/* OPPONENT NAME PLATE */}
                <div className="flex items-center justify-between mb-2 px-2 pb-1 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                      <img src={selectedCharacter.avatar} alt="Opponent" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-xs font-black tracking-wide uppercase">{selectedCharacter.name} (AI)</span>
                    {isAiThinking && (
                      <span className="flex gap-0.5 items-center ml-1">
                        <span className="w-1 bg-[#81b64c] h-1.5 rounded-full animate-bounce" />
                        <span className="w-1 bg-[#81b64c] h-1.5 rounded-full animate-bounce delay-75" />
                        <span className="w-1 bg-[#81b64c] h-1.5 rounded-full animate-bounce delay-150" />
                      </span>
                    )}
                  </div>

                  {/* AI Chess Clock Timer */}
                  {timerEnabled ? (
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-all outline outline-1 ${
                      chessRef.current.turn() === 'b' || isAiThinking
                        ? 'bg-red-500/10 text-red-500 outline-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse'
                        : 'bg-[#262421] text-[#bab9b8] outline-white/10'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(aiTime)}
                    </div>
                  ) : (
                    <span className="text-white/60 text-[10px] font-mono uppercase">Langkah Hitam</span>
                  )}
                </div>

                {/* THE 8X8 TILED BOARD GRID */}
                {renderChessboard()}

                {/* PLAYER BOTTOM NAME PLATE */}
                <div className="flex items-center justify-between mt-2 px-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-[#262421] flex items-center justify-center">
                      <span className="text-[10px] font-black text-[#81b64c]">K</span>
                    </div>
                    <span className="text-white text-xs font-black tracking-wide uppercase">KAMU (Putih)</span>
                  </div>

                  {/* Player Chess Clock Timer */}
                  {timerEnabled ? (
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-all outline outline-1 ${
                      chessRef.current.turn() === 'w' && !isAiThinking
                        ? (playerTime <= 30 
                            ? 'bg-red-600/20 text-red-400 outline-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-bounce' 
                            : 'bg-[#81b64c]/10 text-[#81b64c] outline-[#81b64c]/40 shadow-[0_0_8px_rgba(129,182,76,0.2)]'
                          )
                        : 'bg-[#262421] text-[#bab9b8] outline-white/10'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(playerTime)}
                    </div>
                  ) : (
                    <span className="text-white/60 text-[10px] font-mono uppercase">Langkah Putih</span>
                  )}
                </div>

              </div>
            </div>

            {/* MENTOR DIALOG CARD & CHAT SPEECH BUBBLE */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                <div className="bg-[#262421] border border-[#3c3934] rounded-2xl p-4 flex flex-col gap-3 relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#81b64c] rounded-full flex items-center justify-center font-extrabold text-white">!</div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#81b64c] to-[#5d8a32] p-0.5 overflow-hidden shrink-0 border border-[#3c3934] shadow-sm">
                      <img 
                        src={selectedCharacter.avatar} 
                        alt="Mentor Avatar" 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover select-none rounded-[10px]"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#81b64c]">{selectedCharacter.name} berkata:</span>
                      <div className="text-[9px] font-black tracking-wide text-slate-400">ANALISIS BOT INTERAKTIF</div>
                    </div>
                  </div>

                  <div>
                    {isAiThinking ? (
                      <div className="flex gap-1.5 items-center text-[#81b64c] text-sm italic font-extrabold animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {selectedCharacter.name} sedang menghitung langkah...
                      </div>
                    ) : (
                      <p className="text-white font-semibold italic text-sm leading-relaxed">
                        "{aiSpeech || selectedCharacter.welcomeMsg}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTROLS UTILITY PANEL */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                <h4 className="font-extrabold text-white text-md uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-[#81b64c]" /> Alat Bantu Pembelajaran
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* HINT BUTTON */}
                  <button
                    onClick={handleAskHint}
                    disabled={isAiThinking || gameResult ? true : false}
                    className="p-4 bg-[#262421] hover:bg-[#3c3934] disabled:opacity-50 text-amber-500 border border-[#3c3934] shadow-[0_4px_0_0_#211f1d] active:translate-y-1 active:shadow-none transition-all text-xs flex flex-col items-center gap-1.5 cursor-pointer font-black"
                  >
                    <HelpCircle className="w-5 h-5" />
                    BANTUAN TAB TAKTIK
                  </button>

                  {/* TAKEBACK (UNDO) BUTTON */}
                  <button
                    onClick={handleUndoMove}
                    disabled={isAiThinking || gameResult || moveHistory.length < 2 ? true : false}
                    className="p-4 bg-[#262421] hover:bg-[#3c3934] disabled:opacity-50 text-red-400 border border-[#3c3934] shadow-[0_4px_0_0_#211f1d] active:translate-y-1 active:shadow-none transition-all text-xs flex flex-col items-center gap-1.5 cursor-pointer font-black"
                  >
                    <RotateCcw className="w-5 h-5" />
                    KEMBALIKAN (UNDO)
                  </button>

                </div>

                {/* GAME MOVE JOURNAL COLUMN */}
                <div className="mt-6 border-t border-[#3c3934] pt-4">
                  <h5 className="text-[10px] font-mono text-[#9babaf] uppercase tracking-widest mb-2 font-black">Histori Langkah Permainan:</h5>
                  <div className="max-h-24 overflow-y-auto bg-[#262421] p-3 rounded-xl border border-[#3c3934] font-mono text-xs text-slate-300">
                    {moveHistory.length === 0 ? (
                      <span className="text-slate-500 italic">Belum ada langkah dimulai...</span>
                    ) : (
                      <div className="grid grid-cols-3 gap-y-1">
                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => (
                          <div key={idx} className="col-span-3 grid grid-cols-3">
                            <span className="text-slate-500">{idx + 1}.</span>
                            <span className="text-white font-bold">{moveHistory[idx * 2]}</span>
                            <span className="text-[#81b64c]">{moveHistory[idx * 2 + 1] || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================================
             4. PUZZLES SYSTEM (LIVES + XP HARVESTING)
           ========================================= */}
        {mode === 'puzzles' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* IN-GAME TOP LEFT BAR */}
            <div className="md:col-span-12 flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-[#4b4b4b] bg-white hover:bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-xl shadow-[0_3px_0_0_#e5e5e5] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-extrabold text-[#4B4B4B] tracking-tight">Teka-Teki Taktis Catur</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#777777]">PUNYA NYAWA:</span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#FF4B4B] font-extrabold rounded-lg border-2 border-red-200">
                  <Heart className="w-4 h-4 fill-[#FF4B4B]" /> {hearts}
                </div>
              </div>
            </div>

            {/* PUZZLE SELECTOR SIDE LIST */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <h3 className="font-extrabold text-sm uppercase text-[#777777] tracking-wider">Tantangan Tersedia</h3>
              <div className="space-y-3">
                {PUZZLES.map((p) => {
                  const isActive = activePuzzle?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPuzzle(p)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        isActive 
                          ? 'bg-[#FFF4D1] border-[#FFC800] shadow-md scale-[1.01]' 
                          : 'bg-white border-[#E5E5E5] hover:border-[#FFC800]'
                      }`}
                    >
                      <div className="px-1.5 py-0.5 min-w-[3rem] h-10 rounded-xl bg-[#FFF4D1] border border-[#FFC800] flex flex-col items-center justify-center font-extrabold text-[#AF7E00] shrink-0 text-xs leading-none">
                        <span>{p.points}</span>
                        <span className="text-[8px] font-black tracking-wider opacity-85 mt-0.5">XP</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-extrabold text-sm text-[#4B4B4B] leading-tight">{p.title}</h4>
                          <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-slate-100 text-[#777777] rounded-md">
                            {p.difficulty}
                          </span>
                        </div>
                        <p className="text-[#777777] text-xs font-[#777777] line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PUZZLE ACTIVE PLAY AREA */}
            <div className="md:col-span-8 flex flex-col items-center">
              {activePuzzle ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-sm mb-4 bg-[#FFF4D1] border-2 border-[#FFC800] p-4 rounded-2xl text-center shadow-sm">
                    <h3 className="font-extrabold text-[#AF7E00] text-sm uppercase tracking-wide mb-1">Target Misi:</h3>
                    <p className="text-[#4B4B4B] font-bold text-xs leading-relaxed">{activePuzzle.description}</p>
                  </div>

                  {/* ACTIVE PUZZLE BOARD */}
                  <div className={`w-full max-w-md p-4 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                    {renderChessboard()}
                  </div>

                  {/* STATS CONTROL CARD FOR PUZZLE STATUS */}
                  <div className="w-full max-w-sm mt-4 bg-white p-6 rounded-2xl border-2 border-[#E5E5E5] shadow-sm text-center">
                    {puzzleStatus === 'playing' && (
                      <div className="flex flex-col items-center justify-center">
                        <span className="flex items-center gap-1.5 text-[#777777] font-extrabold text-xs uppercase tracking-wider animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC800] inline-block shadow-xs" /> MENUNGGU LANGKAH TERBAIKMU...
                        </span>
                        <p className="text-[10px] text-[#777777] italic mt-3 font-semibold">Blunder atau salah jalan mengurangi 1 Nyawa!</p>
                      </div>
                    )}

                    {puzzleStatus === 'solved' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 border border-green-200 text-green-600 font-extrabold">
                          ✓
                        </div>
                        <h4 className="font-extrabold text-green-700 text-lg mb-1">Berhasil Memecahkan Masalah!</h4>
                        <p className="text-[#777777] text-xs font-semibold mb-3">{activePuzzle.explanation}</p>
                        <div className="py-1 px-3 bg-green-50 text-green-700 font-black tracking-wide uppercase text-xs rounded-xl inline-block border border-green-200">
                          +{activePuzzle.points} XP Didapatkan!
                        </div>
                      </div>
                    )}

                    {puzzleStatus === 'failed' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 border border-red-200 text-red-500 font-extrabold">
                          ✗
                        </div>
                        <h4 className="font-extrabold text-red-700 text-md mb-2">Aduh, Langkah Itu Salah!</h4>
                        <p className="text-[#777777] text-xs font-semibold mb-4 leading-relaxed">Itu adalah langkah blunder! Coba pelajari taktik pertahanan.</p>
                        <button
                          onClick={() => handleSelectPuzzle(activePuzzle)}
                          className="px-4 py-2.5 bg-white text-[#FF4B4B] border-2 border-[#E5E5E5] font-extrabold rounded-xl shadow-[0_4px_0_0_#E5E5E5] active:translate-y-1 active:shadow-none text-xs uppercase transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-[#E5E5E5] p-6 text-center shadow-xs">
                  <div>
                    <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-extrabold text-[#4B4B4B] text-lg">Pilih salah satu Tantangan Puzzle</h3>
                    <p className="text-[#777777] text-sm mt-1 max-w-xs font-semibold">Buktikan kecerdikan taktismu dengan skakmat instan.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================
             5. LESSONS SYSTEM (STEP BY STEP)
           ========================================= */}
        {mode === 'lessons' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* IN-GAME TOP LEFT BAR */}
            <div className="md:col-span-12 flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-[#4b4b4b] bg-white hover:bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-xl shadow-[0_3px_0_0_#e5e5e5] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-extrabold text-[#4B4B4B] tracking-tight">Katalog Pembelajaran Dasar</h2>
              </div>
            </div>

            {/* LESSONS LIST ON SIDEBAR */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <h3 className="font-extrabold text-sm uppercase text-[#777777] tracking-wider">Modul Belajar</h3>
              <div className="space-y-3">
                {LESSONS.map((l) => {
                  const isActive = activeLesson?.id === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => handleSelectLesson(l)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        isActive 
                          ? 'bg-[#DDF4FF] border-[#1CB0F6] shadow-md scale-[1.01]' 
                          : 'bg-white border-[#E5E5E5] hover:border-[#1CB0F6]'
                      }`}
                    >
                      <div className="px-1.5 py-0.5 min-w-[3rem] h-10 rounded-xl bg-[#DDF4FF] border border-[#84D8FF] flex flex-col items-center justify-center font-extrabold text-[#1CB0F6] shrink-0 text-xs leading-none">
                        <span>{l.points}</span>
                        <span className="text-[8px] font-black tracking-wider opacity-85 mt-0.5">XP</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-extrabold text-sm text-[#4B4B4B] leading-tight">{l.title}</h4>
                          <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-slate-100 text-[#777777] rounded-md">
                            {l.difficulty}
                          </span>
                        </div>
                        <p className="text-[#777777] text-xs font-semibold line-clamp-1">{l.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE LESSONS WORKSPACE */}
            <div className="md:col-span-8 flex flex-col items-center">
              {activeLesson ? (
                <div className="w-full flex flex-col items-center">
                  
                  {/* STEPPER PROGRESS CIRCLES */}
                  <div className="w-full max-w-sm mb-4 bg-white border-2 border-[#E5E5E5] p-3 rounded-2xl flex items-center justify-center gap-3">
                    {activeLesson.steps.map((step, idx) => {
                      const isCompleted = idx < lessonStepIndex;
                      const isCurrent = idx === lessonStepIndex;
                      return (
                        <div 
                          key={idx} 
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs border-2 ${
                            isCompleted ? 'bg-[#58CC02] border-[#46A302] text-white' :
                            isCurrent ? 'bg-[#1CB0F6] border-[#0D94D2] text-white animate-pulse' :
                            'bg-white border-[#E5E5E5] text-[#777777]'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>

                  {/* ACTIVE STEP DETAILS CARD */}
                  <div className="w-full max-w-sm mb-4 bg-white border-2 border-[#E5E5E5] p-4 rounded-2xl text-center shadow-xs">
                    <h3 className="font-extrabold text-[#4B4B4B] text-md uppercase tracking-wide mb-1">
                      {activeLesson.steps[lessonStepIndex].title}
                    </h3>
                    <p className="text-[#777777] font-semibold text-xs leading-relaxed">
                      {activeLesson.steps[lessonStepIndex].description}
                    </p>
                  </div>

                  {/* ACTIVE LESSON CHESSBOARD */}
                  <div className={`w-full max-w-md p-4 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                    {renderChessboard()}
                  </div>

                  {/* BOTTOM ACTION FEEDBACK FOR STEPS */}
                  <div className="w-full max-w-sm mt-4 bg-white p-6 rounded-2xl border-2 border-[#E5E5E5] shadow-sm text-center font-semibold">
                    {lessonStatus === 'playing' && (
                      <span className="flex items-center justify-center gap-1.5 text-[#777777] font-extrabold text-xs uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1CB0F6] inline-block animate-pulse" /> MENANTI GERAKAN PERWIRA...
                      </span>
                    )}

                    {lessonStatus === 'step-success' && (
                      <div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 text-green-600 font-extrabold">
                          ✓
                        </div>
                        <h4 className="font-extrabold text-green-700 text-sm mb-3">Langkah Ini Benar!</h4>
                        <button
                          onClick={handleNextLessonStep}
                          className="w-full py-3.5 bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none text-xs uppercase cursor-pointer transition-colors"
                        >
                          Langkah Selanjutnya
                        </button>
                      </div>
                    )}

                    {lessonStatus === 'completed' && (
                      <div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 text-green-600 font-extrabold">
                          ✓
                        </div>
                        <h4 className="font-extrabold text-green-700 text-md mb-2">Hebat, Latihan Selesai!</h4>
                        <div className="py-1 px-3 bg-green-50 text-green-700 font-black tracking-wide uppercase text-xs rounded-xl inline-block border border-green-200">
                          +{activeLesson.points} XP Didapatkan!
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-[#E5E5E5] p-6 text-center shadow-xs">
                  <div>
                    <GraduationCap className="w-12 h-12 text-[#81b64c] mx-auto mb-4" />
                    <h3 className="font-extrabold text-[#4B4B4B] text-lg">Pilih salah satu Modul Latihan</h3>
                    <p className="text-[#777777] text-sm mt-1 max-w-xs font-semibold">Asah dasar caturmu agar melangkah mantap.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================
             5. ONLINE MULTIPLAYER MATCH ZONE
           ========================================= */}
        {mode === 'online-match' && (
          <div className="space-y-6">
            
            {/* MATCH HUB BACK TO MENU NAV */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5] gap-4">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    setOnlineStatus('idle');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-[#4b4b4b] bg-white hover:bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-xl shadow-[0_3px_0_0_#e5e5e5] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-extrabold text-[#4B4B4B] tracking-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[#1cb0f6] shrink-0" /> Arena Catur Online
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#777777] uppercase font-mono">Ratingmu:</span>
                <span className="px-3 py-1 bg-[#DDF4FF] text-[#1CB0F6] border-2 border-[#84D8FF] font-black font-mono text-sm rounded-lg shadow-xs">
                  {onlineRating} ELO
                </span>
              </div>
            </div>

            {/* STATUS 1: LOBBY IDLE */}
            {onlineStatus === 'idle' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN LEFT: CONFIGURATION & HISTORY */}
                <div className="md:col-span-12 lg:col-span-7 space-y-6">
                  
                  {/* CONFIG PROFILE BOX */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-[#E5E5E5] shadow-sm">
                    <h3 className="text-lg font-black text-[#4B4B4B] mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <User className="w-5 h-5 text-[#81b64c] shrink-0" /> Profil Pemain Anda
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-[#777777] uppercase tracking-wider mb-2">Ganti Nickname Caturmu:</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            maxLength={15}
                            value={username}
                            onChange={(e) => handleSaveUsername(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#E5E5E5] focus:border-[#1CB0F6] text-sm font-extrabold text-[#4B4B4B] focus:outline-none"
                            placeholder="Ketik username baru..."
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border-2 border-[#E5E5E5] text-center">
                        <span className="block text-[10px] text-[#777777] font-black uppercase tracking-widest mb-1">Gelar Saat Ini</span>
                        <span className="text-xs font-black px-2.5 py-1 text-[#AF7E00] bg-[#FFF4D1] rounded-lg border border-[#FFC800] uppercase">
                          {getRatingBadge(onlineRating)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FIND OPPONENT HERO CALLOUT */}
                  <div className="bg-[#FFF4D1] p-6 rounded-3xl border-2 border-[#FFC800] text-center shadow-xs flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-[#FFC800] shrink-0">
                      <Sparkles className="w-6 h-6 text-[#AF7E00]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-[#AF7E00] uppercase tracking-wide">Siap Menantang Pemain Lain?</h3>
                      <p className="text-slate-600 font-semibold text-xs max-w-md mt-1 mx-auto leading-relaxed">
                        Kami akan mencocokkan Anda dengan pemain tangguh dengan ELO serupa secara real-time. Siapkan pertahanan Caro-Kann atau serangan Sisilia terbaik Anda!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOnlineStatus('searching');
                        triggerAudio('move');
                      }}
                      className="w-full max-w-xs py-3.5 bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider text-sm cursor-pointer"
                    >
                      Cari Lawan Catur Sekarang ➜
                    </button>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      Server: 0.0.0.0:3000 Online Aktif
                    </div>
                  </div>

                  {/* HISTORY MATCH LIST */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-[#E5E5E5] shadow-sm">
                    <h3 className="text-lg font-black text-[#4B4B4B] mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <History className="w-5 h-5 text-[#81b64c] shrink-0" /> Riwayat Duel Terakhir
                    </h3>
                    {onlineHistory.length === 0 ? (
                      <div className="py-8 my-1 text-center border-2 border-dashed border-[#E5E5E5] rounded-2xl">
                        <span className="text-slate-400 font-bold text-sm">Belum ada pertandingan online tercatat. Mulai duel pertamamu!</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {onlineHistory.map((h: any, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-md p-1.5 rounded-lg border leading-none font-bold shrink-0 ${
                                h.outcome === 'win' ? 'bg-green-100 border-green-200 text-green-700' :
                                h.outcome === 'lose' ? 'bg-red-100 border-red-200 text-red-700' :
                                'bg-gray-100 border-gray-200 text-gray-700'
                              }`}>
                                {h.outcome === 'win' ? 'M' : h.outcome === 'lose' ? 'K' : 'S'}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-700">Lawan: {h.opponent} <span className="text-[9px] font-mono text-slate-400">({h.opponentElo} ELO)</span></h4>
                                <p className="text-[9px] font-mono text-slate-400">Selesai pada: {h.date} | {h.movesCount} Langkah</p>
                              </div>
                            </div>
                            <span className={`font-mono text-sm font-black ${
                              h.eloDiff >= 0 ? 'text-green-600' : 'text-red-500'
                            }`}>
                              {h.eloDiff >= 0 ? `+${h.eloDiff}` : h.eloDiff} ELO
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* COLUMN RIGHT: NATIONAL LEADERBOARD */}
                <div className="md:col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-[#E5E5E5] shadow-sm">
                  <h3 className="text-lg font-black text-[#4B4B4B] mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500/20 shrink-0" /> Papan Peringkat Nasional
                  </h3>
                  <div className="space-y-3">
                    {rankingList.map((player: any, index: number) => {
                      const isCurrentUser = player.isUser;
                      return (
                        <div 
                          key={index} 
                          className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                            isCurrentUser 
                              ? 'bg-[#FFF4D1] border-[#FFC800] ring-2 ring-yellow-400/20' 
                              : 'bg-white border-[#E5E5E5] hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                              index === 0 ? 'bg-yellow-400 text-white' :
                              index === 1 ? 'bg-slate-300 text-slate-700' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-black ${isCurrentUser ? 'text-[#AF7E00]' : 'text-[#4B4B4B]'}`}>
                                  {player.name}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[8px] font-mono px-1 bg-yellow-400 text-white rounded">
                                    ANDA
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                {player.badge || getRatingBadge(player.elo)}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-extrabold text-[#4B4B4B]">
                            {player.elo} <span className="text-[10px] text-slate-400">ELO</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STATUS 2: SEARCHING OPPONENT SCREEN */}
            {onlineStatus === 'searching' && (
              <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-3xl border-2 border-[#E5E5E5] text-center shadow-md flex flex-col items-center gap-6 py-12">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#58CC02]/20 rounded-full animate-ping pointer-events-none duration-1000" />
                  <div className="absolute inset-4 bg-[#58CC02]/20 rounded-full animate-pulse pointer-events-none duration-2500" />
                  <div className="w-16 h-16 bg-[#58CC02] text-white flex items-center justify-center rounded-full shadow-lg border-2 border-white z-10">
                    <Search className="w-8 h-8 animate-bounce" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#4B4B4B] uppercase tracking-wide">Mencari Lawan Catur...</h3>
                  <p className="text-slate-500 font-semibold text-xs mt-2 leading-relaxed">
                    Menghubungi server multiplayer di port 3000...<br />
                    Mencari pecatur lain dengan tingkat keahlian seimbang.
                  </p>
                </div>
                <div className="py-2.5 px-6 bg-slate-100 rounded-full border border-slate-200 font-mono text-xs font-black text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Durasi Pencarian: {searchTime} Detik
                </div>
                <button
                  onClick={() => {
                    setOnlineStatus('idle');
                    triggerAudio('move');
                  }}
                  className="px-6 py-2.5 bg-white text-red-500 border-2 border-[#E5E5E5] rounded-xl font-extrabold shadow-[0_4px_0_0_#E5E5E5] active:translate-y-1 active:shadow-none text-xs uppercase cursor-pointer"
                >
                  Batalkan Pencarian
                </button>
              </div>
            )}

            {/* STATUS 3: PLAYING DUEL AREA */}
            {onlineStatus === 'playing' && onlineOpponent && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN LEFT: INTERACTIVE CHESS BOARD LAYER */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className={`w-full max-w-md p-3.5 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                    
                    {/* OPPONENT TOP INFO CARD */}
                    <div className="flex items-center justify-between mb-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 border border-red-300 flex items-center justify-center font-bold text-red-500 text-xs text-center">
                          L
                        </div>
                        <span className="text-white text-xs font-black tracking-wide uppercase">
                          {onlineOpponent.name} ({onlineOpponent.elo} ELO)
                        </span>
                      </div>
                      <span className="text-white/60 text-[10px] font-mono uppercase">
                        {onlinePlayerColor === 'w' ? 'Bidak Hitam' : 'Bidak Putih'}
                      </span>
                    </div>

                    {/* MAIN CHESSBOARD GRID */}
                    {renderChessboard()}

                    {/* YOU BOTTOM INFO CARD */}
                    <div className="flex items-center justify-between mt-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 border border-green-300 flex items-center justify-center font-bold text-green-600 text-xs">
                          K
                        </div>
                        <span className="text-white text-xs font-black tracking-wide uppercase">
                          {username.trim() || 'Pecatur'} ({onlineRating} ELO - Kamu)
                        </span>
                      </div>
                      <span className="text-white/60 text-[10px] font-mono uppercase">
                        {onlinePlayerColor === 'w' ? 'Bidak Putih' : 'Bidak Hitam'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* COLUMN RIGHT: CONTROLS & LIVE INTERACTIVE CHAT */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* TURN AND GAME STATUS HEADER */}
                  <div className="bg-white rounded-3xl p-5 border-2 border-[#E5E5E5] shadow-xs flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-black text-[#777777] uppercase block">Giliran Bermain</span>
                      {chessRef.current.turn() === onlinePlayerColor ? (
                        <span className="text-[#58CC02] font-black text-xs uppercase flex items-center gap-1.5 animate-pulse">
                          ● Giliran Anda! Silakan Jalan
                        </span>
                      ) : (
                        <span className="text-[#AF7E00] font-black text-xs uppercase flex items-center gap-1.5">
                          ⏳ Menunggu Langkah Lawan...
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => finishOnlineGame('lose')}
                      className="px-4 py-2 bg-red-50 text-[#FF4B4B] border-2 border-red-200 hover:bg-red-100 text-xs font-black uppercase rounded-xl transition-colors cursor-pointer"
                    >
                      Resign (Menyerah)
                    </button>
                  </div>

                  {/* CHAT COMM BOX */}
                  <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] overflow-hidden shadow-sm flex flex-col h-96">
                    <div className="bg-slate-50 border-b-2 border-[#E5E5E5] px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-black text-[#4B4B4B] uppercase tracking-wide flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#81b64c] shrink-0" /> Obrolan Catur Live
                      </span>
                      <span className="px-2 py-0.5 text-[8px] bg-green-100 text-green-700 font-extrabold uppercase rounded border border-green-200 tracking-wider">
                        Terenkripsi
                      </span>
                    </div>

                    {/* LIVE BUBBLES TRAILER PANEL */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9F9F9]">
                      {onlineChats.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[#777777]/60 italic text-xs">
                          Belum ada obrolan. Kirim salam sapa ke lawanmu!
                        </div>
                      ) : (
                        onlineChats.map((c: any, index: number) => {
                          const isMe = c.sender === (username.trim() || 'Pecatur') || c.sender === username;
                          const isSystem = c.sender === 'Sistem';
                          
                          if (isSystem) {
                            return (
                              <div key={index} className="text-center">
                                <span className="inline-block px-3 py-1 bg-slate-100 text-[#777777] font-bold text-[9px] rounded-md uppercase border border-slate-200">
                                  {c.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <span className="text-[9px] font-bold text-[#777777] mb-1 px-1">
                                {c.sender}
                              </span>
                              <div className={`p-3 rounded-2xl max-w-xs text-xs font-semibold leading-relaxed ${
                                isMe 
                                  ? 'bg-[#DDF4FF] text-[#1CB0F6] rounded-tr-none border border-blue-200' 
                                  : 'bg-white text-[#4B4B4B] rounded-tl-none border border-slate-200 shadow-sm'
                              }`}>
                                {c.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* CHAT INPUT FIELD */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendOnlineChat(); }}
                        placeholder="Tulis pesan obrolledan..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-green-500"
                      />
                      <button
                        onClick={sendOnlineChat}
                        className="p-2.5 bg-green-500 hover:bg-green-600 font-extrabold text-white rounded-xl transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* STATUS 4: duel game-over */}
            {onlineStatus === 'game-over' && (
              <div className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl border-2 border-[#E5E5E5] text-center shadow-lg flex flex-col items-center gap-6 py-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md ${
                  onlineGameResult === 'win' ? 'bg-[#58CC02] shadow-green-100' :
                  onlineGameResult === 'lose' ? 'bg-[#FF4B4B] shadow-red-100' :
                  'bg-yellow-400 shadow-yellow-100'
                }`}>
                  <Trophy className="w-8 h-8 fill-white/10" />
                </div>

                <div>
                  <h3 className="font-black text-2xl text-[#4B4B4B] uppercase tracking-wide">
                    {onlineGameResult === 'win' ? 'KAMU MENANG!' :
                     onlineGameResult === 'lose' ? 'KAMU KALAH!' :
                     'PERMAINAN SERI!'}
                  </h3>
                  <p className="text-[#777777] font-semibold text-xs mt-1.5 leading-relaxed">
                    Pertandingan telah diakhiri. Rating ELO Anda telah diperbarui di database server.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-8 text-center">
                  <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Peringkat Baru Anda</span>
                  <span className="text-[#AF7E00] font-black text-lg font-mono">
                    {onlineRating} ELO
                  </span>
                </div>

                <button
                  onClick={() => {
                    setOnlineStatus('idle');
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="w-full py-3 bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold rounded-xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide text-xs cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}

          </div>
        )}

        {/* =========================================
             6. THEME STORE & NYAWA LOCKS VIEW 
           ========================================= */}
        {mode === 'store' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-4 px-4 py-2 flex items-center gap-2 text-xs font-extrabold text-white bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] hover:border-[#81b64c] rounded-xl shadow-[0_3px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Menu Utama
                </button>
                <h2 className="text-2xl font-extrabold text-white tracking-tight animate-fade-in flex items-center gap-2">
                  Toko Tema & Kosmetik Papan <ShoppingBag className="w-6 h-6 text-[#81b64c] shrink-0" />
                </h2>
                <p className="text-[#9babaf] font-semibold text-sm mt-1">Unlock kustomisasi warna kontras papan turnamen atau isi ulang kesempatan analisismu memakai poin XP!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* HEARTS FILL RECOVERY ITEM */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative shadow-md shrink-0">
                    <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Refill Stamina Analisis</h3>
                    <p className="text-[#9babaf] text-xs font-semibold leading-relaxed max-w-xs mt-1">Isi ulang penuh tiket retries taktis Anda menjadi 5 unit kuota cermat.</p>
                  </div>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <span className="block font-extrabold text-[#FFC800] font-mono text-lg mb-2">50 XP</span>
                  <button 
                    onClick={buyHeartRefill}
                    disabled={xp < 50 || hearts >= 5}
                    className="px-6 py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] disabled:opacity-50 text-white font-extrabold text-xs uppercase rounded-xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 active:shadow-none cursor-pointer transition-all"
                  >
                    {hearts >= 5 ? 'Sudah Penuh' : 'Refill Penuh'}
                  </button>
                </div>
              </div>

              {/* BUY NEW COSMETICS BAR */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                <h3 className="font-extrabold text-white text-md uppercase tracking-wide mb-4">Gaya Papan Catur Tambahan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEMES.map((theme) => {
                    const isUnlocked = unlockedThemes.includes(theme.id);
                    const isActive = boardTheme === theme.id;
                    return (
                      <div 
                        key={theme.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-40 ${
                          isActive 
                            ? 'bg-[#262421] border-[#81b64c] shadow-md' 
                            : 'bg-[#262421] border-[#3c3934] hover:border-[#81b64c]'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-extrabold text-white text-sm">{theme.name}</h4>
                            {isUnlocked && <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-950 text-[#81b64c] rounded-lg border border-emerald-900 uppercase">Terbuka</span>}
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            <span className="w-6 h-6 rounded-md inline-block shadow-inner" style={{ backgroundColor: theme.primaryColor }} />
                            <span className="w-6 h-6 rounded-md inline-block shadow-inner" style={{ backgroundColor: theme.secondaryColor }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {!isUnlocked ? (
                            <span className="font-extrabold text-[#FFC800] text-sm font-mono">{theme.cost} XP</span>
                          ) : (
                            <span className="text-[#9babaf] text-xs font-semibold">Tersedia</span>
                          )}
                          
                          {!isUnlocked ? (
                            <button
                              onClick={() => buyTheme(theme)}
                              disabled={xp < theme.cost}
                              className="px-4 py-2 bg-[#FFC800] hover:bg-yellow-400 disabled:opacity-40 text-[#262421] font-extrabold text-[10px] uppercase rounded-lg shadow-[0_3px_0_0_#b38b00] active:translate-y-0.5 active:shadow-none cursor-pointer"
                            >
                              Beli
                            </button>
                          ) : (
                            <button
                              onClick={() => setBoardTheme(theme.id)}
                              className="px-4 py-2 bg-[#312e2b] hover:bg-[#3c3934] text-white font-extrabold text-[10px] uppercase rounded-lg border border-[#3c3934] shadow-[0_3px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none cursor-pointer"
                            >
                              Gunakan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#262421] border-t border-[#3c3934] py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[#9babaf] font-bold text-xs">
            Catur Nopal • Platform Catur Edukatif modern yang didukung analisis taktis Google Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
