/**
 * Browser smoke test - mendeteksi error runtime client-side (hydration error,
 * removeChild, dll) di setiap halaman publik.
 * Jalankan: node scripts/browser-check.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const PAGES = [
  "/",
  "/catalog",
  "/catalog/dryfit-milano-premium",
  "/kategori",
  "/kategori/kain-sportswear",
  "/about",
  "/contact",
  "/custom-sublimation",
  "/login",
  "/register",
  "/track-order",
  "/request-quote",
  "/en/request-quote",
];

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

let totalErrors = 0;

for (const path of PAGES) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => {
    errors.push({ type: "pageerror", text: err.message, stack: err.stack });
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      // Abaikan noise yang tidak relevan: favicon, dan 401/403 resource
      // (cek auth saat pengunjung belum login memang diharapkan 401).
      if (/401|403|favicon|ERR_/i.test(t) && !/removeChild|Hydration|hydrat/i.test(t)) return;
      errors.push({ type: "console", text: t, stack: "" });
    }
  });

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    // Beri waktu untuk hydration & animasi
    await page.waitForTimeout(1500);
  } catch (e) {
    errors.push({ type: "navigation", text: e.message, stack: "" });
  }

  if (errors.length > 0) {
    totalErrors += errors.length;
    console.log(`\n=== ${path} : ${errors.length} error ===`);
    for (const e of errors.slice(0, 4)) {
      console.log(`  [${e.type}] ${e.text.slice(0, 300)}`);
      if (e.stack) {
        console.log(
          e.stack
            .split("\n")
            .slice(0, 6)
            .map((l) => `      ${l.trim()}`)
            .join("\n")
        );
      }
    }
  } else {
    console.log(`OK   ${path}`);
  }

  await context.close();
}

await browser.close();

console.log(`\n=== TOTAL ERROR: ${totalErrors} ===`);
process.exit(totalErrors > 0 ? 1 : 0);
