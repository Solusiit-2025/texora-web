"use client";

import { useMemo } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichContentProps {
  html: string | null | undefined;
  className?: string;
}

/**
 * Merender HTML dari RichTextEditor dengan sanitasi (anti-XSS).
 * Aman dipakai di storefront maupun panel admin.
 */
export function RichContent({ html, className = "" }: RichContentProps) {
  const safe = useMemo(() => sanitizeHtml(html), [html]);

  if (!safe) return null;

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
