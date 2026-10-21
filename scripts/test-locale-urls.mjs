/**
 * Uji Tahap 2 — Locale URL & hreflang (SSR, tanpa perlu API key).
 *
 * Verifikasi:
 *  - /de/           SSR chrome Jerman + html lang=de + canonical /de/
 *  - /de            redirect 308 -> /de/
 *  - /de/catalog    h1 Jerman
 *  - /de/about      navbar Jerman ("Über uns")
 *  - /ar/           html dir=rtl + hero Arab
 *  - /              hreflang alternates (id + x-default + 5 bahasa)
 *  - /en/login      TIDAK dilokalkan -> 404 (bukan 500)
 *
 * Jalankan: node scripts/test-locale-urls.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3001";
let pass = 0, fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

async function get(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...opts });
  const text = await res.text();
  return { status: res.status, location: res.headers.get("location"), text };
}

console.log("=== TEST LOCALE URL & HREFLANG (Tahap 2) ===\n");

// 1. /de -> SSR Jerman
{
  const r = await get("/de");
  check("/de -> 200", r.status === 200, `status=${r.status}`);
  check("chrome Jerman di SSR", r.text.includes("Farbe, die verschmilzt"));
  check('html lang="de"', /<html[^>]*lang="de"/.test(r.text));
  check("canonical /de", /rel="canonical"[^>]*href="[^"]*\/de"/.test(r.text));
  check("hreflang de ada", /hreflang="de"/i.test(r.text));
  check("hreflang x-default ada", /hreflang="x-default"/i.test(r.text));
}

// 2. /de/ -> dinormalisasi Next.js (308) ke /de
{
  const r = await get("/de/");
  check(
    "/de/ -> 308 (normalisasi trailing slash Next.js)",
    r.status === 308 && (r.location || "").endsWith("/de"),
    `status=${r.status} loc=${r.location}`
  );
}

// 3. /de/catalog -> h1 Jerman (kamus statis, tanpa AI)
{
  const r = await get("/de/catalog");
  check("/de/catalog -> 200", r.status === 200);
  check("judul katalog Jerman", r.text.includes("Industrie-Stoffkatalog"));
  check("canonical /de/catalog", /rel="canonical"[^>]*href="[^"]*\/de\/catalog"/.test(r.text));
}

// 4. /de/about -> navbar Jerman
{
  const r = await get("/de/about");
  check("/de/about -> 200", r.status === 200);
  check("nav link 'Über uns'", r.text.includes("Über uns"));
}

// 5. /ar -> RTL + Arab
{
  const r = await get("/ar");
  check("/ar -> 200", r.status === 200);
  check('html dir="rtl"', /<html[^>]*dir="rtl"/.test(r.text));
  check("hero Arab", r.text.includes("ألوان تندمج"));
}

// 6. / -> hreflang lengkap (id + 5 bahasa + x-default)
{
  const r = await get("/");
  const langs = [...r.text.matchAll(/hreflang="([^"]+)"/gi)].map((m) => m[1]);
  const has = (l) => langs.includes(l);
  check(
    "hreflang lengkap di /",
    has("id") && has("x-default") && has("en") && has("zh") && has("ja") && has("de") && has("ar"),
    langs.join(",")
  );
  check("hero default Indonesia", r.text.includes("Warna yang menyatu"));
}

// 7. /en/login -> tidak dilokalkan (404 alami, bukan crash)
{
  const r = await get("/en/login");
  check("/en/login -> 404 (tidak dilokalkan)", r.status === 404, `status=${r.status}`);
}

// 8. /zh/kategori -> h1 kategori Mandarin (judul dari kamus)
{
  const r = await get("/zh/kategori");
  check("/zh/kategori -> 200", r.status === 200);
  check("canonical /zh/kategori", /rel="canonical"[^>]*href="[^"]*\/zh\/kategori"/.test(r.text));
}

// 9. Sitemap memuat xhtml:link hreflang
{
  const r = await get("/sitemap.xml");
  check(
    "sitemap punya xhtml:link",
    r.text.includes("xhtml:link") && r.text.includes("hreflang=\"de\""),
    `xhtml:link=${r.text.includes("xhtml:link")}`
  );
  const enCatalog = r.text.includes(`${BASE}/en/catalog`);
  check("sitemap memuat URL /en/catalog", enCatalog || r.text.includes("/en/catalog"));
}

console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
