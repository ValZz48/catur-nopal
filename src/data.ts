import { Character, Puzzle, Lesson, PurchaseableTheme, BoardTheme } from './types';

import martinAvatar from './assets/images/avatar_martin_1779709510230.png';
import nelsonAvatar from './assets/images/nelson_avatar_1779712159293.png';
import wallyAvatar from './assets/images/wally_avatar_1779712178593.png';
import magnusAvatar from './assets/images/magnus_avatar_1779712198066.png';

import duoAvatar from './assets/images/duo_avatar_1779707455306.png';
import lilyAvatar from './assets/images/lily_avatar_1779707473241.png';
import oscarAvatar from './assets/images/oscar_avatar_1779707493065.png';
import zariAvatar from './assets/images/zari_avatar_1779707508891.png';
import eddyAvatar from './assets/images/eddy_duo_style_1784811264758.jpg';
import juniorAvatar from './assets/images/junior_duo_style_1784811276328.jpg';
import linAvatar from './assets/images/lin_duo_style_1784811286442.jpg';
import vikramAvatar from './assets/images/vikram_duo_style_1784811297014.jpg';
import beaAvatar from './assets/images/bea_duo_style_1784811329878.jpg';
import falstaffAvatar from './assets/images/falstaff_duo_style_1784811342155.jpg';

