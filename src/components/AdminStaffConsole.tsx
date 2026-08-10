import React, { useState, useEffect } from 'react';
import { 
  Shield, Calendar, Megaphone, UserPlus, FileText, AlertTriangle, 
  Trash2, Plus, Clock, Award, Star, Lock, Eye, AlertCircle, Sparkles,
  Search, RefreshCw, Coins, Gem, Newspaper
} from 'lucide-react';
import { NewsPortal } from './NewsPortal';

interface AdminStaffConsoleProps {
  user: any;
  triggerAudio: (sound: string) => void;
  showLocalToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  askConfirmation?: (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }) => void;
}

export function AdminStaffConsole({ 
  user, 
  triggerAudio, 
  showLocalToast,
  askConfirmation
}: AdminStaffConsoleProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'events' | 'staff' | 'tickets' | 'elo' | 'news' | 'leaderboard_mod'>('news');

  // Leaderboard Moderation State
  const [nationalLeaderboardList, setNationalLeaderboardList] = useState<any[]>([]);
  const [clanLeaderboardList, setClanLeaderboardList] = useState<any[]>([]);
  const [hiddenUsersList, setHiddenUsersList] = useState<any[]>([]);
  const [hiddenClansList, setHiddenClansList] = useState<any[]>([]);
  const [modSearchUser, setModSearchUser] = useState('');
  const [modSearchClan, setModSearchClan] = useState('');
  const [modRemovalReason, setModRemovalReason] = useState('Pelanggaran aturan fair play / moderasi klan');
  const [isLoadingModLeaderboard, setIsLoadingModLeaderboard] = useState(false);

  const fetchModLeaderboardData = async () => {
    setIsLoadingModLeaderboard(true);
    try {
      const [userRes, clanRes, hiddenRes] = await Promise.all([
        fetch('/api/online/leaderboard'),
        fetch('/api/guilds/leaderboard'),
        fetch('/api/admin/leaderboard/hidden')
      ]);
      if (userRes.ok) {
        const uData = await userRes.json();
        setNationalLeaderboardList(Array.isArray(uData) ? uData : []);
      }
      if (clanRes.ok) {
        const cData = await clanRes.json();
        setClanLeaderboardList(cData.guilds || []);
      }
      if (hiddenRes.ok) {
        const hData = await hiddenRes.json();
        setHiddenUsersList(hData.users || []);
        setHiddenClansList(hData.clans || []);
      }
    } catch (err) {
      showLocalToast("Gagal memuat data papan peringkat untuk moderasi", "error");
    } finally {
      setIsLoadingModLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard_mod') {
      fetchModLeaderboardData();
    }
  }, [activeTab]);

  const handleHideUser = async (targetUsername: string) => {
    confirmAction(
      'Hapus Akun dari Papan Peringkat?',
      `Apakah Anda yakin ingin menghapus akun @${targetUsername} dari Papan Peringkat Nasional? Akun ini tidak akan muncul lagi di publik.`,
      async () => {
        try {
          const res = await fetch('/api/admin/leaderboard/hide-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: targetUsername,
              moderator: user?.username,
              reason: modRemovalReason
            })
          });
          const data = await res.json();
          if (data.success) {
            triggerAudio('win');
            showLocalToast(data.message, "success");
            fetchModLeaderboardData();
          } else {
            showLocalToast(data.error || "Gagal menghapus user", "error");
          }
        } catch (err) {
          showLocalToast("Koneksi server gagal", "error");
        }
      }
    );
  };

  const handleUnhideUser = async (targetUsername: string) => {
    try {
      const res = await fetch('/api/admin/leaderboard/unhide-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          moderator: user?.username
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(data.message, "success");
        fetchModLeaderboardData();
      } else {
        showLocalToast(data.error || "Gagal memulihkan user", "error");
      }
    } catch (err) {
      showLocalToast("Koneksi server gagal", "error");
    }
  };

  const handleHideClan = async (targetClanName: string) => {
    confirmAction(
      'Hapus Klan dari Papan Statistik?',
      `Apakah Anda yakin ingin menghapus klan "${targetClanName}" dari Papan Statistik Utama Club? Klan ini tidak akan muncul lagi di peringkat publik.`,
      async () => {
        try {
          const res = await fetch('/api/admin/leaderboard/hide-clan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clanName: targetClanName,
              moderator: user?.username,
              reason: modRemovalReason
            })
          });
          const data = await res.json();
          if (data.success) {
            triggerAudio('win');
            showLocalToast(data.message, "success");
            fetchModLeaderboardData();
          } else {
            showLocalToast(data.error || "Gagal menghapus klan", "error");
          }
        } catch (err) {
          showLocalToast("Koneksi server gagal", "error");
        }
      }
    );
  };

  const handleUnhideClan = async (targetClanName: string) => {
    try {
      const res = await fetch('/api/admin/leaderboard/unhide-clan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clanName: targetClanName,
          moderator: user?.username
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(data.message, "success");
        fetchModLeaderboardData();
      } else {
        showLocalToast(data.error || "Gagal memulihkan klan", "error");
      }
    } catch (err) {
      showLocalToast("Koneksi server gagal", "error");
    }
  };

  // Account Restoration state
  const [eloTargetUsername, setEloTargetUsername] = useState('');
  const [eloRestoreValue, setEloRestoreValue] = useState<number>(400);
  const [coinsRestoreValue, setCoinsRestoreValue] = useState<number>(500);
  const [diamondsRestoreValue, setDiamondsRestoreValue] = useState<number>(20);
  const [xpRestoreValue, setXpRestoreValue] = useState<number>(0);
  const [searchedEloUser, setSearchedEloUser] = useState<any | null>(null);
  const [isSearchingEloUser, setIsSearchingEloUser] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [eloRestoreReason, setEloRestoreReason] = useState('Pemulihan kegagalan sinkronisasi data akun (koin, diamond, ELO, XP)');

  const handleSearchEloUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!eloTargetUsername.trim()) {
      showLocalToast("Ketikkan username terlebih dahulu!", "error");
      return;
    }
    setIsSearchingEloUser(true);
    setSearchedEloUser(null);
    try {
      const res = await fetch(`/api/admin/user/lookup?username=${encodeURIComponent(eloTargetUsername)}`);
      const data = await res.json();
      if (data.success) {
        setSearchedEloUser(data.user);
        setEloRestoreValue(data.user.elo || 400);
        setCoinsRestoreValue(data.user.coins !== undefined ? data.user.coins : 500);
        setDiamondsRestoreValue(data.user.diamonds !== undefined ? data.user.diamonds : 20);
        setXpRestoreValue(data.user.xp || 0);
        showLocalToast(`User @${data.user.username} ditemukan!`, "success");
      } else {
        showLocalToast(data.error || "User tidak ditemukan!", "error");
      }
    } catch (err) {
      showLocalToast("Koneksi server gagal", "error");
    } finally {
      setIsSearchingEloUser(false);
    }
  };

  const handleRestoreAccountState = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = searchedEloUser ? searchedEloUser.username : eloTargetUsername;
    if (!target.trim()) {
      showLocalToast("Username sasaran wajib diisi!", "error");
      return;
    }
    if (eloRestoreValue === undefined || isNaN(eloRestoreValue) || eloRestoreValue < 0) {
      showLocalToast("Nilai ELO tidak valid!", "error");
      return;
    }
    if (coinsRestoreValue === undefined || isNaN(coinsRestoreValue) || coinsRestoreValue < 0) {
      showLocalToast("Nilai koin tidak valid!", "error");
      return;
    }
    if (diamondsRestoreValue === undefined || isNaN(diamondsRestoreValue) || diamondsRestoreValue < 0) {
      showLocalToast("Nilai diamond tidak valid!", "error");
      return;
    }
    if (xpRestoreValue === undefined || isNaN(xpRestoreValue) || xpRestoreValue < 0) {
      showLocalToast("Nilai XP tidak valid!", "error");
      return;
    }
    
    confirmAction(
      'Pulihkan Data Akun Pengguna?',
      `Apakah Anda yakin ingin memulihkan status akun @${target}? ELO: ${eloRestoreValue}, Koin: ${coinsRestoreValue}, Diamond: ${diamondsRestoreValue}, XP: ${xpRestoreValue}`,
      async () => {
        setIsRestoringState(true);
        try {
          const res = await fetch('/api/admin/user/restore-account-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: target,
              elo: eloRestoreValue,
              coins: coinsRestoreValue,
              diamonds: diamondsRestoreValue,
              xp: xpRestoreValue,
              moderator: user?.username,
              reason: eloRestoreReason
            })
          });
          const data = await res.json();
          if (data.success) {
            triggerAudio('win');
            showLocalToast(data.message || "Status akun berhasil dipulihkan!", "success");
            
            const targetScope = target.trim().toLowerCase();
            localStorage.setItem(`onlineRating:${targetScope}`, String(eloRestoreValue));
            localStorage.setItem(`coins:${targetScope}`, String(coinsRestoreValue));
            localStorage.setItem(`diamonds:${targetScope}`, String(diamondsRestoreValue));
            localStorage.setItem(`xp:${targetScope}`, String(xpRestoreValue));

            // Dispatch a sync event if we adjusted the logged-in user's stats
            if (targetScope === user?.username.trim().toLowerCase()) {
              window.dispatchEvent(new CustomEvent('sync_active_user'));
            }

            // Update searched user's displayed stats
            if (searchedEloUser) {
              setSearchedEloUser({
                ...searchedEloUser,
                elo: eloRestoreValue,
                coins: coinsRestoreValue,
                diamonds: diamondsRestoreValue,
                xp: xpRestoreValue
              });
            } else {
              setEloTargetUsername('');
            }
          } else {
            showLocalToast(data.error || "Gagal memulihkan status akun", "error");
          }
        } catch (err) {
          showLocalToast("Gagal menghubungi server", "error");
        } finally {
          setIsRestoringState(false);
        }
      }
    );
  };

  // Support Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    if (askConfirmation) {
      askConfirmation({
        title,
        message,
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        severity: 'danger',
        onConfirm
      });
    } else {
      if (window.confirm(message)) {
        onConfirm();
      }
    }
  };

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReportedFilter, setSelectedReportedFilter] = useState<string | null>(null);

  // Computes the frequently reported users based on the active reports list
  const frequentlyReportedUsers = React.useMemo(() => {
    const counts: Record<string, { count: number; reasons: Set<string>; details: string[] }> = {};
    reports.forEach((rep) => {
      const username = rep.reported;
      if (!username) return;
      if (!counts[username]) {
        counts[username] = { count: 0, reasons: new Set(), details: [] };
      }
      counts[username].count += 1;
      if (rep.reason) counts[username].reasons.add(rep.reason);
      if (rep.details) counts[username].details.push(rep.details);
    });

    return Object.entries(counts)
      .map(([username, info]) => ({
        username,
        count: info.count,
        reasons: Array.from(info.reasons),
        details: info.details,
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventPrize, setEventPrize] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // New structured fields
  const [eventCoinsReward, setEventCoinsReward] = useState<number>(500);
  const [eventDiamondsReward, setEventDiamondsReward] = useState<number>(50);
  const [eventXpReward, setEventXpReward] = useState<number>(100);
  const [eventItemReward, setEventItemReward] = useState<string>('');
  const [eventDuration, setEventDuration] = useState<number>(3);
  const [eventMinRating, setEventMinRating] = useState<number>(0);
  const [eventMinLevel, setEventMinLevel] = useState<number>(1);
  const [eventPremiumOnly, setEventPremiumOnly] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Staff registration state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isRegisteringStaff, setIsRegisteringStaff] = useState(false);

  const usernameLower = user?.username?.trim().toLowerCase() || '';
  const isAdmin = user?.isAdmin || usernameLower === 'nopal' || usernameLower === 'almaira';
  const isStaff = user?.isStaff || usernameLower === 'nopal' || usernameLower === 'almaira';

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/support/tickets/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      showLocalToast("Gagal mengambil tiket dukungan", "error");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;
    setIsSendingReply(true);
    try {
      const res = await fetch('/api/support/tickets/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username,
          ticketId: selectedTicket.id,
          text: adminReplyText
        })
      });
      const data = await res.json();
      if (data.success) {
        showLocalToast("Balasan dikirim!", "success");
        setAdminReplyText('');
        fetchTickets();
      }
    } catch (err) {
      showLocalToast("Gagal mengirim balasan", "error");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await fetch('/api/support/tickets/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username,
          ticketId
        })
      });
      const data = await res.json();
      if (data.success) {
        showLocalToast("Tiket ditandai selesai!", "success");
        fetchTickets();
      }
    } catch (err) {
      showLocalToast("Gagal menyelesaikan tiket", "error");
    }
  };

  useEffect(() => {
    if (isAdmin || isStaff) {
      fetchReports();
      fetchEvents();
      fetchTickets();
    }
  }, [user, activeTab]);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (e) {
      showLocalToast("Gagal mengambil laporan", "error");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (e) {}
  };

  // Create Event action
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      showLocalToast("Harap isi semua kolom wajib!", "error");
      return;
    }
    setIsScheduling(true);
    try {
      const res = await fetch('/api/admin/events/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          time: eventTime,
          prize: eventPrize || `${eventCoinsReward} Koin + ${eventDiamondsReward} Diamond`,
          desc: eventDesc,
          coinsReward: eventCoinsReward,
          diamondsReward: eventDiamondsReward,
          xpReward: eventXpReward,
          itemReward: eventItemReward,
          durationHours: eventDuration,
          reqMinRating: eventMinRating,
          reqMinLevel: eventMinLevel,
          reqPremiumOnly: eventPremiumOnly,
          overrideStatus: 'none'
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(`Event "${eventTitle}" sukses dijadwalkan!`, "success");
        setEventTitle('');
        setEventDate('');
        setEventTime('');
        setEventPrize('');
        setEventDesc('');
        setEventCoinsReward(500);
        setEventDiamondsReward(50);
        setEventXpReward(100);
        setEventItemReward('');
        setEventDuration(3);
        setEventMinRating(0);
        setEventMinLevel(1);
        setEventPremiumOnly(false);
        setEvents(data.events || []);
      }
    } catch (err) {
      showLocalToast("Gagal menjadwalkan event", "error");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleEventOverride = async (id: string, status: 'started' | 'stopped' | 'none') => {
    try {
      const res = await fetch('/api/admin/events/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(
          status === 'started' 
            ? "Event dipaksa AKTIF sekarang!" 
            : status === 'stopped' 
              ? "Event dihentikan secara manual!" 
              : "Event dikembalikan ke jadwal otomatis.", 
          "success"
        );
        setEvents(data.events || []);
      }
    } catch (e) {
      showLocalToast("Gagal mengubah status manual event", "error");
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/events/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast("Jadwal event berhasil dihapus!", "success");
        setEvents(data.events || []);
        setConfirmDeleteId(null);
      } else {
        showLocalToast(data.error || "Gagal menghapus event", "error");
      }
    } catch (e) {
      showLocalToast("Gagal menghapus event", "error");
    }
  };

  // Direct Staff Registration
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername.trim() || !staffPassword.trim()) {
      showLocalToast("Username dan password wajib!", "error");
      return;
    }
    setIsRegisteringStaff(true);
    try {
      const res = await fetch('/api/admin/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: staffUsername,
          password: staffPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(data.message || `Sukses merekrut staff @${staffUsername}!`, "success");
        setStaffUsername('');
        setStaffPassword('');
      } else {
        showLocalToast(data.error || "Gagal merekrut staff", "error");
      }
    } catch (err) {
      showLocalToast("Gagal menghubungi server", "error");
    } finally {
      setIsRegisteringStaff(false);
    }
  };

  const handleWarnUser = async (reportedUsername: string) => {
    try {
      const res = await fetch('/api/admin/user/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: reportedUsername })
      });
      const data = await res.json();
      if (data.success) {
        showLocalToast(data.message || `Sukses memperingatkan @${reportedUsername}!`, "success");
        triggerAudio('win');
      } else {
        showLocalToast(data.error || "Gagal memperingatkan user", "error");
      }
    } catch (e) {
      showLocalToast("Koneksi server gagal", "error");
    }
  };

  const handleBanUser = async (reportedUsername: string) => {
    confirmAction(
      'Ban Akun Permanen?',
      `Apakah Anda yakin ingin mem-banned akun @${reportedUsername} secara permanen? Tindakan ini tidak dapat dibatalkan!`,
      async () => {
        try {
          const res = await fetch('/api/admin/user/ban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: reportedUsername })
          });
          const data = await res.json();
          if (data.success) {
            showLocalToast(data.message || `User @${reportedUsername} telah di banned!`, "success");
            triggerAudio('lock');
          } else {
            showLocalToast(data.error || "Gagal membanned user", "error");
          }
        } catch (e) {
          showLocalToast("Koneksi server gagal", "error");
        }
      }
    );
  };

  // Access Guard check on UI
  if (!isAdmin && !isStaff) {
    return (
      <div className="bg-[#1e1c1a] border border-rose-900 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
        <Lock className="w-12 h-12 text-rose-500 mx-auto animate-bounce-slow" />
        <h3 className="text-white text-lg font-black uppercase tracking-tight">Akses Ditolak</h3>
        <p className="text-slate-400 text-xs font-semibold leading-relaxed">
          Halaman Konsol Admin & Staff ini terkunci secara ketat. Hubungi administrator utama <span className="text-[#81b64c] font-bold">@Almaira</span> atau <span className="text-[#81b64c] font-bold">@Nopal</span> untuk mendapatkan hak akses staff!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#262421] border border-[#3c3934] rounded-3xl p-6 shadow-2xl relative text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c3934] mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Shield className="w-6 h-6 text-[#81b64c]" /> Konsol Moderator & Staff [{isAdmin ? 'Admin' : 'Moderator / Staff'}]
          </h2>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
            Lihat laporan pelanggaran pelanggar catur, pasang turnamen musiman, dan rekrut asisten staff!
          </p>
        </div>
      </div>

      {/* DASH BOARD SWITCH TABS */}
      <div className="flex bg-[#1e1c1a] p-1 rounded-xl border border-[#3c3934] mb-6 overflow-x-auto">
        {[
          { id: 'news', label: 'Dashboard Berita', icon: Newspaper },
          { id: 'reports', label: 'Laporan Pengguna', icon: FileText },
          { id: 'events', label: 'Jadwalkan Event', icon: Calendar },
          { id: 'tickets', label: 'Dukungan Tiket', icon: Shield },
          { id: 'elo', label: 'Pemulihan ELO', icon: Award },
          { id: 'leaderboard_mod', label: 'Moderasi Peringkat', icon: Trash2 },
          isAdmin && { id: 'staff', label: 'Rekrut Staff Baru', icon: UserPlus }
        ].filter(Boolean).map((tb: any) => (
          <button
            key={tb.id}
            onClick={() => {
              setActiveTab(tb.id);
              triggerAudio('move');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tb.id 
                ? 'bg-[#81b64c] text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tb.icon className="w-3.5 h-3.5" />
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      {activeTab === 'news' && (
        <NewsPortal
          user={user}
          isAdmin={true}
          triggerAudio={triggerAudio}
          showToast={showLocalToast}
        />
      )}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* TOP EXPLANATION / HEADER OF REPORTS */}
          <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-3">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#81b64c]" /> Pusat Peninjauan Pelanggaran Sensus Komunitas
            </h4>
            <button
              onClick={() => {
                fetchReports();
                setSelectedReportedFilter(null);
              }}
              className="px-2 py-1 bg-[#1e1c1a]/95 border border-[#3c3934] rounded hover:border-[#81b64c] text-[9.5px] font-black uppercase tracking-wider text-slate-300 transition-all cursor-pointer"
            >
              Segarkan Data
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR PANEL: MOST REPORTED USERS (MOST FREQUENTLY REPORTED PANEL) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#1e1c1a]/85 border border-[#3c3934] p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Paling Sering Dilaporkan
                  </h5>
                  <span className="text-[8.5px] font-mono text-[#81b64c] font-black bg-[#262421] px-1.5 py-0.5 rounded border border-stone-800">
                    {frequentlyReportedUsers.length} Terduga
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                  Klik nama pengguna di bawah untuk langsung meninjau & memfilter berkas pelanggaran mereka dalam satu ketukan.
                </p>

                {frequentlyReportedUsers.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-[9px] font-bold uppercase">
                    Belum ada database pelanggar terkumpul.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {frequentlyReportedUsers.map((item) => {
                      const isFilteringThis = selectedReportedFilter === item.username;
                      return (
                        <button
                          key={item.username}
                          onClick={() => {
                            triggerAudio('move');
                            if (isFilteringThis) {
                              setSelectedReportedFilter(null);
                            } else {
                              setSelectedReportedFilter(item.username);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                            isFilteringThis 
                              ? 'bg-[#81b64c]/20 border-[#81b64c]/80 shadow shadow-[#81b64c]/20' 
                              : 'bg-[#262421]/60 border-[#3c3934] hover:bg-[#262421] hover:border-slate-500/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-white text-xs font-black truncate flex items-center gap-1">
                              <span className={isFilteringThis ? 'text-[#81b64c]' : 'text-slate-200'}>@{item.username}</span>
                              {item.count >= 3 && (
                                <span className="text-[7.5px] px-1 bg-red-950 border border-red-800 text-red-500 font-extrabold rounded uppercase tracking-tighter">
                                  Sirene
                                </span>
                              )}
                            </div>
                            <div className="text-[8.5px] font-bold text-slate-400 truncate mt-0.5" title={item.reasons.join(', ')}>
                              {item.reasons.length > 0 ? item.reasons.join(', ') : 'Tanpa Detail'}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-red-950/45 border border-red-900/60 text-red-400">
                              {item.count}x
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedReportedFilter && (
                  <button
                    onClick={() => {
                      triggerAudio('move');
                      setSelectedReportedFilter(null);
                    }}
                    className="w-full py-1.5 bg-[#262421] hover:bg-stone-800 text-slate-300 font-bold border border-[#3c3934] hover:border-slate-500 text-[9px] uppercase rounded-lg transition-all cursor-pointer text-center"
                  >
                    Hapus Filter Tinjauan
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: THE DETAILED INFRACTION REPORTS LIST */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {selectedReportedFilter 
                    ? `Menampilkan laporan pelanggaran khusus @${selectedReportedFilter}` 
                    : `Semua Berkas Laporan Pelanggaran (${reports.length})`}
                </h5>
                {selectedReportedFilter && (
                  <span className="text-[9px] font-mono text-amber-400 font-black">
                    TERFILTER: {reports.filter(r => r.reported === selectedReportedFilter).length} BARIS
                  </span>
                )}
              </div>

              {isLoadingReports ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold uppercase animate-pulse">
                  Memuat berkas laporan masuk...
                </div>
              ) : reports.length === 0 ? (
                <div className="bg-[#1e1c1a]/90 text-center p-8 rounded-2xl border border-[#3c3934] space-y-1">
                  <AlertCircle className="w-6 h-6 text-slate-600 mx-auto" />
                  <div className="text-white text-xs font-extrabold uppercase">Arena Catur Bersih!</div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    Tidak ada laporan penyalahgunaan, spammer, atau kecurangan pengguna saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = selectedReportedFilter 
                      ? reports.filter(r => r.reported === selectedReportedFilter)
                      : reports;

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500 text-[10px] font-bold uppercase">
                          Tidak ditemukan laporan untuk filter ini.
                        </div>
                      );
                    }

                    return filtered.map((rep) => (
                      <div key={rep.id} className="bg-[#1e1c1a] border border-[#3c3934] rounded-2xl p-4 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-red-950/45 border border-red-800 text-red-500 text-[8px] font-black rounded uppercase">
                            Laporan Masuk
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase">
                            {new Date(rep.reportedAt).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="text-xs font-extrabold text-white flex flex-wrap gap-x-2 gap-y-1">
                          <span>Pelapor: <span className="text-[#81b64c]">@{rep.reporter}</span></span>
                          <span className="text-slate-500">•</span>
                          <span>Dilapor: <span className="text-red-400">@{rep.reported}</span></span>
                        </div>

                        <div className="bg-[#262421] p-2.5 rounded-xl border border-stone-800 text-left">
                          <div className="text-white text-xs font-black">Alasan: {rep.reason}</div>
                          <p className="text-slate-400 text-[10px] font-semibold mt-1">Detail: {rep.details || 'Tidak ada detail ekstra.'}</p>
                        </div>

                        {/* Quick Dismiss or Warn action buttons simulation */}
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleWarnUser(rep.reported)}
                            className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-white font-black text-[9px] uppercase rounded cursor-pointer"
                          >
                            Beri Peringatan
                          </button>
                          <button
                            onClick={() => handleBanUser(rep.reported)}
                            className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-black text-[9px] uppercase rounded cursor-pointer"
                          >
                            Banned User
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateEvent} className="bg-[#1e1c1a]/60 border border-[#3c3934] p-4 rounded-2xl space-y-4">
            <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-widest flex items-center gap-1">
              <Plus className="w-4 h-4" /> Jadwalkan Event Turnamen Catur Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nama Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Liga Catur Grandmaster Almaira"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hadiah Custom (Teks)</label>
                <input
                  type="text"
                  placeholder="Misal: Piala Emas Eksklusif (Kosongkan jika ingin auto dari koin)"
                  value={eventPrize}
                  onChange={(e) => setEventPrize(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pukul Mulai *</label>
                <input
                  type="time"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500"
                />
              </div>

              {/* NEW FIELDS: STRUCTURED REWARDS */}
              <div className="bg-black/35 border border-[#3c3934] rounded-2xl p-3 md:col-span-2 space-y-3">
                <p className="text-[9.5px] font-black text-amber-500 uppercase tracking-widest border-b border-[#3c3934] pb-1.5 flex items-center gap-1">
                   Konfigurasi Hadiah Misi (Terstruktur)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Koin Reward</label>
                    <input
                      type="number"
                      min={0}
                      value={eventCoinsReward}
                      onChange={(e) => setEventCoinsReward(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Diamond Reward</label>
                    <input
                      type="number"
                      min={0}
                      value={eventDiamondsReward}
                      onChange={(e) => setEventDiamondsReward(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">XP Reward</label>
                    <input
                      type="number"
                      min={0}
                      value={eventXpReward}
                      onChange={(e) => setEventXpReward(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Item/Gelar Id</label>
                    <input
                      type="text"
                      placeholder="Misal: Jawara Arena"
                      value={eventItemReward}
                      onChange={(e) => setEventItemReward(e.target.value)}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* NEW FIELDS: ELIGIBILITY & DURATION */}
              <div className="bg-black/35 border border-[#3c3934] rounded-2xl p-3 md:col-span-2 space-y-3">
                <p className="text-[9.5px] font-black text-[#81b64c] uppercase tracking-widest border-b border-[#3c3934] pb-1.5 flex items-center gap-1">
                   Syarat Pendaftaran & Durasi Event
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Durasi (Jam)</label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={eventDuration}
                      onChange={(e) => setEventDuration(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Min ELO Rating</label>
                    <input
                      type="number"
                      min={0}
                      value={eventMinRating}
                      onChange={(e) => setEventMinRating(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Min Level Akun</label>
                    <input
                      type="number"
                      min={1}
                      value={eventMinLevel}
                      onChange={(e) => setEventMinLevel(Number(e.target.value))}
                      className="w-full bg-[#262421] border border-[#3c3934] px-2.5 py-2 rounded-lg text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase block mb-1">Tipe Member</label>
                    <label className="inline-flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={eventPremiumOnly}
                        onChange={(e) => setEventPremiumOnly(e.target.checked)}
                        className="rounded border-[#3c3934] text-[#81b64c] focus:ring-0 bg-[#262421] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Premium Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Deskripsi & Syarat Event</label>
                <textarea
                  placeholder="Ketikkan keterangan lengkap turnamen..."
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isScheduling}
              className="w-full py-3 bg-[#81b64c] hover:bg-[#81b64c]/90 text-white font-extrabold text-xs uppercase rounded-xl shadow-md tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {isScheduling ? 'Menjadwalkan...' : 'Umpankan & Jadwalkan Turnamen Musiman'}
            </button>
          </form>

          {/* LIST CURRENT EVENTS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Event Aktif Terjadwal ({events.length})
            </h4>
            {events.length === 0 ? (
              <div className="text-center p-4 text-[10px] font-bold text-slate-500 uppercase">
                Belum ada turnamen terjadwal saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {events.map(ev => {
                  let statusLabel = "Menunggu Jadwal";
                  let statusBg = "bg-blue-950/60 text-blue-400 border border-blue-800/40";
                  
                  if (ev.overrideStatus === 'started') {
                    statusLabel = "Aktif (Manual)";
                    statusBg = "bg-emerald-950 text-emerald-400 border border-emerald-800";
                  } else if (ev.overrideStatus === 'stopped') {
                    statusLabel = "Berhenti (Manual)";
                    statusBg = "bg-rose-950 text-rose-400 border border-rose-800";
                  } else {
                    try {
                      const eventStart = new Date(`${ev.date}T${ev.time}`);
                      if (!isNaN(eventStart.getTime())) {
                        const now = new Date();
                        const durMs = (ev.durationHours || 3) * 60 * 60 * 1000;
                        if (now >= eventStart && (now.getTime() - eventStart.getTime() < durMs)) {
                          statusLabel = "Aktif (Otomatis)";
                          statusBg = "bg-emerald-950 text-emerald-400 border border-emerald-800";
                        } else if (now.getTime() - eventStart.getTime() >= durMs) {
                          statusLabel = "Selesai (Expired)";
                          statusBg = "bg-zinc-800 text-zinc-400 border border-zinc-700";
                        }
                      }
                    } catch (err) {}
                  }

                  return (
                    <div key={ev.id} className="bg-[#1e1c1a] border border-[#3c3934] rounded-2xl p-4 space-y-3 text-left flex flex-col justify-between hover:border-purple-500/30 transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-white text-xs font-black flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> {ev.title}
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-1.5 leading-relaxed font-semibold">{ev.desc || "Tidak ada rincian tambahan."}</p>
                      </div>

                      <div className="bg-black/30 border border-[#3c3934]/60 rounded-xl p-2.5 text-[9px] font-semibold uppercase text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#81b64c]" />
                          <span>Mulai: {ev.date} pukul {ev.time} ({ev.durationHours || 3} jam)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-yellow-500" />
                          <span>Hadiah: <span className="text-yellow-400 font-extrabold">{ev.prize}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-500 text-[8.5px] font-bold border-t border-[#3c3934]/45 pt-1 mt-1">
                          <span> Detail: {ev.coinsReward || 0} Koin | {ev.diamondsReward || 0} Dia | {ev.xpReward || 0} XP {ev.itemReward ? `| ${ev.itemReward}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#81b64c] text-[8.5px] font-bold">
                          <span> Syarat: Rating &ge;{ev.reqMinRating || 0} | Lvl &ge;{ev.reqMinLevel || 1} {ev.reqPremiumOnly ? '| Khusus Premium' : ''}</span>
                        </div>
                      </div>

                      {/* Manual Override & Deletion panel */}
                      <div className="pt-2 border-t border-[#3c3934]/60 flex flex-wrap gap-1.5 justify-between">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEventOverride(ev.id, 'started')}
                            className={`px-2 py-1 text-[8.5px] font-black uppercase rounded cursor-pointer transition-all ${
                              ev.overrideStatus === 'started' 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-zinc-800 hover:bg-emerald-950 text-emerald-400'
                            }`}
                            title="Paksa Aktifkan Event Sekarang"
                          >
                            Mulai
                          </button>
                          <button
                            onClick={() => handleEventOverride(ev.id, 'stopped')}
                            className={`px-2 py-1 text-[8.5px] font-black uppercase rounded cursor-pointer transition-all ${
                              ev.overrideStatus === 'stopped' 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-zinc-800 hover:bg-rose-950 text-rose-400'
                            }`}
                            title="Hentikan Event Sekarang"
                          >
                            Stop 
                          </button>
                          <button
                            onClick={() => handleEventOverride(ev.id, 'none')}
                            className={`px-2 py-1 text-[8.5px] font-black uppercase rounded cursor-pointer transition-all ${
                              ev.overrideStatus === 'none' || !ev.overrideStatus
                                ? 'bg-purple-800 text-white' 
                                : 'bg-zinc-800 hover:bg-purple-950 text-purple-400'
                            }`}
                            title="Kembali ke Jadwal Otomatis"
                          >
                            Oto ️
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            confirmAction(
                              'Hapus Event Permanen?',
                              'Apakah Anda yakin ingin menghapus event ini secara permanen?',
                              () => {
                                handleEventDelete(ev.id);
                              }
                            );
                          }}
                          className="px-2 py-1 border text-[8.5px] font-black uppercase rounded cursor-pointer transition-all bg-red-950 hover:bg-red-700 border-red-700/50 text-red-400 hover:text-white"
                          title="Hapus Event ini Permanen"
                        >
                          Hapus ️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-4">
          <form onSubmit={handleRegisterStaff} className="bg-[#1e1c1a]/60 border border-[#3c3934] p-4 rounded-2xl space-y-4 max-w-md mx-auto">
            <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-widest flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Daftarkan Staff & Asisten Moderator Baru
            </h4>
            <p className="text-[9.5px] text-slate-400 leading-normal font-bold">
              Ketikkan username asisten Anda. Jika asisten belum mendaftarkan akun, sistem akan otomatis melahirkan akun baru dengan bendera Moderator/Staff (isStaff) bertenaga penuh!
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Username Staff *</label>
                <input
                  type="text"
                  required
                  placeholder="Ketikkan nama staff..."
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Kata Sandi Akun Staff *</label>
                <input
                  type="password"
                  required
                  placeholder="Tentukan kata sandi baru..."
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegisteringStaff}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider shadow-md transition-all disabled:opacity-50"
            >
              {isRegisteringStaff ? 'Mendaftarkan...' : 'Daftarkan & Amankan Hak Staff'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Manajemen Tiket Dukungan & Laporan Bug
              </h4>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
                Tanggapi keluhan keuangan, bug mekanis, atau masukan dari member Pal Mate
              </p>
            </div>
            <button
              onClick={() => {
                fetchTickets();
                triggerAudio('move');
              }}
              className="px-4 py-2 bg-[#262421] border border-[#3c3934] hover:bg-[#312e2b] text-white text-[10px] font-black uppercase rounded-xl tracking-wider shrink-0 transition-all cursor-pointer"
            >
              Segarkan List
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tickets List - 5 Columns */}
            <div className="lg:col-span-5 bg-[#1e1c1a]/50 border border-[#3c3934] p-4.5 rounded-2xl space-y-4">
              <h5 className="text-[11px] font-black text-white uppercase tracking-wider">Semua Tiket Masuk</h5>
              {isLoadingTickets && tickets.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">
                  Memuat Tiket...
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase">
                  Tidak ada tiket masuk
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {tickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    const isResolved = t.status === 'resolved';
                    const isPending = t.status === 'pending';
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(t);
                          triggerAudio('move');
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-[#374e2a] border-[#5d8a32]/60 shadow-lg' 
                            : 'bg-[#262421]/90 border-[#3c3934] hover:bg-[#312e2b]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-black text-slate-400 tracking-wider">#{t.id}</span>
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase border ${
                            isResolved 
                              ? 'bg-emerald-950/40 text-[#85cb48] border-emerald-500/30' 
                              : isPending 
                                ? 'bg-amber-950/40 text-amber-400 border-amber-500/30' 
                                : 'bg-red-950/40 text-red-400 border-red-500/30'
                          }`}>
                            {t.status === 'resolved' ? 'Selesai' : t.status === 'pending' ? 'Pending' : 'Open'}
                          </span>
                        </div>
                        <h6 className="text-[11px] font-black text-white uppercase tracking-tight mt-1 truncate">
                          {t.title}
                        </h6>
                        <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-400 mt-2">
                          <span className="truncate">Oleh: @{t.username}</span>
                          <span className="shrink-0">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ticket Details & Chat - 7 Columns */}
            <div className="lg:col-span-7 bg-[#1e1c1a]/50 border border-[#3c3934] p-5 rounded-2xl flex flex-col min-h-[400px]">
              {selectedTicket ? (
                <div className="flex flex-col h-full flex-1 justify-between gap-4">
                  <div className="space-y-4">
                    {/* Header detail */}
                    <div className="border-b border-[#3c3934] pb-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#81b64c] tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                            {selectedTicket.category}
                          </span>
                          <span className="text-[10px] font-black text-slate-400">#{selectedTicket.id}</span>
                        </div>
                        <h5 className="text-sm font-black text-white mt-1.5 uppercase leading-tight">{selectedTicket.title}</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Oleh: @{selectedTicket.username} | {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                      </div>
                      {selectedTicket.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            handleResolveTicket(selectedTicket.id);
                            triggerAudio('win');
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[8px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                        >
                          Selesaikan
                        </button>
                      )}
                    </div>

                    {/* Original Complaint Description */}
                    <div className="bg-[#262421] p-3.5 rounded-xl border border-stone-800">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-[8px] mb-1">Deskripsi Masalah:</p>
                      <p className="text-slate-200 text-xs leading-relaxed font-semibold">{selectedTicket.description}</p>
                    </div>

                    {/* Replies Timeline */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Linimasa Balasan</p>
                      {selectedTicket.replies.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-semibold italic">Belum ada tanggapan untuk tiket ini.</p>
                      ) : (
                        selectedTicket.replies.map((rep: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-xl border ${
                              rep.isAdmin 
                                ? 'bg-purple-950/20 border-purple-500/30 ml-4' 
                                : 'bg-[#262421]/60 border-[#3c3934] mr-4'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[8px] font-black uppercase mb-1">
                              <span className={rep.isAdmin ? "text-purple-400" : "text-slate-400"}>
                                {rep.isAdmin ? "STAFF SUPPORT (@" + rep.sender + ")" : "@" + rep.sender}
                              </span>
                              <span className="text-slate-500">{new Date(rep.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-200 text-xs leading-relaxed font-semibold">{rep.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Form input reply */}
                  <div className="border-t border-[#3c3934] pt-4 mt-auto">
                    {selectedTicket.status === 'resolved' ? (
                      <div className="bg-[#23271d] border border-emerald-900/50 p-3 rounded-xl text-center text-emerald-500 text-[10px] font-black uppercase">
                        Tiket ini telah diselesaikan dan ditutup untuk tanggapan.
                      </div>
                    ) : (
                      <form onSubmit={handleSendAdminReply} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Tanggapi laporan member ini..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          className="flex-1 bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply}
                          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider shrink-0 transition-all cursor-pointer"
                        >
                          {isSendingReply ? 'Kirim...' : 'Kirim Balasan'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <Shield className="w-10 h-10 stroke-slate-600 mb-2.5" />
                  <p className="text-[11px] font-black uppercase tracking-wider">Pilih salah satu tiket untuk meninjau riwayat bantuan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'elo' && (
        <div className="space-y-6">
          <div className="border-b border-[#3c3934]/60 pb-3">
            <h4 className="text-sm font-black text-[#81b64c] uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-5 h-5 text-[#81b64c]" /> Pemulihan Skor ELO Manual (ELO Restoration)
            </h4>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
              Pulihkan skor ELO pengguna yang terhapus atau kembali ke nilai awal (400) akibat kegagalan sinkronisasi siklus masuk/keluar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (5 cols) */}
            <div className="lg:col-span-5 bg-[#1e1c1a]/50 border border-[#3c3934] p-5 rounded-2xl space-y-4">
              <form onSubmit={handleSearchEloUser} className="space-y-3">
                <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#81b64c]" /> Cari Akun Pengguna
                </h5>
                <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                  Masukkan username pengguna (contoh: <span className="text-[#81b64c]">almaira</span> atau <span className="text-[#81b64c]">@nopal</span>) untuk meninjau status terkininya sebelum melakukan pemulihan.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ketikkan username..."
                    value={eloTargetUsername}
                    onChange={(e) => setEloTargetUsername(e.target.value)}
                    className="flex-1 bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingEloUser}
                    className="px-4 py-2.5 bg-[#81b64c] hover:bg-[#81b64c]/90 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isSearchingEloUser ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Cari</span>
                  </button>
                </div>
              </form>

              {searchedEloUser ? (
                <form onSubmit={handleRestoreAccountState} className="space-y-4 pt-3 border-t border-[#3c3934]">
                  <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-yellow-500">
                    <Award className="w-4 h-4" /> Form Pemulihan Status Akun
                  </h5>

                  {/* Grid for values */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">ELO Rating Baru</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={4000}
                        value={eloRestoreValue}
                        onChange={(e) => setEloRestoreValue(Number(e.target.value))}
                        className="w-full bg-[#262421] border border-[#3c3934] px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Total XP Baru</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={1000000}
                        value={xpRestoreValue}
                        onChange={(e) => setXpRestoreValue(Number(e.target.value))}
                        className="w-full bg-[#262421] border border-[#3c3934] px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" /> Koin Baru
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={1000000}
                        value={coinsRestoreValue}
                        onChange={(e) => setCoinsRestoreValue(Number(e.target.value))}
                        className="w-full bg-[#262421] border border-[#3c3934] px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Gem className="w-3 h-3 text-cyan-400" /> Diamond Baru
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={100000}
                        value={diamondsRestoreValue}
                        onChange={(e) => setDiamondsRestoreValue(Number(e.target.value))}
                        className="w-full bg-[#262421] border border-[#3c3934] px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">Alasan Pemulihan (Untuk Log Audit & Kotak Masuk)</label>
                    <textarea
                      required
                      rows={2}
                      value={eloRestoreReason}
                      onChange={(e) => setEloRestoreReason(e.target.value)}
                      className="w-full bg-[#262421] border border-[#3c3934] px-3.5 py-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c]"
                      placeholder="Masukkan alasan pemulihan data akun..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRestoringState}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isRestoringState ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-4 h-4" />}
                    <span>Simpan & Pulihkan Data Akun</span>
                  </button>
                </form>
              ) : (
                <div className="pt-4 border-t border-[#3c3934]/60 text-center py-8 text-slate-500 text-[10px] font-black uppercase leading-relaxed">
                  Silakan cari pengguna terlebih dahulu untuk menampilkan form pemulihan data akun.
                </div>
              )}
            </div>

            {/* Right Column: User Card Details (7 cols) */}
            <div className="lg:col-span-7 bg-[#1e1c1a]/50 border border-[#3c3934] p-5 rounded-2xl flex flex-col justify-center min-h-[300px]">
              {searchedEloUser ? (
                <div className="space-y-4 text-center">
                  <div className="relative inline-block mx-auto">
                    <img
                      src={searchedEloUser.profileAvatar || "/src/assets/images/avatar_martin_1779709510230.png"}
                      alt={searchedEloUser.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#81b64c] shadow-lg mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 bg-amber-500 text-black font-mono font-black text-[9px] px-1.5 py-0.5 rounded border border-[#1e1c1a] uppercase">
                      Lv. {Math.floor(Math.sqrt(searchedEloUser.xp / 100)) + 1}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-base font-black text-white flex items-center justify-center gap-1">
                      @{searchedEloUser.username}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                      Profil Pengguna Terpilih
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <div className="bg-[#262421]/90 border border-[#3c3934] p-2.5 rounded-xl text-center">
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">ELO Rating</div>
                      <div className="text-sm font-black text-[#81b64c] font-mono mt-0.5">
                        {searchedEloUser.elo || 400} ELO
                      </div>
                    </div>
                    <div className="bg-[#262421]/90 border border-[#3c3934] p-2.5 rounded-xl text-center">
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Tanding</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5">
                        {searchedEloUser.matchesPlayed || 0}x
                      </div>
                    </div>
                    <div className="bg-[#262421]/90 border border-[#3c3934] p-2.5 rounded-xl text-center">
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total XP</div>
                      <div className="text-sm font-black text-yellow-500 font-mono mt-0.5">
                        {searchedEloUser.xp || 0}
                      </div>
                    </div>
                    <div className="bg-[#262421]/90 border border-[#3c3934] p-2.5 rounded-xl text-center flex justify-around items-center">
                      <div>
                        <div className="text-[8px] text-slate-400 font-black uppercase">Koin</div>
                        <div className="text-xs font-black text-amber-500 font-mono">{searchedEloUser.coins !== undefined ? searchedEloUser.coins : 500}</div>
                      </div>
                      <div className="border-l border-[#3c3934] h-6"></div>
                      <div>
                        <div className="text-[8px] text-slate-400 font-black uppercase">Diamond</div>
                        <div className="text-xs font-black text-cyan-400 font-mono">{searchedEloUser.diamonds !== undefined ? searchedEloUser.diamonds : 20}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#262421]/45 border border-[#3c3934]/60 p-3 rounded-xl max-w-sm mx-auto text-left space-y-1">
                    <div className="text-[9px] font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-[#81b64c]" /> Status Verifikasi Sinkronisasi:
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                      Gunakan panel ini untuk mengoreksi / memulihkan koin, diamond, XP, dan ELO rating pengguna yang terkena dampak bug reset atau kegagalan sinkronisasi saat pergantian hari/akun.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <Award className="w-12 h-12 text-slate-600 mx-auto stroke-1.5 mb-2.5 animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-wider">Detail akun akan ditampilkan di sini setelah dicari</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard_mod' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3c3934] pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-500" /> Moderator Console: Hapus Akun & Klan dari Leaderboard
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Moderator & Staff dapat menyembunyikan/menghapus akun nakal atau klan bermasalah dari Papan Peringkat Nasional dan Papan Statistik Club.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchModLeaderboardData}
              className="px-3 py-1.5 bg-[#1e1c1a] border border-[#3c3934] hover:border-[#81b64c] text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModLeaderboard ? 'animate-spin' : ''}`} /> Segarkan Data
            </button>
          </div>

          {/* Reason Input */}
          <div className="bg-[#1e1c1a] border border-[#3c3934] p-3.5 rounded-2xl">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Alasan Tindakan Moderasi (Akan dicatat di Log Sensus Server):
            </label>
            <input
              type="text"
              value={modRemovalReason}
              onChange={(e) => setModRemovalReason(e.target.value)}
              placeholder="Misal: Pelanggaran botting / cheater / klan bermasalah"
              className="w-full bg-[#262421] border border-[#3c3934] focus:border-[#81b64c] text-slate-200 text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. NATIONAL LEADERBOARD MODERATION */}
            <div className="bg-[#1e1c1a] border border-[#3c3934] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-2">
                <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Papan Peringkat Nasional (Akun Individual)
                </h5>
                <span className="text-[9px] font-mono text-slate-500 font-extrabold">{nationalLeaderboardList.length} Akun Aktif</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modSearchUser}
                  onChange={(e) => setModSearchUser(e.target.value)}
                  placeholder="Cari username..."
                  className="w-full bg-[#262421] border border-[#3c3934] text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl outline-none"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {nationalLeaderboardList
                  .filter((p: any) => p.name && p.name.toLowerCase().includes(modSearchUser.toLowerCase()))
                  .map((player: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-[#262421] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>@{player.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded font-mono font-bold">{player.elo || 400} ELO</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">{player.badge}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleHideUser(player.name)}
                        className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus dari Leaderboard
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* 2. CLUB / CLAN LEADERBOARD MODERATION */}
            <div className="bg-[#1e1c1a] border border-[#3c3934] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#3c3934]/60 pb-2">
                <h5 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Papan Statistik Utama Club (Klan)
                </h5>
                <span className="text-[9px] font-mono text-slate-500 font-extrabold">{clanLeaderboardList.length} Klan Aktif</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modSearchClan}
                  onChange={(e) => setModSearchClan(e.target.value)}
                  placeholder="Cari nama klan..."
                  className="w-full bg-[#262421] border border-[#3c3934] text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl outline-none"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {clanLeaderboardList
                  .filter((g: any) => g.name && g.name.toLowerCase().includes(modSearchClan.toLowerCase()))
                  .map((guild: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-[#262421] border border-[#3c3934] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>[{guild.tag}] {guild.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-cyan-400 rounded font-mono font-bold">Lvl {guild.level}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">Ketua: @{guild.leader} | Elo Total: {guild.totalElo}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleHideClan(guild.name)}
                        className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Klan
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 3. LIST OF CURRENTLY HIDDEN ITEMS WITH RESTORE OPTION */}
          <div className="bg-[#1e1c1a] border border-[#3c3934] p-4 rounded-2xl space-y-4">
            <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#3c3934]/60 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Daftar Akun & Klan Yang Sedang Dihapus / Disembunyikan oleh Moderator
            </h5>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Hidden Users */}
              <div className="space-y-2">
                <h6 className="text-[10px] font-extrabold text-slate-400 uppercase">Akun Dihapus ({hiddenUsersList.length})</h6>
                {hiddenUsersList.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Tidak ada akun yang sedang disembunyikan.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {hiddenUsersList.map((hu: any, idx: number) => (
                      <div key={idx} className="p-2 bg-[#262421] border border-rose-900/40 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-rose-200">@{hu.username}</div>
                          <div className="text-[8.5px] text-slate-400">Oleh: @{hu.moderator} | Alasan: {hu.reason}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnhideUser(hu.username)}
                          className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-[9px] font-bold uppercase rounded cursor-pointer shrink-0"
                        >
                          Pulihkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hidden Clans */}
              <div className="space-y-2">
                <h6 className="text-[10px] font-extrabold text-slate-400 uppercase">Klan Dihapus ({hiddenClansList.length})</h6>
                {hiddenClansList.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Tidak ada klan yang sedang disembunyikan.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {hiddenClansList.map((hc: any, idx: number) => (
                      <div key={idx} className="p-2 bg-[#262421] border border-rose-900/40 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-rose-200">{hc.clanName}</div>
                          <div className="text-[8.5px] text-slate-400">Oleh: @{hc.moderator} | Alasan: {hc.reason}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnhideClan(hc.clanName)}
                          className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-[9px] font-bold uppercase rounded cursor-pointer shrink-0"
                        >
                          Pulihkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
