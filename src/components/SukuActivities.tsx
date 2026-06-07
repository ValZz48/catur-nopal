import React, { useState } from 'react';
import { Award, Users, Swords, MessageSquare, Shield, Trophy, Activity, Flame, ChevronLeft } from 'lucide-react';

interface SukuActivitiesProps {
  activityDetail: 'list' | 'fragments' | 'bonus' | 'war' | 'chat';
  setActivityDetail: (v: any) => void;
  guildMembers: any[];
  username: string;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  diamonds: number;
  setDiamonds: React.Dispatch<React.SetStateAction<number>>;
  clanCheckedIn: boolean;
  setClanCheckedIn: (v: boolean) => void;
  claimedWeeklyMilestones: number[];
  setClaimedWeeklyMilestones: React.Dispatch<React.SetStateAction<number[]>>;
  guildLogs: string[];
  setGuildLogs: React.Dispatch<React.SetStateAction<string[]>>;
  guildChatMessages: any[];
  setGuildChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  conqueredBoards: string[];
  setConqueredBoards: React.Dispatch<React.SetStateAction<string[]>>;
  activeWarStage: number | null;
  setActiveWarStage: (v: number | null) => void;
  selectedPuzzlePiece: { r: number; c: number } | null;
  setSelectedPuzzlePiece: (v: any) => void;
  wrongPuzzleAttempt: boolean;
  setWrongPuzzleAttempt: (v: boolean) => void;
  myFragments: any;
  setMyFragments: React.Dispatch<React.SetStateAction<any>>;
  fragmentRequests: any[];
  setFragmentRequests: React.Dispatch<React.SetStateAction<any[]>>;
  fragmentRequestCooldown: number;
  setFragmentRequestCooldown: React.Dispatch<React.SetStateAction<number>>;
  todayFragmentDonationCount: number;
  setTodayFragmentDonationCount: React.Dispatch<React.SetStateAction<number>>;
  requestedFragmentSkin: string;
  setRequestedFragmentSkin: (v: string) => void;
  hasActiveFragmentReq: boolean;
  setHasActiveFragmentReq: (v: boolean) => void;
  setUnlockedSkins: React.Dispatch<React.SetStateAction<string[]>>;
  triggerAudio: (type: string) => void;
  triggerReward: (xpAmount: number, msg: string, type?: any) => void;
}

