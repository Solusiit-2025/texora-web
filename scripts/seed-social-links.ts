import { PrismaClient } from "@prisma/client";
import { DEFAULT_SOCIAL_LINKS, SOCIAL_LINKS_KEY } from "../src/config/social";

const prisma = new PrismaClient();

async function main() {
  const value = JSON.stringify(DEFAULT_SOCIAL_LINKS);
  await prisma.siteContent.upsert({
    where: { key: SOCIAL_LINKS_KEY },
    create: { key: SOCIAL_LINKS_KEY, group: "social", label: "Tautan Media Sosial", value },
    update: { value, group: "social", label: "Tautan Media Sosial" },
  });
  const row = await prisma.siteContent.findUnique({ where: { key: SOCIAL_LINKS_KEY } });
  console.log("OK social.links:", row?.value?.slice(0, 300));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
