/**
 * Benchmark: TTFB + total load untuk halaman utama & API.
 * Jalankan: node scripts/bench-performance.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

async function measure(label, path, { warm = false } = {}) {
  if (!warm) await new Promise((r) => setTimeout(r, 50));
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: "manual",
      headers: { "Cache-Control": "no-cache" },
    });
    const ttfb = Date.now() - t0;
    const t1 = Date.now();
    const html = await res.text();
    const total = Date.now() - t1 + ttfb;
    return {
      label,
      path,
      status: res.status,
      ttfb,
      total,
      size: (html.length / 1024).toFixed(0) + "KB",
    };
  } catch (e) {
    return { label, path, status: "ERR", ttfb: -1, total: -1, size: e.message.slice(0, 40) };
  }
}

const PAGES = [
  ["/", "Homepage"],
  ["/catalog", "Katalog"],
  ["/artikel", "Daftar Artikel"],
  ["/artikel/kenapa-viscose-tidak-bisa-disublimasi", "Detail Artikel"],
  ["/kategori/kain-sportswear", "Landing Kategori"],
  ["/about", "About"],
  ["/request-quote", "Minta Penawaran"],
  ["/en", "Homepage EN"],
  ["/en/artikel", "Artikel EN"],
];

const APIS = [
  ["/api/seo", "SEO settings"],
  ["/api/social-links", "Social links"],
  ["/api/products", "Products"],
  ["/api/cms", "CMS content"],
  ["/api/catalog/pdf", "PDF katalog"],
  ["/api/i18n/translations", "Translations (auth)"],
];

(async () => {
  console.log("=== WARM-UP (compile/bundle) ===");
  for (const [p] of [...PAGES, ...APIS]) await measure("warm", p);

  console.log("\n=== HALAMAN (cold cache) ===");
  console.log(
    "label".padEnd(22) + "status".padEnd(8) + "TTFB".padEnd(10) + "total".padEnd(10) + "size"
  );
  const pageResults = [];
  for (const [p, l] of PAGES) {
    const r = await measure(l, p);
    pageResults.push(r);
    console.log(
      r.label.padEnd(22) +
        String(r.status).padEnd(8) +
        `${r.ttfb}ms`.padEnd(10) +
        `${r.total}ms`.padEnd(10) +
        r.size
    );
  }

  console.log("\n=== HALAMAN (warm cache, 2x rerun) ===");
  for (const [p, l] of PAGES) {
    const r = await measure(l, p, { warm: true });
    console.log(
      r.label.padEnd(22) +
        String(r.status).padEnd(8) +
        `${r.ttfb}ms`.padEnd(10) +
        `${r.total}ms`.padEnd(10) +
        r.size
    );
  }

  console.log("\n=== API ===");
  for (const [p, l] of APIS) {
    const r = await measure(l, p);
    console.log(
      r.label.padEnd(22) +
        String(r.status).padEnd(8) +
        `${r.ttfb}ms`.padEnd(10) +
        `${r.total}ms`.padEnd(10) +
        r.size
    );
  }
})();
