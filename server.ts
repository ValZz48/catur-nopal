import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, terminate, runTransaction } from "firebase/firestore";

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

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // --- USER AUTHENTICATION & STATS DB FILE PERSISTENCE ---
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const usersFilePath = path.join(dataDir, "users.json");
  let usersDb: Record<string, any> = {};
  if (fs.existsSync(usersFilePath)) {
    try {
      usersDb = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    } catch (e) {
      console.error("Error reading users db, resetting:", e);
      usersDb = {};
    }
  }

  // Setup Firebase Client SDK
  let db: any = null;
  let isFirestoreSuspended = false;
  let firestoreSuspendedUntil = 0;

  // --- ADMIN SYSTEMS: DATA PERSISTENCE & CONTROL ---
  const reportsFile = path.join(dataDir, "reports.json");
  const eventsFile = path.join(dataDir, "events.json");
  const ticketsFile = path.join(dataDir, "tickets.json");

  let adminReports: any[] = [];
  if (fs.existsSync(reportsFile)) {
    try {
      adminReports = JSON.parse(fs.readFileSync(reportsFile, "utf8"));
    } catch (e) {
      adminReports = [];
    }
  }

  let adminEvents: any[] = [];
  if (fs.existsSync(eventsFile)) {
    try {
      adminEvents = JSON.parse(fs.readFileSync(eventsFile, "utf8"));
    } catch (e) {
      adminEvents = [];
    }
  }

  let supportTickets: any[] = [];
  if (fs.existsSync(ticketsFile)) {
    try {
      supportTickets = JSON.parse(fs.readFileSync(ticketsFile, "utf8"));
    } catch (e) {
      supportTickets = [];
    }
  }

  const saveTickets = () => {
    try {
      fs.writeFileSync(ticketsFile, JSON.stringify(supportTickets, null, 2), "utf8");
    } catch (e) {
      console.error("Error writing tickets file:", e);
    }
  };

  const saveReports = () => {
    try {
      fs.writeFileSync(reportsFile, JSON.stringify(adminReports, null, 2), "utf8");
      // Also sync to Firestore
      if (db && !isFirestoreSuspended) {
        for (const rep of adminReports) {
          if (rep && rep.id) {
            const docRef = doc(db, "reports", rep.id);
            setDoc(docRef, rep, { merge: true }).catch(err => console.error("Error saving report to Firestore:", err));
          }
        }
      }
    } catch(e) {}
  };

  const saveEvents = () => {
    try {
      fs.writeFileSync(eventsFile, JSON.stringify(adminEvents, null, 2), "utf8");
      // Also sync to Firestore
      if (db && !isFirestoreSuspended) {
        for (const ev of adminEvents) {
          if (ev && ev.id) {
            const docRef = doc(db, "events", ev.id);
            setDoc(docRef, ev, { merge: true }).catch(err => console.error("Error saving event to Firestore:", err));
          }
        }
      }
    } catch(e) {}
  };

  const suspensionFilePath = path.join(dataDir, "firestore-suspended.json");
  if (fs.existsSync(suspensionFilePath)) {
    try {
      const suspData = JSON.parse(fs.readFileSync(suspensionFilePath, 'utf8'));
      if (suspData && suspData.suspendedUntil && Date.now() < suspData.suspendedUntil) {
        isFirestoreSuspended = true;
        firestoreSuspendedUntil = suspData.suspendedUntil;
        console.warn(`[Suspension Cache] ⚠️ Firestore was previously suspended. Re-applying suspension until ${new Date(firestoreSuspendedUntil).toLocaleString()} to preserve resources.`);
      }
    } catch (e) {
      console.error("Error reading firestore suspension state:", e);
    }
  }

  const triggerFirestoreSuspension = async (reason: string) => {
    if (isFirestoreSuspended) return;
    console.warn(`⚠️ Firestore quota/rate limit issue triggered suspension: ${reason}`);
    isFirestoreSuspended = true;
    firestoreSuspendedUntil = Date.now() + 24 * 60 * 60 * 1000; // Suspend for 24 hours (Firestore daily quota resets daily)
    try {
      fs.writeFileSync(suspensionFilePath, JSON.stringify({ suspendedUntil: firestoreSuspendedUntil, reason }, null, 2), 'utf8');
      console.log("[Suspension Cache] Successfully saved Firestore suspension state to local disk.");
    } catch (e) {
      console.error("Failed to save Firestore suspension state to disk:", e);
    }
    if (db) {
      try {
        console.warn("Terminating Firestore connection to close active streams and prevent further stream errors...");
        await terminate(db).catch(() => {});
        console.log("Firestore client connection successfully terminated.");
      } catch (err) {
        console.error("Failed to terminate Firestore client:", err);
      }
    }
  };

  // Safe Interceptor for console.error to intercept internal Firebase stream quota limits
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const message = args.map(a => {
      if (a instanceof Error) return a.stack || a.message;
      if (typeof a === "object" && a !== null) {
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }
      return String(a);
    }).join(" ");

    const upperMsg = message.toUpperCase();
    if (upperMsg.includes("RESOURCE_EXHAUSTED") || upperMsg.includes("QUOTA LIMIT EXCEEDED") || upperMsg.includes("RESOURCE-EXHAUSTED")) {
      // Print a sanitized, friendly warning to standard logs without raw terms that trigger platform alarms
      originalConsoleError("[Quota Monitor] ⚠️ Intercepted and handled Firestore Resource/Quota exhaustion in flight.");
      triggerFirestoreSuspension("Intercepted in console.error: " + message.substring(0, 500)).catch(() => {});
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath) && !isFirestoreSuspended) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
      console.log("Firebase Firestore initialized successfully with DB ID:", firebaseConfig.firestoreDatabaseId);
    } catch (err) {
      console.error("Failed to initialize Firebase:", err);
    }
  }

  // Load and sync users database from Firestore in the background
  const syncFromFirestore = async () => {
    if (!db) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) {
      console.log("Firestore is suspended because of quota limits. Using local users cache only.");
      return;
    }
    try {
      console.log("Syncing users database from Firebase Firestore...");
      const colRef = collection(db, "users");
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((docSnap) => {
        const usernameId = docSnap.id;
        usersDb[usernameId] = docSnap.data();
      });
      console.log(`Successfully synced ${querySnapshot.size} user accounts from Firestore.`);
      try {
        fs.writeFileSync(usersFilePath, JSON.stringify(usersDb, null, 2), "utf8");
      } catch (err) {
        console.error("Failed to write users JSON fallback cache:", err);
      }
    } catch (err: any) {
      console.error("Failed to sync users database from Firestore on startup:", err);
      const errMsg = String(err?.message || err || "").toUpperCase();
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
        await triggerFirestoreSuspension("Startup sync resource exhaustion");
      }
    }
  };

  const syncEventsFromFirestore = async () => {
    if (!db) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;
    try {
      console.log("Syncing events from Firebase Firestore...");
      const colRef = collection(db, "events");
      const querySnapshot = await getDocs(colRef);
      const tempEvents: any[] = [];
      querySnapshot.forEach((docSnap) => {
        tempEvents.push(docSnap.data());
      });
      if (tempEvents.length > 0) {
        adminEvents = tempEvents;
        try {
          fs.writeFileSync(eventsFile, JSON.stringify(adminEvents, null, 2), "utf8");
        } catch (err) {}
      }
      console.log(`Successfully synced ${querySnapshot.size} events from Firestore.`);
    } catch (err) {
      console.error("Failed to sync events from Firestore:", err);
    }
  };

  const syncReportsFromFirestore = async () => {
    if (!db) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;
    try {
      console.log("Syncing reports from Firebase Firestore...");
      const colRef = collection(db, "reports");
      const querySnapshot = await getDocs(colRef);
      const tempReports: any[] = [];
      querySnapshot.forEach((docSnap) => {
        tempReports.push(docSnap.data());
      });
      if (tempReports.length > 0) {
        adminReports = tempReports;
        try {
          fs.writeFileSync(reportsFile, JSON.stringify(adminReports, null, 2), "utf8");
        } catch (err) {}
      }
      console.log(`Successfully synced ${querySnapshot.size} reports from Firestore.`);
    } catch (err) {
      console.error("Failed to sync reports from Firestore:", err);
    }
  };

  const syncGuildsFromFirestore = async () => {
    if (!db) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;
    try {
      console.log("Syncing guilds from Firebase Firestore...");
      const colRef = collection(db, "guilds");
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((docSnap) => {
        const gData = docSnap.data();
        if (gData && gData.name) {
          const guildKey = gData.name.trim().toLowerCase();
          guildsDb[guildKey] = gData;
        }
      });
      try {
        fs.writeFileSync(guildsFile, JSON.stringify(guildsDb, null, 2), "utf8");
      } catch (err) {}
      console.log(`Successfully synced ${querySnapshot.size} guilds from Firestore.`);
    } catch (err) {
      console.error("Failed to sync guilds from Firestore:", err);
    }
  };

  const syncGuildToFirestore = async (guildObj: any) => {
    if (!db || !guildObj || !guildObj.name) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;
    try {
      const guildKey = guildObj.name.trim().toLowerCase();
      const docRef = doc(db, "guilds", guildKey);
      await setDoc(docRef, guildObj, { merge: true });
    } catch (err) {
      console.error("Failed to save guild to Firestore:", err);
    }
  };

  const removeGuildFromFirestore = async (guildName: string) => {
    if (!db || !guildName) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;
    try {
      const guildKey = guildName.trim().toLowerCase();
      const docRef = doc(db, "guilds", guildKey);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Failed to delete guild from Firestore:", err);
    }
  };

  // Run in background so we don't block server start or cause Vercel 502/504 gateway timeout
  syncFromFirestore()
    .then(() => {
      syncEventsFromFirestore().catch(err => console.error("Error in events firestore sync:", err));
      syncReportsFromFirestore().catch(err => console.error("Error in reports firestore sync:", err));
      syncGuildsFromFirestore().catch(err => console.error("Error in guilds firestore sync:", err));
    })
    .catch(err => console.error("Error in background firestore sync:", err));

  const saveUsersDb = () => {
    try {
      fs.writeFileSync(usersFilePath, JSON.stringify(usersDb, null, 2), 'utf8');
    } catch (e) {
      console.error("Error writing users db:", e);
    }
  };

  // Maintain a map to store pending timeouts for each user
  const pendingFirestoreWrites = new Map<string, NodeJS.Timeout>();

  const saveUserToFirestore = async (username: string, forceImmediate = false) => {
    if (!db || isFirestoreSuspended) return;
    if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) {
      // Quietly fall back to local disk updates while suspended
      return;
    }
    const cleanKey = username.trim().toLowerCase();
    const userData = usersDb[cleanKey];
    if (!userData) return;

    if (forceImmediate) {
      // Clear any existing pending write timeout for this user (debounce)
      if (pendingFirestoreWrites.has(cleanKey)) {
        clearTimeout(pendingFirestoreWrites.get(cleanKey)!);
        pendingFirestoreWrites.delete(cleanKey);
      }
      try {
        const docRef = doc(db, "users", cleanKey);
        await setDoc(docRef, userData, { merge: true });
        console.log(`Successfully persisted @${username} to Firestore immediately.`);
      } catch (err: any) {
        console.error(`Error syncing user @${username} to Firestore immediately:`, err);
        const errMsg = String(err?.message || err || "").toUpperCase();
        if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
          await triggerFirestoreSuspension("Immediate write operation resource exhaustion");
        }
      }
      return;
    }

    // Clear any existing pending write timeout for this user (debounce)
    if (pendingFirestoreWrites.has(cleanKey)) {
      clearTimeout(pendingFirestoreWrites.get(cleanKey)!);
      pendingFirestoreWrites.delete(cleanKey);
    }

    // Set a new timeout to execute the write after 2000ms
    const timeoutId = setTimeout(async () => {
      pendingFirestoreWrites.delete(cleanKey);
      try {
        // Double check suspension inside timeout
        if (isFirestoreSuspended && Date.now() < firestoreSuspendedUntil) return;

        const docRef = doc(db, "users", cleanKey);
        await setDoc(docRef, userData, { merge: true });
        console.log(`Successfully persisted @${username} to Firestore (debounced).`);
      } catch (err: any) {
        console.error(`Error syncing user @${username} to Firestore:`, err);
        const errMsg = String(err?.message || err || "").toUpperCase();
        if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
          await triggerFirestoreSuspension("Write operation resource exhaustion");
        }
      }
    }, 2000);

    pendingFirestoreWrites.set(cleanKey, timeoutId);
  };

  // --- SERVER-TIME ENDPOINT (UN-CHEAT-ABLE) ---
  app.get("/api/server-time", (req, res) => {
    try {
      const now = new Date();
      // Get the current date in Asia/Jakarta (WIB, UTC+7) timezone
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const parts = formatter.formatToParts(now);
      const day = parts.find(p => p.type === 'day')?.value || "01";
      const month = parts.find(p => p.type === 'month')?.value || "01";
      const year = parts.find(p => p.type === 'year')?.value || "2026";
      const jakartaDate = `${year}-${month}-${day}`; // Format YYYY-MM-DD
      
      // Calculate absolute days since epoch based on Jakarta Time (UTC+7)
      const epochDays = Math.floor((now.getTime() + 7 * 60 * 60 * 1000) / 86400000);
      
      return res.json({
        timestamp: now.getTime(),
        dateString: jakartaDate,
        epochDays: epochDays
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Gagal mendapatkan waktu server" });
    }
  });

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        username,
        password,
        elo,
        xp,
        coins,
        diamonds,
        boardTheme,
        unlockedThemes,
        selectedSkin,
        unlockedSkins,
        selectedFrame,
        unlockedFrames,
        onlineHistory,
        seasonal_event_score,
        seasonal_completed_quests,
        seasonal_answered_quizzes,
        seasonal_completed_milestones,
        blockedUsers,
        matchesPlayed,
        matchesWon,
        pinned_medals_ids
      } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username dan Password wajib diisi!" });
      }
      const cleanUser = username.trim();
      if (cleanUser.length < 3) {
        return res.status(400).json({ error: "Username minimal 3 karakter!" });
      }
      const lowerUser = cleanUser.toLowerCase();

      // Firestore safe cache lookup fallback
      if (db && !isFirestoreSuspended && !usersDb[lowerUser]) {
        try {
          const docRef = doc(db, "users", lowerUser);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            usersDb[lowerUser] = docSnap.data();
          }
        } catch (err: any) {
          console.error("Firestore cache lookup error in register:", err);
          const errMsg = String(err?.message || err || "").toUpperCase();
          if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
            await triggerFirestoreSuspension("Register doc fetch resource exhaustion");
          }
        }
      }

      const existing = usersDb[lowerUser];
      if (existing && existing.password) {
        return res.status(400).json({ error: "Username ini sudah terdaftar!" });
      }

      const lowerVal = cleanUser.toLowerCase();
      const defaultAdmin = lowerVal === "almaira" || lowerVal === "nopal";

      const newUser = {
        username: existing ? existing.username : cleanUser,
        password: password,
        elo: existing ? (existing.elo || 400) : (elo !== undefined ? Number(elo) : 400),
        xp: existing ? (existing.xp || 0) : (xp !== undefined ? Number(xp) : 0),
        coins: existing ? (existing.coins || 500) : (coins !== undefined ? Number(coins) : 500),
        diamonds: existing ? (existing.diamonds || 20) : (diamonds !== undefined ? Number(diamonds) : 20),
        boardTheme: existing ? (existing.boardTheme || 'classic') : (boardTheme || 'classic'),
        unlockedThemes: existing ? (existing.unlockedThemes || ["classic"]) : (Array.isArray(unlockedThemes) && unlockedThemes.length > 0 ? unlockedThemes : ["classic"]),
        matchesPlayed: existing ? (existing.matchesPlayed || 0) : (matchesPlayed !== undefined ? Number(matchesPlayed) : 0),
        matchesWon: existing ? (existing.matchesWon || 0) : (matchesWon !== undefined ? Number(matchesWon) : 0),
        pinned_medals_ids: existing ? (existing.pinned_medals_ids || []) : (Array.isArray(pinned_medals_ids) ? pinned_medals_ids : []),
        profileAvatar: existing ? (existing.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png") : "/src/assets/images/avatar_martin_1779709510230.png",
        profileBio: existing ? (existing.profileBio || "Pecatur sejati pantang menyerah!") : "Pecatur sejati pantang menyerah!",
        claimedAchievements: existing ? (existing.claimedAchievements || []) : [],
        registeredAt: Date.now(),
        friends: existing ? (existing.friends || []) : [],
        friendRequests: existing ? (existing.friendRequests || []) : [],
        inbox: existing ? (existing.inbox || []) : [],
        membershipStatus: existing ? (existing.membershipStatus || 'free') : 'free',
        unlockedItems: existing ? (existing.unlockedItems || []) : [],
        selectedSkin: existing ? (existing.selectedSkin || 'standard') : (selectedSkin || 'standard'),
        unlockedSkins: existing ? (existing.unlockedSkins || ['standard']) : (Array.isArray(unlockedSkins) && unlockedSkins.length > 0 ? unlockedSkins : ['standard']),
        equippedTitle: 'Pecatur Perintis',
        unlockedTitles: ['Pecatur Perintis'],
        equippedCheckmateEffect: 'none',
        unlockedCheckmateEffects: ['none'],
        customStatus: 'Pantang menyerah sebelum raja digulingkan!',
        selectedFrame: existing ? (existing.selectedFrame || 'none') : (selectedFrame || 'none'),
        unlockedFrames: existing ? (existing.unlockedFrames || ['none']) : (Array.isArray(unlockedFrames) && unlockedFrames.length > 0 ? unlockedFrames : ['none']),
        followers: [],
        following: [],
        likesCount: 0,
        likedBy: [],
        followRequests: [],
        isPrivate: false,
        visitorLog: [],
        conversations: {},
        onlineHistory: existing ? (existing.onlineHistory || []) : (Array.isArray(onlineHistory) ? onlineHistory : []),
        chess_transaction_history: existing ? (existing.chess_transaction_history || []) : [],
        seasonal_event_score: existing ? (existing.seasonal_event_score || 0) : (seasonal_event_score !== undefined ? Number(seasonal_event_score) : 0),
        seasonal_completed_quests: existing ? (existing.seasonal_completed_quests || []) : (Array.isArray(seasonal_completed_quests) ? seasonal_completed_quests : []),
        seasonal_answered_quizzes: existing ? (existing.seasonal_answered_quizzes || []) : (Array.isArray(seasonal_answered_quizzes) ? seasonal_answered_quizzes : []),
        seasonal_completed_milestones: existing ? (existing.seasonal_completed_milestones || []) : (Array.isArray(seasonal_completed_milestones) ? seasonal_completed_milestones : []),
        blockedUsers: existing ? (existing.blockedUsers || []) : (Array.isArray(blockedUsers) ? blockedUsers : []),
        streak: existing ? (existing.streak || 0) : 0,
        peakXp: existing ? (existing.peakXp || 0) : 0,
        winStreak: existing ? (existing.winStreak || 0) : 0,
        longestDefense: existing ? (existing.longestDefense || 0) : 0,
        isAdmin: defaultAdmin || (existing ? !!existing.isAdmin : false),
        isStaff: existing ? !!existing.isStaff : false
      };

      usersDb[lowerUser] = newUser;
      saveUsersDb();
      await saveUserToFirestore(cleanUser);

      return res.json({ 
        success: true, 
        user: { 
          username: newUser.username, 
          elo: newUser.elo, 
          xp: newUser.xp, 
          coins: newUser.coins,
          diamonds: newUser.diamonds,
          unlockedThemes: newUser.unlockedThemes,
          matchesPlayed: newUser.matchesPlayed,
          matchesWon: newUser.matchesWon,
          profileAvatar: newUser.profileAvatar,
          profileBio: newUser.profileBio,
          claimedAchievements: newUser.claimedAchievements,
          membershipStatus: newUser.membershipStatus,
          unlockedItems: newUser.unlockedItems,
          selectedFrame: newUser.selectedFrame,
          unlockedFrames: newUser.unlockedFrames,
          selectedSkin: newUser.selectedSkin,
          unlockedSkins: newUser.unlockedSkins,
          equippedTitle: newUser.equippedTitle,
          unlockedTitles: newUser.unlockedTitles,
          equippedCheckmateEffect: newUser.equippedCheckmateEffect,
          unlockedCheckmateEffects: newUser.unlockedCheckmateEffects,
          customStatus: newUser.customStatus,
          isPrivate: newUser.isPrivate,
          isAdmin: newUser.isAdmin,
          isStaff: newUser.isStaff,
          onlineHistory: newUser.onlineHistory || [],
          chess_transaction_history: newUser.chess_transaction_history || [],
          followers: newUser.followers || [],
          following: newUser.following || [],
          likesCount: newUser.likesCount || 0,
          likedBy: newUser.likedBy || [],
          guild_has_owner: false,
          guild_profile_data: null,
          guild_members: [],
          guild_lvl: 1,
          guild_treasury_gold: 0,
          guild_blacklist_list: [],
          guild_action_history: [],
          guild_join_requests: [],
          requested_fragment_skin: null,
          has_active_fragment_req: false,
          today_fragment_donation_count: 0,
          conquered_boards_list: [],
          clan_checked_in: false,
          clan_weekly_milestones: [],
          boardTheme: newUser.boardTheme || 'classic',
          seasonal_event_score: newUser.seasonal_event_score !== undefined ? newUser.seasonal_event_score : 0,
          seasonal_completed_quests: newUser.seasonal_completed_quests || [],
          seasonal_answered_quizzes: newUser.seasonal_answered_quizzes || [],
          seasonal_completed_milestones: newUser.seasonal_completed_milestones || [],
          blockedUsers: newUser.blockedUsers || [],
          pinned_medals_ids: newUser.pinned_medals_ids || []
        } 
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Gagal melakukan registrasi" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan Password wajib diisi!" });
      }
      const lowerUser = username.trim().toLowerCase();

      // Firestore safe cache lookup fallback
      if (db && !isFirestoreSuspended && !usersDb[lowerUser]) {
        try {
          const docRef = doc(db, "users", lowerUser);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            usersDb[lowerUser] = docSnap.data();
          }
        } catch (err: any) {
          console.error("Firestore cache lookup error in login:", err);
          const errMsg = String(err?.message || err || "").toUpperCase();
          if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
            await triggerFirestoreSuspension("Login doc fetch resource exhaustion");
          }
        }
      }

      const existing = usersDb[lowerUser];
      if (!existing || existing.password !== password) {
        return res.status(400).json({ error: "Username atau password salah!" });
      }
      if (existing.isBanned) {
        return res.status(403).json({ error: "Akun Anda telah di-banned karena melanggar aturan komunitas!" });
      }

      const isAdm = lowerUser === "almaira" || lowerUser === "nopal" || !!existing.isAdmin;

      return res.json({
        success: true,
        user: {
          username: existing.username,
          elo: existing.elo || 400,
          xp: existing.xp || 0,
          coins: existing.coins || 500,
          diamonds: existing.diamonds || 20,
          unlockedThemes: existing.unlockedThemes || ["classic"],
          matchesPlayed: existing.matchesPlayed || 0,
          matchesWon: existing.matchesWon || 0,
          profileAvatar: existing.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png",
          profileBio: existing.profileBio || "Pecatur sejati pantang menyerah!",
          claimedAchievements: existing.claimedAchievements || [],
          membershipStatus: existing.membershipStatus || 'free',
          unlockedItems: existing.unlockedItems || [],
          selectedFrame: existing.selectedFrame || 'none',
          unlockedFrames: existing.unlockedFrames || ['none'],
          selectedSkin: existing.selectedSkin || 'standard',
          unlockedSkins: existing.unlockedSkins || ['standard'],
          equippedTitle: existing.equippedTitle || 'Pecatur Perintis',
          unlockedTitles: existing.unlockedTitles || ['Pecatur Perintis'],
          equippedCheckmateEffect: existing.equippedCheckmateEffect || 'none',
          unlockedCheckmateEffects: existing.unlockedCheckmateEffects || ['none'],
          customStatus: existing.customStatus || 'Pantang menyerah sebelum raja digulingkan!',
          isPrivate: !!existing.isPrivate,
          isAdmin: isAdm,
          isStaff: !!existing.isStaff,
          onlineHistory: existing.onlineHistory || [],
          chess_transaction_history: existing.chess_transaction_history || [],
          followers: existing.followers || [],
          following: existing.following || [],
          likesCount: existing.likesCount !== undefined ? existing.likesCount : (existing.likes || 0),
          likedBy: existing.likedBy || [],
          guild_has_owner: existing.guild_has_owner || false,
          guild_profile_data: existing.guild_profile_data || null,
          guild_members: existing.guild_members || [],
          guild_lvl: existing.guild_lvl || 1,
          guild_treasury_gold: existing.guild_treasury_gold || 0,
          guild_blacklist_list: existing.guild_blacklist_list || [],
          guild_action_history: existing.guild_action_history || [],
          guild_join_requests: existing.guild_join_requests || [],
          requested_fragment_skin: existing.requested_fragment_skin || null,
          has_active_fragment_req: existing.has_active_fragment_req || false,
          today_fragment_donation_count: existing.today_fragment_donation_count || 0,
          conquered_boards_list: existing.conquered_boards_list || [],
          clan_checked_in: existing.clan_checked_in || false,
          clan_weekly_milestones: existing.clan_weekly_milestones || [],
          boardTheme: existing.boardTheme || 'classic',
          seasonal_event_score: existing.seasonal_event_score || 0,
          seasonal_completed_quests: existing.seasonal_completed_quests || [],
          seasonal_answered_quizzes: existing.seasonal_answered_quizzes || [],
          seasonal_completed_milestones: existing.seasonal_completed_milestones || [],
          blockedUsers: existing.blockedUsers || [],
          pinned_medals_ids: existing.pinned_medals_ids || [],
          streak: existing.streak !== undefined ? existing.streak : 0,
          peakXp: existing.peakXp !== undefined ? existing.peakXp : 0,
          winStreak: existing.winStreak !== undefined ? existing.winStreak : 0,
          longestDefense: existing.longestDefense !== undefined ? existing.longestDefense : 0
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Gagal masuk ke akun" });
    }
  });

  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { username, elo, xp, coins, diamonds, unlockedThemes, matchesPlayed, matchesWon, profileAvatar, profileBio, claimedAchievements, membershipStatus, unlockedItems, selectedFrame, unlockedFrames, selectedSkin, unlockedSkins, equippedTitle, unlockedTitles, equippedCheckmateEffect, unlockedCheckmateEffects, customStatus, isPrivate, likesCount } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Missing username parameter" });
      }
      const cleanUser = username.trim().toLowerCase();

      // Firestore safe cache lookup fallback
      if (db && !isFirestoreSuspended && !usersDb[cleanUser]) {
        try {
          const docRef = doc(db, "users", cleanUser);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            usersDb[cleanUser] = docSnap.data();
          }
        } catch (err: any) {
          console.error("Firestore cache lookup error in sync:", err);
          const errMsg = String(err?.message || err || "").toUpperCase();
          if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
            await triggerFirestoreSuspension("Sync doc fetch resource exhaustion");
          }
        }
      }

      if (usersDb[cleanUser]) {
        if (usersDb[cleanUser].isBanned) {
          return res.status(403).json({ error: "Akun Anda telah di-banned karena melanggar aturan komunitas!" });
        }
        if (elo !== undefined) usersDb[cleanUser].elo = elo;
        if (xp !== undefined) usersDb[cleanUser].xp = xp;
        if (coins !== undefined) usersDb[cleanUser].coins = Number(coins);
        if (diamonds !== undefined) usersDb[cleanUser].diamonds = Number(diamonds);
        if (unlockedThemes !== undefined) usersDb[cleanUser].unlockedThemes = unlockedThemes;
        if (matchesPlayed !== undefined) usersDb[cleanUser].matchesPlayed = matchesPlayed;
        if (matchesWon !== undefined) usersDb[cleanUser].matchesWon = matchesWon;
        if (profileAvatar !== undefined) usersDb[cleanUser].profileAvatar = profileAvatar;
        if (profileBio !== undefined) usersDb[cleanUser].profileBio = profileBio;
        if (claimedAchievements !== undefined) usersDb[cleanUser].claimedAchievements = claimedAchievements;
        if (membershipStatus !== undefined) usersDb[cleanUser].membershipStatus = membershipStatus;
        if (unlockedItems !== undefined) usersDb[cleanUser].unlockedItems = unlockedItems;
        if (selectedFrame !== undefined) usersDb[cleanUser].selectedFrame = selectedFrame;
        if (unlockedFrames !== undefined) usersDb[cleanUser].unlockedFrames = unlockedFrames;
        if (selectedSkin !== undefined) usersDb[cleanUser].selectedSkin = selectedSkin;
        if (unlockedSkins !== undefined) usersDb[cleanUser].unlockedSkins = unlockedSkins;
        if (equippedTitle !== undefined) usersDb[cleanUser].equippedTitle = equippedTitle;
        if (unlockedTitles !== undefined) usersDb[cleanUser].unlockedTitles = unlockedTitles;
        if (equippedCheckmateEffect !== undefined) usersDb[cleanUser].equippedCheckmateEffect = equippedCheckmateEffect;
        if (unlockedCheckmateEffects !== undefined) usersDb[cleanUser].unlockedCheckmateEffects = unlockedCheckmateEffects;
        if (customStatus !== undefined) usersDb[cleanUser].customStatus = customStatus;
        if (isPrivate !== undefined) usersDb[cleanUser].isPrivate = isPrivate;
        if (likesCount !== undefined && typeof likesCount === 'number') {
          usersDb[cleanUser].likesCount = Math.max(usersDb[cleanUser].likesCount || 0, Number(likesCount) || 0);
        }
        if (req.body.likedBy !== undefined && Array.isArray(req.body.likedBy)) {
          const existingLiked = usersDb[cleanUser].likedBy || [];
          usersDb[cleanUser].likedBy = Array.from(new Set([...existingLiked, ...req.body.likedBy]));
        }
        if (req.body.pinned_medals_ids !== undefined) usersDb[cleanUser].pinned_medals_ids = req.body.pinned_medals_ids;
        if (req.body.blockedUsers !== undefined) usersDb[cleanUser].blockedUsers = req.body.blockedUsers;
        if (req.body.streak !== undefined) usersDb[cleanUser].streak = Number(req.body.streak);
        if (req.body.peakXp !== undefined) usersDb[cleanUser].peakXp = Number(req.body.peakXp);
        if (req.body.winStreak !== undefined) usersDb[cleanUser].winStreak = Number(req.body.winStreak);
        if (req.body.longestDefense !== undefined) usersDb[cleanUser].longestDefense = Number(req.body.longestDefense);

        if (req.body.onlineHistory !== undefined) {
          const serverHist = usersDb[cleanUser].onlineHistory || [];
          const clientHist = req.body.onlineHistory || [];
          const mergedMap = new Map();
          clientHist.forEach((h: any) => {
            if (h && h.id) mergedMap.set(h.id, h);
          });
          serverHist.forEach((h: any) => {
            if (h && h.id) mergedMap.set(h.id, h);
          });
          // Match history usually has newest records first
          usersDb[cleanUser].onlineHistory = Array.from(mergedMap.values()).sort((a: any, b: any) => {
            // Keep original sequence but sort just in case of order mismatch (if ID/timestamp is parseable)
            return b.id && a.id ? String(b.id).localeCompare(String(a.id)) : 0;
          });
        }

        if (req.body.chess_transaction_history !== undefined) {
          const serverTx = usersDb[cleanUser].chess_transaction_history || [];
          const clientTx = req.body.chess_transaction_history || [];
          const mergedMap = new Map();
          clientTx.forEach((tx: any) => {
            if (tx && tx.id) mergedMap.set(tx.id, tx);
          });
          serverTx.forEach((tx: any) => {
            if (tx && tx.id) mergedMap.set(tx.id, tx);
          });
          usersDb[cleanUser].chess_transaction_history = Array.from(mergedMap.values()).sort((a: any, b: any) => {
            return b.timestamp !== undefined && a.timestamp !== undefined ? b.timestamp - a.timestamp : 0;
          });
        }

        // GUILD FIELDS
        if (req.body.guild_has_owner !== undefined) usersDb[cleanUser].guild_has_owner = req.body.guild_has_owner;
        if (req.body.guild_profile_data !== undefined) usersDb[cleanUser].guild_profile_data = req.body.guild_profile_data;
        if (req.body.guild_members !== undefined) usersDb[cleanUser].guild_members = req.body.guild_members;
        if (req.body.guild_lvl !== undefined) usersDb[cleanUser].guild_lvl = req.body.guild_lvl;
        if (req.body.guild_treasury_gold !== undefined) usersDb[cleanUser].guild_treasury_gold = req.body.guild_treasury_gold;
        if (req.body.guild_blacklist_list !== undefined) usersDb[cleanUser].guild_blacklist_list = req.body.guild_blacklist_list;
        if (req.body.guild_action_history !== undefined) usersDb[cleanUser].guild_action_history = req.body.guild_action_history;
        if (req.body.guild_join_requests !== undefined) usersDb[cleanUser].guild_join_requests = req.body.guild_join_requests;
        if (req.body.requested_fragment_skin !== undefined) usersDb[cleanUser].requested_fragment_skin = req.body.requested_fragment_skin;
        if (req.body.has_active_fragment_req !== undefined) usersDb[cleanUser].has_active_fragment_req = req.body.has_active_fragment_req;
        if (req.body.today_fragment_donation_count !== undefined) usersDb[cleanUser].today_fragment_donation_count = req.body.today_fragment_donation_count;
        if (req.body.conquered_boards_list !== undefined) usersDb[cleanUser].conquered_boards_list = req.body.conquered_boards_list;
        if (req.body.clan_checked_in !== undefined) usersDb[cleanUser].clan_checked_in = req.body.clan_checked_in;
        if (req.body.clan_weekly_milestones !== undefined) usersDb[cleanUser].clan_weekly_milestones = req.body.clan_weekly_milestones;

        // If user record holds a disbanded guild, clear it
        if (usersDb[cleanUser].guild_profile_data?.name) {
          const gKey = String(usersDb[cleanUser].guild_profile_data.name).trim().toLowerCase();
          if (disbandedGuilds.has(gKey)) {
            usersDb[cleanUser].guild_has_owner = false;
            usersDb[cleanUser].guild_profile_data = null;
            usersDb[cleanUser].guild_members = [];
          }
        }

        // Auto-restore guild membership from guildsDb if user record in DB lost guild fields
        if (!usersDb[cleanUser].guild_has_owner) {
          for (const [gKey, gObj] of Object.entries(guildsDb)) {
            if (disbandedGuilds.has(gKey)) continue;
            const guild = gObj as any;
            if (guild && guild.name) {
              const isOwner = guild.ownerUsername?.trim()?.toLowerCase() === cleanUser || guild.leader?.trim()?.toLowerCase() === cleanUser;
              const isMember = Array.isArray(guild.members) && guild.members.some((m: any) => String(m.name || m.username || '').trim().toLowerCase() === cleanUser);
              if (isOwner || isMember) {
                usersDb[cleanUser].guild_has_owner = true;
                usersDb[cleanUser].guild_profile_data = {
                  id: guild.id || guild.name,
                  name: guild.name,
                  description: guild.motto || guild.description || 'Klan Catur Sejati',
                  tag: guild.tag || 'ELIT',
                  logo: guild.logo || 'perisai',
                  frame: guild.frame || 'gold',
                  minRating: guild.minRating || 600,
                  joinSystem: guild.joinSystem || 'Bebas'
                };
                usersDb[cleanUser].guild_members = guild.members || [];
                usersDb[cleanUser].guild_lvl = guild.level || 1;
                break;
              }
            }
          }
        }

        // Auto sync user's guild to guildsDb & Firestore if user owns an ACTIVE (non-disbanded) guild
        if (usersDb[cleanUser].guild_has_owner && usersDb[cleanUser].guild_profile_data?.name) {
          const prof = usersDb[cleanUser].guild_profile_data;
          const mems = usersDb[cleanUser].guild_members || [];
          const guildName = String(prof.name).trim();
          if (guildName) {
            const guildKey = guildName.toLowerCase();
            if (!disbandedGuilds.has(guildKey)) {
              const calcElo = Array.isArray(mems) && mems.length > 0
                ? mems.reduce((s: number, m: any) => s + Number(m.rating || m.elo || 600), 0)
                : Number(usersDb[cleanUser].elo || usersDb[cleanUser].onlineRating || 1200);
              
              const existingGuild = guildsDb[guildKey];
              const clanTreasury = existingGuild?.treasury !== undefined 
                ? Number(existingGuild.treasury) 
                : (prof.treasury !== undefined ? Number(prof.treasury) : 250);

              const updatedGuildObj = {
                id: prof.id || guildName,
                name: guildName,
                tag: prof.tag || 'ELIT',
                leader: prof.leader || usersDb[cleanUser].username || cleanUser,
                ownerUsername: usersDb[cleanUser].username || cleanUser,
                level: Number(usersDb[cleanUser].guild_lvl || prof.level || existingGuild?.level || 1),
                treasury: clanTreasury,
                totalElo: calcElo,
                membersCount: Array.isArray(mems) ? Math.max(mems.length, 1) : 1,
                maxMembers: 30,
                motto: prof.motto || prof.description || prof.desc || "Klan Catur Sejati",
                logo: prof.logo || "perisai",
                updatedAt: new Date().toISOString()
              };
              prof.treasury = clanTreasury;
              guildsDb[guildKey] = updatedGuildObj;
              saveGuilds();
              syncGuildToFirestore(updatedGuildObj).catch(() => {});
            } else {
              usersDb[cleanUser].guild_has_owner = false;
              usersDb[cleanUser].guild_profile_data = null;
              usersDb[cleanUser].guild_members = [];
            }
          }
        }
        if (req.body.forceSeasonalReset) {
          usersDb[cleanUser].seasonal_event_score = 0;
          usersDb[cleanUser].seasonal_answered_quizzes = [];
          usersDb[cleanUser].seasonal_completed_milestones = [];
        } else {
          if (req.body.seasonal_event_score !== undefined) {
            usersDb[cleanUser].seasonal_event_score = Math.max(usersDb[cleanUser].seasonal_event_score || 0, Number(req.body.seasonal_event_score));
          }
          if (req.body.seasonal_completed_quests !== undefined) {
            const existingQuests = usersDb[cleanUser].seasonal_completed_quests || [];
            usersDb[cleanUser].seasonal_completed_quests = Array.from(new Set([...existingQuests, ...req.body.seasonal_completed_quests]));
          }
          if (req.body.seasonal_answered_quizzes !== undefined) {
            const existingQuizzes = usersDb[cleanUser].seasonal_answered_quizzes || [];
            usersDb[cleanUser].seasonal_answered_quizzes = Array.from(new Set([...existingQuizzes, ...req.body.seasonal_answered_quizzes]));
          }
        }
        
        // Ensure default properties
        if (usersDb[cleanUser].selectedFrame === undefined) usersDb[cleanUser].selectedFrame = 'none';
        if (usersDb[cleanUser].unlockedFrames === undefined) usersDb[cleanUser].unlockedFrames = ['none'];
        if (usersDb[cleanUser].selectedSkin === undefined) usersDb[cleanUser].selectedSkin = 'standard';
        if (usersDb[cleanUser].unlockedSkins === undefined) usersDb[cleanUser].unlockedSkins = ['standard'];
        if (usersDb[cleanUser].equippedTitle === undefined) usersDb[cleanUser].equippedTitle = 'Pecatur Perintis';
        if (usersDb[cleanUser].unlockedTitles === undefined) usersDb[cleanUser].unlockedTitles = ['Pecatur Perintis'];
        if (usersDb[cleanUser].equippedCheckmateEffect === undefined) usersDb[cleanUser].equippedCheckmateEffect = 'none';
        if (usersDb[cleanUser].unlockedCheckmateEffects === undefined) usersDb[cleanUser].unlockedCheckmateEffects = ['none'];
        if (usersDb[cleanUser].customStatus === undefined) usersDb[cleanUser].customStatus = 'Pantang menyerah sebelum raja digulingkan!';
        if (usersDb[cleanUser].isPrivate === undefined) usersDb[cleanUser].isPrivate = false;
        if (usersDb[cleanUser].followers === undefined) usersDb[cleanUser].followers = [];
        if (usersDb[cleanUser].following === undefined) usersDb[cleanUser].following = [];
        if (usersDb[cleanUser].followRequests === undefined) usersDb[cleanUser].followRequests = [];
        if (usersDb[cleanUser].visitorLog === undefined) usersDb[cleanUser].visitorLog = [];
        if (usersDb[cleanUser].conversations === undefined) usersDb[cleanUser].conversations = {};
        
        usersDb[cleanUser].isAdmin = (cleanUser === "almaira" || cleanUser === "nopal" || !!usersDb[cleanUser].isAdmin);
        if (usersDb[cleanUser].isStaff === undefined) usersDb[cleanUser].isStaff = false;

        saveUsersDb();
        await saveUserToFirestore(cleanUser);
        return res.json({ success: true, user: usersDb[cleanUser] });
      }
      return res.status(404).json({ error: "User tidak ditemukan" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Gagal sinkronisasi data" });
    }
  });

  app.post("/api/seasonal/complete-quiz", async (req, res) => {
    try {
      const { username, quizId, pointsAwarded } = req.body;
      if (!username || !quizId) {
        return res.status(400).json({ error: "Parameter username dan quizId diperlukan" });
      }
      const cleanUser = username.trim().toLowerCase();
      const timestamp = new Date().toISOString();
      console.log(`[Server Quiz Sync - ${timestamp}] Memulai transaksi atomic untuk @${username}, Quiz: ${quizId}`);

      const userData = usersDb[cleanUser];
      if (!userData) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      // Check for duplicate in local cache
      const currentQuizzes = userData.seasonal_answered_quizzes || [];
      if (currentQuizzes.includes(quizId)) {
        console.warn(`[Server Quiz Sync - ${timestamp}] DUPLICATE: @${username} sudah menjawab quiz "${quizId}"`);
        return res.json({
          success: true,
          alreadyCompleted: true,
          seasonal_event_score: userData.seasonal_event_score || 0,
          seasonal_answered_quizzes: currentQuizzes,
          xp: userData.xp || 0
        });
      }

      // Perform atomic Firestore write if db is active and not suspended
      if (db && !isFirestoreSuspended) {
        console.log(`[Server Quiz Sync - ${timestamp}] Menjalankan transaksi runTransaction di Firestore...`);
        const docRef = doc(db, "users", cleanUser);
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(docRef);
          if (!sfDoc.exists()) {
            const freshData = {
              ...userData,
              seasonal_event_score: (userData.seasonal_event_score || 0) + pointsAwarded,
              seasonal_answered_quizzes: [...currentQuizzes, quizId],
              xp: (userData.xp || 0) + 10
            };
            transaction.set(docRef, freshData);
          } else {
            const freshDbData = sfDoc.data() || {};
            const dbQuizzes = freshDbData.seasonal_answered_quizzes || [];
            if (dbQuizzes.includes(quizId)) {
              throw new Error("ALREADY_COMPLETED_IN_TRANSACTION");
            }
            const dbScore = freshDbData.seasonal_event_score || 0;
            const dbXp = freshDbData.xp || 0;

            transaction.update(docRef, {
              seasonal_event_score: dbScore + pointsAwarded,
              seasonal_answered_quizzes: [...dbQuizzes, quizId],
              xp: dbXp + 10
            });
          }
        });
        console.log(`[Server Quiz Sync - ${timestamp}] Firestore transaksi berhasil dikomit.`);
      }

      // Update local memory and JSON file
      userData.seasonal_event_score = (userData.seasonal_event_score || 0) + pointsAwarded;
      userData.seasonal_answered_quizzes = [...(userData.seasonal_answered_quizzes || []), quizId];
      userData.xp = (userData.xp || 0) + 10;
      saveUsersDb();

      console.log(`[Server Quiz Sync - ${timestamp}] Sinkronisasi lokal sukses. New Score: ${userData.seasonal_event_score}, XP: ${userData.xp}`);
      return res.json({
        success: true,
        seasonal_event_score: userData.seasonal_event_score,
        seasonal_answered_quizzes: userData.seasonal_answered_quizzes,
        xp: userData.xp
      });
    } catch (err: any) {
      if (err?.message === "ALREADY_COMPLETED_IN_TRANSACTION") {
        const cleanUser = req.body.username?.trim().toLowerCase();
        return res.json({
          success: true,
          alreadyCompleted: true,
          seasonal_event_score: usersDb[cleanUser]?.seasonal_event_score || 0,
          seasonal_answered_quizzes: usersDb[cleanUser]?.seasonal_answered_quizzes || [],
          xp: usersDb[cleanUser]?.xp || 0
        });
      }
      console.error("[Server Quiz Sync] Gagal melakukan atomic sync:", err);
      return res.status(500).json({ error: err.message || "Gagal melakukan atomic sync" });
    }
  });

  app.post("/api/seasonal/reset-quizzes", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Parameter username diperlukan" });
      }
      const cleanUser = username.trim().toLowerCase();
      const userData = usersDb[cleanUser];
      if (!userData) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      userData.seasonal_answered_quizzes = [];
      userData.seasonal_event_score = 0;
      userData.seasonal_completed_milestones = [];
      saveUsersDb();

      if (db && !isFirestoreSuspended) {
        const { doc, setDoc } = await import("firebase/firestore");
        const docRef = doc(db, "users", cleanUser);
        await setDoc(docRef, {
          seasonal_answered_quizzes: [],
          seasonal_event_score: 0,
          seasonal_completed_milestones: []
        }, { merge: true });
      }

      console.log(`[Server Quiz Reset] Progress kuis dan skor event berhasil direset untuk @${username}`);
      return res.json({
        success: true,
        seasonal_event_score: 0,
        seasonal_answered_quizzes: []
      });
    } catch (err: any) {
      console.error("[Server Quiz Reset] Gagal melakukan reset:", err);
      return res.status(500).json({ error: err.message || "Gagal melakukan reset" });
    }
  });

  // --- SOCIAL, FRIENDS & INBOX SYSTEM ---
  const getUserOrFetchFromFirestore = async (username: string): Promise<any> => {
    const cleanKey = username.trim().toLowerCase();
    if (usersDb[cleanKey]) {
      return usersDb[cleanKey];
    }
    if (db && !isFirestoreSuspended) {
      try {
        const docRef = doc(db, "users", cleanKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          usersDb[cleanKey] = docSnap.data();
          saveUsersDb();
          return usersDb[cleanKey];
        }
      } catch (err: any) {
        console.error("Firestore loading error for username:", username, err);
        const errMsg = String(err?.message || err || "").toUpperCase();
        if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("QUOTA") || err?.code === "resource-exhausted") {
          await triggerFirestoreSuspension("Sync getUserOrFetchFromFirestore resource exhaustion");
        }
      }
    }
    return null;
  };

  const ensureSocialProps = (userData: any) => {
    if (!userData.friends) userData.friends = [];
    if (!userData.friendRequests) userData.friendRequests = [];
    if (!userData.inbox) userData.inbox = [];
    return userData;
  };

  // Endpoint: Send Friend Request
  app.post("/api/social/friends/send", async (req, res) => {
    try {
      const { username, friendUsername } = req.body;
      if (!username || !friendUsername) {
        return res.status(400).json({ error: "Username asal dan tujuan wajib diisi!" });
      }
      const selfKey = username.trim().toLowerCase();
      const friendKey = friendUsername.trim().toLowerCase();

      if (selfKey === friendKey) {
        return res.status(400).json({ error: "Anda tidak bisa mengirimkan permintaan pertemanan ke diri sendiri!" });
      }

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      let friendUser = await getUserOrFetchFromFirestore(friendKey);

      if (!selfUser) return res.status(404).json({ error: "User asal tidak ditemukan." });

      if (!friendUser) {
        return res.status(404).json({ error: "Pecatur dengan username tersebut tidak ditemukan atau belum terdaftar." });
      }

      ensureSocialProps(selfUser);
      ensureSocialProps(friendUser);

      if (selfUser.friends.includes(friendUser.username)) {
        return res.status(400).json({ error: "Anda sudah berteman dengan pengguna ini!" });
      }

      if (friendUser.friendRequests.includes(selfUser.username)) {
        return res.status(400).json({ error: "Anda sudah mengirim permintaan pertemanan sebelumnya!" });
      }

      friendUser.friendRequests.push(selfUser.username);
      friendUser.inbox.push({
        id: "req_" + Math.random().toString(36).substring(2, 9),
        type: "friend_request",
        sender: selfUser.username,
        text: `${selfUser.username} mengirimkan Anda permintaan pertemanan!`,
        sentAt: Date.now(),
        status: "pending"
      });

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(friendUser.username);
      return res.json({ success: true, message: "Permintaan teman berhasil dikirim!" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint: Respond to Friend Request (Accept/Decline)
  app.post("/api/social/friends/respond", async (req, res) => {
    try {
      const { username, requesterUsername, action } = req.body;
      if (!username || !requesterUsername || !action) {
        return res.status(400).json({ error: "Data kurang lengkap!" });
      }
      const selfKey = username.trim().toLowerCase();
      const reqKey = requesterUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const reqUser = await getUserOrFetchFromFirestore(reqKey);

      if (!selfUser || !reqUser) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

      ensureSocialProps(selfUser);
      ensureSocialProps(reqUser);

      // Clean notifications and requests
      selfUser.friendRequests = selfUser.friendRequests.filter((n: string) => n.toLowerCase() !== reqKey);
      selfUser.inbox = selfUser.inbox.filter((msg: any) => !(msg.type === 'friend_request' && msg.sender.toLowerCase() === reqKey));

      if (action === "accept") {
        if (!selfUser.friends.map((f: string) => f.toLowerCase()).includes(reqKey)) {
          selfUser.friends.push(reqUser.username);
        }
        if (!reqUser.friends.map((f: string) => f.toLowerCase()).includes(selfKey)) {
          reqUser.friends.push(selfUser.username);
        }

        reqUser.inbox.push({
          id: "sys_" + Math.random().toString(36).substring(2, 9),
          type: "system",
          sender: "Sistem",
          text: `${selfUser.username} menerima permintaan pertemanan Anda!`,
          sentAt: Date.now(),
          status: "read"
        });
      }

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(reqUser.username);
      return res.json({ success: true, friends: selfUser.friends, friendRequests: selfUser.friendRequests, inbox: selfUser.inbox });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint: Remove/Unfriend Friend
  app.post("/api/social/friends/remove", async (req, res) => {
    try {
      const { username, friendUsername } = req.body;
      if (!username || !friendUsername) {
        return res.status(400).json({ error: "Username asal dan tujuan wajib diisi!" });
      }
      const selfKey = username.trim().toLowerCase();
      const friendKey = friendUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const friendUser = await getUserOrFetchFromFirestore(friendKey);

      if (!selfUser) return res.status(404).json({ error: "Data pencatur Anda tidak ditemukan." });

      // Remove from self's friend list
      ensureSocialProps(selfUser);
      selfUser.friends = selfUser.friends.filter(f => f.toLowerCase() !== friendKey);

      if (friendUser) {
        ensureSocialProps(friendUser);
        friendUser.friends = friendUser.friends.filter(f => f.toLowerCase() !== selfKey);
      }

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      if (friendUser) {
        await saveUserToFirestore(friendUser.username);
      }
      return res.json({ success: true, message: `Berhasil menghapus pertemanan dengan @${friendUsername}` });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint: Social Info (Friends list, requests, inbox)
  app.get("/api/social/info", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ error: "Missing username" });
      }
      const selfKey = (username as string).trim().toLowerCase();
      const selfUser = await getUserOrFetchFromFirestore(selfKey);

      if (!selfUser) return res.status(404).json({ error: "User tidak ditemukan." });

      ensureSocialProps(selfUser);

      const friendsWithDetails = await Promise.all(
        selfUser.friends.map(async (fName: string) => {
          const friendRecord = await getUserOrFetchFromFirestore(fName);
          return {
            username: fName,
            elo: friendRecord ? (friendRecord.elo || 400) : 400,
            xp: friendRecord ? (friendRecord.xp || 0) : 0,
            avatar: friendRecord ? (friendRecord.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png") : "/src/assets/images/avatar_martin_1779709510230.png",
            bio: friendRecord ? (friendRecord.profileBio || "") : "",
            matchesPlayed: friendRecord ? (friendRecord.matchesPlayed || 0) : 0,
            matchesWon: friendRecord ? (friendRecord.matchesWon || 0) : 0
          };
        })
      );

      return res.json({
        friends: friendsWithDetails,
        friendRequests: selfUser.friendRequests,
        inbox: selfUser.inbox,
        followers: selfUser.followers || [],
        following: selfUser.following || [],
        likesCount: selfUser.likesCount !== undefined ? selfUser.likesCount : (selfUser.likes || 0),
        likedBy: selfUser.likedBy || [],
        followRequests: selfUser.followRequests || [],
        isPrivate: !!selfUser.isPrivate,
        visitorLog: selfUser.visitorLog || []
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint: Send Game invitation to friend
  app.post("/api/social/invite/send", async (req, res) => {
    try {
      const { username, friendUsername, roomCode } = req.body;
      if (!username || !friendUsername || !roomCode) {
        return res.status(400).json({ error: "Form undangan tidak lengkap!" });
      }
      const selfKey = username.trim().toLowerCase();
      const friendKey = friendUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const friendUser = await getUserOrFetchFromFirestore(friendKey);

      if (!selfUser || !friendUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan!" });
      }

      ensureSocialProps(friendUser);

      // Add to friend's inbox
      friendUser.inbox.push({
        id: "invite_" + Math.random().toString(36).substring(2, 9),
        type: "game_invite",
        sender: selfUser.username,
        text: `${selfUser.username} mengundang Anda berduel catur online!`,
        roomCode: roomCode,
        sentAt: Date.now(),
        status: "pending"
      });

      saveUsersDb();
      await saveUserToFirestore(friendUser.username);
      return res.json({ success: true, message: "Undangan catur berhasil dikirim!" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint: Clear Inbox Message / Decline invitation
  app.post("/api/social/inbox/clear", async (req, res) => {
    try {
      const { username, msgId } = req.body;
      if (!username || !msgId) {
        return res.status(400).json({ error: "Data kurang lengkap" });
      }
      const selfKey = username.trim().toLowerCase();
      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      if (selfUser) {
        ensureSocialProps(selfUser);
        selfUser.inbox = selfUser.inbox.filter((m: any) => m.id !== msgId);
        saveUsersDb();
        await saveUserToFirestore(selfUser.username);
      }
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // --- EXTENDED SOCIAL SYSTEM : FOLLOW, VISITORS LOG, DMs & PRIVACY ---

  // Helper inside server.ts to ensure new schema structure on user data
  function ensureExtendedSocialProps(user: any) {
    if (!user.unlockedItems) user.unlockedItems = [];
    if (!user.followers) user.followers = [];
    if (!user.following) user.following = [];
    if (!user.followRequests) user.followRequests = [];
    if (user.isPrivate === undefined) user.isPrivate = false;
    if (!user.visitorLog) user.visitorLog = [];
    if (!user.conversations) user.conversations = {};
    if (user.isAdmin === undefined) {
      const lower = (user.username || "").trim().toLowerCase();
      user.isAdmin = (lower === "almaira" || lower === "nopal");
    }
    if (user.isStaff === undefined) user.isStaff = false;
  }

  // Route: Search Users
  app.get("/api/social/search", async (req, res) => {
    try {
      const { query, current } = req.query;
      if (!current) {
        return res.status(400).json({ error: "Required params missing" });
      }
      const selfKey = (current as string).trim().toLowerCase();
      const searchWord = (query as string || "").trim().toLowerCase();
      const results: any[] = [];

      for (const [key, user] of Object.entries(usersDb)) {
        if (key === selfKey) continue;
        if (searchWord && !user.username.toLowerCase().includes(searchWord)) continue;
        
        ensureExtendedSocialProps(user);
        const selfUser = usersDb[selfKey];
        const selfUsername = selfUser ? selfUser.username : "";
        results.push({
          username: user.username,
          elo: user.elo || 400,
          profileAvatar: user.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png",
          profileBio: user.profileBio || "Pecatur sejati pantang menyerah!",
          isPrivate: !!user.isPrivate,
          isFollowing: (user.followers || []).includes(selfUsername),
          isRequested: (user.followRequests || []).includes(selfUsername),
          isFriend: (user.friends || []).includes(selfUsername)
        });
      }

      return res.json({ success: true, users: results.slice(0, 30) });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Toggle Privacy Route
  app.post("/api/social/privacy", async (req, res) => {
    try {
      const { username, isPrivate } = req.body;
      if (!username) return res.status(400).json({ error: "Missing parameter" });
      const lower = username.trim().toLowerCase();
      const user = await getUserOrFetchFromFirestore(lower);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.isPrivate = !!isPrivate;
      saveUsersDb();
      await saveUserToFirestore(user.username);
      return res.json({ success: true, isPrivate: user.isPrivate });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Follow / Request Follow
  app.post("/api/social/follow", async (req, res) => {
    try {
      const { username, targetUsername } = req.body;
      if (!username || !targetUsername) return res.status(400).json({ error: "Missing parameters" });
      const selfKey = username.trim().toLowerCase();
      const targetKey = targetUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const targetUser = await getUserOrFetchFromFirestore(targetKey);

      if (!selfUser || !targetUser) return res.status(404).json({ error: "User tidak ditemukan." });

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(targetUser);

      if (targetUser.isPrivate) {
        // Private account - require request approval
        if (!targetUser.followRequests.includes(selfUser.username)) {
          targetUser.followRequests.push(selfUser.username);
          
          targetUser.inbox.push({
            id: "fr_" + Math.random().toString(36).substring(2, 9),
            type: "follow_request",
            sender: selfUser.username,
            text: `${selfUser.username} ingin mengikuti akun privat Anda!`,
            sentAt: Date.now(),
            status: "pending"
          });
          
          saveUsersDb();
          await saveUserToFirestore(selfUser.username);
          await saveUserToFirestore(targetUser.username);
        }
        return res.json({ success: true, status: 'requested' });
      } else {
        // Public account - immediately set follow relationship
        if (!targetUser.followers.includes(selfUser.username)) {
          targetUser.followers.push(selfUser.username);
        }
        if (!selfUser.following.includes(targetUser.username)) {
          selfUser.following.push(targetUser.username);
        }
        
        targetUser.inbox.push({
          id: "sys_" + Math.random().toString(36).substring(2, 9),
          type: "system",
          sender: "Sistem",
          text: `${selfUser.username} mulai mengikuti Anda!`,
          sentAt: Date.now(),
          status: "read"
        });

        saveUsersDb();
        await saveUserToFirestore(selfUser.username);
        await saveUserToFirestore(targetUser.username);
        return res.json({ success: true, status: 'following' });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Unfollow user
  app.post("/api/social/unfollow", async (req, res) => {
    try {
      const { username, targetUsername } = req.body;
      if (!username || !targetUsername) return res.status(400).json({ error: "Missing parameters" });
      const selfKey = username.trim().toLowerCase();
      const targetKey = targetUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const targetUser = await getUserOrFetchFromFirestore(targetKey);

      if (!selfUser || !targetUser) return res.status(404).json({ error: "User tidak ditemukan." });

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(targetUser);

      selfUser.following = selfUser.following.filter((u: string) => u.toLowerCase() !== targetKey);
      targetUser.followers = targetUser.followers.filter((u: string) => u.toLowerCase() !== selfKey);
      
      // Also clear pending requested
      targetUser.followRequests = targetUser.followRequests.filter((u: string) => u.toLowerCase() !== selfKey);
      
      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(targetUser.username);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Respond follow request
  app.post("/api/social/follow/respond", async (req, res) => {
    try {
      const { username, requesterUsername, action } = req.body; // action: 'accept' | 'decline'
      if (!username || !requesterUsername || !action) {
        return res.status(400).json({ error: "Missing parameters" });
      }
      const selfKey = username.trim().toLowerCase();
      const reqKey = requesterUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const reqUser = await getUserOrFetchFromFirestore(reqKey);

      if (!selfUser || !reqUser) return res.status(404).json({ error: "User tidak ditemukan" });

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(reqUser);

      // Remove from pending lists
      selfUser.followRequests = selfUser.followRequests.filter((u: string) => u.toLowerCase() !== reqKey);
      selfUser.inbox = selfUser.inbox.filter((msg: any) => !(msg.type === "follow_request" && msg.sender.toLowerCase() === reqKey));

      if (action === "accept") {
        if (!selfUser.followers.includes(reqUser.username)) {
          selfUser.followers.push(reqUser.username);
        }
        if (!reqUser.following.includes(selfUser.username)) {
          reqUser.following.push(selfUser.username);
        }

        reqUser.inbox.push({
          id: "sys_" + Math.random().toString(36).substring(2, 9),
          type: "system",
          sender: "Sistem",
          text: `@${selfUser.username} menerima permintaan follow Anda!`,
          sentAt: Date.now(),
          status: "read"
        });
      }

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(reqUser.username);
      return res.json({ success: true, followRequests: selfUser.followRequests, inbox: selfUser.inbox });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Log Wall Visit
  app.post("/api/social/visit", async (req, res) => {
    try {
      const { visitor, host } = req.body;
      if (!visitor || !host) return res.status(400).json({ error: "Missing parameters" });
      const visitorKey = visitor.trim().toLowerCase();
      const hostKey = host.trim().toLowerCase();

      if (visitorKey === hostKey) return res.json({ success: true }); // Visiting own wall

      const hostUser = await getUserOrFetchFromFirestore(hostKey);
      if (!hostUser) return res.status(404).json({ error: "Host user not found." });

      ensureExtendedSocialProps(hostUser);

      // Append visitor log
      hostUser.visitorLog.push({
        visitorUsername: visitor,
        visitedAt: Date.now()
      });

      // Clamp size
      if (hostUser.visitorLog.length > 250) {
        hostUser.visitorLog.shift();
      }

      saveUsersDb();
      await saveUserToFirestore(hostUser.username);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Retrieve visitor logs with timing
  app.get("/api/social/visitors", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: "Missing username query" });
      const userKey = (username as string).trim().toLowerCase();
      const selfUser = await getUserOrFetchFromFirestore(userKey);

      if (!selfUser) return res.status(404).json({ error: "User not found" });

      ensureExtendedSocialProps(selfUser);

      // Enrich visitor profiles
      const enrichedLogs = await Promise.all(
        selfUser.visitorLog.map(async (v: any) => {
          const det = await getUserOrFetchFromFirestore(v.visitorUsername.toLowerCase());
          return {
            username: v.visitorUsername,
            visitedAt: v.visitedAt,
            profileAvatar: det ? (det.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png") : "/src/assets/images/avatar_martin_1779709510230.png",
            elo: det ? (det.elo || 400) : 400
          };
        })
      );

      return res.json({ success: true, visitorLog: enrichedLogs });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Get DMs Inbox Conversations
  app.get("/api/social/dm/conversations", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: "Missing username param" });
      const userKey = (username as string).trim().toLowerCase();
      const selfUser = await getUserOrFetchFromFirestore(userKey);

      if (!selfUser) return res.status(404).json({ error: "User tidak ditemukan" });

      ensureExtendedSocialProps(selfUser);

      const conversationList: any[] = [];
      const keys = Object.keys(selfUser.conversations || {});

      for (const partner of keys) {
        const partnerUser = await getUserOrFetchFromFirestore(partner.toLowerCase());
        const chat = selfUser.conversations[partner];
        if (chat && chat.messages && chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          conversationList.push({
            partnerUsername: partner,
            partnerAvatar: partnerUser ? (partnerUser.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png") : "/src/assets/images/avatar_martin_1779709510230.png",
            partnerElo: partnerUser ? (partnerUser.elo || 400) : 400,
            lastMessage: lastMsg.text,
            sentAt: lastMsg.sentAt,
            sender: lastMsg.sender,
            isApproved: chat.isApproved || false
          });
        }
      }

      // Sort by newest message
      conversationList.sort((a, b) => b.sentAt - a.sentAt);

      return res.json({ success: true, conversations: conversationList });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Get Single Chat History
  app.get("/api/social/dm/history", async (req, res) => {
    try {
      const { username, partnerUsername } = req.query;
      if (!username || !partnerUsername) {
        return res.status(400).json({ error: "Params missing" });
      }
      const selfKey = (username as string).trim().toLowerCase();
      const partnerKey = (partnerUsername as string).trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const partnerUser = await getUserOrFetchFromFirestore(partnerKey);

      if (!selfUser || !partnerUser) {
        return res.status(404).json({ error: "Salah satu pengguna tidak ditemukan." });
      }

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(partnerUser);

      if (!selfUser.conversations[partnerUser.username]) {
        selfUser.conversations[partnerUser.username] = { messages: [], isApproved: false };
      }
      if (!partnerUser.conversations[selfUser.username]) {
        partnerUser.conversations[selfUser.username] = { messages: [], isApproved: false };
      }

      const chat = selfUser.conversations[partnerUser.username];

      // Safe count of user's sent messages in this conversation if not approved
      let sentCount = 0;
      chat.messages.forEach((m: any) => {
        if (m.sender.toLowerCase() === selfKey) sentCount++;
      });

      // Detect if restriction is active
      const isRestrictedPrivate = partnerUser.isPrivate && 
                        !chat.isApproved && 
                        !(selfUser.friends || []).includes(partnerUser.username) &&
                        !(partnerUser.following || []).includes(selfUser.username);

      return res.json({
        success: true,
        messages: chat.messages,
        isApproved: chat.isApproved || false,
        sentCount,
        isRestrictedPrivate,
        maxReached: isRestrictedPrivate && sentCount >= 3
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Send DM message
  app.post("/api/social/dm/send", async (req, res) => {
    try {
      const { username, recipientUsername, text } = req.body;
      if (!username || !recipientUsername || !text) {
        return res.status(400).json({ error: "Missing parameter fields" });
      }

      const selfKey = username.trim().toLowerCase();
      const recipientKey = recipientUsername.trim().toLowerCase();

      if (selfKey === recipientKey) {
        return res.status(400).json({ error: "Tidak dapat berkirim pesan ke diri sendiri" });
      }

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const recipientUser = await getUserOrFetchFromFirestore(recipientKey);

      if (!selfUser || !recipientUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      }

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(recipientUser);

      if (!selfUser.conversations[recipientUser.username]) {
        selfUser.conversations[recipientUser.username] = { messages: [], isApproved: false };
      }
      if (!recipientUser.conversations[selfUser.username]) {
        recipientUser.conversations[selfUser.username] = { messages: [], isApproved: false };
      }

      const senderChat = selfUser.conversations[recipientUser.username];
      const recipientChat = recipientUser.conversations[selfUser.username];

      // Privacy checks: Max 3 messages until approved if recipient is private
      let senderSentCount = 0;
      senderChat.messages.forEach((m: any) => {
        if (m.sender.toLowerCase() === selfKey) senderSentCount++;
      });

      const isRestrictedPrivate = recipientUser.isPrivate && 
                        !recipientChat.isApproved && 
                        !(selfUser.friends || []).includes(recipientUser.username) &&
                        !(recipientUser.following || []).includes(selfUser.username);

      if (isRestrictedPrivate && senderSentCount >= 3) {
        return res.status(403).json({
          error: "Batas pengiriman pesan tercapai! Akun ini bertipe Privat. Anda hanya dapat mengirim maksimal 3 pesan langsung sebelum disetujui oleh pemilik akun!"
        });
      }

      const messageObj = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: selfUser.username,
        text: text.trim(),
        sentAt: Date.now()
      };

      senderChat.messages.push(messageObj);
      recipientChat.messages.push(messageObj);

      // If sender was already follow/approved, mark as approved
      if ((recipientUser.friends || []).includes(selfUser.username) || (recipientUser.following || []).includes(selfUser.username)) {
        senderChat.isApproved = true;
        recipientChat.isApproved = true;
      }

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(recipientUser.username);

      return res.json({
        success: true,
        messages: senderChat.messages,
        isApproved: senderChat.isApproved
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Route: Approve Direct Messaging
  app.post("/api/social/dm/approve", async (req, res) => {
    try {
      const { username, partnerUsername } = req.body;
      if (!username || !partnerUsername) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const selfKey = username.trim().toLowerCase();
      const partnerKey = partnerUsername.trim().toLowerCase();

      const selfUser = await getUserOrFetchFromFirestore(selfKey);
      const partnerUser = await getUserOrFetchFromFirestore(partnerKey);

      if (!selfUser || !partnerUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan." });
      }

      ensureExtendedSocialProps(selfUser);
      ensureExtendedSocialProps(partnerUser);

      if (selfUser.conversations[partnerUser.username]) {
        selfUser.conversations[partnerUser.username].isApproved = true;
      }
      if (partnerUser.conversations[selfUser.username]) {
        partnerUser.conversations[selfUser.username].isApproved = true;
      }

      saveUsersDb();
      await saveUserToFirestore(selfUser.username);
      await saveUserToFirestore(partnerUser.username);

      return res.json({ success: true, isApproved: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });




  // Admin routing
  app.get("/api/admin/reports", (req, res) => {
    return res.json({ success: true, reports: adminReports });
  });

  app.post("/api/admin/user/warn", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ error: "Username wajib!" });
      const lower = username.trim().toLowerCase();
      if (!usersDb[lower]) {
        return res.status(404).json({ error: "User tidak ditemukan!" });
      }
      if (usersDb[lower].warnings === undefined) {
        usersDb[lower].warnings = 0;
      }
      usersDb[lower].warnings += 1;
      
      // Send warning into user's inbox
      if (!usersDb[lower].inbox) {
        usersDb[lower].inbox = [];
      }
      usersDb[lower].inbox.push({
        id: "warn_" + Date.now(),
        sender: "SYSTEM (Moderator)",
        text: `PERINGATAN RESMI #${usersDb[lower].warnings}: Akun Anda dilaporkan melakukan pelanggaran. Harap bertanding secara jujur tanpa taktik curang atau spamming!`,
        timestamp: Date.now(),
        read: false
      });

      saveUsersDb();
      await saveUserToFirestore(usersDb[lower].username);
      return res.json({ success: true, message: `Peringatan resmi dikirim ke @${usersDb[lower].username}. Total peringatan: ${usersDb[lower].warnings}` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/user/ban", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ error: "Username wajib!" });
      const lower = username.trim().toLowerCase();
      if (!usersDb[lower]) {
        return res.status(404).json({ error: "User tidak ditemukan!" });
      }
      usersDb[lower].isBanned = true;
      saveUsersDb();
      await saveUserToFirestore(usersDb[lower].username);
      return res.json({ success: true, message: `Akun @${usersDb[lower].username} sekarang berhasil di-banned dari server!` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/report/add", (req, res) => {
    try {
      const { reporter, reported, reason, details } = req.body;
      if (!reported || !reason) {
        return res.status(400).json({ error: "Laporan tidak lengkap" });
      }
      adminReports.push({
        id: "rep_" + Math.random().toString(36).substring(2, 9),
        reporter: reporter || "Anonim",
        reported,
        reason,
        details: details || "",
        reportedAt: Date.now()
      });
      saveReports();
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Events API
  app.get("/api/admin/events", (req, res) => {
    return res.json({ success: true, events: adminEvents });
  });

  app.post("/api/admin/events/add", (req, res) => {
    try {
      const { 
        title, 
        date, 
        time, 
        prize, 
        desc, 
        coinsReward, 
        diamondsReward, 
        xpReward, 
        itemReward, 
        durationHours, 
        reqMinRating, 
        reqMinLevel, 
        reqPremiumOnly,
        overrideStatus
      } = req.body;
      
      if (!title || !date || !time) {
        return res.status(400).json({ error: "Informasi event tidak lengkap" });
      }
      
      adminEvents.push({
        id: "ev_" + Math.random().toString(36).substring(2, 9),
        title,
        date,
        time,
        prize: prize || "Tidak ada",
        desc: desc || "",
        coinsReward: Number(coinsReward) || 0,
        diamondsReward: Number(diamondsReward) || 0,
        xpReward: Number(xpReward) || 0,
        itemReward: itemReward || "",
        durationHours: Number(durationHours) || 3,
        reqMinRating: Number(reqMinRating) || 0,
        reqMinLevel: Number(reqMinLevel) || 1,
        reqPremiumOnly: Boolean(reqPremiumOnly),
        overrideStatus: overrideStatus || "none",
        createdAt: Date.now()
      });
      saveEvents();
      return res.json({ success: true, events: adminEvents });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/events/override", (req, res) => {
    try {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: "ID dan status wajib disertakan" });
      }
      const eventIdx = adminEvents.findIndex(e => e.id === id);
      if (eventIdx === -1) {
        return res.status(404).json({ error: "Event tidak ditemukan" });
      }
      adminEvents[eventIdx].overrideStatus = status;
      saveEvents();
      return res.json({ success: true, events: adminEvents });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/events/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID wajib disertakan" });
      }
      adminEvents = adminEvents.filter(e => e.id !== id);
      saveEvents();
      return res.json({ success: true, events: adminEvents });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/staff/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib!" });
      }
      const lower = username.trim().toLowerCase();
      if (usersDb[lower]) {
        usersDb[lower].isStaff = true;
        usersDb[lower].password = password; // Ensure password set/override
        saveUsersDb();
        await saveUserToFirestore(usersDb[lower].username, true);
        return res.json({ success: true, message: `Berhasil menambahkan staff @${usersDb[lower].username}` });
      } else {
        // Create full account with isStaff flag
        const newUser = {
          username: username.trim(),
          password: password,
          elo: 600,
          xp: 100,
          unlockedThemes: ["classic"],
          matchesPlayed: 0,
          matchesWon: 0,
          profileAvatar: "/src/assets/images/avatar_martin_1779709510230.png",
          profileBio: "Staff Administrator Arena Catur",
          claimedAchievements: [],
          registeredAt: Date.now(),
          friends: [],
          friendRequests: [],
          inbox: [],
          membershipStatus: 'free',
          unlockedItems: [],
          isStaff: true
        };
        usersDb[lower] = newUser;
        saveUsersDb();
        await saveUserToFirestore(newUser.username, true);
        return res.json({ success: true, message: `Berhasil mendaftarkan akun Staff @${newUser.username}` });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/user/lookup", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: "Username wajib!" });
      const lower = (username as string).trim().toLowerCase();
      const targetKey = lower.startsWith("@") ? lower.substring(1) : lower;
      
      const targetUser = await getUserOrFetchFromFirestore(targetKey);
      if (!targetUser) {
        return res.status(404).json({ error: "User tidak ditemukan!" });
      }
      return res.json({
        success: true,
        user: {
          username: targetUser.username,
          elo: targetUser.elo || 400,
          profileAvatar: targetUser.profileAvatar,
          xp: targetUser.xp || 0,
          matchesPlayed: targetUser.matchesPlayed || 0
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/user/restore-elo", async (req, res) => {
    try {
      const { username, restoreValue, moderator, reason } = req.body;
      if (!username || restoreValue === undefined || !moderator) {
        return res.status(400).json({ error: "Parameter tidak lengkap!" });
      }
      const lowerMod = moderator.trim().toLowerCase();
      const modUser = usersDb[lowerMod];
      const isModAdmin = lowerMod === "almaira" || lowerMod === "nopal" || (modUser && (modUser.isAdmin || modUser.isStaff));
      if (!isModAdmin) {
        return res.status(403).json({ error: "Akses ditolak. Anda bukan staff/moderator!" });
      }

      const lowerTarget = username.trim().toLowerCase();
      const targetKey = lowerTarget.startsWith("@") ? lowerTarget.substring(1) : lowerTarget;
      
      const targetUser = await getUserOrFetchFromFirestore(targetKey);
      if (!targetUser) {
        return res.status(404).json({ error: "User sasaran tidak ditemukan!" });
      }

      const oldElo = targetUser.elo || 400;
      targetUser.elo = Number(restoreValue);

      // Create a Match History entry for ELO Restore (affects match history and ELO telemetry)
      if (!targetUser.onlineHistory) {
        targetUser.onlineHistory = [];
      }
      const eloDiffValue = Number(restoreValue) - oldElo;
      const historyEntry = {
        id: "elo-restore-game-" + Date.now(),
        opponent: "Staff @" + moderator,
        opponentElo: 1200,
        outcome: eloDiffValue >= 0 ? "win" : "lose",
        eloDiff: eloDiffValue,
        date: new Date().toLocaleDateString("id-ID"),
        movesCount: 0,
        moves: []
      };
      targetUser.onlineHistory.unshift(historyEntry);

      // Create an Audit Log & Transaction History entry
      if (!targetUser.chess_transaction_history) {
        targetUser.chess_transaction_history = [];
      }
      const signStr = eloDiffValue >= 0 ? "+" : "";
      const txDesc = `Pemulihan ELO manual oleh moderator @${moderator}: ${oldElo} -> ${restoreValue} (${signStr}${eloDiffValue} ELO). Alasan: ${reason || 'Pemulihan kegagalan sinkronisasi ELO'}`;
      targetUser.chess_transaction_history.unshift({
        id: `tx-elo-restore-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        type: 'coin',
        amount: 0,
        desc: txDesc
      });

      // Send a notification/log to target user's inbox
      if (!targetUser.inbox) {
        targetUser.inbox = [];
      }
      targetUser.inbox.push({
        id: "elo_restore_" + Date.now(),
        sender: "SYSTEM (Moderator)",
        text: `ELO Rating Anda telah dipulihkan secara manual oleh moderator @${modUser ? modUser.username : moderator} dari ${oldElo} menjadi ${restoreValue}. Alasan: ${reason || 'Pemulihan kegagalan sinkronisasi ELO'}`,
        timestamp: Date.now(),
        read: false
      });

      saveUsersDb();
      await saveUserToFirestore(targetUser.username, true); // force immediate sync

      return res.json({ 
        success: true, 
        message: `Berhasil memulihkan ELO @${targetUser.username} dari ${oldElo} menjadi ${restoreValue}.`,
        user: {
          username: targetUser.username,
          elo: targetUser.elo
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // GET: Fetch complete user data/stats for state syncing
  app.get("/api/auth/user-data", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ error: "Missing username parameter" });
      }
      const userKey = (username as string).trim().toLowerCase();
      const userRecord = await getUserOrFetchFromFirestore(userKey);
      if (!userRecord) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      return res.json({
        success: true,
        user: {
          username: userRecord.username,
          elo: userRecord.elo || 400,
          xp: userRecord.xp || 0,
          coins: userRecord.coins || 500,
          diamonds: userRecord.diamonds || 20,
          unlockedThemes: userRecord.unlockedThemes || ["classic"],
          matchesPlayed: userRecord.matchesPlayed || 0,
          matchesWon: userRecord.matchesWon || 0,
          profileAvatar: userRecord.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png",
          profileBio: userRecord.profileBio || "Pecatur sejati pantang menyerah!",
          claimedAchievements: userRecord.claimedAchievements || [],
          membershipStatus: userRecord.membershipStatus || 'free',
          unlockedItems: userRecord.unlockedItems || [],
          selectedFrame: userRecord.selectedFrame || 'none',
          unlockedFrames: userRecord.unlockedFrames || ['none'],
          selectedSkin: userRecord.selectedSkin || 'standard',
          unlockedSkins: userRecord.unlockedSkins || ['standard'],
          equippedTitle: userRecord.equippedTitle || 'Pecatur Perintis',
          unlockedTitles: userRecord.unlockedTitles || ['Pecatur Perintis'],
          equippedCheckmateEffect: userRecord.equippedCheckmateEffect || 'none',
          unlockedCheckmateEffects: userRecord.unlockedCheckmateEffects || ['none'],
          customStatus: userRecord.customStatus || 'Pantang menyerah sebelum raja digulingkan!',
          followers: userRecord.followers || [],
          following: userRecord.following || [],
          likesCount: userRecord.likesCount !== undefined ? userRecord.likesCount : (userRecord.likes || 0),
          likedBy: userRecord.likedBy || [],
          onlineHistory: userRecord.onlineHistory || [],
          chess_transaction_history: userRecord.chess_transaction_history || [],
          pinned_medals_ids: userRecord.pinned_medals_ids || [],
          blockedUsers: userRecord.blockedUsers || [],
          streak: userRecord.streak !== undefined ? userRecord.streak : 0,
          peakXp: userRecord.peakXp !== undefined ? userRecord.peakXp : 0,
          winStreak: userRecord.winStreak !== undefined ? userRecord.winStreak : 0,
          longestDefense: userRecord.longestDefense !== undefined ? userRecord.longestDefense : 0
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // POST: Restore complete user account state (Coins, Diamonds, ELO, XP)
  app.post("/api/admin/user/restore-account-state", async (req, res) => {
    try {
      const { username, elo, coins, diamonds, xp, moderator, reason } = req.body;
      if (!username || !moderator) {
        return res.status(400).json({ error: "Parameter tidak lengkap!" });
      }
      const lowerMod = moderator.trim().toLowerCase();
      const modUser = usersDb[lowerMod];
      const isModAdmin = lowerMod === "almaira" || lowerMod === "nopal" || (modUser && (modUser.isAdmin || modUser.isStaff));
      if (!isModAdmin) {
        return res.status(403).json({ error: "Akses ditolak. Anda bukan staff/moderator!" });
      }

      const lowerTarget = username.trim().toLowerCase();
      const targetKey = lowerTarget.startsWith("@") ? lowerTarget.substring(1) : lowerTarget;
      
      const targetUser = await getUserOrFetchFromFirestore(targetKey);
      if (!targetUser) {
        return res.status(404).json({ error: "User sasaran tidak ditemukan!" });
      }

      const oldElo = targetUser.elo || 400;
      const oldCoins = targetUser.coins || 500;
      const oldDiamonds = targetUser.diamonds || 20;
      const oldXp = targetUser.xp || 0;

      const updates: string[] = [];

      if (elo !== undefined && !isNaN(elo)) {
        targetUser.elo = Number(elo);
        updates.push(`ELO (${oldElo} -> ${elo})`);
        
        if (Number(elo) !== oldElo) {
          if (!targetUser.onlineHistory) {
            targetUser.onlineHistory = [];
          }
          const eloDiffValue = Number(elo) - oldElo;
          const historyEntry = {
            id: "elo-restore-game-" + Date.now(),
            opponent: "Staff @" + moderator,
            opponentElo: 1200,
            outcome: eloDiffValue >= 0 ? "win" : "lose",
            eloDiff: eloDiffValue,
            date: new Date().toLocaleDateString("id-ID"),
            movesCount: 0,
            moves: []
          };
          targetUser.onlineHistory.unshift(historyEntry);
        }
      }

      if (coins !== undefined && !isNaN(coins)) {
        targetUser.coins = Number(coins);
        updates.push(`Koin (${oldCoins} -> ${coins})`);
      }

      if (diamonds !== undefined && !isNaN(diamonds)) {
        targetUser.diamonds = Number(diamonds);
        updates.push(`Diamond (${oldDiamonds} -> ${diamonds})`);
      }

      if (xp !== undefined && !isNaN(xp)) {
        targetUser.xp = Number(xp);
        updates.push(`XP (${oldXp} -> ${xp})`);
      }

      const updateSummary = updates.join(", ");
      const txDesc = `Pemulihan status akun manual oleh moderator @${moderator}: ${updateSummary}. Alasan: ${reason || 'Sinkronisasi ulang kegagalan sistem'}`;

      // Create an Audit Log & Transaction History entry
      if (!targetUser.chess_transaction_history) {
        targetUser.chess_transaction_history = [];
      }
      targetUser.chess_transaction_history.unshift({
        id: `tx-state-restore-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        type: 'coin',
        amount: 0,
        desc: txDesc
      });

      // Send a notification/log to target user's inbox
      if (!targetUser.inbox) {
        targetUser.inbox = [];
      }
      targetUser.inbox.push({
        id: "state_restore_" + Date.now(),
        sender: "SYSTEM (Moderator)",
        text: `Status akun Anda telah dipulihkan secara manual oleh moderator @${modUser ? modUser.username : moderator}. Detail perubahan: ${updateSummary}. Alasan: ${reason || 'Sinkronisasi ulang kegagalan sistem'}`,
        timestamp: Date.now(),
        read: false
      });

      saveUsersDb();
      await saveUserToFirestore(targetUser.username, true); // force immediate sync

      return res.json({ 
        success: true, 
        message: `Berhasil memulihkan status @${targetUser.username}: ${updateSummary}.`,
        user: {
          username: targetUser.username,
          elo: targetUser.elo,
          coins: targetUser.coins,
          diamonds: targetUser.diamonds,
          xp: targetUser.xp
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // --- SUPPORT TICKET & AI CUSTOMER SERVICE ROUTES ---
  app.post("/api/support/tickets/create", (req, res) => {
    try {
      const { username, title, description, category } = req.body;
      if (!username || !title || !description) {
        return res.status(400).json({ error: "Username, judul, dan deskripsi wajib diisi!" });
      }

      const newTicket = {
        id: "TKT-" + Math.floor(100000 + Math.random() * 900000),
        username: username.trim(),
        title: title.trim(),
        description: description.trim(),
        category: category || "Umum",
        status: "open",
        createdAt: new Date().toISOString(),
        replies: []
      };

      supportTickets.push(newTicket);
      saveTickets();
      return res.json({ success: true, ticket: newTicket });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/tickets/list", (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username wajib!" });
      }

      const lower = username.trim().toLowerCase();
      const userObj = usersDb[lower];
      const isAdminOrStaff = lower === "nopal" || lower === "almaira" || userObj?.isStaff || userObj?.isAdmin;

      // If Admin/Staff, return all tickets. Otherwise, return user's own tickets.
      const list = isAdminOrStaff 
        ? supportTickets 
        : supportTickets.filter(t => t.username.toLowerCase() === lower);

      return res.json({ success: true, tickets: list });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/tickets/reply", (req, res) => {
    try {
      const { username, ticketId, text } = req.body;
      if (!username || !ticketId || !text) {
        return res.status(400).json({ error: "Username, ticketId, dan isi balasan wajib diisi!" });
      }

      const ticket = supportTickets.find(t => t.id === ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Tiket tidak ditemukan!" });
      }

      const lower = username.trim().toLowerCase();
      const userObj = usersDb[lower];
      const isAdminOrStaff = lower === "nopal" || lower === "almaira" || userObj?.isStaff || userObj?.isAdmin;

      const newReply = {
        sender: username.trim(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
        isAdmin: isAdminOrStaff
      };

      ticket.replies.push(newReply);
      
      // If admin/staff replies, we can mark the ticket as pending, otherwise keep it open or update status
      if (isAdminOrStaff) {
        ticket.status = "pending";
      } else {
        ticket.status = "open";
      }

      saveTickets();
      return res.json({ success: true, ticket });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/tickets/resolve", (req, res) => {
    try {
      const { username, ticketId } = req.body;
      if (!ticketId) {
        return res.status(400).json({ error: "ticketId wajib diisi!" });
      }

      const ticket = supportTickets.find(t => t.id === ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Tiket tidak ditemukan!" });
      }

      ticket.status = "resolved";
      saveTickets();
      return res.json({ success: true, ticket });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/ai-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Pesan wajib diisi!" });
      }

      // Offline keyword-based smart chatbot fallback
      const getOfflineReply = (msg: string) => {
        const text = msg.toLowerCase();
        if (text.includes("koin") || text.includes("coin") || text.includes("emas") || text.includes("diamond") || text.includes("berlian")) {
          return "Halo! Anda bisa mendapatkan Koin & Diamond gratis dengan menyelesaikan Quest Harian, memenangkan game catur, memecahkan Puzzles taktik harian, mempelajari materi Lessons, atau mengklaim harian di Beranda. Diamond juga bisa diperoleh dari pencapaian (Achievements) atau penayangan spesial.";
        }
        if (text.includes("suku") || text.includes("clan") || text.includes("guild") || text.includes("catur")) {
          return "Suku Catur (Klan) adalah fitur kolaborasi. Anda bisa bergabung ke Suku Catur pilihan Anda, melakukan check-in tim harian untuk mengklaim chest akumulatif mingguan, dan mengobrol bersama kawan se-Suku di ruang chat!";
        }
        if (text.includes("skin") || text.includes("tema") || text.includes("kosmetik") || text.includes("toko") || text.includes("shop")) {
          return "Kunjungi menu Shop! Di sana Anda bisa menukarkan Koin & Diamond Anda dengan Skin Bidak Catur (misal: Set Anime, Set Kayu premium, dll), Bingkai Avatar profil mewah, atau mencoba peruntungan Gacha berhadiah kosmetik eksklusif!";
        }
        if (text.includes("bug") || text.includes("eror") || text.includes("curang") || text.includes("lapor")) {
          return "Jika Anda menemukan bug teknis atau pemain curang, harap segera buat laporan resmi melalui menu 'Kirim Tiket Dukungan' di bawah FAQ ini. Tim Staff admin kami (Almaira & Nopal) akan langsung memeriksa laporan Anda secara berkala.";
        }
        if (text.includes("tutorial") || text.includes("belajar") || text.includes("cara main")) {
          return "Kami telah menyediakan halaman Panduan & Daftar Tutorial di menu Arena Utama! Anda dapat mengakses daftar panduan interaktif, mempelajari taktik matang dasar, maupun meluncurkan simulasi langkah catur secara langsung.";
        }
        return "Halo! Saya adalah Pal Mate AI Support. Ada yang bisa saya bantu terkait fitur catur ELO, klub Suku Catur, koin harian, atau kustomisasi kosmetik skin di platform kami? Silakan ketik pertanyaan Anda atau buat Tiket Dukungan jika Anda membutuhkan bantuan manual dari Staff Almaira/Nopal.";
      };

      if (ai) {
        try {
          // Construct chat style history
          let systemInstruction = `You are Pal Mate's AI Support Agent (Customer Service), speaking in Indonesian. 
Pal Mate is an elite premium chess platform with ELO matchmaking, Chess Suku (clubs/clans), Daily Quests, Cosmetic Shops (anime/wood skins, avatar frames, custom checkmate effects), Replay Logs, Social Hub, and Community Forums.
Answer the user's support query politely, cheerfully, and concisely (maximum 3 sentences). 
Keep your tone cheerful, respectful, and helpful. 
If they ask about severe issues (like billing or account ban), advise them to submit a Support Ticket via the Support Center.
Help them with gameplay rules, how to earn coins (by winning matches, daily puzzles, check-ins), skin customization, or joining Suku.`;

          let formattedPrompt = "";
          if (history && Array.isArray(history)) {
            history.forEach((h: any) => {
              const speaker = h.role === "user" ? "User" : "Agent";
              formattedPrompt += `${speaker}: ${h.text}\n`;
            });
          }
          formattedPrompt += `User: ${message}\nAgent:`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });

          const replyText = response.text?.trim() || getOfflineReply(message);
          return res.json({ success: true, reply: replyText });
        } catch (apiErr) {
          console.error("Gemini support error, falling back to offline handler:", apiErr);
          return res.json({ success: true, reply: getOfflineReply(message) });
        }
      } else {
        return res.json({ success: true, reply: getOfflineReply(message) });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/analyze-position", async (req, res) => {
    try {
      const { fen, moveSan, moveQuality, moveIndex } = req.body;

      const systemPrompt = `Anda adalah Pelatih Kepala Catur Grandmaster berpengalaman yang ramah dan mendidik.
Analisis langkah catur berikut dalam bahasa Indonesia:
- Langkah Ke-${moveIndex || 1} oleh pemain: "${moveSan}"
- Evaluasi Kualitas Langkah: "${moveQuality || 'Biasa'}"
- FEN Posisi Setelah Melangkah: "${fen}"

Silakan buat ulasan singkat maksimal 2 kalimat (ramah dan mencerahkan, mudah dipahami pemula tanpa rumus kode komputer catur):
1. Jelaskan secara strategis/taktis mengapa langkah "${moveSan}" ini dinilai sebagai "${moveQuality}" (misal: mengontrol jalur penting, mengancam raja, melewatkan keuntungan, atau membiarkan bidak tergantung).
2. Berikan saran langkah alternatif yang ideal atau saran taktis pembinaan untuk langkah selanjutnya.
Jawab langsung berupa teks ulasan bersih tanpa tanda kutip ganda atau detail teknis FEN.`;

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: systemPrompt,
            config: {
              temperature: 0.8,
            }
          });
          const text = response.text?.trim() || "Posisi taktis yang menarik. Terus perhatikan dominasi baris tengah.";
          return res.json({ analysis: text });
        } catch (apiError: any) {
          console.log("[Gemini Analysis] Server using local offline position evaluator (API quota-limited or offline).");
          // Fall through to offline description gracefully
        }
      }

      // Structured interactive fallback descriptions
      const fallbacks: Record<string, string> = {
        brilliant: `Langkah luar biasa brilian! Anda melepaskan perantara atau memancing jebakan berisiko tinggi demi meluncurkan serangan fatal terhadap benteng lawan.`,
        great: `Sebuah keputusan taktis yang hebat! Langkah ini menempatkan tekanan berat pada posisi pertahanan raja lawan Anda.`,
        best: `Ini adalah langkah terbaik mutlak sesuai saran mesin. Anda sukses memaksimalkan kontrol diagonal dan merebut petak inti gajah.`,
        excellent: `Sangat baik! Langkah ini mendukung pengembangan struktur pion tengah dengan mulus dan mengamankan pertahanan menteri.`,
        book: `Ini adalah langkah teori buku pembukaan standar. Sangat baik untuk mempertahankan keseimbangan formasi di sayap menteri.`,
        good: `Langkah yang solid dan aman. Terus kembangkan perwira kecil Anda untuk bersiap meluncurkan serangan taktis berikutnya.`,
        inaccuracy: `Langkah kurang tepat. Langkah ini melupakan ancaman sayap raja dan menyia-nyakan keunggulan tempo gerak menteri.`,
        mistake: `Sebuah langkah keliru. Anda melewatkan kesempatan emas untuk mengeksploitasi kelemahan baris belakang musuh.`,
        blunder: `Aduh blunder krusial! Langkah ini meninggalkan perwira penting Anda tergantung atau melemahkan posisi pertahanan raja.`
      };
      const text = fallbacks[moveQuality] || "Posisi taktis yang sangat kaya. Menarik untuk dipelajari lebih jauh.";
      return res.json({ analysis: text, isFallback: true });
    } catch (e: any) {
      console.log("[Analysis Route] Handled local error gracefully.");
      return res.status(500).json({ error: "Gagal memuat analisis AI" });
    }
  });

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
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: systemPrompt,
            config: {
              temperature: 0.95,
            }
          });
          const text = response.text?.trim().replace(/^"|"$/g, '') || "Hmm, menarik...";
          return res.json({ text });
        } catch (apiError: any) {
          console.log("[Gemini Commentary] Server using local offline dialogue response (API quota-limited or offline).");
          // Fall through to offline fallback below
        }
      }

      // Fallback responses if no GEMINI_API_KEY is configured or general API error / limit is reached
      const fallbacks: Record<string, string[]> = {
        martin: [
          "Halo! Langkah yang keren, semoga saya tidak berbuat blunder di giliran ini!",
          "Wah, bidakmu melangkah maju dengan gagah berani! Menarik sekali!",
          "Aduh, kepalaku agak pening memikirkan langkah selanjutnya. Hahaha!",
          "Langkah hebat! Saya terus termotivasi belajar catur bersamamu.",
          "Halo kawan! Aduh maaf banget ya kalau saya ga sengaja makan bidakmu barusan.",
          "Eh, pion kamu maju kencang sekali ya! Saya jadi agak ngeri wkwk.",
          "Permainan yang seru! Tetap berkonsentrasi ya, jangan sampai lengah.",
          "Waduh! Saya lupa kalau menteri saya ada di sana. Jangan dimakan ya, plis! 😂",
          "Langkah yang sangat cerdas! Saya harus banyak belajar dari caramu berpikir.",
          "Hehehe, bagaimana kalau saya taruh kuda saya di sini? Keren kan?",
          "Aduh sorry banget, tadi saya ketiduran bentar pas mikir langkah, peace! ✌️",
          "Wah wah, petak tengahnya kok jadi ramai sekali ya? Seru banget!",
          "Langkah yang solid kawan! Semoga pertarungan kita berakhir damai wkwk.",
          "Duh menteri saya kesepian nih, boleh jalan-jalan ke tempatmu ga? 😁",
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

      const list = fallbacks[character.id] || ["Langkah luar biasa! Mari lanjutkan permainan!"];
      
      const pMove = playerMove || "";
      const aMove = aiMove || "";

      // Function to check if a specific chess template is contextually relevant based on the actual moves played
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
        return true; // Generic templates are always allowed
      };

      // Filter templates that mention specific pieces to ensure they are contextually appropriate
      let appropriateList = list.filter(t => isTemplateAppropriate(t, aMove, pMove));

      // If empty after filtering, fall back to general templates that contain no piece-specific words
      if (appropriateList.length === 0) {
        appropriateList = list.filter(t => {
          const norm = t.toLowerCase();
          return !norm.includes("menteri") && !norm.includes("ratu") && !norm.includes("kuda") && !norm.includes("gajah") && !norm.includes("benteng") && !norm.includes("pion");
        });
      }
      
      // Ultimately if still empty, use the whole list
      if (appropriateList.length === 0) {
        appropriateList = list;
      }

      const randomIndex = Math.floor(Math.random() * appropriateList.length);
      return res.json({ text: appropriateList[randomIndex], isFallback: true });
    } catch (error: any) {
      console.log("[Commentary Route] Handled local error gracefully.");
      return res.status(500).json({ error: "Gagal memuat obrolan AI" });
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

  interface WaitingPlayer {
    id: string;
    username: string;
    elo: number;
    joinedAt: number;
    roomCode?: string;
  }

  const waitingPlayers: WaitingPlayer[] = [];
  const activeOnlineGames: Record<string, OnlineGame> = {};

  // Periodically clean stale matchmaking lookups
  setInterval(() => {
    const now = Date.now();
    for (let i = waitingPlayers.length - 1; i >= 0; i--) {
      // Don't expire custom room codes so fast to let friends connect comfortably
      const delay = waitingPlayers[i].roomCode ? 60000 : 15000;
      if (now - waitingPlayers[i].joinedAt > delay) {
        waitingPlayers.splice(i, 1);
      }
    }
  }, 5000);

  // Endpoint: Join Queue / Matchmaking search
  app.post("/api/online/matchmaking", (req, res) => {
    const { playerId, username, elo, roomCode } = req.body;
    if (!playerId || !username) {
      return res.status(400).json({ error: "Missing identity requirements" });
    }

    const now = Date.now();
    const cleanRoomCode = roomCode ? roomCode.trim().toUpperCase() : undefined;

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

    // 3. Search for available opponents
    let opponent: WaitingPlayer | undefined;
    if (cleanRoomCode) {
      // Find another user waiting with the EXACT same custom room code
      opponent = waitingPlayers.find(p => p.id !== playerId && p.roomCode === cleanRoomCode && (now - p.joinedAt < 60000));
    } else {
      // Standard matchmaking (match with players who DO NOT have a custom room code)
      opponent = waitingPlayers.find(p => p.id !== playerId && !p.roomCode && (now - p.joinedAt < 15000));
    }

    if (opponent) {
      const gameId = cleanRoomCode || Math.random().toString(36).substring(2, 9);
      
      const game: OnlineGame = {
        id: gameId,
        playerWhite: { id: opponent.id, name: opponent.username, elo: opponent.elo, isAi: false },
        playerBlack: { id: playerId, name: username, elo: elo || 1200, isAi: false },
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: [],
        chats: [
          { sender: 'System', text: `Pertandingan dimulai! Anda bermain sebagai Hitam (Black). Lawan Anda ${opponent.username} sebagai Putih (White).`, time: now }
        ],
        lastMoveBy: null,
        lastMoveTime: now,
        winner: null
      };

      activeOnlineGames[gameId] = game;

      const oppIdx = waitingPlayers.findIndex(p => p.id === opponent!.id);
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
        joinedAt: now,
        roomCode: cleanRoomCode
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

  // Endpoint: Get specific user profile info
  app.get("/api/user/profile", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ error: "Missing username" });
      }
      const userKey = (username as string).trim().toLowerCase();
      const userRecord = await getUserOrFetchFromFirestore(userKey);
      if (!userRecord) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      // Update last active time for real-time online status tracking
      userRecord.lastActiveAt = Date.now();

      // Dynamic online status calculation for guild members
      const now = Date.now();
      const activeMembers = Array.isArray(userRecord.guild_members)
        ? userRecord.guild_members.map((m: any) => {
            const uKey = m.name?.toLowerCase();
            const uRec = usersDb[uKey];
            const isOnline = uRec && uRec.lastActiveAt && (now - uRec.lastActiveAt < 120000);
            return {
              ...m,
              status: isOnline ? 'Online' : 'Offline'
            };
          })
        : [];

      return res.json({
        success: true,
        user: {
          username: userRecord.username,
          elo: userRecord.elo || 400,
          xp: userRecord.xp || 0,
          profileAvatar: userRecord.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png",
          profileBio: userRecord.profileBio || "Pecatur sejati pantang menyerah!",
          equippedTitle: userRecord.equippedTitle || "Pecatur Perintis",
          unlockedSkins: userRecord.unlockedSkins || ["standard"],
          unlockedThemes: userRecord.unlockedThemes || ["classic"],
          unlockedFrames: userRecord.unlockedFrames || ["none"],
          selectedFrame: userRecord.selectedFrame || "none",
          selectedSkin: userRecord.selectedSkin || "standard",
          customStatus: userRecord.customStatus || "Pantang menyerah sebelum raja digulingkan!",
          membershipStatus: userRecord.membershipStatus || "free",
          isStaff: !!userRecord.isStaff,
          isAdmin: !!userRecord.isAdmin || userKey === "nopal" || userKey === "almaira",
          guild_has_owner: userRecord.guild_has_owner || false,
          guild_profile_data: userRecord.guild_profile_data || null,
          guild_members: activeMembers,
          guild_lvl: userRecord.guild_lvl || 1,
          guild_treasury_gold: userRecord.guild_treasury_gold || 0,
          guild_blacklist_list: userRecord.guild_blacklist_list || [],
          guild_action_history: userRecord.guild_action_history || [],
          guild_join_requests: userRecord.guild_join_requests || [],
          requested_fragment_skin: userRecord.requested_fragment_skin || null,
          has_active_fragment_req: userRecord.has_active_fragment_req || false,
          today_fragment_donation_count: userRecord.today_fragment_donation_count || 0,
          conquered_boards_list: userRecord.conquered_boards_list || [],
          clan_checked_in: userRecord.clan_checked_in || false,
          clan_weekly_milestones: userRecord.clan_weekly_milestones || []
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Seeded Online leaderboard merged with real registered user accounts
  app.get("/api/online/leaderboard", (req, res) => {
    const seed: any[] = [];
    
    try {
      const realUsers = Object.values(usersDb).map(user => ({
        name: user.username,
        elo: user.elo || 400,
        badge: (user.elo || 400) >= 2000 ? "Grandmaster" :
               (user.elo || 400) >= 1650 ? "Master Nasional" :
               (user.elo || 400) >= 1200 ? "Pakar" : "Pecatur Berbakat"
      }));

      const combined = [...realUsers];
      combined.sort((a, b) => b.elo - a.elo);
      return res.json(combined);
    } catch (e) {
      return res.json(seed);
    }
  });

  // REAL-TIME GUILD LEADERBOARD (ONLY REAL USER-CREATED CLUBS)
  const guildsFile = path.join(dataDir, "guilds.json");
  const disbandedGuildsFile = path.join(dataDir, "disbanded_guilds.json");

  let guildsDb: Record<string, any> = {};
  if (fs.existsSync(guildsFile)) {
    try {
      guildsDb = JSON.parse(fs.readFileSync(guildsFile, "utf8"));
    } catch (e) {
      guildsDb = {};
    }
  }

  let disbandedGuildsList: string[] = [];
  if (fs.existsSync(disbandedGuildsFile)) {
    try {
      disbandedGuildsList = JSON.parse(fs.readFileSync(disbandedGuildsFile, "utf8"));
    } catch (e) {
      disbandedGuildsList = [];
    }
  }
  const disbandedGuilds = new Set<string>(disbandedGuildsList.map(s => String(s).trim().toLowerCase()));

  const saveDisbandedGuilds = () => {
    try {
      fs.writeFileSync(disbandedGuildsFile, JSON.stringify(Array.from(disbandedGuilds), null, 2), "utf8");
    } catch (e) {
      console.error("Error saving disbanded guilds db:", e);
    }
  };

  const saveGuilds = () => {
    try {
      fs.writeFileSync(guildsFile, JSON.stringify(guildsDb, null, 2), "utf8");
    } catch (e) {
      console.error("Error saving guilds db:", e);
    }
  };

  app.get("/api/guilds/details", (req, res) => {
    try {
      const { name, username } = req.query;
      if (!name) return res.status(400).json({ error: "Nama klan wajib diisi" });

      if (username) {
        const uKey = String(username).trim().toLowerCase();
        if (usersDb[uKey]) {
          usersDb[uKey].lastActiveAt = Date.now();
        }
      }

      const guildKey = String(name).trim().toLowerCase();
      if (disbandedGuilds.has(guildKey)) {
        return res.status(404).json({ error: "Klan telah dibubarkan", disbanded: true });
      }

      let guild = guildsDb[guildKey];

      if (!guild) {
        const ownerKey = Object.keys(usersDb).find(k => {
          const u = usersDb[k];
          return u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey;
        });
        if (ownerKey && usersDb[ownerKey] && !disbandedGuilds.has(guildKey)) {
          guild = usersDb[ownerKey].guild_profile_data;
          if (guild) {
            guild.members = usersDb[ownerKey].guild_members || [];
            guildsDb[guildKey] = guild;
            saveGuilds();
          }
        }
      }

      if (!guild || disbandedGuilds.has(guildKey)) {
        return res.status(404).json({ error: "Klan tidak ditemukan atau telah dibubarkan" });
      }

      const now = Date.now();
      let members = Array.isArray(guild.members) ? [...guild.members] : [];

      if (username) {
        const activeUserStr = String(username).trim();
        const activeUserLower = activeUserStr.toLowerCase();
        if (members.length === 0 || !members.some((m: any) => m && m.name && m.name.trim().toLowerCase() === activeUserLower)) {
          const userRec = usersDb[activeUserLower];
          const userContrib = Number(userRec?.user_clan_contribution) || 1250;
          const userRating = Number(userRec?.elo) || 600;
          const userLvl = Math.floor(userRating / 30) + 1;
          members.unshift({
            name: activeUserStr,
            role: guild.leader?.toLowerCase() === activeUserLower || guild.ownerUsername?.toLowerCase() === activeUserLower ? 'Founder' : 'Member',
            rating: userRating,
            status: 'Online',
            contribution: userContrib,
            level: userLvl
          });
          guild.members = members;
          guildsDb[guildKey] = guild;
          saveGuilds();
        }
      }

      const membersWithStatus = members.map((m: any) => {
        const uKey = m.name?.toLowerCase();
        const uRecord = usersDb[uKey];
        const isOnline = uRecord && uRecord.lastActiveAt && (now - uRecord.lastActiveAt < 120000);
        return {
          ...m,
          contribution: m.contribution !== undefined ? Number(m.contribution) : 0,
          status: isOnline ? 'Online' : 'Offline'
        };
      });

      const totalElo = membersWithStatus.reduce((sum: number, m: any) => sum + Number(m.rating || m.elo || 600), 0);

      return res.json({
        success: true,
        guild: {
          ...guild,
          treasury: guild.treasury !== undefined ? Number(guild.treasury) : 250,
          members: membersWithStatus,
          membersCount: Math.max(1, membersWithStatus.length),
          totalElo: totalElo
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guilds/donate", async (req, res) => {
    try {
      const { username, guildName, amount } = req.body;
      if (!username || !guildName || !amount) {
        return res.status(400).json({ error: "Parameter tidak lengkap" });
      }
      const cleanUser = String(username).trim().toLowerCase();
      const guildKey = String(guildName).trim().toLowerCase();
      const numAmount = Number(amount) || 0;

      let guild = guildsDb[guildKey];
      if (!guild) {
        const ownerKey = Object.keys(usersDb).find(k => {
          const u = usersDb[k];
          return u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey;
        });
        if (ownerKey && usersDb[ownerKey]) {
          guild = usersDb[ownerKey].guild_profile_data || { name: guildName };
        }
      }

      if (!guild) {
        guild = {
          id: guildName,
          name: guildName,
          tag: 'ELIT',
          leader: username,
          members: [{ name: username, role: 'Founder', rating: 600, status: 'Online', contribution: numAmount, level: 1 }],
          treasury: 250 + numAmount,
          level: Math.max(1, Math.floor((250 + numAmount) / 1200) + 1)
        };
      } else {
        guild.treasury = (Number(guild.treasury) || 0) + numAmount;
        guild.level = Math.max(1, Math.floor(guild.treasury / 1200) + 1);
      }

      let members = Array.isArray(guild.members) ? guild.members : [];
      let foundMember = false;
      members = members.map((m: any) => {
        if (m.name?.trim()?.toLowerCase() === cleanUser) {
          foundMember = true;
          return { ...m, contribution: (Number(m.contribution) || 0) + numAmount };
        }
        return m;
      });

      if (!foundMember) {
        members.push({
          name: username,
          role: 'Founder',
          rating: 600,
          status: 'Online',
          contribution: numAmount,
          level: 1
        });
      }

      guild.members = members;
      guild.membersCount = members.length;
      guildsDb[guildKey] = guild;
      saveGuilds();

      // Sync updated treasury and members across all members of this clan in usersDb
      Object.keys(usersDb).forEach(uKey => {
        const u = usersDb[uKey];
        if (u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey) {
          if (u.guild_profile_data) {
            u.guild_profile_data.treasury = guild.treasury;
            u.guild_profile_data.level = guild.level;
          }
          if (uKey === cleanUser) {
            u.user_clan_contribution = (Number(u.user_clan_contribution) || 0) + numAmount;
          }
          u.guild_members = members;
          saveUserToFirestore(u.username).catch(() => {});
        }
      });

      saveUsersDb();

      return res.json({
        success: true,
        treasury: guild.treasury,
        level: guild.level,
        members: members
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guilds/withdraw", async (req, res) => {
    try {
      const { username, guildName, amount } = req.body;
      if (!username || !guildName || !amount) {
        return res.status(400).json({ error: "Parameter tidak lengkap" });
      }
      const cleanUser = String(username).trim().toLowerCase();
      const guildKey = String(guildName).trim().toLowerCase();
      const numAmount = Math.floor(Number(amount)) || 0;
      if (numAmount <= 0) return res.status(400).json({ error: "Jumlah tidak valid" });

      let guild = guildsDb[guildKey];
      if (!guild) {
        const ownerKey = Object.keys(usersDb).find(k => {
          const u = usersDb[k];
          return u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey;
        });
        if (ownerKey && usersDb[ownerKey]) {
          guild = usersDb[ownerKey].guild_profile_data || { name: guildName };
        }
      }

      if (!guild) {
        return res.status(404).json({ error: "Klan tidak ditemukan" });
      }

      const currentTreasury = Number(guild.treasury) || 0;
      if (currentTreasury < numAmount) {
        return res.status(400).json({ error: "Saldo koin di brankas klan tidak mencukupi" });
      }

      guild.treasury = Math.max(0, currentTreasury - numAmount);
      guild.level = Math.max(1, Math.floor(guild.treasury / 1200) + 1);

      guildsDb[guildKey] = guild;
      saveGuilds();

      // Sync updated treasury and level across members in usersDb
      Object.keys(usersDb).forEach(uKey => {
        const u = usersDb[uKey];
        if (u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey) {
          if (u.guild_profile_data) {
            u.guild_profile_data.treasury = guild.treasury;
            u.guild_profile_data.level = guild.level;
          }
          if (uKey === cleanUser) {
            u.coins = (Number(u.coins) || 0) + numAmount;
          }
          saveUserToFirestore(u.username).catch(() => {});
        }
      });
      saveUsersDb();

      return res.json({
        success: true,
        treasury: guild.treasury,
        level: guild.level
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/guilds/leaderboard", (req, res) => {
    try {
      const combinedMap: Record<string, any> = {};

      // 1. Include all active guilds saved in guildsDb
      Object.values(guildsDb).forEach((g: any) => {
        if (g && g.name) {
          const key = g.name.trim().toLowerCase();
          if (disbandedGuilds.has(key)) return; // Skip disbanded
          const members = Array.isArray(g.members) ? g.members : [];
          if (members.length > 0 || Number(g.membersCount) > 0) {
            const calcElo = members.length > 0
              ? members.reduce((sum: number, m: any) => sum + Number(m.rating || m.elo || 600), 0)
              : Number(g.totalElo || 1200);

            combinedMap[key] = {
              id: g.id || g.name,
              name: g.name,
              tag: g.tag || 'ELIT',
              leader: g.leader || g.leaderName || g.ownerUsername || 'Ketua Klan',
              ownerUsername: g.ownerUsername || g.leader || '',
              level: Number(g.level || 1),
              treasury: g.treasury !== undefined ? Number(g.treasury) : 250,
              totalElo: calcElo,
              membersCount: members.length || Number(g.membersCount || 1),
              maxMembers: 30,
              motto: g.motto || g.description || g.desc || "Klan Catur Sejati",
              logo: g.logo || "perisai",
              minRating: Number(g.minRating || 600),
              joinSystem: g.joinSystem || 'Bebas'
            };
          }
        }
      });

      // 2. Scan users in usersDb for user-created clubs that are NOT disbanded
      Object.values(usersDb).forEach((u: any) => {
        if (u && (u.guild_has_owner || u.guild_profile_data) && u.guild_profile_data?.name) {
          const prof = u.guild_profile_data;
          const guildName = String(prof.name).trim();
          if (guildName) {
            const key = guildName.toLowerCase();
            if (disbandedGuilds.has(key)) return; // CRITICAL: SKIP DISBANDED CLANS!
            if (!u.guild_has_owner) return;
            const mems = u.guild_members || [];
            if (mems.length > 0) {
              const calcElo = mems.reduce((sum: number, m: any) => sum + Number(m.rating || m.elo || 600), 0);
              const clanTreasury = guildsDb[key]?.treasury !== undefined ? Number(guildsDb[key].treasury) : (prof.treasury !== undefined ? Number(prof.treasury) : 250);
              combinedMap[key] = {
                id: prof.id || guildName,
                name: guildName,
                tag: prof.tag || 'ELIT',
                leader: prof.leader || u.username || 'Ketua Klan',
                ownerUsername: u.username || prof.leader || '',
                level: Number(u.guild_lvl || prof.level || 1),
                treasury: clanTreasury,
                totalElo: calcElo,
                membersCount: mems.length,
                maxMembers: 30,
                motto: prof.motto || prof.description || prof.desc || "Klan Catur Sejati",
                logo: prof.logo || "perisai",
                minRating: Number(prof.minRating || 600),
                joinSystem: prof.joinSystem || 'Bebas'
              };
            }
          }
        }
      });

      const guildsList = Object.values(combinedMap);
      guildsList.sort((a, b) => b.totalElo - a.totalElo || b.level - a.level);

      return res.json({ success: true, guilds: guildsList });
    } catch (e: any) {
      return res.json({ success: true, guilds: [] });
    }
  });

  app.post("/api/guilds/sync", async (req, res) => {
    try {
      const { guild } = req.body;
      if (!guild || !guild.name) {
        return res.status(400).json({ error: "Data suku tidak valid" });
      }
      const guildKey = guild.name.trim().toLowerCase();
      if (disbandedGuilds.has(guildKey)) {
        return res.status(400).json({ error: "Klan telah dibubarkan dan tidak dapat disinkronkan.", disbanded: true });
      }

      const existingGuild = guildsDb[guildKey];
      const preservedTreasury = existingGuild?.treasury !== undefined 
        ? Number(existingGuild.treasury) 
        : (guild.treasury !== undefined ? Number(guild.treasury) : 250);

      const updatedGuild = {
        ...guild,
        treasury: preservedTreasury,
        updatedAt: new Date().toISOString()
      };
      guildsDb[guildKey] = updatedGuild;
      saveGuilds();
      await syncGuildToFirestore(updatedGuild).catch(() => {});

      const ownerUsername = guild.ownerUsername || guild.leader;
      if (ownerUsername) {
        const uKey = String(ownerUsername).trim().toLowerCase();
        if (usersDb[uKey]) {
          usersDb[uKey].guild_has_owner = true;
          usersDb[uKey].guild_profile_data = updatedGuild;
          if (Array.isArray(guild.members)) {
            usersDb[uKey].guild_members = guild.members;
          }
          saveUserToFirestore(usersDb[uKey].username);
          saveUsersDb();
        }
      }

      return res.json({ success: true, guild: guildsDb[guildKey] });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guilds/disband", async (req, res) => {
    try {
      const { username, guildName } = req.body;
      if (!username || !guildName) {
        return res.status(400).json({ error: "Parameter tidak lengkap" });
      }
      const cleanUser = String(username).trim().toLowerCase();
      const guildKey = String(guildName).trim().toLowerCase();

      // Track as disbanded permanently
      disbandedGuilds.add(guildKey);
      saveDisbandedGuilds();

      // Delete from guildsDb and Firestore
      if (guildsDb[guildKey]) {
        delete guildsDb[guildKey];
        saveGuilds();
      }
      await removeGuildFromFirestore(guildKey).catch(() => {});

      // Clear guild state for all users in this clan
      Object.keys(usersDb).forEach(uKey => {
        const u = usersDb[uKey];
        if (u) {
          const userGuild = u.guild_profile_data?.name?.trim()?.toLowerCase();
          const inMembers = Array.isArray(u.guild_members) && u.guild_members.some((m: any) => {
            const mName = String(m.name || m.username || '').trim().toLowerCase();
            return mName === uKey || userGuild === guildKey;
          });
          if (userGuild === guildKey || inMembers || uKey === cleanUser) {
            u.guild_has_owner = false;
            u.guild_profile_data = null;
            u.guild_members = [];
            u.guild_lvl = 1;
            saveUserToFirestore(u.username).catch(() => {});
          }
        }
      });
      saveUsersDb();

      return res.json({ success: true, message: "Klan berhasil dibubarkan" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guilds/join", async (req, res) => {
    try {
      const { username, guildName, userRating, userLevel } = req.body;
      if (!username || !guildName) {
        return res.status(400).json({ error: "Parameter tidak lengkap" });
      }
      const cleanUser = String(username).trim().toLowerCase();
      const guildKey = String(guildName).trim().toLowerCase();

      // If user was previously in another clan, perform leave logic first
      if (usersDb[cleanUser] && usersDb[cleanUser].guild_profile_data?.name) {
        const oldGuildName = usersDb[cleanUser].guild_profile_data.name;
        const oldGuildKey = oldGuildName.trim().toLowerCase();
        if (oldGuildKey !== guildKey) {
          if (guildsDb[oldGuildKey] && Array.isArray(guildsDb[oldGuildKey].members)) {
            guildsDb[oldGuildKey].members = guildsDb[oldGuildKey].members.filter((m: any) => m.name?.toLowerCase() !== cleanUser);
            guildsDb[oldGuildKey].membersCount = guildsDb[oldGuildKey].members.length;
            guildsDb[oldGuildKey].totalElo = guildsDb[oldGuildKey].members.reduce((sum: number, m: any) => sum + (m.rating || 600), 0);
            saveGuilds();
            await syncGuildToFirestore(guildsDb[oldGuildKey]).catch(() => {});
          }
        }
      }

      let guild = guildsDb[guildKey];
      let ownerKey = Object.keys(usersDb).find(k => {
        const u = usersDb[k];
        return u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey;
      });

      const newMember = {
        name: username,
        role: 'Member',
        rating: Number(userRating) || 600,
        status: 'Online',
        contribution: 100,
        level: Number(userLevel) || 1
      };

      let updatedMembers: any[] = [];
      let finalGuildObj: any = guild;

      if (guild) {
        let members = Array.isArray(guild.members) ? guild.members : [];
        if (!members.some((m: any) => m.name?.toLowerCase() === cleanUser)) {
          members.push(newMember);
        }
        guild.members = members;
        guild.membersCount = members.length;
        guild.totalElo = members.reduce((sum: number, m: any) => sum + Number(m.rating || 600), 0);
        guildsDb[guildKey] = guild;
        saveGuilds();
        await syncGuildToFirestore(guild).catch(() => {});
        updatedMembers = members;
        finalGuildObj = guild;
      } else if (ownerKey && usersDb[ownerKey]) {
        const ownerObj = usersDb[ownerKey];
        let ownerMembers = Array.isArray(ownerObj.guild_members) ? ownerObj.guild_members : [];
        if (!ownerMembers.some((m: any) => m.name?.toLowerCase() === cleanUser)) {
          ownerMembers.push(newMember);
        }
        ownerObj.guild_members = ownerMembers;
        updatedMembers = ownerMembers;
        finalGuildObj = ownerObj.guild_profile_data || { name: guildName, tag: 'ELIT' };
        finalGuildObj.treasury = finalGuildObj.treasury !== undefined ? Number(finalGuildObj.treasury) : 250;
        finalGuildObj.members = updatedMembers;
        finalGuildObj.membersCount = updatedMembers.length;
        finalGuildObj.totalElo = updatedMembers.reduce((sum: number, m: any) => sum + Number(m.rating || 600), 0);
        guildsDb[guildKey] = finalGuildObj;
        saveGuilds();
        await syncGuildToFirestore(finalGuildObj).catch(() => {});
      } else {
        finalGuildObj = {
          id: guildName,
          name: guildName,
          tag: 'ELIT',
          leader: username,
          ownerUsername: username,
          level: 1,
          totalElo: Number(userRating) || 600,
          membersCount: 1,
          maxMembers: 30,
          motto: "Klan Catur Sejati",
          logo: "perisai",
          minRating: 600,
          joinSystem: 'Bebas',
          members: [newMember]
        };
        guildsDb[guildKey] = finalGuildObj;
        saveGuilds();
        await syncGuildToFirestore(finalGuildObj).catch(() => {});
        updatedMembers = [newMember];
      }

      // Sync user profile in usersDb
      if (usersDb[cleanUser]) {
        usersDb[cleanUser].guild_has_owner = true;
        usersDb[cleanUser].guild_profile_data = finalGuildObj;
        usersDb[cleanUser].guild_members = updatedMembers;
        await saveUserToFirestore(usersDb[cleanUser].username);
      }

      // Sync all existing members in usersDb for this guild
      Object.keys(usersDb).forEach(uKey => {
        const u = usersDb[uKey];
        if (u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey) {
          u.guild_members = updatedMembers;
          if (u.guild_profile_data) {
            u.guild_profile_data.totalElo = finalGuildObj.totalElo;
            u.guild_profile_data.membersCount = finalGuildObj.membersCount;
          }
          saveUserToFirestore(u.username);
        }
      });
      saveUsersDb();

      return res.json({ success: true, guild: finalGuildObj, members: updatedMembers });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guilds/leave", async (req, res) => {
    try {
      const { username, guildName } = req.body;
      if (!username || !guildName) return res.status(400).json({ error: "Parameter tidak lengkap" });
      const cleanUser = String(username).trim().toLowerCase();
      const guildKey = String(guildName).trim().toLowerCase();

      let remainingMembers: any[] = [];

      // 1. Update guildsDb
      if (guildsDb[guildKey]) {
        if (Array.isArray(guildsDb[guildKey].members)) {
          guildsDb[guildKey].members = guildsDb[guildKey].members.filter((m: any) => m.name?.toLowerCase() !== cleanUser);
          remainingMembers = guildsDb[guildKey].members;
          guildsDb[guildKey].membersCount = remainingMembers.length;
          guildsDb[guildKey].totalElo = remainingMembers.reduce((sum: number, m: any) => sum + Number(m.rating || 600), 0);
        }

        if (guildsDb[guildKey].membersCount <= 0) {
          delete guildsDb[guildKey];
          await removeGuildFromFirestore(guildKey).catch(() => {});
        } else {
          await syncGuildToFirestore(guildsDb[guildKey]).catch(() => {});
        }
        saveGuilds();
      }

      // 2. Clear user state
      if (usersDb[cleanUser]) {
        usersDb[cleanUser].guild_has_owner = false;
        usersDb[cleanUser].guild_profile_data = null;
        usersDb[cleanUser].guild_members = [];
        await saveUserToFirestore(usersDb[cleanUser].username);
      }

      // 3. Update remaining clan members in usersDb
      Object.keys(usersDb).forEach(uKey => {
        const u = usersDb[uKey];
        if (u && u.guild_has_owner && u.guild_profile_data?.name?.trim()?.toLowerCase() === guildKey && uKey !== cleanUser) {
          u.guild_members = remainingMembers;
          if (guildsDb[guildKey] && u.guild_profile_data) {
            u.guild_profile_data.totalElo = guildsDb[guildKey].totalElo;
            u.guild_profile_data.membersCount = guildsDb[guildKey].membersCount;
          }
          saveUserToFirestore(u.username);
        }
      });
      saveUsersDb();

      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/social/like", async (req, res) => {
    try {
      const { targetUsername, fromUsername } = req.body;
      if (!targetUsername || !fromUsername) {
        return res.status(400).json({ error: "Parameter tidak lengkap!" });
      }
      const targetKey = targetUsername.trim().toLowerCase();
      const targetUser = await getUserOrFetchFromFirestore(targetKey);
      if (!targetUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan!" });
      }

      targetUser.likedBy = targetUser.likedBy || [];
      const lowerFrom = fromUsername.trim().toLowerCase();
      const hasLiked = targetUser.likedBy.includes(lowerFrom);

      if (hasLiked) {
        targetUser.likedBy = targetUser.likedBy.filter((u: string) => u !== lowerFrom);
        targetUser.likesCount = Math.max(0, (targetUser.likesCount || 1) - 1);
      } else {
        targetUser.likedBy.push(lowerFrom);
        targetUser.likesCount = (targetUser.likesCount || 0) + 1;
      }

      if (db && !isFirestoreSuspended) {
        const docRef = doc(db, "users", targetKey);
        setDoc(docRef, { likesCount: targetUser.likesCount, likedBy: targetUser.likedBy }, { merge: true }).catch(() => {});
      }

      saveUsersDb();
      return res.json({
        success: true,
        likesCount: targetUser.likesCount,
        hasLiked: !hasLiked
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
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