export const CHARACTERS: Character[] = [
  {
    id: 'martin',
    name: 'Martin',
    avatar: martinAvatar,
    difficulty: 'Sangat Mudah',
    elo: 250,
    playstyle: 'Suka Blunder & Sering Melepas Bidak',
    bio: 'Martin adalah pelatih pemula paling ramah di catur. Dia senang menyapa semua orang, namun perhitungannya sangat sederhana dan dia tak segan memberimu bidak gratis!',
    welcomeMsg: 'Halo! Saya Martin. Saya senang sekali bisa bermain catur denganmu hari ini. Semoga beruntung ya!',
    checkmateMsg: 'Wah! Kamu menskakmat saya? Keren sekali! Permainan yang hebat, selamat ya!',
    blunderMsg: 'Ups, apakah benteng saya baru saja dirampas? Hehehe, tidak apa-apa, mari lanjut!',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'junior',
    name: 'Junior',
    avatar: juniorAvatar,
    difficulty: 'Pemula',
    elo: 500,
    playstyle: 'Suka Menyerang Tanpa Rencana Panjang',
    bio: 'Junior adalah pemain cilik yang penuh semangat. Dia suka memajukan perwira dengan cepat, tetapi sering lupa mengamankan Rajanya.',
    welcomeMsg: 'Ayo main cepat! Aku suka langsung menyerang perwira depanmu!',
    checkmateMsg: 'Aduh, pertahananku bobol! Kamu hebat sekali!',
    blunderMsg: 'Wah, perwiraku kejebak! Lain kali aku harus lebih hati-hati.',
    color: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'oscar',
    name: 'Oscar',
    avatar: oscarAvatar,
    difficulty: 'Pemula Plus',
    elo: 800,
    playstyle: 'Posisi Dasar & Suka Pertukaran Bidak',
    bio: 'Oscar mulai memahami prinsip dasar catur seperti menguasai pusat dan melakukan rokade. Dia lawan yang pas untuk melatih taktik menengah.',
    welcomeMsg: 'Selamat datang! Mari kita uji seberapa rapi pembukaan caturmu.',
    checkmateMsg: 'Langkah taktis yang sangat rapi! Aku belajar banyak dari kekalahan ini.',
    blunderMsg: 'Aduh, aku salah memperhitungkan ancaman gajahmu!',
    color: 'from-lime-500 to-emerald-600'
  },
  {
    id: 'nelson',
    name: 'Nelson',
    avatar: nelsonAvatar,
    difficulty: 'Menengah',
    elo: 1100,
    playstyle: 'Agresif & Serbuan Ratu Terlalu Dini',
    bio: 'Nelson terkenal sangat agresif dan gemar meluncurkan serangan Ratu langsung sejak langkah kedua. Bersiaplah mengoordinasikan pertahanan sayap raja kamu!',
    welcomeMsg: 'Waktunya bertanding! Bersiaplah menahan amukan Ratu saya sejak langkah pertama. Pertahankan Rajamu!',
    checkmateMsg: 'Hahaha! Ratu saya berhasil menyusup ke baris belakang dan mengunci Rajamu. Coba lagi!',
    blunderMsg: 'Sial, serangan menteriku terbaca dengan rapi. Tapi pertarungan belum berakhir!',
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'lily',
    name: 'Lily',
    avatar: lilyAvatar,
    difficulty: 'Sedang',
    elo: 1400,
    playstyle: 'Pertahanan Sayap & Kontra Taktik',
    bio: 'Lily memiliki gaya bermain tenang dan disiplin. Dia membalas gempuran agresif dengan serangan balik yang terukur di sayap menteri.',
    welcomeMsg: 'Tenang dan fokus. Jangan terburu-buru melangkah tanpa memperhitungkan akibatnya.',
    checkmateMsg: 'Permainan yang indah! Kamu berhasil menembus pertahanan terkuatku.',
    blunderMsg: 'Langkah balasan yang sangat tajam, aku lengah di sektor tengah.',
    color: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'wally',
    name: 'Wally',
    avatar: wallyAvatar,
    difficulty: 'Tingkat Lanjut',
    elo: 1700,
    playstyle: 'Strategis, Posisi Solid & Defensif',
    bio: 'Wally adalah master kawakan dengan kalkulasi posisi yang sangat matang. Dia suka bergurau ramah, namun pertahanannya kokoh terorganisasi tanpa celah.',
    welcomeMsg: 'Selamat datang di arena. Santai saja ya, tidak perlu grogi. Mari kita lihat koordinasi taktis perwiramu.',
    checkmateMsg: 'Skakmat. Struktur bidakmu goyah di fase transisi tadi, membuka jalur diagonal Raja.',
    blunderMsg: 'Langkah brilian! Saya kurang cermat memperhitungkan pergerakan gajah silang Anda.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'vikram',
    name: 'Vikram',
    avatar: vikramAvatar,
    difficulty: 'Master',
    elo: 2100,
    playstyle: 'Posisional & Penguasaan Endgame',
    bio: 'Vikram menghitung puluhan kombinasi langkah ke depan. Dia ahli mengonversi keunggulan kecil menjadi kemenangan mutlak di babak akhir.',
    welcomeMsg: 'Tunjukkan ketajaman kalkulasimu. Di level ini, satu kesalahan kecil menentukan hasil akhir.',
    checkmateMsg: 'Eksekusi endgame yang sempurna. Selamat atas kemenangan berhargamu!',
    blunderMsg: 'Pengorbanan perwira yang luar biasa! Kalkulasiku meleset.',
    color: 'from-purple-600 to-indigo-900'
  },
  {
    id: 'magnus',
    name: 'Magnus',
    avatar: magnusAvatar,
    difficulty: 'Grandmaster',
    elo: 2500,
    playstyle: 'Sempurna, Tanpa Celah & Taktik Mematikan',
    bio: 'Simulasi kecerdasan sang juara catur terhebat sepanjang masa. Bermain tanpa ampun, strategi akhir permainan menyerupai mesin komputer sempurna.',
    welcomeMsg: 'Mari kita mulai papan ini. Tunjukkan langkah terbaikmu sejak pembukaan dimulai.',
    checkmateMsg: 'Permainan berakhir. Struktur pertahananmu runtuh total sejak kegagalan rokade tadi.',
    blunderMsg: 'Langkah luar biasa! Anda mendeteksi kelemahan taktis mikro di koordinat pertahanan saya.',
    color: 'from-emerald-600 to-slate-900'
  }
];

