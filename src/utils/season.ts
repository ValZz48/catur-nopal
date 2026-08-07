// Utility for 3-Month Global Synchronized Chess Seasons

export interface GlobalSeasonInfo {
  seasonNumber: number; // 1, 2, 3, or 4
  quarterCode: string; // e.g. "Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"
  seasonNameId: string; // e.g. "Musim 3 (Q3: Jul - Sep 2026)"
  seasonNameEn: string; // e.g. "Season 3 (Q3: Jul - Sep 2026)"
  year: number;
  startDate: Date;
  resetDate: Date;
  resetTimestamp: number; // Global UTC timestamp for next 3-month reset
  durationMonths: number; // 3 months
}

/**
 * Calculates deterministic global 3-month season info based on UTC calendar quarters.
 * Every user and account worldwide gets the exact same reset date and countdown timer.
 * 
 * Quarter 1 (Q1): Jan 1 00:00:00 UTC -> Reset on Apr 1 00:00:00 UTC
 * Quarter 2 (Q2): Apr 1 00:00:00 UTC -> Reset on Jul 1 00:00:00 UTC
 * Quarter 3 (Q3): Jul 1 00:00:00 UTC -> Reset on Oct 1 00:00:00 UTC
 * Quarter 4 (Q4): Oct 1 00:00:00 UTC -> Reset on Jan 1 00:00:00 UTC (Next Year)
 */
export function getGlobalSeasonInfo(nowDate: Date = new Date()): GlobalSeasonInfo {
  const year = nowDate.getUTCFullYear();
  const month = nowDate.getUTCMonth(); // 0-11
  const quarterIndex = Math.floor(month / 3); // 0 = Q1, 1 = Q2, 2 = Q3, 3 = Q4
  const seasonNumber = quarterIndex + 1;

  const startDate = new Date(Date.UTC(year, quarterIndex * 3, 1, 0, 0, 0, 0));

  let resetYear = year;
  let resetMonth = (quarterIndex + 1) * 3;
  if (resetMonth >= 12) {
    resetMonth = 0;
    resetYear = year + 1;
  }

  const resetDate = new Date(Date.UTC(resetYear, resetMonth, 1, 0, 0, 0, 0));
  const resetTimestamp = resetDate.getTime();

  const quarterLabels = [
    { en: 'Q1: Jan - Mar', id: 'Q1: Jan - Mar' },
    { en: 'Q2: Apr - Jun', id: 'Q2: Apr - Jun' },
    { en: 'Q3: Jul - Sep', id: 'Q3: Jul - Sep' },
    { en: 'Q4: Oct - Dec', id: 'Q4: Oct - Dec' }
  ];

  const qLabel = quarterLabels[quarterIndex];

  return {
    seasonNumber,
    quarterCode: `Q${seasonNumber} ${year}`,
    seasonNameEn: `Season ${seasonNumber} (${qLabel.en} ${year})`,
    seasonNameId: `Musim ${seasonNumber} (${qLabel.id} ${year})`,
    year,
    startDate,
    resetDate,
    resetTimestamp,
    durationMonths: 3
  };
}

export function formatSeasonCountdown(resetTimestamp: number, lang: 'id' | 'en' = 'id'): string {
  const diff = resetTimestamp - Date.now();
  if (diff <= 0) {
    return lang === 'en' ? '0 Days, 0 Hours' : '0 Hari, 0 Jam';
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (lang === 'en') {
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  }
  return `${days} Hari, ${hours} Jam, ${mins} Mnt, ${secs} Det`;
}
