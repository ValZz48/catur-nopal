import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, Share2, X, Users, Sparkles, ShieldCheck } from 'lucide-react';

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  prefLang?: 'id' | 'en';
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  prefLang = 'id'
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen || !roomCode) return null;

  // Construct direct join link with query parameter ?room=XYZ
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pal Mate - Tantangan Catur Online',
          text: `Ayo duel catur di Pal Mate! Masukkan PIN Kamar [${roomCode}] atau klik tautan langsung berikut untuk bergabung:`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or not supported', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1e1c1b] border-2 border-[#81b64c]/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#262421] rounded-full border border-[#3c3934] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/50 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 text-[#81b64c]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
              {prefLang === 'en' ? 'Share Game Room' : 'Bagikan Kamar Tanding'}
            </h3>
            <p className="text-xs text-[#9babaf] font-semibold mt-0.5">
              {prefLang === 'en'
                ? 'Scan QR code or share PIN to join instantly'
                : 'Pindai kode QR atau bagikan PIN untuk tanding instan'}
            </p>
          </div>
        </div>

        {/* QR Code Container Card */}
        <div className="bg-white p-5 rounded-2xl border-4 border-[#81b64c] shadow-lg flex flex-col items-center justify-center relative mx-auto w-fit">
          <QRCodeSVG
            value={shareUrl}
            size={180}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#121110"
          />
          <div className="mt-3 pt-2 border-t border-slate-200 w-full text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
              {prefLang === 'en' ? 'SCAN WITH CAMERA / PHONE' : 'PINDAI DENGAN KAMERA / HP'}
            </span>
          </div>
        </div>

        {/* PIN Info & Copy Row */}
        <div className="bg-[#262421] p-3.5 rounded-2xl border border-[#3c3934] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#9babaf] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              {prefLang === 'en' ? 'Room Code (PIN):' : 'PIN Kode Kamar:'}
            </span>
            <button
              onClick={handleCopyPin}
              className="text-[11px] font-extrabold text-[#81b64c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedPin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedPin ? (prefLang === 'en' ? 'Copied!' : 'Tersalin!') : (prefLang === 'en' ? 'Copy PIN' : 'Salin PIN')}
            </button>
          </div>

          <div className="bg-[#121110] border border-[#3c3934] px-4 py-2.5 rounded-xl font-mono text-xl font-black text-amber-400 tracking-widest flex items-center justify-between shadow-inner">
            <span>{roomCode}</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 px-3 bg-[#262421] hover:bg-[#322f2b] border border-[#3c3934] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{prefLang === 'en' ? 'Link Copied!' : 'Tautan Disalin!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-sky-400" />
                <span>{prefLang === 'en' ? 'Copy Link' : 'Salin Tautan'}</span>
              </>
            )}
          </button>

          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 py-3 px-3 bg-[#81b64c] hover:bg-[#6c9c3e] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>{prefLang === 'en' ? 'Share' : 'Bagikan'}</span>
            </button>
          )}
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9babaf] font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {prefLang === 'en'
              ? 'Opponent will automatically join your room upon scanning'
              : 'Teman akan otomatis masuk ke kamar Anda saat memindai'}
          </span>
        </div>
      </div>
    </div>
  );
};
