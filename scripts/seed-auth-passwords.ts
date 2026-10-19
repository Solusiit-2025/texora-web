import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔒 Securing and Seeding User Passwords for JWT & RBAC...\n");

  const usersToUpdate = [
    {
      email: "admin@texora.co.id",
      password: "Admin@Texora2026!",
      name: "Pricilia Kishin Hassanannd",
      role: "ADMINISTRATOR",
    },
    {
      email: "rian.sales@texora.co.id",
      password: "Sales@Texora2026!",
      name: "Rian Pratama",
      role: "SALES_REP",
    },
    {
      email: "bambang.wh@texora.co.id",
      password: "Gudang@Texora2026!",
      name: "Bambang Santoso",
      role: "WAREHOUSE_STAFF",
    },
    {
      email: "hendra@garmentkreatif.com",
      password: "Customer@Texora2026!",
      name: "Hendra Wijaya",
      role: "CUSTOMER",
    },
    {
      email: "sarah@alatasscarves.com",
      password: "Customer@Texora2026!",
      name: "Sarah Alatas",
      role: "CUSTOMER",
    },
  ];

  for (const u of usersToUpdate) {
    const passwordHash = await bcrypt.hash(u.password, 12);

    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        role: u.role as any,
        passwordHash,
      },
      update: {
        passwordHash,
        role: u.role as any,
      },
    });

    console.log(`✅ User ${u.email} (${u.role}): password set to "${u.password}"`);
  }

  // Also ensure any remaining users without password get a default hashed password
  const unhashedUsers = await prisma.user.findMany({
    where: { passwordHash: null },
  });

  if (unhashedUsers.length > 0) {
    const defaultHash = await bcrypt.hash("Texora2026!", 12);
    for (const u of unhashedUsers) {
      await prisma.user.update({
        where: { id: u.id },
        data: { passwordHash: defaultHash },
      });
      console.log(`  + Set default password "Texora2026!" for ${u.email}`);
    }
  }

  console.log("\n🎉 All users secured in PostgreSQL with bcrypt password hashes!");
}

main()
  .catch((e) => {
    console.error("❌ Error setting passwords:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
