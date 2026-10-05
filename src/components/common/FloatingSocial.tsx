"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  ChevronRight, 
  ChevronLeft, 
  Share2, 
  MessageCircle, 
  Check, 
  ExternalLink,
  Sparkles,
  X
} from "lucide-react";
import { SOCIAL_LINKS } from "@/config/social";
import { SOCIAL_BRAND, SOCIAL_ICONS } from "./SocialLinks";

interface SocialChannelMeta {
  id: "whatsapp" | "instagram" | "tiktok" | "youtube" | "facebook";
  title: string;
  handle: string;
  badge?: string;
  description: string;
  actionText: string;
  gradientBg: string;
}

const SOCIAL_META: Record<string, SocialChannelMeta> = {
  whatsapp: {
    id: "whatsapp",
    title: "WhatsApp Sales",
    handle: "+62 878-8985-6066",
    badge: "Online",
    description: "Konsultasi Cepat & Penawaran Sampel",
    actionText: "Chat Sekarang",
    gradientBg: "from-emerald-500 to-teal-600",
  },
  instagram: {
    id: "instagram",
    title: "Instagram",
    handle: "@texoravisiprima",
    description: "Koleksi Motif, Portofolio & Inspirasi",
    actionText: "Lihat Profil",
    gradientBg: "from-purple-600 via-pink-500 to-amber-400",
  },
  tiktok: {
    id: "tiktok",
    title: "TikTok",
    handle: "@texoravisiprima",
    description: "Video Proses Cetak Sublimasi Pabrik",
    actionText: "Tonton Video",
    gradientBg: "from-cyan-400 to-rose-500",
  },
  youtube: {
    id: "youtube",
    title: "YouTube",
    handle: "Texora Official",
    description: "Tur Mesin Industri & Edukasi Tekstil",
    actionText: "Subscribe",
    gradientBg: "from-red-600 to-rose-700",
  },
  facebook: {
    id: "facebook",
    title: "Facebook",
    handle: "Texora Visi Prima",
    description: "Komunitas & Informasi Terkini Pabrik",
    actionText: "Kunjungi Halaman",
    gradientBg: "from-blue-600 to-indigo-600",
  },
};

