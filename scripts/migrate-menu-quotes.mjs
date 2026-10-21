/**
 * Migrasi ringan: tambahkan menu baru "crm.quotes" ke peta hak akses menu
 * yang sudah tersimpan di database untuk setiap role yang sudah punya
 * akses "crm.leads" (menu pipeline sales).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const KEY = "rbac.menu_access";
const NEW_ID = "crm.quotes";

(async () => {
  const row = await prisma.systemSetting.findUnique({ where: { key: KEY } });
  if (!row?.value) {
    console.log("Tidak ada record", KEY, "- tidak perlu migrasi.");
    await prisma.$disconnect();
    return;
  }

  const map = JSON.parse(row.value);
  let changed = false;

  for (const [role, ids] of Object.entries(map)) {
    if (!Array.isArray(ids)) continue;
    if (!ids.includes("crm.leads")) continue;
    if (ids.includes(NEW_ID)) continue;
    ids.push(NEW_ID);
    changed = true;
    console.log(`role ${role}: +${NEW_ID}`);
  }

  if (changed) {
    await prisma.systemSetting.update({
      where: { key: KEY },
      data: { value: JSON.stringify(map) },
    });
    console.log("Peta hak akses menu disimpan.");
  } else {
    console.log("Tidak ada perubahan.");
  }

  await prisma.$disconnect();
})();
