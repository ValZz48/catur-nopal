import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Clock, Sparkles, Shield, Flame, Star, Zap, Crown, Award, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getGlobalSeasonInfo, formatSeasonCountdown } from '../utils/season';

export interface RankInfo {
  name: string;
  nameEn: string;
  minElo: number;
  badgeColor: string;
  badgeTextColor: string;
  borderColor: string;
  icon: React.ReactNode;
  rewardCoins: number;
  rewardDiamonds: number;
}

export const getRankByElo = (elo: number, isEng: boolean = false): { name: string; iconName: string; color: string; badgeBg: string; textCol: string; coins: number; diamonds: number } => {
  if (elo >= 2000) {
    return {
      name: isEng ? "Legendary Grandmaster" : "Grandmaster Legendaris",
      iconName: "crown",
      color: "from-amber-500 via-purple-500 to-cyan-400",
      badgeBg: "bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/40",
      textCol: "text-amber-400",
      coins: 12000,
      diamonds: 700
    };
  } else if (elo >= 1700) {
    return {
      name: isEng ? "King Master" : "Raja Master Catur",
      iconName: "flame",
      color: "from-yellow-500 to-amber-600",
      badgeBg: "bg-amber-500/20 border-amber-500/40",
      textCol: "text-amber-400",
      coins: 8000,
      diamonds: 400
    };
  } else if (elo >= 1400) {
    return {
      name: isEng ? "Queen Strategist" : "Menteri Ahli Strategi",
      iconName: "zap",
      color: "from-purple-500 to-pink-500",
      badgeBg: "bg-purple-500/20 border-purple-500/40",
      textCol: "text-purple-300",
      coins: 5000,
      diamonds: 240
    };
  } else if (elo >= 1100) {
    return {
      name: isEng ? "Rook Guardian" : "Benteng Pengawal",
      iconName: "shield",
      color: "from-blue-500 to-cyan-500",
      badgeBg: "bg-cyan-500/20 border-cyan-500/40",
      textCol: "text-cyan-300",
      coins: 3000,
      diamonds: 160
    };
  } else if (elo >= 800) {
    return {
      name: isEng ? "Bishop Scholar" : "Gajah Cendekia",
      iconName: "award",
      color: "from-emerald-500 to-teal-600",
      badgeBg: "bg-emerald-500/20 border-emerald-500/40",
      textCol: "text-emerald-300",
      coins: 1600,
      diamonds: 80
    };
  } else if (elo >= 500) {
    return {
      name: isEng ? "Knight Apprentice" : "Kuda Magang",
      iconName: "star",
      color: "from-slate-400 to-slate-600",
      badgeBg: "bg-slate-500/20 border-slate-500/40",
      textCol: "text-slate-300",
      coins: 800,
      diamonds: 40
    };
  } else {
    return {
      name: isEng ? "Pawn Novice" : "Pion Pemula",
      iconName: "trophy",
      color: "from-slate-600 to-slate-800",
      badgeBg: "bg-slate-700/20 border-slate-600/40",
      textCol: "text-slate-400",
      coins: 500,
      diamonds: 30
    };
  }
};

interface SeasonStatsProfileCardProps {
  onlineRating: number;
  prefLang: 'id' | 'en';
}