export function FloatingSocial() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Read collapsed preference if stored
  useEffect(() => {
    try {
      const saved = localStorage.getItem("texora-floating-social-collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("texora-floating-social-collapsed", String(next));
    } catch {
      // ignore
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappLink = SOCIAL_LINKS.find((s) => s.id === "whatsapp");

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP FLOATING DOCK (md and up)                              */}
      {/* ============================================================== */}
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex fixed right-3 lg:right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-end pointer-events-auto select-none"
        aria-label="Media Sosial dan Kontak Cepat PT Texora"
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="dock-expanded"
              initial={{ opacity: 0, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex flex-col items-center p-1.5 rounded-xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
            >
              {/* Top Accent Pill / Header */}
              <div className="flex items-center justify-between w-full px-1 pb-1.5 mb-1 border-b border-white/5">
                <div className="flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Connect
                  </span>
                </div>

                {/* Collapse button */}
                <button
                  onClick={toggleCollapse}
                  title="Sembunyikan Menu"
                  aria-label="Sembunyikan Menu Sosial"
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Social Channels List */}
              <div className="flex flex-col gap-1.5">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = SOCIAL_ICONS[s.id];
                  const brand = SOCIAL_BRAND[s.id];
                  const meta = SOCIAL_META[s.id] || {
                    id: s.id,
                    title: s.label,
                    handle: "PT Texora",
                    description: "Terhubung dengan kami",
                    actionText: "Buka",
                    gradientBg: "from-slate-700 to-slate-900",
                  };
                  const isHovered = hoveredId === s.id;
                  const isWhatsApp = s.id === "whatsapp";

                  return (
                    <div
                      key={s.id}
                      className="relative"
                      onMouseEnter={() => setHoveredId(s.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Social Icon Button */}
                      <motion.a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={meta.title}
                        title={meta.title}
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        style={{
                          color: brand.color,
                          backgroundColor: isHovered
                            ? brand.bg
                            : "rgba(255, 255, 255, 0.04)",
                          borderColor: isHovered
                            ? brand.border
                            : "rgba(255, 255, 255, 0.08)",
                          boxShadow: isHovered
                            ? `0 0 16px -2px ${brand.glow}, inset 0 1px 1px rgba(255,255,255,0.2)`
                            : "inset 0 1px 1px rgba(255,255,255,0.05)",
                        }}
                        className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors duration-200 group ${
                          isWhatsApp ? "ring-1 ring-emerald-500/30" : ""
                        }`}
                      >
                        {/* TikTok Chromatic Aberration filter or plain icon */}
                        <span
                          className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                          style={
                            brand.chromatic
                              ? {
                                  filter:
                                    "drop-shadow(1px 0 0 #25F4EE) drop-shadow(-1px 0 0 #FE2C55)",
                                }
                              : undefined
                          }
                        >
                          <Icon className="w-4 h-4" />
                        </span>

                        {/* Special Live Ping Beacon for WhatsApp */}
                        {isWhatsApp && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-950" />
                          </span>
                        )}
                      </motion.a>

                      {/* Premium Flyout Card (Slides out smoothly to the LEFT) */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.94 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 8, scale: 0.94 }}
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 26,
                            }}
                            className={`absolute right-full mr-3.5 z-50 pointer-events-none ${
                              isWhatsApp
                                ? "bottom-0"
                                : s.id === "youtube"
                                ? "bottom-[-10px]"
                                : "top-1/2 -translate-y-1/2"
                            }`}
                          >
                            <div className="relative min-w-[240px] max-w-[280px] p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
                              {/* Arrow Caret pointing to icon */}
                              <div
                                className={`absolute right-[-6px] w-3 h-3 bg-slate-950/95 border-t border-r border-white/15 rotate-45 ${
                                  isWhatsApp
                                    ? "bottom-4"
                                    : s.id === "youtube"
                                    ? "bottom-5"
                                    : "top-1/2 -translate-y-1/2"
                                }`}
                              />

                              {/* Card Header */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${meta.gradientBg} flex items-center justify-center text-white shadow-sm`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="text-xs font-bold text-white tracking-wide">
                                    {meta.title}
                                  </span>
                                </div>

                                {meta.badge ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {meta.badge}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400">
                                    {meta.handle}
                                  </span>
                                )}
                              </div>

                              {/* Description / Value proposition */}
                              <p className="text-[11px] leading-relaxed text-slate-300 font-normal mb-2.5">
                                {meta.description}
                              </p>

                              {/* Action Footer */}
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-brand-400">
                                <span className="flex items-center gap-1 text-slate-300">
                                  {meta.actionText}
                                </span>
                                <span className="flex items-center gap-0.5 text-white/90">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Action: Copy link */}
              <div className="mt-2 pt-2 border-t border-white/5 w-full flex justify-center">
                <button
                  onClick={handleCopyLink}
                  title={copied ? "Tautan Tersalin!" : "Salin Tautan Halaman"}
                  aria-label="Salin Tautan Halaman"
                  className="w-11 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center text-[10px] gap-1"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* COLLAPSED PILL (Ultra-compact & unobtrusive) */
            <motion.button
              key="dock-collapsed"
              initial={{ opacity: 0, scale: 0.85, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 20 }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCollapse}
              className="flex items-center gap-2 py-3 px-2 rounded-l-2xl bg-slate-950/90 backdrop-blur-2xl border border-r-0 border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-slate-300 hover:text-white group"
              title="Buka Media Sosial & Chat Sales"
              aria-label="Buka Media Sosial & Chat Sales"
            >
              <div className="flex flex-col items-center gap-1.5">
                <ChevronLeft className="w-4 h-4 text-brand-400 transition-transform group-hover:-translate-x-0.5" />
                <div className="relative">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 [writing-mode:vertical-rl] tracking-wider py-1 uppercase opacity-80 group-hover:opacity-100">
                  Sosial & Chat
                </span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* ============================================================== */}
      {/* MOBILE QUICK ACTION (Hidden on md, visible on mobile)          */}
      {/* ============================================================== */}
      <div className="md:hidden fixed bottom-6 right-5 z-40 select-none">
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 p-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl min-w-[200px]"
            >
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Media Sosial Texora
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                  aria-label="Tutup Menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = SOCIAL_ICONS[s.id];
                  const meta = SOCIAL_META[s.id];
                  const isWhatsApp = s.id === "whatsapp";

                  return (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                        isWhatsApp
                          ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                          : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="truncate">{meta?.title || s.label}</span>
                        {meta?.badge && (
                          <span className="text-[10px] text-emerald-400">
                            {meta.badge} • Fast Response
                          </span>
                        )}
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Main FAB Button */}
        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Direct Button */}
          {whatsappLink && (
            <motion.a
              href={whatsappLink.href}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/40"
              aria-label="Chat WhatsApp"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Chat Sales</span>
            </motion.a>
          )}

          {/* Socials Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 rounded-full bg-slate-900/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-xl"
            aria-label="Buka Media Sosial"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-200" />
            ) : (
              <Share2 className="w-4 h-4 text-brand-400" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
