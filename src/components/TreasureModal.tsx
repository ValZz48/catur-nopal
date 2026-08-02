import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, ChevronUp, Gift, Award } from 'lucide-react';
import treasureSvg from '../assets/images/treasure.svg';

export interface DailyQuest {
  id: string;
  title: string;
  current: number;
  target: number;
  rewardType: 'xp' | 'coins' | 'diamonds';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
}

interface TreasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward?: (xp: number, coins: number, diamonds: number, questId?: string) => void;
  userXp?: number;
  quizCompletedCount?: number;
  quizSessionCount?: number;
  claimedQuestIds?: string[];
  monthlyMissionsCompleted?: number;
  onClaimMonthlyReward?: () => void;
  monthlyRewardClaimed?: boolean;
}

export const TreasureModal: React.FC<TreasureModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  userXp = 0,
  quizCompletedCount = 0,
  quizSessionCount = 0,
  claimedQuestIds = [],
  monthlyMissionsCompleted = 0,
  onClaimMonthlyReward,
  monthlyRewardClaimed = false,
}) => {
  // Construct real quests based on actual user progress
  const [quests, setQuests] = useState<DailyQuest[]>([]);

  useEffect(() => {
    const q1Current = Math.min(1, quizCompletedCount || 0);
    const q2Current = Math.min(50, userXp || 0);
    const q3Current = Math.min(3, quizSessionCount || 0);

    setQuests([
      {
        id: 'q1',
        title: 'Selesaikan 1 Kuis / Latihan Catur',
        current: q1Current,
        target: 1,
        rewardType: 'xp',
        rewardAmount: 35,
        completed: q1Current >= 1,
        claimed: claimedQuestIds.includes('q1'),
      },
      {
        id: 'q2',
        title: 'Kumpulkan Minimal 50 Poin XP',
        current: q2Current,
        target: 50,
        rewardType: 'coins',
        rewardAmount: 150,
        completed: q2Current >= 50,
        claimed: claimedQuestIds.includes('q2'),
      },
      {
        id: 'q3',
        title: 'Latihan Catur Berturut-turut (3 Sesi)',
        current: q3Current,
        target: 3,
        rewardType: 'diamonds',
        rewardAmount: 5,
        completed: q3Current >= 3,
        claimed: claimedQuestIds.includes('q3'),
      },
    ]);
  }, [quizCompletedCount, userXp, quizSessionCount, claimedQuestIds, isOpen]);

  const [activeChestQuest, setActiveChestQuest] = useState<DailyQuest | null>(null);
  const [upgradeLevel, setUpgradeLevel] = useState<number>(1); // 1 to 3
  const [tapCount, setTapCount] = useState<number>(0); // 0 to 3
  const [upgradeMessage, setUpgradeMessage] = useState<string>('');
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [openedReward, setOpenedReward] = useState<{ xp: number; coins: number; diamonds: number } | null>(null);

  if (!isOpen) return null;

  const handleOpenChest = (quest: DailyQuest) => {
    if (quest.claimed || !quest.completed) return;
    setActiveChestQuest(quest);
    setUpgradeLevel(1);
    setTapCount(0);
    setUpgradeMessage('Ketuk peti atau tombol di bawah 3x untuk membuka!');
    setIsOpening(false);
    setOpenedReward(null);
  };

  const handleTapChest = () => {
    if (isOpening || openedReward) return;

    const nextTap = tapCount + 1;
    setTapCount(nextTap);

    let newLevel = upgradeLevel;
    if (upgradeLevel < 3 && Math.random() < 0.6) {
      newLevel = upgradeLevel + 1;
      setUpgradeLevel(newLevel);
      setUpgradeMessage(`Ketukan ${nextTap}/3: Berhasil Upgrade ke Level ${newLevel}!`);
    } else {
      setUpgradeMessage(`Ketukan ${nextTap}/3: Peti Level ${upgradeLevel} Siap Dibuka!`);
    }

    if (nextTap >= 3) {
      setIsOpening(true);
      setUpgradeMessage('Membuka Peti Hadiah...');
      setTimeout(() => {
        const bonusMult = newLevel === 3 ? 2.5 : newLevel === 2 ? 1.5 : 1;
        const rewardObj = {
          xp: Math.floor(40 * bonusMult),
          coins: Math.floor(150 * bonusMult),
          diamonds: Math.floor(5 * bonusMult),
        };
        setOpenedReward(rewardObj);

        if (activeChestQuest) {
          setQuests((prev) =>
            prev.map((q) => (q.id === activeChestQuest.id ? { ...q, claimed: true } : q))
          );
        }

        if (onClaimReward && activeChestQuest) {
          onClaimReward(rewardObj.xp, rewardObj.coins, rewardObj.diamonds, activeChestQuest.id);
        }
      }, 700);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-4 font-sans select-none">
        {/* IF Opening Chest Screen (3 taps interactive view) */}
        {activeChestQuest ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-[#1cb0f6] flex flex-col items-center justify-between p-6 text-white text-center"
          >
            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between pt-4">
              <span className="text-xs md:text-sm font-black uppercase tracking-widest bg-white/20 px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
                Misi Harian Catur
              </span>
              <button
                onClick={() => setActiveChestQuest(null)}
                className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Middle Chest Content */}
            <div className="flex flex-col items-center my-auto space-y-6 max-w-sm w-full">
              {/* RARITY TITLE */}
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest drop-shadow-md">
                {upgradeLevel === 3 ? 'SUPER LANGKA!' : upgradeLevel === 2 ? 'ISTIMEWA!' : 'LANGKA'}
              </h2>

              {/* TREASURE CHEST DISPLAY */}
              <motion.div
                animate={
                  isOpening
                    ? { rotate: [-10, 10, -10, 10, 0], scale: [1, 1.15, 1.2, 1] }
                    : { y: [0, -8, 0] }
                }
                transition={{
                  y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 0.5, repeat: 2 },
                }}
                className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center"
              >
                {/* Ambient Aura */}
                <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-2xl animate-pulse" />
                <img
                  src={treasureSvg}
                  alt="Treasure Chest"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] cursor-pointer"
                  onClick={handleTapChest}
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* REWARD SUMMARY IF OPENED */}
              {openedReward ? (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-5 w-full space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-sm uppercase tracking-wider">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Hadiah Berhasil Klaim!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-black/20 p-2 rounded-xl">
                      <div className="text-[10px] text-sky-100 font-bold">XP</div>
                      <div className="text-base font-black text-amber-300">+{openedReward.xp}</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl">
                      <div className="text-[10px] text-sky-100 font-bold">KOIN</div>
                      <div className="text-base font-black text-yellow-300">+{openedReward.coins}</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl">
                      <div className="text-[10px] text-sky-100 font-bold">DIAMOND</div>
                      <div className="text-base font-black text-cyan-200">+{openedReward.diamonds}</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* UPGRADE DOTS */}
                  <div className="flex items-center justify-center gap-4">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
                          upgradeLevel >= lvl
                            ? 'bg-white text-[#1cb0f6] border-white shadow-lg scale-110'
                            : 'bg-white/20 text-white/50 border-white/30'
                        }`}
                      >
                        <ChevronUp className="w-5 h-5 stroke-[3]" />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs md:text-sm font-extrabold text-white/90 leading-relaxed max-w-xs">
                    Peti Level {upgradeLevel} — Ketuk 3x untuk Membuka!
                  </p>

                  {upgradeMessage && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/20 text-[11px] font-black text-yellow-300 font-mono tracking-wider"
                    >
                      {upgradeMessage}
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="w-full max-w-md pb-6 space-y-2.5">
              {!openedReward ? (
                <button
                  onClick={handleTapChest}
                  disabled={isOpening}
                  className="w-full py-4 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl shadow-[0_5px_0_0_#3d8c02] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  <span>Ketuk Peti Hadiah (Sisa {Math.max(0, 3 - tapCount)}x)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveChestQuest(null);
                  }}
                  className="w-full py-4 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl shadow-[0_5px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Selesai & Lanjutkan
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Main Mission List View */
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#131f28] border-2 border-[#2b3d4f] rounded-3xl p-5 md:p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1e2f3d] hover:bg-[#283c4e] text-slate-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="text-center space-y-1 mb-5">
              <span className="text-lg md:text-xl font-black text-[#1cb0f6] uppercase tracking-wide block">
                Misi Harian & Peti Hadiah
              </span>
              <p className="text-xs font-semibold text-slate-400">
                Selesaikan latihan catur harian untuk membuka peti spesial
              </p>
            </div>

            {/* Mission Items Container */}
            <div className="bg-[#1a2835] border border-[#2b3f52] rounded-2xl p-4 space-y-4 mb-5">
              {quests.map((q) => {
                const percent = Math.min(100, Math.round((q.current / q.target) * 100));
                const isReadyToClaim = q.completed && !q.claimed;

                return (
                  <div key={q.id} className="space-y-2 pb-3 border-b border-[#263a4d] last:border-none last:pb-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                      <span>{q.title}</span>
                      <span className="font-mono text-[11px] text-amber-400">
                        {q.current} / {q.target}
                      </span>
                    </div>

                    {/* Progress Bar & Chest Icon */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#101921] h-3.5 rounded-full overflow-hidden border border-[#233647]">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Chest Button */}
                      {isReadyToClaim ? (
                        /* ONLY VIBRATE AND GLOW WHEN MISSION IS FINISHED & UNCLAIMED */
                        <motion.button
                          animate={{
                            rotate: [-6, 6, -6, 6, 0],
                            scale: [1, 1.08, 1],
                          }}
                          transition={{
                            rotate: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
                            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                          }}
                          onClick={() => handleOpenChest(q)}
                          className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/25 border-2 border-amber-400 cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.6)]"
                        >
                          <img
                            src={treasureSvg}
                            alt="Chest Claimable"
                            className="w-9 h-9 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </motion.button>
                      ) : q.claimed ? (
                        /* CLAIMED STATE - NO VIBRATION */
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          <Check className="w-6 h-6 text-emerald-400" />
                        </div>
                      ) : (
                        /* NOT FINISHED STATE - COMPLETELY STATIC, NO VIBRATION AT ALL */
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#15222d] border border-[#26394a] opacity-50 filter grayscale">
                          <img
                            src={treasureSvg}
                            alt="Chest Locked"
                            className="w-8 h-8 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly Mission Footer Banner */}
            <div className="bg-[#172a38] border-2 border-[#1cb0f6]/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">MISI BULAN INI</h4>
                  <div className="text-xs font-mono font-bold text-[#1cb0f6] mt-0.5">
                    {monthlyMissionsCompleted} / 30 Selesai
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#1cb0f6]/20 border border-[#1cb0f6] flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#1cb0f6]" />
                </div>
              </div>

              {/* Monthly progress bar */}
              <div className="w-full bg-[#0d1822] h-2.5 rounded-full overflow-hidden border border-[#233a4c]">
                <div
                  className="bg-[#1cb0f6] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((monthlyMissionsCompleted / 30) * 100))}%` }}
                />
              </div>

              {monthlyMissionsCompleted >= 30 && !monthlyRewardClaimed && (
                <button
                  onClick={onClaimMonthlyReward}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer animate-pulse"
                >
                  Klaim Hadiah Spesial Bulanan  (+500 XP & 1000 Koin)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
