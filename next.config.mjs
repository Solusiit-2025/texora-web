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
  isProduction ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

const nextConfig = {
  reactStrictMode: true,
  distDir: resolveDistDir(),
  experimental: {
    // Mengaktifkan src/instrumentation.ts untuk scheduler backup database otomatis
    instrumentationHook: true,
    // pdfkit membaca file metrik font standar (data/Helvetica.afm) relatif
    // terhadap __dirname paket. Kalau di-bundle Next.js, path itu rusak
    // (ENOENT .next/server/vendor-chunks/data/Helvetica.afm).
    // Externalkan pdfkit agar tetap resolve dari node_modules.
    serverComponentsExternalPackages: ["pdfkit", "sharp"],
  },
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
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari
  },
  // Abaikan folder backup dari file watcher Next.js (dev).
  // Backup otomatis menulis file JSON ke ./backups setiap 24 jam; tanpa ini
  // dev server melakukan hot-reload dan state job terjemahan (in-memory)
  // ikut ter-reset => panel admin terlihat "idle" padahal job berjalan.
  webpack: (config) => {
    // `ignored` bisa berupa string ATAU array -> normalisasi dulu.
    const current = config.watchOptions?.ignored;
    const list = (Array.isArray(current) ? current : current ? [current] : [])
      .filter((entry) => typeof entry === "string" && entry.trim().length > 0);
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...list,
        "**/backups/**",
        "**/dev-server.log",
        "**/build-full.log",
      ],
    };
    return config;
  },
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
