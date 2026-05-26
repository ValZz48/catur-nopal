import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the GoogleGenAI instance on the server if the key is available
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chess Commentary
  app.post("/api/commentary", async (req, res) => {
    try {
      const { character, playerMove, aiMove, boardState } = req.body;

      if (!character) {
        return res.status(400).json({ error: "Missing character info" });
      }

      const characterBios: Record<string, string> = {
        martin: "Martin, seorang pelatih catur pemula (250 ELO) yang sangat santai, sangat ramah, baik hati, humoris, suka meminta maaf bila bermain bagus, sering melakukan blunder konyol, dan selalu memuji pemain walaupun langkah pemain ganjil. Sangat hobi bercanda.",
        nelson: "Nelson (1300 ELO), pemain catur muda yang sangat agresif, berapi-api, dan tidak sabaran. Dia sangat bangga dengan 'serangan Ratu' di pembukaan awal dan sering mengejek secara sportif penuh canda agar pemain merasa tertantang.",
        wally: "Wally (1800 ELO), bapak-bapak ramah namun master catur kawakan yang tenang, bijaksana, suka memberikan nasihat strategis posisi beralur filosofis, humor bapak-bapak (dad jokes), dan sangat menghargai pertahanan solid.",
        magnus: "Magnus (2850 ELO, simulasi), sang juara dunia legendaris yang sangat percaya diri, dingin, analitis cepat, berbicara secara profesional namun diplomatis, terkadang sedikit angkuh tapi selalu objektif tentang teori taktik catur."
      };

      const bio = characterBios[character.id] || character.playstyle;

      const systemPrompt = `Anda adalah karakter catur bernama ${character.name} dalam sebuah obrolan chat santai game catur.
Biografi & watak unik Anda: ${bio}.

Papan catur saat ini dalam format FEN: "${boardState}"
- Langkah yang ditarik oleh user (player): "${playerMove || 'Belum melangkah'}"
- Langkah balasan/respon dari diri Anda (Bot): "${aiMove || 'Tidak melangkah'}"

PANDUAN CHAT MANUSIA ALAMI (ANTI-ROBOTIK):
1. JANGAN pernah sebutkan kode teknis FEN atau analisis komputer rumit di obrolan chat!
2. JANGAN mendeskripsikan langkah Anda sendiri (${aiMove}) seolah-olah itu dimainkan oleh Player.
3. Berbicaralah seperti manusia asli yang sedang mengetik di ruang obrolan game catur yang asyik! Gunakan ekspresi chat Indonesia alami (misalnya: "wkwk", "waduh", "eh", "wah", "mantap", "duh", "hebat", "hehe", "gas", "yah", "kok").
4. JANGAN membuat analisis catur yang terdengar seperti buku pelajaran. Tulis reaksi yang ramah, kocak, menantang, atau santai sesuai watak Anda.
5. Kirimkan REAKSI SINGKAT dalam obrolan chat, maksimal 10-12 kata, tanpa tanda kutip ganda atau lampiran kode.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: systemPrompt,
          config: {
            temperature: 0.95,
          }
        });
        const text = response.text?.trim().replace(/^"|"$/g, '') || "Hmm, menarik...";
        return res.json({ text });
      } else {
        // Fallback responses if no GEMINI_API_KEY is configured
        const fallbacks: Record<string, string[]> = {
          martin: [
            "Halo! Langkah yang keren, semoga saya tidak berbuat blunder di giliran ini!",
            "Wah, bidakmu melangkah maju dengan gagah berani! Menarik sekali!",
            "Aduh, kepalaku agak pening memikirkan langkah selanjutnya. Hahaha!",
            "Langkah hebat! Saya terus termotivasi belajar catur bersamamu."
          ],
          nelson: [
            "Ratu saya siap menyerbu! Pertahankan pertahanan Rajamu!",
            "Langkahmu cukup solid, tapi waspadalah terhadap serangan cepat dari sayap!",
            "Jangan biarkan pertahananmu berlubang sekarang. Ratu saya mengincar celah itu!",
            "Oke, mari kita lihat seberapa jauh kamu bisa menghalau gempuranku!"
          ],
          wally: [
            "Langkah solid mengamankan jalur tengah. Sederhana tapi krusial, kawan.",
            "Sebuah taktik posisi yang sangat matang. Filosofi catur terletak pada kesabaran.",
            "Rokade cepat adalah pondasi raja yang kokoh. Teruskan pertahanan solidmu.",
            "Hmm, formasi pionmu menyerupai benteng yang kokoh. Sangat mengesankan."
          ],
          magnus: [
            "Langkah pembukaan yang sesuai teori dasar. Menarik melihat transisimu.",
            "Celah taktis yang kecil bisa mengubah hasil akhir permainan dalam sekejap.",
            "Keunggulan ruang akan menentukan efisiensi pergerakan perwira utama.",
            "Bagus, perlihatkan pemahaman posisi terbaikmu di atas papan ini."
          ]
        };

        const list = fallbacks[character.id] || ["Langkah luar biasa! Mari lanjutkan permainan!"];
        const randomIndex = Math.floor(Math.random() * list.length);
        return res.json({ text: list[randomIndex] });
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });

  // --- ONLINE MULTIPLAYER MATCHMAKING STATE & ROUTES ---
  interface WaitingPlayer {
    id: string;
    username: string;
    elo: number;
    joinedAt: number;
  }

  interface OnlineChat {
    sender: string;
    text: string;
    time: number;
  }

  interface OnlineGame {
    id: string;
    playerWhite: { id: string; name: string; elo: number; isAi: boolean };
    playerBlack: { id: string; name: string; elo: number; isAi: boolean };
    fen: string;
    moves: string[];
    chats: OnlineChat[];
    lastMoveBy: 'w' | 'b' | null;
    lastMoveTime: number;
    winner: 'w' | 'b' | 'draw' | null;
  }

  const waitingPlayers: WaitingPlayer[] = [];
  const activeOnlineGames: Record<string, OnlineGame> = {};

  // Periodically clean stale matchmaking lookups
  setInterval(() => {
    const now = Date.now();
    for (let i = waitingPlayers.length - 1; i >= 0; i--) {
      if (now - waitingPlayers[i].joinedAt > 15000) {
        waitingPlayers.splice(i, 1);
      }
    }
  }, 5000);

  // Endpoint: Join Queue / Matchmaking search
  app.post("/api/online/matchmaking", (req, res) => {
    const { playerId, username, elo } = req.body;
    if (!playerId || !username) {
      return res.status(400).json({ error: "Missing identity requirements" });
    }

    const now = Date.now();

    // 1. Check if user is already inside an active game
    const existingGame = Object.values(activeOnlineGames).find(
      g => (g.playerWhite.id === playerId || g.playerBlack.id === playerId) && !g.winner
    );

    if (existingGame) {
      const color = existingGame.playerWhite.id === playerId ? 'w' : 'b';
      const opponent = color === 'w' ? existingGame.playerBlack : existingGame.playerWhite;
      return res.json({
        status: "matched",
        gameId: existingGame.id,
        color,
        opponent: { name: opponent.name, elo: opponent.elo }
      });
    }

    // 2. Remove any old queue entries for this user
    const existingIndex = waitingPlayers.findIndex(p => p.id === playerId);
    if (existingIndex !== -1) {
      waitingPlayers.splice(existingIndex, 1);
    }

    // 3. Search for available opponents (different playerId, checked in recently)
    const opponent = waitingPlayers.find(p => p.id !== playerId && (now - p.joinedAt < 15000));

    if (opponent) {
      const gameId = Math.random().toString(36).substring(2, 9);
      // Let player who was waiting the longest be White
      const game: OnlineGame = {
        id: gameId,
        playerWhite: { id: opponent.id, name: opponent.username, elo: opponent.elo, isAi: false },
        playerBlack: { id: playerId, name: username, elo: elo || 1200, isAi: false },
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: [],
        chats: [
          { sender: 'System', text: 'Pertandingan dimulai! Anda bermain sebagai Hitam (Black) dan lawan sebagai Putih (White).', time: now }
        ],
        lastMoveBy: null,
        lastMoveTime: now,
        winner: null
      };

      activeOnlineGames[gameId] = game;

      const oppIdx = waitingPlayers.findIndex(p => p.id === opponent.id);
      if (oppIdx !== -1) waitingPlayers.splice(oppIdx, 1);

      return res.json({
        status: "matched",
        gameId,
        color: 'b',
        opponent: { name: opponent.username, elo: opponent.elo }
      });
    } else {
      waitingPlayers.push({
        id: playerId,
        username,
        elo: elo || 1200,
        joinedAt: now
      });
      return res.json({ status: "waiting", playerId });
    }
  });

  // Check state of matchmaking queue or active games
  app.get("/api/online/check", (req, res) => {
    const { playerId } = req.query;
    if (!playerId) {
      return res.status(400).json({ error: "Missing playerId" });
    }

    const now = Date.now();

    const game = Object.values(activeOnlineGames).find(
      g => (g.playerWhite.id === playerId || g.playerBlack.id === playerId) && !g.winner
    );

    if (game) {
      const color = game.playerWhite.id === playerId ? 'w' : 'b';
      const opponent = color === 'w' ? game.playerBlack : game.playerWhite;
      return res.json({
        status: "matched",
        gameId: game.id,
        color,
        opponent: { name: opponent.name, elo: opponent.elo }
      });
    }

    const queued = waitingPlayers.find(p => p.id === playerId as string);
    if (queued) {
      queued.joinedAt = now;
      return res.json({ status: "waiting" });
    }

    return res.json({ status: "idle" });
  });

  // Make move in an online match
  app.post("/api/online/game/move", (req, res) => {
    const { gameId, from, to, fen, moveSan, color } = req.body;
    const game = activeOnlineGames[gameId];
    if (!game) {
      return res.status(404).json({ error: "Active game not found" });
    }

    game.fen = fen;
    game.moves.push(`${from}-${to}`);
    game.lastMoveBy = color;
    game.lastMoveTime = Date.now();

    game.chats.push({
      sender: 'Sistem',
      text: `${color === 'w' ? 'Putih' : 'Hitam'} melangkah: ${moveSan}`,
      time: Date.now()
    });

    return res.json({ success: true, game });
  });

  // Fetch match updates
  app.get("/api/online/game/updates", (req, res) => {
    const { gameId } = req.query;
    const game = activeOnlineGames[gameId as string];
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    return res.json({
      fen: game.fen,
      moves: game.moves,
      chats: game.chats,
      lastMoveBy: game.lastMoveBy,
      winner: game.winner
    });
  });

  // Post chat inside active lobby
  app.post("/api/online/game/chat", (req, res) => {
    const { gameId, sender, text } = req.body;
    const game = activeOnlineGames[gameId];
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    game.chats.push({
      sender,
      text,
      time: Date.now()
    });

    return res.json({ success: true });
  });

  // Declare match result (win/lose/draw)
  app.post("/api/online/game/result", (req, res) => {
    const { gameId, winner } = req.body;
    const game = activeOnlineGames[gameId];
    if (game) {
      game.winner = winner;
      game.chats.push({
        sender: 'Sistem',
        text: winner === 'draw' ? 'Pertandingan berakhir Seri (Remis)!' : `Skakmat! Pertandingan selesai. Pemenang: ${winner === 'w' ? 'Putih' : 'Hitam'}.`,
        time: Date.now()
      });
    }
    return res.json({ success: true });
  });

  // Seeded Online leaderboard
  app.get("/api/online/leaderboard", (req, res) => {
    const seed = [
      { name: "Magnus_Carlsen_Fans", elo: 2192, badge: "Grandmaster" },
      { name: "Siti_Catur_Ayunda", elo: 1845, badge: "Master Nasional" },
      { name: "RajaTaktik99", elo: 1620, badge: "Pakar" },
      { name: "Wira_Ksatria", elo: 1422, badge: "Pakar" },
      { name: "Duo_Owl_Hunter", elo: 1350, badge: "Pakar" },
      { name: "Kasparov_Pioneer", elo: 1250, badge: "Pemula Berbakat" },
    ];
    return res.json(seed);
  });

  // Vite development middleware vs Static built production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
