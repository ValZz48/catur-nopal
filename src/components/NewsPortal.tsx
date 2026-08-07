import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Plus, Trash2, Edit3, Heart, Eye, Share2, Bookmark, 
  Search, Shield, CheckCircle, Tag, Clock, Calendar, Sparkles, 
  ArrowLeft, Pin, User, X, Image as ImageIcon, Send, FileText
} from 'lucide-react';

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Pengumuman' | 'Turnamen' | 'Pembaruan' | 'Taktik';
  summary: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: string;
  isPinned?: boolean;
  likes: number;
  views: number;
}

const DEFAULT_NEWS: NewsArticle[] = [];

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=1000&q=80'
];

interface NewsPortalProps {
  user?: any;
  isAdmin?: boolean;
  onClose?: () => void;
  triggerAudio: (sound: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export function NewsPortal({ user, isAdmin = false, onClose, triggerAudio, showToast }: NewsPortalProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem('chess_app_news_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_NEWS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chess_news_bookmarks') || '[]');
    } catch { return []; }
  });
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chess_news_likes') || '[]');
    } catch { return []; }
  });

  // Admin View state - Strictly restricted to admin context
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(isAdmin);
  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Pengumuman' | 'Turnamen' | 'Pembaruan' | 'Taktik'>('Pengumuman');
  const [formAuthor, setFormAuthor] = useState(user?.username || 'Admin Catur Utama');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(IMAGE_PRESETS[0]);
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Save articles to local storage
  useEffect(() => {
    try {
      localStorage.setItem('chess_app_news_list', JSON.stringify(articles));
    } catch (e) {}
  }, [articles]);

  const handleLikeArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerAudio('move');
    if (likedIds.includes(id)) {
      setLikedIds(prev => {
        const next = prev.filter(i => i !== id);
        localStorage.setItem('chess_news_likes', JSON.stringify(next));
        return next;
      });
      setArticles(prev => prev.map(a => a.id === id ? { ...a, likes: Math.max(0, a.likes - 1) } : a));
    } else {
      setLikedIds(prev => {
        const next = [...prev, id];
        localStorage.setItem('chess_news_likes', JSON.stringify(next));
        return next;
      });
      setArticles(prev => prev.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a));
      showToast('Menyukai berita!', 'success');
    }
  };

  const handleBookmarkArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerAudio('move');
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(prev => {
        const next = prev.filter(i => i !== id);
        localStorage.setItem('chess_news_bookmarks', JSON.stringify(next));
        return next;
      });
      showToast('Dihapus dari simpanan', 'info');
    } else {
      setBookmarkedIds(prev => {
        const next = [...prev, id];
        localStorage.setItem('chess_news_bookmarks', JSON.stringify(next));
        return next;
      });
      showToast('Berita disimpan!', 'success');
    }
  };

  const handleOpenArticle = (art: NewsArticle) => {
    triggerAudio('move');
    setActiveArticle(art);
    setArticles(prev => prev.map(a => a.id === art.id ? { ...a, views: a.views + 1 } : a));
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('Pengumuman');
    setFormAuthor(user?.username || 'Admin Catur Utama');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl(IMAGE_PRESETS[0]);
    setFormIsPinned(false);
    setEditingArticle(null);
  };

  const handleOpenEdit = (art: NewsArticle) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormAuthor(art.author);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormImageUrl(art.imageUrl);
    setFormIsPinned(!!art.isPinned);
    setIsCreatingModal(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Judul dan isi berita wajib diisi!', 'error');
      return;
    }

    triggerAudio('win');
    if (editingArticle) {
      // Edit
      setArticles(prev => prev.map(a => a.id === editingArticle.id ? {
        ...a,
        title: formTitle,
        category: formCategory,
        author: formAuthor || 'Admin Catur',
        summary: formSummary || formContent.slice(0, 120) + '...',
        content: formContent,
        imageUrl: formImageUrl || IMAGE_PRESETS[0],
        isPinned: formIsPinned
      } : a));
      showToast('Berita berhasil diperbarui!', 'success');
    } else {
      // Create new
      const newArt: NewsArticle = {
        id: `news-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        author: formAuthor || 'Admin Catur',
        summary: formSummary || formContent.slice(0, 120) + '...',
        content: formContent,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        imageUrl: formImageUrl || IMAGE_PRESETS[0],
        readTime: `${Math.max(1, Math.ceil(formContent.length / 400))} mnt baca`,
        isPinned: formIsPinned,
        likes: 0,
        views: 1
      };
      setArticles(prev => [newArt, ...prev]);
      showToast('Berita baru berhasil diterbitkan!', 'success');
    }

    setIsCreatingModal(false);
    resetForm();
  };

  const handleDeleteArticle = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    triggerAudio('error');
    setArticles(prev => prev.filter(a => a.id !== id));
    showToast('Berita berhasil dihapus', 'info');
    if (activeArticle?.id === id) setActiveArticle(null);
  };

  // Filtering
  const filteredArticles = articles.filter(a => {
    const matchesCategory = selectedCategory === 'Semua' 
      ? true 
      : selectedCategory === 'Tersimpan' 
        ? bookmarkedIds.includes(a.id)
        : a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedArticles = filteredArticles.filter(a => a.isPinned);
  const regularArticles = filteredArticles.filter(a => !a.isPinned);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in text-white">
      {/* HEADER BAR */}
      <div className="bg-[#262421] p-4 sm:p-5 md:p-6 rounded-3xl border border-[#3c3934] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-full overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 max-w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#81b64c] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-[#81b64c]/20 shrink-0">
            <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-white uppercase break-words">
                Berita & Pengumuman Catur
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30 uppercase shrink-0 whitespace-nowrap">
                Official News
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5 leading-snug break-words">
              Info terkini seputar turnamen, patch pembaruan game, serta artikel taktik catur
            </p>
          </div>
        </div>

        {/* ADMIN ACTION TOGGLE - ONLY SHOWN IN MODERATOR PORTAL */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {isAdmin && (
            <button
              onClick={() => {
                triggerAudio('move');
                setShowAdminPanel(!showAdminPanel);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                showAdminPanel 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10' 
                  : 'bg-[#312e2b] hover:bg-[#3c3934] text-slate-300 border-[#3c3934]'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              {showAdminPanel ? 'Dashboard Admin (Aktif)' : 'Kelola Berita Admin'}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-[#312e2b] hover:bg-red-650/30 text-slate-400 hover:text-white rounded-xl border border-[#3c3934] transition-colors cursor-pointer"
              title="Tutup Halaman Berita"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ADMIN DASHBOARD BANNER BAR - STRICTLY FOR MODERATOR/ADMIN */}
      {isAdmin && showAdminPanel && (
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-[#262421] to-[#262421] border-2 border-amber-500/40 rounded-3xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/20 pb-3">
            <div>
              <h3 className="font-extrabold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Dashboard Berita Moderator
              </h3>
              <p className="text-xs text-slate-400">Buat, sunting, pin, atau hapus pengumuman berita untuk seluruh komunitas pemain.</p>
            </div>
            <button
              onClick={() => {
                triggerAudio('win');
                resetForm();
                setIsCreatingModal(true);
              }}
              className="px-5 py-2.5 bg-[#81b64c] hover:bg-[#6c9c3e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#81b64c]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tulis Berita Baru
            </button>
          </div>

          {/* Quick Admin Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <div className="bg-[#1e1c18] p-3 rounded-xl border border-amber-500/10 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold block truncate">Total Berita</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-amber-400 leading-snug block truncate">{articles.length} Artikel</span>
            </div>
            <div className="bg-[#1e1c18] p-3 rounded-xl border border-amber-500/10 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold block truncate">Artikel Di-Pin</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-amber-400 leading-snug block truncate">{articles.filter(a => a.isPinned).length} Di-Pin</span>
            </div>
            <div className="bg-[#1e1c18] p-3 rounded-xl border border-amber-500/10 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold block truncate">Total Pembaca</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-cyan-400 leading-snug block truncate">{articles.reduce((acc, a) => acc + a.views, 0)} Views</span>
            </div>
            <div className="bg-[#1e1c18] p-3 rounded-xl border border-amber-500/10 min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold block truncate">Total Apresiasi</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-rose-400 leading-snug block truncate">{articles.reduce((acc, a) => acc + a.likes, 0)} Suka</span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#262421] p-4 rounded-2xl border border-[#3c3934]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {['Semua', 'Pengumuman', 'Turnamen', 'Pembaruan', 'Taktik', 'Tersimpan'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                triggerAudio('move');
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#81b64c] text-white shadow-md font-extrabold' 
                  : 'bg-[#312e2b] text-slate-300 hover:bg-[#3c3934] border border-[#3c3934]'
              }`}
            >
              {cat === 'Tersimpan' && <Bookmark className="w-3 h-3 inline mr-1 text-amber-400" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berita & artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#81b64c]"
          />
        </div>
      </div>

      {/* PINNED FEATURED ARTICLES */}
      {pinnedArticles.length > 0 && selectedCategory === 'Semua' && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400">
            <Pin className="w-4 h-4" /> Berita Utama Utama (Featured)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedArticles.map(art => (
              <div
                key={art.id}
                onClick={() => handleOpenArticle(art)}
                className="group relative bg-[#262421] border-2 border-amber-500/30 hover:border-amber-500/70 rounded-3xl overflow-hidden cursor-pointer transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#262421] via-[#262421]/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-90px)] z-10">
                    <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1 shrink-0">
                      <Pin className="w-3 h-3" /> Disematkan
                    </span>
                    <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20 truncate">
                      {art.category}
                    </span>
                  </div>

                  {showAdminPanel && (
                    <div className="absolute top-3 right-3 flex gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(art); }}
                        className="p-1.5 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors cursor-pointer"
                        title="Sunting Berita"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteArticle(art.id, e)}
                        className="p-1.5 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Berita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="pt-3 border-t border-[#3c3934] flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{art.author}</span>
                      <span>•</span>
                      <span>{art.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleLikeArticle(art.id, e)}
                        className={`flex items-center gap-1 hover:text-rose-400 cursor-pointer ${likedIds.includes(art.id) ? 'text-rose-400 font-bold' : ''}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedIds.includes(art.id) ? 'fill-rose-400' : ''}`} />
                        <span>{art.likes}</span>
                      </button>
                      <button 
                        onClick={(e) => handleBookmarkArticle(art.id, e)}
                        className={`hover:text-amber-400 cursor-pointer ${bookmarkedIds.includes(art.id) ? 'text-amber-400' : ''}`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(art.id) ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGULAR NEWS GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#81b64c]" /> Daftar Artikel & Kabar Terbaru
        </h3>

        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-[#262421] rounded-3xl border border-[#3c3934] space-y-3">
            <Newspaper className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-bold text-sm">Tidak ada berita yang ditemukan dalam kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularArticles.map(art => (
              <div
                key={art.id}
                onClick={() => handleOpenArticle(art)}
                className="group bg-[#262421] border border-[#3c3934] hover:border-[#81b64c]/60 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-md hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold rounded-md max-w-[calc(100%-80px)] truncate z-10 border border-white/10">
                      {art.category}
                    </div>

                    {showAdminPanel && (
                      <div className="absolute top-2 right-2 flex gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(art); }}
                          className="p-1 hover:bg-amber-500/30 text-amber-300 rounded transition-colors cursor-pointer"
                          title="Sunting"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteArticle(art.id, e)}
                          className="p-1 hover:bg-red-500/30 text-red-400 rounded transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-extrabold text-white group-hover:text-[#81b64c] transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-[#3c3934]/40 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{art.date}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" /> {art.views}
                    </span>
                    <button 
                      onClick={(e) => handleLikeArticle(art.id, e)}
                      className={`flex items-center gap-1 hover:text-rose-400 cursor-pointer ${likedIds.includes(art.id) ? 'text-rose-400' : ''}`}
                    >
                      <Heart className={`w-3 h-3 ${likedIds.includes(art.id) ? 'fill-rose-400' : ''}`} />
                      {art.likes}
                    </button>
                    <button 
                      onClick={(e) => handleBookmarkArticle(art.id, e)}
                      className={`hover:text-amber-400 cursor-pointer ${bookmarkedIds.includes(art.id) ? 'text-amber-400' : ''}`}
                    >
                      <Bookmark className={`w-3 h-3 ${bookmarkedIds.includes(art.id) ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#262421] border border-[#3c3934] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 space-y-0">
            {/* Header Image Banner */}
            <div className="h-64 sm:h-80 w-full relative overflow-hidden">
              <img src={activeArticle.imageUrl} alt={activeArticle.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#262421] via-[#262421]/30 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#81b64c] text-white text-xs font-black uppercase rounded-lg shadow-md">
                    {activeArticle.category}
                  </span>
                  <span className="px-3 py-1 bg-black/60 text-slate-300 text-xs font-bold rounded-lg backdrop-blur-md">
                    {activeArticle.readTime}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {activeArticle.title}
                </h1>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Author & Date Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3c3934] text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#312e2b] flex items-center justify-center text-white border border-[#3c3934]">
                    <User className="w-4 h-4 text-[#81b64c]" />
                  </div>
                  <div>
                    <span className="text-white font-extrabold block">{activeArticle.author}</span>
                    <span className="text-[10px] text-slate-400">{activeArticle.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLikeArticle(activeArticle.id)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      likedIds.includes(activeArticle.id)
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-[#312e2b] text-slate-300 border-[#3c3934] hover:bg-[#3c3934]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedIds.includes(activeArticle.id) ? 'fill-rose-400' : ''}`} />
                    <span className="font-bold text-xs">{activeArticle.likes} Suka</span>
                  </button>

                  <button
                    onClick={() => handleBookmarkArticle(activeArticle.id)}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      bookmarkedIds.includes(activeArticle.id)
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-[#312e2b] text-slate-300 border-[#3c3934] hover:bg-[#3c3934]'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Main Body Text */}
              <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {activeArticle.content}
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-6 border-t border-[#3c3934] flex justify-between items-center">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2.5 bg-[#312e2b] hover:bg-[#3c3934] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Tutup Artikel
                </button>

                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Tautan artikel berhasil disalin!', 'success');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#81b64c]/20 hover:bg-[#81b64c]/30 text-[#81b64c] font-bold text-xs rounded-xl border border-[#81b64c]/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Bagikan Artikel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CREATE / EDIT MODAL */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#262421] border border-amber-500/40 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-[#3c3934] pb-4">
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2 uppercase tracking-wide">
                <Shield className="w-5 h-5 text-amber-400" />
                {editingArticle ? 'Sunting Berita Admin' : 'Tulis Berita Catur Baru'}
              </h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#312e2b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-300 font-extrabold uppercase mb-1">Judul Berita *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kejuaraan Catur Pekan Ini Segera Dimulai!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-extrabold uppercase mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Turnamen">Turnamen</option>
                    <option value="Pembaruan">Pembaruan Game</option>
                    <option value="Taktik">Taktik & Edukasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-extrabold uppercase mb-1">Penulis (Author)</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-extrabold uppercase mb-1">Ringkasan Singkat (Summary)</label>
                <input
                  type="text"
                  placeholder="Ringkasan 1-2 kalimat yang tampil di kartu berita..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-extrabold uppercase mb-1">Isi Berita Lengkap *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tuliskan berita lengkap di sini..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-[#1b1917] border border-[#3c3934] rounded-xl p-4 text-white focus:outline-none focus:border-amber-400 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 font-extrabold uppercase text-xs">Pilih Gambar Sampul Berita</label>
                
                {/* Upload from device / gallery */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 px-4 py-2.5 bg-[#1b1917] hover:bg-[#282522] border border-[#3c3934] hover:border-amber-400 rounded-xl cursor-pointer text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Pilih Foto dari Galeri HP / File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            if (uploadEvent.target?.result) {
                              setFormImageUrl(uploadEvent.target.result as string);
                              showToast('Gambar sampul dipilih dari galeri!', 'success');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Atau tempel URL Gambar (https://...)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 bg-[#1b1917] border border-[#3c3934] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                {/* Preview Thumbnail if selected */}
                {formImageUrl && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#3c3934] bg-black/40">
                    <img src={formImageUrl} alt="Pratinjau Sampul" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-amber-300 text-[10px] font-black rounded uppercase backdrop-blur-md border border-amber-500/30">
                      Sampul Terpilih
                    </span>
                  </div>
                )}

                {/* Preset Thumbnails */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Atau Pilih dari Galeri Preset:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {IMAGE_PRESETS.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Preset"
                        onClick={() => setFormImageUrl(img)}
                        className={`w-14 h-10 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                          formImageUrl === img ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-[#3c3934] text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-slate-300 font-bold uppercase cursor-pointer select-none">
                  Sematkan ke Berita Utama Di-Pin (Featured Banner)
                </label>
              </div>

              <div className="pt-4 border-t border-[#3c3934] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-5 py-2.5 bg-[#312e2b] hover:bg-[#3c3934] text-slate-300 font-extrabold uppercase rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
