/**
 * Regression test CMS: edit -> simpan -> hapus harus benar-benar bekerja.
 *
 * Bug yang pernah terjadi:
 *  1. RichTextEditor tidak menginisialisasi isi dari prop `value` saat mount
 *     -> form edit (artikel/FAQ/hero) selalu kosong, dan kalau disimpan
 *        isinya HILANG.
 *  2. Endpoint /api/cms & /api/products di-cache -> panel admin membaca
 *     respons basi, jadi hasil simpan/hapus tidak terlihat.
 *
 * Jalankan: node scripts/test-cms-edit.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL || "smoketest-admin@texora.local";
const PASSWORD = process.env.TEST_PASSWORD || "SmokeTest@2026!";
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
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

page.on("dialog", async (d) => {
  await d.accept();
});

async function login() {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

async function apiGet(path) {
  const res = await page.request.get(`${BASE}${path}`);
  return res.json();
}

console.log("=== TEST CMS: EDIT / SIMPAN / HAPUS ===\n");
await login();

/* ------------------------------------------------------------------ */
/* 1. FAQ: isi form edit harus terisi, simpan harus bertahan           */
/* ------------------------------------------------------------------ */
await page.goto(`${BASE}/portal/content-management?tab=faqs`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
// Tunggu tab bar CMS siap (produksi bisa lebih lambat dari lokal)
await page
  .waitForSelector('[role="tablist"]', { timeout: 30000 })
  .catch(() => {});
await page.waitForTimeout(1500);

// CATATAN: jangan pakai class*="pen" -> ikut cocok dengan icon "book-open".
const faqEditBtn = page.locator('main button:has(svg.lucide-square-pen)').first();
check("Tombol edit FAQ ada", (await faqEditBtn.count()) > 0);

if ((await faqEditBtn.count()) > 0) {
  await faqEditBtn.click();
  await page.waitForSelector('[contenteditable="true"]', { timeout: 30000 });

  const editor = page.locator('[contenteditable="true"]').last();
  const initialHtml = (await editor.innerHTML().catch(() => "")) || "";
  check(
    "Isi FAQ masuk ke form edit (tidak kosong)",
    initialHtml.replace(/<[^>]+>/g, "").trim().length > 10,
    `"${initialHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 50)}"`
  );

  // Ubah isi & simpan
  const marker = "Jawaban Uji Otomatis " + Date.now();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type(marker);

  const simpan = page.getByRole("button", { name: /simpan/i }).first();
  await simpan.click();
  await page.waitForTimeout(2500);

  const faqJson = await apiGet("/api/cms?fresh=1");
  const faqs = faqJson?.data?.faqs || [];
  const updated = faqs.find((f) =>
    String(f.answer || "").includes(marker)
  );
  check("Perubahan FAQ tersimpan & terbaca ulang", !!updated, marker);

  // Hapus FAQ uji (kartu yang berisi marker)
  const faqCountBefore = (await apiGet("/api/cms?fresh=1"))?.data?.faqs?.length ?? 0;
  const card = page
    .locator("main .glass-panel")
    .filter({ hasText: marker })
    .first();
  const trash = card.locator('button:has(svg.lucide-trash2)').first();
  check("Tombol hapus di kartu FAQ ditemukan", (await trash.count()) > 0);
  await trash.click();
  await page.waitForTimeout(2500);
  const faqCountAfter = (await apiGet("/api/cms?fresh=1"))?.data?.faqs?.length ?? 0;
  check(
    "Hapus FAQ: jumlah FAQ di DB berkurang",
    faqCountAfter < faqCountBefore,
    `${faqCountBefore} -> ${faqCountAfter}`
  );
}

/* ------------------------------------------------------------------ */
/* 2. Artikel: isi body harus masuk ke form edit                         */
/* ------------------------------------------------------------------ */
await page.goto(`${BASE}/portal/content-management?tab=artikel`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page
  .waitForSelector('[role="tablist"]', { timeout: 30000 })
  .catch(() => {});
await page.waitForTimeout(2000);

const artEditBtn = page.locator('main button[title="Edit artikel"]').first();
check("Tombol edit artikel ada", (await artEditBtn.count()) > 0);

if ((await artEditBtn.count()) > 0) {
  await artEditBtn.click();
  await page.waitForSelector('[contenteditable="true"]', { timeout: 30000 });

  const editor = page.locator('[contenteditable="true"]').last();
  const bodyHtml = (await editor.innerHTML().catch(() => "")) || "";
  const plain = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  check(
    "Isi artikel (body) masuk ke form edit",
    plain.length > 100,
    `${plain.length} karakter: "${plain.slice(0, 50)}"`
  );

  // Cek juga field judul terisi
  const titleInput = page.locator('input[type="text"]').first();
  const titleVal = (await titleInput.inputValue().catch(() => "")) || "";
  check("Judul artikel terisi di form", titleVal.length > 5, titleVal.slice(0, 50));
}

await browser.close();
console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
