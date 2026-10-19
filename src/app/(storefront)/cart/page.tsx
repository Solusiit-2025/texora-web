"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { loadCart, saveCart, clearCart, type CartLineItem } from "@/lib/cart";
import { 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Palette, 
  ShieldCheck, 
  Truck,
  CheckCircle2,
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Muat isi keranjang tersimpan & cek status login
  useEffect(() => {
    const saved = loadCart();
    setCartItems(saved);
    setIsLoaded(true);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setIsCheckingAuth(false));
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

  const handleClearCart = () => {
    if (confirm("Kosongkan semua item di keranjang belanja?")) {
      clearCart();
      setCartItems([]);
    }
  };

  const totalFabricAndPrint = cartItems.reduce((acc, item) => {
    return acc + (item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters;
  }, 0);

  const totalDesignFee = cartItems.reduce((acc, item) => {
    return acc + (item.designServiceFee || 0);
  }, 0);

  const subtotal = totalFabricAndPrint + totalDesignFee;
  const taxPPN = Math.round(subtotal * 0.11);
  const estimatedShipping = cartItems.length > 0 ? 250000 : 0; // Ekspedisi Kargo Roll Tekstil
  const grandTotal = subtotal + taxPPN + estimatedShipping;

  return (
    <div className="texora-container py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Keranjang Belanja Kain & Sublimasi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Periksa rincian meter lari kain dan lampiran file artwork sebelum proses penerbitan Surat Perintah Kerja (SPK).
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Keranjang</span>
          </button>
        )}
      </div>

      {!isLoaded ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">Memuat isi keranjang belanja...</p>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Items list */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const totalCostPerMeter = item.unitPrice + item.sublimationPrintFeePerMeter;
              const designFee = item.designServiceFee || 0;
              const itemSubtotal = totalCostPerMeter * item.meters + designFee;

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

                  {/* Jasa Desain Texora Badge & Brief if chosen */}
                  {(item.designServiceType === "TEXORA_DESIGN_SERVICE" || designFee > 0) && (
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                        <div>
                          <span className="text-brand-300 font-bold block text-xs">
                            Jasa Desain Tim Texora (+{formatRupiah(designFee)})
                          </span>
                          {item.designNotes && (
                            <span className="text-slate-300 text-[11px] block italic line-clamp-2 mt-0.5">
                              Brief: &quot;{item.designNotes}&quot;
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono text-[10px] font-bold border border-brand-500/30 shrink-0 self-start sm:self-center">
                        2x Revisi Minor Termasuk
                      </span>
                    </div>
                  )}

                  {/* Custom Design / Sample File Badge if attached */}
                  {item.customDesignTitle && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-accent-cyan" />
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">
                            {item.designServiceType === "TEXORA_DESIGN_SERVICE" ? "Sampel Referensi Desain:" : "File Artwork Siap Cetak:"}
                          </span>
                          <span className="font-semibold text-white font-mono">{item.customDesignTitle}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {item.customDesignDpi || 300} DPI Ready
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
                  <span className="font-mono text-white font-semibold">{formatRupiah(totalFabricAndPrint)}</span>
                </div>
                {totalDesignFee > 0 && (
                  <div className="flex justify-between text-brand-300 font-medium bg-brand-500/10 p-2 rounded-lg border border-brand-500/20">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span>Jasa Desain Tim Texora:</span>
                    </span>
                    <span className="font-mono font-bold">{formatRupiah(totalDesignFee)}</span>
                  </div>
                )}
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

              {!isCheckingAuth && !currentUser && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>⚠️ Wajib Masuk Akun</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Penerbitan Surat Perintah Kerja (SPK) & invoice legal memerlukan akun pembeli terdaftar.
                  </p>
                </div>
              )}

              {!isCheckingAuth && currentUser && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Akun: <strong>{currentUser.name}</strong></span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80">Siap Checkout</span>
                </div>
              )}

              {currentUser ? (
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Lanjut ke Formulir Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/login?redirect=/checkout&reason=auth_required"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-500 hover:to-brand-500 text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Masuk untuk Lanjut Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

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
