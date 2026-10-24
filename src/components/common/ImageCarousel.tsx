"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Aspect = "16/9" | "21/9" | "4/3" | "1/1" | "16/10" | "hero";
export type CarouselEffect = "slide" | "fade";

const ASPECT_CLASS: Record<Aspect, string> = {
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/10": "aspect-[16/10]",
  "hero": "aspect-[16/9] sm:aspect-[21/9] sm:max-h-[500px]",
};

/**
 * Carousel gambar halus & profesional:
 *  - Slide mode: infinite loop continuous glide (tanpa rewind jank/snap)
 *  - Fade mode: crossfade lembut sinematik dengan subtle depth zoom
 *  - Easing kurva halus (cubic-bezier(0.22, 1, 0.36, 1)) & durasi transisi terkalibrasi (1100ms)
 *  - Auto-rotate dengan pause saat di-hover
 *  - Swipe gesture untuk layar sentuh / mobile
 *  - Arrow navigasi + dots glassmorphic dengan pills indicator
 *  - Thumbnail strip opsional untuk detail halaman
 */
export function ImageCarousel({
  images,
  alt,
  aspect = "16/9",
  interval = 7000,
  slideMs = 1100,
  effect = "slide",
  auto = true,
  sizes = "(max-width: 768px) 100vw, 33vw",
  showArrows = true,
  showThumbs = false,
  priority = false,
  className = "",
}: {
  images: string[];
  alt: string;
  aspect?: Aspect;
  interval?: number;
  slideMs?: number;
  effect?: CarouselEffect;
  auto?: boolean;
  sizes?: string;
  showArrows?: boolean;
  showThumbs?: boolean;
  /** True bila carousel berada di viewport pertama (LCP) — preload gambar utama. */
  priority?: boolean;
  className?: string;
}) {
  const multi = images.length > 1;
  const [hovered, setHovered] = useState(false);

  // --- SLIDE MODE: Infinite loop track cloning ---
  const slides = useMemo(() => {
    if (!multi || effect !== "slide") return images;
    // [Clone last, original items..., Clone first]
    return [images[images.length - 1], ...images, images[0]];
  }, [images, multi, effect]);

  // Virtual index untuk slide mode (1 = image pertama)
  const [virtualIndex, setVirtualIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Index untuk fade mode (0 s/d images.length - 1)
  const [fadeIndex, setFadeIndex] = useState(0);

  const isAnimatingRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Reset index saat images berubah
  useEffect(() => {
    setVirtualIndex(1);
    setFadeIndex(0);
    setIsTransitioning(false);
    isAnimatingRef.current = false;
  }, [images]);

  // Active dot index (0 s/d images.length - 1)
  const activeDot = useMemo(() => {
    if (!multi) return 0;
    if (effect === "fade") return fadeIndex;
    if (virtualIndex === 0) return images.length - 1;
    if (virtualIndex === slides.length - 1) return 0;
    return virtualIndex - 1;
  }, [multi, effect, fadeIndex, virtualIndex, images.length, slides.length]);

  // Handler navigasi
  const go = useCallback(
    (dir: 1 | -1) => {
      if (!multi || isAnimatingRef.current) return;

      if (effect === "fade") {
        isAnimatingRef.current = true;
        setFadeIndex((prev) => (prev + dir + images.length) % images.length);
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, slideMs);
      } else {
        isAnimatingRef.current = true;
        setIsTransitioning(true);
        setVirtualIndex((prev) => prev + dir);
      }
    },
    [multi, effect, images.length, slideMs]
  );

  const goTo = useCallback(
    (targetDot: number) => {
      if (!multi || isAnimatingRef.current) return;
      if (effect === "fade") {
        if (targetDot === fadeIndex) return;
        isAnimatingRef.current = true;
        setFadeIndex(targetDot);
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, slideMs);
      } else {
        const target = targetDot + 1;
        if (target === virtualIndex) return;
        isAnimatingRef.current = true;
        setIsTransitioning(true);
        setVirtualIndex(target);
      }
    },
    [multi, effect, fadeIndex, virtualIndex, slideMs]
  );

  // Auto-rotate
  useEffect(() => {
    if (!multi || !auto || hovered) return;
    const timer = setInterval(() => {
      go(1);
    }, interval);
    return () => clearInterval(timer);
  }, [multi, auto, hovered, interval, go]);

  // Infinite loop handler di akhir CSS transition
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;

    isAnimatingRef.current = false;
    if (virtualIndex >= slides.length - 1) {
      // Sampai di clone slide pertama -> lompat tanpa animasi ke index 1 asli
      setIsTransitioning(false);
      setVirtualIndex(1);
    } else if (virtualIndex <= 0) {
      // Sampai di clone slide terakhir -> lompat tanpa animasi ke index terakhir asli
      setIsTransitioning(false);
      setVirtualIndex(images.length);
    }
  };

  // Touch swipe support (mobile friendly)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current
      ? Math.abs(touchStartY.current - e.changedTouches[0].clientY)
      : 0;

    // Pastikan swipe horizontal dominan agar scroll vertikal tidak terganggu
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) go(1);
      else go(-1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`relative ${ASPECT_CLASS[aspect]} bg-slate-950 flex items-center justify-center ${className}`}
      />
    );
  }

  return (
    <div
      className={`group/carousel relative ${ASPECT_CLASS[aspect]} overflow-hidden bg-slate-950 select-none ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. SLIDE EFFECT: Continuous GPU sliding track */}
      {effect === "slide" && (
        <div
          className="flex h-full w-full will-change-transform"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: multi
              ? `translate3d(-${virtualIndex * 100}%, 0, 0)`
              : "translate3d(0, 0, 0)",
            transitionProperty: isTransitioning ? "transform" : "none",
            transitionDuration: isTransitioning ? `${slideMs}ms` : "0ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt={i === virtualIndex ? alt : ""}
                fill
                priority={priority && i === (multi ? 1 : 0)}
                loading={priority ? "eager" : "lazy"}
                quality={90}
                sizes={sizes}
                className="object-cover transition-transform duration-700 ease-out group-hover/carousel:scale-[1.03]"
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. FADE EFFECT: Soft crossfade with subtle scale */}
      {effect === "fade" && (
        <div className="relative h-full w-full">
          {images.map((src, i) => {
            const isActive = i === activeDot;
            return (
              <div
                key={`${src}-${i}`}
                className={`absolute inset-0 h-full w-full transition-opacity ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                style={{
                  transitionDuration: `${slideMs}ms`,
                  transitionTimingFunction: "cubic-bezier(0.25, 1, 0.4, 1)",
                }}
              >
                <Image
                  src={src}
                  alt={isActive ? alt : ""}
                  fill
                  priority={priority && i === 0}
                  loading={priority ? "eager" : "lazy"}
                  quality={90}
                  sizes={sizes}
                  className={`object-cover transition-transform duration-[3500ms] ease-out ${
                    isActive ? "scale-100" : "scale-[1.04]"
                  } group-hover/carousel:scale-[1.05]`}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Controls: Arrows & Indicators hanya jika > 1 gambar */}
      {multi && (
        <>
          {showArrows && (
            <>
              <button
                type="button"
                aria-label="Gambar sebelumnya"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/75 text-slate-200 hover:text-white hover:bg-slate-900 backdrop-blur-md border border-white/15 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                  hovered || !auto
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Gambar berikutnya"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/75 text-slate-200 hover:text-white hover:bg-slate-900 backdrop-blur-md border border-white/15 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                  hovered || !auto
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2 pointer-events-none"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots Indicator Glassmorphic */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-2 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Gambar ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  i === activeDot
                    ? "w-5 bg-gradient-to-r from-brand-400 to-accent-cyan shadow-sm shadow-brand-500/50"
                    : "w-1.5 bg-slate-400/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          {/* Thumbnail strip opsional (dipakai di halaman detail artikel) */}
          {showThumbs && (
            <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 z-20 bg-slate-950/70 p-1 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
              {images.map((src, i) => (
                <button
                  key={`${src}-thumb-${i}`}
                  type="button"
                  aria-label={`Lihat gambar ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                  className={`relative w-12 h-8 rounded-lg overflow-hidden border transition-all duration-300 ${
                    i === activeDot
                      ? "border-brand-400 ring-2 ring-brand-400/50 opacity-100 scale-105"
                      : "border-slate-700/80 opacity-60 hover:opacity-100 hover:border-slate-500"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
