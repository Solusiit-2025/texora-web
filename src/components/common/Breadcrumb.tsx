import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { T } from "@/lib/i18n/LanguageContext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Tampilkan varian terang (untuk halaman dengan background terang). */
  light?: boolean;
}

/**
 * Breadcrumb navigasi.
 *
 * Aside dari membantu orientasi pengguna, breadcrumb ini juga menjadi
 * sumber data untuk schema.org `BreadcrumbList` yang di-generate di server
 * pada halaman masing-masing.
 */
export function Breadcrumb({ items, className = "", light = false }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs ${className}`}
    >
      <ol
        className={`flex flex-wrap items-center gap-1.5 ${
          light ? "text-slate-600" : "text-slate-400"
        }`}
      >
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className={`inline-flex items-center gap-1 transition-colors ${
              light
                ? "hover:text-slate-900"
                : "hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              <T k="nav.home" fallback="Beranda" />
            </span>
          </Link>
        </li>

        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight
                className={`w-3 h-3 shrink-0 ${
                  light ? "text-slate-400" : "text-slate-600"
                }`}
                aria-hidden="true"
              />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`transition-colors ${
                    light ? "hover:text-slate-900" : "hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? (light ? "text-slate-900 font-semibold" : "text-white font-semibold") : ""}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
