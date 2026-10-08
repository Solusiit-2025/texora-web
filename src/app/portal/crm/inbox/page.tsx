"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Search,
  Menu,
  CheckCheck,
  Clock,
  ArrowLeft,
  Building2,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Phone,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";

const CHANNEL_ICON: Record<string, any> = {
  WHATSAPP: MessageCircle,
};
const CHANNEL_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp (Fonnte)",
};
const CHANNEL_DOT: Record<string, string> = {
  WHATSAPP: "bg-emerald-400",
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

type WAMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  direction: "inbound" | "outbound";
  status: string;
  createdAt: string;
};

type WAConversation = {
  id: string;
  customerId?: string | null;
  contactName: string;
  contactNumber: string;
  companyName?: string | null;
  unreadCount: number;
  updatedAt: string;
  _count?: { messages: number };
  messages?: WAMessage[];
};

const AI_REPLY_SNIPPETS = [
  "Siap Pak Bambang, Surat Penawaran Resmi (SPH) dengan opsi pengiriman bertahap per 500 meter ke Cikarang sedang kami siapkan.",
  "Untuk repeat order 1.500m Dryfit Milano, harga tier B2B adalah Rp 32.000/m dengan term pembayaran TOP 30 hari disetujui.",
  "Baik, kami akan siapkan batch produksi heatpress minggu ini dan kirimkan sampel proofing warna hari ini.",
  "Terima kasih atas konfirmasinya. PO resmi akan kami sinkronisasikan langsung ke modul ERP Produksi Texora.",
];

