/**
 * Mail Service (SMTP / Nodemailer)
 * --------------------------------
 * Dipakai untuk notifikasi email saat ada RFQ (permintaan penawaran) masuk
 * dari halaman publik. Konfigurasi via .env:
 *
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
 *   QUOTE_EMAIL_TO   -> alamat tujuan notifikasi (default: parwanto0807@gmail.com)
 *
 * Contoh Gmail (butuh App Password: myaccount.google.com → Security → 2FA →
 * App passwords):
 *   SMTP_HOST="smtp.gmail.com"
 *   SMTP_PORT=465
 *   SMTP_USER="akun@gmail.com"
 *   SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  (App Password, bukan password biasa)
 *
 * Bila SMTP belum dikonfigurasi, fungsi di bawah SKIP tanpa error supaya
 * form RFQ tetap berfungsi (data tetap masuk database + CRM).
 */

import nodemailer from "nodemailer";

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let cachedTransport: Transporter | null = null;

/** Email tujuan notifikasi RFQ baru. */
export const QUOTE_NOTIFY_EMAIL =
  process.env.QUOTE_EMAIL_TO?.trim() || "parwanto0807@gmail.com";

/** Alamat pengirim default (fallback ke SMTP_USER). */
function getFromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    `XoraMateria Sales <${process.env.SMTP_USER || "no-reply@texora.co.id"}>`
  );
}

function isTransportConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );
}

