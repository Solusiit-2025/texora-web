"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";
import { SOCIAL_BRAND, SOCIAL_ICONS } from "./SocialLinks";

/**
 * Floating social rail pinned to the right edge of the viewport.
 * Hidden on small screens (footer icons cover mobile); each item
 * is brand-colored and expands to reveal its label on hover (desktop).
 */
export function FloatingSocial() {
  return (
    <motion.aside
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1.5 p-2 rounded-l-2xl bg-slate-900/90 border border-r-0 border-slate-700/80 shadow-2xl shadow-black/50 backdrop-blur-xl group/social"
      aria-label="Media sosial Texora"
    >
      {SOCIAL_LINKS.map((s) => {
        const Icon = SOCIAL_ICONS[s.id];
        const brand = SOCIAL_BRAND[s.id];
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
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
          </a>
        );
      })}
    </motion.aside>
  );
}
