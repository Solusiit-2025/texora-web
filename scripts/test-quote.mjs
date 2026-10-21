/**
 * Test end-to-end fitur "Minta Penawaran" (RFQ) + Katalog PDF.
 * Jalankan: node scripts/test-quote.mjs
 *
 * Prasyarat: dev server jalan di BASE_URL (default http://localhost:3000)
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

(async () => {
  console.log("=== TEST RFQ (Minta Penawaran) + KATALOG PDF ===\n");

  // ---------------------------------------------------------------
  // 1. Halaman RFQ
  // ---------------------------------------------------------------
  for (const [path, expect] of [
    ["/request-quote", "Minta Penawaran"],
    ["/en/request-quote", "Request a Quote"],
    ["/zh/request-quote", "询价申请"],
    ["/ja/request-quote", "見積依頼"],
    ["/de/request-quote", "Angebot anfragen"],
    ["/ar/request-quote", "اطلب عرض سعر"],
  ]) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const html = await res.text();
    check(
      `Halaman ${path}`,
      res.status === 200 && html.includes(expect),
      `status=${res.status} contains="${expect}"=${html.includes(expect)}`
    );
  }

  // ---------------------------------------------------------------
  // 2. Halaman katalog & beranda memuat CTA
  // ---------------------------------------------------------------
  for (const path of ["/", "/catalog", "/en/catalog"]) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const html = await res.text();
    check(
      `CTA RFQ di ${path}`,
      res.status === 200 && html.includes("/request-quote"),
      `status=${res.status}`
    );
  }

  // ---------------------------------------------------------------
  // 3. Katalog PDF
  // ---------------------------------------------------------------
  const pdfRes = await fetch(`${BASE}/api/catalog/pdf`, { redirect: "manual" });
  const buf = Buffer.from(await pdfRes.arrayBuffer());
  const isPdf = buf.slice(0, 4).toString("latin1") === "%PDF";
  check(
    "Unduh katalog PDF",
    pdfRes.status === 200 &&
      (pdfRes.headers.get("content-type") || "").includes("application/pdf") &&
      isPdf &&
      buf.length > 2000,
    `status=${pdfRes.status} type=${pdfRes.headers.get("content-type")} bytes=${buf.length} magic=${isPdf}`
  );
  const disp = pdfRes.headers.get("content-disposition") || "";
  check(
    "Header Content-Disposition PDF",
    disp.includes("attachment") && disp.includes(".pdf"),
    disp
  );

  // ---------------------------------------------------------------
  // 4. API RFQ
  // ---------------------------------------------------------------
  const invalid = await fetch(`${BASE}/api/quote-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ name: "A", email: "bukan-email" }),
  });
  check(
    "RFQ ditolak (validasi nama/email)",
    invalid.status === 400,
    `status=${invalid.status}`
  );

  const stamp = Date.now();
  const payload = {
    name: "Budi Test RFQ",
    company: "PT Uji Kain Nusantara",
    email: `rfq-test-${stamp}@texora.local`,
    phone: "+62 812-0000-0000",
    country: "Indonesia",
    meters: 750,
    productIds: ["dryfit-milano-sport-180"],
    productsText: "Dryfit Milano 180 GSM",
    needsSample: true,
    message: "Permintaan harga untuk 750 meter, warna navy.",
    locale: "id",
    source: "website",
  };
  const okRes = await fetch(`${BASE}/api/quote-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify(payload),
  });
  const okJson = await okRes.json().catch(() => ({}));
  check(
    "RFQ berhasil disimpan",
    okRes.status === 201 && okJson.success === true && !!okJson.data?.id,
    `status=${okRes.status} id=${okJson?.data?.id}`
  );

  // File referensi (data URL PNG 1x1)
  const png1x1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const fileRes = await fetch(`${BASE}/api/quote-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({
      name: "Siti File RFQ",
      email: `rfq-file-${stamp}@texora.local`,
      fileDataUrl: png1x1,
      fileName: "desain.png",
      locale: "en",
      source: "catalog",
    }),
  });
  const fileJson = await fileRes.json().catch(() => ({}));
  check(
    "RFQ dengan file referensi",
    fileRes.status === 201 && fileJson.success === true,
    `status=${fileRes.status}`
  );

  // Tipe file tidak didukung ditolak
  const badFile = await fetch(`${BASE}/api/quote-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({
      name: "Gagal File",
      email: `rfq-bad-${stamp}@texora.local`,
      fileDataUrl: "data:text/html;base64,PGh0bWw+PC9odG1sPg==",
    }),
  });
  check(
    "RFQ menolak tipe file berbahaya",
    badFile.status === 400,
    `status=${badFile.status}`
  );

  // ---------------------------------------------------------------
  // 5. Endpoint admin (butuh login)
  // ---------------------------------------------------------------
  const anon = await fetch(`${BASE}/api/quote-requests`, { redirect: "manual" });
  check("GET daftar RFQ tanpa login ditolak", anon.status === 401, `status=${anon.status}`);

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  saveCookies(loginRes);
  const loginJson = await loginRes.json().catch(() => ({}));
  check(
    "Login admin untuk cek daftar RFQ",
    loginRes.ok && loginJson.success !== false,
    `status=${loginRes.status}`
  );

  const listRes = await fetch(`${BASE}/api/quote-requests`, {
    redirect: "manual",
    headers: { Cookie: cookies },
  });
  const listJson = await listRes.json().catch(() => ({}));
  const list = Array.isArray(listJson?.data) ? listJson.data : [];
  check(
    "Daftar RFQ terbaca oleh admin",
    listRes.status === 200 && list.length >= 2,
    `status=${listRes.status} jumlah=${list.length}`
  );

  if (list.length > 0) {
    const target = list[0];
    const patchRes = await fetch(`${BASE}/api/quote-requests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: BASE, Cookie: cookies },
      body: JSON.stringify({ id: target.id, status: "CONTACTED", notes: "Dihubungi via WhatsApp." }),
    });
    check("Ubah status RFQ", patchRes.status === 200, `status=${patchRes.status}`);
  }

  // ---------------------------------------------------------------
  // 6. Halaman admin RFQ & menu portal
  // ---------------------------------------------------------------
  const adminPage = await fetch(`${BASE}/portal/crm/quotes`, {
    redirect: "manual",
    headers: { Cookie: cookies },
  });
  const adminHtml = await adminPage.status === 200 ? await adminPage.text() : "";
  check(
    "Halaman admin /portal/crm/quotes",
    adminPage.status === 200 && adminHtml.includes("Permintaan Penawaran"),
    `status=${adminPage.status}`
  );

  const menuRes = await fetch(`${BASE}/api/rbac/menu?scope=me`, {
    redirect: "manual",
    headers: { Cookie: cookies },
  });
  const menuJson = await menuRes.json().catch(() => ({}));
  const menuIds = menuJson?.data?.menuIds || [];
  check(
    "Menu portal memuat 'crm.quotes'",
    menuIds.includes("crm.quotes"),
    `menuIds=${menuIds.length}`
  );

  // ---------------------------------------------------------------
  // 7. Sitemap & llms.txt memuat halaman RFQ
  // ---------------------------------------------------------------
  const sitemap = await fetch(`${BASE}/sitemap.xml`, { redirect: "manual" });
  const sitemapXml = await sitemap.text();
  check(
    "Sitemap memuat /request-quote",
    sitemap.status === 200 && sitemapXml.includes("/request-quote"),
    `status=${sitemap.status}`
  );

  const llms = await fetch(`${BASE}/llms.txt`, { redirect: "manual" });
  const llmsText = await llms.text();
  check(
    "llms.txt memuat bagian RFQ",
    llms.status === 200 && llmsText.includes("Request a Quote"),
    `status=${llms.status}`
  );

  console.log(`\n=== HASIL: ${pass} PASS, ${fail} FAIL ===`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