export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    title: '1. Skakmat Koridor Meriah',
    difficulty: 'Mudah',
    description: 'Raja hitam terperangkap di baris belakang oleh pion-pion pelindungnya sendiri. Berikan skakmat instan dengan Benteng atau Ratu Anda!',
    fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
    solution: ['d1d8'],
    explanation: 'Benteng bergerak ke d8 memanfaatkan baris belakang hitam yang kosong dan tidak terjaga untuk skakmat.',
    points: 20
  },
  {
    id: 'p2',
    title: '2. Tusukan Sate Ratu (Skewer)',
    difficulty: 'Mudah',
    description: 'Raja dan Ratu hitam berdiri di diagonal yang sama. Gunakan Gajah putih Anda untuk menskak Raja dan melancarkan serangan sate (skewer) maut!',
    fen: 'k7/8/8/8/8/1B2K3/8/7q w - - 0 1',
    solution: ['b3d5'],
    explanation: 'Gajah putih di b3 meluncur ke d5 memberikan skak langsung ke Raja hitam di a8. Setelah Raja menghindar, Gajah dapat melahap Ratu hitam di h1!',
    points: 25
  },
  {
    id: 'p3',
    title: '3. Garpu Kuda Malam (Fork)',
    difficulty: 'Sedang',
    description: 'Kuda putih memiliki kesempatan emas untuk melompat dan mengancam Raja dan Ratu hitam sekaligus!',
    fen: 'q3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
    solution: ['d5c7'],
    explanation: 'Kuda melompat ke c7 melepaskan serangan garpu (fork) ganda ke Raja hitam dan Ratu di a8.',
    points: 30
  },
  {
    id: 'p4',
    title: '4. Taktik Pin Pengikat Ratu',
    difficulty: 'Sedang',
    description: 'Ratu hitam berdiri di depan Rajanya pada jalur miring. Gunakan Gajah putih Anda untuk mengikat Ratu agar tidak bisa bergerak!',
    fen: '4k3/4q3/8/2B5/8/8/8/4K3 w - - 0 1',
    solution: ['c5e7'],
    explanation: 'Gajah putih di c5 mengancam Ratu di e7. Karena Ratu menghalangi Raja, dia terpaksa harus menyerah dan dimakan.',
    points: 40
  },
  {
    id: 'p5',
    title: '5. Serbuan Pembuka f7 (Greek Gift)',
    difficulty: 'Sulit',
    description: 'Pion f7 hitam adalah titik terlemah. Hancurkan pertahanan f7 menggunakan Gajah putih Anda untuk memaksa Raja keluar sarang!',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 4 5',
    solution: ['c4f7'],
    explanation: 'Gajah memakan pion f7 dengan perlindungan Kuda g5, membuat Raja hitam terancam dan kehilangan hak rokade.',
    points: 50
  },
  {
    id: 'p6',
    title: '6. Skakmat Terkunci (Smothered Mate)',
    difficulty: 'Sulit',
    description: 'Raja hitam dikelilingi rapat oleh pasukannya sendiri. Nyatakan skakmat indah menggunakan Kuda ke petak mematikan!',
    fen: '6rk/6pp/8/6N1/8/8/1Q6/4K3 w - - 0 1',
    solution: ['g5f7'],
    explanation: 'Kuda berada di f7 mengurung Raja hitam yang sama sekali tidak bisa menghindar karena terhimpit bidaknya sendiri.',
    points: 60
  },
  {
    id: 'p7',
    title: '7. Serangan Terbuka (Discovered Attack)',
    difficulty: 'Sedang',
    description: 'Geser Kuda untuk membuka jalur tembak Benteng ke Raja lawan sambil melancarkan ancaman tambahan!',
    fen: '3r2k1/5ppp/8/3N4/8/8/5PPP/3R2K1 w - - 0 1',
    solution: ['d5f6'],
    explanation: 'Kuda bergerak membebaskan tembakan Benteng langsung di jalur d sekaligus memberi skak ganda.',
    points: 70
  },
  {
    id: 'p8',
    title: '8. Jebakan Ratu Terjebak (Queen Trap)',
    difficulty: 'Sulit',
    description: 'Ratu lawan terlalu jauh menyusup tanpa pengawalan. Kurung jalurnya menggunakan perwira ringan Anda!',
    fen: 'r1b1kb1r/pppp1ppp/2n5/4p3/2B1P2q/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: ['f3h4'],
    explanation: 'Kuda putih memakan Ratu h4 yang tidak terlindungi!',
    points: 80
  },
  {
    id: 'p9',
    title: '9. Pengorbanan Benteng Maut',
    difficulty: 'Sangat Sulit',
    description: 'Korbankan Benteng untuk menghancurkan barisan pion pelindung Raja musuh!',
    fen: '5rk1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    solution: ['b1b8'],
    explanation: 'Benteng meluncur ke b8 memaksa pertukaran atau skakmat koridor.',
    points: 90
  },
  {
    id: 'p10',
    title: '10. Garpu Ganda Ratu & Raja',
    difficulty: 'Menengah',
    description: 'Gunakan serangan beruntun Kuda untuk mendapatkan posisi unggul perwira.',
    fen: 'r3k2r/8/8/3N4/8/8/8/4K3 w kq - 0 1',
    solution: ['d5c7'],
    explanation: 'Garpu ganda Kuda mengancam Raja di e8 dan Benteng di a8.',
    points: 100
  },
  {
    id: 'p11',
    title: '11. Mating Net di Sayap Raja',
    difficulty: 'Sangat Sulit',
    description: 'Gunakan Ratu dan Gajah bersilang untuk mengunci pergerakan Raja.',
    fen: '6k1/5p1p/6p1/8/8/1B6/5Q2/6K1 w - - 0 1',
    solution: ['f2f7'],
    explanation: 'Ratu memakan f7 didukung oleh Gajah b3 mengunci skakmat!',
    points: 120
  },
  {
    id: 'p12',
    title: '12. Taktik Pengalihan (Deflection)',
    difficulty: 'Master',
    description: 'Umpan pertahanan lawan agar meninggalkan pengawalan petak kritis.',
    fen: '3r2k1/1q3ppp/8/8/8/8/1Q3PPP/3R2K1 w - - 0 1',
    solution: ['d1d8'],
    explanation: 'Benteng d1 memakan d8 skakmat instan!',
    points: 150
  }
];

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Cara Lari Kuda Cantik',
    description: 'Pelajari gerakan melompat unik berbentuk huruf "L" oleh Kuda (Knight) dan cara menggunakannya untuk menembus benteng lawan.',
    icon: 'Knight',
    difficulty: 'Dasar',
    points: 15,
    steps: [
      {
        title: 'Gerakan Huruf L',
        description: 'Kuda adalah satu-satunya perwira catur yang bisa melompati bidak lain. Kuda berjalan 2 kotak lurus lalu belok 1 kotak ke samping (berbentuk huruf L). Coba jalankan Kuda putih di e4 ke d6!',
        fen: '4k3/8/3p4/8/4N3/8/8/4K3 w - - 0 1',
        highlightSquares: ['e4', 'd6'],
        requiredMove: { from: 'e4', to: 'd6' }
      },
      {
        title: 'Melompati Rintangan',
        description: 'Meskipun dikelilingi oleh bidak sendiri atau lawan, Kuda tetap bisa melompat bebas ke e6! Coba buat lompatan taktis ke e6 untuk menyerang pion hitam.',
        fen: '4k3/8/4p3/8/3N4/3PPP2/3PPP2/4K3 w - - 0 1',
        highlightSquares: ['d4', 'e6'],
        requiredMove: { from: 'd4', to: 'e6' }
      }
    ]
  },
  {
    id: 'l2',
    title: 'Taktik Rokade (Castling)',
    description: 'Amankan Raja Anda di balik dinding pertahanan Kokoh dan aktifkan Benteng sekaligus dalam satu gerakan spesial!',
    icon: 'Shield',
    difficulty: 'Dasar',
    points: 25,
    steps: [
      {
        title: 'Rokade Sayap Raja (Kingside)',
        description: 'Rokade memindahkan Raja sejauh 2 langkah ke samping, dan Benteng melompati Raja ke kotak sebelahnya. Syaratnya: tidak ada bidak menghalangi dan belum pernah bergerak. Coba lakukan rokade dengan memindahkan Raja dari e1 ke g1!',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        highlightSquares: ['e1', 'g1'],
        requiredMove: { from: 'e1', to: 'g1' }
      }
    ]
  },
  {
    id: 'l3',
    title: 'Pembukaan Italian Game',
    description: 'Pelajari pembukaan tertua dan paling populer yang berfokus cepat pada penguasaan pusat dan penyerangan petak f7 milik hitam.',
    icon: 'BookOpen',
    difficulty: 'Dasar',
    points: 30,
    steps: [
      {
        title: 'Menguasai Tengah',
        description: 'Langkah pertama yang paling kokoh adalah memajukan pion Raja ke tengah. Gerakkan pion putih dari e2 ke e4!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlightSquares: ['e2', 'e4'],
        requiredMove: { from: 'e2', to: 'e4' }
      },
      {
        title: 'Mengembangkan Kuda',
        description: 'Hitam membalas dengan e5. Sekarang kembangkan Kuda putih Anda ke f3 untuk menyerang pion hitam di e5 sekaligus mempersiapkan rokade cepat.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        highlightSquares: ['g1', 'f3'],
        requiredMove: { from: 'g1', to: 'f3' }
      },
      {
        title: 'Mengarahkan Gajah Taktis',
        description: 'Setelah hitam melindungi pionnya dengan Nc6, keluarkan Gajah putih Anda ke petak c4. Ini menekan langsung pion lemah f7 hitam. Selamat, Anda meluncurkan Italian Game!',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        highlightSquares: ['f1', 'c4'],
        requiredMove: { from: 'f1', to: 'c4' }
      }
    ]
  },
  {
    id: 'l4',
    title: 'Pembukaan Ruy Lopez',
    description: 'Sangat disukai oleh para Grandmaster dunia. Letakkan tekanan psikologis dan taktis mendalam pada sayap menteri hitam.',
    icon: 'Award',
    difficulty: 'Menengah',
    points: 40,
    steps: [
      {
        title: 'Tekanan ke Kuda Pelindung',
        description: 'Pembukaan Ruy Lopez dimulai dengan e4 e5 dan Nf3 Nc6. Langkah pembedanya adalah memajukan Gajah putih ke b5, memaku Kuda hitam yang mengawal pusat! Coba majukan Gajah dari f1 ke b5.',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        highlightSquares: ['f1', 'b5'],
        requiredMove: { from: 'f1', to: 'b5' }
      }
    ]
  },
  {
    id: 'l5',
    title: 'Pertahanan Sisilia (Sicilian)',
    description: 'Jawaban paling agresif dari hitam untuk melawan e4, merusak dominasi putih di pusat secara tidak simetris.',
    icon: 'Sparkles',
    difficulty: 'Menengah',
    points: 45,
    steps: [
      {
        title: 'Serangan Sayap Sisilia',
        description: 'Bila putih membuka dengan e4, hitam langsung merebut kendali pusat sayap dengan pion c5! Gerakkan pion hitam dari c7 ke c5.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        highlightSquares: ['c7', 'c5'],
        requiredMove: { from: 'c7', to: 'c5' }
      }
    ]
  },
  {
    id: 'l6',
    title: 'Scholar\'s Mate (Trap 4 Langkah)',
    description: 'Pelajari jebakan cepat skakmat dalam empat langkah yang sangat terkenal di kalangan amatir agar Anda tahu cara menggunakannya dan menahannya.',
    icon: 'Flame',
    difficulty: 'Dasar',
    points: 40,
    steps: [
      {
        title: 'Gajah ke Garis Tempur',
        description: 'Buka serangan dengan menaruh Gajah di c4, mengintai petak f7 hitam. Coba gerakkan Gajah Anda ke c4.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        highlightSquares: ['f1', 'c4'],
        requiredMove: { from: 'f1', to: 'c4' }
      },
      {
        title: 'Ratu Turun Tangan',
        description: 'Hitam melangkah Nc6. Sekarang luncurkan Ratu Anda secara mengejutkan ke h5 untuk menumpuk ancaman bersilang pada pion f7. Coba gerakkan Ratu dari d1 ke h5!',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
        highlightSquares: ['d1', 'h5'],
        requiredMove: { from: 'd1', to: 'h5' }
      },
      {
        title: 'Skakmat Instan',
        description: 'Hitam lengah memajukan Kuda ke f6. Rampas kemenanganmu! Makan pion f7 hitam dengan Ratu putih di h5 untuk mengunci kemenangan skakmat total!',
        fen: 'r1bqkbnr/ppp2ppp/2np4/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
        highlightSquares: ['h5', 'f7'],
        requiredMove: { from: 'h5', to: 'f7' }
      }
    ]
  },
  {
    id: 'l7',
    title: 'Pertahanan French Defense',
    description: 'Pertahanan solid dengan struktur benteng e6 d5 yang menahan gempuran putih.',
    icon: 'Shield',
    difficulty: 'Menengah',
    points: 50,
    steps: [
      {
        title: 'Persiapan Dorongan d5',
        description: 'Majukan pion e7 ke e6 untuk mempersiapkan benteng d5 di langkah berikutnya.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        highlightSquares: ['e7', 'e6'],
        requiredMove: { from: 'e7', to: 'e6' }
      }
    ]
  },
  {
    id: 'l8',
    title: 'Pertahanan Caro-Kann',
    description: 'Alternatif pertahanan paling kokoh tanpa mengurung jalur tembak gajah terang.',
    icon: 'BookOpen',
    difficulty: 'Menengah',
    points: 50,
    steps: [
      {
        title: 'Pion c6 Kokoh',
        description: 'Buka dengan c6 untuk mendukung fondasi d5 yang stabil.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        highlightSquares: ['c7', 'c6'],
        requiredMove: { from: 'c7', to: 'c6' }
      }
    ]
  },
  {
    id: 'l9',
    title: 'Gambit Menteri (Queen\'s Gambit)',
    description: 'Tawarkan pengorbanan pion c4 untuk menguasai pusat permainan secara dominan.',
    icon: 'Award',
    difficulty: 'Lanjutan',
    points: 60,
    steps: [
      {
        title: 'Dorongan d4 Pertama',
        description: 'Buka dengan d4 untuk merebut kontrol penuh petak pusat.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlightSquares: ['d2', 'd4'],
        requiredMove: { from: 'd2', to: 'd4' }
      }
    ]
  },
  {
    id: 'l10',
    title: 'Endgame: Penguncian Raja & Benteng',
    description: 'Kuasai teknik skakmat mendasar menggunakan Benteng dan Raja di babak akhir.',
    icon: 'Flame',
    difficulty: 'Lanjutan',
    points: 70,
    steps: [
      {
        title: 'Mengunci Baris Belakang',
        description: 'Gunakan Benteng di d8 untuk memotong pergerakan Raja lawan ke baris belakang.',
        fen: '6k1/8/8/8/8/8/8/3R2K1 w - - 0 1',
        highlightSquares: ['d1', 'd8'],
        requiredMove: { from: 'd1', to: 'd8' }
      }
    ]
  }
];

