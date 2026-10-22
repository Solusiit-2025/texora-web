"use client";

/**
 * Provider bahasa (i18n).
 *
 * Tahap 2: locale SEKARANG DISEDAIAKAN DARI SERVER (`initialLocale`) —
 * berdasarkan prefix URL (`x-locale` dari middleware) atau cookie.
 * Artinya HTML hasil SSR untuk /de/about sudah berbahasa Jerman sejak
 * render pertama (yang dibaca Google), bukan baru berubah setelah JS jalan.
 *
 * - Persistensi preferensi: cookie `texora-locale` (1 tahun) + localStorage.
 * - "ar" -> `dir="rtl"` pada <html>.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LOCALES, LOCALE_META, translate, type Locale } from "./dictionary";

const COOKIE_KEY = "texora-locale";
const STORAGE_KEY = "texora-locale";

/**
 * Simpan preferensi bahasa (cookie + localStorage) SECARA SINKRON.
 *
 * Penting: untuk URL tanpa prefix bahasa (mis. "/artikel" untuk Bahasa
 * Indonesia), server menentukan bahasa dari cookie. Kalau cookie baru ditulis
 * setelah navigasi (useEffect), RSC payload sudah terlanjur di-fetch dengan
 * cookie lama -> halaman tidak berubah sampai di-reload.
 * Karena itu LanguageSwitcher memanggil fungsi ini SEBELUM router.push().
 */
export function persistLocalePreference(locale: Locale): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string, fallback?: string) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Locale hasil resolusi server (URL prefix > cookie > "id"). */
  initialLocale?: Locale;
}) {
  // Render pertama (server & hydration client) memakai locale yang SAMA
  // -> tidak ada hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : "id"
  );

  // Sinkronkan bila server mengirim locale berbeda (navigasi antar URL
  // berprefik bahasa).
  useEffect(() => {
    if (isLocale(initialLocale) && initialLocale !== locale) {
      setLocaleState(initialLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocale]);

  // Terapkan atribut dokumen + persistensi setiap ganti bahasa.
  useEffect(() => {
    const meta = LOCALE_META[locale];
    if (typeof document === "undefined") return;
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: string, fallback?: string) => translate(locale, key, fallback),
    [locale]
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, dir: LOCALE_META[locale].dir, t, setLocale }),
    [locale, t, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback aman agar komponen server-render tanpa provider tidak crash.
    return {
      locale: "id",
      dir: "ltr",
      t: (key: string) => translate("id", key),
      setLocale: () => {},
    };
  }
  return ctx;
}

/**
 * Helper render teks terjemahan di dalam komponen SERVER (mis. Footer).
 * Karena ini client component, context provider tetap tersedia di tree.
 */
export function T({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useI18n();
  return <>{t(k, fallback)}</>;
}

/**
 * Segmen path yang punya versi multi-bahasa (mengikuti LOCALE_ALLOWED_SEGMENTS
 * di middleware). Link ke area privat / noindex TIDAK diberi prefix bahasa.
 */
const LOCALIZABLE_SEGMENTS = [
  "",
  "catalog",
  "kategori",
  "about",
  "contact",
  "custom-sublimation",
  "request-quote",
  "artikel",
];

/**
 * Hook untuk membangun URL internal yang mempertahankan prefix bahasa.
 *
 * Contoh: di halaman /en, link "/catalog" -> "/en/catalog",
 * sedangkan "/cart" & "/portal/..." tetap tanpa prefix (halaman privat).
 */
export function useLocalePath() {
  const { locale } = useI18n();

  return useCallback(
    (href: string) => {
      if (!href) return href;
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
      if (locale === "id") return href;

      // Segment pertama dibaca dari path TANPA query string / hash,
      // supaya "/request-quote?source=catalog" tetap dapat di-prefix.
      const pathname = href.split(/[?#]/)[0];
      const seg = pathname.replace(/^\//, "").split("/")[0];
      if (!LOCALIZABLE_SEGMENTS.includes(seg)) return href;

      if (pathname === "/" && !/[?#]/.test(href)) return `/${locale}`;
      return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
    },
    [locale]
  );
}
