import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  console.log("users:", await p.user.count());
  await p.$disconnect();
}
main().catch((e) => { console.error(e.message); process.exit(1); });