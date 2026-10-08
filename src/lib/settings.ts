import { prisma } from "@/lib/prisma";

const memorySettings = new Map<string, string>();

/**
 * Baca setting dari database, fallback ke memory / env var.
 */
export async function getSetting(key: string, envFallback = ""): Promise<string> {
  if (memorySettings.has(key)) {
    return memorySettings.get(key)!;
  }
  if (!process.env.DATABASE_URL) {
    return envFallback;
  }
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    if (row && row.value) {
      memorySettings.set(key, row.value);
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
  memorySettings.set(key, value);
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
    console.warn("[Texora Settings] Database not reachable or DATABASE_URL invalid. Setting cached in memory:", err);
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

