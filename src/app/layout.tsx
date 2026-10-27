import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FloatingSocial } from "@/components/common/FloatingSocial";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { getRequestLocale } from "@/lib/server-locale";
import { isPageDisabled } from "@/lib/seo";
import { LOCALE_META } from "@/lib/i18n/dictionary";
import { JsonLd } from "@/components/common/JsonLd";
import { VerificationTags } from "@/components/common/VerificationTags";
import {
  buildLocalBusinessSchema,
  buildWebSiteSchema,
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo-metadata";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

/**
 * Font di-self-host (file .woff2 variable ada di ./fonts):
 *  - build TIDAK lagi fetch ke fonts.googleapis.com (dulu pernah gagal di
 *    CI: "An error occurred in next/font - Cannot read properties of null"),
 *  - 4 file variable menutup semua weight + italic (total ~112 KB),
 *  - `display: swap` mencegah teks tak terlihat (FOIT).
 */
const fontSans = localFont({
  src: [
    { path: "./fonts/PlusJakartaSans-Normal.woff2", weight: "300 800", style: "normal" },
    { path: "./fonts/PlusJakartaSans-Italic.woff2", weight: "300 800", style: "italic" },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

const fontDisplay = localFont({
  src: [
    { path: "./fonts/Urbanist-Normal.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/Urbanist-Italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-urbanist",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Sublimasi & Kain Industri`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain, visualizer motif, harga bertingkat, dan portal B2B terintegrasi.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "sublimasi kain",
    "dryfit milano",
    "kain jersey",
    "sublimasi jakarta",
    "tekstil industri",
    "voal ultrafine",
    "cetak sublimasi grosir",
    "xoramateria",
  ],
  category: "Tekstil & Manufaktur",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Sublimasi & Kain Industri`,
    description:
      "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain, visualizer motif, harga bertingkat, dan portal B2B terintegrasi.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "XoraMateria — Pabrik Kain Sublimasi",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Sublimasi & Kain Industri`,
    description:
      "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara.",
    images: [DEFAULT_OG_IMAGE],
    creator: "@xoramateriavisiprima",
    site: "@xoramateriavisiprima",
  },
  icons: {
    // Urutan penting: .ico dulu (fallback Googlebot/berbagai browser), lalu
    // PNG persegi ukuran kelipatan 48 (syarat favicon Google Search).
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icons/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icons/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  other: {
    "geo.region": "ID-JK",
    "geo.placename": "Jakarta Utara",
    "geo.position": "-6.1214;106.8839",
    ICBM: "-6.1214, 106.8839",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Locale hasil resolusi server: prefix URL (/de/...) > cookie > "id".
  // Dipakai untuk <html lang/dir> (sinyal bahasa utk Google) & chrome SSR.
  const locale = await getRequestLocale();
  const htmlLang = LOCALE_META[locale]?.htmlLang || "id";
  const htmlDir = locale === "ar" ? "rtl" : "ltr";

  // Halaman yang dinonaktifkan di CMS -> 404 (blokir di server).
  //
  // PENTING: pengecekan ini dilakukan di ROOT LAYOUT, bukan di layout
  // storefront. Root layout berada DI LUAR boundary loading.tsx, sehingga
  // notFound() masih bisa mengubah status HTTP jadi 404. Kalau Dicek di
  // layout storefront (di dalam boundary), respons sudah ter-flush 200 ->
  // "soft 404" (halaman tetap ter-index mesin pencari).
  const pathname = (await headers()).get("x-pathname") || "/";
  if (await isPageDisabled(pathname)) {
    notFound();
  }

  return (
    <html
      lang={htmlLang}
      dir={htmlDir}
      data-theme="brass"
      className={`dark ${fontSans.variable} ${fontDisplay.variable}`}
    >
      <head>
        {/* Apply stored accent theme before first paint (avoids flash). */}
        <Script id="texora-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('texora-theme-v2');var ok=['xora','brass','emerald','sapphire','crimson'];if(ok.indexOf(t)>=0){document.documentElement.dataset.theme=t;}}catch(e){}})()`}
        </Script>
      </head>
      <body className="bg-textile-pattern text-slate-100 antialiased min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
        </ThemeProvider>
        <FloatingSocial />
        {/*
          JSON-LD statis (bukan afterInteractive) supaya Google Rich Results
          parser & AI crawler membaca structured data tanpa eksekusi JS.
          Schema level situs: WebSite + SearchAction dan LocalBusiness/Manufacturer.
        */}
        <JsonLd
          schema={[buildWebSiteSchema(), buildLocalBusinessSchema()]}
          id="ld-global"
        />
        {/* Tag verifikasi Search Console / Bing / Yandex + Analytics */}
        <VerificationTags />
      </body>
    </html>
  );
}
