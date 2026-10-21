"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { SeoSettings } from "@/lib/seo";
import { cachedClientFetch } from "@/lib/client-api";

function setMeta(attr: string, key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SeoHead({ initial }: { initial?: SeoSettings | null }) {
  const pathname = usePathname();

  useEffect(() => {
    // Dedupe: SeoHead + PageGate + Navbar memakai endpoint yang sama ->
    // hanya 1 request yang benar-benar terjadi.
    cachedClientFetch<{ data?: SeoSettings }>("/api/seo")
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        applySeo(pathname, data);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (initial) applySeo(pathname, initial);
  }, [initial, pathname]);

  return null;
}

function applySeo(pathname: string, data: SeoSettings) {
  const page = data.pages[pathname] ?? data.pages["/"] ?? data.global;

  // Halaman yang dinonaktifkan di CMS tidak boleh di-index dan tidak boleh
  // memakai meta deskripsi halaman yang sudah dimatikan.
  const isDisabled = (data.pages[pathname] as any)?.enabled === false;

  const title = isDisabled
    ? "Halaman Tidak Tersedia"
    : page.title || data.global.title;
  const description = isDisabled
    ? "Halaman ini sedang dinonaktifkan sementara."
    : page.description || data.global.description;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", page.schemaType === "article" ? "article" : "website");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:card", "summary_large_image");

  // Cegah index untuk halaman nonaktif
  if (isDisabled) {
    setMeta("name", "robots", "noindex, nofollow");
  } else {
    const robots = document.head.querySelector('meta[name="robots"]');
    if (robots) robots.remove();
  }
}
