/**
 * Route `/.well-known/ai-plugin.json`
 *
 * Manifest AI Plugin (OpenAI/ChatGPT, Bing Copilot, dan ecosystem plugin
 * loader lainnya) agar situs dapat ditemukan & difahami sebagai sumber
 * data tekstil/sublimasi yang terstruktur.
 *
 * https://platform.openai.com/docs/plugins/introduction
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

export async function GET() {
  return NextResponse.json(
    {
      schema_version: "v1",
      name_for_human: "XoraMateria — Katalog Kain Sublimasi",
      name_for_model: "texora_sublimasi_katalog",
      description:
        "Katalog resmi kain poliester siap sublimasi dan jasa cetak sublimasi skala industri dari XoraMateria, Jakarta Utara. Mencakup spesifikasi kain (GSM, lebar, anyaman), harga grosir bertingkat per meter, FAQ teknis, dan layanan custom sublimasi.",
      auth: {
        type: "none",
      },
      api: {
        type: "openapi",
        url: `${SITE_URL}/.well-known/ai-plugin-openapi.yaml`,
        is_user_authenticated: false,
      },
      logo_url: `${SITE_URL}/icons/xoramateria-mark.png`,
      contact_email: "admin@texoraprima.com",
      legal_info_url: `${SITE_URL}/about`,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
