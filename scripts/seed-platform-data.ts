import { PrismaClient } from "@prisma/client";
import {
  MOCK_USERS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_LEADS,
  MOCK_INVENTORY,
} from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding Complete Platform Data into PostgreSQL Database...\n");

  // 1. Seed Users (Staff & Customers)
  console.log("📦 Seeding Users (Staff & Admin)...");
  for (const u of MOCK_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        companyName: u.companyName,
        phoneNumber: u.phoneNumber,
        taxId: u.taxId,
      },
      update: {
        name: u.name,
        role: u.role as any,
        companyName: u.companyName,
        phoneNumber: u.phoneNumber,
        taxId: u.taxId,
      },
    });
    console.log(`  + User: ${u.name} (${u.role})`);
  }

  console.log("\n📦 Seeding B2B Customers...");
  for (const c of MOCK_CUSTOMERS) {
    await prisma.user.upsert({
      where: { email: c.email },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        role: "CUSTOMER",
        companyName: c.company,
        phoneNumber: c.phone,
        taxId: c.taxId !== "-" ? c.taxId : null,
      },
      update: {
        name: c.name,
        companyName: c.company,
        phoneNumber: c.phone,
        taxId: c.taxId !== "-" ? c.taxId : null,
      },
    });
    console.log(`  + Customer: ${c.name} (${c.company})`);
  }

  // 2. Seed Leads & Activities
  console.log("\n📦 Seeding CRM Leads & Activity Logs...");
  const salesRep = await prisma.user.findFirst({ where: { role: "SALES_REP" } });

  for (const l of MOCK_LEADS) {
    const existingLead = await prisma.lead.findUnique({ where: { id: l.id } });
    const leadData = {
      title: l.title,
      companyName: l.companyName,
      contactPerson: l.contactPerson,
      email: l.email,
      phone: l.phone,
      estimatedValue: l.estimatedValue,
      estimatedMeters: l.estimatedMeters,
      fabricInterest: l.fabricInterest,
      stage: l.stage as any,
      assignedSalesId: salesRep?.id || null,
      updatedAt: new Date(),
    };

    let leadRecord;
    if (!existingLead) {
      leadRecord = await prisma.lead.create({
        data: {
          id: l.id,
          ...leadData,
        },
      });
      console.log(`  + Lead: ${l.companyName} (${l.stage})`);
    } else {
      leadRecord = await prisma.lead.update({
        where: { id: l.id },
        data: leadData,
      });
      console.log(`  * Updated Lead: ${l.companyName}`);
    }

    // Seed activities
    if (l.activities && l.activities.length > 0 && salesRep) {
      for (const act of l.activities) {
        const existingAct = await prisma.activityLog.findUnique({ where: { id: act.id } });
        if (!existingAct) {
          await prisma.activityLog.create({
            data: {
              id: act.id,
              leadId: leadRecord.id,
              userId: salesRep.id,
              type: act.type as any,
              description: act.description,
              createdAt: new Date(),
            },
          });
        }
      }
    }
  }

  // 3. Seed Orders & Items
  console.log("\n📦 Seeding Orders & Order Items...");
  for (const o of MOCK_ORDERS) {
    // Find customer or fallback to first customer
    let customer = await prisma.user.findFirst({
      where: {
        OR: [{ email: o.customerEmail }, { name: o.customerName }],
      },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: o.customerName,
          email: o.customerEmail || `customer-${Date.now()}@texora.test`,
          role: "CUSTOMER",
          companyName: o.customerCompany,
          phoneNumber: o.customerPhone,
        },
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: o.orderNumber },
    });

    if (!existingOrder) {
      await prisma.order.create({
        data: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: customer.id,
          totalAmount: o.totalAmount,
          taxAmount: o.taxAmount || 0,
          shippingAmount: o.shippingAmount || 0,
          status: o.status as any,
          paymentStatus: o.paymentStatus as any,
          paymentMethod: o.paymentMethod,
          trackingNumber: o.trackingNumber,
          notes: o.notes,
          createdAt: new Date(o.createdAt || Date.now()),
          items: {
            create: o.items.map((it) => ({
              id: it.id,
              fabricName: it.fabricName,
              gsm: it.gsm,
              lengthMeters: it.lengthMeters,
              unitPrice: it.unitPrice,
              subtotal: it.subtotal,
              customDesignTitle: it.customDesignTitle,
            })),
          },
        },
      });
      console.log(`  + Order: ${o.orderNumber} (${o.status} - Rp ${o.totalAmount.toLocaleString()})`);
    } else {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          totalAmount: o.totalAmount,
          status: o.status as any,
          paymentStatus: o.paymentStatus as any,
          trackingNumber: o.trackingNumber,
          notes: o.notes,
        },
      });
      console.log(`  * Updated Order: ${o.orderNumber}`);
    }
  }

  // 4. Seed Inventory Rolls
  console.log("\n📦 Seeding Warehouse Inventory Rolls...");
  for (const inv of MOCK_INVENTORY) {
    const existing = await prisma.inventoryRoll.findUnique({
      where: { rollBarcode: inv.rollBarcode },
    });

    if (!existing) {
      await prisma.inventoryRoll.create({
        data: {
          id: inv.id,
          rollBarcode: inv.rollBarcode,
          fabricName: inv.fabricName,
          gsm: inv.gsm,
          initialMeters: inv.initialMeters,
          currentMeters: inv.currentMeters,
          warehouseLocation: inv.warehouseLocation,
          batchLot: inv.batchLot,
          receivedDate: new Date(inv.receivedDate || Date.now()),
        },
      });
      console.log(`  + Roll: ${inv.rollBarcode} (${inv.fabricName})`);
    } else {
      await prisma.inventoryRoll.update({
        where: { id: existing.id },
        data: {
          fabricName: inv.fabricName,
          gsm: inv.gsm,
          currentMeters: inv.currentMeters,
          warehouseLocation: inv.warehouseLocation,
          batchLot: inv.batchLot,
        },
      });
      console.log(`  * Updated Roll: ${inv.rollBarcode}`);
    }
  }

  console.log("\n✅ All platform data successfully seeded into PostgreSQL database!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
