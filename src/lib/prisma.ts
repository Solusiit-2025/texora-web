import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Atur ukuran pool koneksi Postgres.
 *
 * Default Prisma: connection_limit = (2 * num_cpus) + 1, di mesin ini 13.
 * Next.js App Router menjalankan banyak route handler paralel sehingga pool 13
 * sering habis -> "Timed out fetching a new connection from the connection pool".
 *
 * Dinaikkan menjadi 15 per proses dengan pool_timeout 30 detik.
 * PENTING: total = limit x jumlah proses. Postgres max_connections = 100,
 * jadi limit jangan terlalu besar (mode dev bisa menyalakan 4-6 worker).
 *
 * `socket_timeout` & `connect_timeout` WAJIB karena database di sisi remote
 * (77.37.44.232): kalau firewall kills koneksi yang idle, Prisma sempat
 * "membeku" 10-30 detik sebelum query berikutnya gagal. Timeout memaksa
 * reconnect lebih cepat supaya halaman tidak terasa macet.
 */
function withPoolSettings(url?: string): string | undefined {
  if (!url) return undefined;

  const params = new URLSearchParams();
  if (!/connection_limit=/.test(url)) params.set("connection_limit", "15");
  if (!/pool_timeout=/.test(url)) params.set("pool_timeout", "30");
  if (!/connect_timeout=/.test(url)) params.set("connect_timeout", "15");
  if (!/socket_timeout=/.test(url)) params.set("socket_timeout", "20");

  const query = params.toString();
  if (!query) return url;
  return url.includes("?") ? `${url}&${query}` : `${url}?${query}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: {
      db: { url: withPoolSettings(process.env.DATABASE_URL) as string },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
