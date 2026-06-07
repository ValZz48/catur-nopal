import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { 
  Flame, 
  Heart, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  Gift,
  LineChart, 
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
  Clock,
  LogOut,
  Lightbulb,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Flag,
  BarChart3,
  Mail,
  Calendar,
  UserMinus,
  Upload,
  Coins,
  Gem,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, GameMode, Puzzle, Lesson, PurchaseableTheme, BoardTheme, Achievement } from './types';
import { CHARACTERS, PUZZLES, LESSONS, THEMES } from './data';
import { ChessPiece } from './components/ChessPieces';
import { playSound, toSquare, fromSquare, getAIMove, evaluateMoveQuality } from './utils';
import { Features17to25 } from './components/Features17to25';
import { Features26to30 } from './components/Features26to30';
import { Features31to40 } from './components/Features31to40';
import { Features41to50 } from './components/Features41to50';

import martinAvatar from './assets/images/avatar_martin_1779709510230.png';
import nelsonAvatar from './assets/images/nelson_avatar_1779712159293.png';
import wallyAvatar from './assets/images/wally_avatar_1779712178593.png';
import magnusAvatar from './assets/images/magnus_avatar_1779712198066.png';

interface AvatarFrame {
  id: string;
  name: string;
  costType: 'coin' | 'diamond' | 'free';
  cost: number;
  isPremiumExclusive: boolean;
  themeColor: string;
  description: string;
}

const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'none',
    name: 'Tanpa Bingkai',
    costType: 'free',
    cost: 0,
    isPremiumExclusive: false,
    themeColor: 'text-slate-400',
    description: 'Bingkai dasar minimalis tanpa kosmetik tambahan.'
  },
  {
    id: 'bronze',
    name: 'Maju Perunggu',
    costType: 'coin',
    cost: 150,
    isPremiumExclusive: false,
    themeColor: 'text-amber-600',
    description: 'Lencana perunggu mengkilap untuk pemula berbakat.'
  },
  {
    id: 'silver',
    name: 'Challenger Perak',
    costType: 'coin',
    cost: 300,
    isPremiumExclusive: false,
    themeColor: 'text-slate-300',
    description: 'Didesain kokoh berserat perak metalik bagi ahli taktik.'
  },
  {
    id: 'gold',
    name: 'Gladiator Emas',
    costType: 'coin',
    cost: 500,
    isPremiumExclusive: true,
    themeColor: 'text-yellow-400',
    description: 'Kemewahan emas murni bersinar dinamis. Gratis untuk Member Premium.'
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    costType: 'diamond',
    cost: 15,
    isPremiumExclusive: false,
    themeColor: 'text-cyan-400',
    description: 'Garis digital laser cyan menyala penuh energi teknologi masa depan.'
  },
  {
    id: 'magma',
    name: 'Magma Berapi',
    costType: 'diamond',
    cost: 30,
    isPremiumExclusive: false,
    themeColor: 'text-rose-500',
    description: 'Lava vulkanis mendidih yang terpancar dari keberanian ksatria catur.'
  },
  {
    id: 'cosmic',
    name: 'Cahaya Kosmik',
    costType: 'diamond',
    cost: 50,
    isPremiumExclusive: false,
    themeColor: 'text-purple-400',
    description: 'Keindahan nebula rasi bintang galaksi misterius bertabur berlian.'
  }
];

interface LevelReward {
  level: number;
  xpRequired: number;
  coins: number;
  diamonds: number;
  otherGift?: string;
  frameReward?: string; // e.g. 'bronze', 'silver', 'gold' etc
}

const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, xpRequired: 100, coins: 150, diamonds: 5 },
  { level: 3, xpRequired: 200, coins: 250, diamonds: 10 },
  { level: 4, xpRequired: 300, coins: 350, diamonds: 15 },
  { level: 5, xpRequired: 400, coins: 500, diamonds: 20 },
  { level: 6, xpRequired: 500, coins: 650, diamonds: 25 },
  { level: 7, xpRequired: 600, coins: 800, diamonds: 30 },
  { level: 8, xpRequired: 700, coins: 1000, diamonds: 35 },
  { level: 9, xpRequired: 800, coins: 1200, diamonds: 40 },
  { level: 10, xpRequired: 900, coins: 1500, diamonds: 100 },
  { level: 11, xpRequired: 1000, coins: 1700, diamonds: 55 },
  { level: 12, xpRequired: 1100, coins: 1900, diamonds: 60 },
  { level: 13, xpRequired: 1200, coins: 2100, diamonds: 70 },
  { level: 14, xpRequired: 1300, coins: 2300, diamonds: 80 },
  { level: 15, xpRequired: 1400, coins: 2500, diamonds: 100 },
  { level: 16, xpRequired: 1500, coins: 2700, diamonds: 110 },
  { level: 17, xpRequired: 1600, coins: 3000, diamonds: 120 },
  { level: 18, xpRequired: 1700, coins: 3300, diamonds: 130 },
  { level: 19, xpRequired: 1800, coins: 3600, diamonds: 140 },
  { level: 20, xpRequired: 1900, coins: 4000, diamonds: 150 }
];

interface AvatarWithFrameProps {
  src: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isBot?: boolean;
}

