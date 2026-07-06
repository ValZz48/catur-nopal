import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Gift, ShoppingBag, Coins, Gem, Sparkles, Award, Play, Check, 
  Crown, Volume2, ShieldAlert, Heart, Share2, Clipboard, Download, BookOpen, 
  AlertCircle, ArrowRight, Settings, Users, Star, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarWithFrame } from './AvatarWithFrame';
import { ChessPiece } from './ChessPieces';
import martinAvatar from '../assets/images/avatar_martin_1779709510230.png';
import { getLevelFromXP } from '../utils';

// =========================================================================
// TYPES & PROPS
// =========================================================================

export interface Features51to60Props {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  membershipStatus: 'free' | 'premium';
  triggerAudio: (type: 'move' | 'capture' | 'check' | 'win' | 'lose' | 'error') => void;
  triggerReward: (
    amount: number, 
    message: string, 
    type?: 'reward' | 'premium' | 'info' | 'success_no_xp' | 'level_up'
  ) => void;
  unlockedSkins: string[];
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedThemes: string[];
  setUnlockedThemes: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedFrames: string[];
  setUnlockedFrames: React.Dispatch<React.SetStateAction<string[]>>;
  username: string;
  onlineRating: number;

  // Custom Status & Titles
  customStatus: string;
  setCustomStatus: (status: string) => void;
  equippedTitle: string;
  setEquippedTitle: (title: string) => void;
  unlockedTitles: string[];
  setUnlockedTitles: React.Dispatch<React.SetStateAction<string[]>>;

  // Checkmate effect
  equippedCheckmateEffect: string;
  setEquippedCheckmateEffect: (effect: string) => void;
  unlockedCheckmateEffects: string[];
  setUnlockedCheckmateEffects: React.Dispatch<React.SetStateAction<string[]>>;

  // Opening analysis hook
  gameHistoryForAnalysis?: string[];
  isGameAnalysisActive?: boolean;
  onCloseAnalysis?: () => void;
  profileAvatar?: string;
  selectedFrame?: string;
  unlockedItems?: string[];
  setUnlockedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  syncUserStats?: (
    updatedElo?: number, 
    updatedXp?: number, 
    updatedThemes?: string[],
    updatedPlayed?: number,
    updatedWon?: number,
    updatedAvatar?: string,
    updatedBio?: string,
    updatedClaimedAchievements?: string[],
    updatedUnlockedItems?: string[],
    updatedUnlockedFrames?: string[],
    updatedCoins?: number,
    updatedDiamonds?: number
  ) => Promise<void>;
  prefLang?: 'id' | 'en';
  starterPackClaimed?: boolean;
  setStarterPackClaimed?: React.Dispatch<React.SetStateAction<boolean>>;
  user?: any;
}

// Seasonal Event Setup Constants
interface EventSeason {
  id: string;
  name: string;
  tagline: string;
  themeColor: string;
  badgeTextColor: string;
  quests: { id: string; desc: string; reward: number; done: boolean }[];
  quiz: { id: string; question: string; options: string[]; answerIdx: number; explanation: string }[];
  rewards: { id: string; cost: number; name: string; type: 'title' | 'frame' | 'skin'; assetId: string }[];
  bgGradient: string;
}

