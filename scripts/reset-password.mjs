#!/usr/bin/env node
/**
 * Setel ulang password user tanpa perlu login ke portal.
 *
 * Pakai:
 *   node scripts/reset-password.mjs <email> "<password-baru>"
 *
 * Contoh:
 *   node scripts/reset-password.mjs admin@xoramateria.com "KainSublimasi#2026!aman"
 *
 * Script ini:
 *  - membaca DATABASE_URL dari .env / .env.local,
 *  - menyimpan hash bcrypt (12 rounds),
 *  - mencabut refresh token user (semua sesi lama logout).
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* file tidak ada — abaikan */
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const [emailArg, password] = process.argv.slice(2);

if (!emailArg || !password) {
  console.error('Pakai: node scripts/reset-password.mjs <email> "<password-baru>"');
  process.exit(1);
}

if (password.length < 12) {
  console.warn("Peringatan: password < 12 karakter. Disarankan minimal 16 karakter / passphrase.");
}

const email = emailArg.trim().toLowerCase();
const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      refreshToken: null, // cabut sesi lama
    },
  });
  console.log(`Password disetel ulang untuk ${user.email} (role: ${user.role}). Semua sesi lama dicabut.`);
} catch (error) {
  if (error?.code === "P2025") {
    console.error(`User dengan email ${email} tidak ditemukan.`);
  } else {
    console.error("Gagal menyetel password:", error?.message || error);
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
