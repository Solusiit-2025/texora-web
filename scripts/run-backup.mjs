/**
 * Jalankan backup database manual dari CLI (tanpa perlu login ke portal).
 *
 * Contoh:
 *   node scripts/run-backup.mjs
 *
 * Berguna untuk dijadwalkan dengan Windows Task Scheduler / cron Linux
 * sebagai lapisan kedua di samping scheduler in-process.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const TABLES = {
  user: "users",
  systemSetting: "system_settings",
  siteContent: "cms_site_content",
  heroSlide: "cms_hero_slides",
  testimonial: "cms_testimonials",
  faqItem: "cms_faq_items",
  fabricProduct: "fabric_products",
  fabricVariant: "fabric_variants",
  priceTier: "price_tiers",
  order: "orders",
  orderItem: "order_items",
  customDesign: "custom_designs",
  lead: "leads",
  activityLog: "activity_logs",
  inventoryRoll: "inventory_rolls",
  socialComment: "social_comments",
  whatsAppConversation: "whatsapp_conversations",
  whatsAppMessage: "whatsapp_messages",
  auditLog: "audit_logs",
  backupLog: "backup_logs",
};

const BACKUP_DIR = path.join(process.cwd(), "backups");

(async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const data = {};
    let recordCount = 0;
    const exported = [];

    for (const [key, table] of Object.entries(TABLES)) {
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
        data[key] = rows;
        recordCount += rows.length;
        exported.push(key);
      } catch (err) {
        console.warn(`[backup] Tabel ${table} dilewati: ${err.message}`);
        data[key] = [];
      }
    }

    const filename = `texora-backup-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const payload = {
      meta: {
        app: "PT. Texora Visi Prima - E-Commerce & CRM",
        version: "1.0",
        generatedAt: new Date().toISOString(),
        trigger: "SCHEDULED",
        generatedBy: "cli-script",
        totalRecords: recordCount,
        tables: exported,
      },
      data,
    };

    fs.writeFileSync(
      filepath,
      JSON.stringify(
        payload,
        (_k, v) => (typeof v === "bigint" ? v.toString() : v),
        2
      ),
      "utf-8"
    );

    const sizeBytes = fs.statSync(filepath).size;

    await prisma.backupLog.create({
      data: {
        filename,
        sizeBytes: BigInt(sizeBytes),
        tables: JSON.stringify(exported),
        recordCount,
        status: "SUCCESS",
        trigger: "SCHEDULED",
        message: `Backup CLI berhasil: ${exported.length} tabel, ${recordCount} record.`,
      },
    });

    console.log(`[backup] Berhasil: ${filename} (${recordCount} record, ${sizeBytes} bytes)`);
  } catch (err) {
    console.error("[backup] Gagal:", err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
