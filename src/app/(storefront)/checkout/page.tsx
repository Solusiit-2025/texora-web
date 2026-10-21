import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { buildNoIndexMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

/**
 * Halaman Checkout.
 * Halaman transaksional privat - tidak boleh di-index.
 */
export const metadata: Metadata = buildNoIndexMetadata(
  "Checkout — PT. Texora Visi Prima",
  "Selesaikan pesanan kain sublimasi Anda."
);

export default function CheckoutPage() {
  return <CheckoutClient />;
}