export const SeasonStatsProfileCard: React.FC<SeasonStatsProfileCardProps> = ({
  onlineRating,
  prefLang
}) => {
  const isEng = prefLang === 'en';
  const globalSeason = getGlobalSeasonInfo();
  
  const [countdownText, setCountdownText] = useState<string>('');

  // Track highest ELO achieved during the current 3-month season
  const seasonKey = `highest_elo_${globalSeason.quarterCode.replace(/\s+/g, '_')}`;
  const [highestSeasonElo, setHighestSeasonElo] = useState<number>(() => {
    const saved = localStorage.getItem(seasonKey);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Math.max(onlineRating || 600, parsed);
  });

  useEffect(() => {
    if (onlineRating > highestSeasonElo) {
      setHighestSeasonElo(onlineRating);
      localStorage.setItem(seasonKey, String(onlineRating));
    }
  }, [onlineRating, highestSeasonElo, seasonKey]);

  // Live countdown ticker
  useEffect(() => {
    const update = () => {
      setCountdownText(formatSeasonCountdown(globalSeason.resetTimestamp, prefLang));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [globalSeason.resetTimestamp, prefLang]);

  // Calculate percentage of 3-month season duration
  const totalQuarterDurationMs = globalSeason.resetDate.getTime() - globalSeason.startDate.getTime();
  const elapsedMs = Math.max(0, Date.now() - globalSeason.startDate.getTime());
  const elapsedPercent = Math.min(100, Math.max(0, (elapsedMs / totalQuarterDurationMs) * 100));
  const daysLeft = Math.ceil((globalSeason.resetTimestamp - Date.now()) / (1000 * 60 * 60 * 24));

  const currentRank = getRankByElo(onlineRating, isEng);
  const highestRank = getRankByElo(highestSeasonElo, isEng);

  // Past 3-Month Seasons Mock Data (Deterministic past quarters)
  const pastSeasons = [
    {
      code: globalSeason.seasonNumber === 1 ? `Q4 ${globalSeason.year - 1}` : `Q${globalSeason.seasonNumber - 1} ${globalSeason.year}`,
      title: globalSeason.seasonNumber === 1 ? `Musim 4 (${globalSeason.year - 1})` : `Musim ${globalSeason.seasonNumber - 1} (${globalSeason.year})`,
      highestElo: Math.max(500, Math.floor(highestSeasonElo * 0.92)),
    },
    {
      code: globalSeason.seasonNumber <= 2 ? `Q${globalSeason.seasonNumber + 2} ${globalSeason.year - 1}` : `Q${globalSeason.seasonNumber - 2} ${globalSeason.year}`,
      title: globalSeason.seasonNumber <= 2 ? `Musim ${globalSeason.seasonNumber + 2} (${globalSeason.year - 1})` : `Musim ${globalSeason.seasonNumber - 2} (${globalSeason.year})`,
      highestElo: Math.max(500, Math.floor(highestSeasonElo * 0.84)),
    },
    {
      code: globalSeason.seasonNumber <= 3 ? `Q${globalSeason.seasonNumber + 1} ${globalSeason.year - 1}` : `Q${globalSeason.seasonNumber - 3} ${globalSeason.year}`,
      title: globalSeason.seasonNumber <= 3 ? `Musim ${globalSeason.seasonNumber + 1} (${globalSeason.year - 1})` : `Musim ${globalSeason.seasonNumber - 3} (${globalSeason.year})`,
      highestElo: Math.max(500, Math.floor(highestSeasonElo * 0.75)),
    }
  ];

  return (
    <div className="p-6 bg-[#312e2b] rounded-3xl border border-[#3c3934] shadow-md space-y-6">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3c3934] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#81b64c]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">
              {isEng ? 'Global Season Stats (3 Months)' : 'Statistik Musim Global (3 Bulan)'}
            </h3>
            <p className="text-[11px] text-[#9babaf] font-semibold">
              {isEng ? 'Track your peak rank and season time remaining' : 'Pantau peringkat puncak dan sisa waktu musim berjalan'}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-[#262421] border border-[#3c3934] rounded-full text-[10px] font-black text-[#81b64c] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3 h-3 text-[#81b64c]" />
          {globalSeason.quarterCode}
        </span>
      </div>

      {/* Visual Time Remaining Progress Bar Card */}
      <div className="bg-[#262421] p-4 sm:p-5 rounded-2xl border border-[#3c3934] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEng ? 'Current Active Season' : 'Musim Aktif Saat Ini'}
            </span>
            <span className="text-sm font-black text-white">
              {isEng ? globalSeason.seasonNameEn : globalSeason.seasonNameId}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-[#1c1a19] px-3 py-1.5 rounded-xl border border-[#3c3934] shrink-0">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">{isEng ? 'Time Remaining' : 'Sisa Waktu'}</span>
              <span className="text-xs font-mono font-black text-amber-400 leading-tight">{countdownText || `${daysLeft} Hari`}</span>
            </div>
          </div>
        </div>

        {/* Season Duration Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-300 uppercase tracking-wide">
            <span>{isEng ? 'Season Progress' : 'Progres Durasi Musim'}</span>
            <span className="text-[#81b64c] font-mono">{elapsedPercent.toFixed(1)}%</span>
          </div>

          <div className="w-full h-3 bg-[#171514] rounded-full overflow-hidden border border-[#3c3934] p-0.5 relative shadow-inner">
            <div
              className="bg-gradient-to-r from-[#81b64c] via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(129,182,76,0.5)]"
              style={{ width: `${elapsedPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold pt-0.5">
            <span>{globalSeason.startDate.toISOString().split('T')[0]}</span>
            <span className="text-amber-400 font-bold">{isEng ? `Resets on ${globalSeason.resetDate.toISOString().split('T')[0]}` : `Penataan Ulang: ${globalSeason.resetDate.toISOString().split('T')[0]}`}</span>
          </div>
        </div>
      </div>

      {/* Highest Rank Achieved Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Current Active Rank */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${currentRank.badgeBg} flex items-center justify-center shrink-0 border shadow-md`}>
            <Trophy className={`w-6 h-6 ${currentRank.textCol}`} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEng ? 'Current Live Rating' : 'Peringkat Saat Ini'}
            </span>
            <h4 className="text-sm font-black text-white truncate">
              {currentRank.name}
            </h4>
            <span className="text-xs font-mono font-black text-[#81b64c]">
              {onlineRating} ELO
            </span>
          </div>
        </div>

        {/* Peak Rank Achieved This Season */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 border-l border-b border-amber-500/30 px-2.5 py-0.5 text-[8.5px] font-black uppercase rounded-bl-xl tracking-wider">
            {isEng ? 'Peak Rank' : 'Puncak Musim'}
          </div>

          <div className={`w-12 h-12 rounded-2xl ${highestRank.badgeBg} flex items-center justify-center shrink-0 border shadow-md`}>
            <Crown className={`w-6 h-6 ${highestRank.textCol}`} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEng ? 'Highest Rank (This Season)' : 'Pangkat Tertinggi (Musim Ini)'}
            </span>
            <h4 className={`text-sm font-black ${highestRank.textCol} truncate`}>
              {highestRank.name}
            </h4>
            <span className="text-xs font-mono font-black text-amber-400">
              {highestSeasonElo} ELO
            </span>
          </div>
        </div>

      </div>

      {/* Past 3-Month Seasons History */}
      <div className="space-y-3 pt-2 border-t border-[#3c3934]/60">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isEng ? 'Past 3-Month Seasons Record' : 'Rekam Peringkat Puncak Musim Lalu'}</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-semibold">{isEng ? '3-Month Cycle' : 'Siklus 3 Bulan'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pastSeasons.map((past, idx) => {
            const pastRank = getRankByElo(past.highestElo, isEng);
            return (
              <div key={idx} className="bg-[#262421] p-3.5 rounded-2xl border border-[#3c3934] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#1c1a19] text-[#81b64c] border border-[#3c3934]">
                    {past.code}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {past.highestElo} ELO
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className={`w-8 h-8 rounded-xl ${pastRank.badgeBg} flex items-center justify-center shrink-0 border`}>
                    <Trophy className={`w-4 h-4 ${pastRank.textCol}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">{isEng ? 'Peak Rank' : 'Pangkat Puncak'}</span>
                    <span className={`text-xs font-black ${pastRank.textCol} truncate block`}>
                      {pastRank.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
