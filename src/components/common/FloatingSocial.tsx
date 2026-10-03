"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";
import { SOCIAL_HOVER, SOCIAL_ICONS } from "./SocialLinks";

/**
 * Floating social rail pinned to the right edge of the viewport.
 * Hidden on small screens (footer icons cover mobile); each item
 * expands to reveal its label on hover (desktop).
 */
export function FloatingSocial() {
  return (
    <motion.aside
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1 p-1.5 rounded-l-2xl bg-slate-900/90 border border-r-0 border-slate-700/80 shadow-2xl shadow-black/50 backdrop-blur-xl"
      aria-label="Media sosial Texora"
    >
      {SOCIAL_LINKS.map((s) => {
        const Icon = SOCIAL_ICONS[s.id];
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={`group flex items-center gap-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-800 ${SOCIAL_HOVER[s.id]}`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 group-hover:max-w-[120px] group-hover:ml-2 group-hover:mr-1">
              {s.label}
            </span>
          </a>
        );
      })}
    </motion.aside>
  );
}