const EVENTS_DATA: EventSeason[] = [
  {
    id: 'ramadan',
    name: 'Festival Ramadan Chess',
    tagline: 'Sambut bulan suci dengan kecemerlangan taktik malam penuh berkah!',
    themeColor: 'emerald',
    badgeTextColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950 via-teal-900 to-[#121212]',
    quests: [
       { id: 'rq1', desc: 'Mainkan 3 game dengan bidak bertema Kayu', reward: 30, done: false },
       { id: 'rq2', desc: 'Korbankan Gajah dan selesaikan game dalam kemenangan', reward: 50, done: false },
       { id: 'rq3', desc: 'Selesaikan 2 Quiz Ramadan malam ini', reward: 25, done: false }
    ],
    quiz: [
      {
        id: 'rqz1',
        question: 'Pembukaan manakah yang terkenal dengan pemindahan menteri secara agresif sejak awal laga?',
        options: ['Scholar-s Mate (Skakmat 4 Langkah)', 'Sicilian Defense', 'Ruy Lopez', 'French Defense'],
        answerIdx: 0,
        explanation: 'Scholar\'s mate memposisikan Menteri ke h5/f3 serta Gajah ke c4 sejak langkah-langkah awal untuk membobol pion terlemah di f7.'
      },
      {
        id: 'rqz2',
        question: 'Jika Raja ditarik ke f2 demi menghindari gempuran tanpa melakukan rokade, situasi raja tersebut disebut...',
        options: ['Raja Mengembara (King Wander)', 'Rokade Buatan (Artificial Castling)', 'Oposisi Vertikal', 'Fianchetto'],
        answerIdx: 1,
        explanation: 'Rokade buatan melibatkan reposisi manual beberapa langkah agar Raja aman di g1/h1 dan Benteng keluar di f1/e1 tanpa hak rokade formal.'
      },
      {
        id: 'rqz3',
        question: 'Di pembukaan Sisilia, varian apa yang terkenal dengan formasi pion berbentuk naga g6?',
        options: ['Variasi Naga (Dragon Variation)', 'Variasi Najdorf', 'Variasi Scheveningen', 'Variasi Klasik'],
        answerIdx: 0,
        explanation: 'Dragon Variation di Sicilian Defense menggunakan struktur pion g6 d6 yang menyerupai rasi bintang Naga (Draco).'
      },
      {
        id: 'rqz4',
        question: 'Langkah taktis memposisikan Gajah menyerang menteri atau benteng lawan di diagonal panjang disebut...',
        options: ['Fianchetto Terbuka', 'Skewer Diagonal', 'Penghancuran Sayap', 'Langkah Gajah Sakti'],
        answerIdx: 1,
        explanation: 'Skewer adalah serangan di mana perwira bernilai tinggi diserang dan terpaksa melarikan diri, mengekspos perwira di belakangnya.'
      },
      {
        id: 'rqz5',
        question: 'Apa sebutan untuk situasi di mana pion dibiarkan tidak terjaga agar perwira lain mendapatkan lajur aktif?',
        options: ['Gambit', 'Pion Racun', 'Rokade Sayap', 'Zugzwang'],
        answerIdx: 0,
        explanation: 'Gambit adalah pengorbanan pion sukarela di pembukaan demi mendapatkan keunggulan posisi atau waktu perkembangan perwira.'
      },
      {
        id: 'rqz6',
        question: 'Metode pertahanan legendaris melawan 1.e4 dengan membalas 1...c6 dinamakan...',
        options: ['Pertahanan Caro-Kann', 'Pertahanan Perancis', 'Pertahanan Sisilia', 'Pertahanan India Raja'],
        answerIdx: 0,
        explanation: 'Caro-Kann Defense (1.e4 c6) adalah pembukaan yang sangat solid dan aman untuk pemain hitam.'
      },
      {
        id: 'rqz7',
        question: 'Pembukaan catur yang diawali dengan langkah 1.d4 f5 dikenal dengan nama...',
        options: ['Pertahanan Belanda (Dutch Defense)', 'Pertahanan Perancis', 'Gambit Queen', 'Pertahanan Slavia'],
        answerIdx: 0,
        explanation: 'Dutch Defense adalah jawaban agresif hitam terhadap 1.d4 dengan langsung memperebutkan petak e4 menggunakan pion f5.'
      },
      {
        id: 'rqz8',
        question: 'Metode bertahan dengan menumpuk Benteng di baris ke-7 atau ke-8 milik lawan untuk menyerang pion g7/h7 dinamakan...',
        options: ['Baterai Baris Belakang (Seventh Rank Rook Battery)', 'Rokade Panjang', 'Rokade Pendek', 'Oposisi Vertikal'],
        answerIdx: 0,
        explanation: 'Menempatkan kedua Benteng di baris ketujuh sangat mematikan karena dapat menyapu habis pion pelindung Raja lawan.'
      }
    ],
    rewards: [
      { id: 'rew_ramadan_1', cost: 100, name: 'Skin Bidak: Kayu Emerald', type: 'skin', assetId: 'emerald_wood' },
      { id: 'rew_ramadan_2', cost: 60, name: 'Bingkai: Kubah Emerald', type: 'frame', assetId: 'embed_emerald' }
    ]
  },
  {
    id: 'lebaran',
    name: 'Festival Hari Raya Lebaran',
    tagline: 'Raih kemenangan fitri dengan taktik ketupat emas penuh kedamaian!',
    themeColor: 'yellow',
    badgeTextColor: 'text-amber-400',
    bgGradient: 'from-amber-950 via-yellow-900 to-[#121212]',
    quests: [
      { id: 'leq1', desc: 'Selesaikan pertandingan catur dengan kemenangan bersih', reward: 35, done: false },
      { id: 'leq2', desc: 'Silaturahmi game: Mainkan catur lokal / teman 1x', reward: 45, done: false }
    ],
    quiz: [
      {
        id: 'leqz1',
        question: 'Di akhir permainan, jika raja dan pion tersisa, prinsip reposisi raja ke depan pion disebut...',
        options: ['Oposisi Raja (King Opposition)', 'Rokade Buatan', 'Fianchetto', 'Pion Bebas Pasif'],
        answerIdx: 0,
        explanation: 'Oposisi Raja adalah menempatkan kedua raja berhadapan terpisah satu kotak di lajur yang sama untuk mencegah pergerakan raja lawan.'
      },
      {
        id: 'leqz2',
        question: 'Siapakah nama Juara Dunia Catur ke-16 yang dikenal sangat dominan sejak tahun 2013 hingga melepaskan gelar?',
        options: ['Magnus Carlsen', 'Garry Kasparov', 'Bobby Fischer', 'Viswanathan Anand'],
        answerIdx: 0,
        explanation: 'Magnus Carlsen mendominasi panggung catur global sejak memenangkan takhta kejuaraan dunia pada tahun 2013 dari Anand.'
      },
      {
        id: 'leqz3',
        question: 'Taktik catur di mana salah satu pihak menyerang raja musuh berkali-kali tanpa henti hingga remis dinamakan...',
        options: ['Skak Abadi (Perpetual Check)', 'Remis Stalemate', 'Langkah Sela', 'Garpu Raja'],
        answerIdx: 0,
        explanation: 'Perpetual check adalah situasi di mana salah satu pemain meluncurkan skak beruntun tanpa batas sehingga menghasilkan hasil seri/remis.'
      },
      {
        id: 'leqz4',
        question: 'Ketika sebuah pion tidak memiliki pion lawan di depannya atau di lajur sebelahnya, pion itu disebut...',
        options: ['Pion Bebas (Passed Pawn)', 'Pion Terisolasi', 'Pion Bertumpuk', 'Pion Lemah'],
        answerIdx: 0,
        explanation: 'Passed pawn adalah pion yang lajurnya sudah bersih dari pion musuh yang bisa menghalangi atau memakannya.'
      },
      {
        id: 'leqz5',
        question: 'Struktur pion di mana dua pion berada pada lajur yang sama akibat memakan perwira musuh disebut...',
        options: ['Pion Bertumpuk (Doubled Pawns)', 'Pion Terisolasi', 'Pion Tergantung', 'Pion Kuat'],
        answerIdx: 0,
        explanation: 'Doubled pawns membatasi fleksibilitas satu sama lain dan sering kali menjadi kelemahan taktis jangka panjang.'
      },
      {
        id: 'leqz6',
        question: 'Pembukaan solid hitam dengan membalas 1.e4 c5 dinamakan...',
        options: ['Pertahanan Sisilia (Sicilian Defense)', 'Pertahanan Perancis', 'Pertahanan Caro-Kann', 'Pertahanan Nimzo-India'],
        answerIdx: 0,
        explanation: 'Pertahanan Sisilia adalah salah satu jawaban paling populer dan agresif dari hitam untuk langsung menantang lajur c terbuka.'
      },
      {
        id: 'leqz7',
        question: 'Metode pertahanan solid dengan memajukan pion e6 dan d5 untuk menahan lajur tengah disebut...',
        options: ['Pertahanan Perancis (French Defense)', 'Pertahanan Skandinavia', 'Gambit King', 'Pertahanan Caro-Kann'],
        answerIdx: 0,
        explanation: 'French Defense (1.e4 e6) menyiapkan d5 yang solid untuk menantang kontrol tengah putih.'
      }
    ],
    rewards: [
      { id: 'rew_lebaran_1', cost: 100, name: 'Skin Bidak: Ketupat Emas', type: 'skin', assetId: 'golden_ketupat_skin' },
      { id: 'rew_lebaran_2', cost: 60, name: 'Bingkai: Ketupat Emas', type: 'frame', assetId: 'golden_ketupat' }
    ]
  },
  {
    id: 'lunar',
    name: 'Lunar Dragon Clash',
    tagline: 'Kemakmuran melimpah dengan formasi Ksatria Naga Emas!',
    themeColor: 'rose',
    badgeTextColor: 'text-rose-400',
    bgGradient: 'from-rose-950 via-red-900 to-[#121212]',
    quests: [
      { id: 'lq1', desc: 'Lakukan skak dengan Kuda berturut-turut', reward: 40, done: false },
      { id: 'lq2', desc: 'Capai akurasi pertempuran di atas 80%', reward: 60, done: false }
    ],
    quiz: [
      {
        id: 'lqz1',
        question: 'Metode pertahanan memajukan pion g6 dan menempatkan Gajah di g7 dinamakan...',
        options: ['Fianchetto', 'En Passant', 'Rokade Sayap', 'Garpu Gajah'],
        answerIdx: 0,
        explanation: 'Fianchetto adalah melangkahkan pion ksatria (g atau b) satu kotak dan menaruh Gajah di lajur utama diagonal terpanjang tersebut.'
      },
      {
        id: 'lqz2',
        question: 'Varian pertahanan solid melawan 1.d4 dengan membalas 1...Nf6 dan melakukan fianchetto gajah raja disebut...',
        options: ['Pertahanan India Raja (King\'s Indian Defense)', 'Gambit Benko', 'Pertahanan Nimzo-India', 'Pertahanan Grunfeld'],
        answerIdx: 0,
        explanation: 'King\'s Indian Defense adalah sistem pertahanan hipermodern yang sangat digemari oleh Bobby Fischer dan Garry Kasparov.'
      },
      {
        id: 'lqz3',
        question: 'Istilah jerman untuk menggambarkan situasi di mana pemain terpaksa melangkah dan langkah apa pun memperburuk posisinya adalah...',
        options: ['Zugzwang', 'Zwischenzug', 'Fianchetto', 'Gambit'],
        answerIdx: 0,
        explanation: 'Zugzwang terjadi saat kewajiban melangkah justru menjadi kelemahan yang merusak posisi pertahanan pemain.'
      },
      {
        id: 'lqz4',
        question: 'Berapakah poin nilai strategis yang biasanya diberikan kepada perwira Benteng?',
        options: ['5 Poin', '3 Poin', '9 Poin', '1 Poin'],
        answerIdx: 0,
        explanation: 'Secara standar, Benteng bernilai 5 poin, melambangkan kekuatan lini serang yang tinggi di atas Gajah/Kuda (3 poin).'
      },
      {
        id: 'lqz5',
        question: 'Pembukaan catur tertua yang sangat legendaris diawali dengan 1.e4 e5 2.Nf3 Nc6 3.Bb5 dinamakan...',
        options: ['Ruy Lopez (Pembukaan Spanyol)', 'Giuoco Piano (Italia)', 'Pertahanan Sisilia', 'Pertahanan Perancis'],
        answerIdx: 0,
        explanation: 'Ruy Lopez adalah pembukaan klasik bernilai taktis tinggi yang dinamai dari pendeta asal Spanyol abad ke-16.'
      },
      {
        id: 'lqz6',
        question: 'Dalam posisi di mana pemain mengorbankan Benteng demi membongkar pertahanan Raja musuh, taktik ini disebut...',
        options: ['Pengorbanan Kualitas (Exchange Sacrifice)', 'Promosi', 'Deflection', 'Garpu Gajah'],
        answerIdx: 0,
        explanation: 'Exchange sacrifice adalah pengorbanan perwira bernilai tinggi (seperti Benteng) untuk ditukar dengan perwira bernilai lebih rendah demi keuntungan strategis.'
      },
      {
        id: 'lqz7',
        question: 'Pembukaan catur hipermodern yang diawali dengan 1.Nf3 d5 2.c4 d4 disebut...',
        options: ['Reti Opening (Pembukaan Reti)', 'Gambit Raja', 'Pertahanan India Raja', 'Sistem London'],
        answerIdx: 0,
        explanation: 'Reti Opening mengincar kontrol pusat secara tidak langsung menggunakan sayap samping dan manuver perwira.'
      }
    ],
    rewards: [
      { id: 'rew_lunar_1', cost: 100, name: 'Skin Bidak: Lentera Merah', type: 'skin', assetId: 'red_dragon_skin' },
      { id: 'rew_lunar_2', cost: 60, name: 'Bingkai: Lentera Merah', type: 'frame', assetId: 'red_lantern' }
    ]
  },
  {
    id: 'summer',
    name: 'Summer Chess Solstice',
    tagline: 'Bakar papan catur dengan kobaran kejeniusan taktis musim panas!',
    themeColor: 'orange',
    badgeTextColor: 'text-orange-400',
    bgGradient: 'from-orange-950 via-amber-900 to-[#121212]',
    quests: [
      { id: 'smq1', desc: 'Mainkan 2 game taktis di bawah sorotan matahari', reward: 40, done: false },
      { id: 'smq2', desc: 'Kuasai seluruh diagonal tengah papan catur', reward: 55, done: false }
    ],
    quiz: [
      {
        id: 'smqz1',
        question: 'Langkah taktis yang mengancam dua perwira lawan sekaligus dengan pion disebut...',
        options: ['Garpu Pion (Pawn Fork)', 'Pin/Paku', 'Sate (Skewer)', 'Langkah Sela'],
        answerIdx: 0,
        explanation: 'Garpu pion menyerang dua perwira bernilai tinggi secara bersamaan sehingga lawan terpaksa mengorbankan salah satunya.'
      },
      {
        id: 'smqz2',
        question: 'Bila Gajah dan Ratu berada di diagonal yang sama mengincar satu petak pertahanan musuh, formasi ini dinamakan...',
        options: ['Baterai (Battery)', 'Garpu Ganda', 'Paku Gajah', 'Tebasan Kembar'],
        answerIdx: 0,
        explanation: 'Formasi baterai menumpuk kekuatan dua atau lebih perwira linier pada lajur atau diagonal yang sama untuk menjebol petak target.'
      },
      {
        id: 'smqz3',
        question: 'Aturan 50 langkah dalam catur menyatakan bahwa permainan dapat diklaim remis jika...',
        options: ['Tidak ada langkah pion dan tidak ada perwira yang dimakan dalam 50 langkah berturut-turut', 'Raja melangkah 50 kali', 'Pertandingan berjalan lebih dari 2 jam', 'Kedua pemain melakukan rokade bergantian'],
        answerIdx: 0,
        explanation: 'Aturan 50 langkah mencegah permainan berlanjut tanpa batas jika tidak ada kemajuan nyata (langkah pion atau pemakanan perwira).'
      },
      {
        id: 'smqz4',
        question: 'Pengorbanan taktis gajah putih pada petak h7 untuk membongkar kastel raja hitam disebut...',
        options: ['Greek Gift Sacrifice', 'Gambit Evans', 'Serangan Naga', 'Undermining'],
        answerIdx: 0,
        explanation: 'Serangan pengorbanan Bxh7+ legendaris ini terkenal dengan nama "Greek Gift Sacrifice" (Hadiah Yunani).'
      },
      {
        id: 'smqz5',
        question: 'Di bawah aturan FIDE terbaru, apa yang terjadi bila seorang pemain menyentuh perwira sendiri saat gilirannya?',
        options: ['Pemain wajib menggerakkan perwira tersebut jika memiliki langkah legal (Touch-Move Rule)', 'Pemain langsung kalah', 'Pemain diberi kartu kuning', 'Tidak terjadi apa-apa'],
        answerIdx: 0,
        explanation: 'Aturan "Touch-Move" mengharuskan pemain melangkah menggunakan perwira pertama yang sengaja disentuh jika langkah legal tersedia.'
      },
      {
        id: 'smqz6',
        question: 'Metode penyerangan langsung ke arah sayap Raja lawan dengan memajukan seluruh pion sayap disebut...',
        options: ['Pawn Storm (Badai Pion)', 'Oposisi Vertikal', 'Rokade Sayap', 'Sistem London'],
        answerIdx: 0,
        explanation: 'Pawn storm adalah langkah agresif memajukan barisan pion di satu sayap untuk merusak struktur pertahanan Raja lawan.'
      },
      {
        id: 'smqz7',
        question: 'Sistem pembukaan populer untuk putih yang sangat solid dan tidak bergantung pada respon langkah hitam diawali dengan Bf4 disebut...',
        options: ['Sistem London (London System)', 'Gambit Evans', 'Serangan India Raja', 'Sistem Reti'],
        answerIdx: 0,
        explanation: 'Sistem London sangat digemari karena penempatan Gajah gelap di f4 menciptakan koordinasi pertahanan dan serangan yang sangat solid.'
      }
    ],
    rewards: [
      { id: 'rew_summer_1', cost: 100, name: 'Skin Bidak: Mentari Pantai', type: 'skin', assetId: 'beach_sun_skin' },
      { id: 'rew_summer_2', cost: 60, name: 'Bingkai: Ombak Pantai', type: 'frame', assetId: 'beach_wave' }
    ]
  },
  {
    id: 'christmas',
    name: 'Winter Chess Blizzard',
    tagline: 'Badai salju es taktis! Pertahankan baris belakang dengan kokoh!',
    themeColor: 'sky',
    badgeTextColor: 'text-sky-400',
    bgGradient: 'from-sky-950 via-blue-900 to-[#121212]',
    quests: [
      { id: 'cq1', desc: 'Mainkan 1 pertandingan catur lokal dalam cuaca bersalju', reward: 35, done: false },
      { id: 'cq2', desc: 'Menangkan game tanpa kehilangan kedua Benteng', reward: 45, done: false }
    ],
    quiz: [
      {
        id: 'cqz1',
        question: 'Taktik membongkar perlindungan pion raja musuh dengan pengorbanan beruntun disebut...',
        options: ['Serangan Yunani (Greek Gift Sacrifice)', 'Tembusan Garpala', 'Langkah Selipan', 'En Passant'],
        answerIdx: 0,
        explanation: 'Greek Gift adalah pengorbanan khas Bxh7+ dari putih untuk memikat Raja hitam keluar agar putih meluncurkan serangan mematikan lewat Kuda Ng5+ dan menteri.'
      },
      {
        id: 'cqz2',
        question: 'Pertahanan kokoh hitam setelah 1.e4 e6 disebut sebagai pembukaan...',
        options: ['French Defense (Pertahanan Perancis)', 'Caro-Kann Defense', 'Scandinavian Defense', 'Alekhine Defense'],
        answerIdx: 0,
        explanation: 'French Defense ditandai dengan langkah pembuka 1...e6, mempersiapkan d5 yang kokoh di tengah papan.'
      },
      {
        id: 'cqz3',
        question: 'Apa sebutan untuk pion yang terpisah dari struktur kawan dan tidak bisa dilindungi pion lain di lajur tetangganya?',
        options: ['Pion Terisolasi (Isolated Pawn)', 'Pion Bertumpuk', 'Pion Bebas', 'Pion Gantung'],
        answerIdx: 0,
        explanation: 'Isolated pawn (pion terisolasi) sering menjadi sasaran empuk serangan karena tidak bisa dikawal oleh pion kawannya.'
      },
      {
        id: 'cqz4',
        question: 'Dalam posisi remis karena pengulangan posisi, berapa kali posisi yang persis sama harus terulang agar pemain bisa mengeklaim remis?',
        options: ['3 kali (Threefold Repetition)', '2 kali', '5 kali', '10 kali'],
        answerIdx: 0,
        explanation: 'Aturan Threefold Repetition memperbolehkan pemain meminta remis jika posisi papan yang sama persis terulang sebanyak tiga kali.'
      },
      {
        id: 'cqz5',
        question: 'Pembukaan populer di mana hitam merespons 1.e4 d5 langsung menantang pusat disebut...',
        options: ['Pertahanan Skandinavia (Scandinavian Defense)', 'Pertahanan Sisilia', 'Pertahanan Caro-Kann', 'Pertahanan Nimzowitsch'],
        answerIdx: 0,
        explanation: 'Scandinavian Defense (1.e4 d5) adalah tanggapan langsung memaksa pemakanan pion di d5.'
      },
      {
        id: 'cqz6',
        question: 'Metode penyerangan tidak langsung oleh perwira jarak jauh (Gajah/Benteng/Ratu) menembus bidak yang menghalanginya disebut...',
        options: ['Serangan Sinar-X (X-Ray Attack)', 'Skak Ganda', 'Sate', 'Garpu'],
        answerIdx: 0,
        explanation: 'X-Ray attack adalah taktik di mana perwira jarak jauh terus memberikan tekanan taktis pada suatu petak/perwira menembus bidak penghalang di depannya.'
      },
      {
        id: 'cqz7',
        question: 'Istilah dalam catur untuk langkah pengorbanan perwira demi membebaskan petak/diagonal yang terhalang agar perwira lain bisa menyerang disebut...',
        options: ['Langkah Pembebasan (Vacating/Clearance Sacrifice)', 'En Passant', 'Rokade Buatan', 'Zugzwang'],
        answerIdx: 0,
        explanation: 'Clearance sacrifice mengosongkan jalur atau kotak berharga agar serangan badai perwira kawan bisa diluncurkan tanpa hambatan.'
      }
    ],
    rewards: [
      { id: 'rew_christmas_1', cost: 100, name: 'Skin Bidak: Blizzard Winter', type: 'skin', assetId: 'blizzard_wood' },
      { id: 'rew_christmas_2', cost: 60, name: 'Bingkai: Blizzard Winter', type: 'frame', assetId: 'blizzard_winter' }
    ]
  }
];

interface EventSchedule {
  eventId: string;
  year?: number;       // If undefined, applies to every year (recurrent, like Summer / Christmas)
  startMonth: number;  // 0-11
  startDate: number;   // 1-31
  endMonth: number;    // 0-11
  endDate: number;     // 1-31
}

const EVENT_SCHEDULES: EventSchedule[] = [
  // --- YEAR-SPECIFIC/SHIFTING HOLIDAYS ---
  
  // 1. Lunar Dragon Clash (Lunar New Year)
  { eventId: 'lunar', year: 2025, startMonth: 0, startDate: 25, endMonth: 1, endDate: 15 }, // Jan 25 - Feb 15
  { eventId: 'lunar', year: 2026, startMonth: 1, startDate: 10, endMonth: 2, endDate: 5 },  // Feb 10 - Mar 5
  { eventId: 'lunar', year: 2027, startMonth: 1, startDate: 1,  endMonth: 1, endDate: 22 }, // Feb 1 - Feb 22
  { eventId: 'lunar', year: 2028, startMonth: 0, startDate: 20, endMonth: 1, endDate: 10 }, // Jan 20 - Feb 10
  { eventId: 'lunar', year: 2029, startMonth: 1, startDate: 8,  endMonth: 1, endDate: 28 }, // Feb 8 - Feb 28
  { eventId: 'lunar', year: 2030, startMonth: 1, startDate: 1,  endMonth: 1, endDate: 20 }, // Feb 1 - Feb 20
  
  // 2. Festival Ramadan Chess
  { eventId: 'ramadan', year: 2025, startMonth: 2, startDate: 1,  endMonth: 2, endDate: 30 }, // Mar 1 - Mar 30
  { eventId: 'ramadan', year: 2026, startMonth: 1, startDate: 18, endMonth: 2, endDate: 19 }, // Feb 18 - Mar 19
  { eventId: 'ramadan', year: 2027, startMonth: 1, startDate: 8,  endMonth: 2, endDate: 9 },  // Feb 8 - Mar 9
  { eventId: 'ramadan', year: 2028, startMonth: 0, startDate: 28, endMonth: 1, endDate: 26 }, // Jan 28 - Feb 26
  { eventId: 'ramadan', year: 2029, startMonth: 0, startDate: 16, endMonth: 1, endDate: 14 }, // Jan 16 - Feb 14
  { eventId: 'ramadan', year: 2030, startMonth: 0, startDate: 5,  endMonth: 1, endDate: 3 },  // Jan 5 - Feb 3

  // 3. Festival Hari Raya Lebaran
  { eventId: 'lebaran', year: 2025, startMonth: 2, startDate: 31, endMonth: 3, endDate: 15 }, // Mar 31 - Apr 15
  { eventId: 'lebaran', year: 2026, startMonth: 2, startDate: 20, endMonth: 3, endDate: 10 }, // Mar 20 - Apr 10
  { eventId: 'lebaran', year: 2027, startMonth: 2, startDate: 10, endMonth: 2, endDate: 31 }, // Mar 10 - Mar 31
  { eventId: 'lebaran', year: 2028, startMonth: 1, startDate: 27, endMonth: 2, endDate: 15 }, // Feb 27 - Mar 15
  { eventId: 'lebaran', year: 2029, startMonth: 1, startDate: 15, endMonth: 2, endDate: 5 },  // Feb 15 - Mar 5
  { eventId: 'lebaran', year: 2030, startMonth: 1, startDate: 4,  endMonth: 1, endDate: 20 }, // Feb 4 - Feb 20

  // --- RECURRENT/ANNUAL STATIC SEASONS (Fallback / general if no year-specific override matches) ---
  
  // 4. Summer Chess Solstice
  { eventId: 'summer', startMonth: 5, startDate: 1, endMonth: 7, endDate: 31 }, // June 1 - August 31
  
  // 5. Winter Chess Blizzard (Christmas)
  { eventId: 'christmas', startMonth: 10, startDate: 25, endMonth: 11, endDate: 31 }, // Nov 25 - Dec 31
  { eventId: 'christmas', startMonth: 0,  startDate: 1,  endMonth: 0,  endDate: 5 }    // Jan 1 - Jan 5 (New Year transition)
];

const isEventActive = (
  eventId: string,
  year: number,
  month: number, // 0-11
  date?: number // optional date
): boolean => {
  // 1. Try to find year-specific schedules first
  const yearSchedules = EVENT_SCHEDULES.filter(s => s.eventId === eventId && s.year === year);
  
  if (yearSchedules.length > 0) {
    return yearSchedules.some(s => {
      if (date !== undefined) {
        // Precise date checking
        const currentVal = month * 100 + date;
        const startVal = s.startMonth * 100 + s.startDate;
        const endVal = s.endMonth * 100 + s.endDate;
        return currentVal >= startVal && currentVal <= endVal;
      } else {
        // Month overlap check
        return month >= s.startMonth && month <= s.endMonth;
      }
    });
  }

  // 2. Try recurrent schedules if no specific year override is present
  const recurrentSchedules = EVENT_SCHEDULES.filter(s => s.eventId === eventId && s.year === undefined);
  return recurrentSchedules.some(s => {
    if (date !== undefined) {
      const currentVal = month * 100 + date;
      const startVal = s.startMonth * 100 + s.startDate;
      const endVal = s.endMonth * 100 + s.endDate;
      return currentVal >= startVal && currentVal <= endVal;
    } else {
      return month >= s.startMonth && month <= s.endMonth;
    }
  });
};

export const Features51to60: React.FC<Features51to60Props> = ({
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
  customStatus,
  setCustomStatus,
  equippedTitle,
  setEquippedTitle,
  unlockedTitles,
  setUnlockedTitles,
  equippedCheckmateEffect,
  setEquippedCheckmateEffect,
  unlockedCheckmateEffects,
  setUnlockedCheckmateEffects,
  gameHistoryForAnalysis,
  isGameAnalysisActive,
  onCloseAnalysis,
  profileAvatar,
  selectedFrame,
  unlockedItems,
  setUnlockedItems,
  syncUserStats,
  prefLang,
  starterPackClaimed: propStarterPackClaimed,
  setStarterPackClaimed: propSetStarterPackClaimed,
  user
}) => {
  const isEng = prefLang === 'en';
  const translateTitle = (title: string) => {
    if (!isEng) return title;
    const mapping: Record<string, string> = {
      'Pecatur Perintis': 'Pioneer Chess Player',
      'Syekh Grandmaster': 'Sheikh Grandmaster',
      'Jawara Fitri': 'Eid Champion',
      'Ksatria Barongsai': 'Lion Dance Knight',
      'Penguasa Gurun': 'Desert Ruler',
      'Penebar Salju': 'Snow Spreader',
      'Ksatria Perintis': 'Pioneer Knight',
      'Kolektor Kartu Perdana': 'Starter Card Collector',
      'Pecatur Berbakat': 'Talented Chess Player'
    };
    return mapping[title] || title;
  };
  const [activeTab, setActiveTab] = useState<'events' | 'customization'>('events');
  const [previewFx, setPreviewFx] = useState<string | null>(null);
  const [adminEvents, setAdminEvents] = useState<any[]>([]);

  // --- STATE FOR ADMIN LIVE EVENTS PARTICIPATION ---
  const [eventStates, setEventStates] = useState<Record<string, string>>({});
  const [preRegStates, setPreRegStates] = useState<Record<string, boolean>>({});
  const [blitzSims, setBlitzSims] = useState<Record<string, { active: boolean; step: number; logs: string[] }>>({});

  // --- MINI INTERACTIVE PUZZLE BOARD STATES ---
  const initialMiniBoard = [
    ['', '', '', '', '♚', '', '', ''],
    ['', '', '', '', '', '♟', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '♕'],
    ['', '', '♗', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '♔', '', '', '']
  ];
  const [miniBoard, setMiniBoard] = useState<string[][]>(initialMiniBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState<boolean>(false);

  // --- NEW INTERACTIVE MINI-GAME STATE FOR STAFF EVENTS ---
  const [activeMissionType, setActiveMissionType] = useState<'tactics' | 'rpg'>('tactics');
  // Arena Tactics States
  const [tacticQuestions, setTacticQuestions] = useState<any[]>([]);
  const [currentTacticIndex, setCurrentTacticIndex] = useState<number>(0);
  const [selectedTacticAnswer, setSelectedTacticAnswer] = useState<number | null>(null);
  const [tacticSolvedCount, setTacticSolvedCount] = useState<number>(0);
  const [tacticFeedback, setTacticFeedback] = useState<'correct' | 'incorrect' | null>(null);
  // RPG Duel States
  const [rpgPlayerHp, setRpgPlayerHp] = useState<number>(100);
  const [rpgEnemyHp, setRpgEnemyHp] = useState<number>(100);
  const [rpgLogs, setRpgLogs] = useState<string[]>(["Selamat datang di Duel Taktis RPG!"]);
  const [rpgGameOver, setRpgGameOver] = useState<'win' | 'lose' | null>(null);
  const [rpgSelectedUnit, setRpgSelectedUnit] = useState<any>(null);
  const [rpgEnemyUnit, setRpgEnemyUnit] = useState<any>(null);

  const rpgLogsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rpgLogsEndRef.current) {
      rpgLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [rpgLogs]);

  useEffect(() => {
    if (adminEvents && adminEvents.length > 0) {
      const states: Record<string, string> = {};
      const preRegs: Record<string, boolean> = {};
      adminEvents.forEach(ev => {
        const stateKey = `admin_event_state_${ev.id}:${username || 'anon'}`;
        const preRegKey = `admin_event_prereg_${ev.id}:${username || 'anon'}`;
        states[ev.id] = localStorage.getItem(stateKey) || 'NOT_JOINED';
        preRegs[ev.id] = localStorage.getItem(preRegKey) === 'true';
      });
      setEventStates(states);
      setPreRegStates(preRegs);
    }
  }, [adminEvents, username]);

  useEffect(() => {
    const fetchAdminEvents = async () => {
      try {
        const res = await fetch('/api/admin/events');
        const data = await res.json();
        if (data.success) {
          setAdminEvents(data.events || []);
        }
      } catch (err) {}
    };
    fetchAdminEvents();
  }, [activeTab]);

  // --- SUBSTATE EVENT MUSIMAN WITH MONTH FILTERING & SIMULATION ---
  const [selectedMonthSim, setSelectedMonthSim] = useState<number>(() => {
    return -1; // defaults to real computer calendar
  });

  const isEventActiveInMonth = (eventId: string, monthIdx: number) => {
    const d = new Date();
    const currentYear = d.getFullYear();

    if (monthIdx === -1) {
      // Real clock, use full precision (year, month, date)
      return isEventActive(eventId, currentYear, d.getMonth(), d.getDate());
    } else {
      // Simulation mode, check if the event matches the specified simulated month of the current year
      return isEventActive(eventId, currentYear, monthIdx);
    }
  };

  const getSimOptions = () => {
    const d = new Date();
    const currentYear = d.getFullYear();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return monthNames.map((name, idx) => {
      // Find all events active in this simulated month idx
      const activeEvs = EVENTS_DATA.filter(ev => isEventActive(ev.id, currentYear, idx));
      const evNames = activeEvs.map(ev => ev.name.replace(' Festival', '').replace(' Clash', '').replace(' Solstice', '').replace(' Blizzard', '')).join(', ');
      
      return {
        value: idx,
        label: evNames ? `Simulasi: ${name} (${evNames})` : `Simulasi: ${name} (Tanpa Event)`
      };
    });
  };

  const filteredEvents = EVENTS_DATA.filter(ev => isEventActiveInMonth(ev.id, selectedMonthSim));

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const initialEvents = EVENTS_DATA.filter(ev => isEventActiveInMonth(ev.id, -1));
    return initialEvents.length > 0 ? initialEvents[0].id : 'summer';
  });

  useEffect(() => {
    const act = EVENTS_DATA.filter(ev => isEventActiveInMonth(ev.id, selectedMonthSim));
    if (act.length > 0) {
      if (!act.some(ev => ev.id === selectedEventId)) {
        setSelectedEventId(act[0].id);
      }
    }
  }, [selectedMonthSim, selectedEventId]);

  const [eventScore, setEventScore] = useState<number>(() => {
    return Number(localStorage.getItem('seasonal_event_score') || '15');
  });
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('seasonal_completed_quests') || '[]');
  });
  const [answeredQuizIds, setAnsweredQuizIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('seasonal_answered_quizzes') || '[]');
  });
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);

  useEffect(() => {
    if (user) {
      if (user.seasonal_event_score !== undefined) {
        setEventScore(user.seasonal_event_score);
      } else {
        setEventScore(Number(localStorage.getItem('seasonal_event_score') || '15'));
      }
      if (user.seasonal_completed_quests !== undefined) {
        setCompletedQuestIds(user.seasonal_completed_quests);
      } else {
        setCompletedQuestIds(JSON.parse(localStorage.getItem('seasonal_completed_quests') || '[]'));
      }
      if (user.seasonal_answered_quizzes !== undefined) {
        setAnsweredQuizIds(user.seasonal_answered_quizzes);
      } else {
        setAnsweredQuizIds(JSON.parse(localStorage.getItem('seasonal_answered_quizzes') || '[]'));
      }
    } else {
      setEventScore(Number(localStorage.getItem('seasonal_event_score') || '15'));
      setCompletedQuestIds(JSON.parse(localStorage.getItem('seasonal_completed_quests') || '[]'));
      setAnsweredQuizIds(JSON.parse(localStorage.getItem('seasonal_answered_quizzes') || '[]'));
    }
  }, [username, user]);

  // --- STARTER PACK SUBSTATE ---
  const [localStarterPackClaimed, setLocalStarterPackClaimed] = useState<boolean>(() => {
    return localStorage.getItem('starter_pack_purchased') === 'true';
  });

  const starterPackClaimed = propStarterPackClaimed !== undefined ? propStarterPackClaimed : localStarterPackClaimed;
  const setStarterPackClaimed = propSetStarterPackClaimed !== undefined ? propSetStarterPackClaimed : setLocalStarterPackClaimed;

  // --- SUBSTATE SHARE PROFILE CARD ---
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get active selected event details, safe guarded for empty case
  const activeEvent = filteredEvents.find(e => e.id === selectedEventId) || filteredEvents[0] || null;

  useEffect(() => {
    if (filteredEvents.length > 0) {
      if (!filteredEvents.some(ev => ev.id === selectedEventId)) {
        setSelectedEventId(filteredEvents[0].id);
      }
    }
  }, [selectedMonthSim]);

  useEffect(() => {
    localStorage.setItem('seasonal_event_score', String(eventScore));
  }, [eventScore]);

  useEffect(() => {
    localStorage.setItem('seasonal_completed_quests', JSON.stringify(completedQuestIds));
  }, [completedQuestIds]);

  useEffect(() => {
    localStorage.setItem('seasonal_answered_quizzes', JSON.stringify(answeredQuizIds));
  }, [answeredQuizIds]);

  // Handle Event Quest Click Complete
  const completeQuest = (qId: string, pts: number) => {
    if (completedQuestIds.includes(qId)) return;
    
    const nextCompleted = [...completedQuestIds];
    if (!nextCompleted.includes(qId)) {
      nextCompleted.push(qId);
    }
    setCompletedQuestIds(nextCompleted);
    localStorage.setItem('seasonal_completed_quests', JSON.stringify(nextCompleted));

    const nextScore = eventScore + pts;
    setEventScore(nextScore);
    localStorage.setItem('seasonal_event_score', String(nextScore));
    
    triggerAudio('win');
    triggerReward(15, isEng ? `Completed event quest! +${pts} Event Points` : `Selesaikan misi event! +${pts} Poin Event`, 'reward');
    
    // Sync to backend immediately
    if (syncUserStats) {
      syncUserStats(undefined, xp + 15);
    }
  };

  // Submit Event Quiz Answer
  const handleQuizAnswerSubmit = (optionIdx: number) => {
    if (selectedQuizAnswer !== null) return; // already answered
    const quizItem = activeEvent.quiz[currentQuizIndex];
    if (!quizItem) return;

    setSelectedQuizAnswer(optionIdx);
    const qId = quizItem.id;

    if (optionIdx === quizItem.answerIdx) {
      setQuizFeedback('correct');
      triggerAudio('win');
      if (!answeredQuizIds.includes(qId)) {
        const nextAnswered = [...answeredQuizIds];
        if (!nextAnswered.includes(qId)) {
          nextAnswered.push(qId);
        }
        setAnsweredQuizIds(nextAnswered);
        localStorage.setItem('seasonal_answered_quizzes', JSON.stringify(nextAnswered));

        const nextScore = eventScore + 20;
        setEventScore(nextScore);
        localStorage.setItem('seasonal_event_score', String(nextScore));
        
        triggerReward(10, isEng ? "Correct Event Quiz! +20 Event Points" : "Kuis Event Benar! +20 Poin Event", "reward");
        
        // Sync to backend immediately
        if (syncUserStats) {
          syncUserStats(undefined, xp + 10);
        }
      }
    } else {
      setQuizFeedback('incorrect');
      triggerAudio('error');
    }
  };

  const nextQuizItem = () => {
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
    if (currentQuizIndex < activeEvent.quiz.length - 1) {
      setCurrentQuizIndex(p => p + 1);
    } else {
      setCurrentQuizIndex(0);
    }
  };

  // Buy Event Shop Item
  const buyEventReward = (rewardItem: typeof activeEvent.rewards[0]) => {
    if (eventScore < rewardItem.cost) {
      triggerAudio('error');
      triggerReward(0, 'Poin event tidak cukup untuk menukarkan item ini.', 'info');
      return;
    }

    let unlockedItemsUpdated = [...(unlockedItems || [])];
    let updatedFrames = [...unlockedFrames];

    if (rewardItem.type === 'title') {
      if (unlockedTitles.includes(rewardItem.assetId)) {
        triggerReward(0, 'Gelar ini sudah dimiliki!', 'info');
        return;
      }
      setUnlockedTitles(prev => [...prev, rewardItem.assetId]);
      setEquippedTitle(rewardItem.assetId);
      if (!unlockedItemsUpdated.includes(rewardItem.assetId)) {
        unlockedItemsUpdated.push(rewardItem.assetId);
      }
    } else if (rewardItem.type === 'frame') {
      if (unlockedFrames.includes(rewardItem.assetId)) {
        triggerReward(0, 'Bingkai ini sudah dimiliki!', 'info');
        return;
      }
      setUnlockedFrames(prev => [...prev, rewardItem.assetId]);
      updatedFrames.push(rewardItem.assetId);
      if (!unlockedItemsUpdated.includes(rewardItem.assetId)) {
        unlockedItemsUpdated.push(rewardItem.assetId);
      }
    } else if (rewardItem.type === 'skin') {
      if (unlockedSkins.includes(rewardItem.assetId)) {
        triggerReward(0, 'Skin bidak ini sudah dimiliki!', 'info');
        return;
      }
      setUnlockedSkins(prev => [...prev, rewardItem.assetId]);
      if (!unlockedItemsUpdated.includes(rewardItem.assetId)) {
        unlockedItemsUpdated.push(rewardItem.assetId);
      }
    }

    if (setUnlockedItems) {
      setUnlockedItems(unlockedItemsUpdated);
    }

    const nextScore = eventScore - rewardItem.cost;
    setEventScore(nextScore);
    localStorage.setItem('seasonal_event_score', String(nextScore));
    triggerAudio('win');
    triggerReward(25, `Berhasil membeli ${rewardItem.name}!`, 'reward', 0, 0);

    // Sync to Firestore
    if (syncUserStats) {
      syncUserStats(
        undefined,
        xp + 25,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        unlockedItemsUpdated,
        updatedFrames
      ).catch(err => console.warn("Failed to sync shop item purchase:", err));
    }
  };

  // Claim Starter Pack
  const buyStarterPack = () => {
    if (starterPackClaimed) return;
    const starterCostCoins = 1250;

    if (coins < starterCostCoins) {
      triggerAudio('error');
      triggerReward(0, `Sisa Koin Anda tidak mencukupi untuk membeli Starter Pack. Diperlukan ${starterCostCoins} Koin.`, 'info');
      return;
    }

    setCoins(prev => prev - starterCostCoins + 2000);
    
    (window as any).__bypassSavingsRedirect = true;
    setDiamonds(prev => prev + 75, true);
    (window as any).__bypassSavingsRedirect = false;

    // Unlock rewards
    const updatedTitles = [...unlockedTitles];
    if (!updatedTitles.includes('Ksatria Perintis')) {
      updatedTitles.push('Ksatria Perintis');
    }
    setUnlockedTitles(updatedTitles);
    setEquippedTitle('Ksatria Perintis');

    const updatedFrames = [...unlockedFrames];
    if (!updatedFrames.includes('embed_emerald')) {
      updatedFrames.push('embed_emerald');
    }
    setUnlockedFrames(updatedFrames);

    setStarterPackClaimed(true);
    localStorage.setItem('starter_pack_purchased', 'true');

    triggerAudio('win');
    triggerReward(250, "Starter Pack Berhasil Diklaim! Gelar, frame, koin & diamond berhasil ditambahkan!", "reward", 2000, 75);

    const finalCoins = coins - starterCostCoins + 2000;
    const finalDiamonds = diamonds + 75;

    if (syncUserStats) {
      syncUserStats(
        undefined,
        xp + 250,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        updatedFrames,
        finalCoins,
        finalDiamonds
      ).catch(err => console.warn("Failed to sync starter pack purchase:", err));
    }
  };

  // Copy Profile Card Link to clipboard
  const handleCopyProfileCard = () => {
    const realProfileLink = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(username || 'player')}`;
    navigator.clipboard.writeText(realProfileLink).then(() => {
      setCopiedLink(true);
      triggerAudio('win');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Generate Opening Analysis based on current or previous game history
  const detectOpeningAndAnalyze = () => {
    const history = gameHistoryForAnalysis || ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'];
    
    // Simple structural checks for chess openings
    let openingName = "Pertahanan Terbuka Standard (Standard Open Game)";
    let accuracy = 75;
    let blunderDesc = "Tidak ada blunder fatal terdeteksi.";
    let bestMove = "Pertahankan penguasaan petak tengah d4/d5";
    let optimalDesc = "Penempatan perwira pembuka yang cukup harmonis.";

    if (history.length >= 2) {
      const movesStr = history.slice(0, 6).join(' ');
      if (movesStr.includes('e4 c5')) {
        openingName = "Sicilian Defense (Pertahanan Sisilia)";
        accuracy = 86;
        blunderDesc = "Terlalu cepat melangkahkan bidak a6 melewatkan tekanan d4.";
        bestMove = "Lakukan tusukan d4 menyapu pion pusat";
        optimalDesc = "Langkah pembongkaran posisi sayap hitam yang sangat tajam.";
      } else if (movesStr.includes('e4 e5 Nf3 Nc6 Bb5')) {
        openingName = "Ruy Lopez / Spanish Opening (Pembukaan Spanyol)";
        accuracy = 92;
        blunderDesc = "Salah meletakkan gajah ke c5 tanpa perlindungan menteri.";
        bestMove = "Posisikan pion c3 untuk mempersiapkan formasi d4";
        optimalDesc = "Klasik dan legendaris! Gajah membidik ksatria pelindung raja hitam.";
      } else if (movesStr.includes('d4 d5 c4')) {
        openingName = "Queen's Gambit Accepted (Gambit Menteri)";
        accuracy = 88;
        blunderDesc = "Mencoba memaksakan pertahanan pion c4 yang terbebas.";
        bestMove = "Melangkah e3 untuk membajak kembali pion gajah";
        optimalDesc = "Pertukaran dinamis untuk mendominasi jalur sayap barat.";
      } else if (movesStr.includes('e4 e5 Nf3 Nc6 Bc4 Bc5')) {
        openingName = "Giuoco Piano / Italian Game (Permainan Italia)";
        accuracy = 84;
        blunderDesc = "Kuda melompat prematur ke g5 tanpa perlindungan optimal.";
        bestMove = "Lakukan rokade dini memastikan keamanan Raja";
        optimalDesc = "Strategi ideal menguasai jalur diagonal f7 yang rapuh.";
      } else if (movesStr.includes('e4 e5 Qh5')) {
        openingName = "Scholar's Mate Attempt (Serangan Skakmat 4 Langkah)";
        accuracy = 45;
        blunderDesc = "Menteri keluar gila-gilaan terlalu dini, rentan disergap kuda f6.";
        bestMove = "Kembalikan Menteri menjaga koordinasi sayap dalam pertahanan";
        optimalDesc = "Strategi berisiko tinggi. Hanya ampuh menembus pertahanan pemula mutlak.";
      }
    }

    return { openingName, accuracy, blunderDesc, bestMove, optimalDesc };
  };

  const analysis = detectOpeningAndAnalyze();

  return (
    <div id="features51-60-wrapper" className="w-full bg-[#161514] border border-[#3c3934] rounded-2xl overflow-hidden shadow-2xl font-sans mt-2">
      {/* Tab Selectors */}
      <div className="flex border-b border-[#3c3934] bg-[#22201e] overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => { setActiveTab('events'); triggerAudio('move'); }}
          className={`flex-1 py-4 px-3 text-xs font-black uppercase text-center cursor-pointer transition-all flex items-center justify-center gap-2 border-b-2 whitespace-nowrap min-w-[130px] border-[#81b64c] text-white bg-black/40`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          {isEng ? "Seasonal Events" : "Event Musiman"}
        </button>
      </div>

      <div className="p-5 md:p-6 text-slate-200">
        <AnimatePresence mode="wait">
          {/* TAB 1: SEASONAL EVENTS */}
          {activeTab === 'events' && (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Month Simulator Widget */}
              <div className="p-4 bg-[#1c1a19] border border-[#3c3934] rounded-2xl text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-white hover:text-green-400 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#81b64c]" />
                      Sistem Deteksi Kalender Riil & Simulasi
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Sistem melacak kalender asli perangkat Anda secara otomatis. Anda juga dapat menggunakan simulator di samping untuk menguji event musiman lainnya:
                    </p>
                  </div>
                  <select
                    value={selectedMonthSim}
                    onChange={(e) => {
                      setSelectedMonthSim(Number(e.target.value));
                      triggerAudio('move');
                    }}
                    className="p-2.5 bg-[#262421] text-xs font-bold text-slate-200 border border-[#4d4a44] rounded-xl focus:outline-none focus:border-[#81b64c] cursor-pointer"
                  >
                    <option value={-1}>Otomatis: Ikuti Kalender Riil Perangkat</option>
                    {getSimOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Event & Turnamen Terjadwal Server */}
              {adminEvents && adminEvents.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-2 border-purple-800/50 rounded-2xl text-left space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
                      {isEng ? "LIVE SERVER EVENT (STAFF SCHEDULED)" : "EVENT TURNAMEN LIVE SERVER (JADWAL STAFF)"}
                    </h4>
                    <span className="text-[8px] font-black bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded uppercase">
                      {isEng ? "OFFICIAL" : "RESMI"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminEvents.map((ev: any) => {
                      let isLive = false;
                      let isPast = false;

                      // 1. Calculate duration and check manual override (Request 6)
                      const durationMs = (ev.durationHours ? Number(ev.durationHours) : 3) * 60 * 60 * 1000;

                      if (ev.overrideStatus === 'started') {
                        isLive = true;
                        isPast = false;
                      } else if (ev.overrideStatus === 'stopped') {
                        isLive = false;
                        isPast = true;
                      } else {
                        // Automatic schedule
                        try {
                          const eventStart = new Date(`${ev.date}T${ev.time}`);
                          if (!isNaN(eventStart.getTime())) {
                            const now = new Date();
                            isLive = now >= eventStart;
                            isPast = now.getTime() - eventStart.getTime() > durationMs;
                          } else {
                            const localDateStr = new Date().toLocaleDateString('en-CA');
                            const utcDateStr = new Date().toISOString().split('T')[0];
                            isLive = ev.date === localDateStr || ev.date === utcDateStr;
                          }
                        } catch (e) {
                          const localDateStr = new Date().toLocaleDateString('en-CA');
                          const utcDateStr = new Date().toISOString().split('T')[0];
                          isLive = ev.date === localDateStr || ev.date === utcDateStr;
                        }
                      }

                      // 2. Perform Eligibility requirement checks (Request 5)
                      const userLevel = getLevelFromXP(xp);
                      const meetsRating = !ev.reqMinRating || onlineRating >= Number(ev.reqMinRating);
                      const meetsLevel = !ev.reqMinLevel || userLevel >= Number(ev.reqMinLevel);
                      const meetsPremium = !ev.reqPremiumOnly || membershipStatus === 'premium';
                      const meetsAllRequirements = meetsRating && meetsLevel && meetsPremium;

                      // Helper to start the selected mission types
                      const handleJoinEventWithMissions = () => {
                        const bank = [
                          {
                            q: "Ratu Anda di-pin oleh Benteng lawan di diagonal f-file. Apa taktik terbaik untuk lepas?",
                            opts: ["Lakukan Interposing (menghalangi dengan perwira lain)", "Korbankan Raja", "Lakukan Rokade Panjang", "Menyerah"],
                            ans: 0,
                            exp: "Interposing menempatkan perwira lain di antara penyerang dan perwira yang di-pin untuk membebaskannya."
                          },
                          {
                            q: "Lawan memiliki Ratu dan Benteng yang sejajar di d-file. Taktik apa yang bisa garpu keduanya sekaligus menggunakan Kuda?",
                            opts: ["Kuda melompat ke petak garpu e7/c7", "Gerakkan Raja ke depan", "Tukar Kuda dengan Pion", "Fianchetto Gajah"],
                            ans: 0,
                            exp: "Lompatan Kuda ke petak strategis seperti e7 atau c7 dapat menciptakan garpu (fork) mematikan bagi Ratu dan Benteng."
                          },
                          {
                            q: "Raja lawan terjebak di baris belakang (Back Rank) terlindungi oleh pion-pionnya sendiri. Langkah skakmat instan apa yang mungkin?",
                            opts: ["Skakmat Baris Belakang (Back-Rank Mate) menggunakan Benteng/Ratu", "Rokade Buatan", "Gerakkan Pion h3", "Tukar Gajah"],
                            ans: 0,
                            exp: "Back-rank mate memanfaatkan ketidakmampuan Raja lawan melarikan diri karena baris depannya terhalang pionnya sendiri."
                          },
                          {
                            q: "Apa nama pembukaan catur di mana putih mengorbankan pion d4 di langkah kedua untuk menguasai pusat?",
                            opts: ["Gambit Menteri (Queen's Gambit)", "Pertahanan Sisilia", "Ruy Lopez", "Caro-Kann"],
                            ans: 0,
                            exp: "Queen's Gambit dimulai dengan 1.d4 d5 2.c4, mengorbankan pion sayap menteri demi kontrol pusat yang kokoh."
                          },
                          {
                            q: "Langkah khusus di mana Raja melompati dua kotak dan Benteng menempati petak yang dilompati Raja disebut...",
                            opts: ["Rokade (Castling)", "En Passant", "Promosi Pion", "Skewer"],
                            ans: 0,
                            exp: "Rokade adalah langkah ganda unik yang mengamankan Raja sekaligus mengaktifkan Benteng dalam satu langkah."
                          },
                          {
                            q: "Situasi di mana tidak ada langkah legal bagi Raja yang tidak sedang diskak disebut...",
                            opts: ["Remis Pat (Stalemate)", "Skakmat (Checkmate)", "Skak Abadi", "Blunder"],
                            ans: 0,
                            exp: "Stalemate (Pat) menghasilkan hasil remis/seri otomatis karena pemain tidak memiliki langkah sah tetapi tidak sedang diserang."
                          },
                          {
                            q: "Jika Kuda menyerang Raja dan Ratu sekaligus, taktik ini disebut...",
                            opts: ["Garpu Kuda (Knight Fork)", "Pin/Paku", "Sate (Skewer)", "Discovered Attack"],
                            ans: 0,
                            exp: "Garpu Kuda memanfaatkan kemampuan melompat unik Kuda untuk menyerang dua perwira bernilai tinggi secara bersamaan."
                          },
                          {
                            q: "Pion yang berhasil mencapai baris paling ujung papan lawan dapat berubah menjadi perwira apa saja kecuali...",
                            opts: ["Raja", "Ratu", "Benteng", "Gajah / Kuda"],
                            ans: 0,
                            exp: "Promosi pion memperbolehkan pion berubah menjadi Ratu, Benteng, Gajah, atau Kuda, tetapi tidak bisa menjadi Raja lain."
                          },
                          {
                            q: "Taktik memancing perwira lawan ke petak yang merugikan menggunakan pengorbanan disebut...",
                            opts: ["Umpan/Deflection", "Overloading", "Discovered Check", "Windmill"],
                            ans: 0,
                            exp: "Deflection memaksa perwira pertahanan lawan meninggalkan tugas utamanya untuk menangani ancaman pengorbanan."
                          },
                          {
                            q: "Apa sebutan untuk situasi di mana satu perwira terpaksa menjaga terlalu banyak ancaman sekaligus?",
                            opts: ["Overloaded (Beban Berlebih)", "Pins (Paku)", "Double Attack", "Fianchetto"],
                            ans: 0,
                            exp: "Overloaded terjadi ketika satu perwira dibebani tugas melindungi beberapa petak/perwira sehingga rentan dieksploitasi."
                          },
                          {
                            q: "Bila Ratu bergerak membelakangi perwira musuh bernilai tinggi sehingga perwira di depannya terpaksa tidak boleh bergerak, disebut...",
                            opts: ["Paku Absolut (Absolute Pin)", "Skewer (Sate)", "Garpu Kuda", "En Passant"],
                            ans: 0,
                            exp: "Pin Absolut mengunci perwira karena jika perwira tersebut bergerak, Raja akan langsung terkena skak (langkah ilegal)."
                          },
                          {
                            q: "Pion melangkah dua petak ke depan melewati petak kontrol pion musuh, lalu pion musuh memakan pion tersebut secara diagonal seolah-olah hanya melangkah satu petak dinamakan...",
                            opts: ["En Passant", "Promosi Pion", "Pion Bebas (Passed Pawn)", "Undermining"],
                            ans: 0,
                            exp: "En Passant adalah aturan khusus pengambilan pion yang hanya berlaku segera setelah pion melangkah maju dua petak."
                          },
                          {
                            q: "Taktik menyerang Raja musuh lewat skak, lalu di belakang Raja ada perwira bernilai tinggi lainnya yang akan jatuh dinamakan...",
                            opts: ["Sate (Skewer)", "Paku (Pin)", "Garpu (Fork)", "Interposing"],
                            ans: 0,
                            exp: "Skewer adalah kebalikan dari pin; perwira bernilai lebih tinggi (Raja) diserang duluan dan dipaksa bergerak, mengungkap perwira di belakangnya."
                          },
                          {
                            q: "Perwira yang diletakkan di lajur terbuka dan mengontrol baris kelima sampai kedelapan secara bebas dinamakan...",
                            opts: ["Perwira Aktif", "Perwira Pasif", "Perwira Terkunci", "Perwira Korban"],
                            ans: 0,
                            exp: "Perwira aktif memiliki kebebasan bergerak yang tinggi dan memberikan tekanan taktis besar pada wilayah lawan."
                          },
                          {
                            q: "Langkah mengejutkan yang memotong jalur pertahanan lawan sebelum meluncurkan serangan akhir disebut...",
                            opts: ["Interference (Interferensi)", "Discovered Attack", "X-Ray Attack", "Zwischenzug"],
                            ans: 0,
                            exp: "Interferensi adalah langkah menempatkan perwira di antara jalur komunikasi dua perwira musuh agar pertahanan terputus."
                          },
                          {
                            q: "Langkah sela tak terduga sebelum melakukan pertukaran perwira yang direncanakan dinamakan...",
                            opts: ["Zwischenzug (Langkah Sela)", "Gambit", "Zugzwang", "Fianchetto"],
                            ans: 0,
                            exp: "Zwischenzug adalah langkah sela tak terduga yang mengubah evaluasi pertukaran menguntungkan bagi pemain yang meluncurkannya."
                          },
                          {
                            q: "Taktik mengorbankan perwira untuk membuka diagonal atau lajur serang disebut...",
                            opts: ["Clearance Sacrifice (Pengosongan Ruang)", "Deflection", "Overloading", "Greek Gift"],
                            ans: 0,
                            exp: "Clearance sacrifice adalah pengorbanan perwira dari kotak tertentu agar perwira lain dapat melewati lajur atau diagonal tersebut dengan bebas."
                          },
                          {
                            q: "Apa sebutan untuk situasi saat Menteri menyerang Raja lawan tetapi juga dibantu oleh Gajah di diagonal yang sama?",
                            opts: ["Battery Attack (Serangan Baterai)", "Double Check", "Discovered Attack", "X-Ray Attack"],
                            ans: 0,
                            exp: "Serangan baterai menyejajarkan dua perwira linier pada diagonal atau file yang sama untuk memaksimalkan daya tembus."
                          },
                          {
                            q: "Jika sebuah bidak catur menghalangi lajur perlindungan perwira kawan sendiri, taktik menyingkirkannya dinamakan...",
                            opts: ["Pengosongan Petak (Clearance)", "Interferensi", "En Passant", "Rokade"],
                            ans: 0,
                            exp: "Clearance menyingkirkan bidak sendiri dari petak strategis agar bidak lain yang lebih kuat bisa menempatinya."
                          },
                          {
                            q: "Metode menyerang Raja lawan dengan dua perwira sekaligus secara bersamaan lewat satu langkah disebut...",
                            opts: ["Skak Ganda (Double Check)", "Garpu Ganda", "Pin Absolut", "Zwischenzug"],
                            ans: 0,
                            exp: "Skak ganda memaksa Raja lawan bergerak karena tidak ada perwira lain yang bisa memblokir atau memakan kedua penyerang sekaligus."
                          },
                          {
                            q: "Taktik menyerang sebuah perwira yang sedang memblokir serangan ke arah perwira yang lebih berharga di belakangnya disebut...",
                            opts: ["Menyerang Pembela (Removing the Defender)", "Paku (Pin)", "Sate (Skewer)", "Garpu"],
                            ans: 0,
                            exp: "Removing the defender menyingkirkan perwira pelindung kunci lawan agar target utama menjadi tidak berdaya."
                          }
                        ];

                        // Pick 10 random tactics (Request 3)
                        const shuffled = [...bank].sort(() => 0.5 - Math.random());
                        setTacticQuestions(shuffled.slice(0, 10));
                        setCurrentTacticIndex(0);
                        setSelectedTacticAnswer(null);
                        setTacticSolvedCount(0);
                        setTacticFeedback(null);

                        // Reset RPG Stability values & pokemon choices
                        setRpgSelectedUnit(null);
                        setRpgEnemyUnit(null);
                        setRpgPlayerHp(100);
                        setRpgEnemyHp(100);
                        setRpgLogs(["Duel Pokémon Suku Taktis dimulai! Pilih bidak Pokémon Anda di bawah untuk memulai pertempuran."]);
                        setRpgGameOver(null);

                        // Save join status
                        const stateKey = `admin_event_state_${ev.id}:${username || 'anon'}`;
                        localStorage.setItem(stateKey, 'JOINED');
                        setEventStates(prev => ({ ...prev, [ev.id]: 'JOINED' }));
                        triggerAudio('move');
                      };

                      const RPG_PLAYER_TEMPLATES = [
                        {
                          name: 'Pion Perkasa',
                          symbol: '♙',
                          hp: 120,
                          element: 'Petir',
                          moves: [
                            { name: 'Spark Strike', power: 25, type: 'Petir', category: 'attack', desc: 'Serangan sengatan listrik cepat.' },
                            { name: 'Volt Charge', power: 45, type: 'Petir', category: 'attack', desc: 'Serangan petir penembus baja.' },
                            { name: 'Pion Barrier', power: 0, type: 'Tanah', category: 'defend', desc: 'Memulihkan 30 HP.' },
                            { name: 'Overload Thunder', power: 65, type: 'Petir', category: 'ultimate', desc: 'Ledakan listrik dahsyat.' }
                          ]
                        },
                        {
                          name: 'Ksatria Sakti',
                          symbol: '♘',
                          hp: 150,
                          element: 'Api',
                          moves: [
                            { name: 'Tusukan Bara', power: 30, type: 'Api', category: 'attack', desc: 'Tusukan tombak dilapisi api membara.' },
                            { name: 'Knight Jump', power: 40, type: 'Api', category: 'attack', desc: 'Melompati rintangan menghantam.' },
                            { name: 'Semangat Juang', power: 0, type: 'Api', category: 'support', desc: 'Memulihkan 40 HP.' },
                            { name: 'Blazing Meteor', power: 70, type: 'Api', category: 'ultimate', desc: 'Meteor api menghanguskan.' }
                          ]
                        },
                        {
                          name: 'Ratu Agung',
                          symbol: '♕',
                          hp: 140,
                          element: 'Fairy',
                          moves: [
                            { name: 'Sinar Suci', power: 35, type: 'Fairy', category: 'attack', desc: 'Serangan peri dengan sinar suci.' },
                            { name: 'Tebasan Dirgantara', power: 45, type: 'Fairy', category: 'attack', desc: 'Tebasan bersayap cahaya dongeng mulia.' },
                            { name: 'Aura Kesembuhan', power: 0, type: 'Fairy', category: 'support', desc: 'Memulihkan 35 HP.' },
                            { name: 'Supernova Burst', power: 75, type: 'Fairy', category: 'ultimate', desc: 'Ledakan energi peri supernova.' }
                          ]
                        }
                      ];

                      const RPG_ENEMY_TEMPLATES = [
                        {
                          name: 'Ksatria Hitam',
                          symbol: '♞',
                          hp: 130,
                          element: 'Api',
                          moves: [
                            { name: 'Tusukan Bara', power: 25, type: 'Api' },
                            { name: 'Knight Jump', power: 35, type: 'Api' }
                          ]
                        },
                        {
                          name: 'Gajah Hitam',
                          symbol: '♝',
                          hp: 120,
                          element: 'Air',
                          moves: [
                            { name: 'Pancaran Aqua', power: 25, type: 'Air' },
                            { name: 'Air Berkat', power: 30, type: 'Air' }
                          ]
                        },
                        {
                          name: 'Ratu Kegelapan',
                          symbol: '♛',
                          hp: 160,
                          element: 'Kegelapan',
                          moves: [
                            { name: 'Sinar Kelam', power: 30, type: 'Kegelapan' },
                            { name: 'Kiamat Bayang', power: 55, type: 'Kegelapan' }
                          ]
                        }
                      ];

                      const getRpgElementMultiplier = (moveType: string, targetElement: string) => {
                        if (moveType === 'Petir') {
                          if (targetElement === 'Air') return { mult: 1.5, text: isEng ? 'Sangat Efektif! (1.5x)' : 'Sangat Efektif!  (1.5x)' };
                          if (targetElement === 'Tanah') return { mult: 0.5, text: isEng ? 'Kurang Efektif... (0.5x)' : 'Kurang Efektif...  (0.5x)' };
                        }
                        if (moveType === 'Api') {
                          if (targetElement === 'Tanah') return { mult: 1.5, text: isEng ? 'Sangat Efektif! (1.5x)' : 'Sangat Efektif!  (1.5x)' };
                          if (targetElement === 'Air') return { mult: 0.5, text: isEng ? 'Kurang Efektif... (0.5x)' : 'Kurang Efektif...  (0.5x)' };
                        }
                        if (moveType === 'Air') {
                          if (targetElement === 'Api') return { mult: 1.5, text: isEng ? 'Sangat Efektif! (1.5x)' : 'Sangat Efektif!  (1.5x)' };
                          if (targetElement === 'Petir') return { mult: 0.5, text: isEng ? 'Kurang Efektif... (0.5x)' : 'Kurang Efektif...  (0.5x)' };
                        }
                        if (moveType === 'Tanah') {
                          if (targetElement === 'Petir') return { mult: 1.5, text: isEng ? 'Sangat Efektif! (1.5x)' : 'Sangat Efektif!  (1.5x)' };
                          if (targetElement === 'Api') return { mult: 0.5, text: isEng ? 'Kurang Efektif... (0.5x)' : 'Kurang Efektif...  (0.5x)' };
                        }
                        if (moveType === 'Fairy') {
                          if (targetElement === 'Kegelapan') return { mult: 1.5, text: isEng ? 'Sangat Efektif! (1.5x)' : 'Sangat Efektif!  (1.5x)' };
                        }
                        if (moveType === 'Kegelapan') {
                          if (targetElement === 'Fairy') return { mult: 0.5, text: isEng ? 'Kurang Efektif... (0.5x)' : 'Kurang Efektif...  (0.5x)' };
                        }
                        return { mult: 1.0, text: '' };
                      };

                      const executeRpgMove = (move: any) => {
                        if (rpgGameOver || !rpgSelectedUnit || !rpgEnemyUnit) return;

                        const logs = [...rpgLogs];
                        let playerHpNext = rpgPlayerHp;
                        let enemyHpNext = rpgEnemyHp;

                        // 1. Player Turn
                        if (move.category === 'support' || move.category === 'defend') {
                          const healAmt = 40;
                          playerHpNext = Math.min(rpgSelectedUnit.hp, rpgPlayerHp + healAmt);
                          logs.push(` Anda menggunakan "${move.name}"! Memulihkan +${healAmt} HP.`);
                          triggerAudio('move');
                        } else {
                          const multObj = getRpgElementMultiplier(move.type, rpgEnemyUnit.element);
                          const dmg = Math.floor(move.power * multObj.mult);
                          enemyHpNext = Math.max(0, rpgEnemyHp - dmg);
                          const multText = multObj.text ? ` (${multObj.text})` : '';
                          logs.push(`️ Anda melancarkan "${move.name}"! Menghasilkan ${dmg} Damage ke ${rpgEnemyUnit.name}${multText}.`);
                          triggerAudio('move');
                        }

                        // 2. Enemy Turn (only if enemy still alive)
                        if (enemyHpNext > 0) {
                          const enemyMoves = rpgEnemyUnit.moves;
                          const randomMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
                          
                          if (randomMove.power === 0) {
                            const healAmt = 25;
                            enemyHpNext = Math.min(rpgEnemyUnit.hp, enemyHpNext + healAmt);
                            logs.push(` ${rpgEnemyUnit.name} menggunakan "${randomMove.name}"! Memulihkan +${healAmt} HP.`);
                          } else {
                            const multObj = getRpgElementMultiplier(randomMove.type, rpgSelectedUnit.element);
                            const dmg = Math.floor(randomMove.power * multObj.mult);
                            playerHpNext = Math.max(0, playerHpNext - dmg);
                            const multText = multObj.text ? ` (${multObj.text})` : '';
                            logs.push(` ${rpgEnemyUnit.name} membalas dengan "${randomMove.name}"! Menghasilkan ${dmg} Damage ke Anda${multText}.`);
                          }
                        }

                        setRpgPlayerHp(playerHpNext);
                        setRpgEnemyHp(enemyHpNext);

                        if (enemyHpNext <= 0) {
                          setRpgGameOver('win');
                          logs.push(` Kemenangan Luar Biasa! Anda mengalahkan ${rpgEnemyUnit.name}! Misi selesai. Silakan klaim hadiah Anda di bawah.`);
                          triggerAudio('win');
                          // Move status to claimable
                          const stateKey = `admin_event_state_${ev.id}:${username || 'anon'}`;
                          localStorage.setItem(stateKey, 'CLAIMABLE');
                          setEventStates(prev => ({ ...prev, [ev.id]: 'CLAIMABLE' }));
                        } else if (playerHpNext <= 0) {
                          setRpgGameOver('lose');
                          logs.push(` Anda dikalahkan oleh ${rpgEnemyUnit.name}. Klik tombol Reset di bawah untuk mencoba kembali!`);
                          triggerAudio('lose');
                        }

                        setRpgLogs(logs);
                      };

                      return (
                        <div key={ev.id} className="bg-[#1e1c1a]/95 border border-purple-900/40 p-4 rounded-xl flex flex-col justify-between space-y-3.5 hover:border-purple-500/40 transition-all shadow-md relative">
                          <div>
                            <div className="flex items-center justify-between gap-2 border-b border-[#3c3934]/50 pb-2">
                              <span className="text-white text-xs font-black uppercase tracking-tight">
                                {ev.title}
                              </span>
                              {isPast ? (
                                <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap">
                                  {isEng ? "FINISHED" : "SELESAI"}
                                </span>
                              ) : isLive ? (
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider animate-pulse whitespace-nowrap">
                                  {isEng ? "LIVE NOW" : "AKTIF SEKARANG!"}
                                </span>
                              ) : (
                                <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap">
                                  {isEng ? "UPCOMING" : "TERJADWAL"}
                                </span>
                              )}
                            </div>

                            <p className="text-slate-400 text-[10.5px] font-semibold leading-relaxed mt-2">
                              {ev.desc || (isEng ? "No extra description." : "Tidak ada detail ekstra.")}
                            </p>

                            {/* Eligibility Status Cards (Request 5) */}
                            {!isPast && (
                              <div className="mt-2.5 p-2.5 bg-[#252321]/60 border border-[#3c3934]/60 rounded-xl space-y-1.5 text-[10px]">
                                <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[8.5px] flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                                  Verifikasi Syarat Kepesertaan:
                                </div>
                                <div className="space-y-1">
                                  {ev.reqMinRating ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-slate-400">Minimal Rating ELO:</span>
                                      <span className={`font-mono font-bold ${onlineRating >= Number(ev.reqMinRating) ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {ev.reqMinRating} (Anda: {onlineRating}) {onlineRating >= Number(ev.reqMinRating) ? '✓' : ''}
                                      </span>
                                    </div>
                                  ) : null}
                                  {ev.reqMinLevel ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-slate-400">Minimal Level Akun:</span>
                                      <span className={`font-mono font-bold ${userLevel >= Number(ev.reqMinLevel) ? 'text-emerald-400' : 'text-red-400'}`}>
                                        Level {ev.reqMinLevel} (Anda: Lvl {userLevel}) {userLevel >= Number(ev.reqMinLevel) ? '✓' : ''}
                                      </span>
                                    </div>
                                  ) : null}
                                  {ev.reqPremiumOnly ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-slate-400">Status Akun:</span>
                                      <span className={`font-mono font-bold ${membershipStatus === 'premium' ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`}>
                                        {isEng ? 'Premium Exclusive' : 'Wajib Premium'} (Anda: {membershipStatus === 'premium' ? 'Premium' : 'Gratis'}) {membershipStatus === 'premium' ? '✓' : ''}
                                      </span>
                                    </div>
                                  ) : null}

                                  {meetsAllRequirements ? (
                                    <div className="pt-1 text-[8.5px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-center bg-emerald-950/20 py-1 rounded border border-emerald-800/25 mt-1.5">
                                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      Syarat Terpenuhi! Anda Siap Bertanding
                                    </div>
                                  ) : (
                                    <div className="pt-1 text-[8.5px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 justify-center bg-red-950/20 py-1 rounded border border-red-800/25 mt-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                      Syarat Kurang! Akun Belum Memenuhi Kriteria
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pre-register Actions */}
                          {!isPast && !isLive && (
                            <div className="mt-1 pt-2 border-t border-[#3c3934]/60">
                              {preRegStates[ev.id] ? (
                                <span className="w-full text-[10px] text-emerald-400 font-black flex items-center justify-center gap-1 bg-emerald-950/40 border border-emerald-800/60 py-1.5 rounded-lg">
                                  <Check className="w-3.5 h-3.5" />
                                  {isEng ? "PRE-REGISTERED" : "✓ TERDAFTAR AWAL"}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!meetsAllRequirements) {
                                      triggerAudio('error');
                                      triggerReward(0, isEng ? "Your account does not meet the event criteria." : "Maaf, akun Anda tidak memenuhi kriteria untuk mendaftar event ini.", 'info');
                                      return;
                                    }
                                    const preRegKey = `admin_event_prereg_${ev.id}:${username || 'anon'}`;
                                    localStorage.setItem(preRegKey, 'true');
                                    setPreRegStates(prev => ({ ...prev, [ev.id]: true }));
                                    triggerAudio('move');
                                    triggerReward(10, isEng ? "Pre-registered! Gained 10 XP." : "Berhasil mendaftar awal! Mendapat 10 XP.", 'reward');
                                  }}
                                  disabled={!meetsAllRequirements}
                                  className={`w-full py-1.5 px-3 border rounded-lg text-[9px] font-black uppercase transition-all tracking-wider text-center cursor-pointer ${
                                    meetsAllRequirements 
                                      ? 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-800/50 text-blue-300' 
                                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  {isEng ? "REMIND ME / PRE-REGISTER" : "INGATKAN SAYA / DAFTAR AWAL (+10 XP)"}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Live Participation Mission Board (Request 1) */}
                          {isLive && !isPast && (
                            <div className="mt-1 pt-2 border-t border-[#3c3934]/60 space-y-2.5">
                              {/* NOT JOINED YET BUTTON */}
                              {(!eventStates[ev.id] || eventStates[ev.id] === 'NOT_JOINED') && (
                                <button
                                  onClick={() => {
                                    if (!meetsAllRequirements) {
                                      triggerAudio('error');
                                      triggerReward(0, isEng ? "Cannot participate. Your account does not meet requirements." : "Tidak bisa masuk. Akun Anda belum memenuhi syarat kepesertaan event.", 'info');
                                      return;
                                    }
                                    handleJoinEventWithMissions();
                                  }}
                                  disabled={!meetsAllRequirements}
                                  className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider text-center shadow-md ${
                                    meetsAllRequirements 
                                      ? 'bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 border border-purple-500/30 text-white animate-pulse cursor-pointer' 
                                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                  }`}
                                >
                                  {isEng ? "JOIN EVENT & PLAY MISSION" : "IKUTI EVENT & MULAI MISI"}
                                </button>
                              )}

                              {/* ACTIVE EVENT MISSION PANEL (Request 1) */}
                              {eventStates[ev.id] === 'JOINED' && (
                                <div className="bg-[#24211f] border border-purple-900/35 rounded-xl p-3 space-y-3">
                                  {/* Mission Selector Tabs */}
                                  <div className="flex items-center justify-between gap-1 bg-black/45 p-1 rounded-lg border border-[#3c3934]">
                                    <button
                                      type="button"
                                      onClick={() => { setActiveMissionType('tactics'); triggerAudio('move'); }}
                                      className={`flex-1 py-1 text-[9px] font-black uppercase rounded-md transition-colors cursor-pointer ${
                                        activeMissionType === 'tactics' 
                                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' 
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {isEng ? "Speed Tactics" : "Taktik Cepat"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setActiveMissionType('rpg'); triggerAudio('move'); }}
                                      className={`flex-1 py-1 text-[9px] font-black uppercase rounded-md transition-colors cursor-pointer ${
                                        activeMissionType === 'rpg' 
                                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' 
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {isEng ? "RPG Duel Bot" : "RPG Duel Bot"}
                                    </button>
                                  </div>

                                  {/* GAME 1: CHESS TACTICS ARENA */}
                                  {activeMissionType === 'tactics' && (
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between bg-[#121110] p-2 rounded-lg border border-[#3c3934]/60">
                                        <span className="text-[8.5px] font-black text-amber-400">
                                          {isEng ? "LIGHTNING TACTICS ARENA" : "ARENA TAKTIK KILAT"}
                                        </span>
                                        <span className="text-[8px] font-mono text-slate-400">Score: {tacticSolvedCount} / {tacticQuestions.length}</span>
                                      </div>

                                      {tacticQuestions[currentTacticIndex] ? (
                                        <div className="space-y-2.5 bg-[#171514] p-3 rounded-xl border border-[#3c3934]/50">
                                          <p className="text-[10px] font-bold text-slate-200 leading-relaxed">
                                            <span className="text-purple-400 font-extrabold mr-1">Tantangan {currentTacticIndex + 1}:</span>
                                            {tacticQuestions[currentTacticIndex].q}
                                          </p>

                                          <div className="space-y-1.5 pt-1">
                                            {tacticQuestions[currentTacticIndex].opts.map((opt: string, optIdx: number) => {
                                              const isSel = selectedTacticAnswer === optIdx;
                                              const isRight = optIdx === tacticQuestions[currentTacticIndex].ans;
                                              let optStyle = "bg-[#22201e] border-[#3c3934] text-slate-300 hover:bg-[#2b2826]";

                                              if (selectedTacticAnswer !== null) {
                                                if (isRight) {
                                                  optStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-300";
                                                } else if (isSel) {
                                                  optStyle = "bg-red-950/50 border-red-500 text-red-300";
                                                } else {
                                                  optStyle = "bg-[#22201e]/30 border-transparent text-slate-500 pointer-events-none";
                                                }
                                              }

                                              return (
                                                <button
                                                  key={optIdx}
                                                  disabled={selectedTacticAnswer !== null}
                                                  onClick={() => {
                                                    setSelectedTacticAnswer(optIdx);
                                                    if (optIdx === tacticQuestions[currentTacticIndex].ans) {
                                                      setTacticFeedback('correct');
                                                      setTacticSolvedCount(p => p + 1);
                                                      triggerAudio('win');
                                                    } else {
                                                      setTacticFeedback('incorrect');
                                                      triggerAudio('error');
                                                    }
                                                  }}
                                                  className={`w-full text-left p-2.5 text-[9.5px] rounded-xl border transition-all text-xs font-bold cursor-pointer ${optStyle}`}
                                                >
                                                  {optIdx + 1}. {opt}
                                                </button>
                                              );
                                            })}
                                          </div>

                                          {selectedTacticAnswer !== null && (
                                            <div className="bg-black/30 p-2.5 rounded-lg border border-[#3c3934]/40 space-y-1.5 mt-2">
                                              <p className={`text-[8.5px] font-black uppercase ${tacticFeedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {tacticFeedback === 'correct' 
                                                  ? (isEng ? 'Excellent! Correct Answer' : 'Benar Sekali!') 
                                                  : (isEng ? 'Lacks Accuracy' : 'Langkah Kurang Akurat:')}
                                              </p>
                                              <p className="text-[8.5px] font-semibold text-slate-400 leading-normal">
                                                {tacticQuestions[currentTacticIndex].exp}
                                              </p>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedTacticAnswer(null);
                                                  setTacticFeedback(null);

                                                  if (currentTacticIndex < tacticQuestions.length - 1) {
                                                    setCurrentTacticIndex(p => p + 1);
                                                  } else {
                                                    // Final evaluate
                                                    const targetRequired = Math.max(3, Math.ceil(tacticQuestions.length * 0.5));
                                                    if (tacticSolvedCount >= targetRequired) {
                                                      triggerAudio('win');
                                                      const stateKey = `admin_event_state_${ev.id}:${username || 'anon'}`;
                                                      localStorage.setItem(stateKey, 'CLAIMABLE');
                                                      setEventStates(prev => ({ ...prev, [ev.id]: 'CLAIMABLE' }));
                                                      triggerReward(100, isEng ? "Excellent! You completed the tactics challenge." : "Luar biasa! Misi taktik catur berhasil diselesaikan.", "reward");
                                                    } else {
                                                      // Fail, retry
                                                      triggerAudio('error');
                                                      triggerReward(0, isEng ? `You solved less than ${targetRequired} questions. Retrying!` : `Anda hanya menjawab benar kurang dari ${targetRequired} soal. Silakan coba kembali!`, 'info');
                                                      handleJoinEventWithMissions(); // regenerates
                                                    }
                                                  }
                                                }}
                                                className="w-full mt-1.5 py-1.5 bg-[#2a2826] hover:bg-[#343230] text-[8.5px] font-black uppercase text-white rounded-md border border-[#3c3934] transition-colors"
                                              >
                                                {currentTacticIndex < tacticQuestions.length - 1 
                                                  ? (isEng ? "Next Challenge" : "Tantangan Berikutnya") 
                                                  : (isEng ? "Complete and Evaluate" : "Selesaikan & Evaluasi")}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="p-4 text-center text-slate-500 text-[10px] font-bold">
                                          Memuat pertanyaan taktik...
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* GAME 2: RPG DUEL VS GRANDMASTER BOT */}
                                  {activeMissionType === 'rpg' && (
                                    <div className="space-y-3.5">
                                      {!rpgSelectedUnit ? (
                                        <div className="space-y-2.5 p-2 bg-black/25 rounded-xl border border-zinc-800">
                                          <div className="text-[10px] font-black text-center text-purple-300 uppercase tracking-wider py-1">
                                            PILIH BIDAK POKÉMON ANDA
                                          </div>
                                          <div className="grid grid-cols-3 gap-1.5">
                                            {RPG_PLAYER_TEMPLATES.map((tpl) => (
                                              <button
                                                key={tpl.name}
                                                type="button"
                                                onClick={() => {
                                                  const randEnemy = RPG_ENEMY_TEMPLATES[Math.floor(Math.random() * RPG_ENEMY_TEMPLATES.length)];
                                                  setRpgSelectedUnit(tpl);
                                                  setRpgEnemyUnit(randEnemy);
                                                  setRpgPlayerHp(tpl.hp);
                                                  setRpgEnemyHp(randEnemy.hp);
                                                  setRpgLogs([
                                                    `️ Duel dimulai! Anda memilih ${tpl.name} (${tpl.element}) untuk melawan ${randEnemy.name} (${randEnemy.element}).`
                                                  ]);
                                                  triggerAudio('move');
                                                }}
                                                className="bg-[#24211f] hover:bg-purple-900/40 border border-purple-900/30 p-2 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-between space-y-1 hover:scale-[1.03]"
                                              >
                                                <span className="text-xl">{tpl.symbol}</span>
                                                <span className="text-[8.5px] font-black text-slate-200 block">{tpl.name}</span>
                                                <span className="text-[6.5px] font-extrabold text-purple-400 px-1 py-0.5 bg-purple-950/40 rounded border border-purple-900/40 uppercase mt-1">{tpl.element}</span>
                                                <span className="text-[7.5px] text-slate-400 font-bold block mt-1">{tpl.hp} HP</span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="grid grid-cols-2 gap-2 bg-[#121110] p-2.5 rounded-xl border border-purple-950/40 text-[9px] font-mono select-none">
                                            {/* PLAYER UNIT PANEL */}
                                            <div className="bg-[#181615] p-2 rounded-lg border border-purple-500/10 flex flex-col justify-between space-y-1.5 min-w-0">
                                              <div className="flex flex-col min-w-0">
                                                <span className="text-blue-400 font-black text-[9.5px] tracking-tight truncate flex items-center gap-1">
                                                  <span className="text-xs shrink-0">{rpgSelectedUnit.symbol}</span>
                                                  <span className="truncate">{rpgSelectedUnit.name}</span>
                                                </span>
                                                <span className="text-[6.5px] text-purple-400 font-extrabold uppercase mt-1 tracking-wider bg-purple-950/40 border border-purple-900/40 px-1 py-0.5 rounded self-start shrink-0">
                                                   {rpgSelectedUnit.element}
                                                </span>
                                              </div>
                                              
                                              <div className="space-y-1 mt-1.5">
                                                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                  <div 
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" 
                                                    style={{ width: `${Math.max(0, Math.min(100, (rpgPlayerHp / rpgSelectedUnit.hp) * 100))}%` }}
                                                  />
                                                </div>
                                                <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-bold px-0.5">
                                                  <span>HP</span>
                                                  <span className="text-slate-200 font-extrabold font-mono">{rpgPlayerHp}/{rpgSelectedUnit.hp}</span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* ENEMY UNIT PANEL */}
                                            <div className="bg-[#181615] p-2 rounded-lg border border-red-500/10 flex flex-col justify-between space-y-1.5 min-w-0">
                                              <div className="flex flex-col items-end min-w-0">
                                                <span className="text-red-400 font-black text-[9.5px] tracking-tight truncate flex items-center gap-1 flex-row-reverse w-full text-right">
                                                  <span className="text-xs shrink-0">{rpgEnemyUnit.symbol}</span>
                                                  <span className="truncate">{rpgEnemyUnit.name}</span>
                                                </span>
                                                <span className="text-[6.5px] text-red-400 font-extrabold uppercase mt-1 tracking-wider bg-red-950/40 border border-red-900/40 px-1 py-0.5 rounded self-end shrink-0">
                                                   {rpgEnemyUnit.element}
                                                </span>
                                              </div>
                                              
                                              <div className="space-y-1 mt-1.5">
                                                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                  <div 
                                                    className="bg-gradient-to-r from-red-500 to-rose-400 h-full transition-all duration-300" 
                                                    style={{ width: `${Math.max(0, Math.min(100, (rpgEnemyHp / rpgEnemyUnit.hp) * 100))}%` }}
                                                  />
                                                </div>
                                                <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-bold px-0.5 flex-row-reverse">
                                                  <span>HP</span>
                                                  <span className="text-slate-200 font-extrabold font-mono">{rpgEnemyHp}/{rpgEnemyUnit.hp}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Logs list */}
                                          <div className="bg-[#121110] rounded-xl p-2.5 border border-zinc-800/80 h-28 overflow-y-auto space-y-1.5 text-[8.5px] font-medium leading-relaxed font-mono text-slate-300 pr-1.5 select-none scrollbar-thin">
                                            {rpgLogs.map((log, lIdx) => (
                                              <div key={lIdx} className="border-b border-zinc-900/50 pb-1 last:border-0">{log}</div>
                                            ))}
                                            <div ref={rpgLogsEndRef} />
                                          </div>

                                          {!rpgGameOver ? (
                                            <div className="grid grid-cols-2 gap-1.5">
                                              {rpgSelectedUnit.moves.map((move: any) => (
                                                <button
                                                  key={move.name}
                                                  type="button"
                                                  onClick={() => executeRpgMove(move)}
                                                  className="p-1.5 bg-[#24211f] hover:bg-purple-900/30 border border-purple-900/30 text-slate-200 text-[8px] font-extrabold uppercase rounded-lg transition-colors cursor-pointer text-left"
                                                >
                                                  <div className="flex justify-between items-center">
                                                    <span className="text-purple-300 font-black truncate">{move.name}</span>
                                                    <span className="text-[6.5px] text-slate-400 font-bold shrink-0">{move.type}</span>
                                                  </div>
                                                  <p className="text-[6px] text-slate-400 font-normal mt-0.5 leading-snug line-clamp-1">{move.desc}</p>
                                                  <span className="block text-[6.5px] font-semibold text-emerald-400 mt-0.5">
                                                    {move.power > 0 ? `Dmg: ${move.power}` : "Heal: +40 HP"}
                                                  </span>
                                                </button>
                                              ))}
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleJoinEventWithMissions()}
                                              className="w-full py-2 bg-[#2a2826] hover:bg-[#343230] text-[9px] font-black uppercase text-white border border-[#3c3934] rounded-xl transition-colors cursor-pointer"
                                            >
                                               Reset Ulang Duel RPG
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* CLAIMABLE EVENT STATE (Request 4) */}
                              {eventStates[ev.id] === 'CLAIMABLE' && (
                                <button
                                  onClick={async () => {
                                    triggerAudio('win');

                                    // 1. Get accurate rewards directly from moderator console properties (Request 4)
                                    const rewardXp = ev.xpReward !== undefined ? Number(ev.xpReward) : 100;
                                    const rewardCoins = ev.coinsReward !== undefined ? Number(ev.coinsReward) : 500;
                                    const rewardDiamonds = ev.diamondsReward !== undefined ? Number(ev.diamondsReward) : 0;
                                    const rawItem = ev.itemReward ? ev.itemReward.trim() : "";

                                    // Disburse numerical awards immediately
                                    if (rewardCoins > 0) setCoins(p => p + rewardCoins);
                                    if (rewardDiamonds > 0) {
                                      (window as any).__bypassSavingsRedirect = true;
                                      setDiamonds(p => p + rewardDiamonds, true);
                                      (window as any).__bypassSavingsRedirect = false;
                                    }

                                    // 2. Add inventory item & handle cosmetic unlock registration (Request 3)
                                    let unlockedItemsUpdated = [...(unlockedItems || [])];
                                    let updatedFrames = [...unlockedFrames];
                                    if (rawItem) {
                                      const isFrame = rawItem.toLowerCase().includes("bingkai") || rawItem.toLowerCase().includes("frame");
                                      const isSkin = rawItem.toLowerCase().includes("skin") || rawItem.toLowerCase().includes("bidak");

                                      if (isFrame) {
                                        // Match border ID and add to profile inventory list
                                        const borderId = rawItem.toLowerCase().includes("kubah") || rawItem.toLowerCase().includes("emerald") ? "embed_emerald"
                                                       : rawItem.toLowerCase().includes("ketupat") ? "golden_ketupat"
                                                       : rawItem.toLowerCase().includes("lentera") || rawItem.toLowerCase().includes("lampion") ? "red_lantern"
                                                       : rawItem.toLowerCase().includes("ombak") || rawItem.toLowerCase().includes("pantai") ? "beach_wave"
                                                       : rawItem.toLowerCase().includes("blizzard") || rawItem.toLowerCase().includes("salju") ? "blizzard_winter"
                                                       : "golden_ketupat";

                                        if (!unlockedFrames.includes(borderId)) {
                                          setUnlockedFrames(prev => [...prev, borderId]);
                                          updatedFrames.push(borderId);
                                        }
                                      } else if (isSkin) {
                                        // Match piece skin ID and add to profile inventory list
                                        const skinId = rawItem.toLowerCase().includes("emerald") || rawItem.toLowerCase().includes("kayu") ? "emerald_wood"
                                                     : rawItem.toLowerCase().includes("ketupat") ? "golden_ketupat_skin"
                                                     : rawItem.toLowerCase().includes("naga") || rawItem.toLowerCase().includes("lentera") || rawItem.toLowerCase().includes("merah") ? "red_dragon_skin"
                                                     : rawItem.toLowerCase().includes("pantai") || rawItem.toLowerCase().includes("mentari") ? "beach_sun_skin"
                                                     : rawItem.toLowerCase().includes("blizzard") || rawItem.toLowerCase().includes("winter") ? "blizzard_wood"
                                                     : "emerald_wood";

                                        if (!unlockedSkins.includes(skinId)) {
                                          setUnlockedSkins(prev => [...prev, skinId]);
                                        }
                                      } else {
                                        // Treat as custom earned Title
                                        if (!unlockedTitles.includes(rawItem)) {
                                          setUnlockedTitles(prev => [...prev, rawItem]);
                                        }
                                      }

                                      let finalItemToPush = rawItem;
                                      if (isFrame) {
                                        const borderId = rawItem.toLowerCase().includes("kubah") || rawItem.toLowerCase().includes("emerald") ? "embed_emerald"
                                                       : rawItem.toLowerCase().includes("ketupat") ? "golden_ketupat"
                                                       : rawItem.toLowerCase().includes("lentera") || rawItem.toLowerCase().includes("lampion") ? "red_lantern"
                                                       : rawItem.toLowerCase().includes("ombak") || rawItem.toLowerCase().includes("pantai") ? "beach_wave"
                                                       : rawItem.toLowerCase().includes("blizzard") || rawItem.toLowerCase().includes("salju") ? "blizzard_winter"
                                                       : "golden_ketupat";
                                        finalItemToPush = borderId;
                                      } else if (isSkin) {
                                        const skinId = rawItem.toLowerCase().includes("emerald") || rawItem.toLowerCase().includes("kayu") ? "emerald_wood"
                                                     : rawItem.toLowerCase().includes("ketupat") ? "golden_ketupat_skin"
                                                     : rawItem.toLowerCase().includes("naga") || rawItem.toLowerCase().includes("lentera") || rawItem.toLowerCase().includes("merah") ? "red_dragon_skin"
                                                     : rawItem.toLowerCase().includes("pantai") || rawItem.toLowerCase().includes("mentari") ? "beach_sun_skin"
                                                     : rawItem.toLowerCase().includes("blizzard") || rawItem.toLowerCase().includes("winter") ? "blizzard_wood"
                                                     : "emerald_wood";
                                        finalItemToPush = skinId;
                                      }

                                      // Append to raw independent items array too
                                      if (!unlockedItemsUpdated.includes(finalItemToPush)) {
                                        unlockedItemsUpdated.push(finalItemToPush);
                                      }
                                      if (setUnlockedItems) {
                                        setUnlockedItems(unlockedItemsUpdated);
                                      }
                                    }

                                    // Mark event as claimed
                                    const stateKey = `admin_event_state_${ev.id}:${username || 'anon'}`;
                                    localStorage.setItem(stateKey, 'CLAIMED');
                                    setEventStates(prev => ({ ...prev, [ev.id]: 'CLAIMED' }));

                                    triggerReward(rewardXp, isEng 
                                      ? `Successfully claimed: +${rewardCoins} Coins, +${rewardDiamonds} Diamonds, +${rewardXp} XP ${rawItem ? `& ${rawItem}` : ''}`
                                      : `Klaim sukses: +${rewardCoins} Koin, +${rewardDiamonds} Diamond, +${rewardXp} XP ${rawItem ? `& ${rawItem}` : ''}`, 
                                      'reward',
                                      rewardCoins,
                                      rewardDiamonds
                                    );

                                    const finalCoins = coins + rewardCoins;
                                    const finalDiamonds = diamonds + rewardDiamonds;

                                    // Synchronize to Firestore database
                                    if (syncUserStats) {
                                      try {
                                        await syncUserStats(
                                          undefined,
                                          xp + rewardXp,
                                          undefined,
                                          undefined,
                                          undefined,
                                          undefined,
                                          undefined,
                                          undefined,
                                          unlockedItemsUpdated,
                                          updatedFrames,
                                          finalCoins,
                                          finalDiamonds
                                        );
                                      } catch (syncErr) {
                                        console.warn("Failed to sync stats to Firestore:", syncErr);
                                      }
                                    }
                                  }}
                                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 border border-yellow-300/40 rounded-xl text-zinc-950 text-[10px] font-black uppercase transition-all tracking-wider text-center shadow-lg animate-bounce cursor-pointer"
                                >
                                  {isEng ? "CLAIM EVENT PRIZE!" : "KLAIM HADIAH EVENT SEKARANG!"}
                                </button>
                              )}

                              {/* CLAIMED EVENT STATE */}
                              {eventStates[ev.id] === 'CLAIMED' && (
                                <div className="space-y-1.5">
                                  <div className="w-full py-1.5 px-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-400 text-[9px] font-black uppercase text-center flex items-center justify-center gap-1 select-none">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    {isEng ? "PRIZE CLAIMED" : "HADIAH BERHASIL DIKLAIM"}
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      triggerAudio('move');
                                      const tabButton = document.getElementById('profile');
                                      if (tabButton) {
                                        tabButton.click();
                                      }
                                    }}
                                    className="w-full py-1 px-2 bg-zinc-800/80 hover:bg-zinc-700/90 border border-zinc-700/40 rounded-lg text-slate-300 text-[8px] font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <span> {isEng ? "VIEW IN INVENTORY" : "LIHAT DI INVENTORI"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="border-t border-[#3c3934]/40 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[8.5px] font-bold uppercase text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              {ev.date} @ {ev.time}
                            </span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              {isEng ? "Prize:" : "Hadiah:"} <span className="font-extrabold">{ev.prize || `${ev.coinsReward} Koin + ${ev.diamondsReward} Dia`}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredEvents.length > 0 && activeEvent ? (
                <>
                  {/* Event selectors (only show if multiple active in simulated month) */}
                  {filteredEvents.length > 1 && (
                    <div className="flex gap-2 p-1 bg-[#22201e] rounded-xl border border-[#3c3934]">
                      {filteredEvents.map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => { 
                            setSelectedEventId(ev.id); 
                            setCurrentQuizIndex(0); 
                            setSelectedQuizAnswer(null); 
                            setQuizFeedback(null); 
                            triggerAudio('move'); 
                          }}
                          className={`flex-1 py-2 px-3 text-[11px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                            selectedEventId === ev.id 
                              ? 'bg-[#81b64c] text-[#1c1a19] border-[#81b64c] font-black' 
                              : 'bg-[#2a2826] text-slate-400 border-transparent hover:text-white'
                          }`}
                        >
                          {ev.name.replace(' Festival', '').replace(' Clash', '')}
                        </button>
                      ))}
                    </div>
                  )}

              {/* Event Hero Box */}
              <div className={`p-5 rounded-2xl bg-gradient-to-br ${activeEvent.bgGradient} border border-[#444] shadow-lg text-left`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase rounded-full bg-slate-900 border border-slate-700/60 shadow-inner ${activeEvent.badgeTextColor}`}>
                      <Calendar className="w-3 h-3" />
                      Musim Aktif: Limited Time
                    </span>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
                      {activeEvent.name}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium max-w-lg mt-1 leading-relaxed">
                      {activeEvent.tagline}
                    </p>
                  </div>

                  {/* Seasonal Meter (Milestone Progress Bar) */}
                  <div className="bg-black/50 p-4 rounded-xl border border-[#3c3934] shrink-0 text-center md:w-56">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase mb-1">
                      <span>{isEng ? 'Event Meter' : 'Meter Event'}</span>
                      <span className="text-[#81b64c]">{eventScore} {isEng ? 'Points' : 'Poin'}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-3 bg-[#2a2826] rounded-full overflow-hidden p-0.5 border border-[#3c3934]">
                      <div 
                        style={{ width: `${Math.min(100, (eventScore / 120) * 100)}%` }} 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#81b64c] rounded-full transition-all duration-500" 
                      />
                    </div>
                    {/* Milestone labels */}
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                      <span>0</span>
                      <span>Milestone I (40)</span>
                      <span>Target (120)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quests list & Quizzes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                {/* Event Quests */}
                <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono pb-2 border-b border-[#3c3934]">
                    <Sparkles className="w-4 h-4 text-[#81b64c]" />
                    {isEng ? 'Weekly Event Quests' : 'Misi Mingguan Event'}
                  </h3>
                  <div className="space-y-3">
                    {activeEvent.quests.map(quest => {
                      const isCompleted = completedQuestIds.includes(quest.id);
                      return (
                        <div 
                          key={quest.id} 
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                            isCompleted ? 'bg-black/30 border-[#81b64c]/20 opacity-65' : 'bg-[#22201e] border-[#3c3934]'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200">{quest.desc}</p>
                            <p className="text-[10px] text-amber-500 font-semibold mt-0.5 uppercase flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              {isEng ? `Reward: +${quest.reward} Ticket Points` : `Hadiah: +${quest.reward} Poin Tiket`}
                            </p>
                          </div>
                          {!isCompleted ? (
                            <button
                              onClick={() => completeQuest(quest.id, quest.reward)}
                              className="px-3 py-1.5 bg-[#81b64c] hover:bg-[#94d156] text-[#1c1a19] text-[10px] font-black uppercase rounded-lg cursor-pointer transition-colors shrink-2"
                            >
                              Selesaikan
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#81b64c]/10 flex items-center justify-center border border-[#81b64c]/30">
                              <Check className="w-4 h-4 text-[#81b64c]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Event Fasting Quizzes */}
                <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono pb-2 border-b border-[#3c3934]">
                    <Award className="w-4 h-4 text-[#81b64c]" />
                    {isEng ? 'Seasonal Quiz Challenge' : 'Tantangan Kuis Musiman'}
                  </h3>
                  
                  {activeEvent.quiz[currentQuizIndex] ? (
                    <div className="space-y-3">
                      {/* Interactive Quiz Question Navigator */}
                      <div className="flex items-center justify-between gap-2 bg-[#22201e]/60 p-2 rounded-xl border border-[#3c3934]/60">
                        <button
                          type="button"
                          disabled={currentQuizIndex === 0}
                          onClick={() => {
                            setCurrentQuizIndex(p => Math.max(0, p - 1));
                            setSelectedQuizAnswer(null);
                            setQuizFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-[#2a2826] hover:bg-[#343230] border border-[#3c3934] rounded-lg text-[9px] font-black uppercase text-slate-300 hover:text-white cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          &larr; Prev
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase font-mono">
                          Soal {currentQuizIndex + 1} dari {activeEvent.quiz.length}
                        </span>
                        <button
                          type="button"
                          disabled={currentQuizIndex === activeEvent.quiz.length - 1}
                          onClick={() => {
                            setCurrentQuizIndex(p => Math.min(activeEvent.quiz.length - 1, p + 1));
                            setSelectedQuizAnswer(null);
                            setQuizFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-[#2a2826] hover:bg-[#343230] border border-[#3c3934] rounded-lg text-[9px] font-black uppercase text-slate-300 hover:text-white cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          Next &rarr;
                        </button>
                      </div>

                      <div className="bg-[#22201e] p-3 rounded-xl border border-[#3c3934]">
                        <p className="text-xs font-semibold leading-relaxed text-slate-200">
                          {activeEvent.quiz[currentQuizIndex].question}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {activeEvent.quiz[currentQuizIndex].options.map((opt, oIdx) => {
                          const isSelected = selectedQuizAnswer === oIdx;
                          const isCorrect = oIdx === activeEvent.quiz[currentQuizIndex].answerIdx;
                          let btnStyle = "bg-[#22201e] border-[#3c3934] text-slate-200 hover:bg-black/30";
                          
                          if (selectedQuizAnswer !== null) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-900/40 border-emerald-500 text-emerald-300";
                            } else if (isSelected) {
                              btnStyle = "bg-red-950/40 border-red-500 text-red-300";
                            } else {
                              btnStyle = "bg-[#22201e]/50 border-transparent text-slate-500 pointer-events-none";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={selectedQuizAnswer !== null}
                              onClick={() => handleQuizAnswerSubmit(oIdx)}
                              className={`w-full text-left p-3 text-xs rounded-xl border transition-all cursor-pointer flex justify-between items-center ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {selectedQuizAnswer !== null && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quiz Feedback explanation */}
                      {selectedQuizAnswer !== null && (
                        <div className="p-3 bg-black/40 border border-[#3c3934]/60 rounded-xl space-y-2">
                          <p className={`text-[10px] font-black uppercase ${quizFeedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {quizFeedback === 'correct' 
                              ? (isEng ? 'Correct!' : 'Benar sekali!') 
                              : (isEng ? 'Incorrect. Here is the explanation:' : 'Salah. Ini penjelasan terbaik:')}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                            {activeEvent.quiz[currentQuizIndex].explanation}
                          </p>
                          <button
                            onClick={nextQuizItem}
                            className="mt-2 w-full py-2 bg-[#2a2826] hover:bg-[#343230] text-[10px] font-black uppercase text-white rounded-lg transition-colors border border-[#3c3934]"
                          >
                            {isEng ? 'Next Challenge' : 'Tantangan Berikutnya'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs font-bold">
                      {isEng ? 'All quizzes completed!' : 'Kuis telah diselesaikan semua!'}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Exchange Shop */}
              <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl text-left space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono pb-2 border-b border-[#3c3934]">
                  <ShoppingBag className="w-4 h-4 text-[#81b64c]" />
                  {isEng ? 'Limited-Time Event Shop' : 'Toko Penukaran Event Terbatas'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeEvent.rewards.map(item => {
                    let hasUnlocked = false;
                    if (item.type === 'title') hasUnlocked = unlockedTitles.includes(item.assetId);
                    else if (item.type === 'frame') hasUnlocked = unlockedFrames.includes(item.assetId);
                    else if (item.type === 'skin') hasUnlocked = unlockedSkins.includes(item.assetId);

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 bg-[#22201e] border rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden ${
                          hasUnlocked ? 'border-[#81b64c]/20 bg-[#22201e]/30' : 'border-[#3c3934]'
                        }`}
                      >
                        {/* Special rarity tag */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-950/70 border border-purple-500/40 rounded text-[8px] font-black text-purple-400 uppercase tracking-widest">
                          Special
                        </div>

                        <div>
                          <p className="text-xs font-black text-white leading-tight pr-10">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">
                            {isEng ? 'Type' : 'Tipe'}: <span className="text-slate-200">{item.type}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#3c3934]/60">
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold">
                            <Coins className="w-4 h-4 animate-pulse" />
                            <span>{item.cost} {isEng ? 'Tickets' : 'Tiket'}</span>
                          </div>

                          <button
                            disabled={hasUnlocked}
                            onClick={() => buyEventReward(item)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg cursor-pointer ${
                              hasUnlocked 
                                ? 'bg-black/40 text-[#81b64c]/55 border border-[#81b64c]/10' 
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                            }`}
                          >
                            {hasUnlocked ? (isEng ? 'Owned' : 'Dimiliki') : (isEng ? 'Exchange' : 'Tukarkan')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                </>
              ) : (
                <div className="p-10 bg-[#1c1a19] border border-[#3c3934] rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/30 text-amber-500">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{isEng ? 'No Active Seasonal Events' : 'Tidak Ada Event Musiman Aktif'}</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-semibold leading-relaxed">
                    {isEng 
                      ? 'There are currently no official seasonal festivals active in the selected month. Please use the calendar simulation panel above to switch to Ramadan, Lunar, Summer, or Christmas!' 
                      : 'Sedang tidak ada festival musiman resmi yang aktif di bulan terpilih. Silakan gunakan panel simulasi kalender di atas untuk berpindah ke bulan Ramadan, Lunar, Summer, atau Christmas!'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: TITLES & EFFECT CUSTOMIZATION */}
          {activeTab === 'customization' && (
            <motion.div
              key="customization-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              {/* Hide Title Equip and Checkmate FX blocks per user request */}
              {false && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature 51: Gelar / Title Equip */}
                <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Award className="w-4 h-4 text-[#81b64c]" />
                      {isEng ? "Equip Title" : "Gelar Pasang"}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {isEng 
                        ? "Equip an honorable title below your profile name earned from glorious achievements or seasonal events." 
                        : "Sematkan gelar kehormatan maut di bawah nama profil Anda yang diperoleh dari pencapaian gemilang atau partisipasi event."}
                    </p>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {unlockedTitles.length > 0 ? (
                      unlockedTitles.map(title => {
                        const isActive = equippedTitle === title;
                        return (
                          <div 
                            key={title}
                            onClick={() => { setEquippedTitle(isActive ? '' : title); triggerAudio('move'); }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isActive 
                                ? 'bg-[#81b64c]/10 border-[#81b64c] text-white' 
                                : 'bg-[#22201e] border-[#3c3934] hover:bg-[#2c2927] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black font-mono tracking-wide">
                                {isEng ? `Title: ${translateTitle(title)}` : `Gelar: ${title}`}
                              </span>
                            </div>
                            {isActive ? (
                              <span className="text-[9px] font-black uppercase text-[#81b64c] bg-[#81b64c]/10 px-2 py-0.5 rounded border border-[#81b64c]/20">
                                {isEng ? "Active" : "Aktif"}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold uppercase hover:text-white">
                                {isEng ? "Equip" : "Pasang"}
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 font-bold p-3 text-center">
                        {isEng ? "Unlock achievements to earn your first custom title!" : "Buka achievement untuk memperoleh gelar perdana!"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Feature 54: Efek Skakmat Custom */}
                <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Sparkles className="w-4 h-4 text-[#81b64c]" />
                      Efek Skakmat Spesial (Checkmate FX)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Picu badai partikel visual mendebarkan di papan catur ketika Anda berhasil memasung raja seteru!
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'none', flag: 'none', label: 'Biasa (Standard Chess)', desc: 'Gaya red banner minimalis tanpa embel-embel.', rarity: 'Free' },
                      { id: 'dragon_flare', flag: 'dragon_flare', label: 'Naga Merapi (Fire Flare)', desc: 'Semburan kobar naga menyala penuh bunga bara magmatik merah crimson.', rarity: 'Special' },
                      { id: 'cosmic_nebula', flag: 'cosmic_nebula', label: 'Supernova Kosmik (Galaxy)', desc: 'Rasi galaksi berputar menghempaskan awan nebula konstelasi ungu.', rarity: 'Legendary' },
                      { id: 'lightning_strike', flag: 'lightning_strike', label: 'Halilintar Petir (雷击/Lightning)', desc: 'Sengatan arus bermuatan listrik biru neon meretakkan sekeliling kotak.', rarity: 'Epic' },
                      { id: 'cyber_glitch', flag: 'cyber_glitch', label: 'Cyber Glitch Matrix (Glitch FX)', desc: 'Anomali pemindaian glitch kehijauan khas konsol retro teror.', rarity: 'Epic' }
                    ].map(fx => {
                      const isActive = equippedCheckmateEffect === fx.id;
                      const hasPurchased = unlockedCheckmateEffects.includes(fx.id);

                      return (
                        <div 
                          key={fx.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                            isActive ? 'bg-purple-950/20 border-purple-500' : 'bg-[#22201e] border-[#3c3934]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white uppercase font-mono">{fx.label}</span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                              fx.rarity === 'Legendary' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              fx.rarity === 'Special' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              fx.rarity === 'Epic' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {fx.rarity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 leading-normal">{fx.desc}</p>
                          
                          <div className="mt-2.5 pt-2 border-t border-[#3c3934]/60 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 w-full">
                              {hasPurchased || fx.id === 'none' ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => { setEquippedCheckmateEffect(fx.id); triggerAudio('move'); }}
                                    className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wide cursor-pointer ${
                                      isActive ? 'bg-purple-600 text-white' : 'bg-[#1c1a19] text-slate-300 hover:bg-black/30'
                                    }`}
                                  >
                                    {isActive ? 'Equipped' : 'Pasang'}
                                  </button>
                                  {fx.id !== 'none' && (
                                    <button
                                      onClick={() => {
                                        setPreviewFx(previewFx === fx.id ? null : fx.id);
                                        triggerAudio('win');
                                      }}
                                      className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                                        previewFx === fx.id ? 'bg-emerald-600 text-white' : 'bg-[#2e2b28] text-emerald-400 hover:bg-[#34302c]'
                                      }`}
                                    >
                                      {previewFx === fx.id ? 'Menutup...' : 'Uji Coba FX'}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      // Simply unlock if has diamonds
                                      if (diamonds >= 15) {
                                        setDiamonds(prev => prev - 15);
                                        setUnlockedCheckmateEffects(prev => [...prev, fx.id]);
                                        setEquippedCheckmateEffect(fx.id);
                                        triggerAudio('win');
                                        triggerReward(10, `Berhasil membuka ${fx.label}!`, 'reward');
                                      } else {
                                        triggerAudio('error');
                                        triggerReward(0, 'Diamond tidak cukup! Harganya 15 Diamond.', 'info');
                                      }
                                    }}
                                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase rounded flex items-center gap-1 cursor-pointer"
                                  >
                                    <Gem className="w-3 h-3 text-black" />
                                    Buka: 15 Diamond
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPreviewFx(previewFx === fx.id ? null : fx.id);
                                      triggerAudio('win');
                                    }}
                                    className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                                      previewFx === fx.id ? 'bg-emerald-600 text-white' : 'bg-[#2e2b28] text-emerald-400 hover:bg-[#34302c]'
                                    }`}
                                  >
                                    Uji Coba
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Live Interactive 8x8 Chessboard Simulation Preview component */}
                            <AnimatePresence>
                              {previewFx === fx.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 bg-[#110f0e] border border-slate-700/40 rounded-xl p-3 relative overflow-hidden flex flex-col items-center justify-center"
                                >
                                  {/* Simulated Mini Grid */}
                                  <div className="w-[130px] h-[130px] grid grid-cols-8 grid-rows-8 border border-slate-800 rounded-lg overflow-hidden relative shadow-2xl">
                                    {Array.from({ length: 64 }).map((_, index) => {
                                      const rowIdx = Math.floor(index / 8);
                                      const colIdx = index % 8;
                                      const isDark = (rowIdx + colIdx) % 2 === 1;
                                      const isKingCell = index === 27; // Simulated checkmated king square (d5 center-ish)
                                      return (
                                        <div
                                          key={`mini-cell-${index}`}
                                          className="w-full h-full relative flex items-center justify-center text-[10px]"
                                          style={{
                                            backgroundColor: isDark ? '#769656' : '#eeeed2'
                                          }}
                                        >
                                          {isKingCell && (
                                            <div className="w-[85%] h-[85%] select-none z-10 filter drop-shadow">
                                              <ChessPiece type="k" color="b" skin="standard" className="w-full h-full" />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* DRAGON FLARE SIMULATED PARTICLE EFFECTS */}
                                    {previewFx === 'dragon_flare' && (
                                      <>
                                        <motion.div
                                          initial={{ scale: 0.1, opacity: 0.9 }}
                                          animate={{ scale: [0.1, 3.2, 0], opacity: [0.9, 0.4, 0] }}
                                          transition={{ duration: 1.5, repeat: Infinity }}
                                          className="absolute rounded-full border border-red-500 bg-orange-600/20 blur-[1px]"
                                          style={{ left: '43.75%', top: '43.75%', width: '14px', height: '14px', transform: 'translate(-50%, -50%)' }}
                                        />
                                        {Array.from({ length: 12 }).map((_, pIdx) => {
                                          const angle = (pIdx / 12) * Math.PI * 2;
                                          const distance = 12 + Math.random() * 38;
                                          return (
                                            <motion.div
                                              key={`mini-fire-${pIdx}`}
                                              initial={{ x: 'calc(43.75% - 4px)', y: 'calc(43.75% - 4px)', scale: 0.3, opacity: 1 }}
                                              animate={{
                                                x: `calc(43.75% + ${Math.cos(angle) * distance}px)`,
                                                y: `calc(43.75% + ${-10 - Math.random() * 35}px)`,
                                                scale: [0.3, 1.3, 0],
                                                opacity: [1, 0.8, 0]
                                              }}
                                              transition={{ duration: 1 + Math.random() * 0.8, repeat: Infinity }}
                                              className="absolute w-2 h-2 rounded-full bg-gradient-to-t from-red-600 via-orange-400 to-yellow-300 blur-[0.2px] mix-blend-screen shadow-[0_0_3px_#f97316]"
                                            />
                                          );
                                        })}
                                      </>
                                    )}

                                    {/* COSMIC NEBULA SIMULATED PARTICLES */}
                                    {previewFx === 'cosmic_nebula' && (
                                      <>
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                          className="absolute rounded-full bg-gradient-to-r from-violet-500/40 via-purple-600/10 to-transparent blur-xs"
                                          style={{ left: '43.75%', top: '43.75%', width: '74px', height: '74px', transform: 'translate(-50%, -50%)' }}
                                        />
                                        {Array.from({ length: 12 }).map((_, pIdx) => {
                                          const angle = (pIdx / 12) * Math.PI * 2;
                                          const distance = 15 + Math.random() * 45;
                                          return (
                                            <motion.div
                                              key={`mini-star-${pIdx}`}
                                              initial={{ x: 'calc(43.75% - 3px)', y: 'calc(43.75% - 3px)', scale: 0.2, opacity: 1 }}
                                              animate={{
                                                x: `calc(43.75% + ${Math.cos(angle) * distance}px)`,
                                                y: `calc(43.75% + ${Math.sin(angle) * distance}px)`,
                                                scale: [0.2, 1.4, 0],
                                                opacity: [1, 0.7, 0],
                                                rotate: 360
                                              }}
                                              transition={{ duration: 1.4 + Math.random() * 0.6, repeat: Infinity }}
                                              className="absolute w-1.5 h-1.5 rounded-full bg-fuchsia-400 blur-[0.1px] mix-blend-screen shadow-[0_0_3px_#e879f9]"
                                            />
                                          );
                                        })}
                                      </>
                                    )}

                                    {/* LIGHTNING STRIKE SIMULATION */}
                                    {previewFx === 'lightning_strike' && (
                                      <>
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: [0, 1, 0, 0.8, 0] }}
                                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.2 }}
                                          className="absolute inset-0 bg-cyan-100/20 z-20 pointer-events-none"
                                        />
                                        <motion.svg
                                          viewBox="0 0 100 200"
                                          className="absolute w-10 h-full top-0 pointer-events-none mix-blend-screen"
                                          style={{ left: 'calc(43.75% - 20px)' }}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: [0, 1, 0, 0.9, 0] }}
                                          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
                                        >
                                          <path
                                            d="M50,0 L42,40 L58,90 L40,140 L50,200"
                                            stroke="#22d3ee"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_3px_cyan]"
                                          />
                                        </motion.svg>
                                      </>
                                    )}

                                    {/* CYBER GLITCH SIMULATION */}
                                    {previewFx === 'cyber_glitch' && (
                                      <>
                                        <motion.div
                                          animate={{ y: ['-10%', '110%'] }}
                                          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                          className="absolute left-0 right-0 h-0.5 bg-green-500/40 shadow-[0_0_4px_#22c55e] z-20 pointer-events-none"
                                        />
                                        <motion.div
                                          animate={{ 
                                            clipPath: ['inset(20% 0 50% 0)', 'inset(75% 0 10% 0)', 'inset(5% 0 85% 0)', 'inset(0% 0 0% 0)'],
                                            opacity: [0.1, 0.3, 0.1]
                                          }}
                                          transition={{ repeat: Infinity, duration: 0.4 }}
                                          className="absolute inset-0 bg-green-500/10 pointer-events-none z-10"
                                        />
                                      </>
                                    )}
                                  </div>

                                  {/* Custom Preview Captions */}
                                  <div className="mt-2 text-center text-slate-300">
                                    <span className="text-[8px] font-black tracking-widest text-[#81b64c] uppercase font-mono block">SIMULASI ANIMASI PROV</span>
                                    <p className="text-[9px] font-bold leading-relaxed max-w-[170px] mt-0.5">
                                      {previewFx === 'dragon_flare' ? (isEng ? '[FIRE] Crimson magmatic flare explodes around the opponent\'s King piece!' : '[API] Kobaran api magmatik Crimson meledak di sekitar bidak Raja lawan!') :
                                       previewFx === 'cosmic_nebula' ? (isEng ? '[SPACE] Supernova stardust vortex blasts the King out of the solar system!' : '[KOSMIK] Pusaran bintang Supernova menghempas Raja keluar dari tata surya!') :
                                       previewFx === 'lightning_strike' ? (isEng ? '[THUNDER] High-powered neon blue lightning bolts crack the chess board!' : '[KILAT] Halilintar biru neon bertenaga tinggi meretakkan papan!') :
                                       (isEng ? '[GLITCH] Matrix system glitch anomaly multiplies the coordinate pieces!' : '[GLITCH] Anomali kegagalan sistem matrix melipat gandakan kepingan koordinat!')}
                                    </p>
                                    <button
                                      onClick={() => setPreviewFx(null)}
                                      className="px-2 py-0.5 mt-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-[8px] font-black uppercase rounded cursor-pointer transition-colors"
                                    >
                                      Tutup
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              )}

              {/* Feature 55 & 57: Audio Cues & Framer Smooth slides showcase info */}
              <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Volume2 className="w-5 h-5 text-[#81b64c]" />
                    Suara/SFX Bidak Kustom & Geseran Smooth
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Setiap skin bidak yang Anda pakai di klan menyuarakan suara langkah taktil berbeda ditalakan oleh Web Audio API!
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 font-medium bg-black/30 p-3 rounded-lg border border-[#3c3934]/40">
                    <li className="flex items-center gap-1.5"><span className="text-amber-500 font-bold font-mono">[Kayu]</span> Suara ketukan kayu (wood block sweep)</li>
                    <li className="flex items-center gap-1.5"><span className="text-cyan-400 font-bold font-mono">[Neon]</span> Bunyi synthesizer futuristik</li>
                    <li className="flex items-center gap-1.5"><span className="text-yellow-400 font-bold font-mono">[Emas]</span> Resonansi dengungan bel emas</li>
                    <li className="flex items-center gap-1.5"><span className="text-rose-500 font-bold font-mono">[Cyber]</span> Kibasan bilah pedang kstaria</li>
                  </ul>
                  <p className="text-[10px] text-[#81b64c] font-black uppercase tracking-wide">
                    Gerakan bidak otomatis berjalan mulus dengan interpolasi pegas buatan Framer Motion!
                  </p>
                </div>

                {/* Simulated action triggers for debug */}
                <div className="bg-[#22201e] border border-[#3c3934] p-4 rounded-xl flex flex-col gap-2 justify-center">
                  <span className="text-[11px] font-black text-slate-300 uppercase block font-mono text-center mb-1">
                    Coba Bunyi Kustom Skin
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: 'Klasi (Wood)', skin: 'wood' },
                      { l: 'Cyber Laser', skin: 'neon' },
                      { l: 'Lonceng Emas', skin: 'gold' },
                      { l: 'Sabet Samurai', skin: 'anime' }
                    ].map(test => (
                      <button
                        key={test.skin}
                        onClick={() => {
                          // Temporary cache selectedSkin swap to trigger distinct sounds
                          const original = localStorage.getItem('selectedSkin');
                          localStorage.setItem('selectedSkin', test.skin);
                          triggerAudio('move');
                          if (original) localStorage.setItem('selectedSkin', original);
                        }}
                        className="py-2.5 px-2 bg-[#2d2a28] hover:bg-[#3d3a38] text-[10px] font-black text-white uppercase rounded-lg border border-[#3c3934] cursor-pointer"
                      >
                        Hear {test.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}



          {/* TAB 4: SHARE PROFILE CARD */}
          {activeTab === 'share-card' && (
            <motion.div
              key="share-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto space-y-4"
            >
              {/* Feature 59: Kartu Profil */}
              <div 
                ref={cardRef}
                className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-2 border-slate-700 p-6 rounded-3xl shadow-3xl text-left"
              >
                {/* Decorative hologram grids */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(129,182,76,0.15),transparent)] pointer-events-none" />

                {/* Profile header within card */}
                <div className="flex items-center gap-4 border-b border-slate-700/60 pb-4">
                  <div className="shrink-0 relative">
                    <AvatarWithFrame 
                      src={profileAvatar || martinAvatar} 
                      frameId={selectedFrame || 'none'} 
                      size="md" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {membershipStatus === 'premium' && <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400/20" />}
                      <span className="text-white font-mono font-black text-sm uppercase tracking-wide">
                        {username || 'Player Catur'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#81b64c] font-black uppercase tracking-wide block mt-0.5">
                       {equippedTitle || 'Pecatur Pemula'}
                    </span>
                  </div>
                </div>

                {/* Stats body */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Online ELO</span>
                    <span className="text-base font-black font-mono text-cyan-400 mt-1">{onlineRating} ELO</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">XP Level</span>
                    <span className="text-sm font-black font-mono text-teal-400 mt-1 truncate">Lvl {getLevelFromXP(xp)}</span>
                  </div>
                </div>

                {/* Feature 58: Status kustom di profil */}
                <div className="bg-black/40 border border-slate-800 p-3.5 rounded-xl space-y-1.5 mb-2">
                  <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-widest font-mono block">Status Pikiran (Mood)</span>
                  <p className="text-xs text-slate-300 font-bold italic">
                    "{customStatus || 'Pantang menyerah sebelum raja digulingkan!'}"
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-800 pt-3">
                  <span>PAL MATE ONLINE</span>
                  <span className="text-[#81b64c] uppercase flex items-center gap-1 font-mono text-[9px]">
                    ● server aktif
                  </span>
                </div>
              </div>

              {/* Action buttons list */}
              <div className="flex flex-col gap-2">
                {/* Input to edit custom status */}
                <div className="bg-[#1c1a19] border border-[#3c3934] p-3 rounded-xl text-left space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase block">Tulis Status Pemikiran Kustom</label>
                  <input
                    type="text"
                    maxLength={75}
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="Contoh: Menantikan Ruy Lopez yang menentukan..."
                    className="w-full bg-[#2a2826] border border-[#3c3934] rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#81b64c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyProfileCard}
                    className="py-3 px-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-xs font-black text-white uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <Clipboard className="w-4 h-4" />
                    {copiedLink ? 'Tersalin' : 'Salin Tautan'}
                  </button>
                  <button
                    onClick={() => {
                      triggerAudio('win');
                      // PNG card rendering and download implementation
                      const lvlVal = getLevelFromXP(xp);
                      const titleVal = equippedTitle || 'Pecatur Pemula';
                      const statusVal = customStatus || 'Pantang menyerah sebelum raja digulingkan!';
                      const svg = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
                          <defs>
                            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stop-color="#02010a"/>
                              <stop offset="50%" stop-color="#111827"/>
                              <stop offset="100%" stop-color="#070b14"/>
                            </linearGradient>
                            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stop-color="#3b82f6"/>
                              <stop offset="100%" stop-color="#10b981"/>
                            </linearGradient>
                          </defs>
                          <rect width="400" height="260" rx="20" fill="url(#cardGrad)" stroke="#374151" stroke-width="2"/>
                          <rect x="10" y="10" width="380" height="240" rx="15" fill="none" stroke="url(#glowGrad)" stroke-width="1.5" stroke-opacity="0.4"/>
                          <text x="30" y="45" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" letter-spacing="1">
                            ${(username || 'PLAYER').toUpperCase()}
                          </text>
                          <text x="30" y="62" font-family="sans-serif" font-size="11" font-weight="900" fill="#81b64c">
                            ★ ${titleVal.toUpperCase()}
                          </text>
                          ${membershipStatus === 'premium' ? `
                            <rect x="290" y="28" width="80" height="18" rx="4" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="1"/>
                            <text x="330" y="40" font-family="sans-serif" font-size="8" font-weight="950" fill="#f59e0b" text-anchor="middle">PREMIUM MEMBER</text>
                          ` : ''}
                          <line x1="30" y1="80" x2="370" y2="80" stroke="#374151" stroke-width="1" stroke-dasharray="4"/>
                          <rect x="30" y="95" width="160" height="55" rx="10" fill="#1f2937" fill-opacity="0.4" stroke="#374151" stroke-width="1"/>
                          <text x="45" y="112" font-family="sans-serif" font-size="9" font-weight="bold" fill="#9ca3af">ONLINE RATING</text>
                          <text x="45" y="137" font-family="sans-serif" font-size="18" font-weight="900" fill="#22d3ee">${onlineRating} ELO</text>
                          <rect x="210" y="95" width="160" height="55" rx="10" fill="#1f2937" fill-opacity="0.4" stroke="#374151" stroke-width="1"/>
                          <text x="225" y="112" font-family="sans-serif" font-size="9" font-weight="bold" fill="#9ca3af">XP LEVEL</text>
                          <text x="225" y="137" font-family="sans-serif" font-size="14" font-weight="900" fill="#2dd4bf">Lvl ${lvlVal}</text>
                          <rect x="30" y="165" width="340" height="50" rx="10" fill="#000000" fill-opacity="0.3" stroke="#1f2937" stroke-width="1"/>
                          <text x="45" y="180" font-family="sans-serif" font-size="8" font-weight="900" fill="#81b64c" letter-spacing="1">STATUS MOOD (PIKIRAN)</text>
                          <text x="45" y="200" font-family="sans-serif" font-size="10" font-style="italic" fill="#cbd5e1">"${statusVal.length > 50 ? statusVal.substring(0, 48) + '...' : statusVal}"</text>
                          <text x="30" y="240" font-family="sans-serif" font-size="8" font-weight="bold" fill="#4b5563">PAL MATE ONLINE • KARTU KOLEKTOR ELIT</text>
                          <circle cx="360" cy="237" r="3" fill="#10b981"/>
                          <text x="352" y="240" font-family="sans-serif" font-size="8" font-weight="bold" fill="#10b981" text-anchor="end">LIVE SERVER</text>
                        </svg>
                      `.trim();
                      
                      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                      const svgUrl = URL.createObjectURL(svgBlob);
                      
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 400;
                        canvas.height = 260;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(img, 0, 0);
                          try {
                            const pngUrl = canvas.toDataURL('image/png');
                            const link = document.createElement('a');
                            link.href = pngUrl;
                            link.download = `kartu_profil_${username || 'pemain'}_pal_mate.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            triggerReward(5, 'Kartu profil berhasil disimpan sebagai PNG!', 'success_no_xp');
                          } catch (e) {
                            // Fallback in case of sandboxed canvas restrictions
                            const link = document.createElement('a');
                            link.href = svgUrl;
                            link.download = `kartu_profil_${username || 'pemain'}_pal_mate.svg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            triggerReward(5, 'Ekspor berhasil (SVG format fallback)!', 'success_no_xp');
                          }
                        } else {
                          URL.revokeObjectURL(svgUrl);
                        }
                      };
                      img.onerror = () => {
                        // Fallback export if image fails to load
                        const link = document.createElement('a');
                        link.href = svgUrl;
                        link.download = `kartu_profil_${username || 'pemain'}_pal_mate.svg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        triggerReward(5, 'Ekspor berhasil (SVG format)!', 'success_no_xp');
                      };
                      img.src = svgUrl;
                    }}
                    className="py-3 px-2 bg-gradient-to-r from-[#81b64c]/80 to-[#81b64c] hover:bg-[#81b64c] text-xs font-black text-[#1c1a19] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Kartu
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: OPENING ANALYSIS */}
          {activeTab === 'opening' && (
            <motion.div
              key="opening-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 max-w-lg mx-auto text-left"
            >
              <div className="bg-[#1c1a19] border border-[#3c3934] p-5 rounded-2xl space-y-4 shadow-lg text-left">
                <div className="flex items-center gap-3 border-b border-[#3c3934]/65 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Analisa Taktik Pembukaan (Opening analysis)
                    </h3>
                    <p className="text-[10px] text-[#81b64c] font-black uppercase tracking-wider font-mono">
                      Detektor Pola Catur Cerdas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Studi Pembukaan Aktif / Terakhir</span>
                    <p className="text-base font-black text-indigo-300 leading-snug mt-1">
                      [Studi] {analysis.openingName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-black/30 border border-[#3c3934]/60 p-3 rounded-xl text-center flex flex-col justify-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Akurasi Pembukaan</span>
                      <span className="text-2xl font-black font-mono text-[#81b64c] mt-0.5">{analysis.accuracy}%</span>
                    </div>
                    <div className="bg-black/30 border border-[#3c3934]/60 p-3 rounded-xl flex flex-col justify-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Akurasi Vibe</span>
                      <span className="text-xs font-extrabold text-blue-300 uppercase mt-1 leading-snug">Optimal & Kokoh</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-[#22201e] border border-[#3c3934]/70 p-4 rounded-xl">
                    <div className="flex items-start gap-2 text-xs text-slate-300 leading-normal font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-[10px] text-red-400 font-black uppercase font-mono block">Blunder Terbesar (Biggest Blunder)</span>
                        <p className="text-[11px] font-bold text-slate-300 mt-0.5">{analysis.blunderDesc}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-300 leading-normal font-semibold border-t border-[#3c3934]/50 pt-3">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-emerald-400 font-black uppercase font-mono block">Langkah Terbaik Rekomendasi (Best Move)</span>
                        <p className="text-[11px] font-bold text-slate-300 mt-0.5">{analysis.bestMove}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-center">
                    Analisa ini secara otomatis dihasilkan pasca pertandingan usai berdasarkan sequence reposisi pion utama.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
