"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageContext";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/dictionary";

interface LanguageSwitcherProps {
  /** Varian baris penuh untuk menu mobile. */
  fullWidth?: boolean;
}

/** Segmen path yang TIDAK punya varian URL bahasa (halaman noindex/privat). */
const NON_LOCALIZED = ["cart", "checkout", "track-order", "login", "register", "forgot-password", "unauthorized", "portal", "customer"];

/**
 * Dropdown pemilih bahasa.
 *
 * Tahap 2: memilih bahasa pada halaman storefront yang bisa dilokalkan akan
 * MEMINDAHKAN ke URL berprefik bahasa (/de/about, ...) supaya Google melihat
 * setiap bahasa pada URLnya sendiri (indikasi hreflang). Untuk halaman
 * non-lokalizable, cukup ubah preferensi (cookie) tanpa ganti URL.
 */
export function LanguageSwitcher({ fullWidth = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  /** Path dasar tanpa prefix bahasa, mis. "/de/about" -> "/about". */
  const basePath = (() => {
    const p = pathname || "/";
    const seg = p.match(/^\/(en|zh|ja|de|ar)(?=\/|$)/);
    const rest = seg ? p.slice(seg[1].length + 1) : p;
    return rest === "" ? "/" : rest;
  })();

  const canLocalize = (() => {
    const first = basePath.replace(/^\//, "").split("/")[0];
    return first === "" || !NON_LOCALIZED.includes(first);
  })();

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
    if (!canLocalize) return; // halaman privat/noindex -> cukup ubah preferensi
    const target =
      next === "id"
        ? basePath
        : next === "ar" || next === "en" || next === "zh" || next === "ja" || next === "de"
          ? basePath === "/"
            ? `/${next}`
            : `/${next}${basePath.startsWith("/") ? basePath : `/${basePath}`}`
          : basePath;
    router.push(target);
  };

  return (
    <div ref={ref} className={`relative shrink-0 ${fullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Pilih bahasa / Choose language"
        aria-expanded={open}
        className={
          fullWidth
            ? "w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-semibold"
            : "flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white text-[11px] font-bold transition-all shadow-lg shadow-black/20"
        }
      >
        <span className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-brand-400" />
          <span>{LOCALE_META[locale].native}</span>
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className={
            fullWidth
              ? "mt-1.5 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 z-[1000]"
              : "absolute end-0 top-full mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-1.5 z-[1000]"
          }
        >
          {LOCALES.map((l) => {
            const meta = LOCALE_META[l];
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                onClick={() => handleSelect(l)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-start ${
                  active
                    ? "bg-brand-500/15 text-brand-300 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{meta.native}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
