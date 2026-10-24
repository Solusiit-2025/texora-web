"use client";

/**
 * Popup sambutan + pengumuman (storefront).
 *
 * Perilaku:
 *  - Tampil 1,5 detik setelah render pertama.
 *  - Maksimal sekali per 7 hari per browser (localStorage).
 *  - Hanya dirender di layout storefront (tidak muncul di portal/customer/auth).
 *  - Bisa ditutup via tombol X, tombol Tutup, klik backdrop, atau Escape.
 *  - Mendukung beberapa poster (maks 4) sebagai carousel: panah, dots,
 *    keyboard (â†/â†’), dan swipe. Urutan file diatur di layout storefront.
 *  - Bila belum ada poster, tampil versi teks yang tetap informatif.
 *
 * Desain: kartu ringkas (bukan full-page), animasi spring halus, dan
 * menghormati preferensi `prefers-reduced-motion`.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X,
  Sparkles,
  CalendarClock,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";

const STORAGE_KEY = "texora-welcome-popup-v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const SHOW_DELAY_MS = 1500;

/**
 * MODE TRIAL: true = popup tampil SETIAP kali halaman dimuat/di-refresh.
 * Set ke `false` untuk kembali ke aturan normal (maks. sekali per 7 hari).
 */
const TRIAL_ALWAYS_SHOW = true;

