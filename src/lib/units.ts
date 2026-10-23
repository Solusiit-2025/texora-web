/**
 * Satuan Panjang Tekstil — YARD (tampilan publik) ⇄ METER (database)
 * ------------------------------------------------------------------
 * Standar trade tekstil internasional memakai YARD, sedangkan seluruh
 * sistem internal (database, CRM/Sales, gudang, mesin produksi) memakai
 * METER sebagai satuan kanonik. Modul ini adalah SATU-SATUNYA sumber
 * konversi — jangan pakai faktor 0.9144 hardcode di file lain.
 *
 *   1 yard = 0,9144 meter  (definisi resmi)
 */

export const YARD_TO_METER = 0.9144;

/** Meter → Yard (pembulatan ke yard integer terdekat). */
export function metersToYards(meters: number): number {
  return Math.round(meters / YARD_TO_METER);
}

/** Yard → Meter (presisi 1 desimal untuk penyimpanan). */
export function yardsToMeters(yards: number): number {
  return Math.round(yards * YARD_TO_METER * 10) / 10;
}

/**
 * Harga per meter → harga per yard (dibulatkan ke Rp 100 terdekat
 * agar ramah dibaca). Nilai kembalikan HANYA untuk tampilan;
 * sumber kebenaran harga di database tetap per meter.
 */
export function pricePerYard(pricePerMeter: number): number {
  return Math.round((pricePerMeter * YARD_TO_METER) / 100) * 100;
}

/**
 * Harga per yard (input admin) → harga per meter (disimpan ke database).
 * Tidak dibulatkan ke 100 supaya nilai asli admin terjaga sebisa mungkin.
 */
export function pricePerMeterFromYard(pricePerYardInput: number): number {
  return Math.round(pricePerYardInput / YARD_TO_METER);
}
