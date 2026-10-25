import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rdm = (p as any)._runtimeDataModel;
  const um = rdm.models.User;
  const rf = um.fields.find((f: any) => f.name === "role");
  console.log("role field:", JSON.stringify(rf));
  console.log("kind?", rf.kind);
  console.log("enums:", Object.keys(rdm.enums));
  await p.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });