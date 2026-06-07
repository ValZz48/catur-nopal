import React, { useState } from 'react';
import { Shield, Coins, Crown, Edit, Award } from 'lucide-react';

interface SukuDashboardProps {
  guildProfile: any;
  guildLevel: number;
  guildMembers: any[];
  guildTreasury: number;
  guildLogs: string[];
  username: string;
  coins: number;
  isEditingGuild: boolean;
  setIsEditingGuild: (v: boolean) => void;
  setGuildProfile: (v: any) => void;
  setGuildLogs: React.Dispatch<React.SetStateAction<string[]>>;
  handleGuildDonate: (amount: number) => void;
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
  isEditingGuild,
  setIsEditingGuild,
  setGuildProfile,
  setGuildLogs,
  handleGuildDonate,
  triggerAudio,
  triggerReward
}) => {
  const [editName, setEditName] = useState(guildProfile.name);
  const [editDesc, setEditDesc] = useState(guildProfile.description);
  const [editTag, setEditTag] = useState(guildProfile.tag);
  const [editLogo, setEditLogo] = useState(guildProfile.logo || 'perisai');
  const [editMinRating, setEditMinRating] = useState(guildProfile.minRating);
  const [editJoinSystem, setEditJoinSystem] = useState(guildProfile.joinSystem);
  const [showLogs, setShowLogs] = useState(false);

  const renderGuildLogo = (logo: string) => {
    if (logo === 'pedang') return <span className="text-white text-2xl">⚔</span>;
    if (logo === 'mahkota') return <Crown className="w-8 h-8 text-yellow-500" />;
    if (logo === 'medali') return <Award className="w-8 h-8 text-sky-400" />;
    return <Shield className="w-8 h-8 text-emerald-500" />;
  };

  const sukuIdHash = Math.abs(guildProfile.name.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 100260));

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
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                className="w-full bg-[#1c1a19] border border-stone-800 p-2.5 rounded-xl text-xs text-white focus:outline-none font-bold"
              >
                <option value="perisai">Lambang Perisai</option>
                <option value="pedang">Lambang Duel Pedang</option>
                <option value="mahkota">Lambang Mahkota</option>
                <option value="medali">Lambang Medali</option>
              </select>
            </div>
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
                setGuildProfile({
                  name: editName,
                  description: editDesc,
                  tag: editTag,
                  logo: editLogo,
                  frame: guildProfile.frame,
                  minRating: editMinRating,
                  joinSystem: editJoinSystem
                });
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
              <div className="w-16 h-16 bg-[#1a1817] border-2 border-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
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
                <span className="text-white">{guildMembers.length} / 30 Anggota</span>
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
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800">
            <span className="text-[9px] font-black text-[#81b64c] uppercase block tracking-wider">Aktivitas Keuntungan & Bonus (ボーナス)</span>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-stone-850 pb-1.5">
                <span>Bonus XP Bertanding</span>
                <span className="text-green-500 font-extrabold font-mono">+{guildLevel * 5}% XP</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>Hadiah Koin Bonus Mingguan</span>
                <span className="text-yellow-500 font-extrabold font-mono">+{guildLevel * 100} Coins</span>
              </div>
            </div>
          </div>

          {/* Treasury / Brankas */}
          <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3">
            <div>
              <span className="text-[9.5px] font-black text-yellow-500 uppercase block tracking-wider">Suku Treasury / Brankas Klan</span>
              <h4 className="text-white font-mono font-black text-2xl mt-1">
                {guildTreasury} <span className="text-xs text-stone-500">/ {guildLevel * 1200} Coins</span>
              </h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">
                Donasi koin bersama anggota satu klub suku untuk menaikkan level suku klan secara otomatis. Level yang lebih tinggi membuka bonus XP dan keuntungan harian.
              </p>
              
              <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden mt-3 border border-stone-800">
                <div 
                  style={{ width: `${Math.min(100, (guildTreasury / (guildLevel * 1200)) * 100)}%` }} 
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all" 
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => handleGuildDonate(100)}
                className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
              >
                Sumbang +100
              </button>
              <button 
                onClick={() => handleGuildDonate(500)}
                className="flex-1 py-1.5 bg-stone-900 hover:bg-[#81b64c] hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border border-stone-800"
              >
                Sumbang +500
              </button>
            </div>
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
