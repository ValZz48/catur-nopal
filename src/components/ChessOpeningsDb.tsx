import React, { useState } from 'react';
import { 
  Search, BookOpen, Filter, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, 
  Info, Sparkles, Check, RotateCcw, HelpCircle, TrendingUp, Swords, ShieldAlert 
} from 'lucide-react';

export interface OpeningItem {
  id: string;
  name: string;
  subtitle: string;
  moves: string[]; // Step by step moves, e.g. ["1. e4", "1... e5", "2. Nf3", "2... Nc6", "3. Bb5"]
  side: 'White' | 'Black';
  style: 'Tactical' | 'Solid' | 'Aggressive' | 'Defensive';
  styleColor: string;
  desc: string;
  whitePlan: string;
  blackPlan: string;
  bestMove: string;
  commonTrap: string;
  // Pre-calculated board states for each step (0 is start, 1 is e4, etc.)
  boardSteps: string[][][]; 
}

const INITIAL_BOARD: string[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Let's helper clone board
const cloneBoard = (b: string[][]) => b.map(row => [...row]);

// Let's construct board states for standard openings step-by-step
const ruyLopezSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... e5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    return b;
  })(),
  // 2. Nf3
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    return b;
  })(),
  // 2... Nc6
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[0][1] = '.'; b[2][2] = 'n';
    return b;
  })(),
  // 3. Bb5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[0][1] = '.'; b[2][2] = 'n';
    b[7][5] = '.'; b[3][1] = 'B';
    return b;
  })()
];

const sicilianSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... c5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[3][2] = 'p';
    return b;
  })(),
  // 2. Nf3
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[3][2] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    return b;
  })(),
  // 2... d6
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[3][2] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[1][3] = '.'; b[2][3] = 'p';
    return b;
  })(),
  // 3. d4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[3][2] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[1][3] = '.'; b[2][3] = 'p';
    b[6][3] = '.'; b[4][3] = 'P';
    return b;
  })()
];

const queensGambitSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. d4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][3] = '.'; b[4][3] = 'P';
    return b;
  })(),
  // 1... d5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][3] = '.'; b[4][3] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    return b;
  })(),
  // 2. c4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][3] = '.'; b[4][3] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    b[6][2] = '.'; b[4][2] = 'P';
    return b;
  })(),
  // 2... e6 (Menolak)
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][3] = '.'; b[4][3] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    b[6][2] = '.'; b[4][2] = 'P';
    b[1][4] = '.'; b[2][4] = 'p';
    return b;
  })()
];

const italianSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... e5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    return b;
  })(),
  // 2. Nf3
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    return b;
  })(),
  // 2... Nc6
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[0][1] = '.'; b[2][2] = 'n';
    return b;
  })(),
  // 3. Bc4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[3][4] = 'p';
    b[7][6] = '.'; b[5][5] = 'N';
    b[0][1] = '.'; b[2][2] = 'n';
    b[7][5] = '.'; b[4][2] = 'B';
    return b;
  })()
];

const frenchSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... e6
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[2][4] = 'p';
    return b;
  })(),
  // 2. d4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[2][4] = 'p';
    b[6][3] = '.'; b[4][3] = 'P';
    return b;
  })(),
  // 2... d5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][4] = '.'; b[2][4] = 'p';
    b[6][3] = '.'; b[4][3] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    return b;
  })()
];

const caroKannSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... c6
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[2][2] = 'p';
    return b;
  })(),
  // 2. d4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[2][2] = 'p';
    b[6][3] = '.'; b[4][3] = 'P';
    return b;
  })(),
  // 2... d5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][2] = '.'; b[2][2] = 'p';
    b[6][3] = '.'; b[4][3] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    return b;
  })()
];

