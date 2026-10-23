"use client";

import { ImageCarousel } from "@/components/common/ImageCarousel";

/**
 * Cover halaman detail artikel:
 * delegasi ke ImageCarousel bersama (slide GPU, auto-rotate, pause hover,
 * dots + thumbnail strip). 1 gambar = statis.
 */
export default function ArticleHeroGallery({
  images,
  alt,
  interval = 9000,
}: {
  images: string[];
  alt: string;
  interval?: number;
}) {
  return (
    <ImageCarousel
      images={images}
      alt={alt}
      aspect="hero"
      interval={interval}
      slideMs={1100}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
      showThumbs
      className="rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl"
    />
  );
}
