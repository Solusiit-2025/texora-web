"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { THEMES } from "./themes";

interface ThemeDropdownProps {
  /** Compact mode renders an icon-only button (for the mobile top bar). */
  compact?: boolean;
}

/** Accent-theme picker. Persists to localStorage via ThemeProvider. */
export function ThemeDropdown({ compact = false }: ThemeDropdownProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={themeRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-transparent text-slate-200 transition-colors ${
          compact ? "p-2" : "px-2.5 py-1 text-xs font-medium"
        }`}
        title={`Thema warna: ${active.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
          style={{ backgroundColor: active.swatch }}
        />
        {!compact && (
          <>
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-white">{active.label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-[998] cursor-default bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ backgroundColor: "#0f172a" }}
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-2 z-[999] isolate"
              role="listbox"
              aria-label="Pilih thema warna"
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                Thema Warna Aksen
              </div>
              {THEMES.map((t) => {
                const isActive = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? "bg-brand-500/20 text-white font-bold border border-brand-500/30"
                        : "text-slate-200 hover:bg-slate-800 hover:text-white border border-transparent"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: t.swatch }}
                    />
                    <span className="flex-1 text-left">
                      <span className="block font-semibold">{t.label}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {t.description}
                      </span>
                    </span>
                    {isActive && <Check className="w-4 h-4 text-brand-300 shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
