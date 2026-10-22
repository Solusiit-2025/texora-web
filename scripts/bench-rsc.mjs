/**
 * Benchmark kecepatan navigasi client-side (RSC payload) + halaman.
 *node scripts/bench-rsc.mjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";

async function time(url, headers = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers, redirect: "manual" });
    const ttfb = Date.now() - t0;
    const t1 = Date.now();
    const body = await res.text();
    return {
      status: res.status,
      ttfb,
      total: Date.now() - t1 + ttfb,
      size: (body.length / 1024).toFixed(0) + "KB",
    };
  } catch (e) {
    return { status: "ERR", ttfb: -1, total: -1, size: e.message.slice(0, 50) };
  }
}

const RSC_HEADERS = { RSC: "1", "Next-Router-Prefetch": "1" };

const PAGES = [
  ["/", "Homepage ID"],
  ["/en", "Homepage EN"],
  ["/en/artikel", "Artikel EN"],
  ["/en/artikel/kenapa-viscose-tidak-bisa-disublimasi", "Detail artikel EN"],
  ["/en/catalog", "Katalog EN"],
];

console.log(`=== ${BASE} ===\n`);
console.log("PAGES (SSR penuh)");
console.log("label".padEnd(24) + "status".padEnd(8) + "TTFB".padEnd(10) + "total".padEnd(10) + "size");
for (const [p, l] of PAGES) {
  const r = await time(BASE + p);
  console.log(
    l.padEnd(24) + String(r.status).padEnd(8) + `${r.ttfb}ms`.padEnd(10) + `${r.total}ms`.padEnd(10) + r.size
  );
}

console.log("\nRSC PAYLOAD (yang dipakai navigasi navbar Next.js <Link>)");
console.log("label".padEnd(24) + "status".padEnd(8) + "TTFB".padEnd(10) + "total".padEnd(10) + "size");
for (const [p, l] of PAGES) {
  const r = await time(BASE + p, RSC_HEADERS);
  console.log(
    l.padEnd(24) + String(r.status).padEnd(8) + `${r.ttfb}ms`.padEnd(10) + `${r.total}ms`.padEnd(10) + r.size
  );
}

console.log("\nPRELOAD (prefetch Next.js, dipanggil saat link masuk viewport)");
for (const [p, l] of PAGES) {
  const r = await time(BASE + p, {
    RSC: "1",
    "Next-Router-Prefetch": "1",
    Purpose: "prefetch",
    "Next-Url": p,
  });
  console.log(
    l.padEnd(24) + String(r.status).padEnd(8) + `${r.ttfb}ms`.padEnd(10) + `${r.total}ms`.padEnd(10) + r.size
  );
}

console.log("\nMIDDLEWARE/API INTERNAL");
for (const p of ["/api/seo/redirects?public=1", "/api/seo", "/api/social-links"]) {
  const r = await time(BASE + p);
  console.log(p.padEnd(32) + String(r.status).padEnd(8) + `${r.ttfb}ms`.padEnd(10) + `${r.total}ms`.padEnd(10) + r.size);
}