function getTransport(): Transporter | null {
  if (!isTransportConfigured()) return null;
  if (!cachedTransport) {
    const port = Number(process.env.SMTP_PORT || 587);
    cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return cachedTransport;
}

/**
 * Kirim notifikasi RFQ baru ke email internal (QUOTE_NOTIFY_EMAIL).
 * - SMTP belum diset → di-skip (console.warn), tidak melempar error.
 * - Gagal kirim → error di-log tapi TIDAK dilempar (RFQ tetap sukses).
 */
export async function sendQuoteNotificationEmail(payload: {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  meters: number | null;
  /** Volume dalam yard (satuan utama trade tekstil); meter = kanonik DB. */
  yards?: number | null;
  needsSample: boolean;
  productsText: string | null;
  message: string | null;
  source: string;
  rfqId: string;
  fileUrl?: string | null;
}): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const transport = getTransport();
  if (!transport) {
    console.warn(
      "[mailer] SMTP belum dikonfigurasi (SMTP_HOST/USER/PASSWORD kosong) — notifikasi email dilewati."
    );
    return { sent: false, skipped: "smtp-not-configured" };
  }

  const esc = (v: string | null) =>
    (v || "-").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows: Array<[string, string]> = [
    ["Nama PIC", esc(payload.name)],
    ["Perusahaan / Brand", esc(payload.company)],
    ["Email", esc(payload.email)],
    ["WhatsApp / Telepon", esc(payload.phone)],
    ["Bahan Kain", esc(payload.productsText)],
    ["Estimasi Volume", (() => {
      const hasYards = payload.yards != null && payload.yards > 0;
      const hasMeters = payload.meters != null && payload.meters > 0;
      const yd = hasYards ? payload.yards!.toLocaleString("id-ID") : null;
      const m = hasMeters ? Math.round(payload.meters!).toLocaleString("id-ID") : null;
      if (yd && m) return `${yd} yard (≈ ${m} meter)`;
      if (yd) return `${yd} yard`;
      if (m) return `${m} meter`;
      return "-";
    })()],
    ["Sample Swatch Fisik", payload.needsSample ? "Ya — minta dikirim" : "Tidak"],
    ["Catatan Produksi", esc(payload.message)],
    ["Referensi File", payload.fileUrl ? `/uploads/${payload.fileUrl.replace("/uploads/", "")}` : "-"],
    ["Sumber Form", esc(payload.source)],
  ];

  // ── Derivasi tampilan ──────────────────────────────────────────────
  const [fabricShort = "-", gsm = ""] = (payload.productsText || "-")
    .replace(")", "")
    .split(" (");
  const meterNum = Number(
    (payload.meters != null && payload.meters > 0
      ? payload.meters
      : (payload.yards || 0) * 0.9144) || 0
  );
  const yardNum = Number(
    (payload.yards != null && payload.yards > 0
      ? payload.yards
      : meterNum > 0
      ? Math.round(meterNum / 0.9144)
      : 0) || 0
  );
  const volumeShort = yardNum > 0 ? `${yardNum.toLocaleString("id-ID")} yd` : "—";
  const tierLabel =
    meterNum >= 3000
      ? "Kontrak Industri ⚡"
      : meterNum >= 1000
      ? "Tier Grosir Pabrik 🔥"
      : meterNum > 0
      ? "Standard Batch"
      : "Belum ditentukan";
  const receivedAt = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://texora-web.vercel.app"
  ).replace(/\/$/, "");
  const crmUrl = `${siteUrl}/portal/crm/leads`;

  const detailRows = rows
    .filter(([k]) => k !== "Catatan Produksi")
    .map(
      ([k, v], i) => `
      <tr style="background-color:${i % 2 ? "#f8fafc" : "#ffffff"}">
        <td style="padding:11px 22px;font-size:10px;letter-spacing:1.2px;font-weight:700;color:#94a3b8;text-transform:uppercase;width:180px;vertical-align:top;border-bottom:1px solid #f1f5f9">${k}</td>
        <td style="padding:11px 22px;font-size:13px;font-weight:600;color:#1e293b;vertical-align:top;border-bottom:1px solid #f1f5f9">${v}</td>
      </tr>`
    )
    .join("");

  const statCard = (label: string, value: string, sub: string, accent: string) => `
    <td width="33.3%" style="padding:0 4px">
      <div style="background-color:#141d38;border:1px solid #2a3a63;border-radius:14px;padding:14px 10px;text-align:center">
        <div style="font-size:9px;letter-spacing:1.6px;font-weight:700;color:#8ea3c8;text-transform:uppercase">${label}</div>
        <div style="font-size:14px;font-weight:800;color:${accent};margin-top:5px;line-height:1.3">${value}</div>
        <div style="font-size:10px;color:${accent};opacity:.75;margin-top:3px">${sub}</div>
      </div>
    </td>`;

  const html = `
  <div style="margin:0;padding:0;background-color:#0b1220">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1220;padding:28px 12px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;border-collapse:collapse">
  <tr><td align="center">
  <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border-collapse:collapse">

    <!-- ═ HEADER ═ -->
    <tr>
      <td style="background-color:#0f1b3d;background-image:linear-gradient(135deg,#0f1b3d 0%,#1d4ed8 65%,#3b82f6 100%);border-radius:20px 20px 0 0;padding:26px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="vertical-align:top">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
                <td style="width:112px;vertical-align:middle">
                  <div style="background-color:rgba(255,255,255,.92);border:1px solid rgba(255,255,255,.4);border-radius:12px;padding:7px 10px;text-align:center">
                    <img src="${siteUrl}/icons/logo-xoramateria.png" width="88" height="63" alt="XoraMateria" style="display:block;width:88px;height:auto;border:0;outline:none;text-decoration:none" />
                  </div>
                </td>
                <td style="padding-left:12px">
                  <div style="font-size:10px;letter-spacing:2.5px;font-weight:700;color:#93c5fd;text-transform:uppercase">XoraMateria &bull; Notifikasi Otomatis</div>
                  <div style="font-size:24px;font-weight:800;color:#ffffff;margin-top:5px;line-height:1.2">RFQ Baru Masuk 📩</div>
                  <div style="font-size:12px;color:#bfdbfe;margin-top:5px">Permintaan Penawaran Resmi dari website &bull; <strong style="color:#ffffff">respon target 1&times;2 jam kerja</strong></div>
                </td>
              </tr></table>
            </td>
            <td style="vertical-align:top;text-align:right">
              <div style="background-color:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);border-radius:10px;padding:8px 12px;font-family:Consolas,'Courier New',monospace;font-size:11px;color:#e0ecff;white-space:nowrap">ID&nbsp;${esc(payload.rfqId)}</div>
              <div style="margin-top:8px;display:inline-block;background-color:rgba(16,185,129,.18);border:1px solid rgba(16,185,129,.45);border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;color:#6ee7b7;letter-spacing:1px">${payload.needsSample ? "SAMPLE DIMINTA" : "TANPA SAMPLE"}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═ STAT RINGKAS ═ -->
    <tr>
      <td style="background-color:#10182f;padding:14px 18px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
          ${statCard("Bahan Kain", fabricShort, gsm || "&nbsp;", "#7dd3fc")}
          ${statCard("Volume", volumeShort, tierLabel, "#a5b4fc")}
          ${statCard("Sample Fisik", payload.needsSample ? "Ya ✅" : "Tidak", "Pengiriman kurir", payload.needsSample ? "#6ee7b7" : "#94a3b8")}
        </tr></table>
      </td>
    </tr>

    <!-- ═ DETAIL ═ -->
    <tr>
      <td style="background-color:#ffffff;padding:14px 0 4px">
        <div style="padding:4px 22px 8px;font-size:11px;letter-spacing:1.6px;font-weight:800;color:#1d4ed8;text-transform:uppercase;border-bottom:2px solid #eff6ff">Detail Permintaan</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${detailRows}
        </table>

        ${
          payload.message
            ? `<div style="margin:16px 22px 6px;padding:14px 16px;background-color:#f8fafc;border-left:3px solid #1d4ed8;border-radius:0 10px 10px 0">
                 <div style="font-size:10px;letter-spacing:1.4px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">Catatan Produksi</div>
                 <div style="font-size:13px;color:#334155;line-height:1.65;white-space:pre-line">${esc(payload.message)}</div>
               </div>`
            : ""
        }
      </td>
    </tr>

    <!-- ═ CTA ═ -->
    <tr>
      <td style="background-color:#ffffff;padding:14px 22px 20px;border-top:1px solid #f1f5f9">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
          <td align="center" style="padding-bottom:14px">
            <a href="${crmUrl}" style="display:inline-block;background-color:#1d4ed8;background-image:linear-gradient(90deg,#1d4ed8,#3b82f6);color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:13px;font-weight:800">Tinjau di Pipeline CRM &rarr;</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:12px;color:#64748b">
            Atau balas langsung email ini untuk follow-up cepat ke customer:<br>
            <a href="mailto:${esc(payload.email)}" style="color:#1d4ed8;font-weight:700;text-decoration:none">${esc(payload.email)}</a>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- ═ FOOTER ═ -->
    <tr>
      <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 20px 20px;padding:16px 22px">
        <div style="font-size:11px;color:#64748b;line-height:1.7">
          <strong style="color:#334155">Diterima:</strong> ${receivedAt} WIB<br>
          Notifikasi otomatis dari website XoraMateria &bull; Data telah tersimpan pada Database RFQ &amp; Pipeline CRM (Lead).<br>
          Sumber form: <span style="font-family:monospace;color:#94a3b8">${esc(payload.source)}</span>
        </div>
      </td>
    </tr>

  </table>
  </td></tr>
  </table>
  </div>`;

  const text = [
    `RFQ BARU MASUK (ID: ${payload.rfqId})`,
    ...rows.map(([k, v]) => `${k}: ${v.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")}`),
    `Email customer: ${payload.email}`,
  ].join("\n");

  try {
    const info = await transport.sendMail({
      from: getFromAddress(),
      to: QUOTE_NOTIFY_EMAIL,
      replyTo: payload.email || undefined,
      subject: `🔔 RFQ Baru [${payload.rfqId}] ${payload.company || payload.name} — ${payload.productsText || "Kain"} ${payload.meters ? `${payload.meters} m` : ""}`.trim(),
      text,
      html,
    });
    console.log(`[mailer] Notifikasi RFQ terkirim ke ${QUOTE_NOTIFY_EMAIL} (messageId: ${info.messageId})`);
    return { sent: true };
  } catch (err: any) {
    console.error("[mailer] Gagal kirim notifikasi RFQ:", err?.message || err);
    return { sent: false, error: err?.message || "unknown-error" };
  }
}