function AvatarWithFrame({ src, frameId = 'none', size = 'sm', className = '', isBot = false }: AvatarWithFrameProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const ringWidth = {
    xs: 'ring-[1.5px] ring-offset-[1px]',
    sm: 'ring-2 ring-offset-[1.5px]',
    md: 'ring-2.5 ring-offset-[1.5px]',
    lg: 'ring-[3px] ring-offset-2',
    xl: 'ring-[4px] ring-offset-[2.5px]',
  }[size];

  const ringColorMap: Record<string, string> = {
    none: isBot ? 'ring-slate-500/20 ring-offset-[#262421]' : 'ring-transparent',
    bronze: 'ring-[#a75a31] border border-[#d68551] ring-offset-[#262421] shadow-amber-950/40',
    silver: 'ring-[#8c969e] border border-[#cfd4d9] ring-offset-[#262421] shadow-slate-900/30',
    gold: 'ring-yellow-500 border border-yellow-300 ring-offset-[#262421] shadow-yellow-500/30',
    cyber: 'ring-cyan-400 border border-teal-300 ring-offset-[#262421] shadow-cyan-400/30',
    magma: 'ring-rose-600 border border-orange-500 ring-offset-[#262421] shadow-rose-600/35',
    cosmic: 'ring-fuchsia-500 border-2 border-dashed border-indigo-400 ring-offset-[2px] ring-offset-[#262421]',
  };

  const getGlowAndAnimateEffect = () => {
    switch (frameId) {
      case 'gold':
        return 'shadow-[0_0_8px_rgba(234,179,8,0.3)] animate-pulse';
      case 'cyber':
        return 'shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse duration-1000';
      case 'magma':
        return 'shadow-[0_0_12px_rgba(244,63,94,0.45)] animate-pulse duration-700';
      case 'cosmic':
        return 'shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-pulse';
      default:
        return '';
    }
  };

  const fId = frameId || 'none';
  const frameRing = fId !== 'none' ? `${ringWidth} ${ringColorMap[fId] || ''} ${getGlowAndAnimateEffect()}` : 'border border-[#3c3934]';

  return (
    <div className={`relative rounded-full select-none ${sizeClasses[size]} ${className} shrink-0`}>
      <img
        src={src}
        alt="Avatar"
        referrerPolicy="no-referrer"
        className={`w-full h-full rounded-full object-cover bg-[#262421] ${frameRing} transition-all`}
      />
      {size !== 'xs' && (
        <>
          {fId === 'gold' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Emas Elite">
              <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'cyber' && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-900 p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Cyber Neon">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
          {fId === 'magma' && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-[1.5px] rounded-full border border-[#262421] shadow-md flex items-center justify-center scale-90" title="Magma">
              <Flame className="w-2.5 h-2.5 stroke-[2.5] fill-white/10" />
            </div>
          )}
          {fId === 'cosmic' && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white p-[1.5px] rounded-md border border-[#262421] shadow-md flex items-center justify-center scale-95" title="Kosmik">
              <Trophy className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const EVALUATION_LABELS: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  brilliant: { label: 'Brilian', bg: 'bg-emerald-600 border-emerald-500', text: 'text-white font-extrabold', icon: '!!' },
  great: { label: 'Hebat', bg: 'bg-blue-600 border-blue-500', text: 'text-white font-extrabold', icon: '!' },
  best: { label: 'Terbaik', bg: 'bg-[#81b64c] border-[#81b64c]', text: 'text-white font-extrabold', icon: '' },
  excellent: { label: 'Sangat Baik', bg: 'bg-teal-600 border-teal-500', text: 'text-white font-bold', icon: '' },
  good: { label: 'Baik', bg: 'bg-sky-600 border-sky-500', text: 'text-white font-semibold', icon: '' },
  book: { label: 'Teori Buku', bg: 'bg-amber-600 border-amber-500', text: 'text-white font-semibold', icon: '' },
  inaccuracy: { label: 'Kurang Tepat', bg: 'bg-zinc-650 border-zinc-500', text: 'text-white font-semibold', icon: '?!' },
  mistake: { label: 'Kesalahan', bg: 'bg-orange-600 border-orange-500', text: 'text-white font-extrabold', icon: '?' },
  blunder: { label: 'Blunder', bg: 'bg-red-600 border-red-500', text: 'text-white font-extrabold', icon: '??' }
};

const CHESS_QUOTES = [
  { quote: "Catur adalah duel mental yang membutuhkan presisi mutlak.", author: "Garry Kasparov" },
  { quote: "Kesalahan terbesar dalam permainan catur adalah mengasumsikan musuh tidak dapat melihat taktikmu.", author: "Bobby Fischer" },
  { quote: "Satu-satunya musuh terberat dalam catur adalah keraguan diri sendiri.", author: "Garry Kasparov" },
  { quote: "Pion adalah jiwa dari permainan catur.", author: "François-André Danican Philidor" },
  { quote: "Catur bukan tentang mengalahkan musuh, melainkan menaklukkan ego sendiri.", author: "Emanuel Lasker" },
  { quote: "Di atas papan catur, kebenaran mutlak selalu menang.", author: "Alexander Alekhine" },
  { quote: "Catur mengajari kita untuk berpikir sebelum bertindak.", author: "Benjamin Franklin" }
];

const CHESS_TRIVIA = [
  {
    q: "Dalam teori pembukaan catur, langkah pertama yang memajukan pion Raja putih ke e4 diikuti oleh pion Raja hitam ke e5, lalu kuda putih ke f3 disebut...",
    a: ["Ruy Lopez", "Italian Game", "King's Pawn Game (Pembukaan Pion Raja)", "Sicilian Defense"],
    correct: 2,
    exp: "Memajukan pion ke e4 dan e5 adalah dasar pembukaan King's Pawn Game yang mengontrol baris pusat papan."
  },
  {
    q: "Apa nama pergerakan khusus di mana Raja bergeser dua petak ke samping menuju Benteng, dan Benteng melompati Raja?",
    a: ["Promosi Pion", "Rokade (Castling)", "En Passant", "Skakmat Akhir"],
    correct: 1,
    exp: "Rokade dilakukan untuk menjaga keamanan Raja sekaligus membawa Benteng aktif ke jalur pusat secara cepat."
  },
  {
    q: "Di situasi apa pergerakan khusus 'En Passant' legal dilakukan oleh seorang pemain?",
    a: ["Saat Raja sedang di-skak lawan", "Tepat ketika pion lawan melangkah maju 2 petak melewati baris serang kita", "Saat pion ingin berpromosi menjadi Ratu di ujung", "Kapan saja bebas dilakukan"],
    correct: 1,
    exp: "En Passant hanya legal dilakukan tepat pada langkah pertama setelah lawan melangkahkan pionnya maju 2 petak ke samping pion kita."
  },
  {
    q: "Berapakah jumlah total petak keseluruhan (hitam dan putih berseling) yang ada pada papan catur standar?",
    a: ["48 Petak", "64 Petak", "81 Petak", "100 Petak"],
    correct: 1,
    exp: "Papan catur standar memiliki susun kotak berukuran grid 8x8 yang menghasilkan total 64 petak."
  },
  {
    q: "Siapakah Juara Dunia Catur resmi pertama dalam sejarah dunia catur modern (dinobatkan tahun 1886)?",
    a: ["Garry Kasparov", "Wilhelm Steinitz", "Bobby Fischer", "Emanuel Lasker"],
    correct: 1,
    exp: "Wilhelm Steinitz dinobatkan menjadi Juara Dunia Catur resmi pertama pada tahun 1886 setelah mengalahkan Johannes Zukertort."
  },
  {
    q: "Pion yang berhasil melangkah ke ujung baris terakhir papan musuh berhak mengalami naik pangkat, yang disebut...",
    a: ["Rokade", "Promosi Pion", "En Passant", "Evaluasi Bidak"],
    correct: 1,
    exp: "Mencapai ujung papan memungkinkan pion dipromosikan (naik kasta) menjadi Ratu, Benteng, Gajah, atau Kuda sesuai keinginan pemain."
  },
  {
    q: "Sistem kalkulasi matematis catur yang digunakan secara internasional untuk menghitung rating/kekuatan pecatur dinamakan...",
    a: ["Rating Elo", "Peringkat ATP", "Poin FIFA", "Skor MVP"],
    correct: 0,
    exp: "Rating Elo, dirancang oleh Arpad Elo, menghitung probabilitas hasil tanding secara matematis berdasarkan kekuatan lawan."
  },
  {
    q: "Dalam sistem poin taktis catur yang disepakati, berapakah nilai material relatif untuk perwira Benteng (Rook)?",
    a: ["3 Poin", "5 Poin", "9 Poin", "1 Poin"],
    correct: 1,
    exp: "Secara taktis perwira bernilai: Pion (1), Kuda (3), Gajah (3), Benteng (5), dan Ratu (9)."
  },
  {
    q: "Dalam penulisan notasi catur bahasa Inggris standar, huruf singkatan 'N' digunakan untuk melambangkan perwira...",
    a: ["King (Raja)", "Bishop (Gajah)", "Knight (Kuda)", "Rook (Benteng)"],
    correct: 2,
    exp: "Knight (Kuda) disingkat dengan huruf 'N' karena singkatan 'K' sudah digunakan secara eksklusif untuk King (Raja)."
  },
  {
    q: "Apa sebutan dalam catur untuk kondisi di mana raja tidak sedang diserang, tetapi pemain tidak memiliki langkah legal sama sekali?",
    a: ["Checkmate (Skakmat)", "Stalemate (Remis Pat)", "Gambit", "Tusukan Sate"],
    correct: 1,
    exp: "Stalemate (remis pat) membuat permainan berakhir imbang/draw seketika karena pemain tidak bisa merubah posisi tanpa melanggar aturan catur."
  },
  {
    q: "Ketika seorang pemain mengorbankan materi di awal permainan untuk mendapatkan keunggulan posisi atau perkembangan perwira, taktik ini disebut...",
    a: ["Rokade", "Gambit", "Fianchetto", "Taktik Pin"],
    correct: 1,
    exp: "Gambit adalah taktik pengorbanan pion atau perwira ringan di pembukaan untuk mendapatkan inisiatif menyerang atau ruang kendali."
  },
  {
    q: "Dalam notasi catur standar, tanda baca tanya ganda '??' setelah sebuah langkah melambangkan...",
    a: ["Langkah Hebat (Great Move)", "Langkah Brilian (Brilliant)", "Kesalahan Fatal (Blunder)", "Langkah Buku (Teori)"],
    correct: 2,
    exp: "Tanda '??' digunakan untuk melambangkan kesalahan yang sangat fatal (Blunder) yang dapat merubah jalannya pertandingan secara drastis."
  },
  {
    q: "Langkah pembukaan catur di mana Gajah diposisikan di baris kedua sayap (pada b2, g2, b7, atau g7) disebut...",
    a: ["Rokade", "Fianchetto", "En Passant", "Oposisi Raja"],
    correct: 1,
    exp: "Fianchetto adalah metode menempatkan Gajah pada diagonal terpanjang papan melalui petak b2/g2 untuk putih atau b7/g7 untuk hitam."
  },
  {
    q: "Berapa banyak jumlah pion/pratama yang dimiliki oleh satu pemain di awal pertandingan catur?",
    a: ["6 Pion", "8 Pion", "10 Pion", "12 Pion"],
    correct: 1,
    exp: "Setiap pemain memulai permainan dengan tepat 8 buah pion yang berjejer di baris kedua pertahanan masing-masing."
  },
  {
    q: "Taktik menyerang di mana satu perwira menyerang dua atau lebih perwira lawan secara bersamaan disebut...",
    a: ["Pin (Pakuan)", "Fork (Garpu)", "Skewer (Tusukan Sate)", "Discovered Attack"],
    correct: 1,
    exp: "Fork (garpu) adalah serangan ganda, sangat sering dilakukan oleh Kuda atau Pion, memaksa lawan menghadapi beberapa ancaman sekaligus."
  },
  {
    q: "Siapakah nama pecatur legendaris dunia asal Norwegia yang memegang gelar Juara Dunia Catur Klasik dari tahun 2013 hingga 2023?",
    a: ["Viswanathan Anand", "Magnus Carlsen", "Hikaru Nakamura", "Ding Liren"],
    correct: 1,
    exp: "Magnus Carlsen menjuarai gelar dunia pada 2013 dan terus mempertahankannya hingga ia memutuskan untuk tidak mempertahankan gelarnya pada 2023."
  },
  {
    q: "Metode mengakhiri permainan catur di mana kedua pemain setuju untuk mengakhiri pertandingan tanpa ada pemenang disebut...",
    a: ["Resign (Menyerah)", "Draw (Remis)", "Timeout (Habis Waktu)", "Skakmat"],
    correct: 1,
    exp: "Draw atau Remis adalah hasil seri yang bisa terjadi akibat Stalemate, kesepakatan bersama, aturan 50 langkah, atau pengulangan posisi 3 kali."
  },
  {
    q: "Apa nama taktik catur di mana serangan diluncurkan dengan memindahkan perwira yang sebelumnya menghalangi jalur serangan perwira lainnya?",
    a: ["Discovered Attack (Serangan Terbuka)", "Double Check (Skak Ganda)", "Windmill (Kincir Angin)", "Overloading"],
    correct: 0,
    exp: "Discovered Attack terjadi ketika sebuah perwira melangkah pergi dan membuka jalur serang perwira di belakangnya (seperti Benteng atau Gajah)."
  },
  {
    q: "Dalam turnamen catur resmi, alat apa yang wajib digunakan untuk mengukur dan membatasi sisa waktu berpikir masing-masing pemain?",
    a: ["Stopwatch", "Jam Catur (Chess Clock)", "Hourglass pasir", "Aplikasi Handphone"],
    correct: 1,
    exp: "Jam catur memiliki dua tombol timer yang bergerak bergantian ketika pemain menyelesaikan langkahnya untuk memastikan permainan selesai tepat waktu."
  },
  {
    q: "Sebelum memindahkan perwira catur dalam pertandingan turnamen, mengumumkan status ancaman terhadap Raja lawan disebut dengan istilah...",
    a: ["Skak (Check)", "Skakmat (Checkmate)", "Serang", "Permisi"],
    correct: 0,
    exp: "Skak (Check) adalah situasi ketika Raja berada di bawah ancaman serang langsung dari perwira lawan dan harus melarikan diri pada langkah berikutnya."
  }
];

export const getAchievementRewardXp = (achId: string) => {
  const rewardMap: Record<string, number> = {
    '1': 20,
    '2': 50,
    '3': 150,
    '4': 30,
    '5': 100,
    '6': 250,
    '7': 100,
    '8': 300,
    '9': 50,
    '10': 200,
    '11': 300,
    '12': 500,
    '13': 450,
    '14': 800,
    '15': 500,
    '16': 1000,
    '17': 2000,
    '18': 400,
    '19': 1500,
    '20': 3000,
  };
  return rewardMap[achId] || 50;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Pecatur Pemula', description: 'Mainkan 1 pertandingan catur', targetType: 'played', targetValue: 1 },
  { id: '2', title: 'Ksatria Catur', description: 'Mainkan 5 pertandingan catur', targetType: 'played', targetValue: 5 },
  { id: '3', title: 'Master Arena', description: 'Mainkan 20 pertandingan catur', targetType: 'played', targetValue: 20 },
  { id: '4', title: 'Kemenangan Perdana', description: 'Menangkan 1 pertandingan catur', targetType: 'won', targetValue: 1 },
  { id: '5', title: 'Kampiun Handal', description: 'Menangkan 5 pertandingan catur', targetType: 'won', targetValue: 5 },
  { id: '6', title: 'Bintang Catur', description: 'Menangkan 15 pertandingan catur', targetType: 'won', targetValue: 15 },
  { id: '7', title: 'Pecatur Elite', description: 'Capai peringkat 600 ELO', targetType: 'elo', targetValue: 600 },
  { id: '8', title: 'Grandmaster Hebat', description: 'Capai peringkat 1000 ELO', targetType: 'elo', targetValue: 1000 },
  { id: '9', title: 'Pengejar XP', description: 'Kumpulkan skor total 150 XP', targetType: 'xp', targetValue: 150 },
  { id: '10', title: 'Legenda Hidup', description: 'Kumpulkan skor total 500 XP', targetType: 'xp', targetValue: 500 },
  { id: '11', title: 'Pakar Taktik', description: 'Mainkan 40 pertandingan catur', targetType: 'played', targetValue: 40 },
  { id: '12', title: 'Master Tempur', description: 'Mainkan 100 pertandingan catur', targetType: 'played', targetValue: 100 },
  { id: '13', title: 'Penakluk Ulung', description: 'Menangkan 30 pertandingan catur', targetType: 'won', targetValue: 30 },
  { id: '14', title: 'Raja Kemenangan', description: 'Menangkan 75 pertandingan catur', targetType: 'won', targetValue: 75 },
  { id: '15', title: 'Pakar ELO Unggul', description: 'Capai peringkat 1200 ELO', targetType: 'elo', targetValue: 1200 },
  { id: '16', title: 'Guru Besar Catur', description: 'Capai peringkat 1600 ELO', targetType: 'elo', targetValue: 1600 },
  { id: '17', title: 'Grandmaster Sejati', description: 'Capai peringkat 2200 ELO', targetType: 'elo', targetValue: 2200 },
  { id: '18', title: 'Kolektor XP Berbakat', description: 'Kumpulkan skor total 1000 XP', targetType: 'xp', targetValue: 1000 },
  { id: '19', title: 'Sultan XP Arena', description: 'Kumpulkan skor total 10000 XP', targetType: 'xp', targetValue: 10000 },
  { id: '20', title: 'Legenda Abadi Catur Nopal', description: 'Kumpulkan skor total 35000 XP', targetType: 'xp', targetValue: 35000 }
];

export const checkAchievementUnlocked = (ach: Achievement, targetStats: { played: number; won: number; elo: number; xp: number }) => {
  const { played, won, elo, xp } = targetStats;
  switch (ach.targetType) {
    case 'played': return played >= ach.targetValue;
    case 'won': return won >= ach.targetValue;
    case 'elo': return elo >= ach.targetValue;
    case 'xp': return xp >= ach.targetValue;
    default: return false;
  }
};

export const getAchievementProgress = (ach: Achievement, targetStats: { played: number; won: number; elo: number; xp: number }) => {
  const { played, won, elo, xp } = targetStats;
  switch (ach.targetType) {
    case 'played': return Math.min(100, Math.round((played / ach.targetValue) * 100));
    case 'won': return Math.min(100, Math.round((won / ach.targetValue) * 100));
    case 'elo': return Math.min(400, Math.round((elo / ach.targetValue) * 100)); // ELO ranges are normalized, keep at 100 cap for simplicity
    case 'xp': return Math.min(100, Math.round((xp / ach.targetValue) * 100));
    default: return 0;
  }
};

const getActiveUsername = (): string => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && u.username) return u.username.trim().toLowerCase();
    } catch (e) {}
  }
  const uname = localStorage.getItem('username');
  if (uname) return uname.trim().toLowerCase();
  return 'guest';
};

const fetchWithTimeout = async (resource: string, options: RequestInit = {}, timeout = 1500): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default function App() {
  // Navigation / Gamification States which persist in localStorage
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [activeHubTab, setActiveHubTab] = useState<'replay' | 'social' | 'rank' | 'pass'>('replay');
  const [mode, setMode] = useState<GameMode>(() => {
    return (localStorage.getItem('mode') as GameMode) || 'home';
  });
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('xp')) || 0;
  });

  const [coins, setCoins] = useState<number>(() => {
    return Number(localStorage.getItem('coins')) || 500;
  });
  const [diamonds, setDiamonds] = useState<number>(() => {
    return Number(localStorage.getItem('diamonds')) || 20;
  });

  // --- LIFTED STATES FOR PERFECT SYNC CORRESPONDING TO FEATURES 17-25 ---
  const [passLevel, setPassLevel] = useState<number>(() => {
    return Number(localStorage.getItem('seasonPassLevel')) || 1;
  });
  const [passXp, setPassXp] = useState<number>(() => {
    return Number(localStorage.getItem('seasonPassXp')) || 0;
  });
  const [passStatus, setPassStatus] = useState<'free' | 'premium' | 'deluxe'>(() => {
    return (localStorage.getItem('seasonPassStatus') as any) || 'free';
  });
  const [claimedPassRewards, setClaimedPassRewards] = useState<string[]>(() => {
    const saved = localStorage.getItem('claimedPassRewards');
    return saved ? JSON.parse(saved) : [];
  });
  const [claimedRankRewards, setClaimedRankRewards] = useState<string[]>(() => {
    const saved = localStorage.getItem('claimedRankRewards');
    return saved ? JSON.parse(saved) : [];
  });
  const [diamondSavings, setDiamondSavings] = useState<number>(() => {
    return Number(localStorage.getItem('chessDiamondSavings')) || 0;
  });
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'replay' | 'social' | 'stats'>('profile');
  const [storeActiveTab, setStoreActiveTab] = useState<'shop' | 'gacha' | 'flash_sale'>('shop');
  const [homeActiveTab, setHomeActiveTab] = useState<'dashboard' | 'community' | 'forum'>('dashboard');

  // Synchronize state hooks to localStorage
  useEffect(() => {
    localStorage.setItem('seasonPassLevel', String(passLevel));
    localStorage.setItem('seasonPassXp', String(passXp));
    localStorage.setItem('seasonPassStatus', passStatus);
    localStorage.setItem('claimedPassRewards', JSON.stringify(claimedPassRewards));
  }, [passLevel, passXp, passStatus, claimedPassRewards]);

  useEffect(() => {
    localStorage.setItem('claimedRankRewards', JSON.stringify(claimedRankRewards));
  }, [claimedRankRewards]);

  useEffect(() => {
    localStorage.setItem('chessDiamondSavings', String(diamondSavings));
  }, [diamondSavings]);

  const [dailyQuests, setDailyQuests] = useState<any[]>(() => {
    const saved = localStorage.getItem('dailyQuests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure qp_playtime exists in parsed dailyQuests
          if (!parsed.some(q => q.id === 'qp_playtime')) {
            parsed.push({ id: 'qp_playtime', type: 'premium', title: 'Manajemen Waktu Premium', description: 'Bermain catur selama 30 menit tanding (dapat tambahan +1 Diamond per menit bermain setelahnya!)', target: 30, current: 0, rewardType: 'diamond', rewardAmount: 0, claimed: false, isPlaytimeQuest: true });
          }
          return parsed;
        }
      } catch (e) {
        console.warn("Error parsing dailyQuests from localStorage:", e);
      }
    }
    return [
      { id: 'q1', type: 'regular', title: 'Asah Otak Taktis', description: 'Selesaikan 1 teka-teki Puzzle catur', target: 1, current: 0, rewardType: 'coin', rewardAmount: 50, claimed: false },
      { id: 'q2', type: 'regular', title: 'Ksatria Arena Cepat', description: 'Mainkan 1 pertandingan catur (Bot atau Online)', target: 1, current: 0, rewardType: 'xp', rewardAmount: 30, claimed: false },
      { id: 'q3', type: 'regular', title: 'Kemenangan Gemilang', description: 'Menangkan 1 pertandingan catur melawan Bot atau Online', target: 1, current: 0, rewardType: 'coin', rewardAmount: 100, claimed: false },
      
      { id: 'qp1', type: 'premium', title: 'Spesialis Teka-teki Elite', description: 'Selesaikan 3 teka-teki Puzzle catur', target: 3, current: 0, rewardType: 'diamond', rewardAmount: 5, claimed: false },
      { id: 'qp2', type: 'premium', title: 'Gladiator Arena Sejati', description: 'Mainkan 3 pertandingan catur (Bot atau Online)', target: 3, current: 0, rewardType: 'diamond', rewardAmount: 10, claimed: false },
      { id: 'qp3', type: 'premium', title: 'Dominasi Papan Catur', description: 'Menangkan 2 pertandingan catur melawan Bot atau Online', target: 2, current: 0, rewardType: 'diamond', rewardAmount: 15, claimed: false },
      { id: 'qp_playtime', type: 'premium', title: 'Manajemen Waktu Premium', description: 'Bermain catur selama 30 menit tanding (dapat tambahan +1 Diamond per menit bermain setelahnya!)', target: 30, current: 0, rewardType: 'diamond', rewardAmount: 0, claimed: false, isPlaytimeQuest: true }
    ];
  });

  const updateDailyQuestProgress = (questAction: 'puzzle' | 'play' | 'win', value: number = 1) => {
    setDailyQuests(prev => {
      const updated = prev.map(q => {
        let match = false;
        if (questAction === 'puzzle' && (q.id === 'q1' || q.id === 'qp1')) match = true;
        if (questAction === 'play' && (q.id === 'q2' || q.id === 'qp2')) match = true;
        if (questAction === 'win' && (q.id === 'q3' || q.id === 'qp3')) match = true;
        
        if (match && !q.claimed) {
          const nextCurrent = Math.min(q.target, q.current + value);
          return { ...q, current: nextCurrent };
        }
        return q;
      });
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      return updated;
    });
  };

  const claimDailyQuest = (questId: string) => {
    let questToClaim: any = null;
    const nextQuests = dailyQuests.map(q => {
      if (q.id === questId && !q.claimed && q.current >= q.target) {
        questToClaim = q;
        return { ...q, claimed: true };
      }
      return q;
    });

    if (questToClaim) {
      setDailyQuests(nextQuests);
      localStorage.setItem('dailyQuests', JSON.stringify(nextQuests));
      triggerAudio('win');

      if (questToClaim.rewardType === 'coin') {
        const amt = questToClaim.rewardAmount;
        setCoins(prev => {
          const next = prev + amt;
          localStorage.setItem('coins', String(next));
          return next;
        });
        triggerReward(0, `Klaim Berhasil! Anda mendapatkan ${amt} Coin dari quest "${questToClaim.title}"!`, 'success_no_xp');
      } else if (questToClaim.rewardType === 'diamond') {
        const amt = questToClaim.rewardAmount;
        setDiamonds(prev => {
          const next = prev + amt;
          localStorage.setItem('diamonds', String(next));
          return next;
        });
        triggerReward(0, `Klaim Berhasil! Anda mendapatkan ${amt} Diamond dari quest "${questToClaim.title}"!`, 'success_no_xp');
      } else if (questToClaim.rewardType === 'xp') {
        const amt = questToClaim.rewardAmount;
        setXp(p => {
          const n = p + amt;
          localStorage.setItem('xp', String(n));
          if (user) {
            const updatedUser = { ...user, xp: n };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
          return n;
        });
        triggerReward(amt, `Klaim Berhasil! Anda mendapatkan +${amt} XP dari quest "${questToClaim.title}"!`);
      }
    }
  };

  const [hearts, setHearts] = useState<number>(() => {
    const saved = localStorage.getItem('hearts');
    return saved !== null ? Number(saved) : 5;
  });
  const [streak, setStreak] = useState<number>(() => {
    const actUser = getActiveUsername();
    const saved = localStorage.getItem(`streak:${actUser}`);
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
  const [selectedSkin, setSelectedSkin] = useState<string>(() => {
    const actUser = getActiveUsername();
    return localStorage.getItem(`selectedSkin:${actUser}`) || 'standard';
  });
  const [resetConfirmActive, setResetConfirmActive] = useState<boolean>(false);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    const actUser = getActiveUsername();
    const saved = localStorage.getItem(`unlockedSkins:${actUser}`);
    return saved ? JSON.parse(saved) : ['standard'];
  });
  const [membershipStatus, setMembershipStatus] = useState<'free' | 'premium'>(() => {
    return (localStorage.getItem('membershipStatus') as 'free' | 'premium') || 'free';
  });

  // --- SERVER TIME & DATE STATES (TO ENFORCE COMPLIANCE & AVOID DATE MANIPULATION) ---
  const [serverDate, setServerDate] = useState<string>("");
  const [serverEpochDays, setServerEpochDays] = useState<number>(0);

  const [selectedFrame, setSelectedFrame] = useState<string>(() => {
    const actUser = getActiveUsername();
    return localStorage.getItem(`selectedFrame:${actUser}`) || 'none';
  });

  const [unlockedFrames, setUnlockedFrames] = useState<string[]>(() => {
    const actUser = getActiveUsername();
    const saved = localStorage.getItem(`unlockedFrames:${actUser}`);
    return saved ? JSON.parse(saved) : ['none'];
  });

  const [guestMatchesPlayed, setGuestMatchesPlayed] = useState<number>(() => {
    return Number(localStorage.getItem('guestMatchesPlayed') || '0');
  });

  const [guestMatchesWon, setGuestMatchesWon] = useState<number>(() => {
    return Number(localStorage.getItem('guestMatchesWon') || '0');
  });

  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>(() => {
    const actUser = getActiveUsername();
    try {
      const saved = localStorage.getItem(`claimedLevelRewards:${actUser}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyClaimed, setDailyClaimed] = useState<boolean>(() => {
    const actUser = getActiveUsername();
    const today = new Date().toLocaleDateString('en-CA');
    const lastClaim = localStorage.getItem(`lastClaimDate:${actUser}`);
    return lastClaim === today;
  });

  const [dailyIndex, setDailyIndex] = useState<number>(() => {
    const actUser = getActiveUsername();
    const today = new Date().toLocaleDateString('en-CA');
    const lastClaim = localStorage.getItem(`lastClaimDate:${actUser}`);
    const savedIdx = localStorage.getItem(`dailyIndex:${actUser}`);
    
    if (!lastClaim) return 0;
    if (lastClaim === today) {
      return savedIdx ? parseInt(savedIdx, 10) : 0;
    }
    
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toLocaleDateString('en-CA');
    
    if (lastClaim === yesterday) {
      return savedIdx ? parseInt(savedIdx, 10) : 0;
    }
    
    return 0;
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
  const [isCasualMatch, setIsCasualMatch] = useState<boolean>(() => {
    return localStorage.getItem('casual_match_mode') === 'true';
  });
  const [gameSpeedType, setGameSpeedType] = useState<'blitz' | 'bullet' | 'rapid'>(() => {
    const limit = Number(localStorage.getItem('timerLimit')) || 600;
    return limit === 60 ? 'bullet' : limit === 180 ? 'blitz' : 'rapid';
  });
  const [playerTime, setPlayerTime] = useState<number>(600);
  const [aiTime, setAiTime] = useState<number>(600);
  
  // Instantiating Chess with useRef to maintain state across renders
  const chessRef = useRef(new Chess());
  const processedGameResultRef = useRef<string | null>(null);
  const [board, setBoard] = useState<(any | null)[][]>(() => chessRef.current.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSpeech, setAiSpeech] = useState<string>('');
  const [gameResult, setGameResult] = useState<string | null>(null); // 'win' | 'lose' | 'draw' | null
  const [localFriendResigned, setLocalFriendResigned] = useState<'w' | 'b' | null>(null);
  const [promotionPendingMove, setPromotionPendingMove] = useState<{ from: string; to: string; modeType: 'play' | 'friend' | 'online' } | null>(null);
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
  const [showPuzzleHint, setShowPuzzleHint] = useState<boolean>(false);

  // Interactive feedback triggers
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [rewardMessage, setRewardMessage] = useState<string>('');
  const [rewardType, setRewardType] = useState<'reward' | 'premium' | 'info' | 'success_no_xp' | 'level_up'>('reward');

  // --- ONLINE MULTIPLAYER MATCHMAKING STATE & LOGIC ---
  const [onlineStatus, setOnlineStatus] = useState<'idle' | 'searching' | 'playing' | 'game-over'>('idle');
  const [onlinePlayerColor, setOnlinePlayerColor] = useState<'w' | 'b' | null>(null);
  const [onlineOpponent, setOnlineOpponent] = useState<{ name: string; elo: number; isAi: boolean } | null>(null);
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null);
  const [onlineGameResult, setOnlineGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [onlineEloChange, setOnlineEloChange] = useState<number>(0);
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
  const [rankingList, setRankingList] = useState<any[]>(() => [
    { name: "Magnus Carlsen", elo: 2850, badge: "Grandmaster" },
    { name: "Hikaru Nakamura", elo: 2820, badge: "Grandmaster" },
    { name: "Ding Liren", elo: 2780, badge: "Grandmaster" },
    { name: "Martin Bot", elo: 800, badge: "Pemula Berbakat" },
  ]);
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

  // --- USER AUTHENTICATION STATES & SYNCHRONIZATION ---
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAvatarStudio, setShowAvatarStudio] = useState<boolean>(false);

  // --- SOCIAL, FRIENDS & INBOX STATE (DECLARE BEFORE GIFTS) ---
  const [friendsList, setFriendsList] = useState<any[]>([]);
  
  // --- INBOX RECEIVED GIFTS STATE (EMOJI FREE) ---
  const [rawReceivedGifts, setReceivedGifts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('raw_received_gifts') || localStorage.getItem('received_gifts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'rg1', from: 'Isna_Cantiq', giftName: 'Piala Kristal Master', msg: 'Permainan bagus kemarin di Arena Klub! Ini hadiah untukmu.', isPremium: true, cashValueCoins: 150, cashValueDiamonds: 5, affinityPoints: 100 },
      { id: 'rg2', from: 'Nelson_Pro', giftName: 'Paket Kopi Hangat', msg: 'Tetap semangat mengasah taktik pembukaan!', isPremium: false, cashValueCoins: 30, cashValueDiamonds: 0, affinityPoints: 50 },
      { id: 'rg3', from: 'Martin_Pratama', giftName: 'Bidak Perak Solid', msg: 'Terima kasih atas bimbingannya di arena kausal.', isPremium: true, cashValueCoins: 250, cashValueDiamonds: 8, affinityPoints: 150 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('raw_received_gifts', JSON.stringify(rawReceivedGifts));
  }, [rawReceivedGifts]);

  // Filter out any messages of players not added to the user's friend list to strictly remove bots!
  const receivedGifts = useMemo(() => {
    return rawReceivedGifts.map(gift => {
      // Re-route dummy default items to actual friends if any are active
      if (friendsList && friendsList.length > 0 && !friendsList.some(f => f.username.toLowerCase() === gift.from.toLowerCase())) {
        return { ...gift, from: friendsList[0].username };
      }
      return gift;
    }).filter(gift => friendsList && friendsList.some(f => f.username.toLowerCase() === gift.from.toLowerCase()));
  }, [rawReceivedGifts, friendsList]);

  const [showGiftInboxModal, setShowGiftInboxModal] = useState<boolean>(false);
  const [showFriendListModal, setShowFriendListModal] = useState<boolean>(false);
  const [inboxActiveTab, setInboxActiveTab] = useState<'gifts' | 'invites'>('gifts');

  // Gifting transaction cashout action
  const handleCashOutGiftInApp = (gift: any, cashType: 'coins' | 'diamonds') => {
    if (cashType === 'coins') {
      const rewardAmt = gift.cashValueCoins > 0 ? gift.cashValueCoins : 50;
      setCoins(c => {
        const next = c + rewardAmt;
        localStorage.setItem('coins', String(next));
        return next;
      });
      triggerReward(0, `Berhasil mencairkan ${gift.giftName} dari ${gift.from} menjadi +${rewardAmt} Koin ke saldo utama Anda!`, 'success_no_xp');
    } else {
      const rewardAmt = gift.cashValueDiamonds > 0 ? gift.cashValueDiamonds : 3;
      setDiamonds(d => {
        const next = d + rewardAmt;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
      triggerReward(0, `Berhasil mencairkan ${gift.giftName} dari ${gift.from} menjadi +${rewardAmt} Berlian ke saldo utama Anda!`, 'success_no_xp');
    }
    setReceivedGifts(prev => prev.filter(g => g.id !== gift.id));
    triggerAudio('win');
  };

  const handleOpenOrdinaryGiftInApp = (gift: any) => {
    try {
      const savedAff = localStorage.getItem('friend_affinities') || '{}';
      const affMap = JSON.parse(savedAff);
      if (!affMap[gift.from]) {
        affMap[gift.from] = { points: 0, level: 1 };
      }
      affMap[gift.from].points += gift.affinityPoints;
      
      const nextLvlReq = affMap[gift.from].level * 100;
      if (affMap[gift.from].points >= nextLvlReq) {
        affMap[gift.from].points -= nextLvlReq;
        affMap[gift.from].level += 1;
        triggerReward(0, `Peringkat Afinitas dengan ${gift.from} naik ke Tingkat ${affMap[gift.from].level}!`, 'success_no_xp');
      } else {
        triggerReward(0, `Membuka bingkisan pertemanan! Afinitas dengan ${gift.from} bertambah +${gift.affinityPoints} poin.`, 'success_no_xp');
      }
      localStorage.setItem('friend_affinities', JSON.stringify(affMap));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    setReceivedGifts(prev => prev.filter(g => g.id !== gift.id));
    triggerAudio('win');
  };

  const [saveStatus, setSaveStatus] = useState<string>(''); // 'saving', 'saved', or empty
  const [profileEditingBio, setProfileEditingBio] = useState<string>('');
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.claimedAchievements || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const loadUserScopedStats = (targetUser: string, customServerDate?: string) => {
    const userScope = targetUser.trim().toLowerCase();
    
    // Load streak
    const savedStreak = localStorage.getItem(`streak:${userScope}`);
    setStreak(savedStreak !== null ? Number(savedStreak) : 0);
    
    // Load unlocked skins
    const savedSkins = localStorage.getItem(`unlockedSkins:${userScope}`);
    setUnlockedSkins(savedSkins ? JSON.parse(savedSkins) : ['standard']);
    
    // Load selected skin
    const savedSelectedSkin = localStorage.getItem(`selectedSkin:${userScope}`) || 'standard';
    setSelectedSkin(savedSelectedSkin);

    // Load avatar frames
    const savedSelectedFrame = localStorage.getItem(`selectedFrame:${userScope}`) || 'none';
    setSelectedFrame(savedSelectedFrame);

    const savedUnlockedFrames = localStorage.getItem(`unlockedFrames:${userScope}`);
    setUnlockedFrames(savedUnlockedFrames ? JSON.parse(savedUnlockedFrames) : ['none']);

    // Load claimed level rewards
    const savedLvlClaimed = localStorage.getItem(`claimedLevelRewards:${userScope}`);
    setClaimedLevelRewards(savedLvlClaimed ? JSON.parse(savedLvlClaimed) : []);

    // Compute daily claimed & daily index
    const today = customServerDate || serverDate;
    const lastClaim = localStorage.getItem(`lastClaimDate:${userScope}`);
    const isClaimedToday = lastClaim === today;
    setDailyClaimed(isClaimedToday);
    
    const savedIdx = localStorage.getItem(`dailyIndex:${userScope}`);
    let finalIdx = 0;
    if (lastClaim) {
      if (lastClaim === today) {
        finalIdx = savedIdx ? parseInt(savedIdx, 10) : 0;
      } else {
        const d = new Date(today + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        const yesterday = d.toLocaleDateString('en-CA');
        if (lastClaim === yesterday) {
          finalIdx = savedIdx ? parseInt(savedIdx, 10) : 0;
        }
      }
    }
    setDailyIndex(finalIdx);
  };

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // --- TRIVIA GAME STATES ---
  const [triviaIndex, setTriviaIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem('triviaIndex');
    if (savedIdx !== null) return Number(savedIdx);
    const rand = Math.floor(Math.random() * CHESS_TRIVIA.length);
    localStorage.setItem('triviaIndex', String(rand));
    return rand;
  });
  const [triviaAnswered, setTriviaAnswered] = useState<number | null>(() => {
    const savedAns = localStorage.getItem('triviaAnswered');
    return savedAns !== null ? Number(savedAns) : null;
  });
  const [triviaResult, setTriviaResult] = useState<boolean | null>(() => {
    const savedRes = localStorage.getItem('triviaResult');
    if (savedRes === 'true') return true;
    if (savedRes === 'false') return false;
    return null;
  });

  const handleNextTrivia = () => {
    const nextIdx = (triviaIndex + 1) % CHESS_TRIVIA.length;
    setTriviaIndex(nextIdx);
    setTriviaAnswered(null);
    setTriviaResult(null);
    localStorage.setItem('triviaIndex', String(nextIdx));
    localStorage.removeItem('triviaAnswered');
    localStorage.removeItem('triviaResult');
    triggerAudio('move');
  };

  // --- GAME CHESS ANALYSIS STATES ---
  const [analysisHistory, setAnalysisHistory] = useState<{
    fen: string;
    san: string;
    from: string;
    to: string;
    type: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder';
    color: 'w' | 'b';
  }[]>([]);
  const [analysisStepIdx, setAnalysisStepIdx] = useState<number>(-1);
  const [analysisStepDetails, setAnalysisStepDetails] = useState<Record<number, string>>({});
  const [isAnalyzingPositionWithAI, setIsAnalyzingPositionWithAI] = useState<boolean>(false);

  // --- SOCIAL, FRIENDS & INBOX STATE ---
  const [selectedFriendForDetail, setSelectedFriendForDetail] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [addFriendInput, setAddFriendInput] = useState<string>('');
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialSuccess, setSocialSuccess] = useState<string | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState<boolean>(false);

  // --- FRIEND MATCH CODES & ROTATION ---
  const [friendRoomCode, setFriendRoomCode] = useState<string>('');
  const [friendLobbyType, setFriendLobbyType] = useState<'local' | 'online' | null>(null);
  const [localFriendRotates, setLocalFriendRotates] = useState<boolean>(true);
  const [localFriendWName, setLocalFriendWName] = useState<string>('Pemain Putih');
  const [localFriendBName, setLocalFriendBName] = useState<string>('Pemain Hitam');

  const syncUserStats = async (
    updatedElo?: number, 
    updatedXp?: number, 
    updatedThemes?: string[],
    updatedPlayed?: number,
    updatedWon?: number,
    updatedAvatar?: string,
    updatedBio?: string,
    updatedClaimedAchievements?: string[]
  ) => {
    if (updatedBio !== undefined || updatedAvatar !== undefined) {
      setSaveStatus('saving');
    }
    if (!user) {
      if (updatedBio !== undefined || updatedAvatar !== undefined) {
        // Support guest bio/avatar update too!
        const guestData = {
          username: username,
          elo: onlineRating,
          xp: xp,
          unlockedThemes: unlockedThemes,
          matchesPlayed: 0,
          matchesWon: 0,
          profileAvatar: updatedAvatar !== undefined ? updatedAvatar : (localStorage.getItem('guestAvatar') || martinAvatar),
          profileBio: updatedBio !== undefined ? updatedBio : (localStorage.getItem('guestBio') || "Pecatur sejati pantang menyerah!"),
          claimedAchievements: []
        };
        if (updatedAvatar !== undefined) localStorage.setItem('guestAvatar', updatedAvatar);
        if (updatedBio !== undefined) localStorage.setItem('guestBio', updatedBio);
        setUser(guestData);
        localStorage.setItem('user', JSON.stringify(guestData));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
      }
      return;
    }
    try {
      const requestPayload: any = { username: user.username, membershipStatus };
      if (updatedElo !== undefined) requestPayload.elo = updatedElo;
      if (updatedXp !== undefined) requestPayload.xp = updatedXp;
      if (updatedThemes !== undefined) requestPayload.unlockedThemes = updatedThemes;
      
      // Always guarantee matchesPlayed and matchesWon are sent
      requestPayload.matchesPlayed = updatedPlayed !== undefined ? updatedPlayed : (user.matchesPlayed || 0);
      requestPayload.matchesWon = updatedWon !== undefined ? updatedWon : (user.matchesWon || 0);
      
      if (updatedAvatar !== undefined) requestPayload.profileAvatar = updatedAvatar;
      if (updatedBio !== undefined) requestPayload.profileBio = updatedBio;
      if (updatedClaimedAchievements !== undefined) {
        requestPayload.claimedAchievements = updatedClaimedAchievements;
      } else {
        requestPayload.claimedAchievements = claimedAchievements;
      }

      const res = await fetchWithTimeout('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      }, 1500);
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success && data.user) {
        const synced = {
          username: data.user.username,
          elo: data.user.elo,
          xp: data.user.xp,
          unlockedThemes: data.user.unlockedThemes,
          matchesPlayed: data.user.matchesPlayed || 0,
          matchesWon: data.user.matchesWon || 0,
          profileAvatar: data.user.profileAvatar || martinAvatar,
          profileBio: data.user.profileBio || "Pecatur sejati pantang menyerah!",
          claimedAchievements: data.user.claimedAchievements || [],
          membershipStatus: data.user.membershipStatus || 'free'
        };
        setUser(synced);
        setClaimedAchievements(data.user.claimedAchievements || []);
        localStorage.setItem('user', JSON.stringify(synced));
        setMembershipStatus(synced.membershipStatus as any);
        localStorage.setItem('membershipStatus', synced.membershipStatus);

        if (updatedBio !== undefined || updatedAvatar !== undefined) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2500);
        }
      } else {
        throw new Error(data?.error || "Sync failed on server");
      }
    } catch (e) {
      console.warn("Stats sync issues, falling back to local updates:", e);
      if (user) {
        const nextUserObj = {
          ...user,
          elo: updatedElo !== undefined ? updatedElo : (user.elo || 400),
          xp: updatedXp !== undefined ? updatedXp : (user.xp || 0),
          unlockedThemes: updatedThemes !== undefined ? updatedThemes : (user.unlockedThemes || ["classic"]),
          matchesPlayed: updatedPlayed !== undefined ? updatedPlayed : (user.matchesPlayed || 0),
          matchesWon: updatedWon !== undefined ? updatedWon : (user.matchesWon || 0),
          profileAvatar: updatedAvatar !== undefined ? updatedAvatar : (user.profileAvatar || martinAvatar),
          profileBio: updatedBio !== undefined ? updatedBio : (user.profileBio || "Pecatur sejati pantang menyerah!"),
          claimedAchievements: updatedClaimedAchievements !== undefined ? updatedClaimedAchievements : (claimedAchievements || []),
          membershipStatus: membershipStatus
        };
        setUser(nextUserObj);
        localStorage.setItem('user', JSON.stringify(nextUserObj));
        
        // Save to mock_users cache in localStorage so login with same user works later
        const mockUsersRaw = localStorage.getItem('mock_users') || '[]';
        let mockUsers: any[] = [];
        try {
          mockUsers = JSON.parse(mockUsersRaw);
        } catch (pe) {
          mockUsers = [];
        }
        const userIdx = mockUsers.findIndex((u: any) => u.username.toLowerCase() === user.username.toLowerCase());
        if (userIdx !== -1) {
          mockUsers[userIdx] = {
            ...mockUsers[userIdx],
            elo: nextUserObj.elo,
            xp: nextUserObj.xp,
            unlockedThemes: nextUserObj.unlockedThemes,
            matchesPlayed: nextUserObj.matchesPlayed,
            matchesWon: nextUserObj.matchesWon,
            profileAvatar: nextUserObj.profileAvatar,
            profileBio: nextUserObj.profileBio,
            claimedAchievements: nextUserObj.claimedAchievements,
            membershipStatus: nextUserObj.membershipStatus
          };
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        }
        if (updatedBio !== undefined || updatedAvatar !== undefined) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2500);
        }
      }
    }
  };

  // Sync user profile username inside input
  const handleSaveUsername = (newName: string) => {
    setUsername(newName);
    localStorage.setItem('username', newName);
  };

  // --- SOCIAL GAME SYSTEM API METHODS ---
  const fetchSocialInfo = async () => {
    if (!username || !user) return;
    try {
      const res = await fetch(`/api/social/info?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data.friends || []);
        setFriendRequests(data.friendRequests || []);
        setInboxMessages(data.inbox || []);
      }
    } catch (e) {
      console.warn("Failed to fetch social info:", e);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!addFriendInput.trim() || !user) return;
    setIsSocialLoading(true);
    setSocialError(null);
    setSocialSuccess(null);
    try {
      const res = await fetch('/api/social/friends/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, friendUsername: addFriendInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSocialSuccess(data.message);
        setAddFriendInput('');
        fetchSocialInfo();
      } else {
        setSocialError(data.error || "Gagal mengirimkan permintaan pertemanan");
      }
    } catch (e) {
      setSocialError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleRespondToFriendRequest = async (requester: string, action: 'accept' | 'decline') => {
    if (!user) return;
    setSocialError(null);
    setSocialSuccess(null);
    try {
      const res = await fetch('/api/social/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, requesterUsername: requester, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFriendsList(data.friends || []);
        setFriendRequests(data.friendRequests || []);
        setInboxMessages(data.inbox || []);
        setSocialSuccess(action === 'accept' ? `Berhasil berteman dengan ${requester}!` : `Menolak permintaan pertemanan.`);
        fetchSocialInfo();
      } else {
        setSocialError(data.error || "Gagal melakukan aksi");
      }
    } catch (e) {
      setSocialError("Kesalahan koneksi ke server.");
    }
  };

  const handleRemoveFriend = async (friendName: string) => {
    if (!user) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus pertemanan dengan @${friendName}?`)) return;
    setSocialError(null);
    setSocialSuccess(null);
    setIsSocialLoading(true);
    try {
      const res = await fetch('/api/social/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, friendUsername: friendName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSocialSuccess(data.message);
        triggerAudio('error');
        fetchSocialInfo();
      } else {
        setSocialError(data.error || "Gagal menghapus pertemanan.");
      }
    } catch (e) {
      setSocialError("Kesalahan koneksi ke server.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleInviteFriend = async (friendName: string) => {
    if (!user) return;
    setSocialError(null);
    setSocialSuccess(null);
    const generatedCode = `PLAY_${username.substring(0,4).toUpperCase().replace(/[^A-Z0-9]/g, '')}_${Math.floor(1000 + Math.random()*9000)}`;
    try {
      const res = await fetch('/api/social/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, friendUsername: friendName, roomCode: generatedCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFriendRoomCode(generatedCode);
        setMode('online-match');
        setOnlineStatus('searching');
        setSocialSuccess(`Undangan dikirim ke ${friendName}! Memulai pencarian room...`);
      } else {
        setSocialError(data.error || "Gagal mengirimkan undangan permainan");
      }
    } catch (e) {
      setSocialError("Gagal terhubung dengan server.");
    }
  };

  const handleRespondToInvite = async (message: any, action: 'accept' | 'decline') => {
    if (!user) return;
    setSocialError(null);
    setSocialSuccess(null);
    try {
      if (action === 'accept') {
        setFriendRoomCode(message.roomCode);
        setMode('online-match');
        setOnlineStatus('searching');
        setSocialSuccess(`Menerima undangan dari ${message.sender}! Menghubungkan ke room...`);
      }
      await fetch('/api/social/inbox/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, msgId: message.id })
      });
      fetchSocialInfo();
    } catch (e) {
      console.warn("Error managing invitation response:", e);
    }
  };

  // Poll social/friend metrics for real-time notifications
  useEffect(() => {
    let socialInterval: any = null;
    if (user) {
      fetchSocialInfo();
      socialInterval = setInterval(fetchSocialInfo, 5000);
    }
    return () => clearInterval(socialInterval);
  }, [username, user]);

  // Master mode change cleanup effect to prevent stuck/disabled boards & lingering overlays
  useEffect(() => {
    setGameResult(null);
    setOnlineGameResult(null);
    setLastMove(null);
    setSelectedSquare(null);
    setDraggingSquare(null);
    setIsAiThinking(false);
    setLocalFriendResigned(null);
    setPromotionPendingMove(null);
  }, [mode, activeLesson, activePuzzle]);

  useEffect(() => {
    if (user && user.profileBio && !profileEditingBio) {
      setProfileEditingBio(user.profileBio);
    }
  }, [user]);

  // Persists core stats inside localStorage and triggers database synchronization
  useEffect(() => {
    const userScope = username.trim().toLowerCase();
    localStorage.setItem('mode', mode);
    localStorage.setItem('xp', String(xp));
    localStorage.setItem('coins', String(coins));
    localStorage.setItem(`coins:${userScope}`, String(coins));
    localStorage.setItem('diamonds', String(diamonds));
    localStorage.setItem(`diamonds:${userScope}`, String(diamonds));
    localStorage.setItem('selectedFrame', selectedFrame);
    localStorage.setItem(`selectedFrame:${userScope}`, selectedFrame);
    localStorage.setItem('unlockedFrames', JSON.stringify(unlockedFrames));
    localStorage.setItem(`unlockedFrames:${userScope}`, JSON.stringify(unlockedFrames));
    localStorage.setItem('hearts', String(hearts));
    localStorage.setItem('streak', String(streak));
    localStorage.setItem(`streak:${userScope}`, String(streak));
    localStorage.setItem('sound', String(soundEnabled));
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
    localStorage.setItem('boardTheme', boardTheme);
    localStorage.setItem('selectedSkin', selectedSkin);
    localStorage.setItem(`selectedSkin:${userScope}`, selectedSkin);
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
    localStorage.setItem(`unlockedSkins:${userScope}`, JSON.stringify(unlockedSkins));
    localStorage.setItem('membershipStatus', membershipStatus);
    localStorage.setItem(`membershipStatus:${userScope}`, membershipStatus);
    localStorage.setItem('onlineRating', String(onlineRating));
    localStorage.setItem('onlineHistory', JSON.stringify(onlineHistory));
    localStorage.setItem('username', username);
    localStorage.setItem(`claimedLevelRewards:${userScope}`, JSON.stringify(claimedLevelRewards));
    if (selectedCharacter) {
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    } else {
      localStorage.removeItem('selectedCharacter');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [mode, xp, coins, diamonds, selectedFrame, unlockedFrames, hearts, streak, soundEnabled, unlockedThemes, boardTheme, selectedCharacter, onlineRating, onlineHistory, username, user, selectedSkin, unlockedSkins, membershipStatus, claimedLevelRewards]);

  // Synchronously monitor XP changes to detect LEVEL UP events!
  const lastCheckedLevel = useRef<number | null>(null);
  useEffect(() => {
    if (xp === undefined) return;
    const currentLevel = Math.floor(xp / 100) + 1;
    if (lastCheckedLevel.current === null) {
      lastCheckedLevel.current = currentLevel;
      return;
    }
    if (currentLevel > lastCheckedLevel.current) {
      const fromLvl = lastCheckedLevel.current;
      const toLvl = currentLevel;
      lastCheckedLevel.current = toLvl;
      
      triggerAudio('win');
      triggerReward(0, `Spesial LEVEL UP! Kamu naik ke Level ${toLvl}! Yuk ambil koin & berlian hadiah naik levelmu di menu Profil -> Perjalanan Level! Bintang`, 'level_up');
    } else if (currentLevel < lastCheckedLevel.current) {
      lastCheckedLevel.current = currentLevel;
    }
  }, [xp]);

  // Handle automatic background synchronization to the server for logged-in players
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        syncUserStats(onlineRating, xp, unlockedThemes, user.matchesPlayed || 0, user.matchesWon || 0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [xp, onlineRating, unlockedThemes, user?.matchesPlayed, user?.matchesWon]);

  // Listen for BOT game endings to track user play stats
  useEffect(() => {
    if (!gameResult) {
      processedGameResultRef.current = null;
      return;
    }
    if (processedGameResultRef.current === gameResult) {
      return;
    }
    processedGameResultRef.current = gameResult;

    // It's a completed local bot play game!
    const outcome = (gameResult === 'win' || gameResult === 'win-time') ? 'win' :
                    (gameResult === 'lose' || gameResult === 'lose-time') ? 'lose' : 'draw';
    
    const currentPlayed = user ? (user.matchesPlayed || 0) : guestMatchesPlayed;
    const currentWon = user ? (user.matchesWon || 0) : guestMatchesWon;

    const nextPlayed = currentPlayed + 1;
    const nextWon = currentWon + (outcome === 'win' ? 1 : 0);
    
    setGuestMatchesPlayed(nextPlayed);
    setGuestMatchesWon(nextWon);
    localStorage.setItem('guestMatchesPlayed', String(nextPlayed));
    localStorage.setItem('guestMatchesWon', String(nextWon));

    // Add XP for completing a match!
    let xpEarned = 10;
    if (outcome === 'win') xpEarned = 25;
    const nextXp = xp + xpEarned;
    setXp(nextXp);
    localStorage.setItem('xp', String(nextXp));

    updateDailyQuestProgress('play', 1);
    if (outcome === 'win') {
      updateDailyQuestProgress('win', 1);
    }

    if (user) {
      syncUserStats(onlineRating, nextXp, unlockedThemes, nextPlayed, nextWon);
    }
  }, [gameResult, user, xp, onlineRating, unlockedThemes, guestMatchesPlayed, guestMatchesWon]);

  // Initial mount sync for the logged-in user's Elo, XP, and stats from the server
  useEffect(() => {
    const initSync = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.username) {
            const localElo = localStorage.getItem('onlineRating') ? Number(localStorage.getItem('onlineRating')) : 400;
            const localXp = localStorage.getItem('xp') ? Number(localStorage.getItem('xp')) : 0;

            // Fetch newest synced stats from the backend by sending only their username
            const res = await fetchWithTimeout('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: parsed.username })
            }, 1500);
            const data = await res.json();
            if (data && data.success && data.user) {
              const finalElo = Math.max(data.user.elo ?? 400, localElo);
              const finalXp = Math.max(data.user.xp ?? 0, localXp);

              const synced = {
                username: data.user.username,
                elo: finalElo,
                xp: finalXp,
                unlockedThemes: data.user.unlockedThemes ?? ["classic"],
                matchesPlayed: data.user.matchesPlayed ?? 0,
                matchesWon: data.user.matchesWon ?? 0,
                profileAvatar: data.user.profileAvatar ?? martinAvatar,
                profileBio: data.user.profileBio ?? "Pecatur sejati pantang menyerah!",
                claimedAchievements: data.user.claimedAchievements || [],
                membershipStatus: data.user.membershipStatus || 'free'
              };
              setUser(synced);
              setClaimedAchievements(data.user.claimedAchievements || []);
              localStorage.setItem('user', JSON.stringify(synced));
              
              setMembershipStatus(synced.membershipStatus as any);
              localStorage.setItem('membershipStatus', synced.membershipStatus);

              // Synchronize local states instantly
              setOnlineRating(finalElo);
              localStorage.setItem('onlineRating', String(finalElo));
              setXp(finalXp);
              localStorage.setItem('xp', String(finalXp));
              setUnlockedThemes(synced.unlockedThemes);

              // If the client had higher values, push them back to the server to consolidate!
              if (finalElo > (data.user.elo ?? 400) || finalXp > (data.user.xp ?? 0)) {
                await fetchWithTimeout('/api/auth/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: parsed.username,
                    elo: finalElo,
                    xp: finalXp,
                    matchesPlayed: synced.matchesPlayed,
                    matchesWon: synced.matchesWon
                  })
                }, 1500);
              }
            }
          }
        } catch (e) {
          console.warn("Error on initial user profile sync:", e);
        }
      }
    };
    initSync();
  }, []);

  // Check and update streak, quest line resets, and daily claim states using un-cheat-able server time
  useEffect(() => {
    let isMounted = true;
    const fetchServerTime = async () => {
      try {
        const res = await fetch('/api/server-time');
        if (res.ok) {
          const data = await res.json();
          if (data && data.dateString && isMounted) {
            const dateStr = data.dateString;
            const daysEpoch = data.epochDays;
            
            setServerDate(dateStr);
            setServerEpochDays(daysEpoch);
            
            // Re-sync correct streak, daily indices, check-ins, and quests with the validated server date
            const userScope = username.trim().toLowerCase();
            
            // Today claim check
            const lastClaim = localStorage.getItem(`lastClaimDate:${userScope}`);
            const isClaimedToday = lastClaim === dateStr;
            setDailyClaimed(isClaimedToday);
            
            // Index offset calculation
            const savedIdx = localStorage.getItem(`dailyIndex:${userScope}`);
            let finalIdx = 0;
            if (lastClaim) {
              if (lastClaim === dateStr) {
                finalIdx = savedIdx ? parseInt(savedIdx, 10) : 0;
              } else {
                const d = new Date(dateStr + 'T00:00:00');
                d.setDate(d.getDate() - 1);
                const yesterday = d.toLocaleDateString('en-CA');
                if (lastClaim === yesterday) {
                  finalIdx = savedIdx ? parseInt(savedIdx, 10) : 0;
                }
              }
            }
            setDailyIndex(finalIdx);

            // Streak check validity
            const lastStreakDate = localStorage.getItem(`lastStreakDate:${userScope}`);
            if (lastStreakDate) {
              const lastDate = new Date(lastStreakDate + 'T00:00:00');
              const todayDate = new Date(dateStr + 'T00:00:00');
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 1) {
                setStreak(0);
                localStorage.setItem(`streak:${userScope}`, '0');
              }
            } else {
              setStreak(0);
              localStorage.setItem(`streak:${userScope}`, '0');
            }

            // Daily Quest reset checked against verified server date (resetting every 24 hours verified)
            const lastQuestReset = localStorage.getItem(`lastQuestResetDate:${userScope}`);
            if (lastQuestReset !== dateStr) {
              const defaultQuests = [
                { id: 'q1', type: 'regular', title: 'Asah Otak Taktis', description: 'Selesaikan 1 teka-teki Puzzle catur', target: 1, current: 0, rewardType: 'coin', rewardAmount: 50, claimed: false },
                { id: 'q2', type: 'regular', title: 'Ksatria Arena Cepat', description: 'Mainkan 1 pertandingan catur (Bot atau Online)', target: 1, current: 0, rewardType: 'xp', rewardAmount: 30, claimed: false },
                { id: 'q3', type: 'regular', title: 'Kemenangan Gemilang', description: 'Menangkan 1 pertandingan catur melawan Bot atau Online', target: 1, current: 0, rewardType: 'coin', rewardAmount: 100, claimed: false },
                
                { id: 'qp1', type: 'premium', title: 'Spesialis Teka-teki Elite', description: 'Selesaikan 3 teka-teki Puzzle catur', target: 3, current: 0, rewardType: 'diamond', rewardAmount: 5, claimed: false },
                { id: 'qp2', type: 'premium', title: 'Gladiator Arena Sejati', description: 'Mainkan 3 pertandingan catur (Bot atau Online)', target: 3, current: 0, rewardType: 'diamond', rewardAmount: 10, claimed: false },
                { id: 'qp3', type: 'premium', title: 'Dominasi Papan Catur', description: 'Menangkan 2 pertandingan catur melawan Bot atau Online', target: 2, current: 0, rewardType: 'diamond', rewardAmount: 15, claimed: false }
              ];
              setDailyQuests(defaultQuests);
              localStorage.setItem('dailyQuests', JSON.stringify(defaultQuests));
              localStorage.setItem(`lastQuestResetDate:${userScope}`, dateStr);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve un-manipulated server date, using system clock fallback:", err);
      }
    };
    
    fetchServerTime();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Fetch online leaderboard ranks
  const fetchRankings = async () => {
    try {
      const res = await fetchWithTimeout('/api/online/leaderboard', {}, 2000);
      if (res.ok) {
        const seedData = await res.json();
        // Exclude the current username from the database entries to prevent duplicate ranking rows
        const cleanSeedData = (seedData || []).filter((player: any) => {
          if (!player || !player.name) return false;
          const playerNormalized = player.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
          const pNameNormalized = (username || '').trim().toLowerCase();
          return playerNormalized !== pNameNormalized && playerNormalized !== 'pecatur';
        });
        const allRanks = [...cleanSeedData, { name: `${username.trim() || 'Pecatur'} (Kamu)`, elo: onlineRating, badge: getRatingBadge(onlineRating), isUser: true }]
          .sort((a, b) => b.elo - a.elo);
        setRankingList(allRanks);
      } else {
        throw new Error("HTTP error status: " + res.status);
      }
    } catch (err) {
      console.warn("Gagal mengambil peringkat leaderboard, memuat ranking lokal:", err);
      const offlineRanks: any[] = [];
      const cleanOffline = offlineRanks.filter((player: any) => {
        const playerNormalized = player.name.replace(/\s*\(Kamu\)\s*/gi, '').trim().toLowerCase();
        const pNameNormalized = (username || '').trim().toLowerCase();
        return playerNormalized !== pNameNormalized;
      });
      const allRanks = [...cleanOffline, { name: `${username.trim() || 'Pecatur'} (Kamu)`, elo: onlineRating, badge: getRatingBadge(onlineRating), isUser: true }]
        .sort((a, b) => b.elo - a.elo);
      setRankingList(allRanks);
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
              elo: onlineRating,
              roomCode: friendRoomCode || undefined
            })
          });
          const data = await res.json();
          if (data && data.status === 'matched') {
            setOnlineGameId(data.gameId);
            setOnlinePlayerColor(data.color);
            setOnlineOpponent({ ...data.opponent, isAi: false });
            setOnlineStatus('playing');
            setOnlineGameResult(null);
            setLastMove(null);
            setMoveHistory([]);
            
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
  }, [mode, onlineStatus, friendRoomCode, playerId, username, onlineRating]);

  // Search Timeout (Fallback after 5 seconds to instant simulated opponent)
  useEffect(() => {
    if (onlineStatus === 'searching' && searchTime >= 5 && !friendRoomCode) {
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
      setLastMove(null);
      setMoveHistory([]);
      
      chessRef.current = new Chess();
      setBoard(chessRef.current.board());
      setSelectedSquare(null);
      
      setOnlineChats([
        { sender: 'Sistem', text: `Pertandingan dimulai! Anda bermain sebagai Putih melawan ${matched.name} (ELO ${matched.elo}).` },
        { sender: matched.name, text: 'Halo! Salam kenal, mari kita main sportif! Semoga beruntung ya.' }
      ]);
      triggerAudio('win');
    }
  }, [onlineStatus, searchTime, friendRoomCode, onlineRating]);

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
              let movedObj: any = null;
              if (data.moves && data.moves.length > 0) {
                const lastMoveStr = data.moves[data.moves.length - 1];
                const parts = lastMoveStr.split('-');
                if (parts.length === 2) {
                  const [from, to] = parts;
                  const legalMoves = chessRef.current.moves({ verbose: true });
                  const match = legalMoves.find((m: any) => m.from === from && m.to === to);
                  if (match) {
                    try {
                      movedObj = chessRef.current.move(match);
                    } catch (err) {
                      console.warn("Gagal memainkan langkah online terdeteksi:", err);
                    }
                  }
                }
              }

              if (!movedObj) {
                chessRef.current = new Chess(data.fen);
              }

              setBoard(chessRef.current.board());
              setSelectedSquare(null);

              if (chessRef.current.isCheckmate()) {
                triggerAudio('lose');
              } else if (chessRef.current.isCheck()) {
                triggerAudio('check');
              } else if (movedObj && movedObj.captured) {
                triggerAudio('capture');
              } else {
                triggerAudio('move');
              }

              setMoveHistory(prev => {
                const nextSan = movedObj ? movedObj.san : (data.moves ? data.moves[data.moves.length - 1] : '?');
                const currentHistory = [...prev, nextSan];
                const isOpening = currentHistory.length < 16;
                const isRepeated = prev.slice(-4).includes(nextSan);
                
                if (movedObj) {
                  const q = evaluateMoveQuality(movedObj, isOpening, isRepeated);
                  setLastMove({
                    from: movedObj.from,
                    to: movedObj.to,
                    type: q
                  });
                } else if (data.moves && data.moves.length > 0) {
                  const lastMoveStr = data.moves[data.moves.length - 1];
                  const parts = lastMoveStr.split('-');
                  setLastMove({
                    from: parts[0],
                    to: parts[1],
                    type: 'best'
                  });
                }
                return currentHistory;
              });

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
            
            if (data.winner && onlineStatus === 'playing') {
              const outcome = data.winner === onlinePlayerColor ? 'win' : (data.winner === 'draw' ? 'draw' : 'lose');
              finishOnlineGame(outcome);
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

            setMoveHistory(prev => {
              const currentHistory = [...prev, moveRes.san];
              const isOpening = currentHistory.length < 16;
              const isRepeated = prev.slice(-4).includes(moveRes.san);
              const q = evaluateMoveQuality(moveRes, isOpening, isRepeated);
              setLastMove({
                from: moveRes.from,
                to: moveRes.to,
                type: q
              });
              return currentHistory;
            });
            
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
            if (chatChance < 0.35) {
              let friendlyMsg = "";
              if (chess.isCheck()) {
                const checkChats = [
                  "Skakmat sudah dekat! Eh, ternyata cuma skak biasa ",
                  "Awas Rajamu terancam! Bisa hindari skak ini?",
                  "Skak! Hehehe, haruskah kamu menutup diagonal itu?",
                  "Ada celah taktis di sekitar sistem koordinat Rajamu!",
                  "Raja dalam bahaya! Silakan tangani terlebih dahulu ya."
                ];
                friendlyMsg = checkChats[Math.floor(Math.random() * checkChats.length)];
              } else if (moveRes.captured) {
                 const captureChats = [
                   "Nyam nyam, bidakmu enak sekali!",
                   "Terima kasih atas pertukaran bidaknya, kawan!",
                   "Waduh, bidak berharga barusan lepas dari pengawasanmu.",
                   "Satu bidak berhasil diamankan! Mari bersaing ketat.",
                   "Ah, pertukaran perwira yang sangat menarik!"
                 ];
                 friendlyMsg = captureChats[Math.floor(Math.random() * captureChats.length)];
              } else {
                 const defaultChats = [
                   "Langkah yang kokoh dari Anda!",
                   "Waduh, pertahanan menterimu tangguh sekali.",
                   "Hmm, haruskah saya rokade atau menyerang di sayap menteri?",
                   "Ini benar-benar pertandingan yang menakjubkan! Mantap",
                   "Permainan yang seru! Tetap berkonsentrasi ya.",
                   "Langkah taktis yang rapi, asli saya terkejut melihatnya.",
                   "Keren langkahmu! Saya harus berpikir cukup keras di giliran ini.",
                   "Hahaha pertarungan sengit! Semoga saya ga salah hitung petak.",
                   "Wah, seru sekali tensi permainan catur kita hari ini!",
                   "Langkah solid, pertahanan yang sangat kokoh kawan."
                 ];
                 friendlyMsg = defaultChats[Math.floor(Math.random() * defaultChats.length)];
              }
              setOnlineChats(prev => [
                ...prev,
                { sender: onlineOpponent.name, text: friendlyMsg, time: Date.now() }
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

  // Active match play-time tracking (for Feature 26 & Feature 27 premium playtime quest)
  useEffect(() => {
    let intervalId: any = null;

    const isPlayingActiveMatch = mode === 'play' || (mode === 'online-match' && onlineStatus === 'playing');

    if (isPlayingActiveMatch) {
      intervalId = setInterval(() => {
        setDailyQuests(prev => {
          const updated = prev.map(q => {
            if (q.id === 'qp_playtime') {
              const nextVal = q.current + 1;
              if (nextVal > 30) {
                // Award +1 diamond per minute beyond 30 minutes to SAVINGS Bank!
                setDiamondSavings(s => {
                  const nextS = Math.min(150, s + 1);
                  return nextS;
                });
                triggerAudio('win');
                triggerReward(0, "Bonus Playtime: +1 Berlian dimasukkan ke dalam Tabungan Diamond Anda!", 'success_no_xp');
              }
              return { ...q, current: nextVal };
            }
            return q;
          });
          localStorage.setItem('dailyQuests', JSON.stringify(updated));
          return updated;
        });
      }, 60000); // Ticks every 60 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode, onlineStatus]);

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
              setAiSpeech(`Aduh! Aku terlalu lama menghitung kalkulasi langkah hingga kehabisan waktu caturku. Selamat, kamu menang! `);
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
  const makeOnlineMove = async (from: string, to: string, promotionPiece?: string) => {
    const chess = chessRef.current;
    if (onlineStatus !== 'playing') return;

    // Check if promotion is needed and piece choice is not provided yet
    const moves = chess.moves({ verbose: true });
    const isPromo = moves.some(m => m.from === from && m.to === to && m.promotion);
    
    if (isPromo && !promotionPiece) {
      setPromotionPendingMove({ from, to, modeType: 'online' });
      return;
    }

    const finalPromotion = isPromo ? (promotionPiece || 'q') : undefined;

    try {
      const moveResult = chess.move({
        from,
        to,
        promotion: finalPromotion
      });

      setBoard(chess.board());
      setSelectedSquare(null);

      setMoveHistory(prev => {
        const currentHistory = [...prev, moveResult.san];
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
          "Santai saja, catur adalah harmoni pikiran. Hehe",
          "Hahaha, langkah perwiramu membuatku ketar-ketir.",
          "Semoga pemain terbaik yang sukses menggenggam trofi!",
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

    updateDailyQuestProgress('play', 1);
    if (outcome === 'win') {
      updateDailyQuestProgress('win', 1);
    }

    // FEATURE 35: CASUAL MATCH CHECK
    const isCasual = localStorage.getItem('casual_match_mode') === 'true';
    if (isCasual) {
      setOnlineEloChange(0);
      triggerAudio(outcome === 'win' ? 'win' : 'lose');
      triggerReward(20, `Pertandingan Kausal Selesai! Pertandingan ini dikonfigurasi tanpa kontribusi perubahan ELO atau statistik rating secara resmi.`, 'info');
      
      const currentPlayed = user ? (user.matchesPlayed || 0) : guestMatchesPlayed;
      setGuestMatchesPlayed(currentPlayed + 1);
      localStorage.setItem('guestMatchesPlayed', String(currentPlayed + 1));
      return;
    }

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
    setOnlineEloChange(eloChange);

    const nextElo = Math.max(400, onlineRating + eloChange);
    setOnlineRating(nextElo);
    localStorage.setItem('onlineRating', String(nextElo));

    const currentPlayed = user ? (user.matchesPlayed || 0) : guestMatchesPlayed;
    const currentWon = user ? (user.matchesWon || 0) : guestMatchesWon;
    
    const nextPlayed = currentPlayed + 1;
    const nextWon = currentWon + (outcome === 'win' ? 1 : 0);

    setGuestMatchesPlayed(nextPlayed);
    setGuestMatchesWon(nextWon);
    localStorage.setItem('guestMatchesPlayed', String(nextPlayed));
    localStorage.setItem('guestMatchesWon', String(nextWon));

    let xpEarned = 15;
    if (outcome === 'win') xpEarned = 35;
    const nextXp = xp + xpEarned;
    setXp(nextXp);
    localStorage.setItem('xp', String(nextXp));

    // Play matches gives direct diamonds to main wallet instead of savings
    const baseDiamondsEarned = outcome === 'win' ? 5 : 2;
    const passSavingsMult = passStatus === 'deluxe' ? 2.0 : (passStatus === 'premium' ? 1.5 : 1.0);
    const finalDiamondsEarned = Math.round(baseDiamondsEarned * passSavingsMult);
    setDiamonds(prev => {
      const nextD = prev + finalDiamondsEarned;
      localStorage.setItem('diamonds', String(nextD));
      return nextD;
    });
    triggerReward(0, `Hasil tanding: +${finalDiamondsEarned} Berlian langsung masuk ke saldo utama Anda!`, 'success_no_xp');

    if (user) {
      syncUserStats(nextElo, nextXp, unlockedThemes, nextPlayed, nextWon);
    }

    const newHistoryEntry = {
      id: onlineGameId || Math.random().toString(),
      opponent: onlineOpponent?.name || 'Lawan Anonim',
      opponentElo: onlineOpponent?.elo || 1200,
      outcome,
      eloDiff: eloChange,
      date: new Date().toLocaleDateString('id-ID'),
      movesCount: chessRef.current.history().length,
      moves: chessRef.current.history()
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

  // --- RENDER HIGH-CONTRAST CHESS.COM INSPIRED VALUE BADGES ---
  const getEvaluationBadge = (type: string, className: string = "w-6 h-6 shadow-md") => {
    switch (type) {
      case 'brilliant':
        return (
          <div className={`relative flex items-center justify-center rounded-full bg-cyan-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Brilian!! (Langkah Luar Biasa)">
            <code className="absolute inset-x-0 inset-y-0 rounded-full animate-ping bg-cyan-400 opacity-60 pointer-events-none" />
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[84%] h-[84%]" strokeWidth="0">
              <path d="M12 2L4.5 12 12 22l7.5-10L12 2z" />
            </svg>
          </div>
        );
      case 'great':
        return (
          <div className={`flex items-center justify-center rounded-full bg-blue-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Hebat! (Langkah Sangat Bagus)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[66%] h-[66%] stroke-white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'best':
        return (
          <div className={`flex items-center justify-center rounded-full bg-[#81b64c] text-white font-extrabold shrink-0 select-none ${className}`} title="Terbaik! (Sesuai Komputer)">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-[70%] h-[70%] text-white">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        );
      case 'excellent':
        return (
          <div className={`flex items-center justify-center rounded-full bg-teal-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Sangat Baik">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[64%] h-[64%] stroke-white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'good':
        return (
          <div className={`flex items-center justify-center rounded-full bg-sky-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Baik">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[64%] h-[64%] stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'book':
        return (
          <div className={`flex items-center justify-center rounded-full bg-amber-600 text-white font-extrabold shrink-0 select-none ${className}`} title="Teori Buku">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[64%] h-[64%] stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5V15a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4.5M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14.5" />
            </svg>
          </div>
        );
      case 'inaccuracy':
        return (
          <div className={`flex items-center justify-center rounded-full bg-zinc-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Inakurasi (?!)">
            <span className="text-[14px] font-sans font-black leading-none">?!</span>
          </div>
        );
      case 'mistake':
        return (
          <div className={`flex items-center justify-center rounded-full bg-orange-500 text-white font-extrabold shrink-0 select-none ${className}`} title="Kesalahan (?)">
            <span className="text-[14px] font-sans font-black leading-none">?</span>
          </div>
        );
      case 'blunder':
        return (
          <div className={`relative flex items-center justify-center rounded-full bg-red-650 text-white font-extrabold shrink-0 select-none ${className}`} title="Blunder Fatal (??)!!">
            <code className="absolute inset-x-0 inset-y-0 rounded-full animate-pulse bg-red-500 opacity-60 pointer-events-none" />
            <span className="text-[13px] font-sans font-black leading-none tracking-tighter relative z-10">??</span>
          </div>
        );
      default:
        return null;
    }
  };

  // --- DRAG & DROP EVENT IMPLEMENTATIONS ---
  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (isAiThinking || gameResult || onlineGameResult) return;
    const piece = chessRef.current.get(square as any);
    const turn = chessRef.current.turn();
    
    // Check turn constraints based on active Mode
    const allowedColor = (mode === 'local-friend' || mode === 'puzzles' || mode === 'lessons')
      ? turn
      : (mode === 'online-match' ? onlinePlayerColor : 'w');

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
  const triggerReward = (
    amount: number, 
    message: string, 
    type: 'reward' | 'premium' | 'info' | 'success_no_xp' | 'level_up' = 'reward'
  ) => {
    setXp(prev => prev + amount);
    setRewardAmount(amount);
    setRewardMessage(message);
    setRewardType(type);
    setShowRewardModal(true);
    if (type === 'premium' || type === 'info') {
      triggerAudio('error');
    } else {
      triggerAudio('win');
    }
    if (amount > 0) {
      const userScope = username.trim().toLowerCase();
      const todayStr = new Date().toLocaleDateString('en-CA');
      const lastStreakDate = localStorage.getItem(`lastStreakDate:${userScope}`);
      if (!lastStreakDate) {
        setStreak(1);
        localStorage.setItem(`streak:${userScope}`, '1');
        localStorage.setItem(`lastStreakDate:${userScope}`, todayStr);
      } else {
        const lastDate = new Date(lastStreakDate + 'T00:00:00');
        const todayDate = new Date(todayStr + 'T00:00:00');
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Played on consecutive day!
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem(`streak:${userScope}`, String(newStreak));
          localStorage.setItem(`lastStreakDate:${userScope}`, todayStr);
        } else if (diffDays > 1) {
          // Missed one or more days, start new streak from 1
          setStreak(1);
          localStorage.setItem(`streak:${userScope}`, '1');
          localStorage.setItem(`lastStreakDate:${userScope}`, todayStr);
        } else if (diffDays === 0) {
          // Already played today, maintain streak (if streak was 0, initialize to 1)
          if (streak === 0) {
            setStreak(1);
            localStorage.setItem(`streak:${userScope}`, '1');
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
    setAnalysisHistory([]);
  };

  // Activates a selected Character to play against
  const handleSelectCharacter = (char: Character) => {
    if ((char.id === 'wally' || char.id === 'magnus') && membershipStatus !== 'premium') {
      triggerReward(0, `Aduh! Bermain melawan bot legendaris (${char.name}) adalah fitur Premium! Silakan tingkatkan ke Akun Premium di menu Toko.`, 'premium');
      setMode('store');
      return;
    }
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

  // Local backup phrases when Gemini Proxy is offline, quota limited, or error occurs
  const localFallbacks: Record<string, string[]> = {
    martin: [
      "Halo! Langkah yang keren, semoga saya tidak berbuat blunder di giliran ini!",
      "Wah, bidakmu melangkah maju dengan gagah berani! Menarik sekali!",
      "Aduh, kepalaku agak pening memikirkan langkah selanjutnya. Hahaha!",
      "Langkah hebat! Saya terus termotivasi belajar catur bersamamu.",
      "Halo kawan! Aduh maaf banget ya kalau saya ga sengaja makan bidakmu barusan.",
      "Eh, pion kamu maju kencang sekali ya! Saya jadi agak ngeri wkwk.",
      "Permainan yang seru! Tetap berkonsentrasi ya, jangan sampai lengah.",
      "Langkah yang sangat cerdas! Saya harus banyak belajar dari caramu berpikir.",
      "Hehehe, bagaimana kalau saya taruh kuda saya di sini? Keren kan?",
      "Aduh sorry banget, tadi saya ketiduran bentar pas mikir langkah, peace! Sip",
      "Wah wah, petak tengahnya kok jadi ramai sekali ya? Seru banget!",
      "Langkah yang solid kawan! Semoga pertarungan kita berakhir damai wkwk.",
      "Duh menteri saya kesepian nih, boleh jalan-jalan ke tempatmu ga? Senang",
      "Keren! Kamu beneran jago ya, saya jadi makin semangat mainnya!"
    ],
    nelson: [
      "Ratu saya siap menyerbu! Pertahankan pertahanan Rajamu!",
      "Langkahmu cukup solid, tapi waspadalah terhadap serangan cepat dari sayap!",
      "Jangan biarkan pertahananmu berlubang sekarang. Ratu saya mengincar celah itu!",
      "Oke, mari kita lihat seberapa jauh kamu bisa menghalau gempuranku!",
      "Hahaha, rasakan gempuran menteri saya! Kena mental ga tuh?",
      "Pertahanan yang lumayan, tapi apakah cukup kuat menahan badai sayap raja menteri?",
      "Ayo dong, lebih agresif lagi mainnya! Massa kalah galak sama pion saya wkwk.",
      "Jangan cuma bertahan saja, serang balik kalau berani! Saya tunggu nih.",
      "Waduh waduh, ratu saya mulai lapar, bidak mana lagi yang mau dikorbankan?",
      "Taktikmu terbaca dengan mudah! Mari kita percepat tempo serangannya!",
      "Awas! Sayap kananmu bolong melompong bagai jalan tol tanpa hambatan!",
      "Gas terus! Tak ada kata mundur dalam kamus catur agresif saya!",
      "Coba lindungi rajamu baik-baik sebelum terlambat. Ratu saya sudah membidik helikopter!",
      "Pertarungan yang membengis! Ini baru namanya catur ekstrem penuh aksi!",
      "Langkah bagus! Tapi serangan bertubi-tubi saya baru saja dimulai!"
    ],
    wally: [
      "Langkah solid mengamankan jalur tengah. Sederhana tapi krusial, kawan.",
      "Sebuah taktik posisi yang sangat matang. Filosofi catur terletak pada kesabaran.",
      "Rokade cepat adalah pondasi raja yang kokoh. Teruskan pertahanan solidmu.",
      "Hmm, formasi pionmu menyerupai benteng yang kokoh. Sangat mengesankan.",
      "Catur itu seperti nyeduh kopi hitam hangat di pagi hari, butuh ketenangan beralur.",
      "Langkah yang tenang dan penuh perhitungan. Saya sangat menyukai gaya mainmu.",
      "Sebuah perwira diletakkan di sana... Ah, ingatan saya jadi melayang ke masa muda dulu.",
      "Sabar kawan, jangan terburu-buru menyerang. Nikmati harmoni setiap bidak di papan.",
      "Satu blunder kecil di pembukaan bisa merusak keindahan susunan taktis akhir.",
      "Formasi bentengmu sangat rapi. Sungguh bapak suka pertahanan sekokoh beton ini.",
      "Tahu tidak kenapa kuda jalannya L? Biar jalannya berliku penuh makna kehidupan, hehe.",
      "Mari pertahankan keunggulan posisi dengan konsisten. Pertahanan adalah seni utama.",
      "Langkah matang yang sarat akan pengalaman strategis posisi. Hebat sekali!",
      "Jangan biarkan emosi mengendalikan bidakmu. Tetap dingin dan kuasai petak pusat.",
      "Taktik klasik yang sangat indah dipertontonkan hari ini. Teruskan pertahananmu!"
    ],
    magnus: [
      "Langkah pembukaan yang sesuai teori dasar. Menarik melihat transisimu.",
      "Celah taktis yang kecil bisa mengubah hasil akhir permainan dalam sekejap.",
      "Keunggulan ruang akan menentukan efisiensi pergerakan perwira utama.",
      "Bagus, perlihatkan pemahaman posisi terbaikmu di atas papan ini.",
      "Akurasi langkahmu lumayan tinggi di fase ini, tapi mari uji taktik endgame-mu.",
      "Struktur pion Anda sedikit melemah di sayap menteri. Bisakah Anda menyadarinya?",
      "Menarik. Langkah itu di luar dugaan mesin, tapi secara praktis cukup merepotkan.",
      "Catur tingkat tinggi ditentukan oleh penguasaan ruang mikro di setiap petak.",
      "Saya melihat tiga langkah di depan. Apakah Anda sudah mempersiapkan counter-nya?",
      "Menjaga inisiatif penyerangan adalah kunci mutlak untuk memenangkan duel ini.",
      "Pertukaran menteri di fase ini mungkin menguntungkan struktur endgame saya.",
      "Saya mendeteksi kelemahan dinamis di diagonal petak gelap pertahanan Anda.",
      "Jangan biarkan perwira minor Anda tidak aktif dalam posisi tertutup seperti ini.",
      "Evaluasi posisi saat ini menunjukkan keunggulan kecil di sisi taktis saya.",
      "Pertunjukan kemampuan yang solid. Mari kita lihat bagaimana kelanjutannya."
    ]
  };

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
      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          setAiSpeech(data.text);
          return;
        }
      }
      throw new Error("HTTP error or empty response");
    } catch (err) {
      console.warn('Gagal memanggil Gemini Commentary API, menggunakan fallback lokal:', err);
      
      const list = localFallbacks[char.id] || ["Langkah luar biasa! Mari lanjutkan permainan!"];
      const pMove = playerMove || "";
      const aMove = aiMove || "";

      // Client-side rule checker for context
      const isTemplateAppropriate = (template: string, aiMoveStr: string, playerMoveStr: string) => {
        const norm = template.toLowerCase();
        if (norm.includes("menteri") || norm.includes("ratu")) {
          return aiMoveStr.includes("Q") || playerMoveStr.includes("Q");
        }
        if (norm.includes("kuda")) {
          return aiMoveStr.includes("N") || playerMoveStr.includes("N");
        }
        if (norm.includes("gajah")) {
          return aiMoveStr.includes("B") || playerMoveStr.includes("B");
        }
        if (norm.includes("benteng")) {
          return aiMoveStr.includes("R") || playerMoveStr.includes("R");
        }
        if (norm.includes("pion")) {
          return /^[a-h]/.test(aiMoveStr) || /^[a-h]/.test(playerMoveStr);
        }
        return true;
      };

      let appropriateList = list.filter(t => isTemplateAppropriate(t, aMove, pMove));
      if (appropriateList.length === 0) {
        appropriateList = list.filter(t => {
          const norm = t.toLowerCase();
          return !norm.includes("menteri") && !norm.includes("ratu") && !norm.includes("kuda") && !norm.includes("gajah") && !norm.includes("benteng") && !norm.includes("pion");
        });
      }
      if (appropriateList.length === 0) {
        appropriateList = list;
      }

      const randomIndex = Math.floor(Math.random() * appropriateList.length);
      setAiSpeech(appropriateList[randomIndex]);
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

            // Log AI move details inside analysis history
            setAnalysisHistory(aprev => [
              ...aprev,
              {
                fen: chess.fen(),
                san: result.san,
                from: result.from,
                to: result.to,
                type: q as any,
                color: result.color as any
              }
            ]);

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
  const makeMove = async (from: string, to: string, promotionPiece?: string) => {
    const chess = chessRef.current;
    
    // Guard game state
    if (gameResult) return;

    // Check if promotion is needed and piece choice is not provided yet
    const moves = chess.moves({ verbose: true });
    const isPromo = moves.some(m => m.from === from && m.to === to && m.promotion);
    
    if (isPromo && !promotionPiece) {
      setPromotionPendingMove({ from, to, modeType: mode === 'local-friend' ? 'friend' : 'play' });
      return;
    }

    const finalPromotion = isPromo ? (promotionPiece || 'q') : undefined;

    try {
      // Create user move
      const moveResult = chess.move({
        from,
        to,
        promotion: finalPromotion
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

        // Log player move details inside analysis history
        setAnalysisHistory(aprev => [
          ...aprev,
          {
            fen: chess.fen(),
            san: moveResult.san,
            from: moveResult.from,
            to: moveResult.to,
            type: q as any,
            color: moveResult.color as any
          }
        ]);

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
          if (piece && piece.color === chess.turn()) {
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
        if (piece && piece.color === chess.turn()) {
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
          if (piece && piece.color === chess.turn()) {
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
        if (piece && piece.color === chess.turn()) {
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

    // Mode: Local Friend (Pass & Play)
    if (mode === 'local-friend') {
      const activeColor = chess.turn();
      if (selectedSquare) {
        if (validMoves.includes(square)) {
          makeMove(selectedSquare, square);
        } else {
          const piece = chess.get(square as any);
          if (piece && piece.color === activeColor) {
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
        if (piece && piece.color === activeColor) {
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

  // Calculation of captured pieces and their numerical points worth under chess rules
  const getCapturedPieces = () => {
    const startCounts = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
    };

    const currentCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    // Count currently alive pieces on board
    if (board && Array.isArray(board)) {
      for (let r = 0; r < 8; r++) {
        const rowArr = board[r];
        if (rowArr && Array.isArray(rowArr)) {
          for (let c = 0; c < 8; c++) {
            const piece = rowArr[c];
            if (piece && piece.color && piece.type) {
              const color = piece.color as 'w' | 'b';
              const type = piece.type as 'p' | 'n' | 'b' | 'r' | 'q';
              if (currentCounts[color] && type in currentCounts[color]) {
                currentCounts[color][type]++;
              }
            }
          }
        }
      }
    }

    const pieceLabels: Record<string, { name: string; value: number }> = {
      p: { name: 'Pion', value: 1 },
      n: { name: 'Kuda', value: 3 },
      b: { name: 'Gajah', value: 3 },
      r: { name: 'Benteng', value: 5 },
      q: { name: 'Ratu', value: 9 }
    };

    const capturedByWhite: { type: string; label: string; value: number; count: number }[] = [];
    Object.keys(startCounts.b).forEach((key) => {
      const type = key as 'p' | 'n' | 'b' | 'r' | 'q';
      const diff = startCounts.b[type] - currentCounts.b[type];
      if (diff > 0) {
        capturedByWhite.push({
          type,
          label: pieceLabels[type].name,
          value: pieceLabels[type].value,
          count: diff
        });
      }
    });

    const capturedByBlack: { type: string; label: string; value: number; count: number }[] = [];
    Object.keys(startCounts.w).forEach((key) => {
      const type = key as 'p' | 'n' | 'b' | 'r' | 'q';
      const diff = startCounts.w[type] - currentCounts.w[type];
      if (diff > 0) {
        capturedByBlack.push({
          type,
          label: pieceLabels[type].name,
          value: pieceLabels[type].value,
          count: diff
        });
      }
    });

    return { capturedByWhite, capturedByBlack };
  };

  const renderCapturedList = (list: { type: string; label: string; value: number; count: number }[], pieceColor: 'w' | 'b') => {
    if (list.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 bg-[#262421]/90 border border-[#3c3934] rounded-xl w-full max-w-[500px] mt-1 mb-1">
        <span className="text-[9px] font-extrabold tracking-wide uppercase text-slate-400">
          Tertangkap ({pieceColor === 'w' ? 'Bidak Putih' : 'Bidak Hitam'}):
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {list.map((item) => (
            <span 
              key={item.type} 
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-lg border shadow-xs leading-none uppercase ${
                pieceColor === 'w'
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-neutral-900 text-slate-200 border-neutral-700/80'
              }`}
            >
              {item.label} {item.count > 1 ? `x${item.count}` : ''}
              <span className="text-[#81b64c] font-black text-[9px] ml-0.5">
                +{item.value * item.count}p
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Integrated, fully responsive Chess Board component supporting drag and drop
  const renderChessboard = (clickHandler: (sq: string) => void = handleSquareClick) => {
    const highlightSquares = (mode === 'lessons' && activeLesson) 
      ? activeLesson.steps[lessonStepIndex]?.highlightSquares || [] 
      : [];

    return (
      <div className="relative w-full aspect-square">
        <div id="unified-chessboard-grid" className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-2xl overflow-hidden border-2 border-black/40 shadow-inner">
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
                      <ChessPiece type={piece.type} color={piece.color} skin={selectedSkin} />
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
                      {lastMove.type === 'book' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[66%] h-[66%] stroke-white animate-pulse" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      ) : (
                        EVALUATION_LABELS[lastMove.type]?.icon || '•'
                      )}
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

        {/* Promotion choices absolute overlay */}
        {promotionPendingMove && (promotionPendingMove.modeType === 'play' || promotionPendingMove.modeType === 'online') && (
          <div className="absolute inset-0 bg-[#262421]/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 text-center rounded-2xl">
            <span className="text-white text-xs font-black uppercase tracking-wider mb-3 flex items-center justify-center gap-1 font-sans">
              <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/10" /> Pilih Promosi Bidak Catur
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { type: 'q', label: 'Ratu' },
                { type: 'r', label: 'Benteng' },
                { type: 'b', label: 'Gajah' },
                { type: 'n', label: 'Kuda' }
              ].map((p) => (
                <button
                  key={p.type}
                  onClick={() => {
                    const { from, to, modeType } = promotionPendingMove;
                    setPromotionPendingMove(null);
                    if (modeType === 'play' || modeType === 'friend') {
                      makeMove(from, to, p.type);
                    } else if (modeType === 'online') {
                      makeOnlineMove(from, to, p.type);
                    }
                    triggerAudio('win');
                  }}
                  className="bg-[#312e2b] hover:bg-[#81b64c] border border-[#4d4a44] p-2.5 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 text-white hover:scale-105"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <ChessPiece type={p.type as any} color={chessRef.current.turn()} skin={selectedSkin} />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-300 capitalize">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setPromotionPendingMove(null);
                setSelectedSquare(null);
              }}
              className="mt-4 text-[9px] uppercase font-bold text-red-400 hover:text-red-300 tracking-wider cursor-pointer transition-colors"
            >
              Batalkan Langkah
            </button>
          </div>
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
        setAiSpeech(`Cobalah jalankan bidakmu dari kotak ${hintMove.from.toUpperCase()} ke ${hintMove.to.toUpperCase()}! Pasti manjur!`);
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
          updateDailyQuestProgress('puzzle', 1);
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
      triggerReward(0, "Aduh! Nyawamu habis. Ke Toko dulu untuk membeli nyawa!", 'info');
      return;
    }
    setActivePuzzle(p);
    setPuzzleMovesPlayed(0);
    setPuzzleStatus('playing');
    setShowPuzzleHint(false);
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
      { id: 'fs_sack', name: 'Kantung Hasil Pekan Diamond', originalCost: 150, discountedCost: 45, currency: 'diamonds', rewardType: 'diamond_sack', desc: 'Bypass brankas untuk mencairkan +50 Berlian tambahan secara gratis!' },
      { id: 'fs_gold', name: 'Brankas Koin Kemakmuran Jumat', originalCost: 100, discountedCost: 30, currency: 'diamonds', rewardType: 'gold_heavy', desc: 'Buka brankas koin darurat: Dapatkan +1200 Koin Tabunan instan!' },
      { id: 'fs_gm', name: 'Piala Gelar Grandmaster', originalCost: 120, discountedCost: 35, currency: 'diamonds', rewardType: 'title_gm', desc: 'Sematkan gelar kehormatan "Grandmaster" permanen pada kartu profil!' }
    ];

    const actUser = localStorage.getItem('user') || 'User';
    const seed = actUser.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
    const actUser = localStorage.getItem('user') || 'User';
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
      triggerReward(150, 'Pembelian Berhasil! Anda mendapat +150 XP tambahan!', 'reward');
    } else if (deal.rewardType === 'frame_magma' || deal.rewardType === 'frame_cosmic') {
      const frameId = deal.rewardType === 'frame_magma' ? 'magma' : 'cosmic';
      setUnlockedFrames(prev => {
        const next = prev.includes(frameId) ? prev : [...prev, frameId];
        localStorage.setItem('unlockedFrames', JSON.stringify(next));
        localStorage.setItem('unlockedFrames:' + actUser.trim().toLowerCase(), JSON.stringify(next));
        return next;
      });
      triggerReward(0, `Pembelian Berhasil! Bingkai "${frameId === 'magma' ? 'Lava Vulkanik' : 'Nebula Kosmik'}" berhasil dibeli! Silakan cek di profil Anda.`, 'success_no_xp');
    } else if (deal.rewardType === 'board_ice') {
      setUnlockedThemes(prev => {
        const next = prev.includes('ice_freeze') ? prev : [...prev, 'ice_freeze'];
        localStorage.setItem('unlockedThemes', JSON.stringify(next));
        return next;
      });
      triggerReward(0, 'Pembelian Berhasil! Tema papan "Es Antartika" berhasil dipasang di menu pengaturan papan!', 'success_no_xp');
    } else if (deal.rewardType === 'piece_royal') {
      setUnlockedSkins(prev => {
        const next = prev.includes('royal') ? prev : [...prev, 'royal'];
        localStorage.setItem('unlockedSkins', JSON.stringify(next));
        localStorage.setItem('unlockedSkins:' + actUser.trim().toLowerCase(), JSON.stringify(next));
        return next;
      });
      triggerReward(0, 'Pembelian Berhasil! Tampilan bidak kustom "Ksatria Kerajaan" berhasil dibuka!', 'success_no_xp');
    } else if (deal.rewardType === 'diamond_sack') {
      setDiamonds(d => d + 50);
      triggerReward(0, 'Tarik Berhasil! Karung Koin dibuka, +50 Berlian berhasil masuk ke saldo!', 'success_no_xp');
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
      triggerReward(0, 'Pembelian Berhasil! Gelar elit "Grandmaster" Anda sekarang siap dipasang!', 'success_no_xp');
    }

    const nextDeals = flashDeals.filter(d => d.id !== deal.id);
    setFlashDeals(nextDeals);
    localStorage.setItem('personalized_flash_deals', JSON.stringify(nextDeals));
    triggerAudio('win');
  };

  // cosmetic theme shop purchasing
  const buyTheme = (theme: PurchaseableTheme) => {
    const costType = theme.id === 'cosmic' ? 'diamond' : 'coin';
    const costValue = theme.id === 'cosmic' ? 30 : 150;
    
    if (costType === 'coin') {
      if (coins >= costValue) {
        setCoins(prev => prev - costValue);
        setUnlockedThemes(prev => [...prev, theme.id]);
        setBoardTheme(theme.id);
        triggerAudio('win');
        triggerReward(0, `Tema "${theme.name}" berhasil dibeli seharga ${costValue} Koin!`, 'success_no_xp');
      } else {
        triggerAudio('error');
        triggerReward(0, `Koin tidak cukup! Membutuhkan ${costValue} Koin.`, 'info');
      }
    } else {
      if (diamonds >= costValue) {
        setDiamonds(prev => prev - costValue);
        setUnlockedThemes(prev => [...prev, theme.id]);
        setBoardTheme(theme.id);
        triggerAudio('win');
        triggerReward(0, `Tema "${theme.name}" berhasil dibeli seharga ${costValue} Berlian!`, 'success_no_xp');
      } else {
        triggerAudio('error');
        triggerReward(0, `Berlian tidak cukup! Membutuhkan ${costValue} Berlian.`, 'info');
      }
    }
  };

  // Refilling hearts
  const buyHeartRefill = () => {
    if (coins >= 50) {
      setCoins(prev => prev - 50);
      setHearts(5);
      triggerAudio('win');
      triggerReward(0, "Stamina Analisis berhasil diisi ulang menjadi penuh seharga 50 Koin!", 'success_no_xp');
    } else {
      triggerAudio('error');
      triggerReward(0, "Koin tidak cukup untuk membeli isi ulang stamina (50 Koin)!", 'info');
    }
  };

  const claimLevelUpReward = (lvl: number) => {
    const reward = LEVEL_REWARDS.find(r => r.level === lvl);
    if (!reward) return;
    
    if (claimedLevelRewards.includes(lvl)) {
      triggerAudio('error');
      triggerReward(0, `Hadiah Level ${lvl} telah diklaim sebelumnya!`, 'info');
      return;
    }
    
    const currentLevel = Math.floor(xp / 100) + 1;
    if (currentLevel < lvl) {
      triggerAudio('error');
      triggerReward(0, `Eits, level Anda belum melampaui Level ${lvl}! Terus dapatkan XP dengan bermain catur.`, 'info');
      return;
    }
    
    // Add currencies
    const nextCoins = coins + reward.coins;
    const nextDiamonds = diamonds + reward.diamonds;
    setCoins(nextCoins);
    setDiamonds(nextDiamonds);
    localStorage.setItem('coins', String(nextCoins));
    localStorage.setItem('diamonds', String(nextDiamonds));
    
    // Auto sync user metrics
    if (user) {
      syncUserStats(onlineRating, xp, unlockedThemes);
    }
    
    // Check if frame exists as reward
    let giftMsg = '';
    if (reward.frameReward) {
      if (!unlockedFrames.includes(reward.frameReward)) {
        const nextFrames = [...unlockedFrames, reward.frameReward];
        setUnlockedFrames(nextFrames);
        const userScope = username.trim().toLowerCase();
        localStorage.setItem(`unlockedFrames:${userScope}`, JSON.stringify(nextFrames));
      }
      giftMsg = ` & ${reward.otherGift}`;
    }
    
    const nextClaimed = [...claimedLevelRewards, lvl];
    setClaimedLevelRewards(nextClaimed);
    const userKey = username.trim().toLowerCase();
    localStorage.setItem(`claimedLevelRewards:${userKey}`, JSON.stringify(nextClaimed));
    
    triggerAudio('win');
    triggerReward(0, `Selamat! Hadiah Naik Level ${lvl} diklaim: +${reward.coins} Koin, +${reward.diamonds} Berlian${giftMsg}!`, 'success_no_xp');
  };

  const buyAvatarFrame = (frame: AvatarFrame) => {
    if (unlockedFrames.includes(frame.id)) return;

    if (frame.isPremiumExclusive) {
      triggerAudio('error');
      triggerReward(0, "Bingkai ini khusus untuk Member Premium! Aktifkan keanggotaan Premium di Toko.", 'info');
      return;
    }

    if (frame.costType === 'coin' && coins < frame.cost) {
      triggerAudio('error');
      triggerReward(0, "Coin Anda tidak cukup untuk membeli bingkai ini!", 'info');
      return;
    } else if (frame.costType === 'diamond' && diamonds < frame.cost) {
      triggerAudio('error');
      triggerReward(0, "Berlian Anda tidak cukup untuk membeli bingkai ini!", 'info');
      return;
    }

    if (frame.costType === 'coin') {
      const next = coins - frame.cost;
      setCoins(next);
      localStorage.setItem('coins', String(next));
    } else if (frame.costType === 'diamond') {
      const next = diamonds - frame.cost;
      setDiamonds(next);
      localStorage.setItem('diamonds', String(next));
    }

    setUnlockedFrames(prev => {
      const next = [...prev, frame.id];
      const userScope = username.trim().toLowerCase();
      localStorage.setItem(`unlockedFrames:${userScope}`, JSON.stringify(next));
      return next;
    });

    triggerAudio('win');
    triggerReward(0, `Bingkai "${frame.name}" sukses dibeli! Pasang sekarang di menu Profil Anda.`, 'success_no_xp');
  };

  const equipAvatarFrame = (frameId: string) => {
    const isPremium = membershipStatus === 'premium';
    const frame = AVATAR_FRAMES.find(f => f.id === frameId);
    
    if (frame?.isPremiumExclusive && !isPremium) {
      triggerAudio('error');
      triggerReward(0, "Bingkai ini eksklusif untuk Anggota Premium Elite! Silakan tingkatkan akun Anda di Toko.", 'info');
      return;
    }

    const isUnlocked = unlockedFrames.includes(frameId) || frameId === 'none' || (isPremium && frame?.isPremiumExclusive);
    
    if (!isUnlocked) return;

    setSelectedFrame(frameId);
    triggerAudio('move');
  };

  // Daily login reward claiming
  const handleClaimDailyReward = () => {
    const today = serverDate;
    
    // Custom daily gifts & XP
    // Day 1: i=0, Day 2: i=1, Day 3: i=2, etc.
    const rewards = [
      { xp: 10, bonusxp: 0, refill: false, premiumDays: 0, desc: "XP Standar" },
      { xp: 15, bonusxp: 0, refill: true, premiumDays: 0, desc: "XP Standar dan Pemulihan Nyawa" },
      { xp: 20, bonusxp: 0, refill: false, premiumDays: 3, desc: "XP Standar dan Premium Gratis 3 Hari" },
      { xp: 25, bonusxp: 100, refill: false, premiumDays: 0, desc: "Bonus Absensi Spesial" },
      { xp: 30, bonusxp: 0, refill: true, premiumDays: 0, desc: "XP Standar dan Pemulihan Nyawa" },
      { xp: 40, bonusxp: 150, refill: false, premiumDays: 0, desc: "Bonus XP Hebat" },
      { xp: 50, bonusxp: 0, refill: false, premiumDays: 7, desc: "XP Standar dan Premium Gratis 7 Hari" },
    ];
    
    const reward = rewards[dailyIndex];
    
    // Feature 38: Streak Bonus - consecutive login rewards scale up
    // Granting 10 XP and 25 Coins per streak day
    const streakBonusXp = streak * 10;
    const streakBonusCoins = streak * 25;
    const totalXpGain = reward.xp + (reward.bonusxp || 0) + streakBonusXp;

    // Apply XP
    setXp(prev => {
      const nextXp = prev + totalXpGain;
      localStorage.setItem('xp', String(nextXp));
      if (user) {
        syncUserStats(onlineRating, nextXp, unlockedThemes);
      }
      return nextXp;
    });

    // Apply Coins
    if (streakBonusCoins > 0) {
      setCoins(prevCoins => {
        const nextCoins = prevCoins + streakBonusCoins;
        localStorage.setItem('coins', String(nextCoins));
        return nextCoins;
      });
    }

    // Apply heart refill if any
    if (reward.refill) {
      setHearts(5);
      localStorage.setItem('hearts', '5');
    }

    // Apply premium days if any
    if (reward.premiumDays > 0) {
      setMembershipStatus('premium');
      localStorage.setItem('membershipStatus', 'premium');
    }

    // Advance streak track index and save
    const userScope = username.trim().toLowerCase();
    const nextIndex = (dailyIndex + 1) >= 7 ? 0 : dailyIndex + 1;
    setDailyIndex(nextIndex);
    localStorage.setItem('dailyIndex', String(nextIndex));
    localStorage.setItem(`dailyIndex:${userScope}`, String(nextIndex));
    setDailyClaimed(true);
    localStorage.setItem('lastClaimDate', today);
    localStorage.setItem(`lastClaimDate:${userScope}`, today);
    triggerAudio('win');
    
    triggerReward(
      totalXpGain, 
      `Absensi Hari ke-${dailyIndex + 1} Berhasil Di-klaim! Mendapatkan: ${reward.desc}. Ditambah Bonus Streak Beruntun (${streak} Hari): +${streakBonusXp} XP dan +${streakBonusCoins} Coin!`
    );
  };

  const activeThemeConfig = THEMES.find(t => t.id === boardTheme) || THEMES[0];

  return (
    <div className="min-h-screen bg-[#262421] text-[#bab9b8] flex flex-col font-sans selection:bg-emerald-950 antialiased">
      {/* HUD HEADER/TOP STATUS BAR (NATURAL TONES STYLED PANEL) */}
      <nav id="hud-nav" className="sticky top-0 z-40 bg-[#312e2b] border-b border-[#3c3934] px-2 py-2 sm:px-6 sm:py-4 shadow-md select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          
          {/* Main Brand with Left alignment & Profile End alignment on mobile */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div onClick={() => setMode('menu')} className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group min-w-0 shrink-0">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[#81b64c] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 22H5v-2h14v2M17 10c0-1.35-.83-2.5-2-3c0-2-2-4-3-4s-3 2-3 4c-1.17.5-2 1.65-2 3c0 1.35.83 2.5 2 3h6c1.17-.5 2-1.35 2-3M18 18H6v-3h12v3m-7-3v-2h2v2h-2z" />
              </svg>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-lg md:text-xl font-black tracking-tight text-white group-hover:text-[#81b64c] transition-colors uppercase whitespace-nowrap">
                  Catur<span className="text-[#81b64c]"> Nopal</span>
                </h1>
                <p className="text-[9px] font-mono font-bold tracking-wider text-[#9babaf] uppercase hidden sm:block">Arena Catur & Taktik Premium</p>
              </div>
            </div>

            {/* Compact Profile Actions on Mobile right (avoids overflow) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {/* Sound icon button */}
              <button
                onClick={() => {
                  const updated = !soundEnabled;
                  setSoundEnabled(updated);
                  localStorage.setItem('sound', String(updated));
                  if (updated) playSound('move');
                }}
                className="p-1 px-1.5 bg-[#262421] border border-[#3c3934] text-[#9babaf] hover:text-white rounded-lg cursor-pointer transition-colors shrink-0"
                title={soundEnabled ? "Matikan suara" : "Aktifkan suara"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-500" />}
              </button>

              {/* Login / Profile on mobile */}
              {user ? (
                <div className="flex items-center gap-1 pl-1 border-l border-[#3c3934] shrink-0">
                  <div 
                    onClick={() => { setShowProfileModal(true); triggerAudio('move'); }} 
                    className="cursor-pointer hover:scale-105 active:scale-95 transition-all p-0.5 bg-[#262421] border border-[#3c3934] rounded-full"
                    title="Lihat Profil"
                  >
                    <AvatarWithFrame 
                      src={user.profileAvatar || martinAvatar} 
                      frameId={selectedFrame} 
                      size="xs" 
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      localStorage.removeItem('user');
                      setOnlineRating(400);
                      localStorage.setItem('onlineRating', '400');
                      setXp(0);
                      localStorage.setItem('xp', '0');
                      setUnlockedThemes(['classic']);
                      localStorage.setItem('unlockedThemes', JSON.stringify(['classic']));
                      setGuestMatchesPlayed(0);
                      localStorage.setItem('guestMatchesPlayed', '0');
                      setGuestMatchesWon(0);
                      localStorage.setItem('guestMatchesWon', '0');
                      setProfileEditingBio('Pecatur sejati pantang menyerah!');
                      setClaimedAchievements([]);
                      setMembershipStatus('free');
                      localStorage.setItem('membershipStatus', 'free');

                      const prevName = `Pecatur_${Math.random().toString(36).substring(2,6).toUpperCase()}`;
                      setUsername(prevName);
                      localStorage.setItem('username', prevName);
                      loadUserScopedStats(prevName);
                      triggerAudio('lose');
                    }}
                    className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg cursor-pointer transition-colors shrink-0"
                    title="Keluar"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthError('');
                    setShowAuthModal(true);
                    triggerAudio('move');
                  }}
                  className="px-2 py-1 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
              )}

              {/* Hamburger Menu on Mobile */}
              <button
                onClick={() => {
                  setIsNavDrawerOpen(true);
                  triggerAudio('move');
                }}
                className="p-1 px-1.5 bg-[#262421] border border-[#3c3934] text-[#9babaf] hover:text-[#81b64c] rounded-lg cursor-pointer transition-colors shrink-0"
                title="Buka Navigasi"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Top Bar Resources: Streak, Stamina, XP, Coin, Diamond */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-1 sm:gap-4 border-t sm:border-t-0 border-[#3c3934]/30 pt-1.5 sm:pt-0">
            <div className="flex items-center justify-around sm:justify-start w-full sm:w-auto gap-1 sm:gap-2.5">
              
              {/* STREAK */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#262421] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0" title="Streak bermain">
                <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-[#55534e]'}`} />
                <span className={`text-[10px] sm:text-xs font-black ${streak > 0 ? 'text-orange-400' : 'text-[#8a8883]'}`}>
                  {streak}<span className="text-[8.5px] font-bold text-slate-400 hidden min-[400px]:inline"> Hari</span>
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
                className="flex items-center gap-0.5 sm:gap-1 bg-[#262421] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#3c3934] hover:border-[#81b64c] cursor-pointer hover:scale-105 transition-all group shrink-0" 
                title="Nyawa analisis"
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span className="text-[10px] sm:text-xs font-black text-white">
                  {hearts}<span className="text-[8px] text-[#8a8883]/80 font-normal">/5</span>
                </span>
              </button>

              {/* XP */}
              <div 
                onClick={() => { setMode('profile'); triggerAudio('move'); }}
                className="flex items-center gap-0.5 sm:gap-1 bg-[#262421] hover:border-[#81b64c]/50 cursor-pointer px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0" 
                title="Keahlian XP"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFC800]" />
                <span className="text-[10px] sm:text-xs font-black text-white">
                  {xp}<span className="text-[8px] font-bold text-slate-400 hidden min-[400px]:inline"> XP</span>
                </span>
              </div>

              {/* COINS */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#262421] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0" title="Koin Arena">
                <Coins className="w-3.5 h-3.5 text-[#81b64c]" />
                <span className="text-[10px] sm:text-xs font-black text-white">
                  {coins}<span className="text-[8px] font-bold text-slate-400 hidden min-[400px]:inline"> Koin</span>
                </span>
              </div>

              {/* DIAMONDS */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#262421] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0" title="Berlian Premium">
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] sm:text-xs font-black text-white">
                  {diamonds}<span className="text-[8px] font-bold text-slate-400 hidden min-[400px]:inline"> Berlian</span>
                </span>
              </div>

              {/* INBOX (SURAT KOTAK MASUK) - SEJAJAR CURRENCY */}
              <button
                onClick={() => {
                  const totalG = receivedGifts.length;
                  const totalI = inboxMessages.length;
                  if (totalI > 0 && totalG === 0) {
                    setInboxActiveTab('invites');
                  } else {
                    setInboxActiveTab('gifts');
                  }
                  setShowGiftInboxModal(true);
                  triggerAudio('move');
                }}
                className="flex items-center gap-1 bg-[#262421] hover:bg-[#312e2b] hover:border-amber-500 transition-all cursor-pointer px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0 relative font-sans focus:outline-none"
                title="Kotak Masuk Surat"
              >
                <Mail className={`w-3.5 h-3.5 text-amber-400 ${(receivedGifts.length + inboxMessages.length) > 0 ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] sm:text-xs font-black text-white hidden min-[400px]:inline">Surat</span>
                {(receivedGifts.length + inboxMessages.length) > 0 && (
                  <span className="absolute -top-1.5 -right-1 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full border border-[#1e1c1b] animate-pulse">
                    {receivedGifts.length + inboxMessages.length}
                  </span>
                )}
              </button>

              {/* DAFTAR TEMAN - SEJAJAR INBOX */}
              <button
                onClick={() => {
                  setShowFriendListModal(true);
                  triggerAudio('move');
                }}
                className="flex items-center gap-1 bg-[#262421] hover:bg-[#312e2b] hover:border-[#81b64c] transition-all cursor-pointer px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#3c3934] shrink-0 relative font-sans focus:outline-none"
                title="Daftar Teman"
              >
                <Users className={`w-3.5 h-3.5 text-cyan-400 ${friendRequests.length > 0 ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] sm:text-xs font-black text-white hidden min-[400px]:inline">Teman</span>
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1.5 -right-1 bg-red-650 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full border border-[#1e1c1b] animate-pulse">
                    {friendRequests.length}
                  </span>
                )}
              </button>

            </div>

            {/* Sound, Desktop Profile on Desktop right (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-3 border-l border-[#3c3934] pl-4">
              <button
                onClick={() => {
                  const updated = !soundEnabled;
                  setSoundEnabled(updated);
                  localStorage.setItem('sound', String(updated));
                  if (updated) playSound('move');
                }}
                className="p-1.5 text-[#9babaf] hover:text-white rounded-lg hover:bg-[#3c3934] cursor-pointer transition-colors shrink-0"
                title={soundEnabled ? "Matikan Efek Suara" : "Aktifkan Efek Suara"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
              </button>

              {user ? (
                <div id="profile-logged-in-desktop" className="flex items-center gap-2.5 shrink-0 min-w-0">
                  <div 
                    onClick={() => { setShowProfileModal(true); triggerAudio('move'); }} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#3c3934]/50 p-1 rounded-xl transition-all shrink-0 min-w-0"
                    title="Lihat Profil & Stats"
                  >
                    <AvatarWithFrame 
                      src={user.profileAvatar || martinAvatar} 
                      frameId={selectedFrame} 
                      size="sm" 
                    />
                    <div className="flex flex-col text-right">
                      <span className="text-white text-xs font-bold leading-tight truncate max-w-[124px] flex items-center justify-end gap-0.5">
                        {membershipStatus === 'premium' && <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400/10 inline" />}
                        {user.username}
                      </span>
                      <span className="text-[9px] text-[#9babaf] font-semibold leading-none flex items-center justify-end gap-1 mt-0.5">
                        {membershipStatus === 'premium' ? (
                          <span className="px-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-[8px] font-black rounded uppercase tracking-wide">PREMIUM</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Swords className="w-3 h-3 text-yellow-500" /> {onlineRating} ELO</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      localStorage.removeItem('user');
                      setOnlineRating(400);
                      localStorage.setItem('onlineRating', '400');
                      setXp(0);
                      localStorage.setItem('xp', '0');
                      setUnlockedThemes(['classic']);
                      localStorage.setItem('unlockedThemes', JSON.stringify(['classic']));
                      setGuestMatchesPlayed(0);
                      localStorage.setItem('guestMatchesPlayed', '0');
                      setGuestMatchesWon(0);
                      localStorage.setItem('guestMatchesWon', '0');
                      setProfileEditingBio('Pecatur sejati pantang menyerah!');
                      setClaimedAchievements([]);
                      setMembershipStatus('free');
                      localStorage.setItem('membershipStatus', 'free');

                      const prevName = `Pecatur_${Math.random().toString(36).substring(2,6).toUpperCase()}`;
                      setUsername(prevName);
                      localStorage.setItem('username', prevName);
                      loadUserScopedStats(prevName);
                      triggerAudio('lose');
                    }}
                    className="p-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg cursor-pointer transition-colors shrink-0"
                    title="Keluar dari Akun"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setAuthError('');
                      setShowAuthModal(true);
                      triggerAudio('move');
                    }}
                    className="px-1.5 py-1 min-[400px]:px-2.5 min-[400px]:py-2 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-[9px] min-[400px]:text-[10px] sm:text-xs font-black rounded-lg cursor-pointer flex items-center gap-0.5 min-[400px]:gap-1 hover:scale-105 transition-all shrink-0 uppercase tracking-wider"
                  >
                    <User className="w-2.5 h-2.5 min-[400px]:w-3 min-[400px]:h-3 sm:w-3.5 sm:h-3.5 fill-white/10 hidden min-[360px]:inline" />
                    <span>Masuk</span>
                  </button>
                </div>
              )}

              {/* Hamburger Menu on Desktop */}
              <button
                onClick={() => {
                  setIsNavDrawerOpen(true);
                  triggerAudio('move');
                }}
                className="p-1.5 bg-[#262421] border border-[#3c3934] text-[#9babaf] hover:text-[#81b64c] rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1 hover:border-[#81b64c]"
                title="Buka Navigasi"
              >
                <Menu className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden lg:inline">Menu</span>
              </button>
            </div>

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
              className={`bg-[#312e2b] rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border-2 ${
                rewardType === 'premium' ? 'border-yellow-500' :
                rewardType === 'info' ? 'border-red-500' :
                'border-[#81b64c]'
              }`}
            >
              {rewardType === 'premium' && (
                <>
                  <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-600/30">
                    <Crown className="w-9 h-9 text-yellow-500 fill-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">AKSES PREMIUM</h3>
                  <p className="text-xs text-yellow-500 font-bold tracking-wide uppercase mb-4">Fitur Khusus Klub Premium</p>
                  
                  <div className="bg-yellow-950/25 border border-yellow-900/35 rounded-xl py-3 px-4 mb-6 text-xs text-yellow-400/90 font-semibold">
                    Tingkatkan ke Anggota Premium untuk membuka semua Robot Legendaris, Desain Eksklusif, dan Papan Catur Kustom!
                  </div>
                </>
              )}

              {rewardType === 'info' && (
                <>
                  <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/30">
                    <Heart className="w-9 h-9 text-red-500 fill-red-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">NYAWA DEPLESI</h3>
                  <p className="text-xs text-red-500 font-bold tracking-wide uppercase mb-4">Butuh Nyawa Untuk Bermain</p>
                  
                  <div className="bg-red-950/25 border border-red-900/35 rounded-xl py-3 px-4 mb-6 text-xs text-red-400/95 font-semibold">
                    Silakan isi ulang nyawa di menu Toko dengan XP Anda, atau klaim absensi harian untuk memulihkan nyawa!
                  </div>
                </>
              )}

              {rewardType === 'success_no_xp' && (
                <>
                  <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#81b64c]/30">
                    <Check className="w-9 h-9 text-[#81b64c]" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">BERHASIL!</h3>
                  <p className="text-xs text-[#81b64c] font-bold tracking-wide uppercase mb-4">Transaksi Sukses</p>
                </>
              )}

              {rewardType === 'level_up' && (
                <>
                  <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30 animate-bounce">
                    <Trophy className="w-9 h-9 text-[#FFC800] fill-yellow-500/10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">LEVEL UP!</h3>
                  <p className="text-xs text-yellow-500 font-bold tracking-wide uppercase mb-4">Selamat Naik Level</p>
                </>
              )}

              {rewardType === 'reward' && (
                <>
                  <div className="w-16 h-16 bg-[#262421] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3c3934]">
                    <Trophy className="w-9 h-9 text-yellow-500 fill-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">LUAR BIASA!</h3>
                  <p className="text-xs text-slate-400 font-bold tracking-wide uppercase mb-4">Skor catur Anda bertambah!</p>
                  
                  <div className="bg-[#262421] rounded-xl py-3 px-4 border border-[#3c3934] mb-6 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#81b64c] fill-emerald-500" />
                    <span className="text-[#81b64c] font-black text-lg">+{rewardAmount} XP Diperoleh</span>
                  </div>
                </>
              )}
              
              <p className="text-[#bab9b8] font-semibold mb-6 text-sm leading-relaxed">{rewardMessage}</p>
              
              <button
                id="close-reward-modal"
                onClick={() => setShowRewardModal(false)}
                className={`w-full py-3 text-white font-extrabold text-md rounded-xl shadow-lg cursor-pointer transition-colors uppercase border-b-4 ${
                  rewardType === 'premium' || rewardType === 'level_up'
                    ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700' 
                    : rewardType === 'info'
                    ? 'bg-red-500 hover:bg-red-400 border-red-700'
                    : 'bg-[#81b64c] hover:bg-[#92ca5a] border-[#5d8a32]'
                }`}
              >
                Lanjutkan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC USER LOGIN / REGISTRATION MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#312e2b] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#3c3934] relative"
            >
              <button
                id="close-auth-modal"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-[#262421] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#3c3934]">
                <User className="w-6 h-6 text-[#81b64c] fill-emerald-500/10" />
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-tight">{authTab === 'login' ? 'Masuk ke Arena' : 'Daftar Akun Baru'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{authTab === 'login' ? 'Lanjutkan perjuangan & naiki peringkat' : 'Buat akun gratis untuk menyimpan pencapaian'}</p>

              {/* TABS SELECTOR */}
              <div className="grid grid-cols-2 bg-[#2d302e] p-1 rounded-xl border border-[#3c3934] mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer uppercase ${authTab === 'login' ? 'bg-[#312e2b] text-white border border-[#3c3934]' : 'text-slate-400 hover:text-white'}`}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setAuthError(''); }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer uppercase ${authTab === 'register' ? 'bg-[#312e2b] text-white border border-[#3c3934]' : 'text-slate-400 hover:text-white'}`}
                >
                  Daftar Baru
                </button>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-3 rounded-lg mb-4 text-left flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{authError}</span>
                </div>
              )}

              {/* INPUT FIELDS */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');
                if (!authUsername.trim() || !authPassword.trim()) {
                  setAuthError('Wajib mengisi kolom Username dan Password!');
                  return;
                }
                setAuthLoading(true);
                try {
                  const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
                  const response = await fetchWithTimeout(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: authUsername, password: authPassword })
                  }, 1500);
                  const data = await response.json();
                  if (!response.ok || data.error) {
                    setAuthError(data.error || 'Terjadi gangguan koneksi');
                  } else if (data.success && data.user) {
                    const authenticatedUser = {
                      username: data.user.username,
                      elo: data.user.elo !== undefined ? data.user.elo : 400,
                      xp: data.user.xp !== undefined ? data.user.xp : 0,
                      unlockedThemes: data.user.unlockedThemes || ["classic"],
                      matchesPlayed: data.user.matchesPlayed !== undefined ? data.user.matchesPlayed : 0,
                      matchesWon: data.user.matchesWon !== undefined ? data.user.matchesWon : 0,
                      profileAvatar: data.user.profileAvatar || martinAvatar,
                      profileBio: data.user.profileBio || "Pecatur sejati pantang menyerah!",
                      claimedAchievements: data.user.claimedAchievements || [],
                      membershipStatus: data.user.membershipStatus || 'free'
                    };
                    setUser(authenticatedUser);
                    setProfileEditingBio(authenticatedUser.profileBio);
                    setClaimedAchievements(authenticatedUser.claimedAchievements);
                    localStorage.setItem('user', JSON.stringify(authenticatedUser));
                    
                    // Sync local client metrics
                    handleSaveUsername(authenticatedUser.username);
                    setOnlineRating(authenticatedUser.elo);
                    setXp(authenticatedUser.xp);
                    setUnlockedThemes(authenticatedUser.unlockedThemes);
                    setMembershipStatus(authenticatedUser.membershipStatus as any);
                    localStorage.setItem('membershipStatus', authenticatedUser.membershipStatus);

                    if (authTab === 'register') {
                      const userScope = authenticatedUser.username.trim().toLowerCase();
                      localStorage.setItem(`streak:${userScope}`, "0");
                      localStorage.removeItem(`lastStreakDate:${userScope}`);
                      localStorage.removeItem(`lastClaimDate:${userScope}`);
                      localStorage.setItem(`dailyIndex:${userScope}`, "0");
                      localStorage.setItem(`unlockedSkins:${userScope}`, JSON.stringify(["standard"]));
                      localStorage.setItem(`selectedSkin:${userScope}`, "standard");
                    }
                    
                    loadUserScopedStats(authenticatedUser.username);
                    
                    setShowAuthModal(false);
                    setAuthUsername('');
                    setAuthPassword('');
                    triggerAudio('win');
                  }
                } catch (err) {
                  console.warn("Server connection failed, falling back to local storage account logic for Vercel support:", err);
                  const mockUsersRaw = localStorage.getItem('mock_users') || '[]';
                  let mockUsers: any[] = [];
                  try {
                    mockUsers = JSON.parse(mockUsersRaw);
                  } catch (parseErr) {
                    mockUsers = [];
                  }
                  
                  if (authTab === 'login') {
                    const match = mockUsers.find((u: any) => u.username.toLowerCase() === authUsername.trim().toLowerCase() && u.password === authPassword);
                    if (match) {
                      const authenticatedUser = {
                        username: match.username,
                        elo: match.elo !== undefined ? match.elo : 400,
                        xp: match.xp !== undefined ? match.xp : 0,
                        unlockedThemes: match.unlockedThemes || ["classic"],
                        matchesPlayed: match.matchesPlayed !== undefined ? match.matchesPlayed : 0,
                        matchesWon: match.matchesWon !== undefined ? match.matchesWon : 0,
                        profileAvatar: match.profileAvatar || martinAvatar,
                        profileBio: match.profileBio || "Pecatur sejati (Akun Lokal Vercel)!",
                        claimedAchievements: match.claimedAchievements || [],
                        membershipStatus: match.membershipStatus || 'free'
                      };
                      setUser(authenticatedUser);
                      setProfileEditingBio(authenticatedUser.profileBio);
                      setClaimedAchievements(authenticatedUser.claimedAchievements);
                      localStorage.setItem('user', JSON.stringify(authenticatedUser));
                      
                      handleSaveUsername(authenticatedUser.username);
                      setOnlineRating(authenticatedUser.elo);
                      setXp(authenticatedUser.xp);
                      setUnlockedThemes(authenticatedUser.unlockedThemes);
                      setMembershipStatus(authenticatedUser.membershipStatus as any);
                      localStorage.setItem('membershipStatus', authenticatedUser.membershipStatus);
                      
                      loadUserScopedStats(authenticatedUser.username);

                      setShowAuthModal(false);
                      setAuthUsername('');
                      setAuthPassword('');
                      triggerAudio('win');
                    } else {
                      const existsObj = mockUsers.find((u: any) => u.username.toLowerCase() === authUsername.trim().toLowerCase());
                      if (existsObj) {
                        setAuthError('Kata sandi salah (Akun Lokal)');
                      } else {
                        setAuthError('Koneksi server gagal. Silakan ganti Tab ke "Daftar Baru" untuk membuat akun sandbox offline lokal (Vercel mode)!');
                      }
                    }
                  } else {
                    const existsObj = mockUsers.find((u: any) => u.username.toLowerCase() === authUsername.trim().toLowerCase());
                    if (existsObj) {
                      setAuthError('Username telah digunakan (Akun Lokal)');
                    } else {
                      const newMockUser = {
                        username: authUsername.trim(),
                        password: authPassword,
                        elo: 400, 
                        xp: 0,
                        unlockedThemes: ["classic"],
                        matchesPlayed: 0,
                        matchesWon: 0,
                        profileAvatar: martinAvatar,
                        profileBio: "Ayo bertanding catur! (Akun Lokal Vercel)",
                        claimedAchievements: [],
                        membershipStatus: 'free'
                      };
                      mockUsers.push(newMockUser);
                      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
                      
                      setUser(newMockUser);
                      setProfileEditingBio(newMockUser.profileBio);
                      setClaimedAchievements([]);
                      localStorage.setItem('user', JSON.stringify(newMockUser));
                      
                      handleSaveUsername(newMockUser.username);
                      setOnlineRating(newMockUser.elo);
                      setXp(newMockUser.xp);
                      setUnlockedThemes(newMockUser.unlockedThemes);
                      setMembershipStatus('free');
                      localStorage.setItem('membershipStatus', 'free');

                      const userScope = newMockUser.username.trim().toLowerCase();
                      localStorage.setItem(`streak:${userScope}`, "0");
                      localStorage.removeItem(`lastStreakDate:${userScope}`);
                      localStorage.removeItem(`lastClaimDate:${userScope}`);
                      localStorage.setItem(`dailyIndex:${userScope}`, "0");
                      localStorage.setItem(`unlockedSkins:${userScope}`, JSON.stringify(["standard"]));
                      localStorage.setItem(`selectedSkin:${userScope}`, "standard");
                      
                      loadUserScopedStats(newMockUser.username);
                      
                      setShowAuthModal(false);
                      setAuthUsername('');
                      setAuthPassword('');
                      triggerAudio('win');
                    }
                  }
                } finally {
                  setAuthLoading(false);
                }
              }} className="space-y-3.5">
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-[#9babaf] uppercase tracking-widest mb-1.5">Username</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Min 3 karakter"
                    maxLength={16}
                    disabled={authLoading}
                    className="w-full bg-[#262421] border border-[#3c3934] rounded-lg px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <div className="text-left mb-6">
                  <label className="block text-[10px] font-bold text-[#9babaf] uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Wajib diisi"
                      disabled={authLoading}
                      className="w-full bg-[#262421] border border-[#3c3934] rounded-lg pl-3 pr-10 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-[#81b64c]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#81b64c] hover:bg-[#6c9c3e] border border-emerald-500/20 text-white font-extrabold text-sm rounded-xl cursor-pointer hover:scale-[1.02] transform transition-all uppercase tracking-wider shadow-md"
                >
                  {authLoading ? 'Memproses...' : (authTab === 'login' ? 'Masuk ke Arena' : 'Buat Akun Arena')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GIFT INBOX MODAL (EMOJI FREE) */}
      <AnimatePresence>
        {showGiftInboxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2d2a27] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-800 relative font-sans"
            >
              <button
                onClick={() => setShowGiftInboxModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <XCircle className="w-5 h-5 animate-pulse" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center border border-stone-800">
                  <Mail className="w-5 h-5 text-amber-500 font-bold" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight leading-none text-left">Pusat Surat & Kotak Masuk</h2>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1 text-left">Kelola Hadiah Klan dan Duel Tantangan Aktif</span>
                </div>
              </div>

              {/* TAB ROW SWITCHER */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950 rounded-xl mb-4 border border-stone-900">
                <button
                  onClick={() => { setInboxActiveTab('gifts'); triggerAudio('move'); }}
                  className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                    inboxActiveTab === 'gifts'
                      ? 'bg-stone-800 text-amber-400 shadow'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Surat Kado ({receivedGifts.length})
                </button>
                <button
                  onClick={() => { setInboxActiveTab('invites'); triggerAudio('move'); }}
                  className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                    inboxActiveTab === 'invites'
                      ? 'bg-stone-800 text-cyan-400 shadow'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Undangan Duel ({inboxMessages.length})
                </button>
              </div>

              {/* TAB 1: GIFTS CONTAINER */}
              {inboxActiveTab === 'gifts' && (
                <div>
                  {receivedGifts.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 italic text-xs border border-dashed border-stone-800 rounded-xl">
                      Kotak hadiah kosong. Belum ada kado yang dikirim untuk saat ini.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {receivedGifts.map((gift) => (
                        <div key={gift.id} className="p-3 bg-stone-900 border border-stone-850 rounded-xl space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] text-amber-400 font-bold uppercase font-mono">PENGIRIM: {gift.from}</span>
                              <h4 className="text-xs font-black text-white">{gift.giftName}</h4>
                            </div>
                            {gift.isPremium && (
                              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black font-sans uppercase">Premium</span>
                            )}
                          </div>
                          
                          <p className="text-[11.5px] text-[#bab9b8] italic bg-[#1c1a19] p-2.5 rounded border border-stone-950 leading-relaxed font-semibold">
                            "{gift.msg}"
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              onClick={() => handleCashOutGiftInApp(gift, 'coins')}
                              className="px-2.5 py-1.5 text-[9px] font-black text-white bg-[#81b64c] hover:bg-green-500 cursor-pointer rounded-lg uppercase transition-all border-none font-sans"
                            >
                              Koin (+{gift.cashValueCoins || 50})
                            </button>
                            {gift.cashValueDiamonds > 0 && (
                              <button
                                onClick={() => handleCashOutGiftInApp(gift, 'diamonds')}
                                className="px-2.5 py-1.5 text-[9px] font-black text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer rounded-lg uppercase transition-all border-none font-sans"
                              >
                                Berlian (+{gift.cashValueDiamonds})
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenOrdinaryGiftInApp(gift)}
                              className="px-2.5 py-1.5 text-[9px] font-black text-slate-300 bg-stone-800 hover:bg-stone-700 cursor-pointer rounded-lg uppercase transition-all border-none font-sans"
                            >
                              Afinitas (+{gift.affinityPoints || 100})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DUEL CHALLENGES CONTAINER */}
              {inboxActiveTab === 'invites' && (
                <div>
                  {inboxMessages.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 italic text-xs border border-dashed border-stone-800 rounded-xl">
                      Tidak ada tantangan atau undangan tanding catur aktif saat ini.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {inboxMessages.map((msg: any) => (
                        <div key={msg.id} className="p-3 bg-[#1e2330] border border-blue-900/40 rounded-xl flex flex-col gap-2 text-left">
                          <div className="flex items-start gap-2.5">
                            <Mail className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-extrabold text-[#d2e0fb] leading-normal">{msg.text}</p>
                              {msg.roomCode && (
                                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded mt-1 inline-block border border-cyan-800/20">
                                  ROOM: {msg.roomCode}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {msg.type === 'game_invite' ? (
                            <div className="flex gap-2 justify-end border-t border-stone-800/40 pt-2 mt-1">
                              <button
                                onClick={() => handleRespondToInvite(msg, 'decline')}
                                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-slate-350 font-black rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer border-none font-sans"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => {
                                  setShowGiftInboxModal(false);
                                  handleRespondToInvite(msg, 'accept');
                                }}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider border-none shadow-[0_2.5px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-sans"
                              >
                                Terima & Main
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                await fetch('/api/social/inbox/clear', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ username, msgId: msg.id })
                                });
                                fetchSocialInfo();
                              }}
                              className="self-end px-3 py-1 bg-stone-800 hover:bg-stone-700 text-slate-300 font-bold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer border-none font-sans"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowGiftInboxModal(false)}
                  className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-slate-300 text-xs font-black uppercase rounded-xl transition border-none cursor-pointer"
                >
                  Tutup Kotak Masuk
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DAFTAR TEMAN MODAL */}
      <AnimatePresence>
        {showFriendListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2d2a27] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-800 relative font-sans"
            >
              <button
                onClick={() => setShowFriendListModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <XCircle className="w-5 h-5 animate-pulse" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center border border-stone-800">
                  <Users className="w-5 h-5 text-cyan-400 font-bold" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight leading-none text-left font-sans">Hubungan Teman & Relasi</h2>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1 text-left font-sans">Tambah, tantang duel, atau kelola pertemanan Anda</span>
                </div>
              </div>

              {!user ? (
                <div className="py-6 text-center max-w-sm mx-auto font-sans">
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-4">
                    Silakan masuk atau daftar akun terlebih dahulu untuk menggunakan fitur pertemanan sosial!
                  </p>
                  <button
                    onClick={() => {
                      setShowFriendListModal(false);
                      setMode('profile');
                      triggerAudio('move');
                    }}
                    className="w-full py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-black rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Masuk Akun Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {/* SEARCH & ADD FRIEND FORM */}
                  <div className="space-y-1.5 p-3.5 bg-stone-950/45 border border-stone-900 rounded-2xl">
                    <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block text-left">Cari & Tambah Kawan Baru</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={addFriendInput}
                        onChange={(e) => setAddFriendInput(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSendFriendRequest(); }}
                        disabled={isSocialLoading}
                        placeholder="Masukkan username kawan catur..."
                        className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 focus:border-[#81b64c] text-xs rounded-xl font-bold text-white focus:outline-none placeholder-slate-600 font-sans"
                      />
                      <button
                        onClick={handleSendFriendRequest}
                        disabled={isSocialLoading || !addFriendInput.trim()}
                        className="px-3 bg-[#81b64c] hover:bg-[#92ca5a] disabled:bg-stone-800 text-white font-black rounded-xl cursor-pointer shadow-[0_2px_0_0_#5d8a32]"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PENDING FRIEND REQUESTS SECTION IN MODAL */}
                  {friendRequests.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
                      <span className="text-[9px] uppercase font-black tracking-wider text-yellow-500 block text-left">Permintaan Pertemanan Masuk ({friendRequests.length})</span>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {friendRequests.map((reqUser: string) => (
                          <div key={reqUser} className="flex items-center justify-between gap-2 bg-stone-950/40 p-2 rounded-lg border border-stone-900/60">
                            <span className="text-xs font-bold text-slate-200">@{reqUser}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleRespondToFriendRequest(reqUser, 'decline')}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-slate-350 rounded-lg text-[8px] uppercase tracking-wider cursor-pointer font-sans"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => handleRespondToFriendRequest(reqUser, 'accept')}
                                className="px-2 py-1 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-black rounded-lg text-[8px] uppercase tracking-wider cursor-pointer font-sans"
                              >
                                Terima
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FRIEND LIST VIEW */}
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2 text-left">Rekan Duel Anda ({friendsList.length})</span>
                    {friendsList.length === 0 ? (
                      <div className="py-6 bg-stone-900 border border-stone-850 rounded-2xl text-center text-slate-500 font-bold p-4 text-xs font-sans">
                        Belum memiliki relasi teman bermain saat ini.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {friendsList.map((friend: any) => (
                          <div key={friend.username} className="p-2.5 bg-stone-900 border border-stone-850 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:bg-stone-850 transition-colors">
                            <div 
                              className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                              onClick={() => {
                                setSelectedFriendForDetail(friend);
                                setShowFriendListModal(false);
                                setMode('profile');
                                triggerAudio('move');
                              }}
                              title="Klik untuk melihat profil teman"
                            >
                              <img
                                src={friend.avatar || martinAvatar}
                                alt="Friend"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg border border-stone-800 bg-neutral-900 object-cover shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-[#a2e564] transition-colors truncate">@{friend.username}</h4>
                                <span className="text-[9px] font-mono text-[#81b64c] font-black uppercase flex items-center gap-0.5 text-left">
                                  {friend.elo} ELO <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-[#81b64c]" />
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setShowFriendListModal(false);
                                  handleInviteFriend(friend.username);
                                }}
                                className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 hover:scale-105 active:scale-95 text-white text-[8px] font-black uppercase rounded-lg transition-all cursor-pointer font-sans"
                              >
                                Tantang Duel
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(friend.username)}
                                title="Hapus Teman"
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg cursor-pointer transition-colors border-none"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex">
                <button
                  onClick={() => setShowFriendListModal(false)}
                  className="w-full py-2.5 bg-stone-800 hover:bg-stone-750 text-slate-350 text-xs font-black uppercase rounded-xl transition border-none cursor-pointer"
                >
                  Tutup Daftar Teman
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC USER ACCONT PROFILE CARD & GAME STATS MODAL */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#312e2b] rounded-2xl max-w-lg w-full p-6 text-center shadow-2xl border border-[#3c3934] relative max-h-[90vh] overflow-y-auto"
            >
              <button
                id="close-profile-modal"
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black text-white uppercase tracking-tight">KARTU PROFIL ARENA</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Kelola reputasi dan pantau statistik caturmu</p>

              {user ? (
                <div className="space-y-6 text-left">
                  {/* MAIN AVATAR / EXP HEADER */}
                  <div className="p-4 bg-[#262421] rounded-2xl border border-[#3c3934] flex flex-col min-[450px]:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#81b64c] to-emerald-400 p-0.5 shadow-md">
                      <img 
                        src={user.profileAvatar || martinAvatar} 
                        alt="Profile avatar image override" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover bg-[#312e2b]"
                      />
                      {membershipStatus === 'premium' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-[#312e2b] text-[10px] p-1 rounded-full border border-[#262421] shadow-md flex items-center justify-center font-black" title="Premium Member">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center min-[450px]:text-left space-y-1">
                      <div className="flex items-center justify-center min-[450px]:justify-start gap-1.5 flex-wrap">
                        <span className="text-white text-lg font-black leading-tight truncate max-w-[200px]">
                          {user.username}
                        </span>
                        {membershipStatus === 'premium' && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] font-extrabold rounded uppercase tracking-wide">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9babaf] font-semibold leading-relaxed">
                        Bio: <span className="text-slate-350 italic">"{user.profileBio || 'Pecatur sejati pantang menyerah!'}"</span>
                      </p>
                      <div className="w-full bg-[#3c3934] h-2 rounded-full overflow-hidden mt-2 border border-[#4d4a44]">
                        <div className="bg-[#81b64c] h-full" style={{ width: `${Math.min(100, (xp % 100))}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mt-0.5 gap-2">
                        <span>Pangkat / Peringkat Pencatur</span>
                        <span>Level {Math.floor(xp / 100) + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* KUSTOMISASI PROFILE PANEL */}
                  <div className="p-4 bg-[#2a2724] rounded-2xl border border-[#3e3b36]">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                      Kustomisasi Akun saya
                    </h3>
                    
                    {/* BIO STATUS CHANGER */}
                    <div className="mb-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ubah Motto/Bio catur:</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={profileEditingBio}
                        onChange={(e) => setProfileEditingBio(e.target.value)}
                        placeholder="Motto catur kamu..."
                        maxLength={50}
                        className="w-full sm:flex-1 bg-[#211f1d] border border-[#3c3934] rounded-lg px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-[#81b64c]"
                      />
                      <button
                        type="button"
                        disabled={saveStatus === 'saving'}
                        onClick={() => {
                          syncUserStats(undefined, undefined, undefined, undefined, undefined, undefined, profileEditingBio);
                          triggerAudio('win');
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-xs font-extrabold rounded-lg shrink-0 transition-all hover:scale-105 uppercase cursor-pointer min-w-[90px]"
                      >
                        {saveStatus === 'saving' ? 'Proses...' : saveStatus === 'saved' ? 'Sukses! ' : saveStatus === 'error' ? 'Gagal ' : 'Simpan'}
                      </button>
                    </div>
                    </div>

                    {/* UPLOAD AVATAR FROM GALLERY */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unggah Foto Profil dari Galeri:</span>
                      <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#211f1d] border-2 border-dashed border-[#3c3934] hover:border-[#81b64c] rounded-xl cursor-pointer transition-all hover:bg-[#262421] group">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#81b64c] transition-colors" />
                        <span className="text-xs text-slate-300 font-bold group-hover:text-white transition-colors truncate">
                          Pilih Foto Galeri...
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Ukuran berkas melebihi batas (maksimal 2MB)");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = async (event) => {
                                const dataUrl = event.target?.result as string;
                                if (dataUrl) {
                                  await syncUserStats(undefined, undefined, undefined, undefined, undefined, dataUrl);
                                  triggerAudio('win');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* STATISTIK GRUP */}
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 font-sans flex items-center gap-1">
                      <Award className="w-4 h-4 text-[#81b64c]" /> Statistik Permainan Anda
                    </h3>
                    <div className="grid grid-cols-2 min-[400px]:grid-cols-3 gap-3">
                      {/* ELO */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Peringkat ELO</span>
                        <div className="text-base font-black text-white mt-1 flex items-center justify-center gap-1"><Swords className="w-4 h-4 text-yellow-500" /> {onlineRating}</div>
                      </div>

                      {/* XP */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Skor XP</span>
                        <div className="text-base font-black text-[#FFC800] mt-1 flex items-center justify-center gap-1"><Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400/10" /> {xp}</div>
                      </div>

                      {/* Streak */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Streak Harian</span>
                        <div className="text-base font-black text-orange-400 mt-1 font-mono flex items-center justify-center gap-1"><Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" /> {streak}</div>
                      </div>

                      {/* Matches played */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Total Tanding</span>
                        <div className="text-base font-black text-slate-200 mt-1 font-mono flex items-center justify-center gap-1"><Swords className="w-4 h-4 text-slate-400" /> {user.matchesPlayed || 0}</div>
                      </div>

                      {/* Matches won */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Kemenangan</span>
                        <div className="text-base font-black text-[#81b64c] mt-1 font-mono flex items-center justify-center gap-1"><Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/10" /> {user.matchesWon || 0}</div>
                      </div>

                      {/* Win rate */}
                      <div className="bg-[#262421] border border-[#3c3934] p-3 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Win Rate</span>
                        <div className="text-base font-black text-cyan-400 mt-1 font-mono flex items-center justify-center gap-1">
                          <Trophy className="w-4 h-4 text-cyan-400" /> {user.matchesPlayed ? Math.round(((user.matchesWon || 0) / user.matchesPlayed) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXP ROADMAP / PERJALANAN LEVEL */}
                  <div className="p-4 bg-[#262421] rounded-2xl border border-[#3c3934] text-left">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFC800] fill-yellow-400/10" /> Perjalanan Level & Hadiah
                      </h3>
                      <span className="text-[10px] bg-[#3c3934] text-[#81b64c] font-mono px-2 py-0.5 rounded-lg uppercase font-black">
                        LVL {Math.floor(xp / 100) + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3.5 font-semibold">Tingkatkan skor XP lewat permainan catur & kumpulkan koin/diamond melimpah!</p>
                    
                    <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-[#3c3934] max-w-full">
                      {LEVEL_REWARDS.map((reward) => {
                        const currentLvl = Math.floor(xp / 100) + 1;
                        const isUnlocked = currentLvl >= reward.level;
                        const isClaimed = claimedLevelRewards.includes(reward.level);
                        
                        let cardBorder = "border-[#3c3934] opacity-55";
                        let statusText = "Terkunci";
                        let btnStyle = "bg-[#3c3934] text-slate-500 cursor-not-allowed";
                        
                        if (isUnlocked) {
                          if (isClaimed) {
                            cardBorder = "border-[#81b64c]/40 bg-[#1f281e]/40 opacity-100";
                            statusText = "Klaim Selesai ";
                            btnStyle = "bg-emerald-950/55 text-[#81b64c] cursor-default border border-emerald-900/40 font-bold";
                          } else {
                            cardBorder = "border-yellow-500 bg-[#2d2a27] opacity-100 ring-2 ring-yellow-500/15";
                            statusText = "Siap Klaim!";
                            btnStyle = "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black cursor-pointer shadow-[0_2px_0_0_#997300] active:translate-y-0.5 active:shadow-none";
                          }
                        }

                        return (
                          <div 
                            key={reward.level}
                            className={`min-w-[145px] sm:min-w-[155px] snap-start bg-[#1c1a19] p-3 rounded-xl border flex flex-col justify-between text-center gap-2.5 transition-all ${cardBorder}`}
                          >
                            <div>
                              <div className="text-2xs font-extrabold text-white uppercase tracking-wider">Level {reward.level}</div>
                              <div className="text-[8px] text-slate-400 font-mono mt-0.5 font-bold">Syarat: {reward.xpRequired} XP</div>
                            </div>
                            
                            <div className="bg-black/25 py-2 px-1.5 rounded-lg text-left text-[9px] space-y-1">
                              <div className="flex items-center gap-1 font-bold text-slate-300">
                                <Coins className="w-3 h-3 text-[#81b64c] shrink-0" />
                                <span>+{reward.coins} Koin</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-slate-300">
                                <Gem className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span>+{reward.diamonds} Berlian</span>
                              </div>
                              {reward.otherGift && (
                                <div className="text-[9px] text-[#ffdd55] font-extrabold flex items-center gap-0.5 truncate" title={reward.otherGift}>
                                  <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                                  <span>Premium Frame</span>
                                </div>
                              )}
                            </div>

                            <div>
                              {isUnlocked && !isClaimed ? (
                                <button
                                  type="button"
                                  onClick={() => claimLevelUpReward(reward.level)}
                                  className={`w-full py-1 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all duration-150 ${btnStyle}`}
                                >
                                  Ambil
                                </button>
                              ) : (
                                <div className={`w-full py-1 text-center text-[9px] uppercase rounded-md font-extrabold select-none ${btnStyle}`}>
                                  {statusText}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 px-4 space-y-4 text-center">
                  <div className="w-16 h-16 bg-[#262421] rounded-2xl flex items-center justify-center mx-auto border border-[#3c3934]">
                    <User className="w-8 h-8 text-[#81b64c]" />
                  </div>
                  <h3 className="text-white font-black uppercase text-[15px]">Anda sedang bermain sebagai Tamu</h3>
                  <p className="text-xs text-slate-350 leading-relaxed max-w-sm mx-auto">
                    Klub Catur membutuhkan pendaftaran unik Anda untuk dapat mulai mencatat statistik pertandingan, mengumpulkan ELO, melacak streak, serta mengedit avatar kustomisasi!
                  </p>
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        setAuthTab('login');
                        setShowAuthModal(true);
                        triggerAudio('move');
                      }}
                      className="px-6 py-3 bg-[#81b64c] hover:bg-[#6c9c3e] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-md w-full max-w-[240px]"
                    >
                      Daftar / Masuk Akun
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="mt-6 w-full py-2.5 bg-[#4d4a44] hover:bg-[#5b5750] text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
              >
                Tutup Kartu Profil
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* LOCAL & ONLINE FRIEND MODE CONFIGURATION MODAL */}
      <AnimatePresence>
        {friendLobbyType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#312e2b] rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-[#3c3934] relative text-left"
            >
              <button
                id="close-lobby-modal"
                onClick={() => setFriendLobbyType(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-[#262421] rounded-xl flex items-center justify-center mb-4 border border-[#3c3934]">
                <Swords className="w-6 h-6 text-cyan-400" />
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-tight">Main Bersama Teman</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Mabar kapan saja, di mana saja</p>

              {/* TAB SELECTORS */}
              <div className="grid grid-cols-2 bg-[#2d302e ] p-1 rounded-xl border border-[#3c3934] mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => { setFriendLobbyType('local'); triggerAudio('move'); }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer uppercase ${friendLobbyType === 'local' ? 'bg-[#312e2b] text-white border border-[#3c3934]' : 'text-slate-400 hover:text-white'}`}
                >
                  Lokal (Satu Layar)
                </button>
                <button
                  type="button"
                  onClick={() => { setFriendLobbyType('online-room'); triggerAudio('move'); }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer uppercase ${friendLobbyType === 'online-room' ? 'bg-[#312e2b] text-white border border-[#3c3934]' : 'text-slate-400 hover:text-white'}`}
                >
                  Online Room PIN
                </button>
              </div>

              {friendLobbyType === 'local' ? (
                /* LOCAL TAB SETTINGS */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#9babaf] uppercase tracking-widest mb-1.5">Nama Pemain Putih</label>
                    <input
                      type="text"
                      value={localFriendWName}
                      onChange={(e) => setLocalFriendWName(e.target.value)}
                      placeholder="Pemain 1 (Putih)"
                      maxLength={14}
                      className="w-full bg-[#262421] border border-[#3c3934] rounded-lg px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#9babaf] uppercase tracking-widest mb-1.5">Nama Pemain Hitam</label>
                    <input
                      type="text"
                      value={localFriendBName}
                      onChange={(e) => setLocalFriendBName(e.target.value)}
                      placeholder="Pemain 2 (Hitam)"
                      maxLength={14}
                      className="w-full bg-[#262421] border border-[#3c3934] rounded-lg px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* ROTATION TOGGLE */}
                  <div className="flex items-center justify-between bg-[#262421] p-3.5 rounded-lg border border-[#3c3934]">
                    <div>
                      <span className="block text-xs font-bold text-white">Putar Papan Catur</span>
                      <span className="block text-[10px] text-slate-400 leading-snug font-semibold">Putar otomatis papan sehabis melangkah</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFriendRotates}
                        onChange={(e) => setLocalFriendRotates(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#3c3934] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#3c3934] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      setFriendLobbyType(null);
                      setMode('local-friend');
                      // Clear standard settings
                      chessRef.current = new Chess();
                      setBoard(chessRef.current.board());
                      setMoveHistory([]);
                      setLastMove(null);
                      setAnalysisHistory([]);
                      setSelectedSquare(null);
                      setGameResult(null);
                      triggerAudio('win');
                    }}
                    className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm rounded-xl cursor-pointer hover:scale-[1.02] transform transition-all uppercase tracking-wider shadow-md"
                  >
                    Mulai Main Lokal
                  </button>
                </div>
              ) : (
                /* ONLINE LOBBY PIN SETTINGS */
                <div className="space-y-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs py-2.5 px-3 rounded-lg text-left">
                    <span className="font-bold block mb-0.5">Mabar Online Melalui PIN</span>
                    <span className="text-[11px] leading-tight text-slate-300">Masukkan PIN kustom yang disepakati bersama kawan catur untuk masuk kamar yang sama secara instan!</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#9babaf] uppercase tracking-widest mb-1.5">Kode Kamar Kustom (PIN)</label>
                    <input
                      type="text"
                      value={friendRoomCode}
                      onChange={(e) => setFriendRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="CONTOH PIN: MABAR99"
                      maxLength={8}
                      className="w-full bg-[#262421] border border-[#3c3934] rounded-lg px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-center"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!friendRoomCode.trim()) {
                        alert('Silakan isi PIN Kamar terlebih dahulu!');
                        return;
                      }
                      setFriendLobbyType(null);
                      setMode('online-match');
                      // Initialize matchmaking state with forced private roomCode and search immediately
                      setOnlineStatus('searching');
                      triggerAudio('move');
                    }}
                    className="w-full py-3 bg-[#81b64c] hover:bg-[#6c9c3e] border border-emerald-500/20 text-white font-extrabold text-sm rounded-xl cursor-pointer hover:scale-[1.02] transform transition-all uppercase tracking-wider shadow-md"
                  >
                    Buat / Gabung Kamar Online
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto md:px-4">
        {/* Main Content Pane */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pb-24 flex flex-col justify-start">
        {/* =========================================
             0. CORE HOME / DASHBOARD VIEW 
           ========================================= */}
        {mode === 'home' && (
          <div className="space-y-8">
            {/* SUB-TAB BAR AT THE VERY TOP OF HOME VIEW */}
            <div className="flex border-b border-[#3c3934] overflow-x-auto scroller-hidden pb-1 justify-center sm:justify-start gap-4">
              <button
                onClick={() => { setHomeActiveTab('dashboard'); triggerAudio('move'); }}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 px-3 flex items-center gap-1.5 ${
                  homeActiveTab === 'dashboard'
                    ? 'border-[#81b64c] text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-[#81b64c]" /> Dasbor Beranda
              </button>
              <button
                onClick={() => { setHomeActiveTab('community'); triggerAudio('move'); }}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 px-3 flex items-center gap-1.5 ${
                  homeActiveTab === 'community'
                    ? 'border-[#81b64c] text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-[#81b64c]" /> Klub & Liga Turnamen
              </button>
              <button
                onClick={() => { setHomeActiveTab('forum'); triggerAudio('move'); }}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 px-3 flex items-center gap-1.5 ${
                  homeActiveTab === 'forum'
                    ? 'border-[#81b64c] text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#81b64c]" /> Forum Komunitas
              </button>
            </div>

            {homeActiveTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in duration-300">
                {/* HERO WELCOME BANNER WITH LOCAL TIME */}
                <div className="bg-[#312e2b] rounded-3xl p-6 sm:p-8 border border-[#3c3934] flex flex-col md:flex-row items-center gap-6 justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3 scale-150">
                <Crown className="w-64 h-64 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
                <div className="relative">
                  <AvatarWithFrame 
                    src={user?.profileAvatar || martinAvatar} 
                    frameId={selectedFrame} 
                    size="xl" 
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#81b64c] uppercase block">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour < 11) return "Selamat Pagi";
                      if (hour < 15) return "Selamat Siang";
                      if (hour < 19) return "Selamat Sore";
                      return "Selamat Malam";
                    })()}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Halo, {user ? user.username : username}!
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 max-w-xl italic">
                    "{user?.profileBio || 'Pecatur sejati pantang menyerah!'}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMode('menu');
                  triggerAudio('move');
                }}
                className="px-6 py-3 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold text-sm rounded-xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 active:shadow-none cursor-pointer transition-all uppercase shrink-0 tracking-wide z-10 flex items-center gap-1.5"
              >
                Mulai Bertanding <Swords className="w-4 h-4 text-white inline-block" />
              </button>
            </div>

            {/* QUOTE AND MINI STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* COMPONENT: QUOTE OF THE DAY */}
              <div className="md:col-span-7 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md flex flex-col justify-between">
                {serverEpochDays === 0 ? (
                  <div className="flex flex-col justify-center items-center py-6 h-full text-slate-400 gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Mendapatkan kutipan hari ini...</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-[9px] font-black tracking-wider text-[#9babaf] uppercase">Kutipan Hari Ini</span>
                      <div className="mt-4 text-white text-sm sm:text-md italic font-semibold leading-relaxed border-l-4 border-[#81b64c] pl-4">
                        “{CHESS_QUOTES[serverEpochDays % CHESS_QUOTES.length].quote}”
                      </div>
                    </div>
                    <div className="text-right mt-4 text-[#81b64c] text-xs font-bold font-mono">
                      — {CHESS_QUOTES[serverEpochDays % CHESS_QUOTES.length].author}
                    </div>
                  </>
                )}
              </div>

              {/* COMPONENT: QUICK METRICS SUMMARY */}
              <div className="md:col-span-5 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-wider text-[#9babaf] uppercase">Ringkasan Reputasi</span>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-[#262421] rounded-xl p-2.5 text-center border border-[#3c3934]/60">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">Rating ELO</span>
                      <span className="text-white font-black text-xs sm:text-sm mt-0.5 block flex items-center justify-center gap-1"><Swords className="w-3.5 h-3.5 text-yellow-500" /> {onlineRating}</span>
                    </div>
                    <div className="bg-[#262421] rounded-xl p-2.5 text-center border border-[#3c3934]/60">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">Skor XP</span>
                      <span className="text-[#FFC800] font-black text-xs sm:text-sm mt-0.5 block flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/10" /> {xp}</span>
                    </div>
                    <div className="bg-[#262421] rounded-xl p-2.5 text-center border border-[#3c3934]/60">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">Streak</span>
                      <span className="text-orange-400 font-black text-xs sm:text-sm mt-0.5 block flex items-center justify-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" /> {streak} Hari</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMode('profile');
                    triggerAudio('move');
                  }}
                  className="mt-4 w-full py-2 bg-[#3c3934] hover:bg-[#4d4a44] text-[#81b64c] hover:text-white border border-[#4d4a44] hover:border-[#81b64c] text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer"
                >
                  Lihat Detail Karakter Profil
                </button>
              </div>
            </div>

            {/* COMPONENT: 7-DAY DAILY LOGIN STREAK (EMOJI-FREE GAMIFIED BOARD) */}
            <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3c3934]/60 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-tight">
                    <Calendar className="w-4 h-4 text-[#81b64c]" /> Absensi Harian & Hadiah Beruntun
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Lakukan login harian rutin dan klaim bonus XP untuk melaju di klub catur!</p>
                  {streak > 0 && (
                    <div className="mt-2 text-[10px] text-orange-400 font-extrabold uppercase font-mono bg-orange-950/20 px-3 py-1.5 rounded-lg border border-orange-500/10 inline-flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse fill-orange-500/10" />
                      Streak Bonus Aktif: +{streak * 10} XP & +{streak * 25} Coins setiap absensi!
                    </div>
                  )}
                </div>
                {!dailyClaimed ? (
                  <button
                    onClick={handleClaimDailyReward}
                    className="px-5 py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white text-xs font-extrabold uppercase rounded-lg shadow-[0_3px_0_0_#5d8a32] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
                  >
                    Klaim Hadiah Hari Ini
                  </button>
                ) : (
                  <span className="px-3.5 py-1.5 bg-[#262421] border border-[#3c3934] text-slate-500 text-xs font-extrabold uppercase rounded-lg cursor-default select-none flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Sudah Absen Hari Ini
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 min-[420px]:grid-cols-4 sm:grid-cols-7 gap-3">
                {[
                  { label: "Hari 1", xp: 10, gift: "XP Standar", icon: Sparkles, color: "text-blue-400 border-blue-500/10" },
                  { label: "Hari 2", xp: 15, gift: "Full Nyawa", icon: Heart, color: "text-red-400 border-red-550/10" },
                  { label: "Hari 3", xp: 20, gift: "Premium 3 Hari", icon: Crown, color: "text-yellow-400 border-yellow-500/10" },
                  { label: "Hari 4", xp: 125, gift: "Bonus Spesial", icon: Award, color: "text-rose-400 border-rose-500/10" },
                  { label: "Hari 5", xp: 30, gift: "Full Nyawa", icon: Heart, color: "text-emerald-400 border-emerald-500/10" },
                  { label: "Hari 6", xp: 190, gift: "Bonus Hebat", icon: Award, color: "text-cyan-400 border-cyan-500/10" },
                  { label: "Hari 7", xp: 50, gift: "Premium 7 Hari", icon: Crown, color: "text-[#FFC800] border-[#FFC800]/10" }
                ].map((day, i) => {
                  const activeIdx = dailyClaimed ? (dailyIndex - 1 + 7) % 7 : dailyIndex;
                  const isCurrent = i === activeIdx;
                  const isClaimedToday = isCurrent && dailyClaimed;
                  const isPast = dailyClaimed ? (i < activeIdx) : (i < dailyIndex);
                  let cardStyle = "bg-[#262421] border-[#3c3934] opacity-55";
                  
                  if (isCurrent) {
                    cardStyle = isClaimedToday 
                      ? "bg-[#1f281e] border-[#5d8a32]/40 shadow-lg ring-1 ring-[#5d8a32]/20 opacity-100" 
                      : "bg-[#2d2a27] border-[#81b64c] shadow-lg ring-1 ring-emerald-500/20 opacity-100 animate-pulse";
                  } else if (isPast) {
                    cardStyle = "bg-[#262421]/30 border-[#3c3934]/30 opacity-40";
                  }

                  const IconComponent = day.icon;

                  return (
                    <div 
                      key={day.label}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center justify-between gap-2.5 transition-all text-2xs font-extrabold uppercase ${cardStyle}`}
                    >
                      <span className={isCurrent ? "text-[#81b64c] font-black" : "text-slate-500"}>
                        {day.label}
                      </span>
                      
                      <div className={`p-2 rounded-xl bg-[#1c1a18] border ${day.color}`}>
                        <IconComponent className="w-5 h-5 shrink-0" />
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-white font-black font-mono">+{day.xp} XP</span>
                        {day.gift && (
                          <span className="text-[7.5px] text-amber-400 font-extrabold tracking-tight mt-0.5 whitespace-nowrap">{day.gift}</span>
                        )}
                        {isPast || (isCurrent && dailyClaimed) ? (
                          <span className="text-[7px] text-[#81b64c] font-bold uppercase tracking-wider mt-0.5">CLAIMED</span>
                        ) : (
                          <span className={isCurrent ? "text-amber-550 text-[7px] mt-0.5" : "text-slate-600 text-[7px] mt-0.5"}>READY</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODULAR INTEGRATION CARDS FOR SEPARATE PAGES/SUB-PAGES (EMOJI-FREE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CARD 1: EX-TABUNKAN / SEASON PASS */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-wider text-cyan-400 uppercase font-mono block">Misi Kehormatan</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Chess Battle Pass</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Kumpulkan XP untuk meningkatkan hadiah lintasan elite, serta buka brankas Tabungan Diamond Anda di halaman tersendiri saat ini.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between text-2xs font-bold text-slate-400">
                    <span>Level Pass saat ini:</span>
                    <span className="text-[#81b64c] font-black">Level {passLevel}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMode('season-pass');
                    triggerAudio('move');
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm text-center"
                >
                  Buka Halaman Season Pass
                </button>
              </div>

              {/* CARD 2: PANGKAT GAME JOURNEY */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-wider text-yellow-500 uppercase font-mono block">Piala Arena</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Pangkat Catur Arena</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Raih kemenangan dalam pertempuran arena untuk mendaki ranks level catur, kumpulkan ELO, serta klaim hadiah piala akhir season.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between text-2xs font-bold text-slate-400">
                    <span>Skor ELO:</span>
                    <span className="text-yellow-500 font-black">{onlineRating} PTS</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMode('rank');
                    triggerAudio('move');
                  }}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 border border-yellow-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm text-center"
                >
                  Buka Menu Pangkat Catur
                </button>
              </div>

              {/* CARD 3: REPLAYS AND FRIENDS REDIRECTIONS */}
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-wider text-[#81b64c] uppercase font-mono block">Profil Sosial</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Replay & Rekan Mabar</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Bongkar rekaman duel catur lawas, analisa taktik bot, dan pantau status afinitas rekan mabar Anda langsung di sub-hlm Profil.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between text-2xs font-bold text-slate-400">
                    <span>Teman Terdaftar:</span>
                    <span className="text-[#81b64c] font-black">{friendsList.length} Pemain</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMode('profile');
                      setProfileActiveTab('replay');
                      triggerAudio('move');
                    }}
                    className="py-2.5 bg-[#262421] hover:bg-slate-700 border border-[#3c3934] text-slate-300 text-[9px] font-extrabold uppercase rounded-xl transition-all cursor-pointer text-center"
                  >
                    Ulas Replay
                  </button>
                  <button
                    onClick={() => {
                      setMode('profile');
                      setProfileActiveTab('social');
                      triggerAudio('move');
                    }}
                    className="py-2.5 bg-[#262421] hover:bg-slate-700 border border-[#3c3934] text-slate-300 text-[9px] font-extrabold uppercase rounded-xl transition-all cursor-pointer text-center"
                  >
                    Rekan Mabar
                  </button>
                </div>
              </div>
            </div>

            {/* DAILY QUIZ / INTERACTIVE TRIVIA */}
            <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-3 mb-4">
                <span className="text-[10px] font-black tracking-wider text-[#ea9c1a] uppercase flex items-center gap-1">
                  Kuis Trivia Catur
                </span>
                <span className="px-2 py-0.5 bg-yellow-500/15 text-[#ea9c1a] text-[8px] font-black rounded uppercase">
                  Dapatkan +15 XP!
                </span>
              </div>
              <p className="text-white font-bold text-sm leading-relaxed mb-4">
                {CHESS_TRIVIA[triviaIndex].q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHESS_TRIVIA[triviaIndex].a.map((ans, i) => {
                  const isAnswered = triviaAnswered !== null;
                  const isSelected = triviaAnswered === i;
                  const isCorrect = CHESS_TRIVIA[triviaIndex].correct === i;
                  
                  let optStyle = "bg-[#262421] hover:bg-[#312e2b] border-[#3c3934] text-slate-200";
                  if (isAnswered) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-950/85 border-emerald-500 text-emerald-300";
                    } else if (isSelected) {
                      optStyle = "bg-red-950/85 border-red-500 text-red-350";
                    } else {
                      optStyle = "bg-[#262421]/30 border-[#3c3934]/45 text-slate-500 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={ans}
                      disabled={isAnswered}
                      onClick={() => {
                        setTriviaAnswered(i);
                        const correct = CHESS_TRIVIA[triviaIndex].correct === i;
                        setTriviaResult(correct);
                        localStorage.setItem('triviaAnswered', String(i));
                        localStorage.setItem('triviaResult', String(correct));
                        if (correct) {
                          const bonusXp = 15;
                          setXp(p => {
                            const n = p + bonusXp;
                            localStorage.setItem('xp', String(n));
                            if (user) {
                              const updatedUser = { ...user, xp: n };
                              localStorage.setItem('user', JSON.stringify(updatedUser));
                              setUser(updatedUser);
                            }
                            return n;
                          });
                          triggerAudio('win');
                        } else {
                          triggerAudio('error');
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${isAnswered ? "" : "cursor-pointer"} ${optStyle}`}
                    >
                      <span>{i + 1}. {ans}</span>
                      {isAnswered && isCorrect && <span className="text-emerald-400 font-extrabold uppercase text-[10px]">BENAR</span>}
                      {isAnswered && isSelected && !isCorrect && <span className="text-red-400 font-extrabold uppercase text-[10px]">SALAH</span>}
                    </button>
                  );
                })}
              </div>

              {triviaAnswered !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-[#262421] border border-[#3c3934] rounded-2xl"
                >
                  <p className="text-[#bab9b8] text-xs font-semibold leading-relaxed">
                    <strong className="text-[#81b64c]">Pembahasan:</strong> {CHESS_TRIVIA[triviaIndex].exp}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleNextTrivia}
                      className="px-3.5 py-1.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-[10px] font-black rounded-lg transition-transform hover:scale-105 uppercase tracking-wide cursor-pointer"
                    >
                      Pertanyaan Berikutnya
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI COACH ADVISOR CARD DISPLAYED PROMINENTLY */}
            <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#3c3934]/60">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400/15" />
                  Saran AI Coach Hari Ini
                </h3>
                {/* Dynamic Coach Advisor Toggle Buttons */}
                <div className="flex items-center gap-2 bg-[#2d2a27] p-1.5 rounded-2xl border border-[#3c3934]">
                  {[
                    { id: 'martin', elo: 250, name: 'Martin', avatar: martinAvatar, tip: 'Menguasai lajur tengah papan catur dengan pion di fase awal pembukaan akan memberikan ruang gerak luas bagi perwira utamamu. Selalu pastikan Raja Anda terlindungi melalui rokade cepat sebelum menginisiasi serangan!' },
                    { id: 'nelson', elo: 1300, name: 'Nelson', avatar: nelsonAvatar, tip: 'Jangan panik jika lawan menyerang dengan Ratu terlalu awal. Amankan koordinat f7 dan f2 dengan baik, kemudian kembangkan perwira kecilmu untuk mengejar Ratu yang terlalu aktif.' },
                    { id: 'wally', elo: 1800, name: 'Wally', avatar: wallyAvatar, tip: 'Struktur pion kokoh adalah kunci sukses posisi taktis catur solid. Jaga keutuhan barisan pionmu, lakukan manuver perlahan untuk mendominasi jalur-terbuka dengan Benteng.' },
                    { id: 'magnus', elo: 2850, name: 'Magnus', avatar: magnusAvatar, tip: 'Setiap langkah harus dijalankan dengan presisi kalkulatif tingkat tinggi. Di fase permainan akhir (endgame), aktifkan Rajamu ke baris tengah untuk menyokong penetrasi pion promosi.' }
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
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${isActive ? 'border-[#81b64c] scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        title={`Tip dari ${coach.name}`}
                      >
                        <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COACH ADVICE SPEECH BUBBLE */}
              {(() => {
                const activeCoach = [
                  { id: 'martin', name: 'Martin', elo: 250, role: 'Pelatih Dasar Pemula', tip: 'Menguasai lajur tengah papan catur dengan pion di fase awal pembukaan akan memberikan ruang gerak luas bagi perwira utamamu. Selalu pastikan Raja Anda terlindungi melalui rokade cepat sebelum menginisiasi serangan!', bg: 'border-amber-500/20' },
                  { id: 'nelson', name: 'Nelson', elo: 1300, role: 'Asisten Taktik Agresif', tip: 'Jangan panik jika lawan menyerang dengan Ratu terlalu awal. Amankan koordinat f7 dan f2 dengan baik, kemudian kembangkan perwira kecilmu untuk mengejar Ratu yang terlalu aktif.', bg: 'border-[#81b64c]/20' },
                  { id: 'wally', name: 'Wally', elo: 1800, role: 'Mentor Posisi Teoretis', tip: 'Struktur pion kokoh adalah kunci sukses posisi taktis catur solid. Jaga keutuhan barisan pionmu, lakukan manuver perlahan untuk mendominasi jalur-terbuka dengan Benteng.', bg: 'border-blue-500/20' },
                  { id: 'magnus', name: 'Magnus', elo: 2850, role: 'Grandmaster Analisis Presisi', tip: 'Setiap langkah harus dijalankan dengan presisi kalkulatif tingkat tinggi. Di fase permainan akhir (endgame), aktifkan Rajamu ke baris tengah untuk menyokong penetrasi pion promosi.', bg: 'border-purple-500/20' }
                ].find(c => c.id === dashboardCoachId);

                if (!activeCoach) return null;

                return (
                  <div className={`p-4 bg-[#262421] rounded-2xl border ${activeCoach.bg} flex items-start gap-4`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#3c3934] shrink-0">
                      <img 
                        src={
                          activeCoach.id === 'martin' ? martinAvatar :
                          activeCoach.id === 'nelson' ? nelsonAvatar :
                          activeCoach.id === 'wally' ? wallyAvatar :
                          magnusAvatar
                        } 
                        alt={activeCoach.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-white text-xs font-black">{activeCoach.name}</span>
                        <span className="text-[9px] text-[#81b64c] font-black border border-[#81b64c]/65 px-1.5 py-0.5 rounded-md bg-[#81b64c]/10 text-center select-none">{activeCoach.elo} ELO</span>
                        <span className="text-slate-400 text-[10px]">• {activeCoach.role}</span>
                      </div>
                      <p className="text-[#bab9b8] text-xs font-semibold leading-relaxed mt-2 italic text-slate-300">
                        "{activeCoach.tip}"
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* DAILY QUESTS PANEL */}
            <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3c3934]/60 pb-3 mb-5">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
                    <Target className="w-4 h-4 text-[#81b64c]" /> Misi Harian / Daily Quests
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Selesaikan misi untuk mendapatkan koin, XP, dan berlian!</p>
                </div>
                {membershipStatus !== 'premium' && (
                  <div className="bg-yellow-950/25 border border-yellow-900/35 rounded-xl py-1.5 px-3 text-[10px] text-yellow-400 font-extrabold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" /> Upgrade Premium untuk Misi Khusus Berlian
                  </div>
                )}
              </div>

              {/* QUESTS CONTAINER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Regular Quests Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#3c3934]/30 pb-1.5">
                    <Award className="w-4 h-4 text-[#81b64c]" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Misi Biasa (Semua Akun)</span>
                  </div>

                  {dailyQuests.filter(q => q.type === 'regular').map(q => {
                    const progressPercent = Math.min(100, (q.current / q.target) * 100);
                    const isCompleted = q.current >= q.target;
                    
                    return (
                      <div key={q.id} className="bg-[#262421] rounded-2xl p-4 border border-[#3c3934]/60 flex flex-col justify-between gap-3 relative overflow-hidden">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-black text-white">{q.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{q.description}</p>
                            </div>
                            
                            {/* Reward Tag */}
                            <div className="flex items-center gap-1 bg-[#1c1a18] px-2 py-1 rounded-lg border border-[#3c3934]">
                              {q.rewardType === 'coin' ? (
                                <>
                                  <Coins className="w-3 h-3 text-[#81b64c]" />
                                  <span className="text-[9px] font-black text-[#81b64c] font-mono">+{q.rewardAmount}</span>
                                </>
                              ) : q.rewardType === 'xp' ? (
                                <>
                                  <Sparkles className="w-3 h-3 text-yellow-400" />
                                  <span className="text-[9px] font-black text-yellow-400 font-mono">+{q.rewardAmount}</span>
                                </>
                              ) : (
                                <>
                                  <Gem className="w-3 h-3 text-cyan-400" />
                                  <span className="text-[9px] font-black text-cyan-400 font-mono">+{q.rewardAmount}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[9px] text-[#8a8883] font-bold mb-1">
                              <span>Progres</span>
                              <span>{q.current} / {q.target}</span>
                            </div>
                            <div className="w-full bg-[#1c1a18] h-1.5 rounded-full overflow-hidden border border-[#3c3934]/40">
                              <div 
                                className="bg-[#81b64c] h-full transition-all duration-300" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end mt-1">
                          {q.claimed ? (
                            <span className="text-[9px] text-slate-500 font-black tracking-wider uppercase bg-[#1c1a18] px-3 py-1.5 rounded-lg border border-[#3c3934] flex items-center gap-1 font-sans">
                              <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> Sudah Diklaim
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => claimDailyQuest(q.id)}
                              className="px-3.5 py-1.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white text-[9px] font-black uppercase rounded-lg shadow-[0_2.5px_0_0_#5d8a32] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-sans"
                            >
                              Klaim Hadiah
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-black tracking-wider uppercase bg-[#1c1a18]/40 px-3 py-1.5 rounded-lg border border-[#3c3934]/30 font-sans">
                              Dalam Proses
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Premium Quests Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#3c3934]/30 pb-1.5">
                    <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400/10" />
                    <span className="text-[10px] font-black uppercase text-yellow-500 tracking-wider">Misi Premium (Khusus Akun Premium)</span>
                  </div>

                  {dailyQuests.filter(q => q.type === 'premium').map(q => {
                    const progressPercent = Math.min(100, (q.current / q.target) * 100);
                    const isCompleted = q.current >= q.target;
                    const isPremium = membershipStatus === 'premium';
                    
                    return (
                      <div key={q.id} className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 relative overflow-hidden ${
                        isPremium 
                          ? 'bg-[#2a261f] border-yellow-600/30' 
                          : 'bg-[#262421]/60 border-[#3c3934]/40 opacity-70'
                      }`}>
                        
                        {/* Overlay with Lock if not Premium */}
                        {!isPremium && (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 z-10 text-center">
                            <Lock className="w-4.5 h-4.5 text-yellow-500" />
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-1">Eksklusif Premium</span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-black text-white">{q.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{q.description}</p>
                            </div>
                            
                            {/* Reward Tag */}
                            <div className="flex items-center gap-1 bg-[#1a1815] px-2 py-1 rounded-lg border border-yellow-700/20">
                              <Gem className="w-3 h-3 text-cyan-400" />
                              <span className="text-[9px] font-black text-cyan-400 font-mono">+{q.rewardAmount}</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[9px] text-[#aa9e8a] font-bold mb-1">
                              <span>Progres</span>
                              <span>{q.current} / {q.target}</span>
                            </div>
                            <div className="w-full bg-[#1c1a18] h-1.5 rounded-full overflow-hidden border border-yellow-850/20">
                              <div 
                                className="bg-yellow-500 h-full transition-all duration-300" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end mt-1 font-sans">
                          {q.claimed ? (
                            <span className="text-[9px] text-[#aa9e8a] font-black tracking-wider uppercase bg-[#1a1815] px-3 py-1.5 rounded-lg border border-yellow-600/20 flex items-center gap-1">
                              <Check className="w-3 h-3 text-yellow-500 stroke-[3]" /> Sudah Diklaim
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => claimDailyQuest(q.id)}
                              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-[9px] font-black uppercase rounded-lg shadow-[0_2.5px_0_0_#b27b12] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-sans"
                            >
                              Klaim Berlian
                            </button>
                          ) : (
                            <span className="text-[9px] text-[#aa9e8a]/70 font-black tracking-wider uppercase bg-[#1a1815]/40 px-3 py-1.5 rounded-lg border border-yellow-750/10">
                              Dalam Proses
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* INBOX & FRIENDS HUB - INTEGRATED ON HOME SCREEN */}
            <div className="lg:col-span-12 mt-6">
              <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-3 mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-tight">
                    <Users className="w-4 h-4 text-cyan-400 shrink-0" /> Hub Sosial & Kotak Masuk Teman
                  </h3>
                  <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 text-[8px] font-black rounded uppercase">
                    Mabar Online Real-Time
                  </span>
                </div>

                {!user ? (
                  <div className="py-6 text-center max-w-md mx-auto">
                    <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-4 font-sans">
                      Masuk ke akun caturmu untuk menambahkan kawan, menerima tantangan tanding catur, dan mengirim surat inbox undangan bermain online secara real-time!
                    </p>
                    <button
                      onClick={() => {
                        setMode('profile');
                        triggerAudio('move');
                      }}
                      className="w-full py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] text-white font-extrabold rounded-lg shadow-[0_3px_0_0_#5d8a32] active:translate-y-0.5 active:shadow-none transition-all text-xs uppercase cursor-pointer"
                    >
                      Masuk atau Daftar Akun Catur 
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: ADD FRIENDS & GUIDES (4 cols) */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold tracking-wider text-[#9babaf] block text-left">Tambah Teman Baru</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={addFriendInput}
                            onChange={(e) => setAddFriendInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSendFriendRequest(); }}
                            disabled={isSocialLoading}
                            placeholder="Username kawan..."
                            className="flex-1 px-3 py-1.5 bg-[#262421] border border-[#3c3934] focus:border-[#81b64c] text-xs rounded-xl font-extrabold text-white focus:outline-none placeholder-slate-600 font-sans"
                          />
                          <button
                            onClick={handleSendFriendRequest}
                            disabled={isSocialLoading || !addFriendInput.trim()}
                            className="px-3 bg-[#81b64c] hover:bg-[#92ca5a] disabled:bg-[#3c3934] text-white font-black rounded-xl cursor-pointer shadow-[0_2.5px_0_0_#5d8a32]"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Pending friend requests as a compact list */}
                      {friendRequests.length > 0 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-yellow-500 block text-left font-sans">Permintaan Masuk ({friendRequests.length})</span>
                          {friendRequests.map((reqUser: string) => (
                            <div key={reqUser} className="flex items-center justify-between gap-2 border-b border-[#3c3934]/40 pb-1.5 last:border-0 last:pb-0 font-sans">
                              <span className="text-[11px] font-bold text-slate-200">@{reqUser}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleRespondToFriendRequest(reqUser, 'decline')}
                                  className="px-2 py-0.5 bg-[#3c3934] text-slate-300 rounded text-[8px] uppercase tracking-wider cursor-pointer font-sans"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleRespondToFriendRequest(reqUser, 'accept')}
                                  className="px-2 py-0.5 bg-[#81b64c] text-white font-bold rounded text-[8px] uppercase tracking-wider cursor-pointer font-sans"
                                >
                                  Oke
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-3.5 bg-[#262421] rounded-2xl border border-[#3c3934]/60 text-left font-sans">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-tight">Kawan Bermain</h4>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed">Tantang kawan Anda duel secara instan! Kotak surat dan undangan tanding kini disatukan dengan rapi pada tombol <span className="text-amber-400 font-extrabold">Surat</span> & <span className="text-cyan-400 font-extrabold">Teman</span> di navigasi bar atas agar layar game tetap bersih dan lapang.</p>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: FRIENDS LIST (8 cols) */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold tracking-wider text-[#9babaf] block">Tambah Hubungan Teman Baru</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={addFriendInput}
                            onChange={(e) => setAddFriendInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSendFriendRequest(); }}
                            disabled={isSocialLoading}
                            placeholder="Masukkan username teman catur..."
                            className="flex-1 px-3 py-1.5 bg-[#262421] border border-[#3c3934] focus:border-[#81b64c] text-xs rounded-xl font-extrabold text-white focus:outline-none placeholder-slate-600"
                          />
                          <button
                            onClick={handleSendFriendRequest}
                            disabled={isSocialLoading || !addFriendInput.trim()}
                            className="px-4 bg-[#81b64c] hover:bg-[#92ca5a] disabled:bg-[#3c3934] text-white font-black rounded-xl cursor-pointer shadow-[0_2.5px_0_0_#5d8a32]"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9babaf] block mb-2">Daftar Rekan Duel Anda ({friendsList.length})</span>
                        {friendsList.length === 0 ? (
                          <div className="py-6 bg-[#262421] border border-[#3c3934] rounded-2xl text-center text-slate-500 font-bold p-4 text-xs">
                            Belum ada relasi mabar. Masukkan nama kawan catur di atas!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {friendsList.map((friend: any) => (
                              <div key={friend.username} className="p-2.5 bg-[#262421] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3 shadow-xs hover:bg-[#2d2b28] transition-colors">
                                <div 
                                  className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                                  onClick={() => setSelectedFriendForDetail(friend)}
                                  title="Klik untuk melihat profil & pencapaian teman"
                                >
                                  <img
                                    src={friend.avatar || martinAvatar}
                                    alt="Friend"
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded-lg border border-[#3c3934] bg-neutral-900 object-cover shrink-0 group-hover:scale-105 transition-transform"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-[#a2e564] transition-colors truncate">@{friend.username}</h4>
                                    <span className="text-[9px] font-mono text-[#81b64c] font-black uppercase flex items-center gap-0.5">
                                      {friend.elo} ELO <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-[#81b64c]" />
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleInviteFriend(friend.username)}
                                    className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-lg text-[8px] uppercase tracking-wider cursor-pointer transition-all"
                                  >
                                    Tantang Duel
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFriend(friend.username)}
                                    title="Hapus Pertemanan"
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <UserMinus className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {homeActiveTab === 'community' && (
          <div className="animate-fade-in duration-300">
            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
            />
          </div>
        )}

        {homeActiveTab === 'forum' && (
          <div className="animate-fade-in duration-300">
            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="posts"
              hideTabsSelector={true}
            />
          </div>
        )}
      </div>
    )}

        {/* =========================================
             0.5 STANDALONE FULL PROFILE VIEW 
           ========================================= */}
        {mode === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Profil Arena Catur Anda <Crown className="w-5 h-5 text-yellow-500" />
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pb-4 border-b border-[#3c3934]">
              Pantau reputasi, kustomisasi avatar, dan lacak statistik pertandingan caturmu
            </p>

            {/* PROFILE SUB-PAGES NAVIGATION (EMOJI-FREE) */}
            <div className="flex gap-2 border-b border-[#3c3934] pb-4 flex-wrap">
              {[
                { id: 'profile', label: 'Informasi Profil' },
                { id: 'replay', label: 'Riwayat & Replay Duel' },
                { id: 'social', label: 'Hub Rekan Mabar' },
                { id: 'stats', label: 'Analisis & Progress ELO' }
              ].map((sub) => {
                const isSelected = profileActiveTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => { setProfileActiveTab(sub.id as any); triggerAudio('move'); }}
                    className={`px-4.5 py-2.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#81b64c] text-slate-950' 
                        : 'bg-[#262421] text-slate-400 hover:text-slate-200 hover:bg-[#312e2b]'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {profileActiveTab === 'profile' && (
              user ? (
                <div className="space-y-6">
                {/* PRIMARY AVATAR DETAILS CARD */}
                <div className="p-5 bg-[#312e2b] rounded-3xl border border-[#3c3934] flex flex-col sm:flex-row items-center gap-5 shadow-lg">
                  <div className="shrink-0 relative">
                    <AvatarWithFrame 
                      src={user.profileAvatar || martinAvatar} 
                      frameId={selectedFrame} 
                      size="xl" 
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-white text-xl font-black leading-tight truncate">
                        {user.username}
                      </span>
                      {membershipStatus === 'premium' && (
                        <span className="px-1.5 py-0.5 bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 text-[8px] font-black rounded uppercase tracking-wide">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9babaf] font-semibold leading-relaxed">
                      Slogan Catur: <span className="text-slate-350 italic">"{user.profileBio || 'Pecatur sejati pantang menyerah!'}"</span>
                    </p>
                    <div className="w-full bg-[#3c3934] h-2.5 rounded-full overflow-hidden mt-3 border border-[#4d4a44]">
                      <div className="bg-[#81b64c] h-full transition-all" style={{ width: `${Math.min(100, (xp % 100))}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mt-1 gap-2">
                      <span>Pangkat / Peringkat Pencatur</span>
                      <span>Level {Math.floor(xp / 100) + 1}</span>
                    </div>
                  </div>
                </div>

                {/* EDITING INTERFACES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                  {/* EDIT MOTTO/BIO STATUS */}
                  <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ubah Motto/Bio Personal:</span>
                      <p className="text-[11px] text-[#9babaf] leading-normal mb-3 font-semibold">Tulis motto catur inspiratifmu untuk ditampilkan di halaman profil utama!</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={profileEditingBio}
                        onChange={(e) => setProfileEditingBio(e.target.value)}
                        placeholder="Motto catur kamu..."
                        maxLength={50}
                        className="w-full sm:flex-1 bg-[#211f1d] border border-[#3c3934] rounded-xl px-3.5 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-[#81b64c]"
                      />
                      <button
                        type="button"
                        disabled={saveStatus === 'saving'}
                        onClick={() => {
                          syncUserStats(undefined, undefined, undefined, undefined, undefined, undefined, profileEditingBio);
                          triggerAudio('win');
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-xs font-extrabold rounded-xl shrink-0 transition-all hover:scale-105 uppercase tracking-wide cursor-pointer min-w-[95px]"
                      >
                        {saveStatus === 'saving' ? 'Proses...' : saveStatus === 'saved' ? 'Sukses! ' : saveStatus === 'error' ? 'Gagal ' : 'Simpan'}
                      </button>
                    </div>
                  </div>

                  {/* UPLOAD AVATAR FROM GALLERY */}
                  <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unggah Foto Profil dari Galeri:</span>
                      <p className="text-[11px] text-[#9babaf] leading-normal mb-3 font-semibold">Pilih file gambar dari galeri handphone atau komputermu sebagai avatar utama!</p>
                    </div>
                    <div>
                      <label className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#211f1d] border-2 border-dashed border-[#3c3934] hover:border-[#81b64c] rounded-xl cursor-pointer transition-all hover:bg-[#262421] group">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#81b64c] transition-colors" />
                        <span className="text-xs text-slate-300 font-bold group-hover:text-white transition-colors truncate">
                          Pilih Foto Galeri...
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Ukuran berkas melebihi batas (maksimal 2MB)");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = async (event) => {
                                const dataUrl = event.target?.result as string;
                                if (dataUrl) {
                                  await syncUserStats(undefined, undefined, undefined, undefined, undefined, dataUrl);
                                  triggerAudio('win');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* SET AVATAR FRAMES PANEL */}
                <div id="unlocked-frames-panel" className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      Koleksi Bingkai Avatar Anda
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 font-sans">
                      Ketuk pada bingkai catur elit yang telah Anda kumpulkan untuk langsung memasangnya!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    {AVATAR_FRAMES.map((frame) => {
                      const isUnlocked = unlockedFrames.includes(frame.id) || frame.id === 'none' || (membershipStatus === 'premium' && frame.isPremiumExclusive);
                      const isActive = selectedFrame === frame.id;

                      if (!isUnlocked) return null;

                      return (
                        <div 
                          key={frame.id}
                          onClick={() => equipAvatarFrame(frame.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between items-center text-center select-none ${
                            isActive 
                              ? 'bg-[#262421] border-[#81b64c] shadow-md shadow-[#81b64c]/10 scale-[1.02]' 
                              : 'bg-[#262421] border-[#3c3934]/60 hover:border-slate-500'
                          }`}
                        >
                          <div className="relative mb-2 shrink-0">
                            <AvatarWithFrame 
                              src={user.profileAvatar || martinAvatar} 
                              frameId={frame.id} 
                              size="md" 
                            />
                          </div>

                          <div className="space-y-1">
                            <h4 className={`font-bold text-[11px] leading-tight ${frame.themeColor}`}>{frame.name}</h4>
                            <span className={`text-[8px] px-1.5 py-0.5 font-black rounded-md uppercase border ${
                              isActive 
                                ? 'bg-emerald-950 text-[#81b64c] border-emerald-900/60' 
                                : 'bg-[#312e2b] text-slate-400 border-[#3c3934]'
                            }`}>
                              {isActive ? 'Aktif' : 'Gunakan'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Quick Link Card to the Store if they want more */}
                    <div 
                      onClick={() => { setMode('store'); triggerAudio('move'); }}
                      className="p-3.5 rounded-2xl border border-dashed border-[#3c3934] hover:border-[#81b64c] bg-[#1e1c1a]/55 hover:bg-[#2d2b27]/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[110px]"
                    >
                      <ShoppingBag className="w-5 h-5 text-slate-500 mb-1.5" />
                      <span className="text-[10px] text-slate-300 font-extrabold uppercase">Cari Lebih</span>
                      <span className="text-[8px] text-slate-500 font-bold mt-0.5">Beli di Toko</span>
                    </div>
                  </div>
                </div>

                {/* VISUAL GAME CHESS METRICS STATS */}
                <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
                    Statistik Karir Arena Anda
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {/* ELO */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Peringkat ELO</span>
                      <div className="text-md sm:text-lg font-black text-white mt-1.5">{onlineRating} PTS</div>
                    </div>

                    {/* XP */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Skor XP</span>
                      <div className="text-md sm:text-lg font-black text-[#FFC800] mt-1.5">{xp} XP</div>
                    </div>

                    {/* Streak */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Streak</span>
                      <div className="text-md sm:text-lg font-black text-orange-400 mt-1.5 font-mono">{streak} HARI</div>
                    </div>

                    {/* Total Match */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Total Tanding</span>
                      <div className="text-md sm:text-lg font-black text-slate-200 mt-1.5 font-mono">{user.matchesPlayed || 0} GAME</div>
                    </div>

                    {/* Win */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Kemenangan</span>
                      <div className="text-md sm:text-lg font-black text-[#81b64c] mt-1.5 font-mono">{user.matchesWon || 0} MENANG</div>
                    </div>

                    {/* Win rate */}
                    <div className="bg-[#262421] border border-[#3b3834] p-4 rounded-2xl text-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#9babaf] block">Win Rate</span>
                      <div className="text-md sm:text-lg font-black text-cyan-400 mt-1.5 font-mono">
                        {user.matchesPlayed ? Math.round(((user.matchesWon || 0) / user.matchesPlayed) * 100) : 0}% RATIO
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACHIEVEMENTS / PENCAPAIAN CATUR */}
                <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      Pencapaian & Prestasi Arena
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Kumpulkan kualifikasi Anda di papan catur arena untuk merebut lencana emas prestasi catur!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ACHIEVEMENTS.map((ach) => {
                      const userStats = {
                        played: user.matchesPlayed || 0,
                        won: user.matchesWon || 0,
                        elo: onlineRating,
                        xp: xp
                      };
                      const isUnlocked = checkAchievementUnlocked(ach, userStats);
                      const progress = getAchievementProgress(ach, userStats);
                      
                      const IconComponent = ach.targetType === 'played' ? Swords :
                                            ach.targetType === 'won' ? Crown :
                                            ach.targetType === 'elo' ? Award : Sparkles;

                      return (
                        <div 
                          key={ach.id} 
                          className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                            isUnlocked 
                              ? 'bg-[#2b3524] border-[#4c7c29]/55 shadow-xs' 
                              : 'bg-[#262421] border-[#3c3934]'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isUnlocked 
                                ? 'bg-[#374e2a] border-[#5d8a32]/60 text-[#85cb48]' 
                                : 'bg-[#1e1c1a] border-[#312e2b] text-slate-400'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-black tracking-tight ${isUnlocked ? 'text-[#a2e564]' : 'text-slate-300'}`}>
                                {ach.title}
                              </h4>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-snug">
                                {ach.description}
                              </p>
                              
                              <div className="mt-2.5 w-full bg-[#1c1a18] h-1.5 rounded-full overflow-hidden border border-[#2b2926]">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${isUnlocked ? 'bg-[#81b64c]' : 'bg-[#e5a034]'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-bold mt-1 text-slate-500">
                                <span>Kemajuan</span>
                                <span className={isUnlocked ? 'text-[#81b64c]' : 'text-[#e5a034]'}>
                                  {progress}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-start sm:justify-center shrink-0 pl-13 sm:pl-0 zinc-custom">
                            {claimedAchievements.includes(ach.id) ? (
                              <span className="bg-[#1c2e1c] text-emerald-400 text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-500/20 shadow-xs flex items-center">
                                Selesai
                              </span>
                            ) : isUnlocked ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const rewardXpVal = getAchievementRewardXp(ach.id);
                                  const nextXp = xp + rewardXpVal;
                                  setXp(nextXp);
                                  localStorage.setItem('xp', String(nextXp));
                                  const nextClaims = [...claimedAchievements, ach.id];
                                  setClaimedAchievements(nextClaims);
                                  
                                  if (user) {
                                    const updatedUser = { ...user, xp: nextXp, claimedAchievements: nextClaims };
                                    setUser(updatedUser);
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                    syncUserStats(onlineRating, nextXp, unlockedThemes, user.matchesPlayed || 0, user.matchesWon || 0, undefined, undefined, nextClaims);
                                  }
                                  triggerReward(rewardXpVal, `Pencapaian Diklaim: ${ach.title}!`);
                                  triggerAudio('win');
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-md hover:scale-105 active:scale-95 animate-pulse border border-yellow-300"
                              >
                                Klaim +{getAchievementRewardXp(ach.id)} XP
                              </button>
                            ) : (
                              <span className="bg-[#1c1a18] text-[#e5a034] text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-[#2d2a27]">
                                +{getAchievementRewardXp(ach.id)} XP
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* GUEST STATE DETAIL FOR PROFILE PAGE */
              <div className="bg-[#312e2b] rounded-3xl p-8 text-center border border-[#3c3934] max-w-lg mx-auto py-12 space-y-5">
                <div className="w-20 h-20 bg-[#262421] rounded-3xl flex items-center justify-center mx-auto border border-[#3c3934] shadow-md">
                  <User className="w-10 h-10 text-[#81b64c]" />
                </div>
                <h3 className="text-white font-black uppercase text-lg">Anda sedang bermain sebagai Tamu</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-semibold">
                  Sistem Arena Catur membatasi penyimpanan statistik jika tidak terdaftar! Buat akun barumu sekarang secara gratis untuk melacak ELO, melestarikan streak, dan menyimpan kustomisasi avatar!
                </p>
                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setShowAuthModal(true);
                      triggerAudio('move');
                    }}
                    className="px-8 py-3.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-md w-full max-w-[260px]"
                  >
                    Daftar / Masuk Akun
                  </button>
                </div>
              </div>
            ))}

            {/* PROFILE SUB-PAGES RENDER DIRECT FROM BUNDLE */}
            {(profileActiveTab === 'replay' || profileActiveTab === 'social') && (
              <Features17to25
                subTab={profileActiveTab}
                coins={coins}
                setCoins={setCoins}
                diamonds={diamonds}
                setDiamonds={setDiamonds}
                xp={xp}
                setXp={setXp}
                membershipStatus={membershipStatus}
                onlineHistory={onlineHistory}
                setOnlineHistory={setOnlineHistory}
                onlineRating={onlineRating}
                setOnlineRating={setOnlineRating}
                triggerAudio={triggerAudio}
                triggerReward={triggerReward}
                user={user}
                syncUserStats={syncUserStats}
                passLevel={passLevel}
                setPassLevel={setPassLevel}
                passXp={passXp}
                setPassXp={setPassXp}
                passStatus={passStatus}
                setPassStatus={setPassStatus}
                claimedPassRewards={claimedPassRewards}
                setClaimedPassRewards={setClaimedPassRewards}
                claimedRankRewards={claimedRankRewards}
                setClaimedRankRewards={setClaimedRankRewards}
                diamondSavings={diamondSavings}
                setDiamondSavings={setDiamondSavings}
                friendsList={friendsList}
                setFriendsList={setFriendsList}
              />
            )}

            {profileActiveTab === 'stats' && (
              <div className="animate-fade-in duration-300">
                <Features31to40
                  coins={coins}
                  setCoins={setCoins}
                  diamonds={diamonds}
                  setDiamonds={setDiamonds}
                  xp={xp}
                  setXp={setXp}
                  onlineRating={onlineRating}
                  setOnlineRating={setOnlineRating}
                  membershipStatus={membershipStatus}
                  triggerAudio={triggerAudio}
                  triggerReward={triggerReward}
                  setMode={setMode}
                  streak={streak}
                  receivedGifts={receivedGifts}
                  setReceivedGifts={setReceivedGifts}
                  unlockedSkins={unlockedSkins}
                  setUnlockedSkins={setUnlockedSkins}
                  unlockedThemes={unlockedThemes}
                  setUnlockedThemes={setUnlockedThemes}
                  unlockedFrames={unlockedFrames}
                  setUnlockedFrames={setUnlockedFrames}
                  initialTab="stats"
                  hideTabsSelector={true}
                />
              </div>
            )}
          </div>
        )}

        {/* =========================================
             STANDALONE RANK VIEW (EMOJI-FREE)
           ========================================= */}
        {mode === 'rank' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setMode('home'); triggerAudio('move'); }} 
                className="p-2.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] rounded-xl text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                title="Kembali ke Beranda"
              >
                <span className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">&#8592; Beranda</span>
              </button>
              <span className="text-xs font-bold text-slate-500">/ Pangkat</span>
            </div>

            <Features17to25
              subTab="rank"
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              membershipStatus={membershipStatus}
              onlineHistory={onlineHistory}
              setOnlineHistory={setOnlineHistory}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              user={user}
              syncUserStats={syncUserStats}
              passLevel={passLevel}
              setPassLevel={setPassLevel}
              passXp={passXp}
              setPassXp={setPassXp}
              passStatus={passStatus}
              setPassStatus={setPassStatus}
              claimedPassRewards={claimedPassRewards}
              setClaimedPassRewards={setClaimedPassRewards}
              claimedRankRewards={claimedRankRewards}
              setClaimedRankRewards={setClaimedRankRewards}
              diamondSavings={diamondSavings}
              setDiamondSavings={setDiamondSavings}
              friendsList={friendsList}
              setFriendsList={setFriendsList}
            />
          </div>
        )}

        {/* =========================================
             STANDALONE SEASON PASS VIEW (EMOJI-FREE)
           ========================================= */}
        {mode === 'season-pass' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setMode('home'); triggerAudio('move'); }} 
                className="p-2.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] rounded-xl text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                title="Kembali ke Beranda"
              >
                <span className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">&#8592; Beranda</span>
              </button>
              <span className="text-xs font-bold text-slate-500">/ Battle Pass</span>
            </div>

            <Features17to25
              subTab="pass"
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              membershipStatus={membershipStatus}
              onlineHistory={onlineHistory}
              setOnlineHistory={setOnlineHistory}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              user={user}
              syncUserStats={syncUserStats}
              passLevel={passLevel}
              setPassLevel={setPassLevel}
              passXp={passXp}
              setPassXp={setPassXp}
              passStatus={passStatus}
              setPassStatus={setPassStatus}
              claimedPassRewards={claimedPassRewards}
              setClaimedPassRewards={setClaimedPassRewards}
              claimedRankRewards={claimedRankRewards}
              setClaimedRankRewards={setClaimedRankRewards}
              diamondSavings={diamondSavings}
              setDiamondSavings={setDiamondSavings}
              friendsList={friendsList}
              setFriendsList={setFriendsList}
            />
          </div>
        )}

        {/* =========================================
             0.7 STANDALONE SETTINGS VIEW 
           ========================================= */}
        {mode === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Pengaturan & Pedoman Arena <Settings className="w-5 h-5 text-[#81b64c]" />
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pb-4 border-b border-[#3c3934]">
              Modifikasi kontrol preferensi, pelajari aturan bermain, atau kelola opsi stats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: CONTROL PREFERENCES */}
              <div className="md:col-span-6 space-y-6">
                
                {/* PREFERENCE 1: CONSOLE AUDIO SOUND TOGGLE */}
                <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Efek Suara Lapangan</h4>
                      <p className="text-[10px] text-[#9babaf] font-semibold mt-0.5">Bunyi pergerakan, pemakanan bidak, skak, kemenangan catur</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSoundEnabled(val);
                          localStorage.setItem('sound', String(val));
                          if (val) triggerAudio('move');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#262421] border border-[#3c3934] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#bab9b8] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#81b64c] peer-checked:after:bg-white" />
                    </label>
                  </div>
                </div>

                {/* PREFERENCE 2: DEFAULT CHESS CLOCK LIMIT */}
                <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-4">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Durasi Waktu Tanding Default</h4>
                    <p className="text-[10px] text-[#9babaf] font-semibold mt-0.5">Batas default jam pasir tanding vs komputer (simulasi bot)</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '5 Mnt', val: 300 },
                      { label: '10 Mnt', val: 600 },
                      { label: '15 Mnt', val: 900 },
                      { label: '30 Mnt', val: 1800 }
                    ].map((clockItem) => {
                      const isActive = timerLimit === clockItem.val;
                      return (
                        <button
                          key={clockItem.val}
                          type="button"
                          onClick={() => {
                            setTimerLimit(clockItem.val);
                            localStorage.setItem('timerLimit', String(clockItem.val));
                            triggerAudio('move');
                          }}
                          className={`py-2 px-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${isActive ? 'bg-[#81b64c] text-white border-[#81b64c]' : 'bg-[#262421] border-[#3c3934] text-slate-300 hover:border-slate-500'}`}
                        >
                          {clockItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RESET STATISTICS DANGER BUTTON */}
                <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-3">
                  <h4 className="font-extrabold text-red-400 text-sm">Reset Seluruh Data Catur</h4>
                  <p className="text-[10px] text-[#9babaf] font-semibold">Mengembalikan stats ELO, XP, serta kustomisasi board ke status bawaan semula.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!resetConfirmActive) {
                        setResetConfirmActive(true);
                      } else {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    onMouseLeave={() => setResetConfirmActive(false)}
                    className={`w-full mt-1.5 py-2.5 font-black text-xs rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                      resetConfirmActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                        : 'bg-red-950 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/65'
                    }`}
                  >
                    {resetConfirmActive ? "KLIK SEKALI LAGI UNTUK MENGHAPUS!" : "Reset Memori & Stats"}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE CHESS RULES HANDBOOK */}
              <div className="md:col-span-6 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md space-y-4">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#81b64c]" /> Buku Panduan Aturan Spesial Catur
                </h3>
                
                <div className="space-y-3">
                  {/* CASTLING RULE */}
                  <div className="p-3.5 bg-[#262421] rounded-xl border border-[#3c3934]/65">
                    <h5 className="font-extrabold text-[#ea9c1a] text-xs uppercase mb-1 flex items-center gap-1">1. ROKADE (CASTLING) <Shield className="w-3.5 h-3.5 text-[#ea9c1a] fill-[#ea9c1a]/10" /></h5>
                    <p className="text-[11px] text-[#bab9b8] font-semibold leading-relaxed">
                      Gerakan khusus menyelamatkan Raja dengan menggesernya 2 langkah ke samping, lalu melompati Raja menggunakan Benteng. Hanya legal bila Raja & Benteng belum pernah bergeser, dan tidak ada bidak penghalang!
                    </p>
                  </div>

                  {/* EN PASSANT RULE */}
                  <div className="p-3.5 bg-[#262421] rounded-xl border border-[#3c3934]/65">
                    <h5 className="font-extrabold text-[#ea9c1a] text-xs uppercase mb-1 flex items-center gap-1">2. EN PASSANT <Swords className="w-3.5 h-3.5 text-[#ea9c1a]" /></h5>
                    <p className="text-[11px] text-[#bab9b8] font-semibold leading-relaxed">
                      Ketika pion lawan melangkah maju 2 petak sekaligus dan berakhir persis bersampingan dengan pion penyerang Anda, Anda diizinkan memakan pion tersebut secara diagonal seakan dia hanya bergeser 1 petak!
                    </p>
                  </div>

                  {/* PROMOTION RULE */}
                  <div className="p-3.5 bg-[#262421] rounded-xl border border-[#3c3934]/65">
                    <h5 className="font-extrabold text-[#ea9c1a] text-xs uppercase mb-1 flex items-center gap-1">3. PROMOSI PION <Crown className="w-3.5 h-3.5 text-[#ea9c1a] fill-[#ea9c1a]/10" /></h5>
                    <p className="text-[11px] text-[#bab9b8] font-semibold leading-relaxed">
                      Langkah hebat ketika pion Anda yang gigih berhasil menembus rentetan pertahanan musuh hingga baris ujung papan lawan. Pion tersebut langsung bermutasi secara luar biasa menjadi Ratu, Benteng, Gajah atau Kuda!
                    </p>
                  </div>
                </div>
              </div>

            </div>
              </div>
            )}

        {/* =========================================
             1. CORE DASHBOARD / MAIN MENU VIEW 
           ========================================= */}
        {mode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* HERO MOTIVATIONAL CARD */}
            <div className="md:col-span-12 bg-[#312e2b] rounded-3xl p-6 sm:p-8 border border-[#3c3934] flex flex-col sm:flex-row items-center gap-6 justify-between shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500/10 animate-pulse shrink-0" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Tingkatkan ELO Catur Anda Hari Ini!</h2>
                  <p className="text-[#bab9b8] text-sm mt-1.5 font-semibold max-w-xl">
                    Asah taktik tanding, kuasai teori pembukaan legendaris, dan tantang bot mesin AI catur berkarakter yang dilatih khusus dengan kecerdasan Gemini AI.
                  </p>
                </div>
              </div>
            </div>

            {/* GAME SPEED TYPE SELECTORS AND CASUAL MODE ACCORDING TO USER'S DIRECT RECOMMENDATION */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Batas Waktu / Format Tanding */}
              <div className="bg-[#312e2b] p-5 rounded-3xl border border-[#3c3934] flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
                <div>
                  <h4 className="font-extrabold text-[#81b64c] uppercase tracking-wide text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Format & Kendali Waktu Tanding
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 font-semibold leading-normal">Tentukan batas jam tanding default sebelum mulai bermain.</p>
                </div>
                <div className="flex gap-1.5 bg-[#262421] p-1 border border-[#3c3934] rounded-xl shrink-0">
                  {(['rapid', 'blitz', 'bullet'] as const).map((speed) => {
                    const isSelected = gameSpeedType === speed;
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => {
                          setGameSpeedType(speed);
                          const limit = speed === 'bullet' ? 60 : speed === 'blitz' ? 180 : 600;
                          setTimerLimit(limit);
                          localStorage.setItem('timerLimit', String(limit));
                          triggerAudio('move');
                        }}
                        className={`px-3 py-1.5 text-[9px] uppercase font-black tracking-wider rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-[#81b64c] text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Kausal Friendly */}
              <div className="bg-[#312e2b] p-5 rounded-3xl border border-[#3c3934] flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
                <div>
                  <h4 className="font-extrabold text-blue-400 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Mode Match Friendly (Kausal)
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 font-semibold leading-normal">Main santai tanpa mempertaruhkan ELO rating berharga Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isCasualMatch;
                    setIsCasualMatch(nextVal);
                    localStorage.setItem('casual_match_mode', String(nextVal));
                    triggerAudio('move');
                  }}
                  className={`px-4 py-2 text-[10px] uppercase border cursor-pointer transition-all font-black rounded-lg ${
                    isCasualMatch 
                      ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/60' 
                      : 'bg-[#81b64c]/10 text-[#81b64c] border-[#81b64c]/20 hover:bg-[#81b64c]/20'
                  }`}
                >
                  {isCasualMatch ? 'Friendly (Kausal)' : 'Kompetitif (ELO)'}
                </button>
              </div>
            </div>

            {/* SEVEN COLUMN RESPONSIVE GRID CARD CHOICES */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              
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
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-[#81b64c] hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
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

              {/* CARD 5: MAIN VS TEMAN (NEW) */}
              <div 
                onClick={() => {
                  setFriendLobbyType('local');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-cyan-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#01a3a4] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Swords className="w-8 h-8 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Main vs Teman</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Sparing seru bersama teman dekat via Pass & Play lokal (Satu Layar) atau mabar online kustom dengan PIN!
                </p>
                <div className="mt-5 flex items-center text-cyan-500 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  Mabar Teman <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 6: TOURNAMENT BRACKET ARENA MODE */}
              <div 
                onClick={() => {
                  setMode('tournament');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-yellow-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group font-sans"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8 fill-white/10 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Turnamen Braket</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Ikuti liga sistem gugur knockout 8-pemain. Tantang jawara catur, rebut tahta podium, dan raih koin melimpah!
                </p>
                <div className="mt-5 flex items-center text-yellow-500 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  IKUT TURNAMEN <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 7: GUILD CLAN CHESS WAR MODE */}
              <div 
                onClick={() => {
                  setMode('guild-suku');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-[#81b64c] hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group font-sans"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#81b64c] text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 fill-white/10 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Klub & Suku Klan</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Pasukan klan taktis Anda. Selesaikan kontribusi harian, tukar fragment skin, dan obrolan antarpemain langsung!
                </p>
                <div className="mt-5 flex items-center text-indigo-400 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  MASUK KLUB <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 8: FORUM & DISKUSI */}
              <div 
                onClick={() => {
                  setMode('forum-diskusi');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-purple-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group font-sans"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 fill-white/10 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Forum & Diskusi</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Bagikan teori pembukaan catur, buat postingan diskusi taktis harian, dan obrolan komunitas antarpemain!
                </p>
                <div className="mt-5 flex items-center text-purple-400 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  BUKA FORUM <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 9: HADIAH & DEAL SALE */}
              <div 
                onClick={() => {
                  setMode('toko-deals');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-rose-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group font-sans"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 fill-white/10 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Toko Sale & Hadiah</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Kirim bingkisan sosial ke sehabat untuk menambah level afinitas, dan klaim promo kilat Flash Sale hari Jumat!
                </p>
                <div className="mt-5 flex items-center text-rose-400 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  KIRIM HADIAH <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* CARD 10: DATA STATISTIK ELO */}
              <div 
                onClick={() => {
                  setMode('statistik-elo');
                  triggerAudio('move');
                }}
                className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] hover:border-orange-500 hover:bg-[#3c3934] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center group font-sans"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <LineChart className="w-8 h-8 fill-white/10 stroke-white/80" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Kurva ELO & Streak</h3>
                <p className="text-[#9babaf] text-xs font-semibold leading-relaxed">
                  Tinjau data kurva telemetri ELO historis, tracker kontinyu streak login harian, dan unlock pencapaian rahasia!
                </p>
                <div className="mt-5 flex items-center text-orange-400 font-black group-hover:translate-x-1.5 transition-transform text-xs uppercase tracking-wide gap-1">
                  CEK STATISTIK <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* LOWER STATS AND ACCESSORY ROW */}
            <div className="md:col-span-12 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
              <h3 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#81b64c] fill-[#81b64c]" />
                Klub Statistik Premium Anda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-3 md:border-b-0 md:border-r md:border-[#3c3934]/60 md:pr-6 md:pb-0">
                  <span className="text-[#9babaf] text-sm font-bold">Aktivitas Beruntun</span>
                  <span className="text-white font-extrabold text-md">{streak} Hari</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-3 md:border-b-0 md:border-r md:border-[#3c3934]/60 md:pr-6 md:pb-0">
                  <span className="text-[#9babaf] text-sm font-bold">Poin Keahlian</span>
                  <span className="text-white font-extrabold text-md">{xp} XP</span>
                </div>
                <div className="flex items-center justify-between pb-1 md:pb-0">
                  <span className="text-[#9babaf] text-sm font-bold">Status Keanggotaan</span>
                  <span className="text-[#81b64c] font-black uppercase text-[10px] px-2.5 py-1 bg-[#262421] rounded-lg border border-[#3c3934]">Gold Member</span>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-[#3c3934]/40 flex justify-end">
                <button
                  onClick={() => { setMode('store'); triggerAudio('move'); }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] shadow-[0_4px_0_0_#211f1d] active:translate-y-1 active:shadow-none transition-all font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#81b64c]" /> Buka Toko Board & Tema
                </button>
              </div>
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
              {CHARACTERS.map((char) => {
                const isLocked = (char.id === 'wally' || char.id === 'magnus') && membershipStatus !== 'premium';
                return (
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

                      {isLocked && (
                        <div className="absolute top-3 right-3 bg-red-650/95 text-white py-1 px-2.5 rounded-lg border border-red-500/30 flex items-center gap-1.5 shadow-md z-10 transition-colors animate-pulse">
                          <Lock className="w-3 h-3 text-white" />
                          <span className="text-[8px] font-black tracking-widest uppercase">Premium</span>
                        </div>
                      )}

                      <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-[#312e2b] shadow-lg transform group-hover:scale-105 transition-transform ${isLocked ? 'grayscale' : ''}`}>
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
                          <h3 className="text-xl font-extrabold text-white flex items-center gap-1.5">
                            {char.name}
                            {isLocked && <Lock className="w-4 h-4 text-yellow-500" />}
                          </h3>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-[#262421] text-[#9babaf] border border-[#3c3934]">
                            {char.difficulty}
                          </span>
                        </div>
                        <p className="text-[#81b64c] text-xs font-bold mb-3 uppercase tracking-wider">{char.playstyle}</p>
                        <p className="text-[#bab9b8] text-sm font-semibold leading-relaxed mb-4">{char.bio}</p>
                      </div>

                      <button 
                        className={`w-full py-3 text-white font-extrabold rounded-xl active:translate-y-1 active:shadow-none cursor-pointer transition-all uppercase text-xs flex items-center justify-center gap-1.5 ${isLocked ? 'bg-[#FFC800] hover:bg-yellow-400 shadow-[0_4px_0_0_#b38b00]' : 'bg-[#81b64c] group-hover:bg-[#92ca5a] shadow-[0_4px_0_0_#5d8a32]'}`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 stroke-[2.5]" /> Unlock Premium
                          </>
                        ) : "Bermain Bersama"}
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  {gameResult === 'win-time' && 'Waktu AI habis! Kamu menang secara waktu!'}
                  {gameResult === 'lose' && 'Skakmat! Kamu kalah dari AI.'}
                  {gameResult === 'lose-time' && 'Waktumu habis! Kamu kalah secara waktu.'}
                  {gameResult === 'draw' && 'Seri (Draw) ! Papan terkunci.'}
                </div>
              )}

              {/* LAST MOVE ANALYSIS BADGE */}
              {lastMove && lastMove.type && (
                <div className={`px-4 py-2 rounded-xl border flex items-center justify-between gap-3 text-[11px] w-full max-w-md ${EVALUATION_LABELS[lastMove.type]?.bg} shadow-md animate-fade-in select-none`}>
                  <div className="flex items-center gap-2 font-bold text-white">
                    {lastMove.type === 'book' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    ) : (
                      <span className="text-sm">{EVALUATION_LABELS[lastMove.type]?.icon}</span>
                    )}
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
                    <AvatarWithFrame 
                      src={selectedCharacter.avatar} 
                      frameId={
                        selectedCharacter.name.toLowerCase().includes('martin') ? 'none' :
                        selectedCharacter.name.toLowerCase().includes('nelson') ? 'bronze' :
                        selectedCharacter.name.toLowerCase().includes('wally') ? 'silver' :
                        'cosmic'
                      } 
                      size="xs" 
                      isBot={true}
                    />
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
                {renderCapturedList(getCapturedPieces().capturedByBlack, 'w')}
                {renderChessboard()}
                {renderCapturedList(getCapturedPieces().capturedByWhite, 'b')}

                {/* PLAYER BOTTOM NAME PLATE */}
                <div className="flex items-center justify-between mt-2 px-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <AvatarWithFrame 
                      src={user?.profileAvatar || martinAvatar} 
                      frameId={selectedFrame} 
                      size="xs" 
                    />
                    <div className="flex items-center gap-1">
                      {membershipStatus === 'premium' && (
                        <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/10 shrink-0" />
                      )}
                      <span className={`text-xs font-black tracking-wide uppercase ${
                        membershipStatus === 'premium' ? 'text-yellow-400 font-extrabold' : 'text-white'
                      }`}>
                        {user ? user.username : username} (Kamu)
                      </span>
                    </div>
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
             3B. LOCAL FRIEND MATCH (PASS & PLAY)
           ========================================= */}
        {mode === 'local-friend' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* IN-GAME TOP BAR */}
            <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#312e2b] p-4 rounded-2xl border border-[#3c3934] shadow-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="py-2.5 px-4 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] font-extrabold rounded-xl transition-all text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_0_#1d1b19] active:translate-y-0.5 active:shadow-none"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" /> Menu Utama
                </button>
                <div>
                  <h3 className="font-extrabold text-white text-md uppercase">Pass & Play Lokal</h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Satu layar bergantian</p>
                </div>
              </div>

              {/* ACTIVE TURN METRICS DISPLAY */}
              <div className="flex items-center gap-3 bg-[#262421] px-5 py-2 rounded-xl border border-[#3c3934]">
                <div className={`w-3.5 h-3.5 rounded-full ${chessRef.current.turn() === 'w' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#151515] border border-[#555]'}`} />
                <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                  GILIRAN: {chessRef.current.turn() === 'w' ? (localFriendWName || "PEMAIN PUTIH") : (localFriendBName || "PEMAIN HITAM")}
                </span>
              </div>

              {/* GAME OVER CARD / ANALYZE LINK */}
              {(chessRef.current.isGameOver() || localFriendResigned) && (
                <div className="flex items-center gap-3 bg-red-950/20 px-4 py-2 rounded-xl border border-red-900/40">
                  <span className="text-red-400 font-extrabold text-xs uppercase">
                    {localFriendResigned 
                      ? `${localFriendResigned === 'w' ? (localFriendBName || "PEMAIN HITAM") : (localFriendWName || "PEMAIN PUTIH")} MENANG (RESIGN)!` 
                      : "Permainan Selesai!"}
                  </span>
                  <button
                    onClick={() => {
                      setMode('analysis');
                      setAnalysisStepIdx(0);
                      triggerAudio('win');
                    }}
                    className="px-4 py-2 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-xs font-black rounded-lg uppercase tracking-wider cursor-pointer animate-pulse"
                  >
                    Mulai Analisis AI
                  </button>
                </div>
              )}
            </div>

            {/* CHESSBOARD ROW (LOKAL MULTIPLAYER) */}
            <div className="lg:col-span-7 flex flex-col items-center gap-3">
              {renderCapturedList(getCapturedPieces().capturedByBlack, 'w')}
              <div className="w-full max-w-[500px] aspect-square bg-[#262421] rounded-2xl overflow-hidden border-4 border-[#3c3934] relative shadow-2xl">
                
                {/* Chess grid mapping */}
                <div 
                  className="w-full h-full grid grid-cols-8 grid-rows-8 transition-transform duration-500"
                  style={{
                    transform: (localFriendRotates && chessRef.current.turn() === 'b') ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  {board.map((rowArr, rIdx) => 
                    rowArr.map((squareObj, cIdx) => {
                      // Adjust row/col indexes for visual flip
                      const displayRow = rIdx;
                      const displayCol = cIdx;
                      
                      const file = ['a','b','c','d','e','f','g','h'][displayCol];
                      const rank = 8 - displayRow;
                      const squareName = `${file}${rank}`;
                      
                      const isDark = (displayRow + displayCol) % 2 === 1;
                      const isSelected = selectedSquare === squareName;
                      const isDragging = draggingSquare === squareName;
                      const isTargetChoice = validMoves.includes(squareName);
                      const isFlashed = invalidSquareFlash === squareName;

                      // Source & Destination highlights of the last move
                      const isLastMoveSrc = lastMove && lastMove.from === squareName;
                      const isLastMoveDst = lastMove && lastMove.to === squareName;

                      const isHighlighted = isSelected || isLastMoveSrc || isLastMoveDst || isTargetChoice || isFlashed;
                      let squareBg = '';
                      
                      if (isSelected) squareBg = 'bg-yellow-500/40';
                      else if (isLastMoveSrc || isLastMoveDst) squareBg = 'bg-teal-500/25';
                      else if (isTargetChoice) squareBg = isDark ? 'bg-[#5c7a43]' : 'bg-[#7c9a63]';
                      else if (isFlashed) squareBg = 'bg-red-600/60';

                      return (
                        <div
                          key={squareName}
                          onClick={() => handleSquareClick(squareName)}
                          onDragOver={(e) => handleDragOver(e, squareName)}
                          onDrop={(e) => handleDrop(e, squareName)}
                          className={`relative aspect-square flex items-center justify-center transition-colors font-sans select-none overflow-hidden cursor-pointer ${squareBg}`}
                          style={{
                            backgroundColor: isHighlighted ? undefined : (isDark ? activeThemeConfig.secondaryColor : activeThemeConfig.primaryColor)
                          }}
                        >
                          {/* Chess piece graphics */}
                          {squareObj && (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, squareName)}
                              className={`w-[85%] h-[85%] flex items-center justify-center z-10 transition-transform ${isDragging ? 'opacity-30' : ''}`}
                              style={{
                                transform: (localFriendRotates && chessRef.current.turn() === 'b') ? 'rotate(180deg)' : 'rotate(0deg)'
                              }}
                            >
                              <ChessPiece type={squareObj.type} color={squareObj.color} skin={selectedSkin} />
                            </div>
                          )}

                          {/* Move suggestion overlay */}
                          {isTargetChoice && !squareObj && (
                            <div className="w-5 h-5 rounded-full bg-black/15 z-25 absolute" />
                          )}

                          {/* Coordinates */}
                          {displayCol === 0 && (
                            <span className="absolute top-1 left-1 text-[8px] font-bold text-slate-400 select-none">
                              {rank}
                            </span>
                          )}
                          {displayRow === 7 && (
                            <span className="absolute bottom-1 right-1 text-[8px] font-bold text-slate-400 select-none">
                              {file}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Promotion choices absolute overlay */}
                {promotionPendingMove && promotionPendingMove.modeType === 'friend' && (
                  <div className="absolute inset-0 bg-[#262421]/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 text-center rounded-2xl">
                    <span className="text-white text-xs font-black uppercase tracking-wider mb-3 flex items-center justify-center gap-1 font-sans">
                      <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/10" /> Pilih Promosi Bidak Catur
                    </span>
                    <div className="grid grid-cols-4 gap-2.5">
                      {[
                        { type: 'q', label: 'Ratu' },
                        { type: 'r', label: 'Benteng' },
                        { type: 'b', label: 'Gajah' },
                        { type: 'n', label: 'Kuda' }
                      ].map((p) => (
                        <button
                          key={p.type}
                          onClick={() => {
                            const { from, to } = promotionPendingMove;
                            setPromotionPendingMove(null);
                            makeMove(from, to, p.type);
                            triggerAudio('win');
                          }}
                          className="bg-[#312e2b] hover:bg-[#81b64c] border border-[#4d4a44] p-2.5 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 text-white hover:scale-105"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <ChessPiece type={p.type as any} color={chessRef.current.turn()} skin={selectedSkin} />
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-300 capitalize">{p.label}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setPromotionPendingMove(null);
                        setSelectedSquare(null);
                      }}
                      className="mt-4 text-[9px] uppercase font-bold text-red-400 hover:text-red-300 tracking-wider cursor-pointer transition-colors"
                    >
                      Batalkan Langkah
                    </button>
                  </div>
                )}
              </div>
              {renderCapturedList(getCapturedPieces().capturedByWhite, 'b')}
              
              {/* Bottom control row */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-[500px]">
                <button
                  onClick={() => {
                    setLocalFriendRotates(prev => !prev);
                    triggerAudio('move');
                  }}
                  className="flex-1 py-2.5 bg-[#2d302e] hover:bg-[#3c3934] text-xs font-black text-slate-300 rounded-xl border border-[#3c3934] uppercase tracking-wide cursor-pointer transition-colors"
                >
                  Rotasi Otomatis: {localFriendRotates ? "AKTIF" : "OFF"}
                </button>

                {!chessRef.current.isGameOver() && !localFriendResigned && (
                  <button
                    onClick={() => {
                      const currentTurn = chessRef.current.turn();
                      setLocalFriendResigned(currentTurn);
                      triggerAudio('error');
                    }}
                    className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-xs font-black text-white hover:text-red-100 rounded-xl border border-red-800 uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_3px_0_0_#9a2c2c] active:translate-y-0.5"
                  >
                    <Flag className="w-3.5 h-3.5 text-white" /> Bendera Putih (Resign)
                  </button>
                )}

                <button
                  onClick={() => {
                    chessRef.current = new Chess();
                    setBoard(chessRef.current.board());
                    setMoveHistory([]);
                    setLastMove(null);
                    setAnalysisHistory([]);
                    setSelectedSquare(null);
                    setGameResult(null);
                    setLocalFriendResigned(null);
                    triggerAudio('move');
                  }}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-xs font-black text-red-400 rounded-xl border border-red-500/20 uppercase tracking-wide cursor-pointer transition-colors"
                >
                  Atur Ulang Papan 
                </button>
              </div>
            </div>

            {/* SIDEBAR LISTS (MOVE HISTORY & EVALS) */}
            <div className="lg:col-span-5 bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md self-stretch flex flex-col justify-between">
              <div>
                <h4 className="text-white font-extrabold uppercase text-sm tracking-widest mb-4 flex items-center gap-1.5 border-b border-[#3c3934] pb-3">
                  <History className="w-4 h-4 text-cyan-400" /> Riwayat Tanding Lokal
                </h4>
                
                <div className="min-h-[160px] max-h-[300px] overflow-y-auto bg-[#262421] rounded-xl p-4 border border-[#3c3934]">
                  {moveHistory.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-xs font-semibold uppercase">Belum ada langkah</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => (
                        <div key={idx} className="col-span-3 grid grid-cols-3 hover:bg-white/5 py-1 px-1.5 rounded">
                          <span className="text-slate-500">{idx + 1}.</span>
                          <span className="text-white font-black">{moveHistory[idx * 2]}</span>
                          <span className="text-cyan-400 font-black">{moveHistory[idx * 2 + 1] || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] mt-6">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">PETUNJUK</span>
                <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                  Selesai bermain? Anda dapat menganalisis permainan ini langsung dengan algoritma Evaluasi Gemini AI dan melihat akurasi langkah dari masing-masing pemain!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
             3C. CHESS GAME ANALYSIS SYSTEM (PREMIUM ANALYZER)
           ========================================= */}
        {mode === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ANALYSIS HUD BAR */}
            <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#312e2b] p-4 rounded-2xl border border-[#3c3934] shadow-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="py-2.5 px-4 bg-[#262421] hover:bg-[#3c3934] text-white border border-[#3c3934] font-extrabold rounded-xl transition-all text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_0_#1d1b19] active:translate-y-0.5 active:shadow-none"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Menu Utama
                </button>
                <div>
                  <h3 className="font-extrabold text-white text-md uppercase">Studio Analisis AI Premium</h3>
                  <p className="text-[10px] text-[#81b64c] font-black uppercase tracking-wider">Langkah-Demi-Langkah & Kualitas Evaluasi</p>
                </div>
              </div>

              {/* STATS COUNT FOR BLUNDERS, MISSES, ETC. */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 rounded-full border border-[#3c3934] text-xs">
                  <span className="text-emerald-400 font-extrabold">Brilian: {analysisHistory.filter(h => h.type === 'brilliant').length}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 rounded-full border border-[#3c3934] text-xs">
                  <span className="text-yellow-400 font-extrabold">Terbaik: {analysisHistory.filter(h => h.type === 'best' || h.type === 'excellent').length}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 rounded-full border border-[#3c3934] text-xs">
                  <span className="text-orange-400 font-extrabold">Inakurasi: {analysisHistory.filter(h => h.type === 'inaccuracy').length}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#262421] px-2.5 py-1 rounded-full border border-[#3c3934] text-xs">
                  <span className="text-red-400 font-extrabold">Blunder: {analysisHistory.filter(h => h.type === 'blunder' || h.type === 'mistake').length}</span>
                </div>
              </div>
            </div>

            {/* CHESSBOARD VIEWER */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[500px] aspect-square bg-[#262421] rounded-2xl overflow-hidden border-4 border-[#3c3934] relative shadow-2xl">
                
                {/* Chess Grid representing active analysis FEN board position */}
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {(() => {
                    // Reconstruct board at current analysisStepIdx state
                    let analysisChess = new Chess();
                    for (let i = 0; i < Math.min(analysisStepIdx + 1, analysisHistory.length); i++) {
                      try {
                        analysisChess.move(analysisHistory[i].san);
                      } catch (err) {}
                    }
                    const activeBoard = analysisChess.board();
                    const lastStep = analysisHistory[analysisStepIdx];

                    return activeBoard.map((rowArr, rIdx) => 
                      rowArr.map((squareObj, cIdx) => {
                        const file = ['a','b','c','d','e','f','g','h'][cIdx];
                        const rank = 8 - rIdx;
                        const squareName = `${file}${rank}`;
                        
                        const isDark = (rIdx + cIdx) % 2 === 1;

                        // Highlight source & destination for the current steps move
                        const isCurrentMoveSrc = lastStep && lastStep.from === squareName;
                        const isCurrentMoveDst = lastStep && lastStep.to === squareName;

                        const isHighlighted = isCurrentMoveSrc || isCurrentMoveDst;
                        let squareBg = '';
                        if (isCurrentMoveSrc || isCurrentMoveDst) {
                          squareBg = 'bg-teal-500/25';
                        }

                        return (
                          <div
                            key={squareName}
                            className={`relative aspect-square flex items-center justify-center select-none font-sans overflow-hidden ${squareBg}`}
                            style={{
                              backgroundColor: isHighlighted ? undefined : (isDark ? activeThemeConfig.secondaryColor : activeThemeConfig.primaryColor)
                            }}
                          >
                            {squareObj && (
                              <div className="w-[85%] h-[85%] flex items-center justify-center z-10">
                                <ChessPiece type={squareObj.type} color={squareObj.color} skin={selectedSkin} />
                              </div>
                            )}

                            {/* Coordinates labels */}
                            {cIdx === 0 && (
                              <span className="absolute top-1 left-1 text-[8px] font-bold text-slate-400">
                                {rank}
                              </span>
                            )}
                            {rIdx === 7 && (
                              <span className="absolute bottom-1 right-1 text-[8px] font-bold text-slate-400">
                                {file}
                              </span>
                            )}
                          </div>
                        );
                      })
                    );
                  })()}
                </div>
              </div>

              {/* TIMELINE NAVIGATION BACK/FORTH CONTROLS */}
              <div className="flex gap-4 mt-5 w-full max-w-[500px]">
                <button
                  disabled={analysisStepIdx <= 0}
                  onClick={() => {
                    setAnalysisStepIdx(prev => prev - 1);
                    triggerAudio('move');
                  }}
                  className="flex-1 py-3 bg-[#2d302e ] hover:bg-[#3c3934] disabled:opacity-40 text-xs font-black text-white rounded-xl border border-[#3c3934] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  ◀ Sebelumnya
                </button>
                <div className="bg-[#262421] border border-[#3c3934] px-4 rounded-xl flex items-center justify-center text-xs font-extrabold text-slate-300">
                  Langkah {analysisStepIdx + 1} / {Math.max(1, analysisHistory.length)}
                </div>
                <button
                  disabled={analysisStepIdx >= analysisHistory.length - 1}
                  onClick={() => {
                    setAnalysisStepIdx(prev => prev + 1);
                    triggerAudio('move');
                  }}
                  className="flex-1 py-3 bg-[#2d302e ] hover:bg-[#3c3934] disabled:opacity-40 text-xs font-black text-white rounded-xl border border-[#3c3934] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Selanjutnya ▶
                </button>
              </div>
            </div>

            {/* SIDE DETAILS VIEW (AI EVALUATOR) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* CURRENT STEP ASSESSMENT CARD */}
              {analysisHistory[analysisStepIdx] ? (
                <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#3c3934]">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">KUALITAS SAN</span>
                      <span className="text-xl font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded border border-[#3c3934]">
                        Langkah {analysisStepIdx + 1}: {analysisHistory[analysisStepIdx].san}
                      </span>
                    </div>
                    
                    {/* Badge */}
                    <div className="flex gap-2">
                      {getEvaluationBadge(analysisHistory[analysisStepIdx].type, "w-10 h-10")}
                    </div>
                  </div>

                  <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] text-center">
                    <span className="text-[10px] text-slate-400 font-extrabold pb-2 block uppercase tracking-wider">EVALUASI LANGKAH</span>
                    
                    <span className={`block text-md font-black uppercase ${
                      analysisHistory[analysisStepIdx].type === 'brilliant' ? 'text-emerald-400' :
                      analysisHistory[analysisStepIdx].type === 'best' ? 'text-[#81b64c]' :
                      analysisHistory[analysisStepIdx].type === 'excellent' ? 'text-teal-400' :
                      analysisHistory[analysisStepIdx].type === 'good' ? 'text-sky-400' :
                      analysisHistory[analysisStepIdx].type === 'book' ? 'text-amber-400' :
                      analysisHistory[analysisStepIdx].type === 'inaccuracy' ? 'text-zinc-400' :
                      analysisHistory[analysisStepIdx].type === 'mistake' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {EVALUATION_LABELS[analysisHistory[analysisStepIdx].type]?.label || 'Langkah Normal'}
                    </span>
                    
                    <p className="text-xs text-slate-300 font-semibold mt-2 leading-relaxed">
                      Langkah ini dimainkan oleh warna <span className="font-extrabold text-white">{analysisHistory[analysisStepIdx].color === 'w' ? 'PUTIH' : 'HITAM'}</span> dari koordinat <span className="font-bold text-cyan-400 uppercase">{analysisHistory[analysisStepIdx].from}</span> menuju <span className="font-bold text-cyan-400 uppercase">{analysisHistory[analysisStepIdx].to}</span>.
                    </p>
                  </div>

                  {/* AI FEEDBACK EXPLAIN PANEL */}
                  <div className="mt-6 bg-[#262421] p-4 rounded-2xl border border-[#3c3934]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#3c3934]/60">
                      <Sparkles className="w-4 h-4 text-[#81b64c] fill-emerald-500/20" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Bimbingan Mentor Catur AI</span>
                    </div>

                    {analysisStepDetails[analysisStepIdx] ? (
                      <p className="text-[#bab9b8] text-xs font-semibold leading-relaxed italic">
                        "{analysisStepDetails[analysisStepIdx]}"
                      </p>
                    ) : (
                      <div className="text-center py-2">
                        {isAiThinking ? (
                          <div className="flex items-center justify-center gap-2 text-xs text-[#81b64c] font-bold animate-pulse py-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Sedang menganalisis posisi...
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              setIsAiThinking(true);
                              try {
                                const response = await fetch('/api/analyze-position', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fen: analysisHistory[analysisStepIdx].fen,
                                    move: analysisHistory[analysisStepIdx].san,
                                    color: analysisHistory[analysisStepIdx].color
                                  })
                                });
                                const data = await response.json();
                                if (data.analysis) {
                                  setAnalysisStepDetails(prev => ({
                                    ...prev,
                                    [analysisStepIdx]: data.analysis
                                  }));
                                } else {
                                  setAnalysisStepDetails(prev => ({
                                    ...prev,
                                    [analysisStepIdx]: "Posisi ini adalah langkah logis standard. Pertahankan struktur pion dan awasi ancaman taktis ksatria!"
                                  }));
                                }
                              } catch (err) {
                                setAnalysisStepDetails(prev => ({
                                  ...prev,
                                  [analysisStepIdx]: "Posisi ini normal. Jaga koordinasi perwira Anda dan pastikan raja selalu terlindungi!"
                                }));
                              } finally {
                                setIsAiThinking(false);
                              }
                            }}
                            className="px-3.5 py-2.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-white text-[11px] font-black rounded-lg uppercase tracking-wider cursor-pointer"
                          >
                            Tanya Rencana AI
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] text-center text-slate-400 text-xs font-bold uppercase py-12 shadow-md">
                  Tidak ada langkah tercatat dalam game ini
                </div>
              )}

              {/* JUMP TO TIMELINE BOX */}
              <div className="bg-[#312e2b] rounded-3xl p-5 border border-[#3c3934] shadow-md">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-3">Langkah Cepat Timeline</span>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {analysisHistory.length === 0 ? (
                    <span className="text-[11px] font-mono text-slate-500 uppercase">Belum ada timeline</span>
                  ) : (
                    analysisHistory.map((step, idx) => {
                      const isActive = analysisStepIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setAnalysisStepIdx(idx);
                            triggerAudio('move');
                          }}
                          className={`px-2 py-1 text-xs font-mono font-black rounded-md cursor-pointer transition-all ${
                            isActive
                              ? 'bg-[#81b64c] text-white animate-pulse'
                              : 'bg-[#262421] text-slate-300 hover:bg-[#3c3934]'
                          }`}
                        >
                          {idx + 1}.{step.san}
                        </button>
                      );
                    })
                  )}
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
                  {renderCapturedList(getCapturedPieces().capturedByBlack, 'w')}
                  <div className={`w-full max-w-md p-4 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                    {renderChessboard()}
                  </div>
                  {renderCapturedList(getCapturedPieces().capturedByWhite, 'b')}

                  {/* STATS CONTROL CARD FOR PUZZLE STATUS */}
                  <div className="w-full max-w-sm mt-4 bg-white p-6 rounded-2xl border-2 border-[#E5E5E5] shadow-sm text-center">
                    {puzzleStatus === 'playing' && (
                      <div className="flex flex-col items-center justify-center">
                        <span className="flex items-center gap-1.5 text-[#777777] font-extrabold text-xs uppercase tracking-wider animate-pulse mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC800] inline-block shadow-xs" /> MENUNGGU LANGKAH TERBAIKMU...
                        </span>

                        {showPuzzleHint ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="my-3 px-4 py-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center shadow-xs w-full max-w-xs"
                          >
                            <span className="text-[10px] font-black text-amber-600 block uppercase tracking-wider flex items-center justify-center gap-1">
                              Petunjuk Langkah
                            </span>
                            <p className="text-slate-700 font-bold text-xs mt-1 leading-normal">
                              Coba gerakkan perwiramu dari petak <span className="bg-amber-100 px-1.5 py-0.5 font-mono font-black border border-amber-200 rounded text-amber-800">{(activePuzzle.solution[puzzleMovesPlayed]?.substring(0, 2) || "??").toUpperCase()}</span>!
                            </p>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowPuzzleHint(true);
                              triggerAudio('move');
                            }}
                            className="my-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-150 text-amber-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[0_2px_0_0_#FEF3C7] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer w-full max-w-[200px]"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-300" /> Tampilkan Petunjuk
                          </button>
                        )}

                        <p className="text-[10px] text-[#777777] italic mt-2 font-semibold">Blunder atau salah jalan mengurangi 1 Nyawa!</p>
                      </div>
                    )}

                    {puzzleStatus === 'solved' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 border border-green-200 text-green-600 font-extrabold">
                          
                        </div>
                        <h4 className="font-extrabold text-green-700 text-lg mb-1">Berhasil Memecahkan Masalah!</h4>
                        <p className="text-[#777777] text-xs font-semibold mb-3">{activePuzzle.explanation}</p>
                        <div className="py-1 px-3 bg-green-50 text-green-700 font-black tracking-wide uppercase text-xs rounded-xl inline-block border border-green-200">
                          +{activePuzzle.points} XP Didapatkan!
                        </div>
                        <button
                          onClick={() => {
                            setActivePuzzle(null);
                            setPuzzleStatus('playing');
                            triggerAudio('move');
                          }}
                          className="w-full mt-4 py-3 bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none text-xs uppercase cursor-pointer transition-colors"
                        >
                          Selesai & Kembali ke Daftar
                        </button>
                      </div>
                    )}

                    {puzzleStatus === 'failed' && (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 border border-red-200 text-red-500 font-extrabold">
                          
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
                  {renderCapturedList(getCapturedPieces().capturedByBlack, 'w')}
                  <div className={`w-full max-w-md p-4 rounded-3xl border-4 ${activeThemeConfig.bgClass} shadow-xl relative`}>
                    {renderChessboard()}
                  </div>
                  {renderCapturedList(getCapturedPieces().capturedByWhite, 'b')}

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
                          
                        </div>
                        <h4 className="font-extrabold text-green-700 text-md mb-2">Hebat, Latihan Selesai!</h4>
                        <div className="py-1 px-3 bg-green-50 text-green-700 font-black tracking-wide uppercase text-xs rounded-xl inline-block border border-green-200">
                          +{activeLesson.points} XP Didapatkan!
                        </div>
                        <button
                          onClick={() => {
                            setActiveLesson(null);
                            setLessonStatus('playing');
                            triggerAudio('move');
                          }}
                          className="w-full mt-4 py-3 bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none text-xs uppercase cursor-pointer transition-colors"
                        >
                          Selesai & Pilih Materi Lain
                        </button>
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
                      Cari Lawan Catur Sekarang 
                    </button>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      Server: 0.0.0.0:3000 Online Aktif
                    </div>
                  </div>

                  {/* HISTORY MATCH LIST */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-[#E5E5E5] shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-[#E5E5E5]/60 pb-2">
                      <h3 className="text-lg font-black text-[#4B4B4B] flex items-center gap-2 uppercase tracking-wide">
                        <History className="w-5 h-5 text-[#81b64c] shrink-0" /> Riwayat Duel Terakhir
                      </h3>
                      {membershipStatus === 'premium' ? (
                        <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-500" /> Premium Unlimited
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px] font-extrabold uppercase tracking-wider">
                          Batas 10 Game
                        </span>
                      )}
                    </div>
                    {onlineHistory.length === 0 ? (
                      <div className="py-8 my-1 text-center border-2 border-dashed border-[#E5E5E5] rounded-2xl">
                        <span className="text-slate-400 font-bold text-sm">Belum ada pertandingan online tercatat. Mulai duel pertamamu!</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                          {(membershipStatus === 'premium' ? onlineHistory : onlineHistory.slice(0, 10)).map((h: any, i: number) => (
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

                        {membershipStatus !== 'premium' && onlineHistory.length > 10 && (
                          <div className="mt-3 p-3 bg-yellow-500/5 hover:bg-yellow-500/10 border-2 border-dashed border-yellow-500/25 rounded-2xl text-center transition-all">
                            <span className="block text-[10px] font-extrabold text-[#AF7E00] uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400/10" /> Sembunyikan {onlineHistory.length - 10} Pertandingan Terlama
                            </span>
                            <p className="text-[9px] text-[#777777] font-semibold leading-relaxed">
                              Gabung Keanggotaan Premium Elite untuk melihat seluruh riwayat pertandingan tanpa batas!
                            </p>
                            <button
                              onClick={() => { setMode('store'); triggerAudio('move'); }}
                              className="mt-2 text-[9px] font-bold uppercase text-yellow-600 hover:text-yellow-700 underline tracking-wider cursor-pointer"
                            >
                              Tingkatkan Sekarang 
                            </button>
                          </div>
                        )}
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

                {/* INBOX & FRIENDS HUB */}
                <div className="bg-white rounded-3xl p-6 border-2 border-[#E5E5E5] shadow-sm">
                  <h3 className="text-lg font-black text-[#4B4B4B] mb-3 flex items-center gap-2 uppercase tracking-wide border-b-2 border-slate-100 pb-2">
                    <Users className="w-5 h-5 text-[#1CB0F6] shrink-0" /> Sosial & Kotak Masuk
                  </h3>

                  {!user ? (
                    <div className="py-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
                        Masuk ke akun caturmu untuk menambahkan kawan, menerima tantangan tanding catur, dan mengirim surat inbox undangan bermain online secara real-time!
                      </p>
                      <button
                        onClick={() => {
                          setMode('profile');
                          triggerAudio('move');
                        }}
                        className="w-full py-2.5 bg-[#1CB0F6] hover:bg-[#0D94D2] text-white font-extrabold rounded-xl shadow-[0_3px_0_0_#0D94D2] active:translate-y-0.5 active:shadow-none transition-all text-xs uppercase cursor-pointer"
                      >
                        Masuk / Daftar Akun 
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Social notifications errors and outcomes */}
                      {socialError && (
                        <div className="p-2.5 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-xs font-bold relative flex items-center justify-between">
                          <span>{socialError}</span>
                          <button onClick={() => setSocialError(null)} className="text-red-400 hover:text-red-600 font-bold ml-1">×</button>
                        </div>
                      )}
                      {socialSuccess && (
                        <div className="p-2.5 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-xs font-bold relative flex items-center justify-between">
                          <span>{socialSuccess}</span>
                          <button onClick={() => setSocialSuccess(null)} className="text-green-500 hover:text-green-700 font-bold ml-1">×</button>
                        </div>
                      )}

                      {/* Kotak Masuk / Inbox Custom Game Invitations */}
                      {inboxMessages.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Undangan Duel & Pesan ({inboxMessages.length})</span>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {inboxMessages.map((msg: any) => (
                              <div key={msg.id} className="p-3 bg-blue-50 border-2 border-blue-100 rounded-xl flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                  <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-extrabold text-blue-900 leading-tight">{msg.text}</p>
                                    {msg.roomCode && <span className="text-[9px] font-mono font-bold text-blue-500">ROOM: {msg.roomCode}</span>}
                                  </div>
                                </div>
                                {msg.type === 'game_invite' && (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => handleRespondToInvite(msg, 'decline')}
                                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      Tolak
                                    </button>
                                    <button
                                      onClick={() => handleRespondToInvite(msg, 'accept')}
                                      className="px-3 py-1.5 bg-[#58CC02] hover:bg-[#46A302] text-white font-black rounded-lg text-[10px] uppercase tracking-wider shadow-[0_2px_0_0_#46A302] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                    >
                                      Terima & Main
                                    </button>
                                  </div>
                                )}
                                {msg.type !== 'game_invite' && (
                                  <button
                                    onClick={async () => {
                                      await fetch('/api/social/inbox/clear', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ username, msgId: msg.id })
                                      });
                                      fetchSocialInfo();
                                    }}
                                    className="self-end px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[8px] uppercase tracking-wider cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Friend Input Fields */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Tambah Teman Baru</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={addFriendInput}
                            onChange={(e) => setAddFriendInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSendFriendRequest(); }}
                            disabled={isSocialLoading}
                            placeholder="Ketik username kawan..."
                            className="flex-1 px-3 py-2 text-xs rounded-xl border-2 border-[#E5E5E5] focus:border-[#1CB0F6] font-extrabold text-[#4B4B4B] focus:outline-none"
                          />
                          <button
                            onClick={handleSendFriendRequest}
                            disabled={isSocialLoading || !addFriendInput.trim()}
                            className="px-4 bg-[#1CB0F6] hover:bg-[#0D94D2] disabled:bg-slate-200 text-white font-extrabold rounded-xl shadow-[0_3px_0_0_#0D94D2] disabled:shadow-none active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer transition-all text-xs"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Friend Requests Queue Pending */}
                      {friendRequests.length > 0 && (
                        <div className="p-3 bg-amber-50 border-2 border-amber-100 rounded-xl space-y-2">
                          <span className="text-[9px] uppercase font-black tracking-wider text-amber-800 block">Menunggu Konfirmasi Pertemanan ({friendRequests.length})</span>
                          {friendRequests.map((reqUser: string) => (
                            <div key={reqUser} className="flex items-center justify-between gap-2 border-b border-amber-100/60 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-xs font-bold text-slate-700">@{reqUser}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleRespondToFriendRequest(reqUser, 'decline')}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[8px] uppercase tracking-wider cursor-pointer"
                                >
                                  Tolak
                                </button>
                                <button
                                  onClick={() => handleRespondToFriendRequest(reqUser, 'accept')}
                                  className="px-2 py-1 bg-[#58CC02] hover:bg-[#46A302] text-white font-bold rounded text-[8px] uppercase tracking-wider cursor-pointer shadow-[0_1.5px_0_0_#46A302]"
                                >
                                  Terima
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Friends list map block */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Daftar Teman ({friendsList.length})</span>
                        {friendsList.length === 0 ? (
                          <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-bold p-4 text-[11px] leading-relaxed">
                            Belum memiliki teman. Isikan nama pengguna/akun kawan di atas untuk menjalin relasi tanding online!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {friendsList.map((friend: any) => (
                              <div key={friend.username} className="p-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors">
                                <div 
                                  className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                                  onClick={() => setSelectedFriendForDetail(friend)}
                                  title="Klik untuk melihat profil & pencapaian teman"
                                >
                                  <img
                                    src={friend.avatar || martinAvatar}
                                    alt="Friend Avatar"
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white shadow-xs shrink-0 object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-extrabold text-xs text-slate-700 group-hover:text-[#58CC02] transition-colors truncate">@{friend.username}</h4>
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FFF4D1] text-[#AF7E00] font-mono text-[8px] font-black rounded uppercase border border-[#FFC800]">
                                      {friend.elo} ELO <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-[#AF7E00]" />
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleInviteFriend(friend.username)}
                                    className="px-2.5 py-1.5 bg-[#1CB0F6] hover:bg-[#0D94D2] text-white font-black rounded-lg text-[9px] uppercase tracking-wider shadow-[0_2px_0_0_#0D94D2] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                  >
                                    Tantang Duel
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFriend(friend.username)}
                                    title="Hapus Pertemanan"
                                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                  <h3 className="font-black text-xl text-[#4B4B4B] uppercase tracking-wide">
                    {friendRoomCode ? 'Menghubungkan Kamar PIN...' : 'Mencari Lawan Catur...'}
                  </h3>
                  {friendRoomCode ? (
                    <div className="mt-2 text-center">
                      <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                        Menunggu teman bergabung menggunakan PIN Kamar:
                      </p>
                      <div className="my-2.5 px-4 py-2 bg-cyan-50 text-cyan-600 border-2 border-cyan-200 font-mono text-lg font-black tracking-widest rounded-xl inline-block shadow-xs animate-pulse">
                        {friendRoomCode}
                      </div>
                      <p className="text-slate-400 font-medium text-[11px] leading-snug max-w-sm mx-auto">
                        Bagikan kode PIN di atas kepada teman tanding Anda agar mereka dapat dimasukkan ke kamar tanding yang sama secara instan!
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 font-semibold text-xs mt-2 leading-relaxed">
                      Menghubungi server multiplayer di port 3000...<br />
                      Mencari pecatur lain dengan tingkat keahlian seimbang.
                    </p>
                  )}
                </div>
                <div className="py-2.5 px-6 bg-slate-100 rounded-full border border-slate-200 font-mono text-xs font-black text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Durasi Pencarian: {searchTime} Detik
                </div>
                <button
                  onClick={() => {
                    setOnlineStatus('idle');
                    setFriendRoomCode(''); // Clear room PIN when canceling search
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
                    {renderCapturedList(getCapturedPieces().capturedByBlack, 'w')}
                    {renderChessboard()}
                    {renderCapturedList(getCapturedPieces().capturedByWhite, 'b')}

                    {/* YOU BOTTOM INFO CARD */}
                    <div className="flex items-center justify-between mt-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <AvatarWithFrame 
                          src={user?.profileAvatar || martinAvatar} 
                          frameId={selectedFrame} 
                          size="xs" 
                        />
                        <div className="flex items-center gap-1">
                          {membershipStatus === 'premium' && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/10 shrink-0" />
                          )}
                          <span className={`text-xs font-black tracking-wide uppercase ${
                            membershipStatus === 'premium' ? 'text-yellow-400 font-extrabold' : 'text-white'
                          }`}>
                            {user ? user.username : username} ({onlineRating} ELO - Kamu)
                          </span>
                        </div>
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
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" /> Menunggu Langkah Lawan...
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
              <div className="w-full max-w-md mx-auto bg-[#262421] p-8 rounded-3xl border-2 border-[#3c3934] text-center shadow-2xl flex flex-col items-center gap-6 py-10 animate-fade-in">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  onlineGameResult === 'win' ? 'bg-[#81b64c] shadow-[#81b64c]/20 border border-[#a2e564]/30' :
                  onlineGameResult === 'lose' ? 'bg-red-500 shadow-red-500/10 border border-red-400/30' :
                  'bg-amber-500 shadow-amber-500/10 border border-amber-400/30'
                }`}>
                  <Trophy className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className={`font-black text-2xl uppercase tracking-wider ${
                    onlineGameResult === 'win' ? 'text-[#a2e564]' :
                    onlineGameResult === 'lose' ? 'text-rose-400' :
                    'text-amber-400'
                  }`}>
                    {onlineGameResult === 'win' ? 'KAMU MENANG!' :
                     onlineGameResult === 'lose' ? 'KAMU KALAH!' :
                     'PERMAINAN SERI!'}
                  </h3>
                  <p className="text-slate-400 font-medium text-xs mt-2.5 leading-relaxed max-w-xs mx-auto">
                    Kinerja pertandingan telah dianalisis. Rating ELO Anda telah berhasil diperbarui dan disinkronkan.
                  </p>
                </div>

                <div className="bg-[#1c1a18] border border-[#3c3934] rounded-2xl py-4 px-10 text-center w-full max-w-[280px]">
                  <span className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Peringkat Baru Anda</span>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-yellow-400 font-black text-xl font-mono leading-none">
                      {onlineRating} ELO
                    </span>
                    {onlineEloChange !== 0 && (
                      <span className={`text-[10px] font-black uppercase tracking-wider ${onlineEloChange > 0 ? "text-green-400" : "text-rose-500"}`}>
                        {onlineEloChange > 0 ? `+${onlineEloChange}` : onlineEloChange} ELO
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setOnlineGameResult(null);
                      setOnlineOpponent(null);
                      setOnlineGameId(null);
                      setOnlineStatus('searching');
                      setLastMove(null);
                      setMoveHistory([]);
                      triggerAudio('move');
                    }}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl shadow-[0_4px_0_0_#d99214] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#d99214] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-widest text-xs cursor-pointer duration-100 flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" /> Main Lagi
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOnlineStatus('idle');
                      setMode('menu');
                      triggerAudio('move');
                    }}
                    className="w-full py-3 bg-[#81b64c] hover:bg-[#6c9b3e] text-white font-extrabold rounded-xl shadow-[0_4px_0_0_#5a863f] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#5a863f] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-widest text-xs cursor-pointer duration-100"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================
             5.5 STANDALONE TOURNAMENT BRACKET ARENA MODE
           ========================================= */}
        {mode === 'tournament' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-slate-300 bg-[#262421]/90 hover:bg-[#312e2b] border border-stone-880 rounded-xl transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Arena
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
                   Turnamen Braket Mingguan
                </h2>
              </div>
            </div>

            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="tournament"
              hideTabsSelector={true}
            />
          </div>
        )}

        {/* =========================================
             5.6 STANDALONE CLAN GUILD ARENA MODE
           ========================================= */}
        {mode === 'guild-suku' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-slate-300 bg-[#262421]/90 hover:bg-[#312e2b] border border-stone-880 rounded-xl transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Arena
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
                  Perisai Klub & Suku Klan Catur
                </h2>
              </div>
            </div>

            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="guild"
              hideTabsSelector={true}
            />
          </div>
        )}

        {/* =========================================
             5.7 STANDALONE FORUM & DISCUSSION MODE
           ========================================= */}
        {mode === 'forum-diskusi' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-slate-300 bg-[#262421]/90 hover:bg-[#312e2b] border border-stone-880 rounded-xl transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Arena
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
                  Pesan Forum Diskusi & Analisis Catur
                </h2>
              </div>
            </div>

            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="posts"
              hideTabsSelector={true}
            />
          </div>
        )}

        {/* =========================================
             5.8 STANDALONE TOKO DEALS & HADIAH MODE
           ========================================= */}
        {mode === 'toko-deals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-slate-300 bg-[#262421]/90 hover:bg-[#312e2b] border border-[#3c3934] rounded-xl transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Arena
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
                   Gifting Teman & Promo Flash Sale
                </h2>
              </div>
            </div>

            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="deals"
              hideTabsSelector={true}
            />
          </div>
        )}

        {/* =========================================
             5.9 STANDALONE PROGRESS STATS & ACHIEVEMENT
           ========================================= */}
        {mode === 'statistik-elo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c3934]">
              <div>
                <button 
                  onClick={() => {
                    setMode('menu');
                    triggerAudio('move');
                  }}
                  className="mb-2 px-3.5 py-2 flex items-center gap-1.5 text-xs font-black text-slate-300 bg-[#262421]/90 hover:bg-[#312e2b] border border-[#3c3934] rounded-xl transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4 text-[#81b64c]" /> Kembali ke Arena
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
                   Kurva ELO Historis & Pencapaian
                </h2>
              </div>
            </div>

            <Features31to40
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              onlineRating={onlineRating}
              setOnlineRating={setOnlineRating}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              setMode={setMode}
              streak={streak}
              startAiGameWithTimerAndCasual={(charId, limit, isCasual) => {
                const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
                setTimerLimit(limit);
                localStorage.setItem('timerLimit', String(limit));
                localStorage.setItem('timerEnabled', 'true');
                localStorage.setItem('casual_match_mode', String(isCasual));
                handleSelectCharacter(char);
              }}
              receivedGifts={receivedGifts}
              setReceivedGifts={setReceivedGifts}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              initialTab="stats"
              hideTabsSelector={true}
            />
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
                <p className="text-[#9babaf] font-semibold text-sm mt-1">Unlock kustomisasi warna kontras papan turnamen atau isi ulang kesempatan analisismu memakai Koin & Berlian!</p>
              </div>
            </div>

            {/* Store Top Navigation Sub-Tabs */}
            <div className="flex flex-wrap gap-3.5 border-b border-[#3c3934] mb-8 pb-3 scroller-hidden">
              <button
                onClick={() => { setStoreActiveTab('shop'); triggerAudio('move'); }}
                className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  storeActiveTab === 'shop'
                    ? 'bg-[#81b64c] text-white border-[#81b64c] shadow-md'
                    : 'bg-[#262421] text-slate-300 border-[#3c3934] hover:text-white hover:bg-[#312e2b]'
                }`}
              >
                 Katalog Pembelian Langsung
              </button>
              <button
                onClick={() => { setStoreActiveTab('gacha'); triggerAudio('move'); }}
                className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  storeActiveTab === 'gacha'
                    ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-md'
                    : 'bg-[#262421] text-slate-300 border-[#3c3934] hover:text-white hover:bg-[#312e2b]'
                }`}
              >
                 Mesin Gacha & Tabungan Diamond
              </button>
              <button
                onClick={() => { setStoreActiveTab('flash_sale'); triggerAudio('move'); }}
                className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  storeActiveTab === 'flash_sale'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                    : 'bg-[#262421] text-slate-300 border-[#3c3934] hover:text-white hover:bg-[#312e2b]'
                }`}
              >
                Kilat Friday Flash Sale Spesial
              </button>
            </div>

            {storeActiveTab === 'shop' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              <div className="space-y-8">
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
                    <span className="block font-extrabold text-[#81b64c] font-mono text-lg mb-2 flex items-center justify-center sm:justify-end gap-1"><Coins className="w-5 h-5 text-[#81b64c]" /> 50 Koin</span>
                    <button 
                      onClick={buyHeartRefill}
                      disabled={coins < 50 || hearts >= 5}
                      className="px-6 py-2.5 bg-[#81b64c] hover:bg-[#92ca5a] disabled:opacity-50 text-white font-extrabold text-xs uppercase rounded-xl shadow-[0_4px_0_0_#5d8a32] active:translate-y-1 active:shadow-none cursor-pointer transition-all"
                    >
                      {hearts >= 5 ? 'Sudah Penuh' : 'Refill Penuh'}
                    </button>
                  </div>
                </div>

                {/* MEMBERSHIP STATUS CARD */}
                <div className="bg-gradient-to-br from-[#1d1b19] to-[#3a3224] rounded-3xl p-6 border-2 border-yellow-500/40 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-black rounded uppercase tracking-wider block w-fit mb-2">
                        Paket Eksklusif Lifetime
                      </span>
                      <h3 className="font-extrabold text-white text-md sm:text-lg uppercase tracking-wide mb-1 flex items-center gap-1.5 font-sans">
                        <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400/20" /> Keanggotaan Premium Elite
                      </h3>
                      <p className="text-[#bab9b8] text-2xs sm:text-xs font-semibold leading-relaxed mb-4 max-w-sm">
                        Keistimewaan tak tertandingi bagi pencatur sejati. Aktif selamanya, tanpa biaya harian atau bulanan tambahan!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 bg-[#1a1816]/90 p-4 sm:p-5 rounded-2xl border border-yellow-500/25">
                    <div className="flex items-start gap-2.5 text-xs text-[#81b64c] font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#81b64c] mt-0.5" />
                      <div>
                        <span className="block text-white">Stamina Analisis Tanpa Batas</span>
                        <span className="text-[10px] text-slate-400 font-normal">Selesaikan taktik teka-teki, evaluasi langkah, dan hint sepuasnya tanpa takut kehabisan nyawa harian.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-xs text-[#ffd700] font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#ffd700] mt-0.5" />
                      <div>
                        <span className="block text-white">Lencana Mahkota Emas Elite</span>
                        <span className="text-[10px] text-slate-400 font-normal">Identitas mahkota premium mewah yang terpampang gagah di samping nama profil, papan chat, dan statistik Anda.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-xs text-cyan-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                      <div>
                        <span className="block text-white">Analisis AI Mendalam Prioritas</span>
                        <span className="text-[10px] text-slate-400 font-normal">Dapatkan pemetaan rincian taktis cerdas dari model Gemini AI secara beruntun untuk melacak blunder dan strategi menang.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-amber-500 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <span className="block text-white">Pembuka Semua Karakter Bot & Tema Papan</span>
                        <span className="text-[10px] text-slate-400 font-normal">Bebas bertanding melawan bot tangguh (Wally, Magnus) tanpa kuota, serta pasang semua kosmetik papan tanpa menukar XP.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <span className="block text-white">Durasi Keanggotaan: Aktif Selamanya (Lifetime)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Sekali aktivasi menggunakan Koin, akun Anda resmi terdaftar sebagai member loyal permanen selamanya (Tanpa Batas Waktu).</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#1d1a18]/95 p-4 rounded-xl border border-yellow-500/10">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Biaya Aktivasi</span>
                      {membershipStatus === 'premium' ? (
                        <span className="text-yellow-400 font-black text-xs tracking-wider uppercase">LIFETIME AKTIF Aktif</span>
                      ) : (
                        <span className="font-extrabold text-[#81b64c] font-mono text-xl flex items-center gap-1">
                          <Coins className="w-5 h-5 text-[#81b64c]" /> 350
                        </span>
                      )}
                    </div>
                    {membershipStatus === 'premium' ? (
                      <span className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-extrabold text-xs uppercase rounded-xl flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400/20" /> Premium Member
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          if (coins >= 350) {
                            const nextCoins = coins - 350;
                            setCoins(nextCoins);
                            localStorage.setItem('coins', String(nextCoins));
                            setMembershipStatus('premium');
                            localStorage.setItem('membershipStatus', 'premium');
                            triggerAudio('win');
                            triggerReward(0, "Selamat! Anda resmi menjadi Anggota Premium Klub Catur Nopal! Nikmati semua fitur istimewa!", 'success_no_xp');
                          }
                        }}
                        disabled={coins < 350}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase rounded-xl shadow-[0_4px_0_0_#b38b00] active:translate-y-1 active:shadow-none cursor-pointer transition-all tracking-wider"
                      >
                        Aktifkan Sekarang
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* BUY NEW COSMETICS BAR */}
                <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                  <h3 className="font-extrabold text-white text-md uppercase tracking-wide mb-4">Gaya Papan Catur Tambahan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {THEMES.map((theme) => {
                      const isUnlocked = unlockedThemes.includes(theme.id) || membershipStatus === 'premium';
                      const isActive = boardTheme === theme.id;
                      const costType = theme.id === 'cosmic' ? 'diamond' : 'coin';
                      const costValue = theme.id === 'cosmic' ? 30 : 150;
                      const hasEnough = costType === 'coin' ? coins >= costValue : diamonds >= costValue;

                      return (
                        <div 
                          key={theme.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[11rem] h-full ${
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
                              <span className="font-extrabold text-sm font-mono flex items-center gap-0.5 whitespace-nowrap">
                                {costType === 'coin' ? (
                                  <>
                                    <Coins className="w-3.5 h-3.5 text-[#81b64c] inline" />
                                    <span className="text-[#81b64c]">{costValue}</span>
                                  </>
                                ) : (
                                  <>
                                    <Gem className="w-3.5 h-3.5 text-cyan-400 inline" />
                                    <span className="text-cyan-400">{costValue}</span>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-[#9babaf] text-[11px] font-semibold">Tersedia</span>
                            )}
                            
                            {!isUnlocked ? (
                              <button
                                onClick={() => buyTheme(theme)}
                                disabled={!hasEnough}
                                className="px-3.5 py-1.5 bg-[#FFC800] hover:bg-yellow-400 disabled:opacity-40 text-[#262421] font-black text-[10px] uppercase rounded-lg shadow-[0_3px_0_0_#b38b00] active:translate-y-0.5 active:shadow-none cursor-pointer"
                              >
                                Beli
                              </button>
                            ) : (
                              <button
                                onClick={() => setBoardTheme(theme.id)}
                                className="px-3.5 py-1.5 bg-[#312e2b] hover:bg-[#3c3934] text-white font-extrabold text-[10px] uppercase rounded-lg border border-[#3c3934] shadow-[0_3px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none cursor-pointer"
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

                {/* BUY NEW PIECE SKINS */}
                <div className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                  <h3 className="font-extrabold text-white text-md uppercase tracking-wide mb-4">Skin Bidak Catur</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'standard', name: 'Gaya Klasik', cost: 0, costType: 'coin', desc: 'Tampilan standar minimal' },
                      { id: 'wood', name: 'Kayu Maple', cost: 150, costType: 'coin', desc: 'Tekstur serat kayu natural' },
                      { id: 'neon', name: 'Cyber Laser', cost: 20, costType: 'diamond', desc: 'Garis neon cyberpunk menyala' },
                      { id: 'gold', name: 'Emas Kerajaan', cost: 40, costType: 'diamond', desc: 'Brilian kilau emas monarki' }
                    ].map((skinItem) => {
                      const isUnlocked = unlockedSkins.includes(skinItem.id) || membershipStatus === 'premium' || skinItem.id === 'standard';
                      const isActive = selectedSkin === skinItem.id;
                      const hasEnough = skinItem.costType === 'coin' ? coins >= skinItem.cost : diamonds >= skinItem.cost;

                      return (
                        <div 
                          key={skinItem.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[12rem] h-full ${
                            isActive 
                              ? 'bg-[#262421] border-[#ffd700] shadow-md' 
                              : 'bg-[#262421] border-[#3c3934] hover:border-[#81b64c]'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-extrabold text-white text-sm">{skinItem.name}</h4>
                              {isUnlocked && <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-950 text-[#81b64c] rounded-lg border border-emerald-900 uppercase">Terbuka</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-2">{skinItem.desc}</p>
                            <div className="flex gap-2.5 items-center bg-[#1c1c1c]/40 p-1.5 rounded-lg w-fit">
                              <div className="w-8 h-8">
                                <ChessPiece type="n" color="w" skin={skinItem.id} />
                              </div>
                              <div className="w-8 h-8">
                                <ChessPiece type="n" color="b" skin={skinItem.id} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {!isUnlocked ? (
                              <span className="font-extrabold text-sm font-mono flex items-center gap-0.5 whitespace-nowrap">
                                {skinItem.costType === 'coin' ? (
                                  <>
                                    <Coins className="w-3.5 h-3.5 text-[#81b64c] inline" />
                                    <span className="text-[#81b64c]">{skinItem.cost}</span>
                                  </>
                                ) : (
                                  <>
                                    <Gem className="w-3.5 h-3.5 text-cyan-400 inline" />
                                    <span className="text-cyan-400">{skinItem.cost}</span>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-[#9babaf] text-2xs font-semibold">Tersedia</span>
                            )}
                            
                            {!isUnlocked ? (
                              <button
                                onClick={() => {
                                  if (skinItem.costType === 'coin') {
                                    if (coins >= skinItem.cost) {
                                      setCoins(prev => prev - skinItem.cost);
                                      setUnlockedSkins(prev => [...prev, skinItem.id]);
                                      triggerAudio('win');
                                      triggerReward(0, `Skin Bidak "${skinItem.name}" berhasil dibeli seharga ${skinItem.cost} Koin!`, 'success_no_xp');
                                    }
                                  } else {
                                    if (diamonds >= skinItem.cost) {
                                      setDiamonds(prev => prev - skinItem.cost);
                                      setUnlockedSkins(prev => [...prev, skinItem.id]);
                                      triggerAudio('win');
                                      triggerReward(0, `Skin Bidak "${skinItem.name}" berhasil dibeli seharga ${skinItem.cost} Berlian!`, 'success_no_xp');
                                    }
                                  }
                                }}
                                disabled={!hasEnough}
                                className="px-3.5 py-1.5 bg-[#FFC800] hover:bg-yellow-400 disabled:opacity-40 text-black font-extrabold text-[10px] uppercase rounded-lg shadow-[0_3px_0_0_#b38b00] active:translate-y-0.5 active:shadow-none cursor-pointer"
                              >
                                Beli
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedSkin(skinItem.id);
                                  triggerAudio('move');
                                }}
                                className="px-3.5 py-1.5 bg-[#312e2b] hover:bg-[#3c3934] text-white font-extrabold text-[10px] uppercase rounded-lg border border-[#3c3934] shadow-[0_3px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none cursor-pointer"
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

                {/* BUY NEW AVATAR BORDERS / FRAMES */}
                <div id="avatar-borders-shop" className="bg-[#312e2b] rounded-3xl p-6 border border-[#3c3934] shadow-md">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
                    <div>
                      <h3 className="font-extrabold text-white text-md uppercase tracking-wide">Katalog Bingkai Avatar</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Hiasi avatar Anda dengan bingkai bergengsi yang bersinar!</p>
                    </div>
                    <div className="flex gap-3 items-center bg-[#211f1d] px-3.5 py-1.5 rounded-2xl text-xs font-black self-end sm:self-auto">
                      <span className="flex items-center gap-1 text-yellow-500 font-mono">
                        <Coins className="w-4 h-4 text-yellow-400" /> {coins}
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400 font-mono">
                        <Gem className="w-4 h-4 text-cyan-400" /> {diamonds}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVATAR_FRAMES.map((frame) => {
                      const isUnlocked = unlockedFrames.includes(frame.id) || (membershipStatus === 'premium' && frame.isPremiumExclusive);
                      const isActive = selectedFrame === frame.id;
                      
                      return (
                        <div 
                          key={frame.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[13rem] h-full ${
                            isActive 
                              ? 'bg-[#262421] border-[#81b64c] shadow-lg shadow-[#81b64c]/10' 
                              : 'bg-[#262421] border-[#3c3934] hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h4 className={`font-extrabold text-sm ${frame.themeColor}`}>{frame.name}</h4>
                                {frame.isPremiumExclusive && (
                                  <span className="text-[7.5px] font-black px-1 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-md border border-yellow-500/35 uppercase flex items-center gap-0.5 w-fit mt-0.5 font-sans">
                                    <Crown className="w-2 h-2" /> PREMIUM
                                  </span>
                                )}
                              </div>
                              {isUnlocked ? (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-955 text-[#81b64c] rounded-lg border border-emerald-900 uppercase">Terbuka</span>
                              ) : (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-lg uppercase">Terkunci</span>
                              )}
                            </div>
                            
                            <p className="text-[9.5px] sm:text-[10px] text-slate-400 font-semibold mt-1 mb-1.5 h-9 overflow-hidden line-clamp-2 leading-relaxed">
                              {frame.description}
                            </p>
                            
                            {/* Live preview section */}
                            <div className="flex items-center gap-2">
                              <AvatarWithFrame 
                                src={user?.profileAvatar || martinAvatar} 
                                frameId={frame.id} 
                                size="md" 
                              />
                              <span className="text-[10px] text-slate-450 italic">Pratinjau Anda</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2.5 gap-1.5 border-t border-[#3c3934]/35 pt-2.5">
                            {!isUnlocked ? (
                              frame.isPremiumExclusive ? (
                                <>
                                  <span className="text-[9px] uppercase font-black tracking-wider text-yellow-500 flex items-center gap-0.5 shrink-0 select-none">
                                    <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" /> Premium
                                  </span>
                                  <button
                                    onClick={() => {
                                      setMode('store');
                                      triggerAudio('move');
                                    }}
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-lg shadow-[0_2px_0_0_#b38b00] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all shrink-0 font-sans"
                                  >
                                    Ubah Premium
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 font-extrabold text-xs font-mono shrink-0 select-none">
                                    {frame.costType === 'coin' ? (
                                      <span className="text-yellow-450 flex items-center gap-1">
                                        <Coins className="w-3.5 h-3.5 text-yellow-400" /> {frame.cost}
                                      </span>
                                    ) : (
                                      <span className="text-cyan-450 flex items-center gap-1">
                                        <Gem className="w-3.5 h-3.5 text-cyan-400" /> {frame.cost}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => buyAvatarFrame(frame)}
                                    className="px-4 py-1.5 bg-[#FFC800] hover:bg-yellow-450 text-black font-black text-[9px] uppercase rounded-lg shadow-[0_2px_0_0_#b38b00] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all shrink-0 font-sans"
                                  >
                                    Beli
                                  </button>
                                </>
                              )
                            ) : (
                              <>
                                <span className="text-[10px] uppercase font-black tracking-wider text-[#9babaf] shrink-0 select-none">
                                  {isActive ? '● Aktif' : 'Milik Anda'}
                                </span>
                                <button
                                  onClick={() => equipAvatarFrame(frame.id)}
                                  className={`px-4 py-1.5 font-extrabold text-[9px] uppercase rounded-lg cursor-pointer transition-all shrink-0 font-sans ${
                                    isActive
                                      ? 'bg-[#81b64c] text-white shadow-[0_2px_0_0_#5b8c34]'
                                      : 'bg-[#312e2b] hover:bg-[#3c3934] text-slate-350 border border-[#3c3934] shadow-[0_2px_0_0_#211f1d] active:translate-y-0.5 active:shadow-none'
                                  }`}
                                >
                                  {isActive ? 'Dipasang' : 'Pasang'}
                                </button>
                              </>
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

            {storeActiveTab === 'gacha' && (
              <div className="animate-fade-in duration-300">
                <Features26to30
                  coins={coins}
                  setCoins={setCoins}
                  diamonds={diamonds}
                  setDiamonds={setDiamonds}
                  membershipStatus={membershipStatus}
                  setMembershipStatus={setMembershipStatus}
                  unlockedSkins={unlockedSkins}
                  setUnlockedSkins={setUnlockedSkins}
                  unlockedThemes={unlockedThemes}
                  setUnlockedThemes={setUnlockedThemes}
                  unlockedFrames={unlockedFrames}
                  setUnlockedFrames={setUnlockedFrames}
                  selectedSkin={selectedSkin}
                  setSelectedSkin={setSelectedSkin}
                  selectedFrame={selectedFrame}
                  setSelectedFrame={setSelectedFrame}
                  boardTheme={boardTheme}
                  setBoardTheme={setBoardTheme}
                  diamondSavings={diamondSavings}
                  setDiamondSavings={setDiamondSavings}
                  dailyQuests={dailyQuests}
                  setDailyQuests={setDailyQuests}
                  triggerAudio={triggerAudio}
                  triggerReward={triggerReward}
                />
              </div>
            )}

            {storeActiveTab === 'flash_sale' && (
              <div className="animate-fade-in duration-300 space-y-6">
                {/* Friday Flash Sale Card */}
                <div className="bg-[#312e2b] p-6 rounded-3xl border border-[#3c3934] relative overflow-hidden shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black tracking-widest bg-rose-500 text-white px-2.5 py-0.5 rounded-lg uppercase">
                        PROMO JUMAT BERKAH COIN DISKON
                      </span>
                      
                      {/* Test Override Switch */}
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={forceFriday} 
                          onChange={(e) => setForceFriday(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-[#262421] border border-[#3c3934] peer-checked:border-rose-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:top-[3px] after:left-[3px] after:transition-all peer-checked:bg-rose-500 relative" />
                        <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Bypass Hari Jumat</span>
                      </label>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        Kilat Friday Flash Sale Spesial
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xl font-semibold mt-1 font-sans">
                        Setiap hari Jumat, Toko memberikan potongan harga eksklusif (Diskon 50% - 80%) 
                        pada bundel kustom kosmetika legendaris berbatas waktu yang ditawarkan secara acak khas untuk Anda!
                      </p>
                    </div>
                  </div>

                  {isCurrentlyFriday ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      {flashDeals.map((deal) => (
                        <div key={deal.id} className="p-5 bg-[#262421] border border-stone-800 hover:border-rose-500/50 rounded-2xl flex flex-col justify-between min-h-[12-rem] shadow-inner transition-all hover:scale-[1.01]">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-md">DISKON 70%</span>
                              <span className="text-yellow-500">Spesial</span>
                            </div>
                            <h4 className="font-extrabold text-[#cdc2af] text-sm mt-3">{deal.name}</h4>
                            <p className="text-[11px] text-slate-400 leading-normal mt-1.5 font-medium">{deal.desc}</p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-stone-800 flex justify-between items-center gap-2">
                            <div className="text-left font-mono">
                              <span className="text-[10px] text-slate-500 line-through block">{deal.originalCost}</span>
                              <span className="text-[#81b64c] font-black text-xs block">{deal.discountedCost} {deal.currency === 'coins' ? 'Koin' : 'Diamond'}</span>
                            </div>
                            <button
                              onClick={() => handleBuyFlashItem(deal)}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
                            >
                              Beli Kilat
                            </button>
                          </div>
                        </div>
                      ))}
                      {flashDeals.length === 0 && (
                        <div className="md:col-span-3 text-center py-10 text-xs text-slate-500 uppercase font-black tracking-wider font-mono">
                          Semua item promo Jumat flash sale hari ini telah sukses Anda borong habis!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-black/15 p-8 rounded-2xl text-center text-xs text-slate-500 uppercase font-black tracking-wider border border-[#3c3934]/35 mt-4">
                      Toko Flash Sale hanya terbuka secara otomatis setiap hari Jumat! (Centang opsi "Bypass Hari Jumat" di atas untuk demonstrasi uji coba)
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {mode === 'koleksi-pokedex' && (
          <div className="space-y-6">
            <Features41to50
              coins={coins}
              setCoins={setCoins}
              diamonds={diamonds}
              setDiamonds={setDiamonds}
              xp={xp}
              setXp={setXp}
              membershipStatus={membershipStatus}
              triggerAudio={triggerAudio}
              triggerReward={triggerReward}
              unlockedSkins={unlockedSkins}
              setUnlockedSkins={setUnlockedSkins}
              unlockedThemes={unlockedThemes}
              setUnlockedThemes={setUnlockedThemes}
              unlockedFrames={unlockedFrames}
              setUnlockedFrames={setUnlockedFrames}
              username={username}
              onlineRating={onlineRating}
            />
          </div>
        )}
      </main>
    </div>

      {/* SIDE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isNavDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsNavDrawerOpen(false);
                triggerAudio('move');
              }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-55 w-80 max-w-[90vw] bg-[#1e1c1b] border-l border-[#3c3934] shadow-2xl flex flex-col font-sans"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#3c3934] flex items-center justify-between bg-[#262421]">
                <div>
                  <h3 className="text-sm font-black text-[#81b64c] uppercase tracking-wider font-mono flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#81b64c]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 22H5v-2h14v2M17 10c0-1.35-.83-2.5-2-3c0-2-2-4-3-4s-3 2-3 4c-1.17.5-2 1.65-2 3c0 1.35.83 2.5 2 3h6c1.17-.5 2-1.35 2-3M18 18H6v-3h12v3m-7-3v-2h2v2h-2z" />
                    </svg>
                    Catur Nopal
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 font-sans">Navigasi Utama</p>
                </div>
                <button
                  onClick={() => {
                    setIsNavDrawerOpen(false);
                    triggerAudio('move');
                  }}
                  className="p-1.5 hover:bg-[#312e2b] text-slate-400 hover:text-white rounded-lg transition-colors border border-[#3c3934]/30"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Profile Summary/Stats inside Drawer */}
              <div className="p-4 bg-[#262421]/55 border-b border-[#3c3934]/60 flex items-center gap-3">
                <div 
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsNavDrawerOpen(false);
                    triggerAudio('move');
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform shrink-0"
                >
                  <AvatarWithFrame 
                    src={(user && user.profileAvatar) || martinAvatar} 
                    frameId={selectedFrame} 
                    size="sm" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    {membershipStatus === 'premium' && <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400/15 shrink-0" />}
                    <h4 className="text-white text-xs font-bold font-sans truncate uppercase">
                      {user ? user.username : username}
                    </h4>
                  </div>
                  <p className="text-[9px] text-[#9babaf] font-semibold mt-0.5 uppercase tracking-wide">
                    {membershipStatus === 'premium' ? 'Klub Premium' : `${onlineRating} ELO • Pemula`}
                  </p>
                </div>
              </div>

              {/* Navigation Links Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 py-6 space-y-2">
                {[
                  { id: 'home', label: 'Beranda', Icon: Home },
                  { id: 'menu', label: 'Arena Utama', Icon: Swords },
                  { id: 'select-character', label: 'Lawan Karakter AI', Icon: Award },
                  { id: 'puzzles', label: 'Teka-Teki Catur', Icon: Sparkles },
                  { id: 'lessons', label: 'Teori & Teaser', Icon: BookOpen },
                  { id: 'tournament', label: 'Turnamen Braket', Icon: Trophy },
                  { id: 'guild-suku', label: 'Klan & Klub Suku', Icon: Shield },
                  { id: 'koleksi-pokedex', label: 'Indeks Koleksi & Kuis (41-50)', Icon: Sparkles },
                  { id: 'forum-diskusi', label: 'Forum Komunitas', Icon: MessageSquare },
                  { id: 'toko-deals', label: 'Toko Sale & Promo', Icon: ShoppingBag },
                  { id: 'profile', label: 'Profil Catur', Icon: User },
                  { id: 'settings', label: 'Pengaturan', Icon: Settings }
                ].map((item) => {
                  const isArenaSubMode = ['menu', 'select-character', 'play', 'puzzles', 'lessons', 'online-match', 'analysis', 'local-friend', 'tournament', 'guild-suku'].includes(mode);
                  const isActive = (item.id === 'menu' && isArenaSubMode) || mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        // Confirm active game leave safety checks
                        if (mode === 'online-match' && onlineStatus === 'playing') {
                          if (!confirm('Apakah Anda yakin ingin meninggalkan pertandingan online yang sedang berjalan? Anda akan dinilai kalah!')) {
                            return;
                          }
                          setOnlineStatus('idle');
                        }
                        if (mode === 'puzzles') {
                          setPuzzleStatus('playing');
                        }

                        setMode(item.id as any);
                        setIsNavDrawerOpen(false);
                        triggerAudio('move');
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all font-sans text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#81b64c]/10 text-[#81b64c] font-black border border-[#81b64c]/20'
                          : 'text-slate-400 hover:text-white hover:bg-[#262421]/60 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.Icon className={`w-4 h-4 ${isActive ? 'text-[#81b64c]' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 bg-[#81b64c] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Status line */}
              <div className="p-4 bg-[#262421] border-t border-[#3c3934] text-center">
                <span className="text-[8px] font-mono font-bold tracking-widest text-[#9babaf] uppercase block">
                  Catur Nopal v2.0
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================
           FRIEND PROFILE & ACHIEVEMENTS MODAL
         ========================================= */}
      <AnimatePresence>
        {selectedFriendForDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#262421] border border-[#3c3934] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-[#1F1E1B] border-b border-[#3c3934] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-widest">
                    Profil & Pencapaian Rekan Duel
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedFriendForDetail(null)}
                  className="p-1 px-2.5 bg-[#312e2b] text-slate-400 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer border border-[#3c3934] transition-all"
                >
                  Tutup
                </button>
              </div>

              {/* Main Modal Scroll Body */}
              <div className="p-5 overflow-y-auto space-y-6">
                
                {/* BIO CARD */}
                <div className="bg-[#312e2b] p-4 rounded-2xl border border-[#3c3934] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <img
                    src={selectedFriendForDetail.avatar || martinAvatar}
                    alt="Friend Avatar"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl border border-[#3c3934] bg-neutral-900 object-cover"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h2 className="text-lg font-black text-white hover:text-[#81b64c] transition-colors leading-none tracking-tight">
                      @{selectedFriendForDetail.username}
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-400 max-w-lg truncate italic leading-normal">
                      {selectedFriendForDetail.bio || "Pecatur sejati pantang menyerah!"}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                      <span className="inline-block px-2.5 py-1 bg-[#262421] text-[#81b64c] font-mono text-[9px] font-black rounded-lg uppercase border border-[#3c3934]">
                        {selectedFriendForDetail.elo} ELO
                      </span>
                      <span className="inline-block px-2.5 py-1 bg-[#262421] text-[#FFC800] font-mono text-[9px] font-black rounded-lg uppercase border border-[#3c3934]">
                        {selectedFriendForDetail.xp} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* GAME METRICS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider leading-none">
                    Statistik Pertandingan
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#312e2b] border border-[#3c3934] p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Total Tanding</span>
                      <span className="text-xs font-black text-slate-200 block mt-1">{selectedFriendForDetail.matchesPlayed || 0} Game</span>
                    </div>

                    <div className="bg-[#312e2b] border border-[#3c3934] p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Kemenangan</span>
                      <span className="text-xs font-black text-emerald-500 block mt-1">{selectedFriendForDetail.matchesWon || 0} Menang</span>
                    </div>

                    <div className="bg-[#312e2b] border border-[#3c3934] p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Kekalahan</span>
                      <span className="text-xs font-black text-rose-500 block mt-1">
                        {Math.max(0, (selectedFriendForDetail.matchesPlayed || 0) - (selectedFriendForDetail.matchesWon || 0))} Kalah
                      </span>
                    </div>

                    <div className="bg-[#312e2b] border border-[#3c3934] p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Rasio Menang</span>
                      <span className="text-xs font-black text-cyan-400 block mt-1">
                        {selectedFriendForDetail.matchesPlayed ? Math.round(((selectedFriendForDetail.matchesWon || 0) / selectedFriendForDetail.matchesPlayed) * 100) : 0}% Ratio
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACHIEVEMENTS BLOCK */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider leading-none">
                    Lencana Pencapaian
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {ACHIEVEMENTS.map((ach) => {
                      const friendStats = {
                        played: selectedFriendForDetail.matchesPlayed || 0,
                        won: selectedFriendForDetail.matchesWon || 0,
                        elo: selectedFriendForDetail.elo || 400,
                        xp: selectedFriendForDetail.xp || 0
                      };
                      const isUnlocked = checkAchievementUnlocked(ach, friendStats);
                      const progress = getAchievementProgress(ach, friendStats);
                      
                      const IconComponent = ach.targetType === 'played' ? Swords :
                                            ach.targetType === 'won' ? Crown :
                                            ach.targetType === 'elo' ? Award : Sparkles;

                      return (
                        <div 
                          key={ach.id} 
                          className={`p-3 rounded-xl border flex flex-col xs:flex-row xs:items-center justify-between gap-3 relative overflow-hidden ${
                            isUnlocked 
                              ? 'bg-[#2b3524] border-[#4c7c29]/50 shadow-xs' 
                              : 'bg-[#312e2b] border-[#3c3934]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isUnlocked 
                                ? 'bg-[#374e2a] border-[#5d8a32]/50 text-[#85cb48]' 
                                : 'bg-[#262421] border-[#312e2b] text-slate-400'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className={`text-[11px] font-black tracking-tight ${isUnlocked ? 'text-[#a2e564]' : 'text-slate-300'}`}>
                                {ach.title}
                              </h5>
                              <p className="text-[9px] font-semibold text-slate-400 leading-snug">
                                {ach.description}
                              </p>
                              
                              <div className="mt-2 w-full bg-[#1c1a18] h-1 rounded-full overflow-hidden border border-[#2b2926]">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${isUnlocked ? 'bg-[#81b64c]' : 'bg-[#e5a034]'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-start xs:justify-center shrink-0 pl-10 xs:pl-0">
                            {isUnlocked ? (
                              <span className="bg-[#3e5f27] text-[#9ee75c] text-[7px] font-black px-2 py-1 rounded uppercase tracking-wider border border-[#5a863f]">
                                Terbuka
                              </span>
                            ) : (
                              <span className="bg-[#1c1a18] text-slate-500 text-[7px] font-black px-2 py-1 rounded uppercase tracking-wider border border-[#2d2a27]">
                                Terkunci
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
