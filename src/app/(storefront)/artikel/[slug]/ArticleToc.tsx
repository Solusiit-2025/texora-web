"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "bagian"
  );
}

/**
 * Daftar Isi artikel (table of contents).
 *
 * Headings diambil langsung dari DOM artikel yang sudah dirender, jadi
 * selalu sinkron dengan isi artikel - tidak perlu slug manual di editor.
 * Sekalian menjadi scroll-spy: heading yang sedang dibaca disorot.
 */
export default function ArticleToc({
  containerId,
  title,
}: {
  containerId: string;
  title: string;
}) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    const heads = Array.from(root.querySelectorAll("h2, h3"));
    const mapped: TocItem[] = heads.map((h, i) => {
      const el = h as HTMLElement;
      const text = (el.textContent || "").trim();
      const id = el.id || `sec-${i}-${slugify(text)}`;
      el.id = id;
      return { id, text, level: el.tagName === "H2" ? 2 : 3 };
    });

    setItems(mapped);

    if (mapped.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: [0, 1] }
    );

    mapped.forEach((m) => {
      const el = document.getElementById(m.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [containerId]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={title}
      className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 lg:sticky lg:top-24"
    >
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        <ListTree className="w-3.5 h-3.5 text-brand-400" />
        {title}
      </p>
      <ol className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`block text-xs leading-snug py-1 border-l-2 transition-colors ${
                it.level === 3 ? "pl-5" : "pl-3 font-semibold"
              } ${
                activeId === it.id
                  ? "border-brand-400 text-brand-300"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
