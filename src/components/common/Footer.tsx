import Link from "next/link";
import { Layers, ShieldCheck, Award, Truck, Sparkles, Mail, Phone, MapPin, FileText, Download, BookOpen } from "lucide-react";
import { SocialLinks } from "./SocialLinks";
import { getStorefrontProducts } from "@/lib/storefront-data";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { T } from "@/lib/i18n/LanguageContext";
import { getRequestLocale } from "@/lib/server-locale";

/**
 * Footer website.
 *
 * Di-render sebagai SERVER component agar:
 *  - Link katalog mengarah ke halaman PRODUK SPESIFIK (bukan dead-end ke
 *    /catalog) sehingga jalur crawl internal ke halaman produk meningkat.
 *  - Konten tetap terbaca crawler tanpa eksekusi JavaScript.
 */
export async function Footer() {
  // Prefix bahasa untuk link internal (server-side, konsisten dengan URL halaman).
  const locale = await getRequestLocale();
  const lp = (href: string) => {
    if (!href || locale === "id") return href;
    // Segment dibaca tanpa query string / hash.
    const pathname = href.split(/[?#]/)[0];
    const seg = pathname.replace(/^\//, "").split("/")[0];
    if (!["", "catalog", "kategori", "about", "contact", "custom-sublimation", "request-quote"].includes(seg)) {
      return href;
    }
    if (pathname === "/" && !/[?#]/.test(href)) return `/${locale}`;
    return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
  };
  const products = await getStorefrontProducts();

  // 6 produk teratas untuk link katalog di footer
  const featuredProducts = products.slice(0, 6);

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 pt-12 lg:pt-14 3xl:pt-16 pb-10 lg:pb-12 mt-auto">
      <div className="texora-container">
        
        {/* Top Feature Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-brand-500/10 text-brand-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                <T k="footer.badge.oeko.title" fallback="Standar Oeko-Tex" />
              </h3>
              <p className="text-xs text-slate-400">
                <T k="footer.badge.oeko.desc" fallback="Tinta ramah lingkungan & anti-alergi" />
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                <T k="footer.badge.dpi.title" fallback="1440 DPI Precision" />
              </h3>
              <p className="text-xs text-slate-400">
                <T k="footer.badge.dpi.desc" fallback="Hasil warna pekat & gradasi tajam" />
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-violet/10 text-accent-violet">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                <T k="footer.badge.pricing.title" fallback="Volume Tier Pricing" />
              </h3>
              <p className="text-xs text-slate-400">
                <T k="footer.badge.pricing.desc" fallback="Diskon otomatis per rol & partai besar" />
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 rounded-lg bg-accent-amber/10 text-accent-amber">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                <T k="footer.badge.cargo.title" fallback="Kargo Khusus Roll" />
              </h3>
              <p className="text-xs text-slate-400">
                <T k="footer.badge.cargo.desc" fallback="Kemasan anti-lembab & ekspedisi kargo" />
              </p>
            </div>
          </div>
        </div>

        {/* Links & Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 xl:w-11 xl:h-11 3xl:w-12 3xl:h-12 rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 p-1.5 border border-brand-400/60 flex items-center justify-center shadow-lg shadow-black/40">
                <img
                  src="/icons/xoramateria-mark.png"
                  alt="XoraMateria"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain filter drop-shadow-[0_1.5px_2px_rgba(15,23,42,0.45)]"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-display">
                XORAMATERIA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              <T
                k="footer.company.desc"
                fallback="Pabrik & manufaktur cetak sublimasi kain industri terintegrasi. Menyuplai kebutuhan bahan kain poliester khusus jersey olahraga, hijab voal, gaun satin, dan merchandise komersial untuk ratusan brand garmen di Indonesia."
              />
            </p>
            <div className="flex items-start gap-2 pt-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Jl. Walang Baru VI Blok B1/2, RT 04 / RW 07, Tugu Utara, Tanjung Priok, Jakarta Utara
              </span>
            </div>
            <div className="pt-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2.5">
                <T k="footer.ikuti" />
              </p>
              <SocialLinks />
            </div>
          </div>

          <nav aria-labelledby="footer-katalog-heading">
            <h2 id="footer-katalog-heading" className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              <T k="nav.catalog" />
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      prefetch={false}
                      href={lp(`/catalog/${p.slug}`)}
                      className="hover:text-brand-300 transition-colors"
                      title={`${p.name} — ${p.composition}`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link prefetch={false} href={lp("/catalog")} className="hover:text-brand-300">Katalog Kain Sublimasi</Link></li>
                  <li><Link prefetch={false} href={lp("/catalog")} className="hover:text-brand-300">Dryfit Milano (Sportswear)</Link></li>
                  <li><Link prefetch={false} href={lp("/catalog")} className="hover:text-brand-300">Voal Ultrafine (Hijab)</Link></li>
                </>
              )}
              <li>
                <Link prefetch={false} href={lp("/catalog")} className="hover:text-brand-300 font-medium inline-flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <T k="footer.semua" />
                </Link>
              </li>
            </ul>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-4 mb-2">
              <T k="footer.panduan" />
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {CATEGORY_SEO.map((c) => (
                <li key={c.slug}>
                  <Link
                    prefetch={false}
                    href={lp(`/kategori/${c.slug}`)}
                    className="hover:text-brand-300 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-layanan-heading">
            <h2 id="footer-layanan-heading" className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              <T k="footer.layanan" />
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link prefetch={false} href={lp("/about")} className="hover:text-brand-300 font-medium"><T k="footer.links.about" fallback="Tentang Kami & Kapasitas Pabrik" /></Link></li>
              <li><Link prefetch={false} href={lp("/artikel")} className="hover:text-brand-300 font-medium flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-brand-400" /><T k="nav.artikel" fallback="Artikel & Panduan" /></Link></li>
              <li><Link prefetch={false} href={lp("/request-quote")} className="hover:text-brand-300 font-medium flex items-center gap-1.5"><FileText className="w-3 h-3 text-brand-400" /><T k="footer.links.quote" fallback="Minta Penawaran Harga" /></Link></li>
              <li><a href="/api/catalog/pdf" download className="hover:text-brand-300 font-medium flex items-center gap-1.5"><Download className="w-3 h-3 text-brand-400" /><T k="footer.links.pdf" fallback="Unduh Katalog PDF" /></a></li>
              <li><Link prefetch={false} href={lp("/custom-sublimation")} className="hover:text-accent-cyan font-medium"><T k="footer.links.visualizer" fallback="Unggah Desain & Visualizer" /></Link></li>
              <li><Link prefetch={false} href="/track-order" className="hover:text-brand-300"><T k="footer.links.track" fallback="Lacak Status Pesanan (SPK)" /></Link></li>
              <li><Link prefetch={false} href={lp("/contact")} className="hover:text-brand-300"><T k="footer.links.sample" fallback="Permintaan Sampel Kain" /></Link></li>
              <li><Link prefetch={false} href={lp("/contact")} className="hover:text-brand-300"><T k="footer.links.b2b" fallback="Kontrak Suplai Pabrik B2B" /></Link></li>
              <li><Link prefetch={false} href="/register" className="hover:text-brand-300"><T k="footer.links.partner" fallback="Daftar Kemitraan B2B" /></Link></li>
              <li><Link prefetch={false} href="/privacy" className="hover:text-brand-300">Kebijakan Privasi</Link></li>
              <li><Link prefetch={false} href="/terms" className="hover:text-brand-300">Syarat &amp; Ketentuan</Link></li>
              <li><Link prefetch={false} href="/penulis" className="hover:text-brand-300">Tim &amp; Keahlian</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              <T k="footer.hubungi" />
            </h2>
            <div className="space-y-3 text-xs text-slate-400">
              <a
                href="https://wa.me/6287889856066"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-300">+62 878-8985-6066 (WhatsApp)</span>
              </a>
              <a
                href="mailto:admin@texoraprima.com"
                className="flex items-center gap-2 hover:text-brand-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>admin@texoraprima.com</span>
              </a>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mt-2">
                <span className="font-semibold text-white block mb-0.5">
                  <T k="footer.office" />
                </span>
                <T k="footer.hours" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} XoraMateria. All Rights Reserved. Platform E-Commerce &amp; CRM Suite.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-slate-500">Next.js App Router</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">Prisma ORM</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">PostgreSQL</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">Docker &amp; Nginx</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
