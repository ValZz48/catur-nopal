import React, { useState } from 'react';
import { ShoppingBag, User, Gift, X, Check, Search, Coins, Gem, Sparkles, Send, ShieldCheck, Heart, Crown, Package, Palette, Users } from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  name_en?: string;
  cost: number;
  costType: 'coin' | 'diamond';
  itemCategory: 'theme' | 'skin' | 'frame' | 'checkmate' | 'heart' | 'starter' | 'premium';
  onBuySelf: () => void;
}

interface ShopPurchaseChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  userCoins: number;
  userDiamonds: number;
  friendsList: any[];
  onSendGift: (friendUsername: string, item: ShopItem) => void;
  prefLang?: 'id' | 'en';
}

export const ShopPurchaseChoiceModal: React.FC<ShopPurchaseChoiceModalProps> = ({
  isOpen,
  onClose,
  item,
  userCoins,
  userDiamonds,
  friendsList,
  onSendGift,
  prefLang = 'id'
}) => {
  const [purchaseType, setPurchaseType] = useState<'self' | 'gift' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [giftSuccess, setGiftSuccess] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const itemName = prefLang === 'en' && item.name_en ? item.name_en : item.name;
  const userBalance = item.costType === 'coin' ? userCoins : userDiamonds;
  const hasEnough = userBalance >= item.cost;

  // Real friends list only
  const realFriends = (friendsList || []).map(f => {
    if (typeof f === 'string') {
      return { username: f, status: 'Online', elo: 1200 };
    }
    return {
      username: f.username || f.name || 'Kawan_Catur',
      status: f.status || 'Online',
      elo: f.elo || 1200
    };
  });

  const filteredFriends = realFriends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelectSelf = () => {
    onClose();
    item.onBuySelf();
  };

  const handleConfirmSendGift = () => {
    const targetUser = selectedFriend || customRecipient.trim();
    if (!targetUser) return;
    if (!hasEnough) return;

    onSendGift(targetUser, item);
    setGiftSuccess(true);
    setTimeout(() => {
      setGiftSuccess(false);
      setPurchaseType(null);
      setSelectedFriend('');
      setCustomRecipient('');
      onClose();
    }, 1800);
  };

  const renderCategoryIcon = () => {
    switch (item.itemCategory) {
      case 'heart':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'premium':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'starter':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'theme':
      case 'skin':
      default:
        return <Palette className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto font-sans">
      <div className="bg-[#1e1c1b] border-2 border-[#81b64c]/40 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setPurchaseType(null);
            setSelectedFriend('');
            setCustomRecipient('');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#262421] rounded-full border border-[#3c3934] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#81b64c] to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              {prefLang === 'en' ? 'Purchase Target Option' : 'Pilihan Tujuan Pembelian'}
            </h3>
            <p className="text-xs text-[#9babaf] font-semibold mt-1">
              {prefLang === 'en' ? 'Select whether to buy for yourself or send as a gift to a friend' : 'Pilih apakah ingin membeli untuk diri sendiri atau kirim sebagai hadiah ke teman'}
            </p>
          </div>
        </div>

        {/* Item summary card */}
        <div className="bg-[#262421] p-4 rounded-2xl border border-[#3c3934] flex items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#312e2b] border border-[#3c3934] flex items-center justify-center shrink-0">
              {renderCategoryIcon()}
            </div>
            <div>
              <span className="block text-xs font-black text-white">{itemName}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Category: {item.itemCategory.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-base font-black flex items-center justify-end gap-1">
              {item.costType === 'coin' ? (
                <span className="text-[#81b64c] flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[#81b64c]" /> {item.cost}
                </span>
              ) : (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Gem className="w-4 h-4 text-cyan-400" /> {item.cost}
                </span>
              )}
            </span>
            {!hasEnough && (
              <span className="text-[10px] text-red-400 font-bold block">
                {prefLang === 'en' ? 'Insufficient balance' : 'Saldo tidak cukup'}
              </span>
            )}
          </div>
        </div>

        {/* Gift success overlay state */}
        {giftSuccess ? (
          <div className="bg-emerald-950/80 border-2 border-emerald-500/50 p-6 rounded-2xl text-center space-y-3 animate-in zoom-in-90">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto font-black text-xl">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-lg font-black text-emerald-400 uppercase tracking-wide">
              {prefLang === 'en' ? 'Gift Sent Successfully!' : 'Hadiah Berhasil Dikirim!'}
            </h4>
            <p className="text-xs text-slate-300 font-semibold">
              {prefLang === 'en'
                ? `Item "${itemName}" has been sent to @${selectedFriend || customRecipient}`
                : `Item "${itemName}" telah sukses terkirim ke inbox teman Anda: @${selectedFriend || customRecipient}`}
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Select Purchase Type (Self vs Gift) */}
            {purchaseType === null && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSelectSelf}
                  className="w-full p-4 bg-[#262421] hover:bg-[#322f2b] border-2 border-[#3c3934] hover:border-[#81b64c] rounded-2xl flex items-center justify-between group transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-[#81b64c] transition-colors">
                        {prefLang === 'en' ? 'Buy for Myself' : 'Beli Untuk Diri Sendiri'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {prefLang === 'en' ? 'Item will be directly unlocked on your account' : 'Item akan langsung terbuka dan dipakai di akun Anda'}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-slate-500 group-hover:text-[#81b64c] shrink-0" />
                </button>

                <button
                  onClick={() => setPurchaseType('gift')}
                  className="w-full p-4 bg-[#262421] hover:bg-[#322f2b] border-2 border-[#3c3934] hover:border-amber-500 rounded-2xl flex items-center justify-between group transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        {prefLang === 'en' ? 'Send as Gift to Friend' : 'Kirim Sebagai Hadiah ke Teman'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {prefLang === 'en' ? 'Choose a friend from your list to receive this item' : 'Pilih teman tanding dari daftar Anda untuk menerima item ini'}
                      </p>
                    </div>
                  </div>
                  <Send className="w-5 h-5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              </div>
            )}

            {/* Step 2: Friend Search & Gift Selection View */}
            {purchaseType === 'gift' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    {prefLang === 'en' ? 'Select Friend Recipient' : 'Pilih Teman Penerima Hadiah'}
                  </span>
                  <button
                    onClick={() => setPurchaseType(null)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {prefLang === 'en' ? 'Back' : 'Kembali'}
                  </button>
                </div>

                {/* Real Friends list section */}
                {realFriends.length > 0 ? (
                  <>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={prefLang === 'en' ? 'Search friend username...' : 'Cari nama/username teman...'}
                        className="w-full bg-[#121110] border border-[#3c3934] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredFriends.map((friend) => {
                        const isSelected = selectedFriend === friend.username;
                        return (
                          <div
                            key={friend.username}
                            onClick={() => {
                              setSelectedFriend(friend.username);
                              setCustomRecipient('');
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                                : 'bg-[#262421] border-[#3c3934] hover:bg-[#322f2b]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#312e2b] border border-[#3c3934] flex items-center justify-center text-xs text-amber-400 font-bold">
                                <User className="w-4 h-4 text-amber-400" />
                              </div>
                              <div>
                                <span className="block text-xs font-extrabold text-white">@{friend.username}</span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {friend.elo} ELO • {friend.status}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                                <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-[#262421] border border-[#3c3934] rounded-xl text-center space-y-2">
                    <Users className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">
                      {prefLang === 'en'
                        ? 'No friends found in your list. You can type a username manually below.'
                        : 'Belum ada kawan di daftar teman Anda. Anda dapat memasukkan username penerima secara manual di bawah.'}
                    </p>
                  </div>
                )}

                {/* Custom Username Input Option */}
                <div className="pt-2 border-t border-[#3c3934]">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {prefLang === 'en' ? 'Or type custom username:' : 'Atau ketik username manual:'}
                  </label>
                  <input
                    type="text"
                    value={customRecipient}
                    onChange={(e) => {
                      setCustomRecipient(e.target.value);
                      if (e.target.value) setSelectedFriend('');
                    }}
                    placeholder="@username_teman"
                    className="w-full bg-[#121110] border border-[#3c3934] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Confirm Gift Button */}
                <button
                  onClick={handleConfirmSendGift}
                  disabled={(!selectedFriend && !customRecipient.trim()) || !hasEnough}
                  className="w-full py-3 bg-[#FFC800] hover:bg-yellow-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>
                    {prefLang === 'en'
                      ? `Send Gift to @${selectedFriend || customRecipient || 'Friend'}`
                      : `Kirim Hadiah ke @${selectedFriend || customRecipient || 'Teman'}`}
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#9babaf] font-medium pt-1 border-t border-[#3c3934]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {prefLang === 'en'
              ? 'Transactions are processed securely using your in-game balance'
              : 'Transaksi diproses dengan aman memakai saldo Koin/Berlian game Anda'}
          </span>
        </div>
      </div>
    </div>
  );
};