export const THEMES: PurchaseableTheme[] = [
  {
    id: 'classic',
    name: 'Hijau Premium',
    cost: 0,
    primaryColor: '#EBECD0',
    secondaryColor: '#779556',
    bgClass: 'bg-[#779556] border-[#779556]'
  },
  {
    id: 'forest',
    name: 'Kayu Walnut',
    cost: 150,
    primaryColor: '#F0D9B5',
    secondaryColor: '#B58863',
    bgClass: 'bg-amber-950 border-yellow-950'
  },
  {
    id: 'cosmic',
    name: 'Ice Blue Glacier',
    cost: 300,
    primaryColor: '#e2e8f0', // ice slate light
    secondaryColor: '#3b82f6', // beautiful frost blue
    bgClass: 'bg-slate-900 border-blue-950'
  },
  {
    id: 'magma_lava' as BoardTheme,
    name: 'Tema Magma Berapi',
    cost: 400,
    primaryColor: '#ffd1d1', // peach pink magma
    secondaryColor: '#991b1b', // flame dark outline red
    bgClass: 'bg-red-950 border-red-900'
  },
  {
    id: 'ice_freeze' as BoardTheme,
    name: 'Tema Frost Blizzard',
    cost: 500,
    primaryColor: '#e0f2fe', // sky light ice
    secondaryColor: '#0284c7', // rich glacier blue
    bgClass: 'bg-sky-950 border-sky-900'
  }
];
