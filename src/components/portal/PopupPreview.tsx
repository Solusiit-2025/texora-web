"use client";

/**
 * Pratinjau popup banner untuk CMS.
 *
 * Menampilkan simulasi kartu popup storefront (latar gelap + poster portrait)
 * di dalam frame HP atau desktop. Dipakai pada tab "Popup Banner" supaya admin
 * bisa meninjau hasil sebelum menyimpan / membuka storefront.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import type { PopupBanner } from "@/config/popup";

interface PopupPreviewProps {
  banners: PopupBanner[];
  device?: "mobile" | "desktop";
  onDeviceChange?: (device: "mobile" | "desktop") => void;
  emptyHint?: string;
}

export function PopupPreview({
  banners,
  device = "mobile",
  onDeviceChange,
  emptyHint = "Belum ada banner. Tambahkan banner lalu simpan untuk melihat pratinjau.",
}: PopupPreviewProps) {
  const [index, setIndex] = useState(0);
  const items = useMemo(
    () => banners.filter((banner) => Boolean(banner.imageUrl)),
    [banners]
  );
  const count = items.length;
  const current = items[Math.min(index, Math.max(0, count - 1))] ?? null;

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  const go = (dir: 1 | -1) => {
    if (count < 2) return;
    setIndex((prev) => (prev + dir + count) % count);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold text-slate-400">
          Pratinjau hasil tayang
        </div>
        {onDeviceChange && (
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => onDeviceChange("mobile")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                device === "mobile"
                  ? "bg-brand-500/20 text-brand-200"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-pressed={device === "mobile"}
            >
              <Smartphone className="h-3.5 w-3.5" />
              HP
            </button>
            <button
              type="button"
              onClick={() => onDeviceChange("desktop")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
                device === "desktop"
                  ? "bg-brand-500/20 text-brand-200"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-pressed={device === "desktop"}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
          </div>
        )}
      </div>

      <div
        className={`mx-auto overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl shadow-black/40 ${
          device === "mobile"
            ? "w-[300px] rounded-[2.25rem] border-[7px] border-slate-800 sm:w-[330px]"
            : "w-full max-w-2xl rounded-2xl"
        }`}
      >
        {/* Frame chrome */}
        <div
          className={`flex items-center gap-1.5 border-b border-slate-800 bg-slate-900/90 px-3 py-2 ${
            device === "mobile" ? "justify-center" : ""
          }`}
        >
          {device === "desktop" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              <span className="ml-2 flex-1 truncate rounded-md bg-slate-950/80 px-2 py-1 text-[9px] text-slate-500">
                xoramateria.com
              </span>
            </>
          ) : (
            <span className="h-1.5 w-16 rounded-full bg-slate-700" />
          )}
        </div>

        <div
          className={`relative flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_60%)] p-3 ${
            device === "mobile" ? "min-h-[520px]" : "min-h-[440px] p-5"
          }`}
        >
          {current ? (
            <>
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
              <div className="relative z-10 w-full max-w-[290px] overflow-hidden rounded-[24px] border border-white/15 bg-slate-950 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.95)]">
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white/90 shadow-lg backdrop-blur"
                >
                  <X className="h-3.5 w-3.5" />
                </span>

                <div className="relative">
                  <img
                    src={current.imageUrl}
                    alt={current.alt || current.title || "Poster popup"}
                    className="block max-h-[58vh] w-full object-contain"
                  />
                  {count > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        aria-label="Banner sebelumnya"
                        className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white/90 backdrop-blur"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        aria-label="Banner berikutnya"
                        className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white/90 backdrop-blur"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950/95 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {count > 1 ? (
                      items.map((item, i) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIndex(i)}
                          aria-label={`Lihat banner ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === index
                              ? "w-4 bg-brand-400"
                              : "w-1.5 bg-white/25 hover:bg-white/40"
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-[9px] text-slate-500">
                        {current.title || "Popup banner"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {current.linkUrl && (
                      <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[9px] text-slate-300">
                        <ExternalLink className="h-3 w-3" />
                        {current.ctaLabel || "Tautan"}
                      </span>
                    )}
                    <span className="rounded-md bg-white/10 px-2 py-1 text-[9px] font-semibold text-slate-100">
                      Tutup
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative z-10 flex max-w-xs flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-5 py-8 text-center">
              <ImageOff className="h-7 w-7 text-slate-600" />
              <p className="text-[11px] leading-relaxed text-slate-400">{emptyHint}</p>
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <p className="text-center text-[10px] text-slate-500">
          Banner {index + 1} dari {count}
        </p>
      )}
    </div>
  );
}
