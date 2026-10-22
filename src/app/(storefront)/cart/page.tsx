import type { Metadata } from "next";
import CartClient from "./CartClient";
import { buildNoIndexMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

/**
 * Halaman Keranjang.
 * Halaman transaksional - tidak boleh di-index (robots.txt juga memblokirnya).
 */
export const metadata: Metadata = buildNoIndexMetadata(
  "Keranjang Belanja — XoraMateria",
  "Kelola keranjang pesanan kain sublimasi Anda."
);

export default function CartPage() {
  return <CartClient />;
}
