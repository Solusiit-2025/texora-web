/**
 * Uji navigasi multi-bahasa: dari halaman berprefik bahasa (/en),
 * klik link navigasi harus MEMPERTAHANKAN prefix bahasa.
 *
 * Jalankan: node scripts/test-locale-nav.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

let pass = 0, fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

console.log("=== TEST NAVIGASI MEMPERTAHANKAN PREFIX BAHASA ===\n");

for (const [locale, expectLabel] of [
  ["en", "Fabric Catalog"],
  ["de", "Stoffkatalog"],
  ["ja", "ファブリックカタログ"],
]) {
  await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle", timeout: 60000 });
  // Tunggu hydration selesai (di mode dev compile pertama bisa lambat)
  await page.waitForTimeout(2500);

  const urlBefore = page.url();

  // Klik link nav pertama yang punya label katalog
  const link = page
    .locator('header nav a')
    .filter({ hasText: expectLabel })
    .first();

  const count = await link.count();
  if (count === 0) {
    check(`/${locale}: link "${expectLabel}" ditemukan`, false);
    continue;
  }

  const href = await link.getAttribute("href");
  check(
    `/${locale}: href link katalog memakai prefix`,
    !!href && href.includes(`/${locale}/`),
    `href=${href}`
  );

  await link.click();
  // Tunggu navigasi selesai (di mode dev compile RSC bisa beberapa detik).
  await page
    .waitForURL((u) => u.pathname.includes(`/${locale}/`), { timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(500);

  const urlAfter = page.url();
  check(
    `/${locale}: klik "${expectLabel}" -> tetap di prefix /${locale}`,
    urlAfter.includes(`/${locale}/`),
    `${urlBefore} -> ${urlAfter}`
  );
}

// Halaman privat (cart / login / portal) TIDAK boleh diberi prefix bahasa
await page.goto(`${BASE}/en`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);
const allHrefs = await page
  .locator("header a")
  .evaluateAll((els) => els.map((e) => e.getAttribute("href") || ""));
const badPrefixed = allHrefs.filter(
  (h) => /^\/en\/(cart|login|portal|customer|checkout|track-order|register)/.test(h)
);
check(
  "halaman privat tidak di-prefix bahasa",
  badPrefixed.length === 0,
  badPrefixed.join(", ") || "bersih"
);

const loginHref = allHrefs.find((h) => h === "/login" || h === "/en/login");
check(
  "tombol Login menuju /login (tanpa prefix)",
  loginHref === "/login",
  `href=${loginHref}`
);

await browser.close();
console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
