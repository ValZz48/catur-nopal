import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Award, Shield, MessageSquare, ShoppingBag, User, Settings, Check, Lock, Star, 
  HelpCircle, Sparkles, Flame, Play, Trophy, Users, Eye, EyeOff, BookOpen, Clock, 
  AlertTriangle, Ban, Coins, Gem, Crown, Volume2, ShieldAlert, Heart, RefreshCw, ChevronRight, X, Bell, Gift,
  Zap, Swords, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChessPiece } from './ChessPieces';
import { AvatarWithFrame } from './AvatarWithFrame';

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

  forceTab?: 'quiz' | 'ritual' | 'settings' | 'medals' | 'pokedex' | 'block-report' | 'notif';
  hideHeaderAndTabs?: boolean;
  onSendReportToInbox?: (reportMsg: string) => void;
  onSendNotificationToInbox?: (notiMsg: string) => void;

  settingsTheme?: 'dark' | 'light';
  setSettingsTheme?: (theme: 'dark' | 'light') => void;
  settingsLang?: 'id' | 'en';
  setSettingsLang?: (lang: 'id' | 'en') => void;
  diamondSavings?: number;
  setDiamondSavings?: React.Dispatch<React.SetStateAction<number>>;
  unlockedTitles: string[];
  setUnlockedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  onTriggerRestartTutorial?: () => void;
  syncUserStats?: any;
  user?: any;
  starterPackClaimed?: boolean;
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
  { id: 'lv1', name: 'Aliran Kuda & Garpu Taktis', type: 'quiz', x: 120, y: 1100, solved: true },
  { id: 'lv2', name: 'Kuncian Pin & Tembusan Gajah', type: 'quiz', x: 200, y: 1010, solved: true },
  { id: 'pt1', name: 'Peti Taktis Menengah', type: 'chest', x: 140, y: 920, solved: false, stars: 0 },
  { id: 'lv3', name: 'Skak Ster & Serangan Membuka', type: 'quiz', x: 70, y: 830, solved: false },
  { id: 'lv4', name: 'Pola Skakmat Koridor Belakang', type: 'quiz', x: 160, y: 740, solved: false },
  { id: 'pt2', name: 'Peti Kerajaan Rahasia', type: 'chest', x: 240, y: 650, solved: false, stars: 0 },
  { id: 'lv5', name: 'Taktik Pengorbanan Benteng', type: 'quiz', x: 110, y: 560, solved: false },
  { id: 'lv6', name: 'Teori End-Game Raja & Pion', type: 'quiz', x: 180, y: 470, solved: false },
  { id: 'pt3', name: 'Peti Legenda Grandmaster', type: 'chest', x: 120, y: 380, solved: false, stars: 0 },
  { id: 'lv7', name: 'Overloading & Deflection', type: 'quiz', x: 80, y: 290, solved: false },
  { id: 'lv8', name: 'Anastasia & Arabian Mate', type: 'quiz', x: 190, y: 200, solved: false },
  { id: 'lv9', name: 'Strategi Lajur Terbuka', type: 'quiz', x: 240, y: 120, solved: false },
  { id: 'lv10', name: 'Langkah Selipan Zwischenzug', type: 'quiz', x: 140, y: 50, solved: false },
  { id: 'lv11', name: 'Perangkap Pembukaan Klasik', type: 'quiz', x: 180, y: -20, solved: false },
];

