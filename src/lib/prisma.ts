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
 * IMPORTANT: total = limit x jumlah proses. Postgres max_connections = 100,
 * jadi limit jangan terlalu besar (mode dev bisa menyalakan 4-6 worker).
 */
function withPoolSettings(url?: string): string | undefined {
  if (!url) return undefined;
  if (/connection_limit=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=15&pool_timeout=30&connect_timeout=20`;
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
