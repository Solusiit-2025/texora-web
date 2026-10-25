/**
 * PENTING: memisahkan folder build.
 *
 * Conflicts yang pernah terjadi:
 *  1. `next dev` + `next build` sama-sama menulis `.next` -> chunk 404,
 *     "Cannot find module for page: /_document", hydration error.
 *  2. Dua `next dev` di port berbeda -> saling menimpa artefak.
 *
 * Aturan sekarang:
 *  - `next build` (produksi)  -> ".next"
 *  - `next dev`   (dev)      -> ".next-dev" (+ suffix port bila bukan default)
 *
 * Jadi build & dev TIDAK PERNAH berebut folder, dan dua dev server di
 * port berbeda juga tidak saling merusak.
 *
 * CATATAN: deteksi build memakai NODE_ENV (bukan process.argv) karena
 * Next.js memuat next.config.mjs juga di worker proses, dan argv di
 * sana tidak berisi "build" -> dulu build menulis ke folder dev.
 */
function resolveDistDir() {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) return ".next";

  let port = process.env.PORT;
  const args = process.argv.slice(2);
  const pIdx = args.findIndex((a) => a === "-p" || a === "--port");
  if (pIdx >= 0 && args[pIdx + 1]) port = args[pIdx + 1];

  if (!port || port === "3000") return ".next-dev";
  return `.next-dev-${port}`;
}

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * Catatan:
 *  - `'unsafe-inline'` pada script diperlukan karena Next.js menyisipkan
 *    inline bootstrap/hydration script. Untuk hardening penuh, gunakan
 *    nonce via middleware (perubahan lebih besar).
 *  - `'unsafe-eval'` hanya di development (React Refresh).
 *  - Domain Google Tag Manager/Analytics diizinkan bila env diisi.
 *  - `upgrade-insecure-requests` hanya di produksi agar dev http tetap jalan.
 *    (Dihapus: memblokir aset saat akses via http://IP sebelum SSL siap.)
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https:${isProduction ? "" : " ws: wss:"}`,
  "frame-src 'self' https://www.googletagmanager.com https://maps.google.com https://www.google.com",
  "media-src 'self' https:",
  "worker-src 'self' blob:",
]
  .filter(Boolean)
  .join("; ");

const nextConfig = {
  reactStrictMode: true,
  distDir: resolveDistDir(),
  // Next 16 membuat AGENTS.md otomatis saat dev; matikan agar repo bersih.
  agentRules: false,
  // Jangan bocorkan versi framework di header X-Powered-By (keamanan, buang
  // 1 header di response).
  poweredByHeader: false,
  experimental: {
    // Catatan Next 15: `instrumentationHook` sudah stabil & otomatis aktif,
    // flag-nya dihapus dari config.
  },
  // Next 15: opsi ini pindah dari `experimental.serverComponentsExternalPackages`
  // ke top-level `serverExternalPackages`.
  serverExternalPackages: ["pdfkit", "sharp"],
  images: {
    // `remotePatterns` menggantikan `domains` (deprecated di Next 14) dan
    // memberi kontrol lebih ketat soal host yang boleh di-optimize.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.texora.co.id" },
      { protocol: "https", hostname: "texora.co.id" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
    // Next 16 mewajibkan daftar quality yang dipakai komponen <Image>.
    // Nilai 80 (hero) & 90 (galeri/artikel) dipakai di kode.
    qualities: [75, 80, 90],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari
  },
  // Next 16: Turbopack default. Konfigurasi `webpack` lama (watch-ignore
  // folder backups) dihapus — Turbopack hanya mem-watch modul yang diimpor,
  // jadi penulisan file backup di ./backups tidak memicu rebuild.
  // Header keamanan + SEO-friendly
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
