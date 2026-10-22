/**
 * Regression test: ganti bahasa dari dropdown harus LANGSUNG mengubah
 * halaman (tanpa reload manual).
 *
 * Bug yang pernah terjadi:
 *  - untuk target tanpa prefix bahasa ("/artikel" utk Bahasa Indonesia),
 *    router cache Next.js memakai payload lama -> halaman tidak berubah
 *    sampai di-reload.
 *
 * Jalankan: node scripts/test-locale-switch.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

let pass = 0,
  fail = 0;
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

const h1 = async () =>
  ((await page.locator("main h1").first().textContent().catch(() => "")) || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 55);

async function switchLang(label) {
  const before = await h1();
  await page.locator('button[aria-label*="Pilih bahasa"]').first().click();
  await page.waitForTimeout(300);
  // Label Indonesia bisa "Bahasa Indonesia" atau "Indonesia".
  const target = label === "Bahasa Indonesia"
    ? page.getByRole("button", { name: /^(Bahasa )?Indonesia$/ })
    : page.getByRole("button", { name: label, exact: true });
  await target.first().click();
  await page.waitForTimeout(2500);
  const after = await h1();
  check(
    `ganti ke ${label}: konten langsung berubah`,
    before !== after && after.length > 3,
    `"${before}" -> "${after}"`
  );
}

console.log("=== TEST GANTI BAHASA (LANGSUNG BERUBAH) ===\n");

// 1. Dari halaman berbahasa prefix -> Bahasa Indonesia (kasus yang pernah bug)
await page.goto(`${BASE}/en/artikel`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1000);
await switchLang("Bahasa Indonesia");
check(
  "URL jadi /artikel tanpa param sisa",
  page.url().replace(BASE, "") === "/artikel",
  page.url().replace(BASE, "")
);

// 2. Prefix -> prefix lain
await page.goto(`${BASE}/en/artikel`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1000);
await switchLang("Deutsch");
check(
  "URL jadi /de/artikel",
  page.url().replace(BASE, "") === "/de/artikel",
  page.url().replace(BASE, "")
);

// 3. Halaman detail artikel
await page.goto(`${BASE}/de/artikel/kenapa-viscose-tidak-bisa-disublimasi`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1000);
await switchLang("日本語");
check(
  "URL prefix ikut berubah di halaman detail",
  page.url().replace(BASE, "").startsWith("/ja/artikel/"),
  page.url().replace(BASE, "")
);

// 4. Kasus tepi: cookie bahasa lain, lalu pilih Bahasa Indonesia
await ctx.addCookies([
  { name: "texora-locale", value: "zh", url: BASE },
]);
await page.goto(`${BASE}/artikel`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1000);
await switchLang("Bahasa Indonesia");

await browser.close();
console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
