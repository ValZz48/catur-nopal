import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, UserCheck, UserMinus, MessageSquare, 
  Eye, Lock, Unlock, Check, X, Send, Clock, ShieldAlert,
  Users, ChevronRight, MessageCircle, Info, Shield, Plus, ShieldCheck
} from 'lucide-react';
import { AvatarWithFrame } from './AvatarWithFrame';

interface SocialHubProps {
  user: any;
  setUser: (user: any) => void;
  selectedFrame: string;
  onlineRating: number;
  triggerAudio: (sound: string) => void;
  showLocalToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export function SocialHub({ 
  user, 
  setUser, 
  selectedFrame, 
  onlineRating, 
  triggerAudio, 
  showLocalToast 
}: SocialHubProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'followers' | 'following' | 'chat'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Active Profile Wall Viewer
  const [viewingProfile, setViewingProfile] = useState<any | null>(null);
  
  // Privacy Settings state
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);

  // Follow requests received
  const [followRequests, setFollowRequests] = useState<any[]>([]);

  // Visitor Log states
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorFilter, setVisitorFilter] = useState<'24h' | '3d' | '7d' | 'all'>('all');
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);

  // Chat/DM states
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<string | null>(null);
  const [activeChatAvatar, setActiveChatAvatar] = useState('/src/assets/images/avatar_martin_1779709510230.png');
  const [activeChatElo, setActiveChatElo] = useState(400);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatApproved, setChatApproved] = useState(true);
  const [chatSentCount, setChatSentCount] = useState(0);
  const [isChatRestricted, setIsChatRestricted] = useState(false);

  const currentUsername = user?.username || "Guest";

  // Load account properties
  useEffect(() => {
    if (user) {
      setIsPrivateAccount(!!user.isPrivate);
      fetchConversations();
      fetchVisitorLogs();
      fetchExtendedProfile();
    }
  }, [user]);

  // Sync follow requests etc. from index inbox
  const fetchExtendedProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setIsPrivateAccount(!!data.user.isPrivate);
        if (data.user.followRequests) {
          setFollowRequests(data.user.followRequests);
        }
      }
    } catch (e) {}
  };

  // Perform User Search
  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/social/search?query=${encodeURIComponent(val)}&current=${encodeURIComponent(currentUsername)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users || []);
      }
    } catch (e) {
      showLocalToast("Gagal mencari pengguna", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // View User Profile Wall & Log Visit!
  const viewProfileWall = async (targetUser: any) => {
    setViewingProfile(targetUser);
    triggerAudio('move');

    // Save visitor log entry via API
    try {
      await fetch('/api/social/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor: currentUsername, host: targetUser.username })
      });
    } catch (e) {}
  };

  // Toggle Account Privacy
  const togglePrivacy = async () => {
    const nextVal = !isPrivateAccount;
    setIsPrivateAccount(nextVal);
    triggerAudio('move');
    try {
      const res = await fetch('/api/social/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, isPrivate: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        showLocalToast(`Akun Anda sekarang bertipe ${nextVal ? 'Privat ' : 'Publik '}`, "success");
        if (user) {
          setUser({ ...user, isPrivate: nextVal });
        }
      }
    } catch (err) {
      showLocalToast("Gagal mengubah privasi", "error");
    }
  };

  // Send Follow / Follow Request
  const handleFollow = async (target: any) => {
    if (!user) {
      showLocalToast("Silakan masuk terlebih dahulu untuk memfollow!", "error");
      return;
    }
    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, targetUsername: target.username })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        if (data.status === 'requested') {
          showLocalToast(`Permintaan mengikuti terkirim ke @${target.username} (Akun Privat)`, "info");
          setViewingProfile({ ...target, isRequested: true });
        } else {
          showLocalToast(`Anda sekarang mengikuti @${target.username}!`, "success");
          setViewingProfile({ ...target, isFollowing: true });
        }
        handleSearch(searchQuery);
      }
    } catch (e) {
      showLocalToast("Gagal memproses tombol follow", "error");
    }
  };

  // Unfollow user
  const handleUnfollow = async (target: any) => {
    if (!user) return;
    try {
      const res = await fetch('/api/social/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, targetUsername: target.username })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('move');
        showLocalToast(`Batal mengikuti @${target.username}`, "info");
        setViewingProfile({ ...target, isFollowing: false, isRequested: false });
        handleSearch(searchQuery);
      }
    } catch (e) {
      showLocalToast("Gagal memproses", "error");
    }
  };

  // Respond to follow request
  const handleFollowResponse = async (reqUsername: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/social/follow/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, requesterUsername: reqUsername, action })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(action === 'accept' ? `Menerima @${reqUsername} sebagai pengikut!` : `Menolak permintaan mengikuti dari @${reqUsername}`);
        fetchExtendedProfile();
      }
    } catch (e) {}
  };

  // Visitor log operations
  const fetchVisitorLogs = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/social/visitors?username=${encodeURIComponent(currentUsername)}`);
      const data = await res.json();
      if (data.success) {
        setVisitorLogs(data.visitorLog || []);
      }
    } catch (e) {}
  };

  const getFilteredVisitors = () => {
    const now = Date.now();
    let limitMs = Infinity;
    if (visitorFilter === '24h') limitMs = 24 * 60 * 60 * 1000;
    else if (visitorFilter === '3d') limitMs = 3 * 24 * 60 * 60 * 1000;
    else if (visitorFilter === '7d') limitMs = 7 * 24 * 60 * 60 * 1000;

    if (limitMs === Infinity) return visitorLogs;

    return visitorLogs.filter(v => (now - v.visitedAt) <= limitMs);
  };

  // DM / Chat Operations
  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/social/dm/conversations?username=${encodeURIComponent(currentUsername)}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (e) {}
  };

  const openDirectChat = async (partner: any) => {
    if (!user) {
      showLocalToast("Silakan masuk terlebih dahulu untuk mengirim DM!", "error");
      return;
    }
    setActiveChatPartner(partner.username);
    setActiveChatAvatar(partner.profileAvatar);
    setActiveChatElo(partner.elo);
    setActiveTab('chat');
    triggerAudio('move');

    try {
      const res = await fetch(`/api/social/dm/history?username=${encodeURIComponent(currentUsername)}&partnerUsername=${encodeURIComponent(partner.username)}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        setChatApproved(data.isApproved);
        setChatSentCount(data.sentCount || 0);
        setIsChatRestricted(data.isRestrictedPrivate);
      }
    } catch (e) {}
  };

  const loadChatMessages = async (partnerUsername: string) => {
    try {
      const res = await fetch(`/api/social/dm/history?username=${encodeURIComponent(currentUsername)}&partnerUsername=${encodeURIComponent(partnerUsername)}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        setChatApproved(data.isApproved);
        setChatSentCount(data.sentCount || 0);
        setIsChatRestricted(data.isRestrictedPrivate);
      }
    } catch (e) {}
  };

  const sendDirectMessage = async () => {
    if (!newMessage.trim() || !activeChatPartner) return;
    try {
      const res = await fetch('/api/social/dm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUsername,
          recipientUsername: activeChatPartner,
          text: newMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        triggerAudio('move');
        setChatMessages(data.messages || []);
        setChatApproved(data.isApproved);
        fetchConversations();
        loadChatMessages(activeChatPartner);
      } else if (res.status === 403) {
        showLocalToast(data.error || "Batas pesan tercapai!", "error");
      }
    } catch (e: any) {
      showLocalToast(e.message || "Gagal mengirim pesan", "error");
    }
  };

  const approveChatSession = async (partnerName: string) => {
    try {
      const res = await fetch('/api/social/dm/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername, partnerUsername: partnerName })
      });
      const data = await res.json();
      if (data.success) {
        triggerAudio('win');
        showLocalToast(`Pesan langsung dari @${partnerName} telah disetujui!`, "success");
        loadChatMessages(partnerName);
      }
    } catch (e) {}
  };

  // Format timestamp helper
  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleString('id-ID', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-[#262421] border border-[#3c3934] rounded-3xl p-5 shadow-2xl relative text-left">
      
      {/* HEADER SECTION WITH PRIVACY TOGGLE & VISITOR LOG EYE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#3c3934] mb-5">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Users className="w-5 h-5 text-[#81b64c]" /> Chess Social Hub
          </h2>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
            Follow Kawan, Log Kunjungan & Berkirim Pesan Langsung (DM) Privat!
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Visitor Log Button (Mata Icon) */}
          <button
            onClick={() => {
              fetchVisitorLogs();
              setShowVisitorModal(true);
              triggerAudio('move');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#312e2b] hover:bg-[#3c3934] border border-[#3c3934] text-slate-200 text-xs font-black uppercase rounded-lg tracking-wider transition-all"
            title="Lihat Log Pengunjung Akun Anda"
          >
            <Eye className="w-4 h-4 text-[#81b64c]" /> 
            <span className="text-[10px] sm:inline">Visitor Log</span>
          </button>

          {/* Privacy Toggle Switch */}
          <button
            onClick={togglePrivacy}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              isPrivateAccount 
                ? 'bg-rose-950/45 border-rose-800 text-rose-400' 
                : 'bg-stone-900 border-stone-800 text-slate-400 hover:text-white'
            }`}
          >
            {isPrivateAccount ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Akun: {isPrivateAccount ? 'Privat' : 'Publik'}</span>
          </button>
        </div>
      </div>

      {/* PENDING ACTIONS PANEL (Incoming Follow Requests) */}
      {followRequests && followRequests.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/60 rounded-2xl p-4 mb-5 animate-pulse-slow">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-4 h-4" /> Permintaan Mengikuti Pendamping ({followRequests.length})
          </h4>
          <div className="space-y-2.5">
            {followRequests.map((reqUser: string) => (
              <div key={reqUser} className="flex items-center justify-between gap-3 bg-[#1e1c19] p-2.5 rounded-xl border border-stone-800">
                <span className="text-xs font-bold text-white">@{reqUser} ingin memfollow Anda</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleFollowResponse(reqUser, 'accept')}
                    className="p-1 px-2.5 bg-green-700 hover:bg-green-600 font-extrabold text-[9px] text-white rounded-md uppercase"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleFollowResponse(reqUser, 'decline')}
                    className="p-1 px-2.5 bg-stone-900 hover:bg-stone-800 font-extrabold text-[9px] text-slate-400 rounded-md uppercase"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS FOR HUB */}
      <div className="flex bg-[#1e1c1a] p-1.5 rounded-xl border border-[#3c3934] mb-5 gap-1.5">
        {[
          { id: 'search', label: 'Cari Akun', shortLabel: 'Cari Akun', icon: Search },
          { id: 'chat', label: 'Pesan Langsung (DM)', shortLabel: 'Pesan DM', icon: MessageCircle }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => {
              setActiveTab(tb.id as any);
              triggerAudio('move');
              if (tb.id === 'chat') {
                fetchConversations();
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-[9px] min-[360px]:text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tb.id 
                ? 'bg-[#81b64c] text-white shadow-xl' 
                : 'text-slate-400 hover:text-white hover:bg-stone-900/40'
            }`}
          >
            <tb.icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[380px]:inline">{tb.label}</span>
            <span className="inline min-[380px]:hidden">{tb.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* RENDER TAB CONTENTS */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          {/* SEARCH FIELD */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Username Akun Utama..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#1e1c1a]/95 border border-[#3c3934] pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] placeholder:text-slate-500 font-sans"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          </div>

          {/* SEARCH RESULTS LIST */}
          {searchQuery && (
            <div className="bg-[#1e1c1a]/60 rounded-2xl border border-[#3c3934] divide-y divide-[#3c3934] max-h-56 overflow-y-auto">
              {isSearching ? (
                <div className="p-5 text-center text-xs text-slate-400 font-semibold animate-pulse">
                  Mencari kawan catur...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 font-semibold">
                  Tidak ditemukan akun dengan nama "{searchQuery}"
                </div>
              ) : (
                searchResults.map(resUser => (
                  <div 
                    key={resUser.username}
                    onClick={() => viewProfileWall(resUser)}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-[#312e2b]/55 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <AvatarWithFrame src={resUser.profileAvatar} frameId={resUser.selectedFrame || 'none'} size="sm" />
                      <div>
                        <div className="text-white text-xs font-extrabold flex items-center gap-1">
                          @{resUser.username}
                          {resUser.isPrivate && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <div className="text-[10px] text-[#81b64c] font-black">{resUser.elo} ELO</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE WALL PANEL (Shown when user profile clicked) */}
          {viewingProfile ? (
            <div className="bg-[#1e1c1a] border-2 border-[#3c3934] rounded-2xl p-4 sm:p-5 relative animate-fade-in duration-300 shadow-xl mt-4">
              <button 
                onClick={() => setViewingProfile(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <AvatarWithFrame src={viewingProfile.profileAvatar} frameId={viewingProfile.selectedFrame || 'none'} size="lg" />
                <div className="flex-1 space-y-1 min-w-0">
                  <h3 className="text-white font-black text-base flex items-center gap-1 justify-center sm:justify-start">
                    @{viewingProfile.username}
                    {viewingProfile.isPrivate && (
                      <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] font-black rounded uppercase">PRIVAT</span>
                    )}
                  </h3>
                  <div className="text-xs text-[#81b64c] font-extrabold uppercase">Rating: {viewingProfile.elo} ELO</div>
                  <p className="text-slate-300 text-xs italic truncate">"{viewingProfile.profileBio || 'Status catur tidak ditentukan.'}"</p>
                </div>
              </div>

              {/* ACTION BUTTONS FOR THE PROFILE WALL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
                {/* Follow Button */}
                {viewingProfile.isFollowing ? (
                  <button
                    onClick={() => handleUnfollow(viewingProfile)}
                    className="w-full flex items-center justify-center gap-1 py-2.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-slate-300 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Unfollow</span>
                  </button>
                ) : viewingProfile.isRequested ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-1 py-2.5 bg-[#312e2b] border border-[#3c3934] text-amber-500 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all opacity-80 cursor-not-allowed"
                  >
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Menunggu Persetujuan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(viewingProfile)}
                    className="w-full flex items-center justify-center gap-1 py-2.5 bg-[#81b64c] hover:bg-[#81b64c]/90 text-white text-[10px] font-black uppercase rounded-xl tracking-wider shadow-md transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </button>
                )}

                {/* Direct Message (DM) Button */}
                <button
                  onClick={() => openDirectChat(viewingProfile)}
                  className="w-full flex items-center justify-center gap-1 py-2.5 bg-sky-950/40 border border-sky-800 hover:bg-sky-900 text-sky-400 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Pesan Langsung (DM)</span>
                </button>
              </div>

              {/* Friends list shortcut button */}
              <button
                onClick={() => {
                  showLocalToast(`Mengirim permintaan pertemanan ke @${viewingProfile.username}!`, "success");
                  triggerAudio('win');
                }}
                className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2.5 bg-purple-950/30 border border-purple-900 hover:bg-purple-900/60 text-purple-400 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambahkan Teman Utama</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#1e1c1a]/40 p-6 rounded-2xl text-center border border-[#3c3934] mt-4">
              <Search className="w-7 h-7 text-slate-600 mx-auto mb-2" />
              <div className="text-white text-xs font-extrabold uppercase">Cari & Sambungkan</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                Ketikkan kata sandi / username kawan di atas untuk membuka dinding profil mereka!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* LEFT PANEL: ACTIVE CONVERSATIONS LIST */}
          <div className="md:col-span-4 bg-[#1e1c1a] border border-[#3c3934] rounded-2xl p-3 max-h-80 overflow-y-auto">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-[#3c3934] pb-2 mb-2">
              Daftar Obrolan DM
            </h4>
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-[10px] font-extrabold text-slate-500 uppercase">
                Tidak ada obrolan aktif.
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map(conv => (
                  <div
                    key={conv.partnerUsername}
                    onClick={() => openDirectChat({ username: conv.partnerUsername, profileAvatar: conv.partnerAvatar, elo: conv.partnerElo })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      activeChatPartner === conv.partnerUsername
                        ? 'bg-sky-950/20 border-sky-800'
                        : 'bg-transparent border-transparent hover:bg-stone-800/40'
                    }`}
                  >
                    <AvatarWithFrame src={conv.partnerAvatar} size="xs" />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-black text-white truncate">@{conv.partnerUsername}</div>
                      <div className="text-[9px] text-[#81b64c] font-bold leading-none">{conv.partnerElo} ELO</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: CHESS DIRECT MESSENGER MESSAGE BOX */}
          <div className="md:col-span-8 bg-[#1e1c1a]/60 border border-[#3c3934] rounded-2xl flex flex-col h-80 overflow-hidden">
            {activeChatPartner ? (
              <>
                {/* Chat Partner Header with approval state */}
                <div className="p-3 bg-[#1e1c1a] border-b border-[#3c3934] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AvatarWithFrame src={activeChatAvatar} size="xs" />
                    <div className="text-left">
                      <div className="text-white text-xs font-black">@{activeChatPartner}</div>
                      <div className="text-[9px] text-[#81b64c] font-black font-mono leading-none">{activeChatElo} ELO</div>
                    </div>
                  </div>

                  {isChatRestricted && !chatApproved && (
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
                      <Info className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Privat (Max 3 Pesan)</span>
                    </div>
                  )}

                  {isChatRestricted && !chatApproved && (
                    <button
                      onClick={() => approveChatSession(activeChatPartner)}
                      className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white font-black text-[9px] uppercase rounded"
                    >
                      Setujui Chat
                    </button>
                  )}
                </div>

                {/* Msg History Scroll Box */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col text-left">
                  {chatMessages.length === 0 ? (
                    <div className="my-auto text-center text-[10px] text-slate-500 font-extrabold uppercase">
                      Mulai obrolan baru dengan @{activeChatPartner}!
                    </div>
                  ) : (
                    chatMessages.map((msg, mIdx) => {
                      const isMe = msg.sender.toLowerCase() === currentUsername.toLowerCase();
                      return (
                        <div 
                          key={msg.id || mIdx}
                          className={`max-w-[80%] rounded-xl p-2.5 text-xs font-bold leading-relaxed ${
                            isMe 
                              ? 'bg-[#81b64c] text-white self-end rounded-tr-none' 
                              : 'bg-[#312e2b] text-slate-200 self-start rounded-tl-none border border-stone-800'
                          }`}
                        >
                          <p className="font-semibold break-words">{msg.text}</p>
                          <span className="text-[7.5px] mt-1 block opacity-60 text-right leading-none font-mono">
                            {formatTime(msg.sentAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Messenger Input Drawer Bar */}
                <div className="p-2 border-t border-[#3c3934] bg-[#1e1c1a]/90 flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      isChatRestricted && !chatApproved && chatSentCount >= 3
                        ? "Batas 3 pesan privat tercapai! Menunggu persetujuan..."
                        : "Ketik pesan langsung privat..."
                    }
                    disabled={isChatRestricted && !chatApproved && chatSentCount >= 3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendDirectMessage();
                    }}
                    className="flex-1 bg-[#262421] border border-[#3c3934] px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#81b64c] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={sendDirectMessage}
                    disabled={(isChatRestricted && !chatApproved && chatSentCount >= 3) || !newMessage.trim()}
                    className="p-2 px-3 bg-[#81b64c] hover:bg-[#81b64c]/90 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="my-auto text-center p-5 space-y-2">
                <MessageCircle className="w-8 h-8 text-slate-700 mx-auto" />
                <div className="text-white text-xs font-extrabold uppercase">Kotak Masuk Obrolan DM</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  Pilih kawan catur di panel kiri atau cari partner baru untuk mulai bertukar pesan langsung!
                </p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* VISITOR LOG DETAILS OVERLAY MODAL */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#262421] border-2 border-[#3c3934] rounded-3xl p-5 w-full max-w-md text-left shadow-2xl relative">
            <button 
              onClick={() => setShowVisitorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-white text-base flex items-center gap-1.5 uppercase tracking-tight mb-1">
              <Eye className="w-5 h-5 text-[#81b64c]" /> Profile Visitor Log
            </h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-4 border-b border-[#3c3934] pb-2">
              Akun-akun yang telah mengunjungi/melihat dinding Anda
            </p>

            {/* Interval Filter Controls */}
            <div className="flex bg-[#1e1c1a]/90 p-1 rounded-xl border border-[#3c3934] gap-1 mb-4">
              {[
                { id: '24h', label: '24 Jam' },
                { id: '3d', label: '3 Hari' },
                { id: '7d', label: '7 Hari' },
                { id: 'all', label: 'Semua' }
              ].map(filt => (
                <button
                  key={filt.id}
                  onClick={() => {
                    setVisitorFilter(filt.id as any);
                    triggerAudio('move');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    visitorFilter === filt.id
                      ? 'bg-[#81b64c] text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filt.label}
                </button>
              ))}
            </div>

            {/* List Visitors */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {getFilteredVisitors().length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-extrabold uppercase">
                  Tidak ada kunjungan tercatat dalam kurun ini.
                </div>
              ) : (
                getFilteredVisitors().map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2.5 bg-[#1e1c1a] rounded-xl border border-stone-800">
                    <div className="flex items-center gap-2">
                      <AvatarWithFrame src={v.profileAvatar} frameId={v.selectedFrame || 'none'} size="xs" />
                      <div className="text-left">
                        <span className="text-white text-xs font-bold leading-none block">@{v.username}</span>
                        <span className="text-[8.5px] text-[#81b64c] font-black">{v.elo} ELO</span>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase shrink-0">
                      {formatTime(v.visitedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
