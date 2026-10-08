"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { loadCart, saveCart, type CartLineItem } from "@/lib/cart";
import { 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Palette, 
  ShieldCheck, 
  Truck,
  CheckCircle2
} from "lucide-react";

const DEFAULT_CART: CartLineItem[] = [
  {
    id: "cart-1",
    fabricName: "Dryfit Milano Premium",
    gsm: 135,
    widthInch: 60,
    meters: 100,
    unitPrice: 32500,
    sublimationPrintFeePerMeter: 18000,
    customDesignTitle: "Phoenix_Esport_Jersey_AllOver_Pattern.ai",
    customDesignDpi: 300,
  },
  {
    id: "cart-2",
    fabricName: "Voal Ultrafine Premium Hijab",
    gsm: 85,
    widthInch: 46,
    meters: 50,
    unitPrice: 28000,
    sublimationPrintFeePerMeter: 18000,
    customDesignTitle: "Monogram_Botanical_Hijab_Voal.tiff",
    customDesignDpi: 240,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartLineItem[]>(DEFAULT_CART);

  // Muat isi keranjang tersimpan (termasuk item dari Kustom Sublimasi)
  useEffect(() => {
    const saved = loadCart();
    if (saved.length) setCartItems(saved);
  }, []);

  const updateMeters = (id: string, newMeters: number) => {
    setCartItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, meters: Math.max(1, newMeters) } : item);
      saveCart(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setCartItems(prev => {
      const next = prev.filter(item => item.id !== id);
      saveCart(next);
      return next;
    });
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal = (item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters;
    return acc + itemTotal;
  }, 0);

  const taxPPN = Math.round(subtotal * 0.11);
  const estimatedShipping = 250000; // Ekspedisi Kargo Roll Tekstil
  const grandTotal = subtotal + taxPPN + estimatedShipping;

  return (
    <div className="texora-container py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white font-display">
          Keranjang Belanja Kain & Sublimasi
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Periksa rincian meter lari kain dan lampiran file artwork sebelum proses penerbitan Surat Perintah Kerja (SPK).
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Items list */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const totalCostPerMeter = item.unitPrice + item.sublimationPrintFeePerMeter;
              const itemSubtotal = totalCostPerMeter * item.meters;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {item.fabricName}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Gramatur: <span className="text-slate-200">{item.gsm} GSM</span> • Lebar Bahan: <span className="text-slate-200">{item.widthInch}&quot;</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1.5 self-end sm:self-center"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Custom Design Badge if attached */}
                  {item.customDesignTitle && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-brand-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-accent-cyan" />
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">File Artwork Dilampirkan:</span>
                          <span className="font-semibold text-white font-mono">{item.customDesignTitle}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {item.customDesignDpi} DPI Ready
                      </span>
                    </div>
                  )}

                  {/* Quantity & Pricing Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Panjang:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={item.meters}
                          onChange={(e) => updateMeters(item.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs text-center"
                        />
                        <span className="text-xs text-slate-400 font-semibold">Meter</span>
                      </div>
                      <div className="text-[11px] text-slate-400 hidden sm:inline">
                        (@ {formatRupiah(totalCostPerMeter)} /m termasuk cetak)
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Subtotal Item:</span>
                      <span className="text-lg font-bold text-white font-mono">
                        {formatRupiah(itemSubtotal)}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}

            <div className="pt-2 flex justify-between">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tambah Bahan Lain dari Katalog</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-2xl space-y-5">
              <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                Ringkasan Transaksi
              </h2>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal Kain & Cetak:</span>
                  <span className="font-mono text-white font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11% (Faktur Pajak):</span>
                  <span className="font-mono text-white font-semibold">{formatRupiah(taxPPN)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" /> Estimasi Kargo Roll:
                  </span>
                  <span className="font-mono text-white font-semibold">{formatRupiah(estimatedShipping)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Tagihan:</span>
                <span className="text-2xl font-black text-accent-cyan font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Formulir Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  Jaminan Transaksi Resmi PT. Texora
                </div>
                <p>Mendukung invoice resmi perusahaan B2B, faktur pajak elektronik, dan garansi kalibrasi warna pantone.</p>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 p-8 rounded-2xl glass-panel border border-slate-800 max-w-lg mx-auto space-y-4">
          <Palette className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Keranjang Masih Kosong</h2>
          <p className="text-xs text-slate-400">
            Jelajahi katalog kain poliester kami atau buka simulator visualizer sublimasi untuk memulai pesanan.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            Lihat Katalog Kain
          </Link>
        </div>
      )}

    </div>
  );
}
