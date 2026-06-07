import React from 'react';
import { Crown, Users, Search, Plus, Trash2, Shield, Award, UserCheck } from 'lucide-react';

interface SukuMembersProps {
  guildMembers: any[];
  username: string;
  guildJoinRequests: any[];
  guildBlacklist: string[];
  setGuildMembers: React.Dispatch<React.SetStateAction<any[]>>;
  setGuildJoinRequests: React.Dispatch<React.SetStateAction<any[]>>;
  setGuildLogs: React.Dispatch<React.SetStateAction<string[]>>;
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, msg: string, type?: any) => void;
  realPlayers: any[];
  inviteQuery: string;
  setInviteQuery: (v: string) => void;
  setHasGuild: (v: boolean) => void;
}

export const SukuMembers: React.FC<SukuMembersProps> = ({
  guildMembers,
  username,
  guildJoinRequests,
  guildBlacklist,
  setGuildMembers,
  setGuildJoinRequests,
  setGuildLogs,
  triggerAudio,
  triggerReward,
  realPlayers,
  inviteQuery,
  setInviteQuery,
  setHasGuild
}) => {
  const [customConfirm, setCustomConfirm] = React.useState<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  const getRoleIcon = (role: string) => {
    if (role === 'Founder') return <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
    if (role === 'Co-Leader') return <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    if (role === 'Officer') return <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    return <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'Founder') return 'Ketua Suku';
    if (role === 'Co-Leader') return 'Wakil Ketua';
    if (role === 'Officer') return 'Ops Ops';
    return 'Anggota';
  };

  const handlePromote = (member: any) => {
    let nextRole = 'Member';
    if (member.role === 'Recruit') nextRole = 'Member';
    else if (member.role === 'Member') nextRole = 'Officer';
    else if (member.role === 'Officer') nextRole = 'Co-Leader';
    else return;

    setGuildMembers(prev => prev.map(m => m.name === member.name ? { ...m, role: nextRole } : m));
    setGuildLogs(prev => [`Pangkat ${member.name} dinaikkan menjadi ${nextRole} oleh pimpinan.`, ...prev]);
    triggerAudio('win');
    triggerReward(0, `Jabatan ${member.name} dinaikkan ke ${nextRole}!`, 'success_no_xp');
  };

  const handleDemote = (member: any) => {
    let nextRole = 'Member';
    if (member.role === 'Co-Leader') nextRole = 'Officer';
    else if (member.role === 'Officer') nextRole = 'Member';
    else return;

    setGuildMembers(prev => prev.map(m => m.name === member.name ? { ...m, role: nextRole } : m));
    setGuildLogs(prev => [`Pangkat ${member.name} diturunkan menjadi ${nextRole} oleh pimpinan.`, ...prev]);
    triggerAudio('move');
    triggerReward(0, `Jabatan ${member.name} diturunkan ke ${nextRole}!`, 'info');
  };

  const handleKick = (memberName: string) => {
    setCustomConfirm({
      show: true,
      title: "Keluarkan Anggota",
      message: `Apakah Anda yakin ingin mengeluarkan ${memberName} dari suku klan Anda?`,
      confirmText: "Keluarkan",
      cancelText: "Batal",
      onConfirm: () => {
        setGuildMembers(prev => prev.filter(m => m.name !== memberName));
        setGuildLogs(prev => [`${memberName} telah dikeluarkan oleh pimpinan dari klan suku.`, ...prev]);
        triggerAudio('lose');
        triggerReward(0, `${memberName} resmi dikeluarkan dari klan!`, 'info');
      }
    });
  };

  const handleLeaveSuku = () => {
    setCustomConfirm({
      show: true,
      title: "Keluar Suku",
      message: "Apakah Anda yakin ingin keluar dari Suku Klan Anda? Seluruh kontribusi dan data keanggotaan Anda akan direset secara permanen.",
      confirmText: "Keluar Suku",
      cancelText: "Batal",
      onConfirm: () => {
        setHasGuild(false);
        setGuildMembers([]);
        setGuildJoinRequests([]);
        localStorage.removeItem('guild_has_owner');
        localStorage.removeItem('guild_members');
        localStorage.removeItem('guild_profile_data');
        triggerAudio('lose');
        triggerReward(0, 'Anda resmi keluar dari Suku Klan.', 'info');
      }
    });
  };

  // Check if viewer has authority to manage roles (Founder or Co-Leader)
  const viewerMeta = guildMembers.find(m => m.name === username);
  const isLeader = viewerMeta?.role === 'Founder';
  const isCoLeader = viewerMeta?.role === 'Co-Leader';
  const hasAuthority = isLeader || isCoLeader;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
        <h4 className="text-xs font-black text-white uppercase tracking-wider flex justify-between items-center pb-2 border-b border-stone-850">
          <span>Aktivitas Anggota Suku ({guildMembers.length})</span>
        </h4>

        {/* Member cards list */}
        <div className="space-y-3">
          {guildMembers.map((member) => {
            const isUserSelf = member.name === username;
            const canManage = hasAuthority && !isUserSelf && member.role !== 'Founder';

            return (
              <div 
                key={member.name} 
                className="bg-[#1a1817]/40 ring-1 ring-stone-850 p-4 rounded-xl flex flex-col gap-3 justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Role Avatar Badge */}
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center relative shrink-0">
                      <span className="text-sm font-black text-white uppercase">
                        {member.name.substring(0, 2).toUpperCase()}
                      </span>
                      {/* Character Level Badge inside a small overlay */}
                      <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-slate-900 text-[8px] px-1.5 py-0.5 rounded-full font-black scale-90">
                        Lv.{member.level || 50}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        {member.name} {isUserSelf ? '(Kamu)' : ''}
                        {getRoleIcon(member.role)}
                      </h5>
                      <span className="text-[9.5px] text-[#81b64c] font-black uppercase font-mono tracking-tight block">
                        ELO: {member.rating}
                      </span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 block">
                        Jabatan: {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10.5px] font-mono font-black text-yellow-500 block">
                      {member.contribution !== undefined ? member.contribution : 1250} Poin
                    </span>
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-tight">KONTRIBUSI</span>
                    <span className="mt-1 inline-flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-stone-500'} inline-block shrink-0`} />
                      <span className="text-[9px] text-slate-450 font-extrabold font-mono uppercase">{member.status}</span>
                    </span>
                  </div>
                </div>

                {/* Administration Options and actions buttons */}
                {canManage && (
                  <div className="flex gap-1.5 justify-end pt-2 border-t border-stone-850">
                    <button 
                      onClick={() => handlePromote(member)}
                      disabled={member.role === 'Co-Leader'}
                      className="px-2.5 py-1 bg-green-950/20 hover:bg-green-900 border border-green-900/30 text-green-300 font-black text-[9px] uppercase rounded-md transition disabled:opacity-30"
                    >
                      ▲ Naik
                    </button>
                    {member.role !== 'Member' && (
                      <button 
                        onClick={() => handleDemote(member)}
                        className="px-2.5 py-1 bg-amber-950/20 hover:bg-amber-900 border border-amber-900/30 text-amber-300 font-black text-[9px] uppercase rounded-md transition"
                      >
                        ▼ Turun
                      </button>
                    )}
                    <button 
                      onClick={() => handleKick(member.name)}
                      className="px-2.5 py-1 bg-red-950/20 hover:bg-red-900 border border-red-900/30 text-red-300 font-black text-[9px] uppercase rounded-md transition"
                    >
                      Keluarkan
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real player lookup search invitation */}
      <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
        <div>
          <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Plus className="w-4 h-4 text-[#81b64c]" /> Cari & Undang Pecatur Server (Real)
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
            Undang pecatur sungguhan dari database server game online untuk memperkuat barisan Suku Anda:
          </p>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Ketik nama pecatur nyata..." 
            value={inviteQuery}
            onChange={(e) => setInviteQuery(e.target.value)}
            className="w-full bg-[#1c1a19] text-xs font-semibold text-white px-3.5 py-2 rounded-xl border border-stone-800 focus:outline-none focus:border-[#81b64c]/40 placeholder-stone-600 transition"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-3 pointer-events-none" />
        </div>

        {(() => {
          const availableList = realPlayers.filter(p => {
            const inMembers = guildMembers.some(m => m.name.toLowerCase() === p.name.toLowerCase());
            const matchesSearch = p.name.toLowerCase().includes(inviteQuery.toLowerCase());
            return p.name.toLowerCase() !== username.toLowerCase() && !inMembers && matchesSearch;
          });

          if (availableList.length === 0) {
            return (
              <div className="text-center py-4 bg-[#1a1817]/40 rounded-xl text-stone-500 italic text-xs font-sans">
                Tidak ada pecatur lain yang ditemukan untuk kata kunci ini.
              </div>
            );
          }

          return (
            <div className="max-h-48 overflow-y-auto divide-y divide-stone-850 px-1 bg-black/10 rounded-xl">
              {availableList.map((invitee) => (
                <div key={invitee.name} className="py-2.5 flex justify-between items-center gap-2 first:pt-1.5">
                  <div>
                    <span className="text-xs font-bold text-white block">{invitee.name}</span>
                    <span className="text-[9px] text-yellow-500 font-extrabold font-mono uppercase tracking-tight">{invitee.badge} • {invitee.elo} ELO</span>
                  </div>
                  <button 
                    onClick={() => {
                      setGuildMembers(prev => [...prev, { name: invitee.name, role: 'Member', rating: invitee.elo, status: 'Online', contribution: 50, level: Math.floor(invitee.elo / 30) + 1 }]);
                      setGuildLogs(prev => [`${invitee.name} diundang dan bergabung ke klan oleh Founder.`, ...prev]);
                      triggerAudio('win');
                      triggerReward(30, `Sukses mengundang @${invitee.name}! Dia resmi bergabung ke klub catur Anda.`, 'success');
                    }}
                    className="px-3 py-1.5 bg-[#81b64c]/15 hover:bg-[#81b64c] border border-[#81b64c]/30 text-[#81b64c] hover:text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition"
                  >
                    + Undang
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Exit Button corresponding to '退部' button */}
      <button 
        onClick={handleLeaveSuku}
        className="w-full py-3 bg-red-950/20 hover:bg-red-900 border border-red-900/30 hover:border-red-600 text-red-300 hover:text-white font-black text-xs uppercase rounded-xl transition cursor-pointer text-center"
      >
        Keluar Dari Suku / Leave Suku
      </button>

      {/* Styled custom confirm modal inside iframe */}
      {customConfirm && customConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#262421] border border-stone-800 rounded-2xl p-5 max-w-sm w-full text-center shadow-xl space-y-4">
            <h3 className="text-xs font-black text-red-400 uppercase tracking-wider">{customConfirm.title}</h3>
            <p className="text-xs text-stone-300 font-semibold leading-relaxed leading-[1.3]">{customConfirm.message}</p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition"
              >
                {customConfirm.confirmText || "Ya"}
              </button>
              <button
                onClick={() => setCustomConfirm(null)}
                className="px-4 py-2 bg-[#1c1a19] hover:bg-[#322f2c] text-stone-400 border border-stone-800 font-stone-400 font-bold text-[10px] uppercase rounded-lg cursor-pointer transition"
              >
                {customConfirm.cancelText || "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
