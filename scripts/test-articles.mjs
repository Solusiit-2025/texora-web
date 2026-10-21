/**
 * Test fitur Artikel / Pusat Panduan Tekstil.
 * Jalankan: node scripts/test-articles.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL || "smoketest-admin@texora.local";
const PASSWORD = process.env.TEST_PASSWORD || "SmokeTest@2026!";

let cookies = "";
function saveCookies(res) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const pair = c.split(";")[0];
    const name = pair.split("=")[0];
    cookies = [
      ...cookies.split("; ").filter((x) => x && !x.startsWith(`${name}=`)),
      pair,
    ].join("; ");
  }
}

let pass = 0,
  fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

const SLUGS = [
  "panduan-memilih-kain-sublimasi-sportwear",
  "dryfit-jersey-pique-membedakan",
  "setting-heat-press-sublimasi-210-derajat",
  "sublimasi-vs-printing-plastisol",
  "voal-ultrafine-atau-ceruty-hijab",
  "kenapa-viscose-tidak-bisa-disublimasi",
  "merawat-cetak-sublimasi-tahan-cuci",
  "canvas-vs-oxford-600d",
  "banner-flag-menggunakan-polyester",
  "harga-bertingkat-moq-hitung-biaya-kain",
  "studi-kasus-3000-meter-dryfit-turnamen",
  "proofing-digital-vs-sample-fisik-warna",
  "oeko-tex-standard-100-class-1",
];

(async () => {
  console.log("=== TEST ARTIKEL / PUSAT PANDUAN TEKSTIL ===\n");

  // ---------------------------------------------------------------
  // 1. Halaman daftar artikel (6 bahasa)
  // ---------------------------------------------------------------
  for (const [path, expect] of [
    ["/artikel", "Pusat Panduan Tekstil"],
    ["/en/artikel", "Technical Knowledge Hub"],
    ["/zh/artikel", "纺织知识中心"],
    ["/ja/artikel", "テキスタイル知識ハブ"],
    ["/de/artikel", "Technischer Wissenshub"],
    ["/ar/artikel", "مركز معرفة النسيج"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const html = await res.text();
    check(
      `Halaman daftar ${path}`,
      res.status === 200 && html.includes(expect),
      `status=${res.status}`
    );
  }

  // ---------------------------------------------------------------
  // 2. Semua artikel dapat dibuka + punya SEO
  // ---------------------------------------------------------------
  for (const slug of SLUGS) {
    const res = await fetch(`${BASE}/artikel/${slug}`, { redirect: "manual" });
    const html = await res.text();
    const ok =
      res.status === 200 &&
      html.includes("application/ld+json") &&
      html.includes("/request-quote");
    check(`Detail artikel /artikel/${slug}`, ok, `status=${res.status}`);
  }

  // ---------------------------------------------------------------
  // 3. Artikel 404 untuk slug ngawur
  // ---------------------------------------------------------------
  const nf = await fetch(`${BASE}/artikel/artikel-tidak-ada-xyz`, {
    redirect: "manual",
  });
  check("Slug artikel ngawur -> 404", nf.status === 404, `status=${nf.status}`);

  // ---------------------------------------------------------------
  // 4. Prefix bahasa pada link artikel (dari halaman /en/artikel)
  // ---------------------------------------------------------------
  const enList = await fetch(`${BASE}/en/artikel`, { redirect: "manual" });
  const enHtml = await enList.text();
  check(
    "Link artikel di /en/artikel memakai prefix /en",
    enHtml.includes("/en/artikel/"),
    "href=/en/artikel/..."
  );

  const deList = await fetch(`${BASE}/de/artikel`, { redirect: "manual" });
  const deHtml = await deList.text();
  check(
    "Link artikel di /de/artikel memakai prefix /de",
    deHtml.includes("/de/artikel/"),
    "href=/de/artikel/..."
  );

  // ---------------------------------------------------------------
  // 5. API artikel
  // ---------------------------------------------------------------
  const apiRes = await fetch(`${BASE}/api/articles`, { redirect: "manual" });
  const apiJson = await apiRes.json().catch(() => ({}));
  const apiData = Array.isArray(apiJson?.data) ? apiJson.data : [];
  check(
    "GET /api/articles (publik) mengembalikan daftar publish",
    apiRes.status === 200 && apiData.length >= 13,
    `status=${apiRes.status} jumlah=${apiData.length}`
  );

  const adminAnon = await fetch(`${BASE}/api/articles?admin=1`, {
    redirect: "manual",
  });
  check("GET /api/articles?admin=1 tanpa login ditolak", adminAnon.status === 401, `status=${adminAnon.status}`);

  // ---------------------------------------------------------------
  // 6. Login admin + cek daftar artikel & buat artikel baru
  // ---------------------------------------------------------------
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  saveCookies(loginRes);
  check("Login admin", loginRes.status === 200, `status=${loginRes.status}`);

  const adminList = await fetch(`${BASE}/api/articles?admin=1`, {
    redirect: "manual",
    headers: { Cookie: cookies },
  });
  const adminJson = await adminList.json().catch(() => ({}));
  const adminData = Array.isArray(adminJson?.data) ? adminJson.data : [];
  check(
    "GET /api/articles?admin=1 sebagai admin",
    adminList.status === 200 && adminData.length >= 13,
    `status=${adminList.status} jumlah=${adminData.length}`
  );

  // Buat artikel uji (draft)
  const stamp = Date.now();
  const createRes = await fetch(`${BASE}/api/cms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE, Cookie: cookies },
    body: JSON.stringify({
      type: "article",
      data: {
        title: "Artikel Uji Otomatis " + stamp,
        slug: "artikel-uji-" + stamp,
        excerpt: "Ringkasan artikel uji.",
        body: "<h2>Bagian Uji</h2><p>Isi artikel uji untuk verifikasi.</p>",
        category: "proses",
        articleType: "tips",
        tags: ["uji"],
        relatedProducts: [],
        author: "Tim Uji",
        isPublished: false,
      },
    }),
  });
  const createJson = await createRes.json().catch(() => ({}));
  const newId = createJson?.data?.id;
  check(
    "Buat artikel baru via CMS API",
    createRes.status === 201 && createJson.success === true && !!newId,
    `status=${createRes.status} id=${newId}`
  );

  // Slug duplikat ditolak saat update
  if (newId) {
    const clash = await fetch(`${BASE}/api/cms`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: BASE, Cookie: cookies },
      body: JSON.stringify({
        type: "article",
        id: newId,
        data: {
          title: "Artikel Uji Duplikat",
          slug: SLUGS[0],
          body: "<p>duplikat</p>",
          category: "proses",
          articleType: "tips",
          isPublished: false,
        },
      }),
    });
    check("Update artikel dengan slug bentrok ditolak", clash.status === 409, `status=${clash.status}`);
  }

  // Hapus artikel uji
  if (newId) {
    const delRes = await fetch(`${BASE}/api/cms?type=article&id=${newId}`, {
      method: "DELETE",
      headers: { Origin: BASE, Cookie: cookies },
    });
    const delJson = await delRes.json().catch(() => ({}));
    check("Hapus artikel uji", delRes.status === 200 && delJson.success === true, `status=${delRes.status}`);
  }

  // ---------------------------------------------------------------
  // 7. Halaman admin CMS (tab artikel)
  // ---------------------------------------------------------------
  const cmsPage = await fetch(`${BASE}/portal/content-management?tab=artikel`, {
    redirect: "manual",
    headers: { Cookie: cookies },
  });
  const cmsHtml = cmsPage.status === 200 ? await cmsPage.text() : "";
  check(
    "Tab artikel di CMS terbuka",
    cmsPage.status === 200,
    `status=${cmsPage.status}`
  );
  check(
    "Halaman CMS punya tab bar (Navigasi mudah)",
    cmsHtml.includes('role="tablist"') && cmsHtml.includes("Artikel"),
    "tab bar ter-render di HTML awal"
  );

  // ---------------------------------------------------------------
  // 8. Sitemap & llms.txt
  // ---------------------------------------------------------------
  const sitemap = await fetch(`${BASE}/sitemap.xml`, { redirect: "manual" });
  const sitemapXml = await sitemap.text();
  check(
    "Sitemap memuat /artikel + detail artikel",
    sitemap.status === 200 &&
      sitemapXml.includes("/artikel") &&
      sitemapXml.includes(`/artikel/${SLUGS[0]}`),
    `status=${sitemap.status}`
  );

  const llms = await fetch(`${BASE}/llms.txt`, { redirect: "manual" });
  const llmsText = await llms.text();
  check(
    "llms.txt memuat daftar artikel",
    llms.status === 200 && llmsText.includes("Articles & Technical Guides"),
    `status=${llms.status}`
  );

  // ---------------------------------------------------------------
  // 9. Navbar & footer punya link artikel
  // ---------------------------------------------------------------
  const home = await fetch(`${BASE}/`, { redirect: "manual" });
  const homeHtml = await home.text();
  check(
    "Homepage memuat link /artikel",
    home.status === 200 && homeHtml.includes("/artikel"),
    `status=${home.status}`
  );

  console.log(`\n=== HASIL: ${pass} PASS, ${fail} FAIL ===`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
