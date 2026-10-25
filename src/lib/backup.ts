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
  "contentTranslation",
  "quoteRequest",
  "article",
  "category",
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
    contentTranslation: "content_translations",
    quoteRequest: "quote_requests",
    article: "cms_articles",
    category: "master_categories",
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

export interface RestoreResult {
  success: boolean;
  message: string;
  tables?: string[];
  recordCount?: number;
}

/** Validasi nama identifier SQL (anti injection). */
function safeIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Identifier tidak valid: ${name}`);
  }
  return `"${name}"`;
}

/** Ambil nama fisik tabel. */
function physicalName(table: string): string {
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
    contentTranslation: "content_translations",
    quoteRequest: "quote_requests",
    article: "cms_articles",
    category: "master_categories",
  };
  return physical[table] || table;
}

/**
 * Pulihkan (restore) database dari payload backup JSON.
 * - Membuat backup pengaman sebelum restore (best-effort).
 * - Mengosongkan seluruh tabel lalu mengisi ulang sesuai urutan dependensi.
 */
export async function restoreBackup(
  payload: any,
  options?: { createdBy?: string | null; skipSafetyBackup?: boolean }
): Promise<RestoreResult> {
  try {
    if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object") {
      return {
        success: false,
        message: "Payload backup tidak valid (field 'data' tidak ditemukan).",
      };
    }

    const createdBy = options?.createdBy || null;

    // Backup pengaman (best-effort) sebelum restore
    if (!options?.skipSafetyBackup) {
      try {
        await createBackup({ trigger: "MANUAL", createdBy });
      } catch (err) {
        console.warn("[restore] Gagal membuat backup pengaman:", err);
      }
    }

    const tablesToRestore = BACKUP_TABLES.filter((t) =>
      Object.prototype.hasOwnProperty.call(payload.data, t)
    );

    // Ambil tipe kolom dari DB untuk casting parameter (enum, timestamp, dll.)
    const columnTypeMap: Record<string, Record<string, string>> = {};
    for (const table of BACKUP_TABLES) {
      const physical = physicalName(table);
      try {
        const info: any[] = await prisma.$queryRawUnsafe(
          `SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
          physical
        );
        const m: Record<string, string> = {};
        for (const row of info) {
          m[row.column_name] = row.udt_name;
        }
        columnTypeMap[table] = m;
      } catch {
        columnTypeMap[table] = {};
      }
    }

    // Hitung total record
    let totalRecords = 0;
    for (const t of tablesToRestore) {
      const rows = payload.data[t];
      if (Array.isArray(rows)) totalRecords += rows.length;
    }

    await prisma.$transaction(
      async (tx: any) => {
        // Kosongkan semua tabel (CASCADE menangani FK)
        // TRUNCATE dengan CASCADE
        await tx.$executeRawUnsafe(
          `TRUNCATE TABLE ${BACKUP_TABLES.map((t) => safeIdent(physicalName(t))).join(", ")} CASCADE;`
        );

        // Isi ulang sesuai urutan dependensi (BACKUP_TABLES)
        for (const table of BACKUP_TABLES) {
          const rows = payload.data?.[table];
          if (!Array.isArray(rows) || rows.length === 0) continue;

          const physical = physicalName(table);
          // Ambil kolom dari baris pertama yang memiliki keys
          const sample = rows.find((r: any) => r && typeof r === "object");
          if (!sample) continue;

          const columns = Object.keys(sample).filter((c) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(c));

          if (columns.length === 0) continue;

          const types = columnTypeMap[table] || {};
          const colSql = columns.map((c) => safeIdent(c)).join(", ");
          const placeholders = columns
            .map((c, i) => {
              const t = types[c];
              if (t) return `$${i + 1}::"${t}"`;
              return `$${i + 1}`;
            })
            .join(", ");
          const insertSql = `INSERT INTO ${safeIdent(physical)} (${colSql}) VALUES (${placeholders});`;

          const BATCH_SIZE = 50;
          const validRows = rows.filter((r: any) => r && typeof r === "object");
          for (let b = 0; b < validRows.length; b += BATCH_SIZE) {
            const batch = validRows.slice(b, b + BATCH_SIZE);
            const rowPlaceholders: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;
            for (const row of batch) {
              const rowVals = columns.map((c) => {
                const v = row[c];
                if (v === undefined) return null;
                if (v !== null && typeof v === "object" && !(v instanceof Date)) {
                  try {
                    return JSON.stringify(v);
                  } catch {
                    return v;
                  }
                }
                return v;
              });
              const placeholders = columns
                .map((c, i) => {
                  const t = types[c];
                  const idx = paramIndex + i;
                  if (t) return `$${idx}::"${t}"`;
                  return `$${idx}`;
                })
                .join(", ");
              rowPlaceholders.push(`(${placeholders})`);
              values.push(...rowVals);
              paramIndex += columns.length;
            }
            const batchSql = `INSERT INTO ${safeIdent(physical)} (${colSql}) VALUES ${rowPlaceholders.join(", ")};`;
            await tx.$executeRawUnsafe(batchSql, ...values);
          }
        }
      },
      { timeout: 300000 }
    );

    // Catat audit restore
    try {
      await prisma.backupLog.create({
        data: {
          filename: payload?.meta?.filename || "restore-payload",
          sizeBytes: BigInt(0),
          tables: JSON.stringify(tablesToRestore),
          recordCount: totalRecords,
          status: "SUCCESS",
          trigger: "MANUAL",
          message: `Restore berhasil: ${tablesToRestore.length} tabel, ${totalRecords} record.`,
          createdBy,
        },
      });
    } catch (err) {
      console.warn("[restore] Gagal menulis audit log restore:", err);
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "DATABASE_RESTORE",
          userId: createdBy,
          description: `Restore database dari backup (${tablesToRestore.length} tabel, ${totalRecords} record).`,
        },
      });
    } catch {}

    return {
      success: true,
      message: `Restore berhasil: ${tablesToRestore.length} tabel, ${totalRecords} record dipulihkan.`,
      tables: tablesToRestore,
      recordCount: totalRecords,
    };
  } catch (error: any) {
    console.error("[restore] Gagal restore database:", error);
    try {
      await prisma.backupLog.create({
        data: {
          filename: "restore-failed",
          sizeBytes: BigInt(0),
          tables: "[]",
          recordCount: 0,
          status: "FAILED",
          trigger: "MANUAL",
          message: error?.message || "Restore gagal.",
          createdBy: options?.createdBy || null,
        },
      });
    } catch {}
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan saat restore database.",
    };
  }
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
