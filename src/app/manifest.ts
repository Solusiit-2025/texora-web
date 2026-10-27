import { MetadataRoute } from "next";

/**
 * Web App Manifest.
 * Membantu Google memahami situs sebagai aplikasi web (PWA installable) dan
 * menampilkan logo sebagai Search Result untuk brand "XoraMateria".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XoraMateria — Katalog Kain Sublimasi",
    short_name: "XoraMateria",
    description:
      "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain siap sublimasi dengan harga grosir bertingkat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "id-ID",
    dir: "ltr",
    categories: ["business", "shopping", "productivity"],
    icons: [
      {
        src: "/icons/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Katalog Kain",
        short_name: "Katalog",
        description: "Jelajahi katalog kain siap sublimasi",
        url: "/catalog",
      },
      {
        name: "Minta Penawaran",
        short_name: "Penawaran",
        description: "Konsultasi pengadaan kain B2B",
        url: "/contact",
      },
      {
        name: "Studio Kustom",
        short_name: "Custom",
        description: "Unggah desain & simulasi sublimasi",
        url: "/custom-sublimation",
      },
    ],
  };
}
