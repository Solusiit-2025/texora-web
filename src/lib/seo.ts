import { prisma } from "@/lib/prisma";

export interface SeoPageMeta {
  title: string;
  description: string;
  excerpt: string;
  schemaType: "article" | "faq" | "product" | "organization" | "none";
  slug?: string;
  enabled?: boolean;
}

export interface SeoGlobal {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface SeoSettings {
  global: SeoGlobal;
  pages: Record<string, SeoPageMeta>;
}

export const SEO_GLOBAL_KEY = "seo.global";
export const SEO_PAGES_KEY = "seo.pages";

export const DEFAULT_SEO: SeoSettings = {
  global: {
    title: "PT. Texora Visi Prima — Sublimasi & Kain Industri",
    description:
      "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain, visualizer motif, harga bertingkat, dan portal B2B terintegrasi.",
    keywords: "sublimasi kain, dryfit milano, kain jersey, tekstil industri, texora",
    ogImage: "/images/hero/hero-printer.jpg",
  },
  pages: {
    "/": {
      title: "PT. Texora Visi Prima — Sublimasi & Kain Industri",
      description: "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara.",
      excerpt: "Pabrik sublimasi & kain poliester siap cetak untuk brand sportswear, hijab, dan merchandise.",
      schemaType: "organization",
      enabled: true,
    },
    "/catalog": {
      title: "Katalog Kain Sublimasi — PT. Texora Visi Prima",
      description: "Jelajahi katalog kain poliester siap sublimasi: Dryfit Milano, Voal Ultrafine, dan lainnya dengan harga bertingkat.",
      excerpt: "Katalog lengkap kain poliester siap sublimasi dengan spesifikasi GSM, lebar, dan harga grosir.",
      schemaType: "product",
      enabled: true,
    },
    "/about": {
      title: "Tentang Kami — PT. Texora Visi Prima",
      description: "Profil pabrik sublimasi dan kain industri PT. Texora Visi Prima di Jakarta Utara.",
      excerpt: "Pabrik sublimasi satu atap: dari bahan mentah hingga gulungan siap kargo.",
      schemaType: "organization",
      enabled: true,
    },
    "/contact": {
      title: "Hubungi Kami — PT. Texora Visi Prima",
      description: "Konsultasi B2B dan penawaran kain sublimasi. Hubungi tim sales PT. Texora Visi Prima.",
      excerpt: "Hubungi tim sales untuk konsultasi kain dan penawaran B2B.",
      schemaType: "organization",
      enabled: true,
    },
    "/custom-sublimation": {
      title: "Kustom Sublimasi 3D — PT. Texora Visi Prima",
      description: "Visualizer motif dan simulasi cetak sublimasi kustom untuk kain roll.",
      excerpt: "Studio kustom sublimasi dengan visualizer 3D dan kalkulator harga.",
      schemaType: "product",
      enabled: true,
    },
    "/track-order": {
      title: "Lacak Pesanan — PT. Texora Visi Prima",
      description: "Lacak status produksi dan pengiriman pesanan kain sublimasi Anda.",
      excerpt: "Pantau status produksi dan pengiriman pesanan Anda secara real-time.",
      schemaType: "none",
      enabled: true,
    },
  },
};

function readJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const [globalRow, pagesRow] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: SEO_GLOBAL_KEY } }).catch(() => null),
    prisma.siteContent.findUnique({ where: { key: SEO_PAGES_KEY } }).catch(() => null),
  ]);

  const global = readJson<SeoGlobal>(globalRow?.value, DEFAULT_SEO.global);
  const pages = readJson<Record<string, SeoPageMeta>>(pagesRow?.value, DEFAULT_SEO.pages);

  return { global, pages };
}

export async function saveSeoSettings(settings: SeoSettings): Promise<void> {
  await prisma.siteContent.upsert({
    where: { key: SEO_GLOBAL_KEY },
    create: { key: SEO_GLOBAL_KEY, group: "seo", label: "SEO Global", value: JSON.stringify(settings.global) },
    update: { value: JSON.stringify(settings.global) },
  });
  await prisma.siteContent.upsert({
    where: { key: SEO_PAGES_KEY },
    create: { key: SEO_PAGES_KEY, group: "seo", label: "SEO Per Halaman", value: JSON.stringify(settings.pages) },
    update: { value: JSON.stringify(settings.pages) },
  });
}
