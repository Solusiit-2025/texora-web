import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { NavProgress } from "@/components/common/NavProgress";
import { WelcomePopup } from "@/components/storefront/WelcomePopup";
import { getSeoSettings } from "@/lib/seo";
import { getStorefrontPopup } from "@/lib/popup-data";

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
  const [seo, popup] = await Promise.all([
    getSeoSettings().catch(() => null),
    getStorefrontPopup().catch(() => null),
  ]);

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
      {popup && (
        <WelcomePopup
          posters={popup.banners.map((banner) => ({
            src: banner.imageUrl,
            alt: banner.alt || banner.title,
            title: banner.title,
            href: banner.linkUrl,
            ctaLabel: banner.ctaLabel,
          }))}
          enabled={popup.settings.enabled}
          delaySeconds={popup.settings.delaySeconds}
          frequencyDays={popup.settings.frequencyDays}
          showOnMobile={popup.settings.showOnMobile}
          storageKey={popup.storageKey}
        />
      )}
    </div>
  );
}
