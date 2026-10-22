import Link from "next/link";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ArrowRight, ShieldCheck } from "lucide-react";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}

/**
 * Layout bersama untuk halaman legal (Kebijakan Privasi & Syarat Ketentuan).
 * Dipisah supaya tipografi, breadcrumb, dan CTA konsisten di kedua halaman.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="texora-container py-10 lg:py-14">
      <Breadcrumb items={[{ label: title }]} />

      <header className="mt-6 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{intro}</p>
        <p className="mt-3 text-[11px] text-slate-500">
          Terakhir diperbarui: {updatedAt}
        </p>
      </header>

      <div className="mt-8 max-w-3xl space-y-8">
        {sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`legal-${index}`}>
            <h2
              id={`legal-${index}`}
              className="font-display text-lg font-bold text-white"
            >
              {index + 1}. {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph, i) => (
              <p
                key={i}
                className="mt-2.5 text-[13px] leading-relaxed text-slate-300"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5 pl-5 list-disc text-[13px] leading-relaxed text-slate-300 marker:text-brand-400">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-10 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-bold text-white">
          Ada pertanyaan tentang dokumen ini?
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Hubungi tim XoraMateria melalui halaman kontak. Kami akan merespons
          pertanyaan terkait data pribadi, pesanan, atau kerja sama B2B dalam
          1–2 hari kerja.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-brand-400"
        >
          Hubungi Kami
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
