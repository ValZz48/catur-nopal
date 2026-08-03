import React, { useState, useEffect } from 'react';
import { History, Coins, Gem } from 'lucide-react';

interface TransactionHistoryTabProps {
  prefLang: 'id' | 'en';
  triggerAudio: (type: string) => void;
}

export const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = ({ prefLang, triggerAudio }) => {
  // Read transaction history from localStorage (filtered to rolling 7-day window: 7 days ago to today)
  const [localHistory, setLocalHistory] = useState<any[]>(() => {
    try {
      const activeUser = (localStorage.getItem('username') || 'guest').trim().toLowerCase();
      const saved = localStorage.getItem(`chess_transaction_history:${activeUser}`) || localStorage.getItem('chess_transaction_history');
      const list: any[] = saved ? JSON.parse(saved) : [];
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return list.filter(tx => !tx.timestamp || tx.timestamp >= cutoff);
    } catch (e) {
      return [];
    }
  });

  // Listen for real-time transaction updates
  useEffect(() => {
    let active = true;
    const handleUpdate = () => {
      try {
        const activeUser = (localStorage.getItem('username') || 'guest').trim().toLowerCase();
        const saved = localStorage.getItem(`chess_transaction_history:${activeUser}`) || localStorage.getItem('chess_transaction_history');
        const nextList: any[] = saved ? JSON.parse(saved) : [];
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filtered = nextList.filter(tx => !tx.timestamp || tx.timestamp >= cutoff);
        setTimeout(() => {
          if (active) {
            setLocalHistory(filtered);
          }
        }, 0);
      } catch (e) {}
    };
    window.addEventListener('chess_transaction_update', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('chess_transaction_update', handleUpdate);
    };
  }, []);

  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'coin' | 'diamond'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'gain' | 'spend'>('all');

  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const filteredList = localHistory.filter(tx => {
    if (tx.timestamp && typeof tx.timestamp === 'number' && tx.timestamp < cutoffTime) return false;
    if (currencyFilter !== 'all' && tx.type !== currencyFilter) return false;
    if (typeFilter === 'gain' && tx.amount <= 0) return false;
    if (typeFilter === 'spend' && tx.amount >= 0) return false;
    return true;
  });

  return (
    <div className="animate-fade-in duration-300 space-y-6">
      <div className="bg-[#2d2a27]/90 border border-[#3c3934] rounded-3xl p-6 shadow-xl space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#3c3934]/60 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-500" />
              {prefLang === 'en' ? 'Audit Logs & Transaction History' : 'Log Audit & Riwayat Transaksi'}
            </h3>
            <p className="text-[#9babaf] text-xs font-semibold flex items-center gap-2 flex-wrap mt-0.5">
              <span>
                {prefLang === 'en' 
                  ? 'Showing transactions from the last 7 days (rolling 1-week window)' 
                  : 'Menampilkan transaksi 7 hari terakhir (minggu lalu s/d hari ini)'}
              </span>
              <span className="bg-[#81b64c]/15 text-[#81b64c] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#81b64c]/30 uppercase tracking-wide">
                {prefLang === 'en' ? 'Last 7 Days' : '7 Hari Terakhir'}
              </span>
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 flex-wrap">
            {/* Currency Filter */}
            <div className="flex bg-[#1c1a19] p-1 rounded-xl border border-[#3c3934]">
              {(['all', 'coin', 'diamond'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => { setCurrencyFilter(curr); triggerAudio('move'); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    currencyFilter === curr
                      ? 'bg-[#81b64c] text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr === 'all' ? (prefLang === 'en' ? 'All' : 'Semua') : curr}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex bg-[#1c1a19] p-1 rounded-xl border border-[#3c3934]">
              {(['all', 'gain', 'spend'] as const).map((tFilter) => (
                <button
                  key={tFilter}
                  onClick={() => { setTypeFilter(tFilter); triggerAudio('move'); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    typeFilter === tFilter
                      ? 'bg-[#81b64c] text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tFilter === 'all' ? (prefLang === 'en' ? 'All Types' : 'Semua Tipe') : tFilter === 'gain' ? '+' : '-'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-extrabold italic text-xs uppercase tracking-wider bg-[#262421]/30 rounded-2xl border border-dashed border-[#3c3934]">
            {prefLang === 'en' 
              ? "No transactions match your current filters" 
              : "Belum ada riwayat transaksi yang sesuai dengan filter Anda"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3c3934]/65 text-[9px] text-[#9babaf] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">{prefLang === 'en' ? 'Date & Time' : 'Tanggal & Waktu'}</th>
                  <th className="py-3 px-4">{prefLang === 'en' ? 'Description' : 'Keterangan'}</th>
                  <th className="py-3 px-4 text-center">{prefLang === 'en' ? 'Currency' : 'Mata Uang'}</th>
                  <th className="py-3 px-4 text-right">{prefLang === 'en' ? 'Amount' : 'Jumlah'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c3934]/35 text-xs text-slate-200">
                {filteredList.map((tx) => {
                  const date = new Date(tx.timestamp);
                  const formattedDate = date.toLocaleDateString(prefLang === 'en' ? 'en-US' : 'id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  const isPositive = tx.amount > 0;
                  const amtColor = isPositive ? 'text-emerald-400 font-black' : 'text-red-400 font-bold';
                  const sign = isPositive ? '+' : '';

                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#9babaf]">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        {tx.desc}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          tx.type === 'coin' 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {tx.type === 'coin' ? (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              KOIN
                            </>
                          ) : (
                            <>
                              <Gem className="w-3.5 h-3.5" />
                              DIAMOND
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono text-sm ${amtColor}`}>
                        {sign}{tx.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
