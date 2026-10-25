import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rdm = (p as any)._runtimeDataModel;
  const um = rdm.models.User;
  console.log(JSON.stringify(um.fields.find((f: any) => f.name === "role"), null, 2));
  console.log("User dbName:", um.dbName);
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });