/**
 * Benchmark navigasi navbar sungguhan (client-side routing Next.js).
 * node scripts/bench-navigation.mjs [baseUrl]
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const requests = [];
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("_rsc=") || u.includes("/api/")) {
    requests.push({ url: u.replace(BASE, ""), start: Date.now() });
  }
});
page.on("requestfinished", (r) => {
  const u = r.url();
  const hit = requests.find((x) => x.url === u.replace(BASE, "") && !x.end);
  if (hit) hit.end = Date.now();
});
page.on("requestfailed", (r) => {
  const u = r.url();
  const hit = requests.find((x) => x.url === u.replace(BASE, "") && !x.end);
  if (hit) {
    hit.end = Date.now();
    hit.failed = true;
  }
});

console.log(`=== NAVIGASI NAVBAR: ${BASE} ===\n`);

// 1. Initial load
const t0 = Date.now();
await page.goto(`${BASE}/en`, { waitUntil: "networkidle", timeout: 90000 });
const loadMs = Date.now() - t0;
console.log(`Initial load /en            : ${loadMs}ms`);

// 2. Klik link navbar satu per satu, ukur waktu sampai konten halaman baru tampil
const TARGETS = [
  ["Fabric Catalog", "Katalog EN"],
  ["Articles", "Artikel EN"],
  ["Request a Quote", "Minta Penawaran"],
  ["Home", "Homepage EN"],
];

for (const [label, name] of TARGETS) {
  const link = page.locator("header nav a").filter({ hasText: label }).first();
  if ((await link.count()) === 0) {
    console.log(`${name.padEnd(22)} : link "${label}" tidak ditemukan`);
    continue;
  }

  requests.length = 0;
  const t = Date.now();
  await link.click();

  // Tunggu konten utama berubah (heading H1 baru)
  let appeared = 0;
  try {
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("main h1");
        return h1 && h1.textContent && h1.textContent.trim().length > 3;
      },
      { timeout: 20000 }
    );
    appeared = Date.now() - t;
  } catch {
    appeared = -1;
  }

  const rsc = requests.filter((r) => r.url.includes("_rsc="));
  const apis = requests.filter((r) => r.url.includes("/api/"));
  const rscMs = rsc.length
    ? Math.max(...rsc.map((r) => (r.end ? r.end - r.start : 0)))
    : 0;
  const apiMs = apis.length
    ? Math.max(...apis.map((r) => (r.end ? r.end - r.start : 0)))
    : 0;

  console.log(
    `${name.padEnd(22)} : ${appeared}ms  (RSC ${rscMs}ms, API ${apiMs}ms, ${rsc.length} RSC + ${apis.length} API)`
  );
  if (process.env.VERBOSE) {
    for (const r of rsc) {
      console.log(
        `      RSC ${String(r.end ? r.end - r.start : -1).padStart(5)}ms  ${r.url.slice(0, 110)}`
      );
    }
    for (const r of apis) {
      console.log(
        `      API ${String(r.end ? r.end - r.start : -1).padStart(5)}ms  ${r.url.slice(0, 110)}`
      );
    }
  }
  await page.waitForTimeout(600);
}

await browser.close();