export default function InboxPage() {
  const [conversations, setConversations] = useState<WAConversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, WAMessage[]>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatForm, setNewChatForm] = useState({
    customerId: "cust-5",
    contactName: "PT. Intech Mitra Abadi",
    companyName: "PT. Intech Mitra Abadi",
    contactNumber: "081280212068",
    initialMessage: "Halo PT. Intech Mitra Abadi, ini tim Sales Texora.",
  });
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch("/api/whatsapp?action=conversations");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const list: WAConversation[] = data.conversations ?? [];
      setConversations(list);

      // Auto-select first conversation jika belum ada yang terpilih
      setActiveConvId((curr) => {
        if (!curr && list.length > 0) {
          return list[0].id;
        }
        return curr;
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-polling interval setiap 6 detik untuk realtime incoming messages
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConversations(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [fetchConversations]);

  // Load messages for specific conversation from server
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "messages", conversationId: convId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessagesByConv((prev) => ({ ...prev, [convId]: data.messages ?? [] }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages whenever activeConvId changes
  useEffect(() => {
    if (!activeConvId) return;
    loadMessages(activeConvId);
    // Mark as read in backend
    fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", conversationId: activeConvId }),
    }).catch(() => {});
  }, [activeConvId, loadMessages]);

  // Auto-polling interval setiap 4 detik untuk realtime incoming messages
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConversations(true);
      if (activeConvId) {
        loadMessages(activeConvId);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchConversations, activeConvId, loadMessages]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = activeConvId ? messagesByConv[activeConvId] ?? activeConv?.messages ?? [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeConvId]);

  const openConversation = async (id: string) => {
    setActiveConvId(id);
    setShowList(false);
    setSendError(null);
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    loadMessages(id);
  };

  const handleSend = async () => {
    if (!replyText.trim() || !activeConvId || !activeConv || sending) return;
    setSending(true);
    setSendError(null);

    const tempId = `msg-${Date.now()}`;
    const textToSend = replyText.trim();
    const newMsg: WAMessage = {
      id: tempId,
      from: "sales",
      to: activeConv.contactNumber,
      text: textToSend,
      direction: "outbound",
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessagesByConv((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), newMsg],
    }));
    setReplyText("");

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          to: activeConv.contactNumber,
          text: textToSend,
          conversationId: activeConvId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setSendError(data.error || "Gagal mengirim WhatsApp via Gateway.");
        // Mark as failed in list
        setMessagesByConv((prev) => ({
          ...prev,
          [activeConvId]: (prev[activeConvId] ?? []).map((m) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          ),
        }));
      } else {
        // Re-load fresh messages from database to confirm delivery
        await loadMessages(activeConvId);
        await fetchConversations(true);
      }
    } catch (err: any) {
      setSendError(err.message || "Koneksi terputus ke server.");
    } finally {
      setSending(false);
    }
  };

  // Simulasi pesan masuk dari customer (sangat berguna untuk demo di localhost tanpa tunnel)
  const handleSimulateCustomerReply = async (sampleText?: string) => {
    if (!activeConv) return;
    const incomingText =
      sampleText ||
      `Baik Mas, penawaran harga Rp 32.000/m kami sepakati. Mohon siapkan invoice DP dan draft jadwal kirim 500m pertama ke Cikarang ya.`;

    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inbound",
          from: activeConv.contactNumber,
          text: incomingText,
          name: activeConv.contactName,
        }),
      });
      await loadMessages(activeConv.id);
      await fetchConversations(true);
    } catch {
      // ignore
    }
  };

  // Mulai Percakapan Baru (Modal submit)
  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatForm.contactNumber.trim() || startingChat) return;

    setStartingChat(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start-conversation",
          contactNumber: newChatForm.contactNumber.trim(),
          contactName: newChatForm.contactName.trim() || newChatForm.companyName.trim(),
          companyName: newChatForm.companyName.trim() || null,
          customerId: newChatForm.customerId || null,
          initialMessage: newChatForm.initialMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.conversation) {
        await fetchConversations();
        setActiveConvId(data.conversation.id);
        setShowNewChatModal(false);
        setShowList(false);
      }
    } catch {
      // ignore
    } finally {
      setStartingChat(false);
    }
  };

  // Pilih pelanggan dari mock customer untuk auto-fill form chat baru
  const handleSelectCustomerPreset = (cust: typeof MOCK_CUSTOMERS[0]) => {
    setNewChatForm({
      customerId: cust.id,
      contactName: cust.name,
      companyName: cust.company,
      contactNumber: cust.phone,
      initialMessage: `Halo ${cust.name} (${cust.company}), ini tim sales PT. Texora Visi Prima.`,
    });
  };

  const insertAISuggestion = (snippet: string) => {
    setReplyText(snippet);
  };

  // Format list percakapan beserta preview pesan terakhir
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.contactName.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.contactNumber.includes(q)
    );
  });

  const convWithLast = filteredConversations.map((c) => {
    const msgs = messagesByConv[c.id] ?? c.messages ?? [];
    const last = msgs[msgs.length - 1] || c.messages?.[0];
    return {
      ...c,
      lastMessage: last?.text ?? "Belum ada pesan.",
      lastMessageAt: last?.createdAt ?? c.updatedAt ?? "",
      isToday:
        last?.createdAt &&
        new Date(last.createdAt).toDateString() === new Date().toDateString(),
    };
  });

  return (
    <div className="space-y-4 min-w-0">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-brand-400" />
              <span>CRM WhatsApp Inbox</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gateway Fonnte Aktif</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Perpesanan resmi WhatsApp dua arah terhubung ke profil pelanggan B2B 360° & pesanan SPK.
          </p>
        </div>

        {/* Action Header: Mulai Chat Baru & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchConversations()}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Muat ulang pesan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-400" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Memperbarui..." : "Refresh"}</span>
          </button>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Chat Baru</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {sendError && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>Gagal Mengirim:</strong> {sendError}</span>
          </div>
          <button onClick={() => setSendError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[64vh]">
        
        {/* LIST PANEL (Kiri) */}
        <div className={`w-full lg:w-84 lg:max-w-xs lg:flex-none transition-all ${showList ? "block" : "hidden lg:block"}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pelanggan / nomor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => setShowList(!showList)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              title="Toggle list"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[60vh] pr-1">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-8">Memuat daftar chat...</p>
            ) : convWithLast.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-400">Belum ada percakapan WhatsApp.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-xs text-brand-400 hover:underline font-semibold"
                >
                  + Mulai chat dengan pelanggan
                </button>
              </div>
            ) : (
              convWithLast.map((c) => {
                const isActive = c.id === activeConvId;
                const isCustomerIntech = c.contactNumber.includes("081280212068") || c.companyName?.includes("Intech");
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? "bg-brand-500/15 border border-brand-500/40 shadow-sm"
                        : "hover:bg-slate-900/60 border border-slate-900/40 bg-slate-950/40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 relative ${
                        isActive
                          ? "bg-brand-500 text-slate-950 font-black"
                          : isCustomerIntech
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {c.contactName.charAt(0).toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-xs truncate">
                          {c.contactName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {c.isToday ? formatTime(c.lastMessageAt) : formatDate(c.lastMessageAt)}
                        </span>
                      </div>

                      {c.companyName && (
                        <div className="text-[11px] text-brand-400 font-semibold truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span>{c.companyName}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-1 truncate leading-tight">
                        {c.lastMessage}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-[10px] font-black text-slate-950 shrink-0 self-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT PANEL (Kanan) */}
        <div className={`flex-1 min-w-0 flex flex-col bg-slate-950/70 border border-slate-800 rounded-3xl overflow-hidden transition-all ${showList ? "hidden lg:flex" : "flex"}`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-center py-16">
              <div className="text-center text-slate-500 space-y-3">
                <MessageCircle className="w-12 h-12 mx-auto opacity-20 text-brand-400" />
                <p className="text-sm">Pilih percakapan di sebelah kiri untuk melihat pesan.</p>
              </div>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowList(true)}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">{activeConv.contactName}</span>
                      {activeConv.companyName && activeConv.companyName.trim().toLowerCase() !== activeConv.contactName.trim().toLowerCase() && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                          {activeConv.companyName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-emerald-400">{activeConv.contactNumber}</span>
                      <span>•</span>
                      <span className="text-slate-400">Tersambung via Fonnte Gateway</span>
                    </div>
                  </div>
                </div>

                {/* Profil 360° & Simulate Reply Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateCustomerReply()}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                    title="Simulasikan balasan WhatsApp masuk dari pelanggan"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Simulasi Balasan</span>
                  </button>

                  <Link
                    href={activeConv.customerId ? `/portal/crm/customers/${activeConv.customerId}` : `/portal/crm/customers/cust-5`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 hover:text-white font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                    title="Buka Profil Pelanggan 360°"
                  >
                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Profil 360°</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>
                </div>
              </div>

              {/* MESSAGES BODY */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 pb-4 min-h-[380px] max-h-[540px]">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Belum ada riwayat pesan dalam percakapan ini.
                  </div>
                ) : (
                  activeMessages.map((m) => {
                    const isSales = m.direction === "outbound";
                    return (
                      <div key={m.id} className={`max-w-[85%] sm:max-w-[75%] ${isSales ? "ml-auto" : "mr-auto"}`}>
                        <div
                          style={{
                            color: isSales ? "#ffffff" : "#f1f5f9",
                            backgroundColor: isSales ? "#059669" : undefined,
                          }}
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md leading-relaxed select-text ${
                            isSales
                              ? "bg-emerald-600 !text-white font-medium rounded-br-none"
                              : "bg-slate-800 border border-slate-700/80 !text-slate-100 rounded-bl-none"
                          }`}
                        >
                          <span style={{ color: isSales ? "#ffffff" : "#f1f5f9" }} className={isSales ? "!text-white font-medium" : "!text-slate-100"}>
                            {m.text}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isSales ? "justify-end text-emerald-300" : "justify-start text-slate-400"}`}>
                          <span className={isSales ? "text-emerald-300 font-medium" : "text-slate-400"}>{formatTime(m.createdAt)}</span>
                          {isSales && (
                            <span className="flex items-center">
                              {m.status === "failed" ? (
                                <span className="text-rose-400 font-bold">Gagal</span>
                              ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* REPLY INPUT & QUICK TEMPLATES */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60 rounded-b-3xl space-y-3">
                {/* AI / Fast Snippets Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    <span>Template AI:</span>
                  </span>
                  {AI_REPLY_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertAISuggestion(snippet)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-500/20 hover:border-brand-500/40 border border-slate-700 text-slate-300 hover:text-white shrink-0 truncate max-w-[240px] text-left transition-colors"
                      title={snippet}
                    >
                      {snippet}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Ketik pesan balasan WhatsApp ke ${activeConv.contactName}... (Tekan Enter untuk kirim)`}
                    rows={2}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-600/20"
                    title="Kirim pesan via Fonnte Gateway"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? "Mengirim..." : "Kirim"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: MULAI CHAT BARU */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 space-y-4 bg-slate-950">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                <span>Mulai Percakapan WhatsApp Baru</span>
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Buttons dari Database Pelanggan */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
                Pilih Cepat dari Pelanggan Terdaftar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_CUSTOMERS.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleSelectCustomerPreset(cust)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      newChatForm.companyName === cust.company
                        ? "bg-brand-500 text-slate-950 border-brand-500 font-bold"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {cust.company}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Perusahaan / Kontak</label>
                <input
                  type="text"
                  value={newChatForm.companyName}
                  onChange={(e) => setNewChatForm({ ...newChatForm, companyName: e.target.value, contactName: e.target.value })}
                  placeholder="PT. Intech Mitra Abadi"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp Tujuan</label>
                <input
                  type="text"
                  value={newChatForm.contactNumber}
                  onChange={(e) => setNewChatForm({ ...newChatForm, contactNumber: e.target.value })}
                  placeholder="081280212068"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pesan Awal (Opsional)</label>
                <textarea
                  rows={2}
                  value={newChatForm.initialMessage}
                  onChange={(e) => setNewChatForm({ ...newChatForm, initialMessage: e.target.value })}
                  placeholder="Tulis pesan pembuka untuk dikirimkan langsung..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={startingChat || !newChatForm.contactNumber.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  {startingChat ? "Membuka..." : "Buka Chat WhatsApp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