const scandinavianSteps: string[][][] = [
  INITIAL_BOARD,
  // 1. e4
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    return b;
  })(),
  // 1... d5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = 'P';
    b[1][3] = '.'; b[3][3] = 'p';
    return b;
  })(),
  // 2. exd5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = '.';
    b[1][3] = '.'; b[3][3] = 'P';
    return b;
  })(),
  // 2... Qxd5
  (() => {
    const b = cloneBoard(INITIAL_BOARD);
    b[6][4] = '.'; b[4][4] = '.';
    b[1][3] = '.'; b[3][3] = 'q';
    b[0][3] = '.';
    return b;
  })()
];

export const OPENINGS_DATABASE: OpeningItem[] = [
  {
    id: 'ruy_lopez',
    name: 'Ruy Lopez (Spanish Opening)',
    subtitle: 'Sistem Pembukaan Klasik Terpopuler & Sangat Kokoh',
    moves: ['Start', '1. e4', '1... e5', '2. Nf3', '2... Nc6', '3. Bb5'],
    side: 'White',
    style: 'Solid',
    styleColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    desc: 'Salah satu pembukaan catur tertua dan paling dihormati di tingkat master. Putih memajukan pion e4 lalu memposisikan gajah b5 untuk mengikat dan menekan kuda c6 hitam yang merupakan pelindung utama petak e5.',
    whitePlan: 'Gunakan Gajah b5 untuk menekan pertahanan hitam, lalu lakukan rokade dini. Putih merencanakan dominasi tengah papan lewat dorongan d4 untuk mengendalikan wilayah.',
    blackPlan: 'Mainkan 3... a6 (Pertahanan Morphy) untuk mendesak gajah putih b5 mundur ke a4, sembari bersiap meluncurkan dorongan sayap menteri b5 jika diperlukan.',
    bestMove: '3... a6 (Morphy Defense) memaksa gajah putih memilih mundur atau memukul.',
    commonTrap: 'Noah\'s Ark Trap: Jika putih terlalu serakah merebut pion sayap menteri, hitam dapat mengurung gajah terang putih di c2 menggunakan rantai pion c5 dan c4.',
    boardSteps: ruyLopezSteps
  },
  {
    id: 'sicilian_defense',
    name: 'Sicilian Defense (Pertahanan Sisilia)',
    subtitle: 'Senjata Utama Hitam untuk Kontra-Menyerang Agresif',
    moves: ['Start', '1. e4', '1... c5', '2. Nf3', '2... d6', '3. d4'],
    side: 'Black',
    style: 'Aggressive',
    styleColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    desc: 'Respon asimetris paling agresif dan terpopuler untuk membendung e4 putih. Hitam mengklaim penguasaan petak d4 menggunakan pion sayap c5 daripada catur simetris, menghasilkan pertempuran tajam dua arah.',
    whitePlan: 'Buka pusat papan lewat d4, kembangkan perwira secara aktif ke sayap raja untuk meluncurkan serangan badai taktis ke Raja hitam.',
    blackPlan: 'Gunakan keunggulan pion pusat pasca-pertukaran sayap menteri untuk menguasai file-c setengah terbuka, memicu serangan balik sayap menteri yang tajam.',
    bestMove: '2... d6 dilanjutkan 3... cxd4 setelah putih memainkan d4.',
    commonTrap: 'Siberian Trap: Dalam variasi Smith-Morra Gambit, putih bisa terjerat taktik pin mematikan jika membiarkan menteri hitam menyusup bebas ke petak h2.',
    boardSteps: sicilianSteps
  },
  {
    id: 'queens_gambit',
    name: "Queen's Gambit (Gambit Menteri)",
    subtitle: 'Strategi Pengorbanan Pion demi Kendali Penuh Pusat Papan',
    moves: ['Start', '1. d4', '1... d5', '2. c4', '2... e6'],
    side: 'White',
    style: 'Tactical',
    styleColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    desc: 'Putih menawarkan pion sayap c4 secara temporer sejak langkah kedua demi mendesak hitam menyerahkan pion d5. Jika hitam menerima gambit ini, putih akan dengan mudah merebut dominasi koordinasi pusat papan.',
    whitePlan: 'Kuasai wilayah pusat papan menggunakan kombinasi pion d4-e4, lalu bangun serangan kokoh berskala masif di sayap menteri.',
    blackPlan: 'Pertahankan cengkeraman pion d5 di pusat catur menggunakan dorongan pelindung e6 (Menolak Gambit) atau c6 (Pertahanan Slav).',
    bestMove: '2... e6 (Queen\'s Gambit Declined) adalah reaksi standar paling solid.',
    commonTrap: 'Albin Counter-Gambit Trap: Jika putih terpancing merebut material berlebih, hitam bisa melancarkan serangan berantai e3-d2 yang mampu memaksa promosi kuda di langkah ke-7!',
    boardSteps: queensGambitSteps
  },
  {
    id: 'italian_game',
    name: 'Italian Game (Permainan Italia)',
    subtitle: 'Pertarungan Klasik Menyerang Titik Lemah f7',
    moves: ['Start', '1. e4', '1... e5', '2. Nf3', '2... Nc6', '3. Bc4'],
    side: 'White',
    style: 'Tactical',
    styleColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    desc: 'Salah satu pembukaan tertua dan paling edukatif. Putih langsung mengerahkan gajah ke petak aktif c4 untuk membidik titik f7 hitam, yang merupakan titik terlemah dalam susunan pertahanan awal hitam.',
    whitePlan: 'Kembangkan gajah c4 dan kuda f3 secepat mungkin untuk menekan f7. Siapkan dorongan pusat c3 dan d4 untuk menciptakan dominasi penuh.',
    blackPlan: 'Posisikan gajah ke c5 (Giuoco Piano) untuk menetralisir gajah putih, atau luncurkan kuda ke f6 (Two Knights Defense) untuk serangan balik agresif.',
    bestMove: '3... Bc5 mempertahankan keseimbangan posisi dengan aman.',
    commonTrap: 'Fried Liver Attack: Pengorbanan kuda putih spektakuler di petak f7 yang menyeret Raja hitam keluar ke tengah papan dalam pusaran skak bertubi-tubi.',
    boardSteps: italianSteps
  },
  {
    id: 'french_defense',
    name: 'French Defense (Pertahanan Prancis)',
    subtitle: 'Sistem Pertahanan Blokade Sayap Ratu yang Tertutup',
    moves: ['Start', '1. e4', '1... e6', '2. d4', '2... d5'],
    side: 'Black',
    style: 'Defensive',
    styleColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    desc: 'Pertahanan ultra-solid di mana hitam menolak e5 dan memilih e6. Struktur ini mengizinkan putih menguasai ruang sayap raja, namun hitam akan membalas dengan melancarkan gempuran berantai ke rantai pion putih.',
    whitePlan: 'Dorong pion ke e5 untuk memperluas ruang serangan di sayap raja, bersiap menyerang sayap kanan hitam.',
    blackPlan: 'Serang balik fondasi struktur d4 putih lewat dorongan c5 dan f6, sembari memecahkan masalah gajah c8 yang terkurung.',
    bestMove: '3. e5 (Advance Variation) atau 3. Nc3 untuk mempertahankan pion e4.',
    commonTrap: 'Légal Trap Modifikasi: Terlalu lambat melakukan rokade di variasi prancis tertutup dapat membuat hitam tersapu kombinasi ksatria sayap menteri.',
    boardSteps: frenchSteps
  },
  {
    id: 'caro_kann',
    name: 'Caro-Kann Defense (Pertahanan Caro-Kann)',
    subtitle: 'Benteng Kokoh Tanpa Masalah Blokade Gajah Terang',
    moves: ['Start', '1. e4', '1... c6', '2. d4', '2... d5'],
    side: 'Black',
    style: 'Solid',
    styleColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    desc: 'Sering disebut sebagai kerabat yang lebih solid dari French Defense. Hitam bersiap meluncurkan d5 dengan dukungan c6, menjaga agar jalur gajah terang c8 tetap bebas bergerak keluar sebelum blokade pertahanan ditutup.',
    whitePlan: 'Dorong e5 untuk membatasi ruang hitam, atau pertahankan ketegangan pusat lewat pertukaran pion di d5.',
    blackPlan: 'Kembangkan gajah c8 ke f5 secepatnya, selesaikan struktur pertahanan e6, lalu gempur pion d4 putih memakai dorongan c5.',
    bestMove: '3. e5 Bf5 menempatkan gajah terang di jalur diagonal aktif.',
    commonTrap: 'Smyslov Knight Trap: Hitam bisa terkena skakmat kilat di langkah ke-6 lewat manuver kuda g6 putih jika ceroboh meletakkan kuda di langkah kelima.',
    boardSteps: caroKannSteps
  },
  {
    id: 'scandinavian_defense',
    name: 'Scandinavian Defense (Pertahanan Skandinavia)',
    subtitle: 'Tantangan Terbuka Instan pada Pion Pusat Putih',
    moves: ['Start', '1. e4', '1... d5', '2. exd5', '2... Qxd5'],
    side: 'Black',
    style: 'Tactical',
    styleColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    desc: 'Pernyataan perang instan di langkah pertama! Hitam langsung memukul e4 putih menggunakan pion d5. Ini menyederhanakan permainan dan membuka jalur pergerakan menteri hitam sejak awal laga.',
    whitePlan: 'Pukul pion d5, kembangkan kuda c3 dengan tempo mengancam menteri hitam, serta rebut kontrol waktu langkah pembuka.',
    blackPlan: 'Mundur aman bersama menteri ke a5 atau d8, lalu kembangkan perwira secara dinamis memanfaatkan baris papan yang bersih.',
    bestMove: '2... Qxd5 dilanjutkan 3. Nc3 Qa5 menjaga menteri tetap aktif di sayap.',
    commonTrap: 'Tennison Gambit Trap: Putih menawarkan gambit kuda taktis f3 untuk menjebak menteri hitam di petak d5 melalui tusukan sate gajah.',
    boardSteps: scandinavianSteps
  }
];

