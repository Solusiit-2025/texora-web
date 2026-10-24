"use client";

/**
 * Recharts lazy-loaded (code-split).
 *
 * Paket `recharts` menambah ~300 kB ke bundle halaman portal yang memakainya,
 * padahal chart hanya bagian kecil UI dan tidak berada di layar pertama.
 * Dengan dynamic import, chunk chart baru dimuat saat komponen dirender,
 * dengan skeleton sebagai placeholder.
 *
 * Catatan Next.js: options `dynamic()` HARUS berupa object literal inline
 * (tidak boleh variabel) — lihat error "next/dynamic options must be an
 * object literal".
 */

import dynamic from "next/dynamic";

const ChartSkeleton = () => (
  <div className="flex h-full min-h-[160px] w-full items-center justify-center">
    <div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />
  </div>
);

export const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false, loading: ChartSkeleton }
);
export const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false, loading: ChartSkeleton }
);
export const Area = dynamic(
  () => import("recharts").then((m) => m.Area),
  { ssr: false, loading: ChartSkeleton }
);
export const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false, loading: ChartSkeleton }
);
export const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
  loading: ChartSkeleton,
});
export const PieChart = dynamic(
  () => import("recharts").then((m) => m.PieChart),
  { ssr: false, loading: ChartSkeleton }
);
export const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
  loading: ChartSkeleton,
});
export const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
  loading: ChartSkeleton,
});
export const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
  loading: ChartSkeleton,
});
export const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
  loading: ChartSkeleton,
});
export const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false, loading: ChartSkeleton }
);
export const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false, loading: ChartSkeleton }
);
export const Legend = dynamic(
  () => import("recharts").then((m) => m.Legend),
  { ssr: false, loading: ChartSkeleton }
);
export const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false, loading: ChartSkeleton }
);
export const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
  loading: ChartSkeleton,
});
