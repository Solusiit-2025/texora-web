/**
 * Toggle status aktif/nonaktif modul dari CLI (untuk testing/ops).
 * Contoh: node scripts/toggle-module.cjs /custom-sublimation true
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const KEY = "seo.pages";

(async () => {
  const path = process.argv[2];
  const enabled = process.argv[3] === "true";

  if (!path) {
    console.log("Usage: node scripts/toggle-module.cjs <path> <true|false>");
    await p.$disconnect();
    return;
  }

  const row = await p.siteContent.findUnique({ where: { key: KEY } });
  const pages = row?.value ? JSON.parse(row.value) : {};
  pages[path] = { ...(pages[path] || {}), enabled };

  await p.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, group: "seo", label: "SEO Per Halaman", value: JSON.stringify(pages) },
    update: { value: JSON.stringify(pages) },
  });

  console.log(`${path} -> enabled=${enabled}`);
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