const CATUR_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  lv1: [
    {
      id: 'q1_1',
      question: 'Manakah dari perwira berikut yang paling mahir melakukan taktik Garpu (Fork / menusuk dua perwira sekaligus)?',
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
    },
    {
      id: 'q1_3',
      question: 'Jika Kuda Anda berada di f3 dan Raja lawan di e5 serta Menteri lawan di g5, langkah mana yang menghasilkan Double Attack / Fork?',
      options: ['Ke d4', 'Ke h4', 'Ke e1', 'Ke g1'],
      correctIdx: 0,
      explanation: 'Melangkah ke d4 menempatkan Kuda untuk menskak Raja di e5 sekaligus mengancam Menteri di g5 secara bersamaan.'
    },
    {
      id: 'q1_4',
      question: 'Mengapa garpu Kuda (Knight Fork) sangat ditakuti dalam pertandingan catur?',
      options: ['Sebab Kuda bisa melompati perwira lain dan gerakannya sulit diprediksi sekilas', 'Sebab Kuda adalah perwira terkuat', 'Sebab Kuda bergerak lurus saja', 'Sebab Kuda tidak bisa dimakan'],
      correctIdx: 0,
      explanation: 'Kuda dapat melompati barikade bidak dan menyerang kotak-kotak non-linear, menjadikannya senjata taktis senyap yang sering terlewatkan oleh lawan.'
    },
    {
      id: 'q1_5',
      question: 'Bagaimana cara terbaik untuk merespons serangan garpu taktis dari musuh?',
      options: ['Menyerang Raja lawan dengan skak jika kemungkinan atau menggerakkan perwira paling bernilai sambil menciptakan ancaman balik', 'Mengaku kalah langsung', 'Menggerakkan pion terdepan', 'Melakukan rokade darurat'],
      correctIdx: 0,
      explanation: 'Menyelamatkan perwira penting dengan membuat tempo skak atau melakukan serangan balik setara adalah pertahanan taktis aktif terbaik.'
    }
  ],
  lv2: [
    {
      id: 'q2_1',
      question: 'Taktik Pin (Kuncian) terjadi saat perwira yang diserang tidak bisa bergerak demi melindungi perwira bernilai lebih tinggi di belakangnya. Perwira mana saja yang bisa melakukan pin?',
      options: ['Kuda & Raja', 'Gajah, Benteng, & Menteri', 'Pion & Raja', 'Kuda saja'],
      correctIdx: 1,
      explanation: 'Hanya perwira penyerang jarak jauh lurus atau diagonal (Gajah, Benteng, Menteri) yang mampu membuat kuncian atau pin.'
    },
    {
      id: 'q2_2',
      question: 'Apa perbedaan mendasar antara Kuncian Mutlak (Absolute Pin) dan Kuncian Relatif (Relative Pin)?',
      options: ['Kuncian mutlak mengunci perwira di depan Raja sehingga secara ilegal tidak boleh bergerak sama sekali; kuncian relatif mengunci perwira di depan perwira bernilai tinggi lainnya', 'Kuncian relatif tidak bisa dilepas', 'Kuncian mutlak hanya bisa dilakukan oleh Pion', 'Tidak ada perbedaan sama sekali'],
      correctIdx: 0,
      explanation: 'Absolute Pin melibatkan Raja di garis belakang, sehingga melanggar aturan catur jika perwira yang terkunci melangkah. Relative Pin melindungi Menteri/Benteng, melangkah diperbolehkan namun merugikan.'
    },
    {
      id: 'q2_3',
      question: 'Gajah putih di g5 mengunci Kuda hitam di f6 yang melindungi Menteri di d8. Jenis kuncian apa ini?',
      options: ['Kuncian Relatif (Relative Pin)', 'Kuncian Mutlak (Absolute Pin)', 'Skakmat Koridor', 'Taktik Overloading'],
      correctIdx: 0,
      explanation: 'Ini adalah kuncian relatif karena Kuda secara legal diperbolehkan melangkah, meskipun melangkahkan Kuda akan menyebabkan Menteri lenyap dipukul Gajah g5.'
    },
    {
      id: 'q2_4',
      question: 'Perwira manakah yang SECARA DEFINISI tidak bisa terkena kuncian (pin) oleh perwira musuh?',
      options: ['Raja (karena tidak boleh berada di belakang perwira lain dalam serangan)', 'Menteri', 'Benteng', 'Pion'],
      correctIdx: 0,
      explanation: 'Raja tidak pernah bisa di-pin karena Raja dilarang diposisikan dalam bahaya skak di belakang perwira lain.'
    },
    {
      id: 'q2_5',
      question: 'Bagaimana cara mematahkan kuncian (unpinning) yang paling umum dilakukan?',
      options: ['Menaruh perwira pelindung di antara perwira yang mengunci and yang dikunci, atau menyerang balik perwira yang melakukan pin', 'Membuang perwira sendiri', 'Segera menyerah', 'Mengalihkan perhatian dengan pion samping'],
      correctIdx: 0,
      explanation: 'Menyisipkan perwira pelindung penetral atau mengusir perwira penyerang dengan pion pendukung adalah taktik unpin paling efektif.'
    }
  ],
  lv3: [
    {
      id: 'q3_1',
      question: 'Apa arti dari taktik Skak Ster Membuka (Discovered Check)?',
      options: ['Menyerang Menteri musuh dengan meloncat', 'Melangkah satu perwira yang membuka jalur serangan perwira lain untuk menskak Raja lawan', 'Melindungi Menteri sendiri', 'Menukar bidak secara acak'],
      correctIdx: 1,
      explanation: 'Discovered check terjadi ketika kita melangkahkan satu perwira, lalu secara otomatis membuka jalur serangan perwira lain di belakangnya untuk memberi skak.'
    },
    {
      id: 'q3_2',
      question: 'Taktik Skak Ganda (Double Check) adalah kasus ekstrem dari Discovered Check. Mengapa Skak Ganda sangat mematikan?',
      options: ['Karena Raja lawan WAJIB melangkah keluar dari kotak serangan; skak ganda tidak bisa dihalangi atau dimakan perwiranya', 'Sebab Raja langsung dinyatakan gugur', 'Sebab Menteri otomatis hilang', 'Sebab pion boleh melangkah mundur'],
      correctIdx: 0,
      explanation: 'Dalam skak ganda, dua perwira menskak Raja sekaligus dari sudut berbeda. Menghalangi satu serangan tidak menghentikan yang lain, sehingga Raja wajib melangkah.'
    },
    {
      id: 'q3_3',
      question: 'Jika Benteng Anda di d1 menghalangi Gajah Anda di g2 untuk menyerang Raja lawan di b7, langkah Benteng apa yang paling taktis?',
      options: ['Melompat bebas ke tujuan yang mengancam perwira bernilai tinggi lawan (sebagai Discovered Attack)', 'Tetap diam', 'Mundur ke d2', 'Membakar papan catur'],
      correctIdx: 0,
      explanation: 'Saat melangkahkan Benteng, serangan Gajah ke Raja mendominasi fokus musuh, sehingga Benteng kita bebas memakan atau mengancam perwira penting lainnya tanpa bisa direspons.'
    },
    {
      id: 'q3_4',
      question: 'Taktik membujuk perwira pelindung musuh keluar dari posisinya agar skak terbuka dapat dilancarkan disebut...',
      options: ['Pengumpanan (Decoy / Deflection)', 'Rokade Palsu', 'Pion Gantung', 'Oposisi Vertikal'],
      correctIdx: 0,
      explanation: 'Deflection atau pengalihan memaksa perwira kunci meraposisi, memungkinkan serangan taktis pembuka dilancarkan ke sasaran utama.'
    },
    {
      id: 'q3_5',
      question: 'Bagaimana cara mencegah serangan skak terbuka (discovered check) yang terdeteksi di papan?',
      options: ['Menghindari meluruskan posisi Raja di garis yang sama dengan perwira penembak jarak jauh musuh', 'Menumpuk pion samping', 'Mencuri perwira lawan', 'Mengubah posisi papan'],
      correctIdx: 0,
      explanation: 'Mencegah Raja berada sejalur (lurus/diagonal) dengan Gajah, Benteng, atau Menteri lawan adalah disiplin pertahanan mencegah taktik discovered check.'
    }
  ],
  lv4: [
    {
      id: 'q4_1',
      question: 'Skakmat Koridor (Back-Rank Mate) biasanya terjadi di baris paling belakang akibat Raja lawan terkurung oleh...',
      options: ['Bentengnya sendiri', 'Pion-pion pelindungnya sendiri', 'Area kosong yang luas', 'Serangan Kuda berputar'],
      correctIdx: 1,
      explanation: 'Back-Rank Mate mengeksploitasi barisan belakang yang sempit di mana Raja terhalang untuk lari ke depan oleh jajaran pion pelindungnya sendiri.'
    },
    {
      id: 'q4_2',
      question: 'Langkah profilaksis (pencegahan) apakah yang paling sering dilakukan untuk menghindari risiko Skakmat Koridor di barisan belakang?',
      options: ['Membuat celah napas ("Luft") dengan memajukan salah satu pion pelindung Raja (h3/g3 atau h6/g6)', 'Menukar semua Gajah', 'Membuat dua Menteri', 'Tetap diam di tengah'],
      correctIdx: 0,
      explanation: 'Membuat "Luft" atau jendela udara memberikan Raja rute pelarian dinamis ke baris kedua jika baris belakang digempur oleh Benteng lawan.'
    },
    {
      id: 'q4_3',
      question: 'Perwira penyerang apa yang paling sering mengeksekusi skakmat koridor?',
      options: ['Benteng atau Menteri', 'Kuda atau Gajah', 'Pion tunggal', 'Raja aktif'],
      correctIdx: 0,
      explanation: 'Benteng dan Menteri adalah perwira garis lurus yang mampu menyapu seluruh baris belakang (horizontal) untuk merampas seluruh ruang Raja.'
    },
    {
      id: 'q4_4',
      question: 'Jika baris belakang dilindungi satu Benteng, dan lawan menyerang dengan dua Benteng terhubung (Battery), tindakan apa yang terjadi?',
      options: ['Benteng pelindung kewalahan (Overloading) dan baris belakang akan runtuh terkena koridor mate', 'Raja langsung menang', 'Papan dinyatakan remis otomatis', 'Benteng pelindung hidup selamanya'],
      correctIdx: 0,
      explanation: 'Battery (dua perwira sejalur) menumpuk daya serang. Satu pelindung tidak cukup meredam dua hantaman berturut-turut di baris belakang.'
    },
    {
      id: 'q4_5',
      question: 'Dalam posisi terdesak di baris belakang tanpa celah udara, apa penyelamatan taktis terakhir?',
      options: ['Menempatkan perwira lain sebagai perisai penahan di baris belakang, mengharapkan kompensasi langkah', 'Membalikkan bidak', 'Duduk diam menunggu waktu habis', 'Melompat keluar lapangan'],
      correctIdx: 0,
      explanation: 'Menaruh pertahanan interposisi di baris belakang dapat memperlambat serangan dan memberi waktu bagi perwira lain untuk menolong.'
    }
  ],
  lv5: [
    {
      id: 'q5_1',
      question: 'Mengapa taktik Pengorbanan (Sacrifice) dilakukan dalam permainan catur?',
      options: ['Karena putus asa', 'Untuk memancing Raja lawan keluar ke posisi terbuka atau demi skakmat cepat', 'Untuk mengurangi jumlah bidak di papan', 'Agar permainan lebih singkat'],
      correctIdx: 1,
      explanation: 'Pengorbanan taktis memberikan perwira berharga tinggi secara sengaja demi mendapatkan kompensasi yang jauh lebih besar seperti skakmat atau keunggulan posisi prima.'
    },
    {
      id: 'q5_2',
      question: 'Pengorbanan Yunani Kuno ("Greek Gift Sacrifice") yang terkenal melibatkan pengorbanan perwira apa di kotak h7/h2?',
      options: ['Gajah (Bishop)', 'Kuda (Knight)', 'Benteng', 'Menteri'],
      correctIdx: 0,
      explanation: 'Greek Gift adalah pengorbanan Gajah Klasik di h7/h2 guna merusak dinding pion pelindung Raja lawan dan mengundang serangan telak Kuda & Menteri.'
    },
    {
      id: 'q5_3',
      question: 'Apa perbedaan pengorbanan taktis (Tactical Sacrifice) dengan pengorbanan posisional (Positional Sacrifice)?',
      options: ['Pengorbanan taktis meminta imbalan konkret instan murni (seperti skakmat/rebut perwira); pengorbanan posisional menukar nilai materi demi dominasi strategis jangka panjang', 'Tidak ada bedanya', 'Pengorbanan taktis hanya untuk menteri', 'Pengorbanan posisional ilegal'],
      correctIdx: 0,
      explanation: 'Taktis mengejar hasil cepat matematis konklusif. Posisional menukar aset konkret demi keunggulan abstrak jangka panjang seperti kontrol ruang atau melemahkan petak.'
    },
    {
      id: 'q5_4',
      question: 'Pengorbanan Menteri yang memaksa Raja lawan masuk ke jaring skakmat indah disebut...',
      options: ['Pengorbanan Agung (Queen Sacrifice Mate)', 'Tergelincir Waktu', 'Pembukaan Spanyol hancur', 'Stalemate Terencana'],
      correctIdx: 0,
      explanation: 'Pengorbanan Menteri adalah taktik tertinggi catur yang menuntut akurasi kalkulasi ekstrem karena risiko kerugian materiil terbesar jika meleset.'
    },
    {
      id: 'q5_5',
      question: 'Sebelum melakukan pengorbanan perwira, hal fundamental apa yang WAJIB dihitung matang?',
      options: ['Menghitung paksaan respons lawan murni (Forced Moves) hingga akhir skenario kelanjutan', 'Warna seragam musuh', 'Jumlah penonton pertandingan', 'Nama pembuat papan catur'],
      correctIdx: 0,
      explanation: 'Pengorbanan tanpa kalkulasi langkah paksa (forced lines) murni hanyalah blunder spekulatif keliru yang merugikan posisi sendiri.'
    }
  ],
  lv6: [
    {
      id: 'q6_1',
      question: 'Dalam permainan akhir (Endgame) Raja & Pion melawan Raja tunggal, posisi di mana kedua Raja saling berhadapan langsung terhalang 1 kotak disebut...',
      options: ['Oposisi (Opposition)', 'Rokade Tambahan', 'Zugzwang Pion', 'Stalemate Total'],
      correctIdx: 0,
      explanation: 'Oposisi adalah kondisi strategis krusial di akhir laga di mana satu Raja berhadapan langsung dengan Raja lain, guna membatasi ruang melompat lawan.'
    },
    {
      id: 'q6_2',
      question: 'Apa arti dari istilah jerman Zugzwang dalam babak akhir catur?',
      options: ['Situasi di mana pemain terpaksa melangkah, namun setiap langkah legal yang tersedia justru memeperburuk posisi mereka', 'Langkah skak maut', 'Promosi ganda pion', 'Hasil pertandingan remis otomatis'],
      correctIdx: 0,
      explanation: 'Zugzwang adalah kewajiban melangkah yang merugikan. Jika diizinkan "pass", posisi mereka aman; namun aturan wajib melangkah runtuh.'
    },
    {
      id: 'q6_3',
      question: 'Aturan 50 Langkah (50-move rule) menyatakan bahwa permainan dapat dinyatakan remis (draw) jika dalam 50 langkah berturut-turut...',
      options: ['Tidak ada pion yang melangkah dan tidak ada perwira yang dipukul/dimakan', 'Raja tidak melangkah', 'Menteri terus melakukan skak', 'Pemain tertidur'],
      correctIdx: 0,
      explanation: 'Aturan ini mencegah kesia-siaan tanpa akhir di permainan akhir, menjamin laga selesai jika tidak ada progres perubahan struktur pion atau pemukulan.'
    },
    {
      id: 'q6_4',
      question: 'Dalam babak akhir, "Pion Bebas" (Passed Pawn) adalah pion yang...',
      options: ['Tidak terhalang pion lawan di lajurnya atau di lajur sebelahnya untuk maju promosi', 'Sudah dimakan lawan', 'Bergerak miring selamanya', 'Diberi izin melompati Raja'],
      correctIdx: 0,
      explanation: 'Passed pawn adalah kunci kemenangan utama babak akhir karena mereka tidak terhadang pion musuh dalam pacuan lurus menuju kenaikan pangkat.'
    },
    {
      id: 'q6_5',
      question: 'Konsep "Aturan Kotak" (Rule of the Square) digunakan dalam babak akhir untuk menghitung secara cepat apakah...',
      options: ['Raja bertahan dapat mengejar dan menangkap pion bebas musuh sebelum sempat promosi', 'Papan catur berbentuk kotak sempurna', 'Kuda bisa meloncat melingkar', 'Gajah putih berpindah ke petak hitam'],
      correctIdx: 0,
      explanation: 'Dengan membuat kotak imajiner diagonal dari pion bebas, kita tahu pasti apakah Raja bertahan bisa masuk ke dalam kotak dan menetralisir pion tanpa kalkulasi manual yang melelahkan.'
    }
  ],
  lv7: [
    {
      id: 'q7_1',
      question: 'Apa yang dimaksud dengan "Overloading" (Beban Berlebih) dalam taktik catur?',
      options: [
        'Satu perwira dipaksa mempertahankan dua atau lebih perintasan penting sekaligus, sehingga tidak berdaya jika salah satunya diserang',
        'Pemain memegang terlalu banyak materi di tangannya',
        'Bot catur menggunakan kalkulator eksternal',
        'Waktu berpikir pemain habis seketika'
      ],
      correctIdx: 0,
      explanation: 'Overloading mengeksploitasi perwira bertahan yang memiliki terlalu banyak tanggung jawab perlindungan. Ketika salah satu target dihantam, target lainnya kolaps.'
    },
    {
      id: 'q7_2',
      question: 'Bagaimana cara memanfaatkan perwira lawan yang mengalami Overloading?',
      options: [
        'Mengalihkan atau memukul salah satu titik yang dijaga agar titik lainnya lepas dari pertahanan',
        'Membiarkan perwira tersebut dan menyerang sisi sayap berlawanan',
        'Menukarkan menteri secepatnya',
        'Mengajukan klaim remis otomatis'
      ],
      correctIdx: 0,
      explanation: 'Dengan menyerang salah satu area perlindungan, perwira pelindung yang overloading terpaksa berpindah atau lumpuh, melepaskan kawalan di titik kritis kedua.'
    }
  ],
  lv8: [
    {
      id: 'q8_1',
      question: 'Pola skakmat legendaris "Anastasia Mate" melibatkan kombinasi perwira manakah untuk menyerang Raja lawan?',
      options: [
        'Kuda (Knight) dan Benteng (Rook) / Menteri',
        'Menteri dan Gajah saja',
        'Dua gajah diagonal',
        'Bantuan pion promosi'
      ],
      correctIdx: 0,
      explanation: 'Skakmat Anastasia menggunakan Kuda untuk mengontrol kotak pelarian Raja g8 / g7, lalu Benteng masuk secara horizontal/vertikal menyapu lajur terbuka.'
    },
    {
      id: 'q8_2',
      question: 'Dalam "Arabian Mate" (Skakmat Arab), bagaimana Kuda dan Benteng bekerja sama membunuh Raja lawan di ujung sudut?',
      options: [
        'Kuda ditaruh di f6 melindungi Benteng di h7 yang menskak Raja di h8',
        'Kuda melompati Raja langsung',
        'Benteng mengorbankan diri di f7',
        'Kuda ditaruh di h6 tanpa bekingan'
      ],
      correctIdx: 0,
      explanation: 'Arabian Mate adalah pola kuno nan indah di mana Kuda di f6 meluncurkan pertahanan aktif melindungi Benteng di h7 sekaligus mengunci petak g8 dari pelarian Raja h8.'
    }
  ],
  lv9: [
    {
      id: 'q9_1',
      question: 'Mengapa menguasai "Lajur Terbuka" (Open File) dengan Benteng sangat penting dalam pertengahan laga?',
      options: [
        'Memungkinkan Benteng menyusup ke baris ke-7 atau ke-8 pertahanan musuh dengan daya serang horizontal maut',
        'Memblokir pergerakan pion sendiri',
        'Membuat menteri musuh tidak bisa bergerak miring',
        'Remis dapat ditawarkan lebih cepat'
      ],
      correctIdx: 0,
      explanation: 'Menguasai lajur terbuka adalah jalan tol bagi Benteng untuk meluncurkan infiltrasi taktis ke jantung baris belakang musuh.'
    },
    {
      id: 'q9_2',
      question: 'Menumpuk dua benteng dalam satu lajur yang sama disebut sebagai taktik...',
      options: [
        'Battery Benteng (Baterai)',
        'Mengepung Benteng',
        'Benteng Gantung',
        'Rokade Ganda'
      ],
      correctIdx: 0,
      explanation: 'Menumpuk benteng (Battery) menaikkan daya gempur linier berkali-kali lipat di lajur terbuka.'
    }
  ],
  lv10: [
    {
      id: 'q10_1',
      question: 'Apa arti dari istilah taktis "Zwischenzug" (Langkah Selipan / In-Between Move)?',
      options: [
        'Langkah mengejutkan yang disisipkan di tengah-tengah transaksi penukaran perwira yang merusak rencana kalkulasi lawan',
        'Langkah menteri berpindah diagonal ganda',
        'Menolak melangkah demi waktu',
        'Melakukan pemukulan ilegal pion'
      ],
      correctIdx: 0,
      explanation: 'Zwischenzug adalah taktik tingkat tinggi di mana alih-alih merespons penukaran langsung, kita menyisipkan langkah skak atau ancaman fatal terlebih dahulu untuk meraih surplus posisi.'
    },
    {
      id: 'q10_2',
      question: 'Mengapa taktik Zwischenzug sering sekali membuahkan keuntungan materi tidak terduga?',
      options: [
        'Sebab lawan biasanya telah berasumsi bahwa kita akan langsung menukar perwira secara otomatis (mengguncang kalkulasinya)',
        'Sebab itu langkah ilegal yang mengintimidasi',
        'Sebab menteri lawan otomatis gugur',
        'Sebab itu memperbolehkan dua langkah sekaligus'
      ],
      correctIdx: 0,
      explanation: 'Zwischenzug menghancurkan asumsi linear lawan tentang pemukulan otomatis, menjadikannya senjata kejut paling efektif di level menengah-keatas.'
    }
  ],
  lv11: [
    {
      id: 'q11_1',
      question: 'Jebakan "Légal Trap" (Perangkap Legal) yang terkenal di pembukaan catur melibatkan pengorbanan perwira apa demi skakmat ksatria kilat?',
      options: [
        'Menteri (Queen Sacrifice)',
        'Gajah putih',
        'Kuda f3',
        'Benteng sayap raja'
      ],
      correctIdx: 0,
      explanation: 'Légal Trap memancing lawan memakan Menteri gratis, namun sebenarnya membuka jalan bagi dua Kuda dan satu Gajah untuk meluncurkan skakmat kilat tak terhindarkan.'
    },
    {
      id: 'q11_2',
      question: 'Dalam jebakan klasik "Scholar\'s Mate" (Skakmat 4 Langkah), di petak lemah mana serangan mematikan ditargetkan?',
      options: [
        'f7 / f2 (yang hanya dilindungi oleh Raja di awal permainan)',
        'h7 / h2',
        'e7 / e2',
        'd7 / d2'
      ],
      correctIdx: 0,
      explanation: 'Scholar’s Mate menargetkan f7/f2 karena petak ini adalah petak terlemah di awal laga yang tidak dilindungi oleh perwira lain selain Raja.'
    }
  ]
};

