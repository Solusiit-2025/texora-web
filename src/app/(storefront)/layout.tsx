import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { NavProgress } from "@/components/common/NavProgress";
import { WelcomePopup } from "@/components/storefront/WelcomePopup";
import { getSeoSettings } from "@/lib/seo";
import fs from "node:fs";
import path from "node:path";

/**
 * Cari semua poster popup di /public/images/promo (maks 4 file, urut nama).
 * Prioritas file yang namanya mengandung "grand opening" lalu "price list".
 * Bila folder kosong, popup memakai versi teks (fallback) tanpa request 404.
 */
function resolvePromoPosters(): string[] {
  const dir = path.join(process.cwd(), "public", "images", "promo");
  try {
    const files = fs
      .readdirSync(dir)
      .filter((name) => /\.(jpe?g|png|webp)$/i.test(name));

    if (files.length === 0) return [];

    const rank = (name: string) => {
      if (/grand[-_ ]?opening/i.test(name)) return 0;
      if (/price[-_ ]?list/i.test(name)) return 1;
      return 2;
    };

    return files
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .slice(0, 4)
      .map((name) => `/images/promo/${encodeURIComponent(name)}`);
  } catch {
    return [];
  }
}

/**
 * Layout publik (storefront).
 *
 * Server component: daftar path modul yang dinonaktifkan DIAMBIL DARI DATABASE
 * di sini lalu diteruskan ke Navbar sebagai prop. Hasilnya:
 *  - Menu yang di-nonaktifkan TIDAK flash saat halaman pertama dimuat
 *    (HTML pertama sudah benar, tanpa perlu tunggu fetch client).
 *  - Link navigasi tetap ada di HTML hasil SSR -> crawlability internal link
 *    tidak hilang (penting untuk SEO).
 *
 * CATATAN: pemblokiran halaman nonaktif (404) dilakukan di ROOT LAYOUT, bukan
 * di sini, supaya status HTTP tetap benar walau route ini memakai
 * loading.tsx (boundary) untuk tampilan skeleton.
 */
export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seo = await getSeoSettings().catch(() => null);
  const disabledPaths = seo
    ? Object.entries(seo.pages || {})
        .filter(([, meta]) => (meta as any)?.enabled === false)
        .map(([path]) => path)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <NavProgress />
      <Navbar initialDisabledPaths={disabledPaths} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WelcomePopup posterSrcs={resolvePromoPosters()} />
    </div>
  );
}
