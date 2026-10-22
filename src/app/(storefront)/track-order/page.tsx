import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";
import { ModuleDisabledNotice } from "@/components/common/ModuleDisabledNotice";
import { getSeoSettings } from "@/lib/seo";
import { buildNoIndexMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

/**
 * Halaman Lacak Pesanan.
 *
 * Ini halaman semi-privat (memerlukan akun B2B untuk melihat detail SPK),
 * sehingga TIDAK di-index. `noindex` mencegah Google mengindeks halaman
 * yang isinya kosong bagi pengunjung anonim.
 *
 * Pemeriksaan status modul dilakukan di SERVER agar pesan "tidak tersedia"
 * tampil langsung tanpa flash skeleton.
 */
export const metadata: Metadata = buildNoIndexMetadata(
  "Lacak Pesanan — Portal Mitra XoraMateria",
  "Lacak status produksi dan nomor resi pengiriman pesanan kain sublimasi Anda. Memerlukan akun B2B terverifikasi."
);

export default async function TrackOrderPage() {
  const seo = await getSeoSettings().catch(() => null);

  if (seo?.pages?.["/track-order"]?.enabled === false) {
    return <ModuleDisabledNotice path="/track-order" />;
  }

  return <TrackOrderClient />;
}
