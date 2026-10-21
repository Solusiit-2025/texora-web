/**
 * Uji end-to-end i18n: verifikasi switcher bahasa benar-benar mengganti UI,
 * persisten (cookie/localStorage), RTL aktif untuk Arabic, dan TIDAK merusak
 * markup yang di-crawl (default Indonesia tetap server-rendered).
 * Jalankan: node scripts/test-i18n.mjs
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

const ctx = await browser.newContext();
const page = await ctx.newPage();

// 1. Default Indonesia (SSR) - konten crawlable tidak berubah
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
const html = await page.content();
check("Default render Indonesia (hero t1a)", html.includes("Warna yang menyatu"));
check("Nav default 'Beranda'", html.includes("Beranda"));
const langDefault = await page.evaluate(() => document.documentElement.lang);
check("html lang default 'id'", langDefault === "id", `lang=${langDefault}`);

// 2. Klik switcher -> English
const switcherBtn = page.locator('button[aria-label*="Choose language"], button[aria-label*="Pilih bahasa"]').first();
await switcherBtn.waitFor({ state: "visible", timeout: 15000 });
await switcherBtn.click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "English" }).first().click();
// Tunggu navbar benar-benar ikut berganti bahasa (dev API kadang lambat)
try {
  await page.waitForFunction(
    () => /Home\s*\|/.test(document.body.innerText) || document.body.innerText.includes("Home"),
    null,
    { timeout: 10000 }
  );
} catch {}
const enHtml = await page.content();
check("Hero berubah ke English", enHtml.includes("Color that fuses"));
check("Nav berubah ke 'Home'", enHtml.includes("Home"));
const langEn = await page.evaluate(() => document.documentElement.lang);
check("html lang = en", langEn === "en", `lang=${langEn}`);
const cookie = await ctx.cookies();
check("Cookie texora-locale tersimpan", cookie.some((c) => c.value === "en" && c.name === "texora-locale"));

// 3. Persistensi: reload -> tetap English
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
const persisted = await page.content();
check("Persisten setelah reload (English)", persisted.includes("Color that fuses"));

// 4. Arabic + RTL
await page.locator('button[aria-label*="Choose language"], button[aria-label*="Pilih bahasa"]').first().click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "العربية" }).first().click();
await page.waitForTimeout(900);
const arHtml = await page.content();
check("Hero berubah ke Arabic", arHtml.includes("ألوان تندمج"));
const dirAr = await page.evaluate(() => document.documentElement.dir);
check("RTL aktif (dir=rtl)", dirAr === "rtl", `dir=${dirAr}`);
const langAr = await page.evaluate(() => document.documentElement.lang);
check("html lang = ar", langAr === "ar", `lang=${langAr}`);

// 5. Kembali Indonesia -> LTR pulih
await page.locator('button[aria-label*="Choose language"], button[aria-label*="Pilih bahasa"]').first().click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Bahasa Indonesia" }).first().click();
await page.waitForTimeout(900);
const dirBack = await page.evaluate(() => document.documentElement.dir);
check("Kembali ke id -> dir=ltr", dirBack === "ltr", `dir=${dirBack}`);

// 6. Katalog juga ikut (label filter)
await page.goto(`${BASE}/catalog`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
const catHtml = await page.content();
check("Katalog default Indonesia (judul)", catHtml.includes("Katalog Kain Industri"));

await ctx.close();

// 7. Locale lain via cookie langsung (zh/ja/de) - tanpa klik
for (const [locale, probe] of [["zh", "色彩融入"], ["ja", "色は繊維に"], ["de", "Farbe, die verschmilzt"]]) {
  const c2 = await browser.newContext({ extraHTTPHeaders: {} });
  await c2.addCookies([{ name: "texora-locale", value: locale, url: BASE }]);
  const p2 = await c2.newPage();
  await p2.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await p2.waitForTimeout(2200);
  const h = await p2.content();
  check(`Locale ${locale} merender UI terjemahan`, h.includes(probe));
  await c2.close();
}

await browser.close();
console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
process.exit(fail > 0 ? 1 : 0);
