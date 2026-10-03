"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";
import { SOCIAL_BRAND, SOCIAL_ICONS } from "./SocialLinks";

/**
 * Floating social rail pinned to the right edge of the viewport.
 * All icons visible; hovered item smoothly pops while siblings
 * gently fade. Label reveal uses the 0fr→1fr grid trick so the
 * slide stays buttery instead of jumping like max-width does.
 * Hidden on small screens (footer icons cover mobile).
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
            className="group flex items-center rounded-xl border p-2 transition-all duration-300 ease-out group-hover/social:opacity-50 hover:!opacity-100 hover:!scale-[1.07] hover:!text-white hover:bg-[color-mix(in_srgb,var(--sc)_30%,transparent)] hover:shadow-[0_8px_28px_-4px_var(--sc)]"
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
            <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr]">
              <span className="overflow-hidden whitespace-nowrap text-xs font-semibold text-slate-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="block pl-2 pr-1">{s.label}</span>
              </span>
            </span>
          </a>
        );
      })}
    </motion.aside>
  );
}
