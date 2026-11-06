import { prisma } from "@/lib/prisma";

interface SettingCacheEntry {
  value: string;
  expires: number;
}

const memorySettings = new Map<string, SettingCacheEntry>();

export function invalidateSetting(key?: string) {
  if (key) {
    memorySettings.delete(key);
  } else {
    memorySettings.clear();
  }
}

/**
 * Baca setting dari database, fallback ke memory / env var.
 * Menggunakan TTL pendek (10 detik) agar perubahan dari admin langsung terbaca
 * lintas proses/worker tanpa query berlebihan ke DB remote.
 */
export async function getSetting(key: string, envFallback = ""): Promise<string> {
  const hit = memorySettings.get(key);
  if (hit && Date.now() < hit.expires) {
    return hit.value;
  }
  if (!process.env.DATABASE_URL) {
    return envFallback;
  }
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    if (row && row.value !== null && row.value !== undefined) {
      memorySettings.set(key, { value: row.value, expires: Date.now() + 10_000 });
      return row.value;
    }
  } catch {
    // DB tidak reachable / DATABASE_URL belum diatur — fallback ke env
  }
  return envFallback;
}

export async function getWhatsAppConfig() {
  const provider = await getSetting("whatsapp.provider", process.env.WHATSAPP_PROVIDER || "fonnte");
  const fonnteApiKey = await getSetting(
    "whatsapp.fonnte_api_key",
    process.env.FONTE_API_KEY || process.env.FONNTE_API_KEY || ""
  );
  const fonnteDeviceId = await getSetting(
    "whatsapp.fonnte_device_id",
    process.env.FONTE_DEVICE_ID || process.env.FONNTE_DEVICE_ID || ""
  );
  const metaToken = await getSetting("whatsapp.meta_token", process.env.WHATSAPP_API_TOKEN || "");
  const metaPhoneId = await getSetting("whatsapp.meta_phone_id", process.env.WHATSAPP_PHONE_NUMBER_ID || "");
  const webhookToken = await getSetting("whatsapp.webhook_verify_token", process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "");

  return {
    provider,
    fonnteApiKey,
    fonnteDeviceId,
    metaToken,
    metaPhoneId,
    webhookToken,
  };
}

export async function setSetting(key: string, value: string) {
  memorySettings.set(key, { value, expires: Date.now() + 30_000 });
  if (!process.env.DATABASE_URL) {
    return;
  }
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  } catch (err) {
    console.warn("[XoraMateria Settings] Database not reachable or DATABASE_URL invalid. Setting cached in memory:", err);
  }
}

export async function getWhatsAppSettingsMasked() {
  const cfg = await getWhatsAppConfig();
  const mask = (s: string) =>
    !s ? "" : s.length <= 8 ? "••••••••" : s.slice(0, 4) + "••••••" + s.slice(-4);

  return {
    provider: cfg.provider,
    fonnteApiKey: mask(cfg.fonnteApiKey),
    fonnteDeviceId: cfg.fonnteDeviceId,
    metaToken: mask(cfg.metaToken),
    metaPhoneId: cfg.metaPhoneId,
    webhookToken: cfg.webhookToken,
    hasFonnteToken: Boolean(cfg.fonnteApiKey),
    hasMetaToken: Boolean(cfg.metaToken && cfg.metaPhoneId),
  };
}

export async function disconnectPrisma() {
  // No-op for Next.js singleton to preserve connection pool
}

