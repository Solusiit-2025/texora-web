import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { getSeoSettings } from "@/lib/seo";

/**
 * Layout publik (storefront).
 *
 * Server component: daftar path modul yang dinonaktifkan DIAMBIL DARI DATABASE
 * di sini lalu diteruskan ke Navbar sebagai prop. Hasilnya:
 *  - Menu yang di-nonaktifkan TIDAK flash saat halaman pertama dimuat
 *    (HTML pertama sudah benar, tanpa perlu tunggu fetch client).
 *  - Link navigasi tetap ada di HTML hasil SSR -> crawlability internal link
 *    tidak hilang (penting untuk SEO).
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
      <Navbar initialDisabledPaths={disabledPaths} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
