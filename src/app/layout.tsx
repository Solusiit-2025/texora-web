import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans, Urbanist } from "next/font/google";
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
 * Font di-self-host oleh next/font:
 *  - tidak ada request render-blocking ke fonts.googleapis.com,
 *  - file font otomatis di-preload & di-cache immutable,
 *  - `display: swap` mencegah teks tak terlihat (FOIT).
 */
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

const fontDisplay = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
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
    icon: "/icons/xoramateria-mark.png",
    shortcut: "/icons/xoramateria-mark.png",
    apple: "/icons/xoramateria-mark.png",
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
      className={`dark ${fontSans.variable} ${fontDisplay.variable}`}
    >
      <head>
        {/* Apply stored accent theme before first paint (avoids flash). */}
        <Script id="texora-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('texora-theme');if(t==='emerald'||t==='sapphire'||t==='crimson'){document.documentElement.dataset.theme=t;}}catch(e){}})()`}
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
