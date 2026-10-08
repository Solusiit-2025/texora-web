'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type SocialComment } from '@prisma/client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  MessagesSquare,
  RefreshCw,
  Search,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  Printer,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  MessageCircle,
  Activity,
  User,
  Clock,
  ArrowUpRight,
  Send,
  Zap,
  SlidersHorizontal,
  Check,
  X,
} from 'lucide-react';

type ApiResponse = {
  comments: SocialComment[];
  total: number;
  sentimentCount: Record<string, number>;
  platformCount: Record<string, number>;
  platformSentiment: Record<string, Record<string, number>>;
  dailyTrend: { date: string; POSITIVE: number; NEUTRAL: number; NEGATIVE: number; total: number }[];
  mock: boolean;
};

const PLATFORMS = ['ALL', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK'];
const SENTIMENTS = ['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'];
const PAGE_SIZE = 50;

const SENTI_COLORS: Record<string, string> = {
  POSITIVE: '#10b981', // Emerald
  NEUTRAL: '#f59e0b',  // Amber
  NEGATIVE: '#f43f5e',  // Rose
};

const DARK_TOOLTIP = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
};

export default function SocialMediaDashboard() {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'comments'>('overview');
  const [platform, setPlatform] = useState('ALL');
  const [sentiment, setSentiment] = useState('ALL');
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);
  const [repliedIds, setRepliedIds] = useState<Record<string, boolean>>({});
  const [replyToast, setReplyToast] = useState<string>("");
  const [replyModal, setReplyModal] = useState<{
    id: string;
    platform: string;
    username: string;
    message: string;
    replyText: string;
  } | null>(null);

  const ROWS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [platform, sentiment, search, dateRange, selectedTopicFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platform !== 'ALL') params.set('platform', platform);
      if (sentiment !== 'ALL') params.set('sentiment', sentiment);
      if (search) params.set('search', search);
      
      // Date filter parameters
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        params.set('from', fromDate.toISOString());
      }
      
      params.set('limit', '300');
      const res = await fetch(`/api/social?${params.toString()}`);
      const json = await res.json();
      setData(json);
      setVisible(PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [platform, sentiment, search, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAll = useMemo(() => {
    return (
      (data?.sentimentCount.POSITIVE ?? 0) +
      (data?.sentimentCount.NEUTRAL ?? 0) +
      (data?.sentimentCount.NEGATIVE ?? 0)
    );
  }, [data]);

  const positiveCount = data?.sentimentCount.POSITIVE ?? 0;
  const neutralCount = data?.sentimentCount.NEUTRAL ?? 0;
  const negativeCount = data?.sentimentCount.NEGATIVE ?? 0;

  const pct = (n: number) => (totalAll > 0 ? `${((n / totalAll) * 100).toFixed(1)}%` : '0%');

  // Net Sentiment Score (NSS) = % Positive - % Negative
  const netSentimentScore = useMemo(() => {
    if (totalAll === 0) return 0;
    const posPct = (positiveCount / totalAll) * 100;
    const negPct = (negativeCount / totalAll) * 100;
    return Math.round((posPct - negPct) * 10) / 10;
  }, [totalAll, positiveCount, negativeCount]);

  // Brand Reputation Status
  const healthStatus = useMemo(() => {
    if (netSentimentScore >= 40) return { label: 'Sangat Sehat', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500' };
    if (netSentimentScore >= 15) return { label: 'Stabil / Cukup', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'bg-emerald-400' };
    if (netSentimentScore >= 0) return { label: 'Perlu Perhatian', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', badge: 'bg-amber-500' };
    return { label: 'Risiko Reputasi Tinggi', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', badge: 'bg-rose-500' };
  }, [netSentimentScore]);

  // Donut Chart Data
  const pieData = useMemo(
    () => [
      { name: 'Positif (Puas/Pujian)', value: positiveCount, key: 'POSITIVE' },
      { name: 'Netral (Tanya/Diskusi)', value: neutralCount, key: 'NEUTRAL' },
      { name: 'Negatif (Keluhan/Risiko)', value: negativeCount, key: 'NEGATIVE' },
    ],
    [positiveCount, neutralCount, negativeCount],
  );

  // Stacked Bar Data for Platform Comparison
  const barData = useMemo(() => {
    if (!data?.platformSentiment) return [];
    return Object.entries(data.platformSentiment).map(([p, s]) => ({
      platform: p === 'TIKTOK' ? 'TikTok' : p === 'INSTAGRAM' ? 'Instagram' : p === 'FACEBOOK' ? 'Facebook' : p,
      Positive: s.POSITIVE ?? 0,
      Neutral: s.NEUTRAL ?? 0,
      Negative: s.NEGATIVE ?? 0,
      total: (s.POSITIVE ?? 0) + (s.NEUTRAL ?? 0) + (s.NEGATIVE ?? 0),
    }));
  }, [data]);

  // Topic Clusters Extraction from Comments
  const topicClusters = useMemo(() => {
    if (!data?.comments) return [];
    const topics = [
      { id: 'kualitas', name: 'Kualitas & Bahan Kain', keywords: ['kain', 'kualitas', 'bahan', 'jahit', 'sablon', 'sublim', 'halus', 'tebal'], count: 0, neg: 0 },
      { id: 'pengiriman', name: 'Kecepatan Pengiriman', keywords: ['kirim', 'lama', 'sampai', 'resii', 'pengiriman', 'kurir', 'ekspedisi', 'lambat', 'telat'], count: 0, neg: 0 },
      { id: 'harga', name: 'Harga & Promo', keywords: ['harga', 'diskon', 'promo', 'murah', 'mahal', 'biaya', 'bayar', 'cashback'], count: 0, neg: 0 },
      { id: 'pelayanan', name: 'Respon Admin / CS', keywords: ['admin', 'fast', 'cs', 'wa', 'chat', 'tanya', 'respon', 'balas'], count: 0, neg: 0 },
    ];

    data.comments.forEach((c) => {
      const msg = c.message.toLowerCase();
      topics.forEach((t) => {
        if (t.keywords.some((k) => msg.includes(k))) {
          t.count += 1;
          if (c.sentiment === 'NEGATIVE') t.neg += 1;
        }
      });
    });

    return topics.sort((a, b) => b.count - a.count);
  }, [data]);

  // Filtered comments (including topic cluster filtering)
  const filteredComments = useMemo(() => {
    if (!data?.comments) return [];
    if (!selectedTopicFilter) return data.comments;
    const topicObj = topicClusters.find((t) => t.id === selectedTopicFilter);
    if (!topicObj) return data.comments;
    return data.comments.filter((c) =>
      topicObj.keywords.some((k) => c.message.toLowerCase().includes(k))
    );
  }, [data, selectedTopicFilter, topicClusters]);

  // Pagination calculations (20 rows per page)
  const totalPages = useMemo(() => {
    return Math.ceil(filteredComments.length / ROWS_PER_PAGE) || 1;
  }, [filteredComments.length]);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, filteredComments.length);

  const paginatedComments = useMemo(() => {
    return filteredComments.slice(startIndex, endIndex);
  }, [filteredComments, startIndex, endIndex]);

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateLead = (username: string, message: string) => {
    router.push(
      `/portal/crm/leads?sosmed=${encodeURIComponent(username)}&pesan=${encodeURIComponent(message)}`
    );
  };

  const openReplyModal = (comment: SocialComment) => {
    setReplyModal({
      id: comment.id,
      platform: comment.platform,
      username: comment.username,
      message: comment.message,
      replyText: comment.aiReply ?? "",
    });
  };

  const handleSendReply = () => {
    if (!replyModal) return;
    setRepliedIds((prev) => ({ ...prev, [replyModal.id]: true }));
    setReplyToast(`Balasan terkirim ke ${replyModal.platform} (simulasi)`);
    setReplyModal(null);
    setTimeout(() => setReplyToast(""), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {replyToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {replyToast}
        </div>
      )}
      {/* TOP EXECUTIVE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center gap-1.5 shadow-sm shadow-brand-500/10">
              <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" /> CRM · Social Listening & Prospek
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Live AI Sentiment Engine v2.4
            </span>
            {data && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                  data.mock
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                }`}
                title={data.mock ? 'Database tidak reachable — memakai dataset statis identik seed' : 'Data live dari database'}
              >
                {data.mock ? '● DATA STATIS — DB offline' : '● DB LIVE'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-3">
            Social Listening & Intelijen Penjualan
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Pantau komentar TikTok, Instagram & Facebook untuk menangkap prospek, keluhan, dan tren pembelian — lalu ubah komentar ber-intensi beli menjadi lead di pipeline CRM.
          </p>
        </div>

        {/* Executive Action Tools */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['7d', '14d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dateRange === range
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {range === '7d' ? '7 Hari' : range === '14d' ? '14 Hari' : range === '30d' ? '30 Hari' : 'Semua'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:border-slate-600"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            <span>{loading ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Ringkasan</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI SCORECARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Net Sentiment Score (NSS) */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Sentiment Score (NSS)</span>
            <div className={`p-2 rounded-xl ${healthStatus.bg}`}>
              <Activity className={`w-4 h-4 ${healthStatus.color}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-3xl font-black font-mono tracking-tight ${netSentimentScore >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {netSentimentScore > 0 ? `+${netSentimentScore}` : netSentimentScore}
            </div>
            <span className="text-xs text-slate-400 font-semibold font-mono">/ +100</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${healthStatus.badge}`} />
            <span className={`text-xs font-bold ${healthStatus.color}`}>{healthStatus.label}</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(Math.max((netSentimentScore + 100) / 2, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Volume & Buzz */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volume Buzz</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <MessagesSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {(data?.total ?? 0).toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {pct(positiveCount)}
            </span>
            <span>persepsi positif dari total {totalAll} global</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div style={{ width: `${(positiveCount / Math.max(totalAll, 1)) * 100}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${(neutralCount / Math.max(totalAll, 1)) * 100}%` }} className="bg-amber-500 h-full" />
            <div style={{ width: `${(negativeCount / Math.max(totalAll, 1)) * 100}%` }} className="bg-rose-500 h-full" />
          </div>
        </div>

        {/* Card 3: Positive Sentiment Ratio */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tingkat Kepuasan (Positive)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {positiveCount} <span className="text-xs text-slate-400 font-sans font-normal">({pct(positiveCount)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Komentar pujian, kepuasan pesanan & testimoni produk
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(positiveCount / Math.max(totalAll, 1)) * 100}%` }} />
          </div>
        </div>

        {/* Card 4: Negative Risk Level */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Komplain & Risiko (Negative)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-rose-400 tracking-tight">
            {negativeCount} <span className="text-xs text-slate-400 font-sans font-normal">({pct(negativeCount)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Komentar berisiko yang memerlukan tindak lanjut CS
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(negativeCount / Math.max(totalAll, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* EXECUTIVE BRIEFING & RECOMMENDATION PANEL */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-brand-400" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Ringkasan Intelijen Penjualan
              </h3>
              <p className="text-xs text-slate-400">Rangkuman otomatis untuk tim Sales & Marketing dalam menindaklanjuti prospek dan keluhan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Reputasi Terkendali
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Briefing Item 1 */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> 1. Performa Sentiment
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sebanyak <b className="text-white font-mono">{pct(positiveCount)}</b> netizen memberikan testimoni positif. Interaksi tertinggi berasal dari channel TikTok & Instagram terkait ketebalan kain & kualitas cetak sublimasi.
            </p>
          </div>

          {/* Briefing Item 2 */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4" /> 2. Topik Utama Netizen
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Topik <b className="text-white">Kualitas & Bahan Kain</b> menyumbang interaksi terbesar ({topicClusters[0]?.count ?? 0} sebutan). Fokus isu negatif terkonsentrasi pada estimasi lama pengiriman ekspedisi.
            </p>
          </div>

          {/* Briefing Item 3 */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" /> 3. Rekomendasi Aksi Sales
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instruksikan tim CS untuk membalas <b className="text-white">{negativeCount} komentar negatif</b> menggunakan templat AI Reply agar menurunkan potensi krisis reputasi sebelum menjadi viral.
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-brand-500 text-white bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-t-xl'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-brand-500 text-white bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-t-xl'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>Platform & Topic Benchmark</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'comments'
                ? 'border-brand-500 text-white bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-t-xl'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Feed Komentar Real-time</span>
            {negativeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {negativeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* CHARTS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SENTIMENT DONUT CHART */}
            <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-brand-400" /> Komposisi Sentimen Global
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Proporsi %</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Pembagian sentimen masukan netizen di seluruh channel</p>
              </div>

              <div className="h-[240px] my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.key} fill={SENTI_COLORS[d.key]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={DARK_TOOLTIP} formatter={(v: any) => [`${v} komentar`, 'Jumlah']} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800/80">
                {pieData.map((d) => (
                  <div key={d.key} className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5">
                    <div className="font-mono font-black text-sm" style={{ color: SENTI_COLORS[d.key] }}>
                      {pct(d.value)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">{d.key}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* STACKED BAR CHART PER PLATFORM */}
            <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Perbandingan Sentimen per Channel
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">TikTok vs IG vs FB</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Komposisi sentimen positif, netral, dan negatif di tiap platform</p>
              </div>

              <div className="h-[240px] my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="platform" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis fontSize={11} allowDecimals={false} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={DARK_TOOLTIP} cursor={{ fill: '#1e293b' }} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                    <Bar dataKey="Positive" name="Positif" stackId="a" fill={SENTI_COLORS.POSITIVE} />
                    <Bar dataKey="Neutral" name="Netral" stackId="a" fill={SENTI_COLORS.NEUTRAL} />
                    <Bar dataKey="Negative" name="Negatif" stackId="a" fill={SENTI_COLORS.NEGATIVE} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
                {barData.map((b) => (
                  <span key={b.platform} className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-400" />
                    {b.platform}: <b className="font-mono text-white">{b.total} komentar</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 14-DAY SENTIMENT TREND AREA CHART */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Tren Volatilitas Sentimen 14 Hari Terakhir
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Pemantauan lonjakan komentar harian untuk deteksi krisis reputasi secara dini</p>
              </div>
              <InsightBadge data={data} />
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyTrend ?? []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SENTI_COLORS.POSITIVE} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={SENTI_COLORS.POSITIVE} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SENTI_COLORS.NEUTRAL} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={SENTI_COLORS.NEUTRAL} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SENTI_COLORS.NEGATIVE} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={SENTI_COLORS.NEGATIVE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" fontSize={11} interval="preserveStartEnd" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                  <YAxis fontSize={11} allowDecimals={false} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={DARK_TOOLTIP} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                  <Area type="monotone" dataKey="POSITIVE" name="Positif" stroke={SENTI_COLORS.POSITIVE} fill="url(#gPos)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="NEUTRAL" name="Netral" stroke={SENTI_COLORS.NEUTRAL} fill="url(#gNeu)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="NEGATIVE" name="Negatif" stroke={SENTI_COLORS.NEGATIVE} fill="url(#gNeg)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORM & TOPIC BENCHMARK */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* TOPIC CLUSTERS */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Clustered Topic Matrix (Apa Yang Dibicarakan Netizen?)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Ekstraksi otomatis kriteria topik komentar terbanyak yang diseburkan netizen</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topicClusters.map((topic) => {
                const isSelected = selectedTopicFilter === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTopicFilter(null);
                      } else {
                        setSelectedTopicFilter(topic.id);
                        setActiveTab('comments');
                      }
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500 text-white shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-white">{topic.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-brand-400">
                        {topic.count} sebutan
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-3">
                      <span>Keluhan Negatif:</span>
                      <span className={`font-mono font-bold ${topic.neg > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {topic.neg} ({topic.count > 0 ? Math.round((topic.neg / topic.count) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 italic">
                      Klik untuk filter komentar terkait &rarr;
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PLATFORM CARDS BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORMS.filter((p) => p !== 'ALL').map((pName) => {
              const pData = data?.platformSentiment?.[pName] ?? { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
              const pTotal = (pData.POSITIVE ?? 0) + (pData.NEUTRAL ?? 0) + (pData.NEGATIVE ?? 0);
              const pPosPct = pTotal > 0 ? ((pData.POSITIVE ?? 0) / pTotal) * 100 : 0;
              
              const platformStyle =
                pName === 'TIKTOK'
                  ? { label: 'TikTok', badgeBg: 'bg-slate-900 border-cyan-500/40 text-cyan-400', accent: 'from-cyan-500/20 to-slate-900' }
                  : pName === 'INSTAGRAM'
                  ? { label: 'Instagram', badgeBg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-pink-500/40 text-pink-300', accent: 'from-pink-500/20 to-slate-900' }
                  : { label: 'Facebook', badgeBg: 'bg-blue-900/30 border-blue-500/40 text-blue-400', accent: 'from-blue-500/20 to-slate-900' };

              return (
                <div key={pName} className={`p-6 rounded-2xl bg-gradient-to-b ${platformStyle.accent} border border-slate-800 space-y-4 shadow-xl`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${platformStyle.badgeBg}`}>
                      {platformStyle.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{pTotal} Total Komentar</span>
                  </div>

                  <div>
                    <div className="text-2xl font-black font-mono text-white">
                      {pPosPct.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">Positive Rate</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Positif:
                      </span>
                      <b className="font-mono text-white">{pData.POSITIVE ?? 0}</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Netral:
                      </span>
                      <b className="font-mono text-white">{pData.NEUTRAL ?? 0}</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> Negatif:
                      </span>
                      <b className="font-mono text-white">{pData.NEGATIVE ?? 0}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3 / ALWAYS AVAILABLE SEARCH & FILTER BAR */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Select Platform */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-brand-500"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p === 'ALL' ? 'Semua Platform (TikTok, IG, FB)' : p}
              </option>
            ))}
          </select>

          {/* Select Sentiment */}
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-brand-500"
          >
            {SENTIMENTS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'Semua Sentimen' : s === 'POSITIVE' ? '🟢 Positif (Puas)' : s === 'NEUTRAL' ? '🟡 Netral (Tanya)' : '🔴 Negatif (Keluhan)'}
              </option>
            ))}
          </select>

          {/* Search Form */}
          <form
            className="flex gap-2 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
            }}
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari kata kunci, username, atau isi komentar netizen..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            >
              Cari
            </button>
            {(search || platform !== 'ALL' || sentiment !== 'ALL' || selectedTopicFilter) && (
              <button
                type="button"
                onClick={() => {
                  setPlatform('ALL');
                  setSentiment('ALL');
                  setSearch('');
                  setSearchInput('');
                  setSelectedTopicFilter(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 hover:bg-slate-800/50"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </form>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Quick Filter:
          </span>
          <button
            onClick={() => { setSentiment('NEGATIVE'); setActiveTab('comments'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              sentiment === 'NEGATIVE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-400'
            }`}
          >
            ⚠️ Hanya Komplain (Negative)
          </button>
          <button
            onClick={() => { setSentiment('POSITIVE'); setActiveTab('comments'); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              sentiment === 'POSITIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-400'
            }`}
          >
            ⭐ Hanya Testimoni (Positive)
          </button>
          {selectedTopicFilter && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center gap-1">
              Topik: {topicClusters.find((t) => t.id === selectedTopicFilter)?.name}
              <button onClick={() => setSelectedTopicFilter(null)} className="hover:text-white ml-1">✕</button>
            </span>
          )}
        </div>
      </div>

      {/* COMMENTS TABLE & AI ACTION DESK */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Feed Komentar & Saran Balasan AI
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {loading
              ? 'Memuat data...'
              : `Menampilkan ${filteredComments.length === 0 ? 0 : startIndex + 1} - ${endIndex} dari ${filteredComments.length} komentar (20 per halaman)`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-4 w-28">Platform</th>
                <th className="p-4 w-36">Username</th>
                <th className="p-4">Komentar Netizen</th>
                <th className="p-4 w-28">Sentimen</th>
                <th className="p-4">AI Reply Recommendation</th>
                <th className="p-4 w-36">Waktu</th>
                <th className="p-4 w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {paginatedComments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    Tidak ada komentar yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedComments.map((c) => {
                  const isCopied = copiedId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4 align-top">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                            c.platform === 'TIKTOK'
                              ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30'
                              : c.platform === 'INSTAGRAM'
                              ? 'bg-pink-950/40 text-pink-300 border border-pink-500/30'
                              : 'bg-blue-950/40 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {c.platform}
                        </span>
                      </td>
                      <td className="p-4 align-top font-bold text-white font-mono">
                        @{c.username}
                      </td>
                      <td className="p-4 align-top text-slate-200 leading-relaxed max-w-xs font-sans">
                        {c.message}
                      </td>
                      <td className="p-4 align-top">
                        <span className={badgeStyle(c.sentiment ?? '')}>{c.sentiment ?? '-'}</span>
                      </td>
                      <td className="p-4 align-top text-slate-300 max-w-sm">
                        {c.aiReply ? (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 relative group-hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-400 uppercase tracking-wider mb-1">
                              <Sparkles className="w-3 h-3" /> AI Suggested Reply
                            </div>
                            <p className="italic">{c.aiReply}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-4 align-top text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(c.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4 align-top text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1.5">
                          {c.aiReply && (
                            <button
                              onClick={() => openReplyModal(c)}
                              disabled={!!repliedIds[c.id]}
                              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                repliedIds[c.id]
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                  : 'bg-brand-600 hover:bg-brand-500 text-white border border-brand-500'
                              }`}
                              title={repliedIds[c.id] ? 'Balasan sudah terkirim' : `Balas komentar ini di ${c.platform} (simulasi)`}
                            >
                              {repliedIds[c.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                              <span>{repliedIds[c.id] ? 'Terkirim' : 'Balas'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleCreateLead(c.username, c.message)}
                            className="p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40"
                            title="Ubah komentar ini menjadi prospek di Pipeline CRM"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Jadikan Lead</span>
                          </button>
                          {c.aiReply && (
                            <button
                              onClick={() => handleCopyReply(c.id, c.aiReply ?? '')}
                              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                isCopied
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white border border-slate-700'
                              }`}
                              title="Salin Balasan AI"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Tersalin' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER CONTROL BAR */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Halaman <b className="text-white">{currentPage}</b> dari <b className="text-white">{totalPages}</b> (Total {filteredComments.length} komentar)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && p - prevPage > 1;
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-slate-500 font-mono text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 border border-brand-500'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Balas Komentar — edit AI reply sebelum kirim */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-brand-500/40 p-6 shadow-2xl bg-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-400" /> Balas Komentar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  @{replyModal.username} · Platform: {replyModal.platform}
                </p>
              </div>
              <button
                onClick={() => setReplyModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Komentar Netizen</span>
              <p className="leading-relaxed">{replyModal.message}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Balasan (Rekomendasi AI — boleh diedit)
              </label>
              <textarea
                rows={4}
                value={replyModal.replyText}
                onChange={(e) => setReplyModal((p) => (p ? { ...p, replyText: e.target.value } : p))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white leading-relaxed focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyModal.replyText.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Balasan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightBadge({ data }: { data: ApiResponse | null }) {
  if (!data?.dailyTrend?.length) return null;
  const last = data.dailyTrend[data.dailyTrend.length - 1];
  const prev = data.dailyTrend[data.dailyTrend.length - 2];
  if (!last || !prev) return null;
  const spikeNeg = last.NEGATIVE > prev.NEGATIVE + 2;
  const spikePos = last.POSITIVE > prev.POSITIVE + 2;
  const msg = spikeNeg
    ? '⚠️ Peringatan: Ada lonjakan komplain negatif hari ini'
    : spikePos
    ? '🚀 Tren Positif: Terjadi peningkatan persepsi baik netizen'
    : '✅ Tren Stabil: Volatilitas sentimen dalam batas aman';
  const cls = spikeNeg
    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    : spikePos
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-slate-800 text-slate-300 border-slate-700';
  return <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${cls}`}>{msg}</div>;
}

function badgeStyle(s: string) {
  if (s === 'POSITIVE')
    return 'px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold tracking-wide';
  if (s === 'NEGATIVE')
    return 'px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold tracking-wide';
  return 'px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold tracking-wide';
}