export function WelcomePopup({
  posters: posterList = [],
}: {
  posters?: Array<{ src: string; alt?: string }>;
}) {
  const { t } = useI18n();
  const localePath = useLocalePath();
  const reduceMotion = useReducedMotion();

  const posters = posterList.filter((p) => Boolean(p?.src));
  const count = posters.length;

  const [open, setOpen] = useState(false);
  const [posterFailed, setPosterFailed] = useState(count === 0);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count < 2) return;
      setDirection(dir);
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  // Jadwalkan popup bila belum pernah tampil dalam 7 hari terakhir.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.has("preview") || params.has("fresh")) return;

    // Mode tes/QA: paksa tampil walau sudah pernah ditutup (tidak mengubah data).
    const forceShow = params.get("popup") === "1";

    let lastShown = 0;
    try {
      lastShown = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    } catch {
      /* localStorage bisa diblokir (mode privat) â€” tetap tampilkan. */
    }
    if (
      !TRIAL_ALWAYS_SHOW &&
      !forceShow &&
      Number.isFinite(lastShown) &&
      Date.now() - lastShown < TTL_MS
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* abaikan */
    }
    setOpen(false);
    lastFocusRef.current?.focus?.();
  }, []);

  // Escape/panah kiri-kanan, focus awal, focus trap sederhana, kunci scroll.
  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, dismiss, go]);

  const cardTransition = reduceMotion
    ? { duration: 0.18 }
    : { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 48 : -48,
      opacity: 0,
      scale: 0.985,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -48 : 48,
      opacity: 0,
      scale: 0.985,
    }),
  };

  const current = posters[index] ?? null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: "easeOut" }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: "easeOut" }}
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Kartu ringkas: lebar mengikuti poster, bukan full-page */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={posterFailed ? "welcome-popup-title" : undefined}
            aria-label={
              posterFailed
                ? undefined
                : "Pengumuman Grand Opening & Price List XoraMateria"
            }
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40, scale: 0.94, rotateX: -4 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
            }
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }
            }
            transition={cardTransition}
            style={{ transformPerspective: 1200 }}
            className="relative z-10 flex max-h-[86vh] w-fit max-w-[92vw] flex-col will-change-transform"
          >
            <div className="flex min-h-0 flex-col rounded-[30px] bg-gradient-to-b from-brand-400/45 via-white/10 to-brand-500/25 p-px shadow-[0_24px_80px_-18px_rgba(0,0,0,0.95)]">
              <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[29px] bg-slate-950">
                <motion.button
                  ref={closeRef}
                  type="button"
                  onClick={dismiss}
                  aria-label={t("popup.close", "Tutup pengumuman")}
                  whileHover={
                    reduceMotion ? undefined : { rotate: 90, scale: 1.05 }
                  }
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/75 text-white/90 shadow-lg backdrop-blur transition-colors hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </motion.button>

                <div className="min-h-0 overflow-y-auto overscroll-contain">
                  {!posterFailed && current ? (
                    <div
                      className="relative select-none"
                      role={count > 1 ? "group" : undefined}
                      aria-roledescription={count > 1 ? "carousel" : undefined}
                      aria-label={count > 1 ? "Poster pengumuman" : undefined}
                    >
                      <motion.div
                        drag={count > 1 ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.12}
                        onDragEnd={(_e, info) => {
                          if (info.offset.x < -48) go(1);
                          else if (info.offset.x > 48) go(-1);
                        }}
                        className={count > 1 ? "cursor-grab active:cursor-grabbing" : ""}
                      >
                        <AnimatePresence
                          initial={false}
                          mode="wait"
                          custom={direction}
                        >
                          <motion.div
                            key={current.src}
                            custom={direction}
                            variants={reduceMotion ? undefined : slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                              duration: 0.32,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            <Image
                              src={current.src}
                              alt={
                                current.alt ||
                                (count > 1
                                  ? `Poster pengumuman XoraMateria ${index + 1} dari ${count}`
                                  : "Grand Opening Showroom Tour XoraMateria")
                              }
                              width={900}
                              height={1600}
                              priority
                              // Poster promo: sajikan file asli (sudah dioptimasi
                              // 900px) agar tidak bergantung pada image optimizer
                              // serverless yang bisa gagal di sebagian hosting.
                              unoptimized
                              sizes="(max-width: 480px) 92vw, 380px"
                              onError={() => setPosterFailed(true)}
                              draggable={false}
                              className="pointer-events-none block h-auto max-h-[64vh] w-auto max-w-full select-none"
                            />
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      {count > 1 && (
                        <>
                          <motion.button
                            type="button"
                            onClick={() => go(-1)}
                            aria-label="Poster sebelumnya"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white/90 shadow-lg backdrop-blur transition-colors hover:bg-slate-800"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => go(1)}
                            aria-label="Poster berikutnya"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white/90 shadow-lg backdrop-blur transition-colors hover:bg-slate-800"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-[340px] max-w-[88vw] p-6 sm:p-7">
                      <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-300">
                        <Sparkles className="h-3 w-3" />
                        {t("popup.badge", "Grand Opening & Raya Deals")}
                      </div>

                      <h2
                        id="welcome-popup-title"
                        className="mt-4 font-display text-2xl font-bold leading-tight text-white"
                      >
                        {t("popup.title", "Selamat datang di XoraMateria")}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {t(
                          "popup.subtitle",
                          "Showroom Tour & Raya Ready Deals: dari kain BW sampai cetak custom print dengan mesin digital print."
                        )}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-300">
                        {[
                          t("popup.point1", "Kain polosan warna â€” MoQ 3 roll, FREE 2 yard"),
                          t("popup.point2", "Kain BW + jasa print â€” MoQ 10 roll, 1.500/yards"),
                          t("popup.point3", "Custom jasa print â€” MoQ 1.500 yard, 2.000/yards"),
                        ].map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] text-slate-400">
                        <p className="flex items-center gap-2">
                          <CalendarClock className="h-3.5 w-3.5 text-brand-400" />
                          Mon â€“ Fri, 9 AM â€“ 5 PM
                        </p>
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                          Jl. Walang Baru VI No.3, RT.7/RW.7, Tugu Utara, Koja, Jakarta Utara 14260
                        </p>
                      </div>

                      <Link
                        href={localePath("/contact")}
                        onClick={dismiss}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-400"
                      >
                        {t("popup.cta", "Hubungi Kami")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer aksi + indikator slide */}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.12,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-slate-950/95 px-4 py-2.5 backdrop-blur"
                >
                  <span className="text-[10px] text-slate-500">
                    {count > 1
                      ? `${index + 1} / ${count}`
                      : t("popup.note", "Tampil sekali per 7 hari")}
                  </span>

                  {count > 1 ? (
                    <div className="flex items-center gap-1.5">
                      {posters.map((poster, i) => (
                        <button
                          key={poster.src}
                          type="button"
                          onClick={() => {
                            setDirection(i > index ? 1 : -1);
                            setIndex(i);
                          }}
                          aria-label={`Lihat poster ${i + 1}`}
                          aria-current={i === index}
                          className={`h-1.5 rounded-full transition-all ${
                            i === index
                              ? "w-5 bg-brand-400"
                              : "w-1.5 bg-white/25 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <motion.button
                    type="button"
                    onClick={dismiss}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-slate-100 transition-colors hover:bg-white/15"
                  >
                    {t("popup.close", "Tutup")}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
