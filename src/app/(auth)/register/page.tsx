import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";
import { buildNoIndexMetadata } from "@/lib/seo-metadata";

/**
 * Halaman Pendaftaran Mitra B2B.
 * noindex (diturboalkan juga oleh layout `(auth)`) - halaman ini memiliki
 * nilai bisnis hanya lewat konversi, bukan lewat mesin pencari.
 */
export const metadata: Metadata = buildNoIndexMetadata(
  "Daftar Kemitraan B2B | XoraMateria",
  "Daftar akun mitra B2B XoraMateria untuk memesan roll kain sublimasi, mengunggah desain, dan memantau SPK."
);

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Memuat formulir pendaftaran...
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
