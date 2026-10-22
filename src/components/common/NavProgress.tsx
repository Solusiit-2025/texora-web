"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Progress bar tipis di atas halaman saat navigasi client-side berjalan.
 *
 * Kenapa bukan `loading.tsx`?
 *  - `loading.tsx` membuat Next.js mulai streaming respons SEBELUM halaman
 *    selesai dirender. Akibatnya `notFound()` tidak bisa lagi mengubah
 *    status HTTP jadi 404 (jadi "soft 404" = rusak untuk SEO).
 *  - Bar progres ini murni client-side, jadi status HTTP tetap benar
 *    (404 untuk artikel yang tidak ada).
 *
 * Sifat:
 *  - Muncul saat pengguna klik link internal.
 *  - Hilang otomatis saat pathname berubah (atau setelah 6 detik).
 */
export function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute("href") || "";
      // Hanya link internal (bukan #anchor, bukan file, bukan new tab)
      if (
        !href.startsWith("/") ||
        href.startsWith("//") ||
        target.target === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }
      // Jangan tampilkan kalau klik menuju halaman yang sama
      if (href === pathname) return;

      setVisible(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Jaring pengaman: hide maksimal 6 detik
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 right-0 z-[2000] h-0.5 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full w-1/3 animate-[navprogress_1s_ease-in-out_infinite] bg-gradient-to-r from-brand-500 via-accent-cyan to-brand-400" />
      <style jsx global>{`
        @keyframes navprogress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