export const SukuActivities: React.FC<SukuActivitiesProps> = ({
  activityDetail,
  setActivityDetail,
  guildMembers,
  username,
  coins,
  setCoins,
  diamonds,
  setDiamonds,
  clanCheckedIn,
  setClanCheckedIn,
  claimedWeeklyMilestones,
  setClaimedWeeklyMilestones,
  guildLogs,
  setGuildLogs,
  guildChatMessages,
  setGuildChatMessages,
  conqueredBoards,
  setConqueredBoards,
  activeWarStage,
  setActiveWarStage,
  selectedPuzzlePiece,
  setSelectedPuzzlePiece,
  wrongPuzzleAttempt,
  setWrongPuzzleAttempt,
  myFragments,
  setMyFragments,
  fragmentRequests,
  setFragmentRequests,
  fragmentRequestCooldown,
  setFragmentRequestCooldown,
  todayFragmentDonationCount,
  setTodayFragmentDonationCount,
  requestedFragmentSkin,
  setRequestedFragmentSkin,
  hasActiveFragmentReq,
  setHasActiveFragmentReq,
  setUnlockedSkins,
  triggerAudio,
  triggerReward
}) => {
  // Activity A - Fragments: state hooks
  const [activeFragReq, setActiveFragReq] = useState(false);

  // Activiy B - Milestones & Checkins
  const totalClanContribution = guildMembers.reduce((sum, m) => sum + (m.contribution || 0), 0);

  // Activity C - Chess War puzzle solutions
  const puzzlesList = [
    {
      id: 1,
      title: 'Taktik Garpu Ksatria (Board 1)',
      desc: 'Putih melangkah dan melakukan garukan ksatria mematikan untuk memenangkan Ratu hitam!',
      boardState: [
        ['.', '.', 'q', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', 'N', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.']
      ],
      solutionRow: 0,
      solutionCol: 2
    },
    {
      id: 2,
      title: 'Paku Pin Benteng Belakang (Board 2)',
      desc: 'Putih melangkah dan memaku raja hitam dengan benteng vertikal belakang!',
      boardState: [
        ['r', '.', '.', '.', 'k', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['R', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.']
      ],
      solutionRow: 0,
      solutionCol: 4
    },
    {
      id: 3,
      title: 'Serangan Kunci Gajah Ster (Board 3)',
      desc: 'Putih melangkah dan mengskak-ster Ratu hitam secara silang dengan Gajah diagonal!',
      boardState: [
        ['.', '.', '.', '.', '.', '.', '.', 'q'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', 'B', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['K', '.', '.', '.', '.', '.', '.', '.']
      ],
      solutionRow: 0,
      solutionCol: 7
    }
  ];

  const handleClaimMilestone = (tier: number, requirement: number, coinReward: number, diamondReward: number) => {
    if (totalClanContribution < requirement) {
      triggerAudio('error');
      triggerReward(0, `Kontribusi Suku belum mencukupi! Butuh ${requirement} Poin untuk mengklaim chest ini.`, 'info');
      return;
    }
    if (claimedWeeklyMilestones.includes(tier)) {
      triggerAudio('error');
      triggerReward(0, 'Anda sudah mengklaim hadiah dari Milestone Chest ini!', 'info');
      return;
    }

    setCoins(prev => {
      const next = prev + coinReward;
      localStorage.setItem('coins', String(next));
      return next;
    });

    if (diamondReward > 0) {
      setDiamonds(prev => {
        const next = prev + diamondReward;
        localStorage.setItem('diamonds', String(next));
        return next;
      });
    }

    const nextMilestones = [...claimedWeeklyMilestones, tier];
    setClaimedWeeklyMilestones(nextMilestones);
    localStorage.setItem('clan_weekly_milestones', JSON.stringify(nextMilestones));

    setGuildLogs(prev => [`${username} mengklaim Milestone Suku Tier ${tier} (Hadiah: +${coinReward} koin & +${diamondReward} Diamond).`, ...prev]);
    triggerAudio('level_up');
    triggerReward(100, `SELAMAT! Berhasil mengklaim Milestone Suku Tier ${tier}: +${coinReward} Koin dan +${diamondReward} Diamond!`, 'level_up');
  };

  const handleAbsensiCheckIn = () => {
    if (clanCheckedIn) return;

    setCoins(prev => {
      const next = prev + 150;
      localStorage.setItem('coins', String(next));
      return next;
    });

    setClanCheckedIn(true);
    localStorage.setItem('clan_checked_in', 'true');

    // Update active user's contribution points
    const updatedMembers = guildMembers.map(m => {
      if (m.name === username) {
        return { ...m, contribution: (m.contribution || 0) + 120 };
      }
      return m;
    });
    localStorage.setItem('guild_members', JSON.stringify(updatedMembers));

    setGuildLogs(prev => [`${username} melakukan absensi harian klan catur dan memperoleh +120 Poin Kontribusi suku.`, ...prev]);
    triggerAudio('win');
    triggerReward(120, 'Absensi Suku Berhasil! Anda mendapatkan +150 Koin dan +120 Poin Kontribusi Suku!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {activityDetail === 'list' ? (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-stone-900 border border-stone-850 rounded-2xl">
            <span className="text-[10px] text-[#81b64c] font-black uppercase tracking-wider block">サークル活動 / Circle Activities</span>
            <h4 className="text-xs font-black text-white uppercase mt-0.5">Daftar Aktivitas Bersama Suku</h4>
            <p className="text-[10px] text-slate-450 mt-1 leading-normal font-medium">Bekerjasamalah dengan sesama pecatur dalam klan untuk mengumpulkan target bonus, mendonasikan fragments, atau memenangkan perang tanding taktis!</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Card 1: Donasi Fragment */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Fragments</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Sumbangan & Donasi Bidak</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Saling bertukar kepingan fragment skin catur antar sesama klan.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('fragments'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Mulai
              </button>
            </div>

            {/* Card 2: Check-in / Absen & Bonus */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-yellow-500/15 text-yellow-500 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Bonus & Absen</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Papan Absensi & Bonus Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Klaim absensi harian dan chest milestone mingguan suku klan Anda.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('bonus'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Klaim
              </button>
            </div>

            {/* Card 3: Perang Tanding Suku */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Perang PvP</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Perang Tanding Taktis Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5 font-sans">Selesaikan tantangan papan taktis untuk merebut kejayaan wilayah suku.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('war'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Perang
              </button>
            </div>

            {/* Card 4: Obrolan Tim */}
            <div className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-3">
              <div>
                <span className="text-[8px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">Room Obrolan</span>
                <h5 className="text-xs font-black text-white uppercase mt-1">Ruang Forum Chat Suku</h5>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Diskusi taktik, janjian tanding, dan bincang-bincang seru klan catur.</p>
              </div>
              <button 
                onClick={() => { setActivityDetail('chat'); triggerAudio('move'); }}
                className="px-4.5 py-2.5 bg-purple-650 hover:bg-purple-500 text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => { setActivityDetail('list'); triggerAudio('move'); }}
            className="flex items-center gap-1 px-3.5 py-2 bg-stone-900 border border-stone-800 hover:bg-[#81b64c] hover:text-white rounded-xl text-[10px] font-black uppercase text-slate-400 cursor-pointer mb-2 transition-all w-fit"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Aktivitas Suku
          </button>

          {/* VIEW: FRAGMENTS */}
          {activityDetail === 'fragments' && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-900 border border-stone-850 rounded-2xl">
                <span className="text-[9px] text-[#81b64c] font-black uppercase tracking-wider block">Permohonan Kepingan Fragment Catur</span>
                <h4 className="text-xs font-black text-white uppercase mt-0.5">Donasi & Tukar Kepingan Skin</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">Kumpulkan 5 kepingan fragment catur yang disumbangkan oleh teman satu klan untuk merakit skin catur eksklusif Anda secara permanen!</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Request form or details */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-stone-850 pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" /> Permintaan Fragment Anda
                  </h4>

                  {hasActiveFragmentReq ? (
                    <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850 text-center space-y-3">
                      <div>
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Status Aktif</span>
                        <h5 className="text-white font-extrabold text-xs uppercase mt-0.5">Target: Fragment keping {requestedFragmentSkin}</h5>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>Donasi Terkumpul:</span>
                          <span className="text-[#81b64c]">{todayFragmentDonationCount} / 5 Keping</span>
                        </div>
                        <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800">
                          <div 
                            style={{ width: `${(todayFragmentDonationCount / 5) * 100}%` }} 
                            className="bg-indigo-500 h-full transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <button 
                          onClick={() => {
                            if (todayFragmentDonationCount >= 5) {
                              const finalSkinKey = requestedFragmentSkin === 'Golden' ? 'royal' : (requestedFragmentSkin === 'Retro' ? 'retro' : (requestedFragmentSkin === 'Cosmosis' ? 'cosmic' : 'neon'));
                              setUnlockedSkins(prev => prev.includes(finalSkinKey) ? prev : [...prev, finalSkinKey]);
                              setHasActiveFragmentReq(false);
                              setRequestedFragmentSkin('');
                              setTodayFragmentDonationCount(0);
                              setGuildLogs(prev => [`Pimpinan merakit skin kustom resmi dari fragment klan.`, ...prev]);
                              triggerAudio('level_up');
                              triggerReward(150, `LUAR BIASA! Anda berhasil merakit Skin Catur Kustom ${requestedFragmentSkin.toUpperCase()}!`, 'level_up');
                            } else {
                              if (fragmentRequestCooldown > 0) {
                                triggerAudio('error');
                                triggerReward(0, `Mohon tunggu ${fragmentRequestCooldown} detik cooldown.`, 'info');
                                return;
                              }
                              setFragmentRequestCooldown(12);
                              const nextCount = Math.min(5, todayFragmentDonationCount + 1);
                              setTodayFragmentDonationCount(nextCount);
                              setGuildLogs(prev => [`Teman klub mendonasikan fragment catur ke Anda.`, ...prev]);
                              setGuildChatMessages(prev => [
                                ...prev,
                                { sender: 'Naufal_Catur', text: `Ini kepingan fragment @${username}, semoga cepat terkumpul skin idamanmu ya.`, time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' }) }
                              ]);
                              triggerAudio('win');
                              triggerReward(0, 'Sobat klan Naufal_Catur mendonasikan +1 Fragment ke Anda!', 'success_no_xp');
                            }
                          }}
                          className="w-full py-2 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg transition shadow cursor-pointer border-none"
                        >
                          {todayFragmentDonationCount >= 5 ? 'RAKIT SKIN GRATIS SEKARANG!' : fragmentRequestCooldown > 0 ? `TUNTUT ULANG (${fragmentRequestCooldown}s)` : 'MINTA KEPINGAN DONASI'}
                        </button>

                        <button 
                          onClick={() => {
                            setHasActiveFragmentReq(false);
                            setRequestedFragmentSkin('');
                            setTodayFragmentDonationCount(0);
                            triggerAudio('move');
                          }}
                          className="w-full py-1 text-[8.5px] font-black uppercase text-slate-450 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition"
                        >
                          Batalkan Permintaan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-500 block uppercase">PILIH SKIN YANG INGIN DIKUMPULKAN:</span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: 'Neon Grid (Epic)', target: 'Neon' },
                          { key: 'Golden Knight (Legendary)', target: 'Golden' },
                          { key: 'Retro Pixel (Rare Edition)', target: 'Retro' },
                          { key: 'Cosmosis Stars (Mythic)', target: 'Cosmosis' }
                        ].map((sk) => (
                          <button 
                            key={sk.key}
                            onClick={() => {
                              setRequestedFragmentSkin(sk.target);
                              setHasActiveFragmentReq(true);
                              setTodayFragmentDonationCount(0);
                              setGuildLogs(prev => [`Pimpinan meminta donasi pecahan fragment ${sk.target}.`, ...prev]);
                              triggerAudio('move');
                              triggerReward(15, `Meminta bantuan fragment ${sk.target}!`, 'success');
                            }}
                            className="w-full p-2.5 bg-stone-900 hover:bg-[#81b64c]/15 text-slate-300 hover:text-white text-left text-[10.5px] font-bold uppercase rounded-xl transition cursor-pointer border border-stone-850 flex justify-between items-center"
                          >
                            <span>{sk.key}</span>
                            <span className="text-[9px] bg-stone-800 px-2 py-0.5 rounded text-[#81b64c] font-black uppercase">+ Minta</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory & Purchase */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-[#81b64c] uppercase tracking-wider flex items-center justify-between border-b border-stone-850 pb-2">
                    <span>Inventori Suku Fragment Anda</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-mono font-black text-slate-400">
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Gold Knight:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Golden Knight'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Retro Pixel:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Retro 8-bit'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Neon Epic:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Neon Skin'] || 0}</span>
                    </div>
                    <div className="bg-[#1a1817] p-2 rounded-xl flex justify-between border border-stone-850">
                      <span>Cosmosis:</span>
                      <span className="text-yellow-500 font-extrabold">{myFragments['Cosmosis Nebula'] || 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (coins < 250) {
                        triggerAudio('error');
                        triggerReward(0, 'Koin Anda tidak cukup untuk membeli Kotak Fragment! Butuh 250 Koin.', 'info');
                        return;
                      }
                      setCoins(c => c - 250);
                      const frags = ['Golden Knight', 'Retro 8-bit', 'Neon Skin', 'Cosmosis Nebula'];
                      const choice = frags[Math.floor(Math.random() * frags.length)];
                      setMyFragments(prev => {
                        const next = { ...prev, [choice]: (prev[choice] || 0) + 1 };
                        localStorage.setItem('my_fragment_inventory', JSON.stringify(next));
                        return next;
                      });
                      triggerAudio('win');
                      triggerReward(0, `Sukses beli Kotak Fragment Klan! Menemukan +1 Fragment ${choice.toUpperCase()}!`, 'success_no_xp');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase rounded-xl transition text-center cursor-pointer border-none"
                  >
                    Beli Kotak Fragment (+1 Frag) — 250 Coins
                  </button>
                </div>

                {/* Help other members requests list */}
                <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex gap-1.5 border-b border-stone-850 pb-2">
                    <span>Membantu Kebantuan Fragment Teman Suku</span>
                  </h4>

                  <div className="space-y-3">
                    {fragmentRequests
                      .filter(req => guildMembers.some(member => member.name === req.name))
                      .map((item) => {
                        const progressPercent = Math.min(100, (item.currentProgress / item.maxProgress) * 100);
                        return (
                          <div key={item.id} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-white">{item.name}</span>
                              <span className="text-[10px] text-green-500 font-black">{item.currentProgress} / {item.maxProgress}</span>
                            </div>
                            <span className="text-[10.5px] text-indigo-400 font-black uppercase">
                              MEMINTA: FRAGMENT {item.skin.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">
                              Hadiah koin atas bantuan: <span className="text-yellow-500">+{item.coinsVal} Koin</span>
                            </span>

                            <button 
                              onClick={() => {
                                const hasItem = (myFragments[item.skin] || 0) > 0;
                                if (!hasItem) {
                                  triggerAudio('error');
                                  triggerReward(0, `Donasi Gagal! Anda tidak memiliki Kepingan Fragment "${item.skin.toUpperCase()}"`, 'error');
                                  return;
                                }

                                setMyFragments(prev => {
                                  const next = { ...prev, [item.skin]: prev[item.skin] - 1 };
                                  localStorage.setItem('my_fragment_inventory', JSON.stringify(next));
                                  return next;
                                });

                                setCoins(c => {
                                  const next = c + item.coinsVal;
                                  localStorage.setItem('coins', String(next));
                                  return next;
                                });

                                setFragmentRequests(prev => {
                                  const updated = prev.map(r => {
                                    if (r.id === item.id) {
                                      return { ...r, currentProgress: Math.min(r.maxProgress, r.currentProgress + 1) };
                                    }
                                    return r;
                                  });
                                  localStorage.setItem('active_fragment_requests', JSON.stringify(updated));
                                  return updated;
                                });

                                setGuildLogs(prev => [`${username} mendonasikan 1 fragment kepingan ke ${item.name}.`, ...prev]);
                                triggerAudio('win');
                                triggerReward(item.coinsVal, `Donasi sukses! Anda membantu ${item.name} dan memenangkan +${item.coinsVal} Coins!`, 'success');
                              }}
                              className="w-full py-1.5 bg-[#81b64c] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg transition cursor-pointer border-none mt-1"
                            >
                              Donasikan 1 Keping
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BONUS & ABSENSI */}
          {activityDetail === 'bonus' && (
            <div className="space-y-6">
              {/* Absensi Checkin */}
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3 text-center">
                <span className="text-[8px] bg-yellow-500/15 text-yellow-500 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest leading-none block mx-auto w-fit">
                  DAILY CHECK-IN
                </span>
                <h4 className="text-sm font-black text-white uppercase">Papan Absensi Kerja Suku Harian</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                  Lakukan absen harian tim untuk membantu kontribusi klan Anda terkumpul tebal serta menangkan bonus koin instan dan poin ranking!
                </p>

                {clanCheckedIn ? (
                  <div className="py-2.5 bg-emerald-950/20 text-emerald-400 rounded-xl font-black text-xs uppercase border border-emerald-900/30 w-full">
                    Selesai Absen Hari Ini (Klaim Kontribusi Berhasil)
                  </div>
                ) : (
                  <button 
                    onClick={handleAbsensiCheckIn}
                    className="w-full py-2.5 bg-[#81b64c] hover:bg-green-500 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer border-none shadow"
                  >
                    KLIK UNTUK ABSENSI (+150 Koin & +120 Poin Suku)
                  </button>
                )}
              </div>

              {/* Weekly Chest targets milestones */}
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Chest Target Milestones Suku</span>
                    <span className="text-[10.5px] font-mono font-black text-yellow-500 bg-stone-900 border border-stone-850 px-2 py-0.5 rounded">
                      {totalClanContribution} Poin Suku
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Target kontribusi mingguan seluruh anggota suku gabungan. Kunci dan menangkan chest hadiah emas!
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#1c1a19] h-2 rounded-full overflow-hidden border border-stone-800">
                    <div 
                      style={{ width: `${Math.min(100, (totalClanContribution / 2000) * 100)}%` }} 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 pt-1">
                  {[
                    { tier: 1, requirement: 500, label: 'Milestone Bronze Chest', coins: 150, diamonds: 0 },
                    { tier: 2, requirement: 1200, label: 'Milestone Silver Chest', coins: 350, diamonds: 1 },
                    { tier: 3, requirement: 2000, label: 'Milestone Epic Gold Chest', coins: 600, diamonds: 3 }
                  ].map((x) => {
                    const achieved = totalClanContribution >= x.requirement;
                    const claimed = claimedWeeklyMilestones.includes(x.tier);

                    return (
                      <div key={x.tier} className="bg-stone-900 border border-stone-850 p-3.5 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9.5px] font-black text-slate-450 block uppercase tracking-wide">
                            {x.label}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-350 block mt-0.5">
                            Syarat: {x.requirement} Poin
                          </span>
                          <div className="flex gap-2 text-[9px] uppercase font-bold text-yellow-500 mt-1">
                            <span>+{x.coins} Coins</span>
                            {x.diamonds > 0 && <span className="text-blue-400">+{x.diamonds} Dia</span>}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleClaimMilestone(x.tier, x.requirement, x.coins, x.diamonds)}
                          disabled={claimed || !achieved}
                          className={`px-3 py-2 text-[9.5px] font-black uppercase rounded-lg border-none cursor-pointer transition ${
                            claimed 
                              ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                              : achieved 
                                ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow'
                                : 'bg-stone-850 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {claimed ? 'DIKLAIM' : achieved ? 'KLAIM' : 'BELUM'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suku leaderboards */}
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-850 pb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Peringkat Kontribusi Aktif Anggota
                </h4>

                <div className="space-y-2.5">
                  {[...guildMembers]
                    .sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
                    .map((item, index) => {
                      return (
                        <div key={item.name} className="flex justify-between items-center text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 font-bold font-mono text-slate-500 text-center">
                              {index + 1}.
                            </span>
                            <span className="text-white font-bold">{item.name}</span>
                          </div>
                          <span className="text-yellow-500 font-mono font-black">
                            {item.contribution || 0} Poin
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CHESS WAR */}
          {activityDetail === 'war' && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-900 border border-stone-850 rounded-2xl">
                <span className="text-[10px] text-red-400 font-black uppercase tracking-wider block">CLAN WAR CHEST</span>
                <h4 className="text-xs font-black text-white uppercase mt-0.5">Perang Tanding Taktis Suku</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">Bekerjasama dengan klan memecahkan teka-teki catur strategis di 3 papan tanding wilayah musuh untuk memenangkan koin klan ekstra tebal harian!</p>
              </div>

              {activeWarStage === null ? (
                <div className="space-y-4">
                  {puzzlesList.map((puzzle) => {
                    const isConquered = conqueredBoards.includes(String(puzzle.id));
                    return (
                      <div key={puzzle.id} className="bg-[#262421] p-4.5 rounded-2xl border border-stone-800 flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[8px] bg-stone-900 text-[#81b64c] px-2 py-0.5 rounded font-black uppercase">Board {puzzle.id}</span>
                          <h5 className="text-xs font-black text-white uppercase mt-1">{puzzle.title}</h5>
                          <p className="text-[10px] text-slate-400 pr-1 mt-0.5 leading-normal">{puzzle.desc}</p>
                        </div>

                        <button 
                          onClick={() => {
                            if (isConquered) {
                              triggerAudio('error');
                              triggerReward(0, 'Papan taktis ini sudah berhasil Anda taklukkan hari ini!', 'info');
                              return;
                            }
                            setActiveWarStage(puzzle.id);
                            setSelectedPuzzlePiece(null);
                            setWrongPuzzleAttempt(false);
                            triggerAudio('move');
                          }}
                          className={`px-4.5 py-2.5 rounded-xl font-black text-[10px] uppercase border-none text-center cursor-pointer transition whitespace-nowrap ${
                            isConquered 
                              ? 'bg-stone-900 text-stone-500 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-500 text-white shadow'
                          }`}
                        >
                          {isConquered ? 'SELESAI' : 'TANTANG'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#262421] p-5 rounded-2xl border border-[#3c3934] space-y-4">
                  {(() => {
                    const activePuzzle = puzzlesList.find(p => p.id === activeWarStage)!;
                    return (
                      <div className="space-y-4 text-center">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-white uppercase">{activePuzzle.title}</span>
                          <button 
                            onClick={() => { setActiveWarStage(null); triggerAudio('move'); }}
                            className="px-2.5 py-1 bg-stone-900 border border-stone-850 rounded text-[9px] font-bold text-slate-400"
                          >
                            Keluar
                          </button>
                        </div>

                        <p className="text-[11.5px] text-[#81b64c] font-black">{activePuzzle.desc}</p>

                        {/* Rendering 8x8 Tactic Board */}
                        <div className="mx-auto w-64 h-64 border-4 border-stone-900 bg-stone-800 rounded-xl overflow-hidden grid grid-cols-8 grid-rows-8">
                          {activePuzzle.boardState.map((rowArr, rowIndex) => {
                            return rowArr.map((cellValue, colIndex) => {
                              const isDark = (rowIndex + colIndex) % 2 === 1;
                              const isSelected = selectedPuzzlePiece?.r === rowIndex && selectedPuzzlePiece?.c === colIndex;

                              return (
                                <div 
                                  key={`${rowIndex}-${colIndex}`}
                                  onClick={() => {
                                    setSelectedPuzzlePiece({ r: rowIndex, c: colIndex });
                                    setWrongPuzzleAttempt(false);
                                    triggerAudio('move');
                                  }}
                                  className={`aspect-square flex items-center justify-center text-xl font-black cursor-pointer transition select-none ${
                                    isSelected 
                                      ? 'bg-yellow-405/80 text-yellow-100 border border-yellow-400' 
                                      : isDark ? 'bg-stone-700/60' : 'bg-stone-200'
                                  }`}
                                >
                                  {cellValue === 'q' && <span className="text-black text-2xl">♛</span>}
                                  {cellValue === 'k' && <span className="text-red-500 text-2xl">♚</span>}
                                  {cellValue === 'N' && <span className="text-white text-2xl text-shadow">♘</span>}
                                  {cellValue === 'R' && <span className="text-white text-2xl text-shadow">♖</span>}
                                  {cellValue === 'B' && <span className="text-white text-2xl text-shadow">♗</span>}
                                  {cellValue === 'r' && <span className="text-black text-2xl">♜</span>}
                                </div>
                              );
                            });
                          })}
                        </div>

                        {wrongPuzzleAttempt && (
                          <p className="text-red-400 text-[10px] font-black uppercase">
                            Tindakan Salah! Coba analisa ulang rute perpindahan taktik!
                          </p>
                        )}

                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setActiveWarStage(null); triggerAudio('move'); }}
                            className="flex-1 py-2 bg-stone-900 hover:bg-stone-850 text-slate-400 text-[10px] font-black uppercase rounded-xl border border-stone-800 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button 
                            onClick={() => {
                              if (!selectedPuzzlePiece) {
                                triggerAudio('error');
                                triggerReward(0, 'Pilih sel papan taktik catur untuk mengonfirmasi perpindahan buah catur Anda!', 'info');
                                return;
                              }

                              const isCorrect = selectedPuzzlePiece.r === activePuzzle.solutionRow && selectedPuzzlePiece.c === activePuzzle.solutionCol;
                              if (isCorrect) {
                                const nextConquered = [...conqueredBoards, String(activeWarStage)];
                                setConqueredBoards(nextConquered);
                                localStorage.setItem('conquered_boards_list', JSON.stringify(nextConquered));

                                setCoins(prev => {
                                  const next = prev + 300;
                                  localStorage.setItem('coins', String(next));
                                  return next;
                                });

                                setGuildLogs(prev => [`Papan Perang Catur ${activePuzzle.title} berhasil ditaklukkan oleh @${username}! (+300 Koin)`, ...prev]);
                                setActiveWarStage(null);
                                triggerAudio('win');
                                triggerReward(200, `BRILIAN! Pemenangan Taktis Berhasil! Anda menaklukkan board ${activeWarStage} dan memenangkan hadiah: +300 Koin!`, 'level_up');
                              } else {
                                triggerAudio('error');
                                setWrongPuzzleAttempt(true);
                              }
                            }}
                            className="flex-1 py-2 bg-red-650 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-xl border-none cursor-pointer"
                          >
                            Serang Papan Sekutu
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CHAT ROOM */}
          {activityDetail === 'chat' && (
            <div className="space-y-4">
              <div className="bg-[#262421] p-5 rounded-2xl border border-stone-800 space-y-3.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-stone-850 pb-2">
                  <span>Obrolan Suku Aktif ({guildMembers.length} Orang)</span>
                </h4>

                <div className="space-y-3 max-h-[16rem] overflow-y-auto pr-1 bg-black/15 p-3 rounded-xl border border-stone-850 divide-y divide-stone-850">
                  {guildChatMessages.map((msg, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed pt-2.5 first:pt-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#81b64c] text-xs">{msg.sender}</span>
                        <span className="text-[8px] text-slate-500 font-mono italic">{msg.time}</span>
                      </div>
                      <span className="text-slate-350 font-medium mt-0.5 block">{msg.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ketik pesan obrolan suku klan..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value;
                        if (!val.trim()) return;

                        const timeNow = new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' });
                        setGuildChatMessages(prev => [...prev, { sender: username, text: val, time: timeNow }]);
                        e.currentTarget.value = '';
                        triggerAudio('move');

                        setTimeout(() => {
                          const replies = [
                            "Kerjasama klan catur kita mantap sekali!",
                            "Ayo klaim absensi harian ya teman-teman agar poin target chest kita tercapai.",
                            "Taktik puzzle board tadi seru banget, silakan diselesaikan.",
                            "Apakah ada yang perlu kepingan fragment Gold Knight? Saya bersedia mendonasikan.",
                            "Mabar catur santai sore ini kuy!"
                          ];
                          const senders = ['Naufal_Catur', 'Isna Caturia', 'Martin_Pratama'];
                          const randRep = replies[Math.floor(Math.random() * replies.length)];
                          const randSender = senders[Math.floor(Math.random() * senders.length)];

                          setGuildChatMessages(prev => [...prev, {
                            sender: randSender,
                            text: randRep,
                            time: new Date().toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })
                          }]);
                          triggerAudio('win');
                        }, 1200);
                      }
                    }}
                    className="flex-1 bg-[#1a1817] border border-stone-800 p-2.5 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#81b64c]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
