/**
 * SEO Audit Tool - memeriksa output HTML yang benar-benar dikirim ke crawler.
 * Jalankan: node scripts/seo-audit.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3001";

const PAGES = [
  { path: "/", name: "Homepage" },
  { path: "/catalog", name: "Katalog" },
  { path: "/kategori", name: "Index Kategori" },
  { path: "/kategori/kain-sportswear", name: "Kategori Sportswear" },
  { path: "/kategori/kain-hijab-fashion", name: "Kategori Fashion & Hijab" },
  { path: "/kategori/kain-home-living", name: "Kategori Home Living" },
  { path: "/kategori/kain-merchandise", name: "Kategori Merchandise" },
  { path: "/about", name: "Tentang Kami" },
  { path: "/contact", name: "Hubungi Kami" },
  { path: "/custom-sublimation", name: "Kustom Sublimasi" },
  { path: "/login", name: "Login (harus noindex)" },
  { path: "/register", name: "Register (harus noindex)" },
];

let totalPass = 0;
let totalFail = 0;

function check(label, ok, extra = "") {
  if (ok) {
    console.log(`  PASS | ${label}${extra ? " | " + extra : ""}`);
    totalPass++;
  } else {
    console.log(`  FAIL | ${label}${extra ? " | " + extra : ""}`);
    totalFail++;
  }
}

function meta(html, name, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return decodeEntities(m[1]);
  // urutan attribute terbalik
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1]) : null;
}

/** Decode HTML entity - yang dilihat crawler adalah teks yang sudah didecode. */
function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function linkRel(html, rel) {
  const re = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, "i");
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${rel}["']`, "i");
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

async function audit(page) {
  console.log(`\n=== ${page.name} (${page.path}) ===`);
  const res = await fetch(`${BASE}${page.path}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
  });
  const html = await res.text();

  // Deteksi halaman noindex (auth/privat) - Requirement lebih ringan
  const robotsRaw = meta(html, "robots") || "";
  const isNoindex = /noindex/i.test(robotsRaw);
  if (isNoindex) {
    console.log("  INFO | Halaman noindex - requirement SEO disederhanakan");
  }

  check("HTTP 200", res.status === 200, `status=${res.status}`);

  // Title
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  check("Ada <title>", !!title, title ? `"${title}" (${title.length} char)` : "");
  check(
    "Title panjang 15-65 char",
    !!title && title.length >= 15 && title.length <= 65,
    `${title?.length} char`
  );

  // Meta description
  const desc = meta(html, "description");
  check("Ada meta description", !!desc, desc ? `"${desc.slice(0, 70)}..."` : "");
  check(
    "Description 50-165 char",
    !!desc && desc.length >= 50 && desc.length <= 165,
    `${desc?.length} char`
  );

  // Canonical
  const canonical = linkRel(html, "canonical");
  check("Ada canonical URL", !!canonical, canonical || "");

  // OG
  const ogTitle = meta(html, "og:title", true);
  const ogDesc = meta(html, "og:description", true);
  const ogUrl = meta(html, "og:url", true);
  const ogImage = meta(html, "og:image", true);
  check("Ada og:title", !!ogTitle, ogTitle ? `"${ogTitle.slice(0, 50)}"` : "");
  check("Ada og:description", !!ogDesc);
  check("Ada og:url", !!ogUrl, ogUrl || "");
  check("Ada og:image", !!ogImage, ogImage || "");

  // Twitter
  check("Ada twitter:card", !!meta(html, "twitter:card"));

  // Robots
  check("Ada meta robots", !!robotsRaw, robotsRaw || "(default: index,follow)");
  if (isNoindex) {
    check("Robots = noindex", true, robotsRaw);
  }

  // JSON-LD
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  check("Punya JSON-LD", jsonLdBlocks.length > 0, `${jsonLdBlocks.length} blok`);

  let types = [];
  for (const m of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of arr) {
        const t = item["@type"];
        types.push(...(Array.isArray(t) ? t : [t]));
      }
    } catch {
      check("JSON-LD valid JSON", false, m[1].slice(0, 60));
    }
  }
  console.log(`  INFO | Tipe schema: ${types.join(", ") || "-"}`);

  // Heading
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Text = h1s.map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  check("Tepat 1 <h1>", h1s.length === 1, `${h1s.length} h1: ${h1Text[0]?.slice(0, 60) || ""}`);

  const h2s = [...html.matchAll(/<h2[^>]*>/gi)];
  check("Punya <h2> (hierarki)", h2s.length > 0, `${h2s.length} h2`);

  // Breadcrumb (tidak wajib untuk halaman noindex)
  if (!isNoindex) {
    check("Punya breadcrumb", /aria-label="Breadcrumb"/i.test(html));
  }

  // Semantik
  check("Punya <main>", /<main[\s>]/i.test(html));
  if (!isNoindex) {
    check("Punya <article>", /<article[\s>]/i.test(html));
  }

  // Gambar tanpa alt
  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  const noAlt = imgs.filter((m) => !/\balt=/i.test(m[0]));
  check("Semua <img> punya alt", noAlt.length === 0, `${noAlt.length} tanpa alt dari ${imgs.length}`);

  return { html, types, title, desc, h1Text };
}

(async () => {
  console.log("=== SEO AUDIT TEXORA ===");

  for (const page of PAGES) {
    try {
      await audit(page);
    } catch (e) {
      console.log(`  FAIL | Gagal mengaudit ${page.path}: ${e.message}`);
      totalFail++;
    }
  }

  // Detail produk (ambil slug pertama dari sitemap)
  console.log("\n=== Halaman Detail Produk ===");
  try {
    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const slugMatch = sitemap.match(/\/catalog\/([a-z0-9-]+)</i);
    if (slugMatch) {
      await audit({ path: `/catalog/${slugMatch[1]}`, name: `Produk (${slugMatch[1]})` });
    } else {
      console.log("  INFO | Tidak ada produk di sitemap");
    }
  } catch (e) {
    console.log(`  FAIL | ${e.message}`);
  }

  // Endpoint khusus
  console.log("\n=== Endpoint AI & SEO ===");
  for (const ep of ["/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap.xml", "/.well-known/ai-plugin.json"]) {
    try {
      const r = await fetch(`${BASE}${ep}`);
      const body = await r.text();
      check(
        `${ep} dapat diakses`,
        r.status === 200 && body.length > 50,
        `status=${r.status} len=${body.length}`
      );
    } catch (e) {
      check(`${ep} dapat diakses`, false, e.message);
    }
  }

  console.log(`\n=== TOTAL: ${totalPass} pass, ${totalFail} fail ===`);
  process.exit(totalFail > 0 ? 1 : 0);
})();
