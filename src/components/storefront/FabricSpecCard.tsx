"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { FabricProduct } from "@/types";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { metersToYards, pricePerYard } from "@/lib/units";

/**
 * PRD V3 §4 Micro-Interactions: fluid hover zoom that reveals technical
 * fabric specifications (GSM, width, weave type) instantly.
 */
export function FabricSpecCard({ fabric, index = 0 }: { fabric: FabricProduct; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const variant = fabric.variants[0];
  // priceTiers bisa kosong saat admin menyembunyikan harga (setting terpusat).
  const bestPrice =
    fabric.priceTiers?.length > 0
      ? fabric.priceTiers[fabric.priceTiers.length - 1].unitPrice
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={fabric.thumbnailUrl}
          alt={`Tekstur kain ${fabric.name}`}
          loading="lazy"
          animate={{ scale: hovered ? 1.14 : 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-4 top-4 rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] text-white bg-black/50 backdrop-blur-md px-3 py-1 border border-white/15">
          {fabric.category}
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/30 flex items-end p-5"
            >
              <motion.dl
                initial={{ y: 16 }}
                animate={{ y: 0 }}
                exit={{ y: 16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid w-full grid-cols-3 gap-px overflow-hidden rounded-xl bg-brand-500/30 border border-brand-500/40"
              >
                {[
                  { k: "Gramatur", v: `${variant?.gsm} GSM` },
                  { k: "Lebar", v: `${fabric.widthInch}" · ${Math.round(fabric.widthInch * 2.54)}cm` },
                  { k: "Struktur", v: fabric.weaveType },
                ].map((s) => (
                  <div key={s.k} className="bg-ink px-3 py-2.5">
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-brand-300">{s.k}</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-alabaster leading-tight">{s.v}</dd>
                  </div>
                ))}
              </motion.dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 pl-6 pr-5 pt-5 pb-6">
        <div>
          <h3 className="font-display text-2xl font-semibold text-alabaster">{fabric.name}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {fabric.composition} · Stok {formatNumber(metersToYards(variant?.stockMeters || 0))} yd
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-brand-500/15 pt-4">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Mulai dari</span>
            {bestPrice > 0 ? (
              <span className="text-lg font-semibold text-brand-300">
                {formatRupiah(pricePerYard(bestPrice))}
                <span className="text-xs font-normal text-slate-400"> / yd</span>
              </span>
            ) : (
              <span className="text-[11px] italic text-slate-400">via penawaran</span>
            )}
          </div>
          <Link
            href={`/catalog/${fabric.slug}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-alabaster transition-all group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-ink"
            aria-label={`Lihat detail ${fabric.name}`}
          >
            Detail <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
