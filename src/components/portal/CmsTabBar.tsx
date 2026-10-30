"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  LayoutTemplate,
  Star,
  HelpCircle,
  BarChart3,
  Share2,
  Banknote,
  FileText,
  BookOpen,
  Sparkles,
  Languages,
  Type,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { CMS_TABS } from "@/config/cms-tabs";

const ICONS: Record<string, LucideIcon> = {
  hero: LayoutTemplate,
  "hero-text": Type,
  popup: Megaphone,
  testimonials: Star,
  faqs: HelpCircle,
  content: BarChart3,
  social: Share2,
  pricing: Banknote,
  pages: FileText,
  artikel: BookOpen,
  seo: Sparkles,
  translations: Languages,
};

/**
 * Tab bar horizontal untuk halaman Content Management.
 *
 * Sebelumnya tab CMS hanya bisa diakses lewat submenu di sidebar kiri,
 * yang mudah terlewat. Sekarang ada tab bar di atas halaman: terlihat jelas,
 * bisa di-scroll horizontal di layar kecil, dan menampilkan hint singkat
 * apa yang ada di tiap tab.
 */
export function CmsTabBar({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (key: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div
        role="tablist"
        aria-label="Tab Content Management"
        className="flex items-center gap-1.5 min-w-max"
      >
        {CMS_TABS.map((tab) => {
          const Icon = ICONS[tab.key] || FileText;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => go(tab.key)}
              title={tab.hint}
              className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                active
                  ? "bg-brand-500/20 text-brand-100 border-brand-500/40 shadow-sm shadow-brand-500/10"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  active ? "text-brand-300" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
