/**
 * Membuat user ADMINISTRATOR sementara untuk smoke test, lalu bisa dihapus
 * dengan `node scripts/test-user.cjs remove`.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

const EMAIL = "smoketest-admin@texora.local";
const PASSWORD = "SmokeTest@2026!";

(async () => {
  const action = process.argv[2] || "create";

  if (action === "remove") {
    await p.user.deleteMany({ where: { email: EMAIL } });
    console.log("Test user dihapus:", EMAIL);
    await p.$disconnect();
    return;
  }

  const hash = await bcrypt.hash(PASSWORD, 12);
  const user = await p.user.upsert({
    where: { email: EMAIL },
    create: {
      name: "Smoke Test Admin",
      email: EMAIL,
      passwordHash: hash,
      role: "ADMINISTRATOR",
    },
    update: { passwordHash: hash, role: "ADMINISTRATOR" },
  });
  console.log(`Test user siap: ${user.email} / ${PASSWORD}`);
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
