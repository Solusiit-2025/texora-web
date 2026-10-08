import { NextResponse } from "next/server";
import {
  getWhatsAppSettingsMasked,
  setSetting,
  getWhatsAppConfig,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getWhatsAppSettingsMasked();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({
      settings: {
        provider: "fonnte",
        fonnteApiKey: "",
        fonnteDeviceId: "",
        metaToken: "",
        metaPhoneId: "",
        webhookToken: "texora_whatsapp_2026",
        hasFonnteToken: false,
        hasMetaToken: false,
      },
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Record<string, any>;
    const allowed = [
      "whatsapp.provider",
      "whatsapp.fonnte_api_key",
      "whatsapp.fonnte_device_id",
      "whatsapp.meta_token",
      "whatsapp.meta_phone_id",
      "whatsapp.webhook_verify_token",
    ];

    for (const key of allowed) {
      if (key in body && typeof body[key] === "string") {
        // Jangan simpan nilai masked (••••) — artinya user tidak mengubahnya
        if (!body[key].includes("••••")) {
          await setSetting(key, body[key].trim());
        }
      }
    }

    const settings = await getWhatsAppSettingsMasked();
    return NextResponse.json({ saved: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan pengaturan WhatsApp" },
      { status: 500 }
    );
  }
}

// Test kirim pesan WhatsApp atau Cek Status Device
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, any>;
    const { action, testTo, testMessage } = body;

    const cfg = await getWhatsAppConfig();
    const provider = cfg.provider || "fonnte";

    // Action 1: Cek Status Koneksi Device (Fonnte)
    if (action === "check-device") {
      if (provider !== "fonnte") {
        return NextResponse.json({
          provider: "meta",
          connected: Boolean(cfg.metaToken && cfg.metaPhoneId),
          message: cfg.metaToken ? "Meta Cloud API credentials terisi" : "Meta credentials belum lengkap",
        });
      }

      if (!cfg.fonnteApiKey) {
        return NextResponse.json({
          provider: "fonnte",
          connected: false,
          error: "API Token Fonnte belum diisi. Masukkan token dari dashboard Fonnte.",
        });
      }

      const res = await fetch("https://api.fonnte.com/device", {
        method: "POST",
        headers: {
          Authorization: cfg.fonnteApiKey,
        },
      });

      const devData = await res.json().catch(() => ({}));
      if (!res.ok || devData.status === false || devData.status === "false") {
        return NextResponse.json({
          provider: "fonnte",
          connected: false,
          error: devData.reason || devData.message || "Gagal memverifikasi device Fonnte",
          raw: devData,
        });
      }

      return NextResponse.json({
        provider: "fonnte",
        connected: devData.device_status === "connect" || devData.status === true,
        deviceStatus: devData.device_status || (devData.status ? "connect" : "disconnect"),
        name: devData.name || "",
        device: devData.device || "",
        expired: devData.expired || "",
        quota: devData.quota ?? devData.messages ?? null,
        raw: devData,
      });
    }

    // Action 2: Kirim Pesan Uji Coba
    if (!testTo || !testMessage) {
      return NextResponse.json(
        { error: "Nomor tujuan (testTo) dan pesan (testMessage) wajib diisi." },
        { status: 400 }
      );
    }

    let meta: any = null;

    if (provider === "meta") {
      if (!cfg.metaPhoneId || !cfg.metaToken) {
        return NextResponse.json(
          { error: "Token dan Phone Number ID Meta WhatsApp belum diatur." },
          { status: 400 }
        );
      }

      const res = await fetch(
        `https://graph.facebook.com/v21.0/${cfg.metaPhoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfg.metaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: testTo.replace(/^\+/, "").replace(/[^0-9]/g, ""),
            text: { body: testMessage },
          }),
        }
      );
      meta = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(
          { success: false, provider, error: meta.error?.message || "Meta API error" },
          { status: 502 }
        );
      }
    } else {
      // Fonnte
      if (!cfg.fonnteApiKey) {
        return NextResponse.json(
          { error: "API Token Fonnte belum diatur. Silakan isi dan simpan konfigurasi terlebih dahulu." },
          { status: 400 }
        );
      }

      const cleanTarget = testTo.replace(/^\+/, "").replace(/[^0-9]/g, "");

      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: cfg.fonnteApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: cleanTarget,
          message: testMessage,
          countryCode: "62",
          ...(cfg.fonnteDeviceId ? { deviceId: cfg.fonnteDeviceId } : {}),
        }),
      });

      meta = await res.json().catch(() => ({}));
      
      // Fonnte returns HTTP 200 even on error (status: false, reason: "...")
      if (!res.ok || meta.status === false || meta.status === "false") {
        return NextResponse.json(
          {
            success: false,
            provider,
            error: meta.reason || meta.message || meta.detail || "Fonnte API error",
            meta,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, provider, meta });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}

