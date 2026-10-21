import type { Metadata } from "next";

/**
 * Layout untuk seluruh halaman autentikasi (login, register, forgot-password).
 *
 * Semua halaman di area ini TIDAK boleh di-index oleh Google (menghasilkan
 * thin/duplicate content &пута sinyal crawl budget pada halaman bisnis).
 * `robots: noindex, nofollow` memastikan halaman tetap bisa di akses user
 * tetapi tidak pernah muncul di hasil pencarian.
 */
export const metadata: Metadata = {
  title: {
    default: "Portal Mitra — PT. Texora Visi Prima",
    template: "%s — PT. Texora Visi Prima",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}
