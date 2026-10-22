import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { NavProgress } from "@/components/common/NavProgress";
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
 *
 * TAMBAHAN: halaman yang dinonaktifkan juga DIBLOKIR di server (notFound() ->
 * status 404). Sebelumnya hanya link menunya yang disembunyikan, sehingga
 * halaman masih bisa dibuka lewat URL langsung & isinya masih ter-index
 * mesin pencari.
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

  // Path aktif (tanpa prefix bahasa) dari middleware
  const pathname = headers().get("x-pathname") || "/";

  // Halaman dinonaktifkan -> 404 beneran, konten tidak pernah dirender
  if (disabledPaths.includes(pathname)) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavProgress />
      <Navbar initialDisabledPaths={disabledPaths} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
