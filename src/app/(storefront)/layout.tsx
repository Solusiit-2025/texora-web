import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { NavProgress } from "@/components/common/NavProgress";
import { WelcomePopup } from "@/components/storefront/WelcomePopup";
import { getSeoSettings } from "@/lib/seo";
import { PROMO_POSTERS, PROMO_POSTER_VERSION } from "@/config/promo";

/**
 * Daftar poster popup diambil dari konfigurasi statis (src/config/promo.ts),
 * bukan scan filesystem — agar tetap bekerja di serverless (Vercel/Netlify)
 * yang tidak menyertakan folder `public` di runtime function.
 */
function resolvePromoPosters(): Array<{ src: string; alt: string }> {
  return PROMO_POSTERS.map((poster) => ({
    ...poster,
    src: `${poster.src}?v=${PROMO_POSTER_VERSION}`,
  }));
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
      <WelcomePopup posters={resolvePromoPosters()} />
    </div>
  );
}
