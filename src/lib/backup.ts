/**
 * Modul Backup Database untuk XoraMateria.
 *
 * Mendukung 2 mode:
 *  1. LOGICAL  - ekspor seluruh tabel ke file JSON (portable, bisa di-restore via script).
 *  2. CUSTOM  - pg_dump binary bila tersedia di server (opsional).
 *
 * Semua proses tercatat di tabel `backup_logs` sebagai audit trail.
 */

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const BACKUP_DIR = path.join(process.cwd(), "backups");

/** Daftar tabel yang dibackup (urutan dependensi logis). */
export const BACKUP_TABLES = [
  "user",
  "systemSetting",
  "siteContent",
  "heroSlide",
  "testimonial",
  "faqItem",
  "fabricProduct",
  "fabricVariant",
  "priceTier",
  "order",
  "orderItem",
  "customDesign",
  "lead",
  "activityLog",
  "inventoryRoll",
  "socialComment",
  "whatsAppConversation",
  "whatsAppMessage",
  "auditLog",
  "backupLog",
] as const;

export type BackupTrigger = "MANUAL" | "SCHEDULED";

export interface BackupResult {
  success: boolean;
  filename: string;
  sizeBytes: number;
  recordCount: number;
  tables: string[];
  message: string;
}

/** Pastikan direktori backup ada. */
export function ensureBackupDir(): string {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  return BACKUP_DIR;
}

/**
 * Ambil seluruh data dari satu tabel via Prisma raw query.
 * Mengembalikan array of plain objects.
 */
async function dumpTable(table: string): Promise<any[]> {
  // Nama tabel fisik di PostgreSQL (mengikuti @@map di schema.prisma)
  const physical: Record<string, string> = {
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

  const name = physical[table] || table;
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "${name}"`
  );
  return rows as any[];
}

/**
 * Buat backup JSON dari seluruh tabel.
 */
export async function createBackup(options?: {
  trigger?: BackupTrigger;
  createdBy?: string | null;
}): Promise<BackupResult> {
  const trigger = options?.trigger || "MANUAL";
  const createdBy = options?.createdBy || null;
  const dir = ensureBackupDir();
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const filename = `xoramateria-backup-${timestamp}.json`;
  const filepath = path.join(dir, filename);

  const data: Record<string, any[]> = {};
  let recordCount = 0;
  const exported: string[] = [];

  try {
    for (const table of BACKUP_TABLES) {
      try {
        const rows = await dumpTable(table);
        data[table] = rows;
        recordCount += rows.length;
        exported.push(table);
      } catch (err: any) {
        // Lewati tabel yang gagal (mis. belum ada di DB) - jangan gagalkan seluruh backup
        console.warn(`[backup] Tabel ${table} dilewati: ${err?.message}`);
        data[table] = [];
      }
    }

    const payload = {
      meta: {
        app: "XoraMateria - E-Commerce & CRM",
        version: "1.0",
        generatedAt: new Date().toISOString(),
        trigger,
        generatedBy: createdBy,
        totalRecords: recordCount,
        tables: exported,
      },
      data,
    };

    // JSON.stringify gagal pada nilai BigInt (mis. fileSizeBytes, sizeBytes).
    // Gunakan replacer agar BigInt diubah menjadi string secara aman.
    const json = JSON.stringify(
      payload,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
    fs.writeFileSync(filepath, json, "utf-8");

    const sizeBytes = fs.statSync(filepath).size;

    // Audit trail
    try {
      await prisma.backupLog.create({
        data: {
          filename,
          sizeBytes: BigInt(sizeBytes),
          tables: JSON.stringify(exported),
          recordCount,
          status: "SUCCESS",
          trigger,
          message: `Backup berhasil: ${exported.length} tabel, ${recordCount} record.`,
          createdBy,
        },
      });
    } catch (err) {
      console.warn("[backup] Gagal menulis audit log:", err);
    }

    return {
      success: true,
      filename,
      sizeBytes,
      recordCount,
      tables: exported,
      message: `Backup berhasil dibuat: ${filename}`,
    };
  } catch (error: any) {
    const message = error?.message || "Terjadi kesalahan saat membuat backup.";

    try {
      await prisma.backupLog.create({
        data: {
          filename,
          sizeBytes: BigInt(0),
          tables: "[]",
          recordCount: 0,
          status: "FAILED",
          trigger,
          message,
          createdBy,
        },
      });
    } catch {}

    return {
      success: false,
      filename,
      sizeBytes: 0,
      recordCount: 0,
      tables: [],
      message,
    };
  }
}

/** Daftar file backup yang tersedia di disk. */
export function listBackupFiles(): Array<{
  filename: string;
  sizeBytes: number;
  createdAt: Date;
}> {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json"));

  return files
    .map((filename) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, filename));
      return {
        filename,
        sizeBytes: stat.size,
        createdAt: stat.mtime,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Hapus file backup lama sesuai kebijakan retensi.
 * @param keep jumlah backup terbaru yang dipertahankan
 */
export async function pruneOldBackups(keep = 7): Promise<number> {
  const files = listBackupFiles();
  const excess = files.slice(keep);

  for (const f of excess) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, f.filename));
    } catch (err) {
      console.warn(`[backup] Gagal hapus ${f.filename}:`, err);
    }
  }

  return excess.length;
}

/**
 * Auto-prune: jalankan setelah backup terjadwal. Menyisakan 14 file terbaru.
 */
export async function runScheduledBackup(): Promise<BackupResult> {
  console.log("[backup] Menjalankan backup terjadwal...");
  const result = await createBackup({ trigger: "SCHEDULED" });
  if (result.success) {
    const removed = await pruneOldBackups(14);
    console.log(`[backup] Backup terjadwal selesai. ${removed} file lama dihapus.`);
  } else {
    console.error(`[backup] Backup terjadwal GAGAL: ${result.message}`);
  }
  return result;
}
