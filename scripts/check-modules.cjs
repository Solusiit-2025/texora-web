const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const r = await p.siteContent.findUnique({ where: { key: "seo.pages" } });
  const pages = r?.value ? JSON.parse(r.value) : {};
  for (const [k, v] of Object.entries(pages)) {
    console.log(`${k.padEnd(22)} enabled=${v.enabled}`);
  }
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
