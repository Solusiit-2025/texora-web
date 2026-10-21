const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const all = await p.contentTranslation.findMany();
  const byEntity = {};
  const byLocale = {};
  let broken = 0;
  for (const r of all) {
    byEntity[r.entity] = (byEntity[r.entity] || 0) + 1;
    byLocale[r.locale] = (byLocale[r.locale] || 0) + 1;
    if (r.translation === r.source && r.source.trim().length > 20) broken++;
  }
  console.log("=== total cache:", all.length, "| masih rusak:", broken, "===");
  console.log("per entity :", JSON.stringify(byEntity));
  console.log("per locale :", JSON.stringify(byLocale));

  // sample seoMeta en
  const meta = await p.contentTranslation.findMany({
    where: { entity: "seoMeta", locale: "en" },
    take: 4,
  });
  console.log("\n=== sample seoMeta [en] ===");
  meta.forEach((r) =>
    console.log(
      `  ${r.entityId}/${r.field}\n    ASLI: ${String(r.source).slice(0, 80)}\n    EN  : ${String(r.translation).slice(0, 80)}`
    )
  );

  // sample categorySeo de
  const cat = await p.contentTranslation.findMany({
    where: { entity: "categorySeo", locale: "de" },
    take: 3,
  });
  console.log("\n=== sample categorySeo [de] ===");
  cat.forEach((r) =>
    console.log(
      `  ${r.entityId}\n    ASLI: ${String(r.source).slice(0, 70)}\n    DE  : ${String(r.translation).slice(0, 70)}`
    )
  );

  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
