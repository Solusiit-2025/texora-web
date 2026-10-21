/**
 * Set tipe schema untuk halaman tertentu (mis. / -> faq).
 * Jalankan: node scripts/set-schema.cjs / faq
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const KEY = "seo.pages";
const VALID = ["article", "faq", "product", "organization", "none"];

(async () => {
  const path = process.argv[2];
  const schemaType = process.argv[3];

  if (!path || !VALID.includes(schemaType)) {
    console.log(`Usage: node scripts/set-schema.cjs <path> <${VALID.join("|")}>`);
    await p.$disconnect();
    return;
  }

  const row = await p.siteContent.findUnique({ where: { key: KEY } });
  const pages = row?.value ? JSON.parse(row.value) : {};
  pages[path] = { ...(pages[path] || {}), schemaType };

  await p.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, group: "seo", label: "SEO Per Halaman", value: JSON.stringify(pages) },
    update: { value: JSON.stringify(pages) },
  });

  console.log(`${path} -> schemaType=${schemaType}`);
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
