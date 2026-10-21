/**
 * Membersihkan instance dev server yang nyangkut & cache build.
 *
 * MASALAH: menjalankan `next dev` lebih dari satu kali pada project yang sama
 * menyebabkan server berebut folder `.next` (chunk 404, hydration error,
 * "Cannot read properties of null (reading 'removeChild')").
 * Catatan: sejak next.config.mjs memakai distDir per-port konflik ini sudah
 * terminimalisir — script ini tetap berguna untuk membunuh zombie server &
 * membersihkan cache.
 *
 * Jalankan: npm run dev:clean   (membersihkan lalu start dev)
 *   atau  : node scripts/clean-dev.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const ROOT = process.cwd();

console.log("=== MEMBERSIHKAN DEV SERVER & CACHE BUILD ===\n");

// 1. Kill semua proses next dev milik project ini (via PowerShell CIM —
//    `wmic` sudah dihapus dari Windows 11 24H2+, jadi tidak dipakai lagi).
//    Skrip PS dituliskan ke file temp dulu agar bebas dari masalah quoting.
try {
  const psFile = path.join(
    os.tmpdir(),
    `texora-kill-${process.pid}-${Date.now()}.ps1`
  );
  const ps = [
    "$procs = Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" |",
    "  Where-Object {",
    "    $_.CommandLine -match 'texora' -and",
    "    ($_.CommandLine -match 'next[\\\\/]+dist' -or $_.CommandLine -match 'start-server')",
    "  }",
    "foreach ($p in $procs) {",
    "  Write-Output ('KILLED:' + $p.ProcessId)",
    "  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue",
    "}",
    "",
  ].join("\r\n");
  fs.writeFileSync(psFile, "\ufeff" + ps, "utf-8");
  const out = execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`,
    { encoding: "utf-8" }
  );
  fs.rmSync(psFile, { force: true });
  const killed = out.split(/\r?\n/).filter((l) => l.startsWith("KILLED:"));
  if (killed.length > 0) {
    for (const k of killed) console.log(`  Kill proses (PID ${k.replace("KILLED:", "")})`);
    // beri waktu proses benar-benar mati sebelum hapus cache
    execSync("ping -n 4 127.0.0.1 > nul");
  } else {
    console.log("  Tidak ada proses next dev yang nyangkut.");
  }
} catch (err) {
  console.log(`  (tidak dapat memindai proses: ${String(err.message).slice(0, 120)})`);
}

// 2. Hapus semua cache build (.next dan turunan per-port .next-<port>)
const dirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\.next(-.*)?$/.test(d.name))
  .map((d) => d.name);

for (const d of dirs) {
  try {
    fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
    console.log(`  Cache ${d}/ dihapus.`);
  } catch (err) {
    console.log(`  Gagal menghapus ${d}: ${err.message}`);
  }
}
if (dirs.length === 0) console.log("  Tidak ada cache .next (bersih).");

console.log("\nSelesai. Start SATU dev server:  npm run dev");
console.log("Boleh multi-instance bedanya port: next dev  &  next dev -p 3001");
console.log("(distDir dipisah otomatis per port, tidak akan konflik lagi)\n");
