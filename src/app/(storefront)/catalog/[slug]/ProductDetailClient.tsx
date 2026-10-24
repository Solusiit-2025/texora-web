"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cachedClientFetch } from "@/lib/client-api";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { yardsToMeters, metersToYards, pricePerYard } from "@/lib/units";
import { addToCart } from "@/lib/cart";
import { RichContent } from "@/components/common/RichContent";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import type { StorefrontProduct } from "@/lib/storefront-data";
import { 
  ArrowLeft, 
  Palette, 
  ShoppingCart, 
  ShieldCheck, 
  Award, 
  Check, 
  Zap, 
  HelpCircle,
  Truck,
  Layers,
  FileCheck,
  Lock,
  FileText
} from "lucide-react";

interface ProductDetailClientProps {
  /** Data produk hasil SSR dari server component. */
  initialFabric: StorefrontProduct | null;
  /** Slug produk (dari route parameter). */
  slug: string;
  /** Produk terkait untuk strengthens internal linking. */
  relatedProducts: StorefrontProduct[];
}

export default function ProductDetailClient({
  initialFabric,
  slug,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const localePath = useLocalePath();

  // Data sudah tersedia di HTML awal (SSR) -> tidak ada skeleton saat load pertama
  const [fabric, setFabric] = useState<StorefrontProduct | null>(initialFabric);
  const [loading, setLoading] = useState(!initialFabric);
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialFabric?.variants?.[0]?.id || ""
  );
  // Satuan user = YARD (trade tekstil); database & harga = METER.
  const [orderYards, setOrderYards] = useState<number>(110);
  // ...meter konversi dipakai untuk hitung tier harga & cart.
  const orderMeters = yardsToMeters(
    Number(orderYards) > 0 ? Number(orderYards) : 0
  ) || 1;
  const [isAdded, setIsAdded] = useState(false);

  // User session state
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    cachedClientFetch("/api/auth/me")
      .then((data: any) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Refresh data di background agar tetap up-to-date tanpa mengosongkan HTML awal
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products?slug=${slug}&lang=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data?.length > 0) {
          const found = data.data[0];
          setFabric(found);
          if (found.variants?.length > 0) {
            setSelectedVariantId((prev) => prev || found.variants[0].id);
          }
        }
      })
      .catch((err) => console.warn("Gagal memuat produk:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="texora-container py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 aspect-[4/3] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-2/3 rounded-lg bg-slate-900/60 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-slate-900/60 animate-pulse" />
            <div className="h-4 w-5/6 rounded-lg bg-slate-900/60 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!fabric) {
    return (
      <div className="texora-container py-20 text-center">
        <p className="text-lg font-bold text-white">Produk tidak ditemukan.</p>
        <Link href={localePath("/catalog")} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const selectedVariant = fabric.variants.find(v => v.id === selectedVariantId) || fabric.variants[0];

  // Harga disembunyikan (setting terpusat dari portal) — server mengosongkan
  // priceTiers; UI menampilkan kalimat RFQ alih-alih angka harga.
  const priceHidden = !fabric.priceTiers || fabric.priceTiers.length === 0;

  // Calculate pricing based on tiers
  const activeTier = priceHidden
    ? null
    : fabric.priceTiers.find((tier) => {
        if (tier.maxMeters) {
          return orderMeters >= tier.minMeters && orderMeters <= tier.maxMeters;
        }
        return orderMeters >= tier.minMeters;
      }) || fabric.priceTiers[0];

  const subtotal = activeTier ? activeTier.unitPrice * orderMeters : 0;

  const handleAddToCart = () => {
    if (!activeTier) return;
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/catalog/${slug}`)}&reason=auth_required`);
      return;
    }

    setIsAdded(true);
    addToCart({
      fabricName: fabric.name,
      gsm: selectedVariant?.gsm ?? 140,
      widthInch: fabric.widthInch,
      meters: orderMeters,
      unitPrice: activeTier.unitPrice,
      sublimationPrintFeePerMeter: 0,
    });
    setTimeout(() => {
      router.push("/cart");
    }, 600);
  };

  return (
    <article className="texora-container py-10 space-y-10">
      
      {/* Breadcrumb + Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: t("nav.catalog"), href: "/catalog" },
            { label: fabric.name },
          ]}
        />
        <Link
          href={localePath("/catalog")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("prod.back")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image preview & Tech badges */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative">
            {fabric.images && fabric.images.length > 1 ? (
              <ImageCarousel
                images={fabric.images}
                alt={`${fabric.name} — kain ${fabric.composition}, lebar ${fabric.widthInch} inci, siap cetak sublimasi, kategori ${fabric.category}`}
                aspect="4/3"
                auto={false}
                slideMs={700}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-2xl border border-slate-800 shadow-2xl"
              />
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl bg-slate-950">
                <Image
                  src={fabric.thumbnailUrl}
                  alt={`${fabric.name} — kain ${fabric.composition}, lebar ${fabric.widthInch} inci, siap cetak sublimasi, kategori ${fabric.category}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-accent-cyan border border-accent-cyan/30 backdrop-blur-md">
                {fabric.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                {selectedVariant?.gsm} GSM
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md flex items-center justify-between text-xs z-20">
              <span className="text-slate-300">{t("prod.colorSupport")}</span>
              <span className="font-bold text-accent-cyan">CMYK & Fluorescent Sublimation</span>
            </div>
          </div>

          {/* Industrial Certifications */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="font-bold text-white">OEKO-TEX</div>
              <div className="text-[10px] text-slate-400">{t("prod.cert.oeko")}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Zap className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
              <div className="font-bold text-white">Heatpress 215°C</div>
              <div className="text-[10px] text-slate-400">{t("prod.cert.heatpress")}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <Truck className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <div className="font-bold text-white">Roll Waterproof</div>
              <div className="text-[10px] text-slate-400">{t("prod.cert.roll")}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Specs, Volume Tier Calculator & Order Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
              {t("prod.specHeading")}
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">
              {fabric.name}
            </h1>
            <RichContent
              html={fabric.description}
              className="text-sm text-slate-300 mt-2 leading-relaxed"
            />
          </div>

          {/* Variant Selector (GSM Options) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {t("prod.chooseVariant")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fabric.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    selectedVariantId === variant.id
                      ? "bg-brand-600/30 border-brand-500 text-white shadow-lg"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-sm text-white">{variant.gsm} GSM</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{variant.colorName}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    {t("prod.stockAvailable")} {formatNumber(metersToYards(variant.stockMeters))} yd
                  </div>
                </button>
              ))}
            </div>
          </div>

            {/* Volume Tier Table */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{t("prod.tierTable")}</span>
                {!priceHidden && (
                  <span className="text-accent-cyan font-normal text-[11px] lowercase">{t("catalog.perMeter")}</span>
                )}
              </label>
              {priceHidden ? (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                  {t("catalog.priceHidden")}
                </div>
              ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {fabric.priceTiers.map((tier) => {
                  const isSelectedTier = activeTier?.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelectedTier
                          ? "bg-accent-cyan/15 border-accent-cyan text-white shadow-md shadow-accent-cyan/10"
                          : "bg-slate-900/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {tier.maxMeters ? `${metersToYards(tier.minMeters)} – ${metersToYards(tier.maxMeters)} yd` : `≥ ${metersToYards(tier.minMeters)} yd`}
                      </div>
                      <div className={`font-mono font-bold mt-1 text-sm ${isSelectedTier ? "text-accent-cyan" : "text-slate-200"}`}>
                        {formatRupiah(pricePerYard(tier.unitPrice))}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>

          {/* Meter Quantity Slider & Input */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t("prod.orderLength")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={orderYards}
                  onChange={(e) => setOrderYards(Math.max(1, Number(e.target.value)))}
                  className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm text-right focus:outline-none focus:border-brand-500"
                />
                <span className="text-xs text-slate-400 font-semibold">{t("prod.meters")}</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={1650}
              step={10}
              value={orderYards}
              onChange={(e) => setOrderYards(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {priceHidden ? (
                <div className="text-xs text-slate-300 italic leading-relaxed flex-1">
                  {t("catalog.priceHidden")}
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-400 block">{t("prod.totalSubtotal")}</span>
                  <span className="text-2xl font-black text-white font-mono">
                    {formatRupiah(subtotal)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    (≈ {formatRupiah(pricePerYard(activeTier!.unitPrice))} / yd × {formatNumber(orderYards)} yd)
                  </span>
                </div>
              )}

              {/* Action Buttons with B2B Auth Check (disembunyikan saat harga hidden) */}
              <div className="flex flex-col gap-2 shrink-0">
                {!priceHidden && (
                  currentUser ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isAdded ? t("prod.added") : t("prod.orderPlain")}</span>
                    </button>

                    <Link
                      href={localePath(`/custom-sublimation?fabric=${fabric.id}&meters=${orderMeters}`)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-accent-cyan border border-accent-cyan/40 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      <span>{t("prod.printDesign")}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/catalog/${slug}`)}&reason=auth_required`}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{t("prod.loginToOrder")}</span>
                    </Link>

                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/custom-sublimation?fabric=${fabric.id}&meters=${orderMeters}`)}&reason=auth_required`}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Palette className="w-4 h-4 text-brand-400" />
                      <span>Masuk untuk Kustom Sublimasi</span>
                    </Link>
                  </>
                )
                )}
                <Link
                  href={localePath(`/request-quote?product=${fabric.slug}&source=product`)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                    priceHidden
                      ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg"
                      : "bg-brand-500/10 hover:bg-brand-500/25 text-brand-200 hover:text-white border border-brand-500/40"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t("catalog.quoteCta")}</span>
                </Link>
              </div>
            </div>

            {/* B2B Partner Information Note when not logged in */}
            {authChecked && !currentUser && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Kemitraan B2B: Masuk ke akun Anda untuk menerbitkan Surat Perintah Kerja (SPK), memesan roll kain, atau upload file desain sublimasi.
                </span>
              </div>
            )}

          </div>

          {/* Full Technical Specifications Sheet */}
          <section aria-labelledby="spesifikasi-heading" className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-2 text-xs">
            <h2 id="spesifikasi-heading" className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Tabel Parameter Teknis Tekstil
            </h2>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
              <div><span className="text-slate-500">Komposisi:</span> {fabric.composition}</div>
              <div><span className="text-slate-500">Lebar Kain:</span> {fabric.widthInch}&quot; (~{Math.round(fabric.widthInch * 2.54)} cm)</div>
              <div><span className="text-slate-500">Struktur Benang:</span> {fabric.weaveType}</div>
              <div><span className="text-slate-500">Uji Susut Heatpress:</span> &lt; 1.5% @ 210°C</div>
              <div><span className="text-slate-500">Tingkat Penetrasi:</span> Sisi Depan 100%, Belakang 75-85%</div>
              <div><span className="text-slate-500">Sertifikat:</span> OEKO-TEX Standard 100 Class 1</div>
            </div>
          </section>

        </div>

      </div>

      {/* Produk Terkait - memperkuat struktur internal linking & jangkauan crawler */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="produk-terkait-heading" className="pt-4 border-t border-slate-800/80">
          <h2
            id="produk-terkait-heading"
            className="text-lg font-display font-bold text-white mb-4"
          >
            Kain Serupa yang Bisa Anda Pertimbangkan
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/catalog/${rp.slug}`}
                className="group p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-colors"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 mb-3 relative">
                  <Image
                    src={rp.thumbnailUrl}
                    alt={`Kain ${rp.name} - ${rp.composition}, ${rp.category}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                  {rp.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {rp.composition} &middot; {rp.category}
                </p>
                {rp.basePricePerMeter > 0 && (
                  <p className="text-[11px] font-mono text-brand-400 mt-1.5">
                    {formatRupiah(pricePerYard(rp.basePricePerMeter))}/yd
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
