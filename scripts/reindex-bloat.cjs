// Reindex sekali-jalan untuk tabel yang terbukti bloat, lalu re-measure.
// Jalankan: node scripts/reindex-bloat.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const targets = [
  "cms_hero_slides_pkey",
  "fabric_products_pkey",
  "fabric_products_slug_key",
  "cms_articles_pkey",
  "cms_articles_slug_key",
  "content_translations_pkey",
  "content_translations_entity_locale_idx",
  "audit_logs_pkey",
  "social_comments_pkey",
];

async function main() {
  for (const name of targets) {
    try {
      await prisma.$executeRawUnsafe(`REINDEX INDEX public."${name}"`);
    } catch (e) {
      console.log(`SKIP ${name}: ${e.message.split("\n")[0]}`);
    }
  }

  const rows = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS index,
           pg_relation_size(c.oid) AS bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'I'
      AND (c.relname LIKE 'cms_%' OR c.relname LIKE 'fabric_%')
    ORDER BY pg_relation_size(c.oid) DESC
    LIMIT 10;
  `);
  console.log("=== UKURAN INDEX SETELAH REINDEX ===");
  for (const r of rows) {
    console.log(`${r.index.padEnd(48)} ${(Number(r.bytes) / 1024).toFixed(0)} KB`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