const STATS_MEDALS = [
  { id: 'm1', name: 'Pendekar Benteng', desc: 'Selesaikan 20 laga dengan Benteng kokoh', badge: 'SHD', rarity: 'Common', value: 10, target: 20, progress: 12, level: 2 },
  { id: 'm2', name: 'Penguasa Kavaleri Kuda', desc: 'Lakukan taktik garpu kuda sebanyak 10 kali', badge: 'KNT', rarity: 'Uncommon', value: 25, target: 10, progress: 8, level: 1 },
  { id: 'm3', name: 'Pion Pahlawan', desc: 'Mempromosikan pion menjadi Menteri sebanyak 15 kali', badge: 'STR', rarity: 'Rare', value: 50, target: 15, progress: 15, level: 3, unlocked: true },
  { id: 'm4', name: 'Master Skakmat Kilat', desc: 'Menangkan laga dalam kurun waktu kurang dari 12 langkah', badge: 'ZAP', rarity: 'Epic', value: 100, target: 1, progress: 1, level: 1, unlocked: true },
  { id: 'm5', name: 'Mahkota Kaisar Agung', desc: 'Capai peringkat Master ELO melampaui 1800', badge: 'CRN', rarity: 'Legendary', value: 250, target: 1800, progress: 1250, level: 1 },
  { id: 'm6', name: 'Kunci Kegelapan Void', desc: 'Achievement Rahasia: Kalahkan Guru Bot tersulit tanpa kehilangan Menteri', badge: 'KEY', rarity: 'Mythic', value: 500, target: 1, progress: 0, level: 1, isSecret: true },
];