export const ChessOpeningsDb: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSide, setSelectedSide] = useState<'All' | 'White' | 'Black'>('All');
  const [selectedStyle, setSelectedStyle] = useState<'All' | 'Tactical' | 'Solid' | 'Aggressive' | 'Defensive'>('All');
  const [activeOpening, setActiveOpening] = useState<OpeningItem>(OPENINGS_DATABASE[0]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  // Filter openings
  const filteredOpenings = OPENINGS_DATABASE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = selectedSide === 'All' || item.side === selectedSide;
    const matchesStyle = selectedStyle === 'All' || item.style === selectedStyle;
    return matchesSearch && matchesSide && matchesStyle;
  });

  const handleSelectOpening = (item: OpeningItem) => {
    setActiveOpening(item);
    setActiveStepIdx(0); // Reset stepper
  };

  const nextStep = () => {
    if (activeStepIdx < activeOpening.moves.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx(prev => prev - 1);
    }
  };

  // Map representation of pieces to high contrast characters
  const pieceSymbols: Record<string, string> = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    '.': ''
  };

  const pieceColorClass = (char: string): string => {
    if (char === '.') return '';
    // Black pieces are lower case
    if (char === char.toLowerCase()) {
      return 'text-amber-950 font-black';
    }
    // White pieces are upper case
    return 'text-amber-50 font-black filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]';
  };

  const currentBoard = activeOpening.boardSteps[activeStepIdx] || INITIAL_BOARD;

  return (
    <div className="bg-[#1c1a19] border border-[#3c3934] rounded-3xl p-5 md:p-6 space-y-6 text-slate-200 shadow-2xl font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3c3934]/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#81b64c]/15 border border-[#81b64c]/30 flex items-center justify-center text-[#81b64c] shrink-0">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Database Pembukaan Catur
            </h3>
            <p className="text-xs text-[#81b64c] font-black uppercase tracking-wider font-mono">
              Chess Openings Master Class & Guide
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, taktik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#262421] border border-[#3c3934] rounded-xl text-xs font-bold text-white placeholder-slate-550 focus:outline-none focus:border-[#81b64c] focus:ring-1 focus:ring-[#81b64c] transition-all"
          />
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#262421]/60 p-3 rounded-2xl border border-[#3c3934]/50">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase mr-1.5 tracking-wider font-mono">Kubu:</span>
          {(['All', 'White', 'Black'] as const).map(side => (
            <button
              key={side}
              onClick={() => setSelectedSide(side)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                selectedSide === side 
                  ? 'bg-[#81b64c] text-white font-black shadow-md' 
                  : 'bg-[#1c1a19]/50 text-slate-400 hover:text-white hover:bg-stone-900/60'
              }`}
            >
              {side === 'All' ? 'Semua' : side === 'White' ? 'Putih (1st)' : 'Hitam (Def)'}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-[1px] bg-[#3c3934]/60 self-stretch my-1" />

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase mr-1.5 tracking-wider font-mono">Gaya:</span>
          {(['All', 'Tactical', 'Solid', 'Aggressive', 'Defensive'] as const).map(style => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                selectedStyle === style 
                  ? 'bg-indigo-600 text-white font-black shadow-md' 
                  : 'bg-[#1c1a19]/50 text-slate-400 hover:text-white hover:bg-stone-900/60'
              }`}
            >
              {style === 'All' ? 'Semua Gaya' : style === 'Tactical' ? 'Taktis' : style === 'Solid' ? 'Solid' : style === 'Aggressive' ? 'Agresif' : 'Defensif'}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FILTERED LIST */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1 font-mono">
            Katalog Pembukaan ({filteredOpenings.length})
          </span>

          {filteredOpenings.map(item => {
            const isSelected = activeOpening.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectOpening(item)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'bg-[#262421] border-[#81b64c] shadow-lg scale-[1.01]' 
                    : 'bg-[#262421]/30 border-[#3c3934] hover:bg-[#262421]/60'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-tight line-clamp-1">{item.name}</h4>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.styleColor}`}>
                      {item.style}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-semibold line-clamp-1">{item.subtitle}</p>
                  <p className="text-[9.5px] font-mono text-[#81b64c] font-bold">Moves: {item.moves.slice(1).join(' ')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-550 shrink-0" />
              </div>
            );
          })}

          {filteredOpenings.length === 0 && (
            <div className="p-8 text-center bg-[#262421]/20 border border-[#3c3934]/40 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold">Tidak ada pembukaan catur yang cocok dengan filter pencarian Anda.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILED INTERACTIVE VIEW */}
        <div className="lg:col-span-7 bg-[#262421] border border-[#3c3934] p-5 rounded-3xl space-y-5 shadow-lg">
          
          {/* Header Details */}
          <div className="space-y-1.5 border-b border-[#3c3934]/60 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                activeOpening.side === 'White' 
                  ? 'bg-amber-100 text-amber-900 font-black' 
                  : 'bg-stone-900 text-amber-100 border border-stone-850 font-black'
              }`}>
                Kubu {activeOpening.side === 'White' ? 'Putih' : 'Hitam'}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${activeOpening.styleColor}`}>
                {activeOpening.style}
              </span>
            </div>
            <h4 className="text-base font-black text-white uppercase tracking-tight">{activeOpening.name}</h4>
            <p className="text-xs text-[#81b64c] font-extrabold">{activeOpening.subtitle}</p>
          </div>

          {/* Interactive Stepping Map with Mini-Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            
            {/* MINI BOARD VIEW (Unicode-based beautiful rendering) */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="bg-[#1c1a19] p-2 rounded-2xl border border-[#3c3934] shadow-inner w-fit">
                <div className="grid grid-cols-8 gap-0 border border-[#1a1817]">
                  {currentBoard.map((row, rIdx) => 
                    row.map((cell, cIdx) => {
                      const isDark = (rIdx + cIdx) % 2 === 1;
                      const squareBg = isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]';
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-lg sm:text-xl transition-all ${squareBg}`}
                        >
                          <span className={pieceColorClass(cell)}>
                            {pieceSymbols[cell] || ''}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <span className="text-[9.5px] text-slate-400 font-mono font-bold tracking-wider">
                Garis Koordinat Visual Bidang Pembukaan
              </span>
            </div>

            {/* MOVES STEPPER CONTROLLER */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono block">
                  Alur Gerakan (Moveset):
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {activeOpening.moves.map((move, index) => {
                    const isPassed = index <= activeStepIdx;
                    const isCurrent = index === activeStepIdx;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveStepIdx(index)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-black transition-all ${
                          isCurrent 
                            ? 'bg-[#81b64c] text-white ring-1 ring-white shadow-md' 
                            : isPassed
                              ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 hover:bg-indigo-900/35'
                              : 'bg-[#1c1a19] text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {move}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={activeStepIdx === 0}
                  className="p-2 bg-[#1c1a19] hover:bg-stone-900 disabled:opacity-40 text-white rounded-lg transition border border-[#3c3934] cursor-pointer"
                  title="Kembali"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextStep}
                  disabled={activeStepIdx === activeOpening.moves.length - 1}
                  className="flex-1 py-1.5 bg-[#81b64c] hover:bg-green-500 disabled:opacity-40 text-white font-extrabold text-[10.5px] uppercase rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  Langkah Maju <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveStepIdx(0)}
                  className="p-2 bg-[#1c1a19] hover:bg-stone-900 text-slate-400 hover:text-white rounded-lg transition border border-[#3c3934] cursor-pointer"
                  title="Reset Posisi"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Informative Step Commentary */}
              <div className="p-3 bg-[#1c1a19]/80 rounded-xl border border-[#3c3934]/70">
                <div className="flex gap-1.5 items-start">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] text-slate-300 leading-snug font-medium">
                    {activeStepIdx === 0 
                      ? 'Atur bidang papan catur ke bentuk standard. Klik "Langkah Maju" untuk melihat langkah awal pembukaan ini.' 
                      : `Posisi terbentuk setelah langkah ${activeOpening.moves.slice(1, activeStepIdx + 1).join(' ')}. Strategi ini mendorong koordinasi menteri dan pion pusat.`
                    }
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* VISUAL GUIDE & STRATEGIC CONTENT */}
          <div className="space-y-3.5 pt-2 border-t border-[#3c3934]/60">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-black/30 border border-[#3c3934]/60 rounded-xl space-y-1.5">
                <h5 className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> Rencana Utama Putih (White Plan)
                </h5>
                <p className="text-[11px] text-slate-300 leading-normal font-semibold font-sans">
                  {activeOpening.whitePlan}
                </p>
              </div>

              <div className="p-3.5 bg-black/30 border border-[#3c3934]/60 rounded-xl space-y-1.5">
                <h5 className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Swords className="w-3.5 h-3.5" /> Rencana Kontra Hitam (Black Plan)
                </h5>
                <p className="text-[11px] text-slate-300 leading-normal font-semibold font-sans">
                  {activeOpening.blackPlan}
                </p>
              </div>
            </div>

            <div className="space-y-2 bg-[#1c1a19]/50 p-4 rounded-2xl border border-[#3c3934]/40">
              <h5 className="text-[10.5px] text-indigo-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Deskripsi Analisa Posisi
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                {activeOpening.desc}
              </p>
            </div>

            {/* Tactical Best Response & Trap details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="flex gap-2 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono block">Rekomendasi Respon Terbaik</span>
                  <p className="text-[10.5px] font-bold text-slate-200 mt-0.5">{activeOpening.bestMove}</p>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-red-950/10 border border-red-900/30 rounded-xl">
                <div className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                  <HelpCircle className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono block">Jebakan Taktis Tersembunyi (Trap)</span>
                  <p className="text-[10.5px] font-bold text-slate-200 mt-0.5">{activeOpening.commonTrap}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
