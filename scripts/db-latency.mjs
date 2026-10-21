import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  console.log("=== Latensi query DB (10x) ===");
  const times = [];
  for (let i = 0; i < 10; i++) {
    const t0 = Date.now();
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      const ms = Date.now() - t0;
      times.push(ms);
      console.log(`  #${i + 1}: ${ms}ms`);
    } catch (e) {
      const ms = Date.now() - t0;
      times.push(ms);
      console.log(`  #${i + 1}: ${ms}ms  ERROR ${String(e.message).slice(0, 60)}`);
    }
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(`\nrata-rata: ${avg}ms | max: ${Math.max(...times)}ms`);

  // Query berat yang dipakai tiap halaman
  console.log("\n=== Query berat (3x masing-masing) ===");
  for (const [label, fn] of [
    ["fabricProduct.findMany(+variants,+tiers)", () => prisma.fabricProduct.findMany({ include: { variants: true, priceTiers: true } })],
    ["siteContent.findMany", () => prisma.siteContent.findMany()],
    ["systemSetting.findMany", () => prisma.systemSetting.findMany()],
    ["article.findMany", () => prisma.article.findMany({ where: { isPublished: true } })],
  ]) {
    const t0 = Date.now();
    try {
      await fn();
      console.log(`  ${label.padEnd(38)} ${Date.now() - t0}ms`);
    } catch (e) {
      console.log(`  ${label.padEnd(38)} ${Date.now() - t0}ms ERROR`);
    }
  }

  // Info koneksi
  const info = await prisma.$queryRawUnsafe(
    "SELECT current_setting('server_version') as v, inet_server_addr()::text as host"
  );
  console.log("\nDB:", JSON.stringify(info));

  await prisma.$disconnect();
})();
