"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { loadCart, type CartLineItem } from "@/lib/cart";
import { saveLastOrder } from "@/lib/order";
import { 
  Building2, 
  User, 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  QrCode
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  // Step state (1: Info, 2: Shipping, 3: Payment, 4: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Hendra Wijaya",
    email: "hendra@garmentkreatif.com",
    phone: "081234567890",
    accountType: "B2B", // B2B or B2C
    companyName: "PT. Garment Kreatif Nusantara",
    taxId: "01.234.567.8-012.000",
    address: "Jl. Industri Tekstil No. 45, Kawasan Rancaekek",
    city: "Bandung",
    postalCode: "40394",
    shippingCarrier: "dakota", // dakota, jtr, texora_fleet
    paymentMethod: "bca_va", // bca_va, mandiri_bill, qris, invoice_top30
    orderNotes: "Prioritaskan roll Dryfit Milano warna cyan pekat sesuai proofing.",
  });

  const [orderCreatedNumber, setOrderCreatedNumber] = useState<string>("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters,
    0
  );
  const taxPPN = Math.round(subtotal * 0.11);
  const shippingCost = formData.shippingCarrier === "texora_fleet" ? 450000 : 250000;
  const grandTotal = subtotal + taxPPN + shippingCost;

  const handleSubmitOrder = () => {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const seq = String(1000 + Math.floor(Math.random() * 9000));
    const generatedOrder = `TEX-${yyyymm}-${seq}`;
    setOrderCreatedNumber(generatedOrder);

    saveLastOrder({
      orderNumber: generatedOrder,
      customerName: formData.fullName,
      customerCompany: formData.accountType === "B2B" ? formData.companyName : undefined,
      totalAmount: grandTotal,
      taxAmount: taxPPN,
      shippingAmount: shippingCost,
      status: "PENDING_PAYMENT",
      paymentStatus: "UNPAID",
      paymentMethod: formData.paymentMethod,
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      notes: formData.orderNotes,
      items: cartItems.map((item, i) => ({
        id: `item-${i + 1}`,
        fabricName: item.fabricName,
        gsm: item.gsm,
        lengthMeters: item.meters,
        unitPrice: item.unitPrice + item.sublimationPrintFeePerMeter,
        subtotal: (item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters,
        customDesignTitle: item.customDesignTitle,
      })),
    });

    setCurrentStep(4);
  };

  return (
    <div className="texora-container py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Checkout Pesanan Kain & Sublimasi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Proses verifikasi legalitas faktur, kargo roll, dan pembuatan SPK pabrik.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          {[
            { num: 1, label: "Data Pembeli" },
            { num: 2, label: "Kargo" },
            { num: 3, label: "Pembayaran" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                currentStep === s.num
                  ? "bg-brand-600 border-brand-500 text-white font-bold"
                  : currentStep > s.num
                  ? "bg-slate-900 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-900/60 border-slate-800 text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center text-[10px]">
                {currentStep > s.num ? "✓" : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {currentStep < 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: CUSTOMER & B2B DETAILS */}
            {currentStep === 1 && (
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-accent-cyan" />
                    <span>Langkah 1: Informasi Pelanggan & Entitas Penagihan</span>
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, accountType: "B2B" })}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        formData.accountType === "B2B" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      B2B Perusahaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, accountType: "B2C" })}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        formData.accountType === "B2C" ? "bg-brand-600 text-white" : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      Perorangan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Nama Lengkap Penanggung Jawab *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {formData.accountType === "B2B" && (
                    <>
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">Nama Perusahaan / PT / CV *</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-medium block mb-1">NPWP Perusahaan (Untuk Faktur Pajak)</label>
                        <input
                          type="text"
                          value={formData.taxId}
                          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-slate-300 font-medium block mb-1">Alamat Gudang / Pabrik Tujuan Pengiriman *</label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Kota / Kabupaten *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Kode Pos *</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Pilihan Kargo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING CARRIER */}
            {currentStep === 2 && (
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-accent-amber" />
                    <span>Langkah 2: Pilih Layanan Kargo Roll Kain</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kain dipacking dengan plastik anti-air tebal dan karton pelindung gulungan.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "dakota",
                      title: "Dakota Cargo (Spesialis Kargo Berat & Roll)",
                      desc: "Estimasi 2-3 hari kerja. Cocok untuk pengiriman luar kota Jawa & Bali.",
                      cost: 250000,
                    },
                    {
                      id: "jtr",
                      title: "JNE Trucking (JTR)",
                      desc: "Estimasi 3-4 hari kerja dengan pelacakan nomor resi online 24 jam.",
                      cost: 280000,
                    },
                    {
                      id: "texora_fleet",
                      title: "Armada Truk Texora Express (Khusus Bandung & Jabodetabek)",
                      desc: "Pengiriman langsung dari pabrik hari yang sama setelah produksi rampung.",
                      cost: 450000,
                    },
                  ].map((carrier) => (
                    <label
                      key={carrier.id}
                      onClick={() => setFormData({ ...formData, shippingCarrier: carrier.id })}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        formData.shippingCarrier === carrier.id
                          ? "bg-brand-600/20 border-brand-500 text-white"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="carrier"
                          checked={formData.shippingCarrier === carrier.id}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-bold text-sm text-white">{carrier.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{carrier.desc}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-accent-cyan">
                        {formatRupiah(carrier.cost)}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT GATEWAY SELECTION */}
            {currentStep === 3 && (
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Langkah 3: Metode Pembayaran Resmi</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transaksi diproses otomatis melalui integrasi Payment Gateway & Webhook ERP.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "bca_va",
                      title: "BCA Virtual Account (Otomatis Terverifikasi)",
                      desc: "Nomor VA instan, verifikasi realtime 24/7.",
                    },
                    {
                      id: "mandiri_bill",
                      title: "Bank Mandiri Bill Payment",
                      desc: "Pembayaran melalui Livin by Mandiri & ATM.",
                    },
                    {
                      id: "qris",
                      title: "QRIS Dinamis (Gopay, OVO, ShopeePay, Dana)",
                      desc: "Scan kode QR langsung dari aplikasi mobile banking.",
                    },
                    {
                      id: "invoice_top30",
                      title: "Term of Payment (TOP 30 Hari - Khusus Mitra Terverifikasi)",
                      desc: "Penerbitan tagihan tempo invoice garmen dengan verifikasi legalitas PO.",
                    },
                  ].map((pay) => (
                    <label
                      key={pay.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pay.id })}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        formData.paymentMethod === pay.id
                          ? "bg-brand-600/20 border-brand-500 text-white"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={formData.paymentMethod === pay.id}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-bold text-sm text-white">{pay.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{pay.desc}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:brightness-110 text-white font-bold text-xs shadow-xl transition-all flex items-center gap-1.5"
                  >
                    <span>Konfirmasi & Terbitkan SPK Pesanan</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Ringkasan Biaya Checkout
              </h3>

              <div className="space-y-2 border-b border-slate-800 pb-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{item.fabricName}</div>
                      <div className="text-slate-400">{item.meters} m · {item.gsm} GSM{item.customDesignTitle ? " · custom" : ""}</div>
                    </div>
                    <div className="font-mono text-white shrink-0">
                      {formatRupiah((item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters)}
                    </div>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-slate-500 text-xs">Belum ada item pesanan.</p>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal Kain & Sublimasi:</span>
                  <span className="font-mono text-white">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11% (Faktur Elektronik):</span>
                  <span className="font-mono text-white">{formatRupiah(taxPPN)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Kargo Roll:</span>
                  <span className="font-mono text-white">{formatRupiah(shippingCost)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Bayar:</span>
                <span className="text-2xl font-black text-accent-cyan font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-white">Alamat Pengiriman Terpilih:</div>
                <p className="line-clamp-2">{formData.address}, {formData.city}</p>
                <div className="text-slate-500 text-[10px]">Penerima: {formData.fullName} ({formData.phone})</div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* STEP 4: ORDER SUCCESS / CONFIRMATION SCREEN */
        <div className="max-w-4xl mx-auto p-8 rounded-3xl glass-panel border border-emerald-500/40 text-center space-y-6 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
              Surat Perintah Kerja (SPK) Berhasil Diterbitkan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-3">
              Pesanan Dikonfirmasi!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Nomor Referensi Transaksi PT. Texora Visi Prima:
            </p>
            <div className="mt-2 text-2xl font-black text-accent-cyan font-mono tracking-wider">
              {orderCreatedNumber}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
            <div className="space-y-1.5 border-b border-slate-800 pb-2.5 mb-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <div className="min-w-0 text-slate-300">
                    <span className="text-white font-semibold">{item.fabricName}</span>
                    <span className="text-slate-500"> · {item.meters} m</span>
                  </div>
                  <span className="text-slate-300 font-mono shrink-0">
                    {formatRupiah((item.unitPrice + item.sublimationPrintFeePerMeter) * item.meters)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Metode Pembayaran:</span>
              <span className="font-semibold text-white uppercase">{formData.paymentMethod.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status Pembayaran:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                Menunggu Konfirmasi VA
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Tagihan:</span>
              <span className="font-bold text-accent-cyan font-mono text-sm">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/track-order?orderId=${orderCreatedNumber}`}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Lacak Progress Produksi Sublimasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/catalog"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Kembali ke Toko
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