const GACHA_ITEMS_POOL = [
  // Piece Skins
  { id: 'skin_classic', name: 'Classic Matte Wooden Chess', type: 'Bidak', rarity: 'Common', isEquipped: true },
  { id: 'skin_wood', name: 'Classic Wood Maple Maplewood', type: 'Bidak', rarity: 'Common', isEquipped: false },
  { id: 'skin_neon', name: 'Neon Cyber Laser Glow', type: 'Bidak', rarity: 'Rare', isEquipped: false },
  { id: 'skin_gold', name: 'Royal Gold Empire Chess', type: 'Bidak', rarity: 'Rare', isEquipped: false },
  { id: 'skin_anime', name: 'Classic Anime Hero Warrior', type: 'Bidak', rarity: 'Epic', isEquipped: false },
  { id: 'skin_cyberpunk', name: 'Cyberpunk Neon Matrix Piece', type: 'Bidak', rarity: 'Legendary', isEquipped: false },
  { id: 'skin_crystal', name: 'Glorious Diamond Crystal Chess', type: 'Bidak', rarity: 'Mythic', isEquipped: false },
  // Board Themes
  { id: 'board_forest', name: 'Forest Wood Eco Frame Theme', type: 'Papan', rarity: 'Uncommon', isEquipped: false },
  { id: 'board_cosmic', name: 'Celestial Cosmos Void Space', type: 'Papan', rarity: 'Rare', isEquipped: false },
  { id: 'board_ice_freeze', name: 'Iceland Glacial Freeze Magic Frame', type: 'Papan', rarity: 'Epic', isEquipped: false },
  { id: 'board_magma_lava', name: 'Lava Magma Volcanic Core Animated', type: 'Papan', rarity: 'Legendary', isEquipped: false },
  // Frames
  { id: 'frame_wooden', name: 'Simple Oakwood Border Cover', type: 'Bingkai', rarity: 'Common', isEquipped: false },
  { id: 'frame_bronze', name: 'Maju Perunggu Bronze Frame', type: 'Bingkai', rarity: 'Uncommon', isEquipped: false },
  { id: 'frame_silver', name: 'Challenger Perak Silver Frame', type: 'Bingkai', rarity: 'Rare', isEquipped: false },
  { id: 'frame_neon_glitch', name: 'Cyber Neon Glitch Frame Overlay', type: 'Bingkai', rarity: 'Epic', isEquipped: false },
  { id: 'frame_gold_dragon', name: 'Golden Dragon Suku Border Frame', type: 'Bingkai', rarity: 'Mythic', isEquipped: false },
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
  onlineRating,

  forceTab,
  hideHeaderAndTabs,
  onSendReportToInbox,
  onSendNotificationToInbox,

  settingsTheme: passedTheme,
  setSettingsTheme: passedSetTheme,
  settingsLang: passedLang,
  setSettingsLang: passedSetLang,
  diamondSavings,
  setDiamondSavings,
  unlockedTitles,
  setUnlockedTitles,
  onTriggerRestartTutorial,
  syncUserStats,
  user,
  starterPackClaimed
}) => {
  // Active Navigation inside features
  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'ritual' | 'settings' | 'medals' | 'pokedex' | 'block-report' | 'notif'>(forceTab || 'quiz');
  const [dexSearch, setDexSearch] = useState('');

  useEffect(() => {
    if (forceTab) {
      setActiveSubTab(forceTab);
    }
  }, [forceTab]);

  // Load state from local storage or default
  const [solvedNodes, setSolvedNodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('solved_nodes');
    return saved ? JSON.parse(saved) : ['lv1', 'lv2'];
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('blocked_users');
    return saved ? JSON.parse(saved) : ['PecaturToxic69', 'BotsSpammer2024'];
  });

  const unlockedInventory = useMemo(() => {
    const skinsArr = unlockedSkins || [];
    const themesArr = unlockedThemes || [];
    const framesArr = unlockedFrames || [];
    const titlesArr = unlockedTitles || [];

    const mappedSkins = skinsArr.map(s => {
      if (s === 'classic' || s === 'standard') return 'skin_classic';
      if (s === 'wood') return 'skin_wood';
      if (s === 'neon') return 'skin_neon';
      if (s === 'gold') return 'skin_gold';
      if (s === 'anime' || s === 'classic_anime_hero_warrior') return 'skin_anime';
      if (s === 'cyberpunk' || s === 'cyberpunk_neon_matrix_piece') return 'skin_cyberpunk';
      if (s === 'crystal' || s === 'glorious_diamond_crystal_chess') return 'skin_crystal';
      return s;
    });
    const mappedThemes = themesArr.map(t => {
      if (t === 'classic') return 'board_classic';
      if (t === 'magma' || t === 'magma_lava' || t === 'board_magma_lava') return 'board_magma_lava';
      if (t === 'iceland' || t === 'ice_freeze' || t === 'board_ice_freeze') return 'board_ice_freeze';
      if (t === 'cosmic' || t === 'board_cosmic') return 'board_cosmic';
      if (t === 'forest' || t === 'board_forest') return 'board_forest';
      return t;
    });
    const mappedFrames = framesArr.map(f => {
      if (f === 'none' || f === 'classic') return 'frame_wooden';
      if (f === 'wooden' || f === 'frame_wooden') return 'frame_wooden';
      if (f === 'gold' || f === 'frame_gold_dragon') return 'frame_gold_dragon';
      if (f === 'neon' || f === 'cyber' || f === 'frame_neon_glitch') return 'frame_neon_glitch';
      if (f === 'bronze') return 'frame_bronze';
      if (f === 'silver') return 'frame_silver';
      return f;
    });
    const mappedTitles = titlesArr.map(t => {
      if (t === 'Pengendali Bayangan Tersembunyi' || t === 'title_shadow') return 'title_shadow';
      if (t === 'Legenda Catur Suku Nusantara' || t === 'title_gm') return 'title_gm';
      if (t === 'Reruntuhan Bintang Void') return 'title_set_cosmic';
      if (t === 'Dewa Magma Penghancur') return 'title_set_magma';
      return t;
    });

    const unlockedMedalIds = STATS_MEDALS.filter(m => m.unlocked || m.progress >= m.target).map(m => m.id);

    try {
      const saved = localStorage.getItem('unlocked_pokedex_inv');
      const savedArr = saved ? JSON.parse(saved) : [];
      return Array.from(new Set([
        'skin_classic',
        'board_classic',
        'frame_wooden',
        ...mappedSkins,
        ...mappedThemes,
        ...mappedFrames,
        ...mappedTitles,
        ...unlockedMedalIds,
        ...savedArr
      ])).sort();
    } catch (_) {
      return Array.from(new Set([
        'skin_classic',
        'board_classic',
        'frame_wooden',
        ...mappedSkins,
        ...mappedThemes,
        ...mappedFrames,
        ...mappedTitles,
        ...unlockedMedalIds
      ])).sort();
    }
  }, [unlockedSkins, unlockedThemes, unlockedFrames, unlockedTitles]);

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
  const [isChestFinishedOpen, setIsChestFinishedOpen] = useState(false);

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
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pref_theme') as 'dark' | 'light') || 'dark';
  });
  const [localLang, setLocalLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('pref_lang') as 'id' | 'en') || 'id';
  });

  const settingsTheme = passedTheme || localTheme;
  const setSettingsTheme = passedSetTheme || setLocalTheme;
  const settingsLang = passedLang || localLang;
  const setSettingsLang = passedSetLang || setLocalLang;
  const isEng = settingsLang === 'en';

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
    spawnToast(settingsLang === 'en' ? 'Duel Invitation' : 'Undangan Duel', settingsLang === 'en' ? 'Martin challenge you to play a live chess game!' : 'Teman Martin menantang Anda bermain catur langsung!', 'success');
    if (onSendNotificationToInbox) {
      onSendNotificationToInbox('Martin mengirimi Anda tantangan Match Persahabatan dengan ELO 1500!');
    }
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
          triggerReward(65, 'Selamat! Anda menyelesaikan level kuis taktis ini dengan cemerlang! Poin XP +65, Koin +120!', 'success');
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
    setIsChestFinishedOpen(false);
  };

  const tapChestBox = () => {
    if (chestTapsCount >= 5) return;
    
    triggerAudio('capture');
    const newTaps = chestTapsCount + 1;
    setChestTapsCount(newTaps);
    
    // 65% chance to increase stars on each tap, up to 5 stars max
    const luckyChance = Math.random() < 0.61;
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

        if (setDiamondSavings) {
          setDiamondSavings(prev => {
            const next = prev + totalAwarded;
            return next > 150 ? 150 : next;
          });
          triggerReward(0, `Petak Peti Berhasil Dibuka! Anda mengamankan Peti Bintang ${chestStarsEarned}! Diperoleh ${totalAwarded} Diamond yang dipindahkan ke Tabungan! ${membershipStatus === 'premium' ? '(Dilipatgandakan Premium x1.5!)' : ''}`, 'premium');
        } else {
          setDiamonds(prev => prev + totalAwarded);
          triggerReward(0, `Petak Peti Berhasil Dibuka! Anda mengamankan Peti Bintang ${chestStarsEarned}! Diperoleh ${totalAwarded} Diamond kustom! ${membershipStatus === 'premium' ? '(Dilipatgandakan Premium x1.5!)' : ''}`, 'premium');
        }
        // Mark solved
        if (!solvedNodes.includes(activeChestNode.id)) {
          setSolvedNodes(prev => [...prev, activeChestNode.id]);
        }
        
        triggerReward(0, `Petak Peti Berhasil Dibuka! Anda mengamankan Peti Bintang ${chestStarsEarned}! Diperoleh ${totalAwarded} Diamond kustom! ${membershipStatus === 'premium' ? '(Dilipatgandakan Premium x1.5!)' : ''}`, 'premium');
        setIsChestFinishedOpen(true);
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
          // Also append to respective App system triggers with stripped prefixes for sync
          if (landedItem.type === 'Bidak') {
            const rawSkin = landedItem.id.replace('skin_', '');
            setUnlockedSkins(prev => Array.from(new Set([...prev, rawSkin])));
          } else if (landedItem.type === 'Papan') {
            let rawTheme = landedItem.id.replace('board_', '');
            if (rawTheme === 'magma_lava') rawTheme = 'magma_lava';
            if (rawTheme === 'ice_freeze') rawTheme = 'ice_freeze';
            setUnlockedThemes(prev => Array.from(new Set([...prev, rawTheme])));
          } else if (landedItem.type === 'Bingkai') {
            let rawFrame = landedItem.id.replace('frame_', '');
            if (rawFrame === 'gold_dragon') rawFrame = 'gold';
            if (rawFrame === 'neon_glitch') rawFrame = 'cyber';
            setUnlockedFrames(prev => Array.from(new Set([...prev, rawFrame])));
          } else if (landedItem.type === 'Gelar') {
            let rawTitle = landedItem.name.replace('Gelar: ', '');
            setUnlockedTitles(prev => Array.from(new Set([...prev, rawTitle])));
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
      { name: 'Kaisar_Martin_Premium', score: 2850, title: 'Dewa Busana Abadi', isMe: false, avatar: 'KM' },
      { name: `${username} (Anda)`, score: fashionPointsScore, title: fashionRankGelar, isMe: true, avatar: 'ME' },
      { name: 'SukuGrandmaster_Nusa', score: 1200, title: 'Ikon Trendsetter Elite', isMe: false, avatar: 'SG' },
      { name: 'ZariTaktis_AI', score: 750, title: 'Kolektor Sayap Berpakaian', isMe: false, avatar: 'ZT' },
      { name: 'BotPionMerayap', score: 150, title: 'Pemula Santun Berbusana', isMe: false, avatar: 'BP' },
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
    if (setDiamondSavings) {
      setDiamondSavings(prev => {
        const next = prev + set.diamondBonus;
        return next > 150 ? 150 : next;
      });
      triggerReward(100, `Luar Biasa! Set Sinergi Eksklusif "${set.name}" terpasang utuh! Anda dianugerahi Gelar "${set.titleReward}" dan bonus instan +${set.diamondBonus} Diamond (Dipindahkan ke Tabungan)!`, 'premium');
    } else {
      setDiamonds(prev => prev + set.diamondBonus);
      triggerReward(100, `Luar Biasa! Set Sinergi Eksklusif "${set.name}" terpasang utuh! Anda dianugerahi Gelar "${set.titleReward}" dan bonus instan +${set.diamondBonus} Diamond!`, 'premium');
    }
    
    // Grant special title & trigger
    if (setUnlockedTitles && !unlockedTitles.includes(set.titleReward)) {
      setUnlockedTitles(prev => Array.from(new Set([...prev, set.titleReward])));
    }
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
    
    // Submit to backend server to ensure moderation actually receives the report
    fetch('/api/admin/report/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporter: username || "Pecatur Anonim",
        reported: target,
        reason: reportReason,
        details: reportDesc || "Laporan pelaporan player biasa"
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Report saved in server admin log:', data);
    })
    .catch(err => {
      console.error('Error persistence for report:', err);
    });

    const msg = `Laporan Terkirim: Pelanggaran ${reportReason.toUpperCase()} terhadap "${target}" berhasil masuk antrean peninjauan dewan moderator. Terima kasih telah membantu pelaporan!`;
    spawnToast('Laporan Terkirim', msg, 'success');
    if (onSendReportToInbox) {
      onSendReportToInbox(`[MODERASI] Laporan Anda mengenai "${target}" atas tindakan [${reportReason.toUpperCase()}] sedang ditinjau. Status: Aktif.`);
    }
    setReportTargetName('');
    setReportDesc('');
  };

  return (
    <div className={hideHeaderAndTabs ? "w-full text-slate-100 font-sans" : "w-full bg-[#1e1c1b] border border-[#3c3934] rounded-2xl overflow-hidden shadow-xl select-none text-slate-100 font-sans"}>
      
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

      {!hideHeaderAndTabs && (
        <>
          {/* HEADER BAR FOR 81 FEATURES HUB RANGE (41 TO 50) */}
          <div className="bg-[#262421] p-5 border-b border-[#3c3934]/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-[#81b64c] block font-mono">Modul Reruntuhan Arena Catur</span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
                Modul Fitur Berkelas (41-50)
              </h2>
              <p className="text-xs text-[#9babaf] font-medium mt-0.5">Sistem Kuis Catur, Ritual Pre-Match, Gacha Rarity Terbuka, Medali Showroom, Poin Busana, Koleksi Pokedex & Manajemen Moderasi!</p>
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
        </>
      )}

      {/* HORIZONTAL CUSTOM NAVIGATION TABS FOR FEATURES 41 TO 50 (EMOJI FREE) */}
      {!hideHeaderAndTabs && (
        <div className="bg-[#262421]/65 border-b border-[#3c3934]/60 p-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          {[
            { id: 'quiz', label: 'Kuis Taktikal', Icon: BookOpen },
            { id: 'ritual', label: 'Ritual Sebelum Laga', Icon: RefreshCw },
            { id: 'medals', label: 'Medali & Rekor', Icon: Award },
            { id: 'pokedex', label: 'Koleksi Pokedex', Icon: Compass },
            { id: 'settings', label: 'Preferensi Settings', Icon: Settings },
            { id: 'block-report', label: 'Daftar Blok & Lapor', Icon: Shield },
            { id: 'notif', label: 'Notifikasi Center', Icon: Bell },
          ].map(tab => {
            const TabIcon = tab.Icon;
            return (
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
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RENDER DYNAMIC SUB PANELS */}
      <div className={hideHeaderAndTabs ? "p-0" : "p-6"}>
        
        {/* =========================================================================
            FEATURE 41: DUOLINGO QUIZ ROUTE & INTERACTIVE MAP
           ========================================================================= */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-6">
            {(activeQuizNode || activeChestNode) ? (
              /* FULL-SCREEN TAKEOVER VIEW FOR INDIVIDUAL GAME PLAY */
              <div className="min-h-[550px] bg-[#1e1c1b] border border-[#3c3934]/70 p-6 md:p-12 rounded-3xl flex flex-col justify-between relative shadow-2xl animate-fade-in">
                
                {/* Back Button to close takeover and go back to map */}
                <button 
                  onClick={() => {
                    setActiveQuizNode(null);
                    setActiveChestNode(null);
                    setQuizFinished(false);
                    triggerAudio('move');
                  }} 
                  className="absolute top-6 right-6 p-2 rounded-full bg-[#262421] hover:bg-[#312e2b] border border-[#3c3934] text-slate-400 hover:text-white transition-all cursor-pointer z-10"
                  title="Kembali ke Peta"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* 1. Interactive Question Sub-State */}
                {activeQuizNode && !quizFinished && (
                  <div className="max-w-2xl mx-auto w-full my-auto space-y-8 py-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black tracking-widest text-[#81b64c] uppercase font-mono block">MODUL MATERI: {activeQuizNode.name}</span>
                      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                        Ujian Teori Catur Taktis
                      </h3>
                    </div>

                    {/* Progress tracker */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                        <span>Langkah Pertanyaan</span>
                        <span>{currentQuizIdx + 1} S/D {CATUR_QUIZ_QUESTIONS[activeQuizNode.id].length}</span>
                      </div>
                      <div className="w-full bg-[#262421] h-3 rounded-full overflow-hidden border border-[#3c3934] p-[1px]">
                        <div 
                          className="bg-[#81b64c] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${((currentQuizIdx) / CATUR_QUIZ_QUESTIONS[activeQuizNode.id].length) * 100}%` }} 
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-[#262421] border border-cyan-500/10 p-6 rounded-2xl shadow-xl">
                      <p className="text-sm md:text-base font-bold text-slate-200 leading-relaxed font-sans">
                        {CATUR_QUIZ_QUESTIONS[activeQuizNode.id][currentQuizIdx].question}
                      </p>
                    </div>

                    {/* Option Selections */}
                    <div className="grid grid-cols-1 gap-3">
                      {CATUR_QUIZ_QUESTIONS[activeQuizNode.id][currentQuizIdx].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-extrabold transition-all cursor-pointer flex items-center ${
                            selectedOptIdx === oIdx
                              ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c] ring-2 ring-[#81b64c]/20'
                              : 'bg-[#262421] border-[#3c3934] text-slate-350 hover:text-white hover:bg-[#312e2b]'
                          }`}
                        >
                          <span className="inline-flex w-7 h-7 rounded-lg bg-[#1e1c1b] border border-[#302c29] items-center justify-center text-[10px] font-black mr-3 text-slate-400 font-mono">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Submit Answer */}
                    <button
                      onClick={submitQuizAnswer}
                      disabled={selectedOptIdx === null}
                      className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                        selectedOptIdx !== null
                          ? 'bg-[#81b64c] text-slate-900 hover:scale-[1.01] active:scale-95 shadow-lg font-black'
                          : 'bg-[#2d2a27] text-slate-500 cursor-not-allowed border border-[#302c29]'
                      }`}
                    >
                      Kirim Jawaban Anda
                    </button>
                  </div>
                )}

                {/* 2. Completion Sub-State */}
                {quizFinished && (
                  <div className="max-w-md mx-auto w-full my-auto text-center space-y-6 py-10 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                      <Award className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-[#81b64c] tracking-widest uppercase font-mono block">MODUL SELESAI</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Kuis Berhasil Terpecahkan!</h4>
                      <p className="text-xs text-[#9babaf] leading-relaxed max-w-sm mx-auto font-medium">
                        Semburan intelektual teori catur "{activeQuizNode?.name}" berhasil ditaklukkan! Pengetahuan taktis Anda bertambah kokoh.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveQuizNode(null);
                        setQuizFinished(false);
                      }}
                      className="w-full bg-[#81b64c] text-[#1e1c1b] py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#96ce5c] active:scale-95 transition-all"
                    >
                      Buka Peta Kembali
                    </button>
                   {/* 3. Chest Play Interactive Sub-State */}
                {activeChestNode && (
                  <div className="max-w-md mx-auto w-full my-auto text-center space-y-6 py-6 animate-fade-in">
                    {isChestFinishedOpen ? (
                      <div className="space-y-6 py-4 bg-[#262421]/60 p-6 rounded-2xl border border-amber-500/20 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex justify-center"><Gift className="w-12 h-12 text-[#81b64c] animate-bounce" /></div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-black text-[#81b64c] uppercase tracking-wide">Peti Berhasil Dibuka!</h4>
                          <p className="text-xs text-[#9babaf] leading-relaxed">
                            Segel peti kuno {activeChestNode.name} telah runtuh! Selamat atas kemewahan hadiah yang Anda peroleh.
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-2">
                          {[1, 2, 3, 4, 5].map(starNum => (
                            <Star
                              key={starNum}
                              className={`w-10 h-10 transition-all duration-300 ${
                                starNum <= chestStarsEarned 
                                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                  : 'text-zinc-850'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="bg-[#1e1c1b] rounded-xl p-3 border border-[#3c3934] flex items-center justify-between font-mono max-w-xs mx-auto">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Hadiah Diperoleh</span>
                          <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-1.5 animate-pulse">
                            +{(() => {
                              let basePrizes = 1;
                              if (chestStarsEarned === 2) basePrizes = 2;
                              else if (chestStarsEarned === 3) basePrizes = 4;
                              else if (chestStarsEarned === 4) basePrizes = 7;
                              else if (chestStarsEarned === 5) basePrizes = 12;
                              const premiumMult = membershipStatus === 'premium' ? 1.5 : 1;
                              return Math.floor(basePrizes * premiumMult);
                            })()} <Gem className="w-3.5 h-3.5 text-blue-400" /> DIAMOND
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            triggerAudio('win');
                            setActiveChestNode(null);
                            setIsChestFinishedOpen(false);
                          }}
                          className="w-full bg-[#81b64c] hover:bg-[#96ce5c] text-slate-900 font-black text-xs py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          Masukkan ke Inventaris & Selesai
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase font-mono block">AMBIL BINTANG GRATIS SECARA INSTAN</span>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">{activeChestNode.name}</h4>
                          <p className="text-xs text-[#9babaf] leading-relaxed max-w-sm mx-auto font-semibold">
                            Gunakan tebakan ketukan jari untuk melonggarkan segel bintang keberuntungan. Lebih beruntung mendapatkan Diamond berlipat ganda!
                          </p>
                        </div>

                        {/* Progress Stars */}
                        <div className="flex items-center justify-center gap-2 py-2">
                          {[1, 2, 3, 4, 5].map(starNum => (
                            <Star
                              key={starNum}
                              className={`w-8 h-8 transition-all duration-300 ${
                                starNum <= chestStarsEarned 
                                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-lg' 
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Interactive Click Sphere */}
                        <div className="relative py-4 flex justify-center">
                          <button
                            onClick={tapChestBox}
                            disabled={isOpeningChestProgress}
                            className={`w-32 h-32 rounded-3xl bg-[#262421] hover:bg-[#312e2b] border border-[#3c3934] mx-auto flex flex-col items-center justify-center relative focus:outline-none cursor-pointer transform hover:scale-105 active:scale-95 transition-all shadow-inner group ${
                              isOpeningChestProgress ? 'opacity-50 animate-pulse' : ''
                            }`}
                          >
                            <Gem className="w-10 h-10 text-amber-500 group-hover:scale-110 shrink-0 transition-transform duration-300" />
                            <div className="absolute bottom-3 bg-[#1e1c1b] border border-[#3c3934] px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider text-amber-500">
                              {isOpeningChestProgress ? 'MEMBUKA...' : `${chestTapsCount}/5 KETUKAN`}
                            </div>
                          </button>
                        </div>

                        <p className="text-[10px] font-mono text-amber-500 uppercase font-black">
                          Hadiah Terkumpul: {chestStarsEarned} Bintang (Diberikan {
                            chestStarsEarned === 5 ? '12' : chestStarsEarned === 4 ? '7' : chestStarsEarned === 3 ? '4' : chestStarsEarned === 2 ? '2' : '1'
                          } Diamond) {membershipStatus === 'premium' ? 'x1.5 (Membership PREMIUM!)' : ''}
                        </p>
                      </>
                    )}
                  </div>
                )}                  </div>
                )}
              </div>
            ) : (
              /* REGULAR JALUR MAP ROADMAP VIEW STAGE */
              <>
                <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono shrink-0">
                    <BookOpen className="w-5 h-5 text-[#81b64c]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#81b64c] uppercase tracking-wide">Peta Jalur Kuis Bertema Catur</h4>
                    <p className="text-xs text-[#9babaf] mt-1 leading-relaxed font-semibold">
                      Lompat dari petak trivia ke petak berikutnya untuk mengasah pemahaman taktik serta memenangkan peti keberuntungan berisi Diamond instan! KETUK SALAH SATU BULATAN JALUR ATAU PETI UNTUK MEMULAI (FULL SCREEN).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* THE VERTICAL MAP PATH */}
                  <div className="lg:col-span-8 bg-[#262421]/40 border border-[#3c3934]/70 p-4 rounded-2xl relative min-h-[500px] overflow-hidden flex flex-col justify-between">
                    
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
                      
                      {/* Mascot Speech Bubble standing along the track (EMOJI-FREE) */}
                      <div className="absolute top-[450px] left-[130px] sm:left-[170px] z-10 w-48 flex items-center gap-2.5 bg-[#262421] border border-[#3c3934] p-2.5 rounded-xl shadow-lg hover:scale-105 duration-200">
                        <img 
                          src="/src/assets/images/nopal_mascot_1781082233948.png" 
                          alt="Nopal Mascot" 
                          className="w-12 h-12 rounded-lg object-cover border border-[#81b64c]/20 shadow"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-black text-[#81b64c] block uppercase leading-none">Nopal Mascot</span>
                          <p className="text-[8px] text-[#9babaf] font-bold leading-tight mt-1">"Rook kokoh pantang menyerah sebelum skakmat!"</p>
                        </div>
                      </div>

                      {CATUR_QUIZNODES.map((node, idx) => {
                        const isSolved = solvedNodes.includes(node.id);
                        const isCurrentActive = !isSolved && (solvedNodes.length === idx || idx === 0);

                        return (
                          <div
                            key={node.id}
                            style={{ left: `${node.x}px`, top: `${node.y}px` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                          >
                            {node.type === 'chest' ? (
                              <button
                                onClick={() => interactWithChestNode(node)}
                                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                                  isSolved 
                                    ? 'bg-[#312e2b] border-dashed border-[#3c3934] text-slate-500 opacity-60' 
                                    : 'bg-gradient-to-br from-[#1e1c1b] to-stone-900 border-amber-500/55 text-amber-400 font-extrabold hover:scale-110 shadow-lg text-lg animate-pulse'
                                }`}
                                title={node.name}
                              >
                                {isSolved ? (
                                  <Check className="w-4 h-4 text-[#81b64c]" />
                                ) : (
                                  <Gem className="w-5 h-5 text-amber-400 shrink-0" />
                                )}
                                <span className="text-[8px] uppercase tracking-wider font-bold mt-1 select-none leading-none">Peti</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startQuizForNode(node)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all relative cursor-pointer ${
                                  isSolved
                                    ? 'bg-[#81b64c] border-2 border-[#81b64c]/20 text-[#1e1c1b] hover:scale-105 font-black'
                                    : isCurrentActive
                                    ? 'bg-cyan-500 border-4 border-cyan-400 text-slate-900 font-extrabold hover:scale-115 shadow-cyan-500/20 shadow-md scale-105'
                                    : 'bg-[#312e2b] border border-[#3c3934]/65 text-slate-350 hover:border-slate-300'
                                }`}
                                title={node.name}
                              >
                                {isSolved ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
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

                  {/* Right side helper info column */}
                  <div className="lg:col-span-4 flex flex-col justify-start">
                    <div className="bg-[#262421] border border-[#3c3934]/70 p-5 rounded-2xl text-center space-y-4 shadow-xl">
                      <HelpCircle className="w-10 h-10 text-[#81b64c] mx-auto" strokeWidth={1.5} />
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">Silakan Pilih Level Kuis</h5>
                      <p className="text-[11px] text-[#9babaf] leading-relaxed font-semibold">
                        Gunakan tombol bulatan bersinar atau peti keberuntungan di peta sebelah kiri untuk memulai ujian di halaman baru secara penuh (full screen).
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
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
                Di Pal Mate, Anda dapat melakukan upacara adat sebelum melakoni duel sengit dengan AI Bot atau Teman! Pilih ritual andalan Anda, buat tebakan jitu, lalu putar asalnya. <b>Siapa pemenang ritual ini berhak menetapkan formasi warna bidak (Putih / Hitam) sesuka hatinya!</b>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CONFIG PANEL */}
              <div className="bg-[#262421]/30 p-5 rounded-2xl border border-[#3c3934]/60 space-y-4">
                <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">1. Pilih Opsi Ritual</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dice', label: settingsLang === 'en' ? 'Twin Dice' : 'Dadu Kembar', icon: Sparkles },
                    { id: 'suit', label: settingsLang === 'en' ? 'Hand Suit' : 'Suit Jari', icon: Flame },
                    { id: 'coin', label: settingsLang === 'en' ? 'Coin Flip' : 'Lempar Koin', icon: Coins },
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
                      <span className="text-2xl">{React.createElement(item.icon, { className: "w-6 h-6 text-[#81b64c]" })}</span>
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
                      <div className="flex justify-center">
                        {ritualResult.isWin ? (
                          <Trophy className="w-12 h-12 text-yellow-400" />
                        ) : (
                          <ShieldAlert className="w-12 h-12 text-rose-400 animate-pulse" />
                        )}
                      </div>
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
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#81b64c] block font-mono">
                    {isEng ? "Chess Gacha Module" : "Modul Gacha Catur"}
                  </span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mt-1">
                    {isEng ? "Chess Prosperity Cosmetic Gacha" : "Gacha Kosmetik Kemakmuran Catur"}
                  </h4>
                  <p className="text-xs text-[#9babaf] mt-1 leading-relaxed">
                    {isEng 
                      ? "Spin the cosmetics wheel to obtain epic piece skins, board themes, premium dragon frames, and noble titles! Pity guaranteed to end bad luck dry spells."
                      : "Putar roda kosmetik guna memboyong skin bidak epik, board berapi/salju, bingkai naga premium, dan gelar mulia! Pity terjamin untuk menghentikan rekor kesialan Anda!"
                    }
                  </p>
                </div>

                {/* VISUAL WHEEL CONTAINER */}
                <div className="my-8 py-4 relative flex flex-col items-center justify-center min-h-[180px] bg-[#1e1c1b] border-2 border-[#3c3934]/65 rounded-2xl overflow-hidden">
                  
                  {isGachaSpinning ? (
                    <div className="text-center space-y-4">
                      {/* Spinning core */}
                      <div className="w-16 h-16 rounded-full border-4 border border-[#81b64c] border-b-transparent border-t-transparent animate-spin mx-auto text-center" />
                      <span className="text-xs font-black uppercase text-amber-500 tracking-widest block animate-pulse">
                        {isEng ? "Drawing Cosmic Stars..." : "Menarik Bintang Kosmik..."}
                      </span>
                    </div>
                  ) : gachaPullResults.length > 0 ? (
                    <div className="p-3 w-full space-y-4">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center block">
                        {isEng ? "LATEST GACHA PULL RESULTS:" : "HASIL PENARIKAN GACHA TERBARU:"}
                      </span>
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
                              {(() => {
                                const skinCode = pulled.id.replace('skin_', '');
                                if (pulled.type === 'Bidak') {
                                  return <div className="w-12 h-12 flex items-center justify-center"><ChessPiece type="q" color="w" skin={skinCode} className="w-10 h-10 select-none drop-shadow-md" /></div>;
                                }
                                if (pulled.type === 'Papan') {
                                  let darkCol = '#b58863';
                                  let lightCol = '#f0d9b5';
                                  if (pulled.id === 'board_forest') { darkCol = '#1a3a1e'; lightCol = '#4d8055'; }
                                  else if (pulled.id === 'board_cosmic') { darkCol = '#0d011c'; lightCol = '#56258a'; }
                                  else if (pulled.id === 'board_ice_freeze') { darkCol = '#103952'; lightCol = '#4ca6a4'; }
                                  else if (pulled.id === 'board_magma_lava') { darkCol = '#3a0209'; lightCol = '#d12411'; }
                                  return (
                                    <div className="w-10 h-10 grid grid-cols-2 grid-rows-2 rounded-lg border border-[#3c3934] overflow-hidden shadow-md">
                                      <div style={{ backgroundColor: darkCol }} />
                                      <div style={{ backgroundColor: lightCol }} />
                                      <div style={{ backgroundColor: lightCol }} />
                                      <div style={{ backgroundColor: darkCol }} />
                                    </div>
                                  );
                                }
                                if (pulled.type === 'Bingkai') {
                                  return (
                                    <div className="w-10 h-10 flex items-center justify-center">
                                      <AvatarWithFrame src={martinAvatar} frameId={pulled.id} size="sm" />
                                    </div>
                                  );
                                }
                                let ribbonStyle = 'from-slate-700 via-slate-650 to-slate-800 border-slate-500 text-slate-300';
                                let textLabel = 'SHADOW';
                                if (pulled.id === 'title_shadow') {
                                  ribbonStyle = 'from-violet-900 via-[#100c14] to-violet-950 border-violet-500/50 text-violet-400';
                                  textLabel = 'SHADOW';
                                } else if (pulled.id === 'title_gm') {
                                  ribbonStyle = 'from-amber-600 via-[#140f0c] to-amber-700 border-yellow-500/50 text-yellow-500';
                                  textLabel = isEng ? 'LEGEND' : 'LEGENDA';
                                }
                                return (
                                  <div className={`px-2 py-1 bg-gradient-to-r border rounded text-[6px] font-black uppercase tracking-widest ${ribbonStyle} shadow-sm max-w-full text-center truncate`}>
                                    {textLabel}
                                  </div>
                                );
                              })()}
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
                                <span className="text-[8px] font-extrabold text-red-500 animate-[bounce_1.5s_infinite]">
                                  {isEng ? "GUARANTEED PITY!" : "GUARANTEED PITY DIJAMIN!"}
                                </span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <HelpCircle className="w-12 h-12 mx-auto text-slate-650" />
                      <h5 className="text-xs font-black text-[#9babaf] uppercase">
                        {isEng ? "Cosmetic Chest is Sealed" : "Kotak Kosmetik Masih Tersegel"}
                      </h5>
                      <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed mx-auto">
                        {isEng 
                          ? "Spend coins or use your daily free spins to draw fantastic visual rewards now."
                          : "Gunakan koin Anda atau jatah spin gratis harian untuk menarik aneka hadiah visual fantastis."
                        }
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
                      {freeSpinsLeft > 0 
                        ? (isEng ? `1x Free Spin (${freeSpinsLeft} Left)` : `1x Putaran Gratis (Sisa ${freeSpinsLeft})`)
                        : (isEng ? "1x Draw (Cost: 25 Coins)" : "1x Tarik (Harga: 25 Koin)")
                      }
                    </button>
                    <span className="text-[8.5px] uppercase font-mono text-center block text-slate-500">
                      {isEng 
                        ? `Daily free gacha: ${freeSpinsLeft} left today` 
                        : `Gacha harian gratis: sisa ${freeSpinsLeft} kali hari ini`
                      }
                    </span>
                  </div>

                  {/* Multi (5x) Spin Button */}
                  <div className="space-y-1">
                    <button
                      onClick={() => playGachaSpin(5)}
                      disabled={isGachaSpinning}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-all text-center"
                    >
                      {isEng ? "5x Multi-Spin (Cost: 100 Coins)" : "5x Spin Beruntun (Harga: 100 Koin)"}
                    </button>
                    <span className="text-[8.5px] uppercase font-mono text-center block text-amber-500/80 font-black">
                      {isEng ? "SAVE 20 Coins!" : "DISKON HEMAT 20 Koin!"}
                    </span>
                  </div>

                </div>
              </div>

              {/* ODDS & PITY SYSTEM DETAILS */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* PITY SYSTEM SLOTS */}
                <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] space-y-3">
                  <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">{settingsLang === 'en' ? 'Guaranteed Pity System' : 'Sistem Pity Bergaransi'}</span>
                  
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
                  <span className="text-[9px] font-black tracking-widest text-slate-300 uppercase block">{settingsLang === 'en' ? 'Drop Rate Odds Percentage' : 'Persentase Keberuntungan Drop Rate'}</span>
                  
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
              <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">Rekor Catur Personal Anda</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">Puncak XP Sehari</span>
                  <div className="text-sm font-black text-white mt-1">2,450 XP</div>
                </div>
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">{settingsLang === 'en' ? 'Streak Days' : 'Streak Beruntun'}</span>
                  <div className="text-sm font-black text-amber-400 mt-1">{settingsLang === 'en' ? '14 Days' : '14 Hari'}</div>
                </div>
                <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] text-center">
                  <span className="text-[8px] font-black text-[#9babaf] block uppercase">{settingsLang === 'en' ? 'Match Win Streak' : 'Menang Beruntun'}</span>
                  <div className="text-sm font-black text-emerald-400 mt-1">{settingsLang === 'en' ? '9 Matches' : '9 Match'}</div>
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
                  <p className="text-xs text-[#9babaf] font-medium">Buka aneka level medali unik bergaya ilustrasi catur legendaris dan pamerkan hingga 3 medali di kartu profilmu!</p>
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

                  const renderMedalVisual = () => {
                    if (showSecretMask) {
                      return <span className="text-sm font-bold text-stone-500 font-mono">???</span>;
                    }
                    switch (medal.badge) {
                      case 'SHD':
                        return <Shield className="w-5 h-5 text-cyan-400" />;
                      case 'KNT':
                        return <Flame className="w-5 h-5 text-amber-500" />;
                      case 'STR':
                        return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
                      case 'ZAP':
                        return <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />;
                      case 'CRN':
                        return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
                      case 'KEY':
                        return <Lock className="w-5 h-5 text-rose-500" />;
                      default:
                        return <Award className="w-5 h-5 text-[#81b64c]" />;
                    }
                  };

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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-[#81b64c]/15 border-2 border-[#81b64c]/35 animate-bounce-slow'
                          : 'bg-zinc-850 border border-zinc-750 filter grayscale'
                      }`}>
                        {renderMedalVisual()}
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
                <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">Tangga Klasemen Poin Busana Global</span>
                
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
                        <div className="w-7 h-7 rounded-full bg-[#3c3934] flex items-center justify-center font-mono font-black text-[9px] text-[#81b64c] border border-[#81b64c]/20">
                          {player.avatar}
                        </div>
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



            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 47: CHESS DEX / KOLEKSIPOLIS (CHESS INDEX SYSTEM)
           ========================================================================= */}
        {activeSubTab === 'pokedex' && (() => {
          const renderMedalVisual = (id: string, isOwned: boolean) => {
            const grayscaleClass = !isOwned ? 'filter grayscale brightness-50 opacity-40' : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 duration-200';
            let ringColor = 'from-slate-400 to-slate-250';
            let iconElement = <Shield className="w-5 h-5 text-amber-600 fill-amber-500/20" />;
            
            if (id === 'm1') { 
              ringColor = 'from-amber-700 via-amber-600 to-amber-900'; 
              iconElement = <Shield className="w-5 h-5 text-amber-500 fill-amber-500/10" />; 
            }
            else if (id === 'm2') { 
              ringColor = 'from-slate-400 via-slate-200 to-slate-550'; 
              iconElement = <Swords className="w-5 h-5 text-slate-300" />; 
            }
            else if (id === 'm3') { 
              ringColor = 'from-amber-500 via-yellow-250 to-yellow-600'; 
              iconElement = <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />; 
            }
            else if (id === 'm4') { 
              ringColor = 'from-purple-500 via-pink-400 to-purple-800'; 
              iconElement = <Zap className="w-5 h-5 text-purple-400 fill-purple-400/25" />; 
            }
            else if (id === 'm5') { 
              ringColor = 'from-yellow-400 via-amber-300 to-yellow-650 animate-pulse'; 
              iconElement = <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />; 
            }
            else if (id === 'm6') { 
              ringColor = 'from-indigo-600 via-purple-500 to-black animate-pulse'; 
              iconElement = <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />; 
            }
            return (
              <div className={`w-12 h-12 relative flex items-center justify-center ${grayscaleClass}`}>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${ringColor} p-[2.5px]`}>
                  <div className="w-full h-full rounded-full bg-[#1e1c1b] border border-black/30 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 skew-y-12 transform origin-top-left" />
                    <div className="z-2 relative drop-shadow-md">
                      {iconElement}
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          const renderThemeVisual = (id: string, isOwned: boolean) => {
            const grayscaleClass = !isOwned ? 'filter grayscale opacity-40' : 'hover:scale-105 duration-200';
            let darkCol = '#779556';
            let lightCol = '#EBECD0';
            if (id === 'forest') { darkCol = '#B58863'; lightCol = '#F0D9B5'; }
            else if (id === 'cosmic') { darkCol = '#3b82f6'; lightCol = '#e2e8f0'; }
            else if (id === 'magma_lava') { darkCol = '#991b1b'; lightCol = '#ffd1d1'; }
            else if (id === 'ice_freeze') { darkCol = '#0284c7'; lightCol = '#e0f2fe'; }
            return (
              <div className={`w-12 h-12 grid grid-cols-2 grid-rows-2 rounded-lg border border-[#3c3934] overflow-hidden ${grayscaleClass} shadow-md`}>
                <div style={{ backgroundColor: darkCol }} />
                <div style={{ backgroundColor: lightCol }} />
                <div style={{ backgroundColor: lightCol }} />
                <div style={{ backgroundColor: darkCol }} />
              </div>
            );
          };

          const renderFrameVisual = (id: string, isOwned: boolean) => {
            const grayscaleClass = !isOwned ? 'filter grayscale opacity-30 shadow-none' : 'hover:scale-105 duration-200';
            return (
              <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${grayscaleClass}`}>
                <AvatarWithFrame src={martinAvatar} frameId={id} size="md" />
              </div>
            );
          };

          const renderPieceVisual = (id: string, isOwned: boolean) => {
            const grayscaleClass = !isOwned ? 'filter grayscale opacity-40 shadow-none' : 'hover:scale-110 duration-200';
            return (
              <div className={`w-12 h-12 flex items-center justify-center ${grayscaleClass}`}>
                <ChessPiece type="q" color="w" skin={id} className="w-10 h-10 select-none drop-shadow-md animate-fade-in" />
              </div>
            );
          };

          const CHESS_DEX_ITEMS = [
            { id: 'starter_pack', name: 'Starter Pack Pemula', name_en: 'Beginner Starter Pack', type: 'Bundling', rarity: 'Epic', desc: 'Bundel pemula eksklusif berisi koin, berlian, gelar, bingkai Kubah Emerald, dan bonus XP!' },
            { id: 'premium_membership', name: 'Keanggotaan Premium Elite', name_en: 'Premium Elite Membership', type: 'Premium', rarity: 'Legendary', desc: 'Akses tanpa batas ke stamina analisis, mahkota emas, bot eksklusif, dan seluruh kosmetik visual.' },

            { id: 'classic', name: 'Hijau Premium', name_en: 'Premium Green Theme', type: 'Papan', rarity: 'Common', desc: 'Gaya visual papan catur hijau emerald premium klasik.' },
            { id: 'forest', name: 'Kayu Walnut', name_en: 'Walnut Wood Theme', type: 'Papan', rarity: 'Rare', desc: 'Gaya papan serat kayu walnut alami yang elegan.' },
            { id: 'cosmic', name: 'Ice Blue Glacier', name_en: 'Ice Blue Glacier Theme', type: 'Papan', rarity: 'Rare', desc: 'Papan selembut es glacier kutub utara.' },
            { id: 'magma_lava', name: 'Tema Magma Berapi', name_en: 'Fiery Magma Theme', type: 'Papan', rarity: 'Epic', desc: 'Lava vulkanis mematikan dari gunung aktif.' },
            { id: 'ice_freeze', name: 'Tema Frost Blizzard', name_en: 'Frost Blizzard Theme', type: 'Papan', rarity: 'Legendary', desc: 'Salju badai es beku frost blizzard.' },

            { id: 'standard', name: 'Gaya Klasik', name_en: 'Classic Pieces', type: 'Bidak', rarity: 'Common', desc: 'Tampilan standar minimal bidak catur klasik.' },
            { id: 'wood', name: 'Kayu Maple', name_en: 'Maple Wood Pieces', type: 'Bidak', rarity: 'Rare', desc: 'Tekstur serat kayu maple alami.' },
            { id: 'royal', name: 'Ksatria Kerajaan', name_en: 'Royal Knight Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Bidak mewah bernuansa perak kerajaan klasik.' },
            { id: 'neon', name: 'Cyber Laser', name_en: 'Cyber Laser Pieces', type: 'Bidak', rarity: 'Rare', desc: 'Garis neon cyberpunk menyala terang.' },
            { id: 'gold', name: 'Emas Kerajaan', name_en: 'Royal Golden Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Kilauan kemewahan emas murni monarki.' },
            { id: 'singularity', name: 'Cosmic Singularity', name_en: 'Cosmic Singularity Pieces', type: 'Bidak', rarity: 'Legendary', desc: 'Bidak berbahan partikel lubang hitam eksotis.' },
            { id: 'anime', name: 'Hero Anime', name_en: 'Anime Hero Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Bidak berdesain ksatria anime legendaris.' },
            { id: 'cyberpunk', name: 'Suku Cyberpunk', name_en: 'Cyberpunk Clan Pieces', type: 'Bidak', rarity: 'Legendary', desc: 'Desain hologram matriks futuristik.' },
            { id: 'crystal', name: 'Kristal Berlian', name_en: 'Luminous Crystal Pieces', type: 'Bidak', rarity: 'Legendary', desc: 'Kilau kristal mewah berstruktur berlian.' },
            { id: 'emerald_wood', name: 'Kayu Emerald', name_en: 'Emerald Wood Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Bidak kayu emerald bertema Ramadan yang mempesona.' },
            { id: 'golden_ketupat_skin', name: 'Ketupat Emas', name_en: 'Golden Ketupat Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Seni bidak ketupat kuning berkilau hari raya fitri.' },
            { id: 'red_dragon_skin', name: 'Lentera Merah', name_en: 'Red Lantern Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Pancaran naga oriental berbalut lampion keberuntungan.' },
            { id: 'beach_sun_skin', name: 'Mentari Pantai', name_en: 'Beach Sunshine Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Kesegaran birunya laut dan kehangatan pasir pantai.' },
            { id: 'blizzard_wood', name: 'Blizzard Winter', name_en: 'Blizzard Winter Pieces', type: 'Bidak', rarity: 'Epic', desc: 'Keindahan serat kayu beku dibalut badai salju es arktik.' },

            { id: 'none', name: 'Tanpa Bingkai', name_en: 'No Border Frame', type: 'Bingkai', rarity: 'Common', desc: 'Desain avatar standar tanpa kosmetik tambahan.' },
            { id: 'bronze', name: 'Maju Perunggu', name_en: 'Advancing Bronze Border', type: 'Bingkai', rarity: 'Rare', desc: 'Lencana perunggu mengkilap khusus pemula.' },
            { id: 'silver', name: 'Challenger Perak', name_en: 'Challenger Silver Border', type: 'Bingkai', rarity: 'Rare', desc: 'Serat perak kokoh metalik untuk para pejuang.' },
            { id: 'gold', name: 'Gladiator Emas', name_en: 'Gold Gladiator Border', type: 'Bingkai', rarity: 'Epic', desc: 'Kemewahan emas murni bersinar dinamis.' },
            { id: 'cyber', name: 'Cyber Neon', name_en: 'Cyber Neon Border', type: 'Bingkai', rarity: 'Epic', desc: 'Garis laser cyan penuh energi teknologi masa depan.' },
            { id: 'magma', name: 'Magma Berapi', name_en: 'Fiery Magma Border', type: 'Bingkai', rarity: 'Epic', desc: 'Lava mendidih dari ksatria magma gunung aktif.' },
            { id: 'cosmic', name: 'Cahaya Kosmik', name_en: 'Cosmic Light Border', type: 'Bingkai', rarity: 'Legendary', desc: 'Nebula bintang rasi galaksi bertabur berlian.' },
            { id: 'embed_emerald', name: 'Kubah Emerald', name_en: 'Emerald Dome Border', type: 'Bingkai', rarity: 'Epic', desc: 'Kubah emerald hijau berkilau penuh rahmat.' },
            { id: 'golden_ketupat', name: 'Ketupat Emas', name_en: 'Golden Ketupat Border', type: 'Bingkai', rarity: 'Epic', desc: 'Kemeriahan hari raya fitri berselimut tenunan ketupat kuning keemasan.' },
            { id: 'red_lantern', name: 'Lentera Merah', name_en: 'Red Lantern Border', type: 'Bingkai', rarity: 'Epic', desc: 'Kehangatan cahaya lampion merah oriental bersinar penuh berkah.' },
            { id: 'beach_wave', name: 'Ombak Pantai', name_en: 'Beach Wave Border', type: 'Bingkai', rarity: 'Epic', desc: 'Gulungan ombak laut biru jernih menyegarkan di pesisir pasir putih.' },
            { id: 'blizzard_winter', name: 'Blizzard Winter', name_en: 'Blizzard Winter Border', type: 'Bingkai', rarity: 'Epic', desc: 'Sentuhan butiran salju beku hasil badai salju es arktik.' }
          ];

          const checkDexOwned = (itemId: string, itemType: string) => {
            if (itemId === 'starter_pack') return !!starterPackClaimed;
            if (itemId === 'premium_membership') return membershipStatus === 'premium';
            if (itemType === 'Papan') {
              return (unlockedThemes || []).includes(itemId) || membershipStatus === 'premium' || itemId === 'classic';
            }
            if (itemType === 'Bidak') {
              return (unlockedSkins || []).includes(itemId) || membershipStatus === 'premium' || itemId === 'standard';
            }
            if (itemType === 'Bingkai') {
              return (unlockedFrames || []).includes(itemId) || (membershipStatus === 'premium' && itemId === 'gold') || itemId === 'none';
            }
            return false;
          };

          const totalOwnedCount = CHESS_DEX_ITEMS.filter(item => checkDexOwned(item.id, item.type)).length;
          const totalPoolSize = CHESS_DEX_ITEMS.length;

          const filteredDexItems = CHESS_DEX_ITEMS.filter(item => {
            if (!dexSearch) return true;
            const searchLower = dexSearch.toLowerCase();
            const name = isEng ? item.name_en : item.name;
            const type = item.type;
            const rarity = item.rarity;
            const desc = item.desc;
            return name.toLowerCase().includes(searchLower) || 
                   type.toLowerCase().includes(searchLower) ||
                   rarity.toLowerCase().includes(searchLower) ||
                   desc.toLowerCase().includes(searchLower);
          });

          return (
            <div className="space-y-4">
              <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3934] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider">
                    {isEng ? "Chess Pokedex (Cosmetics Collection Index)" : "Chess Pokedex (Indeks Koleksi Kosmetik)"}
                  </h4>
                  <p className="text-[10px] text-[#9babaf] mt-0.5">
                    {isEng 
                      ? "Track your collection completion! Owned items are fully colored, locked items are in silhouette."
                      : "Pantau kesempurnaan koleksi Anda! Item yang sudah dimiliki tampil berwarna, yang belum tampil dalam siluet kunci hitam abu-abu."
                    }
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#81b64c]/10 border border-[#81b64c]/20 p-2 rounded-lg text-[#81b64c] shrink-0">
                  {isEng ? `Index Completion: ${totalOwnedCount} / ${totalPoolSize} Items` : `Kelengkapan Indeks: ${totalOwnedCount} / ${totalPoolSize} Item`}
                </span>
              </div>

              {/* SEARCH INPUT BAR */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder={isEng ? "Search cosmetics by name, type or rarity..." : "Cari kosmetik berdasarkan nama, tipe, rarietas..."}
                  value={dexSearch}
                  onChange={(e) => setDexSearch(e.target.value)}
                  className="w-full bg-[#1c1a19] border border-[#3c3934] pl-10 pr-10 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-extrabold focus:outline-none focus:border-[#81b64c] transition-all"
                />
                {dexSearch && (
                  <button
                    onClick={() => { setDexSearch(''); triggerAudio('move'); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#262421] text-slate-450 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {filteredDexItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-extrabold italic text-xs uppercase tracking-wider bg-[#262421]/30 rounded-2xl border border-dashed border-[#3c3934]">
                  {isEng ? "No cosmetics match your search criteria" : "Tidak ada kosmetik yang cocok dengan pencarian Anda"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                  {filteredDexItems.map(item => {
                    const isOwned = checkDexOwned(item.id, item.type);
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center gap-2 relative transition-all min-h-[9.5rem] ${
                          isOwned
                            ? 'bg-[#262421] border-[#3c3934] hover:border-slate-600'
                            : 'bg-[#1e1c1b] border-dashed border-[#3c3934]/40 select-none'
                        }`}
                      >
                      {!isOwned && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-xl z-10 pointer-events-none">
                          <Lock className="w-5 h-5 text-zinc-500 opacity-80" />
                        </div>
                      )}

                      <div className="flex-1 flex items-center justify-center p-2 w-full">
                        {item.type === 'Bidak' ? renderPieceVisual(item.id, isOwned) :
                         item.type === 'Papan' ? renderThemeVisual(item.id, isOwned) :
                         item.type === 'Bingkai' ? renderFrameVisual(item.id, isOwned) :
                         item.type === 'Bundling' ? <Gift className="w-10 h-10 text-indigo-400 animate-pulse" /> :
                         item.type === 'Premium' ? <Crown className="w-10 h-10 text-yellow-500 animate-pulse" /> :
                         <Coins className="w-10 h-10 text-yellow-500 animate-bounce" />
                        }
                      </div>
                      
                      <div className="space-y-1 w-full mt-1">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">
                          {isEng ? (
                            item.type === 'Bidak' ? 'Pieces' :
                            item.type === 'Papan' ? 'Board' :
                            item.type === 'Bingkai' ? 'Border' :
                            item.type
                          ) : item.type}
                        </span>
                        <h5 className="text-[10px] font-extrabold text-white truncate w-full block leading-none">{isEng ? item.name_en : item.name}</h5>
                      </div>

                      <span className={`text-[7.5px] font-mono font-black px-1.5 py-0.5 rounded leading-none w-fit shrink-0 mt-1 uppercase ${
                          item.rarity === 'Mythic' ? 'bg-[#FFC800] text-black shadow-sm' :
                          item.rarity === 'Legendary' ? 'bg-amber-500 text-black shadow-sm' :
                          item.rarity === 'Epic' ? 'bg-purple-600 text-white' : 'bg-[#3c3934] text-slate-400'
                      }`}>
                        {item.rarity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          );
        })()}

        {/* =========================================================================
            FEATURE 43: SETTINGS PANE WITH DARK/LIGHT & LANGAUGE SELECTION
           ========================================================================= */}
        {activeSubTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto bg-[#262421] p-6 rounded-2xl border border-[#3c3934] shadow-xl">
            <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">
              {settingsLang === 'en' ? 'System Configuration Panel' : 'Panel Preferensi Konfigurasi Sistem'}
            </span>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {settingsLang === 'en' ? 'Visual & Language Preferences' : 'Pengaturan Visual & Linguistik'}
            </h4>
            <div className="w-full h-px bg-[#3c3934]/60" />

            {/* LIGHT/DARK THEME SWITCHER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-[#3c3934]/50">
              <div className="max-w-md">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  {settingsLang === 'en' ? 'Visual Theme Setting' : 'Pilihan Nuansa Tema Visual'}
                </h5>
                <p className="text-[10px] text-[#9babaf] mt-1 leading-relaxed">
                  {settingsLang === 'en' ? 'Choose the visual mode that is most comfortable for your eyes.' : 'Pilih pencahayaan mata yang paling sesuai dengan durasi tanding catur Anda.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 shrink-0 sm:w-56">
                <button
                  onClick={() => {
                    setSettingsTheme('dark');
                    localStorage.setItem('pref_theme', 'dark');
                    triggerAudio('move');
                    spawnToast(
                      settingsLang === 'en' ? 'Dark Theme' : 'Tema Kegelapan', 
                      settingsLang === 'en' ? 'Abyss Dark Mode applied for maximum eye comfort.' : 'Mode Gelap Abyss berhasil disematkan untuk kenyamanan mata.', 
                      'info'
                    );
                  }}
                  className={`p-2.5 px-4 rounded-xl border text-[10px] uppercase font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    settingsTheme === 'dark'
                      ? 'bg-zinc-950 border-[#81b64c] text-[#81b64c] font-black scale-[1.02]'
                      : 'bg-[#1e1c1b] border-[#3c3934]/60 text-slate-400 hover:text-white hover:border-[#81b64c]/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  Dark Core
                </button>
                <button
                  onClick={() => {
                    setSettingsTheme('light');
                    localStorage.setItem('pref_theme', 'light');
                    triggerAudio('move');
                    spawnToast(
                      settingsLang === 'en' ? 'Light Theme' : 'Tema Terang', 
                      settingsLang === 'en' ? 'Sunrise Light Mode applied to panels.' : 'Mode Terang Sun-Rise berhasil disematkan pada panel.', 
                      'info'
                    );
                  }}
                  className={`p-2.5 px-4 rounded-xl border text-[10px] uppercase font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    settingsTheme === 'light'
                      ? 'bg-white border-amber-600 text-amber-600 font-black scale-[1.02]'
                      : 'bg-[#1e1c1b] border-[#3c3934]/60 text-slate-400 hover:text-white hover:border-[#81b64c]/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  Light Cream
                </button>
              </div>
            </div>

            {/* LANGUAGE CHANGER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-[#3c3934]/50">
              <div className="max-w-md">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  {settingsLang === 'en' ? 'Interface Language' : 'Aksen Komunikasi Bahasa'}
                </h5>
                <p className="text-[10px] text-[#9babaf] mt-1 leading-relaxed">
                  {settingsLang === 'en' ? 'Format instruction language for arena menus and deep AI advice.' : 'Format instruksi menu arena dan saran canggih Bot AI.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 shrink-0 sm:w-56">
                <button
                  onClick={() => {
                    setSettingsLang('id');
                    localStorage.setItem('pref_lang', 'id');
                    triggerAudio('move');
                    spawnToast('Bahasa Diubah', 'Bahasa pengantar kini dalam Bahasa Indonesia.', 'info');
                  }}
                  className={`p-2.5 px-4 rounded-xl border text-[10px] uppercase font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm ${
                    settingsLang === 'id'
                      ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c] font-black scale-[1.02]'
                      : 'bg-[#1e1c1b] border-[#3c3934]/60 text-slate-400 hover:text-white hover:border-[#81b64c]/40'
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  onClick={() => {
                    setSettingsLang('en');
                    localStorage.setItem('pref_lang', 'en');
                    triggerAudio('move');
                    spawnToast('Language Updated', 'Standard communication language is now set to English.', 'info');
                  }}
                  className={`p-2.5 px-4 rounded-xl border text-[10px] uppercase font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm ${
                    settingsLang === 'en'
                      ? 'bg-[#81b64c]/10 border-[#81b64c] text-[#81b64c] font-black scale-[1.02]'
                      : 'bg-[#1e1c1b] border-[#3c3934]/60 text-slate-400 hover:text-white hover:border-[#81b64c]/40'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* INTERACTIVE GUIDE OPTION */}
            {onTriggerRestartTutorial && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-[#3c3934]/50">
                <div className="max-w-md">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-500 animate-pulse animate-spin" />
                    {settingsLang === 'en' ? 'Interactive Guide & Tour' : 'Tur Panduan Interaktif'}
                  </h5>
                  <p className="text-[10px] text-[#9babaf] mt-1 leading-relaxed">
                    {settingsLang === 'en' ? 'Re-run the first-time tutorial guide to refresh your knowledge about play modes, Suku klan features, and progression rewards.' : 'Putar ulang panduan interaktif pembuka untuk menyegarkan info mode tanding, clan Suku, dan imbalan leveling.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerAudio('win');
                    onTriggerRestartTutorial();
                  }}
                  className="p-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-[10px] uppercase font-black tracking-wider rounded-xl border border-amber-500/20 cursor-pointer shadow-md active:scale-95 transition-all text-center shrink-0 sm:w-56"
                >
                  {settingsLang === 'en' ? 'Start Interactive Tour' : 'Mulai Tur Interaktif'}
                </button>
              </div>
            )}

            {/* STAMINA SUMMARY */}
            <div className="bg-[#1e1c1b] p-3 rounded-xl border border-[#3c3934] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{settingsLang === 'en' ? 'Server Connected Version' : 'Suku Versi Server'}</span>
              <span className="font-bold text-white text-[10px]">
                {settingsLang === 'en'
                  ? (membershipStatus === 'premium' ? 'Pal Mate v2.0 - Premium Edition Active (10Gbps Dedicated)' : 'Pal Mate v2.0 - Free Edition Enabled (Server Tier 1)')
                  : (membershipStatus === 'premium' ? 'Pal Mate v2.0 - Server Premium Sangat Cepat Aktif' : 'Pal Mate v2.0 - Server Gratis Terbatas Aktif')}
              </span>
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
                <span className="text-[9px] font-black tracking-widest text-[#81b64c] uppercase block">{settingsLang === 'en' ? 'Your Blocklist Management' : 'Manajemen Daftar Blokir Anda'}</span>
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
                <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase block">
                  {isEng ? "INFRACTION & PLAYER REPORT CENTER" : "Pusat Pengaduan & Laporan Pelanggaran"}
                </span>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">
                    {isEng ? "Offender / Toxic player's username:" : "Nama Pelaku Kecurangan / Toxic:"}
                  </label>
                  <input
                    type="text"
                    required
                    value={reportTargetName}
                    onChange={(e) => setReportTargetName(e.target.value)}
                    placeholder={isEng ? "Example: CheaterPlayerBot" : "Contoh: PecaturCurangBot"}
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">
                    {isEng ? "Violation Category:" : "Kategori Pelanggaran:"}
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-[#9babaf] focus:outline-none focus:border-[#81b64c]"
                  >
                    <option value="toxic-chat">{isEng ? "Toxic Communication / Vulgar Spam" : "Komunikasi Toxic / Spam Kasar"}</option>
                    <option value="engine-cheat">{isEng ? "Engine Bot Assistance (Cheat)" : "Penggunaan Bot Engine (Modding/Cheat)"}</option>
                    <option value="stalling-time">{isEng ? "Stalling Chess Clock Deliberately" : "Mengulur-ulur Waktu Secara Sengaja"}</option>
                    <option value="fake-id">{isEng ? "Provocative / Inappropriate Name" : "Nama Profil Provokatif / Kurang Pantas"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-300">
                    {isEng ? "Proof Details (Optional):" : "Keterangan Bukti (Opsional):"}
                  </label>
                  <textarea
                    rows={2}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder={isEng ? "Describe moves or toxic speech..." : "Sebutkan langkah pertandingan atau kata-kata kasarnya..."}
                    className="w-full bg-[#1e1c1b] border border-[#3c3934] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  {isEng ? "Submit Official Complaint" : "Kirim Pengaduan Resmi"}
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
        Modul Multi-Fitur v2.0 • Suku Catur Pilihan Cerdas Komunitas Pal Mate
      </div>
    </div>
  );
};

// =========================================================================
// AVATAR COMPONENT HELPER TO AVOID BREAKAGES
// =========================================================================
import martinAvatar from '../assets/images/avatar_martin_1779709510230.png';
