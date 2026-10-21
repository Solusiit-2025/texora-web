/**
 * Jalankan probe Gemini dengan key dari .env.local
 * Jalankan: node scripts/run-gemini-probe.mjs
 */
import { execSync } from "child_process";
import fs from "fs";

const env = { ...process.env };
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && m[2]) env[m[1]] = m[2].trim();
  }
}
if (!env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY tidak ditemukan di .env/.env.local");
  process.exit(0);
}
execSync("node scripts/gemini-probe.mjs", { stdio: "inherit", env });
