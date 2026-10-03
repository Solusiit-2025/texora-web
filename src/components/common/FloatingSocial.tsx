"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, X } from "lucide-react";
import { SOCIAL_LINKS } from "@/config/social";
import { SOCIAL_BRAND, SOCIAL_ICONS } from "./SocialLinks";

/**
 * Floating social rail pinned to the right edge of the viewport.
 * Collapsed by default (single toggle button); click to expand.
 * Hidden on small screens (footer icons cover mobile).
 */
export function FloatingSocial() {
  const [open, setOpen] = useState(false);

  return (
    <motion.aside
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 p-2 rounded-l-2xl bg-slate-900/90 border border-r-0 border-slate-700/80 shadow-2xl shadow-black/50 backdrop-blur-xl group/social"
      aria-label="Media sosial Texora"
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Sembunyikan media sosial" : "Tampilkan media sosial"}
        title={open ? "Sembunyikan" : "Ikuti kami"}
        className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-center text-brand-300 transition-all hover:bg-brand-500/25 hover:scale-105"
      >
        {open ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>

      {/* Expandable icons */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="social-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1.5 overflow-hidden"
          >
            {SOCIAL_LINKS.map((s, idx) => {
              const Icon = SOCIAL_ICONS[s.id];
              const brand = SOCIAL_BRAND[s.id];
              return (
                <motion.a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  initial={{ x: 24, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: 24, opacity: 0, scale: 0.8 }}
                  transition={{ delay: open ? idx * 0.05 : 0, duration: 0.2 }}
                  style={{
                    color: brand.color,
                    backgroundColor: brand.bg,
                    borderColor: brand.border,
                    ["--sc" as string]: brand.glow,
                  }}
                  className="group flex items-center gap-0 rounded-xl border p-2 transition-all duration-300 group-hover/social:opacity-40 group-hover/social:saturate-50 hover:!opacity-100 hover:!saturate-100 hover:!scale-110 hover:!text-white hover:bg-[color-mix(in_srgb,var(--sc)_30%,transparent)] hover:shadow-[0_8px_28px_-4px_var(--sc)] hover:brightness-125"
                >
                  <span
                    className="flex shrink-0"
                    style={
                      brand.chromatic
                        ? { filter: "drop-shadow(1px 0 0 #25F4EE) drop-shadow(-1px 0 0 #FE2C55)" }
                        : undefined
                    }
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold text-slate-100 transition-all duration-300 group-hover:max-w-[140px] group-hover:ml-2 group-hover:mr-1">
                    {s.label}
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
