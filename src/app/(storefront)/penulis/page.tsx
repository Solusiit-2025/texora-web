import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, FlaskConical, MessagesSquare, PenLine } from "lucide-react";
import { JsonLd } from "@/components/common/JsonLd";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { AUTHORS } from "@/config/authors";
import { getRequestLocale } from "@/lib/server-locale";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

const TITLE = "Tim Editorial & Keahlian Tekstil — XoraMateria";
const DESCRIPTION =
  "Kenali tim di balik panduan XoraMateria: divisi teknis produksi, desain & warna, dan sales B2B. Konten disusun dari data produksi harian, proofing, dan pengalaman lapangan.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isPrimary = locale === "id";
  return buildPageMetadata({
    locale,
    path: "/penulis",
    // Profil tim hanya Bahasa Indonesia — hindari duplikat di locale lain.
    canonical: "/penulis",
    noindex: !isPrimary,
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
      "tim editorial xoramateria",
      "keahlian kain sublimasi",
      "penulis panduan tekstil",
      "eeat pabrik sublimasi",
    ],
    schemaType: "organization",
  });
}

const EDITORIAL_STEPS: Array<{ icon: typeof PenLine; title: string; desc: string }> = [
  {
    icon: FlaskConical,
    title: "Berbasis data produksi",
    desc: "Topik diambil dari pertanyaan yang benar-benar masuk ke tim sales dan temuan QC di lantai produksi.",
  },
  {
    icon: BadgeCheck,
    title: "Direview tim teknis",
    desc: "Setiap angka (GSM, lebar, suhu, toleransi susut) diperiksa oleh divisi teknis sebelum dipublikasikan.",
  },
  {
    icon: MessagesSquare,
    title: "Diuji di lapangan",
    desc: "Klaim hasil cetak, ketahanan cuci, dan karakter kain divalidasi melalui proofing dan sampel produksi.",
  },
  {
    icon: BookOpen,
    title: "Diperbarui berkala",
    desc: "Artikel ditinjau ulang saat ada perubahan spesifikasi, mesin, atau kebijakan produksi.",
  },
];

export default function AuthorsPage() {
  const breadcrumb = [{ name: "Tim & Keahlian", path: "/penulis" }];

  const jsonLd = [
    buildBreadcrumbSchema(breadcrumb),
    buildWebPageSchema({
      path: "/penulis",
      name: "Tim Editorial & Keahlian — XoraMateria",
      description: DESCRIPTION,
      breadcrumb,
    }),
    ...AUTHORS.map((author) => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      description: author.bio,
      knowsAbout: author.expertise,
    })),
  ];

  return (
    <>
      <JsonLd schema={jsonLd} id="ld-authors" />

      <div className="texora-container py-10 lg:py-14">
        <Breadcrumb items={[{ label: "Tim & Keahlian" }]} />

        <header className="mt-6 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Tim & Keahlian
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Tim di balik panduan XoraMateria
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Panduan kami ditulis oleh orang yang setiap hari bekerja dengan kain,
            mesin cetak, dan proofing — bukan tim konten lepas. Berikut divisi yang
            bertanggung jawab atas isi pusat panduan tekstil.
          </p>
        </header>

        <section className="mt-10" aria-labelledby="editorial-heading">
          <h2
            id="editorial-heading"
            className="font-display text-lg font-bold text-white"
          >
            Bagaimana konten kami disusun
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EDITORIAL_STEPS.map((step) => (
              <div
                key={step.title}
                className="glass-panel rounded-2xl border border-slate-800 p-4"
              >
                <step.icon className="h-5 w-5 text-brand-400" />
                <h3 className="mt-3 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="team-heading">
          <h2 id="team-heading" className="font-display text-lg font-bold text-white">
            Profil tim
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
            {AUTHORS.map((author) => {
              const initials = author.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 3)
                .toUpperCase();

              return (
                <article
                  key={author.slug}
                  className="glass-panel flex flex-col rounded-3xl border border-slate-800 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/15 font-display text-sm font-bold text-brand-200">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white">{author.name}</h3>
                      <p className="text-[11px] text-brand-300">{author.role}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[12px] leading-relaxed text-slate-300">
                    {author.bio}
                  </p>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Keahlian
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {author.expertise.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-300"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Pengalaman
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      {author.experience}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-bold text-white">
            Koreksi & masukan pembaca
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            Menemukan data yang perlu diperbarui? Kirim catatan Anda ke tim kami.
            Setiap koreksi yang terverifikasi akan dicantumkan pada pembaruan artikel.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-400"
            >
              Kirim Koreksi
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/artikel"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-brand-500/50 hover:text-white"
            >
              Lihat Pusat Panduan
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
