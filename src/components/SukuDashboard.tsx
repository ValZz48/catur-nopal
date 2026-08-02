import React, { useState } from 'react';
import { Shield, Coins, Crown, Edit, Award, Swords, Trophy } from 'lucide-react';

interface SukuDashboardProps {
  guildProfile: any;
  guildLevel: number;
  guildMembers: any[];
  guildTreasury: number;
  guildLogs: string[];
  username: string;
  coins: number;
  diamonds?: number;
  setCoins?: React.Dispatch<React.SetStateAction<number>>;
  setDiamonds?: React.Dispatch<React.SetStateAction<number>>;
  setGuildTreasury?: React.Dispatch<React.SetStateAction<number>>;
  isEditingGuild: boolean;
  setIsEditingGuild: (v: boolean) => void;
  setGuildProfile: (v: any) => void;
  setGuildLogs: React.Dispatch<React.SetStateAction<string[]>>;
  handleGuildDonate: (amount: number) => void;
  handleGuildWithdraw?: (amount: number) => void;
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, msg: string, type?: any) => void;
}

export const SukuDashboard: React.FC<SukuDashboardProps> = ({
  guildProfile,
  guildLevel,
  guildMembers,
  guildTreasury,
  guildLogs,
  username,
  coins,
  diamonds = 0,
  setCoins,
  setDiamonds,
  setGuildTreasury,
  isEditingGuild,
  setIsEditingGuild,
  setGuildProfile,
  setGuildLogs,
  handleGuildDonate,
  handleGuildWithdraw,
  triggerAudio,
  triggerReward
}) => {
  const [editName, setEditName] = useState(guildProfile?.name || 'Klub Pal Mate Mandiri');
  const [editDesc, setEditDesc] = useState(guildProfile?.description || '');
  const [editTag, setEditTag] = useState(guildProfile?.tag || 'Kompetitif');
  const [editLogo, setEditLogo] = useState(guildProfile?.logo || 'perisai');
  const [editMinRating, setEditMinRating] = useState(guildProfile?.minRating || 600);
  const [editJoinSystem, setEditJoinSystem] = useState(guildProfile?.joinSystem || 'Bebas');
  const [showLogs, setShowLogs] = useState(false);
  const [treasuryTab, setTreasuryTab] = useState<'donate' | 'withdraw'>('donate');
  const [customAmount, setCustomAmount] = useState('');

  const [privilegeClaimedToday, setPrivilegeClaimedToday] = useState<boolean>(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastClaim = localStorage.getItem(`clan_privilege_last_claim:${username}`);
    return lastClaim === todayStr;
  });

  const handleClaimDailyPrivilege = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (privilegeClaimedToday) {
      triggerAudio('error');
      triggerReward(0, 'Anda sudah mengklaim tunjangan harian klan hari ini! Silakan kembali esok hari.', 'info');
      return;
    }

    const lvl = Math.max(1, guildLevel || 1);
    const rewardCoins = lvl === 1 ? 100 : (lvl === 2 ? 250 : (lvl === 3 ? 500 : (lvl === 4 ? 1000 : 2500)));
    const rewardGems = lvl >= 5 ? 25 : 0;

    if (setCoins) {
      setCoins(c => {
        const next = c + rewardCoins;
        localStorage.setItem('coins', String(next));
        return next;
      });
    }
    if (rewardGems > 0 && setDiamonds) {
      setDiamonds(d => {
        const next = d + rewardGems;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
    }

    if (lvl >= 4 && setGuildTreasury) {
      setGuildTreasury(t => {
        const next = t + 50;
        localStorage.setItem('guild_treasury_gold', String(next));
        return next;
      });
    }

    localStorage.setItem(`clan_privilege_last_claim:${username}`, todayStr);
    setPrivilegeClaimedToday(true);

    const logMsg = `Anggota ${username} mengklaim tunjangan harian klan Level ${lvl} (+${rewardCoins} Koin${rewardGems > 0 ? `, +${rewardGems} Gem` : ''}).`;
    setGuildLogs(prev => [logMsg, ...(prev || [])]);
    localStorage.setItem('guild_action_history', JSON.stringify([logMsg, ...(guildLogs || [])]));

    triggerAudio('win');
    triggerReward(
      25,
      `TUNJANGAN HARIAN TERKLAIM! Selamat, Anda menerima +${rewardCoins} Koin${rewardGems > 0 ? ` & +${rewardGems} Gem` : ''} dari Hak Istimewa Suku Level ${lvl}!`,
      'level_up'
    );
  };

  const renderGuildLogo = (logo: string) => {
    if (!logo) return <Shield className="w-11 h-11 text-emerald-500 shrink-0" />;
    if (logo.startsWith('data:') || logo.startsWith('http') || logo.startsWith('/')) {
      return <img src={logo} alt="Suku Logo" className="absolute inset-0 w-full h-full object-cover rounded-[inherit]" referrerPolicy="no-referrer" />;
    }
    const norm = String(logo).toLowerCase();
    if (norm === 'pedang') return <Swords className="w-11 h-11 text-amber-500 shrink-0" />;
    if (norm === 'mahkota') return <Crown className="w-11 h-11 text-yellow-500 shrink-0" />;
    if (norm === 'medali') return <Award className="w-11 h-11 text-sky-400 shrink-0" />;
    if (norm === 'piala') return <Trophy className="w-11 h-11 text-yellow-500 shrink-0" />;
    return <Shield className="w-11 h-11 text-[#81b64c] shrink-0" />;
  };

  const sukuIdHash = Math.abs((guildProfile?.name || 'Klub Pal Mate Mandiri').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 100260));

  return (
    <div className="space-y-6 font-sans">
      {isEditingGuild ? (
        <div className="bg-[#262421] p-5 rounded-2xl border border-stone-850 space-y-4">
          <h4 className="text-xs font-black uppercase text-[#81b64c] tracking-wider">Ubah Data & Profil Suku Catur</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Nama Suku</label>
              <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white uppercase tracking-wider font-extrabold focus:outline-none focus:border-[#81b64c]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Lambang Suku</label>
              <select 
                value={editLogo.startsWith('data:') || editLogo.startsWith('http') ? 'custom' : editLogo}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setEditLogo('custom');
                  } else {
                    setEditLogo(e.target.value);
                  }
                }}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white focus:outline-none font-bold"
              >
                <option value="perisai">Lambang Perisai</option>
                <option value="pedang">Lambang Duel Pedang</option>
                <option value="mahkota">Lambang Mahkota</option>
                <option value="medali">Lambang Medali</option>
                <option value="custom"> Pilih dari Galeri User...</option>
              </select>
            </div>
            { (editLogo === 'custom' || editLogo.startsWith('data:') || editLogo.startsWith('http')) && (
              <div className="sm:col-span-2 bg-[#1c1a19]/60 border border-dashed border-stone-700 rounded-xl p-3 text-center space-y-2">
                <span className="text-[9.5px] uppercase font-black text-[#81b64c] block">PILIH FILE DARI GALERI DEVICE</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setEditLogo(reader.result);
                          triggerAudio('win');
                          triggerReward(0, 'Logo Suku dimuat dari Galeri kustom Anda!', 'success_no_xp');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-stone-800 file:text-[#81b64c] hover:file:bg-stone-700 file:cursor-pointer"
                />
                { editLogo.startsWith('data:') && (
                  <div className="flex flex-col items-center justify-center gap-2 mt-2 bg-black/20 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-slate-450 font-bold uppercase block">Preview Tampilan Frame Suku:</span>
                    <div className="w-16 h-16 bg-[#1a1817] border-2 border-yellow-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-md relative">
                      <img src={editLogo} alt="Preview Logo" className="absolute inset-0 w-full h-full object-cover rounded-[inherit]" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Kategori Tag</label>
              <select 
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none"
              >
                <option value="Agresif">Agresif & Ofensif</option>
                <option value="Defensif">Defensif & Kokoh</option>
                <option value="Santai">Mabar Santai & Kopi</option>
                <option value="Kompetitif">Kompetitif ELO</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Minimal ELO</label>
              <input 
                type="number" 
                value={editMinRating}
                onChange={(e) => setEditMinRating(Number(e.target.value))}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Slogan & Deskripsi Visi Suku</label>
              <input 
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white focus:outline-none"
                placeholder="Deskripsi visi klan..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Sistem Persetujuan Anggota</label>
              <select 
                value={editJoinSystem}
                onChange={(e) => setEditJoinSystem(e.target.value as any)}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-slate-300 font-extrabold focus:outline-none"
              >
                <option value="Bebas">Bebas Bergabung</option>
                <option value="Persetujuan">Butuh Persetujuan</option>
                <option value="Undangan">Hanya Undangan</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button 
              onClick={() => setIsEditingGuild(false)}
              className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-slate-400 hover:text-white text-xs font-black uppercase rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                const newProf = {
                  name: editName,
                  description: editDesc,
                  tag: editTag,
                  logo: editLogo,
                  frame: guildProfile.frame || 'gold',
                  minRating: editMinRating,
                  joinSystem: editJoinSystem
                };
                setGuildProfile(newProf);
                localStorage.setItem('guild_profile_data', JSON.stringify(newProf));
                window.dispatchEvent(new Event('guild_state_updated'));

                // Sync to backend
                fetch('/api/guilds/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    guild: {
                      id: editName,
                      name: editName,
                      motto: editDesc,
                      description: editDesc,
                      tag: editTag,
                      logo: editLogo,
                      frame: guildProfile.frame || 'gold',
                      minRating: editMinRating,
                      joinSystem: editJoinSystem,
                      leader: username,
                      ownerUsername: username,
                      level: guildLevel || 1,
                      treasury: guildTreasury || 250,
                      members: guildMembers || []
                    }
                  })
                }).catch(() => {});

                setIsEditingGuild(false);
                setGuildLogs(prev => [`Profil klan dimodifikasi oleh Admin pada ${new Date().toLocaleTimeString()}.`, ...prev]);
                triggerAudio('win');
                triggerReward(0, 'Spesial Profil klan catur berhasil disimpan!', 'success_no_xp');
              }}
              className="px-5 py-2 bg-[#81b64c] hover:bg-green-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow"
            >
              Simpan Profil Baru
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Main Suku Info Card */}
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1a1817] border-2 border-yellow-500 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
                {renderGuildLogo(guildProfile.logo)}
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                  {guildProfile.name}
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-500 text-slate-900 rounded-md">
                    LVL {guildLevel}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 italic mt-0.5">"{guildProfile.description}"</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-black/15 p-3 rounded-xl border border-stone-850 text-xs font-medium">
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">ID Suku</span>
                <span className="text-white font-mono">#{sukuIdHash}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">Ketua Suku</span>
                <span className="text-white">{guildMembers.find(m => m.role === 'Founder')?.name || username}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">Aktivitas Anggota</span>
                <span className="text-white">{Math.max(1, (guildMembers || []).length)} / {Math.min(50, 30 + (Math.max(1, guildLevel) - 1) * 5)} Anggota</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">Syarat Join</span>
                <span className="text-white font-mono">{guildProfile.minRating}+ ELO</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">Sistem Join</span>
                <span className="text-white">{guildProfile.joinSystem}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-black">Label Klan</span>
                <span className="text-indigo-400 font-extrabold">{guildProfile.tag}</span>
              </div>
            </div>
          </div>

          {/* Bonus Benefits Suku */}
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
              <div>
                <span className="text-[9px] font-black text-[#81b64c] uppercase block tracking-wider">Keuntungan & Hak Istimewa Suku (Clan Privilege)</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">Tingkatkan level suku klan Anda melalui donasi koin untuk membuka hak istimewa eksklusif:</p>
              </div>

              {/* Klaim Tunjangan Harian Klan Action Button */}
              <button
                onClick={handleClaimDailyPrivilege}
                disabled={privilegeClaimedToday}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  privilegeClaimedToday
                    ? 'bg-stone-800/80 text-stone-500 border border-stone-800 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#81b64c] to-emerald-600 text-white hover:brightness-110 shadow-lg shadow-emerald-950/30 border border-emerald-400/30 animate-pulse'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  {privilegeClaimedToday
                    ? ' Tunjangan Hari Ini Diklaim'
                    : `Klaim Tunjangan Lvl ${guildLevel} (${guildLevel === 1 ? '+100' : guildLevel === 2 ? '+250' : guildLevel === 3 ? '+500' : guildLevel === 4 ? '+1000' : '+2500'} Koin)`}
                </span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { lvl: 1, name: 'Suku Cadet', xp: '+5% XP Tanding', coins: '+100 Koin Harian', perk: 'Akses Obrolan Klan, Misi Bantuan Fragment & Donasi Treasury' },
                { lvl: 2, name: 'Suku Fighter', xp: '+10% XP Tanding', coins: '+250 Koin Harian', perk: 'Kapasitas Klan +5 Anggota & Bonus Poin Perang Suku +10%' },
                { lvl: 3, name: 'Suku Tactician', xp: '+15% XP Tanding', coins: '+500 Koin Harian', perk: 'Kotak Fragment Klan Diskon -20% & Extra Bintang Suku' },
                { lvl: 4, name: 'Suku Vanguard', xp: '+20% XP Tanding', coins: '+1,000 Koin Harian', perk: 'Tabungan Diamond Klan Auto-Restock & Bonus Koin Gacha +15%' },
                { lvl: 5, name: 'Suku Legendary', xp: '+25% XP Tanding', coins: '+2,500 Koin Harian & 25 Gem', perk: 'Mencairkan Koin Brankas Tanpa Biaya Admin & Max Kapasitas Klan' }
              ].map((p) => {
                const isUnlocked = guildLevel >= p.lvl;
                return (
                  <div 
                    key={p.lvl} 
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                      isUnlocked 
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200 ring-1 ring-emerald-500/20' 
                        : 'bg-stone-900/40 border-stone-850 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-[#81b64c] text-white shadow-sm' : 'bg-stone-800 text-stone-500'
                      }`}>
                        L{p.lvl}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className={`text-xs font-black ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{p.name}</h5>
                          {isUnlocked && (
                            <span className="text-[8.5px] font-black uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                               Hak Istimewa Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[9.5px] leading-relaxed font-semibold text-slate-400 break-words">{p.perk}</p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-850/60 pl-9 sm:pl-0">
                      <span className={`text-[10px] font-mono font-black block ${isUnlocked ? 'text-[#81b64c]' : 'text-slate-500'}`}>{p.xp}</span>
                      <span className="text-[9px] font-mono font-bold block text-yellow-500">{p.coins}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treasury / Brankas Klan */}
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[9.5px] font-black text-yellow-500 uppercase block tracking-wider">Brankas Klan (Treasury Suku)</span>
                <h4 className="text-white font-mono font-black text-2xl mt-1 flex flex-row items-center gap-2">
                  <Coins className="w-6 h-6 text-yellow-500 shrink-0" />
                  <span>{guildTreasury.toLocaleString()}</span>
                  <span className="text-xs text-stone-500 font-sans font-bold">/ {(guildLevel * 1200).toLocaleString()} Koin</span>
                </h4>
              </div>
              <div className="bg-[#1c1a19] px-3.5 py-2 rounded-xl border border-stone-800 self-start sm:self-auto">
                <span className="text-[9px] uppercase font-bold text-stone-400 block mb-0.5">Koin Anda</span>
                <span className="text-xs font-mono font-black text-yellow-400 flex flex-row items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>{coins.toLocaleString()}</span>
                </span>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-normal">
              Kelola dana klan secara transparan: Donasikan koin untuk menaikkan Level Suku klan, atau cairkan koin dari brankas ke dompet pribadi Anda kapan saja.
            </p>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[9px] font-bold text-stone-400 mb-1 uppercase">
                <span>Progress Level {guildLevel}</span>
                <span>{Math.min(100, Math.round((guildTreasury / (guildLevel * 1200)) * 100))}% (Batas: {(guildLevel * 1200).toLocaleString()})</span>
              </div>
              <div className="w-full bg-[#1c1a19] h-2.5 rounded-full overflow-hidden border border-stone-800 p-0.5">
                <div 
                  style={{ width: `${Math.min(100, (guildTreasury / (guildLevel * 1200)) * 100)}%` }} 
                  className="bg-gradient-to-r from-yellow-500 via-amber-400 to-[#81b64c] h-full rounded-full transition-all duration-300" 
                />
              </div>
            </div>

            {/* Tabs: Donasi vs Cairkan */}
            <div className="flex bg-[#1c1a19] p-1 rounded-xl border border-stone-800 text-[10px] font-black uppercase">
              <button
                onClick={() => setTreasuryTab('donate')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${treasuryTab === 'donate' ? 'bg-[#81b64c] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                + Tabung / Donasi Koin
              </button>
              <button
                onClick={() => setTreasuryTab('withdraw')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${treasuryTab === 'withdraw' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                - Cairkan / Tarik Koin
              </button>
            </div>

            {treasuryTab === 'donate' ? (
              <div className="space-y-3 bg-[#1c1a19]/70 p-3 rounded-xl border border-stone-800">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGuildDonate(100)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    +100 Koin
                  </button>
                  <button 
                    onClick={() => handleGuildDonate(500)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    +500 Koin
                  </button>
                  <button 
                    onClick={() => handleGuildDonate(1000)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    +1000 Koin
                  </button>
                </div>

                {/* Custom input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Jumlah custom koin..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 w-full bg-[#262421] border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#81b64c]"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const val = Number(customAmount);
                        if (val > 0) {
                          handleGuildDonate(val);
                          setCustomAmount('');
                        } else {
                          triggerAudio('error');
                          triggerReward(0, 'Masukkan nominal koin donasi yang valid!', 'info');
                        }
                      }}
                      className="flex-1 sm:flex-initial px-4 py-1.5 bg-[#81b64c] hover:bg-[#6f9e40] text-white rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      Sumbang
                    </button>
                    <button
                      onClick={() => {
                        if (coins > 0) {
                          handleGuildDonate(coins);
                          setCustomAmount('');
                        } else {
                          triggerAudio('error');
                          triggerReward(0, 'Koin Anda kosong!', 'info');
                        }
                      }}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-yellow-400 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer whitespace-nowrap"
                    >
                      All-In
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-[#1c1a19]/70 p-3 rounded-xl border border-stone-800">
                <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between ${
                  guildLevel >= 5
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                    : 'bg-amber-950/20 border-amber-900/30 text-amber-300'
                }`}>
                  <span>
                    {guildLevel >= 5
                      ? ' Hak Istimewa Aktif: Bebas Biaya Admin Penarikan (0%)!'
                      : 'ℹ️ Biaya Admin Penarikan: 10% (Bebas Biaya Admin 0% di Level 5 Suku Legendary)'}
                  </span>
                  <span className="font-mono text-xs font-black shrink-0">
                    {guildLevel >= 5 ? 'FEE 0%' : 'FEE 10%'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGuildWithdraw ? handleGuildWithdraw(100) : handleGuildDonate(-100)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-amber-600 hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    -100 Koin
                  </button>
                  <button 
                    onClick={() => handleGuildWithdraw ? handleGuildWithdraw(500) : handleGuildDonate(-500)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-amber-600 hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    -500 Koin
                  </button>
                  <button 
                    onClick={() => handleGuildWithdraw ? handleGuildWithdraw(1000) : handleGuildDonate(-1000)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-amber-600 hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
                  >
                    -1000 Koin
                  </button>
                </div>

                {/* Custom withdraw input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Jumlah penarikan koin..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 w-full bg-[#262421] border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      const val = Number(customAmount);
                      if (val > 0) {
                        if (handleGuildWithdraw) {
                          handleGuildWithdraw(val);
                        } else {
                          handleGuildDonate(-val);
                        }
                        setCustomAmount('');
                      } else {
                        triggerAudio('error');
                        triggerReward(0, 'Masukkan nominal koin penarikan yang valid!', 'info');
                      }
                    }}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                  >
                    Cairkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Buttons for Logs and Edit */}
          <div className="flex gap-2 justify-between">
            <button 
              onClick={() => setIsEditingGuild(true)}
              className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-[#81b64c] rounded-xl text-[10.5px] font-black uppercase border border-stone-800 cursor-pointer shadow-sm transition"
            >
              Ubah Data Suku
            </button>
            <button 
              onClick={() => { setShowLogs(true); triggerAudio('move'); }}
              className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-slate-300 rounded-xl text-[10.5px] font-black uppercase border border-stone-800 cursor-pointer shadow-sm transition"
            >
              Buku Suku / Log
            </button>
          </div>
        </div>
      )}

      {/* Logs Dialog Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-805 max-w-sm w-full space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-stone-800 pb-2 flex items-center justify-between">
              <span>Buku Suku (Log Kegiatan Klan)</span>
              <button onClick={() => setShowLogs(false)} className="text-stone-500 hover:text-white text-md">×</button>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto mt-2 pr-1 divide-y divide-stone-850">
              {guildLogs.map((log, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-350 py-1.5 leading-relaxed">
                  <span className="text-[#81b64c] mr-1.5">•</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowLogs(false)} 
              className="w-full py-1.5 bg-stone-900 hover:bg-stone-850 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-lg border border-stone-800 cursor-pointer"
            >
              Tutup Buku Suku
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
