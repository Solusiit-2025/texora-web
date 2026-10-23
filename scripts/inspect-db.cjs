// Audit sekali-jalan: ukuran tabel & daftar index di DB produksi.
// Jalankan: node scripts/inspect-db.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Ukuran & jumlah baris per tabel
  const rows = await prisma.$queryRawUnsafe(`
    SELECT relname AS table,
           n_live_tup AS rows,
           pg_total_relation_size(relid) AS total_bytes,
           pg_relation_size(relid) AS data_bytes,
           pg_total_relation_size(relid) - pg_relation_size(relid) AS index_bytes
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC;
  `);
  console.log("=== TABLE SIZES ===");
  for (const r of rows) {
    console.log(
      `${r.table.padEnd(24)} rows=${String(r.rows).padStart(7)}  data=${(Number(r.data_bytes) / 1024).toFixed(0).padStart(6)} KB  index=${(Number(r.index_bytes) / 1024).toFixed(0).padStart(6)} KB`
    );
  }

  // 2. Semua index index btree/saja dinamai
  const idx = await prisma.$queryRawUnsafe(`
    SELECT n.nspname AS schema, t.relname AS tbl, c.relname AS name,
           pg_get_indexdef(c.oid) AS def
    FROM pg_index ix
    JOIN pg_class c ON c.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.relname, c.relname;
  `);
  console.log("\n=== INDEXES ===");
  for (const r of idx) {
    console.log(`[${r.tbl}] ${r.name}`);
    console.log(`    ${r.def}`);
  }

  // 3. tabel yang paling sering di-scan berat (seq scan vs index scan)
  const stats = await prisma.$queryRawUnsafe(`
    SELECT relname AS table,
           seq_scan,
           seq_tup_read,
           idx_scan
    FROM pg_stat_user_tables
    WHERE n_live_tup > 100
    ORDER BY seq_scan DESC;
  `);
  console.log("\n=== SEQ SCAN vs IDX SCAN (tabel >100 baris) ===");
  for (const r of stats) {
    console.log(`${r.table.padEnd(24)} seq_scan=${String(r.seq_scan).padStart(6)}  seq_rows=${String(r.seq_tup_read).padStart(8)}  idx_scan=${String(r.idx_scan).padStart(7)}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
